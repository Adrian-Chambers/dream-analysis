import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TimelineChartProps {
  data: Array<{ month: string, count: number }>;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  return (
    <div className="chart-container">
      <h3>Dream Frequency Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 255, 0.1)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'rgba(224, 224, 255, 0.9)' }}
          />
          <YAxis 
            tick={{ fill: 'rgba(224, 224, 255, 0.9)' }}
            tickFormatter={(value) => Math.floor(value)}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 15, 30, 0.9)',
              border: 'none',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              color: 'rgba(224, 224, 255, 0.9)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#9d4edd" 
            strokeWidth={2}
            dot={{ fill: '#5a189a', strokeWidth: 2, r: 5 }} 
            activeDot={{ r: 8, fill: '#c77dff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};