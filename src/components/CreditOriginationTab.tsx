import React, { useState } from 'react';
import { GameState, CreditApplication, BankingDivisionId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  FileText, 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Building, 
  UserCheck, 
  MapPin, 
  Briefcase, 
  BadgeAlert, 
  Scale,
  Users,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface CreditOriginationTabProps {
  state: GameState;
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string) => void;
  onUpdateAdvisorLimit: (newLimit: number) => void;
}

export const CreditOriginationTab: React.FC<CreditOriginationTabProps> = ({
  state,
  onApproveApplication,
  onRejectApplication,
  onUpdateAdvisorLimit
}) => {
  const [filterDivision, setFilterDivision] = useState<string>('all');

  const creditOfficersCount = state.staff.find(s => s.id === 'oficiales_credito')?.count || 20;
  const limitPerAdvisor = state.advisorMonthlyLimitPerAdvisor || 25;
  const totalCapacityMonthly = creditOfficersCount * limitPerAdvisor;
  const usedThisMonth = state.advisorApprovalsUsedThisMonth || 0;
  const remainingApprovals = Math.max(0, totalCapacityMonthly - usedThisMonth);
  const isCapacityExhausted = remainingApprovals <= 0;

  const filteredApps = state.pendingApplications.filter(app => {
    if (filterDivision === 'all') return true;
    return app.division === filterDivision;
  });

  const handleApprove = (id: string) => {
    if (isCapacityExhausted) {
      sound.playRejectBuzzer();
      alert('Se ha alcanzado la cuota mensual de aprobaciones de los oficiales de crédito. Contrata más oficiales en la pestaña de Talento o avanza al siguiente mes.');
      return;
    }
    sound.playApprovalStamp();
    onApproveApplication(id);
  };

  const handleReject = (id: string) => {
    sound.playRejectBuzzer();
    onRejectApplication(id);
  };

  return (
    <div className="space-y-6">
      {/* 1. Encabezado y Capacidad de Aprobación por Asesores de Crédito (12 - 50 transacciones) */}
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
              Bandeja de solicitudes de financiamiento. Evalúa el scoring de buró crediticio, relación cuota/ingreso (DTI) y normativas de la CNBS antes de autorizar.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Expedientes en Bandeja:</span>
            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
              {state.pendingApplications.length} pendientes
            </span>
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
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                  SIN LÍMITE DE MONTO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cada uno de los <strong>{creditOfficersCount} oficiales</strong> tiene un límite mensual regulado para aprobar entre 12 y 50 expedientes sin restricción de monto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Control Deslizante de Límite por Asesor (12 a 50) */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Límite por Oficial:</span>
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
              <div className="text-[10px] text-slate-400">Cuota Mensual del Banco:</div>
              <div className={`text-sm font-bold ${isCapacityExhausted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {usedThisMonth} / {totalCapacityMonthly} transacciones
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de Pestaña */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
          {[
            { id: 'all', label: 'Todos los Expedientes' },
            { id: 'personas', label: 'Banca Personas' },
            { id: 'premier', label: 'Banca Premier' },
            { id: 'pyme', label: 'Banca PYME' },
            { id: 'corporativa', label: 'Banca Corporativa' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setFilterDivision(f.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterDivision === f.id
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lista de Expedientes de Crédito */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Check className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Bandeja de Originación al Día</h3>
          <p className="text-xs max-w-md mx-auto text-slate-400">
            No hay solicitudes pendientes en este segmento. Al avanzar al siguiente mes contable, el equipo de oficiales remitirá nuevos expedientes del mercado hondureño.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map(app => {
            const isHighRisk = app.riskVerdict === 'Alto Riesgo';
            const isModerateRisk = app.riskVerdict === 'Riesgo Moderado';
            const isLowRisk = app.riskVerdict === 'Bajo Riesgo';

            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Fila Superior: Solicitante y División */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {app.applicantName}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {app.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">{app.productType}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{app.location}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-emerald-400 block">
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
                      <span className="text-slate-500 text-[10px] block">Categoría CNBS:</span>
                      <span className="font-bold text-white">{app.cnbsCategory.split(' ')[0]}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic mb-2">
                    {app.reasonText}
                  </p>
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
                      onClick={() => handleReject(app.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>

                    <button
                      disabled={isCapacityExhausted}
                      onClick={() => handleApprove(app.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                        isCapacityExhausted 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                      title={isCapacityExhausted ? 'Límite de capacidad mensual alcanzado' : 'Aprobar y desembolsar'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar Crédito</span>
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
