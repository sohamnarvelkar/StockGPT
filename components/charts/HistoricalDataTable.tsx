
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Line, ComposedChart 
} from 'recharts';
import { Database, TrendingUp, BarChart2, Table as TableIcon } from 'lucide-react';

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
  sma20?: number;
  sma50?: number;
}

type ViewMode = 'price' | 'volume' | 'table';
type TimeRange = '1M' | '3M' | '6M' | '1Y';

const HistoricalDataTable: React.FC<Props> = ({ currentPrice, currency }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('price');
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  const fullData: MarketDay[] = useMemo(() => {
    const rows: MarketDay[] = [];
    let price = currentPrice;
    const today = new Date();
    const daysToGenerate = 365;
    
    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const volatility = 0.02;
        const trend = 0.0002;
        const dailyMove = (Math.random() - 0.5) * volatility + trend;
        const prevClose = price / (1 + dailyMove);
        const gap = (Math.random() - 0.5) * 0.005;
        const open = prevClose * (1 + gap);
        const range = Math.max(open, price);
        const high = range * (1 + Math.random() * 0.015);
        const low = Math.min(open, price) * (1 - Math.random() * 0.015);
        const volume = Math.floor(1000000 + Math.random() * 9000000);

        rows.push({
            date: date.toISOString().split('T')[0],
            open, high, low, close: price, volume, change: dailyMove * 100
        });
        price = prevClose;
    }

    const chronological = rows.reverse();
    return chronological.map((day, index, arr) => {
        let sma20, sma50;
        if (index >= 19) sma20 = arr.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20;
        if (index >= 49) sma50 = arr.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50;
        return { ...day, sma20, sma50 };
    });
  }, [currentPrice]);

  const filteredData = useMemo(() => {
    const totalDays = fullData.length;
    let daysToShow = totalDays;
    switch (timeRange) {
        case '1M': daysToShow = 22; break;
        case '3M': daysToShow = 66; break;
        case '6M': daysToShow = 130; break;
        case '1Y': default: daysToShow = totalDays; break;
    }
    return fullData.slice(totalDays - daysToShow);
  }, [fullData, timeRange]);

  const renderChart = () => {
    if (viewMode === 'volume') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 13}} tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 13}} axisLine={false} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding:'10px' }} />
                    <Bar dataKey="volume" fill="#0ea5e9" opacity={0.8} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 13}} tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 13}} axisLine={false} tickFormatter={(val) => `${currency}${val.toFixed(0)}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding:'10px' }} />
                <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: '13px' }} />
                <Area type="monotone" dataKey="close" name="Close" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={1.5} />
                {timeRange !== '1M' && <Line type="monotone" dataKey="sma20" name="SMA20" stroke="#fbbf24" dot={false} strokeWidth={1} />}
                {(timeRange === '6M' || timeRange === '1Y') && <Line type="monotone" dataKey="sma50" name="SMA50" stroke="#f43f5e" dot={false} strokeWidth={1} />}
            </ComposedChart>
        </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">Historical Trend</h3>
        </div>

        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button onClick={() => setViewMode('price')} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'price' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Chart</button>
            <button onClick={() => setViewMode('volume')} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'volume' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Vol</button>
            <button onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'table' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Data</button>
        </div>
      </div>

      <div className="flex-grow w-full min-h-[500px] bg-slate-900/40 rounded-lg border border-slate-700/50 p-2 relative">
         {viewMode !== 'table' && (
             <div className="absolute top-3 right-3 z-10 flex gap-0.5 bg-slate-800/80 backdrop-blur-sm p-0.5 rounded border border-slate-700">
                {(['1M', '3M', '6M', '1Y'] as TimeRange[]).map((range) => (
                    <button key={range} onClick={() => setTimeRange(range)} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${timeRange === range ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                        {range}
                    </button>
                ))}
             </div>
         )}

         {viewMode === 'table' ? (
             <div className="h-[500px] overflow-hidden rounded-lg">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-800 text-sm text-slate-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-left font-mono">Date</th><th className="p-3">Open</th><th className="p-3">High</th><th className="p-3">Low</th><th className="p-3">Close</th><th className="p-3">Vol</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm font-mono text-slate-300 divide-y divide-slate-800/50">
                        {[...fullData].reverse().map((row) => (
                            <tr key={row.date} className="hover:bg-slate-800/30">
                            <td className="p-3 text-left text-slate-400">{row.date}</td>
                            <td className="p-3">{currency}{row.open.toFixed(1)}</td>
                            <td className="p-3">{currency}{row.high.toFixed(1)}</td>
                            <td className="p-3">{currency}{row.low.toFixed(1)}</td>
                            <td className={`p-3 font-bold ${row.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{currency}{row.close.toFixed(1)}</td>
                            <td className="p-3 text-slate-500">{(row.volume/1000).toFixed(0)}k</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
             </div>
         ) : (
             <div className="h-[500px] w-full pt-4">
                 {renderChart()}
             </div>
         )}
      </div>
    </div>
  );
};

export default HistoricalDataTable;
