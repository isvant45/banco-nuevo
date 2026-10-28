import React, { useState } from 'react';
import { GameState, CampaignMission, CampaignChapter } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Unlock, 
  Award, 
  Sparkles, 
  Trophy, 
  Gift, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface CampaignMissionsTabProps {
  state: GameState;
  onClaimReward: (missionId: string) => void;
  onNavigateToTab?: (tabKey: string) => void;
}

export const CampaignMissionsTab: React.FC<CampaignMissionsTabProps> = ({
  state,
  onClaimReward,
  onNavigateToTab
}) => {
  const campaign = state.campaignState;
  const chapters = campaign?.chapters || [];

  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(
    campaign?.currentChapter || 1
  );

  const activeChapter = chapters.find(c => c.chapterNumber === selectedChapterNumber) || chapters[0];

  const totalMissions = chapters.reduce((sum, ch) => sum + ch.missions.length, 0);
  const completedMissions = chapters.reduce(
    (sum, ch) => sum + ch.missions.filter(m => m.isCompleted).length, 
    0
  );
  const claimedRewardsTotal = campaign?.totalRewardsClaimedHNL || 0;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal del Modo Campaña */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wide">
                Modo Campaña Estratégica 2026
              </span>
              <span className="text-xs font-mono text-slate-400">
                Hitos Institucionales & Crecimiento Bancario
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Capítulos de Conquista & Misiones del Banco
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Avanza a través de 4 etapas progresivas: desde la solvencia inicial hasta liderar la banca privada y el mercado nacional. Completa misiones para desbloquear capital extraordinario y bonos de reputación.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Progreso Global</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {completedMissions} / {totalMissions} Hitos
              </div>
              <div className="text-[10px] text-slate-400">
                Bonos cobrados: {formatHNL(claimedRewardsTotal)}
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Selector Horizontal de los 4 Capítulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {chapters.map((chapter) => {
            const isSelected = chapter.chapterNumber === selectedChapterNumber;
            const isUnlocked = chapter.isUnlocked;
            const isCompleted = chapter.isCompleted;
            const completedInChapter = chapter.missions.filter(m => m.isCompleted).length;
            const pct = Math.round((completedInChapter / chapter.missions.length) * 100);

            return (
              <button
                key={chapter.chapterNumber}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedChapterNumber(chapter.chapterNumber);
                }}
                className={`p-3.5 rounded-lg border text-left transition relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md'
                    : isUnlocked
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-semibold uppercase text-emerald-400">
                    Capítulo {chapter.chapterNumber}
                  </span>
                  {isCompleted ? (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-mono text-slate-400">
                      {completedInChapter}/{chapter.missions.length}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold truncate">
                  {chapter.title.split(': ')[1] || chapter.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {chapter.subtitle}
                </div>

                {/* Barra de progreso de capítulo */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Capítulo Activo y Lista de Misiones */}
      {activeChapter && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {activeChapter.title}
                  </h2>
                  {activeChapter.isCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      ¡Capítulo Conquistado!
                    </span>
                  )}
                  {!activeChapter.isUnlocked && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Requiere completar el capítulo anterior
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeChapter.objectiveSummary}
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                {activeChapter.missions.filter(m => m.isCompleted).length} de {activeChapter.missions.length} misiones cumplidas
              </div>
            </div>

            {/* Misiones del Capítulo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {activeChapter.missions.map((mission) => {
                const isCompleted = mission.isCompleted;
                const isClaimed = mission.isClaimed;
                const pct = Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100));

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      isClaimed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                        : isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isClaimed ? (
                            <CheckCircle2 className="w-4 h-4 text-slate-500" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">
                            {mission.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {mission.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Recompensa</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          +{formatHNL(mission.rewardHNL)}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          +{mission.rewardReputation} Reputación
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de la misión */}
                    <div>
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="text-slate-400">Objetivo:</span>
                        <span className="font-mono tabular-nums text-slate-200">
                          {mission.unit === 'HNL' ? formatHNL(mission.currentValue) : `${mission.currentValue.toLocaleString()} ${mission.unit}`}
                          {' / '}
                          {mission.unit === 'HNL' ? formatHNL(mission.targetValue) : `${mission.targetValue.toLocaleString()} ${mission.unit}`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Perk y Botón de Cobro */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 italic truncate" title={mission.rewardPerkLabel}>
                        🎁 {mission.rewardPerkLabel}
                      </span>

                      <div>
                        {isClaimed ? (
                          <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1">
                            Recompensa Cobrada
                          </span>
                        ) : isCompleted ? (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playVictoryFanfare();
                              onClaimReward(mission.id);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            Cobrar Recompensa
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500 px-2 py-1">
                            En progreso ({pct}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
