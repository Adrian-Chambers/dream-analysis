import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface EmotionsChartProps {
  emotions: Record<string, number>;
}

export const EmotionsRadarChart: React.FC<EmotionsChartProps> = ({ emotions }) => {
  const data = Object.entries(emotions)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  
  return (
    <div className="chart-container">
      <h3>Emotional Patterns in Your Dreams</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart 
          outerRadius={150} 
          data={data}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid stroke="rgba(224, 224, 255, 0.2)" />
          <PolarAngleAxis 
            dataKey="name"
            tick={{ fill: 'rgba(224, 224, 255, 0.9)' }} 
          />
          <Radar
            name="Emotional Intensity"
            dataKey="value"
            stroke="#9d4edd"
            fill="#9d4edd"
            fillOpacity={0.3}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};