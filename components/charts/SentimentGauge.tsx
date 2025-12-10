import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  score: number;
  recommendation: string;
}

const SentimentGauge: React.FC<Props> = ({ score, recommendation }) => {
  // Determine color based on recommendation
  let color = '#f59e0b'; // Hold - Amber
  if (recommendation.includes('BUY')) color = '#10b981'; // Buy - Green
  if (recommendation.includes('SELL')) color = '#f43f5e'; // Sell - Red

  // Data for the gauge (Value vs Remaining)
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <div className="absolute top-2 left-0">
         <h3 className="text-cyan-400 font-mono text-sm">AI CONFIDENCE</h3>
      </div>
      
      <div className="w-full h-32 mt-4 font-sans relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%" // Half circle at bottom
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="score" fill={color} />
              <Cell key="remaining" fill="#334155" /> 
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Value Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full text-center pb-2">
            <span className="text-3xl font-bold text-white block">{score}%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{recommendation}</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentGauge;