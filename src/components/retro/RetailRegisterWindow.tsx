import React, { useState } from 'react';
import { RetailCustomerWalkIn, RetailProduct, SalesReceipt } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface RetailRegisterWindowProps {
  queue: RetailCustomerWalkIn[];
  products: RetailProduct[];
  receipts: SalesReceipt[];
  storeCash: number;
  storeName: string;
  onServeCustomer: (customer: RetailCustomerWalkIn, paymentMethod: 'efectivo' | 'tarjeta') => void;
  onBatchServe: () => void;
}

export const RetailRegisterWindow: React.FC<RetailRegisterWindowProps> = ({
  queue,
  products,
  receipts,
  storeCash,
  storeName,
  onServeCustomer,
  onBatchServe
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCustomer = queue[currentIndex] || queue[0];
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [showZReport, setShowZReport] = useState<boolean>(false);

  const unservedCount = queue.filter(q => !q.isServed).length;

  const calculateSubtotal = () => {
    if (!currentCustomer) return 0;
    return currentCustomer.cart.reduce((sum, item) => sum + (item.units * item.unitPrice), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + tax;

  // Actualizar efectivo recibido por defecto con el total exacto o redondeado
  React.useEffect(() => {
    if (total > 0) {
      setCashTendered(total);
    }
  }, [total]);

  const changeDue = Math.max(0, cashTendered - total);

  const handleCharge = (paymentMethod: 'efectivo' | 'tarjeta') => {
    if (!currentCustomer) return;

    if (paymentMethod === 'efectivo' && cashTendered < total) {
      sound.playRejectBuzzer();
      alert(`Monto recibido insuficiente. El cliente debe entregar al menos L ${total.toLocaleString()}.`);
      return;
    }

    // Verificar si hay stock
    const isOutOfStock = currentCustomer.cart.some(item => {
      const prod = products.find(p => p.id === item.productId);
      return !prod || prod.stock < item.units;
    });

    if (isOutOfStock) {
      sound.playRejectBuzzer();
    } else {
      sound.playCashChime();
    }

    onServeCustomer(currentCustomer, paymentMethod);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Barra de Estado del Mostrador */}
      <div className="bg-[#dfdfdf] border border-[#808080] p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Caja Registradora: {storeName}</span>
          <span className="font-mono bg-white px-2 py-0.5 border border-[#808080]">
            Efectivo en Caja: L {storeCash.toLocaleString()}
          </span>
          <span className="text-slate-500">({unservedCount} clientes esperando en fila)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={unservedCount === 0}
            onClick={() => {
              sound.playCashChime();
              onBatchServe();
            }}
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-500 font-bold disabled:opacity-40"
            title="Cobrar automáticamente a todos los clientes que tengan inventario disponible"
          >
            ⚡ Atender Cola Rápida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mostrador de Venta / Cliente Actual */}
        <div className="md:col-span-2 bg-[#f4f4f4] border-2 border-[#808080] p-3 space-y-3 shadow-inner">
          {currentCustomer ? (
            <>
              {/* Identificación del Cliente */}
              <div className="flex items-center justify-between border-b border-[#a0a0a0] pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shadow-sm">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{currentCustomer.name}</h3>
                    <div className="text-[11px] text-slate-600 flex gap-2">
                      <span className="font-semibold text-amber-900">{currentCustomer.customerType}</span>
                      <span>·</span>
                      <span>Paciencia: {currentCustomer.patience}%</span>
                      <span>·</span>
                      <span>Presupuesto: L {currentCustomer.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {currentCustomer.isServed ? (
                    currentCustomer.leftWithoutBuying ? (
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5">
                        ✕ SE FUE SIN COMPRAR
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5">
                        ✓ COBRADO CON ÉXITO
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5">
                      ⏳ EN MOSTRADOR
                    </span>
                  )}
                </div>
              </div>

              {/* Canasta de Compras del Cliente */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Artículos en la Canasta:</span>
                <div className="bg-white border border-[#808080] p-2 space-y-1.5">
                  {currentCustomer.cart.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const inStock = prod ? prod.stock >= item.units : false;
                    const availableUnits = prod ? prod.stock : 0;

                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{prod?.icon || '📦'}</span>
                          <span className="font-medium text-slate-900">{item.productName}</span>
                          <span className="font-mono text-slate-500">x{item.units}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-mono font-semibold ${
                            inStock ? 'text-emerald-700' : 'text-red-600 bg-red-50 px-1 border border-red-200'
                          }`}>
                            {inStock ? `Stock: ${availableUnits}` : `¡AGOTADO! (Stock: ${availableUnits})`}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            L {(item.units * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totales y Botones de Cobro de Caja Registradora */}
              <div className="bg-[#e9ecef] border border-[#a0a0a0] p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                  <div>
                    <div className="text-[11px] text-slate-600">Subtotal: L {subtotal.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-600">ISV 15%: L {tax.toLocaleString()}</div>
                    <div className="font-mono text-sm font-black text-slate-900">
                      TOTAL A COBRAR: L {total.toLocaleString()}
                    </div>
                  </div>

                  {/* Calculadora de Vuelto / Cambio en Efectivo */}
                  {!currentCustomer.isServed && (
                    <div className="bg-white p-2 border border-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Efectivo Recibido (L):</span>
                        <input
                          type="number"
                          min={total}
                          value={cashTendered}
                          onChange={(e) => setCashTendered(Math.max(0, Number(e.target.value)))}
                          className="w-24 bg-amber-50 border border-slate-400 px-1.5 py-0.5 font-mono font-bold text-xs"
                        />
                      </div>

                      {/* Botones de billetes rápidos */}
                      <div className="flex gap-1">
                        {[total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].filter((val, i, arr) => arr.indexOf(val) === i && val >= total).slice(0, 3).map((amt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCashTendered(amt)}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border text-[10px] font-mono font-bold text-slate-700"
                          >
                            L {amt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <div className="text-[11px] font-mono font-bold text-emerald-800 pt-0.5 flex justify-between">
                        <span>VUELTO / CAMBIO:</span>
                        <span>L {changeDue.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {!currentCustomer.isServed ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleCharge('efectivo')}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>💵</span>
                      <span>Cobrar en Efectivo (Vuelto: L {changeDue.toLocaleString()})</span>
                    </button>
                    <button
                      onClick={() => handleCharge('tarjeta')}
                      className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs border-t border-l border-blue-300 border-b border-r border-blue-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>💳</span>
                      <span>Cobrar Tarjeta POS (Exacto)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      const nextUnserved = queue.findIndex((q, i) => i > currentIndex && !q.isServed);
                      if (nextUnserved !== -1) {
                        setCurrentIndex(nextUnserved);
                      } else {
                        const firstUnserved = queue.findIndex(q => !q.isServed);
                        if (firstUnserved !== -1) setCurrentIndex(firstUnserved);
                      }
                    }}
                    className="w-full py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-900 cursor-pointer"
                  >
                    Atender Siguiente Cliente ▶
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-600">
              <span className="text-3xl block mb-2">🏁</span>
              <p className="font-bold">No hay más clientes en la fila por hoy.</p>
              <p className="text-[11px] text-slate-500">Cierra el día en la barra inferior para calcular el balance y generar nuevas visitas.</p>
            </div>
          )}
        </div>

        {/* Cinta de Ticket Virtual de Caja Registradora */}
        <div className="bg-[#fffdf5] border-2 border-[#d5ccb4] p-3 font-mono shadow-md flex flex-col h-[340px]">
          <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
            <span className="font-bold text-xs block text-slate-900">{storeName.toUpperCase()}</span>
            <span className="text-[10px] text-slate-500">TICKET DE REGISTRO FISCAL</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px]">
            {receipts.length === 0 ? (
              <div className="text-center text-slate-400 pt-8">
                Cinta de caja vacía. Realiza ventas en el mostrador para emitir comprobantes.
              </div>
            ) : (
              receipts.map((rec) => (
                <div key={rec.id} className="border-b border-dashed border-slate-300 pb-1.5">
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span>{rec.id}</span>
                    <span>{rec.time}</span>
                  </div>
                  <div className="text-slate-600 text-[10px]">{rec.customerName} ({rec.itemsCount} arts)</div>
                  <div className="flex justify-between font-bold text-slate-900 mt-0.5">
                    <span>TOTAL:</span>
                    <span>L {rec.total.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-dashed border-slate-400 pt-1.5 flex items-center justify-between text-[10px] text-slate-600">
            <span>{receipts.length} ventas hoy</span>
            <button
              onClick={() => {
                sound.playClick();
                setShowZReport(true);
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-400"
            >
              📊 Arqueo Z
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Arqueo de Caja Diario (Reporte Z) */}
      {showZReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#f0f0f0] border-2 border-[#808080] shadow-2xl p-4 w-full max-w-md font-mono text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-1 font-bold text-slate-900">
              <span>🧾 CIERRE Y ARQUEO DIARIO DE CAJA (REPORTE Z)</span>
              <button
                onClick={() => setShowZReport(false)}
                className="text-slate-500 hover:text-black font-bold px-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-3 border space-y-1.5 text-slate-800">
              <div className="text-center font-bold border-b pb-1">
                {storeName.toUpperCase()}
              </div>
              <div className="flex justify-between">
                <span>Ventas Totales del Día:</span>
                <span className="font-bold">L {receipts.reduce((sum, r) => sum + r.total, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>- Base Imponible:</span>
                <span>L {receipts.reduce((sum, r) => sum + r.subtotal, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>- ISV 15% Recaudado:</span>
                <span>L {receipts.reduce((sum, r) => sum + r.tax, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Efectivo Actual en Gaveta:</span>
                <span className="text-emerald-800">L {storeCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Transacciones Emitidas:</span>
                <span>{receipts.length} tickets</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playApprovalStamp();
                setShowZReport(false);
              }}
              className="w-full py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs"
            >
              Imprimir Arqueo y Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
