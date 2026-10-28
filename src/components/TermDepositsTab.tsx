import React, { useState } from 'react';
import { GameState, TermDepositCertificate, BankingDivisionId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Banknote, 
  Lock, 
  Unlock, 
  Calendar, 
  Percent, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  FileCheck,
  Building,
  CheckCircle2
} from 'lucide-react';

interface TermDepositsTabProps {
  state: GameState;
  onIssueCertificate: (params: {
    clientName: string;
    clientCif?: string;
    division: BankingDivisionId;
    principalHNL: number;
    termDays: number;
    interestRateAnnualPct: number;
    couponPaymentFrequency: 'mensual' | 'al_vencimiento';
    autoRenew: boolean;
  }) => void;
  onNavigateToBackToBack: () => void;
}

export const TermDepositsTab: React.FC<TermDepositsTabProps> = ({
  state,
  onIssueCertificate,
  onNavigateToBackToBack
}) => {
  const termDeposits = state.termDeposits || [];

  // Formulario de emisión
  const [clientName, setClientName] = useState<string>('Inversiones Valle del Norte S.A.');
  const [division, setDivision] = useState<BankingDivisionId>('corporativa');
  const [principalHNL, setPrincipalHNL] = useState<number>(1000000);
  const [termDays, setTermDays] = useState<number>(360);
  const [customRatePct, setCustomRatePct] = useState<number>(8.5);
  const [couponFrequency, setCouponFrequency] = useState<'mensual' | 'al_vencimiento'>('mensual');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  // Escala sugerida de mercado hondureño
  const getSuggestedRate = (days: number): number => {
    if (days <= 30) return 5.5;
    if (days <= 60) return 6.0;
    if (days <= 90) return 6.5;
    if (days <= 180) return 7.5;
    if (days <= 360) return 8.5;
    return 9.75;
  };

  const handleTermChange = (days: number) => {
    setTermDays(days);
    setCustomRatePct(getSuggestedRate(days));
  };

  // Cálculos en vivo de interés y SAR 10%
  const grossInterest = Math.round(principalHNL * (customRatePct / 100) * (termDays / 360));
  const sarTaxWithheld = Math.round(grossInterest * 0.10); // 10% Impuesto SAR sobre capital
  const netInterest = grossInterest - sarTaxWithheld;

  // Métricas agregadas
  const totalPrincipal = termDeposits.reduce((acc, d) => acc + d.principalHNL, 0);
  const pledgedDepositsTotal = termDeposits
    .filter(d => d.isPledged)
    .reduce((acc, d) => acc + d.principalHNL, 0);
  const freeDepositsTotal = totalPrincipal - pledgedDepositsTotal;
  const totalSarWithheld = termDeposits.reduce((acc, d) => acc + d.accumulatedSarTaxWithheldHNL, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || principalHNL <= 0) return;
    sound.playApprovalStamp();
    onIssueCertificate({
      clientName,
      division,
      principalHNL,
      termDays,
      interestRateAnnualPct: customRatePct,
      couponPaymentFrequency: couponFrequency,
      autoRenew
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
                Captación Pasiva Institucional · DPF Desmaterializados
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Benchmark: Atlántida Bonos de Caja & Banpaís DPF</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Banknote className="w-6 h-6 text-amber-400" />
              Depósitos a Plazo Fijo (DPF / Time Certificates)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Emisión electrónica de certificados de depósito a plazo fijo de 30 a 720 días. Devengo diario con cálculo automático 
              de la <strong className="text-amber-300">retención tributaria SAR del 10%</strong> sobre los intereses devengados 
              y control de pignoración para líneas <strong className="text-emerald-400">Back-to-Back</strong>.
            </p>
          </div>
          <button
            onClick={onNavigateToBackToBack}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Originación Back-to-Back
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Métricas Agregadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total DPF Captados</div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
              {formatHNL(totalPrincipal)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {termDeposits.length} certificados emitidos
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">DPF Pignorados (Garantía B2B)</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {formatHNL(pledgedDepositsTotal)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {totalPrincipal > 0 ? ((pledgedDepositsTotal / totalPrincipal) * 100).toFixed(1) : 0}% del volumen en colateral
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">DPF Libres de Gravamen</div>
            <div className="text-lg font-bold font-mono tabular-nums text-blue-400 mt-0.5">
              {formatHNL(freeDepositsTotal)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Disponibles para pignorar
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Retención SAR 10% Acumulada</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {formatHNL(totalSarWithheld)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Impuesto sobre el capital retenido
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Emisión de DPF */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              Emisión de Certificado Desmaterializado (DPF)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro contable de captación a plazo con retención fiscal legal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titular / Razón Social
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Banca / Segmento
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as BankingDivisionId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="corporativa">Banca Corporativa</option>
                  <option value="pyme">Banca PYME</option>
                  <option value="premier">Banca Premier</option>
                  <option value="privada">Banca Privada</option>
                  <option value="personas">Banca Personas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monto Principal (HNL)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  value={principalHNL}
                  onChange={(e) => setPrincipalHNL(Math.max(1000, Number(e.target.value)))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Plazos Estándar */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Plazo en Días (Escalafón Bancario)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[30, 60, 90, 180, 360, 720].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleTermChange(d)}
                    className={`py-1.5 text-xs font-mono font-medium rounded border transition ${
                      termDays === d
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Tasa Pasiva y Cupón */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tasa Pasiva Anual (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="15"
                  value={customRatePct}
                  onChange={(e) => setCustomRatePct(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Frecuencia de Cupones
                </label>
                <select
                  value={couponFrequency}
                  onChange={(e) => setCouponFrequency(e.target.value as 'mensual' | 'al_vencimiento')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="mensual">Mensual</option>
                  <option value="al_vencimiento">Al Vencimiento</option>
                </select>
              </div>
            </div>

            {/* Cuadro de Liquidación Fiscal SAR */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-800/80 pb-1.5 flex justify-between">
                <span>Cálculo de Rendimiento & Retención SAR</span>
                <span className="text-amber-400 font-mono">{termDays} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interés Bruto Devengado:</span>
                <span className="font-mono tabular-nums text-slate-200 font-bold">{formatHNL(grossInterest)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Retención Fiscal SAR (10% Ley del ISR):</span>
                <span className="font-mono tabular-nums font-bold">-{formatHNL(sarTaxWithheld)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/60 text-emerald-400">
                <span className="font-semibold">Interés Neto a Pagar al Cliente:</span>
                <span className="font-mono tabular-nums font-bold">{formatHNL(netInterest)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRenewCheck"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="accent-amber-500"
              />
              <label htmlFor="autoRenewCheck" className="text-xs text-slate-300 cursor-pointer">
                Renovación automática de principal al vencimiento si no hay retiro
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Emitir Certificado DPF y Acreditar Pasivo
            </button>
          </form>
        </div>

        {/* Panel del Libro Mayor de Certificados */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                Custodia de Certificados DPF Desmaterializados
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Libro de registro con estado de pignoración y liquidación tributaria.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {termDeposits.length} certificados en custodia
            </div>
          </div>

          <div className="space-y-3">
            {termDeposits.map((d) => {
              const isPledged = d.isPledged;

              return (
                <div
                  key={d.id}
                  className={`p-4 bg-slate-950 border rounded-lg transition space-y-3 ${
                    isPledged ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-400">{d.id}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-semibold text-white">{d.clientName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400 uppercase font-mono">{d.division}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                        <span>Plazo: <strong>{d.termDays} días</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Vence: <strong>Mes {d.maturityMonth} ({d.maturityYear})</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Cupón: <strong>{d.couponPaymentFrequency}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono tabular-nums text-white">
                        {formatHNL(d.principalHNL)}
                      </div>
                      <div className="text-[11px] font-mono mt-0.5">
                        <span className="text-blue-400 font-semibold">{d.interestRateAnnualPct}% anual</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Rendimiento Bruto:</span>
                      <span className="font-mono tabular-nums text-slate-300">{formatHNL(d.accumulatedGrossInterestHNL)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Retención SAR (10%):</span>
                      <span className="font-mono tabular-nums text-amber-400">-{formatHNL(d.accumulatedSarTaxWithheldHNL)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rendimiento Neto:</span>
                      <span className="font-mono tabular-nums text-emerald-400 font-bold">{formatHNL(d.netInterestPaidHNL)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Condición Colateral:</span>
                      {isPledged ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          Pignorado a {d.pledgedToFacilityId}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-emerald-400" />
                          Libre de Gravamen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de vinculación */}
                  {!isPledged && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Este certificado está disponible para colateralizar un crédito Back-to-Back al 90%.
                      </span>
                      <button
                        type="button"
                        onClick={onNavigateToBackToBack}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Usar en Back-to-Back
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
