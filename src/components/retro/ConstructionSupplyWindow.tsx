import React, { useState } from 'react';
import { 
  ConstructionMaterial, 
  ConstructionMaterialId, 
  ConstructionMaterialOrder 
} from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface ConstructionSupplyWindowProps {
  materials: ConstructionMaterial[];
  orders: ConstructionMaterialOrder[];
  storeCash: number;
  storeBankBalance: number;
  onOrderMaterial: (materialId: ConstructionMaterialId, units: number) => void;
}

export const ConstructionSupplyWindow: React.FC<ConstructionSupplyWindowProps> = ({
  materials,
  orders,
  storeCash,
  storeBankBalance,
  onOrderMaterial
}) => {
  const [selectedMatId, setSelectedMatId] = useState<ConstructionMaterialId>('cemento_gris');
  const [orderQuantity, setOrderQuantity] = useState<number>(50);

  const selectedMaterial = materials.find(m => m.id === selectedMatId) || materials[0];
  const totalOrderCost = selectedMaterial ? orderQuantity * selectedMaterial.unitCost : 0;
  const totalAvailableFunds = storeCash + storeBankBalance;
  const canAfford = totalAvailableFunds >= totalOrderCost;

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || orderQuantity <= 0 || !canAfford) {
      sound.playRejectBuzzer();
      return;
    }
    sound.playApprovalStamp();
    onOrderMaterial(selectedMaterial.id, orderQuantity);
  };

  const handleQuickAdd = (qty: number) => {
    sound.playClick();
    setOrderQuantity(prev => Math.max(1, prev + qty));
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Barra de Liquidez y Estado */}
      <div className="bg-[#dfdfdf] border-b border-[#808080] p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏗️</span>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">PATIO DE ACOPIO Y ALMACÉN DE OBRA</h3>
            <span className="text-[10px] text-slate-600">Gestión de insumos pesados para proyectos de construcción</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="bg-white px-2 py-1 border border-[#808080]">
            <span className="text-slate-500 mr-1">Caja Chica:</span>
            <span className="font-bold text-slate-900">L {storeCash.toLocaleString()}</span>
          </div>
          <div className="bg-white px-2 py-1 border border-[#808080]">
            <span className="text-slate-500 mr-1">Cuenta Banco:</span>
            <span className="font-bold text-blue-900">L {storeBankBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Contenedor Dividido */}
      <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-auto">
        {/* Lista de Materiales en Stock */}
        <div className="md:col-span-7 bg-white border border-[#808080] p-2 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-[11px] mb-2 flex justify-between">
              <span>MATERIAL DE CONSTRUCCIÓN</span>
              <span>UNIDAD</span>
              <span>STOCK EN PATIO</span>
            </div>

            <div className="space-y-1.5">
              {materials.map((mat) => {
                const isSelected = selectedMatId === mat.id;
                const isLow = mat.stock <= mat.minStockWarning;

                return (
                  <div
                    key={mat.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedMatId(mat.id);
                    }}
                    className={`p-2 border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#000080] text-white border-blue-900'
                        : isLow
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-slate-900'
                        : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mat.icon}</span>
                      <div>
                        <div className="font-bold text-xs">{mat.name}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                          Costo mayorista: L {mat.unitCost.toLocaleString()} · Entrega: {mat.supplierLeadDays}d
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm block">
                        {mat.stock.toLocaleString()}
                      </span>
                      <span className={`text-[10px] ${
                        isLow 
                          ? isSelected ? 'text-amber-300 font-bold' : 'text-amber-700 font-bold' 
                          : isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {isLow ? '⚠️ Stock Bajo' : mat.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cargamentos en Tránsito */}
          <div className="mt-3 pt-2 border-t border-[#808080]">
            <div className="font-bold text-[11px] text-slate-800 mb-1 flex items-center gap-1">
              <span>🚚</span>
              <span>PEDIDOS Y CARGAMENTOS EN TRÁNSITO AL PATIO ({orders.length})</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-2 bg-slate-50 border border-slate-200 text-center text-slate-500 text-[11px]">
                No hay camiones en ruta actualmente. Los pedidos llegan en 1-2 días.
              </div>
            ) : (
              <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-[10px]">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-1.5 bg-slate-100 border border-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold">{ord.units.toLocaleString()} uds</span> · {ord.materialName}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-900">Llegada: {ord.daysRemaining} día(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Compra y Pedido al Proveedor */}
        <div className="md:col-span-5 bg-[#f0f0f0] border border-[#808080] p-2 flex flex-col justify-between">
          <form onSubmit={handleOrder} className="space-y-3">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-[11px]">
              SOLICITUD DE DESPACHO A CANTERA / FÁBRICA
            </div>

            {selectedMaterial && (
              <div className="bg-white border border-[#808080] p-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedMaterial.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{selectedMaterial.name}</h4>
                    <span className="text-[10px] text-slate-500">Unidad: {selectedMaterial.unit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Precio Unitario:</span>
                    <span className="font-mono font-bold text-slate-900">L {selectedMaterial.unitCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tiempo de Entrega:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedMaterial.supplierLeadDays} día(s)</span>
                  </div>
                </div>

                {/* Cantidad a Ordenar */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cantidad a pedir ({selectedMaterial.unit}):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-sm text-slate-900"
                  />

                  {/* Botones de incremento rápido */}
                  <div className="flex gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(10)}
                      className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-[10px]"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(50)}
                      className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-[10px]"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(100)}
                      className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-[10px]"
                    >
                      +100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(500)}
                      className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-[10px]"
                    >
                      +500
                    </button>
                  </div>
                </div>

                {/* Resumen de Facturación */}
                <div className="bg-amber-50 border border-amber-200 p-2 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal compra:</span>
                    <span>L {totalOrderCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-900 border-t border-amber-200 pt-1">
                    <span>Total a Pagar:</span>
                    <span>L {totalOrderCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {!canAfford && (
              <div className="p-2 bg-rose-50 border border-rose-300 text-rose-800 text-[10px]">
                ⚠️ Fondos insuficientes. Te faltan L {(totalOrderCost - totalAvailableFunds).toLocaleString()}. Visita el Banco Aliado (IA) para solicitar un crédito de capital de trabajo.
              </div>
            )}

            <button
              type="submit"
              disabled={!canAfford}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs border-t border-l border-emerald-300 border-b-2 border-r-2 border-emerald-950 shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>🚚</span>
              <span>EMITIR ORDEN DE COMPRA Y CARGA</span>
            </button>
          </form>

          <div className="text-[10px] text-slate-500 bg-white p-2 border border-[#808080] mt-2">
            ℹ️ Las compras de materiales con factura oficial (CAI) se registran automáticamente como <strong>gastos deducibles</strong> en tu declaración anual de Impuesto Sobre la Renta (ISR) del SAR.
          </div>
        </div>
      </div>
    </div>
  );
};
