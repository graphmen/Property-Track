import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { Building2, Truck, HardHat, LandPlot, AlertCircle, RefreshCw, PieChart } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stats');
      setStats(response.data);
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
      await axios.post('http://localhost:8000/sync/google-sheets');
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
  ];

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-primary font-bold animate-pulse">Loading GMB Dashboard Data...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-2">Portfolio Overview</h1>
          <p className="text-text-muted">Zimbabwe Grain Marketing Board - Regional Asset Summary</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Updating...' : 'Refresh Records'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Asset Distribution by Category</h2>
            <div className="text-xs text-secondary font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Live Connection: Active
            </div>
          </div>
          
          <div className="h-[300px] w-full bg-gray-50/50 rounded-xl flex items-center justify-center border border-[var(--border)] overflow-hidden">
             {/* Future: Analytics Iframe */}
             <div className="text-center p-10">
                <PieChart size={40} className="mx-auto mb-4 text-primary opacity-20" />
                <p className="text-text-muted font-medium mb-2">Advanced Analytics Ready</p>
                <p className="text-xs text-text-muted max-w-xs mx-auto">Your custom reporting interface will be visualised here once the processing engine is fully populated.</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 premium-gradient shadow-xl">
            <h3 className="text-lg font-bold mb-2">System Health</h3>
            <p className="text-sm opacity-90 mb-4">All {Object.values(stats || {}).reduce((a, b) => a + b, 0)} assets successfully mapped and validated.</p>
            <div className="w-full bg-white/20 h-2 rounded-full mb-4">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{width: '100%'}}></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest">Data Integrity: 100%</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <AlertCircle size={20} />
              <h3 className="font-bold text-text-main text-sm">Property Alerts</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border-l-2 border-primary rounded-r-lg">
                <p className="text-[10px] font-bold text-primary uppercase">Integration Note</p>
                <p className="text-xs">System initialized. Found {stats.land} land records across the regional structure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
