import React, { useState } from 'react';
import { CashFlowStatementReport, MonthlyCausalAudit, RoleMode } from '../../game/types';
import { formatHNL } from '../../game/economyEngine';
import { sound } from '../../game/audioFx';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Sliders, 
  DollarSign, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';

interface CausalCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashFlowReport?: CashFlowStatementReport;
  causalAudit?: MonthlyCausalAudit;
  roleMode: RoleMode;
  currentCashHNL: number;
}

export const CausalCashFlowModal: React.FC<CausalCashFlowModalProps> = ({
  isOpen,
  onClose,
  cashFlowReport,
  causalAudit,
  roleMode,
  currentCashHNL
}) => {
  const [activeTab, setActiveTab] = useState<'causal_factors' | 'cash_flow_statement' | 'what_if_simulator'>('causal_factors');

  // What-If sensitivity parameters
  const [salesShockPct, setSalesShockPct] = useState<number>(0); // -30% to +30%
  const [costShockPct, setCostShockPct] = useState<number>(0);   // -20% to +30%
  const [tpmShockBps, setTpmShockBps] = useState<number>(0);     // -200 to +200 bps

  if (!isOpen) return null;

  const netProfit = causalAudit?.netProfitOrLossHNL ?? 0;
  const netCashDelta = cashFlowReport?.netCashChangeHNL ?? 0;
  const isProfitable = netProfit >= 0;
  const isCashPositive = netCashDelta >= 0;

  // What-if projected cash flow calculations
  const baseOperatingCashFlow = cashFlowReport?.operatingCashFlowHNL ?? 25000000;
  const simulatedSalesDelta = (cashFlowReport?.breakdown.collectionsFromSalesHNL ?? 30000000) * (salesShockPct / 100);
  const simulatedCostDelta = (cashFlowReport?.breakdown.paymentsToSuppliersHNL ?? 12000000) * (costShockPct / 100);
  const simulatedInterestDelta = ((cashFlowReport?.breakdown.interestReceivedHNL ?? 15000000) * (tpmShockBps / 10000)) - 
                                ((cashFlowReport?.breakdown.interestPaidHNL ?? 4000000) * (tpmShockBps / 10000));

  const simulatedOperatingCash = baseOperatingCashFlow + simulatedSalesDelta - simulatedCostDelta + simulatedInterestDelta;
  const simulatedNetCash = simulatedOperatingCash + (cashFlowReport?.investingCashFlowHNL ?? -4000000) + (cashFlowReport?.financingCashFlowHNL ?? 5000000);
  const simulatedClosingCash = Math.max(0, currentCashHNL + (simulatedNetCash - netCashDelta));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>Auditoría Financiera & Diagnóstico Causal</span>
              <span>·</span>
              <span className="text-slate-400">Mes {cashFlowReport?.month ?? 1} / {cashFlowReport?.year ?? 2026}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
              ¿Por qué gané o perdí dinero este mes?
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Causal Top Highlights Bar */}
        <div className="p-5 bg-slate-950/40 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Resultado Contable (Utilidad Neta)</span>
            <div className="flex items-center gap-2 mt-1">
              {isProfitable ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <span className={`text-base font-bold tabular-nums ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfitable ? '+' : ''}{formatHNL(netProfit)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Ingresos devengados menos costos totales</span>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Variación de Caja Líquida (Flujo Neto)</span>
            <div className="flex items-center gap-2 mt-1">
              {isCashPositive ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <span className={`text-base font-bold tabular-nums ${isCashPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCashPositive ? '+' : ''}{formatHNL(netCashDelta)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Efectivo real que ingresó o salió de cuentas</span>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Saldo de Cierre Disponible</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-sky-400 tabular-nums">
                {formatHNL(currentCashHNL)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Tesorería lista para responder a pagos</span>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => { sound.playClick(); setActiveTab('causal_factors'); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'causal_factors'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            1. Factores Causales & Explicación
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('cash_flow_statement'); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'cash_flow_statement'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Estado de Flujo de Efectivo
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('what_if_simulator'); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'what_if_simulator'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. Simulador de Sensibilidad "What-If"
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* TAB 1: FACTORES CAUSALES */}
          {activeTab === 'causal_factors' && (
            <div className="space-y-6">
              {/* Resumen del Auditor */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Dictamen del Asesor Financiero</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {causalAudit?.summaryTitle ?? 'Evaluación Causal Mensual'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {causalAudit?.liquidityAlertText}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Recomendación ejecutiva: {causalAudit?.recommendedAction}</span>
                </div>
              </div>

              {/* Lista Desglosada de Factores */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Desglose de Causas: Ingresos vs Costos y Fondeo
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {(causalAudit?.factors ?? []).map((factor, idx) => {
                    const isPositive = factor.impact === 'positivo';
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          isPositive
                            ? 'bg-slate-950/70 border-emerald-900/60'
                            : 'bg-slate-950/70 border-rose-900/60'
                        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${
                              isPositive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {factor.category.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold text-slate-100">{factor.title}</span>
                          </div>
                          <p className="text-xs text-slate-400">{factor.explanation}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-mono font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{formatHNL(factor.deltaHNL)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proyección de Obligaciones a 30 Días */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Obligaciones Inmediatas a 30 Días & Riesgo de Liquidez
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 block">Compromisos a pagar (Nóminas + Cuotas):</span>
                    <span className="text-base font-bold text-rose-400 tabular-nums">
                      {formatHNL(causalAudit?.projectedObligations30DaysHNL ?? 20000000)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 block">Superávit proyectado de caja:</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">
                      {formatHNL(causalAudit?.projectedCashSurplusOrDeficitHNL ?? 50000000)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESTADO DE FLUJO DE EFECTIVO OFICIAL */}
          {activeTab === 'cash_flow_statement' && (
            <div className="space-y-5 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold border-b border-slate-800 pb-2">
                  <span className="text-slate-200">Saldo de Caja al Inicio del Mes</span>
                  <span className="text-slate-100 tabular-nums">{formatHNL(cashFlowReport?.beginningCashHNL ?? 0)}</span>
                </div>

                {/* 1. Actividades de Operación */}
                <div className="space-y-1.5">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    1. Flujo de Efectivo por Actividades de Operación
                  </div>
                  <div className="flex justify-between text-slate-300 pl-3">
                    <span>Cobros por ventas y comercialización:</span>
                    <span className="text-emerald-400 tabular-nums">+{formatHNL(cashFlowReport?.breakdown.collectionsFromSalesHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pl-3">
                    <span>Intereses cobrados sobre préstamos y bonos:</span>
                    <span className="text-emerald-400 tabular-nums">+{formatHNL(cashFlowReport?.breakdown.interestReceivedHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>Pagos a proveedores por insumos y stock:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.paymentsToSuppliersHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>Nómina y sueldos del personal:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.payrollPaidHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>Intereses pagados por depósitos y deuda:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.interestPaidHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>Impuestos SAR devengados:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.taxesPaidHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800/80">
                    <span>Flujo Neto de Operación:</span>
                    <span className="text-emerald-400 tabular-nums">{formatHNL(cashFlowReport?.operatingCashFlowHNL ?? 0)}</span>
                  </div>
                </div>

                {/* 2. Actividades de Inversión */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    2. Flujo de Efectivo por Actividades de Inversión
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>CAPEX en tecnología, maquinaria y mejoras:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.capexOrPurchasesHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800/80">
                    <span>Flujo Neto de Inversión:</span>
                    <span className="text-rose-400 tabular-nums">{formatHNL(cashFlowReport?.investingCashFlowHNL ?? 0)}</span>
                  </div>
                </div>

                {/* 3. Actividades de Financiamiento */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    3. Flujo de Efectivo por Actividades de Financiamiento
                  </div>
                  <div className="flex justify-between text-slate-300 pl-3">
                    <span>Nuevos préstamos / captación de depósitos:</span>
                    <span className="text-emerald-400 tabular-nums">+{formatHNL(cashFlowReport?.breakdown.newLoansReceivedHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pl-3">
                    <span>Amortización de capital y devolución de deudas:</span>
                    <span className="text-rose-400 tabular-nums">-{formatHNL(cashFlowReport?.breakdown.debtRepaymentsHNL ?? 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800/80">
                    <span>Flujo Neto de Financiamiento:</span>
                    <span className="text-emerald-400 tabular-nums">+{formatHNL(cashFlowReport?.financingCashFlowHNL ?? 0)}</span>
                  </div>
                </div>

                {/* Conciliación Final */}
                <div className="p-3 bg-slate-900 rounded border border-slate-700/80 space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Aumento / (Disminución) Neto en Efectivo:</span>
                    <span className={`font-bold tabular-nums ${isCashPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCashPositive ? '+' : ''}{formatHNL(cashFlowReport?.netCashChangeHNL ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Saldo de Caja al Cierre del Mes:</span>
                    <span className="text-sky-400 tabular-nums">{formatHNL(cashFlowReport?.endingCashHNL ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULADOR DE SENSIBILIDAD WHAT-IF */}
          {activeTab === 'what_if_simulator' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Simulador de Choques Macroeconómicos y Operativos
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evalúa cómo cambiaría tu liquidez si suben los precios de las materias primas, cae el consumo o el Banco Central eleva las tasas de interés.
                </p>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>Ventas Comerciales:</span>
                    <span className="font-mono text-amber-400 font-bold">{salesShockPct > 0 ? `+${salesShockPct}%` : `${salesShockPct}%`}</span>
                  </label>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={salesShockPct}
                    onChange={(e) => setSalesShockPct(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-400"
                  />
                  <span className="text-[11px] text-slate-500 block">Sensibilidad al consumo y demanda</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>Costos de Insumos:</span>
                    <span className="font-mono text-amber-400 font-bold">{costShockPct > 0 ? `+${costShockPct}%` : `${costShockPct}%`}</span>
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="30"
                    step="5"
                    value={costShockPct}
                    onChange={(e) => setCostShockPct(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-400"
                  />
                  <span className="text-[11px] text-slate-500 block">Inflación en proveedores y fletes</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>Tasa BCH / TPM:</span>
                    <span className="font-mono text-amber-400 font-bold">{tpmShockBps > 0 ? `+${tpmShockBps} bps` : `${tpmShockBps} bps`}</span>
                  </label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="25"
                    value={tpmShockBps}
                    onChange={(e) => setTpmShockBps(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-400"
                  />
                  <span className="text-[11px] text-slate-500 block">Impacto en margen financiero</span>
                </div>
              </div>

              {/* Resultado Simulado */}
              <div className="p-5 bg-slate-950 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
                <h5 className="text-slate-300 font-semibold font-sans">Proyección de Flujo Simulado con Choques:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Flujo Operativo Simulado:</span>
                    <span className="text-sm font-bold text-slate-100 tabular-nums">{formatHNL(simulatedOperatingCash)}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Flujo Neto Mensual:</span>
                    <span className={`text-sm font-bold tabular-nums ${simulatedNetCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulatedNetCash >= 0 ? '+' : ''}{formatHNL(simulatedNetCash)}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Caja Final Simulada:</span>
                    <span className="text-sm font-bold text-sky-400 tabular-nums">{formatHNL(simulatedClosingCash)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-slate-400 font-sans text-xs">
                  {simulatedClosingCash < 20000000 ? (
                    <span className="text-rose-400 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      ¡Escenario crítico!: La combinación de factores agotaría tus reservas de tesorería. Debes frenar compras de inventario o aumentar capital.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Escenario resiliente: La institución mantiene reservas suficientes para absorber el choque sin incurrir en mora ni rescates.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
          >
            Entendido, Cerrar Auditoría
          </button>
        </div>
      </div>
    </div>
  );
};
