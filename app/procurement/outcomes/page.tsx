'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  BarChart3, 
  TrendingUp, 
  PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseOutcome } from '@/schemas/procurementOutcome.schema';

export default function OutcomesPage() {
  const [outcomes, setOutcomes] = useState<PurchaseOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOutcomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/procurement/outcomes');
      const data = await response.json();
      setOutcomes(data);
    } catch (error) {
      console.error('Failed to fetch outcomes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOutcomes();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOutcomes]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/procurement/outcomes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchOutcomes();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const stats = {
    total: outcomes.length,
    ordered: outcomes.filter(o => o.status === 'ordered').length,
    received: outcomes.filter(o => o.status === 'received').length,
    accuracy: outcomes.filter(o => o.status === 'received').length > 0 
      ? (outcomes.filter(o => o.status === 'received').reduce((sum, o) => {
          const deviation = Math.abs(o.predicted_margin - (o.actual_margin ?? o.predicted_margin)) / (o.predicted_margin || 1);
          return sum + (1 - Math.min(1, deviation));
        }, 0) / outcomes.filter(o => o.status === 'received').length) * 100
      : 100
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Truth Layer & Feedback Loop" 
          description="Tracking real-world outcomes against system predictions to drive self-correction."
        />

        {/* Global Accuracy Metric */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Accuracy</div>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              {stats.accuracy.toFixed(1)}%
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-2 text-xs text-slate-500">Based on historical margin deviation</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Orders</div>
            <div className="text-3xl font-bold text-indigo-400">{stats.ordered}</div>
            <div className="mt-2 text-xs text-slate-500">Awaiting receiving confirmation</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirmed Truths</div>
            <div className="text-3xl font-bold text-emerald-400">{stats.received}</div>
            <div className="mt-2 text-xs text-slate-500">Orders with verified outcomes</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Feedback Signals</div>
            <div className="text-3xl font-bold text-slate-300">{outcomes.length}</div>
            <div className="mt-2 text-xs text-slate-500">Total data points recorded</div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-indigo-400" />
              Outcome Ledger
            </h3>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              {['all', 'ordered', 'received'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider",
                    filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : outcomes.length === 0 ? (
            <div className="p-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center">
              <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-400">No Outcomes Recorded</h2>
              <p className="text-slate-600 mt-2 max-w-md mx-auto">
                Mark a Draft PO as &apos;Ready to Send&apos; to start tracking its real-world performance in the truth layer.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ASIN / Product</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Lifecycle Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Predicted ROI</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actual Outcome</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {outcomes
                    .filter(o => filter === 'all' || o.status === filter)
                    .map((outcome) => (
                    <tr key={outcome.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{outcome.asin}</span>
                          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{outcome.supplier_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center">
                          <select 
                            value={outcome.status}
                            onChange={(e) => handleUpdateStatus(outcome.id, e.target.value)}
                            className={cn(
                              "text-[10px] font-bold px-3 py-1 rounded-full border bg-transparent outline-none transition-all uppercase tracking-wider",
                              outcome.status === 'ordered' ? "text-amber-400 border-amber-500/20 hover:bg-amber-500/5" :
                              outcome.status === 'received' ? "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/5" :
                              "text-slate-500 border-slate-700 hover:bg-slate-800"
                            )}
                          >
                            <option value="ordered" className="bg-slate-950">Ordered</option>
                            <option value="received" className="bg-slate-950">Received</option>
                            <option value="sold" className="bg-slate-950">Sold</option>
                            <option value="cancelled" className="bg-slate-950">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right font-bold text-indigo-400">
                        {(outcome.predicted_roi * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-6 text-right font-bold">
                        {outcome.status === 'received' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-400">Verified</span>
                            <span className="text-[10px] text-slate-500">TRUTH RECORDED</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                          {(outcome.confidence_at_order * 100).toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
