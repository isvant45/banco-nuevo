import React, { useState } from 'react';
import { RetailProduct, SupplierOrder } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface RetailSupplyWindowProps {
  products: RetailProduct[];
  orders: SupplierOrder[];
  storeCash: number;
  onOrderProduct: (productId: string, units: number) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
}

export const RetailSupplyWindow: React.FC<RetailSupplyWindowProps> = ({
  products,
  orders,
  storeCash,
  onOrderProduct,
  onUpdateProductPrice
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [orderUnits, setOrderUnits] = useState<number>(50);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleOrder = () => {
    if (!selectedProduct) return;
    const totalCost = orderUnits * selectedProduct.unitCost;

    if (orderUnits < selectedProduct.minOrderUnits) {
      sound.playRejectBuzzer();
      alert(`El pedido mínimo para ${selectedProduct.name} es de ${selectedProduct.minOrderUnits} unidades.`);
      return;
    }

    if (storeCash < totalCost) {
      sound.playRejectBuzzer();
      alert(`Fondos insuficientes en caja. Requieres L ${totalCost.toLocaleString()} y dispones de L ${storeCash.toLocaleString()}.`);
      return;
    }

    sound.playCashChime();
    onOrderProduct(selectedProduct.id, orderUnits);
  };

  const handleSavePrice = (productId: string) => {
    sound.playApprovalStamp();
    onUpdateProductPrice(productId, tempPrice);
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Resumen de Almacén y Caja */}
      <div className="bg-[#dfdfdf] border border-[#808080] p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Catálogo de Almacén & Proveedores</span>
          <span className="font-mono bg-white px-2 py-0.5 border border-[#808080]">
            Caja Disponible para Compras: L {storeCash.toLocaleString()}
          </span>
        </div>
        <span className="text-slate-600">
          {products.reduce((s, p) => s + p.stock, 0)} unidades totales en estantería
        </span>
      </div>

      {/* Formulario Rápido de Reabastecimiento a Proveedor */}
      <div className="bg-[#eaeaea] border border-[#808080] p-3">
        <span className="font-bold text-slate-800 block mb-2">📦 Emitir Orden de Compra a Distribuidor Mayorista</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-slate-700 font-semibold block mb-1">Seleccionar Mercadería:</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setOrderUnits(p.minOrderUnits);
              }}
              className="w-full bg-white border border-[#808080] px-2 py-1.5 font-sans text-xs"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} (Stock actual: {p.stock}) · Costo Mayorista: L {p.unitCost}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Unidades a Comprar (Mín: {selectedProduct?.minOrderUnits || 10}):
            </label>
            <input
              type="number"
              step="5"
              min={selectedProduct?.minOrderUnits || 10}
              value={orderUnits}
              onChange={(e) => setOrderUnits(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white border border-[#808080] px-2 py-1 font-mono text-xs font-bold"
            />
          </div>

          <div>
            <button
              onClick={handleOrder}
              className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-sm"
            >
              Comprar (L {((orderUnits || 0) * (selectedProduct?.unitCost || 0)).toLocaleString()})
            </button>
          </div>
        </div>

        {selectedProduct && (
          <div className="text-[11px] text-slate-600 mt-2 flex gap-4">
            <span>⏱️ Tiempo estimado de entrega: <strong>{selectedProduct.supplierDeliveryDays} días laborables</strong></span>
            <span>📉 Merma por caducidad: <strong>{selectedProduct.spoilageRatePct}% mensual</strong></span>
          </div>
        )}
      </div>

      {/* Envíos de Proveedores en Tránsito */}
      {orders.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-2.5">
          <span className="font-bold text-amber-900 block mb-1 text-xs">🚚 Pedidos en Camino desde Fábrica / Distribuidora:</span>
          <div className="space-y-1">
            {orders.map(ord => (
              <div key={ord.id} className="flex justify-between items-center text-xs bg-white/70 px-2 py-1 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{ord.productName}</span>
                  <span className="font-mono text-slate-600">x{ord.units} uds</span>
                  <span className="text-[10px] text-slate-500">(Invertidos L {ord.totalCost.toLocaleString()})</span>
                </div>
                <span className="font-mono font-bold text-amber-800">
                  Llega en {ord.daysRemaining} {ord.daysRemaining === 1 ? 'día' : 'días'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Productos y Fijación de Precios de Venta */}
      <div className="border border-[#808080] overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#dfdfdf] border-b border-[#808080] text-slate-800 font-bold">
              <th className="p-2 border-r border-[#808080]">Producto</th>
              <th className="p-2 border-r border-[#808080]">Categoría</th>
              <th className="p-2 border-r border-[#808080] text-center">Stock Actual</th>
              <th className="p-2 border-r border-[#808080] text-right">Costo Unit.</th>
              <th className="p-2 border-r border-[#808080] text-right">Precio de Venta</th>
              <th className="p-2 border-r border-[#808080] text-right">Margen Bruto</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.unitCost) / p.sellingPrice) * 100) : 0;
              const isLowStock = p.stock <= p.dailyDemandBase;
              const isEditing = editingPriceId === p.id;

              return (
                <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 font-medium text-slate-900 flex items-center gap-2">
                    <span className="text-base">{p.icon}</span>
                    <span>{p.name}</span>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">{p.category}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                    <span className={`px-1.5 py-0.5 border text-xs ${
                      p.stock === 0 ? 'bg-red-100 text-red-800 border-red-300' :
                      isLowStock ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {p.stock} uds
                    </span>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">
                    L {p.unitCost}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs">L</span>
                        <input
                          type="number"
                          step="1"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Math.max(1, Number(e.target.value)))}
                          className="w-16 bg-white border border-[#808080] px-1 py-0.5 font-mono text-xs"
                        />
                      </div>
                    ) : (
                      `L ${p.sellingPrice}`
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">
                    <span className={margin < 20 ? 'text-amber-600' : 'text-emerald-700'}>
                      {margin}%
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSavePrice(p.id)}
                          className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[11px]"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[11px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPriceId(p.id);
                          setTempPrice(p.sellingPrice);
                        }}
                        className="px-2 py-0.5 bg-[#dfdfdf] hover:bg-[#cfcfcf] border border-[#808080] font-semibold text-slate-800 text-[11px]"
                      >
                        Ajustar Precio
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
