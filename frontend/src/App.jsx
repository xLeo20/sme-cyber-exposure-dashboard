import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, ShieldCheck, Activity, Server, AlertTriangle, Clock } from 'lucide-react';

function App() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Funcție pentru a prelua istoricul la încărcarea paginii
  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("Nu s-a putut prelua istoricul.", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ip) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/scan/${ip}`);
      if (response.data.success) {
        setResult(response.data.data);
        fetchHistory(); // Actualizăm istoricul după o scanare nouă
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Nu s-a putut contacta serverul. Verifică dacă backend-ul rulează.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Securizat': return 'text-green-500';
      case 'Scăzut': return 'text-yellow-500';
      case 'Mediu': return 'text-orange-500';
      case 'Critic': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3 drop-shadow-md">
            <Activity className="w-10 h-10 text-blue-400" />
            SME Cyber Exposure Dashboard
          </h1>
          <p className="text-slate-300">Monitorizarea expunerii și evaluarea riscurilor externe</p>
        </header>

        <form onSubmit={handleScan} className="flex gap-4 max-w-2xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Introdu adresa IP (ex: 8.8.8.8 sau 45.33.32.156)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border-0 shadow-inner bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 disabled:bg-blue-800 disabled:text-slate-400"
          >
            {loading ? 'Se scanează...' : (
              <>
                <Search className="w-5 h-5" />
                Scanează
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm text-red-700 flex items-center gap-3 max-w-2xl mx-auto">
            <AlertTriangle className="w-6 h-6" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up mb-12 text-slate-800">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center text-center col-span-1 border-t-4 border-slate-200">
              <h2 className="text-lg font-semibold text-slate-600 mb-4">Nivel de Risc</h2>
              {result.riskLevel === 'Securizat' ? (
                <ShieldCheck className={`w-24 h-24 mb-4 ${getRiskColor(result.riskLevel)}`} />
              ) : (
                <ShieldAlert className={`w-24 h-24 mb-4 ${getRiskColor(result.riskLevel)}`} />
              )}
              <span className={`text-4xl font-extrabold ${getRiskColor(result.riskLevel)}`}>
                {result.riskLevel}
              </span>
              <p className="text-slate-500 mt-2 font-medium">Scor CVSS estimat: {result.riskScore}/100</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl col-span-1 md:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
                  <Server className="w-6 h-6 text-slate-400" />
                  Informații Țintă
                </h3>
                <ul className="space-y-3 text-lg">
                  <li><strong>IP:</strong> {result.ip}</li>
                  <li><strong>Organizație:</strong> {result.organization || 'Necunoscută'}</li>
                  <li><strong>Sistem Operare:</strong> {result.os || 'Nedetectat'}</li>
                  <li>
                    <strong>Porturi deschise:</strong>{' '}
                    {result.ports && result.ports.length > 0 
                      ? result.ports.join(', ') 
                      : 'Niciun port deschis detectat'}
                  </li>
                  <li><strong>Vulnerabilități (CVE):</strong> <span className="font-bold text-red-500">{result.vulns.length}</span> detectate</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-right">Ultima actualizare Shodan: {new Date(result.shodan_last_update).toLocaleDateString('ro-RO')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl col-span-1 md:col-span-3">
              <h3 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Recomandări de Securitate</h3>
              {result.recommendations && result.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 bg-red-50 p-4 rounded-lg text-red-800 border border-red-100">
                      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg text-green-800 border border-green-100 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" />
                  <p>Infrastructura pare securizată la nivel de rețea publică. Mențineți sistemele actualizate.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secțiunea Nouă: Istoricul Scanărilor */}
        {history.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-xl text-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Istoric Scanări Recente
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                    <th className="p-4 rounded-tl-lg">Data Scanării</th>
                    <th className="p-4">Adresa IP</th>
                    <th className="p-4">Organizație</th>
                    <th className="p-4">Scor</th>
                    <th className="p-4 rounded-tr-lg">Nivel Risc</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {history.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">{new Date(item.scan_date).toLocaleString('ro-RO')}</td>
                      <td className="p-4 font-semibold font-mono text-blue-600">{item.ip}</td>
                      <td className="p-4">{item.organization || '-'}</td>
                      <td className="p-4">{item.riskScore}</td>
                      <td className="p-4 font-bold">
                        <span className={item.riskLevel === 'Critic' ? 'text-red-600' : item.riskLevel === 'Mediu' ? 'text-orange-500' : item.riskLevel === 'Scăzut' ? 'text-yellow-500' : 'text-green-500'}>
                          {item.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;