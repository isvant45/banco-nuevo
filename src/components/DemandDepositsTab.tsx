import React, { useState } from 'react';
import { 
  GameState, 
  DemandDepositAccount, 
  AchTransferTransaction, 
  CorporatePayrollBatch,
  BankingDivisionId 
} from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  ArrowLeftRight, 
  Users, 
  CreditCard, 
  CheckSquare, 
  Building2, 
  FileCheck, 
  Send, 
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface DemandDepositsTabProps {
  state: GameState;
  onExecuteAch: (params: {
    sourceAccountNumber: string;
    sourceClientName: string;
    destinationBank: 'Banco Atlántida' | 'Banco Ficohsa' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente' | 'Davivienda' | 'Promerica';
    destinationAccount: string;
    recipientName: string;
    amountHNL: number;
    referenceNote: string;
  }) => void;
  onProcessPayroll: (params: {
    companyName: string;
    companyAccountNumber?: string;
    employeeCount: number;
    totalPayrollAmountHNL: number;
    feePerEmployeeHNL?: number;
  }) => void;
}

export const DemandDepositsTab: React.FC<DemandDepositsTabProps> = ({
  state,
  onExecuteAch,
  onProcessPayroll
}) => {
  const demandAccounts = state.demandAccounts || [];
  const achTransactions = state.achTransactions || [];
  const payrollBatches = state.payrollBatches || [];

  const [activeSubTab, setActiveSubTab] = useState<'ach' | 'payroll' | 'accounts'>('ach');

  // Formulario ACH Pronto
  const [achSourceAcc, setAchSourceAcc] = useState<string>(demandAccounts[0]?.accountNumber || '1102-0501-0084-912');
  const [achDestBank, setAchDestBank] = useState<'Banco Atlántida' | 'Banco Ficohsa' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente' | 'Davivienda' | 'Promerica'>('Banco Ficohsa');
  const [achDestAcc, setAchDestAcc] = useState<string>('2001-9982-1402');
  const [achRecipient, setAchRecipient] = useState<string>('Distribuidora del Caribe S.A.');
  const [achAmount, setAchAmount] = useState<number>(50000);
  const [achNote, setAchNote] = useState<string>('Pago Factura Comercial');

  // Formulario de Nómina Masiva
  const [payrollCompany, setPayrollCompany] = useState<string>('Grupo Embotellador Sula');
  const [payrollEmployees, setPayrollEmployees] = useState<number>(350);
  const [payrollTotalAmount, setPayrollTotalAmount] = useState<number>(4550000);
  const [payrollFeeRate, setPayrollFeeRate] = useState<number>(20.0); // L. 20 por colaborador

  // Métricas
  const totalDemandBalance = demandAccounts.reduce((acc, a) => acc + a.availableBalanceHNL, 0);
  const totalAchVolume = achTransactions.reduce((acc, tx) => acc + tx.amountHNL, 0);
  const totalPayrollFeesCollected = payrollBatches.reduce((acc, b) => acc + b.totalFeeCollectedHNL, 0);

  const handleAchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achRecipient.trim() || achAmount <= 0) return;
    sound.playApprovalStamp();
    const sourceAccObj = demandAccounts.find(a => a.accountNumber === achSourceAcc);
    onExecuteAch({
      sourceAccountNumber: achSourceAcc,
      sourceClientName: sourceAccObj?.clientName || 'Cliente Áureo Bank',
      destinationBank: achDestBank,
      destinationAccount: achDestAcc,
      recipientName: achRecipient,
      amountHNL: achAmount,
      referenceNote: achNote
    });
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollCompany.trim() || payrollEmployees <= 0) return;
    sound.playApprovalStamp();
    onProcessPayroll({
      companyName: payrollCompany,
      employeeCount: payrollEmployees,
      totalPayrollAmountHNL: payrollTotalAmount,
      feePerEmployeeHNL: payrollFeeRate
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Cuentas a la Vista & Medios de Pago · Switch CEPROBAN
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Benchmark: Banpaís BP Pagos & BAC Conexión Empresarial</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ArrowLeftRight className="w-6 h-6 text-blue-400" />
              Cuentas Vista, ACH Pronto & Dispersión de Nómina
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Cuentas corrientes comerciales con control de cheques, transferencias interbancarias inmediatas vía el switch 
              <strong className="text-blue-300"> ACH Pronto (CEPROBAN)</strong> con tarifa regulada de <strong className="text-emerald-400">L. 20.00</strong> y 
              módulo de dispersión masiva de planillas corporativas con comisión de <strong className="text-amber-300">L. 18.00 a L. 22.00</strong> por empleado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('ach')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                activeSubTab === 'ach'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ACH Pronto (L. 20)
            </button>
            <button
              onClick={() => setActiveSubTab('payroll')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                activeSubTab === 'payroll'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Dispersión Planillas
            </button>
            <button
              onClick={() => setActiveSubTab('accounts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                activeSubTab === 'accounts'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cuentas Corrientes
            </button>
          </div>
        </div>

        {/* Métricas Agregadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Saldo en Cuentas Vista</div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
              {formatHNL(totalDemandBalance)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {demandAccounts.length} cuentas operativas
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Volumen ACH Liquidado</div>
            <div className="text-lg font-bold font-mono tabular-nums text-blue-400 mt-0.5">
              {formatHNL(totalAchVolume)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {achTransactions.length} transferencias CEPROBAN
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Tarifa Unitaria ACH</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              L. 20.00 Flat
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Tarifa regulada por transacción
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Comisiones de Nómina Cobradas</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {formatHNL(totalPayrollFeesCollected)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {payrollBatches.length} lotes de planillas procesados
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: TRANSFERENCIAS ACH PRONTO */}
      {activeSubTab === 'ach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Nueva Transferencia Interbancaria ACH Pronto
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cámara Electrónica de Compensación CEPROBAN con acreditación inmediata.
              </p>
            </div>

            <form onSubmit={handleAchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cuenta de Origen (Áureo Bank)
                </label>
                <select
                  value={achSourceAcc}
                  onChange={(e) => setAchSourceAcc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  {demandAccounts.map(a => (
                    <option key={a.id} value={a.accountNumber}>
                      {a.accountNumber} · {a.clientName} ({formatHNL(a.availableBalanceHNL)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Banco Destino
                  </label>
                  <select
                    value={achDestBank}
                    onChange={(e) => setAchDestBank(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Banco Ficohsa">Banco Ficohsa</option>
                    <option value="Banco Atlántida">Banco Atlántida</option>
                    <option value="BAC Credomatic">BAC Credomatic</option>
                    <option value="Banpaís">Banpaís</option>
                    <option value="Banco de Occidente">Banco de Occidente</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="Promerica">Promerica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número de Cuenta Destino
                  </label>
                  <input
                    type="text"
                    value={achDestAcc}
                    onChange={(e) => setAchDestAcc(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del Beneficiario
                </label>
                <input
                  type="text"
                  value={achRecipient}
                  onChange={(e) => setAchRecipient(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monto a Transferir (HNL)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="10"
                    value={achAmount}
                    onChange={(e) => setAchAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Comisión ACH (Tarifa Regulada)
                  </label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400">
                    L. 20.00
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motivo / Concepto
                </label>
                <input
                  type="text"
                  value={achNote}
                  onChange={(e) => setAchNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Liquidar Transferencia ACH Pronto
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Registro de Transacciones ACH Pronto CEPROBAN
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Liquidación en tiempo real con bancos del sistema hondureño.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{achTransactions.length} registros</span>
            </div>

            <div className="space-y-2.5">
              {achTransactions.map(tx => (
                <div key={tx.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400">{tx.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-semibold text-white">{tx.recipientName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] text-amber-300 font-mono">{tx.destinationBank}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>Cuenta: {tx.destinationAccount}</span>
                      <span className="text-slate-600"> · </span>
                      <span>Concepto: {tx.referenceNote}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      {formatHNL(tx.amountHNL)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Comisión: L. {tx.commissionFeeHNL.toFixed(2)} · {tx.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DISPERSIÓN DE PLANILLAS Y NÓMINAS */}
      {activeSubTab === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Procesar Dispersión de Nómina Empresarial
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acreditación masiva a cuentas de empleados con cobro de comisión por colaborador.
              </p>
            </div>

            <form onSubmit={handlePayrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Empresa Ordenante
                </label>
                <input
                  type="text"
                  value={payrollCompany}
                  onChange={(e) => setPayrollCompany(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número de Colaboradores
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={payrollEmployees}
                    onChange={(e) => setPayrollEmployees(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tarifa por Empleado (HNL)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="25"
                    value={payrollFeeRate}
                    onChange={(e) => setPayrollFeeRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Rango mercado: L. 18.00 - L. 22.00
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monto Total de la Planilla (HNL)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="10000"
                  value={payrollTotalAmount}
                  onChange={(e) => setPayrollTotalAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Comisión Total a Cobrar:</span>
                  <span className="text-amber-300 font-bold">{formatHNL(payrollEmployees * payrollFeeRate)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Promedio por Empleado:</span>
                  <span className="text-slate-200">{formatHNL(payrollTotalAmount / payrollEmployees)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dispersar Nómina y Facturar Comisión
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Historial de Lotes de Nómina Procesados
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Convenios corporativos de Cash Management y dispersión de salarios.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{payrollBatches.length} lotes</span>
            </div>

            <div className="space-y-2.5">
              {payrollBatches.map(batch => (
                <div key={batch.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-emerald-400">{batch.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-semibold text-white">{batch.companyName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>{batch.employeeCount.toLocaleString()} colaboradores</span>
                      <span className="text-slate-600"> · </span>
                      <span>Tarifa: L. {batch.feePerEmployeeHNL.toFixed(2)}/colaborador</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-white">
                      {formatHNL(batch.totalPayrollAmountHNL)}
                    </div>
                    <div className="text-[11px] font-mono text-amber-300 font-semibold mt-0.5">
                      Ingreso Banco: +{formatHNL(batch.totalFeeCollectedHNL)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CUENTAS CORRIENTES Y CHEQUERAS */}
      {activeSubTab === 'accounts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                Libro Mayor de Cuentas Corrientes & Chequeras Comerciales
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Custodia de depósitos a la vista, control de cheques emitidos y líneas de sobregiro contratadas.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{demandAccounts.length} cuentas registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">N° Cuenta</th>
                  <th className="py-2.5 px-3">Titular / Empresa</th>
                  <th className="py-2.5 px-3">Banca</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 text-right">Saldo Disponible</th>
                  <th className="py-2.5 px-3 text-right">Línea Sobregiro</th>
                  <th className="py-2.5 px-3 text-right">Cheques Emitidos</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {demandAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-amber-400">{acc.accountNumber}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-white">{acc.clientName}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-400 text-[11px]">{acc.division}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {acc.type === 'cuenta_corriente' ? 'Corriente / Cheques' : 'Ahorro Rendimiento'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      {formatHNL(acc.availableBalanceHNL)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-300 tabular-nums">
                      {formatHNL(acc.overdraftLimitHNL)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                      {acc.checksIssuedCount}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-400 font-semibold text-[11px]">ACTIVA</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
