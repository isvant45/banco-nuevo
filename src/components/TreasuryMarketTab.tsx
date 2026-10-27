import React, { useState } from 'react';
import { GameState, TreasuryAsset, SwiftTransaction, SecondaryMarketSecurity } from '../game/types';
import { formatHNL, formatUSD, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Landmark, 
  Coins, 
  Globe, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  CheckCircle, 
  ShieldAlert, 
  DollarSign, 
  Plus,
  Building2,
  PieChart,
  ShoppingBag,
  BadgeCheck,
  Percent
} from 'lucide-react';

interface TreasuryMarketTabProps {
  state: GameState;
  onBuyBCHBond: (amountHNL: number) => void;
  onTradeFX: (action: 'BUY_USD' | 'SELL_USD', amountUSD: number) => void;
  onSendSwiftTransfer: (newTransfer: Omit<SwiftTransaction, 'id' | 'settlementStatus'>) => void;
  onBuySecondarySecurity: (securityId: string, units: number) => void;
  onSellSecondarySecurity: (securityId: string, units: number) => void;
}

export const TreasuryMarketTab: React.FC<TreasuryMarketTabProps> = ({
  state,
  onBuyBCHBond,
  onTradeFX,
  onSendSwiftTransfer,
  onBuySecondarySecurity,
  onSellSecondarySecurity
}) => {
  const [fxAmountUSD, setFxAmountUSD] = useState<number>(250000);
  const [bondInvestmentHNL, setBondInvestmentHNL] = useState<number>(20000000);

  // Formulario rápido SWIFT
  const [showSwiftModal, setShowSwiftModal] = useState<boolean>(false);
  const [swiftClient, setSwiftClient] = useState<string>('Exportadora Maya de Café S.A.');
  const [swiftBank, setSwiftBank] = useState<SwiftTransaction['counterpartyBank']>('JPMorgan Chase (Nueva York)');
  const [swiftAmount, setSwiftAmount] = useState<number>(150000);
  const [swiftPurpose, setSwiftPurpose] = useState<SwiftTransaction['purpose']>('Pago de Importación de Maquinaria');

  // Filtro de mercado secundario
  const [secCategoryFilter, setSecCategoryFilter] = useState<string>('all');

  // Modal para comprar/vender mercado secundario
  const [activeTradeSecurity, setActiveTradeSecurity] = useState<SecondaryMarketSecurity | null>(null);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeUnits, setTradeUnits] = useState<number>(10);

  const handleBuyBond = () => {
    if (state.financials.cashAndBCHReserves < bondInvestmentHNL) {
      sound.playRejectBuzzer();
      alert('Liquidez insuficiente en caja para comprar este título.');
      return;
    }
    sound.playCashChime();
    onBuyBCHBond(bondInvestmentHNL);
  };

  const handleTradeFX = (action: 'BUY_USD' | 'SELL_USD') => {
    const costHNL = fxAmountUSD * state.bch.exchangeRateHNLtoUSD;
    if (action === 'BUY_USD' && state.financials.cashAndBCHReserves < costHNL) {
      sound.playRejectBuzzer();
      alert('Fondos en lempiras insuficientes para comprar divisas en subasta.');
      return;
    }
    sound.playCashChime();
    onTradeFX(action, fxAmountUSD);
  };

  const handleCreateSwift = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    const countryMap: Record<SwiftTransaction['counterpartyBank'], SwiftTransaction['counterpartyCountry']> = {
      'JPMorgan Chase (Nueva York)': 'Estados Unidos',
      'Citibank (Nueva York)': 'Estados Unidos',
      'UBS (Zúrich)': 'Suiza',
      'Credit Suisse (Ginebra)': 'Suiza',
      'ICBC (Shanghái)': 'China',
      'Bank of China (Pekín)': 'China'
    };

    onSendSwiftTransfer({
      direction: 'Saliente',
      counterpartyBank: swiftBank,
      counterpartyCountry: countryMap[swiftBank],
      currency: 'USD',
      amountFX: swiftAmount,
      clientName: swiftClient,
      purpose: swiftPurpose,
      feeUSD: 50,
      complianceCheck: 'Aprobado OFAC/BCH'
    });
    setShowSwiftModal(false);
  };

  const handleExecuteSecurityTrade = () => {
    if (!activeTradeSecurity) return;
    const totalCostOrGain = tradeUnits * activeTradeSecurity.pricePerUnitHNL;

    if (tradeAction === 'BUY') {
      if (state.financials.cashAndBCHReserves < totalCostOrGain) {
        sound.playRejectBuzzer();
        alert('Fondos insuficientes en la reserva de caja para adquirir estas unidades.');
        return;
      }
      sound.playCashChime();
      onBuySecondarySecurity(activeTradeSecurity.id, tradeUnits);
    } else {
      if (activeTradeSecurity.ownedUnits < tradeUnits) {
        sound.playRejectBuzzer();
        alert('No posees suficientes unidades de este título para vender.');
        return;
      }
      sound.playCashChime();
      onSellSecondarySecurity(activeTradeSecurity.id, tradeUnits);
    }
    setActiveTradeSecurity(null);
  };

  const currentUSDReserves = Math.round(state.financials.fxReservesUSDValueInHNL / state.bch.exchangeRateHNLtoUSD);

  const filteredSecurities = (state.secondarySecurities || []).filter(sec => {
    if (secCategoryFilter === 'all') return true;
    return sec.category === secCategoryFilter;
  });

  const totalSecuritiesValue = (state.secondarySecurities || []).reduce((acc, s) => acc + (s.ownedUnits * s.pricePerUnitHNL), 0);

  return (
    <div className="space-y-6">
      {/* 1. Métricas de Tesorería Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>TÍTULOS Y BONOS BCH</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatHNL(state.financials.treasuryBondsBCH)}
          </div>
          <div className="text-xs text-slate-400">
            Rendimiento promedio: <span className="text-amber-400 font-semibold">{formatPct(state.bch.tpmRate + 0.9)} anual</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>MERCADO SECUNDARIO & ACCIONES</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
            {formatHNL(totalSecuritiesValue)}
          </div>
          <div className="text-xs text-slate-400">
            Cupones y dividendos mes: <span className="text-white font-mono">{formatHNL(state.financials.interestIncomeSecurities || 385000)}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>RESERVA EN DÓLARES (USD)</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatUSD(currentUSDReserves)}
          </div>
          <div className="text-xs text-slate-400">
            Equivalente: <span className="text-slate-200 font-mono">{formatHNL(state.financials.fxReservesUSDValueInHNL)}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>SUBASTA MENSUAL BCH</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatUSD(state.bch.monthlyFXAuctionVolumeUSD)}
          </div>
          <div className="text-xs text-slate-400">
            Tipo de cambio: <span className="text-emerald-400 font-mono font-semibold">L. {state.bch.exchangeRateHNLtoUSD} / USD</span>
          </div>
        </div>
      </div>

      {/* 2. Mercado Secundario de Valores y Acciones Hondureñas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Mercado Secundario de Valores, Bonos y Acciones Corporativas
              </h2>
              <p className="text-xs text-slate-400">
                Invierte el excedente de liquidez de Áureo Bank comprando bonos del gobierno (SEFIN/BCH), bonos de bancos rivales (Atlántida, Ficohsa, Banpaís, Occidente), bonos empresariales y acciones bursátiles hondureñas con pago regular de cupones y dividendos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Portafolio Invertido:</span>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
              {formatHNL(totalSecuritiesValue)}
            </span>
          </div>
        </div>

        {/* Filtros de Categorías de Títulos */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'Todos los Títulos y Acciones' },
            { id: 'Bono Soberano BCH / SEFIN', label: 'Bonos BCH / SEFIN (Gobierno)' },
            { id: 'Bono Corporativo Bancario', label: 'Bonos de Bancos Rivales' },
            { id: 'Bono Corporativo Empresa', label: 'Bonos Corporativos Empresas' },
            { id: 'Acción Ordinaria', label: 'Acciones Bursátiles (Renta Variable)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setSecCategoryFilter(f.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                secCategoryFilter === f.id
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid de Títulos y Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSecurities.map(sec => {
            const isOwned = sec.ownedUnits > 0;
            const currentPositionHNL = sec.ownedUnits * sec.pricePerUnitHNL;

            return (
              <div
                key={sec.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white" style={{ backgroundColor: sec.issuerBadgeColor + '40', border: `1px solid ${sec.issuerBadgeColor}` }}>
                        {sec.issuer}
                      </span>
                      <h3 className="font-bold text-white text-xs mt-1.5 leading-tight">
                        {sec.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                      {sec.riskRating}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                    {sec.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Precio Unitario:</span>
                      <span className="font-bold text-white">{formatHNL(sec.pricePerUnitHNL)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Rendimiento Anual:</span>
                      <span className="font-bold text-emerald-400">{sec.annualYieldOrDividendPct}% anual</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">En Posesión:</span>
                    <span className="font-mono font-bold text-white">
                      {sec.ownedUnits} {sec.unitType}s ({formatHNL(currentPositionHNL)})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTradeSecurity(sec);
                        setTradeAction('BUY');
                        setTradeUnits(sec.unitType === 'Acción' ? 500 : 10);
                      }}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Comprar
                    </button>

                    <button
                      disabled={!isOwned}
                      onClick={() => {
                        sound.playClick();
                        setActiveTradeSecurity(sec);
                        setTradeAction('SELL');
                        setTradeUnits(Math.min(sec.ownedUnits, sec.unitType === 'Acción' ? 500 : 10));
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        isOwned
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Vender
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Mesa de Operaciones Cambiarias USD y Corresponsalía SWIFT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mesa Cambiaria de Divisas USD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Mesa Cambiaria USD / HNL (Subasta BCH)</h3>
                  <p className="text-[11px] text-slate-400">Mercado interbancario de divisas autorizado</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                1 USD = L. {state.bch.exchangeRateHNLtoUSD}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Gestiona la posición cambiaria de Áureo Bank. Compra dólares en la subasta electrónica del BCH para fondear cartas de crédito y transferencias SWIFT, o vende divisas para restituir encaje y liquidez en Lempiras.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Monto a Transaccionar (USD):</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={fxAmountUSD}
                  onChange={e => setFxAmountUSD(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Equivalente en Lempiras:</span>
                  <span className="text-white font-bold">{formatHNL(fxAmountUSD * state.bch.exchangeRateHNLtoUSD)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Posición Neta en Dólares:</span>
                  <span className="text-emerald-400">{formatUSD(currentUSDReserves)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleTradeFX('BUY_USD')}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Comprar USD</span>
            </button>
            <button
              onClick={() => handleTradeFX('SELL_USD')}
              className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Vender USD</span>
            </button>
          </div>
        </div>

        {/* Transferencias Internacionales SWIFT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Red SWIFT & Bancos Corresponsales</h3>
                  <p className="text-[11px] text-slate-400">Mensajería MT103 con Nueva York, Zúrich y Pekín</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwiftModal(true)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Emitir MT103</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {state.swiftTransactions.map(tx => (
                <div key={tx.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{tx.clientName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatUSD(tx.amountFX)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>{tx.counterpartyBank}</span>
                    <span className="text-blue-300 font-mono">{tx.purpose}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Comisión: $ {tx.feeUSD}</span>
                    <span className="text-emerald-400">✓ {tx.complianceCheck}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Comprar / Vender Título o Acción del Mercado Secundario */}
      {activeTradeSecurity && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">
                  {tradeAction === 'BUY' ? 'Orden de Compra' : 'Orden de Venta'} en Mercado Secundario
                </span>
                <h3 className="font-bold text-white text-sm">{activeTradeSecurity.name}</h3>
              </div>
              <button
                onClick={() => setActiveTradeSecurity(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Emisor / Institución:</span>
                <span className="text-white font-bold">{activeTradeSecurity.issuer}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rendimiento Anual Cupón/Div:</span>
                <span className="text-emerald-400 font-bold">{activeTradeSecurity.annualYieldOrDividendPct}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Precio por {activeTradeSecurity.unitType}:</span>
                <span className="text-amber-300 font-bold">{formatHNL(activeTradeSecurity.pricePerUnitHNL)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Posesión Actual:</span>
                <span className="text-slate-200">{activeTradeSecurity.ownedUnits} {activeTradeSecurity.unitType}s</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Cantidad de {activeTradeSecurity.unitType}s a {tradeAction === 'BUY' ? 'comprar' : 'vender'}:
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={tradeUnits}
                onChange={e => setTradeUnits(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs font-mono flex justify-between items-center">
              <span className="text-slate-400 font-sans">
                {tradeAction === 'BUY' ? 'Desembolso Total:' : 'Total a Cobrar:'}
              </span>
              <span className={`text-sm font-bold ${tradeAction === 'BUY' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatHNL(tradeUnits * activeTradeSecurity.pricePerUnitHNL)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveTradeSecurity(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteSecurityTrade}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md transition-all ${
                  tradeAction === 'BUY'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                {tradeAction === 'BUY' ? 'Confirmar Compra' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para emitir nueva transferencia SWIFT MT103 */}
      {showSwiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Emitir Mensaje SWIFT MT103 Saliente</h3>
              <button onClick={() => setShowSwiftModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSwift} noValidate className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cliente Solicitante:</label>
                <input
                  type="text"
                  value={swiftClient}
                  onChange={e => setSwiftClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Banco Corresponsal Receptor:</label>
                <select
                  value={swiftBank}
                  onChange={e => setSwiftBank(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs"
                >
                  <option value="JPMorgan Chase (Nueva York)">JPMorgan Chase (Nueva York, EEUU)</option>
                  <option value="Citibank (Nueva York)">Citibank (Nueva York, EEUU)</option>
                  <option value="UBS (Zúrich)">UBS (Zúrich, Suiza)</option>
                  <option value="Credit Suisse (Ginebra)">Credit Suisse (Ginebra, Suiza)</option>
                  <option value="ICBC (Shanghái)">ICBC (Shanghái, China)</option>
                  <option value="Bank of China (Pekín)">Bank of China (Pekín, China)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Monto en Divisa (USD):</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={swiftAmount}
                  onChange={e => setSwiftAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Propósito Comercial:</label>
                <select
                  value={swiftPurpose}
                  onChange={e => setSwiftPurpose(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs"
                >
                  <option value="Pago de Importación de Maquinaria">Pago de Importación de Maquinaria</option>
                  <option value="Exportación Agrícola (Café)">Exportación Agrícola (Café)</option>
                  <option value="Materia Prima Textil">Materia Prima Textil</option>
                  <option value="Inversión Financiera">Inversión Financiera</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSwiftModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  Transmitir por Red SWIFT ($50 Fee)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
