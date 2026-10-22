import React from 'react';
import { GameState, MonthlyClosingSummary } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  Coins, 
  X, 
  CreditCard, 
  Building2, 
  Percent,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface MonthlyClosingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onRenegotiateDebt: (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => void;
  onNavigateTab: (tab: string) => void;
}

export const MonthlyClosingSummaryModal: React.FC<MonthlyClosingSummaryModalProps> = ({
  isOpen,
  onClose,
  state,
  onRenegotiateDebt,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const summary: MonthlyClosingSummary = state.lastMonthlyClosingSummary || {
    month: state.gameMonth,
    year: state.bch.year,
    monthLabel: `Mes ${state.gameMonth}`,
    loansProcessedCount: 18,
    loansFullyPaidCount: 14,
    loansPartialOrOverdueCount: 4,
    totalAmortizationCollectedHNL: 14500000,
    totalInterestCollectedHNL: 6200000,
    delinquentClientsNotices: [],
    tpmOldPct: 5.75,
    tpmNewPct: state.bch.tpmRate,
    tpmDeltaPct: +(state.bch.tpmRate - 5.75).toFixed(2),
    indexedDivisionsSummary: [],
    limitsIncreasedCount: 12,
    limitsReducedCount: 2,
    totalLimitExpansionHNL: 480000,
    totalDepositInterestCapitalizedHNL: 4500000,
    requiredReserveHNL: state.bchMoneyDesk?.requiredReserveHNL || 280800000,
    actualReserveHNL: state.bchMoneyDesk?.cashInBchCurrentAccountHNL || 345000000,
    reserveSurplusOrDeficitHNL: state.bchMoneyDesk?.reserveSurplusOrDeficitHNL || 64200000,
    isReserveCompliant: (state.bchMoneyDesk?.reserveSurplusOrDeficitHNL ?? 0) >= 0,
    bchPenaltyIncurredHNL: 0,
    carPct: state.financials.capitalAdequacyRatioCAR,
    lcrPct: state.financials.liquidityCoverageRatioLCR,
    nsfrPct: 118.5
  };

  const handleActionClick = (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => {
    sound.playApprovalStamp();
    onRenegotiateDebt(clientId, type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Cabecera del Cierre Mensual */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-amber-400">
                  Cierre Contable Mensual Obligatorio
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-semibold">{summary.monthLabel}</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Liquidación de Préstamos, Límites, Cuentas y Tasas BCH
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Fila 1: KPIs Principales del Cierre Contable */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Amortización Cobrada</span>
              <span className="text-lg font-mono font-extrabold text-emerald-400">
                {formatHNL(summary.totalAmortizationCollectedHNL)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {summary.loansFullyPaidCount} cancelados / al día
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Intereses de Cartera</span>
              <span className="text-lg font-mono font-extrabold text-amber-400">
                {formatHNL(summary.totalInterestCollectedHNL)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                Cobrados de cuotas
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Intereses Capitalizados</span>
              <span className="text-lg font-mono font-extrabold text-blue-400">
                {formatHNL(summary.totalDepositInterestCapitalizedHNL)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Abonados a cuentas de ahorro/DPF
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Encaje Legal BCH</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {summary.isReserveCompliant ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                <span className={`text-base font-mono font-extrabold ${summary.isReserveCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {summary.isReserveCompliant ? 'Cumplido' : 'Déficit'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                Posición: {formatHNL(summary.reserveSurplusOrDeficitHNL)}
              </span>
            </div>
          </div>

          {/* Fila 2: Avisos Previos de Insuficiencia & Renegociación Sugerida */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Avisos Previos de Insuficiencia y Sugerencias de Renegociación ({summary.delinquentClientsNotices.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Débito flexible ejecutado con fondos disponibles
              </span>
            </div>

            {summary.delinquentClientsNotices.length === 0 ? (
              <div className="py-4 text-center text-slate-500">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                <p>Todos los clientes disponían de fondos suficientes. Cuotas debitadas con éxito.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.delinquentClientsNotices.map((notice) => (
                  <div
                    key={notice.clientId}
                    className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{notice.clientName}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-mono text-[11px]">{notice.loanType}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-400 font-mono font-bold text-[11px]">
                          {notice.cnbsCategory}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Cuota exigible: <span className="font-mono text-slate-200">{formatHNL(notice.monthlyPaymentHNL)}</span> · Saldo en cuenta: <span className="font-mono text-slate-200">{formatHNL(notice.accountBalanceHNL)}</span> · Faltante pendiente: <span className="font-mono text-rose-400 font-bold">{formatHNL(notice.shortfallHNL)}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleActionClick(notice.clientId, 'ampliar_plazo')}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold transition-colors"
                      >
                        Ampliar a 36m
                      </button>
                      <button
                        onClick={() => handleActionClick(notice.clientId, 'reestructurar_quitas')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                      >
                        Quita 15% Mora
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('credit_risk');
                        }}
                        className="p-1.5 text-slate-400 hover:text-white"
                        title="Ver en módulo de riesgo"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fila 3: Indexación de Tasas por Variación de la TPM de BCH */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Indexación Dinámica de Tasas por Política Monetaria BCH
                </h3>
              </div>
              <span className="font-mono text-[11px] text-amber-400">
                TPM: {summary.tpmOldPct}% → {summary.tpmNewPct}% ({summary.tpmDeltaPct >= 0 ? '+' : ''}{summary.tpmDeltaPct}%)
              </span>
            </div>

            {summary.indexedDivisionsSummary.length === 0 ? (
              <p className="text-slate-500 py-2">
                La TPM del BCH se mantuvo estable. Las tasas activas y pasivas conservaron su nivel base anterior.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {summary.indexedDivisionsSummary.map(div => (
                  <div key={div.divisionId} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-white block mb-1">{div.divisionName}</span>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Tasa Activa (Préstamos):</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {div.oldLendingRate}% → {div.newLendingRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                      <span>Tasa Pasiva (Depósitos):</span>
                      <span className="font-mono text-blue-400 font-bold">
                        {div.oldDepositRate}% → {div.newDepositRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fila 4: Ajuste Automático de Límites de Tarjetas & Cumplimiento Basilea */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Recalibración de Límites Crediticios</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {summary.limitsIncreasedCount} clientes con pago puntual recibieron aumento prudente (+8%), sumando <span className="font-mono text-emerald-400 font-bold">+{formatHNL(summary.totalLimitExpansionHNL)}</span> en nueva capacidad de compra.
              </p>
              {summary.limitsReducedCount > 0 && (
                <p className="text-[11px] text-rose-400">
                  {summary.limitsReducedCount} clientes con mora de 60+ días tuvieron su límite preventivamente reducido para acotar pérdidas.
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Ratios de Solvencia & Basilea III</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 rounded bg-slate-900">
                  <span className="text-[10px] text-slate-500 block">CAR CNBS</span>
                  <span className="font-bold text-emerald-400">{formatPct(summary.carPct)}</span>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <span className="text-[10px] text-slate-500 block">LCR Liquidez</span>
                  <span className="font-bold text-blue-400">{summary.lcrPct}%</span>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <span className="text-[10px] text-slate-500 block">NSFR Fondeo</span>
                  <span className="font-bold text-amber-400">{summary.nsfrPct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del modal con botón de cierre */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Actualización mensual completada según marco regulatorio CNBS/BCH
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Continuar Operaciones
          </button>
        </div>

      </div>
    </div>
  );
};
