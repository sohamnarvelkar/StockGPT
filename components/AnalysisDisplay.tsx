import React, { useState, useEffect } from 'react';
import { StockGPTResponse } from '../types';
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

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
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

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'forecasts' as const, label: 'Forecasts', icon: Target },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'deep-dive' as const, label: 'Deep Dive', icon: BookOpen },
  ];

  return (
    <div className="w-full max-w-full mx-auto space-y-3 pb-4 animate-fade-in">
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">{data.symbol}</h1>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-md text-[10px] font-black border border-cyan-500/20 uppercase tracking-[0.2em]">
              Premium Intelligence Active
            </span>
          </div>
          <p className="text-slate-400 text-base mt-2 font-medium">{data.companyName} • <span className="text-cyan-400 font-mono text-xl font-bold">{currencySymbol}{data.currentPrice?.toFixed(2)}</span></p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
            <button onClick={onOpenAlertModal} className="p-3 text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-xl border border-slate-700 hover:text-cyan-400 transition-colors" title="Set Alert"><Bell size={20} /></button>
            <button onClick={handleSave} disabled={isSaved} className={`p-3 rounded-xl border transition-colors ${isSaved ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'text-slate-300 bg-slate-800/50 border-slate-700 hover:text-white'}`} title="Save Analysis">{isSaved ? <Check size={20} /> : <Bookmark size={20} />}</button>
            <button onClick={handleExportPDF} className="p-3 rounded-xl border text-slate-300 bg-slate-800/50 border-slate-700 hover:text-white transition-all" title="Export PDF">
                {isExporting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <Printer size={20} />}
            </button>
            <button onClick={onReset} className="px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-widest">New Ticker</button>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-800/40 p-1.5 rounded-xl overflow-x-auto border border-slate-700/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div id="analysis-container" className="min-h-[400px]">
        {activeTab === 'overview' && <AnalysisOverview data={data} currencySymbol={currencySymbol} />}
        {activeTab === 'forecasts' && (
            <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <Target size={20} className="text-cyan-400" />
                    <h3 className="text-cyan-400 font-mono text-sm font-black tracking-widest uppercase">Target Probabilities</h3>
                </div>
                <div className="h-[600px]"><ScenarioChart scenarios={data.scenarios} forecasts={data.forecasts} currentPrice={data.currentPrice || 0} currency={currencySymbol} /></div>
            </div>
        )}
        {activeTab === 'history' && <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300"><HistoricalDataTable currentPrice={data.currentPrice || 0} currency={currencySymbol} /></div>}
        {activeTab === 'deep-dive' && <AnalysisDeepDive data={data} currencySymbol={currencySymbol} selectedPeers={selectedPeers} togglePeer={(s) => setSelectedPeers(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} getMetricValue={(m, k) => m ? (m[k] || 'N/A') : 'N/A'} getActionColor={(a) => a.toLowerCase() === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800'} />}
      </div>

      <div className="text-center text-[10px] font-black text-slate-700 mt-8 px-2 uppercase tracking-[0.2em]">
        Institutional Access Enabled • Predictions generated by probabilistic quantum models
      </div>
    </div>
  );
};

export default AnalysisDisplay;