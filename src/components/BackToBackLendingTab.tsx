import React, { useState } from 'react';
import { GameState, BackToBackFacility, TermDepositCertificate, BankingDivisionId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Zap,
  ArrowRight,
  TrendingUp,
  Percent,
  Banknote,
  Scale
} from 'lucide-react';

interface BackToBackLendingTabProps {
  state: GameState;
  onOriginateFacility: (params: {
    dpfCertificateId: string;
    type: 'prestamo_garantizado' | 'tarjeta_garantizada';
    coverageRatioPct: number;
    termMonths: number;
    spreadRatePct: number;
  }) => void;
  onPayInstallment: (facilityId: string, amountHNL?: number) => void;
  onForecloseCollateral: (facilityId: string) => void;
  onNavigateToTermDeposits: () => void;
  onUseCreditCard?: (facilityId: string, amountHNL: number) => void;
  onCloseCard?: (facilityId: string) => void;
}

export const BackToBackLendingTab: React.FC<BackToBackLendingTabProps> = ({
  state,
  onOriginateFacility,
  onPayInstallment,
  onForecloseCollateral,
  onNavigateToTermDeposits,
  onUseCreditCard,
  onCloseCard
}) => {
  const termDeposits = state.termDeposits || [];
  const facilities = state.backToBackFacilities || [];

  // Filtrar DPFs disponibles (no pignorados y vigentes)
  const availableDpfs = termDeposits.filter(d => !d.isPledged && d.status === 'vigente');

  // Formulario de originación
  const [selectedDpfId, setSelectedDpfId] = useState<string>(availableDpfs[0]?.id || (termDeposits[0]?.id || ''));
  const [facilityType, setFacilityType] = useState<'prestamo_garantizado' | 'tarjeta_garantizada'>('tarjeta_garantizada');
  const [coveragePct, setCoveragePct] = useState<number>(90);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [spreadPct, setSpreadPct] = useState<number>(3.5);
  const [paymentAmountInput, setPaymentAmountInput] = useState<{ [id: string]: string }>({});
  const [chargeAmountInput, setChargeAmountInput] = useState<{ [id: string]: string }>({});

  const activeDpf = termDeposits.find(d => d.id === selectedDpfId);
  const isSelectedDpfPledged = activeDpf?.isPledged || false;

  // Cálculos en tiempo real
  const dpfPrincipal = activeDpf?.principalHNL || 0;
  const dpfRate = activeDpf?.interestRateAnnualPct || 0;
  const approvedAmount = Math.round(dpfPrincipal * (coveragePct / 100));
  const effectiveRate = +(dpfRate + spreadPct).toFixed(2);
  const disbursementFee = Math.max(500, Math.round(approvedAmount * 0.005)); // 0.5% mín L. 500
  const debtorInsurance = Math.round((approvedAmount / 1000) * 6.50); // L. 6.50 por millar
  
  const monthlyRate = (effectiveRate / 100) / 12;
  const monthlyQuota = approvedAmount > 0 && monthlyRate > 0
    ? Math.round((approvedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)))
    : 0;

  // Métricas agregadas de cartera Back-to-Back
  const totalB2BOutstanding = facilities
    .filter(f => f.status === 'vigente')
    .reduce((acc, f) => acc + f.outstandingBalanceHNL, 0);

  const totalPledgedCollateral = facilities
    .filter(f => f.status === 'vigente')
    .reduce((acc, f) => acc + f.dpfPrincipalHNL, 0);

  const activeFacilitiesCount = facilities.filter(f => f.status === 'vigente').length;

  const handleOriginateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDpfId || isSelectedDpfPledged) return;
    sound.playApprovalStamp();
    onOriginateFacility({
      dpfCertificateId: selectedDpfId,
      type: facilityType,
      coverageRatioPct: coveragePct,
      termMonths: termMonths,
      spreadRatePct: spreadPct
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Institucional y Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Normativa CNBS · Resolución Circular 014/2024
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Benchmark: BAC Credomatic & Ficohsa T24</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Colocación & Créditos Back-to-Back (Garantía Líquida 100%)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Préstamos amortizables y tarjetas de crédito colateralizados mediante pignoración de Certificados de Depósito a Plazo Fijo (DPF). 
              Riesgo crediticio nulo (<span className="text-emerald-400 font-semibold font-mono">0% RWA</span>), 
              aprobación inmediata sin buró y exoneración total de provisiones por incobrabilidad.
            </p>
          </div>
          <button
            onClick={onNavigateToTermDeposits}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <Banknote className="w-4 h-4 text-amber-400" />
            Gestionar Depósitos DPF
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Métricas Clave de la Cartera B2B */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Cartera B2B Vigente</div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
              {formatHNL(totalB2BOutstanding)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {activeFacilitiesCount} operaciones activas
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">DPFs en Pignoración</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {formatHNL(totalPledgedCollateral)}
            </div>
            <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
              Cobertura colateral: {totalB2BOutstanding > 0 ? ((totalPledgedCollateral / totalB2BOutstanding) * 100).toFixed(1) : 100}%
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Provisiones de Riesgo (CNBS)</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              L. 0.00 (Exonerado)
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Ponderación RWA: 0.0%
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Margen Financiero Spread</div>
            <div className="text-lg font-bold font-mono tabular-nums text-blue-400 mt-0.5">
              +{spreadPct.toFixed(2)}% Neto
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Comisión de desembolso: 0.50%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Formulario de Originación Back-to-Back */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Originación Inmediata de Facilidad Back-to-Back
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pignora un certificado de depósito y genera crédito o tarjeta al instante.
            </p>
          </div>

          <form onSubmit={handleOriginateSubmit} className="space-y-4">
            {/* Selección de DPF */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Certificado DPF en Custodia (Garantía Líquida)
              </label>
              {availableDpfs.length === 0 ? (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs text-amber-300 flex items-center justify-between">
                  <span>No hay DPFs libres disponibles para pignorar.</span>
                  <button
                    type="button"
                    onClick={onNavigateToTermDeposits}
                    className="text-amber-400 font-semibold underline hover:text-amber-300"
                  >
                    Emitir DPF
                  </button>
                </div>
              ) : (
                <select
                  value={selectedDpfId}
                  onChange={(e) => setSelectedDpfId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  {termDeposits.map(d => (
                    <option key={d.id} value={d.id} disabled={d.isPledged}>
                      {d.id} · {d.clientName} · {formatHNL(d.principalHNL)} ({d.interestRateAnnualPct}% p.a.) {d.isPledged ? '[PIGNORADO]' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tipo de Producto */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Modalidad de la Facilidad
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFacilityType('prestamo_garantizado')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition flex items-center gap-2 ${
                    facilityType === 'prestamo_garantizado'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Préstamo Amortizable
                </button>
                <button
                  type="button"
                  onClick={() => setFacilityType('tarjeta_garantizada')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition flex items-center gap-2 ${
                    facilityType === 'tarjeta_garantizada'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Tarjeta Garantizada
                </button>
              </div>
            </div>

            {/* Slider de Ratio de Cobertura */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Ratio de Cobertura / Cupo</span>
                <span className="font-mono font-bold text-amber-400">{coveragePct}% del DPF</span>
              </div>
              <input
                type="range"
                min="80"
                max="95"
                step="5"
                value={coveragePct}
                onChange={(e) => setCoveragePct(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>80% (Prudente)</span>
                <span>90% (Estándar BAC/Ficohsa)</span>
                <span>95% (Máx. CNBS)</span>
              </div>
            </div>

            {/* Plazo en Meses */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Plazo Contractual
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 24, 36, 60].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTermMonths(m)}
                    className={`py-1.5 text-xs font-mono font-medium rounded border transition ${
                      termMonths === m
                        ? 'bg-slate-800 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Spread del Banco */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Margen del Banco (Spread Activo)</span>
                <span className="font-mono font-bold text-blue-400">+{spreadPct.toFixed(2)}% sobre DPF</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="4.5"
                step="0.25"
                value={spreadPct}
                onChange={(e) => setSpreadPct(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-950 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>+2.50% (Corporativo)</span>
                <span>+3.00% (Estándar Plaza)</span>
                <span>+4.50% (Consumo)</span>
              </div>
            </div>

            {/* Cuadro de Liquidación en Pantalla */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
                <span>Resumen de la Simulación Crediticia</span>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                  facilityType === 'tarjeta_garantizada' ? 'bg-amber-500/10 text-amber-300' : 'bg-blue-500/10 text-blue-300'
                }`}>
                  {facilityType === 'tarjeta_garantizada' ? 'Línea Revolvente' : 'Amortizable Francés'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Garantía DPF Colateral:</span>
                <span className="font-mono tabular-nums text-slate-200">{formatHNL(dpfPrincipal)} ({dpfRate}% pasivo)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {facilityType === 'tarjeta_garantizada' ? 'Límite Revolvente Autorizado:' : 'Monto Desembolsado:'}
                </span>
                <span className="font-mono tabular-nums text-emerald-400 font-bold">{formatHNL(approvedAmount)} ({coveragePct}% del DPF)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tasa Activa Pactada:</span>
                <span className="font-mono tabular-nums text-blue-400 font-bold">{effectiveRate}% anual ({dpfRate}% + {spreadPct}%)</span>
              </div>
              
              {facilityType === 'tarjeta_garantizada' ? (
                <>
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-300 font-medium">Cuota Mensual Fija:</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-bold">L. 0.00 (SIN cuota fija obligatoria)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pago Mínimo al Consumir:</span>
                    <span className="font-mono tabular-nums text-amber-300 font-semibold">5.0% del saldo utilizado (mín. L. 500)</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                  <span className="text-slate-300 font-medium">Cuota Nivelada (Francesa):</span>
                  <span className="font-mono tabular-nums text-amber-300 font-bold">{formatHNL(monthlyQuota)}/mes</span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">
                  {facilityType === 'tarjeta_garantizada' ? 'Comisión Apertura Plástico (0.5%):' : 'Comisión Desembolso (0.5%):'}
                </span>
                <span className="font-mono tabular-nums text-slate-300">{formatHNL(disbursementFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seguro Saldo Deudor (L. 6.50/millar):</span>
                <span className="font-mono tabular-nums text-slate-300">{formatHNL(debtorInsurance)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Riesgo Ponderado CNBS:
                </span>
                <span className="font-mono font-bold text-emerald-400">0% RWA (Provisión L. 0.00)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!activeDpf || isSelectedDpfPledged || approvedAmount <= 0}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              {facilityType === 'tarjeta_garantizada' ? 'Pignorar DPF y Emitir Tarjeta Revolvente' : 'Pignorar DPF y Desembolsar Préstamo B2B'}
            </button>
          </form>
        </div>

        {/* Panel Derecho: Libro Mayor de Operaciones Back-to-Back Activas */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Libro Mayor de Colaterales & Facilidades Back-to-Back
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento de gravámenes pignorados, amortización mensual y ejecuciones extrajudiciales.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {facilities.length} expedientes registrados
            </div>
          </div>

          {facilities.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No hay facilidades Back-to-Back registradas aún. Emite una desde el panel izquierdo.
            </div>
          ) : (
            <div className="space-y-3">
              {facilities.map((fac) => {
                const isPaidOff = fac.status === 'cancelado';
                const isForeclosed = fac.status === 'ejecutado';
                const isOngoing = fac.status === 'vigente';
                const isCard = fac.type === 'tarjeta_garantizada' || !!fac.isRevolving;
                const cardLimit = fac.creditCardLimitHNL || fac.approvedAmountHNL;
                const availableCredit = Math.max(0, cardLimit - fac.outstandingBalanceHNL);

                return (
                  <div 
                    key={fac.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-400">{fac.id}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-semibold text-white">{fac.clientName}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400 uppercase font-mono">{fac.division}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>DPF Colateral: <strong className="font-mono text-slate-300">{fac.dpfCertificateId}</strong> ({formatHNL(fac.dpfPrincipalHNL)})</span>
                          <span className="text-slate-600">·</span>
                          <span>Tasa: <strong className="font-mono text-blue-300">{fac.effectiveInterestRatePct}%</strong> ({fac.dpfInterestRatePct}% + {fac.spreadRatePct}%)</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono tabular-nums text-white">
                          {isCard ? `Saldo Utilizado: ${formatHNL(fac.outstandingBalanceHNL)}` : `Saldo Insoluto: ${formatHNL(fac.outstandingBalanceHNL)}`}
                        </div>
                        {isCard && (
                          <div className="text-[10px] font-mono text-emerald-400">
                            Cupo Disponible: {formatHNL(availableCredit)} / {formatHNL(cardLimit)}
                          </div>
                        )}
                        <div className="text-[10px] font-mono mt-0.5">
                          {isOngoing && <span className="text-emerald-400">Gravamen Vigente (0% RWA)</span>}
                          {isPaidOff && <span className="text-slate-500">Cancelado (DPF Liberado)</span>}
                          {isForeclosed && <span className="text-red-400">Garantía Ejecutada</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Modalidad:</span>
                        <span className="font-medium text-slate-300">
                          {isCard ? 'Tarjeta Garantizada Revolvente' : 'Préstamo Amortizable'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">
                          {isCard ? 'Pago Mínimo (5%):' : 'Cuota Mensual:'}
                        </span>
                        <span className="font-mono tabular-nums text-amber-300 font-semibold">
                          {isCard ? (fac.minimumMonthlyPaymentHNL ? formatHNL(fac.minimumMonthlyPaymentHNL) : 'L. 0.00 (Sin uso)') : formatHNL(fac.monthlyQuotaHNL)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Comisión Apertura:</span>
                        <span className="font-mono tabular-nums text-slate-300">{formatHNL(fac.disbursementFeeHNL)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Seguro Deudor:</span>
                        <span className="font-mono tabular-nums text-slate-300">{formatHNL(fac.monthlyDebtorInsuranceHNL)}</span>
                      </div>
                    </div>

                    {/* Acciones de Operación en el Core */}
                    {isOngoing && (
                      <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-2">
                        {isCard && (
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/80 rounded border border-slate-800">
                            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                              Simular Consumo con Tarjeta:
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Monto HNL ej. 15000"
                                value={chargeAmountInput[fac.id] || ''}
                                onChange={(e) => setChargeAmountInput({ ...chargeAmountInput, [fac.id]: e.target.value })}
                                className="w-36 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const amt = Number(chargeAmountInput[fac.id] || 0);
                                  if (amt > 0 && onUseCreditCard) {
                                    sound.playApprovalStamp();
                                    onUseCreditCard(fac.id, amt);
                                    setChargeAmountInput({ ...chargeAmountInput, [fac.id]: '' });
                                  }
                                }}
                                disabled={availableCredit <= 0}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded transition"
                              >
                                Procesar Cargo POS
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder={isCard ? String(fac.minimumMonthlyPaymentHNL || 500) : String(fac.monthlyQuotaHNL)}
                              value={paymentAmountInput[fac.id] || ''}
                              onChange={(e) => setPaymentAmountInput({ ...paymentAmountInput, [fac.id]: e.target.value })}
                              className="w-36 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                sound.playApprovalStamp();
                                const amt = paymentAmountInput[fac.id] ? Number(paymentAmountInput[fac.id]) : undefined;
                                onPayInstallment(fac.id, amt);
                                setPaymentAmountInput({ ...paymentAmountInput, [fac.id]: '' });
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition"
                            >
                              {isCard ? 'Abonar Saldo Tarjeta' : 'Pagar Cuota'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {fac.outstandingBalanceHNL > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playApprovalStamp();
                                  onPayInstallment(fac.id, fac.outstandingBalanceHNL);
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
                                title="Cancela la totalidad del saldo utilizado."
                              >
                                Pagar Todo ({formatHNL(fac.outstandingBalanceHNL)})
                              </button>
                            )}

                            {isCard && fac.outstandingBalanceHNL === 0 && onCloseCard && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playApprovalStamp();
                                  onCloseCard(fac.id);
                                }}
                                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold rounded border border-emerald-700/60 transition"
                                title="Cancela la tarjeta garantizada y libera el DPF colateral."
                              >
                                Cancelar Tarjeta & Desgravar DPF
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`¿Confirma la ejecución extrajudicial del DPF ${fac.dpfCertificateId} contra la deuda de ${formatHNL(fac.outstandingBalanceHNL)}?`)) {
                                  sound.playRejectBuzzer();
                                  onForecloseCollateral(fac.id);
                                }
                              }}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium rounded border border-red-800/50 transition"
                              title="Ejecución de garantía sin juicio por incumplimiento"
                            >
                              Ejecutar Garantía
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
