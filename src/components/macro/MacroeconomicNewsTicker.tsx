import React, { useState } from 'react';
import { Newspaper, TrendingUp, AlertTriangle, ChevronRight, X, Globe, Building2, Flame } from 'lucide-react';
import type { MacroNewsItem } from '../../game/types';

interface MacroeconomicNewsTickerProps {
  newsFeed?: MacroNewsItem[];
  tpmRate: number;
  interannualInflation: number;
  exchangeRateUSD: number;
}

export const MacroeconomicNewsTicker: React.FC<MacroeconomicNewsTickerProps> = ({
  newsFeed = [],
  tpmRate,
  interannualInflation,
  exchangeRateUSD
}) => {
  const [selectedNews, setSelectedNews] = useState<MacroNewsItem | null>(null);

  const displayNews = newsFeed.length > 0 ? newsFeed : [
    {
      id: 'default-1',
      month: 1,
      year: 2026,
      category: 'bch_politica' as const,
      headline: 'BCH ratifica Tasa de Política Monetaria en 5.75% para preservar anclaje de expectativas',
      source: 'Boletín Oficial Banco Central de Honduras',
      summary: 'El Comité de Operaciones de Mercado Abierto mantuvo la tasa de referencia monetaria para incentivar el crédito productivo.',
      impactLabel: 'Estabilidad de tasas activas y pasivas en el sistema financiero',
      urgency: 'moderada' as const
    }
  ];

  return (
    <>
      {/* Bloomberg-style Ticker Strip */}
      <div className="bg-[#0b101b] border-b border-amber-900/40 text-xs px-3 py-1.5 flex items-center justify-between gap-3 select-none overflow-hidden">
        {/* Left Indicator Tag */}
        <div className="flex items-center gap-2 shrink-0 border-r border-amber-900/30 pr-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-mono font-bold uppercase tracking-wider text-amber-400 text-[11px] flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5" /> BLOOMBERG WIRE
          </span>
          <span className="text-slate-500 text-[10px]">·</span>
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>TPM: <span className="text-amber-400 font-semibold">{tpmRate.toFixed(2)}%</span></span>
            <span className="text-slate-600">/</span>
            <span>IPC: <span className="text-emerald-400 font-semibold">{interannualInflation.toFixed(1)}%</span></span>
            <span className="text-slate-600">/</span>
            <span>USD: <span className="text-cyan-400 font-semibold">L. {exchangeRateUSD.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Center Carousel / Marquee Item */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-3">
          {displayNews.slice(0, 3).map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className="flex items-center gap-2 text-left hover:bg-amber-950/30 px-2 py-0.5 rounded transition group shrink-0"
            >
              <span className={`text-[10px] font-mono uppercase tracking-wider ${
                item.urgency === 'critica'
                  ? 'text-rose-400 font-bold'
                  : item.urgency === 'alta'
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400'
              }`}>
                [{item.category.replace('_', ' ')}]
              </span>
              <span className="text-slate-200 group-hover:text-amber-300 font-medium text-xs truncate max-w-[280px] sm:max-w-[420px] lg:max-w-[560px]">
                {item.headline}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                · {item.source}
              </span>
            </button>
          ))}
        </div>

        {/* Right Action Button */}
        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={() => setSelectedNews(displayNews[0])}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 rounded transition"
          >
            <span>Boletín ({displayNews.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Detail Modal for Selected News Item */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-amber-900/50 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono uppercase font-bold tracking-wider ${
                    selectedNews.urgency === 'critica'
                      ? 'text-rose-400'
                      : selectedNews.urgency === 'alta'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}>
                    {selectedNews.category.replace('_', ' ')} · MES {selectedNews.month}/{selectedNews.year}
                  </span>
                  {selectedNews.urgency === 'critica' && (
                    <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <Flame className="w-3 h-3" /> ALERTA CRÍTICA
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-100 leading-snug">
                  {selectedNews.headline}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Fuente Oficial: {selectedNews.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p className="leading-relaxed">
                {selectedNews.summary}
              </p>

              <div className="bg-[#141e33] border border-slate-800/80 rounded p-3 space-y-2 font-mono text-xs">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Impacto en Tesorería y Balance Bancario:
                </div>
                <div className="text-slate-300 pl-4 border-l-2 border-amber-500/50">
                  {selectedNews.impactLabel}
                </div>
                {(selectedNews.tpmRateDelta !== undefined || selectedNews.exchangeRateDelta !== undefined) && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    {selectedNews.tpmRateDelta !== undefined && (
                      <div>
                        <span className="text-slate-400">Variación Tasa TPM:</span>{' '}
                        <span className="text-amber-300 font-bold tabular-nums">
                          {selectedNews.tpmRateDelta > 0 ? `+${selectedNews.tpmRateDelta}%` : `${selectedNews.tpmRateDelta}%`}
                        </span>
                      </div>
                    )}
                    {selectedNews.exchangeRateDelta !== undefined && (
                      <div>
                        <span className="text-slate-400">Variación Lempira/USD:</span>{' '}
                        <span className="text-cyan-300 font-bold tabular-nums">
                          {selectedNews.exchangeRateDelta > 0 ? `+L. ${selectedNews.exchangeRateDelta}` : `L. ${selectedNews.exchangeRateDelta}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Historical News List in modal */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Otras Noticias Recientes del Sistema ({displayNews.length})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {displayNews.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className={`w-full text-left p-2 rounded text-xs transition flex items-center justify-between gap-2 ${
                      item.id === selectedNews.id
                        ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{item.headline}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      Mes {item.month}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded transition"
              >
                Cerrar Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
