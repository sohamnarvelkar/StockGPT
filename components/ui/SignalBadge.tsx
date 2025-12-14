
import React, { useState } from 'react';
import { SignalData } from '../../types';
import { Info } from 'lucide-react';

interface Props {
  signal: SignalData;
}

const SignalBadge: React.FC<Props> = ({ signal }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getSignalColor = (recommendation: string) => {
    const r = recommendation.toLowerCase();
    if (r.includes('buy')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (r.includes('sell')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative z-20">
      <div>
        <h3 className="text-slate-400 font-mono text-sm uppercase tracking-wider mb-1.5">AI Recommendation</h3>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-lg border text-base font-bold tracking-wide shadow-sm ${getSignalColor(signal.recommendation)}`}>
                {signal.recommendation}
            </div>
            <div className="flex items-center gap-2 relative">
                <span className="text-3xl font-bold text-white font-mono leading-none">{signal.confidenceScore}%</span>
                <span className="text-xs text-slate-500 font-medium self-end mb-1">CONFIDENCE</span>
                <div 
                    className="ml-1 text-slate-600 hover:text-cyan-400 cursor-help relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={18} />
                    {showTooltip && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 text-xs text-slate-300 pointer-events-none">
                             <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                             <p className="font-bold text-white mb-2 border-b border-slate-700 pb-2">Confidence Score Logic</p>
                             <p className="mb-3 leading-relaxed">
                                This score represents the AI's certainty in the forecast, derived from a weighted combination of technical indicators, fundamental strength, and market sentiment analysis.
                             </p>
                             <ul className="space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0"></span>
                                    <span><span className="text-white font-medium">Technicals:</span> RSI, MACD, Volume</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                                    <span><span className="text-white font-medium">Fundamentals:</span> P/E, Growth, Cash Flow</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                                    <span><span className="text-white font-medium">Sentiment:</span> News, Market Volatility</span>
                                </li>
                             </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      <div className="hidden sm:block text-right max-w-[240px]">
          <p className="text-sm text-slate-400 line-clamp-2 leading-snug">
             {signal.rationale}
          </p>
      </div>
    </div>
  );
};

export default SignalBadge;
