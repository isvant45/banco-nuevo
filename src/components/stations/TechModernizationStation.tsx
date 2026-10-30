import React from 'react';
import { GameState } from '../../game/types';
import { BankTechTreeTab } from '../BankTechTreeTab';
import { formatHNL } from '../../game/economyEngine';
import { Cpu, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

interface TechModernizationStationProps {
  state: GameState;
  onUnlockNode: (nodeId: string) => void;
}

export const TechModernizationStation: React.FC<TechModernizationStationProps> = ({
  state,
  onUnlockNode
}) => {
  const techTree = state.bankTechTree;
  const nodes = techTree?.nodes || [];
  const totalCapex = techTree?.totalCapexInvestedHNL || 0;
  const totalOpexSaved = techTree?.totalMonthlyOpexSavingsHNL || 0;
  const unlockedNodesCount = nodes.filter(n => n.isUnlocked).length;
  const cirEfficiency = state.financials.efficiencyRatioCIR || 48.2;

  return (
    <div className="space-y-6">
      {/* Header Institucional Estilo Bloomberg Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                ESTACIÓN 5
              </span>
              <span className="text-sm font-semibold text-white">
                Arquitectura Tecnológica & Eficiencia OPEX
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Árbol Tecnológico Bancario & Modernización del Core
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inversión de capital (CAPEX) en infraestructura digital y automatización de procesos para reducción permanente de gastos operativos (OPEX) y mejora del ratio Cost-to-Income (CIR).
            </p>
          </div>

          {/* Métricas consolidadas de modernización */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">CAPEX Invertido</div>
              <div className="font-mono font-bold text-slate-200 tabular-nums">
                {formatHNL(totalCapex)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Ahorro Mensual OPEX</div>
              <div className="font-mono font-bold text-emerald-400 tabular-nums flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {formatHNL(totalOpexSaved)}/mes
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Nivel Tech Digital</div>
              <div className="font-mono font-bold text-blue-400 tabular-nums flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Nivel {state.digitalTechLevel} / 5
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Nodos Desbloqueados</div>
              <div className="font-mono font-bold text-purple-400 tabular-nums flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                {unlockedNodesCount} de {nodes.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Árbol Tecnológico Principal */}
      <BankTechTreeTab
        state={state}
        onUnlockNode={onUnlockNode}
      />
    </div>
  );
};
