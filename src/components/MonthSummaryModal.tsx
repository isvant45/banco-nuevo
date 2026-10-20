import React from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct, getMonthName } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Newspaper, 
  ArrowRight, 
  Receipt, 
  Coins, 
  Scale 
} from 'lucide-react';

interface MonthSummaryModalProps {
  state: GameState;
  onClose: () => void;
}

export const MonthSummaryModal: React.FC<MonthSummaryModalProps> = ({
  state,
  onClose
}) => {
  const fin = state.financials;
  const { name: monthName, year, fullLabel } = getMonthName(state.gameMonth);

  const car = fin.capitalAdequacyRatioCAR;
  const isCarCompliant = car >= 10.0;
  const isReserveCompliant = fin.cashAndBCHReserves >= fin.requiredReserveAmount;

  const handleContinue = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera del Cierre Mensual */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block font-bold">
                CIERRE CONTABLE Y MONETARIO
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resultados del Mes: {fullLabel}
              </h2>
            </div>
          </div>

          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
            Turno #{state.gameMonth}
          </span>
        </div>

        {/* Boletín Oficial del BCH */}
        <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Newspaper className="w-4 h-4 text-amber-400" />
            <span>COMUNICADO DEL BANCO CENTRAL DE HONDURAS (BCH)</span>
          </div>
          <h3 className="text-sm font-semibold text-white">
            {state.bch.lastBulletinTitle}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {state.bch.lastBulletinText}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono pt-2 border-t border-slate-800/80 text-slate-300">
            <div>TPM: <span className="text-amber-400 font-bold">{formatPct(state.bch.tpmRate)}</span></div>
            <div>Inflación: <span className="text-amber-300 font-bold">{formatPct(state.bch.interannualInflation)}</span></div>
            <div>USD/HNL: <span className="text-emerald-400 font-bold">L. {state.bch.exchangeRateHNLtoUSD}</span></div>
          </div>
        </div>

        {/* Desglose de Resultados Financieros */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-sans font-bold text-slate-300 block mb-1">Margen Financiero Bruto:</span>
            <div className="flex justify-between text-slate-400">
              <span>Intereses Préstamos:</span>
              <span className="text-emerald-400">+{formatHNL(fin.interestIncomeLoans)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rendimiento Bonos BCH:</span>
              <span className="text-emerald-400">+{formatHNL(fin.interestIncomeTreasury)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>(-) Costo de Depósitos:</span>
              <span>-{formatHNL(fin.interestExpenseDeposits)}</span>
            </div>
            <div className="flex justify-between font-bold text-blue-300 pt-1 border-t border-slate-800">
              <span>Margen Neto:</span>
              <span>{formatHNL(fin.netInterestMargin)}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-sans font-bold text-slate-300 block mb-1">Comisiones y OPEX:</span>
            <div className="flex justify-between text-slate-400">
              <span>Comisiones (ACH+Planilla+SWIFT):</span>
              <span className="text-amber-400">+{formatHNL(fin.totalFeeIncome)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>(-) OPEX Personal y Agencias:</span>
              <span>-{formatHNL(fin.totalOperatingExpense)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>(-) Provisiones y 25% ISR:</span>
              <span>-{formatHNL(fin.creditProvisionExpense + fin.incomeTaxISR)}</span>
            </div>
            <div className={`flex justify-between font-bold pt-1 border-t border-slate-800 ${fin.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>Utilidad Final:</span>
              <span>{formatHNL(fin.netIncome)}</span>
            </div>
          </div>
        </div>

        {/* Semáforo de Cumplimiento Regulatorio CNBS */}
        <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isCarCompliant ? 'text-emerald-400' : 'text-rose-500'}`} />
            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Adecuación Capital (CAR):</span>
              <span className={`font-bold ${isCarCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPct(car)} {isCarCompliant ? '(Solvente · Min 10%)' : '(¡ALERTA CNBS!)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coins className={`w-4 h-4 ${isReserveCompliant ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Encaje Legal (12%):</span>
              <span className={`font-bold ${isReserveCompliant ? 'text-slate-200' : 'text-amber-400'}`}>
                {isReserveCompliant ? 'Cubierto con Holgura' : 'Déficit Cubierto por BCH'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Morosidad (NPL):</span>
              <span className={`font-bold ${fin.delinquencyRatioNPL <= 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPct(fin.delinquencyRatioNPL)} (Meta &lt;3%)
              </span>
            </div>
          </div>
        </div>

        {/* Notificaciones y Eventos Destacados del Mes */}
        {state.notifications && state.notifications.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Eventos y Notificaciones del Mes ({Math.min(4, state.notifications.length)}):
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {state.notifications.slice(0, 4).map(notif => (
                <div key={notif.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{notif.title}</span>
                      <span className="text-[10px] text-amber-400/90 font-mono">{notif.impactSummary}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de Cierre */}
        <div className="pt-2">
          <button
            onClick={handleContinue}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>Continuar al Siguiente Mes de Operaciones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
