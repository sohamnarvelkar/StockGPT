import React, { useState } from 'react';
import { StockGPTResponse } from '../types';
import SignalBadge from './ui/SignalBadge';
import ScenarioChart from './charts/ScenarioChart';
import PortfolioPie from './charts/PortfolioPie';
import { Download, FileText, Share2, Printer, Check, Copy } from 'lucide-react';

interface Props {
  data: StockGPTResponse;
  onReset: () => void;
}

// Declare html2pdf for TypeScript since we loaded it via script tag
declare const html2pdf: any;

const GlobeIcon = ({ size = 20, className = "text-cyan-400" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

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
  const currencySymbol = data.currency || '$';

  // Extract the Macro/Global section to display it prominently
  const macroSection = data.sections.find(s => 
    s.title.toLowerCase().includes('macro') || 
    s.title.toLowerCase().includes('global market')
  );
  
  // Remaining sections
  const otherSections = data.sections.filter(s => s !== macroSection);

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white tracking-tight">{data.symbol}</h1>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-mono text-slate-300">
              STOCKGPT INTELLIGENCE
            </span>
          </div>
          <p className="text-slate-400 mt-1 text-lg">{data.companyName}</p>
          {data.currentPrice && data.currentPrice > 0 && (
            <p className="text-2xl font-mono text-cyan-400 mt-2">
              {currencySymbol}{data.currentPrice.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
                {/* Export Tools */}
                <button 
                    onClick={handleExportPDF} 
                    disabled={isExporting}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
                    title="Save as PDF"
                >
                    {isExporting ? <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"/> : <Printer size={14} />}
                    <span className="hidden sm:inline">PDF</span>
                </button>
                
                <button 
                    onClick={handleExportDOC}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    title="Save as Word"
                >
                    <FileText size={14} />
                    <span className="hidden sm:inline">DOC</span>
                </button>

                <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 min-w-[80px] justify-center"
                    title="Share Analysis"
                >
                    {shareStatus === 'COPIED' ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                    <span className="hidden sm:inline">{shareStatus === 'COPIED' ? 'Copied' : 'Share'}</span>
                </button>
            </div>

            <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
            >
            New Analysis
            </button>
        </div>
      </div>

      {/* Main Content ID for PDF Generation */}
      <div id="analysis-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Signal & Key Stats */}
            <div className="space-y-6">
            <SignalBadge signal={data.signal} />
            
            {/* Summary Card */}
            <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-cyan-400 font-mono text-sm mb-3">EXECUTIVE SUMMARY</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                {data.summary}
                </p>
            </div>

            {/* Portfolio Allocation (If available) */}
            {data.portfolioAllocation && data.portfolioAllocation.length > 0 && (
                <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-cyan-400 font-mono text-sm mb-3">OPTIMIZED ALLOCATION</h3>
                <PortfolioPie data={data.portfolioAllocation} />
                </div>
            )}
            </div>

            {/* Center/Right: Deep Dive & Scenarios */}
            <div className="lg:col-span-2 space-y-6">
            
            {/* Scenarios Chart with Integrated Toggles */}
            <div className="glass-panel p-6 rounded-xl">
                <ScenarioChart 
                  scenarios={data.scenarios} 
                  forecasts={data.forecasts}
                  currentPrice={data.currentPrice || 0} 
                  currency={currencySymbol} 
                />
            </div>

            {/* Global Market & Macro Analysis Section - Dedicated & Highlighted */}
            {macroSection && (
                <div className="glass-panel p-6 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 relative overflow-hidden group shadow-lg shadow-indigo-900/10">
                {/* Decorative Background Icon (Hidden during export to avoid artifacts) */}
                <div className="absolute -right-10 -top-10 opacity-5 transform rotate-12 group-hover:opacity-10 transition-opacity duration-700" data-html2canvas-ignore>
                    <GlobeIcon size={200} className="text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <GlobeIcon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        {macroSection.title}
                    </h3>
                    </div>
                    
                    {/* Macro Indicators Badges - Expanded Coverage */}
                    <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        "Interest Rates", 
                        "Inflation Trends", 
                        "Central Banks (Fed/ECB)", 
                        "Sector Rotation", 
                        "Geopolitics"
                    ].map((badge) => (
                        <span key={badge} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider">
                        {badge}
                        </span>
                    ))}
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-1">
                    {macroSection.content.split('\n').map((line, i) => {
                        // Headings
                        if (line.trim().startsWith('###')) {
                        return <h4 key={i} className="text-indigo-200 mt-5 mb-2 font-medium text-base">{line.replace(/^###\s*/, '')}</h4>;
                        }
                        if (line.trim().startsWith('**')) {
                        // Handle bold lines that are just headers
                        return <strong key={i} className="block text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</strong>;
                        }
                        // List items
                        if (line.trim().startsWith('-') || line.trim().startsWith('* ')) {
                        const content = line.replace(/^[-*]\s*/, '');
                        // Check for internal bolding in list items
                        const parts = content.split('**');
                        return (
                            <div key={i} className="flex gap-2 ml-1 mb-1.5">
                            <span className="text-indigo-500 mt-1.5 text-[6px]">●</span>
                            <span className="leading-relaxed">
                                {parts.map((part, idx) => 
                                idx % 2 === 1 ? <span key={idx} className="text-indigo-100 font-medium">{part}</span> : part
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
                            <p key={i} className="mb-2 leading-relaxed">
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
                <div className="glass-panel p-6 rounded-xl" data-html2canvas-ignore>
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h3 className="text-xl font-semibold text-white">Recent News</h3>
                    <span className="text-xs text-slate-500 font-mono">LIVE FEED</span>
                </div>
                <div className="space-y-4">
                    {data.news.map((item, i) => (
                    <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block group p-3 -mx-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h4 className="text-cyan-300 font-medium group-hover:text-cyan-200 transition-colors text-sm md:text-base leading-snug">
                                {item.title}
                            </h4>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                                {item.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 uppercase tracking-wider">
                            <span className="font-semibold text-slate-400">{item.source}</span>
                            <span>•</span>
                            <span>{item.published}</span>
                            </div>
                        </div>
                        <div className="text-slate-600 group-hover:text-cyan-400 transition-colors mt-1">
                            <ExternalLinkIcon />
                        </div>
                        </div>
                    </a>
                    ))}
                </div>
                </div>
            )}

            {/* Other Detailed Text Sections */}
            <div className="space-y-6">
                {otherSections.map((section, idx) => (
                <div 
                    key={idx} 
                    className="glass-panel p-6 rounded-xl"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">
                    {section.title}
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    {section.content.split('\n').map((line, i) => {
                        if (line.trim().startsWith('###')) return <h4 key={i} className="text-cyan-200 mt-4 mb-2 font-medium">{line.replace(/^###\s*/, '')}</h4>;
                        if (line.trim().startsWith('-') || line.trim().startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-cyan-500">{line.replace(/^[-*]\s*/, '')}</li>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>; // Simple cleanup for other sections
                    })}
                    </div>
                </div>
                ))}
            </div>

            </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-center text-xs text-slate-600 mt-12 px-4">
        <p>DISCLAIMER: StockGPT is an AI-powered research tool. Predictions are probabilistic and not guarantees.</p>
        <p>This is not financial advice. Past performance does not indicate future results. Verify all data independently.</p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;