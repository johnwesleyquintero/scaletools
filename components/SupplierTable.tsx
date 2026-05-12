'use client';

import React from 'react';
import { Supplier, SupplierStatus } from '@/types/supplier';
import { cn } from '@/lib/utils';

import { ExternalLink, MoreHorizontal, Mail, Phone, Globe } from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<SupplierStatus, string> = {
  NEW: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  CONTACTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RESPONDED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  NEGOTIATING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export function SupplierTable({ suppliers, isLoading }: SupplierTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/30">
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Supplier</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Type</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Website</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Market</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                No suppliers found. Start by syncing from Google Sheets.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr 
                key={supplier.supplier_id} 
                className="hover:bg-slate-800/20 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-white flex items-center gap-2">
                    {supplier.name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {supplier.email || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {supplier.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {supplier.website_domain ? (
                    <a 
                      href={`https://${supplier.website_domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {supplier.website_domain}
                    </a>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {supplier.market}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    STATUS_COLORS[supplier.status]
                  )}>
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {supplier.account_url && (
                      <a 
                        href={supplier.account_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                        title="Account Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                      title="More Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
