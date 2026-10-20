import React from 'react';
import { ExpertOpinion, BCHIndicators } from '../game/types';
import { formatPct } from '../game/economyEngine';
import { Newspaper, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

interface ExpertOpinionsTabProps {
  opinions: ExpertOpinion[];
  bch: BCHIndicators;
}

export function ExpertOpinionsTab({ opinions, bch }: ExpertOpinionsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Macroeconómico */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Boletín Ejecutivo: Opiniones de Expertos Financieros</h2>
            <p className="text-xs text-slate-400">
              Análisis independiente de economistas, ex-gobernadores del BCH y consultores de la CNBS
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">TPM BCH</span>
            <span className="font-bold text-amber-400">{formatPct(bch.tpmRate)}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Inflación Anual</span>
            <span className="font-bold text-slate-200">{formatPct(bch.interannualInflation)}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Tipo de Cambio</span>
            <span className="font-bold text-emerald-400">L. {bch.exchangeRateHNLtoUSD.toFixed(2)}/$</span>
          </div>
        </div>
      </div>

      {/* Grid de Columnas de Opinión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opinions.map(op => {
          const isRisk = op.sentiment === 'Alerta de Riesgo';
          const isOpp = op.sentiment === 'Oportunidad Estratégica';
          const isGrowth = op.sentiment === 'Favorable / Crecimiento';

          return (
            <div
              key={op.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
            >
              <div>
                {/* Autor y Cargo */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm">
                      {op.author.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{op.author}</h3>
                      <p className="text-[11px] text-slate-400">{op.role}</p>
                      <p className="text-[10px] text-slate-400">{op.organization}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    isRisk ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    isOpp ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                    isGrowth ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {op.sentiment}
                  </span>
                </div>

                {/* Titular y Contenido */}
                <h4 className="text-sm font-bold text-amber-300/90 mt-3">{op.headline}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{op.summary}</p>
              </div>

              {/* Recomendación Estratégica */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Recomendación para la Presidencia:
                </div>
                <p className="text-xs text-slate-300 font-medium">{op.recommendedAction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
