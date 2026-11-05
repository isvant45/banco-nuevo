import React, { useState } from 'react';
import { 
  Car, 
  Coins, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  ShieldCheck, 
  Building2,
  Calendar,
  Gauge
} from 'lucide-react';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { VehicleStockUnit } from '../game/unifiedEconomyEngine';

interface VehicleDealershipViewProps {
  vehicles: VehicleStockUnit[];
  dealershipCashHNL: number;
  onBuyVehicleInventory: (model: string, costHNL: number) => void;
  onSellVehicleUnit: (vehicleId: string) => void;
  onOpenCreditNegotiation: () => void;
}

export const VehicleDealershipView: React.FC<VehicleDealershipViewProps> = ({
  vehicles,
  dealershipCashHNL,
  onBuyVehicleInventory,
  onSellVehicleUnit,
  onOpenCreditNegotiation
}) => {
  const [newModel, setNewModel] = useState<string>('Toyota Hilux 4x4 2025');
  const [newCostHNL, setNewCostHNL] = useState<number>(1150000);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalInventoryValueHNL = vehicles.reduce((sum, v) => sum + v.listPriceHNL, 0);

  const handleBuyVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (dealershipCashHNL < newCostHNL) {
      sound.playRejectBuzzer();
      alert(`Fondos insuficientes en autolote (${formatHNL(dealershipCashHNL)}). Se requieren ${formatHNL(newCostHNL)}. Puedes solicitar una línea de crédito de piso (Floor Plan).`);
      return;
    }
    sound.playCashChime();
    onBuyVehicleInventory(newModel, newCostHNL);
    setActionNotice(`¡Unidad adquirida! ${newModel} ingresó al inventario del autolote.`);
  };

  const handleSellVehicle = (v: VehicleStockUnit) => {
    sound.playCashChime();
    onSellVehicleUnit(v.id);
    const profit = v.listPriceHNL - v.acquisitionCostHNL;
    setActionNotice(`¡Vehículo vendido! ${v.make} ${v.model} por ${formatHNL(v.listPriceHNL)} (Ganancia: ${formatHNL(profit)}). El cliente fue financiado por la banca vehicular.`);
  };

  return (
    <div className="space-y-4">
      {/* Header KPI del Autolote */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CAJA DEL AUTOLOTE</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatHNL(dealershipCashHNL)}
          </div>
          <span className="text-[11px] text-slate-500">Liquidez para compra de unidades</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>VALOR DE FLOTA EN VENTA</span>
            <Car className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatHNL(totalInventoryValueHNL)}
          </div>
          <span className="text-[11px] text-slate-500">{vehicles.length} vehículos en exhibición</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>LÍNEA DE PISO (FLOOR PLAN)</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-300">
            Activa con Banco
          </div>
          <span className="text-[11px] text-slate-500">Garantía prendaria sobre inventario</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>FINANCIAMIENTO BANCARIO</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCreditNegotiation();
            }}
            className="w-full py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold rounded-lg text-xs transition-colors"
          >
            Negociar Línea con Asesor
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Grid: Inventario en Exhibición + Compra de Flota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de Vehículos en Exhibición */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>INVENTARIO AUTOMOTRIZ DISPONIBLE PARA VENTA Y TRADE-IN</span>
            <span>{vehicles.length} UNIDADES</span>
          </div>

          <div className="space-y-3 font-mono">
            {vehicles.map(v => {
              const margin = v.listPriceHNL - v.acquisitionCostHNL;
              return (
                <div 
                  key={v.id} 
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-sans">{v.make} {v.model} ({v.year})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        v.condition === 'nuevo' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {v.condition.replace('_', ' ').toUpperCase()}
                      </span>
                      {v.isPledgedInFloorPlan && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Prenda Bancaria
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Kilometraje: {v.mileageKm.toLocaleString()} km</span>
                      <span>·</span>
                      <span>Costo adquisición: {formatHNL(v.acquisitionCostHNL)}</span>
                      <span>·</span>
                      <span>Deprec. mensual: -{formatHNL(v.monthlyDepreciationHNL)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        {formatHNL(v.listPriceHNL)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ganancia: <strong className="text-white">+{formatHNL(margin)}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSellVehicle(v)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Vender Unidad
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Adquisición de Unidades para el Autolote */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
              Compra a Fabricante / Subastas
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Adquisición de Nuevo Inventario
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Las unidades seminuevas pueden recibirse como parte de pago (trade-in) o importarse.
            </p>
          </div>

          <form onSubmit={handleBuyVehicle} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Modelo y Marca:</label>
              <input
                type="text"
                value={newModel}
                onChange={e => setNewModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Costo de Adquisición (HNL):</label>
              <input
                type="number"
                step={50000}
                value={newCostHNL}
                onChange={e => setNewCostHNL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Precio de venta sugerido (+20%):</span>
                <span className="font-bold text-emerald-400">{formatHNL(Math.round(newCostHNL * 1.2))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Financiamiento al comprador:</span>
                <span className="text-blue-300">Crédito vehicular bancario</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Comprar Unidad para Stock</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
