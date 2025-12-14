
import React, { useState, useEffect } from 'react';
import { StockGPTResponse, StockRecommendation, KeyMetrics } from '../types';
import SignalBadge from './ui/SignalBadge';
import ScenarioChart from './charts/ScenarioChart';
import FinancialProjections from './charts/FinancialProjections';
import SentimentGauge from './charts/SentimentGauge';
import PortfolioPie from './charts/PortfolioPie';
import HistoricalDataTable from './charts/HistoricalDataTable';
import { 
  Download, FileText, Printer, Check, Copy, TrendingUp, Anchor, Activity, Globe, 
  PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Bookmark, Bell, 
  ArrowRightCircle, Scale, LayoutDashboard, Target, History, BookOpen 
} from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
  onOpenAlertModal: () => void;
}

// Declare html2pdf for TypeScript since we loaded it via script tag
declare const html2pdf: any;

// Colors matching the PortfolioPie chart
const PIE_COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f43f5e', '#8b5cf6', '#ec4899'];

const ExternalLinkIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

type TabId = 'overview' | 'forecasts' | 'history' | 'deep-dive';

const AnalysisDisplay: React.FC<Props> = ({ data, onReset, onOpenAlertModal }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  
  const currencySymbol = data.currency || '$';

  useEffect(() => {
    if (data.recommendations && data.recommendations.length > 0) {
      setSelectedPeers(data.recommendations.slice(0, 2).map(r => r.symbol));
    }
  }, [data.recommendations]);

  const macroSection = data.sections.find(s => 
    s.title.toLowerCase().includes('macro') || 
    s.title.toLowerCase().includes('global market')
  );
  
  const otherSections = data.sections.filter(s => s !== macroSection);

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a === 'buy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (a === 'sell') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const togglePeer = (symbol: string) => {
    if (selectedPeers.includes(symbol)) {
      setSelectedPeers(selectedPeers.filter(s => s !== symbol));
    } else {
      if (selectedPeers.length < 3) {
        setSelectedPeers([...selectedPeers, symbol]);
      }
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('analysis-container');
    const opt = {
      margin: 0.1,
      filename: `StockGPT_${data.symbol}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      });
    } else {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    try {
      const saveKey = 'stockgpt_saved_analyses';
      const timestamp = new Date().toISOString();
      const newEntry = { id: `${data.symbol}_${Date.now()}`, symbol: data.symbol, companyName: data.companyName, timestamp, data: data };
      const existingRaw = localStorage.getItem(saveKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(saveKey, JSON.stringify([newEntry, ...existing].slice(0, 50)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const getMetricValue = (metrics: KeyMetrics | undefined, key: keyof KeyMetrics) => {
    return metrics ? metrics[key] : 'N/A';
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'forecasts' as const, label: 'Forecasts', icon: Target },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'deep-dive' as const, label: 'Deep Dive', icon: BookOpen },
  ];

  return (
    <div className="w-full max-w-full mx-auto space-y-3 pb-4 animate-fade-in">
      
      {/* Header (Stock Details) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">{data.symbol}</h1>
            <span className="px-2.5 py-0.5 bg-slate-700 rounded-md text-sm font-mono text-slate-200 border border-slate-600">
              AI ANALYZED
            </span>
          </div>
          <p className="text-slate-400 text-base mt-1.5 leading-none">{data.companyName} • <span className="text-cyan-400 font-mono text-lg">{currencySymbol}{data.currentPrice?.toFixed(2)}</span></p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
            <button onClick={onOpenAlertModal} className="p-2.5 text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700 hover:text-cyan-400 transition-colors" title="Set Alert"><Bell size={20} /></button>
            <button onClick={handleSave} disabled={isSaved} className={`p-2.5 rounded-lg border transition-colors ${isSaved ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'text-slate-300 bg-slate-800/50 border-slate-700 hover:text-white'}`} title="Save Analysis">{isSaved ? <Check size={20} /> : <Bookmark size={20} />}</button>
            <button onClick={handleExportPDF} disabled={isExporting} className="p-2.5 text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700 hover:text-white transition-colors" title="Export PDF">{isExporting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <Printer size={20} />}</button>
            <button onClick={onReset} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wide">New Analysis</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/40 p-1.5 rounded-xl overflow-x-auto border border-slate-700/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div id="analysis-container" className="min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SignalBadge signal={data.signal} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Executive Summary */}
                    <div className="glass-panel p-4 rounded-xl">
                        <h3 className="text-cyan-400 font-mono text-sm font-bold mb-2 leading-none">EXECUTIVE SUMMARY</h3>
                        <p className="text-slate-200 leading-normal text-base">{data.summary}</p>
                    </div>

                    {/* Allocation Graph */}
                    {data.portfolioAllocation && data.portfolioAllocation.length > 0 ? (
                        <div className="glass-panel p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <PieChartIcon size={18} className="text-cyan-400" />
                                <h3 className="text-cyan-400 font-mono text-sm font-bold">OPTIMIZED ALLOCATION</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-full sm:w-1/2 min-w-0">
                                    <PortfolioPie data={data.portfolioAllocation} />
                                </div>
                                <div className="w-full sm:w-1/2 space-y-2">
                                    {data.portfolioAllocation.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }} className="font-bold">{item.asset}</span>
                                            <span className="text-slate-200 font-mono">{item.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-4 rounded-xl flex flex-col justify-center">
                            <SentimentGauge score={data.signal.confidenceScore} recommendation={data.signal.recommendation} />
                        </div>
                    )}
                </div>

                {/* Forecast Models Graph */}
                <div className="glass-panel p-4 rounded-xl">
                    {data.forecasts ? (
                        <FinancialProjections forecasts={data.forecasts} currentPrice={data.currentPrice || 0} currency={currencySymbol} />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-500 text-base">No forecast data available</div>
                    )}
                </div>
            </div>
        )}

        {/* TAB 2: FORECASTS */}
        {activeTab === 'forecasts' && (
            <div className="glass-panel p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-cyan-400" />
                    <h3 className="text-cyan-400 font-mono text-sm font-bold">PRICE TARGET SCENARIOS</h3>
                </div>
                <div className="h-[600px]">
                   <ScenarioChart scenarios={data.scenarios} forecasts={data.forecasts} currentPrice={data.currentPrice || 0} currency={currencySymbol} />
                </div>
            </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
            <div className="glass-panel p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <HistoricalDataTable currentPrice={data.currentPrice || 0} currency={currencySymbol} />
            </div>
        )}

        {/* TAB 4: DEEP DIVE */}
        {activeTab === 'deep-dive' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Macro Analysis */}
                {macroSection && (
                    <div className="rounded-xl border border-dashed border-indigo-500/40 bg-slate-900/60 p-5 relative overflow-hidden">
                        <div className="relative z-10 pl-1">
                            <div className="flex items-center gap-2 mb-3 border-b border-indigo-500/20 pb-2">
                                <Globe size={20} className="text-indigo-400" />
                                <h3 className="text-base font-bold text-white uppercase tracking-wide">{macroSection.title}</h3>
                            </div>
                            <div className="prose prose-invert prose-base max-w-none text-slate-300 space-y-2">
                            {macroSection.content.split('\n').map((line, i) => {
                                if (line.trim().startsWith('###')) return <h4 key={i} className="text-indigo-200 mt-3 mb-1 font-bold text-sm uppercase tracking-wide">{line.replace(/^###\s*/, '')}</h4>;
                                if (line.trim().startsWith('-')) return <li key={i} className="ml-5 list-disc marker:text-indigo-500 text-base">{line.replace(/^-\s*/, '')}</li>;
                                if (line.trim() === '') return null;
                                return <p key={i} className="mb-1 text-base leading-relaxed">{line.replace(/\*\*/g, '')}</p>;
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

                {/* Peer Comparison */}
                {data.recommendations && data.recommendations.length > 0 && (
                    <div className="glass-panel p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                            <h3 className="text-base font-bold text-white">Peer Comparison</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {data.recommendations.map((rec, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-white text-base">{rec.symbol}</div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getActionColor(rec.action)}`}>{rec.action}</div>
                                </div>
                                <p className="text-sm text-slate-400 leading-tight border-t border-slate-700/50 pt-2 line-clamp-3">{rec.rationale}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                {/* Financial Benchmarking */}
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                        <h3 className="text-base font-bold text-white">Financial Benchmarking</h3>
                    </div>
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                        {data.recommendations?.map((rec) => (
                            <button key={rec.symbol} onClick={() => togglePeer(rec.symbol)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${selectedPeers.includes(rec.symbol) ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}>
                                {selectedPeers.includes(rec.symbol) ? '✓ ' : '+ '} {rec.symbol}
                            </button>
                        ))}
                        </div>
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
        )}

      </div>
      <div className="text-center text-xs text-slate-600 mt-6 px-2"><p>DISCLAIMER: StockGPT is an AI-powered research tool. Predictions are probabilistic and do not constitute financial advice.</p></div>
    </div>
  );
};

export default AnalysisDisplay;
