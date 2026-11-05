import React from 'react';
import { sound } from '../../game/audioFx';

interface BankVaultWindowProps {
  vaultCash: number;
  bchReserve: number;
  totalDeposits: number;
  depositRatePct: number;
  monthlyFee: number;
  atmFee: number;
  reputation: number;
  runRiskPct: number;
  totalLoans: number;
  onUpdateRatesAndFees: (depositRate: number, monthlyFee: number, atmFee: number) => void;
}

export const BankVaultWindow: React.FC<BankVaultWindowProps> = ({
  vaultCash,
  bchReserve,
  totalDeposits,
  depositRatePct,
  monthlyFee,
  atmFee,
  reputation,
  runRiskPct,
  totalLoans,
  onUpdateRatesAndFees
}) => {
  const [rate, setRate] = React.useState(depositRatePct);
  const [mFee, setMFee] = React.useState(monthlyFee);
  const [aFee, setAFee] = React.useState(atmFee);

  const coverageRatio = totalDeposits > 0 ? ((vaultCash / totalDeposits) * 100).toFixed(1) : '100';

  const handleApply = () => {
    sound.playApprovalStamp();
    onUpdateRatesAndFees(rate, mFee, aFee);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Alerta de Riesgo de Corrida Bancaria si es elevado */}
      {runRiskPct > 35 && (
        <div className="bg-red-100 border-2 border-red-500 p-2 text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <span className="font-bold block">¡Alerta de Liquidez y Corrida Bancaria!</span>
              <span>El riesgo de retiros masivos es del {runRiskPct}%. Aumenta la reserva de bóveda o eleva la tasa de depósitos.</span>
            </div>
          </div>
          <span className="font-mono font-bold text-sm bg-red-200 px-2 py-0.5 border border-red-400">
            {runRiskPct}% RIESGO
          </span>
        </div>
      )}

      {/* Tarjetas de Balance de Bóveda y Liquidez */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Efectivo Físico en Bóveda</span>
          <span className="font-mono text-base font-bold text-emerald-800">
            L {vaultCash.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Para atender retiros y créditos</span>
        </div>

        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Depósitos Totales Exigibles</span>
          <span className="font-mono text-base font-bold text-blue-900">
            L {totalDeposits.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pasivo adeudado al público</span>
        </div>

        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Ratio de Cobertura Inmediata</span>
          <span className={`font-mono text-base font-bold ${
            Number(coverageRatio) < 12 ? 'text-red-700' : 'text-slate-900'
          }`}>
            {coverageRatio}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Mínimo sugerido: 12%</span>
        </div>
      </div>

      {/* Configuración de Tarifas y Rendimientos */}
      <div className="bg-[#e4e4e4] border border-[#808080] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#808080] pb-1.5">
          <span className="font-bold text-slate-800 text-xs">Tarifario de Tasas y Comisiones del Banco</span>
          <span className="text-[11px] text-slate-500">Ajusta tu estrategia de captación y rentabilidad</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tasa Pasiva para Depósitos */}
          <div className="bg-white p-2 border border-[#a0a0a0]">
            <label className="text-slate-700 font-semibold block mb-1">
              Tasa Pasiva Anual (Depósitos):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                min="0.5"
                max="12"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-xs"
              />
              <span className="font-bold text-slate-700">% Anual</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Una tasa más alta atrae ahorrantes pero eleva el costo financiero mensual.
            </p>
          </div>

          {/* Comisión Mensual de Mantenimiento */}
          <div className="bg-white p-2 border border-[#a0a0a0]">
            <label className="text-slate-700 font-semibold block mb-1">
              Comisión de Cuenta (Mantenimiento):
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">L</span>
              <input
                type="number"
                step="5"
                min="0"
                max="120"
                value={mFee}
                onChange={(e) => setMFee(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-xs"
              />
              <span className="text-slate-700 text-xs">/ mes</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Comisiones excesivas provocan fuga de clientes a la competencia.
            </p>
          </div>

          {/* Comisión por Uso de ATM */}
          <div className="bg-white p-2 border border-[#a0a0a0]">
            <label className="text-slate-700 font-semibold block mb-1">
              Tarifa Cajero Automático (ATM):
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">L</span>
              <input
                type="number"
                step="2"
                min="0"
                max="45"
                value={aFee}
                onChange={(e) => setAFee(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-xs"
              />
              <span className="text-slate-700 text-xs">/ retiro</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Ingreso recurrente por transacciones de clientes.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-[#000080] hover:bg-[#1084d0] text-white font-bold text-xs border-t border-l border-white border-b border-r border-[#000040] shadow-sm flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>Guardar Nuevo Tarifario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
