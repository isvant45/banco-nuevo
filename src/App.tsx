import React, { useState, useEffect } from 'react';
import { GameState } from './game/types';
import { INITIAL_GAME_STATE } from './game/initialState';
import { restoreGameState } from './game/savedState';
import { RetroDesktop } from './components/retro/RetroDesktop';
import { RetroTitleScreen } from './components/retro/RetroTitleScreen';
import { AuditedRegulatoryReportModal } from './components/analytics/AuditedRegulatoryReportModal';
import { RetailSectorId, RetroRoleMode } from './game/retroSimTypes';

const STORAGE_KEY = 'aureo-bank-sim-state-v6';
const RETRO_ROLE_KEY = 'aureo-retro-role-mode-v2';
const RETRO_SECTOR_KEY = 'aureo-retro-sector-mode-v2';

export default function App() {
  const [isAuditedReportModalOpen, setIsAuditedReportModalOpen] = useState<boolean>(false);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(false);

  const [roleMode, setRoleMode] = useState<RetroRoleMode>(() => {
    try {
      const saved = localStorage.getItem(RETRO_ROLE_KEY);
      if (saved === 'empresario' || saved === 'banquero' || saved === 'grupo_empresarial') {
        return saved;
      }
    } catch {
      // Storage no disponible
    }
    return 'empresario';
  });

  const [retailSector, setRetailSector] = useState<RetailSectorId>(() => {
    try {
      const saved = localStorage.getItem(RETRO_SECTOR_KEY);
      if (saved === 'minimarket' || saved === 'constructora' || saved === 'supermercado' || saved === 'autolote' || saved === 'bar_restaurante') {
        return saved;
      }
    } catch {
      // Storage no disponible
    }
    return 'minimarket';
  });

  const [entityName, setEntityName] = useState<string>(() => {
    return roleMode === 'empresario'
      ? (retailSector === 'constructora'
          ? 'Constructora Metropolitana'
          : retailSector === 'supermercado'
          ? 'Supermercados del Norte'
          : retailSector === 'autolote'
          ? 'Autolote El Diamante'
          : 'Minimarket San Pedro')
      : roleMode === 'banquero'
      ? 'Áureo Bank Honduras S.A.'
      : 'Grupo Financiero & Empresarial Áureo';
  });

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

  // Guardar rol y sector en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(RETRO_ROLE_KEY, roleMode);
      localStorage.setItem(RETRO_SECTOR_KEY, retailSector);
    } catch {
      // Storage lleno
    }
  }, [roleMode, retailSector]);

  const handleStartNewGameFromTitle = (params: {
    roleMode: RetroRoleMode;
    retailSector: RetailSectorId;
    entityName: string;
    city: string;
  }) => {
    setRoleMode(params.roleMode);
    setRetailSector(params.retailSector);
    setEntityName(params.entityName);
    setShowTitleScreen(false);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#008080]">
      {showTitleScreen ? (
        <RetroTitleScreen
          hasSavedGame={true}
          savedGameDetails={{
            name: entityName,
            role: roleMode,
            day: 1,
            month: gameState.gameMonth,
            year: 2026
          }}
          onContinueGame={() => setShowTitleScreen(false)}
          onStartNewGame={handleStartNewGameFromTitle}
        />
      ) : (
        <RetroDesktop
          key={`${roleMode}-${retailSector}-${entityName}`}
          initialRole={roleMode}
          initialSector={retailSector}
          initialName={entityName}
          onOpenAuditReport={() => setIsAuditedReportModalOpen(true)}
          onReturnToTitle={() => setShowTitleScreen(true)}
        />
      )}

      {/* Modal de Auditoría Regulada BCH & CNBS */}
      {isAuditedReportModalOpen && (
        <AuditedRegulatoryReportModal
          state={gameState}
          onClose={() => setIsAuditedReportModalOpen(false)}
        />
      )}
    </div>
  );
}

