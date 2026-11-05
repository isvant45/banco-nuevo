import React, { useState } from 'react';
import { RetailSectorId, RetroRoleMode } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface RetroTitleScreenProps {
  hasSavedGame: boolean;
  savedGameDetails?: {
    name: string;
    role: RetroRoleMode;
    day: number;
    month: number;
    year: number;
  };
  onContinueGame: () => void;
  onStartNewGame: (params: {
    roleMode: RetroRoleMode;
    retailSector: RetailSectorId;
    entityName: string;
    city: string;
  }) => void;
}

export const RetroTitleScreen: React.FC<RetroTitleScreenProps> = ({
  hasSavedGame,
  savedGameDetails,
  onContinueGame,
  onStartNewGame
}) => {
  const [isNewGameWizardOpen, setIsNewGameWizardOpen] = useState(false);
  const [roleMode, setRoleMode] = useState<RetroRoleMode>('empresario');
  const [retailSector, setRetailSector] = useState<RetailSectorId>('minimarket');
  const [entityName, setEntityName] = useState('Minimarket San Pedro');
  const [city, setCity] = useState('San Pedro Sula');

  const handleSelectRole = (mode: RetroRoleMode) => {
    sound.playClick();
    setRoleMode(mode);
    if (mode === 'empresario') {
      if (retailSector === 'minimarket') setEntityName('Minimarket San Pedro');
      else if (retailSector === 'constructora') setEntityName('Constructora Metropolitana');
      else if (retailSector === 'supermercado') setEntityName('Supermercados del Norte');
      else if (retailSector === 'autolote') setEntityName('Autolote El Diamante');
      else setEntityName('Taberna & Café El Portal');
    } else if (mode === 'banquero') {
      setEntityName('Áureo Bank Honduras S.A.');
    } else {
      setEntityName('Grupo Financiero & Empresarial Áureo');
    }
  };

  const handleSelectSector = (sec: RetailSectorId) => {
    sound.playClick();
    setRetailSector(sec);
    if (sec === 'minimarket') setEntityName('Minimarket San Pedro');
    else if (sec === 'constructora') setEntityName('Constructora Metropolitana');
    else if (sec === 'supermercado') setEntityName('Supermercados del Norte');
    else if (sec === 'autolote') setEntityName('Autolote El Diamante');
    else setEntityName('Taberna & Café El Portal');
  };

  const handleLaunchGame = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playMonthEndBell();
    onStartNewGame({
      roleMode,
      retailSector,
      entityName: entityName.trim() || (roleMode === 'empresario' ? 'Mi Negocio' : (roleMode === 'banquero' ? 'Mi Banco' : 'Mi Holding')),
      city
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#008080] flex items-center justify-center p-4 font-sans select-none">
      {/* Ventana Principal de Bienvenida Windows 98 / 2000 */}
      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Barra de Título */}
        <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2.5 py-1.5 flex items-center justify-between border-b border-[#808080]">
          <div className="flex items-center gap-2 font-bold text-xs tracking-wider">
            <span className="text-base">🪟</span>
            <span>BANK 2000 & BUSINESS SIMULATOR — SISTEMA OPERATIVO v2.5</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">EDICIÓN EJECUTIVA</span>
        </div>

        {/* Pantalla Inicial (Continuar vs Nueva Partida) */}
        {!isNewGameWizardOpen ? (
          <div className="p-6 bg-[#dfdfdf] space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 border border-[#808080] shadow-inner">
              <div className="w-16 h-16 bg-[#000080] text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0 border border-white">
                B2K
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Simulador de Negocios & Banca Realista
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Elige dirigir tu propio comercio minorista o administrar un banco de créditos con garantías reales. Cada modo es 100% independiente y libre de complejidades innecesarias.
                </p>
              </div>
            </div>

            {/* Opciones de Continuar o Nueva Partida */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Continuar Partida */}
              <div className="bg-[#f0f0f0] border-2 border-[#808080] p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-2xl block mb-2">💾</span>
                  <h3 className="font-bold text-slate-900 text-sm">Continuar Partida Guardada</h3>
                  {hasSavedGame && savedGameDetails ? (
                    <div className="mt-2 text-xs text-slate-700 bg-white p-2 border border-slate-300 font-mono">
                      <div className="font-bold text-blue-900">{savedGameDetails.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Rol: {savedGameDetails.role === 'empresario' ? '🏪 Empresario' : '🏦 Banquero'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Día {savedGameDetails.day}, Mes {savedGameDetails.month} ({savedGameDetails.year})
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">
                      No se detectaron partidas previas. Inicia una nueva partida para comenzar tu carrera empresarial.
                    </p>
                  )}
                </div>

                <button
                  disabled={!hasSavedGame}
                  onClick={() => {
                    sound.playApprovalStamp();
                    onContinueGame();
                  }}
                  className="mt-4 w-full py-2 bg-[#1084d0] hover:bg-[#000080] text-white font-bold text-xs border-t border-l border-white border-b border-r border-[#000040] shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span>▶</span>
                  <span>Cargar y Continuar</span>
                </button>
              </div>

              {/* Nueva Partida */}
              <div className="bg-[#f0f0f0] border-2 border-[#808080] p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-2xl block mb-2">⭐</span>
                  <h3 className="font-bold text-slate-900 text-sm">Iniciar Nueva Partida</h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Comienza desde cero eligiendo ser <strong>100% Empresario</strong> (ventas, mostrador y stock) o <strong>100% Banco</strong> (créditos y garantías).
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsNewGameWizardOpen(true);
                  }}
                  className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>🚀</span>
                  <span>Nueva Partida</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Asistente de Selección Exclusiva de Rol (100% Empresario vs 100% Banco) */
          <form onSubmit={handleLaunchGame} className="p-5 bg-[#dfdfdf] space-y-4 text-xs">
            <div className="border-b border-[#808080] pb-2">
              <h2 className="text-sm font-bold text-slate-900">Configuración de Rol: Tres Etapas Separadas</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Selecciona tu modalidad. Cada etapa y negocio está 100% aislado con sus propias herramientas.
              </p>
            </div>

            {/* Tres tarjetas de etapas 100% separadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Etapa 1: Empresario */}
              <div
                onClick={() => handleSelectRole('empresario')}
                className={`p-3 border-2 cursor-pointer flex flex-col justify-between ${
                  roleMode === 'empresario'
                    ? 'bg-amber-50 border-amber-600 shadow-inner ring-1 ring-amber-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏪</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 border bg-amber-200 text-amber-900 border-amber-400">
                      ETAPA 1
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">Empresario / Negocio</h3>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Diriges tu propio comercio. Eliges un único rubro aislado: tienda, constructora, súper o autolote.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-amber-900 font-semibold bg-amber-100/70 p-1 border border-amber-200">
                  ✓ Aislamiento total de herramientas
                </div>
              </div>

              {/* Etapa 2: Banco */}
              <div
                onClick={() => handleSelectRole('banquero')}
                className={`p-3 border-2 cursor-pointer flex flex-col justify-between ${
                  roleMode === 'banquero'
                    ? 'bg-blue-50 border-blue-600 shadow-inner ring-1 ring-blue-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏦</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 border bg-blue-200 text-blue-900 border-blue-400">
                      ETAPA 2
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">Banco (Bank 2000)</h3>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Financias clientes y negocios. Revisas expedientes con casas/autos colaterales, sellos y bóveda.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-blue-900 font-semibold bg-blue-100/70 p-1 border border-blue-200">
                  ✓ Expedientes, Avalúos, Encaje 12%
                </div>
              </div>

              {/* Etapa 3: Grupo Empresarial */}
              <div
                onClick={() => handleSelectRole('grupo_empresarial')}
                className={`p-3 border-2 cursor-pointer flex flex-col justify-between ${
                  roleMode === 'grupo_empresarial'
                    ? 'bg-purple-50 border-purple-600 shadow-inner ring-1 ring-purple-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏢</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 border bg-purple-200 text-purple-900 border-purple-400">
                      ETAPA 3
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">Grupo Empresarial</h3>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Holding conglomerado: coordinas el banco + filiales, sinergias intragrupo, M&A y las 4 bancas.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-purple-900 font-semibold bg-purple-100/70 p-1 border border-purple-200">
                  ✓ Holding, Sinergias y 4 Bancas
                </div>
              </div>
            </div>

            {/* Rubro si eligió Empresario */}
            {roleMode === 'empresario' && (
              <div className="bg-white border border-[#808080] p-3 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  Tipo de Negocio Específico (Sin mezclar con otros):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSector('minimarket')}
                    className={`p-2 border text-left flex flex-col ${
                      retailSector === 'minimarket'
                        ? 'bg-amber-100 border-amber-600 font-bold'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <span className="text-lg">🛒</span>
                    <span className="text-xs text-slate-900 mt-1">Tienda / Minimarket</span>
                    <span className="text-[9px] text-slate-500 font-normal">Abarrotes y caja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSector('constructora')}
                    className={`p-2 border text-left flex flex-col ${
                      retailSector === 'constructora'
                        ? 'bg-amber-100 border-amber-600 font-bold'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <span className="text-lg">🏗️</span>
                    <span className="text-xs text-slate-900 mt-1">Constructora</span>
                    <span className="text-[9px] text-slate-500 font-normal">Obras y materiales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSector('supermercado')}
                    className={`p-2 border text-left flex flex-col ${
                      retailSector === 'supermercado'
                        ? 'bg-amber-100 border-amber-600 font-bold'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <span className="text-lg">🏪</span>
                    <span className="text-xs text-slate-900 mt-1">Supermercado</span>
                    <span className="text-[9px] text-slate-500 font-normal">Góndolas y mermas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSector('autolote')}
                    className={`p-2 border text-left flex flex-col ${
                      retailSector === 'autolote'
                        ? 'bg-amber-100 border-amber-600 font-bold'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <span className="text-lg">🚗</span>
                    <span className="text-xs text-slate-900 mt-1">Autolote</span>
                    <span className="text-[9px] text-slate-500 font-normal">Autos y trade-in</span>
                  </button>
                </div>
              </div>
            )}

            {/* Nombre y Ciudad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-[#808080] p-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {roleMode === 'empresario' ? 'Nombre de tu Empresa:' : (roleMode === 'banquero' ? 'Nombre de tu Banco:' : 'Nombre de tu Grupo / Holding:')}
                </label>
                <input
                  type="text"
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-semibold text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Ciudad Sede:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-sans text-xs text-slate-900"
                >
                  <option value="San Pedro Sula">San Pedro Sula (Centro Comercial e Industrial)</option>
                  <option value="Tegucigalpa">Tegucigalpa (Distrito Central)</option>
                  <option value="La Ceiba">La Ceiba (Caribe)</option>
                  <option value="Roatán">Roatán (Zona Turística)</option>
                </select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between items-center pt-2 border-t border-[#808080]">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsNewGameWizardOpen(false);
                }}
                className="px-4 py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-slate-800"
              >
                ◀ Volver al Menú
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-md flex items-center gap-1.5"
              >
                <span>🚀</span>
                <span>Comenzar en {roleMode === 'empresario' ? `Etapa 1: Empresario (${retailSector})` : (roleMode === 'banquero' ? 'Etapa 2: Banco (Bank 2000)' : 'Etapa 3: Grupo Empresarial')}</span>
              </button>
            </div>
          </form>
        )}

        {/* Barra de Estado Inferior */}
        <div className="bg-[#c0c0c0] border-t border-white px-3 py-1 text-[11px] text-slate-700 flex justify-between border-b border-r border-[#404040]">
          <span>Listo para simular</span>
          <span className="font-mono text-[10px]">Bank 2000 OS Edition</span>
        </div>
      </div>
    </div>
  );
};
