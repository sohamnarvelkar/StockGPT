import React, { useState } from 'react';
import { ViewState, APP_NAME } from './constants';
import { StockGPTResponse, SubscriptionTier, User, PriceAlert } from './types';
import { analyzeStock } from './services/geminiService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisDisplay from './components/AnalysisDisplay';
import SetAlertModal from './components/modals/SetAlertModal';
import { Search, User as UserIcon, Bell, Trash2, Crown, ChevronRight, CheckCircle } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

// Hardcoded Institutional Identity
const UNLOCKED_USER: User = {
  id: 'stockgpt_analyst',
  name: 'StockGPT Analyst',
  email: 'analyst@stockgpt.pro',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StockAnalyst',
  tier: 'LIFETIME'
};

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  const [error, setError] = useState<{ message: string; isRetryable: boolean; code?: string } | null>(null);
  
  // Local state replacing context-based storage
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const performAnalysis = async (query: string) => {
    setViewState(ViewState.ANALYZING);
    setError(null);

    try {
      const result = await analyzeStock(query);
      setAnalysisData(result);
      setViewState(ViewState.RESULT);
    } catch (err: any) {
      setError({ message: err.message || "Failed to analyze.", isRetryable: true, code: err.code || 'UNKNOWN' });
      setViewState(ViewState.LANDING); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await performAnalysis(inputText);
  };

  const handleReset = () => {
    setViewState(ViewState.LANDING);
    setInputText('');
    setAnalysisData(null);
    setError(null);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative w-full border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-[60]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <IconTrend />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">{APP_NAME}</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Alerts Menu */}
            <div className="relative">
                <button onClick={() => setShowAlertMenu(!showAlertMenu)} className="p-2 text-slate-400 hover:text-white transition-colors relative">
                  <Bell size={22} />
                  {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full"></span>}
                </button>
                {showAlertMenu && (
                    <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 font-bold text-[10px] text-white uppercase tracking-widest">Global Monitors</div>
                        <div className="max-h-80 overflow-y-auto">
                          {alerts.length === 0 ? <div className="px-5 py-8 text-center text-sm text-slate-500">No active alerts.</div> : alerts.map(alert => (
                              <div key={alert.id} className="px-5 py-4 hover:bg-slate-800/40 border-b border-slate-800/50 last:border-0 flex justify-between items-center">
                                  <div><div className="font-bold text-white">{alert.symbol}</div><div className="text-xs text-slate-400 font-mono">{alert.targetPrice}</div></div>
                                  <button onClick={() => removeAlert(alert.id)} className="p-2 text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button>
                              </div>
                          ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User Profile - Always Unlocked */}
            <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700 transition-all">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white leading-none mb-1">{UNLOCKED_USER.name}</div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest"><Crown size={10} /> Lifetime</span>
                    </div>
                    <img src={UNLOCKED_USER.avatar} className="w-8 h-8 rounded-full border border-slate-600" />
                </button>
                {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                          <div className="px-5 py-4">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Institutional Account</span>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-white font-bold">{UNLOCKED_USER.tier} ACCESS</span>
                                <CheckCircle size={14} className="text-emerald-400" />
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-[10px] text-slate-400 font-mono">
                                Permanent institutional license verified. Global market data feeds active.
                            </div>
                          </div>
                    </div>
                )}
                {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {viewState === ViewState.ANALYZING && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-8 text-slate-400 text-sm font-mono tracking-widest uppercase animate-pulse">Running Institutional Models...</p>
          </div>
        )}
        
        {viewState === ViewState.RESULT && analysisData && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <AnalysisDisplay data={analysisData} onReset={handleReset} onOpenAlertModal={() => setIsAlertModalOpen(true)} />
          </div>
        )}

        {viewState === ViewState.LANDING && (
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-8">
                Institutional License • Full Access Active
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight">
                Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence.</span>
              </h1>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">Predict price trajectories and decode complex market trends with institutional accuracy.</p>
              
              <div className="bg-slate-800/40 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl group focus-within:border-cyan-500/50 transition-all">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <Search className="absolute left-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={24} />
                  <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Search Symbol (e.g. AAPL, BTC, RELIANCE)" 
                    className="w-full bg-transparent border-none py-6 px-16 text-2xl text-white placeholder-slate-600 focus:ring-0 focus:outline-none font-bold"
                    autoFocus
                  />
                  <button type="submit" disabled={!inputText.trim()} className="absolute right-2 px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-cyan-500/20">Analyze</button>
                </form>
              </div>

              <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
                  <span className="text-xs font-black tracking-[0.5em] uppercase">NYSE</span>
                  <span className="text-xs font-black tracking-[0.5em] uppercase">NASDAQ</span>
                  <span className="text-xs font-black tracking-[0.5em] uppercase">NSE</span>
                  <span className="text-xs font-black tracking-[0.5em] uppercase">BSE</span>
                  <span className="text-xs font-black tracking-[0.5em] uppercase">FTSE</span>
              </div>
            </div>

            {error && (
               <div className="mt-12 mx-auto max-w-md p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                  <div className="text-sm font-bold text-rose-400">{error.message}</div>
               </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="relative border-t border-slate-800 py-10 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] opacity-50">
          © {new Date().getFullYear()} {APP_NAME} • Professional Grade Analysis • Unlimited Access
      </footer>

      {analysisData && <SetAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} symbol={analysisData.symbol} currentPrice={analysisData.currentPrice || 0} />}
    </div>
  );
}

export default App;