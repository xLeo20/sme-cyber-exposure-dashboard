function calculateRisk(ports, vulns) {
    let score = 0;
    let level = 'Scăzut';
    let recommendations = [];

    // 1. Evaluare vulnerabilități (CVE-uri)
    if (vulns && vulns.length > 0) {
        score += 50 + (vulns.length * 5); // Scor de bază mare dacă există CVE-uri
        recommendations.push(`CRITIC: Au fost găsite ${vulns.length} vulnerabilități cunoscute (CVE). Necesită patch-uire imediată.`);
    }

    // 2. Evaluare porturi riscante expuse public
    const riskyPorts = {
        22: 'SSH (22) expus. Recomandare: Restricționează accesul la IP-uri de management sau folosește un VPN.',
        23: 'Telnet (23) expus. Recomandare: Protocol nesigur (text în clar). Dezactivează și folosește SSH.',
        3389: 'RDP (3389) expus. Recomandare: Risc major de ransomware. Ascunde-l în spatele unui VPN.',
        445: 'SMB (445) expus. Recomandare: Blochează accesul public din firewall.',
        1433: 'SQL Server (1433) expus. Recomandare: Nu expune baze de date pe internet.',
        3306: 'MySQL (3306) expus. Recomandare: Restricționează accesul public.',
        27017: 'MongoDB (27017) expus. Recomandare: Verifică setările de autentificare și blochează traficul extern.'
    };

    if (ports && ports.length > 0) {
        ports.forEach(port => {
            if (riskyPorts[port]) {
                score += 20;
                recommendations.push(riskyPorts[port]);
            }
        });
    }

    // 3. Normalizare scor și nivel
    score = Math.min(score, 100); // Scorul maxim este 100

    if (score === 0) {
        level = 'Securizat';
        recommendations.push('Nu s-au găsit porturi cu risc ridicat sau vulnerabilități publice.');
    } else if (score < 40) {
        level = 'Scăzut';
    } else if (score < 75) {
        level = 'Mediu';
    } else {
        level = 'Critic';
    }

    return { score, level, recommendations };
}

module.exports = calculateRisk;