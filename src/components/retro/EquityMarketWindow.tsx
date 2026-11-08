import React, { useState } from 'react';
import { DailySimulationState, TransactionVoucher } from '../../game/retroSimTypes';
import {
  calculateCompanyValuation,
  getOrCreateCapTable,
  generateEquityRoundOffers,
  acceptEquityOffer,
  executeShareBuyback,
  evaluateIpoEligibility,
  executeIpo
} from '../../game/equityMarketEngine';
import { sound } from '../../game/audioFx';

interface EquityMarketWindowProps {
  simState: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onShowVoucher?: (voucher: TransactionVoucher) => void;
  onTriggerToast?: (toast: { title: string; message: string; type: 'success' | 'warning' | 'danger' | 'money'; amount?: number }) => void;
}

export const EquityMarketWindow: React.FC<EquityMarketWindowProps> = ({
  simState,
  onUpdateState,
  onShowVoucher,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'valuation' | 'captable' | 'offers' | 'ipo'>('valuation');
  const [selectedDestination, setSelectedDestination] = useState<'bank' | 'cash'>('bank');
  const [tickerInput, setTickerInput] = useState<string>('AUREO');

  const valuationData = calculateCompanyValuation(simState);
  const capTable = getOrCreateCapTable(simState);
  const offers = simState.equityOffers && simState.equityOffers.length > 0
    ? simState.equityOffers
    : generateEquityRoundOffers(simState);
  const ipoStatus = evaluateIpoEligibility(simState);

  const playerShareholder = capTable.find(i => i.isPlayer);
  const founderSharePct = playerShareholder?.sharePercentage ?? 100;

  const handleAcceptOffer = (offerId: string) => {
    const res = acceptEquityOffer(simState, offerId, selectedDestination);
    if (res.success) {
      sound.playCaChing();
      onUpdateState(res.updatedState);
      if (res.voucher && onShowVoucher) {
        onShowVoucher(res.voucher);
      }
      if (onTriggerToast) {
        const accepted = offers.find(o => o.id === offerId);
        onTriggerToast({
          title: 'Ronda de Equity Cerrada',
          message: res.message,
          type: 'money',
          amount: accepted?.cashInjectionHNL
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handleBuyback = (investorId: string) => {
    const res = executeShareBuyback(simState, investorId);
    if (res.success) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      if (res.voucher && onShowVoucher) {
        onShowVoucher(res.voucher);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: 'Recompra Accionaria Exitosa',
          message: res.message,
          type: 'success'
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handleLaunchIpo = () => {
    const res = executeIpo(simState, tickerInput);
    if (res.success) {
      sound.playIpoBell();
      onUpdateState(res.updatedState);
      if (res.voucher && onShowVoucher) {
        onShowVoucher(res.voucher);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: '¡SALIDA A BOLSA EXITOSA!',
          message: `La empresa ${simState.storeName} cotiza bajo el ticker [${tickerInput.toUpperCase()}] en la Bolsa de Valores.`,
          type: 'money',
          amount: res.voucher?.netDisbursedOrPaidHNL
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans select-none text-xs">
      {/* Top Banner retro */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3 border-b-2 border-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <div>
            <h1 className="text-base font-black tracking-wide font-mono uppercase">
              Mercado de Acciones & Valuación Corporativa (BVM)
            </h1>
            <p className="text-[11px] text-blue-200">
              Estructura de Capital • Cap Table • Venture Capital • Salida a Bolsa (IPO)
            </p>
          </div>
        </div>
        <div className="text-right font-mono bg-black/40 px-3 py-1.5 border border-white/20">
          <div className="text-[10px] text-gray-300 uppercase">Valuación Oficial</div>
          <div className="text-base font-black text-emerald-400">
            L {valuationData.valuationHNL.toLocaleString('es-HN')}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-400 bg-gray-200 px-2 pt-1 gap-1">
        {[
          { id: 'valuation', label: '📊 Valuación Financiera' },
          { id: 'captable', label: `👥 Cap Table (${founderSharePct}%)` },
          { id: 'offers', label: `🤝 Rondas de Inversión (${offers.filter(o => o.status === 'disponible').length})` },
          { id: 'ipo', label: `🔔 Salida a Bolsa (IPO) ${ipoStatus.isIpoCompleted ? '⭐' : ''}` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as typeof activeTab);
            }}
            className={`px-4 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
              activeTab === tab.id
                ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] text-blue-900'
                : 'bg-gray-300 border-gray-100 text-gray-700 hover:bg-gray-250'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Body Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#d4d0c8]">
        {/* TAB 1: VALUATION */}
        {activeTab === 'valuation' && (
          <div className="space-y-3">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-white p-2.5 border-2 border-gray-400 shadow-[inset_1px_1px_0px_#000]">
                <div className="text-gray-500 font-bold text-[10px] uppercase">Valuación Total</div>
                <div className="text-lg font-black text-blue-900 font-mono mt-0.5">
                  L {valuationData.valuationHNL.toLocaleString('es-HN')}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  10x Utilidad Neta + Patrimonio Tangible
                </div>
              </div>

              <div className="bg-white p-2.5 border-2 border-gray-400 shadow-[inset_1px_1px_0px_#000]">
                <div className="text-gray-500 font-bold text-[10px] uppercase">Utilidad Neta (Prom. 3 Meses)</div>
                <div className={`text-lg font-black font-mono mt-0.5 ${valuationData.averageMonthlyNetProfitHNL >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  L {valuationData.averageMonthlyNetProfitHNL.toLocaleString('es-HN')}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Múltiplo 10x = L {(valuationData.averageMonthlyNetProfitHNL * 10).toLocaleString('es-HN')}
                </div>
              </div>

              <div className="bg-white p-2.5 border-2 border-gray-400 shadow-[inset_1px_1px_0px_#000]">
                <div className="text-gray-500 font-bold text-[10px] uppercase">Activos Totales</div>
                <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">
                  L {valuationData.totalAssetsHNL.toLocaleString('es-HN')}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Caja + Inventario + Maquinaria + Bienes</div>
              </div>

              <div className="bg-white p-2.5 border-2 border-gray-400 shadow-[inset_1px_1px_0px_#000]">
                <div className="text-gray-500 font-bold text-[10px] uppercase">Pasivos Exigibles</div>
                <div className="text-lg font-black text-red-800 font-mono mt-0.5">
                  L {valuationData.totalLiabilitiesHNL.toLocaleString('es-HN')}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Bancos + NPC + SAR + Proveedores</div>
              </div>
            </div>

            {/* Asset Breakdown & Liabilities Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Activos */}
              <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000]">
                <div className="font-bold text-blue-900 text-xs border-b border-gray-300 pb-1 mb-2 flex items-center justify-between">
                  <span>🏢 COMPOSICIÓN DE ACTIVOS</span>
                  <span className="font-mono text-emerald-700">L {valuationData.totalAssetsHNL.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">💵 Caja & Depósitos Bancarios:</span>
                    <span className="font-bold">L {valuationData.breakdown.cashAndBanks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">📦 Inventario de Mercaderías/Materiales:</span>
                    <span className="font-bold">L {valuationData.breakdown.inventory.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">🚜 Flota de Maquinaria y Equipos:</span>
                    <span className="font-bold">L {valuationData.breakdown.machinery.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">🏛️ Inmuebles & Garantías Patrimoniales:</span>
                    <span className="font-bold">L {valuationData.breakdown.collaterals.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pasivos */}
              <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000]">
                <div className="font-bold text-red-900 text-xs border-b border-gray-300 pb-1 mb-2 flex items-center justify-between">
                  <span>📑 COMPOSICIÓN DE DEUDAS (PASIVOS)</span>
                  <span className="font-mono text-red-700">L {valuationData.totalLiabilitiesHNL.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">🏦 Préstamos Bancos Comerciales:</span>
                    <span className="font-bold text-red-700">L {valuationData.breakdown.bankDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">🦈 Créditos NPC & Tiburón:</span>
                    <span className="font-bold text-red-700">L {valuationData.breakdown.npcDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">⚖️ Obligaciones Fiscales Pendientes (SAR):</span>
                    <span className="font-bold text-red-700">L {valuationData.breakdown.sarDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">🏭 Créditos con Proveedores de Insumos:</span>
                    <span className="font-bold text-red-700">L {valuationData.breakdown.supplierDebt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="bg-amber-50 p-2.5 border border-amber-300 font-mono text-[11px] text-amber-900 flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <strong>Consejo del Banquero de Inversión:</strong> Para maximizar la valuación de la empresa y atraer rondas de Venture Capital sin endeudarte, mantén un flujo neto de utilidades positivo por al menos 3 turnos continuos y adquiere maquinaria o propiedades para inflar el patrimonio neto tangible.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAP TABLE */}
        {activeTab === 'captable' && (
          <div className="space-y-3">
            {/* Visual Ownership Bar */}
            <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000]">
              <div className="font-bold text-xs uppercase mb-1.5 flex justify-between">
                <span>Distribución Accionaria del Capital Social</span>
                <span>100% Total Emitido</span>
              </div>
              <div className="h-6 w-full bg-gray-200 border border-gray-400 flex overflow-hidden">
                {capTable.map((inv, idx) => {
                  const colors = [
                    'bg-blue-600 text-white',
                    'bg-emerald-600 text-white',
                    'bg-purple-600 text-white',
                    'bg-amber-500 text-black',
                    'bg-rose-600 text-white'
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={inv.id}
                      style={{ width: `${inv.sharePercentage}%` }}
                      className={`${color} flex items-center justify-center font-bold text-[10px] overflow-hidden whitespace-nowrap px-1 border-r border-white/40`}
                      title={`${inv.name}: ${inv.sharePercentage}%`}
                    >
                      {inv.sharePercentage >= 8 ? `${inv.sharePercentage}%` : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-700">
                {capTable.map((inv, idx) => {
                  const dotColors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-500', 'bg-rose-600'];
                  return (
                    <div key={inv.id} className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 ${dotColors[idx % dotColors.length]}`} />
                      <span>{inv.name} ({inv.sharePercentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shareholders Table */}
            <div className="bg-white border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-400 text-gray-700 uppercase font-sans">
                    <th className="p-2">Accionista / Fondo</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2 text-right">Participación</th>
                    <th className="p-2 text-right">Capital Inyectado</th>
                    <th className="p-2 text-right">Dividendos Cobrados</th>
                    <th className="p-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {capTable.map((inv) => {
                    const buybackCost = Math.round(valuationData.valuationHNL * (inv.sharePercentage / 100));
                    const canAffordBuyback = (simState.storeBankBalance + simState.storeCash) >= buybackCost;

                    return (
                      <tr key={inv.id} className="border-b border-gray-200 hover:bg-blue-50/40">
                        <td className="p-2 font-bold">
                          {inv.isPlayer ? '👑 ' : '💼 '}
                          {inv.name}
                        </td>
                        <td className="p-2 text-gray-600">
                          {inv.type === 'founder'
                            ? 'Fundador'
                            : inv.type === 'angel_investor'
                            ? 'Ángel Inversionista'
                            : inv.type === 'venture_capital'
                            ? 'Venture Capital'
                            : 'Mercado Público'}
                        </td>
                        <td className="p-2 text-right font-black text-blue-900">{inv.sharePercentage}%</td>
                        <td className="p-2 text-right text-emerald-700">
                          L {inv.investmentTotalHNL.toLocaleString('es-HN')}
                        </td>
                        <td className="p-2 text-right text-gray-600">
                          L {(inv.dividendsPaidTotalHNL || 0).toLocaleString('es-HN')}
                        </td>
                        <td className="p-2 text-center">
                          {inv.isPlayer ? (
                            <span className="text-gray-400 text-[10px] italic">Control Principal</span>
                          ) : (
                            <button
                              onClick={() => handleBuyback(inv.id)}
                              disabled={!canAffordBuyback}
                              className={`px-2 py-0.5 font-sans font-bold text-[10px] border border-gray-600 shadow-[1px_1px_0px_#000] active:translate-y-0.5 ${
                                canAffordBuyback
                                  ? 'bg-blue-800 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={
                                canAffordBuyback
                                  ? `Recomprar por L ${buybackCost.toLocaleString()}`
                                  : `Fondos insuficientes (requiere L ${buybackCost.toLocaleString()})`
                              }
                            >
                              Recomprar (L {buybackCost.toLocaleString()})
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
        )}

        {/* TAB 3: VENTURE CAPITAL & ANGEL OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-blue-50 p-2.5 border border-blue-300 font-mono text-[11px]">
              <div>
                <span className="font-bold text-blue-900">Destino del Capital Acreditado:</span> Inyección directa libre de pasivos.
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="dest"
                    checked={selectedDestination === 'bank'}
                    onChange={() => setSelectedDestination('bank')}
                  />
                  <span>🏦 Cuenta Bancaria</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="dest"
                    checked={selectedDestination === 'cash'}
                    onChange={() => setSelectedDestination('cash')}
                  />
                  <span>💵 Caja de Tesorería</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {offers.map((offer) => {
                const canAccept = offer.status === 'disponible' && founderSharePct > offer.offeredSharePct + 10;
                return (
                  <div
                    key={offer.id}
                    className={`bg-white p-3 border-2 ${
                      offer.status === 'aceptada'
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-gray-500 shadow-[2px_2px_0px_#888]'
                    } flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-2">
                        <span className="font-bold text-xs text-blue-900">{offer.badge}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 font-bold uppercase ${
                            offer.status === 'aceptada'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {offer.status === 'aceptada' ? 'Cerrada' : 'Disponible'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900">{offer.fundName}</h3>
                      <p className="text-gray-600 text-[11px] mt-1 leading-tight">{offer.description}</p>

                      <div className="mt-3 bg-gray-100 p-2 border border-gray-300 font-mono space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capital a Recibir:</span>
                          <span className="font-bold text-emerald-700">
                            +L {offer.cashInjectionHNL.toLocaleString('es-HN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Acciones Solicitadas:</span>
                          <span className="font-bold text-purple-900">{offer.offeredSharePct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valuación Implícita:</span>
                          <span className="font-bold text-blue-900">
                            L {offer.impliedValuationHNL.toLocaleString('es-HN')}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-1 text-[10px] text-gray-500">
                          <span>Cuotas Mensuales:</span>
                          <span className="text-emerald-800 font-bold">L 0.00 (Libre de deuda)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-200">
                      {offer.status === 'aceptada' ? (
                        <div className="text-center font-bold text-emerald-800 py-1 text-xs">
                          ✔ Capital Acreditado en Tesorería
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={!canAccept}
                          className={`w-full py-2 font-bold font-sans text-xs border border-gray-700 shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                            canAccept
                              ? 'bg-emerald-700 text-white hover:bg-emerald-600 cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {founderSharePct <= offer.offeredSharePct + 10
                            ? 'Participación Insuficiente'
                            : `Aceptar Ronda (+L ${offer.cashInjectionHNL.toLocaleString()})`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: IPO ENDGAME */}
        {activeTab === 'ipo' && (
          <div className="space-y-3">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-950 text-white p-4 border-2 border-yellow-500 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-yellow-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Bolsa de Valores de Honduras (BVM)
                  </span>
                  <h2 className="text-lg font-black tracking-wide font-mono mt-1">
                    CAMPANA DE SALIDA A BOLSA (IPO) — VICTORIA EMPRESARIAL
                  </h2>
                  <p className="text-xs text-yellow-200 mt-0.5 max-w-xl">
                    Consolida el imperio financiero haciendo pública la empresa. Abre el 25% del capital al mercado accionario internacional y levanta millones de lempiras en capital fresco.
                  </p>
                </div>
                <div className="text-4xl">🔔</div>
              </div>
            </div>

            {ipoStatus.isIpoCompleted ? (
              /* Already IPO'd */
              <div className="bg-white p-4 border-2 border-yellow-600 shadow-[inset_1px_1px_0px_#000] text-center space-y-3">
                <div className="text-3xl">🎉 🏆 ⭐</div>
                <h3 className="text-base font-black text-blue-900 font-mono">
                  ¡EMPRESA COTIZANDO PÚBLICAMENTE: [{ipoStatus.tickerSymbol}]!
                </h3>
                <p className="text-xs text-gray-700 max-w-lg mx-auto">
                  {simState.storeName} cotiza con éxito en la Bolsa de Valores. Se levantaron{' '}
                  <strong>L {(ipoStatus.fundsRaisedHNL || 0).toLocaleString()}</strong> de capital institucional.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto font-mono text-xs">
                  <div className="bg-gray-100 p-2 border border-gray-300">
                    <div className="text-gray-500 text-[10px]">Valuación de Salida</div>
                    <div className="font-bold text-blue-900">L {(ipoStatus.ipoValuationHNL || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-100 p-2 border border-gray-300">
                    <div className="text-gray-500 text-[10px]">Capital Levantado</div>
                    <div className="font-bold text-emerald-700">L {(ipoStatus.fundsRaisedHNL || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-100 p-2 border border-gray-300">
                    <div className="text-gray-500 text-[10px]">Acciones en Circulación</div>
                    <div className="font-bold text-purple-900">{ipoStatus.publicSharePct}% Flotante Público</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Prerequisites Checklist */
              <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] space-y-3">
                <h3 className="font-bold text-xs uppercase border-b border-gray-300 pb-1">
                  Requisitos Regulatorios de la Comisión Nacional de Bancos y Valores (CNBS):
                </h3>

                <div className="space-y-2 font-mono text-xs">
                  {/* Req 1: Valuation */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ipoStatus.requirements.minValuationMet ? '✅' : '❌'}</span>
                      <div>
                        <strong>Valuación Mínima L 10,000,000:</strong>
                        <div className="text-[10px] text-gray-500">
                          Actual: L {valuationData.valuationHNL.toLocaleString()} / L 10,000,000
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${ipoStatus.requirements.minValuationMet ? 'text-emerald-700' : 'text-red-700'}`}>
                      {ipoStatus.requirements.minValuationMet ? 'CUMPLIDO' : 'INSUFICIENTE'}
                    </span>
                  </div>

                  {/* Req 2: Solvencia Fiscal */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ipoStatus.requirements.solvenciaFiscalActive ? '✅' : '❌'}</span>
                      <div>
                        <strong>Solvencia Fiscal Oficial del SAR:</strong>
                        <div className="text-[10px] text-gray-500">
                          Debe estar formalmente emitida y sin obligaciones fiscales pendientes.
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${ipoStatus.requirements.solvenciaFiscalActive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {ipoStatus.requirements.solvenciaFiscalActive ? 'ACTIVA' : 'PENDIENTE'}
                    </span>
                  </div>

                  {/* Req 3: Consecutive Profitable Months */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {ipoStatus.requirements.consecutiveProfitableMonths >= ipoStatus.requirements.targetConsecutiveMonths ? '✅' : '❌'}
                      </span>
                      <div>
                        <strong>Récord de Rentabilidad Continua:</strong>
                        <div className="text-[10px] text-gray-500">
                          {ipoStatus.requirements.consecutiveProfitableMonths} de {ipoStatus.requirements.targetConsecutiveMonths} meses consecutivos con utilidades netas positivas.
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${ipoStatus.requirements.consecutiveProfitableMonths >= ipoStatus.requirements.targetConsecutiveMonths ? 'text-emerald-700' : 'text-red-700'}`}>
                      {ipoStatus.requirements.consecutiveProfitableMonths >= ipoStatus.requirements.targetConsecutiveMonths ? 'APROBADO' : 'EN PROGRESO'}
                    </span>
                  </div>

                  {/* Req 4: Net Equity */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ipoStatus.requirements.positiveNetEquity ? '✅' : '❌'}</span>
                      <div>
                        <strong>Patrimonio Neto Tangible Mayor a L 2,000,000:</strong>
                        <div className="text-[10px] text-gray-500">
                          Actual: L {valuationData.netEquityHNL.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold ${ipoStatus.requirements.positiveNetEquity ? 'text-emerald-700' : 'text-red-700'}`}>
                      {ipoStatus.requirements.positiveNetEquity ? 'SÓLIDO' : 'BAJO'}
                    </span>
                  </div>
                </div>

                {/* Launch Form */}
                <div className="mt-4 pt-3 border-t border-gray-300 flex flex-col md:flex-row items-center justify-between gap-3 bg-amber-50/60 p-3 border border-amber-200">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="font-bold text-xs">Ticker Bursátil:</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                      className="px-2 py-1 border-2 border-gray-500 font-mono font-bold text-sm uppercase w-24 text-center bg-white shadow-[inset_1px_1px_0px_#000]"
                    />
                  </div>

                  <button
                    onClick={handleLaunchIpo}
                    disabled={!ipoStatus.isEligible}
                    className={`w-full md:w-auto px-6 py-2.5 font-black text-sm uppercase font-mono tracking-wider border-2 border-yellow-700 shadow-[3px_3px_0px_#000] active:translate-y-0.5 flex items-center justify-center gap-2 ${
                      ipoStatus.isEligible
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black hover:brightness-110 cursor-pointer animate-pulse'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>🔔</span>
                    <span>Tocar Campana de Salida a Bolsa (IPO)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
