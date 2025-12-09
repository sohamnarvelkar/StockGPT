import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.065 0 12 0 7.37 0 3.376 2.67 1.34 6.666l3.926 3.099z"/>
        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-3.916 3.047C3.326 21.275 7.314 24 12 24c3.2 0 5.867-1.053 7.71-2.828l-3.67-3.159z"/>
        <path fill="#4A90E2" d="M19.834 21.172C21.637 19.497 22.75 16.994 22.75 13.68c0-.99-.172-1.928-.465-2.812H12v5.068h6.29c-.31 1.52-1.123 2.766-2.25 3.79l3.794 3.446z"/>
        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.34 6.666A11.93 11.93 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
    </svg>
);

const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, signup, googleSignIn, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await googleSignIn();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'LOGIN' ? 'Sign in to access advanced market intelligence.' : 'Join StockGPT for pro-level analytics.'}
          </p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <div className="space-y-4">
            <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"/> : <GoogleIcon />}
                <span>Sign in with Google</span>
            </button>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'SIGNUP' && (
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            required
                        />
                    </div>
                )}
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isLoading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Create Account')}
                </button>
            </form>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
            {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
                {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
