'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTE_MAP, RouteSection } from '@/lib/navigation/routeMap';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  Menu, 
  X,
  Search,
  Activity,
  History,
  Database,
  BarChart3,
  ShoppingBag,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  FileText
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intelligence: true,
    suppliers: true,
    procurement: true,
    system: true
  });

  const toggleSection = (section: RouteSection) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sections: { id: RouteSection; label: string; icon: any }[] = [
    { id: 'intelligence', label: 'Intelligence Layer', icon: Cpu },
    { id: 'suppliers', label: 'Supplier Layer', icon: Database },
    { id: 'procurement', label: 'Procurement Layer', icon: ShoppingBag },
    { id: 'system', label: 'System Layer', icon: LayoutDashboard }
  ];

  return (
    <>
      {/* Mobile Trigger */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] p-2 bg-slate-900 border border-slate-800 rounded-lg lg:hidden shadow-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-[80] w-72 bg-slate-950 border-r border-slate-900 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">ScaleTools</h1>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Intelligence OS</p>
            </div>
          </Link>
          <button className="lg:hidden p-2 hover:bg-slate-900 rounded-lg transition-colors" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700 transition-colors">
          {sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <button 
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-all rounded-lg hover:bg-slate-900/50 group",
                  expandedSections[section.id] && "text-slate-400"
                )}
              >
                <span className="flex items-center gap-2">
                  <section.icon className="w-3 h-3 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
                  {section.label}
                </span>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-3 h-3 opacity-50" />
                ) : (
                  <ChevronRight className="w-3 h-3 opacity-50" />
                )}
              </button>

              <div className={cn(
                "space-y-0.5 mt-1 overflow-hidden transition-all duration-300",
                expandedSections[section.id] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}>
                {ROUTE_MAP.filter(r => r.section === section.id && r.status !== 'hidden').map((route) => {
                  const isActive = pathname === route.path;
                  const Icon = route.icon;
                  
                  return (
                    <Link
                      key={route.path + route.label}
                      href={route.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group relative border",
                        isActive 
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)] shadow-inner" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-transparent"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isActive ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-900 text-slate-500 group-hover:text-slate-300"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{route.label}</span>
                      {route.status === 'beta' && (
                        <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400/70 px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-indigo-500/10">Beta</span>
                      )}
                      {isActive && (
                        <div className="absolute -left-1 top-3 bottom-3 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800/50 shadow-inner">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-indigo-400">OP</span>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-sm animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Administrator</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">Root Access</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-indigo-500 rounded-full" />
              </div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">System 80%</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
