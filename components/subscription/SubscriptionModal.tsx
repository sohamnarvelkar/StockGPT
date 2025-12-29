import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap, Shield, Crown, Lock, ShieldCheck, ExternalLink, RefreshCw, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionTier } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

const PayPalLogo = () => (
  <svg width="120" height="32" viewBox="0 0 443 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M112.5 12.3C105.1 4.5 93.6 0 80.5 0H21C18.2 0 15.8 1.9 15.2 4.6L0.2 99.4C-0.3 102.2 1.9 104.7 4.7 104.7H33.4C36.2 104.7 38.6 102.8 39.2 100.1L45 63.3L45.4 60.5C46 57.8 48.4 55.9 51.2 55.9H65.3C94.2 55.9 116.8 44.1 123.4 12.8C123.5 12.6 123.5 12.4 123.5 12.2C121 12.1 118.5 12.2 116 12.3C114.8 12.3 113.6 12.3 112.5 12.3Z" fill="#253B80"/>
    <path d="M123.4 12.8C116.8 44.1 94.2 55.9 65.3 55.9H51.2C48.4 55.9 46 57.8 45.4 60.5L45 63.3L33.7 114.7C33.1 117.4 35.2 120 38 120H63.4C66.2 120 68.6 118.1 69.2 115.4L69.3 114.7L76.1 71.3L76.5 68.5C77.1 65.8 79.5 63.9 82.3 63.9H89C117.9 63.9 140.5 52.1 147.1 20.8C148.9 12.4 147.8 5.4 143.8 0C140.1 7.2 133 11.7 123.4 12.8Z" fill="#179BD7"/>
    <path d="M138 12.8C131.4 44.1 108.8 55.9 79.9 55.9H65.8C63 55.9 60.6 57.8 60 60.5L48.3 114.7C47.7 117.4 49.8 120 52.6 120H78C80.8 120 83.2 118.1 83.8 115.4L90.7 71.3L91.1 68.5C91.7 65.8 94.1 63.9 96.9 63.9H103.6C132.5 63.9 155.1 52.1 161.7 20.8C163.7 11.3 162.2 3.6 157.4 0C155.1 7.5 148 11.7 138 12.8Z" fill="#222D65" opacity="0.1"/>
  </svg>
);

const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose, isMandatory = false }) => {
  const { user, updateSubscription, isLoading, logout } = useAuth();
  const [step, setStep] = useState<'PLANS' | 'CHECKOUT'>('PLANS');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setStep('PLANS');
        setIsAuthorizing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'STARTER' as SubscriptionTier,
      name: 'Starter',
      price: '$9',
      period: '/month',
      icon: Zap,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      features: ['Unlimited basic analysis', '5 Active Price Alerts', 'Standard AI processing', 'Mobile App Access'],
    },
    {
      id: 'PRO' as SubscriptionTier,
      name: 'Pro',
      price: '$19',
      period: '/month',
      icon: Shield,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      popular: true,
      features: ['Deep-Dive Analysis', 'Comparison Tools', '50 Active Price Alerts', 'PDF Exporting', 'Priority Processing'],
    },
    {
      id: 'LIFETIME' as SubscriptionTier,
      name: 'Lifetime',
      price: '$49',
      period: 'once',
      icon: Crown,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      features: ['All Pro Features', 'Early Access Models', 'No Recurring Fees', 'Priority Support', 'Exclusive Indicators'],
    }
  ];

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setStep('CHECKOUT');
  };

  const handlePayPalCheckout = async () => {
    if (!selectedTier) return;
    
    setIsAuthorizing(true);
    // Simulate PayPal external login window / authorization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await updateSubscription(selectedTier, 'PAYID-' + Math.random().toString(36).substr(2, 12).toUpperCase());
    // Close modal after success
    onClose();
  };

  const selectedPlanData = plans.find(p => p.id === selectedTier);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" 
        onClick={() => !isMandatory && onClose()} 
      />
      
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
        
        {!isMandatory ? (
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        ) : (
          <button 
            onClick={() => { logout(); onClose(); }} 
            className="absolute top-6 right-6 text-slate-500 hover:text-rose-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}

        {step === 'PLANS' ? (
          <>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                  <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                      Membership Options
                  </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Unlock Institutional Access</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {isMandatory 
                  ? "Select a plan to complete your enrollment and access the StockGPT analysis suite." 
                  : "Upgrade your account to access deep-dive metrics and institutional signals."
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col p-8 rounded-2xl glass-panel border ${plan.popular ? 'border-cyan-500/50 ring-1 ring-cyan-500/20 bg-cyan-500/5' : plan.borderColor} transition-all hover:translate-y-[-4px]`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-cyan-900/40">
                      <Sparkles size={12} /> Pro Recommended
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <plan.icon className={`${plan.color} mb-4`} size={32} />
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-slate-500 font-medium">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={user?.tier === plan.id}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      user?.tier === plan.id 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : plan.popular 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {user?.tier === plan.id ? 'Current Plan' : 'Select ' + plan.name}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
                    <Lock size={12} /> Secure 256-bit encrypted checkout via PayPal
                </p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-6 max-w-4xl mx-auto">
            {/* Summary Side */}
            <div>
                <button 
                    onClick={() => setStep('PLANS')} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <RefreshCw size={14} className="rotate-180" /> Change Plan
                </button>
                <div className="mb-8">
                    <span className="text-[#0070ba] text-xs font-bold uppercase tracking-widest mb-2 block">Checkout with PayPal</span>
                    <h2 className="text-4xl font-bold text-white mb-4">Finalize your upgrade</h2>
                    <p className="text-slate-400 leading-relaxed">Secure, encrypted, and trusted by millions. Access StockGPT {selectedPlanData?.name} instantly upon completion.</p>
                </div>

                <div className="space-y-4 bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{selectedPlanData?.name} Membership</span>
                        <span className="text-white font-bold">{selectedPlanData?.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Tax / Processing</span>
                        <span className="text-slate-500">$0.00</span>
                    </div>
                    <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Total Amount</span>
                        <span className="text-2xl font-bold text-[#0070ba]">{selectedPlanData?.price}</span>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500"/> Buyer Protection</div>
                    <div className="flex items-center gap-1.5"><Lock size={14} /> SSL Secured</div>
                </div>
            </div>

            {/* PayPal Button Side */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <PayPalLogo />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Safe • Simple • Instant</p>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handlePayPalCheckout}
                        disabled={isLoading || isAuthorizing}
                        className="w-full bg-[#ffc439] hover:bg-[#f2ba36] text-[#2c2e2f] py-4 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                    >
                        {isAuthorizing ? (
                            <RefreshCw size={24} className="animate-spin text-[#253b80]" />
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="italic font-extrabold text-[#253b80]">Pay</span>
                                <span className="italic font-extrabold text-[#179bd7]">Pal</span>
                            </div>
                        )}
                    </button>
                    
                    <button 
                        onClick={handlePayPalCheckout}
                        disabled={isLoading || isAuthorizing}
                        className="w-full bg-[#2c2e2f] hover:bg-[#1a1b1c] text-white py-4 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                    >
                        <CreditCard size={20} className="mr-1" /> Debit or Credit Card
                    </button>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                            <span>Trusted Global Networks</span>
                            <div className="flex gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2 opacity-30 grayscale" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3 opacity-30 grayscale" alt="Mastercard" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center italic opacity-80">
                            StockGPT uses industry-standard 256-bit SSL encryption. We never store your payment details.
                        </p>
                    </div>
                </div>

                {isAuthorizing && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Awaiting PayPal Authorization...</span>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;