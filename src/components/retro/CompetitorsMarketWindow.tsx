import React, { useState } from 'react';
import { DailySimulationState, CompetitorFirm } from '../../game/retroSimTypes';
import { 
  executeCompetitorAcquisition, 
  createDefaultCompetitors 
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface CompetitorsMarketWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
}

export const CompetitorsMarketWindow: React.FC<CompetitorsMarketWindowProps> = ({
  state,
  onUpdateState
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>('comp_vialtec');

  // Si no existen competidores inicializados, crearlos según el rubro
  const competitors: CompetitorFirm[] = state.activeCompetitors && state.activeCompetitors.length > 0
    ? state.activeCompetitors
    : createDefaultCompetitors(state.retailSector);

  const formatHNL = (amount: number) => `L ${Math.round(amount).toLocaleString()}`;

  const selectedComp = competitors.find(c => c.id === selectedCompId) || competitors[0];

  const handleAcquire = (dealType: 'asset_deal' | 'share_purchase') => {
    sound.playClick();
    if (!selectedComp) return;

    // Asegurar que el estado tenga la lista guardada
    const stateWithComps = {
      ...state,
      activeCompetitors: competitors
    };

    const res = executeCompetitorAcquisition(stateWithComps, selectedComp.id, dealType);
    if (res.success) {
      sound.playApprovalStamp();
      alert(res.message);
      onUpdateState(res.updatedState);
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Encabezado */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🏢</span>
          <span className="font-bold text-xs uppercase text-slate-800">
            Mercado Competidor Local & Fusiones / Adquisiciones (M&A)
          </span>
        </div>
        <div className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 text-[11px] font-bold">
          Sector: {state.retailSector.toUpperCase()}
        </div>
      </div>

      {/* Contenido dividido: Lista de Rivales vs Ficha de Detalle */}
      <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto bg-slate-100">
        {/* Columna 1: Directorio de Competidores */}
        <div className="bg-white border-2 border-[#808080] p-2 shadow-inner space-y-2">
          <h4 className="font-bold text-slate-800 text-xs border-b pb-1 font-sans">
            EMPRESAS RIVALES ACTIVAS:
          </h4>

          {competitors.map((comp) => {
            const isSelected = selectedCompId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => { sound.playClick(); setSelectedCompId(comp.id); }}
                className={`p-2 border cursor-pointer font-sans transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <strong className="text-slate-900 text-xs block">{comp.name}</strong>
                  {comp.status === 'adquirido_jugador' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1 border border-emerald-300 font-bold">
                      ADQUIRIDA
                    </span>
                  ) : comp.isDistressed ? (
                    <span className="bg-rose-100 text-rose-800 text-[10px] px-1 border border-rose-300 font-bold animate-pulse">
                      QUIEBRA / ILIQUIDEZ
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-1 border font-bold">
                      ACTIVA
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
                  <span>Cuota Mercado: <strong>{comp.marketSharePct}%</strong></span>
                  <span className="capitalize text-slate-500">Estilo: {comp.pricingStrategy}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna 2 y 3: Expediente Financiero & Opciones M&A */}
        {selectedComp && (
          <div className="md:col-span-2 bg-white border-2 border-[#808080] p-4 shadow-inner space-y-4">
            <div className="border-b pb-2 flex justify-between items-start">
              <div>
                <h3 className="font-sans font-black text-sm text-slate-900">
                  {selectedComp.name}
                </h3>
                <p className="font-sans text-[11px] text-slate-500">
                  Auditoría Financiera y Evaluación de Fusión o Absorción Empresarial
                </p>
              </div>
              <span className={`px-2 py-0.5 border font-bold text-xs ${
                selectedComp.status === 'adquirido_jugador'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : selectedComp.isDistressed
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {selectedComp.status === 'adquirido_jugador' ? 'ABSORBIDA EN TU GRUPO' : selectedComp.isDistressed ? 'EN CONCURSO DE ACREEDORES' : 'OPERACIÓN NORMAL'}
              </span>
            </div>

            {/* Balance Financiero del Rival */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="p-2 border bg-slate-50">
                <span className="text-[10px] text-slate-500 font-sans block">Saldo de Caja:</span>
                <strong className={selectedComp.cashBalanceHNL < 0 ? 'text-rose-700' : 'text-slate-900'}>
                  {formatHNL(selectedComp.cashBalanceHNL)}
                </strong>
              </div>
              <div className="p-2 border bg-slate-50">
                <span className="text-[10px] text-slate-500 font-sans block">Deuda Bancaria:</span>
                <strong className="text-rose-900">{formatHNL(selectedComp.bankDebtHNL)}</strong>
              </div>
              <div className="p-2 border bg-slate-50">
                <span className="text-[10px] text-slate-500 font-sans block">Inventario / Flota:</span>
                <strong className="text-slate-900">{formatHNL(selectedComp.inventoryValueHNL)}</strong>
              </div>
              <div className="p-2 border bg-slate-50">
                <span className="text-[10px] text-slate-500 font-sans block">Ventas Mensuales:</span>
                <strong className="text-emerald-700">{formatHNL(selectedComp.monthlySalesHNL)}</strong>
              </div>
            </div>

            {/* Diagnóstico del Mercado */}
            <div className="border border-slate-300 p-2.5 bg-slate-50 font-sans text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">INFORME DE INTELIGENCIA COMERCIAL:</span>
              {selectedComp.isDistressed ? (
                <p className="text-rose-900 leading-relaxed">
                  ⚠️ <strong>Rival en crisis de liquidez:</strong> La empresa tiene caja negativa y una carga de deuda insostenible con los bancos. Los acreedores judiciales están dispuestos a liquidar sus activos con un 40% de descuento o traspasar el 100% de sus acciones para evitar la quiebra total.
                </p>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  ✅ <strong>Rival consolidado:</strong> Opera con margen saludable y mantiene el {selectedComp.marketSharePct}% del mercado local con estrategia de precios {selectedComp.pricingStrategy}. Su adquisición requiere una prima sobre el valor contable.
                </p>
              )}
            </div>

            {/* Opciones de Adquisición M&A */}
            {selectedComp.status === 'activo' ? (
              <div className="space-y-3 pt-2">
                <h4 className="font-sans font-bold text-slate-900 text-xs">
                  MODALIDADES DE ADQUISICIÓN / FUSIÓN (M&A):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Opción 1: Asset Deal */}
                  <div className="border border-slate-300 p-3 bg-white flex flex-col justify-between">
                    <div>
                      <div className="font-sans font-black text-blue-900 text-xs mb-1">
                        OPCIÓN 1: ASSET DEAL (Compra de Activos)
                      </div>
                      <p className="font-sans text-[11px] text-slate-600 mb-2 leading-relaxed">
                        Compras únicamente el inventario, materiales y maquinaria física a precio de remate. No heredas ninguna de sus deudas ni pasivos laborales.
                      </p>
                      <div className="font-mono text-xs font-bold text-slate-800 mb-2">
                        Precio de Compra: <span className="text-blue-900">{formatHNL(selectedComp.acquisitionPriceAssetDealHNL)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcquire('asset_deal')}
                      className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-sans font-bold text-xs border border-blue-900 shadow-sm cursor-pointer"
                    >
                      Ejecutar Compra de Activos 📦
                    </button>
                  </div>

                  {/* Opción 2: Share Purchase */}
                  <div className="border border-slate-300 p-3 bg-white flex flex-col justify-between">
                    <div>
                      <div className="font-sans font-black text-purple-900 text-xs mb-1">
                        OPCIÓN 2: SHARE PURCHASE (Fusión del 100%)
                      </div>
                      <p className="font-sans text-[11px] text-slate-600 mb-2 leading-relaxed">
                        Adquieres el 100% de las acciones. Absorbes su cuota de mercado ({selectedComp.marketSharePct}%), su cartera de clientes y ganas +12 pts de reputación empresarial.
                      </p>
                      <div className="font-mono text-xs font-bold text-slate-800 mb-2">
                        Inversión Total: <span className="text-purple-900">{formatHNL(selectedComp.acquisitionPriceSharePurchaseHNL)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcquire('share_purchase')}
                      className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-sans font-bold text-xs border border-purple-900 shadow-sm cursor-pointer"
                    >
                      Adquirir 100% de Acciones 🤝
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 font-sans text-xs font-bold text-center">
                🎉 Esta empresa ya fue absorbida por tu corporación. Sus activos y cuota de mercado forman parte de tus operaciones consolidadas.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
