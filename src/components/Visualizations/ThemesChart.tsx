import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ThemesChartProps {
  themes: [string, number][];
}

export const ThemesChart: React.FC<ThemesChartProps> = ({ themes }) => {
  const data = themes.map(([name, value]) => ({ name, value }));
  const colors = ['#9d4edd', '#c77dff', '#e0aaff', '#7b2cbf', '#5a189a', '#3c096c'];
  
  return (
    <div className="chart-container">
      <h3>Most Common Dream Themes</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={70}
            tick={{ fill: 'rgba(224, 224, 255, 0.9)' }} 
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
          <Bar dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};