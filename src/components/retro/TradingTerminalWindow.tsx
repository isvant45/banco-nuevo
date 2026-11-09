import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { tradeTreasuryCommodity } from '../../game/tycoonAdvancedEngine';

interface TradingTerminalWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const TradingTerminalWindow: React.FC<TradingTerminalWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const tt = state.treasuryTrading || {
    tradingAccountCashHNL: 150000,
    marginDebtHNL: 0,
    marginLimitHNL: 500000,
    holdings: [],
    realizedProfitLossHNL: 0,
    marginCallActive: false
  };

  const [selectedSymbol, setSelectedSymbol] = useState<string>(tt.holdings[0]?.symbol || 'CAFE-HN');
  const [unitsToTrade, setUnitsToTrade] = useState<number>(5);
  const [message, setMessage] = useState<string | null>(null);

  const selectedHolding = tt.holdings.find(h => h.symbol === selectedSymbol) || tt.holdings[0];

  const handleTrade = (action: 'comprar' | 'vender') => {
    if (!selectedHolding) return;
    const res = tradeTreasuryCommodity(state, selectedHolding.symbol, action, unitsToTrade);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const totalPortfolioValue = tt.holdings.reduce((sum, h) => sum + (h.units * h.currentPriceHNL), 0);
  const netEquity = tt.tradingAccountCashHNL + totalPortfolioValue - tt.marginDebtHNL;

  return (
    <div className="flex flex-col h-full bg-[#1e222d] text-white font-sans text-xs select-none border-2 border-gray-700 shadow-2xl">
      {/* Top Banner Bloomberg/Trading Style */}
      <div className="bg-[#131722] text-[#f0b90b] px-3 py-1 font-mono font-bold flex justify-between items-center border-b border-gray-800">
        <span className="flex items-center gap-2">
          <span className="text-red-500 font-bold">● LIVE</span>
          <span>ÁUREO TERMINAL BURSÁTIL & TESORERÍA CORPORATIVA</span>
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white font-bold px-1.5"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="m-2 p-2 bg-[#2a2e39] border border-[#f0b90b] text-[#f0b90b] text-xs font-mono">
          {message}
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Resumen de Margen y Portafolio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono">
          <div className="p-2 bg-[#131722] border border-gray-800">
            <div className="text-[10px] text-gray-400">PATRIMONIO NETO (EQUITY)</div>
            <div className="text-base font-bold text-green-400">L {netEquity.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-[#131722] border border-gray-800">
            <div className="text-[10px] text-gray-400">LIQUIDEZ EN CUENTA</div>
            <div className="text-base font-bold text-white">L {tt.tradingAccountCashHNL.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-[#131722] border border-gray-800">
            <div className="text-[10px] text-gray-400">DEUDA DE MARGEN</div>
            <div className={`text-base font-bold ${tt.marginDebtHNL > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
              L {tt.marginDebtHNL.toLocaleString()}
            </div>
          </div>
          <div className="p-2 bg-[#131722] border border-gray-800">
            <div className="text-[10px] text-gray-400">P&L REALIZADO HISTÓRICO</div>
            <div className={`text-base font-bold ${tt.realizedProfitLossHNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              L {tt.realizedProfitLossHNL.toLocaleString()}
            </div>
          </div>
        </div>

        {tt.marginCallActive && (
          <div className="p-2 bg-red-950 border border-red-600 text-red-300 font-bold text-xs animate-pulse">
            🚨 ALERTA MARGIN CALL: Tu valor de colateral cayó por debajo del 25% del margen prestado. Deposita efectivo para evitar liquidación forzada de tus activos.
          </div>
        )}

        {/* Tabla de Instrumentos y Commodities */}
        <div className="bg-[#131722] border border-gray-800 p-3">
          <div className="text-[#f0b90b] font-bold text-xs border-b border-gray-800 pb-1 mb-2 flex justify-between font-mono">
            <span>MERCADO DE COMMODITIES & INSTRUMENTOS (HONDURAS / GLOBAL)</span>
            <span>PRECIOS SPOT EN TIEMPO REAL</span>
          </div>

          <div className="space-y-1.5">
            {tt.holdings.map(h => {
              const isSelected = h.symbol === selectedHolding?.symbol;
              const unrealizedPnl = h.units > 0 ? (h.currentPriceHNL - h.avgCostHNL) * h.units : 0;

              return (
                <div
                  key={h.symbol}
                  onClick={() => setSelectedSymbol(h.symbol)}
                  className={`p-2 cursor-pointer flex justify-between items-center transition-colors border ${
                    isSelected ? 'border-[#f0b90b] bg-[#2a2e39]' : 'border-transparent hover:bg-[#1e222d]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span className="text-[#f0b90b] font-mono">{h.symbol}</span>
                      <span className="text-gray-300 text-xs font-normal">{h.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Posición: {h.units} unidades • Costo Promedio: L {h.avgCostHNL.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-white">
                      L {h.currentPriceHNL.toLocaleString()}
                    </div>
                    <div className={`text-[10px] ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.units > 0 ? `P&L: L ${unrealizedPnl.toLocaleString()}` : 'Sin posición'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Órdenes */}
        {selectedHolding && (
          <div className="bg-[#131722] border border-gray-800 p-3">
            <div className="text-white font-bold text-xs border-b border-gray-800 pb-1 mb-2 font-mono flex justify-between">
              <span>OPERAR INSTRUMENTO: {selectedHolding.symbol} ({selectedHolding.name})</span>
              <span className="text-[#f0b90b]">SPOT: L {selectedHolding.currentPriceHNL.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-gray-400 text-[10px] font-mono mb-1">CANTIDAD DE UNIDADES:</label>
                <input
                  type="number"
                  min={1}
                  value={unitsToTrade}
                  onChange={e => setUnitsToTrade(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#1e222d] border border-gray-700 text-white p-2 font-mono text-sm"
                />
                <div className="text-[10px] text-gray-400 font-mono mt-1">
                  Importe Total: L {(unitsToTrade * selectedHolding.currentPriceHNL).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTrade('comprar')}
                  className="py-2.5 bg-green-700 hover:bg-green-600 text-white font-bold font-mono text-xs rounded"
                >
                  COMPRAR (BUY)
                </button>
                <button
                  onClick={() => handleTrade('vender')}
                  disabled={selectedHolding.units < unitsToTrade}
                  className="py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold font-mono text-xs rounded disabled:opacity-40"
                >
                  VENDER (SELL)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
