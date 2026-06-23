import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const ReviewsChart = () => {
  const [data, setData] = useState([
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ]);
  const [percentChange, setPercentChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get('/api/dashboard/ratings-chart');
        setData(res.data.chartData);
        setPercentChange(res.data.percentChange);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  // Find today's day index to highlight it
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="my-3 p-4 rounded-3xl dark:bg-white/5 shadow-2xl shadow-[#9c9898] dark:shadow-[transparent] dark:shadow-[#000000] dark:border-1 dark:border-emerald-900/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold sm:text-lg">Review Ratings</h3>
          <p className="text-xs text-gray-400">Engagement for the last 7 days</p>
        </div>
        <div className={`sm:px-3 px-2 py-1 rounded-full ${percentChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <span className={`text-xs font-bold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`} vs last week
          </span>
        </div>
      </div>

      <div className="h-[200px] w-full text-white">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs opacity-50">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--active-color)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--active-color)', fontSize: 12 }} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--active-color)', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'gray', opacity: 0.05 }}
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: 'var(--active-color)', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === todayIndex ? 'var(--active-color)' : '#374151'} 
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReviewsChart;






