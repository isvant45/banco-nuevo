import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle, 
  Calendar, 
  FileText,
  BadgeCheck
} from 'lucide-react';
import type { GameState } from '../../game/types';
import { formatHNL, formatPct } from '../../game/economyEngine';

interface AuditedRegulatoryReportModalProps {
  state: GameState;
  onClose: () => void;
}

export const AuditedRegulatoryReportModal: React.FC<AuditedRegulatoryReportModalProps> = ({
  state,
  onClose
}) => {
  const fin = state.financials;
  const gameMonth = state.gameMonth;
  const currentYear = state.bch.year || 2026;

  const totalAssets = fin.totalAssets;
  const totalLiabilities = fin.totalLiabilities;
  const totalEquity = fin.totalEquity;
  const car = fin.capitalAdequacyRatioCAR;
  const lcr = fin.liquidityCoverageRatioLCR;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0b101c] border border-amber-900/60 rounded-lg max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto text-slate-100">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Dictamen Favorable Sin Salvedades
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Resolución CNBS No. SB-1142/2026
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wide">
                Estados Financieros Auditados · {state.bankName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Regulatory Audit Header */}
        <div className="bg-[#101826] border border-slate-800 rounded p-4 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Institución Supervisada</span>
              <span className="font-bold text-slate-100">{state.bankName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Período de Cierre</span>
              <span className="font-bold text-slate-100">Mes {gameMonth} · Ejercicio {currentYear}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Firma Auditora Externa</span>
              <span className="font-bold text-slate-100">PwC & Asociados Honduras</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Marco Contable</span>
              <span className="font-bold text-slate-100">NIIF Plenas / CNBS Honduras</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet & Income Statement Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Balance General */}
          <div className="space-y-3 bg-[#0e1524] border border-slate-800/80 rounded p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                Balance General Resumido
              </span>
              <span className="text-[10px] text-slate-500">Valores en Lempiras</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-300">
                <span>Caja y Disponibilidades en BCH:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.cashAndBCHReserves)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cartera de Créditos Neta Vigente:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.loanPortfolioCurrent)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) Provisiones para Créditos Dudosos:</span>
                <span className="font-bold tabular-nums">-{formatHNL(fin.loanLossProvisions)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Inversiones en Títulos y Bonos BCH:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.treasuryBondsBCH)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Activos Fijos y Red de Sucursales:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.fixedAssetsBranches)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold text-emerald-400">
                <span>TOTAL ACTIVO:</span>
                <span className="tabular-nums">{formatHNL(totalAssets)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Depósitos del Público (Vista + DPF):</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.depositsPublicTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Préstamos Interbancarios y Otros Pasivos:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.interbankBorrowingBCH + fin.otherLiabilities)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Capital Social Pagado:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.capitalStock)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Utilidades Retenidas y Reservas:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.retainedEarnings)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold text-amber-400">
                <span>TOTAL PASIVO Y PATRIMONIO:</span>
                <span className="tabular-nums">{formatHNL(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Estado de Resultados */}
          <div className="space-y-3 bg-[#0e1524] border border-slate-800/80 rounded p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 uppercase tracking-wider">
                Estado de Resultados Acumulado
              </span>
              <span className="text-[10px] text-slate-500">Valores en Lempiras</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-300">
                <span>Ingresos Financieros por Intereses:</span>
                <span className="font-bold tabular-nums text-slate-100">{formatHNL(fin.netInterestMargin + (fin.depositsPublicTotal * 0.05 / 12))}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) Gastos Financieros por Intereses:</span>
                <span className="font-bold tabular-nums">-{formatHNL(fin.depositsPublicTotal * 0.05 / 12)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-200 font-semibold">
                <span>Margen Financiero Bruto:</span>
                <span className="tabular-nums">{formatHNL(fin.netInterestMargin)}</span>
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>(+) Ingresos por Comisiones y Servicios:</span>
                <span className="font-bold tabular-nums text-slate-100">+{formatHNL(fin.totalFeeIncome)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) Gastos de Operación y Personal:</span>
                <span className="font-bold tabular-nums">-{formatHNL(fin.totalOperatingExpense)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) Gasto por Provisiones Crediticias:</span>
                <span className="font-bold tabular-nums">-{formatHNL(fin.creditProvisionExpense)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) Impuesto Sobre la Renta (ISR 25% SAR):</span>
                <span className="font-bold tabular-nums">-{formatHNL(fin.incomeTaxISR)}</span>
              </div>

              <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold text-emerald-400">
                <span>UTILIDAD NETA AUDITADA:</span>
                <span className="tabular-nums">{formatHNL(fin.netIncome)}</span>
              </div>
            </div>

            {/* Ratios de Certificación */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase">
                Cumplimiento de Estándares Prudenciales CNBS:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#121929] p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">CAR Computado:</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{car.toFixed(2)}%</span>
                  <span className="text-[10px] text-slate-500 block">(Mínimo 10.0%)</span>
                </div>
                <div className="bg-[#121929] p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">LCR Liquidez:</span>
                  <span className="font-bold text-cyan-400 tabular-nums">{lcr.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-500 block">(Mínimo 100.0%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Certification Footnote */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="leading-snug">
              "En nuestra opinión, los estados financieros adjuntos presentan razonablemente, en todos los aspectos materiales, la situación patrimonial de {state.bankName} de conformidad con la Ley de Instituciones del Sistema Financiero."
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-slate-200 font-bold">Lic. Marcio Sierra C.</div>
            <div className="text-[10px] text-slate-500">Socio Director de Auditoría Bancaria</div>
          </div>
        </div>
      </div>
    </div>
  );
};
