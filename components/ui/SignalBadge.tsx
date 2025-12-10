import React, { useState } from 'react';
import { SignalData } from '../../types';
import { Settings, X } from 'lucide-react';

interface Props {
  signal: SignalData;
}

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);

const SignalBadge: React.FC<Props> = ({ signal }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Confidence Score Thresholds
  const [thresholds, setThresholds] = useState({
    buy: 60,
    sell: 60,
    hold: 50
  });

  // Technical Indicator Thresholds
  const [techSettings, setTechSettings] = useState({
    rsiOversold: 30,
    rsiOverbought: 70,
    macdStrategy: 'Signal Line' // Options: Signal Line, Zero Line, Double
  });

  let displayRecommendation = signal.recommendation;
  let displayRationale = signal.rationale;
  let isDowngraded = false;
  let isLowConfidenceHold = false;
  const score = signal.confidenceScore;

  // Apply User Confidence Thresholds
  if (signal.recommendation.includes('BUY')) {
    if (score < thresholds.buy) {
      displayRecommendation = 'HOLD';
      displayRationale = `(Downgraded from ${signal.recommendation} due to confidence < ${thresholds.buy}%). ${signal.rationale}`;
      isDowngraded = true;
    }
  } else if (signal.recommendation.includes('SELL')) {
    if (score < thresholds.sell) {
      displayRecommendation = 'HOLD';
      displayRationale = `(Downgraded from ${signal.recommendation} due to confidence < ${thresholds.sell}%). ${signal.rationale}`;
      isDowngraded = true;
    }
  } else if (signal.recommendation === 'HOLD') {
    if (score < thresholds.hold) {
      isLowConfidenceHold = true;
    }
  }

  // Determine styles based on FINAL (possibly downgraded) recommendation
  let colorClass = 'bg-slate-600 text-white';
  
  if (displayRecommendation.includes('BUY')) colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  else if (displayRecommendation.includes('SELL')) colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/50';
  else if (displayRecommendation.includes('HOLD')) colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/50';

  const showLowConfidenceWarning = isDowngraded || isLowConfidenceHold;

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-xl border ${colorClass} backdrop-blur-md transition-all duration-300`}>
      
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        title="Configure Signal Thresholds"
      >
        <Settings size={16} />
      </button>

      <h3 className="text-sm uppercase tracking-widest opacity-80 mb-1">Recommendation</h3>
      <div className="text-3xl font-bold tracking-tight mb-2 text-center">
        {displayRecommendation}
        {showLowConfidenceWarning && <span className="block text-xs font-normal opacity-60 mt-1 tracking-normal text-amber-300">Low Confidence</span>}
      </div>
      
      {/* Confidence Meter with Tooltip */}
      <div className="w-full mt-2 relative group">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-help">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              signal.recommendation.includes('BUY') ? 'bg-emerald-500' :
              signal.recommendation.includes('SELL') ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${signal.confidenceScore}%` }}
          />
          {/* Threshold Marker Visual - Show relevant threshold based on original type */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none opacity-50"
            style={{ 
              left: `${
                signal.recommendation.includes('BUY') ? thresholds.buy : 
                signal.recommendation.includes('SELL') ? thresholds.sell : thresholds.hold
              }%` 
            }}
          />
        </div>
        
        <div className="flex justify-between w-full mt-1 text-xs font-mono opacity-70 cursor-help">
          <div className="flex items-center gap-1">
            <span>Confidence</span>
            <InfoIcon />
          </div>
          <span>{signal.confidenceScore}%</span>
        </div>

        {/* Expanded Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 bg-slate-900/95 border border-slate-600 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left backdrop-blur-md">
          <p className="text-xs font-semibold text-white mb-3 border-b border-slate-700 pb-2">Score Composition Logic</p>
          
          <p className="text-[10px] text-slate-400 mb-4 leading-relaxed bg-slate-800/50 p-2 rounded border border-slate-700/50">
             The confidence score reflects the AI's weighted assessment of <span className="text-slate-200">technical indicators</span>, <span className="text-slate-200">fundamental strength</span>, and broad <span className="text-slate-200">market sentiment</span>.
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-cyan-400 mb-1 uppercase tracking-wider">Technical Indicators</p>
              <ul className="text-[10px] space-y-1 text-slate-300 pl-2 border-l-2 border-slate-700">
                <li className="flex justify-between">
                  <span className="text-slate-200">RSI:</span> 
                  <span className="opacity-70">&lt;{techSettings.rsiOversold} (Oversold) / &gt;{techSettings.rsiOverbought} (Overbought)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">MACD:</span> 
                  <span className="opacity-70">Strategy: {techSettings.macdStrategy} Crossover</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">Volume:</span> 
                  <span className="opacity-70">Relative Strength vs Avg</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">Fundamental Metrics</p>
              <ul className="text-[10px] space-y-1 text-slate-300 pl-2 border-l-2 border-slate-700">
                <li className="flex justify-between">
                  <span className="text-slate-200">P/E vs Sector:</span> 
                  <span className="opacity-70">&lt; 0.85x Avg (Undervalued)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">PEG Ratio:</span> 
                  <span className="opacity-70">&lt; 1.0 (Growth at Value)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">ROE:</span> 
                  <span className="opacity-70">&gt; 15% (High Efficiency)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">Debt/Equity:</span> 
                  <span className="opacity-70">&lt; 0.5 (Low Leverage)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-200">EPS Growth:</span> 
                  <span className="opacity-70">&gt; 10% YoY</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-600"></div>
        </div>
      </div>

      <p className="mt-4 text-sm text-center opacity-90 leading-relaxed">{displayRationale}</p>

      {/* Configuration Modal (Overlay) */}
      {showSettings && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-xl rounded-xl p-5 flex flex-col border border-slate-600 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
              <Settings size={14} className="text-cyan-400" />
              Signal Thresholds
            </h4>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-6">
            
            {/* Confidence Section */}
            <div className="space-y-4">
               <h5 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-800 pb-1">Confidence Scoring</h5>
               
               {/* BUY */}
               <div className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                    <label className="text-emerald-400 font-medium">Min. BUY Score</label>
                    <span className="font-mono text-white">{thresholds.buy}%</span>
                </div>
                <input 
                    type="range" min="0" max="95" step="5"
                    value={thresholds.buy} 
                    onChange={(e) => setThresholds({...thresholds, buy: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
               </div>

               {/* SELL */}
               <div className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                    <label className="text-rose-400 font-medium">Min. SELL Score</label>
                    <span className="font-mono text-white">{thresholds.sell}%</span>
                </div>
                <input 
                    type="range" min="0" max="95" step="5"
                    value={thresholds.sell} 
                    onChange={(e) => setThresholds({...thresholds, sell: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
               </div>

                {/* HOLD */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs items-center">
                        <label className="text-amber-400 font-medium">Min. HOLD Score</label>
                        <span className="font-mono text-white">{thresholds.hold}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="95" step="5"
                        value={thresholds.hold} 
                        onChange={(e) => setThresholds({...thresholds, hold: Number(e.target.value)})}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>
            </div>

            {/* Technicals Section */}
            <div className="space-y-4">
               <h5 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-800 pb-1">Technical Indicators Criteria</h5>
               
               {/* RSI Oversold */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs items-center">
                    <label className="text-cyan-300 font-medium">RSI Oversold (&lt;)</label>
                    <span className="font-mono text-white">{techSettings.rsiOversold}</span>
                 </div>
                 <input 
                    type="range" min="10" max="45" step="1"
                    value={techSettings.rsiOversold} 
                    onChange={(e) => setTechSettings({...techSettings, rsiOversold: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                 />
               </div>

               {/* RSI Overbought */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs items-center">
                    <label className="text-cyan-300 font-medium">RSI Overbought (&gt;)</label>
                    <span className="font-mono text-white">{techSettings.rsiOverbought}</span>
                 </div>
                 <input 
                    type="range" min="55" max="90" step="1"
                    value={techSettings.rsiOverbought} 
                    onChange={(e) => setTechSettings({...techSettings, rsiOverbought: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                 />
               </div>

               {/* MACD Strategy */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs items-center">
                    <label className="text-cyan-300 font-medium">MACD Crossover</label>
                 </div>
                 <select 
                    value={techSettings.macdStrategy}
                    onChange={(e) => setTechSettings({...techSettings, macdStrategy: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-md p-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                 >
                    <option value="Signal Line">Signal Line (Standard)</option>
                    <option value="Zero Line">Zero Line (Trend Reversal)</option>
                    <option value="Double">Double Crossover (Strong)</option>
                 </select>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs transition-colors shadow-lg shadow-cyan-900/20"
          >
            Apply Configuration
          </button>
        </div>
      )}

    </div>
  );
};

export default SignalBadge;