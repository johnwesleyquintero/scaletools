import React from 'react';
import { validateRoutes } from '@/lib/navigation/routeValidator';
import { APP_ROUTES } from '@/lib/navigation/routeMap';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ShieldCheck, AlertCircle, CheckCircle2, Link2Off, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SystemRoutesPage() {
  const validation = validateRoutes();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="System Integrity" 
          description="Validate route mapping and accessibility across all intelligence modules."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Valid Routes</span>
            </div>
            <div className="text-3xl font-bold">{validation.valid.length}</div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Missing Pages</span>
            </div>
            <div className="text-3xl font-bold">{validation.missing.length}</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-amber-400">
              <Link2Off className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Orphaned Files</span>
            </div>
            <div className="text-3xl font-bold">{validation.orphaned.length}</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-400" />
              Route Map Registry
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Label / Path</th>
                  <th className="px-6 py-4">Layer</th>
                  <th className="px-6 py-4">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {APP_ROUTES.map((route) => {
                  const isValid = validation.valid.includes(route.path);
                  return (
                    <tr key={route.path} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border",
                          route.status === 'stable' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          route.status === 'beta' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        )}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{route.label}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{route.path}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{route.section}</span>
                      </td>
                      <td className="px-6 py-4">
                        {isValid ? (
                          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Healthy
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                            <AlertCircle className="w-4 h-4" /> Missing page.tsx
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {validation.orphaned.length > 0 && (
          <div className="mt-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-4">
              <Link2Off className="w-5 h-5" />
              Orphaned Pages (Not in Route Map)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validation.orphaned.map(path => (
                <div key={path} className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                  {path}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
