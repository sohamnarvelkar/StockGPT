
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PriceAlert } from '../types';

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

  // Load from local storage
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

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('stockgpt_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Request Notification Permission
  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const addAlert = (symbol: string, targetPrice: number, currentPrice: number) => {
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
    
    // Immediate feedback if permission granted
    if (permission === 'granted') {
       new Notification(`Alert Set: ${symbol}`, {
         body: `We'll notify you when ${symbol} goes ${condition === 'ABOVE' ? 'above' : 'below'} ${targetPrice}.`
       });
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // --- SIMULATED MONITORING LOOP ---
  // Since we don't have a real-time websocket, we will simulate price movement
  // for demonstration purposes to show the notification triggering.
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(currentAlerts => {
        let hasChanges = false;
        const updatedAlerts = currentAlerts.map(alert => {
          if (alert.status === 'TRIGGERED') return alert;

          // Simulate random price fluctuation (Random Walk)
          // Fluctuate between -1% and +1.5% of initial price per tick to eventually hit targets close by
          const volatility = 0.015; 
          const randomMove = (Math.random() * volatility * 2) - volatility;
          const simulatedCurrentPrice = alert.initialPrice * (1 + randomMove);

          // Check Condition
          let triggered = false;
          if (alert.condition === 'ABOVE' && simulatedCurrentPrice >= alert.targetPrice) triggered = true;
          if (alert.condition === 'BELOW' && simulatedCurrentPrice <= alert.targetPrice) triggered = true;

          if (triggered) {
             hasChanges = true;
             // Fire Notification
             if (Notification.permission === 'granted') {
                 new Notification(`Price Alert: ${alert.symbol}`, {
                     body: `Target Reached! ${alert.symbol} has crossed ${alert.targetPrice}`,
                     icon: '/favicon.ico' // fallback
                 });
             }
             return { ...alert, status: 'TRIGGERED' };
          }
          return alert;
        });

        return hasChanges ? updatedAlerts : currentAlerts;
      });
    }, 5000); // Check every 5 seconds

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
