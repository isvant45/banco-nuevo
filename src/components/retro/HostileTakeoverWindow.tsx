import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { buyCompetitorShares } from '../../game/tycoonAdvancedEngine';

interface HostileTakeoverWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const HostileTakeoverWindow: React.FC<HostileTakeoverWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const targets = state.hostileMnaTargets || [];
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targets[0]?.id || '');
  const [sharesCount, setSharesCount] = useState<number>(10000);
  const [message, setMessage] = useState<string | null>(null);

  const selectedTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  const handleBuy = () => {
    if (!selectedTarget) return;
    const res = buyCompetitorShares(state, selectedTarget.id, sharesCount);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleSetQuickShare = (pct: number) => {
    if (!selectedTarget) return;
    const count = Math.round(selectedTarget.totalShares * (pct / 100));
    setSharesCount(count);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>⚔️</span>
          <span>FUSIONES, ADQUISICIONES & TOMAS HOSTILES (M&A)</span>
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
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
          <p className="text-gray-700">
            Adquiere paquetes accionarios en el mercado secundario bursátil. Si acumulas el <strong>51%</strong> o más de las acciones ordinarias de un competidor, ejecutas una <strong>Toma Hostil</strong>: destituyes a su directiva, absorbes su efectivo en caja excedente y te apropias de su cuota de mercado. Ten cuidado con las empresas que activan <em>Píldoras de Veneno (Poison Pills)</em>.
          </p>
        </div>

        {/* Lista de Empresas Objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {targets.map(t => {
            const isSelected = t.id === selectedTarget?.id;
            const ownershipPct = (t.playerSharesOwned / t.totalShares) * 100;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTargetId(t.id)}
                className={`cursor-pointer p-3 border-2 ${
                  isSelected ? 'border-blue-900 bg-blue-50 ring-2 ring-blue-500' : 'border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-white'
                }`}
              >
                <div className="flex justify-between items-start border-b pb-1 mb-2">
                  <div>
                    <div className="font-bold text-xs text-gray-900">{t.name}</div>
                    <div className="text-[10px] text-gray-500">{t.sector}</div>
                  </div>
                  {t.isHostileTakeoverComplete && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 border border-green-500 text-[10px] font-bold">
                      ✓ ABSORBIDA
                    </span>
                  )}
                  {t.poisonPillActive && !t.isHostileTakeoverComplete && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-500 text-[10px] font-bold">
                      ☠️ POISON PILL
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio / Acción:</span>
                    <span className="font-mono font-bold">L {t.sharePriceHNL.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valuación Total:</span>
                    <span className="font-mono font-bold">L {t.companyValuationHNL.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Caja a Absorber:</span>
                    <span className="font-mono font-bold text-green-700">L {t.cashSurplusHNL.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuota de Mercado:</span>
                    <span className="font-mono font-bold text-purple-700">+{t.marketSharePct}%</span>
                  </div>
                </div>

                {/* Barra de Participación */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>Participación:</span>
                    <span className={ownershipPct >= 51 ? 'text-green-700 font-bold' : 'text-blue-900'}>
                      {ownershipPct.toFixed(1)}% {ownershipPct >= 51 ? '(CONTROL TOTAL)' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 border border-gray-400">
                    <div
                      className={`h-full ${ownershipPct >= 51 ? 'bg-green-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, ownershipPct)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5 text-right">
                    Objetivo: 51.0% para Toma Hostil
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Orden de Compra Accionaria */}
        {selectedTarget && (
          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
            <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2">
              📈 Orden de Compra de Bloque Accionario: {selectedTarget.name}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Número de Acciones Ordinarias a Comprar:
                </label>
                <input
                  type="number"
                  min={100}
                  max={selectedTarget.totalShares}
                  value={sharesCount}
                  onChange={e => setSharesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-1.5 font-mono text-sm border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white"
                />

                {/* Accesos rápidos de porcentaje */}
                <div className="flex gap-1 mt-1.5">
                  <button
                    onClick={() => handleSetQuickShare(10)}
                    className="flex-1 py-0.5 bg-gray-200 border border-gray-500 text-[10px] hover:bg-gray-300"
                  >
                    10%
                  </button>
                  <button
                    onClick={() => handleSetQuickShare(25)}
                    className="flex-1 py-0.5 bg-gray-200 border border-gray-500 text-[10px] hover:bg-gray-300"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handleSetQuickShare(51)}
                    className="flex-1 py-0.5 bg-yellow-200 border border-yellow-600 font-bold text-[10px] hover:bg-yellow-300"
                  >
                    51% (Toma)
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Inversión Requerida:</span>
                  <span className="font-mono font-bold text-sm text-blue-900">
                    L {(sharesCount * selectedTarget.sharePriceHNL).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo Bancario Disponible:</span>
                  <span className="font-mono font-bold">
                    L {state.storeBankBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participación Resultante:</span>
                  <span className="font-mono font-bold text-green-700">
                    {(((selectedTarget.playerSharesOwned + sharesCount) / selectedTarget.totalShares) * 100).toFixed(1)}%
                  </span>
                </div>

                <button
                  disabled={selectedTarget.isHostileTakeoverComplete || (sharesCount * selectedTarget.sharePriceHNL) > state.storeBankBalance}
                  onClick={handleBuy}
                  className="w-full mt-2 py-2 bg-[#000080] text-white hover:bg-blue-900 font-bold border-t-2 border-l-2 border-blue-400 border-b-2 border-r-2 border-black disabled:opacity-50"
                >
                  {selectedTarget.isHostileTakeoverComplete
                    ? 'Empresa Ya Absorbida'
                    : 'Ejecutar Compra en Bolsa de Valores'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
