import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const TopPayJobs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobFlux = async () => {
      try {
        const res = await axios.get('/api/dashboard/job-flux');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobFlux();
  }, []);

  return (
    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight font-sans">Job Flux</h3>
          <p className="text-sm text-gray-400">This week top paying jobs</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[var(--active-color)] text-xs font-bold tracking-widest uppercase">Live View</span>
          <div className="w-2 h-2 rounded-full bg-[var(--active-color)] animate-ping mt-1"></div>
        </div>
      </div>

      <div className="h-[220px] w-full text-white">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs opacity-50">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--active-color)" />
              
              <XAxis 
                dataKey="rank" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
                dy={10}
                // Shows 1 through 5
                tickFormatter={(val) => `#${val}`}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                // Format as ₦ amount
                tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: 'var(--active-color)', fontWeight: 'bold' }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }}
                // Show job title and amount in tooltip
                formatter={(value, name, props) => [
                  `₦${value.toLocaleString()}`,
                  props.payload.title || 'Job'
                ]}
                labelFormatter={(label) => `Rank #${label}`}
              />

              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--active-color)" 
                strokeWidth={4}
                dot={{ r: 4, fill: 'var(--active-color)', strokeWidth: 2, stroke: '#1a1a1a' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--active-color)' }}
                style={{ filter: `drop-shadow(0px 0px 8px var(--active-color))` }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TopPayJobs;








