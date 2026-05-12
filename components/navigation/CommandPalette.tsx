'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/services/searchService';
import { 
  Command, 
  Search as SearchIcon, 
  Database, 
  Box, 
  X,
  History,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const closePalette = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        closePalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
        setSelectedIndex(0);
      } catch (e) {
        console.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (result: any) => {
    router.push(result.url);
    closePalette();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800">
          <SearchIcon className="w-5 h-5 text-indigo-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search suppliers, ASINs, or commands (Ctrl+K)"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400">ESC</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
          {query === '' && (
            <div className="p-4 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'Sync Sheets', icon: History, path: '/system/ingestion' },
                  { label: 'Ingest Keepa', icon: Database, path: '/system/ingestion' },
                  { label: 'Market Signals', icon: Activity, path: '/intelligence/market' },
                  { label: 'System Health', icon: ShieldCheck, path: '/system/routes' }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(action.path);
                      closePalette();
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-sm border border-transparent hover:border-slate-700 group"
                  >
                    <action.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && query !== '' && (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-slate-500">Searching the intelligence database...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 py-2">Search Results</h3>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left group",
                    index === selectedIndex ? "bg-indigo-500/10 border border-indigo-500/20" : "border border-transparent hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      result.type === 'supplier' ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                    )}>
                      {result.type === 'supplier' ? <Database className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {result.title}
                        {index === selectedIndex && <ArrowRight className="w-3 h-3 text-indigo-500 animate-in slide-in-from-left-2" />}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{result.subtitle}</div>
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enter</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {query !== '' && !isLoading && results.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Select</span>
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-90" /> Navigate</span>
          </div>
          <div>ScaleTools v1.5.3</div>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={closePalette} />
    </div>
  );
}
