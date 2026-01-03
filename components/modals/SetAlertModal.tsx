import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

const SetAlertModal: React.FC<Props> = ({ isOpen, onClose, symbol, currentPrice }) => {
  const [targetPrice, setTargetPrice] = useState<string>(currentPrice.toString());

  useEffect(() => {
    setTargetPrice(currentPrice.toString());
  }, [currentPrice, isOpen]);

  if (!isOpen) return null;

  const target = parseFloat(targetPrice);
  const condition = target > currentPrice ? 'ABOVE' : 'BELOW';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified confirmation since global context monitors are removed
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>

        <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400"><Bell size={32} /></div>
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Set Alert</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Institutional Monitoring</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Target Price</label>
                <div className="relative">
                    <input 
                        type="number" 
                        step="0.01"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 px-5 text-white text-xl font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                        required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black px-2 py-1 rounded bg-slate-700 text-slate-300 uppercase tracking-widest">
                        Live: {currentPrice.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                {condition === 'ABOVE' ? <TrendingUp size={24} className="text-emerald-400"/> : <TrendingDown size={24} className="text-rose-400"/>}
                <div className="text-xs font-bold text-slate-300">
                    Notify when {symbol} is <span className={condition === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400'}>{condition === 'ABOVE' ? 'ABOVE' : 'BELOW'}</span>.
                </div>
            </div>

            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2">
                <Bell size={20} /> Create Monitor
            </button>
        </form>
      </div>
    </div>
  );
};

export default SetAlertModal;