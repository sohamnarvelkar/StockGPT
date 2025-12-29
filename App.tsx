import React, { useState, useEffect } from 'react';
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
import { Search, TrendingUp, LogIn, LogOut, User, AlertTriangle, RefreshCw, Bell, Trash2, WifiOff, ShieldAlert, FileWarning, Key, CheckCircle2, XCircle, Crown, Sparkles, CreditCard, Lock, Zap, Shield } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  const [error, setError] = useState<{ message: string; isRetryable: boolean; code?: string } | null>(null);
  
  const { user, logout, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { alerts, removeAlert } = useAlerts();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const hasApiKey = React.useMemo(() => {
    return process.env.API_KEY && process.env.API_KEY.length > 0;
  }, []);

  // Strict Subscription Check
  const isSubscribed = user && user.tier !== 'FREE';

  // Automatically open subscription modal if logged in but not paid
  useEffect(() => {
    if (user && user.tier === 'FREE') {
        setIsSubscriptionModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && viewState === ViewState.LANDING && !analysisData) {
        setInputText(query);
        if (user) {
            if (isSubscribed) {
              performAnalysis(query);
            } else {
              setIsSubscriptionModalOpen(true);
            }
        } else {
            setIsAuthModalOpen(true);
        }
    }
  }, [user, isLoading, isSubscribed]);

  const performAnalysis = async (query: string) => {
    setViewState(ViewState.ANALYZING);
    setError(null);
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('q', query);
        window.history.pushState({}, '', url.toString());
    } catch (e) {}

    try {
      const result = await analyzeStock(query);
      setAnalysisData(result);
      setViewState(ViewState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError({ message: err.message || "Failed to analyze. Please try again.", isRetryable: err.isRetryable !== undefined ? err.isRetryable : true, code: err.code || 'UNKNOWN' });
      setViewState(ViewState.LANDING); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Auth Check
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }

    // Subscription Check
    if (user.tier === 'FREE') {
        setIsSubscriptionModalOpen(true);
        return;
    }

    await performAnalysis(inputText);
  };

  const handleRetry = () => inputText && performAnalysis(inputText);

  const handleReset = () => {
    setViewState(ViewState.LANDING);
    setInputText('');
    setAnalysisData(null);
    setError(null);
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setIsSubscriptionModalOpen(false);
    handleReset();
  };

  const renderErrorIcon = (code: string = 'UNKNOWN') => {
      if (code === 'NO_API_KEY') return <Key size={24} className="text-amber-400" />;
      if (code === 'NETWORK_ERROR' || code === 'OFFLINE') return <WifiOff size={24} className="text-rose-400" />;
      if (code === 'SAFETY_BLOCK') return <ShieldAlert size={24} className="text-rose-400" />;
      if (code === 'PARSE_ERROR') return <FileWarning size={24} className="text-amber-400" />;
      return <AlertTriangle size={24} className="text-rose-400" />;
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
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 font-medium">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      <nav className="relative w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <IconTrend />
            </div>
            <span className="font-bold text-2xl tracking-tight">{APP_NAME}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden lg:flex text-sm font-mono items-center gap-2 px-3 py-1 rounded-full border ${hasApiKey ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-rose-400 border-rose-500/20 bg-rose-500/10'}`}>
                {hasApiKey ? <><CheckCircle2 size={14} /><span>SYSTEM ONLINE</span></> : <><XCircle size={14} /><span>KEY MISSING</span></>}
            </div>
            
            {isSubscribed && (
              <div className="relative">
                  <button onClick={() => setShowAlertMenu(!showAlertMenu)} className="relative p-2 text-slate-400 hover:text-white transition-colors" title="Price Alerts">
                    <Bell size={22} />
                    {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>}
                  </button>
                  {showAlertMenu && (
                      <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAlertMenu(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center"><h3 className="text-base font-semibold text-white">Active Alerts</h3><span className="text-sm text-slate-500">{alerts.length} monitoring</span></div>
                          <div className="max-h-72 overflow-y-auto">
                            {alerts.length === 0 ? <div className="px-4 py-6 text-center text-sm text-slate-500">No active alerts.</div> : alerts.map(alert => (
                                <div key={alert.id} className="px-4 py-3 hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 flex justify-between items-center group">
                                    <div><div className="flex items-center gap-2"><span className="font-bold text-base text-white">{alert.symbol}</span>{alert.status === 'TRIGGERED' && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded uppercase font-bold">Hit</span>}</div><div className="text-sm text-slate-400">Target: <span className="text-cyan-400 font-mono text-base">{alert.targetPrice}</span> ({alert.condition})</div></div>
                                    <button onClick={() => removeAlert(alert.id)} className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))}
                          </div>
                      </div>
                      </>
                  )}
              </div>
            )}

            {user ? (
                <div className="relative flex items-center gap-3">
                    {user.tier === 'FREE' && (
                        <button 
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-amber-900/20 uppercase tracking-widest"
                        >
                            <Crown size={14} /> Upgrade
                        </button>
                    )}
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-slate-800 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-slate-700">
                        <div className="text-right hidden sm:block leading-tight">
                            <div className="text-base font-medium text-slate-200">{user.name}</div>
                            {getTierBadge(user.tier)}
                        </div>
                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-slate-600" /> : <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center"><User size={18} /></div>}
                    </button>
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                             <div className="px-4 py-3 border-b border-slate-800 flex flex-col gap-1">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Plan</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-bold">{user.tier}</span>
                                    {user.tier !== 'LIFETIME' && (
                                        <button onClick={() => { setIsSubscriptionModalOpen(true); setShowProfileMenu(false); }} className="text-cyan-400 text-xs hover:underline">Change</button>
                                    )}
                                </div>
                             </div>
                             {isSubscribed && (
                               <button onClick={() => { setIsSubscriptionModalOpen(true); setShowProfileMenu(false); }} className="w-full text-left px-5 py-3 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                                  <CreditCard size={18} /> Billing Details
                               </button>
                             )}
                             <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800">
                                <LogOut size={18} /> Sign Out
                             </button>
                        </div>
                    )}
                    {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
                </div>
            ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"><LogIn size={18} />Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-3 py-3">
        {viewState === ViewState.ANALYZING && <div className="min-h-[50vh] flex flex-col items-center justify-center"><LoadingSpinner /><p className="mt-6 text-slate-400 text-base max-w-md text-center">Running quantitative models and market simulation...</p></div>}
        {viewState === ViewState.RESULT && analysisData && <AnalysisDisplay data={analysisData} onReset={handleReset} onOpenAlertModal={() => setIsAlertModalOpen(true)} />}
        {viewState === ViewState.LANDING && (
          <div className="max-w-4xl mx-auto pt-20 text-center animate-fade-in-up">
            <div className="mb-10 space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Global Market</span>
                <br />Intelligence.
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {user && user.tier === 'FREE' 
                  ? "Membership Required. Choose a plan to unlock the StockGPT analysis suite."
                  : "StockGPT combines quantitative modeling and macro analysis to provide institutional-grade insights."
                }
              </p>
            </div>

            {/* Paywall Gate for FREE users */}
            {user && user.tier === 'FREE' ? (
              <div className="mt-12 p-10 glass-panel border border-cyan-500/30 bg-gradient-to-b from-cyan-900/10 to-transparent rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <Lock size={200} className="text-cyan-400" />
                  </div>
                  <div className="relative z-10">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                          <Crown size={32} className="text-cyan-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Institutional Access Locked</h2>
                      <p className="text-slate-400 mb-8 text-lg">Your account requires an active subscription to access the global quantitative analysis engine and real-time forecasts.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                              <Zap className="text-blue-400" size={20}/>
                              <span className="text-sm font-medium text-slate-200">Real-time AI Analysis</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                              <Shield className="text-cyan-400" size={20}/>
                              <span className="text-sm font-medium text-slate-200">Probability Forecasts</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                              <Bell className="text-amber-400" size={20}/>
                              <span className="text-sm font-medium text-slate-200">Institutional Alerts</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                              <Sparkles className="text-indigo-400" size={20}/>
                              <span className="text-sm font-medium text-slate-200">Macro Geopolitical Risk</span>
                          </div>
                      </div>

                      <button 
                        onClick={() => setIsSubscriptionModalOpen(true)} 
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 rounded-xl font-bold text-lg text-white shadow-xl shadow-cyan-900/30 transition-all active:scale-[0.98]"
                      >
                        Select a Plan to Continue
                      </button>
                      
                      <button onClick={handleLogout} className="mt-6 text-slate-500 hover:text-rose-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                          <LogOut size={14} /> Log Out
                      </button>
                  </div>
              </div>
            ) : (
              <>
                <div className="bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto mt-10">
                  <form onSubmit={handleSubmit} className="relative flex items-center">
                    <div className="absolute left-5 text-slate-500">
                      <Search size={24} />
                    </div>
                    <input 
                      type="text" 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      placeholder="Enter stock symbol (e.g. TSLA, RELIANCE)" 
                      className="w-full bg-transparent border-none py-4 px-14 text-lg text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={!inputText.trim()} 
                      className="absolute right-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-cyan-900/40"
                    >
                      Analyze
                    </button>
                  </form>
                </div>

                {!user && (
                   <div className="mt-12 p-8 glass-panel border border-slate-700 rounded-2xl max-w-lg mx-auto">
                      <h3 className="text-white font-bold text-lg mb-2">Institutional-Grade Intelligence</h3>
                      <p className="text-slate-400 text-sm mb-6">Create an account and choose a professional plan to access real-time AI forecasts and quantitative technical reports.</p>
                      <button onClick={() => setIsAuthModalOpen(true)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">Get Started</button>
                   </div>
                )}
              </>
            )}

            {error && (
               <div className="mt-10 mx-auto max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className={`rounded-xl p-5 flex flex-col items-center gap-3 shadow-lg border ${error.code === 'NO_API_KEY' ? 'bg-amber-900/20 border-amber-500/20 text-amber-100' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    <div className="flex items-start gap-3 w-full justify-center text-center"><div className="shrink-0 mt-0.5">{renderErrorIcon(error.code)}</div><div className="text-base font-medium leading-tight">{error.message}</div></div>
                    {error.code === 'NO_API_KEY' ? (
                       <div className="w-full bg-slate-900/50 p-4 rounded-lg mt-3 text-left border border-amber-500/20">
                           <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Deployed Version Fix:</p>
                           <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1.5 font-mono"><li>Go to your Hosting Dashboard (Vercel/Netlify).</li><li>Navigate to <span className="text-white font-bold">Settings &gt; Environment Variables</span>.</li><li>Add Key: <span className="text-cyan-300">API_KEY</span> Value: <span className="text-cyan-300">AIzaSy...</span></li><li><span className="text-white font-bold">Redeploy</span> your application.</li></ol>
                       </div>
                    ) : ( error.isRetryable ? <button onClick={handleRetry} className="mt-2 flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600 uppercase tracking-wide shadow-md"><RefreshCw size={14} /> Retry Analysis</button> : <p className="text-xs opacity-70 mt-1">Please modify your request and try again.</p> )}
                 </div>
               </div>
            )}
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Forced Membership Gate: Cannot close if tier is FREE */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => user?.tier !== 'FREE' && setIsSubscriptionModalOpen(false)} 
        isMandatory={user?.tier === 'FREE'}
      />

      {analysisData && <SetAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} symbol={analysisData.symbol} currentPrice={analysisData.currentPrice || 0} />}
    </div>
  );
}

export default App;