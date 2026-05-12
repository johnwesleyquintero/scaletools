'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SupplierMatch } from '@/schemas/product.schema';
import { cn } from '@/lib/utils';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart3, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export default function ProductsPage() {
  const [asin, setAsin] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [results, setResults] = useState<SupplierMatch[] | null>(null);
  const [ingestionSummary, setIngestionSummary] = useState<any | null>(null);
  const [productTitle, setProductTitle] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [isAddingToPO, setIsAddingToPO] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!asin) return;
    
    setIsAnalyzing(true);
    setResults(null);
    setIngestionSummary(null);
    
    try {
      const response = await fetch('/api/product-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin })
      });
      
      const data = await response.json();
      if (data.matched_suppliers) {
        setResults(data.matched_suppliers);
        setProductTitle(data.product_title || 'Unknown Product');
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeepaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsIngesting(true);
    setResults(null);
    setIngestionSummary(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      try {
        const response = await fetch('/api/keepa/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent })
        });
        const data = await response.json();
        setIngestionSummary(data);
        // Automatically analyze the first ASIN from Keepa if available
        if (data.products?.[0]?.asin) {
          setAsin(data.products[0].asin);
        }
      } catch (error) {
        console.error('Keepa ingestion failed:', error);
      } finally {
        setIsIngesting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAddToPO = async (match: SupplierMatch) => {
    setIsAddingToPO(match.supplier_id);
    try {
      const response = await fetch('/api/procurement/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: match.supplier_id,
          supplierName: match.supplier_name,
          item: {
            asin: asin,
            title: productTitle || 'Unknown Product',
            supplier_price: match.estimated_cost,
            amazon_price: match.estimated_cost + match.estimated_margin,
            quantity: 1,
            projected_margin: match.estimated_margin,
            confidence_score: match.match_confidence
          }
        })
      });
      
      if (response.ok) {
        setAddedItems(prev => ({ ...prev, [match.supplier_id]: true }));
        setTimeout(() => {
          setAddedItems(prev => ({ ...prev, [match.supplier_id]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to PO:', error);
    } finally {
      setIsAddingToPO(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl auto mx-auto">
        <DashboardHeader 
          title="Product Intelligence" 
          description="Match Amazon products to your supplier network and calculate profit opportunities."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                Analyze New ASIN
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Amazon ASIN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B00ABC123"
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    value={asin}
                    onChange={(e) => setAsin(e.target.value.toUpperCase())}
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !asin}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <BarChart3 className="w-5 h-5 animate-pulse" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Identify Opportunities'}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                Keepa Export Ingestion
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Upload a Keepa CSV export to bulk ingest real market intelligence for multiple ASINs.
              </p>
              
              <label className={cn(
                "w-full py-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all",
                isIngesting ? "bg-slate-900/50 border-slate-700 pointer-events-none" : "border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5"
              )}>
                {isIngesting ? (
                  <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-600 group-hover:text-emerald-400" />
                    <span className="text-sm font-semibold text-slate-400 mt-2">Choose Keepa CSV</span>
                  </>
                )}
                <input type="file" className="hidden" accept=".csv" onChange={handleKeepaUpload} disabled={isIngesting} />
              </label>

              {ingestionSummary && (
                <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ingestion Summary</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{ingestionSummary.valid}</div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase">Valid ASINs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-400">{ingestionSummary.failed}</div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase">Failed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!results && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                  <BarChart3 className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Ready to Analyze</h3>
                <p className="text-slate-600 max-w-sm mt-2">
                  Enter an Amazon ASIN on the left to scan your supplier database for matching products and profit potential.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Match Results ({results.length})</h3>
                  <span className="text-xs text-slate-500">Sorted by Final Opportunity Score</span>
                </div>
                
                {results.length === 0 ? (
                  <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
                    <p className="text-slate-500">No matching suppliers found for this product.</p>
                  </div>
                ) : (
                  results.map((match) => (
                    <div 
                      key={match.supplier_id}
                      className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                        <div className="flex flex-col items-end">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Opportunity Score</div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                style={{ width: `${match.final_score * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-white">{(match.final_score * 100).toFixed(0)}</span>
                          </div>
                        </div>
                        
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          match.risk_level === 'LOW' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          match.risk_level === 'MEDIUM' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {match.risk_level} RISK
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {match.supplier_name}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            ASIN: {asin} • Estimated Cost: ${match.estimated_cost.toFixed(2)}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Market Score</span>
                              <span className="text-sm font-semibold text-slate-300">{(match.market_score * 100).toFixed(0)}/100</span>
                            </div>
                            <div className="w-px h-6 bg-slate-800"></div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Confidence</span>
                              <div className="flex items-center gap-1">
                                <span className={cn(
                                  "text-sm font-semibold",
                                  match.match_confidence < 0.4 ? "text-rose-400" : 
                                  match.match_confidence < 0.7 ? "text-amber-400" : "text-slate-300"
                                )}>
                                  {(match.match_confidence * 100).toFixed(0)}%
                                </span>
                                {match.match_confidence < 0.5 && (
                                  <span title="Low data confidence or high volatility">
                                    <AlertCircle className="w-3 h-3 text-rose-500" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:w-64">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Margin
                            </div>
                            <div className="text-lg font-bold text-white">${match.estimated_margin.toFixed(2)}</div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Percent className="w-3 h-3" /> ROI
                            </div>
                            <div className="text-lg font-bold text-white">{(match.roi * 100).toFixed(1)}%</div>
                          </div>
                          
                          <button
                            onClick={() => handleAddToPO(match)}
                            disabled={isAddingToPO === match.supplier_id || addedItems[match.supplier_id]}
                            className={cn(
                              "col-span-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                              addedItems[match.supplier_id] 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            )}
                          >
                            {addedItems[match.supplier_id] ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isAddingToPO === match.supplier_id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-3 h-3 text-indigo-400" />
                            )}
                            {addedItems[match.supplier_id] ? 'Added to Draft' : 'Add to Draft PO'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
