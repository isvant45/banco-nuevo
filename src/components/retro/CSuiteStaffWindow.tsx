import React, { useState } from 'react';
import { DailySimulationState, CSuiteExecutiveId } from '../../game/retroSimTypes';
import {
  CSUITE_CATALOG,
  hireExecutive,
  fireExecutive,
  calculateThreeTurnProjections,
  injectDirtyMoneyClandestine
} from '../../game/cSuiteEngine';
import { sound } from '../../game/audioFx';

interface CSuiteStaffWindowProps {
  simState: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onTriggerToast?: (toast: { title: string; message: string; type: 'success' | 'warning' | 'danger' | 'money'; amount?: number }) => void;
}

export const CSuiteStaffWindow: React.FC<CSuiteStaffWindowProps> = ({
  simState,
  onUpdateState,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'cfo_runway' | 'uif_compliance'>('roster');
  const staff = simState.cSuiteStaff || [];
  const hasCfo = staff.includes('CFO');
  const hasLawyer = staff.includes('ABOGADO');

  const projectionsData = calculateThreeTurnProjections(simState);
  const totalMonthlyPayroll = staff.reduce((acc, id) => acc + CSUITE_CATALOG[id].salaryMonthlyHNL, 0);

  const handleHire = (id: CSuiteExecutiveId) => {
    const res = hireExecutive(simState, id);
    if (res.success) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      if (onTriggerToast) {
        onTriggerToast({
          title: 'Ejecutivo C-Suite Contratado',
          message: res.message,
          type: 'success'
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handleFire = (id: CSuiteExecutiveId) => {
    if (confirm(`¿Confirmas la destitución de ${CSUITE_CATALOG[id].title}? Se revocarán sus beneficios estratégicos.`)) {
      const res = fireExecutive(simState, id);
      if (res.success) {
        sound.playRejectBuzzer();
        onUpdateState(res.updatedState);
        if (onTriggerToast) {
          onTriggerToast({
            title: 'Ejecutivo Destituido',
            message: res.message,
            type: 'warning'
          });
        }
      }
    }
  };

  const handleInjectDarkMoney = () => {
    if (confirm('ADVERTENCIA: ¿Aceptar inyección clandestina de L 150,000 en efectivo? Elevará la sospecha de la UIF en +35%. Si el SAR o la Fiscalía te auditan y no tienes abogado, las multas y embargos serán devastadores.')) {
      const res = injectDirtyMoneyClandestine(simState, 150000, 35);
      if (res.success) {
        sound.playCaChing();
        onUpdateState(res.updatedState);
        if (onTriggerToast) {
          onTriggerToast({
            title: 'Dinero Clandestino Recibido',
            message: res.message,
            type: 'money',
            amount: 150000
          });
        }
      } else {
        sound.playRejectBuzzer();
        alert(res.message);
      }
    }
  };

  const suspicionScore = simState.uifSuspicionScore || 0;

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans select-none text-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 border-b-2 border-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <div>
            <h1 className="text-base font-black tracking-wide font-mono uppercase">
              Dirección Ejecutiva C-Suite & Recursos Humanos
            </h1>
            <p className="text-[11px] text-indigo-200">
              Estrategia Corporativa • Bonificaciones Matemáticas • Proyecciones del CFO
            </p>
          </div>
        </div>
        <div className="text-right font-mono bg-black/40 px-3 py-1.5 border border-white/20">
          <div className="text-[10px] text-gray-300 uppercase">Nómina Mensual C-Level</div>
          <div className="text-base font-black text-amber-300">
            L {totalMonthlyPayroll.toLocaleString('es-HN')} / mes
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-400 bg-gray-200 px-2 pt-1 gap-1">
        {[
          { id: 'roster', label: `👔 Gabinete Corporativo (${staff.length}/4)` },
          { id: 'cfo_runway', label: `📊 Proyecciones CFO (3 Meses) ${hasCfo ? '🟢' : '🔒'}` },
          { id: 'uif_compliance', label: `⚖️ Escudo Legal & UIF (${suspicionScore}% Riesgo)` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as typeof activeTab);
            }}
            className={`px-4 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
              activeTab === tab.id
                ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] text-blue-900'
                : 'bg-gray-300 border-gray-100 text-gray-700 hover:bg-gray-250'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#d4d0c8]">
        {/* TAB 1: ROSTER & CATALOG */}
        {activeTab === 'roster' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(CSUITE_CATALOG) as CSuiteExecutiveId[]).map(execId => {
                const config = CSUITE_CATALOG[execId];
                const isHired = staff.includes(execId);
                const canAfford = (simState.storeBankBalance + simState.storeCash) >= config.salaryMonthlyHNL;

                return (
                  <div
                    key={execId}
                    className={`bg-white p-3 border-2 ${
                      isHired
                        ? 'border-indigo-600 shadow-[inset_1px_1px_0px_#000]'
                        : 'border-gray-500 shadow-[2px_2px_0px_#888]'
                    } flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{config.icon}</span>
                          <div>
                            <span className="font-bold text-xs text-blue-900">{config.name}</span>
                            <div className="text-[10px] text-gray-500 font-mono">{config.badge}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                            isHired ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isHired ? 'En Funciones' : 'Vacante'}
                        </span>
                      </div>

                      <div className="text-gray-700 text-[11px] mb-2">{config.description}</div>

                      <div className="bg-gray-50 p-2 border border-gray-200 text-[11px] space-y-1">
                        <div className="font-bold text-gray-800 text-[10px] uppercase">Habilidades & Beneficios Activos:</div>
                        {config.perks.map((perk, i) => (
                          <div key={i} className="flex items-start gap-1 text-gray-600 leading-tight">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-300 flex items-center justify-between">
                      <div className="font-mono text-xs">
                        <span className="text-gray-500">Sueldo: </span>
                        <strong className="text-indigo-900">L {config.salaryMonthlyHNL.toLocaleString('es-HN')}</strong>
                        <span className="text-gray-500"> /mes</span>
                      </div>

                      {isHired ? (
                        <button
                          onClick={() => handleFire(execId)}
                          className="px-3 py-1 font-bold font-sans text-xs bg-red-700 hover:bg-red-800 text-white border border-red-950 shadow-[1px_1px_0px_#000] active:translate-y-0.5 cursor-pointer"
                        >
                          Destituir Cargo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHire(execId)}
                          disabled={!canAfford}
                          className={`px-3 py-1 font-bold font-sans text-xs border border-gray-700 shadow-[1px_1px_0px_#000] active:translate-y-0.5 ${
                            canAfford
                              ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Contratar Ejecutivo' : 'Fondos Insuficientes'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CFO RUNWAY & PROJECTIONS */}
        {activeTab === 'cfo_runway' && (
          <div className="space-y-3">
            {!hasCfo ? (
              <div className="bg-white p-6 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] text-center space-y-3">
                <div className="text-4xl">🔒 📊</div>
                <h3 className="text-sm font-black text-gray-800 uppercase font-mono">
                  Módulo de Proyecciones Financieras Bloqueado
                </h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Necesitas contratar a la Directora Financiera (CFO) Licda. Claudia Moncada para modelar los próximos 3 meses de flujo de caja, anticipar quiebras y optimizar deducciones fiscales.
                </p>
                <button
                  onClick={() => handleHire('CFO')}
                  className="px-4 py-2 font-bold font-sans text-xs bg-blue-800 text-white border border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  Contratar CFO (L 25,000 / mes)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* CFO Advice Header */}
                <div className="bg-blue-900 text-white p-3 border-2 border-blue-950 flex items-start gap-2.5">
                  <span className="text-2xl">👩‍💼</span>
                  <div>
                    <div className="font-bold text-xs uppercase text-blue-200">
                      Dictamen Financiero de la CFO (Licda. Claudia Moncada):
                    </div>
                    <div className="text-xs font-mono mt-0.5">{projectionsData.cfoAdvice}</div>
                    <div className="mt-2 flex gap-4 text-[10px] text-blue-300 font-mono">
                      <span>Burn Rate Mensual: L {projectionsData.currentMonthlyBurnRateHNL.toLocaleString()}</span>
                      <span>Runway Estimado: {projectionsData.estimatedRunwayMonths} meses de operatividad</span>
                    </div>
                  </div>
                </div>

                {/* 3 Turn Projection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {projectionsData.projections.map((p, idx) => {
                    const monthNames = ['Mes +1 (Inmediato)', 'Mes +2 (Medio Plazo)', 'Mes +3 (Horizonte)'];
                    const riskBg =
                      p.riskLevel === 'critico_quiebra'
                        ? 'border-red-600 bg-red-50/50'
                        : p.riskLevel === 'moderado'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-emerald-600 bg-emerald-50/50';

                    return (
                      <div
                        key={idx}
                        className={`bg-white p-3 border-2 ${riskBg} shadow-[inset_1px_1px_0px_#000] font-mono text-xs space-y-2`}
                      >
                        <div className="flex justify-between items-center border-b border-gray-300 pb-1">
                          <span className="font-bold text-blue-900">{monthNames[idx]}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 font-bold uppercase ${
                              p.riskLevel === 'critico_quiebra'
                                ? 'bg-red-700 text-white'
                                : p.riskLevel === 'moderado'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}
                          >
                            {p.riskLevel === 'critico_quiebra' ? 'Peligro Quiebra' : p.riskLevel}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ventas Proyectadas:</span>
                            <span className="font-bold text-emerald-700">L {p.projectedSalesHNL.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gastos + Nómina:</span>
                            <span className="font-bold text-red-700">-L {p.projectedExpensesHNL.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-1">
                            <span className="text-gray-600">Utilidad Neta:</span>
                            <span className={`font-bold ${p.projectedNetProfitHNL >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              L {p.projectedNetProfitHNL.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between bg-gray-100 p-1 mt-1 border border-gray-200">
                            <span className="text-gray-600">Caja Restante:</span>
                            <span className={`font-bold ${p.projectedCashRunwayHNL >= 0 ? 'text-blue-900' : 'text-red-800'}`}>
                              L {p.projectedCashRunwayHNL.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEGAL SHIELD & UIF COMPLIANCE */}
        {activeTab === 'uif_compliance' && (
          <div className="space-y-3">
            {/* UIF Suspicion Gauge */}
            <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>Termómetro de Vigilancia UIF (Unidad de Inteligencia Financiera)</span>
                </span>
                <span className={`font-mono font-bold text-sm ${suspicionScore > 50 ? 'text-red-700' : 'text-gray-700'}`}>
                  {suspicionScore}% Sospecha
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-5 w-full bg-gray-200 border border-gray-400 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, suspicionScore)}%` }}
                  className={`h-full transition-all duration-300 ${
                    suspicionScore > 70
                      ? 'bg-red-600'
                      : suspicionScore > 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0% Bajo Radar</span>
                <span>50% Alerta de Cumplimiento</span>
                <span>100% Auditoría Inminente</span>
              </div>
            </div>

            {/* Legal Shield Status */}
            <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{hasLawyer ? '⚖️' : '⚠️'}</span>
                <div>
                  <div className="font-bold text-xs text-blue-900">
                    {hasLawyer ? 'Escudo Legal Activo (Abg. Roberto Valladares)' : 'Sin Representación Jurídica'}
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {hasLawyer
                      ? 'Mitigación del 50% en multas y 50% de probabilidad de sobreseimiento ante auditorías federales.'
                      : 'Cualquier sanción de la UIF o embargo coactivo se ejecutará sin derecho a defensa ni rebajas.'}
                  </div>
                </div>
              </div>

              {!hasLawyer && (
                <button
                  onClick={() => handleHire('ABOGADO')}
                  className="px-3 py-1.5 font-bold font-sans text-xs bg-indigo-800 text-white border border-black shadow-[1px_1px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  Contratar Abogado
                </button>
              )}
            </div>

            {/* Dark Money Temptation */}
            <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black text-white p-3 border-2 border-red-700 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-red-800 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    Capital Clandestino de Alto Riesgo
                  </span>
                  <h3 className="font-bold text-sm text-red-200 mt-1 font-mono">
                    Inyección de Dinero Oscuro (+L 150,000 en Efectivo)
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-1 max-w-lg leading-tight">
                    Un inversionista anónimo ofrece depositar de inmediato L 150,000 en efectivo en tu caja chica. No exige acciones ni intereses, pero dispara el riesgo de auditoría de la UIF (+35%).
                  </p>
                </div>

                <button
                  onClick={handleInjectDarkMoney}
                  className="px-4 py-2 font-black font-mono text-xs bg-red-700 hover:bg-red-600 text-white border border-red-400 shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  Tomar Dinero Clandestino (+L 150k)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
