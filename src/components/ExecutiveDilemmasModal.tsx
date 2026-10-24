import React, { useState } from 'react';
import { GameState, ExecutiveDilemma, DilemmaOption } from '../game/types';
import { 
  formatHNL, 
  resolveExecutiveDilemma, 
  triggerReputationalCrisisSimulation, 
  resolveReputationalCrisis 
} from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Flame, 
  FileCheck2, 
  Vote, 
  Briefcase,
  History,
  Radio
} from 'lucide-react';

interface ExecutiveDilemmasModalProps {
  state: GameState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const ExecutiveDilemmasModal: React.FC<ExecutiveDilemmasModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdateState
}) => {
  const dilemmasState = state.executiveDilemmas;
  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>(
    dilemmasState?.activeDilemmaId || 'dil-01'
  );
  const [activeTab, setActiveTab] = useState<'deliberacion' | 'crisis' | 'historial'>('deliberacion');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen || !dilemmasState) return null;

  const dilemmas = dilemmasState.dilemmas || [];
  const activeDilemma = dilemmas.find(d => d.id === selectedDilemmaId) || dilemmas[0];
  const pendingCount = dilemmas.filter(d => d.status === 'pendiente').length;
  const resolvedCount = dilemmas.filter(d => d.status === 'resuelto').length;

  const handleResolveOption = (dilemmaId: string, optionId: string) => {
    sound.playInvest();
    const res = resolveExecutiveDilemma(state, dilemmaId, optionId);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleTriggerCrisis = () => {
    sound.playAlert();
    const res = triggerReputationalCrisisSimulation(state);
    onUpdateState(res.updatedState);
    setActiveTab('crisis');
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleResolveCrisis = (strategy: 'transparencia_inmediata' | 'comunicado_juridico' | 'auditoria_externa') => {
    sound.playClick();
    const res = resolveReputationalCrisis(state, strategy);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 font-semibold uppercase tracking-wider">Gobernanza Corporativa</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Junta Directiva de Áureo Bank</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Dilemas Ejecutivos, Éticos y Simulador de Crisis de Directorio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400">Reputación:</span>{' '}
                <span className="font-bold text-amber-300">{dilemmasState.publicReputationScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Confianza CNBS:</span>{' '}
                <span className="font-bold text-emerald-400">{dilemmasState.complianceTrustScore}/100</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación temporal de éxito */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-amber-400 font-mono text-xs">✕</button>
          </div>
        )}

        {/* Pestañas Superiores */}
        <div className="px-6 pt-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('deliberacion')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'deliberacion'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Sesión de Directorio ({pendingCount} pendientes)
            </button>

            <button
              onClick={() => setActiveTab('crisis')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'crisis'
                  ? 'border-rose-400 text-rose-300 bg-rose-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Comité de Crisis {dilemmasState.crisisActive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'historial'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Libro de Actas y Resoluciones ({resolvedCount})
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Multas CNBS acumuladas: <span className="text-rose-400 font-bold">{formatHNL(dilemmasState.accumulatedFinesHNL)}</span>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'deliberacion' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lista Lateral de Dilemas */}
              <div className="lg:col-span-4 space-y-2 border-r border-slate-800 pr-0 lg:pr-4">
                <div className="text-xs font-bold text-slate-400 mb-2">Expedientes en Agenda:</div>
                <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                  {dilemmas.map(dil => {
                    const isSelected = dil.id === activeDilemma.id;
                    const isPending = dil.status === 'pendiente';

                    return (
                      <button
                        key={dil.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedDilemmaId(dil.id);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[10px] text-amber-400 font-bold">
                            DILEMA #{dil.number}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {isPending ? 'Pendiente Voto' : 'Resuelto en Acta'}
                          </span>
                        </div>
                        <div className="font-semibold line-clamp-2 text-white">
                          {dil.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 capitalize">
                          {dil.category.replace(/_/g, ' ')} · Urgencia: {dil.urgency}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle del Dilema Seleccionado y Opciones de Votación */}
              <div className="lg:col-span-8 space-y-4">
                {activeDilemma && (
                  <div className="space-y-4">
                    {/* Tarjeta del Contexto */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-amber-400 font-bold">EXP-{activeDilemma.id.toUpperCase()}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 capitalize">{activeDilemma.category.replace(/_/g, ' ')}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-rose-400 font-semibold">{activeDilemma.urgency}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          Mes de Detección: {activeDilemma.month}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {activeDilemma.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeDilemma.detailedContext}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Marco Regulatorio:</span>{' '}
                          <span className="text-slate-200 font-mono">{activeDilemma.regulatoryArticle}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Actores Involucrados:</span>{' '}
                          <span className="text-slate-300">{activeDilemma.stakeholders.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Opciones de Resolución y Voto */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Opciones Resolutivas para la Junta Directiva:</span>
                        {activeDilemma.status === 'resuelto' && (
                          <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Este dilema ya fue resuelto y asentado en acta.
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {activeDilemma.options.map(option => {
                          const isChosen = activeDilemma.chosenOptionId === option.id;

                          return (
                            <div
                              key={option.id}
                              className={`rounded-xl border p-4 space-y-3 transition-all ${
                                isChosen
                                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                                <div className="font-bold text-white text-sm">
                                  {option.title}
                                </div>
                                <div className="text-xs font-mono text-amber-400">
                                  Apoyo de Directores: {option.directorsVotesApprovalPct}%
                                </div>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">
                                {option.description}
                              </p>

                              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                                <span className="font-semibold text-amber-400">Consecuencia Principal:</span>{' '}
                                {option.consequencesSummary}
                              </div>

                              {/* Desglose de Impacto Financiero y Regulatorio */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                                <div>
                                  <div className="text-slate-400">Impacto Utilidad:</div>
                                  <div className={`font-bold ${option.impactFinancials.profitDeltaHNL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {option.impactFinancials.profitDeltaHNL >= 0 ? '+' : ''}{formatHNL(option.impactFinancials.profitDeltaHNL)}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-slate-400">Impacto CAR CNBS:</div>
                                  <div className={`font-bold ${option.impactFinancials.carDeltaBps >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {option.impactFinancials.carDeltaBps >= 0 ? '+' : ''}{(option.impactFinancials.carDeltaBps / 100).toFixed(2)}%
                                  </div>
                                </div>

                                <div>
                                  <div className="text-slate-400">Multa CNBS:</div>
                                  <div className={`font-bold ${option.impactFinancials.cnbsFineHNL ? 'text-rose-400' : 'text-slate-300'}`}>
                                    {option.impactFinancials.cnbsFineHNL ? formatHNL(option.impactFinancials.cnbsFineHNL) : 'L. 0.00'}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-slate-400">Riesgo Auditoría:</div>
                                  <div className="text-slate-200 font-bold">
                                    {option.impactCompliance.cnbsAuditRiskLevel}
                                  </div>
                                </div>
                              </div>

                              {/* Botón de Votación */}
                              {activeDilemma.status === 'pendiente' ? (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={() => handleResolveOption(activeDilemma.id, option.id)}
                                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                                  >
                                    <Vote className="w-3.5 h-3.5" /> Ratificar Resolución en Acta
                                  </button>
                                </div>
                              ) : isChosen ? (
                                <div className="text-right text-xs font-mono text-emerald-400 font-bold pt-1">
                                  ✓ Opción Aprobada por la Junta Directiva
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 2: SIMULADOR DE CRISIS */}
          {activeTab === 'crisis' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Simulador de Crisis Reputacional y Tensión de Liquidez
                  </div>
                  <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    dilemmasState.crisisActive ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {dilemmasState.crisisActive ? 'CRISIS ACTIVA - ALTA TENSIÓN' : 'OPERACIÓN NORMAL'}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Permite someter a prueba la estabilidad de la institución ante rumores en redes sociales, noticias falsas o ataques de la competencia sobre la solidez de Áureo Bank. Evalúa la rapidez de respuesta ejecutiva y el impacto en la retención de depósitos del público.
                </p>

                {!dilemmasState.crisisActive ? (
                  <div className="pt-2">
                    <button
                      onClick={handleTriggerCrisis}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                    >
                      <Flame className="w-4 h-4" /> Iniciar Simulacro de Crisis Reputacional
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 text-xs text-rose-200 space-y-2">
                      <div className="font-bold text-rose-300">¡Alerta de Gabinete de Crisis en Marcha!</div>
                      <p>
                        Se registran filas inusuales en sucursales de San Pedro Sula y solicitudes de retiros masivos por banca digital. Selecciona la estrategia de contingencia para desactivar la corrida de depósitos:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">1. Transparencia Inmediata</div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            Rueda de prensa televisada en vivo con el Presidente Ejecutivo y cifras auditadas de encaje legal en el BCH.
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono mt-2">
                            Costo: L. 450,000 · Recuperación: +15 pts
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveCrisis('transparencia_inmediata')}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          Ejecutar Rueda de Prensa
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">2. Certificación Externa Big 4</div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            Contratar a Deloitte & Touche y solicitar boletín urgente de solvencia del Banco Central de Honduras.
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono mt-2">
                            Costo: L. 1,200,000 · Recuperación: +18 pts
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveCrisis('auditoria_externa')}
                          className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                        >
                          Certificación Big 4
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">3. Comunicado Legal y Firmeza</div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            Publicación en medios escritos advirtiendo acciones penales por difamación financiera según la Ley del Sistema Financiero.
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono mt-2">
                            Costo: L. 150,000 · Recuperación: +8 pts
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveCrisis('comunicado_juridico')}
                          className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
                        >
                          Comunicado Legal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: HISTORIAL DE ACTAS */}
          {activeTab === 'historial' && (
            <div className="space-y-3">
              {resolvedCount === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                  No se han resuelto dilemas de la Junta Directiva aún. Puedes deliberar y votar en la pestaña "Sesión de Directorio".
                </div>
              ) : (
                dilemmas.filter(d => d.status === 'resuelto').map(d => {
                  const chosenOpt = d.options.find(o => o.id === d.chosenOptionId);

                  return (
                    <div key={d.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="font-bold text-white text-sm">
                          {d.title}
                        </div>
                        <div className="font-mono text-emerald-400 text-xs">
                          Resuelto en Mes {d.resolvedAtMonth || 1}
                        </div>
                      </div>

                      <div className="text-slate-300">
                        <span className="text-slate-400">Resolución Aprobada:</span>{' '}
                        <span className="font-bold text-amber-300">{chosenOpt?.title}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/60">
                        {chosenOpt?.consequencesSummary}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
