import React, { useState } from 'react';
import { BankFinancialStatements } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { FileText, X, TrendingUp, ShieldCheck, PieChart, Landmark, Scale } from 'lucide-react';

interface FinancialStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  financials: BankFinancialStatements;
  bankName: string;
  gameMonth: number;
}

export function FinancialStatementsModal({
  isOpen,
  onClose,
  financials,
  bankName,
  gameMonth
}: FinancialStatementsModalProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'resultados' | 'ratios'>('balance');

  if (!isOpen) return null;

  const netLoanPortfolio = financials.loanPortfolioCurrent + financials.loanPortfolioPastDue - financials.loanLossProvisions;
  const isReserveCompliant = financials.cashAndBCHReserves >= financials.requiredReserveAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Estados Financieros Auditados CNBS</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Certificado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {bankName} · Normas Contables de la Comisión Nacional de Bancos y Seguros (CNBS) · Mes {gameMonth}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 mt-4 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'balance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Balance General Clasificado
          </button>
          <button
            onClick={() => setActiveTab('resultados')}
            className={`flex-1 py-2 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'resultados'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Estado de Resultados Integral
          </button>
          <button
            onClick={() => setActiveTab('ratios')}
            className={`flex-1 py-2 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ratios'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Indicadores & Encaje BCH
          </button>
        </div>

        {/* Tab 1: Balance General */}
        {activeTab === 'balance' && (
          <div className="mt-4 space-y-4 text-xs font-mono">
            {/* Activos */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-sans flex items-center justify-between">
                <span>1. ACTIVO TOTAL</span>
                <span className="text-emerald-400">{formatHNL(financials.totalAssets)}</span>
              </h3>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans font-semibold text-slate-200">1.1 Activo Disponible & Reservas BCH</span>
                  <span>{formatHNL(financials.cashAndBCHReserves)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Caja y depósitos en el Banco Central</span>
                  <span>{formatHNL(financials.cashAndBCHReserves - financials.requiredReserveAmount)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Encaje Legal Obligatorio (12% de depósitos)</span>
                  <span className="text-amber-300">{formatHNL(financials.requiredReserveAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                  <span className="font-sans font-semibold text-slate-200">1.2 Inversiones Financieras & Valores</span>
                  <span>{formatHNL(financials.treasuryBondsBCH + financials.secondarySecuritiesValueHNL + financials.fxReservesUSDValueInHNL)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Títulos y Bonos Soberanos del BCH / SEFIN</span>
                  <span>{formatHNL(financials.treasuryBondsBCH)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Portafolio Mercado Secundario (Bonos & Acciones)</span>
                  <span>{formatHNL(financials.secondarySecuritiesValueHNL)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Posición de Cambio / Reservas en USD</span>
                  <span>{formatHNL(financials.fxReservesUSDValueInHNL)}</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                  <span className="font-sans font-semibold text-slate-200">1.3 Cartera Crediticia Neta</span>
                  <span className="text-emerald-400 font-bold">{formatHNL(netLoanPortfolio)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-400">
                  <span className="font-sans">· Préstamos Vigentes al Día</span>
                  <span>{formatHNL(financials.loanPortfolioCurrent)}</span>
                </div>
                <div className="flex justify-between pl-4 text-rose-400">
                  <span className="font-sans">· Préstamos Vencidos y en Mora (Categorías I a V)</span>
                  <span>{formatHNL(financials.loanPortfolioPastDue)}</span>
                </div>
                <div className="flex justify-between pl-4 text-rose-300">
                  <span className="font-sans">· (-) Provisiones Anticíclicas Acumuladas</span>
                  <span>-{formatHNL(financials.loanLossProvisions)}</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                  <span className="font-sans font-semibold text-slate-200">1.4 Activos Fijos, Sucursales y Canales</span>
                  <span>{formatHNL(financials.fixedAssetsBranches)}</span>
                </div>
              </div>
            </div>

            {/* Pasivo y Patrimonio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pasivo */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider font-sans flex items-center justify-between">
                  <span>2. PASIVO TOTAL</span>
                  <span className="text-blue-300">{formatHNL(financials.totalLiabilities)}</span>
                </h3>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans font-semibold text-slate-200">2.1 Obligaciones con el Público</span>
                    <span>{formatHNL(financials.depositsPublicTotal)}</span>
                  </div>
                  <div className="flex justify-between pl-3 text-slate-400">
                    <span className="font-sans">· Depósitos en Cuenta de Ahorro y Cheques</span>
                    <span>{formatHNL(Math.round(financials.depositsPublicTotal * 0.55))}</span>
                  </div>
                  <div className="flex justify-between pl-3 text-slate-400">
                    <span className="font-sans">· Depósitos a Plazo Fijo (DPF)</span>
                    <span>{formatHNL(Math.round(financials.depositsPublicTotal * 0.45))}</span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                    <span className="font-sans font-semibold text-slate-200">2.2 Préstamos Interbancarios BCH</span>
                    <span>{formatHNL(financials.interbankBorrowingBCH)}</span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                    <span className="font-sans font-semibold text-slate-200">2.3 Otras Cuentas por Pagar</span>
                    <span>{formatHNL(financials.otherLiabilities)}</span>
                  </div>
                </div>
              </div>

              {/* Patrimonio */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-sans flex items-center justify-between">
                  <span>3. PATRIMONIO NETO</span>
                  <span className="text-amber-300">{formatHNL(financials.totalEquity)}</span>
                </h3>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans font-semibold text-slate-200">3.1 Capital Social Pagado</span>
                    <span>{formatHNL(financials.capitalStock)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans font-semibold text-slate-200">3.2 Utilidades Retenidas Acumuladas</span>
                    <span>{formatHNL(financials.retainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/40">
                    <span className="font-sans font-semibold text-emerald-400">3.3 Utilidad Neta del Mes</span>
                    <span className="text-emerald-300 font-bold">{formatHNL(financials.currentMonthProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Estado de Resultados */}
        {activeTab === 'resultados' && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-sans font-bold text-slate-200">Concepto Contable</span>
              <span className="font-sans font-bold text-slate-200">Monto del Mes (HNL)</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span className="font-sans">1. Ingresos Financieros Totales</span>
                <span className="text-emerald-400">{formatHNL(financials.totalFinancialIncome)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Intereses de Cartera Crediticia</span>
                <span>{formatHNL(financials.interestIncomeLoans)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Rendimiento Títulos BCH</span>
                <span>{formatHNL(financials.interestIncomeTreasury)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Cupones y Dividendos Mercado Secundario</span>
                <span>{formatHNL(financials.interestIncomeSecurities)}</span>
              </div>

              <div className="flex justify-between text-slate-200 font-semibold pt-2 border-t border-slate-800/40">
                <span className="font-sans">2. (-) Gastos Financieros Totales</span>
                <span className="text-rose-400">-{formatHNL(financials.totalFinancialExpense)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Intereses Pagados por Depósitos</span>
                <span>-{formatHNL(financials.interestExpenseDeposits)}</span>
              </div>

              <div className="flex justify-between text-amber-300 font-bold pt-2 border-t border-slate-800">
                <span className="font-sans">3. MARGEN FINANCIERO BRUTO</span>
                <span>{formatHNL(financials.netInterestMargin)}</span>
              </div>

              <div className="flex justify-between text-slate-200 font-semibold pt-2 border-t border-slate-800/40">
                <span className="font-sans">4. Ingresos por Comisiones y Servicios</span>
                <span className="text-emerald-400">+{formatHNL(financials.totalFeeIncome)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Transferencias ACH Pronto</span>
                <span>{formatHNL(financials.feeIncomeClearingACH)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Servicios de Planillas Corporativas CEE</span>
                <span>{formatHNL(financials.feeIncomePayrollServices)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Comercio Internacional SWIFT y Divisas</span>
                <span>{formatHNL(financials.feeIncomeSwiftAndFX)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Remesas Familiares</span>
                <span>{formatHNL(financials.feeIncomeRemittances)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Tarjetas y Comercios Afiliados POS</span>
                <span>{formatHNL(financials.feeIncomeCardsAndPOS)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Administración Fondos de Pensiones</span>
                <span>{formatHNL(financials.feeIncomePensionFunds)}</span>
              </div>

              <div className="flex justify-between text-slate-200 font-semibold pt-2 border-t border-slate-800/40">
                <span className="font-sans">5. (-) Gastos de Operación y Administración (OPEX)</span>
                <span className="text-rose-400">-{formatHNL(financials.totalOperatingExpense)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Sueldos de Personal y Junta Directiva</span>
                <span>-{formatHNL(financials.staffSalariesExpense)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Opex de Sucursales y Alquileres</span>
                <span>-{formatHNL(financials.branchesOpexExpense)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-400">
                <span className="font-sans">· Tecnología Digital y Mercadeo</span>
                <span>-{formatHNL(financials.technologyAndMarketingExpense)}</span>
              </div>

              <div className="flex justify-between text-slate-200 font-semibold pt-2 border-t border-slate-800/40">
                <span className="font-sans">6. (-) Gasto en Provisiones Crediticias CNBS</span>
                <span className="text-rose-400">-{formatHNL(financials.creditProvisionExpense)}</span>
              </div>

              <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800">
                <span className="font-sans">7. Utilidad antes de Impuestos</span>
                <span>{formatHNL(financials.incomeBeforeTax)}</span>
              </div>

              <div className="flex justify-between text-slate-400 pl-4">
                <span className="font-sans">· (-) Impuesto sobre la Renta (ISR 25% de Honduras)</span>
                <span className="text-rose-300">-{formatHNL(financials.incomeTaxISR)}</span>
              </div>

              <div className="flex justify-between text-emerald-400 font-bold text-sm pt-3 border-t-2 border-emerald-500/40">
                <span className="font-sans">8. UTILIDAD NETA DEL MES</span>
                <span>{formatHNL(financials.netIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ratios Regulatorios & Encaje BCH */}
        {activeTab === 'ratios' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Adecuación de Capital (CAR)</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{formatPct(financials.capitalAdequacyRatioCAR)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Mínimo CNBS: 10.0% · Holgura: +{(financials.capitalAdequacyRatioCAR - 10).toFixed(1)}%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Cobertura de Liquidez (LCR)</p>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">{financials.liquidityCoverageRatioLCR}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Mínimo regulatorio: 100%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Mora Cartera (NPL)</p>
                <p className={`text-xl font-bold font-mono mt-1 ${financials.delinquencyRatioNPL <= 3.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPct(financials.delinquencyRatioNPL)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Límite prudencial: 3.00%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Retorno sobre Patrimonio (ROE)</p>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">{formatPct(financials.returnOnEquityROE)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Rentabilidad anualizada</p>
              </div>
            </div>

            {/* Panel de Encaje Legal BCH */}
            <div className={`p-4 rounded-xl border ${
              isReserveCompliant ? 'bg-slate-950 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isReserveCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <h4 className="text-sm font-bold text-slate-100">Posición de Encaje Legal Obligatorio (BCH)</h4>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
                  isReserveCompliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isReserveCompliant ? 'SUPERÁVIT DE ENCAJE' : 'DÉFICIT DE ENCAJE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div>
                  <p className="text-slate-400 font-sans">Encaje Requerido (12%):</p>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">{formatHNL(financials.requiredReserveAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-sans">Reservas Totales Disponibles:</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{formatHNL(financials.cashAndBCHReserves)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-sans">Excedente Libre:</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    +{formatHNL(Math.max(0, financials.cashAndBCHReserves - financials.requiredReserveAmount))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cerrar Dictamen
          </button>
        </div>
      </div>
    </div>
  );
}
