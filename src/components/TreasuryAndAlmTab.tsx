import React, { useState } from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Coins, 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Percent, 
  FileText,
  AlertTriangle,
  Landmark
} from 'lucide-react';

interface TreasuryAndAlmTabProps {
  state: GameState;
  onTradeSpotUSD: (amountUSD: number, direction: 'comprar' | 'vender') => void;
  onBuyBchBill: (amountHNL: number, termMonths: number, yieldPct: number) => void;
}

export const TreasuryAndAlmTab: React.FC<TreasuryAndAlmTabProps> = ({
  state,
  onTradeSpotUSD,
  onBuyBchBill
}) => {
  const bch = state.bch;
  const financials = state.financials;

  const totalDeposits = financials.depositsPublicTotal;
  const requiredReserve = financials.requiredReserveAmount; // 12% BCH
  const actualReserves = financials.cashAndBCHReserves;
  const reserveSurplusDeficit = actualReserves - requiredReserve;
  const isReserveCompliant = reserveSurplusDeficit >= 0;

  const car = financials.capitalAdequacyRatioCAR;
  const isCarCompliant = car >= 10.0;

  // Cartera Back-to-Back y cómputo RWA
  const b2bFacilities = state.backToBackFacilities || [];
  const b2bTotalVolume = b2bFacilities.filter(f => f.status === 'vigente').reduce((a, f) => a + f.outstandingBalanceHNL, 0);

  // Formulario Mesa Cambiaria Spot
  const [spotAmountUSD, setSpotAmountUSD] = useState<number>(100000);
  const buyRate = +(bch.exchangeRateHNLtoUSD - 0.08).toFixed(4); // L. 24.80
  const sellRate = +(bch.exchangeRateHNLtoUSD + 0.08).toFixed(4); // L. 24.96

  // Formulario Inversiones Soberanas
  const [sovereignAmountHNL, setSovereignAmountHNL] = useState<number>(20000000);
  const [sovereignTermMonths, setSovereignTermMonths] = useState<number>(6);
  const sovereignYield = +(bch.tpmRate + 1.25).toFixed(2); // TPM + spread

  const handleSpotTrade = (direction: 'comprar' | 'vender') => {
    if (spotAmountUSD <= 0) return;
    sound.playApprovalStamp();
    onTradeSpotUSD(spotAmountUSD, direction);
  };

  const handleInvestSovereign = () => {
    if (sovereignAmountHNL <= 0 || actualReserves < sovereignAmountHNL) {
      sound.playRejectBuzzer();
      alert('Reserva de liquidez insuficiente para adquirir este título soberano.');
      return;
    }
    sound.playApprovalStamp();
    onBuyBchBill(sovereignAmountHNL, sovereignTermMonths, sovereignYield);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Tesorería Mayorista & ALCO · Banco Central de Honduras (BCH)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Normas Prudenciales CNBS & Basilea III</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Landmark className="w-6 h-6 text-amber-400" />
              Tesorería Institucional, ALCO & Encaje Legal (12%)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Administración de la reserva obligatoria de <strong className="text-amber-300">encaje legal del 12.0%</strong> exigida 
              por el BCH, mesa cambiaria de divisas USD Spot, portafolio de títulos soberanos SEFIN y calce de activos y pasivos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              isReserveCompliant ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-red-950/30 border-red-500/50 text-red-400'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              Encaje BCH: {isReserveCompliant ? 'CUMPLIENDO' : 'DEFICITARIO'}
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              isCarCompliant ? 'bg-blue-950/30 border-blue-500/50 text-blue-400' : 'bg-red-950/30 border-red-500/50 text-red-400'
            }`}>
              CAR: {car.toFixed(1)}% (Mín. 10%)
            </div>
          </div>
        </div>

        {/* Métricas ALCO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Encaje Requerido (12%)</div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
              {formatHNL(requiredReserve)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Sobre {formatHNL(totalDeposits)} en depósitos
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Reserva Efectiva Inmovilizada</div>
            <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${isReserveCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatHNL(actualReserves)}
            </div>
            <div className="text-[11px] font-mono mt-0.5 text-slate-400">
              {reserveSurplusDeficit >= 0 ? `Superávit: +${formatHNL(reserveSurplusDeficit)}` : `Déficit: -${formatHNL(Math.abs(reserveSurplusDeficit))}`}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Cartera Back-to-Back (0% RWA)</div>
            <div className="text-lg font-bold font-mono tabular-nums text-blue-400 mt-0.5">
              {formatHNL(b2bTotalVolume)}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Exonerado de Provisiones de Riesgo
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Tasa Política Monetaria TPM</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {bch.tpmRate.toFixed(2)}% Anual
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Tipo de Cambio: L. {bch.exchangeRateHNLtoUSD.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mesa Cambiaria USD Spot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              Mesa Cambiaria USD Spot (Subasta Diaria BCH)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compra y venta de divisas en mercado interbancario con spread regulado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-center font-mono">
            <div>
              <div className="text-[11px] text-slate-500 uppercase">Tipo de Cambio Compra</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">L. {buyRate.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase">Tipo de Cambio Venta</div>
              <div className="text-base font-bold text-blue-400 mt-0.5">L. {sellRate.toFixed(4)}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Volumen USD a Operar en Spot
            </label>
            <input
              type="number"
              step="10000"
              min="10000"
              value={spotAmountUSD}
              onChange={(e) => setSpotAmountUSD(Math.max(1000, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSpotTrade('comprar')}
              className="py-2.5 px-3 bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Comprar USD ${spotAmountUSD.toLocaleString()}
            </button>
            <button
              type="button"
              onClick={() => handleSpotTrade('vender')}
              className="py-2.5 px-3 bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              Vender USD ${spotAmountUSD.toLocaleString()}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Spread cambiario por operación: L. 0.16 por Dólar operado (+L. {(spotAmountUSD * 0.16).toFixed(0)} en margen cambial).
          </div>
        </div>

        {/* Títulos Soberanos SEFIN & Letras BCH */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Inversión en Deuda Soberana SEFIN / Letras BCH
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rentabilización de excedentes de liquidez con títulos libres de riesgo crediticio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monto de Inversión (HNL)
              </label>
              <input
                type="number"
                step="1000000"
                min="5000000"
                value={sovereignAmountHNL}
                onChange={(e) => setSovereignAmountHNL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plazo del Bono / Letra
              </label>
              <select
                value={sovereignTermMonths}
                onChange={(e) => setSovereignTermMonths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value={3}>3 meses (Letra BCH)</option>
                <option value={6}>6 meses (Bono SEFIN)</option>
                <option value={12}>12 meses (Bono del Tesoro)</option>
                <option value={24}>24 meses (Bono Soberano)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Rendimiento Soberano:</span>
              <span className="text-amber-300 font-bold">{sovereignYield}% anual (TPM + 1.25%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ingreso por Intereses Proyectado:</span>
              <span className="text-emerald-400 font-bold">
                +{formatHNL(Math.round(sovereignAmountHNL * (sovereignYield / 100) * (sovereignTermMonths / 12)))}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Calificación Crediticia:</span>
              <span className="text-slate-200">Soberana Honduras (B1 / B+)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInvestSovereign}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Adjudicar Título Soberano en Subasta
          </button>
        </div>
      </div>
    </div>
  );
};
