import React, { useState } from 'react';
import { InterbankPortfolioOffer, CompetitorBank, CompetitorId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { Building2, ArrowDownRight, ArrowUpRight, Check, X, ShieldAlert, Sparkles, DollarSign, Wallet } from 'lucide-react';

interface InterbankPortfolioMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: InterbankPortfolioOffer[];
  competitors: CompetitorBank[];
  availableCashHNL: number;
  onBuyOffer: (offerId: string) => void;
  onSellOwnPortfolio: (buyerBankId: CompetitorId, portfolioType: 'hipotecaria' | 'pyme_comercial' | 'consumo_mora', faceValueHNL: number) => void;
}

export function InterbankPortfolioMarketModal({
  isOpen,
  onClose,
  offers,
  competitors,
  availableCashHNL,
  onBuyOffer,
  onSellOwnPortfolio
}: InterbankPortfolioMarketModalProps) {
  const [activeTab, setActiveTab] = useState<'comprar' | 'vender'>('comprar');
  const [selectedBuyerBank, setSelectedBuyerBank] = useState<CompetitorId>('atlantida');
  const [sellPortfolioType, setSellPortfolioType] = useState<'hipotecaria' | 'pyme_comercial' | 'consumo_mora'>('hipotecaria');
  const [sellFaceValue, setSellFaceValue] = useState<number>(30000000);

  if (!isOpen) return null;

  const handleBuy = (offerId: string) => {
    sound.playCoinClink();
    onBuyOffer(offerId);
  };

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCoinClink();
    onSellOwnPortfolio(selectedBuyerBank, sellPortfolioType, sellFaceValue);
    onClose();
  };

  const buyerBank = competitors.find(c => c.id === selectedBuyerBank) || competitors[0];
  const sellDiscountPct = sellPortfolioType === 'consumo_mora' ? 0.35 : sellPortfolioType === 'pyme_comercial' ? 0.08 : 0.03;
  const sellCashProceeds = Math.round(sellFaceValue * (1 - sellDiscountPct));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Mercado Interbancario de Carteras (M&A)</h2>
              <p className="text-xs text-slate-400">Compra y Venta de Carteras de Activos (Préstamos) y Pasivos (Depósitos)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Liquidez */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Disponibilidad en Reservas de Caja:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{formatHNL(availableCashHNL)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('comprar')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'comprar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Comprar Carteras a Rivales
            </button>
            <button
              onClick={() => setActiveTab('vender')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'vender'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Vender Cartera Propia
            </button>
          </div>
        </div>

        {/* Pestaña Comprar */}
        {activeTab === 'comprar' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-400">
              Paquetes de cartera estructurados ofertados por los principales bancos del sistema financiero hondureño:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offers.map(offer => {
                const isBought = offer.status === 'comprado';
                const canAfford = availableCashHNL >= offer.offerPriceHNL || offer.portfolioType === 'pasivos_depositos';

                return (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isBought
                        ? 'bg-slate-950/50 border-slate-800 opacity-60'
                        : 'bg-slate-950 border-slate-800 hover:border-blue-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-400">{offer.sellerBankName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            offer.portfolioType === 'activos_creditos' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {offer.portfolioType === 'activos_creditos' ? 'Préstamos (Activo)' : 'Depósitos DPF (Pasivo)'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 mt-1">{offer.name}</h4>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        offer.riskRating.includes('Bajo') ? 'text-emerald-400' :
                        offer.riskRating.includes('Moderado') ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {offer.riskRating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{offer.description}</p>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400">Valor Facial</p>
                        <p className="text-xs font-mono font-bold text-slate-200">{formatHNL(offer.faceValueHNL)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Tasa Media</p>
                        <p className="text-xs font-mono font-bold text-amber-400">{formatPct(offer.averageRatePct)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Descuento/Prima</p>
                        <p className="text-xs font-mono font-bold text-emerald-400">{offer.discountOrPremiumPct}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                      <div>
                        <p className="text-[10px] text-slate-400">Precio de Oferta:</p>
                        <p className="text-sm font-mono font-bold text-emerald-400">{formatHNL(offer.offerPriceHNL)}</p>
                      </div>

                      {isBought ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Cartera Adquirida
                        </span>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => handleBuy(offer.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                            canAfford
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Adquirir Cartera
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pestaña Vender Cartera Propia */}
        {activeTab === 'vender' && (
          <form onSubmit={handleSell} className="mt-4 space-y-4">
            <p className="text-xs text-slate-300">
              Vende un paquete de tu cartera propia a un banco competidor para generar liquidez inmediata de caja o desapalancar activos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Cartera a Transferir</label>
                <select
                  value={sellPortfolioType}
                  onChange={e => setSellPortfolioType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="hipotecaria">Cartera Hipotecaria Residencial (3% descuento)</option>
                  <option value="pyme_comercial">Cartera Comercial PYME (8% descuento)</option>
                  <option value="consumo_mora">Cartera de Consumo & Tarjetas con Atraso (35% descuento)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Nominal del Paquete (HNL)</label>
                <input
                  type="number"
                  min="5000000"
                  max="100000000"
                  step="5000000"
                  value={sellFaceValue}
                  onChange={e => setSellFaceValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seleccionar Banco Competidor Adquirente:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {competitors.map(rival => (
                  <button
                    type="button"
                    key={rival.id}
                    onClick={() => setSelectedBuyerBank(rival.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedBuyerBank === rival.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-200">{rival.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Cuota: {rival.marketShare}%</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulación de Venta */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Comprador Interbancario:</span>
                <span className="font-semibold text-slate-200">{buyerBank.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Descuento de colocación:</span>
                <span className="font-semibold text-rose-400">{(sellDiscountPct * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-emerald-400">
                <span>Liquidez Inmediata en Caja Recibida:</span>
                <span className="font-mono">{formatHNL(sellCashProceeds)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Transferir Cartera a {buyerBank.shortName} por {formatHNL(sellCashProceeds)}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
