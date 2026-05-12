'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DraftPO } from '@/schemas/procurement.schema';
import { 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  DollarSign, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch('/api/procurement/drafts');
        const data = await response.json();
        setDrafts(data);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Draft Purchase Orders" 
          description="Review and finalize your pending procurement batches before approval."
        />

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-400">No Draft POs Found</h2>
              <p className="text-slate-600 mt-2 max-w-md mx-auto">
                Go to Product Intelligence to analyze opportunities and start building your first purchase order.
              </p>
            </div>
          ) : (
            drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => router.push(`/procurement/drafts/${draft.id}`)}
                className="w-full text-left p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 hover:bg-slate-900 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <ShoppingBag className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {draft.supplier_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{draft.id}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                          <Clock className="w-3 h-3" /> {new Date(draft.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Total Cost</span>
                      <div className="text-lg font-bold text-white flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        {draft.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Items</span>
                      <div className="text-lg font-bold text-slate-300">
                        {draft.items.length}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
