import React, { useState } from 'react';
import { ViewState, APP_NAME } from './constants';
import { StockGPTResponse, SubscriptionTier } from './types';
import { analyzeStock } from './services/geminiService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisDisplay from './components/AnalysisDisplay';
import SetAlertModal from './components/modals/SetAlertModal';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { useAlerts } from './context/AlertContext';
import { Search, User as UserIcon, Bell, Trash2, Crown, LogOut, ShieldCheck } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  const [error, setError] = useState<{ message: string; isRetryable: boolean; code?: string } | null>(null);
  
  // Real Auth and Alert Contexts
  const { user, logout } = useAuth();
  const { alerts, removeAlert } = useAlerts();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const performAnalysis = async (query: string) => {
    // Auth Gate: Passive trigger
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

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

  const getTierBadge = (tier: SubscriptionTier) => {
      const colors = {
          LIFETIME: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
          PRO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
          STARTER: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
          FREE: 'bg-slate-500/20 text-slate-400 border-slate-500/20'
      };
      return (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-black flex items-center gap-1 uppercase tracking-widest ${colors[tier]}`}>
            {tier === 'LIFETIME' && <Crown size={10} />} {tier}
        </span>
      );
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
            {/* Alerts Menu (Only if logged in) */}
            {user && (
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
            )}

            {/* Auth Component */}
            {user ? (
                <div className="relative">
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700 transition-all">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-white leading-none mb-1">{user.name}</div>
                            {getTierBadge(user.tier)}
                        </div>
                        {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-600" /> : <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center"><UserIcon size={16} /></div>}
                    </button>
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                              <div className="px-5 py-4 border-b border-slate-800">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Account Settings</span>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-bold">{user.tier} License</span>
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">Verified Institutional Terminal</p>
                              </div>
                              <button 
                                onClick={() => { logout(); handleReset(); setShowProfileMenu(false); }} 
                                className="w-full text-left px-5 py-3.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                              >
                                <LogOut size={16} /> Sign Out
                              </button>
                        </div>
                    )}
                    {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
                </div>
            ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                >
                  Sign In
                </button>
            )}
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
                Institutional Analysis Engine {user ? 'Active' : 'Locked'}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight">
                Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence.</span>
              </h1>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">Predict price trajectories and decode complex market trends with institutional accuracy. Sign in to run deep-dive analysis.</p>
              
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
          © {new Date().getFullYear()} {APP_NAME} • Professional Grade Analysis
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {analysisData && <SetAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} symbol={analysisData.symbol} currentPrice={analysisData.currentPrice || 0} />}
    </div>
  );
}

export default App;