import React, { useState } from 'react';
import { 
  Building2, 
  Handshake, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Store, 
  Layers, 
  Info,
  ArrowRight
} from 'lucide-react';
import type { GameState, MergersAcquisitionsDeal } from '../../game/types';
import { formatHNL, formatPct } from '../../game/economyEngine';

interface BankMergersAcquisitionsTabProps {
  state: GameState;
  onExecuteDeal: (dealId: string) => void;
}

export const BankMergersAcquisitionsTab: React.FC<BankMergersAcquisitionsTabProps> = ({
  state,
  onExecuteDeal
}) => {
  const [selectedDeal, setSelectedDeal] = useState<MergersAcquisitionsDeal | null>(null);
  const [confirmModalDeal, setConfirmModalDeal] = useState<MergersAcquisitionsDeal | null>(null);

  const deals = state.maDeals || [];
  const cashReserves = state.financials.cashAndBCHReserves;
  const currentCAR = state.financials.capitalAdequacyRatioCAR;

  // Calculate executed metrics
  const executedDeals = deals.filter(d => d.status === 'ejecutado');
  const totalVolumeAcquired = executedDeals.reduce((acc, d) => acc + d.assetsAcquiredHNL, 0);
  const totalDiscountSaved = executedDeals.reduce((acc, d) => acc + Math.max(0, d.faceValueHNL - d.purchasePriceHNL), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0a0f1d] border border-amber-900/30 p-5 rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono tracking-wider text-slate-100 uppercase">
                Mesa Corporativa de Fusiones & Adquisiciones (M&A)
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Adquisición de carteras de crédito en bloque (Consumo, PYME, Agro) y redes de sucursales con descuento pactado.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-[#111927] border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400 uppercase">Liquidez Disponible</div>
              <div className="text-amber-400 font-bold tabular-nums">{formatHNL(cashReserves)}</div>
            </div>
            <div className="bg-[#111927] border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-400 uppercase">CAR Actual</div>
              <div className={`font-bold tabular-nums ${currentCAR >= 10.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentCAR.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Execution Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="text-slate-400">
            Operaciones Concretadas: <span className="text-slate-200 font-bold">{executedDeals.length} de {deals.length}</span>
          </div>
          <div className="text-slate-400">
            Cartera Total Absorbida: <span className="text-emerald-400 font-bold tabular-nums">{formatHNL(totalVolumeAcquired)}</span>
          </div>
          <div className="text-slate-400">
            Ganancia por Descuento (Bargain Gain): <span className="text-cyan-400 font-bold tabular-nums">{formatHNL(totalDiscountSaved)}</span>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {deals.map(deal => {
          const isExecuted = deal.status === 'ejecutado';
          const canAfford = cashReserves >= deal.purchasePriceHNL;
          const meetsCar = currentCAR >= deal.minimumCarRequiredPct;
          const isExecutable = !isExecuted && canAfford && meetsCar;

          return (
            <div
              key={deal.id}
              className={`bg-[#0b101b] border rounded-lg p-5 flex flex-col justify-between space-y-4 transition ${
                isExecuted
                  ? 'border-emerald-800/40 opacity-75'
                  : 'border-slate-800 hover:border-amber-700/50'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold tracking-wider">{deal.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    isExecuted
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  }`}>
                    {isExecuted ? 'Ejecutado' : 'Disponible'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Banco Cedente: <span className="text-slate-200 font-bold">{deal.targetBankName}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 leading-snug">
                    {deal.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {deal.description}
                  </p>
                </div>

                {/* Financial Figures Matrix */}
                <div className="bg-[#101826] border border-slate-800/80 rounded p-3 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Valor Facial:</span>
                    <span className="text-slate-200 font-bold tabular-nums">{formatHNL(deal.faceValueHNL)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Precio de Compra:</span>
                    <span className="text-amber-400 font-bold tabular-nums">{formatHNL(deal.purchasePriceHNL)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Descuento de Compra:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">{deal.discountPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rendimiento Activo Proyectado:</span>
                    <span className="text-cyan-400 font-bold tabular-nums">{deal.expectedAnnualYieldPct.toFixed(1)}% anual</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">CAR Mínimo CNBS Exigido:</span>
                    <span className={`font-bold tabular-nums ${meetsCar ? 'text-slate-300' : 'text-rose-400'}`}>
                      {deal.minimumCarRequiredPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Regulatory Impact */}
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{deal.regulatoryHhiImpact}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isExecuted ? (
                  <div className="w-full py-2 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded text-center text-xs font-mono font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cartera Asimilada en Balance</span>
                  </div>
                ) : (
                  <button
                    disabled={!isExecutable}
                    onClick={() => setConfirmModalDeal(deal)}
                    className={`w-full py-2.5 rounded text-xs font-mono font-bold tracking-wider uppercase transition flex items-center justify-center gap-1.5 ${
                      isExecutable
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    <span>Ejecutar Adquisición / M&A</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!isExecuted && !canAfford && (
                  <p className="text-[10px] text-rose-400 font-mono text-center mt-1">
                    Fondos insuficientes en reservas (Faltan {formatHNL(deal.purchasePriceHNL - cashReserves)})
                  </p>
                )}
                {!isExecuted && canAfford && !meetsCar && (
                  <p className="text-[10px] text-rose-400 font-mono text-center mt-1">
                    CAR actual ({currentCAR.toFixed(2)}%) inferior al umbral de CNBS ({deal.minimumCarRequiredPct}%)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModalDeal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-900/60 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Handshake className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                  Confirmar Adquisición Corporativa (M&A)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {confirmModalDeal.id} · {confirmModalDeal.title}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <p>
                Estás a punto de transferir <span className="text-amber-400 font-bold">{formatHNL(confirmModalDeal.purchasePriceHNL)}</span> desde la cuenta de reservas de Áureo Bank para comprar esta cartera valorada en <span className="text-slate-100 font-bold">{formatHNL(confirmModalDeal.faceValueHNL)}</span> a <span className="text-slate-100 font-bold">{confirmModalDeal.targetBankName}</span>.
              </p>

              <div className="bg-[#151f33] p-3 rounded border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-slate-400">Impacto inmediato en Balance:</div>
                <div className="text-emerald-400">· +{formatHNL(confirmModalDeal.assetsAcquiredHNL)} a Cartera de Créditos</div>
                <div className="text-cyan-400">· +{formatHNL(Math.max(0, confirmModalDeal.faceValueHNL - confirmModalDeal.purchasePriceHNL))} a Utilidades Retenidas / Ganancia por Compra</div>
                <div className="text-rose-400">· -{formatHNL(confirmModalDeal.purchasePriceHNL)} de Reservas BCH</div>
                <div className="text-slate-400">· {confirmModalDeal.regulatoryHhiImpact}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalDeal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onExecuteDeal(confirmModalDeal.id);
                  setConfirmModalDeal(null);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs rounded transition shadow-lg shadow-amber-500/20"
              >
                Ratificar Contrato M&A
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
