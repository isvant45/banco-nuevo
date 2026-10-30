import React, { useState } from 'react';
import { GameState } from '../../game/types';
import { BankRankingsLeagueTab } from '../BankRankingsLeagueTab';
import { CampaignMissionsTab } from '../CampaignMissionsTab';
import { CompetitorArenaTab } from '../CompetitorArenaTab';
import { OverviewDashboard } from '../OverviewDashboard';
import { sound } from '../../game/audioFx';
import { Trophy, Target, Swords, LayoutDashboard } from 'lucide-react';

interface TerminalMarketStationProps {
  state: GameState;
  initialSubView?: 'rankings' | 'campaign' | 'territory' | 'overview';
  onClaimCampaignReward: (missionId: string) => void;
  onExecuteMarketOffensive: (
    departmentId: string, 
    offensiveType: 'tasas_agresivas' | 'tarjetas_promocionales' | 'captacion_masiva'
  ) => void;
  onSetMarketing: (marketing: GameState['marketingAggressiveness']) => void;
  onNavigateToTab: (tabId: string) => void;
}

export const TerminalMarketStation: React.FC<TerminalMarketStationProps> = ({
  state,
  initialSubView = 'rankings',
  onClaimCampaignReward,
  onExecuteMarketOffensive,
  onSetMarketing,
  onNavigateToTab
}) => {
  const [subView, setSubView] = useState<'rankings' | 'campaign' | 'territory' | 'overview'>(initialSubView);

  const subViews = [
    { id: 'rankings', label: 'League Tables & Rankings', icon: Trophy, count: '4 Tableros' },
    { id: 'campaign', label: 'Campaña & Misiones', icon: Target, count: `Cap. ${state.campaignState?.currentChapter || 1}` },
    { id: 'territory', label: 'Arena Territorial', icon: Swords, count: '5 Deptos' },
    { id: 'overview', label: 'Resumen Ejecutivo', icon: LayoutDashboard, count: 'Cockpit' }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Selector de Sub-Estación Estilo Bloomberg Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
            ESTACIÓN 1
          </span>
          <span className="text-sm font-semibold text-white">
            Mercado Competitivo & Inteligencia Estratégica
          </span>
        </div>

        {/* Botones de navegación contextual */}
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
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{v.label}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-0.5">· {v.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderizado de la Sub-Estación Seleccionada */}
      {subView === 'rankings' && (
        <BankRankingsLeagueTab
          state={state}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {subView === 'campaign' && (
        <CampaignMissionsTab
          state={state}
          onClaimReward={onClaimCampaignReward}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {subView === 'territory' && (
        <CompetitorArenaTab
          state={state}
          onExecuteOffensive={onExecuteMarketOffensive}
        />
      )}

      {subView === 'overview' && (
        <OverviewDashboard
          state={state}
          onSetMarketing={onSetMarketing}
          onNavigateTab={onNavigateToTab}
        />
      )}
    </div>
  );
};
