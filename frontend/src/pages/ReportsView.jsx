import React from 'react';
import { PieChart, ExternalLink, BarChart3, Layout } from 'lucide-react';

const ReportsView = () => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-text-muted">Custom Property Portfolio Insights - GMB Zimbabwe</p>
      </div>

      <div className="glass-card p-10 text-center flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-[var(--border)] min-h-[500px]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <PieChart size={40} />
        </div>
        <h2 className="text-xl font-bold mb-4">Analytics Engine Active</h2>
        <p className="max-w-md text-text-muted mb-8 text-sm leading-relaxed">
          Your regional asset intelligence is being processed. 
          The interactive visualization module will be available shortly once the data modeling for all depots is complete.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="p-4 bg-white rounded-xl border border-[var(--border)] shadow-sm">
            <BarChart3 className="text-secondary mb-2" size={20} />
            <p className="font-bold text-sm">Real-time Performance</p>
            <p className="text-[10px] text-text-muted">Direct Depot Data Feed</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[var(--border)] shadow-sm">
            <Layout className="text-accent mb-2" size={20} />
            <p className="font-bold text-sm">Geographical Intelligence</p>
            <p className="text-[10px] text-text-muted">Regional Asset Mapping</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[var(--border)] shadow-sm">
            <ExternalLink className="text-primary mb-2" size={20} />
            <p className="font-bold text-sm">Predictive Reporting</p>
            <p className="text-[10px] text-text-muted">Inventory Cycle Analysis</p>
          </div>
        </div>

        <button className="mt-10 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2">
          Configure Analysis Module
          <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
};

export default ReportsView;
