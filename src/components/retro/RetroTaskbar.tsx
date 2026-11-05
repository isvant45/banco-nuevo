import React, { useState } from 'react';
import { sound } from '../../game/audioFx';

export interface WindowInfo {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
}

interface RetroTaskbarProps {
  windows: WindowInfo[];
  activeWindowId: string | null;
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  isDayClosed: boolean;
  onToggleWindow: (id: string) => void;
  onOpenWindow: (id: string) => void;
  onAdvanceDay: () => void;
  onAdvanceDays?: (days: number) => void;
  onOpenNewGame: () => void;
  onOpenAuditReport: () => void;
}

export const RetroTaskbar: React.FC<RetroTaskbarProps> = ({
  windows,
  activeWindowId,
  currentDay,
  currentMonth,
  currentYear,
  isDayClosed,
  onToggleWindow,
  onOpenWindow,
  onAdvanceDay,
  onAdvanceDays,
  onOpenNewGame,
  onOpenAuditReport
}) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <>
      {/* Menú Inicio Desplegable */}
      {isStartMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-10 left-0 w-64 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl z-50 flex"
        >
          {/* Banda lateral azul vertical */}
          <div className="w-8 bg-gradient-to-t from-[#000080] to-[#1084d0] flex items-end justify-center pb-4">
            <span className="text-white font-bold text-xs tracking-widest transform -rotate-90 origin-bottom-left whitespace-nowrap">
              BANK 2000 OS
            </span>
          </div>

          {/* Opciones del menú */}
          <div className="flex-1 py-1 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setIsStartMenuOpen(false);
                onOpenNewGame();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#000080] hover:text-white"
            >
              <span className="text-sm">⭐</span>
              <span className="font-semibold">Nueva Partida (Cambiar Rol / Rubro)...</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsStartMenuOpen(false);
                onOpenAuditReport();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#000080] hover:text-white"
            >
              <span className="text-sm">📊</span>
              <span>Auditoría & Estados Financieros</span>
            </button>

            <div className="border-t border-[#808080] my-1 border-b border-white" />

            <button
              onClick={() => {
                sound.playClick();
                handleToggleSound();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#000080] hover:text-white"
            >
              <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
              <span>Sonido del Sistema: {isMuted ? 'Silenciado' : 'Activado'}</span>
            </button>

            <div className="border-t border-[#808080] my-1 border-b border-white" />

            <div className="px-3 py-1.5 text-[11px] text-slate-600 bg-[#dfdfdf]">
              Simulador Bancario y Empresarial v2.0
            </div>
          </div>
        </div>
      )}

      {/* Barra de Tareas Inferior */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white border-b border-[#404040] flex items-center justify-between px-1 z-40 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 mr-2">
          {/* Botón de Inicio */}
          <button
            onClick={() => {
              sound.playClick();
              setIsStartMenuOpen(!isStartMenuOpen);
            }}
            className={`h-7 px-2.5 flex items-center gap-1.5 font-bold text-xs ${
              isStartMenuOpen
                ? 'bg-[#b0b0b0] border-t-2 border-l-2 border-[#404040] border-b-2 border-r-2 border-white'
                : 'bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] active:border-t-2 active:border-l-2 active:border-[#404040] active:border-b-2 active:border-r-2 active:border-white'
            }`}
          >
            <span className="text-sm">🪟</span>
            <span>Inicio</span>
          </button>

          <div className="h-5 w-[2px] bg-[#808080] border-r border-white mx-0.5" />

          {/* Botones de Ventanas Abiertas */}
          {windows.map((win) => {
            const isActive = win.isOpen && !win.isMinimized && activeWindowId === win.id;
            return (
              <button
                key={win.id}
                onClick={() => {
                  sound.playClick();
                  onToggleWindow(win.id);
                }}
                className={`h-7 px-2 max-w-[170px] truncate flex items-center gap-1.5 text-xs text-left ${
                  isActive
                    ? 'bg-[#e0e0e0] font-bold border-t-2 border-l-2 border-[#404040] border-b-2 border-r-2 border-white'
                    : 'bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040]'
                }`}
                title={win.title}
              >
                <span className="text-xs shrink-0">{win.icon}</span>
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>

        {/* Bandeja del Sistema y Botones de Avance de Jornada / Tiempo */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón 1 Día */}
          <button
            onClick={() => {
              sound.playApprovalStamp();
              onAdvanceDay();
            }}
            title="Concluir el día laboral actual y calcular cuadre contable (1 Día)"
            className="h-7 px-2.5 bg-[#1084d0] hover:bg-[#000080] text-white font-bold text-xs flex items-center gap-1 border-t border-l border-white border-b border-r border-[#000040] shadow-sm transition-colors"
          >
            <span>▶</span>
            <span>1 Día</span>
          </button>

          {/* Botón 15 Días (Quincena) */}
          {onAdvanceDays && (
            <button
              onClick={() => {
                sound.playApprovalStamp();
                onAdvanceDays(15);
              }}
              title="Avanzar 15 Días (1 Quincena): Ejecuta obras, nómina y refresca licitaciones y ofertas de los 4 bancos"
              className="h-7 px-2 bg-[#008080] hover:bg-[#004e4e] text-white font-bold text-xs flex items-center gap-1 border-t border-l border-white border-b border-r border-[#003333] shadow-sm transition-colors"
            >
              <span>▶▶</span>
              <span>15 Días</span>
            </button>
          )}

          {/* Botón 1 Mes (30 Días) */}
          {onAdvanceDays && (
            <button
              onClick={() => {
                sound.playApprovalStamp();
                onAdvanceDays(30);
              }}
              title="Avanzar 1 Mes (30 Días): Ciclo mensual completo, facturación de hitos y balance"
              className="h-7 px-2 bg-[#2d5a27] hover:bg-[#1a3816] text-white font-bold text-xs flex items-center gap-1 border-t border-l border-white border-b border-r border-[#0e200c] shadow-sm transition-colors"
            >
              <span>▶▶▶</span>
              <span>1 Mes</span>
            </button>
          )}

          {/* Bandeja Reloj y Estado */}
          <div className="h-7 px-2.5 bg-[#c0c0c0] border-t border-l border-[#808080] border-b border-r border-white flex items-center gap-2 text-xs font-mono">
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              className="text-xs hover:opacity-80"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <span className="text-slate-800 font-bold whitespace-nowrap">
              Día {currentDay} · Mes {currentMonth} ({currentYear})
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
