import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ShieldAlert, ShieldCheck, Shield, Activity, MonitorSmartphone, Bell } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [devices, setDevices] = useState({});
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const fetchData = async () => {
    try {
      const devRes = await axios.get(`${API_URL}/devices`);
      setDevices(devRes.data);
      if (!selectedDevice && Object.keys(devRes.data).length > 0) {
        setSelectedDevice(Object.keys(devRes.data)[0]);
      }
      
      const telRes = await axios.get(`${API_URL}/telemetry`);
      setTelemetry(telRes.data.history);
      
      const alertRes = await axios.get(`${API_URL}/alerts`);
      setAlerts(alertRes.data.alerts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  const toggleAttack = async () => {
    try {
      const newMode = !isAttackMode;
      await axios.post(`${API_URL}/simulate_attack?enable=${newMode}`);
      setIsAttackMode(newMode);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-500';
  };

  const getRiskBg = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const chartData = {
    labels: telemetry.filter(t => t.device_id === selectedDevice).map((_, i) => i),
    datasets: [
      {
        label: 'Anomaly Score',
        data: telemetry.filter(t => t.device_id === selectedDevice).map(t => t.anomaly_score),
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Trust Score',
        data: telemetry.filter(t => t.device_id === selectedDevice).map(t => t.trust_score),
        borderColor: 'rgba(56, 189, 248, 0.8)',
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#f8fafc' } }
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20"></div>
            <Shield className="w-8 h-8 text-blue-400 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Aegis-MUD</h1>
            <p className="text-slate-400 font-medium">IoT Trust & Drift Analytics Platform</p>
          </div>
        </div>
        <button 
          onClick={toggleAttack}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
            isAttackMode 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          <Activity className="w-5 h-5" />
          {isAttackMode ? 'Stop Attack Simulation' : 'Simulate Attack'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur shadow-lg lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5 text-indigo-400" /> Devices
          </h2>
          <div className="flex flex-col gap-3">
            {Object.keys(devices).map(devId => (
              <div 
                key={devId}
                onClick={() => setSelectedDevice(devId)}
                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                  selectedDevice === devId ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-700 hover:border-slate-500 bg-slate-800/60 hover:bg-slate-700/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-200">{devId}</span>
                  <span className={`font-bold ${getRiskColor(devices[devId].trust_score)}`}>
                    {devices[devId].trust_score}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${devices[devId].trust_score >= 80 ? 'bg-green-500' : devices[devId].trust_score >= 60 ? 'bg-yellow-500' : devices[devId].trust_score >= 40 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className="text-xs text-slate-400 font-medium tracking-wide border border-slate-700 px-2 py-0.5 rounded uppercase">{devices[devId].risk_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          {selectedDevice && devices[selectedDevice] && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border backdrop-blur flex justify-between items-center ${getRiskBg(devices[selectedDevice].trust_score)}`}>
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Trust Score</p>
                  <h3 className={`text-5xl font-bold ${getRiskColor(devices[selectedDevice].trust_score)}`}>
                    {devices[selectedDevice].trust_score}
                  </h3>
                </div>
                {devices[selectedDevice].trust_score >= 80 ? <ShieldCheck className="w-12 h-12 text-green-500/50" /> : <ShieldAlert className="w-12 h-12 text-red-500/50" />}
              </div>
              
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Anomaly Score</p>
                  <h3 className="text-3xl font-bold text-slate-200">
                    {devices[selectedDevice].anomaly_score.toFixed(2)}
                  </h3>
                </div>
                <Activity className="w-10 h-10 text-rose-400/50" />
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Drift Severity</p>
                  <h3 className="text-3xl font-bold text-slate-200">
                    {devices[selectedDevice].drift_severity.toFixed(2)}
                  </h3>
                </div>
                <Activity className="w-10 h-10 text-orange-400/50" />
              </div>
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-lg relative min-h-[350px]">
            <h2 className="text-xl font-semibold mb-6 text-slate-200">Behavioral Drift & Trust Analysis</h2>
            <div className="h-[280px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-lg h-64 overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" /> Explainable Evidence
              </h2>
              {selectedDevice && devices[selectedDevice]?.evidence.length > 0 ? (
                <ul className="space-y-3">
                  {devices[selectedDevice].evidence.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="w-2 h-2 mt-2 rounded-full bg-red-400 shrink-0"></div>
                      <span className="text-red-200 text-sm">{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <p className="text-slate-400 italic text-sm">No anomalous behavior detected</p>
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-lg h-64 overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-400" /> System Alerts
              </h2>
              {alerts.length > 0 ? (
                <div className="space-y-3 pr-2 custom-scrollbar">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 group-hover:w-2 transition-all duration-300"></div>
                      <p className="font-bold text-red-400 mb-1">{alert.device_id}</p>
                      <p className="text-xs text-red-300 font-medium mb-2 border border-red-500 px-1 py-0.5 inline-block rounded">{alert.risk_level}</p>
                      <ul className="list-disc list-inside text-xs text-red-200/80">
                        {alert.evidence.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <p className="text-slate-400 italic text-sm">No active alerts across the network</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
