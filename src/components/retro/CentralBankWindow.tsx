import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { createInitialMacroEconomyState, advanceMacroEconomyMonth } from '../../game/macroEconomyEngine';
import { formatHNLAmount } from '../common/CustomAmountInput';
import { sound } from '../../game/audioFx';

interface CentralBankWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
}

export const CentralBankWindow: React.FC<CentralBankWindowProps> = ({
  state,
  onUpdateState
}) => {
  const macro = state.macroEconomyState || createInitialMacroEconomyState();
  const [activeTab, setActiveTab] = useState<'indicadores' | 'encaje_rescate' | 'boletin'>('indicadores');
  const [bailoutRequestAmount, setBailoutRequestAmount] = useState<number>(1000000);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const requiredReserveHNL = Math.round((state.bankerTotalDeposits || 2500000) * (macro.legalReservePct / 100));
  const currentReserveHNL = state.bankerBchReserve || 540000;
  const reserveCoveragePct = requiredReserveHNL > 0 ? Math.round((currentReserveHNL / requiredReserveHNL) * 100) : 100;
  const hasReserveDeficit = currentReserveHNL < requiredReserveHNL;

  // Ciclo económico con styling retro
  const cycleConfig = {
    EXPANSION: {
      label: 'EXPANSIÓN ECONÓMICA',
      badgeColor: 'bg-emerald-700 text-white',
      cardBg: 'bg-emerald-50 border-emerald-300',
      description: 'El PIB y el consumo crecen vigorosamente (+20% ventas comerciales). La inflación se acelera moderadamente; el Banco Central vigila la liquidez.'
    },
    ESTANCAMIENTO: {
      label: 'ESTANCAMIENTO / MESETA',
      badgeColor: 'bg-amber-600 text-white',
      cardBg: 'bg-amber-50 border-amber-300',
      description: 'Crecimiento plano y desaceleración del crédito. El mercado absorbe inventarios con cautela sin variaciones bruscas de consumo.'
    },
    RECESION: {
      label: 'RECESIÓN TÉCNICA',
      badgeColor: 'bg-orange-700 text-white',
      cardBg: 'bg-orange-50 border-orange-300',
      description: 'Contracción del consumo (-25% ventas comerciales) y alza en desconfianza financiera. El Banco Central recorta tasas para estimular el flujo de caja.'
    },
    CRISIS: {
      label: 'CRISIS DE LIQUIDEZ SISTÉMICA',
      badgeColor: 'bg-red-700 text-white animate-pulse',
      cardBg: 'bg-red-50 border-red-400',
      description: 'Estrés bancario severo (-40% ventas). Retiro preventivo de depósitos (riesgo de corrida bancaria). Ventanilla de rescates punitivos activada.'
    }
  }[macro.cycleState];

  const handleManualBailoutRequest = () => {
    sound.playApprovalStamp();
    const bailoutRate = macro.centralBankBailoutRatePct;
    const newBailoutDebt = macro.activeBailoutDebtHNL + bailoutRequestAmount;
    const newVaultCash = state.bankerVaultCash + bailoutRequestAmount;

    const nextState: DailySimulationState = {
      ...state,
      bankerVaultCash: newVaultCash,
      macroEconomyState: {
        ...macro,
        activeBailoutDebtHNL: newBailoutDebt
      }
    };

    onUpdateState(nextState);
    setActionFeedback(`¡ASISTENCIA DE LIQUIDEZ INYECTADA! Se acreditaron L ${bailoutRequestAmount.toLocaleString()} a la bóveda bancaria a tasa punitiva del ${bailoutRate}% anual.`);
  };

  const handleRepayBailout = (amount: number) => {
    sound.playCashRegister();
    const actualPay = Math.min(amount, macro.activeBailoutDebtHNL, state.bankerVaultCash);
    if (actualPay <= 0) return;

    const nextState: DailySimulationState = {
      ...state,
      bankerVaultCash: state.bankerVaultCash - actualPay,
      macroEconomyState: {
        ...macro,
        activeBailoutDebtHNL: Math.max(0, macro.activeBailoutDebtHNL - actualPay)
      }
    };

    onUpdateState(nextState);
    setActionFeedback(`Se amortizaron L ${actualPay.toLocaleString()} de la deuda de salvamento con el Banco Central.`);
  };

  const handleForceAdvanceMacroMonth = () => {
    sound.playApprovalStamp();
    const updated = advanceMacroEconomyMonth(state);
    onUpdateState(updated);
    setActionFeedback('El Banco Central ha emitido una nueva resolución de política monetaria para el nuevo ciclo.');
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black text-xs font-sans select-none overflow-hidden">
      {/* Barra de Pestañas Retro */}
      <div className="flex border-b-2 border-white bg-[#dfdfdf] px-2 pt-2 gap-1 shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('indicadores');
          }}
          className={`px-3 py-1 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
            activeTab === 'indicadores'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[2px] z-10'
              : 'bg-[#d0d0d0] border-gray-400 text-gray-700'
          }`}
        >
          🏛️ Indicadores Macroeconómicos
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('encaje_rescate');
          }}
          className={`px-3 py-1 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
            activeTab === 'encaje_rescate'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[2px] z-10'
              : 'bg-[#d0d0d0] border-gray-400 text-gray-700'
          }`}
        >
          🛡️ Encaje Legal & Rescate (20%)
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('boletin');
          }}
          className={`px-3 py-1 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
            activeTab === 'boletin'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[2px] z-10'
              : 'bg-[#d0d0d0] border-gray-400 text-gray-700'
          }`}
        >
          📜 Boletín de Mercado & Shocks
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* Notificación de Acción */}
        {actionFeedback && (
          <div className="p-2 bg-blue-100 border-2 border-blue-600 text-blue-950 font-semibold text-[11px] flex justify-between items-center shadow">
            <span>{actionFeedback}</span>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs font-bold px-1 bg-white border border-blue-400"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'indicadores' && (
          <div className="space-y-3">
            {/* Banner de Ciclo Económico */}
            <div className={`p-3 border-2 ${cycleConfig.cardBg} shadow-sm`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800 text-xs">ESTADO DEL CICLO MACROECONÓMICO:</span>
                <span className={`px-2 py-0.5 font-black text-xs uppercase tracking-wider rounded ${cycleConfig.badgeColor}`}>
                  {cycleConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
                {cycleConfig.description}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                <span>Mes transcurrido: {macro.currentCycleMonthElapsed} de {macro.cycleDurationMonths}</span>
                <span>•</span>
                <span>Día simulación: {state.currentDay}/{state.currentMonth}/{state.currentYear}</span>
              </div>
            </div>

            {/* Cuadrícula de 4 Tasas Clave */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-2.5 bg-white border-2 border-slate-400 shadow-inner">
                <span className="text-[10px] font-bold text-slate-600 block uppercase">Tasa Prime (TPM):</span>
                <span className="text-xl font-mono font-black text-blue-900 block mt-0.5">
                  {macro.primeRatePct.toFixed(2)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Rango normativo: 2.0% - 15.0%</span>
              </div>

              <div className="p-2.5 bg-white border-2 border-slate-400 shadow-inner">
                <span className="text-[10px] font-bold text-slate-600 block uppercase">Inflación Interanual:</span>
                <span className="text-xl font-mono font-black text-amber-900 block mt-0.5">
                  {macro.inflationRatePct.toFixed(2)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Impacto en OPEX empresarial</span>
              </div>

              <div className="p-2.5 bg-white border-2 border-slate-400 shadow-inner">
                <span className="text-[10px] font-bold text-slate-600 block uppercase">Encaje Legal Exigido:</span>
                <span className="text-xl font-mono font-black text-emerald-900 block mt-0.5">
                  {macro.legalReservePct.toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Inmovilizado sobre depósitos</span>
              </div>

              <div className="p-2.5 bg-white border-2 border-slate-400 shadow-inner">
                <span className="text-[10px] font-bold text-slate-600 block uppercase">Tasa de Rescate Punitivo:</span>
                <span className="text-xl font-mono font-black text-rose-900 block mt-0.5">
                  {macro.centralBankBailoutRatePct.toFixed(2)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Prime + 10.0% de penalización</span>
              </div>
            </div>

            {/* Evento de Shock de Mercado Activo */}
            {macro.marketShockEvent ? (
              <div className="p-3 bg-red-100 border-2 border-red-600 text-red-950 shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xs flex items-center gap-1">
                    ⚠️ SHOCK MACROECONÓMICO ACTIVO: {macro.marketShockEvent.title}
                  </span>
                  <span className="font-mono text-[10px] bg-red-200 px-1.5 py-0.5 border border-red-400 font-bold">
                    {macro.marketShockEvent.activeDaysRemaining} días restantes
                  </span>
                </div>
                <p className="text-[11px] mb-2">{macro.marketShockEvent.description}</p>
                <div className="flex gap-4 font-mono text-[10px]">
                  <span>Impacto Costos OPEX: {macro.marketShockEvent.costImpactPct > 0 ? `+${macro.marketShockEvent.costImpactPct}%` : '0%'}</span>
                  <span>Impacto Ventas: {macro.marketShockEvent.salesImpactPct}%</span>
                  <span>Riesgo Corrida Ahorristas: {macro.marketShockEvent.depositWithdrawalRiskPct}%</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-100 border border-slate-300 text-slate-700 text-[11px] flex justify-between items-center">
                <span>Mercados estables sin shocks externos de volatilidad extrema detectados.</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">● VIGILANCIA NOMINAL</span>
              </div>
            )}

            {/* Botón Regulador: Revisión Mensual de Política Monetaria */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleForceAdvanceMacroMonth}
                className="px-3 py-1.5 bg-[#dfdfdf] border-2 border-t-white border-l-white border-r-gray-700 border-b-gray-700 font-bold text-xs hover:bg-[#eaeaea] active:border-t-gray-700 active:border-l-gray-700"
              >
                🔄 Emitir Dictamen de Política Monetaria (Nuevo Mes)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'encaje_rescate' && (
          <div className="space-y-3">
            {/* Estado del Encaje Legal del Banquero */}
            <div className="p-3 bg-white border-2 border-slate-400 shadow-inner space-y-2">
              <h3 className="font-bold text-xs text-slate-900 border-b pb-1">
                POSICIÓN REGULATORIA DE ENCAJE LEGAL (20% DE DEPÓSITOS)
              </h3>
              <div className="grid grid-cols-3 gap-2 py-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Depósitos Totales de Ahorristas:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatHNLAmount(state.bankerTotalDeposits || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Encaje Obligatorio (20%):</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    {formatHNLAmount(requiredReserveHNL)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Reserva Actual en Banco Central:</span>
                  <span className={`font-mono font-bold text-sm ${hasReserveDeficit ? 'text-red-700' : 'text-emerald-700'}`}>
                    {formatHNLAmount(currentReserveHNL)} ({reserveCoveragePct}%)
                  </span>
                </div>
              </div>

              {hasReserveDeficit && (
                <div className="p-2 bg-rose-50 border border-rose-300 text-rose-900 text-[11px] font-semibold">
                  ⚠️ ALERTA DE DÉFICIT: La reserva en el Banco Central no cubre el 100% del encaje exigido. En caso de retiro masivo o inspección de la CNBS, se aplicará rescate forzoso con tasa punitiva.
                </div>
              )}
            </div>

            {/* Ventanilla de Rescates de Emergencia */}
            <div className="p-3 bg-slate-50 border-2 border-slate-400 space-y-3">
              <div className="flex justify-between items-center border-b pb-1">
                <h3 className="font-bold text-xs text-rose-950">
                  VENTANILLA DE DESCUENTO Y RESCATES DE LIQUIDEZ (BANCO CENTRAL)
                </h3>
                <span className="font-mono text-[10px] font-bold text-rose-700">
                  Tasa Punitiva: {macro.centralBankBailoutRatePct.toFixed(2)}% anual
                </span>
              </div>

              <div className="flex justify-between items-center bg-white p-2 border">
                <div>
                  <span className="text-[10px] text-slate-500 block">Deuda Activa por Rescates del Banco Central:</span>
                  <span className="text-lg font-mono font-black text-rose-800">
                    {formatHNLAmount(macro.activeBailoutDebtHNL)}
                  </span>
                </div>
                {macro.activeBailoutDebtHNL > 0 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRepayBailout(500000)}
                      className="px-2 py-1 bg-[#dfdfdf] border border-slate-500 font-bold text-[10px] hover:bg-white"
                    >
                      Abonar L 500,000
                    </button>
                    <button
                      onClick={() => handleRepayBailout(macro.activeBailoutDebtHNL)}
                      className="px-2 py-1 bg-emerald-700 text-white font-bold text-[10px] hover:bg-emerald-600"
                    >
                      Liquidar Total
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-700">Solicitud Voluntaria de Inyección de Liquidez:</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="250000"
                    value={bailoutRequestAmount}
                    onChange={(e) => setBailoutRequestAmount(Math.max(100000, Number(e.target.value)))}
                    className="flex-1 p-1.5 border border-slate-400 bg-white font-mono text-xs font-bold"
                  />
                  <button
                    onClick={handleManualBailoutRequest}
                    className="px-3 py-1.5 bg-rose-800 text-white font-bold text-xs hover:bg-rose-700 border border-black shadow"
                  >
                    🚨 Solicitar Rescate Inmediato
                  </button>
                </div>
                <span className="text-[9px] text-slate-500 block">
                  Nota: El Banco Central transfiere los fondos a la bóveda del Banquero, pero cobrará la tasa punitiva mensual debitada automáticamente.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'boletin' && (
          <div className="space-y-3">
            <div className="p-3 bg-white border-2 border-slate-400">
              <h3 className="font-bold text-xs text-slate-900 border-b pb-1 mb-2">
                HISTORIAL DE POLÍTICA MONETARIA Y TASAS MACROECONÓMICAS
              </h3>
              <table className="w-full text-left font-mono text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-slate-700">
                    <th className="p-1">Periodo</th>
                    <th className="p-1">Ciclo</th>
                    <th className="p-1 text-right">Tasa Prime</th>
                    <th className="p-1 text-right">Inflación</th>
                    <th className="p-1 text-right">Tasa Rescate</th>
                  </tr>
                </thead>
                <tbody>
                  {(macro.historicalRates || []).map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-blue-50">
                      <td className="p-1 font-bold">Mes {entry.month}/{entry.year}</td>
                      <td className="p-1 font-sans text-[9px] font-bold">{entry.cycleState}</td>
                      <td className="p-1 text-right text-blue-900 font-bold">{entry.primeRatePct.toFixed(2)}%</td>
                      <td className="p-1 text-right text-amber-900">{entry.inflationRatePct.toFixed(2)}%</td>
                      <td className="p-1 text-right text-rose-900 font-bold">{(entry.primeRatePct + 10.0).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pie de Estado Retro */}
      <div className="px-3 py-1 bg-[#dfdfdf] border-t border-white text-[10px] text-slate-600 flex justify-between items-center shrink-0">
        <span>Sistema Monetario Regulado — Banco Central de Honduras & CNBS</span>
        <span className="font-mono font-bold text-slate-800">
          Reservas Internacionales: ${(macro.centralBankReservesUSD / 1000000000).toFixed(2)}B USD
        </span>
      </div>
    </div>
  );
};
