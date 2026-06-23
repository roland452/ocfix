import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// userType prop: 'freelancer' or 'poster'
const AppointmentTrends = ({ userType }) => {
  const [data, setData] = useState([]);
  const [percentChange, setPercentChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/dashboard/appointment-trends?userType=${userType}`);
        setData(res.data.chartData);
        setPercentChange(res.data.percentChange);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [userType]); // refetch when userType changes

  const label = userType === 'freelancer' ? 'Proposals Sent' : 'Jobs Posted'

  return (
    <div className="my-3 p-4 rounded-3xl dark:bg-white/5 shadow-2xl shadow-[#9c9898] dark:shadow-0 dark:shadow-[transparent] dark:border-1 dark:border-emerald-900/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold sm:text-lg">Appointment Trends</h3>
          <p className="text-xs text-gray-400">
            {label} · Last 30 days
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${percentChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <span className={`text-xs font-bold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`} vs last month
          </span>
        </div>
      </div>

      <div className="h-[150px] w-full pb-5 text-white">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs opacity-50">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--active-color)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--active-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--active-color)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--active-color)', fontSize: 10 }} 
                dy={10}
                // Show every 5th label so it doesn't crowd on 30 days
                interval={4}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--active-color)', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
                  border: '1px solid #ffffff10', 
                  borderRadius: '12px' 
                }}
                itemStyle={{ color: 'var(--active-color)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="var(--active-color)" 
                strokeWidth={2}
                fillOpacity={0.5} 
                fill="url(#colorApp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AppointmentTrends;


