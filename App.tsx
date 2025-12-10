import React, { useState } from 'react';
import { ViewState, APP_NAME } from './constants';
import { StockGPTResponse } from './types';
import { analyzeStock } from './services/geminiService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AnalysisDisplay from './components/AnalysisDisplay';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import { Search, TrendingUp, LogIn, LogOut, User, AlertTriangle, RefreshCw } from 'lucide-react'; 

const IconTrend = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [inputText, setInputText] = useState('');
  const [analysisData, setAnalysisData] = useState<StockGPTResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth Integration
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const performAnalysis = async (query: string) => {
    setViewState(ViewState.ANALYZING);
    setError(null);

    try {
      const result = await analyzeStock(query);
      setAnalysisData(result);
      setViewState(ViewState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze. Please try again.");
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
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleReset}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <IconTrend />
            </div>
            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex text-xs font-mono text-slate-500 items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                SYSTEM ONLINE
            </div>
            
            {/* User Menu */}
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 hover:bg-slate-800 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-slate-700"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-slate-200">{user.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">PRO PLAN</div>
                        </div>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-600" />
                        ) : (
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                <User size={16} />
                            </div>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                             <div className="px-4 py-2 border-b border-slate-800 sm:hidden">
                                <p className="text-sm text-white font-medium">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                             </div>
                             <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                                <User size={14} /> Profile
                             </button>
                             <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                             >
                                <LogOut size={14} /> Sign Out
                             </button>
                        </div>
                    )}
                    {/* Click outside closer could be added here */}
                    {showProfileMenu && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                    <LogIn size={16} />
                    Sign In
                </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-3 py-4">
        
        {viewState === ViewState.ANALYZING && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <LoadingSpinner />
             <p className="mt-4 text-slate-400 text-sm max-w-md text-center">
               Analyzing market structure, screening fundamentals, and calculating probabilities for "{inputText}"...
             </p>
          </div>
        )}

        {viewState === ViewState.RESULT && analysisData && (
          <AnalysisDisplay data={analysisData} onReset={handleReset} />
        )}

        {viewState === ViewState.LANDING && (
          <div className="max-w-3xl mx-auto pt-12 text-center animate-fade-in-up">
            <div className="mb-8 space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Global Market
                </span>
                <br />
                Intelligence.
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                StockGPT combines quantitative modeling and macro analysis to provide insights for US, Indian (NSE/BSE), and Global markets.
              </p>
            </div>

            <div className="bg-slate-800/50 p-1 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto mt-8">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <Search className="absolute left-4 text-slate-500" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ticker (AAPL, RELIANCE.NS) or Question..."
                  className="w-full bg-transparent border-none py-4 px-12 text-lg text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </form>
            </div>
            
            {!user && (
                <p className="mt-4 text-sm text-slate-500">
                    <button onClick={() => setIsAuthModalOpen(true)} className="text-cyan-400 hover:underline">Sign in</button> required for detailed analysis.
                </p>
            )}

            {error && (
               <div className="mt-6 mx-auto max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 flex flex-col items-center gap-3 shadow-lg">
                    <div className="flex items-start gap-3 w-full">
                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                        <div className="text-sm font-medium leading-relaxed">
                            {error}
                        </div>
                    </div>
                    
                    {/* Retry Button */}
                    <button 
                        onClick={handleRetry}
                        className="self-end flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 rounded-lg transition-colors border border-rose-500/20"
                    >
                        <RefreshCw size={12} /> Retry Analysis
                    </button>
                 </div>
               </div>
            )}

            {/* Feature Pills */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { title: 'Global Coverage', desc: 'US, India, Europe & Crypto', icon: '🌍' },
                { title: 'Probability Models', desc: 'Bull/Bear/Base scenarios', icon: '🎯' },
                { title: 'Macro Context', desc: 'Inflation, RBI/Fed Policy', icon: '🏦' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/30 transition-colors text-left">
                   <div className="text-2xl mb-3">{f.icon}</div>
                   <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
                   <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-xs text-slate-600 font-mono">
              POWERED BY GEMINI 2.5 FLASH • REAL-TIME GROUNDING
            </div>
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default App;