
import React from 'react';
import { StockGPTResponse, ComparisonCandidate } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus, Check, X, AlertCircle, BarChart3, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
}

const ComparisonDisplay: React.FC<Props> = ({ data, onReset }) => {
  if (!data.comparisonCandidates || data.comparisonCandidates.length === 0) return null;

  const candidates = data.comparisonCandidates;
  const winner = candidates.reduce((prev, current) => 
    (prev.signal.confidenceScore > current.signal.confidenceScore) ? prev : current
  );

  const getSignalColor = (recommendation: string) => {
    const r = recommendation.toLowerCase();
    if (r.includes('buy')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (r.includes('sell')) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  // Helper to highlight better metric
  const isBetter = (candidates: ComparisonCandidate[], currentIndex: number, key: keyof typeof candidates[0]['metrics'], type: 'high' | 'low') => {
     const val = parseFloat(candidates[currentIndex].metrics[key]?.replace(/[^0-9.-]/g, '') || '0');
     if (isNaN(val)) return false;

     const allVals = candidates.map(c => parseFloat(c.metrics[key]?.replace(/[^0-9.-]/g, '') || '0'));
     
     if (type === 'high') {
         return val === Math.max(...allVals);
     } else {
         return val === Math.min(...allVals);
     }
  };

  // Chart Data Preparation
  const chartData = candidates.map(c => ({
      name: c.symbol,
      Potential: ((c.targetPrice12M - c.currentPrice) / c.currentPrice) * 100,
      Score: c.signal.confidenceScore
  }));

  return (
    <div className="w-full max-w-full mx-auto space-y-4 pb-8 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
               <Scale className="text-cyan-400" size={24} />
               <h1 className="text-2xl font-bold text-white tracking-tight">Head-to-Head Analysis</h1>
           </div>
           <p className="text-slate-400 text-sm">Comparing {candidates.map(c => c.symbol).join(' vs ')}</p>
        </div>
        <button onClick={onReset} className="px-5 py-2 text-sm font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all">
            New Search
        </button>
      </div>

      {/* Verdict Section */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-900/10 to-transparent">
         <div className="flex items-start gap-4">
             <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0">
                 <Trophy size={28} />
             </div>
             <div>
                 <h3 className="text-lg font-bold text-white mb-2">Verdict: {winner.symbol} Looks Stronger</h3>
                 <div className="prose prose-invert prose-sm text-slate-300 leading-relaxed max-w-none">
                    {data.comparisonVerdict ? (
                        data.comparisonVerdict.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)
                    ) : (
                        <p>Based on the analysis, {winner.symbol} shows higher AI confidence ({winner.signal.confidenceScore}%) compared to peers.</p>
                    )}
                 </div>
             </div>
         </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl flex flex-col h-full border-t-4 border-t-slate-700 hover:border-t-cyan-500 transition-all">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-2xl font-bold text-white">{c.symbol}</h3>
                          <p className="text-xs text-slate-400">{c.companyName}</p>
                      </div>
                      <div className="text-right">
                          <div className="text-xl font-mono font-bold text-white">{c.currency}{c.currentPrice.toFixed(2)}</div>
                      </div>
                  </div>

                  <div className={`mb-4 px-3 py-2 rounded-lg border flex justify-between items-center ${getSignalColor(c.signal.recommendation)}`}>
                      <span className="font-bold">{c.signal.recommendation}</span>
                      <span className="text-xs font-mono opacity-80">Score: {c.signal.confidenceScore}</span>
                  </div>

                  <div className="space-y-3 flex-grow">
                      <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Check size={12}/> Strengths</h4>
                          <ul className="space-y-1">
                              {c.pros.slice(0, 3).map((p, i) => (
                                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                      {p}
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><X size={12}/> Risks</h4>
                          <ul className="space-y-1">
                              {c.cons.slice(0, 3).map((p, i) => (
                                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                      {p}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">12M Target</span>
                          <span className="font-mono text-cyan-400 font-bold">{c.currency}{c.targetPrice12M}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                            style={{ width: `${Math.min(100, Math.max(0, ((c.targetPrice12M - c.currentPrice) / c.currentPrice) * 100 + 50))}%` }}
                          ></div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Metrics Matrix */}
      <div className="glass-panel p-5 rounded-xl overflow-x-auto">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <BarChart3 className="text-cyan-400" size={20} />
              <h3 className="text-lg font-bold text-white">Financial Matrix</h3>
          </div>
          
          <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                  <tr>
                      <th className="p-3 text-sm font-mono text-slate-500 w-1/4">Metric</th>
                      {candidates.map(c => (
                          <th key={c.symbol} className="p-3 text-sm font-bold text-white border-l border-slate-700 bg-slate-800/30 w-1/4">{c.symbol}</th>
                      ))}
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                  {[
                      { label: 'P/E Ratio', key: 'peRatio', type: 'low' },
                      { label: 'Market Cap', key: 'marketCap', type: 'high' },
                      { label: 'EPS Growth', key: 'epsGrowth', type: 'high' },
                      { label: 'Profit Margin', key: 'profitMargin', type: 'high' },
                      { label: 'ROE', key: 'roe', type: 'high' },
                      { label: 'Div Yield', key: 'dividendYield', type: 'high' },
                      { label: 'Debt/Equity', key: 'debtToEquity', type: 'low' },
                      { label: 'RSI (14D)', key: 'rsi', type: 'neutral' },
                  ].map((row: any) => (
                      <tr key={row.key} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-3 text-sm text-slate-400 font-medium">{row.label}</td>
                          {candidates.map((c, i) => {
                              const highlight = row.type !== 'neutral' && isBetter(candidates, i, row.key, row.type);
                              return (
                                  <td key={i} className={`p-3 text-sm font-mono border-l border-slate-700 ${highlight ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-slate-300'}`}>
                                      {c.metrics[row.key as keyof typeof c.metrics] || '-'}
                                      {highlight && <Check size={12} className="inline ml-1.5 -mt-0.5" />}
                                  </td>
                              );
                          })}
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Performance Potential Chart */}
      <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-cyan-400" size={20} />
              <h3 className="text-lg font-bold text-white">Relative Potential (12M)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: '% Upside', angle: -90, position: 'insideLeft', fill: '#64748b' }}/>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                        cursor={{fill: '#1e293b'}}
                        formatter={(val: number) => [`${val.toFixed(2)}%`, 'Upside Potential']}
                    />
                    <Bar dataKey="Potential" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.Potential > 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

    </div>
  );
};

export default ComparisonDisplay;
