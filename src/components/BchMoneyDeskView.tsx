import React, { useState } from 'react';
import { GameState, CompetitorId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Calendar,
  Layers,
  Banknote
} from 'lucide-react';

interface BchMoneyDeskViewProps {
  state: GameState;
  onOpenRepo: (amountHNL: number, termDays: 7 | 14 | 28, ratePct: number) => void;
  onExecuteCallDeal: (bankId: CompetitorId, amountHNL: number, direction: 'prestar' | 'pedir_prestado') => void;
  onNavigateTab: (tab: string) => void;
}

export const BchMoneyDeskView: React.FC<BchMoneyDeskViewProps> = ({
  state,
  onOpenRepo,
  onExecuteCallDeal,
  onNavigateTab
}) => {
  const desk = state.bchMoneyDesk || {
    cashInBchCurrentAccountHNL: 345000000,
    requiredReserveHNL: 280800000,
    reserveSurplusOrDeficitHNL: 64200000,
    isCompliant: true,
    emergencyRepoActive: false,
    activeRepos: [],
    yieldCurve: [
      { termLabel: '7 días', termDays: 7, bchYieldPct: 5.75, previousYieldPct: 5.75, trend: 'estable' as const },
      { termLabel: '28 días', termDays: 28, bchYieldPct: 5.95, previousYieldPct: 5.90, trend: 'alza' as const },
      { termLabel: '91 días', termDays: 91, bchYieldPct: 6.30, previousYieldPct: 6.25, trend: 'alza' as const },
      { termLabel: '182 días', termDays: 182, bchYieldPct: 6.85, previousYieldPct: 6.80, trend: 'alza' as const },
      { termLabel: '364 días', termDays: 364, bchYieldPct: 7.45, previousYieldPct: 7.40, trend: 'alza' as const }
    ],
    dailyInterbankCallOffers: []
  };

  const [repoAmount, setRepoAmount] = useState<number>(50000000);
  const [repoTerm, setRepoTerm] = useState<7 | 14 | 28>(14);
  const [selectedCallBank, setSelectedCallBank] = useState<CompetitorId>('ficohsa');
  const [callAmount, setCallAmount] = useState<number>(25000000);
  const [callDirection, setCallDirection] = useState<'prestar' | 'pedir_prestado'>('prestar');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const tpm = state.bch.tpmRate;
  const repoRate = +(tpm + (repoTerm === 7 ? 0.35 : repoTerm === 14 ? 0.50 : 0.75)).toFixed(2);
  const reservePct = state.bch.reserveRequirementPct;
  const isSurplus = desk.reserveSurplusOrDeficitHNL >= 0;

  const handleRequestRepo = () => {
    sound.playCoinClink();
    onOpenRepo(repoAmount, repoTerm, repoRate);
    setActionSuccessMsg(`Operación de reporto concertada por ${formatHNL(repoAmount)} ante la Ventanilla BCH a tasa ${repoRate}%.`);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  const handleExecuteCall = () => {
    sound.playApprovalStamp();
    onExecuteCallDeal(selectedCallBank, callAmount, callDirection);
    const bankName = state.competitors.find(c => c.id === selectedCallBank)?.name || 'Banco';
    setActionSuccessMsg(`Operación interbancaria Call Money ejecutada: ${callDirection === 'prestar' ? 'Préstamo otorgado a' : 'Fondos recibidos de'} ${bankName} por ${formatHNL(callAmount)}.`);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Institucional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Mesa de Dinero & Tesorería Central</span>
            <span className="text-slate-600">·</span>
            <span>Regulación BCH / CNBS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Ventanilla de Liquidez BCH & Mercado Interbancario
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitoreo en tiempo real del Encaje Legal obligatorio ({reservePct}% en moneda nacional), facilidades de reporto con el Banco Central y colocación de excedentes en Call Money con bancos del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Tasa TPM BCH</span>
            <span className="text-lg font-mono font-bold text-amber-400">{formatPct(tpm)}</span>
          </div>
          <button
            onClick={() => onNavigateTab('treasury')}
            className="px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            Ver Bonos & Acciones
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Grid de 3 Tarjetas de Indicadores de Encaje y Liquidez */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta 1: Saldo en Cuenta Corriente BCH */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Saldo en Cuenta BCH</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-white">
              {formatHNL(desk.cashInBchCurrentAccountHNL)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Depósitos líquidos depositados en la cuenta de encaje ante el Banco Central.
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Requerimiento de Encaje Legal (12%) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Encaje Legal Requerido (12%)</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-amber-300">
              {formatHNL(desk.requiredReserveHNL)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Base de cálculo sobre L. {(state.financials.depositsPublicTotal / 1000000).toFixed(0)}M en depósitos del público.
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Posición Neta de Liquidez (Superávit / Déficit) */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${
          isSurplus ? 'bg-slate-900 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={isSurplus ? 'text-slate-400' : 'text-rose-400 font-bold'}>Posición de Encaje</span>
            {isSurplus ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className={`text-2xl font-mono font-extrabold ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSurplus ? '+' : ''}{formatHNL(desk.reserveSurplusOrDeficitHNL)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isSurplus 
                ? 'Superávit disponible para colocar en Call Money o préstamos interbancarios.' 
                : '¡Alerta regulatoria! Déficit sancionable. Solicita reporto en la Ventanilla BCH.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Central de 2 Columnas: Ventanilla Repos BCH vs Pizarra de Call Interbancario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna 1: Ventanilla de Liquidez del Banco Central (Repos) */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400" />
                Ventanilla de Liquidez BCH (Reportos)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Facilidad de liquidez de última instancia respaldada con Letras o Bonos soberanos.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold">
              Tasa Repo: {repoRate}%
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Monto del Reporto en Lempiras:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[20000000, 50000000, 100000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setRepoAmount(amt)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-center transition-colors border ${
                      repoAmount === amt 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {formatHNL(amt)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={repoAmount}
                onChange={e => setRepoAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Plazo de la Operación ante BCH:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([7, 14, 28] as const).map(days => (
                  <button
                    key={days}
                    onClick={() => setRepoTerm(days)}
                    className={`py-2 px-3 rounded-lg text-center font-medium transition-colors border ${
                      repoTerm === days
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{days} Días</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                      {days === 7 ? 'TPM + 0.35%' : days === 14 ? 'TPM + 0.50%' : 'TPM + 0.75%'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Costo Financiero Estimado:</span>
                <span className="font-mono text-white">
                  {formatHNL(Math.round((repoAmount * (repoRate / 100) * repoTerm) / 360))}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Garantía Requerida:</span>
                <span className="font-mono text-slate-300">Letras de Regulación BCH (105% aforo)</span>
              </div>
            </div>

            <button
              onClick={handleRequestRepo}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/10 active:scale-98 flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Concertar Reporto de Liquidez BCH ({formatHNL(repoAmount)})</span>
            </button>
          </div>
        </div>

        {/* Columna 2: Mercado Interbancario (Call Money) */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Mesa Interbancaria (Call Money)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Préstamos overnight y a corto plazo entre los 5 principales bancos de Honduras.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold">
              Mercado Abierto
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tipo de Operación:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCallDirection('prestar')}
                  className={`py-2 rounded-lg font-medium transition-colors border flex items-center justify-center gap-1.5 ${
                    callDirection === 'prestar'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Prestar Liquidez (Gana {(tpm + 0.35).toFixed(2)}%)</span>
                </button>
                <button
                  onClick={() => setCallDirection('pedir_prestado')}
                  className={`py-2 rounded-lg font-medium transition-colors border flex items-center justify-center gap-1.5 ${
                    callDirection === 'pedir_prestado'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Tomar Fondeo (Paga {(tpm + 0.55).toFixed(2)}%)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Banco Contraparte:
              </label>
              <select
                value={selectedCallBank}
                onChange={e => setSelectedCallBank(e.target.value as CompetitorId)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
              >
                {state.competitors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Tasa: {callDirection === 'prestar' ? (tpm + 0.35).toFixed(2) : (tpm + 0.55).toFixed(2)}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Monto de la Colocación en Lempiras:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[15000000, 25000000, 60000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCallAmount(amt)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-center transition-colors border ${
                      callAmount === amt 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {formatHNL(amt)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={callAmount}
                onChange={e => setCallAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <button
              onClick={handleExecuteCall}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/10 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Ejecutar Transacción Interbancaria ({formatHNL(callAmount)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curva de Rendimientos Soberana BCH */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Curva Soberana de Rendimientos del Banco Central de Honduras (BCH)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Estructura temporal de tasas de interés de los instrumentos del BCH (letras y bonos de regulación monetaria).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Pendiente: <span className="text-emerald-400 font-bold">Positiva / Normal</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {desk.yieldCurve.map((point) => (
            <div key={point.termLabel} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-medium block mb-1">{point.termLabel}</span>
              <span className="text-xl font-mono font-extrabold text-amber-400 block">
                {point.bchYieldPct.toFixed(2)}%
              </span>
              <div className="mt-1 text-[11px] font-mono flex items-center justify-center gap-1">
                <span className={point.trend === 'alza' ? 'text-emerald-400' : point.trend === 'baja' ? 'text-rose-400' : 'text-slate-500'}>
                  {point.trend === 'alza' ? '▲' : point.trend === 'baja' ? '▼' : '▬'} {point.previousYieldPct.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Operaciones de Reporto Activas */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Operaciones de Reporto en Cartera ({desk.activeRepos.length})
          </h3>
          <span className="text-xs text-slate-400">Compromisos vigentes de tesorería</span>
        </div>

        {desk.activeRepos.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No hay operaciones de reporto activas en este turno.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Contraparte</th>
                  <th className="py-2.5 px-3">Plazo</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                  <th className="py-2.5 px-3 text-right">Tasa Pactada</th>
                  <th className="py-2.5 px-3">Garantía / Aforo</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {desk.activeRepos.map((repo) => (
                  <tr key={repo.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{repo.id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{repo.counterparty}</td>
                    <td className="py-2.5 px-3">{repo.termDays} días</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">{formatHNL(repo.amountHNL)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{repo.interestRatePct}%</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{repo.collateralAsset}</td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="text-[11px] text-emerald-400 font-medium">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
