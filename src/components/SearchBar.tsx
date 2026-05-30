import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onAnalyze: (name: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onAnalyze, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onAnalyze(query.trim());
    }
  };

  const presets = ['Tesla', 'Microsoft', 'OpenAI', 'Supermicro', 'Stripe'];

  return (
    <div className="bg-[#DCDAD7] border-2 border-[#141414] p-6 shadow-[6px_6px_0px_#141414] transition-all" id="search-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[#141414] mb-1">
            Vendor Analyzer Engine
          </h2>
          <p className="text-xs text-[#141414]/70 font-sans max-w-xl">
            Input any corporation or supplier. The concurrent AI scraper agent will aggregate and weigh raw live web data.
          </p>
        </div>
        <div className="hidden lg:block text-right">
          <span className="text-[10px] font-mono opacity-50 block uppercase">Telemetry Protocol</span>
          <span className="text-xs font-bold font-mono">BD_CONCURRENT_v3</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row border border-[#141414] bg-white h-14 shadow-[4px_4px_0px_#141414] items-center gap-2 pr-0 overflow-hidden">
        <div className="flex flex-1 items-center px-4 gap-2 w-full">
          <span className="opacity-50 italic font-serif text-sm shrink-0">Search Vendor:</span>
          <input
            type="text"
            className="bg-transparent w-full outline-none font-mono text-sm uppercase tracking-widest text-[#141414] py-2"
            placeholder="TYPE ENTERPRISE (E.G. TESLA, OPENAI, STRIPE)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            id="search-input"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-[#141414] text-white hover:bg-zinc-800 disabled:bg-zinc-600 disabled:text-zinc-400 px-8 h-full font-display font-medium uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer transition-colors duration-200 border-l border-[#141414] shrink-0 w-full sm:w-auto justify-center"
          id="search-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Scanning...</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">Presets:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              if (!isLoading) {
                setQuery(preset);
                onAnalyze(preset);
              }
            }}
            disabled={isLoading}
            className="text-[10px] font-mono uppercase bg-white hover:bg-[#141414] hover:text-white text-[#141414] border border-[#141414] px-2.5 py-1 transition-all cursor-pointer disabled:opacity-50"
            id={`preset-${preset.toLowerCase()}`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

