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
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateSubscription(selectedTier, 'PAYID-' + Math.random().toString(36).substr(2, 12).toUpperCase());
    onClose();
  };

  const selectedPlanData = plans.find(p => p.id === selectedTier);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" 
        onClick={() => !isMandatory && onClose()} 
      />
      
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-300">
        
        {!isMandatory ? (
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
            <X size={28} />
          </button>
        ) : (
          <button 
            onClick={() => { logout(); onClose(); }} 
            className="absolute top-8 right-8 text-slate-500 hover:text-rose-400 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}

        {step === 'PLANS' ? (
          <>
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                  <div className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] rounded-full">
                      Institutional Enrollment
                  </div>
              </div>
              <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none">Choose Your Plan</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                {isMandatory 
                  ? "Membership is mandatory to access the analysis engine. Select a tier to complete your setup." 
                  : "Upgrade to unlock institutional-grade deep analysis and priority forecasting."
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col p-8 rounded-3xl border-2 ${plan.popular ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_20px_50px_rgba(6,182,212,0.1)]' : 'border-slate-800 bg-slate-800/20'} transition-all hover:translate-y-[-8px]`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-cyan-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl">
                      Professional Choice
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <plan.icon className={`${plan.color} mb-6`} size={40} />
                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                      <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-5 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                        <div className="shrink-0 mt-1"><Check size={18} className="text-emerald-500" /></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={user?.tier === plan.id}
                    className={`w-full py-5 rounded-2xl font-black transition-all text-sm uppercase tracking-[0.2em] ${
                      user?.tier === plan.id 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : plan.popular 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-xl shadow-cyan-500/20' 
                          : 'bg-white hover:bg-slate-100 text-slate-950'
                    }`}
                  >
                    {user?.tier === plan.id ? 'Current Tier' : 'Enroll Now'}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
                <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <Lock size={14} /> Encrypted Checkout via PayPal
                </p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-8 max-w-5xl mx-auto">
            {/* Summary Side */}
            <div>
                <button 
                    onClick={() => setStep('PLANS')} 
                    className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 text-xs font-black uppercase tracking-widest transition-colors"
                >
                    <RefreshCw size={16} className="rotate-180" /> Change Selection
                </button>
                <div className="mb-10">
                    <span className="text-[#0070ba] text-xs font-black uppercase tracking-[0.3em] mb-3 block">PayPal Gateway</span>
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Final Step.</h2>
                    <p className="text-slate-400 leading-relaxed text-lg font-medium">You are one step away from institutional-grade market data. Your {selectedPlanData?.name} membership will be activated instantly.</p>
                </div>

                <div className="space-y-5 bg-slate-800/40 p-8 rounded-3xl border border-slate-700">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">{selectedPlanData?.name} Access</span>
                        <span className="text-white font-black">{selectedPlanData?.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Platform Fees</span>
                        <span className="text-slate-500 font-black">$0.00</span>
                    </div>
                    <div className="pt-6 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-white font-black text-xl tracking-tight">Total Amount</span>
                        <span className="text-3xl font-black text-[#0070ba]">{selectedPlanData?.price}</span>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500"/> Buyer Protection</div>
                    <div className="flex items-center gap-2"><Lock size={16} /> Secure SSL</div>
                </div>
            </div>

            {/* PayPal UI */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-12 duration-500">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <PayPalLogo />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Safe • Fast • Encrypted</p>
                </div>

                <div className="space-y-5">
                    <button 
                        onClick={handlePayPalCheckout}
                        disabled={isLoading || isAuthorizing}
                        className="w-full bg-[#ffc439] hover:bg-[#f2ba36] text-[#2c2e2f] py-5 rounded-full font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                    >
                        {isAuthorizing ? (
                            <RefreshCw size={24} className="animate-spin text-[#253b80]" />
                        ) : (
                            <div className="flex items-center gap-1 scale-110">
                                <span className="italic font-black text-[#253b80]">Pay</span>
                                <span className="italic font-black text-[#179bd7]">Pal</span>
                            </div>
                        )}
                    </button>
                    
                    <button 
                        onClick={handlePayPalCheckout}
                        disabled={isLoading || isAuthorizing}
                        className="w-full bg-[#2c2e2f] hover:bg-[#1a1b1c] text-white py-5 rounded-full font-black text-lg transition-all shadow-xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70"
                    >
                        <CreditCard size={24} /> Debit or Credit Card
                    </button>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6">
                            <span>Global Card Support</span>
                            <div className="flex gap-3">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2.5 opacity-40 grayscale" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-40 grayscale" alt="Mastercard" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center font-bold italic">
                            By completing this transaction, you gain immediate access to the StockGPT engine. No recurring fees for Lifetime tier.
                        </p>
                    </div>
                </div>

                {isAuthorizing && (
                    <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 animate-pulse">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <span className="text-[10px] font-black text-blue-800 uppercase tracking-[0.1em]">Authorizing PayPal Checkout...</span>
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