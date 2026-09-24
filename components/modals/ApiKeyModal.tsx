import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { getApiKey } from '../../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existingKey = localStorage.getItem('custom_gemini_api_key') || '';
      setApiKey(existingKey);
      setIsSaved(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Please enter a valid Gemini API key.');
      return;
    }

    localStorage.setItem('custom_gemini_api_key', trimmed);
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setApiKey('');
    setIsSaved(false);
  };

  const activeKey = getApiKey();
  const isEnvConfigured = Boolean(activeKey && !localStorage.getItem('custom_gemini_api_key'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
            <Key size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Gemini API Key</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
              {isEnvConfigured ? 'Connected via Environment' : 'Client-Side Configuration'}
            </p>
          </div>
        </div>

        {isEnvConfigured && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-300">
              An API key is configured in your deployment environment variables.
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">
              Enter Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 text-white text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Saved securely in your browser's local storage.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 text-xs"
            >
              {isSaved ? <Check size={16} /> : <Key size={16} />}
              {isSaved ? 'Saved!' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            Get a free Gemini API Key <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
