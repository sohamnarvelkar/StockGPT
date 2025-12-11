
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
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
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
                    className="ml-1 text-slate-600 hover:text-cyan-400 cursor-help"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={18} />
                    {showTooltip && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 text-xs text-slate-300">
                             <p className="font-semibold text-white mb-1">Score Logic:</p>
                             AI weighted probability derived from technicals (RSI/MACD), fundamentals (P/E/Growth), and market sentiment.
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
