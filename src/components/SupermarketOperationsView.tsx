import React, { useState } from 'react';
import { 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Minus, 
  Truck, 
  CheckCircle2, 
  Coins,
  ShieldCheck,
  Building
} from 'lucide-react';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { RetailProductWithPerishability } from '../game/unifiedEconomyEngine';

interface SupermarketOperationsViewProps {
  products: RetailProductWithPerishability[];
  storeCashHNL: number;
  monthlySpoilageHNL: number;
  dailyRevenueHNL: number;
  onOrderStock: (productId: string, units: number) => void;
  onAdjustPrice: (productId: string, newPrice: number) => void;
  onOpenCreditNegotiation: () => void;
}

export const SupermarketOperationsView: React.FC<SupermarketOperationsViewProps> = ({
  products,
  storeCashHNL,
  monthlySpoilageHNL,
  dailyRevenueHNL,
  onOrderStock,
  onAdjustPrice,
  onOpenCreditNegotiation
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [orderUnits, setOrderUnits] = useState<number>(100);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(products[0]?.sellingPriceHNL || 30);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSelectProduct = (p: RetailProductWithPerishability) => {
    sound.playClick();
    setSelectedProductId(p.id);
    setNewSellingPrice(p.sellingPriceHNL);
    setOrderUnits(p.supplierMinBatch);
    setOrderNotice(null);
  };

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const totalCost = orderUnits * selectedProduct.costPriceHNL;
    if (storeCashHNL < totalCost) {
      sound.playRejectBuzzer();
      alert(`Fondos insuficientes en caja (${formatHNL(storeCashHNL)}). El pedido requiere ${formatHNL(totalCost)}. Puedes solicitar crédito bancario.`);
      return;
    }

    sound.playCoinClink();
    onOrderStock(selectedProduct.id, orderUnits);
    setOrderNotice(`¡Pedido enviado! ${orderUnits} unidades de ${selectedProduct.name} llegarán en ${selectedProduct.supplierLeadDays} día(s). Total: ${formatHNL(totalCost)}`);
  };

  const handleSavePrice = () => {
    if (!selectedProduct) return;
    sound.playApprovalStamp();
    onAdjustPrice(selectedProduct.id, newSellingPrice);
    setOrderNotice(`Precio de venta de ${selectedProduct.name} actualizado a ${formatHNL(newSellingPrice)}.`);
  };

  return (
    <div className="space-y-4">
      {/* KPI Header de Retail & Supermercado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CAJA OPERATIVA DE TIENDA</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatHNL(storeCashHNL)}
          </div>
          <span className="text-[11px] text-slate-500">Fondos líquidos para inventario</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>VENTAS DEL DÍA</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatHNL(dailyRevenueHNL)}
          </div>
          <span className="text-[11px] text-slate-500">Cobrado en caja minorista</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>MERMAS & CADUCIDAD (MES)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            -{formatHNL(monthlySpoilageHNL)}
          </div>
          <span className="text-[11px] text-slate-500">Pérdida por vencimiento de perecederos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CRÉDITO COMERCIAL</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCreditNegotiation();
            }}
            className="w-full py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Negociar con Asesor Bancario</span>
          </button>
        </div>
      </div>

      {/* Grid: Lista de Productos y Panel de Reabastecimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabla de Productos e Inventario con Días de Caducidad */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>INVENTARIO DE SUPERMERCADO Y GESTIÓN DE PERECEDEROS</span>
            <span>{products.length} LÍNEAS ACTIVAS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Producto & Categoría</th>
                  <th className="py-2.5 px-2 text-right">Stock</th>
                  <th className="py-2.5 px-2 text-right">Costo</th>
                  <th className="py-2.5 px-2 text-right">Precio Venta</th>
                  <th className="py-2.5 px-2 text-center">Caducidad</th>
                  <th className="py-2.5 px-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {products.map(p => {
                  const isSelected = p.id === selectedProductId;
                  const isCritical = p.daysToPerish <= 2 && (p.category === 'perecederos_frescos' || p.category === 'lacteos_carnes');
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-sans font-bold text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{p.category.replace('_', ' ')}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-100">
                        {p.currentStock.toLocaleString()} unds
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-400">
                        {formatHNL(p.costPriceHNL)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-400">
                        {formatHNL(p.sellingPriceHNL)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                          isCritical 
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800' 
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {p.daysToPerish}d
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isSelected ? 'Editando' : 'Seleccionar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Gestión del Producto Seleccionado */}
        {selectedProduct && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                Ficha de Producto & Proveedor
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {selectedProduct.name}
              </h3>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Margen bruto: <strong className="text-emerald-400">
                  {formatHNL(selectedProduct.sellingPriceHNL - selectedProduct.costPriceHNL)} por unidad
                </strong>
              </div>
            </div>

            {/* Aviso o Notificación */}
            {orderNotice && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orderNotice}</span>
              </div>
            )}

            {/* Formulario de Compra a Distribuidores */}
            <form onSubmit={handleExecuteOrder} className="space-y-3 text-xs font-mono">
              <label className="text-slate-300 block font-semibold">
                ORDEN DE REABASTECIMIENTO AL MAYOR:
              </label>
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">
                  Cantidad a pedir (Mínimo {selectedProduct.supplierMinBatch} unidades):
                </span>
                <input
                  type="number"
                  min={selectedProduct.supplierMinBatch}
                  step={50}
                  value={orderUnits}
                  onChange={e => setOrderUnits(Math.max(selectedProduct.supplierMinBatch, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Costo total pedido:</span>
                  <span className="font-bold text-white">{formatHNL(orderUnits * selectedProduct.costPriceHNL)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tiempo de entrega:</span>
                  <span className="text-amber-400 font-bold">{selectedProduct.supplierLeadDays} día(s)</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Emitir Orden de Compra</span>
              </button>
            </form>

            {/* Ajuste de Precio de Venta al Público */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
              <label className="text-slate-300 block font-semibold">
                POLÍTICA DE PRECIO DE VENTA AL PÚBLICO:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={selectedProduct.costPriceHNL + 1}
                  step={1}
                  value={newSellingPrice}
                  onChange={e => setNewSellingPrice(Number(e.target.value))}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
                <button
                  type="button"
                  onClick={handleSavePrice}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Guardar
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Precios más bajos aumentan la rotación y reducen mermas por caducidad; precios más altos elevan el margen unitario.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
