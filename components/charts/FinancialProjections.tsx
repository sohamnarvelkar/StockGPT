
import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { PredictionScenario } from '../../types';
import { Activity, BarChart3, TrendingUp, PieChart, Target, Layers } from 'lucide-react';

interface Props {
  forecasts: {
    "1M": PredictionScenario[];
    "6M": PredictionScenario[];
    "12M": PredictionScenario[];
  };
  currentPrice: number;
  currency: string;
}

type ChartType = 'trend' | 'levels' | 'cone' | 'composed' | 'risk' | 'radar';

const FinancialProjections: React.FC<Props> = ({ forecasts, currentPrice, currency }) => {
  const [chartType, setChartType] = useState<ChartType>('trend');

  const getPrice = (scenarios: PredictionScenario[], caseName: string) => {
    return scenarios.find(s => s.caseName === caseName)?.targetPrice || currentPrice;
  };

  const timeSeriesData = [
    { name: 'Now', Bull: currentPrice, Base: currentPrice, Bear: currentPrice },
    { name: '1M', Bull: getPrice(forecasts['1M'], 'Bull'), Base: getPrice(forecasts['1M'], 'Base'), Bear: getPrice(forecasts['1M'], 'Bear') },
    { name: '6M', Bull: getPrice(forecasts['6M'], 'Bull'), Base: getPrice(forecasts['6M'], 'Base'), Bear: getPrice(forecasts['6M'], 'Bear') },
    { name: '12M', Bull: getPrice(forecasts['12M'], 'Bull'), Base: getPrice(forecasts['12M'], 'Base'), Bear: getPrice(forecasts['12M'], 'Bear') }
  ];

  const parseProb = (probStr: string) => parseInt(probStr.replace(/\D/g, ''), 10) || 0;

  const scatterData = [
    ...forecasts['1M'].map(s => ({ timeframe: '1M', type: s.caseName, prob: parseProb(s.probability), return: ((s.targetPrice - currentPrice) / currentPrice) * 100, price: s.targetPrice })),
    ...forecasts['6M'].map(s => ({ timeframe: '6M', type: s.caseName, prob: parseProb(s.probability), return: ((s.targetPrice - currentPrice) / currentPrice) * 100, price: s.targetPrice })),
    ...forecasts['12M'].map(s => ({ timeframe: '12M', type: s.caseName, prob: parseProb(s.probability), return: ((s.targetPrice - currentPrice) / currentPrice) * 100, price: s.targetPrice })),
  ];

  const radarData = [
    { subject: '1M', Bull: getPrice(forecasts['1M'], 'Bull'), Base: getPrice(forecasts['1M'], 'Base'), Bear: getPrice(forecasts['1M'], 'Bear') },
    { subject: '6M', Bull: getPrice(forecasts['6M'], 'Bull'), Base: getPrice(forecasts['6M'], 'Base'), Bear: getPrice(forecasts['6M'], 'Bear') },
    { subject: '12M', Bull: getPrice(forecasts['12M'], 'Bull'), Base: getPrice(forecasts['12M'], 'Base'), Bear: getPrice(forecasts['12M'], 'Bear') },
  ];

  const commonTooltipStyle = { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px', padding: '10px' };
  const compactMargins = { top: 10, right: 10, left: -10, bottom: 0 };

  const renderChart = () => {
    switch (chartType) {
      case 'levels':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData} margin={compactMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 13}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 13}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={commonTooltipStyle} formatter={(val: any) => `${currency}${Number(val).toFixed(2)}`} />
              <Bar dataKey="Bear" fill="#f43f5e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Base" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Bull" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'cone':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={compactMargins}>
              <defs>
                <linearGradient id="colorBull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 13}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 13}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={commonTooltipStyle} formatter={(val: any) => `${currency}${Number(val).toFixed(2)}`} />
              <Area type="monotone" dataKey="Bull" stroke="#10b981" fillOpacity={1} fill="url(#colorBull)" />
              <Area type="monotone" dataKey="Base" stroke="#f59e0b" fill="transparent" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="Bear" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBear)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData} margin={compactMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 13}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 13}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={commonTooltipStyle} formatter={(val: any) => `${currency}${Number(val).toFixed(2)}`} />
              <Area type="monotone" dataKey="Bull" fill="#10b981" stroke="#10b981" fillOpacity={0.1} />
              <Bar dataKey="Base" barSize={15} fill="#f59e0b" />
              <Line type="monotone" dataKey="Bear" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'risk':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={compactMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="prob" name="Probability" unit="%" stroke="#94a3b8" domain={[0, 100]} tick={{fontSize: 13}} tickLine={false} axisLine={false} dy={10} />
              <YAxis type="number" dataKey="return" name="Potential Return" unit="%" stroke="#94a3b8" tick={{fontSize: 13}} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={commonTooltipStyle} />
              <Scatter name="Bull" data={scatterData.filter(d => d.type === 'Bull')} fill="#10b981" shape="circle" />
              <Scatter name="Base" data={scatterData.filter(d => d.type === 'Base')} fill="#f59e0b" shape="triangle" />
              <Scatter name="Bear" data={scatterData.filter(d => d.type === 'Bear')} fill="#f43f5e" shape="square" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13 }} />
              <PolarRadiusAxis angle={30} domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Bull" dataKey="Bull" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Base" dataKey="Base" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Radar name="Bear" dataKey="Bear" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              <Tooltip contentStyle={commonTooltipStyle} formatter={(val: any) => `${currency}${Number(val).toFixed(2)}`} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'trend':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={compactMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 13}} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 13}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={commonTooltipStyle} formatter={(val: any) => `${currency}${Number(val).toFixed(2)}`} />
              <Line type="monotone" dataKey="Bull" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Base" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Bear" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const chartOptions: { id: ChartType; label: string; icon: React.ReactNode }[] = [
    { id: 'trend', label: 'Trend', icon: <TrendingUp size={14} /> },
    { id: 'levels', label: 'Levels', icon: <BarChart3 size={14} /> },
    { id: 'cone', label: 'Cone', icon: <Layers size={14} /> },
    { id: 'composed', label: 'Combo', icon: <PieChart size={14} /> },
    { id: 'risk', label: 'Risk', icon: <Target size={14} /> },
    { id: 'radar', label: 'Radar', icon: <Activity size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <div>
          <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider leading-none">Forecast Models</h3>
        </div>
        <div className="flex flex-wrap bg-slate-800 rounded-lg p-0.5 gap-0.5 border border-slate-700">
          {chartOptions.map((opt) => (
            <button key={opt.id} onClick={() => setChartType(opt.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${chartType === opt.id ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`} title={opt.label}>
              {opt.icon} <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-[500px] font-sans bg-slate-900/30 rounded-lg border border-slate-800/50 p-4 relative">
        {renderChart()}
      </div>
    </div>
  );
};

export default FinancialProjections;
