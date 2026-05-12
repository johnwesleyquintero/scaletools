'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SupplierTable } from '@/components/SupplierTable';
import { Supplier } from '@/types/supplier';
import { RefreshCw, Search, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // For demo purposes, we'll use dummy sheet data
      const response = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: 'DEMO_SHEET_ID',
          range: 'Sheet1!A:H'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchSuppliers();
        alert(`Sync Complete!\nCreated: ${data.created}\nUpdated: ${data.updated}\nMerged: ${data.merged}\nIgnored: ${data.ignored}`);
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Sync feature requires Google Sheets credentials in .env. Showing mock feedback for now.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.website_domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Supplier Intelligence" 
          description="Manage and analyze your Amazon wholesale supplier data."
        >
          <button className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-lg transition-all border border-slate-800 mr-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Sheets
              </>
            )}
          </button>
        </DashboardHeader>

        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers by name, domain, or email..."
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <SupplierTable suppliers={filteredSuppliers} isLoading={isLoading} />
      </div>
    </div>
  );
}
