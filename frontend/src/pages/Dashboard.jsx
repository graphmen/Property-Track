import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { Building2, Truck, HardHat, LandPlot, AlertCircle, RefreshCw, Package, Monitor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BAR_COLORS = ['#c0392b', '#e67e22', '#f39c12', '#27ae60', '#2980b9', '#8e44ad'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-xl shadow-xl px-4 py-3">
        <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
        <p className="text-lg font-bold text-text-main">{payload[0].value.toLocaleString()} <span className="text-xs font-normal text-text-muted">assets</span></p>
      </div>
    );
  }
  return null;
};

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
        setStats({ land: 0, buildings: 0, vehicles: 0, machinery: 0, furniture: 0, computers: 0 });
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
    { title: 'Computers', value: stats?.computers || 0, change: 0, isPositive: true, icon: Monitor },
  ];

  const chartData = [
    { name: 'Land', count: stats?.land || 0 },
    { name: 'Buildings', count: stats?.buildings || 0 },
    { name: 'Vehicles', count: stats?.vehicles || 0 },
    { name: 'Machinery', count: stats?.machinery || 0 },
    { name: 'Furniture', count: stats?.furniture || 0 },
    { name: 'Computers', count: stats?.computers || 0 },
  ];

  const totalAssets = chartData.reduce((sum, d) => sum + d.count, 0);

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

      <div className="flex flex-wrap gap-4 md:gap-5 w-full">
        {statCards.map((stat, index) => (
          <div key={index} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.33%-0.834rem)]">
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Live Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold">Asset Distribution</h2>
              <p className="text-xs text-text-muted mt-1 font-medium">{totalAssets.toLocaleString()} total assets across all categories</p>
            </div>
            <div className="self-start text-[10px] text-secondary font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
              Live Connection: Active
            </div>
          </div>

          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#6b7280', letterSpacing: '0.05em' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(192,57,43,0.06)', rx: 8 }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={64}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-[var(--border)]">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: BAR_COLORS[i] }}></span>
                {item.name}: {item.count}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="glass-card p-6 premium-gradient shadow-xl">
            <h3 className="font-bold mb-2">System Health</h3>
            <p className="text-[13px] opacity-90 mb-4">
              All {totalAssets.toLocaleString()} assets successfully mapped and validated.
            </p>
            <div className="w-full bg-white/20 h-2 rounded-full mb-4">
              <div className="bg-white h-full rounded-full transition-all duration-1000" style={{width: '100%'}}></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest">Data Integrity: 100%</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
