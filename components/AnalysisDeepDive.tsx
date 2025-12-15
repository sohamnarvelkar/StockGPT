import React from 'react';
import { StockGPTResponse, KeyMetrics } from '../types';
import { Globe } from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  currencySymbol: string;
  selectedPeers: string[];
  togglePeer: (symbol: string) => void;
  getMetricValue: (metrics: KeyMetrics | undefined, key: keyof KeyMetrics) => string;
  getActionColor: (action: string) => string;
}

const ExternalLinkIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const AnalysisDeepDive: React.FC<Props> = ({ data, currencySymbol, selectedPeers, togglePeer, getMetricValue, getActionColor }) => {
  const macroSection = data.sections.find(s => 
    s.title.toLowerCase().includes('macro') || 
    s.title.toLowerCase().includes('global market')
  );
  
  const otherSections = data.sections.filter(s => s !== macroSection);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Macro Analysis - Visual Update */}
        {macroSection && (
            <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-900/20 p-6 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <Globe size={180} className="text-indigo-400" />
                </div>
                <div className="relative z-10 pl-2 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wide leading-none">{macroSection.title}</h3>
                            <p className="text-xs text-indigo-400/80 font-mono mt-1 tracking-wider">GLOBAL MACRO & GEOPOLITICAL CONTEXT</p>
                        </div>
                    </div>
                    <div className="prose prose-invert prose-base max-w-none text-slate-300 space-y-2">
                    {macroSection.content.split('\n').map((line, i) => {
                        if (line.trim().startsWith('###')) return <h4 key={i} className="text-indigo-200 mt-4 mb-2 font-bold text-sm uppercase tracking-wide border-b border-indigo-500/20 pb-1">{line.replace(/^###\s*/, '')}</h4>;
                        if (line.trim().startsWith('-')) return <li key={i} className="ml-5 list-disc marker:text-indigo-500 text-base mb-1">{line.replace(/^-\s*/, '')}</li>;
                        if (line.trim() === '') return null;
                        return <p key={i} className="mb-2 text-base leading-relaxed">{line.replace(/\*\*/g, '')}</p>;
                    })}
                    </div>
                </div>
            </div>
        )}

        {/* Recent News & Sentiment */}
        {data.news && data.news.length > 0 && (
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                    <h3 className="text-base font-bold text-white">Recent News & Sentiment</h3>
                </div>
                <div className="space-y-3">
                    {data.news.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group p-3 -mx-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <h4 className="text-cyan-300 font-semibold text-base leading-tight group-hover:text-cyan-200">{item.title}</h4>
                            <p className="text-slate-400 text-sm mt-1.5 line-clamp-2">{item.summary}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs uppercase tracking-wide opacity-80 font-medium">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                    item.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    item.sentiment === 'Negative' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                }`}>
                                    {item.sentiment}
                                </span>
                                <span className="text-slate-500">{item.source}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500">{item.published}</span>
                            </div>
                        </div>
                        <ExternalLinkIcon size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    </a>
                    ))}
                </div>
            </div>
        )}

        {/* Peer Comparison Section */}
        {data.recommendations && data.recommendations.length > 0 && (
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                    <h3 className="text-base font-bold text-white">Competitor Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {data.recommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-white text-base">{rec.symbol}</div>
                                    <div className="text-xs text-slate-400">{rec.name}</div>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getActionColor(rec.action)}`}>{rec.action}</div>
                            </div>
                            <p className="text-sm text-slate-400 leading-tight border-t border-slate-700/50 pt-2 line-clamp-3 mb-2">{rec.rationale}</p>
                            {rec.targetPrice && (
                                    <div className="text-xs text-cyan-400 font-mono">Target: {currencySymbol}{rec.targetPrice}</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Financial Matrix */}
                <div className="mb-3 mt-4 border-t border-slate-700 pt-3">
                    <h4 className="text-sm font-bold text-slate-400 mb-3">Financial Benchmarking Matrix</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {data.recommendations.map((rec) => (
                            <button key={rec.symbol} onClick={() => togglePeer(rec.symbol)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${selectedPeers.includes(rec.symbol) ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}>
                                {selectedPeers.includes(rec.symbol) ? '✓ ' : '+ '} {rec.symbol}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/40">
                        <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-800/80 text-sm text-slate-300">
                            <tr>
                            <th className="p-3 text-left font-mono w-1/4">Metric</th>
                            <th className="p-3 font-bold text-cyan-400 border-l border-slate-700 bg-cyan-900/10 w-1/4">{data.symbol}</th>
                            {selectedPeers.map(peerSymbol => ( <th key={peerSymbol} className="p-3 border-l border-slate-700 w-1/4">{peerSymbol}</th> ))}
                                {Array.from({ length: Math.max(0, 2 - selectedPeers.length) }).map((_, i) => ( <th key={`empty-${i}`} className="p-3 border-l border-slate-700 w-1/4"></th> ))}
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono text-slate-300 divide-y divide-slate-800/50">
                            {[
                                { label: "P/E Ratio", key: "peRatio" }, { label: "Market Cap", key: "marketCap" }, { label: "EPS Growth", key: "epsGrowth" },
                                { label: "Net Margin", key: "profitMargin" }, { label: "ROE", key: "roe" }, { label: "RSI (14D)", key: "rsi" }
                            ].map((row) => (
                                <tr key={row.key} className="hover:bg-slate-800/30">
                                <td className="p-3 text-left text-slate-400 font-sans">{row.label}</td>
                                <td className="p-3 font-semibold text-white border-l border-slate-700 bg-cyan-900/5">{getMetricValue(data.metrics, row.key as keyof KeyMetrics)}</td>
                                {selectedPeers.map(peerSymbol => { const peer = data.recommendations?.find(r => r.symbol === peerSymbol); return ( <td key={peerSymbol} className="p-3 border-l border-slate-700 text-slate-300">{getMetricValue(peer?.metrics, row.key as keyof KeyMetrics)}</td> ); })}
                                {Array.from({ length: Math.max(0, 2 - selectedPeers.length) }).map((_, i) => ( <td key={`empty-cell-${i}`} className="p-3 border-l border-slate-700"></td> ))}
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Executive Summary (Overall) - Repeat */}
        <div className="glass-panel p-4 rounded-xl">
            <h3 className="text-cyan-400 font-mono text-sm font-bold mb-2 leading-none">OVERALL SUMMARY</h3>
            <p className="text-slate-200 leading-normal text-base">{data.summary}</p>
        </div>

        {/* Other Sections (Fundamentals, Technicals, Risks) */}
        <div className="space-y-4">
            {otherSections.map((section, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl">
                    <h3 className="text-base font-bold text-white mb-2 border-b border-slate-700 pb-1 uppercase tracking-wide">{section.title}</h3>
                    <div className="prose prose-invert prose-base max-w-none text-slate-300">
                    {section.content.split('\n').map((line, i) => {
                        if (line.trim().startsWith('###')) return <h4 key={i} className="text-cyan-200 mt-3 mb-1 font-semibold text-sm uppercase tracking-wide">{line.replace(/^###\s*/, '')}</h4>;
                        if (line.trim().startsWith('-')) return <li key={i} className="ml-5 list-disc marker:text-cyan-500 text-base">{line.replace(/^-\s*/, '')}</li>;
                        if (line.trim() === '') return null;
                        return <p key={i} className="mb-1 text-base leading-relaxed">{line.replace(/\*\*/g, '')}</p>; 
                    })}
                    </div>
                </div>
            ))}
        </div>

    </div>
  );
};

export default AnalysisDeepDive;