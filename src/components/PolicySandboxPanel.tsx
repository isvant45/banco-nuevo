import React, { useState } from 'react';
import { GameState, FinancialSandboxConfig } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { updateFinancialSandboxConfig } from '../game/economyEngine';
import { INITIAL_FINANCIAL_SANDBOX } from '../game/initialState';
import { sound } from '../game/audioFx';
import { 
  Sliders, 
  Landmark, 
  Receipt, 
  Scale, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Coins,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onNavigateTab?: (tabId: string) => void;
}

export function PolicySandboxPanel({ state, onUpdateState, onNavigateTab }: Props) {
  const sandbox = state.financialSandbox || INITIAL_FINANCIAL_SANDBOX;
  const [activeQuadrant, setActiveQuadrant] = useState<'macro' | 'fiscal' | 'alco' | 'scoring'>('macro');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Quick live slider dispatcher that immediately cascades to the whole application
  const handleUpdate = (updatedSection: Partial<FinancialSandboxConfig>) => {
    sound.playClick();
    const nextState = updateFinancialSandboxConfig(state, updatedSection);
    onUpdateState(nextState);
  };

  const handleResetToOfficialDefaults = () => {
    sound.playApprovalStamp();
    const nextState = updateFinancialSandboxConfig(state, INITIAL_FINANCIAL_SANDBOX);
    onUpdateState(nextState);
    setStatusNotification('Parámetros reestablecidos a la normativa oficial vigente del BCH, SAR y CNBS.');
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Metrics derived in real-time
  const requiredReserves = state.financials.requiredReserveAmount;
  const actualReserves = state.financials.cashAndBCHReserves;
  const reserveSurplus = actualReserves - requiredReserves;
  const isReserveCompliant = reserveSurplus >= 0;

  const currentCAR = state.financials.capitalAdequacyRatioCAR;
  const isCarCompliant = currentCAR >= 10.0;

  const normalClientsCount = state.clients.filter(c => c.cnbsCategory === 'I - Normal').length;
  const totalClients = state.clients.length;
  const normalClientsPct = totalClients > 0 ? +((normalClientsCount / totalClients) * 100).toFixed(1) : 100;

  return (
    <div className="space-y-6">
      {/* 1. Header del Sandbox Central */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <span>SISTEMA DE SIMULACIÓN Y POLÍTICAS EN VIVO</span>
              <span aria-hidden="true">·</span>
              <span>BANCO CENTRAL DE HONDURAS (BCH) & CNBS</span>
              <span aria-hidden="true">·</span>
              <span>SAR FISCAL</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Sandbox Central de Parámetros Económicos, Fiscales y Scoring en Tiempo Real
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1">
              Mueva cualquier deslizador para experimentar la reacción instantánea en el balance general, encaje bancario, 
              liquidación tributaria ante el SAR y calificación regulatoria de cartera crediticia en toda la aplicación.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetToOfficialDefaults}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Restaurar a parámetros estándar normativos de Honduras"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Normativa Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {statusNotification && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 2. Barra de Métricas Reactivas en Vivo (Impacto Simultáneo en Tiempo Real) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Encaje Legal BCH */}
        <div className={`p-4 rounded-xl border shadow-sm transition-colors ${
          isReserveCompliant ? 'bg-slate-900 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Encaje Legal BCH ({sandbox.macro.reserveReqPct}%)</span>
            <Landmark className={`w-4 h-4 ${isReserveCompliant ? 'text-blue-400' : 'text-rose-400'}`} />
          </div>
          <p className="text-lg font-bold font-mono text-slate-100">
            {formatHNL(requiredReserves)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Caja Actual: {formatHNL(actualReserves)}</span>
            <span className={isReserveCompliant ? 'text-emerald-400' : 'text-rose-400'}>
              {isReserveCompliant ? `+${formatHNL(reserveSurplus)}` : `Déficit ${formatHNL(Math.abs(reserveSurplus))}`}
            </span>
          </div>
        </div>

        {/* Impuesto ISR + Solidaria */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Carga Tributaria SAR (ISR + Sol.)</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold font-mono text-emerald-300">
            {sandbox.fiscalSar.isrRatePct + sandbox.fiscalSar.aportacionSolidariaPct}% Nominal
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Utilidad Neta Mes: <span className="text-slate-200 font-bold">{formatHNL(state.financials.currentMonthProfit)}</span>
          </p>
        </div>

        {/* Solvencia de Capital CAR */}
        <div className={`p-4 rounded-xl border shadow-sm transition-colors ${
          isCarCompliant ? 'bg-slate-900 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Solvencia CAR CNBS</span>
            <ShieldCheck className={`w-4 h-4 ${isCarCompliant ? 'text-emerald-400' : 'text-rose-500'}`} />
          </div>
          <p className={`text-lg font-bold font-mono ${isCarCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatPct(currentCAR)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Buffer Voluntario ALCO: <span className="text-blue-300">+{sandbox.bankAlco.minTier1CarBufferPct}%</span> (Mín. CNBS: 10%)
          </p>
        </div>

        {/* Cartera Calificada CNBS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Clientes Categoría I - Normal</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold font-mono text-purple-300">
            {normalClientsCount} de {totalClients} ({normalClientsPct}%)
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Provisiones IFRS 9: <span className="text-slate-200">{formatHNL(state.financials.loanLossProvisions)}</span>
          </p>
        </div>
      </div>

      {/* 3. Selector de Cuadrante / Módulo Paramétrico */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        <button
          onClick={() => setActiveQuadrant('macro')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeQuadrant === 'macro'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>1. Macroeconómico & BCH (TPM, Encaje, Divisas)</span>
        </button>

        <button
          onClick={() => setActiveQuadrant('fiscal')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeQuadrant === 'fiscal'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Régimen Fiscal & SAR (ISR, Solidaria, Retención)</span>
        </button>

        <button
          onClick={() => setActiveQuadrant('alco')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeQuadrant === 'alco'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>3. Tesorería & ALCO (Spread, CIR, Buffer Tier 1)</span>
        </button>

        <button
          onClick={() => setActiveQuadrant('scoring')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeQuadrant === 'scoring'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>4. Scoring Crediticio CNBS (Res. 284/2003)</span>
        </button>
      </div>

      {/* 4. Contenido del Cuadrante Activo con Sliders Reactivos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
        {/* CUADRANTE 1: MACROECONÓMICO & BCH */}
        {activeQuadrant === 'macro' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                Variables Macroeconómicas y Política Monetaria del BCH
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regulan el costo de oportunidad del dinero, la liquidez obligatoria en bóveda central y la tasa de referencia interbancaria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider TPM */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Tasa de Política Monetaria (TPM BCH):</span>
                  <span className="text-blue-300 font-bold text-sm px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                    {sandbox.macro.tpmRatePct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="3.00"
                  max="12.00"
                  step="0.25"
                  value={sandbox.macro.tpmRatePct}
                  onChange={(e) => handleUpdate({ macro: { ...sandbox.macro, tpmRatePct: Number(e.target.value) } })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>3.00% (Política Expansiva)</span>
                  <span>5.75% (Referencia BCH)</span>
                  <span>12.00% (Shock Restrictivo)</span>
                </div>
              </div>

              {/* Slider Encaje Legal */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Tasa de Encaje Legal Obligatorio:</span>
                  <span className="text-emerald-300 font-bold text-sm px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    {sandbox.macro.reserveReqPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="20.0"
                  step="0.5"
                  value={sandbox.macro.reserveReqPct}
                  onChange={(e) => handleUpdate({ macro: { ...sandbox.macro, reserveReqPct: Number(e.target.value) } })}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>8.0% (Mayor Liquidez Libre)</span>
                  <span>12.0% (Norma Legal BCH)</span>
                  <span>20.0% (Inmovilización Extrema)</span>
                </div>
              </div>

              {/* Slider Inflación Interanual IPC */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Inflación Interanual del IPC:</span>
                  <span className="text-amber-300 font-bold text-sm px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {sandbox.macro.interannualInflationPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="2.00"
                  max="14.00"
                  step="0.10"
                  value={sandbox.macro.interannualInflationPct}
                  onChange={(e) => handleUpdate({ macro: { ...sandbox.macro, interannualInflationPct: Number(e.target.value) } })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2.0% (Meta Baja)</span>
                  <span>4.9% (Tasa Vigente)</span>
                  <span>14.0% (Espiral de Precios)</span>
                </div>
              </div>

              {/* Slider Tipo de Cambio USD/HNL */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Tipo de Cambio Oficial (USD/HNL):</span>
                  <span className="text-purple-300 font-bold text-sm px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    L. {sandbox.macro.exchangeRateUsdHnl.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="22.00"
                  max="32.00"
                  step="0.05"
                  value={sandbox.macro.exchangeRateUsdHnl}
                  onChange={(e) => handleUpdate({ macro: { ...sandbox.macro, exchangeRateUsdHnl: Number(e.target.value) } })}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>L. 22.00 (Apreciación)</span>
                  <span>L. 24.85 (Mercado Interbancario)</span>
                  <span>L. 32.00 (Devaluación Severa)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUADRANTE 2: RÉGIMEN FISCAL & SAR */}
        {activeQuadrant === 'fiscal' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Régimen Impositivo y Liquidación Tributaria SAR
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tasas efectivas de Impuesto Sobre la Renta (ISR), Aportación Solidaria y retención a los dividendos conforme al Código Tributario de Honduras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider ISR Bancario */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Impuesto Sobre la Renta Bancario (ISR):</span>
                  <span className="text-emerald-300 font-bold text-sm px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    {sandbox.fiscalSar.isrRatePct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15.0"
                  max="35.0"
                  step="0.5"
                  value={sandbox.fiscalSar.isrRatePct}
                  onChange={(e) => handleUpdate({ fiscalSar: { ...sandbox.fiscalSar, isrRatePct: Number(e.target.value) } })}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>15.0% (Incentivo Fiscal)</span>
                  <span>25.0% (Tasa General SAR)</span>
                  <span>35.0% (Presión Máxima)</span>
                </div>
              </div>

              {/* Slider Aportación Solidaria */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Aportación Solidaria (Sobre exceso L. 1M):</span>
                  <span className="text-amber-300 font-bold text-sm px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {sandbox.fiscalSar.aportacionSolidariaPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={sandbox.fiscalSar.aportacionSolidariaPct}
                  onChange={(e) => handleUpdate({ fiscalSar: { ...sandbox.fiscalSar, aportacionSolidariaPct: Number(e.target.value) } })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.0% (Exención)</span>
                  <span>5.0% (Ley Vigente SAR)</span>
                  <span>10.0% (Tasa Especial de Crisis)</span>
                </div>
              </div>

              {/* Slider Retención de Dividendos */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Retención en Fuente por Dividendos:</span>
                  <span className="text-purple-300 font-bold text-sm px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    {sandbox.fiscalSar.dividendWithholdingTaxPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="20.0"
                  step="0.5"
                  value={sandbox.fiscalSar.dividendWithholdingTaxPct}
                  onChange={(e) => handleUpdate({ fiscalSar: { ...sandbox.fiscalSar, dividendWithholdingTaxPct: Number(e.target.value) } })}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5.0% (Renta de Capital Leve)</span>
                  <span>10.0% (Estándar Código Tributario)</span>
                  <span>20.0% (Retención Elevada)</span>
                </div>
              </div>

              {/* Deducibilidad de Provisiones */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Deducibilidad Fiscal de Provisiones CNBS:</span>
                  <span className="text-blue-300 font-bold text-sm px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                    {sandbox.fiscalSar.maxDeductibleProvisionPct.toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={sandbox.fiscalSar.maxDeductibleProvisionPct}
                  onChange={(e) => handleUpdate({ fiscalSar: { ...sandbox.fiscalSar, maxDeductibleProvisionPct: Number(e.target.value) } })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Tope Fiscal Restrictivo)</span>
                  <span>100% (Deducción Integral CNBS)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUADRANTE 3: TESORERÍA & ALCO */}
        {activeQuadrant === 'alco' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Comité de Activos y Pasivos (ALCO) & Metas de Eficiencia
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Control del margen financiero neto (NIM), ratio de eficiencia de gastos operativos (CIR) y colchón patrimonial voluntario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spread Objetivo */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Spread de Intermediación Objetivo:</span>
                  <span className="text-blue-300 font-bold text-sm px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                    {sandbox.bankAlco.targetIntermediationSpreadPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="4.00"
                  max="14.00"
                  step="0.25"
                  value={sandbox.bankAlco.targetIntermediationSpreadPct}
                  onChange={(e) => handleUpdate({ bankAlco: { ...sandbox.bankAlco, targetIntermediationSpreadPct: Number(e.target.value) } })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>4.00% (Márgenes Finos)</span>
                  <span>8.50% (Promedio HN)</span>
                  <span>14.00% (Alto Margen)</span>
                </div>
              </div>

              {/* Meta CIR */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Meta de Eficiencia Operativa (CIR):</span>
                  <span className="text-amber-300 font-bold text-sm px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {sandbox.bankAlco.cirEfficiencyTargetPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40.0"
                  max="70.0"
                  step="1.0"
                  value={sandbox.bankAlco.cirEfficiencyTargetPct}
                  onChange={(e) => handleUpdate({ bankAlco: { ...sandbox.bankAlco, cirEfficiencyTargetPct: Number(e.target.value) } })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>40.0% (Ultra Eficiente)</span>
                  <span>52.0% (Meta Áureo)</span>
                  <span>70.0% (OPEX Elevado)</span>
                </div>
              </div>

              {/* Buffer CAR Tier 1 */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Colchón Voluntario Tier 1 (CAR):</span>
                  <span className="text-emerald-300 font-bold text-sm px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    +{sandbox.bankAlco.minTier1CarBufferPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={sandbox.bankAlco.minTier1CarBufferPct}
                  onChange={(e) => handleUpdate({ bankAlco: { ...sandbox.bankAlco, minTier1CarBufferPct: Number(e.target.value) } })}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>+1.0% (Mínimo Estricto)</span>
                  <span>+3.5% (Política ALCO)</span>
                  <span>+8.0% (Máxima Solvencia)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUADRANTE 4: MODELO DE SCORING CREDITICIO CNBS */}
        {activeQuadrant === 'scoring' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                Modelo de Calificación de Cartera y Scoring CNBS (Resolución 284/2003)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Criterios oficiales para clasificar clientes en Categorías I a V (Normal a Pérdida) y cálculo dinámico del gasto de provisiones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Umbral Score Buró */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Umbral Mínimo Score Buró (Equifax):</span>
                  <span className="text-purple-300 font-bold text-sm px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    {sandbox.creditScoringCnbs.minBureauScoreThreshold} Puntos
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="750"
                  step="10"
                  value={sandbox.creditScoringCnbs.minBureauScoreThreshold}
                  onChange={(e) => handleUpdate({ creditScoringCnbs: { ...sandbox.creditScoringCnbs, minBureauScoreThreshold: Number(e.target.value) } })}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>500 (Mayor Aprobación)</span>
                  <span>640 (Filtro Prudencial)</span>
                  <span>750 (Riesgo Casi Nulo)</span>
                </div>
              </div>

              {/* DTI Máximo */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Relación Deuda a Ingreso Máxima (DTI):</span>
                  <span className="text-amber-300 font-bold text-sm px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {sandbox.creditScoringCnbs.maxDtiAllowedPct.toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="60"
                  step="1"
                  value={sandbox.creditScoringCnbs.maxDtiAllowedPct}
                  onChange={(e) => handleUpdate({ creditScoringCnbs: { ...sandbox.creditScoringCnbs, maxDtiAllowedPct: Number(e.target.value) } })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>30% (Capacidad Holgada)</span>
                  <span>45% (Límite CNBS)</span>
                  <span>60% (Alto Endeudamiento)</span>
                </div>
              </div>

              {/* LTV Máximo */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">LTV Máximo en Garantías Reales:</span>
                  <span className="text-blue-300 font-bold text-sm px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                    {sandbox.creditScoringCnbs.maxLtvCoveragePct.toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={sandbox.creditScoringCnbs.maxLtvCoveragePct}
                  onChange={(e) => handleUpdate({ creditScoringCnbs: { ...sandbox.creditScoringCnbs, maxLtvCoveragePct: Number(e.target.value) } })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Exceso de Colateral)</span>
                  <span>80% (Práctica Habitual)</span>
                  <span>90% (Garantía Ajustada)</span>
                </div>
              </div>

              {/* Días Mora Disparador Pérdida */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Días de Mora para Categoría V (Pérdida 100%):</span>
                  <span className="text-rose-400 font-bold text-sm px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                    {sandbox.creditScoringCnbs.categoryVArrearsDaysTrigger} Días
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="360"
                  step="30"
                  value={sandbox.creditScoringCnbs.categoryVArrearsDaysTrigger}
                  onChange={(e) => handleUpdate({ creditScoringCnbs: { ...sandbox.creditScoringCnbs, categoryVArrearsDaysTrigger: Number(e.target.value) } })}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>90 Días (Castigo Acelerado)</span>
                  <span>180 Días (Norma CNBS)</span>
                  <span>360 Días (Tolerancia Larga)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Acceso Rápido al Ranking Histórico de Dividendos */}
      {onNavigateTab && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">¿Desea evaluar el impacto en la distribución de dividendos de la Junta Directiva?</p>
              <p className="text-[11px] text-slate-400">Acceda al Ranking Histórico de Dividendos de 10 años para simular el Payout y el Dividendo por Acción (DPS).</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('dividends')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm"
          >
            <span>Ver Ranking de Dividendos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
