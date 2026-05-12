'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  ShoppingBag, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Briefcase,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DraftPO } from '@/schemas/procurement.schema';

export default function ProcurementPage() {
  const [drafts, setDrafts] = useState<DraftPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      // For scaffold, we'll simulate fetching from our new store
      // In reality, this would be an API call
      try {
        const response = await fetch('/api/procurement/drafts');
        const data = await response.json();
        setDrafts(data);
      } catch (e) {
        console.error('Failed to fetch drafts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  const totalSpend = drafts.reduce((sum, d) => sum + d.total_cost, 0);
  const totalProfit = drafts.reduce((sum, d) => sum + d.projected_profit, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Procurement Engine" 
          description="Manage draft purchase orders and allocate capital to high-intelligence opportunities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-indigo-400">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Draft POs</span>
            </div>
            <div className="text-3xl font-bold">{drafts.length}</div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-emerald-400">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Projected Spend</span>
            </div>
            <div className="text-3xl font-bold">${totalSpend.toLocaleString()}</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-amber-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Est. Gross Profit</span>
            </div>
            <div className="text-3xl font-bold text-white">${totalProfit.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Active Drafts</h3>
              <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" /> Create Manual PO
              </button>
            </div>

            {isLoading ? (
              <div className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Action Layer...</p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800 mx-auto">
                  <ShoppingBag className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">No Draft POs</h3>
                <p className="text-slate-600 max-w-sm mt-2 mx-auto">
                  Go to Product Intelligence and add items to a draft to start your procurement workflow.
                </p>
              </div>
            ) : (
              drafts.map((po) => (
                <div 
                  key={po.id}
                  className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">{po.status}</span>
                        <span className="text-xs text-slate-500 font-mono">{po.id}</span>
                      </div>
                      <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {po.supplier_name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {po.items.length} items • Created {new Date(po.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">Total Spend</div>
                        <div className="text-lg font-bold text-white">${po.total_cost.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Est. Profit</div>
                        <div className="text-lg font-bold text-emerald-400">${po.projected_profit.toFixed(2)}</div>
                      </div>
                      <button className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-white transition-colors border border-slate-700">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Procurement Pipeline
              </h3>
              
              <div className="space-y-6 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-800" />
                
                {[
                  { label: 'Intelligence Mapping', status: 'Complete', icon: CheckCircle2, color: 'text-emerald-500' },
                  { label: 'PO Foundation Layer', status: 'Active', icon: Clock, color: 'text-indigo-500' },
                  { label: 'Capital Allocation', status: 'Pending', icon: Plus, color: 'text-slate-700' },
                  { label: 'Supplier Execution', status: 'Locked', icon: ShoppingBag, color: 'text-slate-800' }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={cn("mt-1 z-10 bg-slate-950 rounded-full p-1", step.color)}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{step.label}</div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{step.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <p className="text-xs text-indigo-300 leading-relaxed italic">
                  &quot;Phase 7 Scaffold: Preparing a controlled execution layer between intelligence and money movement.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
