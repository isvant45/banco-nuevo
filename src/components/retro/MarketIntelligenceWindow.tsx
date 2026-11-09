import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { buyMarketIntelligenceTier } from '../../game/tycoonAdvancedEngine';

interface MarketIntelligenceWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const MarketIntelligenceWindow: React.FC<MarketIntelligenceWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const intel = state.marketIntelligence || {
    subscriptionTier: 'none',
    subscriptionCostMonthly: 0,
    dataBrokerOptIn: false,
    accumulatedDataRecords: 1250,
    dataBreachRiskPct: 5,
    dataBreachOccurred: false,
    totalDataSalesRevenueHNL: 0,
    revealedCompetitorDossiers: {}
  };

  const [message, setMessage] = useState<string | null>(null);

  const handleBuyTier = (tier: 'basic' | 'corporate') => {
    const res = buyMarketIntelligenceTier(state, tier);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleToggleDataBroker = () => {
    const updated = {
      ...state,
      marketIntelligence: {
        ...intel,
        dataBrokerOptIn: !intel.dataBrokerOptIn
      }
    };
    onUpdateState(updated);
    setMessage(!intel.dataBrokerOptIn 
      ? '¡Monetización de Datos Activada! Se venderán perfiles de clientes semanalmente a brokers publicitarios. El riesgo de Data Breach aumentará progresivamente.' 
      : 'Monetización de datos pausada. Los registros de privacidad se mantienen resguardados.');
  };

  const rivals = state.hostileMnaTargets || [];

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>📡</span>
          <span>SISTEMA DE INTELIGENCIA DE MERCADO & BIG DATA v4.2</span>
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
        {/* Panel 1: Niebla de Guerra y Suscripciones */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2 flex items-center justify-between">
            <span>🛰️ Cobertura Satelital & Niebla de Guerra (Fog of War)</span>
            <span className="text-xs px-2 py-0.5 bg-gray-200 border border-gray-600 font-mono">
              Nivel Actual: <strong className="uppercase text-blue-900">{intel.subscriptionTier}</strong>
            </span>
          </div>

          <p className="text-gray-700 mb-3">
            En el mercado real, la información estratégica no es gratuita. Sin suscripciones analíticas de élite, las ventas de los rivales, sus inventarios exactos y sus estructuras de costos permanecen bajo la niebla de guerra.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Plan Básico */}
            <div className={`p-2.5 border-2 ${intel.subscriptionTier === 'basic' ? 'border-blue-700 bg-blue-50' : 'border-gray-400 bg-gray-50'}`}>
              <div className="font-bold text-xs text-blue-950 flex justify-between">
                <span>Plan Básico: Analítica Sectorial</span>
                <span>L 35,000 / mes</span>
              </div>
              <p className="text-[11px] text-gray-600 my-1.5">
                • Revela estimaciones de demanda en unidades.<br/>
                • Despeja la niebla sobre precios promedio de venta de la competencia.
              </p>
              <button
                disabled={intel.subscriptionTier === 'basic' || intel.subscriptionTier === 'corporate'}
                onClick={() => handleBuyTier('basic')}
                className="w-full mt-2 py-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black disabled:opacity-50"
              >
                {intel.subscriptionTier === 'basic' || intel.subscriptionTier === 'corporate' ? '✓ Activo' : 'Contratar Plan Básico'}
              </button>
            </div>

            {/* Plan Corporativo Profundo */}
            <div className={`p-2.5 border-2 ${intel.subscriptionTier === 'corporate' ? 'border-indigo-700 bg-indigo-50' : 'border-gray-400 bg-gray-50'}`}>
              <div className="font-bold text-xs text-indigo-950 flex justify-between">
                <span>Plan Corporativo: Espionaje Financiero Legal</span>
                <span>L 120,000 / mes</span>
              </div>
              <p className="text-[11px] text-gray-600 my-1.5">
                • Revela inventario exacto y costos operativos de cada competidor.<br/>
                • Permite anticipar quiebras y tomas hostiles ventajosas.
              </p>
              <button
                disabled={intel.subscriptionTier === 'corporate'}
                onClick={() => handleBuyTier('corporate')}
                className="w-full mt-2 py-1 bg-[#000080] text-white hover:bg-blue-900 font-bold border-t-2 border-l-2 border-blue-400 border-b-2 border-r-2 border-black disabled:opacity-50"
              >
                {intel.subscriptionTier === 'corporate' ? '✓ Cobertura Total Activa' : 'Contratar Plan Corporativo'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Dossiers de Competidores con o sin Niebla de Guerra */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2">
            📊 Expedientes de Empresas Competidoras
          </div>

          <div className="space-y-2">
            {rivals.map(r => {
              const isCorporate = intel.subscriptionTier === 'corporate';
              const isBasic = intel.subscriptionTier === 'basic' || isCorporate;

              return (
                <div key={r.id} className="p-2 border border-gray-400 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <div className="font-bold text-gray-900 text-xs">{r.name}</div>
                    <div className="text-[11px] text-gray-600">{r.sector}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-right">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Precio Acción</div>
                      <div className="font-mono font-bold">
                        {isBasic ? `L ${r.sharePriceHNL.toLocaleString()}` : '░░░░ (Niebla)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Valuación</div>
                      <div className="font-mono font-bold">
                        {isBasic ? `L ${r.companyValuationHNL.toLocaleString()}` : 'Estimado: L 4M - 15M'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Caja Excedente</div>
                      <div className="font-mono font-bold text-green-700">
                        {isCorporate ? `L ${r.cashSurplusHNL.toLocaleString()}` : '░░░░ (Plan Corp)'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Monetización de Datos de Clientes & Alerta de Data Breach */}
        <div className={`p-3 border-2 ${intel.dataBreachOccurred ? 'border-red-800 bg-red-50' : 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white'}`}>
          <div className="font-bold text-sm text-red-950 flex items-center justify-between border-b pb-1 mb-2">
            <span>🛡️ Monetización de Datos de Clientes (Data Brokerage)</span>
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={intel.dataBrokerOptIn}
                onChange={handleToggleDataBroker}
                className="w-4 h-4 cursor-pointer"
              />
              <span>VENDER DATOS A TERCEROS</span>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="p-2 bg-gray-100 border border-gray-300">
              <div className="text-[10px] text-gray-500">Registros Acumulados</div>
              <div className="font-mono font-bold text-sm">{intel.accumulatedDataRecords.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-gray-100 border border-gray-300">
              <div className="text-[10px] text-gray-500">Ingresos Totales por Datos</div>
              <div className="font-mono font-bold text-sm text-green-700">L {intel.totalDataSalesRevenueHNL.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-gray-100 border border-gray-300">
              <div className="text-[10px] text-gray-500">Riesgo de Data Breach</div>
              <div className="font-mono font-bold text-sm text-red-600">{intel.dataBreachRiskPct.toFixed(1)}%</div>
            </div>
            <div className="p-2 bg-gray-100 border border-gray-300">
              <div className="text-[10px] text-gray-500">Estado de Ciberseguridad</div>
              <div className="font-bold text-xs text-blue-900">
                {intel.dataBreachOccurred ? '🚨 BRECHA REGISTRADA' : intel.dataBrokerOptIn ? '⚠️ EXPUESTO A ATAQUES' : '🛡️ SEGURO'}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-600">
            ⚠️ <strong>Advertencia Regulatoria SAR y CNBS:</strong> Vender telemetría y perfiles de compra genera altos ingresos libres de costo de producción, pero incrementa exponencialmente el riesgo de una fuga cibernética, multas punitivas de L 280,000 y boicots de consumidores.
          </p>
        </div>
      </div>
    </div>
  );
};
