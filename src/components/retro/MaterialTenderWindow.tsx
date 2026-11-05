import React, { useState } from 'react';
import { MaterialManufacturerQuote } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface MaterialTenderWindowProps {
  quotes: MaterialManufacturerQuote[];
  storeCash: number;
  storeBankBalance: number;
  onOrderFromManufacturer: (quoteId: string, units: number) => void;
}

export const MaterialTenderWindow: React.FC<MaterialTenderWindowProps> = ({
  quotes,
  storeCash,
  storeBankBalance,
  onOrderFromManufacturer
}) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id || '');
  const [orderUnits, setOrderUnits] = useState<number>(300);

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId) || quotes[0];
  const totalFunds = storeCash + storeBankBalance;
  const totalOrderCost = selectedQuote ? orderUnits * selectedQuote.unitCost : 0;
  const canAfford = totalFunds >= totalOrderCost;

  const handleSelectQuote = (quote: MaterialManufacturerQuote) => {
    sound.playClick();
    setSelectedQuoteId(quote.id);
    setOrderUnits(quote.minBatchUnits);
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !canAfford) {
      sound.playRejectBuzzer();
      return;
    }
    sound.playApprovalStamp();
    onOrderFromManufacturer(selectedQuote.id, orderUnits);
  };

  const renderStars = (count: number) => '⭐'.repeat(count);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Encabezado */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-2 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-xs">LICITACIÓN PRIVADA DE MATERIALES A FABRICANTES (1 A 5 ESTRELLAS)</h3>
          <span className="text-[10px] text-slate-600">
            Adjudicación de contratos de suministro mayorista directo con acerías, canteras y plantas de cemento.
          </span>
        </div>

        <div className="font-mono text-[11px] bg-white px-2 py-1 border border-[#808080]">
          Liquidez: <strong className="text-blue-900">L {totalFunds.toLocaleString()}</strong>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-auto">
        {/* Lista de Cotizaciones de Fabricantes */}
        <div className="md:col-span-7 bg-white border border-[#808080] p-2 overflow-y-auto space-y-1.5">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-[10px] flex justify-between">
            <span>FABRICANTE & MATERIAL</span>
            <span>RATING</span>
            <span>PRECIO UNIT.</span>
          </div>

          {quotes.map((quote) => {
            const isSelected = selectedQuote?.id === quote.id;

            return (
              <div
                key={quote.id}
                onClick={() => handleSelectQuote(quote)}
                className={`p-2 border cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#000080] text-white border-blue-900'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{quote.manufacturerName}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    Insumo: {quote.materialId} · Lote mín: {quote.minBatchUnits} uds · Entrega: {quote.deliveryDays}d
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs">{renderStars(quote.ratingStars)}</div>
                  <span className="font-mono font-bold text-xs">L {quote.unitCost.toLocaleString()}</span>
                  <span className={`text-[10px] block font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    -{quote.discountPct}% Dto
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario de Adjudicación de Suministro */}
        <div className="md:col-span-5 bg-[#f0f0f0] border border-[#808080] p-2.5 flex flex-col justify-between">
          {selectedQuote ? (
            <form onSubmit={handleOrder} className="space-y-3">
              <div className="bg-white border border-[#808080] p-2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{selectedQuote.manufacturerName}</h4>
                    <span className="text-[10px] text-slate-500">Insumo: {selectedQuote.materialId}</span>
                  </div>
                  <span className="text-xs">{renderStars(selectedQuote.ratingStars)}</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-2 text-[10px] text-blue-950 font-semibold">
                  🏷️ {selectedQuote.qualityBadge}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2 border">
                  <div>
                    <span className="text-slate-500 block">Precio Mayorista:</span>
                    <span className="font-bold text-slate-900">L {selectedQuote.unitCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Llegada a Patio:</span>
                    <span className="font-bold text-slate-900">{selectedQuote.deliveryDays} día(s)</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cantidad a licitar (Mínimo {selectedQuote.minBatchUnits} uds):
                  </label>
                  <input
                    type="number"
                    min={selectedQuote.minBatchUnits}
                    step={10}
                    value={orderUnits}
                    onChange={(e) => setOrderUnits(Math.max(selectedQuote.minBatchUnits, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-400 px-2 py-1 font-mono font-bold text-sm text-slate-900"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2 font-mono text-[11px] flex justify-between">
                  <span>Total Factura con CAI:</span>
                  <span className="font-bold text-blue-900">L {totalOrderCost.toLocaleString()}</span>
                </div>
              </div>

              {!canAfford && (
                <div className="p-2 bg-rose-50 border border-rose-300 text-rose-800 text-[10px]">
                  ⚠️ Fondos insuficientes. Se requieren L {(totalOrderCost - totalAvailableFunds).toLocaleString()} adicionales. Puedes solicitar crédito en los 4 Bancos Comerciales.
                </div>
              )}

              <button
                type="submit"
                disabled={!canAfford}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs border shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>📦</span>
                <span>ADJUDICAR Y ORDENAR SUMINISTRO A FÁBRICA</span>
              </button>
            </form>
          ) : (
            <div className="p-4 text-center text-slate-500">Selecciona una cotización</div>
          )}

          <div className="text-[10px] text-slate-500 bg-white p-2 border border-[#808080] mt-2">
            💡 <strong>Ventaja de Licitación Mayorista:</strong> Comprar directo a fábrica ofrece descuentos de hasta 13% respecto a precios de mostrador y califica como costo 100% deducible en tu declaración anual del SAR.
          </div>
        </div>
      </div>
    </div>
  );
};
