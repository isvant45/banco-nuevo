import React, { useState } from 'react';
import { 
  MachineryDealer, 
  OwnedMachineryUnit, 
  RetailSectorId, 
  CompanyCreditProfile, 
  CommercialBankId, 
  CommercialBankRelationship 
} from '../../game/retroSimTypes';
import { COMMERCIAL_BANKS_PROFILES } from '../../game/commercialBanksEngine';
import { getDealersForSector } from '../../game/machineryAndSuppliersEngine';
import { sound } from '../../game/audioFx';

interface MachineryDealerWindowProps {
  dealers: MachineryDealer[];
  ownedMachinery: OwnedMachineryUnit[];
  storeCash: number;
  storeBankBalance: number;
  retailSector?: RetailSectorId;
  creditProfile?: CompanyCreditProfile;
  commercialBanks?: Record<CommercialBankId, CommercialBankRelationship>;
  onBuyMachinery: (dealerId: string, machineryId: string) => void;
  onFinanceEquipment?: (
    bankId: CommercialBankId,
    equipment: any,
    dealerId: string,
    dealerName: string,
    downPaymentPct: number,
    termYears: number,
    negotiatedRate?: number
  ) => void;
}

export const MachineryDealerWindow: React.FC<MachineryDealerWindowProps> = ({
  dealers,
  ownedMachinery,
  storeCash,
  storeBankBalance,
  retailSector = 'constructora',
  creditProfile,
  commercialBanks,
  onBuyMachinery,
  onFinanceEquipment
}) => {
  const filteredDealers = getDealersForSector(dealers, retailSector);
  const [selectedDealerId, setSelectedDealerId] = useState<string>(filteredDealers[0]?.id || dealers[0]?.id || 'covesa_cat');
  const [activeTab, setActiveTab] = useState<'concesionarias' | 'flota'>('concesionarias');

  // Estados para Financiamiento con Banco
  const [financingItemId, setFinancingItemId] = useState<string | null>(null);
  const [financeBankId, setFinanceBankId] = useState<CommercialBankId>('atlantida');
  const [financeDownPaymentPct, setFinanceDownPaymentPct] = useState<number>(15);
  const [financeTermYears, setFinanceTermYears] = useState<number>(3);
  const [extraRateDiscount, setExtraRateDiscount] = useState<number>(0);

  const selectedDealer = filteredDealers.find(d => d.id === selectedDealerId) || filteredDealers[0] || dealers[0];
  const totalFunds = storeCash + storeBankBalance;
  const score = creditProfile?.score || 650;

  const renderStars = (count: number) => '⭐'.repeat(count);

  const getSectorTitle = () => {
    if (retailSector === 'minimarket') return 'Concesionarias de Camiones Refrigerados, Furgones & Montacargas';
    if (retailSector === 'bar_restaurante') return 'Concesionarias de Flotas Delivery & Equipamiento Gastronómico';
    return 'Concesionarias de Maquinaria Pesada, Volquetas & Equipos';
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
            🚜 {getSectorTitle()}
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('flota'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
              activeTab === 'flota' ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
            }`}
          >
            🚛 Flota Propia & Equipos ({ownedMachinery.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {creditProfile && (
            <div className="font-mono text-[10px] bg-white px-2 py-1 border border-[#808080]">
              Score Empresa: <strong className="text-emerald-800">{creditProfile.score} pts</strong>
            </div>
          )}
          <div className="font-mono text-[11px] bg-white px-2 py-1 border border-[#808080]">
            Liquidez: <strong className="text-blue-900">L {totalFunds.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {activeTab === 'concesionarias' && (
        <div className="flex-1 p-2 flex flex-col md:flex-row gap-2 overflow-hidden">
          {/* Lista Izquierda de Concesionarias */}
          <div className="w-full md:w-64 bg-white border border-[#808080] p-1.5 space-y-1.5 overflow-y-auto shrink-0">
            <span className="font-bold text-[10px] text-slate-600 block px-1">DISTRIBUIDORAS AUTORIZADAS:</span>
            {filteredDealers.map((dealer) => {
              const isSelected = selectedDealer?.id === dealer.id;

              return (
                <div
                  key={dealer.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDealerId(dealer.id);
                    setFinancingItemId(null);
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

          {/* Panel Derecho: Catálogo de Equipos y Financiamiento */}
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
                    const canAffordCash = totalFunds >= machinery.priceHNL;
                    const isFinancingThis = financingItemId === machinery.id;

                    // Cálculo de condiciones bancarias
                    const downPaymentAmount = Math.round(machinery.priceHNL * (financeDownPaymentPct / 100));
                    const canAffordDownPayment = totalFunds >= downPaymentAmount;
                    const loanAmount = machinery.priceHNL - downPaymentAmount;

                    const bankProfile = COMMERCIAL_BANKS_PROFILES[financeBankId];
                    const discount = (creditProfile?.rateDiscountPct || 0) + extraRateDiscount;
                    const apr = Math.max(7.5, Number((bankProfile.baseInterestRateLoan - discount).toFixed(1)));
                    const termMonths = financeTermYears * 12;
                    const monthlyRate = apr / 100 / 12;
                    const monthlyPayment = Math.round((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)));

                    return (
                      <div key={machinery.id} className="bg-slate-50 border border-slate-300 p-2.5 flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{machinery.icon}</span>
                            <span className="text-xs">{renderStars(machinery.ratingStars)}</span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 mt-1">{machinery.modelName}</h4>
                          <p className="text-[10px] text-slate-600 mt-0.5">{machinery.description}</p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200">
                          <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                            <span className="text-slate-500">Precio de Contado:</span>
                            <span className="font-bold text-blue-900">L {machinery.priceHNL.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                            <span>Costo operativo:</span>
                            <span>L {machinery.hourlyFuelCost}/hora de trabajo</span>
                          </div>

                          {/* Botones de Acción: Contado o Financiar con Banco */}
                          {!isFinancingThis ? (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                disabled={!canAffordCash}
                                onClick={() => {
                                  sound.playApprovalStamp();
                                  onBuyMachinery(selectedDealer.id, machinery.id);
                                }}
                                className={`py-1.5 font-bold text-[11px] border shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  canAffordCash 
                                    ? 'bg-slate-700 hover:bg-slate-800 text-white border-slate-900' 
                                    : 'bg-slate-200 text-slate-500 border-slate-300'
                                }`}
                              >
                                <span>💵</span>
                                <span>Al Contado</span>
                              </button>

                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setFinancingItemId(machinery.id);
                                }}
                                className="py-1.5 font-bold text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>🏦</span>
                                <span>Financiar con Banco</span>
                              </button>
                            </div>
                          ) : (
                            /* Panel Interactivo de Financiamiento Bancario */
                            <div className="bg-white p-2 border-2 border-emerald-800 mt-1 space-y-2">
                              <div className="flex justify-between items-center border-b pb-1">
                                <span className="font-bold text-[11px] text-emerald-950 flex items-center gap-1">
                                  <span>🏦 Cotizador de Crédito Vehicular / Equipo</span>
                                </span>
                                <button
                                  onClick={() => setFinancingItemId(null)}
                                  className="text-slate-400 hover:text-slate-700 font-bold px-1"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Selector de Banco */}
                              <div>
                                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Banco Financiero:</label>
                                <div className="grid grid-cols-4 gap-1">
                                  {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map((bId) => {
                                    const prof = COMMERCIAL_BANKS_PROFILES[bId];
                                    const isBSelected = financeBankId === bId;
                                    return (
                                      <button
                                        key={bId}
                                        type="button"
                                        onClick={() => setFinanceBankId(bId)}
                                        className={`px-1 py-1 text-[10px] font-bold border flex flex-col items-center ${
                                          isBSelected ? 'bg-blue-900 text-white border-blue-950' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                        }`}
                                      >
                                        <span>{prof.logo}</span>
                                        <span className="truncate w-full text-center">{prof.shortName}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Selector de Prima y Plazo */}
                              <div className="grid grid-cols-2 gap-1 text-[10px]">
                                <div>
                                  <label className="font-bold text-slate-700 block">Prima (Enganche):</label>
                                  <select
                                    value={financeDownPaymentPct}
                                    onChange={(e) => setFinanceDownPaymentPct(Number(e.target.value))}
                                    className="w-full bg-slate-50 border p-1 font-mono font-bold"
                                  >
                                    <option value={10}>10% (L {Math.round(machinery.priceHNL * 0.1).toLocaleString()})</option>
                                    <option value={15}>15% (L {Math.round(machinery.priceHNL * 0.15).toLocaleString()})</option>
                                    <option value={20}>20% (L {Math.round(machinery.priceHNL * 0.2).toLocaleString()})</option>
                                    <option value={30}>30% (L {Math.round(machinery.priceHNL * 0.3).toLocaleString()})</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="font-bold text-slate-700 block">Plazo Crédito:</label>
                                  <select
                                    value={financeTermYears}
                                    onChange={(e) => setFinanceTermYears(Number(e.target.value))}
                                    className="w-full bg-slate-50 border p-1 font-mono font-bold"
                                  >
                                    <option value={1}>1 Año (12 meses)</option>
                                    <option value={2}>2 Años (24 meses)</option>
                                    <option value={3}>3 Años (36 meses)</option>
                                    <option value={4}>4 Años (48 meses)</option>
                                    <option value={5}>5 Años (60 meses)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Cuadro Resumen de Cuota */}
                              <div className="bg-emerald-50 border border-emerald-300 p-1.5 font-mono text-[10px] space-y-0.5">
                                <div className="flex justify-between">
                                  <span>Tasa Anual ({bankProfile.shortName}):</span>
                                  <span className="font-bold text-blue-900">{apr}% anual</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Prima a Pagar Hoy:</span>
                                  <span className="font-bold text-rose-800">L {downPaymentAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-emerald-200 pt-0.5">
                                  <span>Cuota Mensual Estimada:</span>
                                  <span className="font-bold text-emerald-900 text-xs">~L {monthlyPayment.toLocaleString()}/mes</span>
                                </div>
                              </div>

                              {/* Botón de Negociar Tasa o Aceptar */}
                              <div className="space-y-1">
                                {score >= 700 && extraRateDiscount === 0 && (
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setExtraRateDiscount(0.8);
                                    }}
                                    className="w-full py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-[10px] border border-blue-300"
                                  >
                                    🤝 Negociar Rebaja de Tasa por Score ({score} pts)
                                  </button>
                                )}

                                <button
                                  disabled={!canAffordDownPayment}
                                  onClick={() => {
                                    sound.playApprovalStamp();
                                    if (onFinanceEquipment) {
                                      onFinanceEquipment(
                                        financeBankId,
                                        machinery,
                                        selectedDealer.id,
                                        selectedDealer.name,
                                        financeDownPaymentPct,
                                        financeTermYears,
                                        apr
                                      );
                                    }
                                    setFinancingItemId(null);
                                  }}
                                  className={`w-full py-1.5 font-bold text-xs border shadow flex items-center justify-center gap-1 cursor-pointer ${
                                    canAffordDownPayment
                                      ? 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-950'
                                      : 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
                                  }`}
                                >
                                  <span>🔑</span>
                                  <span>
                                    {canAffordDownPayment 
                                      ? `Aceptar Préstamo en ${bankProfile.shortName} y Recibir Llaves` 
                                      : 'Fondos Insuficientes para la Prima'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
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
