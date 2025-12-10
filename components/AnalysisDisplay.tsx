import React, { useState } from 'react';
import { StockGPTResponse } from '../types';
import SignalBadge from './ui/SignalBadge';
import ScenarioChart from './charts/ScenarioChart';
import FinancialProjections from './charts/FinancialProjections';
import SentimentGauge from './charts/SentimentGauge';
import PortfolioPie from './charts/PortfolioPie';
import HistoricalDataTable from './charts/HistoricalDataTable';
import { Download, FileText, Share2, Printer, Check, Copy, TrendingUp, Anchor, Activity, Globe, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Bookmark } from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
}

// Declare html2pdf for TypeScript since we loaded it via script tag
declare const html2pdf: any;

const ExternalLinkIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const AnalysisDisplay: React.FC<Props> = ({ data, onReset }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [shareStatus, setShareStatus] = useState<'IDLE' | 'COPIED'>('IDLE');
  const [isSaved, setIsSaved] = useState(false);
  const currencySymbol = data.currency || '$';

  // Extract the Macro/Global section to display it prominently
  const macroSection = data.sections.find(s => 
    s.title.toLowerCase().includes('macro') || 
    s.title.toLowerCase().includes('global market')
  );
  
  // Remaining sections
  const otherSections = data.sections.filter(s => s !== macroSection);

  // --- Helper for Sentiment Colors ---
  const getSentimentStyle = (sentiment: string | undefined) => {
    if (!sentiment) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    const s = sentiment.toLowerCase();
    if (s === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'negative') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  // --- Export Logic ---

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('analysis-container');
    
    // Config for html2pdf
    const opt = {
      margin: 0.2,
      filename: `StockGPT_${data.symbol}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Use the global html2pdf library
    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      });
    } else {
      console.error("html2pdf library not found");
      setIsExporting(false);
    }
  };

  const handleExportDOC = () => {
    // Generate a clean HTML structure for Word
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${data.symbol} Report</title>
    <style>body{font-family: Arial, sans-serif;} h1{color:#1e3a8a;} h2{color:#2563eb;} .section{margin-bottom:20px;}</style>
    </head><body>`;
    
    let content = `
      <h1>${data.symbol} - ${data.companyName}</h1>
      <p><strong>Price:</strong> ${currencySymbol}${data.currentPrice?.toFixed(2) || 'N/A'}</p>
      <p><strong>Recommendation:</strong> ${data.signal.recommendation} (${data.signal.confidenceScore}% Confidence)</p>
      <hr/>
      <h2>Executive Summary</h2>
      <p>${data.summary}</p>
      <hr/>
    `;

    // Add Scenarios Text
    content += `<h2>Probability Scenarios</h2><ul>`;
    data.scenarios.forEach(s => {
      content += `<li><strong>${s.caseName} (${s.probability}):</strong> ${s.priceRange} - ${s.description}</li>`;
    });
    content += `</ul>`;

    // Add Sections
    data.sections.forEach(s => {
      content += `<h2>${s.title}</h2><div class="section">${s.content.replace(/\n/g, '<br/>')}</div>`;
    });

    const footer = "</body></html>";
    const fullHtml = header + content + footer;

    // Create Blob
    const blob = new Blob(['\ufeff', fullHtml], {
      type: 'application/msword'
    });

    // Create Download Link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockGPT_${data.symbol}_Report.doc`; // .doc opens in Word with HTML content
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareText = `StockGPT Intelligence: ${data.symbol} (${data.companyName})
Signal: ${data.signal.recommendation} (${data.signal.confidenceScore}% Confidence)
Price: ${currencySymbol}${data.currentPrice?.toFixed(2) || 'N/A'}

${data.summary}

View full analysis:`;

    const shareData = {
      title: `StockGPT Analysis: ${data.symbol}`,
      text: shareText,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback to Clipboard with just text and URL
      const clipboardText = `${shareText} ${window.location.href}`;
      navigator.clipboard.writeText(clipboardText);
      setShareStatus('COPIED');
      setTimeout(() => setShareStatus('IDLE'), 2000);
    }
  };

  const handleSave = () => {
    try {
      const saveKey = 'stockgpt_saved_analyses';
      const timestamp = new Date().toISOString();
      const newEntry = {
        id: `${data.symbol}_${Date.now()}`,
        symbol: data.symbol,
        companyName: data.companyName,
        timestamp,
        data: data
      };

      const existingRaw = localStorage.getItem(saveKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Prevent exact duplicates within a short timeframe if desired, or just append
      // We'll prepend to keep newest first and limit to 50 items
      const updated = [newEntry, ...existing].slice(0, 50);
      
      localStorage.setItem(saveKey, JSON.stringify(updated));
      setIsSaved(true);
      
      // Reset "Saved" state after 2 seconds for feedback
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save analysis", e);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 pb-4 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{data.symbol}</h1>
            <span className="px-2 py-0.5 bg-slate-700 rounded-full text-[10px] font-mono text-slate-300">
              STOCKGPT
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">{data.companyName}</p>
          {data.currentPrice && data.currentPrice > 0 && (
            <p className="text-xl font-mono text-cyan-400 mt-1">
              {currencySymbol}{data.currentPrice.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
                {/* Save Analysis Button */}
                <button 
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                        isSaved 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                        : 'text-slate-300 bg-slate-800/50 hover:bg-slate-700 border-slate-700'
                    }`}
                    title="Save Analysis to Local Storage"
                >
                    {isSaved ? <Check size={12} /> : <Bookmark size={12} />}
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {/* Export Tools */}
                <button 
                    onClick={handleExportPDF} 
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
                    title="Save as PDF"
                >
                    {isExporting ? <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"/> : <Printer size={12} />}
                    <span className="hidden sm:inline">PDF</span>
                </button>
                
                <button 
                    onClick={handleExportDOC}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    title="Save as Word"
                >
                    <FileText size={12} />
                    <span className="hidden sm:inline">DOC</span>
                </button>

                <button 
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 min-w-[70px] justify-center"
                    title="Share Analysis"
                >
                    {shareStatus === 'COPIED' ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                    <span className="hidden sm:inline">{shareStatus === 'COPIED' ? 'Copied' : 'Share'}</span>
                </button>
            </div>

            <button
            onClick={onReset}
            className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
            >
            New Analysis
            </button>
        </div>
      </div>

      {/* Main Content ID for PDF Generation */}
      <div id="analysis-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Signal & Key Stats */}
            <div className="space-y-3">
            <SignalBadge signal={data.signal} />
            
            {/* Summary Card */}
            <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-cyan-400 font-mono text-xs mb-2">EXECUTIVE SUMMARY</h3>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {data.summary}
                </p>
            </div>

            {/* Portfolio Allocation (If available) */}
            {data.portfolioAllocation && data.portfolioAllocation.length > 0 && (
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChartIcon size={14} className="text-cyan-400" />
                        <h3 className="text-cyan-400 font-mono text-xs">OPTIMIZED ALLOCATION</h3>
                    </div>
                    <PortfolioPie data={data.portfolioAllocation} />
                </div>
            )}
            
            {/* Sentiment Gauge (If not portfolio) */}
            {!data.portfolioAllocation && (
                <div className="glass-panel p-4 rounded-xl flex flex-col justify-center">
                    <SentimentGauge 
                        score={data.signal.confidenceScore} 
                        recommendation={data.signal.recommendation}
                    />
                </div>
            )}
            </div>

            {/* Center/Right: Deep Dive & Scenarios */}
            <div className="lg:col-span-2 space-y-3">
            
            {/* --- VISUAL INTELLIGENCE GRID --- */}
            {/* Financial Projections Component - Compact Padding */}
            <div className="glass-panel p-4 rounded-xl">
               {data.forecasts ? (
                  <FinancialProjections
                    forecasts={data.forecasts}
                    currentPrice={data.currentPrice || 0}
                    currency={currencySymbol}
                  />
               ) : (
                  <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
                      Detailed forecast data unavailable
                  </div>
               )}
            </div>

            {/* Scenario Bar Chart */}
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-cyan-400" />
                    <h3 className="text-cyan-400 font-mono text-xs">PRICE TARGET DISTRIBUTION</h3>
                </div>
                <ScenarioChart 
                    scenarios={data.scenarios} 
                    forecasts={data.forecasts}
                    currentPrice={data.currentPrice || 0} 
                    currency={currencySymbol} 
                />
            </div>

             {/* Historical Data Table */}
             <div className="glass-panel p-4 rounded-xl">
                <HistoricalDataTable 
                    currentPrice={data.currentPrice || 0} 
                    currency={currencySymbol}
                />
            </div>

            {/* Global Market & Macro Analysis Section */}
            {macroSection && (
                <div className="rounded-xl border-2 border-dashed border-indigo-500/40 bg-slate-900/60 p-5 relative overflow-hidden shadow-xl shadow-indigo-900/10">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                {/* Decorative Background Icon */}
                <div className="absolute -right-6 -top-6 opacity-[0.07] transform rotate-12 pointer-events-none" data-html2canvas-ignore>
                    <Globe size={180} className="text-indigo-400" />
                </div>

                <div className="relative z-10 pl-2">
                    <div className="flex items-center gap-3 mb-4 border-b border-indigo-500/20 pb-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shadow-inner ring-1 ring-indigo-500/40">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                {macroSection.title}
                            </h3>
                            <p className="text-[10px] text-indigo-300/80 font-mono uppercase tracking-wider mt-0.5">
                                MACRO-ECONOMIC DRIVERS
                            </p>
                        </div>
                    </div>
                    
                    {/* Macro Indicators Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { label: "Interest Rates", icon: <TrendingUp size={10} /> },
                        { label: "Inflation", icon: <Activity size={10} /> },
                        { label: "Central Banks", icon: <Anchor size={10} /> },
                        { label: "Geopolitics", icon: <Globe size={10} /> }
                    ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-1 rounded-md uppercase tracking-wider">
                            {badge.icon}
                            {badge.label}
                        </div>
                    ))}
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-1">
                    {macroSection.content.split('\n').map((line, i) => {
                        // Headings
                        if (line.trim().startsWith('###')) {
                        return <h4 key={i} className="text-indigo-200 mt-4 mb-2 font-semibold text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>{line.replace(/^###\s*/, '')}</h4>;
                        }
                        if (line.trim().startsWith('**')) {
                        // Handle bold lines that are just headers
                        return <strong key={i} className="block text-indigo-100 mt-3 mb-1 text-xs sm:text-sm">{line.replace(/\*\*/g, '')}</strong>;
                        }
                        // List items
                        if (line.trim().startsWith('-') || line.trim().startsWith('* ')) {
                        const content = line.replace(/^[-*]\s*/, '');
                        // Check for internal bolding in list items
                        const parts = content.split('**');
                        return (
                            <div key={i} className="flex gap-2 ml-1 mb-1 group">
                            <span className="text-indigo-500 mt-1.5 text-[6px] group-hover:text-indigo-400 transition-colors">●</span>
                            <span className="leading-relaxed text-slate-300 text-xs sm:text-sm">
                                {parts.map((part, idx) => 
                                idx % 2 === 1 ? <span key={idx} className="text-white font-medium">{part}</span> : part
                                )}
                            </span>
                            </div>
                        );
                        }
                        // Empty lines
                        if (line.trim() === '') return <div key={i} className="h-2"></div>;
                        
                        // Regular paragraphs
                        const parts = line.split('**');
                        return (
                            <p key={i} className="mb-1 leading-relaxed text-xs sm:text-sm">
                                {parts.map((part, idx) => 
                                idx % 2 === 1 ? <span key={idx} className="text-white font-medium">{part}</span> : part
                                )}
                            </p>
                        );
                    })}
                    </div>
                </div>
                </div>
            )}

            {/* Recent News Section - Hide in PDF to save space/relevance */}
            {data.news && data.news.length > 0 && (
                <div className="glass-panel p-4 rounded-xl" data-html2canvas-ignore>
                <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                    <h3 className="text-lg font-semibold text-white">Recent News</h3>
                    <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
                </div>
                <div className="space-y-3">
                    {data.news.map((item, i) => (
                    <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block group p-2.5 -mx-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-cyan-300 font-medium group-hover:text-cyan-200 transition-colors text-xs md:text-sm leading-snug">
                                    {item.title}
                                </h4>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                                {item.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] uppercase tracking-wider">
                                <span className="font-semibold text-slate-400">{item.source}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500">{item.published}</span>
                                {item.sentiment && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span className={`px-1 py-0.5 rounded border ${getSentimentStyle(item.sentiment)}`}>
                                      {item.sentiment}
                                    </span>
                                  </>
                                )}
                            </div>
                        </div>
                        <div className="text-slate-600 group-hover:text-cyan-400 transition-colors mt-0.5">
                            <ExternalLinkIcon size={12} />
                        </div>
                        </div>
                    </a>
                    ))}
                </div>
                </div>
            )}

            {/* Other Detailed Text Sections */}
            <div className="space-y-3">
                {otherSections.map((section, idx) => (
                <div 
                    key={idx} 
                    className="glass-panel p-4 rounded-xl"
                >
                    <h3 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                    {section.title}
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    {section.content.split('\n').map((line, i) => {
                        if (line.trim().startsWith('###')) return <h4 key={i} className="text-cyan-200 mt-3 mb-1 font-medium text-sm">{line.replace(/^###\s*/, '')}</h4>;
                        if (line.trim().startsWith('-') || line.trim().startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-cyan-500 text-xs sm:text-sm">{line.replace(/^[-*]\s*/, '')}</li>;
                        if (line.trim() === '') return <div key={i} className="h-2"></div>;
                        return <p key={i} className="mb-1 text-xs sm:text-sm">{line.replace(/\*\*/g, '')}</p>; // Simple cleanup for other sections
                    })}
                    </div>
                </div>
                ))}
            </div>

            </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-center text-[10px] text-slate-600 mt-8 px-4">
        <p>DISCLAIMER: StockGPT is an AI-powered research tool. Predictions are probabilistic and not guarantees.</p>
        <p>This is not financial advice. Past performance does not indicate future results. Verify all data independently.</p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;