'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DraftPO, POItem } from '@/schemas/procurement.schema';
import { exportService } from '@/lib/procurement/exportService';
import {
  ShoppingBag,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileText,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DraftDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [draft, setDraft] = useState<DraftPO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/procurement/drafts/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDraft(data);
        } else {
          router.push('/procurement/drafts');
        }
      } catch (error) {
        console.error('Error fetching draft:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraft();
  }, [id, router]);

  const updateQuantity = (asin: string, delta: number) => {
    if (!draft) return;

    const updatedItems = draft.items.map(item => {
      if (item.asin === asin) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    const total_cost = updatedItems.reduce((sum, i) => sum + (i.supplier_price * i.quantity), 0);
    const projected_profit = updatedItems.reduce((sum, i) => sum + (i.projected_margin * i.quantity), 0);

    setDraft({ ...draft, items: updatedItems, total_cost, projected_profit });
  };

  const removeItem = (asin: string) => {
    if (!draft) return;
    const updatedItems = draft.items.filter(item => item.asin !== asin);
    const total_cost = updatedItems.reduce((sum, i) => sum + (i.supplier_price * i.quantity), 0);
    const projected_profit = updatedItems.reduce((sum, i) => sum + (i.projected_margin * i.quantity), 0);
    setDraft({ ...draft, items: updatedItems, total_cost, projected_profit });
  };

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/procurement/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      if (response.ok) {
        alert('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!draft) return;
    exportService.downloadCSV(draft);
  };

  const markAsReady = async () => {
    if (!draft) return;
    const updatedDraft = { ...draft, status: 'review' as const };
    setDraft(updatedDraft);
    
    setIsSaving(true);
    try {
      // 1. Record outcomes for feedback loop
      await fetch('/api/procurement/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId: id })
      });

      // 2. Update status
      const response = await fetch(`/api/procurement/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDraft)
      });
      if (response.ok) {
        alert('PO marked as Ready to Send & recorded in Truth Layer!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/procurement/drafts')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Drafts
        </button>

        <DashboardHeader
          title={draft.supplier_name}
          description={`Reviewing ${draft.items.length} items for ${draft.id}`}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mr-2",
              draft.status === 'draft' ? "bg-slate-800 text-slate-400 border-slate-700" :
              draft.status === 'review' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
              {draft.status}
            </div>
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-lg transition-all border border-slate-800"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white text-sm font-bold rounded-lg transition-all border border-slate-700 shadow-lg"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </button>
          </div>
        </DashboardHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Quantity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ext. Margin</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {draft.items.map((item) => (
                    <tr key={item.asin} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-bold text-white">{item.asin}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded">Confidence: {(item.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.asin, -1)}
                            className="p-1 hover:bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.asin, 1)}
                            className="p-1 hover:bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="text-sm font-bold text-white">${item.supplier_price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="text-sm font-bold text-emerald-400">+${(item.projected_margin * item.quantity).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          onClick={() => removeItem(item.asin)}
                          className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {draft.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                        No items in this draft.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Financial Summary</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Total Purchase Value</span>
                    <DollarSign className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    ${draft.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Projected Batch Profit</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    +${draft.projected_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Average ROI</span>
                    <Percent className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {((draft.projected_profit / (draft.total_cost || 1)) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={markAsReady}
                    disabled={draft.status === 'review' || isSaving}
                    className={cn(
                      "w-full py-4 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                      draft.status === 'review' 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                    )}
                  >
                    {draft.status === 'review' ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    {draft.status === 'review' ? 'Ready to Send' : 'Mark as Ready to Send'}
                  </button>
                  <p className="text-[10px] text-slate-500 mt-3 text-center uppercase tracking-widest">
                    {draft.status === 'review' ? 'PO is locked for execution' : 'Final batch confirmation required'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
