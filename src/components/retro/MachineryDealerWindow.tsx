import React, { useState } from 'react';
import { MachineryDealer, OwnedMachineryUnit } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface MachineryDealerWindowProps {
  dealers: MachineryDealer[];
  ownedMachinery: OwnedMachineryUnit[];
  storeCash: number;
  storeBankBalance: number;
  onBuyMachinery: (dealerId: string, machineryId: string) => void;
}

export const MachineryDealerWindow: React.FC<MachineryDealerWindowProps> = ({
  dealers,
  ownedMachinery,
  storeCash,
  storeBankBalance,
  onBuyMachinery
}) => {
  const [selectedDealerId, setSelectedDealerId] = useState<string>(dealers[0]?.id || 'covesa_cat');
  const [activeTab, setActiveTab] = useState<'concesionarias' | 'flota'>('concesionarias');

  const selectedDealer = dealers.find(d => d.id === selectedDealerId) || dealers[0];
  const totalFunds = storeCash + storeBankBalance;

  const renderStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Barra de Pestañas Superior */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { sound.playClick(); setActiveTab('concesionarias'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
              activeTab === 'concesionarias' ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
            }`}
          >
            🚜 Concesionarias del País (1 a 5 Estrellas)
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('flota'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
              activeTab === 'flota' ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
            }`}
          >
            🚛 Flota Propia de Maquinaria ({ownedMachinery.length})
          </button>
        </div>

        <div className="font-mono text-[11px] bg-white px-2 py-1 border border-[#808080]">
          Liquidez: <strong className="text-blue-900">L {totalFunds.toLocaleString()}</strong>
        </div>
      </div>

      {activeTab === 'concesionarias' && (
        <div className="flex-1 p-2 flex flex-col md:flex-row gap-2 overflow-hidden">
          {/* Lista Izquierda de Concesionarias */}
          <div className="w-full md:w-64 bg-white border border-[#808080] p-1.5 space-y-1.5 overflow-y-auto shrink-0">
            <span className="font-bold text-[10px] text-slate-600 block px-1">CONCESIONARIAS Y DISTRIBUIDORAS:</span>
            {dealers.map((dealer) => {
              const isSelected = selectedDealer?.id === dealer.id;

              return (
                <div
                  key={dealer.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDealerId(dealer.id);
                  }}
                  className={`p-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#000080] text-white border-blue-900'
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{dealer.name}</span>
                  </div>
                  <div className="text-[10px] mt-0.5">{renderStars(dealer.ratingStars)}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {dealer.city}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel Derecho: Catálogo de Maquinaria */}
          <div className="flex-1 bg-white border border-[#808080] p-2.5 overflow-y-auto flex flex-col justify-between">
            {selectedDealer && (
              <div className="space-y-3">
                <div className="border-b border-[#808080] pb-2 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{selectedDealer.name}</h3>
                    <p className="text-[11px] text-slate-600">{selectedDealer.tagline}</p>
                    <span className="text-[10px] font-mono text-blue-900">Sede: {selectedDealer.city}</span>
                  </div>
                  <span className="text-base">{renderStars(selectedDealer.ratingStars)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedDealer.catalog.map((machinery) => {
                    const canAfford = totalFunds >= machinery.priceHNL;

                    return (
                      <div key={machinery.id} className="bg-slate-50 border border-slate-300 p-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{machinery.icon}</span>
                            <span className="text-xs">{renderStars(machinery.ratingStars)}</span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 mt-1">{machinery.modelName}</h4>
                          <p className="text-[10px] text-slate-600 mt-0.5">{machinery.description}</p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200">
                          <div className="flex justify-between items-center font-mono text-[11px] mb-2">
                            <span className="text-slate-500">Precio compra:</span>
                            <span className="font-bold text-blue-900">L {machinery.priceHNL.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                            <span>Consumo combustible:</span>
                            <span>L {machinery.hourlyFuelCost}/hora operativa</span>
                          </div>

                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              sound.playApprovalStamp();
                              onBuyMachinery(selectedDealer.id, machinery.id);
                            }}
                            className={`w-full py-1.5 font-bold text-xs border shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              canAfford 
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-950' 
                                : 'bg-slate-200 text-slate-500 border-slate-300'
                            }`}
                          >
                            <span>🛒</span>
                            <span>{canAfford ? 'Comprar e Incorporar a Flota' : 'Fondos Insuficientes'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Flota Propia de Maquinaria */}
      {activeTab === 'flota' && (
        <div className="flex-1 p-2.5 overflow-y-auto bg-white border-t border-[#808080]">
          <div className="flex justify-between items-center mb-2 pb-1 border-b">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Parque de Maquinaria Pesada & Volquetas de la Empresa</h3>
              <span className="text-[11px] text-slate-600">
                Los equipos propios reducen a cero el costo de alquiler de horas máquina en todas las obras en ejecución.
              </span>
            </div>
            <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300 font-bold">
              Total Unidades: {ownedMachinery.length}
            </span>
          </div>

          {ownedMachinery.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 text-slate-500">
              <span className="text-4xl block mb-2">🚜</span>
              <span className="font-bold text-sm block text-slate-700">Tu constructora no posee maquinaria propia aún.</span>
              <p className="text-xs text-slate-600 mt-1">
                Actualmente estás alquilando volquetas y retroexcavadoras a L 950/hora en tus proyectos. Adquiere equipos propios en las concesionarias para maximizar tu margen de ganancia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ownedMachinery.map((unit) => (
                <div key={unit.id} className="bg-slate-50 border border-slate-300 p-2.5 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{unit.icon}</span>
                    <span className="text-xs">{renderStars(unit.ratingStars)}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{unit.modelName}</h4>
                    <span className="text-[10px] text-slate-500">Concesionaria: {unit.dealerName}</span>
                  </div>

                  <div className="text-[10px] font-mono bg-white p-1.5 border border-slate-200 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Valor en Libros:</span>
                      <span className="font-bold text-slate-900">L {unit.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado Mecánico:</span>
                      <span className="text-emerald-700 font-bold">{unit.conditionPct}% Óptimo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gasto Operativo:</span>
                      <span>L {unit.hourlyFuelCost}/hora (Diésel)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
