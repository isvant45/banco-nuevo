import React, { useState } from 'react';
import { DailySimulationState, FinancialStatementsSummary } from '../../game/retroSimTypes';
import { calculateComprehensiveFinancialStatements } from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface FinancialStatementsWindowProps {
  state: DailySimulationState;
}

export const FinancialStatementsWindow: React.FC<FinancialStatementsWindowProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'resultados' | 'flujo'>('balance');
  const financials: FinancialStatementsSummary = calculateComprehensiveFinancialStatements(state);

  const formatHNL = (amount: number) => `L ${Math.round(amount).toLocaleString()}`;

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Barra de Pestañas Retro */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1.5 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { sound.playClick(); setActiveTab('balance'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'balance'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>⚖️</span>
            <span>Balance General</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('resultados'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'resultados'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>📊</span>
            <span>Estado de Resultados (P&L)</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('flujo'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'flujo'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>💵</span>
            <span>Flujo de Efectivo</span>
          </button>
        </div>

        {/* Ecuación Fundamental Verificada */}
        <div className="bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 font-mono text-[11px] font-bold hidden sm:flex items-center gap-1">
          <span>✅ ACTIVO = PASIVO + PATRIMONIO</span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-50 font-mono text-xs">
        {/* ========================================================= */}
        {/* TAB 1: BALANCE GENERAL                                    */}
        {/* ========================================================= */}
        {activeTab === 'balance' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
              <div className="text-center border-b pb-2 mb-3">
                <h3 className="font-sans font-black text-sm text-slate-900 uppercase tracking-wide">
                  {state.storeName} — BALANCE GENERAL CONSOLIDADO
                </h3>
                <p className="text-[10px] text-slate-500 font-sans">
                  Al Día {state.currentDay}, Mes {state.currentMonth}, Año {state.currentYear} | Cifras auditadas en Lempiras (HNL)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* COLUMNA IZQUIERDA: ACTIVOS */}
                <div className="border border-slate-300 p-2.5 bg-slate-50">
                  <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-1 mb-2 font-sans flex items-center justify-between">
                    <span>1. ACTIVOS TOTALES</span>
                    <span>{formatHNL(financials.totalAssets)}</span>
                  </h4>

                  {/* Activo Circulante */}
                  <div className="mb-3">
                    <div className="font-bold text-slate-800 text-[11px] flex justify-between bg-slate-200 px-1 py-0.5">
                      <span>ACTIVO CIRCULANTE</span>
                      <span>{formatHNL(financials.currentAssets.total)}</span>
                    </div>
                    <div className="pl-2 pr-1 py-1 space-y-1 text-[11px] text-slate-700">
                      <div className="flex justify-between">
                        <span>• Caja General (Efectivo disponible):</span>
                        <span>{formatHNL(financials.currentAssets.cashInHand)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Bancos & Cuentas Corrientes:</span>
                        <span>{formatHNL(financials.currentAssets.cashInBank)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Depósitos en Garantía & DPFs:</span>
                        <span>{formatHNL(financials.currentAssets.guaranteeDeposits)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Inventario de Mercancías / Materiales:</span>
                        <span>{formatHNL(financials.currentAssets.inventoryStock)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Cuentas por Cobrar (Estimaciones):</span>
                        <span>{formatHNL(financials.currentAssets.accountsReceivable)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activo No Circulante (Fijo) */}
                  <div>
                    <div className="font-bold text-slate-800 text-[11px] flex justify-between bg-slate-200 px-1 py-0.5">
                      <span>ACTIVO NO CIRCULANTE (FIJO)</span>
                      <span>{formatHNL(financials.nonCurrentAssets.total)}</span>
                    </div>
                    <div className="pl-2 pr-1 py-1 space-y-1 text-[11px] text-slate-700">
                      <div className="flex justify-between">
                        <span>• Maquinaria Pesada & Flota Comercial:</span>
                        <span>{formatHNL(financials.nonCurrentAssets.machineryAndFleet)}</span>
                      </div>
                      <div className="flex justify-between text-rose-700">
                        <span>• (-) Depreciación Acumulada:</span>
                        <span>-{formatHNL(financials.nonCurrentAssets.accumulatedDepreciation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Bienes Inmuebles Patrimoniales (Avalúo):</span>
                        <span>{formatHNL(financials.nonCurrentAssets.realEstateCollaterals)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: PASIVOS & PATRIMONIO */}
                <div className="border border-slate-300 p-2.5 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 border-b border-rose-200 pb-1 mb-2 font-sans flex items-center justify-between">
                      <span>2. PASIVOS TOTALES</span>
                      <span>{formatHNL(financials.totalLiabilities)}</span>
                    </h4>

                    {/* Pasivo Circulante */}
                    <div className="mb-3">
                      <div className="font-bold text-slate-800 text-[11px] flex justify-between bg-slate-200 px-1 py-0.5">
                        <span>PASIVO CORTO PLAZO (CIRCULANTE &lt; 12M)</span>
                        <span>{formatHNL(financials.currentLiabilities.total)}</span>
                      </div>
                      <div className="pl-2 pr-1 py-1 space-y-1 text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span>• Porción Corriente de Préstamos:</span>
                          <span>{formatHNL(financials.currentLiabilities.shortTermLoans)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Saldo en Tarjetas Corporativas:</span>
                          <span>{formatHNL(financials.currentLiabilities.creditCardsBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Proveedores (Cuentas por Pagar):</span>
                          <span>{formatHNL(financials.currentLiabilities.supplierAccountsPayable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Anticipos de Clientes por Ejecutar:</span>
                          <span>{formatHNL(financials.currentLiabilities.customerAdvancesLiability)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Impuestos SAR por Pagar (ISR 25%):</span>
                          <span>{formatHNL(financials.currentLiabilities.sarTaxPayable)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pasivo No Circulante */}
                    <div className="mb-3">
                      <div className="font-bold text-slate-800 text-[11px] flex justify-between bg-slate-200 px-1 py-0.5">
                        <span>PASIVO LARGO PLAZO (&gt; 12 MESES)</span>
                        <span>{formatHNL(financials.nonCurrentLiabilities.total)}</span>
                      </div>
                      <div className="pl-2 pr-1 py-1 space-y-1 text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span>• Préstamos Comerciales e Hipotecarios:</span>
                          <span>{formatHNL(financials.nonCurrentLiabilities.longTermLoans)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patrimonio Neto */}
                  <div className="border-t-2 border-slate-400 pt-2">
                    <div className="font-bold text-emerald-900 text-xs flex justify-between bg-emerald-100 p-1.5 border border-emerald-300">
                      <span>3. PATRIMONIO NETO (CAPITAL PROPIO)</span>
                      <span className="font-black">{formatHNL(financials.netEquity)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 px-1 pt-1">
                      <span>Total Pasivo + Patrimonio Neto:</span>
                      <strong className="text-slate-900">{formatHNL(financials.totalLiabilities + financials.netEquity)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ESTADO DE RESULTADOS (P&L)                         */}
        {/* ========================================================= */}
        {activeTab === 'resultados' && (
          <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
            <div className="text-center border-b pb-2 mb-3">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase tracking-wide">
                ESTADO DE RESULTADOS INTEGRAL (Pérdidas y Ganancias)
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Período Mensual Corriente | Reconocimiento de costos por devengo
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b font-bold text-slate-900">
                <span>(+) Ingresos Operativos Brutos por Ventas / Estimaciones:</span>
                <span className="text-emerald-700">{formatHNL(financials.incomeStatement.grossRevenue)}</span>
              </div>
              <div className="flex justify-between py-1 border-b text-rose-700 pl-4">
                <span>(-) Costo de Mercaderías Vendidas / Materiales Consumidos (COGS):</span>
                <span>-{formatHNL(financials.incomeStatement.cogs)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-slate-100 px-2 font-black text-slate-900 border">
                <span>(=) UTILIDAD BRUTA:</span>
                <span>{formatHNL(financials.incomeStatement.grossProfit)}</span>
              </div>

              <div className="flex justify-between py-1 border-b text-rose-700 pl-4">
                <span>(-) Gastos de Operación (Planillas, Alquiler, Mantenimiento):</span>
                <span>-{formatHNL(financials.incomeStatement.operatingExpenses)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-blue-50 px-2 font-bold text-blue-900 border border-blue-200">
                <span>(=) RESULTADO OPERATIVO (EBITDA):</span>
                <span>{formatHNL(financials.incomeStatement.ebitda)}</span>
              </div>

              <div className="flex justify-between py-1 border-b text-amber-800 pl-4">
                <span>(-) Gastos Financieros (Intereses de Préstamos y Tarjetas):</span>
                <span>-{formatHNL(financials.incomeStatement.interestExpenses)}</span>
              </div>
              <div className="flex justify-between py-1 border-b text-rose-800 pl-4">
                <span>(-) Provisión Impuesto Sobre la Renta (SAR 25%):</span>
                <span>-{formatHNL(financials.incomeStatement.taxExpenseSAR)}</span>
              </div>

              <div className="flex justify-between py-2 bg-emerald-100 px-3 font-black text-sm text-emerald-950 border-2 border-emerald-400 mt-2">
                <span>(=) UTILIDAD NETA DEL EJERCICIO:</span>
                <span>{formatHNL(financials.incomeStatement.netIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ESTADO DE FLUJO DE EFECTIVO                        */}
        {/* ========================================================= */}
        {activeTab === 'flujo' && (
          <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
            <div className="text-center border-b pb-2 mb-3">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase tracking-wide">
                ESTADO DE FLUJO DE EFECTIVO (Cash Flow)
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Método Directo e Indirecto | Clasificación por Actividades de Operación, Inversión y Financiamiento
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-3 text-xs">
              <div className="border p-2 bg-slate-50">
                <h4 className="font-bold text-slate-800 mb-1">1. ACTIVIDADES DE OPERACIÓN</h4>
                <div className="flex justify-between text-slate-700 pl-3">
                  <span>Flujo Neto derivado de Ventas, Cobros y Pagos Ordinarios:</span>
                  <span className="font-bold text-emerald-700">{formatHNL(financials.cashFlowStatement.operatingCashFlow)}</span>
                </div>
              </div>

              <div className="border p-2 bg-slate-50">
                <h4 className="font-bold text-slate-800 mb-1">2. ACTIVIDADES DE INVERSIÓN</h4>
                <div className="flex justify-between text-slate-700 pl-3">
                  <span>Adquisición de Maquinaria y Certificados DPF:</span>
                  <span className="font-bold text-rose-700">{formatHNL(financials.cashFlowStatement.investingCashFlow)}</span>
                </div>
              </div>

              <div className="border p-2 bg-slate-50">
                <h4 className="font-bold text-slate-800 mb-1">3. ACTIVIDADES DE FINANCIAMIENTO</h4>
                <div className="flex justify-between text-slate-700 pl-3">
                  <span>Desembolsos de Préstamos menos Amortización e Intereses:</span>
                  <span className="font-bold text-blue-800">{formatHNL(financials.cashFlowStatement.financingCashFlow)}</span>
                </div>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-200 border-2 border-slate-400 font-black text-slate-950">
                <span>VARIACIÓN NETA DE EFECTIVO Y EQUIVALENTES:</span>
                <span>{formatHNL(financials.cashFlowStatement.netChangeInCash)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
