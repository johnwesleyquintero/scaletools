import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 flex flex-col">
      <DashboardHeader 
        title="Module Under Construction" 
        description="This intelligence module is being prepared for the next system expansion."
      />
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl mt-8">
        <Construction className="w-12 h-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-400">System Link Active</h2>
        <p className="text-slate-600 mt-2 text-center max-w-md">
          The route is correctly mapped in the ScaleTools core, but the interface layer is currently being optimized.
        </p>
      </div>
    </div>
  );
}
