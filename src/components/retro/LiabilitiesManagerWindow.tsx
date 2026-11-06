import React, { useState } from 'react';
import { DailySimulationState, CommercialBankId } from '../../game/retroSimTypes';
import { 
  COMMERCIAL_BANKS_PROFILES,
  makeExtraordinaryLoanPaymentWithOptions,
  paySupplierInvoice 
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface LiabilitiesManagerWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
}

export const LiabilitiesManagerWindow: React.FC<LiabilitiesManagerWindowProps> = ({
  state,
  onUpdateState
}) => {
  const [activeTab, setActiveTab] = useState<'obligaciones' | 'abono_extraordinario' | 'proyeccion'>('obligaciones');
  
  // Formulario de Abono Extraordinario
  const [selectedBankForAbono, setSelectedBankForAbono] = useState<CommercialBankId>('atlantida');
  const [abonoAmount, setAbonoAmount] = useState<number>(50000);
  const [abonoStrategy, setAbonoStrategy] = useState<'reducir_cuota' | 'reducir_plazo'>('reducir_plazo');

  const formatHNL = (amount: number) => `L ${Math.round(amount).toLocaleString()}`;

  // Recolectar todas las deudas activas
  const activeLoansList = Object.entries(state.commercialBanks || {})
    .filter(([_, rel]) => rel?.activeLoan && rel.activeLoan.balanceRemaining > 0)
    .map(([bankId, rel]) => ({
      bankId: bankId as CommercialBankId,
      loan: rel.activeLoan!
    }));

  const activeCardsList = Object.entries(state.commercialBanks || {})
    .filter(([_, rel]) => rel?.corporateCard && rel.corporateCard.currentBalance > 0)
    .map(([bankId, rel]) => ({
      bankId: bankId as CommercialBankId,
      card: rel.corporateCard!
    }));

  const supplierPayables = (state.supplierCredits || []).filter(c => !c.isPaid);

  const totalDebtHNL = activeLoansList.reduce((sum, item) => sum + item.loan.balanceRemaining, 0)
    + activeCardsList.reduce((sum, item) => sum + item.card.currentBalance, 0)
    + supplierPayables.reduce((sum, item) => sum + item.amountHNL, 0)
    + (state.sarTaxRecord?.isPaid ? 0 : (state.sarTaxRecord?.isrTaxAmount || 0));

  const handleExecuteAbono = () => {
    sound.playClick();
    const res = makeExtraordinaryLoanPaymentWithOptions(state, selectedBankForAbono, abonoAmount, abonoStrategy);
    if (res.success) {
      sound.playApprovalStamp();
      alert(res.message);
      onUpdateState(res.updatedState);
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handlePaySupplier = (invId: string) => {
    sound.playClick();
    const res = paySupplierInvoice(state, invId);
    if (res.success) {
      sound.playApprovalStamp();
      alert(res.message);
      onUpdateState(res.updatedState);
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const toggleAutoDebit = () => {
    sound.playClick();
    const newVal = !state.autoDebitEnabled;
    onUpdateState({
      ...state,
      autoDebitEnabled: newVal
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Pestañas Retro */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1.5 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { sound.playClick(); setActiveTab('obligaciones'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'obligaciones'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>📑</span>
            <span>Centro de Obligaciones</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('abono_extraordinario'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'abono_extraordinario'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>💰</span>
            <span>Abono Extraordinario (Ahorro de Intereses)</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('proyeccion'); }}
            className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'proyeccion'
                ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
            }`}
          >
            <span>📈</span>
            <span>Proyección de Liquidez</span>
          </button>
        </div>

        {/* HUD Total Deuda */}
        <div className="bg-rose-100 text-rose-950 border border-rose-300 px-2 py-0.5 font-mono text-[11px] font-bold flex items-center gap-1.5">
          <span>Pasivos Totales:</span>
          <strong>{formatHNL(totalDebtHNL)}</strong>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-50 font-mono text-xs">
        {/* ========================================================= */}
        {/* TAB 1: OBLIGACIONES Y CALENDARIO                         */}
        {/* ========================================================= */}
        {activeTab === 'obligaciones' && (
          <div className="space-y-4">
            {/* Barra de Configuración de Débito Automático */}
            <div className="bg-white border-2 border-[#808080] p-2 flex items-center justify-between">
              <div>
                <span className="font-sans font-bold text-slate-900 block">DÉBITO AUTOMÁTICO BANCARIO:</span>
                <span className="font-sans text-[11px] text-slate-600">
                  {state.autoDebitEnabled 
                    ? 'Activado: Las cuotas de préstamos se debitarán automáticamente de tu cuenta corriente el día de corte evitando morosidad.' 
                    : 'Desactivado: Debes efectuar el pago manual en ventanilla antes de la fecha de vencimiento.'}
                </span>
              </div>
              <button
                onClick={toggleAutoDebit}
                className={`px-3 py-1 font-sans font-bold text-xs border-2 cursor-pointer shadow-sm ${
                  state.autoDebitEnabled
                    ? 'bg-emerald-600 text-white border-emerald-800'
                    : 'bg-slate-200 text-slate-800 border-slate-400 hover:bg-slate-300'
                }`}
              >
                {state.autoDebitEnabled ? '✅ ACTIVO' : '⭕ ACTIVAR DÉBITO AUTO'}
              </button>
            </div>

            {/* Préstamos Comerciales Vigentes */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
              <h4 className="font-sans font-bold text-slate-900 mb-2 border-b pb-1 flex justify-between">
                <span>PRÉSTAMOS Y FACILIDADES A PLAZO</span>
                <span className="text-slate-600">{activeLoansList.length} Créditos Activos</span>
              </h4>

              {activeLoansList.length === 0 ? (
                <p className="text-slate-500 italic py-2 font-sans">No tienes préstamos comerciales activos en este momento.</p>
              ) : (
                <div className="space-y-2">
                  {activeLoansList.map(({ bankId, loan }) => {
                    const bank = COMMERCIAL_BANKS_PROFILES[bankId];
                    return (
                      <div key={loan.id} className="border border-slate-300 p-2.5 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-blue-900">{bank.logo} {bank.name}</span>
                            <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 border border-blue-300 font-sans font-bold">
                              {loan.loanType ? loan.loanType.toUpperCase() : 'COMERCIAL'}
                            </span>
                            {loan.isRestructured && (
                              <span className="bg-purple-100 text-purple-900 text-[10px] px-1.5 py-0.2 border border-purple-300 font-sans font-bold">
                                REESTRUCTURADO
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            Saldo Deudor: <strong className="text-rose-900">{formatHNL(loan.balanceRemaining)}</strong> | Cuota Mensual: <strong>{formatHNL(loan.monthlyPayment)}</strong> | Tasa: <strong>{loan.interestRateAnnual}% APR</strong>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Plazo Restante: {loan.termMonthsRemaining} meses | Destino: {loan.purpose}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBankForAbono(bankId);
                            setActiveTab('abono_extraordinario');
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold text-xs border border-amber-700 shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Abonar a Capital 💰
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tarjetas Corporativas */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
              <h4 className="font-sans font-bold text-slate-900 mb-2 border-b pb-1 flex justify-between">
                <span>TARJETAS DE CRÉDITO CORPORATIVAS</span>
                <span className="text-slate-600">{activeCardsList.length} Tarjetas con Saldo</span>
              </h4>

              {activeCardsList.length === 0 ? (
                <p className="text-slate-500 italic py-2 font-sans">No mantienes saldos adeudados en tarjetas de crédito.</p>
              ) : (
                <div className="space-y-2">
                  {activeCardsList.map(({ bankId, card }) => (
                    <div key={card.cardId} className="border border-slate-300 p-2.5 bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="font-sans font-bold text-slate-900">{card.brand}</div>
                        <div className="text-[11px] text-slate-600">
                          Saldo al Corte: <strong className="text-rose-900">{formatHNL(card.currentBalance)}</strong> | Pago Mínimo: <strong>{formatHNL(card.minPaymentMonthly)}</strong> | Tasa: {card.interestRateAnnual}%
                        </div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-emerald-700 font-bold">Puntos: {card.rewardPoints || 0} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cuentas por Pagar a Proveedores */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner">
              <h4 className="font-sans font-bold text-slate-900 mb-2 border-b pb-1 flex justify-between">
                <span>CUENTAS POR PAGAR A PROVEEDORES (CRÉDITO 30 DÍAS)</span>
                <span className="text-slate-600">{supplierPayables.length} Facturas Pendientes</span>
              </h4>

              {supplierPayables.length === 0 ? (
                <p className="text-slate-500 italic py-2 font-sans">Al día con todos los proveedores comerciales. Sin facturas pendientes.</p>
              ) : (
                <div className="space-y-2">
                  {supplierPayables.map((inv) => (
                    <div key={inv.id} className="border border-slate-300 p-2.5 bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="font-sans font-bold text-slate-900">
                          {inv.supplierName} — Factura #{inv.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Monto: <strong className="text-rose-900">{formatHNL(inv.amountHNL)}</strong> | Vence el Día {inv.dueDay} (Día actual: {state.currentDay})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Concepto: {inv.concept}
                        </div>
                      </div>

                      <button
                        onClick={() => handlePaySupplier(inv.id)}
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-sans font-bold text-xs border border-blue-900 shadow-sm cursor-pointer"
                      >
                        Pagar Factura 💳
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ABONO EXTRAORDINARIO CON ELECCIÓN                   */}
        {/* ========================================================= */}
        {activeTab === 'abono_extraordinario' && (
          <div className="max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase">
                AMORTIZACIÓN EXTRAORDINARIA A CAPITAL DE PRÉSTAMO
              </h3>
              <p className="font-sans text-[11px] text-slate-600">
                Abona directamente al capital insoluto de tu préstamo comercial y elige la estrategia financiera que mejor convenga a tu empresa.
              </p>
            </div>

            {activeLoansList.length === 0 ? (
              <p className="text-slate-500 italic py-4 font-sans">No tienes préstamos comerciales vigentes para amortizar.</p>
            ) : (
              <div className="space-y-4">
                {/* Selector de Banco */}
                <div>
                  <label className="block font-sans font-bold text-slate-700 mb-1">Seleccionar Crédito a Amortizar:</label>
                  <select
                    value={selectedBankForAbono}
                    onChange={(e) => setSelectedBankForAbono(e.target.value as CommercialBankId)}
                    className="w-full p-1.5 border border-slate-400 bg-white font-sans font-bold text-xs"
                  >
                    {activeLoansList.map(({ bankId, loan }) => {
                      const bank = COMMERCIAL_BANKS_PROFILES[bankId];
                      return (
                        <option key={bankId} value={bankId}>
                          {bank.name} — Saldo: {formatHNL(loan.balanceRemaining)} | Cuota: {formatHNL(loan.monthlyPayment)}/mes
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Monto a Amortizar */}
                <div>
                  <label className="block font-sans font-bold text-slate-700 mb-1">Monto de Capital a Amortizar (HNL):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step={10000}
                      min={5000}
                      value={abonoAmount}
                      onChange={(e) => setAbonoAmount(Math.max(1000, Number(e.target.value)))}
                      className="flex-1 p-1.5 border border-slate-400 bg-white font-mono font-bold text-xs"
                    />
                    <button
                      onClick={() => setAbonoAmount(25000)}
                      className="px-2 py-1 bg-slate-200 border border-slate-400 hover:bg-slate-300 font-sans text-xs"
                    >
                      L 25k
                    </button>
                    <button
                      onClick={() => setAbonoAmount(50000)}
                      className="px-2 py-1 bg-slate-200 border border-slate-400 hover:bg-slate-300 font-sans text-xs"
                    >
                      L 50k
                    </button>
                    <button
                      onClick={() => setAbonoAmount(100000)}
                      className="px-2 py-1 bg-slate-200 border border-slate-400 hover:bg-slate-300 font-sans text-xs"
                    >
                      L 100k
                    </button>
                  </div>
                </div>

                {/* Estrategia de Amortización: Reducir Plazo vs Reducir Cuota */}
                <div className="border border-slate-300 p-3 bg-slate-50 space-y-2">
                  <span className="block font-sans font-black text-slate-900 text-xs">
                    SELECCIONAR DESTINO DEL ABONO EXTRAORDINARIO:
                  </span>

                  <label className="flex items-start gap-2 p-2 border cursor-pointer bg-white hover:bg-blue-50">
                    <input
                      type="radio"
                      name="strategy"
                      checked={abonoStrategy === 'reducir_plazo'}
                      onChange={() => setAbonoStrategy('reducir_plazo')}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-blue-900 font-sans block">OPCIÓN A: REDUCIR PLAZO (Ahorro Máximo de Intereses)</strong>
                      <span className="font-sans text-[11px] text-slate-600">
                        La cuota mensual se mantiene idéntica. Se acorta el número de meses restantes, logrando el mayor ahorro financiero posible al no pagar intereses durante los meses eliminados.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 border cursor-pointer bg-white hover:bg-blue-50">
                    <input
                      type="radio"
                      name="strategy"
                      checked={abonoStrategy === 'reducir_cuota'}
                      onChange={() => setAbonoStrategy('reducir_cuota')}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-emerald-900 font-sans block">OPCIÓN B: REDUCIR CUOTA MENSUAL (Alivio de Flujo de Caja)</strong>
                      <span className="font-sans text-[11px] text-slate-600">
                        El plazo del crédito se mantiene igual. La cuota mensual disminuye inmediatamente, otorgándole mayor holgura y flujo libre de caja a la empresa cada 30 días.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Botón de Ejecución */}
                <button
                  onClick={handleExecuteAbono}
                  className="w-full p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-black text-xs border border-emerald-900 shadow-md cursor-pointer"
                >
                  Confirmar Abono Extraordinario de {formatHNL(abonoAmount)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PROYECCIÓN DE LIQUIDEZ Y PAGOS                      */}
        {/* ========================================================= */}
        {activeTab === 'proyeccion' && (
          <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase">
                PROYECCIÓN DE COMPROMISOS FINANCIEROS Y FLUJO DISPONIBLE
              </h3>
              <p className="font-sans text-[11px] text-slate-600">
                Anticipación de liquidez para los próximos 30, 60 y 90 días evaluando si el flujo del negocio cubrirá el servicio de la deuda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-slate-300 p-2.5 bg-slate-50">
                <h4 className="font-sans font-bold text-slate-900 border-b pb-1 mb-2">PRÓXIMOS 30 DÍAS</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Ventas Proyectadas:</span>
                    <strong className="text-emerald-700">{formatHNL((state.monthlySalesAccumulated || 350000))}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuotas Préstamos:</span>
                    <span className="text-rose-700">-{formatHNL(activeLoansList.reduce((s, l) => s + l.loan.monthlyPayment, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proveedores:</span>
                    <span className="text-rose-700">-{formatHNL(supplierPayables.reduce((s, p) => s + p.amountHNL, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planillas y Local:</span>
                    <span className="text-rose-700">-{formatHNL(((state.dailyWages || 1200) + (state.dailyRent || 500)) * 30)}</span>
                  </div>
                  <div className="border-t pt-1 font-bold flex justify-between text-blue-900">
                    <span>Flujo Neto Estimado:</span>
                    <span>{formatHNL((state.monthlySalesAccumulated || 350000) * 0.22)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 p-2.5 bg-slate-50">
                <h4 className="font-sans font-bold text-slate-900 border-b pb-1 mb-2">PRÓXIMOS 60 DÍAS</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Ventas Proyectadas:</span>
                    <strong className="text-emerald-700">{formatHNL((state.monthlySalesAccumulated || 350000) * 2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Compromisos Totales:</span>
                    <span className="text-rose-700">-{formatHNL(activeLoansList.reduce((s, l) => s + l.loan.monthlyPayment * 2, 0))}</span>
                  </div>
                  <div className="border-t pt-1 font-bold flex justify-between text-blue-900">
                    <span>Superávit Acumulado:</span>
                    <span>{formatHNL((state.monthlySalesAccumulated || 350000) * 0.44)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 p-2.5 bg-slate-50">
                <h4 className="font-sans font-bold text-slate-900 border-b pb-1 mb-2">PRÓXIMOS 90 DÍAS</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Ventas Proyectadas:</span>
                    <strong className="text-emerald-700">{formatHNL((state.monthlySalesAccumulated || 350000) * 3)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Compromisos Totales:</span>
                    <span className="text-rose-700">-{formatHNL(activeLoansList.reduce((s, l) => s + l.loan.monthlyPayment * 3, 0))}</span>
                  </div>
                  <div className="border-t pt-1 font-bold flex justify-between text-blue-900">
                    <span>Superávit Acumulado:</span>
                    <span>{formatHNL((state.monthlySalesAccumulated || 350000) * 0.66)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
