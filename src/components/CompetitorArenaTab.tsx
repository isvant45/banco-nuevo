import React, { useState } from 'react';
import { GameState, DepartmentTerritoryMarket, CompetitorCounterattackEvent } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  MapPin, 
  Swords, 
  ShieldAlert, 
  Flame, 
  TrendingUp, 
  Building2, 
  Percent, 
  Zap,
  Target,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface CompetitorArenaTabProps {
  state: GameState;
  onExecuteOffensive: (
    departmentId: string, 
    offensiveType: 'tasas_agresivas' | 'tarjetas_promocionales' | 'captacion_masiva'
  ) => void;
}

export const CompetitorArenaTab: React.FC<CompetitorArenaTabProps> = ({
  state,
  onExecuteOffensive
}) => {
  const territory = state.territoryCompetition;
  const departments = territory?.departments || [];
  const counterattacks = territory?.recentCounterattacks || [];

  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'cortes');
  const [selectedOffensive, setSelectedOffensive] = useState<'tasas_agresivas' | 'tarjetas_promocionales' | 'captacion_masiva'>('tarjetas_promocionales');

  const activeDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const handleLaunchCampaign = () => {
    if (!activeDept) return;
    sound.playApprovalStamp();
    onExecuteOffensive(activeDept.id, selectedOffensive);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Arena de Competencia */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 uppercase tracking-wide">
                Arena de Rivalidad & Guerra de Cuota
              </span>
              <span className="text-xs font-mono text-slate-400">
                5 Competidores Sistémicos: Atlántida · Ficohsa · BAC · Banpaís · Occidente
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Tablero de Control Territorial & Contraofensivas AI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Disputa los principales polos económicos de Honduras: San Pedro Sula, Tegucigalpa, La Ceiba, Roatán y el Occidente. Lanza ofensivas comerciales para arrebatar cuota a los bancos hegemónicos.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Cuota Nacional Promedio</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {territory?.totalMarketShareNationalPct || 7.2}%
            </div>
            <div className="text-[10px] text-slate-400">
              Objetivo: Alcanzar &gt;12.0% para el podio
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Territorios Departamentales vs Panel de Lanzamiento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Lista de Territorios Departamentales */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Territorios Económicos de Honduras
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {departments.length} plazas disputadas
              </span>
            </div>

            <div className="space-y-3">
              {departments.map((dept) => {
                const isSelected = dept.id === selectedDeptId;
                const playerShare = dept.playerMarketSharePct;
                const leadShare = dept.leadingBankSharePct;

                return (
                  <div
                    key={dept.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDeptId(dept.id);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                          {dept.offensiveCampaignActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/30 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-red-400 animate-pulse" /> Ofensiva Activa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {dept.economicFocus}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-emerald-400">
                          Áureo: {playerShare}% cuota
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Líder: {dept.leadingBankName} ({leadShare}%)
                        </div>
                      </div>
                    </div>

                    {/* Barra comparativa de cuotas */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>Áureo Bank ({playerShare}%)</span>
                        <span>{dept.leadingBankName} ({leadShare}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${playerShare}%` }} 
                        />
                        <div 
                          className="bg-slate-700 h-full opacity-30" 
                          style={{ width: `${Math.max(0, 100 - playerShare - leadShare)}%` }} 
                        />
                        <div 
                          className="bg-red-500/80 h-full transition-all duration-500" 
                          style={{ width: `${leadShare}%` }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div>
                        <span>Mercado Depósitos:</span>{' '}
                        <strong className="text-slate-200 font-mono">{formatHNL(dept.totalMarketDepositsHNL)}</strong>
                      </div>
                      <div>
                        <span>Mercado Créditos:</span>{' '}
                        <strong className="text-slate-200 font-mono">{formatHNL(dept.totalMarketLoansHNL)}</strong>
                      </div>
                      <div>
                        <span>Red Física Áureo:</span>{' '}
                        <strong className="text-slate-200">{dept.branchesPlayerCount} agencias · {dept.atmPlayerCount} ATMs</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Lanzar Ofensiva de Mercado & Feed de Contraataques AI */}
        <div className="lg:col-span-5 space-y-4">
          {/* Formulario de Ofensiva Comercial */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Desplegar Ofensiva en {activeDept?.name.split(' (')[0] || 'Territorio'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Invierte presupuesto de marketing para conquistar clientes y arrebatarle cartera a {activeDept?.leadingBankName}.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Seleccionar Modalidad de Ataque
              </label>

              <button
                type="button"
                onClick={() => setSelectedOffensive('tarjetas_promocionales')}
                className={`w-full p-3 rounded-lg border text-left transition ${
                  selectedOffensive === 'tarjetas_promocionales'
                    ? 'bg-amber-500/10 border-amber-500/60 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white flex justify-between">
                  <span>Campaña de Tarjetas & Cashback Combustible</span>
                  <span className="font-mono text-emerald-400">+1.4% cuota</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Inversión: <strong className="text-slate-200">L. 2,200,000</strong> · Ataca directamente a Ficohsa y BAC.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOffensive('tasas_agresivas')}
                className={`w-full p-3 rounded-lg border text-left transition ${
                  selectedOffensive === 'tasas_agresivas'
                    ? 'bg-blue-500/10 border-blue-500/60 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white flex justify-between">
                  <span>Guerra de Tasas Activas para Pymes</span>
                  <span className="font-mono text-emerald-400">+1.1% cuota</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Inversión: <strong className="text-slate-200">L. 1,800,000</strong> · Compra cartera de Banco Atlántida.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOffensive('captacion_masiva')}
                className={`w-full p-3 rounded-lg border text-left transition ${
                  selectedOffensive === 'captacion_masiva'
                    ? 'bg-purple-500/10 border-purple-500/60 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white flex justify-between">
                  <span>Captación Masiva de DPFs y Cuentas Sueldo</span>
                  <span className="font-mono text-emerald-400">+0.9% cuota</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Inversión: <strong className="text-slate-200">L. 1,400,000</strong> · Saca liquidez de Banpaís y Occidente.
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleLaunchCampaign}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Lanzar Ofensiva Comercial en {activeDept?.capitalCity || 'Territorio'}
            </button>
          </div>

          {/* Feed de Contraataques Procedurales de la IA */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                Radar de Contraofensivas de Bancos Rivales
              </h2>
            </div>

            <div className="space-y-2.5">
              {counterattacks.map((cnt) => (
                <div 
                  key={cnt.id}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{cnt.rivalBankName}</span>
                    <span className="text-[10px] font-mono text-slate-500">Mes {cnt.month}</span>
                  </div>
                  <div className="font-semibold text-white">
                    {cnt.headline}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {cnt.impactSummary}
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                    🛡️ Defensa Áureo: {cnt.playerDefenseRecommended}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
