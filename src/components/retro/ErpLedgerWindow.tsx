import React, { useState } from 'react';
import { DailySimulationState, CommercialBankId, TransactionVoucher } from '../../game/retroSimTypes';
import { 
  createInitialErpCorporateState, 
  payErpSupplierInvoice, 
  openErpBranchOffice, 
  launchErpMarketingCampaign, 
  toggleErpWelfareProgram,
  calculateErpMonthlyTaxAudit
} from '../../game/erpCorporateEngine';
import { chargeCorporateCard, payCorporateCreditCard } from '../../game/commercialBanksEngine';
import { formatHNLAmount } from '../common/CustomAmountInput';
import { sound } from '../../game/audioFx';

interface ErpLedgerWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onViewVoucher?: (voucher: TransactionVoucher) => void;
}

export const ErpLedgerWindow: React.FC<ErpLedgerWindowProps> = ({
  state,
  onUpdateState,
  onViewVoucher
}) => {
  // Asegurar inicialización del estado ERP
  const erp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);

  const [activeTab, setActiveTab] = useState<'tarjetas' | 'cxp' | 'libro_mayor' | 'operaciones'>('cxp');

  // Filtro de Libro Mayor
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('ALL');

  // Formulario Pago de Factura de Proveedor
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(erp.supplierInvoices[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paySource, setPaySource] = useState<'checking' | 'cash'>('checking');

  // Formulario Tarjeta Corporativa
  const [selectedBankForCard, setSelectedBankForCard] = useState<CommercialBankId>('atlantida');
  const [cardChargeAmount, setCardChargeAmount] = useState<number>(8500);
  const [cardChargeConcept, setCardChargeConcept] = useState<string>('Compra de Suministros & Herramientas');
  const [cardPaymentAmount, setCardPaymentAmount] = useState<number>(5000);
  const [cardPaySource, setCardPaySource] = useState<'checking' | 'cash'>('checking');

  // Formulario Apertura de Sucursal
  const [newBranchName, setNewBranchName] = useState<string>('Sucursal Nor-Occidente');
  const [newBranchCity, setNewBranchCity] = useState<'Tegucigalpa' | 'San Pedro Sula' | 'La Ceiba' | 'Choluteca' | 'Comayagua' | 'Roatán'>('San Pedro Sula');
  const [newBranchStaff, setNewBranchStaff] = useState<number>(4);
  const [newBranchCost, setNewBranchCost] = useState<number>(650000);

  // Formulario Campaña Publicitaria
  const [marketingName, setMarketingName] = useState<string>('Campaña Estratégica Trimestral');
  const [marketingChannel, setMarketingChannel] = useState<'DIGITAL_ADS' | 'RADIO_PRENSA' | 'VALLAS_BTL' | 'PATROCINIO_DEPORTIVO'>('DIGITAL_ADS');
  const [marketingBudget, setMarketingBudget] = useState<number>(35000);

  // Modal / Vista de Auditoría Fiscal SAR de Fin de Mes
  const [showTaxAudit, setShowTaxAudit] = useState<boolean>(false);

  // Totales financieros consolidados
  const totalCxpPending = erp.supplierInvoices.reduce((sum, inv) => sum + inv.remainingAmountHNL, 0);
  const activeBranchesCount = erp.branches.length;
  const totalBranchDailySales = erp.branches.reduce((sum, b) => sum + b.dailySalesBoostHNL, 0);

  // Obtener tarjeta del banco seleccionado
  const bankRel = state.commercialBanks[selectedBankForCard];
  const corporateCard = bankRel?.corporateCard;
  const cardAvailable = corporateCard 
    ? (corporateCard.availableCredit ?? Math.max(0, corporateCard.creditLimit - corporateCard.currentBalance)) 
    : 0;

  // Filtrado de Libro Mayor
  const filteredLedger = ledgerCategoryFilter === 'ALL'
    ? erp.generalLedger
    : erp.generalLedger.filter(e => e.accountCategory === ledgerCategoryFilter);

  // Total Debe y Haber del Libro Mayor
  const totalDebit = erp.generalLedger.reduce((sum, e) => sum + e.debitHNL, 0);
  const totalCredit = erp.generalLedger.reduce((sum, e) => sum + e.creditHNL, 0);

  // Liquidación fiscal de fin de mes
  const taxAudit = calculateErpMonthlyTaxAudit(state);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Tira Superior de Estado ERP & Capital */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">📑</span>
          <div>
            <h3 className="font-black text-xs text-slate-900 uppercase">
              ERP CORPORATIVO & LIBRO MAYOR — {state.storeName}
            </h3>
            <span className="text-[10px] text-slate-600 block">
              Día {state.currentDay}, Mes {state.currentMonth}, Año {state.currentYear || 2026} · Partida Doble Auditada
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-white border px-2 py-0.5 rounded shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Bancos + Caja:</span>
            <strong className="text-blue-900">{formatHNLAmount(state.storeBankBalance + state.storeCash)}</strong>
          </div>
          <div className="bg-white border px-2 py-0.5 rounded shadow-2xs">
            <span className="text-[10px] text-slate-500 block">CXP Proveedores:</span>
            <strong className="text-rose-900">{formatHNLAmount(totalCxpPending)}</strong>
          </div>
          <div className="bg-white border px-2 py-0.5 rounded shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Sucursales Activas:</span>
            <strong className="text-emerald-900">{activeBranchesCount} sedes (+{formatHNLAmount(totalBranchDailySales)}/día)</strong>
          </div>
          <div className="bg-white border px-2 py-0.5 rounded shadow-2xs">
            <span className="text-[10px] text-slate-500 block">Moral / Marca:</span>
            <strong className="text-indigo-900">{erp.employeeMoraleScore}% / {erp.brandEquityScore} pts</strong>
          </div>
        </div>
      </div>

      {/* Barra de Pestañas de los 4 Pilares */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 pt-1.5 flex gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => { sound.playClick(); setActiveTab('cxp'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cxp'
              ? 'bg-white border-[#404040] text-slate-950 font-black shadow-xs'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>📦</span>
          <span>1. Cuentas por Pagar & Facturas ({erp.supplierInvoices.filter(i => i.status !== 'PAID').length})</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('tarjetas'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tarjetas'
              ? 'bg-white border-[#404040] text-slate-950 font-black shadow-xs'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>💳</span>
          <span>2. Tarjetas Corporativas</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('libro_mayor'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'libro_mayor'
              ? 'bg-white border-[#404040] text-slate-950 font-black shadow-xs'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>⚖️</span>
          <span>3. Libro Mayor & Contador</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('operaciones'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'operaciones'
              ? 'bg-white border-[#404040] text-slate-950 font-black shadow-xs'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>🏢</span>
          <span>4. Operaciones & Expansión</span>
        </button>
      </div>

      {/* Contenido Dinámico de las Pestañas */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-100 space-y-3 font-mono text-xs">
        {/* ========================================================= */}
        {/* PILAR 1: CUENTAS POR PAGAR & PROVEEDORES                  */}
        {/* ========================================================= */}
        {activeTab === 'cxp' && (
          <div className="space-y-3">
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2">
              <div className="flex justify-between items-center border-b pb-1 font-sans">
                <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                  <span>📦</span> Cartera de Facturas de Proveedores (Cuentas por Pagar)
                </h4>
                <span className="text-[11px] font-mono text-slate-600">
                  Total Pendiente: <strong className="text-rose-900">{formatHNLAmount(totalCxpPending)}</strong>
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-300">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-200 text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r">No. Factura</th>
                      <th className="p-1.5 border-r">Proveedor</th>
                      <th className="p-1.5 border-r">Concepto Comercial</th>
                      <th className="p-1.5 border-r">Vencimiento</th>
                      <th className="p-1.5 border-r text-right">Total Factura</th>
                      <th className="p-1.5 border-r text-right">Saldo Restante</th>
                      <th className="p-1.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {erp.supplierInvoices.map((inv) => (
                      <tr 
                        key={inv.id} 
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedInvoiceId === inv.id ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-1.5 border-r text-blue-900">{inv.invoiceNumber}</td>
                        <td className="p-1.5 border-r font-sans">{inv.supplierName}</td>
                        <td className="p-1.5 border-r font-sans text-slate-600 truncate max-w-xs">{inv.concept}</td>
                        <td className="p-1.5 border-r text-slate-600">{inv.dueDateStr}</td>
                        <td className="p-1.5 border-r text-right font-bold">{formatHNLAmount(inv.totalAmountHNL)}</td>
                        <td className="p-1.5 border-r text-right font-bold text-rose-900">
                          {formatHNLAmount(inv.remainingAmountHNL)}
                        </td>
                        <td className="p-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : inv.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detalle y Liquidación de Cuotas de la Factura Seleccionada */}
              {(() => {
                const inv = erp.supplierInvoices.find(i => i.id === selectedInvoiceId) || erp.supplierInvoices[0];
                if (!inv) return null;

                return (
                  <div className="bg-slate-50 border border-slate-300 p-2.5 space-y-2 mt-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                      <div>
                        <span className="font-bold text-slate-900 font-sans text-xs">
                          Cronograma de Cuotas — Factura {inv.invoiceNumber} ({inv.supplierName})
                        </span>
                        <p className="text-[10px] text-slate-500 font-sans">{inv.concept}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Total: {formatHNLAmount(inv.totalAmountHNL)} · Pagado: {formatHNLAmount(inv.paidAmountHNL)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {inv.installments.map((inst) => (
                        <div 
                          key={inst.installmentNumber}
                          className={`p-2 border rounded text-xs ${
                            inst.isPaid 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="flex justify-between font-bold">
                            <span>Cuota #{inst.installmentNumber}</span>
                            <span>{inst.isPaid ? '✅ PAGADA' : '⏳ PENDIENTE'}</span>
                          </div>
                          <div className="text-[11px] font-mono mt-1">
                            Monto: <strong>{formatHNLAmount(inst.amountHNL)}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {inst.isPaid ? `Saldada: ${inst.paidDateStr}` : `Vence: ${inst.dueDateStr}`}
                          </div>

                          {!inst.isPaid && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                const res = payErpSupplierInvoice(state, inv.id, inst.amountHNL, paySource);
                                onUpdateState(res.updatedState);
                                if (res.voucher && onViewVoucher) onViewVoucher(res.voucher);
                                alert(res.message);
                              }}
                              className="mt-2 w-full py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded cursor-pointer shadow-xs active:scale-95"
                            >
                              Pagar Cuota ({formatHNLAmount(inst.amountHNL)})
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Formulario de Pago al Contado o Abono Personalizado */}
                    {inv.remainingAmountHNL > 0 && (
                      <div className="border-t border-slate-200 pt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-700 font-sans">Origen Fondos:</span>
                          <select
                            value={paySource}
                            onChange={(e) => setPaySource(e.target.value as 'checking' | 'cash')}
                            className="p-1 border border-slate-300 bg-white text-xs font-semibold"
                          >
                            <option value="checking">Cuenta Corriente (L {state.storeBankBalance.toLocaleString()})</option>
                            <option value="cash">Caja Chica (L {state.storeCash.toLocaleString()})</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playApprovalStamp();
                              const res = payErpSupplierInvoice(state, inv.id, inv.remainingAmountHNL, paySource);
                              onUpdateState(res.updatedState);
                              if (res.voucher && onViewVoucher) onViewVoucher(res.voucher);
                              alert(res.message);
                            }}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            <span>💵</span>
                            <span>Liquidar Factura Total ({formatHNLAmount(inv.remainingAmountHNL)})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PILAR 2: TARJETAS CORPORATIVAS & CRÉDITO REVOLVENTE       */}
        {/* ========================================================= */}
        {activeTab === 'tarjetas' && (
          <div className="space-y-3">
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-3">
              <div className="flex justify-between items-center border-b pb-1 font-sans">
                <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                  <span>💳</span> Gestión de Tarjetas de Crédito Empresariales
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-bold">Banco Emisor:</span>
                  <select
                    value={selectedBankForCard}
                    onChange={(e) => setSelectedBankForCard(e.target.value as CommercialBankId)}
                    className="p-1 border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="atlantida">Banco Atlántida S.A.</option>
                    <option value="ficohsa">Banco Ficohsa S.A.</option>
                    <option value="bac">BAC Credomatic Honduras</option>
                    <option value="occidente">Banco de Occidente S.A.</option>
                  </select>
                </div>
              </div>

              {corporateCard ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 border border-slate-300 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Límite Autorizado:</span>
                      <strong className="text-blue-950 font-mono text-sm">{formatHNLAmount(corporateCard.creditLimit)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Saldo Deudor / Utilizado:</span>
                      <strong className="text-rose-900 font-mono text-sm">{formatHNLAmount(corporateCard.currentBalance)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cupo Disponible:</span>
                      <strong className="text-emerald-800 font-mono text-sm">{formatHNLAmount(cardAvailable)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cashback Acumulado:</span>
                      <strong className="text-amber-800 font-mono text-sm">{corporateCard.rewardPoints || 0} pts</strong>
                    </div>
                  </div>

                  {/* Consumos / Compras con Tarjeta */}
                  <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded space-y-2">
                    <h5 className="font-bold text-blue-950 text-xs font-sans">
                      Procesar Gasto / Compra con Tarjeta Corporativa:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 font-sans mb-0.5">Concepto:</label>
                        <input
                          type="text"
                          value={cardChargeConcept}
                          onChange={(e) => setCardChargeConcept(e.target.value)}
                          className="w-full p-1 border border-slate-300 bg-white font-sans text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 font-sans mb-0.5">Monto a Cargar (HNL):</label>
                        <input
                          type="number"
                          min={100}
                          max={cardAvailable}
                          step={500}
                          value={cardChargeAmount}
                          onChange={(e) => setCardChargeAmount(Number(e.target.value))}
                          className="w-full p-1 border border-slate-300 bg-white font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={cardAvailable <= 0 || cardChargeAmount <= 0 || cardChargeAmount > cardAvailable}
                      onClick={() => {
                        sound.playCashChime();
                        const res = chargeCorporateCard(state, selectedBankForCard, cardChargeAmount, cardChargeConcept);
                        if (res.success) {
                          onUpdateState(res.updatedState);
                          alert(res.message);
                        } else {
                          alert(res.message);
                        }
                      }}
                      className="w-full py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      Procesar Cargo a Tarjeta ({formatHNLAmount(cardChargeAmount)})
                    </button>
                  </div>

                  {/* Pagos y Restitución de Línea Revolvente */}
                  {corporateCard.currentBalance > 0 && (
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded space-y-2">
                      <div className="flex justify-between items-center font-sans">
                        <h5 className="font-bold text-emerald-950 text-xs">
                          Efectuar Pago / Restituir Línea de Crédito:
                        </h5>
                        <span className="text-[11px] font-mono text-rose-800 font-bold">
                          Deuda a liquidar: {formatHNLAmount(corporateCard.currentBalance)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playApprovalStamp();
                            const res = payCorporateCreditCard(state, selectedBankForCard, corporateCard.currentBalance, cardPaySource);
                            if (res.success) {
                              onUpdateState(res.updatedState);
                              alert(res.message);
                            } else {
                              alert(res.message);
                            }
                          }}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
                        >
                          Pago Total Deuda ({formatHNLAmount(corporateCard.currentBalance)})
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sound.playApprovalStamp();
                            const minPay = corporateCard.minPaymentMonthly || Math.round(corporateCard.currentBalance * 0.05);
                            const res = payCorporateCreditCard(state, selectedBankForCard, minPay, cardPaySource);
                            if (res.success) {
                              onUpdateState(res.updatedState);
                              alert(res.message);
                            } else {
                              alert(res.message);
                            }
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
                        >
                          Pago Mínimo 5% ({formatHNLAmount(corporateCard.minPaymentMonthly || Math.round(corporateCard.currentBalance * 0.05))})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-300 text-center space-y-1 font-sans">
                  <p className="text-slate-600 text-xs">
                    No mantienes tarjeta corporativa activa con este banco.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Abre la ventana del Banco para solicitar una tarjeta empresarial según tu categoría crediticia.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PILAR 3: LIBRO MAYOR & CONTADOR GENERAL                   */}
        {/* ========================================================= */}
        {activeTab === 'libro_mayor' && (
          <div className="space-y-3">
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2">
              <div className="flex flex-wrap justify-between items-center border-b pb-1 font-sans">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <span>⚖️</span> Libro Mayor General (General Ledger) & Asientos Contables
                  </h4>
                  <span className="text-[10px] text-slate-500 block">
                    Partida Doble: Total Débitos = L {totalDebit.toLocaleString()} · Total Créditos = L {totalCredit.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowTaxAudit(!showTaxAudit)}
                    className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
                  >
                    📋 Provisión Tributaria SAR
                  </button>
                </div>
              </div>

              {/* Panel Desplegable de Cálculo Tributario SAR */}
              {showTaxAudit && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-purple-200 pb-1 font-sans">
                    <strong className="text-purple-950 font-bold">
                      Dictamen Fiscal Mensual SAR (ISR 25% + Aportación Solidaria 5%)
                    </strong>
                    <span className="text-[10px] text-purple-700">Art. 22 Ley del ISR</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Facturación Bruta:</span>
                      <strong className="text-slate-900">{formatHNLAmount(taxAudit.grossSalesHNL)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Costos Deducibles:</span>
                      <strong className="text-slate-900">{formatHNLAmount(taxAudit.operatingCostsHNL + taxAudit.financialCostsHNL)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Renta Neta Gravable:</span>
                      <strong className="text-blue-900">{formatHNLAmount(taxAudit.netTaxableIncomeHNL)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Impuesto Total Liquidado:</span>
                      <strong className="text-purple-900">{formatHNLAmount(taxAudit.totalTaxLiabilityHNL)}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 font-sans italic bg-white p-2 border border-purple-100 rounded">
                    Observación de Auditoría: {taxAudit.auditObservations}
                  </p>
                </div>
              )}

              {/* Filtros por Categoría de Cuenta */}
              <div className="flex flex-wrap items-center gap-1 font-sans text-xs">
                <span className="text-slate-600 font-bold">Filtrar Cuentas:</span>
                {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'EXPENSE', 'REVENUE'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setLedgerCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      ledgerCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tabla de Asientos del Libro Mayor */}
              <div className="overflow-x-auto border border-slate-300 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-200 text-slate-700 border-b border-slate-300 sticky top-0">
                    <tr>
                      <th className="p-1.5 border-r">Asiento</th>
                      <th className="p-1.5 border-r">Fecha / Hora</th>
                      <th className="p-1.5 border-r">Cuenta</th>
                      <th className="p-1.5 border-r">Concepto / Glosa</th>
                      <th className="p-1.5 border-r">Autorizado Por</th>
                      <th className="p-1.5 border-r text-right">Debe (HNL)</th>
                      <th className="p-1.5 text-right">Haber (HNL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredLedger.map((entry) => (
                      <tr key={entry.entryId} className="hover:bg-slate-50">
                        <td className="p-1.5 border-r font-bold text-slate-800">{entry.entryId}</td>
                        <td className="p-1.5 border-r text-slate-500">{entry.timestampStr}</td>
                        <td className="p-1.5 border-r">
                          <span className="text-slate-500 text-[10px] block">{entry.accountCode}</span>
                          <span className="font-sans font-semibold text-slate-900">{entry.accountName}</span>
                        </td>
                        <td className="p-1.5 border-r font-sans text-slate-700 max-w-sm truncate">{entry.concept}</td>
                        <td className="p-1.5 border-r font-sans text-[10px] text-slate-600">{entry.authorizedByRole}</td>
                        <td className="p-1.5 border-r text-right font-bold text-slate-900">
                          {entry.debitHNL > 0 ? `L ${entry.debitHNL.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-1.5 text-right font-bold text-slate-900">
                          {entry.creditHNL > 0 ? `L ${entry.creditHNL.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PILAR 4: OPERACIONES & EXPANSIÓN EMPRESARIAL              */}
        {/* ========================================================= */}
        {activeTab === 'operaciones' && (
          <div className="space-y-3">
            {/* 1. Apertura de Sucursales */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-3">
              <div className="flex justify-between items-center border-b pb-1 font-sans">
                <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                  <span>🏢</span> Red de Sucursales & Expansión Territorial
                </h4>
                <span className="text-[11px] font-mono text-emerald-900 font-bold">
                  Sedes Activas: {erp.branches.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Lista de Sucursales Activas */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-slate-800 font-sans">Sedes en Operación:</h5>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {erp.branches.map((b) => (
                      <div key={b.branchId} className="p-2 border border-slate-300 bg-slate-50 rounded text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="font-sans text-slate-900">{b.name}</span>
                          <span className="text-emerald-900 font-mono">+{formatHNLAmount(b.dailySalesBoostHNL)}/día</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans flex justify-between">
                          <span>Ciudad: {b.city} · Dotación: {b.staffAssigned} colaboradores</span>
                          <span>Costo Operativo: {formatHNLAmount(b.monthlyOperatingCostHNL)}/mes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario Apertura de Nueva Sucursal */}
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded space-y-2 font-sans text-xs">
                  <h5 className="font-bold text-slate-900">Inaugurar Nueva Sucursal:</h5>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nombre de la Sede:</label>
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="w-full p-1 border border-slate-300 bg-white font-sans text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Plaza Geográfica:</label>
                      <select
                        value={newBranchCity}
                        onChange={(e) => setNewBranchCity(e.target.value as any)}
                        className="w-full p-1 border border-slate-300 bg-white font-sans text-xs font-semibold"
                      >
                        <option value="Tegucigalpa">Tegucigalpa</option>
                        <option value="San Pedro Sula">San Pedro Sula</option>
                        <option value="La Ceiba">La Ceiba</option>
                        <option value="Choluteca">Choluteca</option>
                        <option value="Comayagua">Comayagua</option>
                        <option value="Roatán">Roatán</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Colaboradores (Mín 2):</label>
                      <input
                        type="number"
                        min={2}
                        max={15}
                        value={newBranchStaff}
                        onChange={(e) => setNewBranchStaff(Math.max(2, Number(e.target.value)))}
                        className="w-full p-1 border border-slate-300 bg-white font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 font-mono">
                    Inversión de Instalación Requerida: <strong>{formatHNLAmount(newBranchCost)}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playApprovalStamp();
                      const res = openErpBranchOffice(state, {
                        name: newBranchName,
                        city: newBranchCity,
                        staffAssigned: newBranchStaff,
                        setupCostHNL: newBranchCost
                      });
                      if (res.success) {
                        onUpdateState(res.updatedState);
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded shadow-xs cursor-pointer active:scale-95"
                  >
                    Aperturar Sucursal ({formatHNLAmount(newBranchCost)})
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Publicidad, Mercadeo & Bienestar Laboral */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Campañas de Publicidad */}
              <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2 font-sans text-xs">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <span>📢</span> Campañas de Marketing & Marca
                  </h4>
                  <span className="font-mono text-blue-900 font-bold">
                    Reconocimiento: {erp.brandEquityScore}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nombre Campaña:</label>
                    <input
                      type="text"
                      value={marketingName}
                      onChange={(e) => setMarketingName(e.target.value)}
                      className="w-full p-1 border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Canal de Difusión:</label>
                      <select
                        value={marketingChannel}
                        onChange={(e) => setMarketingChannel(e.target.value as any)}
                        className="w-full p-1 border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="DIGITAL_ADS">Publicidad Digital (Meta / Google)</option>
                        <option value="RADIO_PRENSA">Radio Nacional & Prensa</option>
                        <option value="VALLAS_BTL">Vallas Exteriores & BTL</option>
                        <option value="PATROCINIO_DEPORTIVO">Patrocinio Deportivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Presupuesto (HNL):</label>
                      <input
                        type="number"
                        min={5000}
                        step={5000}
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(Number(e.target.value))}
                        className="w-full p-1 border border-slate-300 bg-white font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playCashChime();
                      const res = launchErpMarketingCampaign(state, {
                        name: marketingName,
                        channel: marketingChannel,
                        budgetHNL: marketingBudget
                      });
                      if (res.success) {
                        onUpdateState(res.updatedState);
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }}
                    className="w-full py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow-xs cursor-pointer active:scale-95"
                  >
                    Desplegar Campaña Publicitaria ({formatHNLAmount(marketingBudget)})
                  </button>
                </div>
              </div>

              {/* Bienestar & Eficiencia Laboral */}
              <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2 font-sans text-xs">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <span>👥</span> Moral & Bienestar Laboral
                  </h4>
                  <span className="font-mono text-emerald-900 font-bold">
                    Moral: {erp.employeeMoraleScore}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  {erp.staffWelfarePrograms.map((prog) => (
                    <div 
                      key={prog.id}
                      className={`p-2 border rounded flex justify-between items-center ${
                        prog.isActive ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-[11px]">{prog.title}</div>
                        <div className="text-[10px] text-slate-500">{prog.description}</div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                          Costo: {formatHNLAmount(prog.costMonthlyHNL)}/mes · Moral: +{prog.moraleBoostPct}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          const res = toggleErpWelfareProgram(state, prog.id);
                          if (res.success) {
                            onUpdateState(res.updatedState);
                            alert(res.message);
                          } else {
                            alert(res.message);
                          }
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                          prog.isActive 
                            ? 'bg-rose-700 hover:bg-rose-800 text-white' 
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {prog.isActive ? 'Pausar' : 'Activar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
