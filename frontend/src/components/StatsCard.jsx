import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 500 },
  { name: 'D', value: 400 },
  { name: 'E', value: 600 },
];

const StatsCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="glass-card p-6 flex flex-col gap-4 min-w-[240px] flex-1">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-gray-50 rounded-lg text-primary">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-secondary' : 'text-primary'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {change}%
      </div>
    </div>
    
    <div>
      <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={isPositive ? '#2A9D8F' : '#E63946'} 
            fill={isPositive ? '#2A9D8F1a' : '#E639461a'} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default StatsCard;
