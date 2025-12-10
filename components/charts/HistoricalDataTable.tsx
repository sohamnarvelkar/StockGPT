import React, { useMemo } from 'react';
import { Calendar, ArrowUp, ArrowDown, Database } from 'lucide-react';

interface Props {
  currentPrice: number;
  currency: string;
}

interface MarketDay {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
}

const HistoricalDataTable: React.FC<Props> = ({ currentPrice, currency }) => {
  // Generate simulated historical data
  const data: MarketDay[] = useMemo(() => {
    const rows: MarketDay[] = [];
    let price = currentPrice;
    const today = new Date();
    
    // Generate data for past year (~252 trading days)
    // We iterate backwards from today
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Random walk simulation parameters
        // Volatility factor (2% daily standard deviation approx)
        const volatility = 0.02;
        const trend = 0.0002; // Slight upward drift long term usually

        // The price at this step is the 'Close' for this day
        // To get the 'Previous Close' (which would be tomorrow's price in our backward loop),
        // we reverse the calculation.
        // However, it's easier to just simulate a daily change relative to the *next* day in the past.
        
        // Let's define the movement that happened *to get to* this price from yesterday.
        const dailyMove = (Math.random() - 0.5) * volatility + trend;
        
        // So YesterdayClose * (1 + dailyMove) = CurrentClose
        // YesterdayClose = CurrentClose / (1 + dailyMove)
        const prevClose = price / (1 + dailyMove);
        
        // For the current row (Today):
        // Open is usually close to yesterday's close, maybe a gap
        const gap = (Math.random() - 0.5) * 0.005;
        const open = prevClose * (1 + gap);
        
        const close = price;
        
        // High/Low relative to Open/Close
        const range = Math.max(open, close);
        const high = range * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        // Volume: Random between 1M and 10M
        const volume = Math.floor(1000000 + Math.random() * 9000000);

        rows.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
            change: dailyMove * 100
        });

        // Update price for next iteration (going backwards in time)
        price = prevClose;
    }
    return rows;
  }, [currentPrice]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-2">
        <Database size={16} className="text-cyan-400" />
        <div>
            <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Historical Data</h3>
            <span className="text-[10px] text-slate-500">Last 1 Year (Simulated)</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-800 text-xs text-slate-400 font-medium sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left font-mono">Date</th>
                <th className="p-3">Open</th>
                <th className="p-3">High</th>
                <th className="p-3">Low</th>
                <th className="p-3">Close</th>
                <th className="p-3">Volume</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono text-slate-300 divide-y divide-slate-800/50">
              {data.map((row) => (
                <tr key={row.date} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-left text-slate-400">{row.date}</td>
                  <td className="p-3">{currency}{row.open.toFixed(2)}</td>
                  <td className="p-3">{currency}{row.high.toFixed(2)}</td>
                  <td className="p-3">{currency}{row.low.toFixed(2)}</td>
                  <td className={`p-3 font-bold ${row.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currency}{row.close.toFixed(2)}
                  </td>
                  <td className="p-3 text-slate-500">{row.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataTable;