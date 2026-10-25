import React, { useState } from 'react';
import { GameState, CreditApplication, BankingDivisionId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  FileText, 
  Check, 
  X, 
  ShieldCheck, 
  Building, 
  UserCheck, 
  MapPin, 
  Briefcase, 
  BadgeAlert, 
  Scale,
  Users,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';

interface CreditOriginationTabProps {
  state: GameState;
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string) => void;
  onUpdateAdvisorLimit: (newLimit: number) => void;
  onUpdateAdvisorAmountThreshold?: (newThresholdHNL: number) => void;
  onAutoEvaluateOfficerApps?: () => void;
}

export const CreditOriginationTab: React.FC<CreditOriginationTabProps> = ({
  state,
  onApproveApplication,
  onRejectApplication,
  onUpdateAdvisorLimit,
  onUpdateAdvisorAmountThreshold,
  onAutoEvaluateOfficerApps
}) => {
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const advisorThreshold = state.advisorAutoApprovalThresholdHNL ?? 20000000;
  const creditOfficersCount = state.staff.find(s => s.id === 'oficiales_credito')?.count || 20;
  const limitPerAdvisor = state.advisorMonthlyLimitPerAdvisor || 25;
  const totalCapacityMonthly = creditOfficersCount * limitPerAdvisor;
  const usedThisMonth = state.advisorApprovalsUsedThisMonth || 0;
  const remainingApprovals = Math.max(0, totalCapacityMonthly - usedThisMonth);
  const isCapacityExhausted = remainingApprovals <= 0;

  const filteredApps = state.pendingApplications.filter(app => {
    if (filterDivision === 'all') return true;
    if (filterDivision === 'underThreshold') return app.requestedAmount <= advisorThreshold;
    if (filterDivision === 'overThreshold') return app.requestedAmount > advisorThreshold;
    return app.division === filterDivision;
  });

  const handleApprove = (id: string, name: string, amount: number) => {
    const isMega = amount > advisorThreshold;
    if (isCapacityExhausted && !isMega) {
      sound.playRejectBuzzer();
      setToastMessage('Capacidad mensual de los oficiales agotada para este mes.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    sound.playApprovalStamp();
    onApproveApplication(id);
    setToastMessage(`¡Crédito de ${formatHNL(amount)} aprobado de inmediato para ${name}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    sound.playRejectBuzzer();
    onRejectApplication(id);
    setToastMessage(`Solicitud de ${name} rechazada formalmente.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    sound.playClick();
    if (onUpdateAdvisorAmountThreshold) {
      onUpdateAdvisorAmountThreshold(val);
    }
  };

  // Dictamen y Aprobación Automática de Oficiales
  const handleAutoProcessOfficer = () => {
    sound.playApprovalStamp();
    if (onAutoEvaluateOfficerApps) {
      onAutoEvaluateOfficerApps();
    } else {
      const eligible = state.pendingApplications.filter(a => a.requestedAmount <= advisorThreshold);
      let count = 0;
      eligible.forEach(app => {
        const isApprovable = app.equifaxScore >= 600 && app.calculatedDTI <= 45 && (app.cnbsCategory === 'I - Normal' || app.cnbsCategory === 'II - Especial');
        if (isApprovable && count < remainingApprovals) {
          onApproveApplication(app.id);
          count++;
        } else if (!isApprovable) {
          onRejectApplication(app.id);
        }
      });
      setToastMessage(`Los oficiales evaluaron y dictaminaron ${eligible.length} solicitudes bajo la autonomía delegada.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const appsUnderThresholdCount = state.pendingApplications.filter(a => a.requestedAmount <= advisorThreshold).length;
  const appsOverThresholdCount = state.pendingApplications.filter(a => a.requestedAmount > advisorThreshold).length;

  return (
    <div className="space-y-6">
      {/* Toast Flotante de Respuesta Inmediata */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 border border-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Encabezado y Capacidad de Aprobación por Asesores de Crédito */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Mesa de Originación y Evaluación de Crédito
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Los <strong>Oficiales de Crédito</strong> evalúan y aprueban solicitudes hasta <strong className="text-emerald-400">{formatHNL(advisorThreshold)}</strong> de forma autónoma. Los montos superiores requieren dictamen de la Junta Directiva y Presidencia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={handleAutoProcessOfficer}
              disabled={appsUnderThresholdCount === 0 || isCapacityExhausted}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                appsUnderThresholdCount === 0 || isCapacityExhausted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95'
              }`}
              title={`Aprobar o rechazar automáticamente solicitudes hasta ${formatHNL(advisorThreshold)}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>⚡ Dictamen Automático Oficiales (Hasta {formatHNL(advisorThreshold)})</span>
            </button>

            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
              {appsOverThresholdCount} casos Comité (&gt; {formatHNL(advisorThreshold)})
            </span>
          </div>
        </div>

        {/* Control en Tiempo Real del Monto Delegado a Asesores (Hasta L. 50M) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomía Delegada a Asesores de Crédito:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                Hasta {formatHNL(advisorThreshold)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Rango configurable en tiempo real: L. 5,000,000 a L. 50,000,000
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min={5000000}
              max={50000000}
              step={2500000}
              value={advisorThreshold}
              onChange={handleSliderChange}
              className="w-full accent-emerald-500 bg-slate-900 rounded h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>L. 5M (Estricto)</span>
              <span>L. 20M (Base)</span>
              <span>L. 35M (Recomendado)</span>
              <span className="text-emerald-400 font-bold">L. 50M (Máxima Autonomía)</span>
            </div>
          </div>
        </div>

        {/* Widget de Capacidad Operativa de Asesores de Crédito */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Capacidad Operativa de Oficiales de Crédito</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-semibold">
                  AUTONOMÍA HASTA {formatHNL(advisorThreshold)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Los <strong>{creditOfficersCount} oficiales</strong> analizan DTI, garantías y buró Equifax. Si el monto supera {formatHNL(advisorThreshold)}, se remite a Presidencia con informe técnico.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Control Deslizante de Límite por Asesor */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Cupo mensual/Oficial:</span>
              <select
                value={limitPerAdvisor}
                onChange={e => {
                  sound.playClick();
                  onUpdateAdvisorLimit(Number(e.target.value));
                }}
                className="bg-transparent text-amber-300 font-bold font-mono text-xs focus:outline-none"
              >
                {[12, 15, 20, 25, 30, 35, 40, 45, 50].map(val => (
                  <option key={val} value={val} className="bg-slate-900 text-white">
                    {val} aprobaciones/mes
                  </option>
                ))}
              </select>
            </div>

            {/* Contador de Cuota Mensual */}
            <div className="font-mono text-right">
              <div className="text-[10px] text-slate-400">Capacidad Mensual:</div>
              <div className={`text-sm font-bold ${isCapacityExhausted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {usedThisMonth} / {totalCapacityMonthly} aprobaciones
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de Pestaña */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
          {[
            { id: 'all', label: `Todos (${state.pendingApplications.length})` },
            { id: 'underThreshold', label: `Hasta ${formatHNL(advisorThreshold)} - Oficial (${appsUnderThresholdCount})` },
            { id: 'overThreshold', label: `Más de ${formatHNL(advisorThreshold)} - Comité (${appsOverThresholdCount})` },
            { id: 'personas', label: 'Personas' },
            { id: 'premier', label: 'Premier' },
            { id: 'pyme', label: 'PYME' },
            { id: 'corporativa', label: 'Corporativa' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setFilterDivision(f.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterDivision === f.id
                  ? 'bg-slate-800 text-amber-300 border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lista de Solicitudes Pendientes */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
          No hay solicitudes de crédito pendientes en este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map(app => {
            const isMegaLoan = app.requestedAmount > advisorThreshold;
            const isLowRisk = app.riskVerdict === 'Bajo Riesgo';
            const isModerateRisk = app.riskVerdict === 'Riesgo Moderado';
            const isHighRisk = app.riskVerdict === 'Alto Riesgo';

            const officerNoteText = app.officerNote || (
              isMegaLoan 
                ? `NOTA DEL OFICIAL: Solicitud de ${formatHNL(app.requestedAmount)} excede la autonomía técnica actual (${formatHNL(advisorThreshold)}). Calificación: ${app.equifaxScore} pts, DTI: ${app.calculatedDTI}%. Requiere resolución de Directorio.`
                : `Oficial de Crédito facultado bajo autonomía de ${formatHNL(advisorThreshold)}. Viabilidad técnica aprobada con garantía ${app.collateralType}.`
            );

            const officerRec = isMegaLoan ? 'Elevado a Comité Superior' : (app.officerRecommendation || 'Favorable (Aprobación Sugerida)');

            return (
              <div 
                key={app.id} 
                className={`bg-slate-900 border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isMegaLoan ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/10' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Encabezado de la Solicitud */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{app.applicantName}</span>
                        {isMegaLoan ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Comité &gt; {formatHNL(advisorThreshold)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                            ✓ Autonomía Oficial
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {app.location}
                        </span>
                        <span>·</span>
                        <span className="capitalize text-slate-300 font-medium">{app.productType}</span>
                        <span>·</span>
                        <span className="uppercase text-amber-400/80 font-mono text-[10px] font-semibold">{app.division}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-emerald-400 font-mono block">
                        {formatHNL(app.requestedAmount)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {app.termMonths} meses · {app.proposedRate}% anual
                      </span>
                    </div>
                  </div>

                  {/* Diagnóstico de Riesgo y Buró Crediticio */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono mb-3">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Equifax Score:</span>
                      <span className={`font-bold ${app.equifaxScore >= 700 ? 'text-emerald-400' : app.equifaxScore >= 600 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {app.equifaxScore} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">DTI (Cuota/Ingreso):</span>
                      <span className={`font-bold ${app.calculatedDTI <= 40 ? 'text-emerald-400' : app.calculatedDTI <= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {app.calculatedDTI}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Garantía:</span>
                      <span className="font-bold text-white truncate block text-[11px]" title={app.collateralType}>
                        {app.collateralType}
                      </span>
                    </div>
                  </div>

                  {/* Dictamen e Informe del Oficial de Crédito */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Dictamen del Oficial de Crédito:
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        officerRec.includes('Favorable') ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        officerRec.includes('Condicionado') ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {officerRec}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{officerNoteText}"
                    </p>
                  </div>
                </div>

                {/* Botones de Aprobación / Rechazo */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    {isLowRisk && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Bajo Riesgo</span>
                      </span>
                    )}
                    {isModerateRisk && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <Scale className="w-3 h-3" />
                        <span>Riesgo Moderado</span>
                      </span>
                    )}
                    {isHighRisk && (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        <BadgeAlert className="w-3 h-3" />
                        <span>Alto Riesgo CNBS</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(app.id, app.applicantName)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isMegaLoan ? 'Rechazar Comité' : 'Rechazar'}</span>
                    </button>

                    <button
                      disabled={isCapacityExhausted && !isMegaLoan}
                      onClick={() => handleApprove(app.id, app.applicantName, app.requestedAmount)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                        isMegaLoan
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                          : isCapacityExhausted 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                      title={isMegaLoan ? 'Autorización ejecutiva de la Presidencia' : 'Aprobación operativa del oficial'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMegaLoan ? 'Aprobar por Comité' : 'Aprobar de Inmediato'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
