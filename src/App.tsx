import React, { useState, useEffect } from 'react';
import { GameState } from './game/types';
import { INITIAL_GAME_STATE } from './game/initialState';
import { startNewGame } from './game/economyEngine';
import type { GameSetupProfile } from './game/types';
import { RetailSectorId } from './game/retroSimTypes';
import { AuditedRegulatoryReportModal } from './components/analytics/AuditedRegulatoryReportModal';
import { RetroDesktop } from './components/retro/RetroDesktop';
import { RetroTitleScreen } from './components/retro/RetroTitleScreen';
import { restoreGameState } from './game/savedState';

const STORAGE_KEY = 'aureo-bank-sim-state-v5';
const RETRO_SECTOR_KEY = 'aureo-bank-retro-sector-v1';

export default function App() {
  const [isAuditedReportModalOpen, setIsAuditedReportModalOpen] = useState<boolean>(false);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return restoreGameState(parsed);
      }
    } catch {
      // Ignorar error al parsear storage
    }
    return INITIAL_GAME_STATE;
  });

  const [retroSector, setRetroSector] = useState<RetailSectorId>(() => {
    try {
      const savedSector = localStorage.getItem(RETRO_SECTOR_KEY) as RetailSectorId | null;
      if (savedSector) return savedSector;
    } catch {
      // fallback
    }
    const firstEnterprise = gameState.enterprises?.[0];
    if (firstEnterprise?.sector === 'construccion') return 'constructora';
    if (firstEnterprise?.sector === 'agroindustria_cafe') return 'bar_restaurante';
    return 'minimarket';
  });

  // Persistir en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      localStorage.setItem(RETRO_SECTOR_KEY, retroSector);
    } catch {
      // Storage lleno o privado
    }
  }, [gameState, retroSector]);

  const handleStartNewGame = (setup: GameSetupProfile, sector: RetailSectorId) => {
    const newState = startNewGame(setup);
    setGameState(newState);
    setRetroSector(sector);
    try {
      localStorage.setItem(RETRO_SECTOR_KEY, sector);
    } catch {
      // ignore
    }
  };

  // 1. Pantalla de Bienvenida Retro OS (Continuar vs Nueva Partida)
  if (showTitleScreen) {
    const hasSaved = !!localStorage.getItem(STORAGE_KEY);
    const role: 'empresario' | 'banquero' = gameState.roleMode === 'empresario' ? 'empresario' : 'banquero';
    const firstEnterprise = gameState.enterprises?.[0];
    const savedDetails = {
      name: firstEnterprise?.name || (role === 'empresario' ? (retroSector === 'constructora' ? 'Constructora Metropolitana' : 'Minimarket San Pedro') : 'Áureo Bank Honduras'),
      role,
      day: 1,
      month: gameState.gameMonth || 1,
      year: gameState.bch.year || 2026
    };

    return (
      <RetroTitleScreen
        hasSavedGame={hasSaved}
        savedGameDetails={savedDetails}
        onContinueGame={() => {
          setShowTitleScreen(false);
        }}
        onStartNewGame={(params) => {
          const isConstructora = params.retailSector === 'constructora';
          const setupProf: GameSetupProfile = {
            founderName: 'Director Ejecutivo',
            entityName: params.entityName,
            roleMode: params.roleMode,
            startingCity: params.city,
            difficulty: 'estandar',
            initialCapitalHNL: params.roleMode === 'empresario' ? (isConstructora ? 1850000 : 50000) : 850000,
            isCustomGame: true
          };
          handleStartNewGame(setupProf, params.retailSector);
          setShowTitleScreen(false);
        }}
      />
    );
  }

  // 2. Sistema Operativo Retro Completo (Bank 2000 & Business Simulator Desktop)
  const role: 'empresario' | 'banquero' = gameState.roleMode === 'empresario' ? 'empresario' : 'banquero';
  const firstEnterprise = gameState.enterprises?.[0];
  const name = firstEnterprise?.name || (role === 'empresario' ? (retroSector === 'constructora' ? 'Constructora Metropolitana' : 'Minimarket San Pedro') : 'Áureo Bank Honduras');

  return (
    <div className="w-screen h-screen overflow-hidden">
      <RetroDesktop
        initialRole={role}
        initialSector={retroSector}
        initialName={name}
        onOpenAuditReport={() => setIsAuditedReportModalOpen(true)}
        onReturnToTitle={() => setShowTitleScreen(true)}
      />

      {/* Modal de Auditoría Integral Regulada */}
      {isAuditedReportModalOpen && (
        <AuditedRegulatoryReportModal
          state={gameState}
          onClose={() => setIsAuditedReportModalOpen(false)}
        />
      )}
    </div>
  );
}
