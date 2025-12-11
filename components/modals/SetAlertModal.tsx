
import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

const SetAlertModal: React.FC<Props> = ({ isOpen, onClose, symbol, currentPrice }) => {
  const [targetPrice, setTargetPrice] = useState<string>(currentPrice.toString());
  const { addAlert, requestPermission, permission } = useAlerts();

  useEffect(() => {
    setTargetPrice(currentPrice.toString());
  }, [currentPrice, isOpen]);

  if (!isOpen) return null;

  const target = parseFloat(targetPrice);
  const condition = target > currentPrice ? 'ABOVE' : 'BELOW';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(target)) return;

    if (permission === 'default') {
        await requestPermission();
    }
    
    addAlert(symbol, target, currentPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Bell size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Set Price Alert</h2>
                <p className="text-slate-400 text-xs">Notify me when {symbol} reaches...</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Target Price</label>
                <div className="relative">
                    <input 
                        type="number" 
                        step="0.01"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-lg font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded bg-slate-700 text-slate-300">
                        Current: {currentPrice.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Condition Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                {condition === 'ABOVE' ? <TrendingUp size={20} className="text-emerald-400"/> : <TrendingDown size={20} className="text-rose-400"/>}
                <div className="text-sm text-slate-300">
                    Alert when price goes <span className={condition === 'ABOVE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{condition === 'ABOVE' ? 'ABOVE' : 'BELOW'}</span> the target.
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
            >
                <Bell size={18} />
                Create Alert
            </button>
        </form>
        
        {permission === 'default' && (
            <p className="mt-4 text-[10px] text-center text-slate-500">
                You will be asked to allow browser notifications.
            </p>
        )}
      </div>
    </div>
  );
};

export default SetAlertModal;
