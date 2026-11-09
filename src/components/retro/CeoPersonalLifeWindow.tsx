import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import {
  transferPersonalCeoFunds,
  purchaseCeoLuxuryAsset,
  DEFAULT_LUXURY_CATALOG
} from '../../game/tycoonAdvancedEngine';
import { CustomAmountInput } from './CustomAmountInput';

interface CeoPersonalLifeWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const CeoPersonalLifeWindow: React.FC<CeoPersonalLifeWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const ceo = state.ceoPersonalLife || {
    personalBankBalanceHNL: 350000,
    ceoStress: 25,
    burnoutWarning: false,
    monthlySalaryDrawHNL: 45000,
    luxuryAssetsOwned: [],
    angelInvestorsUnlocked: false,
    vacationDaysTaken: 0
  };

  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [withdrawType, setWithdrawType] = useState<'sueldo' | 'dividendo'>('dividendo');
  const [message, setMessage] = useState<string | null>(null);

  const handleWithdraw = () => {
    const res = transferPersonalCeoFunds(state, withdrawAmount, withdrawType);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleBuyLuxury = (assetId: string) => {
    const res = purchaseCeoLuxuryAsset(state, assetId);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleTakeVacation = () => {
    const cost = 85000;
    if (ceo.personalBankBalanceHNL < cost) {
      setMessage(`Fondos personales insuficientes para viaje de descanso a Roatán (L ${cost.toLocaleString()}).`);
      return;
    }
    const updated = {
      ...state,
      ceoPersonalLife: {
        ...ceo,
        personalBankBalanceHNL: ceo.personalBankBalanceHNL - cost,
        ceoStress: Math.max(0, ceo.ceoStress - 45),
        burnoutWarning: false,
        vacationDaysTaken: ceo.vacationDaysTaken + 5
      }
    };
    onUpdateState(updated);
    setMessage('🌴 ¡VACACIONES EN ROATÁN! El descanso total redujo el estrés en -45 puntos. Salud física y mental restaurada.');
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>🍸</span>
          <span>VIDA PRIVADA DEL CEO, FORTUNA PERSONAL & GOBERNANZA</span>
        </span>
        <button
          onClick={onClose}
          className="bg-[#c0c0c0] text-black hover:bg-red-600 hover:text-white px-1.5 py-0.5 font-bold border-t border-l border-white border-b-2 border-r-2 border-black"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="m-2 p-2 bg-yellow-100 border border-yellow-700 text-yellow-900 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Métricas Personales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Fortuna Personal (Cuenta Privada)</div>
            <div className="text-lg font-mono font-bold text-green-700">
              L {ceo.personalBankBalanceHNL.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">Patrimonio del fundador</div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Nivel de Estrés / Salud</div>
            <div className={`text-lg font-mono font-bold ${ceo.ceoStress > 70 ? 'text-red-600' : 'text-blue-900'}`}>
              {ceo.ceoStress}% {ceo.burnoutWarning ? '⚠️ BURNOUT' : ''}
            </div>
            <div className="w-full bg-gray-200 h-2 border border-gray-400 mt-1">
              <div
                className={`h-full ${ceo.ceoStress > 70 ? 'bg-red-600' : 'bg-green-600'}`}
                style={{ width: `${ceo.ceoStress}%` }}
              />
            </div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Inversionistas Ángeles</div>
            <div className="text-sm font-bold text-purple-900 mt-1">
              {ceo.angelInvestorsUnlocked ? '✓ DESBLOQUEADOS (Club de Golf/Yate)' : '🔒 BLOQUEADOS'}
            </div>
            <div className="text-[10px] text-gray-500">Aportan capital a cambio de equity</div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-bold">Terapia / Descanso</div>
              <div className="text-xs font-bold text-gray-800">{ceo.vacationDaysTaken} días tomados</div>
            </div>
            <button
              onClick={handleTakeVacation}
              className="w-full mt-1 py-1 bg-yellow-200 hover:bg-yellow-300 font-bold text-[10px] border border-yellow-700"
            >
              🌴 Vacaciones Roatán (L 85k)
            </button>
          </div>
        </div>

        {/* Retiro de Fondos: Sueldo vs Dividendos (10% SAR) */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2">
            💸 Distribución de Fondos: Tesorería Corporativa ➔ Cuenta Privada del CEO
          </div>
          <p className="text-gray-700 mb-2">
            El dinero de la empresa <strong>no es tuyo</strong> para gastos personales. Debes decretar dividendos o asignarte un sueldo. En Honduras, los dividendos pagan una retención definitiva del <strong>10% al SAR</strong> con comprobante de retención.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Concepto del Retiro:</label>
              <select
                value={withdrawType}
                onChange={e => setWithdrawType(e.target.value as any)}
                className="w-full p-1.5 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs"
              >
                <option value="dividendo">Decreto de Dividendos (Retención 10% SAR)</option>
                <option value="sueldo">Asignación de Sueldo Ejecutivo Directo</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Monto Bruto a Transferir (Lempiras):</label>
              <CustomAmountInput
                value={withdrawAmount}
                onChange={(num) => setWithdrawAmount(num)}
                maxAmount={state.storeBankBalance}
                label="Monto de Retiro"
              />
            </div>
          </div>

          <div className="p-2 bg-gray-50 border border-gray-300 flex justify-between items-center text-[11px]">
            <div>
              <span>Monto Neto Acreditado en Cuenta Personal: </span>
              <strong className="font-mono text-green-700 text-sm">
                L {(withdrawAmount * (withdrawType === 'dividendo' ? 0.90 : 1.0)).toLocaleString()}
              </strong>
              {withdrawType === 'dividendo' && (
                <span className="text-gray-500 text-[10px] ml-2">
                  (Deducción SAR: L {(withdrawAmount * 0.10).toLocaleString()})
                </span>
              )}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={withdrawAmount <= 0 || withdrawAmount > state.storeBankBalance}
              className="px-4 py-2 bg-[#000080] text-white hover:bg-blue-900 font-bold border-t-2 border-l-2 border-blue-400 border-b-2 border-r-2 border-black disabled:opacity-50"
            >
              Transferir a Fortuna Personal
            </button>
          </div>
        </div>

        {/* Tienda de Activos de Lujo Personal */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2">
            💎 Catálogo de Bienes Exclusivos del CEO (Alivio Permanente de Estrés)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {DEFAULT_LUXURY_CATALOG.map(asset => {
              const isOwned = (ceo.luxuryAssetsOwned || []).some(a => a.id === asset.id);

              return (
                <div key={asset.id} className="p-2.5 border border-gray-300 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between font-bold text-gray-900 text-xs">
                      <span>{asset.name}</span>
                      <span className="text-blue-900 font-mono">L {asset.priceHNL.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      • Reduce estrés en -{asset.stressReliefPoints} pts diarios.<br/>
                      {asset.prestigeUnlocksAngelInvestors && '• Desbloquea acceso a Inversionistas Ángeles.\n'}
                    </div>
                  </div>

                  <button
                    disabled={isOwned || ceo.personalBankBalanceHNL < asset.priceHNL}
                    onClick={() => handleBuyLuxury(asset.id)}
                    className="w-full mt-2 py-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold border-t border-l border-white border-b-2 border-r-2 border-black disabled:opacity-50 text-[10px]"
                  >
                    {isOwned ? '✓ Adquirido en Patrimonio Personal' : 'Comprar con Fortuna Privada'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
