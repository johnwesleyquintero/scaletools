'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Info,
  ChevronRight,
  Target,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Allocation {
  supplierId: string;
  supplierName: string;
  recommendedSpend: number;
  expectedROI: number;
  riskAdjustedScore: number;
  reasoning: string[];
}

export default function AllocationPage() {
  const [capital, setCapital] = useState<number>(10000);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAllocation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/procurement/allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capital })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Allocation failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateAllocation();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Capital Allocation Engine" 
          description="Portfolio-level decision intelligence for optimized capital deployment."
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Parameters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Available Capital
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={calculateAllocation}
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                  Run Simulation
                </button>
              </div>
            </div>

            {results && results.summary && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Batch Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Avg. Expected ROI</div>
                    <div className="text-2xl font-bold text-emerald-400">{(results.summary.avgROI * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Active Suppliers</div>
                    <div className="text-2xl font-bold text-white">{results.summary.totalSuppliers}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allocation Results */}
          <div className="lg:col-span-3 space-y-6">
            {!results && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center">
                <PieChart className="w-12 h-12 text-slate-700 mb-4" />
                <h2 className="text-xl font-bold text-slate-400">Ready for Simulation</h2>
                <p className="text-slate-600 mt-2 max-w-sm">
                  Adjust your capital parameters and run the engine to see the optimal distribution across your supplier network.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            )}

            {results && results.allocation && results.allocation.length === 0 && (
              <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white">No Active Drafts</h3>
                <p className="text-slate-500 mt-2">
                  The allocation engine requires active Draft Purchase Orders to compute recommendations.
                </p>
              </div>
            )}

            {results && results.allocation && results.allocation.map((alloc: Allocation, i: number) => (
              <div 
                key={alloc.supplierId}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all hover:border-indigo-500/30"
              >
                <div className="absolute top-0 right-0 p-8 text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk-Adjusted Score</div>
                  <div className="text-2xl font-black text-slate-800 group-hover:text-indigo-900/30 transition-colors">
                    {(alloc.riskAdjustedScore * 100).toFixed(0)}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {alloc.supplierName}
                      </h3>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Rank #{i + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-500" /> Recommended Spend
                        </div>
                        <div className="text-xl font-bold text-white">
                          ${alloc.recommendedSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-indigo-400" /> Exp. ROI
                        </div>
                        <div className="text-xl font-bold text-indigo-400">
                          {(alloc.expectedROI * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-slate-400" /> Reliability
                        </div>
                        <div className="text-xl font-bold text-slate-300">
                          {alloc.riskAdjustedScore > 0.6 ? 'High' : alloc.riskAdjustedScore > 0.4 ? 'Stable' : 'Volatile'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Allocation Rationale</div>
                      {alloc.reasoning.map((reason, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-slate-400">
                          <ArrowUpRight className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:w-px md:bg-slate-800"></div>

                  <div className="md:w-64 flex flex-col justify-center">
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                        <span>Portfolio Weight</span>
                        <span>{((alloc.recommendedSpend / results.totalCapital) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                          style={{ width: `${(alloc.recommendedSpend / results.totalCapital) * 100}%` }}
                        />
                      </div>
                    </div>
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center justify-center gap-2">
                      Review Draft PO
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
