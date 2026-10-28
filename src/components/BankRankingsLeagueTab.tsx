import React, { useState } from 'react';
import { GameState } from '../game/types';
import { getLeagueTableRankings, formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Trophy, 
  CreditCard, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface BankRankingsLeagueTabProps {
  state: GameState;
  onNavigateToTab?: (tabKey: string) => void;
}

export const BankRankingsLeagueTab: React.FC<BankRankingsLeagueTabProps> = ({
  state,
  onNavigateToTab
}) => {
  const [activeCategory, setActiveCategory] = useState<'tarjetas_credito' | 'prestamos_consumo' | 'banca_privada_aum' | 'solvencia_car'>('tarjetas_credito');

  const rankings = getLeagueTableRankings(state, activeCategory);
  const playerRank = rankings.find(r => r.isPlayer);

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de League Tables */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wide">
                League Tables & Rankings Financieros 2026
              </span>
              <span className="text-xs font-mono text-slate-400">
                Estándar J.P. Morgan & Sistema Bancario Nacional
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Tablas de Posiciones del Mercado Financiero
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compara el desempeño de Áureo Bank frente a los líderes centroamericanos en emisión de tarjetas, cartera de consumo, gestión fiduciaria patrimonial y solvencia regulatoria.
            </p>
          </div>

          {/* Tarjeta de Posición del Jugador */}
          {playerRank && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-right flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-lg text-amber-400 font-mono">
                #{playerRank.rank}
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Posición de Áureo Bank</div>
                <div className="text-xs font-bold text-white">
                  Cuota: <span className="text-amber-400 font-mono tabular-nums">{playerRank.marketSharePct}%</span> de mercado
                </div>
                <div className="text-[10px] text-slate-400">
                  {playerRank.rank === 1 ? '¡Líder del mercado nacional!' : `A #${playerRank.rank - 1} del siguiente rival`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Navegación entre las 4 League Tables */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveCategory('tarjetas_credito'); }}
            className={`p-3 rounded-lg border text-left transition flex items-center gap-3 ${
              activeCategory === 'tarjetas_credito'
                ? 'bg-amber-500/10 border-amber-500/60 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tarjetas de Crédito</div>
              <div className="text-[10px] text-slate-400">Facturación & Plásticos</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveCategory('prestamos_consumo'); }}
            className={`p-3 rounded-lg border text-left transition flex items-center gap-3 ${
              activeCategory === 'prestamos_consumo'
                ? 'bg-blue-500/10 border-blue-500/60 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Préstamos Consumo</div>
              <div className="text-[10px] text-slate-400">Cartera Retail & NPL</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveCategory('banca_privada_aum'); }}
            className={`p-3 rounded-lg border text-left transition flex items-center gap-3 ${
              activeCategory === 'banca_privada_aum'
                ? 'bg-purple-500/10 border-purple-500/60 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <Briefcase className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Banca Privada & AUM</div>
              <div className="text-[10px] text-slate-400">J.P. Morgan Standard</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { sound.playClick(); setActiveCategory('solvencia_car'); }}
            className={`p-3 rounded-lg border text-left transition flex items-center gap-3 ${
              activeCategory === 'solvencia_car'
                ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Solvencia & Riesgo</div>
              <div className="text-[10px] text-slate-400">CAR Tier 1 & Eficiencia</div>
            </div>
          </button>
        </div>
      </div>

      {/* Tabla de Posiciones Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              {activeCategory === 'tarjetas_credito' && 'League Table: Emisión & Facturación de Tarjetas de Crédito'}
              {activeCategory === 'prestamos_consumo' && 'League Table: Colocación de Créditos de Consumo & Morosidad'}
              {activeCategory === 'banca_privada_aum' && 'League Table: Activos Bajo Administración (AUM) & Banca Privada'}
              {activeCategory === 'solvencia_car' && 'League Table: Fortaleza Patrimonial, CAR Tier 1 & CIR'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Fuente: CNBS & Auditorías Trimestrales 2026
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {rankings.map((item) => {
            const isTop1 = item.rank === 1;
            const isTop2 = item.rank === 2;
            const isTop3 = item.rank === 3;
            const isPlayer = item.isPlayer;

            return (
              <div
                key={item.bankId}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isPlayer 
                    ? 'bg-amber-950/20 border-l-4 border-l-amber-400' 
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Ranking y Banco */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                    isTop1 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : isTop2
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                        : isTop3
                          ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {item.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.bankName}</span>
                      {isPlayer && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase font-mono">
                          Tu Banco
                        </span>
                      )}
                      {isTop1 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Líder de Mercado
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.secondaryMetricLabel}: <strong className="text-slate-300">{item.secondaryMetricValue}</strong>
                    </div>
                  </div>
                </div>

                {/* Métricas y Cuota */}
                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      {item.metricLabel}
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-white">
                      {item.metricValueFormatted}
                    </div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      Cuota Mercado
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                      {item.marketSharePct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel de Inteligencia Competitiva & Estrategia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            Estrategia de Tarjetas Revolventes
          </div>
          <p className="text-xs text-slate-300">
            Ficohsa y BAC dominan el 60% de las tarjetas con alianzas en combustible y cuotas sin intereses. Áureo Bank compite con la <strong>Tarjeta Garantizada por DPF</strong>: límite del 90%-95%, cuota mensual de L. 0.00, pago mínimo del 5% y 0% de RWA.
          </p>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('back_to_back')}
              className="text-xs text-amber-400 font-semibold flex items-center gap-1 hover:text-amber-300 pt-1"
            >
              Emitir Tarjeta Garantizada <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            Banca Privada J.P. Morgan Benchmark
          </div>
          <p className="text-xs text-slate-300">
            La banca patrimonial exige mandatos de inversión fiduciaria y custodia DPF con retornos netos superiores al 8.5% anual. Capta familias de alto patrimonio y fideicomisos inmobiliarios para escalar en el ranking de AUM.
          </p>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('syndicated_lending')}
              className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300 pt-1"
            >
              Estructurar Sindicados & Fideicomisos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Disputa Territorial Multi-Banco
          </div>
          <p className="text-xs text-slate-300">
            Lanza campañas ofensivas en Cortés contra Ficohsa y en Francisco Morazán contra Atlántida. Conquista cuota de mercado en sucursales y adquirencia POS para ingresar al podio Top 3.
          </p>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('competitor_arena')}
              className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300 pt-1"
            >
              Ir a la Arena Territorial <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
