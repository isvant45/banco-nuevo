import React from 'react';
import { GameState, PensionFund } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Sliders, 
  PiggyBank, 
  Coins 
} from 'lucide-react';

interface PensionFundsViewProps {
  state: GameState;
  onUpdateFundRates: (fundId: string, newReturnPct: number, newFeePct: number) => void;
}

export const PensionFundsView: React.FC<PensionFundsViewProps> = ({
  state,
  onUpdateFundRates
}) => {
  const totalAUM = state.pensionFunds.reduce((acc, f) => acc + f.totalAUM_HNL, 0);
  const totalAffiliates = state.pensionFunds.reduce((acc, f) => acc + f.affiliateCount, 0);

  const handleReturnChange = (fund: PensionFund, newReturn: number) => {
    sound.playClick();
    onUpdateFundRates(fund.id, newReturn, fund.managementFeePct);
  };

  const handleFeeChange = (fund: PensionFund, newFee: number) => {
    sound.playClick();
    onUpdateFundRates(fund.id, fund.currentAnnualReturnPct, newFee);
  };

  return (
    <div className="space-y-6">
      {/* 1. Encabezado de Fondos de Pensiones y Cesantías */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Áureo AFP: Fondos de Pensiones y Cesantías
              </h2>
              <p className="text-xs text-slate-400">
                Ahorro previsional y cesantías a largo plazo para trabajadores y clientes de todas las bancas. Pasivos cautivos de bajo costo que blindan la liquidez del banco.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Patrimonio Administrado (AUM):</span>
              <span className="text-emerald-400 font-bold">{formatHNL(totalAUM)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Afiliados Totales:</span>
              <span className="text-white font-bold">{totalAffiliates.toLocaleString()} clientes</span>
            </div>
          </div>
        </div>

        {/* 2. Grid de los 3 Perfiles de Fondos de Pensiones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {state.pensionFunds.map(fund => {
            return (
              <div
                key={fund.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white">{fund.name}</h3>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                        Perfil {fund.profile}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                      {fund.affiliateCount.toLocaleString()} partícipes
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    {fund.description}
                  </p>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 mb-4 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Patrimonio del Fondo:</span>
                      <span className="text-emerald-400 font-bold">{formatHNL(fund.totalAUM_HNL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Comisión Fiduciaria Áureo:</span>
                      <span className="text-amber-300 font-semibold">{formatPct(fund.managementFeePct)} anual</span>
                    </div>
                  </div>

                  {/* Sliders de Configuración de Rentabilidad Anual */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Rentabilidad Anual Ofrecida:</span>
                        <span className="font-mono font-bold text-amber-400">{formatPct(fund.currentAnnualReturnPct)}</span>
                      </div>
                      <input
                        type="range"
                        min={fund.annualReturnMinPct}
                        max={fund.annualReturnMaxPct}
                        step="0.1"
                        value={fund.currentAnnualReturnPct}
                        onChange={e => handleReturnChange(fund, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Min: {formatPct(fund.annualReturnMinPct)}</span>
                        <span>Max: {formatPct(fund.annualReturnMaxPct)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Comisión de Gestión Áureo:</span>
                        <span className="font-mono font-bold text-emerald-400">{formatPct(fund.managementFeePct)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={fund.managementFeePct}
                        onChange={e => handleFeeChange(fund, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Supervisado por CNBS</span>
                  <span className="text-emerald-400">Rendimiento Capitalizable</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
