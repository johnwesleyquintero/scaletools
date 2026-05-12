'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  AlertTriangle,
  ArrowRightLeft,
  Activity,
  ChevronRight,
  TrendingDown,
  Scale,
  RefreshCw,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RebalancePage() {
  const [totalCapital, setTotalCapital] = useState<number>(25000);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runRebalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/procurement/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCapital })
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Rebalance analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, [totalCapital]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runRebalance();
    }, 0);
    return () => clearTimeout(timer);
  }, [runRebalance]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Portfolio Rebalancing Engine" 
          description="Continuous optimization and drift detection for dynamic capital distribution."
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
          {/* Health & Control Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Capital Base
              </h3>
              <input
                type="number"
                value={totalCapital}
                onChange={(e) => setTotalCapital(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-4"
              />
              <button 
                onClick={runRebalance}
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Scale className="w-5 h-5" />}
                Re-calculate
              </button>
            </div>

            {data && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Portfolio Health</h3>
                  <Activity className={cn(
                    "w-5 h-5",
                    data.health.status === 'optimized' ? "text-emerald-500" : 
                    data.health.status === 'drifting' ? "text-amber-500" : "text-rose-500"
                  )} />
                </div>
                
                <div className="space-y-6">
                  <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="text-4xl font-black text-white relative z-10">{data.health.score.toFixed(0)}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase mt-1 relative z-10">Optimization Score</div>
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 h-1 transition-all",
                        data.health.status === 'optimized' ? "bg-emerald-500" : 
                        data.health.status === 'drifting' ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${data.health.score}%` }}
                    />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</div>
                    <div className={cn(
                      "text-sm font-bold",
                      data.health.status === 'optimized' ? "text-emerald-400" : 
                      data.health.status === 'drifting' ? "text-amber-400" : "text-rose-400"
                    )}>
                      {data.health.status.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Top Risk Concentration</div>
                    <div className="text-sm font-bold text-white truncate">{data.health.topRisk}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rebalancing Ledger */}
          <div className="lg:col-span-3 space-y-6">
            {!data && isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            )}

            {data && data.recommendations.map((rec: any) => (
              <div 
                key={rec.supplierId}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="text-2xl font-bold text-white">{rec.supplierName}</h3>
                      {Math.abs(rec.adjustmentDelta) > 100 && (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          rec.adjustmentDelta > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {rec.adjustmentDelta > 0 ? 'Inject Capital' : 'Reduction Needed'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current State</div>
                        <div className="text-xl font-bold text-slate-400">
                          ${rec.currentAllocation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Recommended</div>
                        <div className="text-xl font-bold text-white">
                          ${rec.recommendedAllocation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Adjustment</div>
                        <div className={cn(
                          "text-xl font-bold flex items-center gap-1",
                          rec.adjustmentDelta > 0 ? "text-emerald-400" : rec.adjustmentDelta < 0 ? "text-rose-400" : "text-slate-500"
                        )}>
                          {rec.adjustmentDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : rec.adjustmentDelta < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                          {rec.adjustmentDelta === 0 ? '--' : `$${Math.abs(rec.adjustmentDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Rebalance Rationale</div>
                      {rec.reasoning.map((r: string, j: number) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-slate-400 italic">
                          <Activity className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          {r}
                        </div>
                      ))}
                      {rec.reasoning.length === 0 && (
                        <div className="text-xs text-slate-600 italic">Allocation currently aligned with risk/ROI targets.</div>
                      )}
                    </div>
                  </div>

                  <div className="md:w-px md:bg-slate-800"></div>

                  <div className="md:w-64 flex flex-col justify-center">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Drift Variance</div>
                      <div className="flex items-end gap-2">
                        <div className="text-2xl font-bold text-white">
                          {((Math.abs(rec.adjustmentDelta) / (rec.currentAllocation || 1)) * 100).toFixed(1)}%
                        </div>
                        <div className="h-6 w-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                          <div 
                            className={cn(
                              "w-full transition-all",
                              rec.adjustmentDelta > 0 ? "bg-emerald-500" : "bg-rose-500"
                            )}
                            style={{ height: `${Math.min(100, (Math.abs(rec.adjustmentDelta) / (rec.currentAllocation || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-slate-700">
                      Adjust Draft PO
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

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
