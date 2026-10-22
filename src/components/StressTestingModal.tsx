import React, { useState } from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  TrendingDown, 
  Layers
} from 'lucide-react';

interface StressTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onRunStressTest: (scenario: 'cafe_remesas' | 'fed_rate_hike' | 'sequia_agro') => void;
}

export const StressTestingModal: React.FC<StressTestingModalProps> = ({
  isOpen,
  onClose,
  state,
  onRunStressTest
}) => {
  if (!isOpen) return null;

  const [selectedScenario, setSelectedScenario] = useState<'cafe_remesas' | 'fed_rate_hike' | 'sequia_agro'>('cafe_remesas');
  const [result, setResult] = useState<{
    simCAR: number;
    simLCR: number;
    provIncreaseHNL: number;
    capitalGapHNL: number;
    analysis: string;
  } | null>(null);

  const car = state.financials.capitalAdequacyRatioCAR;
  const lcr = state.financials.liquidityCoverageRatioLCR;

  const handleExecuteScenario = () => {
    sound.playWarningChime();
    onRunStressTest(selectedScenario);

    if (selectedScenario === 'cafe_remesas') {
      setResult({
        simCAR: +(car - 2.4).toFixed(1),
        simLCR: +(lcr - 22.0).toFixed(1),
        provIncreaseHNL: 14500000,
        capitalGapHNL: car - 2.4 < 10.0 ? Math.round((10.0 - (car - 2.4)) * 25000000) : 0,
        analysis: 'Choque de caída del 20% en café y remesas: Aumento en mora comercial en Valle de Sula y Comayagua. Requiere constituir L. 14.5M en provisiones adicionales.'
      });
    } else if (selectedScenario === 'fed_rate_hike') {
      setResult({
        simCAR: +(car - 1.8).toFixed(1),
        simLCR: +(lcr - 18.0).toFixed(1),
        provIncreaseHNL: 9800000,
        capitalGapHNL: 0,
        analysis: 'Alza agresiva de la Reserva Federal: Presión devaluatoria sobre el Lempira y aumento del costo de corresponsalía en Dólares. LCR se mantiene sobre 100%.'
      });
    } else {
      setResult({
        simCAR: +(car - 3.1).toFixed(1),
        simLCR: +(lcr - 25.0).toFixed(1),
        provIncreaseHNL: 21000000,
        capitalGapHNL: car - 3.1 < 10.0 ? Math.round((10.0 - (car - 3.1)) * 30000000) : 0,
        analysis: 'Sequía severa en el Corredor Seco y Pérdidas Agrícolas: Impacta la cartera PYME agropecuaria y cooperativas. Exige refuerzo de provisiones anticíclicas.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-rose-400">
                  Pruebas de Estrés Regulatorias CNBS
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-semibold">Basilea III</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Simulador de Choques Macroeconómicos Severos
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Selector de Escenarios */}
          <div>
            <label className="block text-slate-300 font-bold mb-2">
              Seleccionar Escenario de Estrés Macroeconómico:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('cafe_remesas');
                  setResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScenario === 'cafe_remesas'
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-sm text-amber-300">1. Café & Remesas</span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Caída del 20% en cosechas y desaceleración de envíos desde EE.UU.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('fed_rate_hike');
                  setResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScenario === 'fed_rate_hike'
                    ? 'bg-blue-500/20 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-sm text-blue-300">2. Fed Rate Hike USD</span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Salida de capitales y presión cambiaria sobre el Lempira.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario('sequia_agro');
                  setResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScenario === 'sequia_agro'
                    ? 'bg-rose-500/20 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-sm text-rose-300">3. Sequía Corredor Seco</span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pérdidas severas en agricultura y ganadería de Choluteca y Olancho.
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block font-medium">Línea Base Actual de Áureo Bank:</span>
              <span className="font-mono text-white text-sm font-bold">
                CAR: {formatPct(car)} · LCR: {lcr}% · Provisiones: L. 54.8M
              </span>
            </div>
            <button
              onClick={handleExecuteScenario}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ejecutar Simulación de Choque</span>
            </button>
          </div>

          {/* Resultado de la Prueba de Estrés */}
          {result && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  Impacto Proyectado en Solvencia y Liquidez
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                  Normativa CNBS Res. 124-2026
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CAR Simulado</span>
                  <span className={`text-base font-extrabold ${result.simCAR >= 10.0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {result.simCAR}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Mínimo CNBS 10%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LCR Liquidez</span>
                  <span className={`text-base font-extrabold ${result.simLCR >= 100.0 ? 'text-blue-400' : 'text-rose-400'}`}>
                    {result.simLCR}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Mínimo 100%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Provisiones Adicionales</span>
                  <span className="text-base font-extrabold text-rose-400">
                    +{formatHNL(result.provIncreaseHNL)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Impacto a resultados</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Brecha de Capital</span>
                  <span className={`text-base font-extrabold ${result.capitalGapHNL === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.capitalGapHNL === 0 ? 'L. 0.00' : formatHNL(result.capitalGapHNL)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {result.capitalGapHNL === 0 ? 'Solvente' : 'Déficit de Capital'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-white block mb-0.5">Dictamen de Riesgo CNBS:</strong>
                {result.analysis}
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
