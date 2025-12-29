
import React, { useState, useEffect } from 'react';
import { StockGPTResponse, KeyMetrics } from '../types';
import { useAuth } from '../context/AuthContext';
import AnalysisOverview from './AnalysisOverview';
import AnalysisDeepDive from './AnalysisDeepDive';
import ScenarioChart from './charts/ScenarioChart';
import HistoricalDataTable from './charts/HistoricalDataTable';
import SubscriptionModal from './subscription/SubscriptionModal';
import { 
  Printer, Check, Bell, 
  LayoutDashboard, Target, History, BookOpen, Bookmark, Lock, Crown
} from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
  onOpenAlertModal: () => void;
}

declare const html2pdf: any;

type TabId = 'overview' | 'forecasts' | 'history' | 'deep-dive';

const AnalysisDisplay: React.FC<Props> = ({ data, onReset, onOpenAlertModal }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  
  const currencySymbol = data.currency || '$';

  useEffect(() => {
    if (data.recommendations && data.recommendations.length > 0) {
      setSelectedPeers(data.recommendations.slice(0, 2).map(r => r.symbol));
    }
  }, [data.recommendations]);

  const hasProAccess = user?.tier === 'PRO' || user?.tier === 'LIFETIME';

  const handleTabChange = (id: TabId) => {
    if (id === 'deep-dive' && !hasProAccess) {
        setIsPaywallOpen(true);
        return;
    }
    setActiveTab(id);
  };

  const handleExportPDF = () => {
    if (!hasProAccess) {
        setIsPaywallOpen(true);
        return;
    }

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
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, pro: false },
    { id: 'forecasts' as const, label: 'Forecasts', icon: Target, pro: false },
    { id: 'history' as const, label: 'History', icon: History, pro: false },
    { id: 'deep-dive' as const, label: 'Deep Dive', icon: BookOpen, pro: true },
  ];

  return (
    <div className="w-full max-w-full mx-auto space-y-3 pb-4 animate-fade-in">
      <SubscriptionModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />

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
            <button onClick={handleExportPDF} className={`relative p-2.5 rounded-lg border transition-all ${hasProAccess ? 'text-slate-300 bg-slate-800/50 border-slate-700 hover:text-white' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`} title={hasProAccess ? "Export PDF" : "PRO FEATURE: PDF Export"}>
                {isExporting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <Printer size={20} />}
                {!hasProAccess && <Lock size={10} className="absolute top-1.5 right-1.5 text-amber-500" />}
            </button>
            <button onClick={onReset} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wide">New Analysis</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/40 p-1.5 rounded-xl overflow-x-auto border border-slate-700/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            } ${tab.pro && !hasProAccess ? 'border-amber-500/30' : ''}`}
          >
            <tab.icon size={16} className={tab.pro && !hasProAccess ? 'text-amber-500' : ''} />
            {tab.label}
            {tab.pro && !hasProAccess && <Lock size={12} className="text-amber-500" />}
          </button>
        ))}
      </div>

      <div id="analysis-container" className="min-h-[400px]">
        {activeTab === 'overview' && <AnalysisOverview data={data} currencySymbol={currencySymbol} />}
        {activeTab === 'forecasts' && (
            <div className="glass-panel p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-cyan-400" />
                    <h3 className="text-cyan-400 font-mono text-sm font-bold">PRICE TARGET SCENARIOS</h3>
                </div>
                <div className="h-[600px]"><ScenarioChart scenarios={data.scenarios} forecasts={data.forecasts} currentPrice={data.currentPrice || 0} currency={currencySymbol} /></div>
            </div>
        )}
        {activeTab === 'history' && <div className="glass-panel p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300"><HistoricalDataTable currentPrice={data.currentPrice || 0} currency={currencySymbol} /></div>}
        {activeTab === 'deep-dive' && hasProAccess && <AnalysisDeepDive data={data} currencySymbol={currencySymbol} selectedPeers={selectedPeers} togglePeer={(s) => setSelectedPeers(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} getMetricValue={(m, k) => m ? (m[k] || 'N/A') : 'N/A'} getActionColor={(a) => a.toLowerCase() === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800'} />}
      </div>
      
      {!hasProAccess && (
          <div className="mt-8 p-8 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Want deeper insights?</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">Upgrade to StockGPT Pro for Deep-Dive Analysis, Peer Benchmarking, and full News Sentiment reporting.</p>
              <button onClick={() => setIsPaywallOpen(true)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/40">Unlock Pro Features</button>
          </div>
      )}

      <div className="text-center text-xs text-slate-600 mt-6 px-2">
        <p className="mb-1">DISCLAIMER: StockGPT is an AI-powered research tool using real-time market data.</p>
        <p>Predictions are probabilistic and do not constitute financial advice. Data accuracy is subject to market availability.</p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
