import React from 'react';
import { StockGPTResponse, KeyMetrics } from '../types';
import SignalBadge from './ui/SignalBadge';
import SentimentGauge from './charts/SentimentGauge';
import PortfolioPie from './charts/PortfolioPie';
import FinancialProjections from './charts/FinancialProjections';
import { PieChart as PieChartIcon } from 'lucide-react';

// Colors matching the PortfolioPie chart
const PIE_COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f43f5e', '#8b5cf6', '#ec4899'];

interface Props {
  data: StockGPTResponse;
  currencySymbol: string;
}

const AnalysisOverview: React.FC<Props> = ({ data, currencySymbol }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <SignalBadge signal={data.signal} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Executive Summary */}
            <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-cyan-400 font-mono text-sm font-bold mb-2 leading-none">EXECUTIVE SUMMARY</h3>
                <p className="text-slate-200 leading-normal text-base">{data.summary}</p>
            </div>

            {/* Allocation Graph */}
            {data.portfolioAllocation && data.portfolioAllocation.length > 0 ? (
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChartIcon size={18} className="text-cyan-400" />
                        <h3 className="text-cyan-400 font-mono text-sm font-bold">OPTIMIZED ALLOCATION</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-1/2 min-w-0">
                            <PortfolioPie data={data.portfolioAllocation} />
                        </div>
                        <div className="w-full sm:w-1/2 space-y-2">
                            {data.portfolioAllocation.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                    <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }} className="font-bold">{item.asset}</span>
                                    <span className="text-slate-200 font-mono">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-4 rounded-xl flex flex-col justify-center">
                    <SentimentGauge score={data.signal.confidenceScore} recommendation={data.signal.recommendation} />
                </div>
            )}
        </div>

        {/* Forecast Models Graph */}
        <div className="glass-panel p-4 rounded-xl">
            {data.forecasts ? (
                <FinancialProjections forecasts={data.forecasts} currentPrice={data.currentPrice || 0} currency={currencySymbol} />
            ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-base">No forecast data available</div>
            )}
        </div>
    </div>
  );
};

export default AnalysisOverview;