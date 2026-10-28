import React, { useState } from 'react';
import { GameState, TechTreeNode, BankTechTreeState } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Cpu, 
  Smartphone, 
  Gauge, 
  TrendingDown, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Sparkles,
  Server,
  DollarSign
} from 'lucide-react';

interface BankTechTreeTabProps {
  state: GameState;
  onUnlockNode: (nodeId: string) => void;
}

export const BankTechTreeTab: React.FC<BankTechTreeTabProps> = ({
  state,
  onUnlockNode
}) => {
  const techTree = state.bankTechTree;
  const nodes = techTree?.nodes || [];

  const [selectedBranch, setSelectedBranch] = useState<
    'todos' | 'canales_digitales' | 'motor_scoring' | 'eficiencia_opex' | 'tesoreria_avanzada'
  >('todos');

  const branches = [
    { id: 'todos', name: 'Todas las Ramas', icon: Layers },
    { id: 'canales_digitales', name: 'Canales Digitales', icon: Smartphone },
    { id: 'motor_scoring', name: 'Motor Scoring & Riesgo', icon: Gauge },
    { id: 'eficiencia_opex', name: 'Eficiencia Operativa', icon: TrendingDown },
    { id: 'tesoreria_avanzada', name: 'Tesorería & Sindicación', icon: Server }
  ] as const;

  const filteredNodes = selectedBranch === 'todos'
    ? nodes
    : nodes.filter(n => n.branch === selectedBranch);

  const totalCapex = techTree?.totalCapexInvestedHNL || 0;
  const totalOpexSaved = techTree?.totalMonthlyOpexSavingsHNL || 0;
  const unlockedCount = nodes.filter(n => n.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Encabezado del Árbol Tecnológico */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wide">
                Arquitectura Tecnológica & Core Modernization
              </span>
              <span className="text-xs font-mono text-slate-400">
                12 Nodos Tecnológicos en 4 Ramas Estratégicas
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Árbol Tecnológico Bancario (Tech Tree)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Invierte capital (CAPEX) en infraestructura digital y automatización algorítmica para reducir permanentemente el gasto operativo (OPEX) y desbloquear capacidades exclusivas de originación.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Ahorro OPEX Mensual</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{formatHNL(totalOpexSaved)}/mes
              </div>
              <div className="text-[10px] text-slate-400">
                CAPEX Invertido: {formatHNL(totalCapex)} ({unlockedCount}/12 Nodos)
              </div>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filtros de Ramas Tecnológicas */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800/80">
          {branches.map(b => {
            const Icon = b.icon;
            const isSelected = selectedBranch === b.id;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => { sound.playClick(); setSelectedBranch(b.id); }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Nodos Tecnológicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isUnlocked = node.isUnlocked;
          // Validar si los prerrequisitos están cumplidos
          const prereqsMet = node.prerequisites.every(preId => {
            const preNode = nodes.find(n => n.id === preId);
            return preNode?.isUnlocked;
          });
          const canAfford = state.financials.cashAndBCHReserves >= node.capexCostHNL;

          return (
            <div
              key={node.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                  : prereqsMet
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    node.tier === 1 
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' 
                      : node.tier === 2 
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    Tier {node.tier} · {node.branch.replace(/_/g, ' ')}
                  </span>

                  {isUnlocked ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activo (Mes {node.unlockedAtMonth || 1})
                    </span>
                  ) : prereqsMet ? (
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 font-mono">
                      <Unlock className="w-3.5 h-3.5" /> Disponible
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Lock className="w-3.5 h-3.5" /> Prerrequisito Requerido
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">
                  {node.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {node.description}
                </p>

                {/* Beneficio permanente del Perk */}
                <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Beneficio Permanente:
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {node.unlockedPerkDescription}
                  </div>
                </div>
              </div>

              {/* Métricas Financieras y Botón de Desbloqueo */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Costo Inversión (CAPEX):</span>
                    <strong className="text-white">{formatHNL(node.capexCostHNL)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Ahorro OPEX Permanente:</span>
                    <strong className="text-emerald-400">+{formatHNL(node.monthlyOpexSavingsHNL)}/mes</strong>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="w-full py-2 bg-emerald-950/40 text-emerald-300 text-center text-xs font-bold rounded-lg border border-emerald-800/50">
                    Tecnología en Producción
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playApprovalStamp();
                      onUnlockNode(node.id);
                    }}
                    disabled={!prereqsMet || !canAfford}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {!prereqsMet ? 'Completa el nivel anterior' : !canAfford ? 'Liquidez Insuficiente' : 'Implementar Tecnología'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
