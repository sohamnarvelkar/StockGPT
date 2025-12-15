
import React, { useState, useEffect } from 'react';
import { StockGPTResponse, KeyMetrics } from '../types';
import AnalysisOverview from './AnalysisOverview';
import AnalysisDeepDive from './AnalysisDeepDive';
import ScenarioChart from './charts/ScenarioChart';
import HistoricalDataTable from './charts/HistoricalDataTable';
import { 
  Printer, Check, Bell, 
  LayoutDashboard, Target, History, BookOpen, Bookmark
} from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
  onOpenAlertModal: () => void;
}

// Declare html2pdf for TypeScript since we loaded it via script tag
declare const html2pdf: any;

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
            <AnalysisOverview data={data} currencySymbol={currencySymbol} />
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
            <AnalysisDeepDive 
                data={data} 
                currencySymbol={currencySymbol} 
                selectedPeers={selectedPeers} 
                togglePeer={togglePeer} 
                getMetricValue={getMetricValue} 
                getActionColor={getActionColor} 
            />
        )}

      </div>
      <div className="text-center text-xs text-slate-600 mt-6 px-2">
        <p className="mb-1">DISCLAIMER: StockGPT is an AI-powered research tool using real-time market data.</p>
        <p>Predictions are probabilistic and do not constitute financial advice. Data accuracy is subject to market availability.</p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
