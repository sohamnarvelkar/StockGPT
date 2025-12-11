
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { PredictionScenario } from '../../types';

interface Props {
  scenarios: PredictionScenario[]; // Fallback
  forecasts?: {
    "1M": PredictionScenario[];
    "6M": PredictionScenario[];
    "12M": PredictionScenario[];
  };
  currentPrice: number;
  currency: string;
}

const ScenarioChart: React.FC<Props> = ({ scenarios, forecasts, currentPrice, currency }) => {
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '12M'>('12M');

  const activeScenarios = (forecasts && forecasts[timeframe]) ? forecasts[timeframe] : scenarios;
  const sortedScenarios = [...activeScenarios].sort((a, b) => a.targetPrice - b.targetPrice);

  const data = sortedScenarios.map(s => ({
    name: s.caseName,
    price: s.targetPrice,
    prob: s.probability,
    range: s.priceRange,
    desc: s.description
  }));

  const chartData = [
    { name: 'Current', price: currentPrice, prob: 'N/A', range: String(currentPrice), desc: 'Current Market Price' },
    ...data
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-3">
        <div>
            <h3 className="text-cyan-400 font-mono text-xs font-bold">TARGET DISTRIBUTION</h3>
        </div>
        
        {forecasts && (
            <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5 border border-slate-700">
            {(['1M', '6M', '12M'] as const).map(t => (
                <button key={t} onClick={() => setTimeframe(t)} className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${timeframe === t ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
                    {t}
                </button>
            ))}
            </div>
        )}
      </div>

      <div className="w-full h-[400px] font-sans mb-4">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.5 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '10px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: any, name: any, props: any) => {
                    if (name === 'price') return [`${currency}${value}`, 'Target'];
                    return [value, name];
                }}
            />
            <Bar dataKey="price" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => {
                    let color = '#64748b'; // Current
                    if (entry.name === 'Bear') color = '#f43f5e';
                    if (entry.name === 'Base') color = '#f59e0b';
                    if (entry.name === 'Bull') color = '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {sortedScenarios.map((s) => (
            <div key={s.caseName} className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className={`text-sm font-bold mb-1 ${s.caseName === 'Bull' ? 'text-emerald-400' : s.caseName === 'Bear' ? 'text-rose-400' : 'text-amber-400'}`}>
                {s.caseName}
                </div>
                <div className="text-xs text-slate-400 font-mono mb-1">{s.probability}</div>
                <div className="font-mono text-base text-white leading-tight font-bold">{s.priceRange}</div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioChart;
