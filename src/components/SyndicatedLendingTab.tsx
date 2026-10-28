import React, { useState } from 'react';
import { GameState, SyndicatedLoanDeal } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Briefcase, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface SyndicatedLendingTabProps {
  state: GameState;
  onStructureDeal: (dealId: string, playerRole: 'Lead Arranger' | 'Participant', commitmentHNL?: number) => void;
}

export const SyndicatedLendingTab: React.FC<SyndicatedLendingTabProps> = ({
  state,
  onStructureDeal
}) => {
  const syndicatedState = state.syndicatedLending;
  const deals: SyndicatedLoanDeal[] = syndicatedState?.activeDeals || [];

  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState<'Lead Arranger' | 'Participant'>('Lead Arranger');

  const activeDeal = deals.find(d => d.id === selectedDealId) || deals[0];

  const totalVolume = syndicatedState?.totalSyndicatedVolumeOriginatedHNL || 0;
  const totalArrangerFees = syndicatedState?.totalArrangerFeesCollectedHNL || 0;

  const handleExecuteDeal = () => {
    if (!activeDeal) return;
    sound.playVictoryFanfare();
    onStructureDeal(activeDeal.id, selectedRole);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Institucional: Syndicated Finance J.P. Morgan Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wide">
                Banca de Inversión Corporativa & Sindicados
              </span>
              <span className="text-xs font-mono text-slate-400">
                Modelo J.P. Morgan Chase & Bancos Multilaterales
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Préstamos Sindicados Multimillonarios (Lead Arranger)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Origina mega-facilidades crediticias para grandes consorcios energéticos, portuarios e industriales de Honduras. Como <strong>Lead Arranger</strong> (Banco Estructurador), cobra comisiones upfront del 1.5% al 2.5% del volumen total mientras sindicas el riesgo entre bancos competidores.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Comisiones Estructuradoras Cobradas</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{formatHNL(totalArrangerFees)}
              </div>
              <div className="text-[10px] text-slate-400">
                Volumen Sindicado: {formatHNL(totalVolume)}
              </div>
            </div>
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Lista de Operaciones Sindicadas vs Panel de Estructuración */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Mega-Deals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Cartera de Facilidades Sindicadas Corporativas
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {deals.length} operaciones
              </span>
            </div>

            <div className="space-y-3">
              {deals.map((deal) => {
                const isSelected = deal.id === selectedDealId;
                const isClosed = deal.status === 'cerrado_vigente';
                const isLead = deal.isPlayerLeadArranger;

                return (
                  <div
                    key={deal.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDealId(deal.id);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-purple-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-400">{deal.id}</span>
                          <span className="text-slate-600">·</span>
                          <h3 className="text-xs font-bold text-white">{deal.projectTitle}</h3>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Acreditado: <strong className="text-slate-200">{deal.borrowerCompany}</strong> ({deal.industrySector})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-white">
                          Total: {formatHNL(deal.totalFacilityAmountHNL)}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5">
                          {isClosed ? (
                            <span className="text-emerald-400 flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3 h-3" /> Cerrado & Vigente
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" /> Abierto a Sindicación
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div>
                        <span>Lead Arranger:</span>
                        <strong className="block text-slate-200 truncate">{deal.leadArrangerBankName}</strong>
                      </div>
                      <div>
                        <span>Tasa Activa:</span>
                        <strong className="block text-blue-400 font-mono">{deal.interestRateAnnualPct}% ({deal.termYears} años)</strong>
                      </div>
                      <div>
                        <span>Comisión Arranger:</span>
                        <strong className="block text-emerald-400 font-mono">{deal.arrangerFeePct}% ({formatHNL(deal.totalFacilityAmountHNL * (deal.arrangerFeePct / 100))})</strong>
                      </div>
                      <div>
                        <span>Retención Áureo:</span>
                        <strong className="block text-slate-200 font-mono">{formatHNL(deal.playerCommitmentAmountHNL)}</strong>
                      </div>
                    </div>

                    {/* Bancos participantes en el sindicato */}
                    <div className="pt-2 border-t border-slate-800/60">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">
                        Sindicato de Bancos Suscriptores:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {deal.participatingBanks.map((b, bIdx) => (
                          <span 
                            key={bIdx}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              b.role === 'Lead Arranger'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                                : 'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {b.bankName} ({b.sharePct.toFixed(1)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Estructuración & Ejecución */}
        <div className="lg:col-span-5 space-y-4">
          {activeDeal && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Estructuración: {activeDeal.projectTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decide el rol de Áureo Bank en esta operación corporativa.
                </p>
              </div>

              {/* Selector de Rol */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Rol del Banco en el Sindicato
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('Lead Arranger')}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedRole === 'Lead Arranger'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      Lead Arranger
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Cobra el {activeDeal.arrangerFeePct}% fee y coordina el consorcio.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('Participant')}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedRole === 'Participant'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Participante
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Financia una cuota menor sin liderar la estructura.
                    </div>
                  </button>
                </div>
              </div>

              {/* Cuadro de Liquidación del Deal */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Global del Crédito:</span>
                  <span className="font-mono font-bold text-white">{formatHNL(activeDeal.totalFacilityAmountHNL)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tasa Activa Anual:</span>
                  <span className="font-mono text-blue-400 font-bold">{activeDeal.interestRateAnnualPct}% (Plazo {activeDeal.termYears} años)</span>
                </div>

                {selectedRole === 'Lead Arranger' ? (
                  <div className="flex justify-between p-2 bg-emerald-950/30 border border-emerald-800/40 rounded">
                    <span className="text-emerald-300 font-semibold">Comisión Estructuradora Upfront:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{formatHNL(activeDeal.totalFacilityAmountHNL * (activeDeal.arrangerFeePct / 100))} ({activeDeal.arrangerFeePct}%)
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-300">Comisión Upfront:</span>
                    <span className="font-mono text-slate-400">L. 0.00 (Solo banco Lead Arranger)</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-400">Compromiso Financiero de Áureo:</span>
                  <span className="font-mono text-slate-200">
                    {formatHNL(selectedRole === 'Lead Arranger' ? Math.round(activeDeal.totalFacilityAmountHNL * 0.35) : Math.round(activeDeal.totalFacilityAmountHNL * 0.15))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteDeal}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                {selectedRole === 'Lead Arranger'
                  ? `Cerrar Deal como Lead Arranger (+${formatHNL(activeDeal.totalFacilityAmountHNL * (activeDeal.arrangerFeePct / 100))} Fee)`
                  : 'Suscribir Participación en el Sindicato'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
