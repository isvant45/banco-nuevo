import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  Landmark, 
  TrendingUp, 
  Zap, 
  X, 
  Layers, 
  Percent, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { GameState, BankingDivisionId, BankDivisionConfig } from '../game/types';
import { BulkAllocationParams } from '../game/economyEngine';
import { sound } from '../game/audioFx';

interface BulkPortfolioAllocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state?: GameState;
  division?: BankDivisionConfig;
  selectedDivisionId?: BankingDivisionId;
  onApplyAllocation?: (params: BulkAllocationParams) => void;
  onApplyBulkAllocation?: (params: BulkAllocationParams) => void;
}

export const BulkPortfolioAllocatorModal: React.FC<BulkPortfolioAllocatorModalProps> = ({
  isOpen,
  onClose,
  state,
  division: divisionProp,
  selectedDivisionId = 'personas',
  onApplyAllocation,
  onApplyBulkAllocation
}) => {
  const targetInitialDivId = divisionProp?.id || selectedDivisionId || 'personas';
  const [division, setDivision] = useState<BankingDivisionId>(targetInitialDivId);
  const currentDiv: Partial<BankDivisionConfig> = divisionProp || (state?.divisions ? state.divisions[division] : null) || {
    id: division,
    name: 'Banca Minorista & Patrimonial',
    clientCount: 18450,
    totalDeposits: 680000000,
    totalLoans: 520000000,
    avgLendingRate: 22.0
  };

  const totalDeps = currentDiv.totalDeposits || 0;
  const countClients = currentDiv.clientCount || 18450;
  const totalLns = currentDiv.totalLoans || 0;

  // Estados de entrada con valores por defecto contextuales de la división
  const [depositHolders, setDepositHolders] = useState<number | string>(
    currentDiv.customDepositHolders || countClients
  );
  const [avgDeposit, setAvgDeposit] = useState<number | string>(
    currentDiv.customAvgDepositHNL || Math.round(totalDeps / Math.max(1, countClients)) || 25000
  );

  const [loanBorrowers, setLoanBorrowers] = useState<number | string>(
    currentDiv.customLoanBorrowers || Math.round(countClients * 0.42) || 7500
  );
  const [avgLoan, setAvgLoan] = useState<number | string>(
    currentDiv.customAvgLoanHNL || Math.round(totalLns / Math.max(1, Math.round(countClients * 0.42))) || 85000
  );

  const [loanRate, setLoanRate] = useState<number | string>(currentDiv.avgLendingRate || 18.5);
  const [loanMonths, setLoanMonths] = useState<number | string>(36);

  if (!isOpen) return null;

  const numDepositHolders = typeof depositHolders === 'number' ? depositHolders : (parseFloat(String(depositHolders)) || 0);
  const numAvgDeposit = typeof avgDeposit === 'number' ? avgDeposit : (parseFloat(String(avgDeposit)) || 0);
  const numLoanBorrowers = typeof loanBorrowers === 'number' ? loanBorrowers : (parseFloat(String(loanBorrowers)) || 0);
  const numAvgLoan = typeof avgLoan === 'number' ? avgLoan : (parseFloat(String(avgLoan)) || 0);
  const numLoanRate = typeof loanRate === 'number' ? loanRate : (parseFloat(String(loanRate)) || 18.5);
  const numLoanMonths = typeof loanMonths === 'number' ? loanMonths : (parseInt(String(loanMonths), 10) || 36);

  const projectedTotalDeposits = Math.round(numDepositHolders * numAvgDeposit);
  const projectedTotalLoans = Math.round(numLoanBorrowers * numAvgLoan);

  const depositDelta = projectedTotalDeposits - (currentDiv.totalDeposits || 0);
  const loanDelta = projectedTotalLoans - (currentDiv.totalLoans || 0);
  const netCashDelta = depositDelta - loanDelta;

  const handleDivisionChange = (divId: BankingDivisionId) => {
    sound.playClick();
    setDivision(divId);
    const div = state?.divisions?.[divId];
    if (div) {
      setDepositHolders(div.customDepositHolders || div.clientCount);
      setAvgDeposit(div.customAvgDepositHNL || Math.round(div.totalDeposits / Math.max(1, div.clientCount)));
      setLoanBorrowers(div.customLoanBorrowers || Math.round(div.clientCount * 0.4));
      setAvgLoan(div.customAvgLoanHNL || Math.round(div.totalLoans / Math.max(1, Math.round(div.clientCount * 0.4))));
      setLoanRate(div.avgLendingRate || 18);
    }
  };

  const handleApplyPreset = (
    holders: number,
    deposit: number,
    borrowers: number,
    loan: number,
    rate: number,
    months: number
  ) => {
    sound.playClick();
    setDepositHolders(holders);
    setAvgDeposit(deposit);
    setLoanBorrowers(borrowers);
    setAvgLoan(loan);
    setLoanRate(rate);
    setLoanMonths(months);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    const params: BulkAllocationParams = {
      divisionId: division,
      clientCount: Math.max(numDepositHolders, numLoanBorrowers, currentDiv.clientCount || 100),
      depositHoldersCount: numDepositHolders,
      avgDepositHNL: numAvgDeposit,
      loanBorrowersCount: numLoanBorrowers,
      avgLoanHNL: numAvgLoan,
      loanRateAnnualPct: numLoanRate,
      loanTermMonths: numLoanMonths
    };

    if (onApplyBulkAllocation) {
      onApplyBulkAllocation(params);
    } else if (onApplyAllocation) {
      onApplyAllocation(params);
    }
    onClose();
  };

  const formatHNL = (val: number) => {
    return `L. ${val.toLocaleString('es-HN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Configurador Masivo de Cartera & Demografía
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  EN BLOQUE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Define en masa cuántas personas tienen qué monto en depósitos y préstamos sin editar expediente por expediente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con scroll */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Selector de Banca Objetivo */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>1. Seleccionar Banca a Calibrar:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'personas', label: 'Banca Personas (Retail)', count: state?.divisions?.personas?.clientCount || 18450 },
                { id: 'pyme', label: 'Banca PYME', count: state?.divisions?.pyme?.clientCount || 4200 },
                { id: 'premier', label: 'Banca Premier', count: state?.divisions?.premier?.clientCount || 1420 },
                { id: 'corporativa', label: 'Banca Corporativa', count: state?.divisions?.corporativa?.clientCount || 48 },
                { id: 'privada', label: 'Banca Privada', count: state?.divisions?.privada?.clientCount || 195 }
              ].map(d => {
                const isSelected = division === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleDivisionChange(d.id as BankingDivisionId)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{d.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{d.count.toLocaleString()} clientes</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plantillas Rápidas Preconfiguradas */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">
              Plantillas Rápidas Recomendadas:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(18000, 25000, 6500, 75000, 18.5, 36)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Retail Masivo (18k / L.25k dep. / L.75k créd.)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(4200, 180000, 2600, 350000, 15.0, 48)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>PYME Comercial (4.2k / L.180k dep. / L.350k créd.)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1850, 950000, 850, 1500000, 13.5, 60)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Premier Exclusivo (1.8k / L.950k dep. / L.1.5M créd.)</span>
              </button>
            </div>
          </div>

          {/* Bloque 2: Configuración de Depósitos y Ahorros */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Wallet className="w-4 h-4" />
                <span>2. Depósitos en Cuenta de Ahorro / Cheques</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                Total Proyectado: {formatHNL(projectedTotalDeposits)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                  Cantidad de Cuentahabientes con Dinero:
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={depositHolders}
                  onChange={e => setDepositHolders(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Número de personas que mantendrán saldo positivo</p>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                  Saldo Promedio por Persona (Lempiras):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={avgDeposit}
                  onChange={e => setAvgDeposit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Saldo promedio individual en cuenta bancaria</p>
              </div>
            </div>
          </div>

          {/* Bloque 3: Configuración de Préstamos y Cartera Crediticia */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Landmark className="w-4 h-4" />
                <span>3. Préstamos y Colocación Crediticia</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">
                Total Proyectado: {formatHNL(projectedTotalLoans)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                  Cantidad de Personas con Préstamo Activo:
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={loanBorrowers}
                  onChange={e => setLoanBorrowers(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Deudores activos en la cartera de esta banca</p>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                  Monto Promedio del Crédito (Lempiras):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={avgLoan}
                  onChange={e => setAvgLoan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Saldo promedio adeudado por cada prestatario</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tasa Anual de Interés (%):</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={loanRate}
                  onChange={e => setLoanRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Plazo Promedio (Meses):</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={loanMonths}
                  onChange={e => setLoanMonths(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Resumen del Impacto en Estados Financieros y Reservas */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase font-mono">
              Impacto Inmediato en el Balance General de Áureo Bank
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Variación Depósitos:</span>
                <span className={`text-xs font-bold ${depositDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {depositDelta >= 0 ? '+' : ''}{formatHNL(depositDelta)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Variación Préstamos:</span>
                <span className={`text-xs font-bold ${loanDelta >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {loanDelta >= 0 ? '+' : ''}{formatHNL(loanDelta)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Impacto Neto en Caja/BCH:</span>
                <span className={`text-xs font-bold ${netCashDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {netCashDelta >= 0 ? '+' : ''}{formatHNL(netCashDelta)}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Aplicar Distribución Inmediata a la Cartera</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
