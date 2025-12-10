import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PredictionScenario } from '../../types';

interface Props {
  forecasts: {
    "1M": PredictionScenario[];
    "6M": PredictionScenario[];
    "12M": PredictionScenario[];
  };
  currentPrice: number;
  currency: string;
}

const ForecastTrendChart: React.FC<Props> = ({ forecasts, currentPrice, currency }) => {
  // Helper to extract target price for a specific case (Bull/Base/Bear) from a scenario list
  const getPrice = (scenarios: PredictionScenario[], caseName: string) => {
    return scenarios.find(s => s.caseName === caseName)?.targetPrice || currentPrice;
  };

  const data = [
    {
      name: 'Now',
      Bull: currentPrice,
      Base: currentPrice,
      Bear: currentPrice
    },
    {
      name: '1M',
      Bull: getPrice(forecasts['1M'], 'Bull'),
      Base: getPrice(forecasts['1M'], 'Base'),
      Bear: getPrice(forecasts['1M'], 'Bear')
    },
    {
      name: '6M',
      Bull: getPrice(forecasts['6M'], 'Bull'),
      Base: getPrice(forecasts['6M'], 'Base'),
      Bear: getPrice(forecasts['6M'], 'Bear')
    },
    {
      name: '12M',
      Bull: getPrice(forecasts['12M'], 'Bull'),
      Base: getPrice(forecasts['12M'], 'Base'),
      Bear: getPrice(forecasts['12M'], 'Bear')
    }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-4">
        <h3 className="text-cyan-400 font-mono text-sm">PROJECTED TRAJECTORY</h3>
        <span className="text-xs text-slate-500">Timeline Forecast (Bull vs Base vs Bear)</span>
      </div>

      <div className="w-full h-64 font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value: any) => [`${currency}${value}`, 'Target']}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            {/* Bull Case - Green */}
            <Line 
                type="monotone" 
                dataKey="Bull" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
            />
            
            {/* Base Case - Amber */}
            <Line 
                type="monotone" 
                dataKey="Base" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
            />
            
            {/* Bear Case - Rose */}
            <Line 
                type="monotone" 
                dataKey="Bear" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f43f5e' }}
                activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastTrendChart;