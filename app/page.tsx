import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperationalDashboard() {
  // Mock data for the system overview
  const stats = [
    { label: 'Active Suppliers', value: '42', change: '+4', trend: 'up', icon: Users, color: 'text-indigo-400' },
    { label: 'Market Opportunities', value: '1,284', change: '+12%', trend: 'up', icon: Zap, color: 'text-amber-400' },
    { label: 'Pending POs', value: '7', change: '-2', trend: 'down', icon: ShoppingBag, color: 'text-emerald-400' },
    { label: 'System Confidence', value: '94%', change: '+0.5%', trend: 'up', icon: TrendingUp, color: 'text-indigo-400' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title="Operator Command Center" 
          description="System-wide overview of intelligence, procurement, and supplier health."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                  stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity Feed Placeholder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Market Volatility Monitor</h3>
              <p className="text-slate-500 max-w-sm mb-8">
                Your temporal intelligence engine is analyzing 1.2k ASINs. Real-time visualization will appear here as trends stabilize.
              </p>
              <div className="flex gap-4">
                <div className="h-1.5 w-12 bg-indigo-500 rounded-full" />
                <div className="h-1.5 w-12 bg-slate-800 rounded-full" />
                <div className="h-1.5 w-12 bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>

          {/* System Health Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Intelligence
              </h3>
              <div className="space-y-4">
                {[
                  { time: '2m ago', msg: 'Keepa Snapshot: B00ABC123 updated', color: 'bg-indigo-500' },
                  { time: '14m ago', msg: 'New Opportunity: 22% Margin in Industrial', color: 'bg-emerald-500' },
                  { time: '1h ago', msg: 'Supplier Sync: Widget Co. status updated', color: 'bg-amber-500' },
                  { time: '3h ago', msg: 'System Audit: All routes validated', color: 'bg-slate-700' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-default">
                    <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform", item.color)} />
                    <div>
                      <div className="text-[11px] text-white font-medium leading-snug">{item.msg}</div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
              <h3 className="font-bold text-lg mb-2">Deploy Capital</h3>
              <p className="text-indigo-100 text-xs leading-relaxed mb-6">
                You have $12,400 in high-confidence opportunities ready for procurement.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                Build Purchase Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
