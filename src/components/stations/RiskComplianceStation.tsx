import React, { useState } from 'react';
import { GameState } from '../../game/types';
import { CreditRiskDashboard } from '../CreditRiskDashboard';
import { AmlFraudComplianceHub } from '../AmlFraudComplianceHub';
import { PolicySandboxPanel } from '../PolicySandboxPanel';
import { DividendRankingDashboard } from '../DividendRankingDashboard';
import { sound } from '../../game/audioFx';
import { 
  ShieldAlert, 
  Search, 
  Sliders, 
  Award,
  AlertTriangle
} from 'lucide-react';

interface RiskComplianceStationProps {
  state: GameState;
  initialSubView?: 'credit_risk' | 'aml_compliance' | 'sandbox_sar' | 'dividends';
  onRestructureLoan: (clientId: string) => void;
  onSellNPLToCompetitor: (clientId: string, buyerBank: string, discountPct: number) => void;
  onNegotiateDebtWorkout?: (clientId: string, workoutType: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => void;
  onUpdateState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenExecutiveDilemmas?: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const RiskComplianceStation: React.FC<RiskComplianceStationProps> = ({
  state,
  initialSubView = 'credit_risk',
  onRestructureLoan,
  onSellNPLToCompetitor,
  onNegotiateDebtWorkout,
  onUpdateState,
  onOpenExecutiveDilemmas,
  onNavigateTab
}) => {
  const [subView, setSubView] = useState<'credit_risk' | 'aml_compliance' | 'sandbox_sar' | 'dividends'>(initialSubView);

  const nplRatio = state.financials.delinquencyRatioNPL;
  const amlPendingAlerts = (state.amlCompliance?.alerts || []).filter(a => a.status === 'abierta' || a.status === 'en_analisis').length;
  const pendingDilemmasCount = (state.executiveDilemmas?.dilemmas || []).filter(d => d.status === 'pendiente').length;

  const subViews = [
    { 
      id: 'credit_risk', 
      label: 'Riesgo Crediticio CNBS', 
      icon: ShieldAlert, 
      count: `${nplRatio.toFixed(2)}% NPL` 
    },
    { 
      id: 'aml_compliance', 
      label: 'Prevención Fraudes & AML UIF', 
      icon: Search, 
      count: `${amlPendingAlerts} Alertas` 
    },
    { 
      id: 'sandbox_sar', 
      label: 'Sandbox Fiscal & Scoring SAR', 
      icon: Sliders, 
      count: 'Parámetros' 
    },
    { 
      id: 'dividends', 
      label: 'Gobierno & Dividendos', 
      icon: Award, 
      count: '10 Años Hist.' 
    }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Selector de Sub-Estación Estilo Bloomberg Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded">
            ESTACIÓN 4
          </span>
          <span className="text-sm font-semibold text-white">
            Auditoría Prudencial CNBS, AML & Gobierno Corporativo
          </span>
        </div>

        {/* Botones de navegación contextual + Botón de Dilemas de Directorio */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenExecutiveDilemmas && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenExecutiveDilemmas();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Dilemas Directorio</span>
              {pendingDilemmasCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingDilemmasCount}
                </span>
              )}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {subViews.map((v) => {
              const Icon = v.icon;
              const isActive = subView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    sound.playClick();
                    setSubView(v.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>{v.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 ml-0.5">· {v.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Renderizado de la Sub-Estación Seleccionada */}
      {subView === 'credit_risk' && (
        <CreditRiskDashboard
          state={state}
          onRestructureLoan={onRestructureLoan}
          onSellNPLToCompetitor={onSellNPLToCompetitor}
          onNegotiateWorkout={onNegotiateDebtWorkout}
        />
      )}

      {subView === 'aml_compliance' && (
        <AmlFraudComplianceHub
          state={state}
          onUpdateState={onUpdateState}
        />
      )}

      {subView === 'sandbox_sar' && (
        <PolicySandboxPanel
          state={state}
          onUpdateState={onUpdateState}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subView === 'dividends' && (
        <DividendRankingDashboard
          state={state}
          onUpdateState={onUpdateState}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
