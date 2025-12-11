
import React, { useState, useEffect } from 'react';
import { ViewState, APP_NAME } from './constants';
import { StockGPTResponse } from './types';
import { analyzeStock } from './services/geminiService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisDisplay from './components/AnalysisDisplay';
import { useAuth } from './context/AuthContext';
import { useAlerts } from './context/AlertContext';
import AuthModal from './components/auth/AuthModal';
import SetAlertModal from './components/modals/SetAlertModal';
import { Search, TrendingUp, LogIn, LogOut, User, AlertTriangle, RefreshCw, Bell, Trash2 } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  
  // Update error state to store retryability info
  const [error, setError] = useState<{ message: string; isRetryable: boolean } | null>(null);
  
  // Auth Integration
  const { user, logout, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Alerts Integration
  const { alerts, removeAlert } = useAlerts();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  // Deep Linking & Auto-Run Logic
  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    
    // Only auto-run if we are in LANDING state and have no data yet
    if (query && viewState === ViewState.LANDING && !analysisData) {
        setInputText(query);
        
        if (user) {
            // User is logged in, run immediately
            performAnalysis(query);
        } else {
            // User needs to login first, open modal
            // After login, this effect will re-run due to [user] dependency
            setIsAuthModalOpen(true);
        }
    }
  }, [user, isLoading]);

  const performAnalysis = async (query: string) => {
    setViewState(ViewState.ANALYZING);
    setError(null);

    // Update URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);

    try {
      const result = await analyzeStock(query);
      setAnalysisData(result);
      setViewState(ViewState.RESULT);
    } catch (err: any) {
      console.error(err);
      
      const message = err.message || "Failed to analyze. Please try again.";
      const isRetryable = err.isRetryable !== undefined ? err.isRetryable : true;
      
      setError({ message, isRetryable });
      setViewState(ViewState.LANDING); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Protection: Require login
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }

    await performAnalysis(inputText);
  };

  const handleRetry = () => {
    if (inputText) {
        performAnalysis(inputText);
    }
  };

  const handleReset = () => {
    setViewState(ViewState.LANDING);
    setInputText('');
    setAnalysisData(null);
    setError(null);
    
    // Clear URL param
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.pushState({}, '', url);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 font-medium">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleReset}
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <IconTrend />
            </div>
            <span className="font-bold text-2xl tracking-tight">{APP_NAME}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex text-sm font-mono text-slate-400 items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                SYSTEM ONLINE
            </div>
            
            {/* Alerts Dropdown */}
            <div className="relative">
                <button 
                   onClick={() => setShowAlertMenu(!showAlertMenu)}
                   className="relative p-2 text-slate-400 hover:text-white transition-colors"
                   title="Price Alerts"
                >
                   <Bell size={22} />
                   {alerts.length > 0 && (
                       <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>
                   )}
                </button>
                
                {showAlertMenu && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAlertMenu(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-base font-semibold text-white">Active Alerts</h3>
                            <span className="text-sm text-slate-500">{alerts.length} monitoring</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                           {alerts.length === 0 ? (
                               <div className="px-4 py-6 text-center text-sm text-slate-500">
                                   No active alerts.
                               </div>
                           ) : (
                               alerts.map(alert => (
                                   <div key={alert.id} className="px-4 py-3 hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 flex justify-between items-center group">
                                       <div>
                                           <div className="flex items-center gap-2">
                                               <span className="font-bold text-base text-white">{alert.symbol}</span>
                                               {alert.status === 'TRIGGERED' && (
                                                   <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded uppercase font-bold">Hit</span>
                                               )}
                                           </div>
                                           <div className="text-sm text-slate-400">
                                               Target: <span className="text-cyan-400 font-mono text-base">{alert.targetPrice}</span> ({alert.condition})
                                           </div>
                                       </div>
                                       <button 
                                           onClick={() => removeAlert(alert.id)}
                                           className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               ))
                           )}
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* User Menu */}
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 hover:bg-slate-800 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-slate-700"
                    >
                        <div className="text-right hidden sm:block leading-tight">
                            <div className="text-base font-medium text-slate-200">{user.name}</div>
                            <div className="text-xs text-slate-500 font-mono">PRO MEMBER</div>
                        </div>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-slate-600" />
                        ) : (
                            <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                                <User size={18} />
                            </div>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                             <button 
                                onClick={handleLogout}
                                className="w-full text-left px-5 py-3 text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                             >
                                <LogOut size={18} /> Sign Out
                             </button>
                        </div>
                    )}
                    {showProfileMenu && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                    <LogIn size={18} />
                    Sign In
                </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-3 py-3">
        
        {viewState === ViewState.ANALYZING && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
             <LoadingSpinner />
             <p className="mt-6 text-slate-400 text-base max-w-md text-center">
               Running quantitative models and market simulation...
             </p>
          </div>
        )}

        {viewState === ViewState.RESULT && analysisData && (
          <AnalysisDisplay 
            data={analysisData} 
            onReset={handleReset}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
          />
        )}

        {viewState === ViewState.LANDING && (
          <div className="max-w-4xl mx-auto pt-20 text-center animate-fade-in-up">
            <div className="mb-10 space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Global Market
                </span>
                <br />
                Intelligence.
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                StockGPT combines quantitative modeling and macro analysis to provide institutional-grade insights.
              </p>
            </div>

            <div className="bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto mt-10">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <Search className="absolute left-5 text-slate-500" size={24} />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ticker (AAPL, RELIANCE.NS) or Question..."
                  className="w-full bg-transparent border-none py-4 px-14 text-lg text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-base font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </form>
            </div>
            
            {!user && (
                <p className="mt-6 text-base text-slate-500">
                    <button onClick={() => setIsAuthModalOpen(true)} className="text-cyan-400 hover:underline">Sign in</button> required for detailed reports.
                </p>
            )}

            {error && (
               <div className="mt-10 mx-auto max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-5 flex flex-col items-center gap-3 shadow-lg">
                    <div className="flex items-start gap-3 w-full justify-center">
                        <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                        <div className="text-base font-medium">
                            {error.message}
                        </div>
                    </div>
                    
                    {error.isRetryable && (
                        <button 
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 rounded-lg transition-colors border border-rose-500/20 uppercase tracking-wide"
                        >
                            <RefreshCw size={14} /> Retry Analysis
                        </button>
                    )}
                    {!error.isRetryable && (
                        <p className="text-xs text-rose-300/70 mt-1">Please modify your request and try again.</p>
                    )}
                 </div>
               </div>
            )}
            
            <div className="mt-16 text-sm text-slate-600 font-mono">
              POWERED BY GEMINI 2.5 FLASH • REAL-TIME DATA
            </div>
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {analysisData && (
        <SetAlertModal 
            isOpen={isAlertModalOpen} 
            onClose={() => setIsAlertModalOpen(false)} 
            symbol={analysisData.symbol}
            currentPrice={analysisData.currentPrice || 0}
        />
      )}
    </div>
  );
}

export default App;
