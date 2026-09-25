require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const Scan = require('./models/Scan'); 
const calculateRisk = require('./riskCalculator');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectat la MongoDB!'))
    .catch(err => console.error('Eroare conectare MongoDB:', err));

// Ruta de scanare actualizată
app.get('/api/scan/:ip', async (req, res) => {
    // Extragem IP-ul aici pentru a-l avea disponibil atât în try, cât și în catch
    const { ip } = req.params; 
    
    try {
        const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`);
        
        const vulns = response.data.vulns || [];
        const ports = response.data.ports || [];
        const riskAnalysis = calculateRisk(ports, vulns);

        const scanData = {
            ip: response.data.ip_str,
            organization: response.data.org,
            os: response.data.os,
            ports: ports,
            vulns: vulns,
            shodan_last_update: response.data.last_update,
            riskScore: riskAnalysis.score,
            riskLevel: riskAnalysis.level,
            recommendations: riskAnalysis.recommendations
        };

        // Salvăm in baza de date
        const newScan = new Scan(scanData);
        await newScan.save();

        res.json({ success: true, data: newScan, message: "Scanare salvată cu succes!" });
        
    } catch (error) {
        // Dacă Shodan returnează 404 (IP curat, fără porturi publice)
        if (error.response && error.response.status === 404) {
            console.log(`[INFO] IP-ul ${ip} nu are expunere publică în baza Shodan.`);
            
            const cleanResult = {
                ip: ip,
                organization: "Nedetectată",
                os: "Nedetectat",
                ports: [],
                vulns: [],
                shodan_last_update: new Date(),
                riskScore: 0,
                riskLevel: "Securizat",
                recommendations: ["Infrastructura nu apare în scanările publice Shodan. Niciun serviciu expus detectat."]
            };

            try {
                // Salvăm rezultatul "Securizat" în baza de date
                const newScan = new Scan(cleanResult);
                await newScan.save();
                return res.json({ success: true, data: newScan, message: "Infrastructură securizată." });
            } catch (dbErr) {
                console.error("Eroare la salvarea rezultatului securizat:", dbErr.message);
                return res.status(500).json({ success: false, message: "Eroare internă la salvarea istoricului." });
            }
        }

        
        console.error("Eroare la scanare:", error.message);
        res.status(500).json({ success: false, message: "Nu s-au putut prelua datele de la serverul Shodan." });
    }
});

// Ruta nouă: Preluare istoric scanări
app.get('/api/history', async (req, res) => {
    try {
        const istoric = await Scan.find().sort({ scan_date: -1 });
        res.json({ success: true, data: istoric });
    } catch (error) {
        res.status(500).json({ success: false, message: "Eroare la preluarea istoricului." });
    }
});

app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});