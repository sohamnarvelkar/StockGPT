import React, { useState } from 'react';
import { ViewState, APP_NAME } from './constants';
import { StockGPTResponse, SubscriptionTier } from './types';
import { analyzeStock } from './services/geminiService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisDisplay from './components/AnalysisDisplay';
import { useAuth } from './context/AuthContext';
import { useAlerts } from './context/AlertContext';
import AuthModal from './components/auth/AuthModal';
import SetAlertModal from './components/modals/SetAlertModal';
import SubscriptionModal from './components/subscription/SubscriptionModal';
import { Search, LogIn, LogOut, User, Bell, Trash2, Key, Crown, Sparkles, Lock, ChevronRight } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  const [error, setError] = useState<{ message: string; isRetryable: boolean; code?: string } | null>(null);
  
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { alerts, removeAlert } = useAlerts();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const hasApiKey = React.useMemo(() => {
    return process.env.API_KEY && process.env.API_KEY.length > 0;
  }, []);

  // Passive Check: Only used for conditional rendering, never for redirection
  const isSubscribed = user && user.tier !== 'FREE';

  const performAnalysis = async (query: string) => {
    if (!isSubscribed) return;
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
    if (!isSubscribed || !inputText.trim()) return;
    await performAnalysis(inputText);
  };

  const handleReset = () => {
    setViewState(ViewState.LANDING);
    setInputText('');
    setAnalysisData(null);
    setError(null);
  };

  const getTierBadge = (tier: SubscriptionTier) => {
      switch(tier) {
          case 'LIFETIME': return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold flex items-center gap-1"><Crown size={10} /> LIFETIME</span>;
          case 'PRO': return <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold flex items-center gap-1"><Sparkles size={10} /> PRO</span>;
          case 'STARTER': return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold flex items-center gap-1">STARTER</span>;
          default: return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 border border-slate-500/20 rounded text-[10px] font-bold">FREE</span>;
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30">
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
            {isSubscribed && (
              <div className="relative">
                  <button onClick={() => setShowAlertMenu(!showAlertMenu)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell size={22} />
                    {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full"></span>}
                  </button>
                  {showAlertMenu && (
                      <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 font-bold text-[10px] text-white uppercase tracking-widest">Active Monitors</div>
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

            {user ? (
                <div className="relative">
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700 transition-all">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-white leading-none mb-1">{user.name}</div>
                            {getTierBadge(user.tier)}
                        </div>
                        {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-600" /> : <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center"><User size={16} /></div>}
                    </button>
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                             <div className="px-5 py-4 border-b border-slate-800">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Account</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-bold">{user.tier}</span>
                                    <button onClick={() => { setIsSubscriptionModalOpen(true); setShowProfileMenu(false); }} className="text-cyan-400 text-xs font-bold hover:underline">Billing</button>
                                </div>
                             </div>
                             <button onClick={() => { logout(); handleReset(); setShowProfileMenu(false); }} className="w-full text-left px-5 py-3 text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-3 border-t border-slate-800 mt-2">
                                <LogOut size={16} /> Sign Out
                             </button>
                        </div>
                    )}
                    {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
                </div>
            ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {viewState === ViewState.ANALYZING && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-8 text-slate-400 text-sm font-mono tracking-widest uppercase animate-pulse">Scanning Global Markets...</p>
          </div>
        )}
        
        {viewState === ViewState.RESULT && analysisData && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <AnalysisDisplay data={analysisData} onReset={handleReset} onOpenAlertModal={() => setIsAlertModalOpen(true)} />
          </div>
        )}

        {viewState === ViewState.LANDING && (
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
            {isSubscribed ? (
              /* DASHBOARD VIEW: Authenticated & Paid */
              <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                <h1 className="text-6xl font-black text-white mb-6 tracking-tighter">
                  Market <span className="text-cyan-400">Analysis.</span>
                </h1>
                <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">Analyze any ticker with institutional quantitative models.</p>
                <div className="bg-slate-800/40 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl group focus-within:border-cyan-500/50 transition-all">
                  <form onSubmit={handleSubmit} className="relative flex items-center">
                    <Search className="absolute left-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={24} />
                    <input 
                      type="text" 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      placeholder="Enter symbol (e.g. AAPL, NVDA, TCS)" 
                      className="w-full bg-transparent border-none py-5 px-16 text-xl text-white placeholder-slate-600 focus:ring-0 focus:outline-none font-bold"
                    />
                    <button type="submit" disabled={!inputText.trim()} className="absolute right-2 px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-all uppercase tracking-widest">Analyze</button>
                  </form>
                </div>
              </div>
            ) : user ? (
              /* GATE VIEW: Authenticated but Free Tier - Passive */
              <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
                  <Lock size={40} className="text-cyan-400" />
                </div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none">Complete Enrollment</h2>
                <p className="text-xl text-slate-400 mb-12 leading-relaxed">Your account is ready. To unlock the StockGPT analysis suite and live market data, please select a membership tier below.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left">
                  {['Institutional Analysis Engine', '12M Prediction Scenarios', 'News Sentiment Matrix', 'Global Macro Tracking'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span className="text-sm font-bold text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full py-5 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-black text-lg shadow-2xl transition-all uppercase tracking-[0.2em]"
                >
                  View Membership Plans
                </button>
              </div>
            ) : (
              /* PUBLIC VIEW: Guest - Static */
              <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
                <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">Institutional AI Engine</div>
                <h1 className="text-7xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                   Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence.</span>
                </h1>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">Predict price trajectories and decode complex market trends with institutional accuracy.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setIsAuthModalOpen(true)} className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest">Get Started <ChevronRight size={20}/></button>
                  <button onClick={() => setIsAuthModalOpen(true)} className="px-10 py-5 bg-slate-900/50 text-white rounded-2xl font-bold text-lg border border-slate-700 hover:bg-slate-800 transition-all">View Demo</button>
                </div>
              </div>
            )}

            {error && (
               <div className="mt-12 mx-auto max-w-md p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in">
                  <div className="text-sm font-bold text-rose-400">{error.message}</div>
               </div>
            )}
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} isMandatory={false} />
      {analysisData && <SetAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} symbol={analysisData.symbol} currentPrice={analysisData.currentPrice || 0} />}
      
      <footer className="relative border-t border-slate-800 py-10 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] opacity-50">
          © {new Date().getFullYear()} {APP_NAME} • Institutional Grade • Secure Banking
      </footer>
    </div>
  );
}

export default App;