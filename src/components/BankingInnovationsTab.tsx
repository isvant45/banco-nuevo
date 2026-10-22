import React, { useState } from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatUSD, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Landmark, 
  Award, 
  Smartphone, 
  Globe2, 
  TrendingDown, 
  Briefcase, 
  Building2, 
  Check, 
  ArrowRight,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface BankingInnovationsTabProps {
  gameState: GameState;
  onRunStressTest: (scenario: string) => void;
  onExecuteFxBid: (amountUSD: number) => void;
  onPlaceInterbankCallMoney: (amountHNL: number, isLending: boolean) => void;
  onNavigateTab?: (tab: string) => void;
}

export function BankingInnovationsTab({
  gameState,
  onRunStressTest,
  onExecuteFxBid,
  onPlaceInterbankCallMoney,
  onNavigateTab
}: BankingInnovationsTabProps) {
  const { innovations, bch, financials } = gameState;
  const [fxBidAmount, setFxBidAmount] = useState<number>(1000000);
  const [callAmount, setCallAmount] = useState<number>(20000000);
  const [stressScenario, setStressScenario] = useState<string>('devaluacion_severa');
  const [testResult, setTestResult] = useState<{ car: number; lcr: number; msg: string } | null>(null);

  const handleRunTest = () => {
    sound.playWarningChime();
    let simCAR = financials.capitalAdequacyRatioCAR;
    let simLCR = financials.liquidityCoverageRatioLCR;
    let msg = '';

    if (stressScenario === 'devaluacion_severa') {
      simCAR = +(simCAR - 1.8).toFixed(1);
      simLCR = +(simLCR - 22.0).toFixed(1);
      msg = 'Escenario Devaluación +15%: Las reservas en dólares se valorizan pero la mora en créditos indexados aumenta. CAR se reduce a ' + simCAR + '% y LCR a ' + simLCR + '%. Banco se mantiene solvente sobre el 10% mínimo.';
    } else if (stressScenario === 'shock_tpm_alta') {
      simCAR = +(simCAR - 2.5).toFixed(1);
      simLCR = +(simLCR - 35.0).toFixed(1);
      msg = 'Escenario Alza de TPM al 9.5%: El costo de depósitos a plazo sube bruscamente, contrayendo el margen financiero bruto. CAR se reduce a ' + simCAR + '% y LCR a ' + simLCR + '%. Requiere apoyo de tesorería.';
    } else {
      simCAR = +(simCAR - 3.2).toFixed(1);
      simLCR = +(simLCR - 18.0).toFixed(1);
      msg = 'Escenario Sequía Agrícola en Valle de Sula: Pérdidas en cosechas elevan la mora del sector al 8.5%. Provisiones extraordinarias consumen L. 45M de utilidades.';
    }

    setTestResult({ car: simCAR, lcr: simLCR, msg });
    onRunStressTest(stressScenario);
  };

  const handleBidBch = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCoinClink();
    onExecuteFxBid(fxBidAmount);
    alert(`Postura enviada al Banco Central de Honduras por ${formatUSD(fxBidAmount)} a tasa de L. ${bch.exchangeRateHNLtoUSD.toFixed(2)}/$.`);
  };

  const handleCallMoney = (isLending: boolean) => {
    sound.playCoinClink();
    onPlaceInterbankCallMoney(callAmount, isLending);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">Suite de 10 Innovaciones Bancarias Institucionales</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                10 Módulos Activos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Operaciones de Tesorería Avanzada, Gestión de Crisis, Arbitraje Cambiario y Sindicaciones Multilaterales
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => {
              sound.playClick();
              onNavigateTab('programs20');
            }}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shrink-0"
          >
            Ver 20 Programas & Clientes
          </button>
        )}
      </div>

      {/* Grid de las 10 Innovaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Mesa de Divisas & Subasta BCH */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">1. Mesa de Divisas (FX Trading & Subastas BCH)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {formatHNL(innovations?.fxDesk?.fxSpreadIncomeMonthly || 850000)}/mes
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Participa en la subasta electrónica de divisas del BCH para asegurar dólares al sector productivo y rentabilizar el spread cambiario bancario.
          </p>

          <form onSubmit={handleBidBch} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tipo de cambio oficial BCH:</span>
              <span className="font-mono font-bold text-slate-200">L. {bch.exchangeRateHNLtoUSD.toFixed(2)} / USD</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100000"
                step="250000"
                value={fxBidAmount}
                onChange={e => setFxBidAmount(Number(e.target.value))}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Pujar en Subasta BCH
              </button>
            </div>
          </form>
        </div>

        {/* 2. Auditorías Sorpresa CNBS */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">2. Auditorías e Inspecciones CNBS</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Cumplimiento: {innovations?.cnbsAudits?.complianceRating || 94}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Supervisión in situ del cumplimiento normativo de provisiones, encaje legal y prevención de lavado de activos (AML).
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-300 font-medium">Último Dictamen de Inspección:</p>
            <p className="text-emerald-400 font-mono text-[11px]">{innovations?.cnbsAudits?.lastAuditResult}</p>
          </div>
        </div>

        {/* 3. Mesa de Dinero Interbancario (Call / Overnight) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">3. Mesa de Dinero Interbancario (Call Money)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              Tasa Call: {innovations?.interbankCallMoney?.callRatePct || 6.25}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Presta excesos de liquidez a 24 horas a bancos ilíquidos del sistema o fondea faltantes temporales de encaje.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="5000000"
              step="5000000"
              value={callAmount}
              onChange={e => setCallAmount(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            />
            <button
              onClick={() => handleCallMoney(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shrink-0"
            >
              Colocar Call (Prestar)
            </button>
          </div>
        </div>

        {/* 4. Calificación de Riesgo Internacional */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">4. Calificación de Riesgo Internacional</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
              {innovations?.internationalRating?.currentRating || 'AAA (hnd)'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dictamen público de solvencia emitido por Fitch Ratings. Otorga un descuento de 0.40% en el costo de fondeo internacional.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Perspectiva:</span>
            <span className="text-emerald-400 font-semibold">{innovations?.internationalRating?.outlook || 'Estable'}</span>
          </div>
        </div>

        {/* 5. Simulador de Pruebas de Estrés (Stress Testing CNBS) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-100">8. Simulador de Pruebas de Estrés Macro (Stress Testing CNBS)</h3>
            </div>
            <span className="text-xs text-slate-400">Simulación de resiliencia del capital Tier 1</span>
          </div>

          <p className="text-xs text-slate-400">
            Somete el balance y la cartera a escenarios extremos para verificar si el banco resistiría devaluaciones, subidas de tasas o crisis agropecuarias sin que el CAR caiga del 10%.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={stressScenario}
              onChange={e => setStressScenario(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100"
            >
              <option value="devaluacion_severa">Escenario 1: Devaluación Acelerada del Lempira (+15%)</option>
              <option value="shock_tpm_alta">Escenario 2: Shock de TPM al 9.5% por Presión Inflacionaria</option>
              <option value="sequia_agricola">Escenario 3: Sequía Severa y Mora Agroindustrial en Valle de Sula</option>
            </select>
            <button
              onClick={handleRunTest}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Activity className="w-4 h-4" /> Ejecutar Prueba de Estrés
            </button>
          </div>

          {testResult && (
            <div className="p-4 rounded-lg bg-slate-950 border border-rose-500/30 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">CAR Simulado Post-Shock:</span>
                <span className={`font-bold ${testResult.car >= 10.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.car}% (Mínimo: 10.0%)
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{testResult.msg}</p>
            </div>
          )}
        </div>

        {/* 6. Adopción Digital & 7. Remesas Familiares */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" /> 6. Banca Móvil Áureo & Token Digital
          </div>
          <p className="text-xs text-slate-400">
            {innovations?.digitalBanking?.appUsersCount.toLocaleString('es-HN')} usuarios activos con ahorro en ventanilla de {formatHNL(innovations?.digitalBanking?.costSavingsMonthlyHNL || 420000)}/mes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Globe2 className="w-4 h-4" /> 7. Alianza de Remesas Familiares Directas
          </div>
          <p className="text-xs text-slate-400">
            Acreditación directa en cuentas de ahorro con Western Union y MoneyGram captando {formatHNL(innovations?.remittanceAlliances?.monthlyCapturedRemittanceDepositsHNL || 18500000)} en depósitos frescos.
          </p>
        </div>

        {/* 9. Sindicaciones & 10. Subastas de Activos en Liquidación */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Briefcase className="w-4 h-4" /> 9. Sindicación de Mega-Créditos de Infraestructura
          </div>
          <p className="text-xs text-slate-400">
            Financiamiento conjunto de autopistas y parques eólicos con el BCIE y BID, limitando la exposición individual por deudor.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Building2 className="w-4 h-4" /> 10. Subastas M&A de Bancos en Liquidación
          </div>
          <p className="text-xs text-slate-400">
            Adquisición de carteras limpias y sucursales estratégicas de entidades intervenidas por la CNBS a precios con descuento de liquidación forzosa.
          </p>
        </div>
      </div>
    </div>
  );
}
