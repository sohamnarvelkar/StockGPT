
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PriceAlert, User } from '../types';
import { useAuth } from './AuthContext';

interface AlertContextType {
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, currentPrice: number) => void;
  removeAlert: (id: string) => void;
  requestPermission: () => Promise<void>;
  permission: NotificationPermission;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('stockgpt_alerts');
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse alerts");
      }
    }

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stockgpt_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const addAlert = (symbol: string, targetPrice: number, currentPrice: number) => {
    if (!user) return;

    // Enforce limits strictly based on plan
    const alertLimit = user.tier === 'STARTER' ? 5 : (user.tier === 'PRO' || user.tier === 'LIFETIME') ? 50 : 0;
    
    if (alerts.length >= alertLimit) {
      throw new Error(`Your ${user.tier} plan is limited to ${alertLimit} active alerts. Upgrade to create more.`);
    }

    const condition = targetPrice > currentPrice ? 'ABOVE' : 'BELOW';
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      targetPrice,
      initialPrice: currentPrice,
      condition,
      status: 'ACTIVE',
      createdAt: Date.now()
    };
    setAlerts(prev => [newAlert, ...prev]);
    
    if (permission === 'granted') {
       new Notification(`Alert Set: ${symbol}`, {
         body: `We'll notify you when ${symbol} goes ${condition === 'ABOVE' ? 'above' : 'below'} ${targetPrice}.`
       });
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(currentAlerts => {
        let hasChanges = false;
        const updatedAlerts = currentAlerts.map(alert => {
          if (alert.status === 'TRIGGERED') return alert;
          const volatility = 0.015; 
          const randomMove = (Math.random() * volatility * 2) - volatility;
          const simulatedCurrentPrice = alert.initialPrice * (1 + randomMove);

          let triggered = false;
          if (alert.condition === 'ABOVE' && simulatedCurrentPrice >= alert.targetPrice) triggered = true;
          if (alert.condition === 'BELOW' && simulatedCurrentPrice <= alert.targetPrice) triggered = true;

          if (triggered) {
             hasChanges = true;
             if (Notification.permission === 'granted') {
                 new Notification(`Price Alert: ${alert.symbol}`, {
                     body: `Target Reached! ${alert.symbol} has crossed ${alert.targetPrice}`,
                 });
             }
             return { ...alert, status: 'TRIGGERED' as const };
          }
          return alert;
        });
        return hasChanges ? updatedAlerts : currentAlerts;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, requestPermission, permission }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
