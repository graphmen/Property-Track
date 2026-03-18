import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CATEGORY_COLORS = ['#c0392b', '#e67e22', '#f39c12', '#27ae60', '#2980b9', '#8e44ad'];
const DEPOT_COLOR = '#c0392b';

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="800">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ReportsView = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API_URL}/reports/summary`);
        if (res.data && res.data.status !== 'error') {
          setSummary(res.data);
        } else {
          setError(res.data?.message || 'Could not load report data.');
        }
      } catch (e) {
        setError('Failed to reach the API. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-primary font-bold animate-pulse">
        Generating Report Intelligence...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <div className="glass-card p-8 text-center text-red-600">
          <p className="font-bold mb-2">Could not load reports</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { by_category, by_depot, total } = summary;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-text-muted font-medium">
            GMB Zimbabwe — Portfolio Intelligence Report &nbsp;·&nbsp;
            <span className="text-secondary font-bold">{total.toLocaleString()} Total Assets</span>
          </p>
        </div>
        <div className="text-[10px] text-secondary font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2 self-start">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
          Live Data
        </div>
      </div>

      {/* Row 1: Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: Asset Count by Category */}
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-1">Asset Count by Category</h2>
          <p className="text-xs text-text-muted mb-6 font-medium">Share of each asset class in the total portfolio</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={by_category}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  labelLine={false}
                  label={<CustomPieLabel />}
                >
                  {by_category.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v.toLocaleString()} assets`, n]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 700 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 16 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Top Stations by Asset Count */}
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-1">Top Stations by Asset Count</h2>
          <p className="text-xs text-text-muted mb-6 font-medium">Top 10 depots ranked by total assets held</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={by_depot} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v.toLocaleString()} assets`]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 700 }}
                  cursor={{ fill: 'rgba(192,57,43,0.06)' }}
                />
                <Bar dataKey="count" fill={DEPOT_COLOR} radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">Category Summary</h2>
          <p className="text-xs text-text-muted mt-1 font-medium">Full count breakdown across all 6 asset classes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Count</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">% of Portfolio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {by_category.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }}></span>
                    <span className="font-semibold text-sm">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right">{row.count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-text-muted font-medium text-right">
                    {total > 0 ? `${((row.count / total) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50/70 font-black">
                <td className="px-6 py-4 text-sm uppercase tracking-wider">Total</td>
                <td className="px-6 py-4 text-sm text-right text-primary">{total.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-right text-text-muted">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
