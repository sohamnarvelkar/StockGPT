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

  // Determine which scenarios to show. If forecasts exist, use timeframe. Else fallback to scenarios (12M default).
  const activeScenarios = (forecasts && forecasts[timeframe]) ? forecasts[timeframe] : scenarios;

  // Sort scenarios order: Bear -> Base -> Bull
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
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-cyan-400 font-mono text-sm">PRICE FORECAST MODELS</h3>
            <span className="text-xs text-slate-500">Estimates Only</span>
        </div>
        
        {forecasts && (
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
            {(['1M', '6M', '12M'] as const).map(t => (
                <button 
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        timeframe === t 
                        ? 'bg-cyan-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                >
                    {t}
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-64 font-sans mb-6">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={chartData}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.5 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: any, name: any, props: any) => {
                    if (name === 'price') return [`${currency}${value}`, 'Target Price'];
                    return [value, name];
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
            />
            <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                    let color = '#64748b'; // Current
                    if (entry.name === 'Bear') color = '#f43f5e'; // Rose
                    if (entry.name === 'Base') color = '#f59e0b'; // Amber
                    if (entry.name === 'Bull') color = '#10b981'; // Emerald
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sortedScenarios.map((s) => (
            <div key={s.caseName} className="text-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className={`text-sm font-bold mb-1 ${
                s.caseName === 'Bull' ? 'text-emerald-400' : 
                s.caseName === 'Bear' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                {s.caseName} Case
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">{s.probability} Probability</div>
                <div className="font-mono text-lg text-white mb-2">{s.priceRange}</div>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2" title={s.description}>
                    {s.description}
                </p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioChart;
