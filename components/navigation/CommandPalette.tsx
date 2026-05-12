'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES, RouteConfig } from '@/lib/navigation/routeMap';
import { 
  Search as SearchIcon, 
  ArrowRight, 
  Command, 
  Terminal,
  Zap,
  Target,
  FileDown,
  RefreshCw,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface CommandItem {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  action: () => void;
  category: 'navigation' | 'action' | 'system';
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Build the command registry
  const commands = useMemo((): CommandItem[] => {
    const routeCommands: CommandItem[] = APP_ROUTES.filter(r => r.status !== 'hidden').map(route => ({
      id: `nav-${route.id}`,
      label: `Go to ${route.label}`,
      subtitle: route.description,
      icon: route.icon,
      action: () => router.push(route.path),
      category: 'navigation'
    }));

    const actionCommands: CommandItem[] = [
      {
        id: 'action-scan',
        label: 'Run Market Scan',
        subtitle: 'Initiate fresh Keepa intelligence gathering.',
        icon: Zap,
        action: () => router.push('/products'),
        category: 'action'
      },
      {
        id: 'action-allocate',
        label: 'Generate Capital Allocation',
        subtitle: 'Run simulation on active procurement drafts.',
        icon: Target,
        action: () => router.push('/procurement/allocation'),
        category: 'action'
      },
      {
        id: 'action-export',
        label: 'Export All Draft POs',
        subtitle: 'Generate supplier-ready CSVs for all active drafts.',
        icon: FileDown,
        action: () => router.push('/procurement/drafts'),
        category: 'action'
      },
      {
        id: 'action-recalibrate',
        label: 'Recalibrate System Accuracy',
        subtitle: 'Tune truth layer based on recent outcomes.',
        icon: RefreshCw,
        action: () => router.push('/procurement/outcomes'),
        category: 'action'
      }
    ];

    return [...actionCommands, ...routeCommands];
  }, [router]);

  // 2. Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands.slice(0, 10);
    const lowQuery = query.toLowerCase();
    return commands.filter(c => 
      c.label.toLowerCase().includes(lowQuery) || 
      c.subtitle.toLowerCase().includes(lowQuery)
    );
  }, [query, commands]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        inputRef.current?.focus();
        setSelectedIndex(0);
      } else {
        setQuery('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
        close();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 sm:p-6 md:p-20 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-800/50">
          <Command className="w-5 h-5 text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search routes..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-[10px] font-black text-slate-500">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[450px] overflow-y-auto p-2 scrollbar-none">
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-sm">No commands found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => { command.action(); close(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left group border relative overflow-hidden",
                    index === selectedIndex 
                      ? "bg-white/[0.03] border-white/10 shadow-inner" 
                      : "border-transparent hover:bg-white/[0.01]"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all",
                      index === selectedIndex ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-slate-800 text-slate-400"
                    )}>
                      <command.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-200 flex items-center gap-2">
                        {command.label}
                        {index === selectedIndex && (
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter ml-2 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Active</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{command.subtitle}</div>
                    </div>
                  </div>
                  
                  {index === selectedIndex && (
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">Enter</span>
                      <ArrowRight className="w-4 h-4 text-indigo-500 animate-in slide-in-from-left-2" />
                    </div>
                  )}

                  {index === selectedIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><ArrowRight className="w-3 h-3 rotate-90" /> Navigate</span>
            <span className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Execute</span>
            <span className="flex items-center gap-2"><Terminal className="w-3 h-3" /> Action Mode</span>
          </div>
          <div className="text-slate-700">ScaleTools Control Plane v2.0</div>
        </div>
      </div>
      
      {/* Background Click to Close */}
      <div className="absolute inset-0 -z-10" onClick={close} />
    </div>
  );
}
