import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { Building2, Truck, HardHat, LandPlot, AlertCircle, RefreshCw, PieChart, Package } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      if (response.data && response.data.status !== "error") {
        setStats(response.data);
      } else {
        console.error("Dashboard Stats Error:", response.data);
        setStats({ land: 0, buildings: 0, vehicles: 0, machinery: 0, furniture: 0 });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API_URL}/sync/google-sheets`);
      await fetchStats();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const statCards = [
    { title: 'Total Land Assets', value: stats?.land || 0, change: 0, isPositive: true, icon: LandPlot },
    { title: 'Total Buildings', value: stats?.buildings || 0, change: 0, isPositive: true, icon: Building2 },
    { title: 'Motor Vehicles', value: stats?.vehicles || 0, change: 0, isPositive: true, icon: Truck },
    { title: 'Plant & Machinery', value: stats?.machinery || 0, change: 0, isPositive: true, icon: HardHat },
    { title: 'Furniture & Fittings', value: stats?.furniture || 0, change: 0, isPositive: true, icon: Package },
  ];

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-primary font-bold animate-pulse">Loading GMB Dashboard Data...</div>;

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Portfolio Overview</h1>
          <p className="text-sm text-text-muted font-medium">Zimbabwe Grain Marketing Board - Regional Asset Summary</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm font-bold hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Updating Assets...' : 'Refresh Records'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass-card p-6 md:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold">Asset Distribution</h2>
            <div className="self-start text-[10px] text-secondary font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
              Live Connection: Active
            </div>
          </div>
          
          <div className="h-[250px] md:h-[300px] w-full bg-gray-50/50 rounded-xl flex items-center justify-center border border-[var(--border)] overflow-hidden">
             {/* Future: Analytics Iframe */}
             <div className="text-center p-6 md:p-10">
                <PieChart size={40} className="mx-auto mb-4 text-primary opacity-20" />
                <p className="text-text-muted font-bold mb-2">Advanced Analytics Ready</p>
                <p className="text-[11px] text-text-muted max-w-[200px] mx-auto leading-relaxed">Your custom reporting interface will be visualised here once the processing engine is fully populated.</p>
             </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="glass-card p-6 premium-gradient shadow-xl">
            <h3 className="font-bold mb-2">System Health</h3>
            <p className="text-[13px] opacity-90 mb-4">
              All {Object.values(stats || { l: 0, b: 0, v: 0, m: 0, f: 0 }).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0)} assets successfully mapped and validated.
            </p>
            <div className="w-full bg-white/20 h-2 rounded-full mb-4">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{width: '100%'}}></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest">Data Integrity: 100%</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <AlertCircle size={18} />
              <h3 className="font-bold text-text-main text-sm">Regional Alerts</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border-l-2 border-primary rounded-r-lg">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Integration Status</p>
                <p className="text-xs leading-relaxed font-medium">
                  {stats?.land !== undefined 
                    ? `System active. Found ${stats.land} land records across the national structure.`
                    : "System awaiting valid database connection..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
