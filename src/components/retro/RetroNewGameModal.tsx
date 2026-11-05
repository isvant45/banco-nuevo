import React, { useState } from 'react';
import { RetailSectorId, RetroRoleMode } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface RetroNewGameModalProps {
  isOpen: boolean;
  currentRole: RetroRoleMode;
  currentSector: RetailSectorId;
  currentName: string;
  onClose: () => void;
  onStartNewGame: (params: {
    roleMode: RetroRoleMode;
    retailSector: RetailSectorId;
    entityName: string;
    city: string;
  }) => void;
}

export const RetroNewGameModal: React.FC<RetroNewGameModalProps> = ({
  isOpen,
  currentRole,
  currentSector,
  currentName,
  onClose,
  onStartNewGame
}) => {
  const [roleMode, setRoleMode] = useState<RetroRoleMode>(currentRole);
  const [retailSector, setRetailSector] = useState<RetailSectorId>(currentSector);
  const [entityName, setEntityName] = useState(currentName);
  const [city, setCity] = useState('San Pedro Sula');

  if (!isOpen) return null;

  const handleRoleSelect = (mode: RetroRoleMode) => {
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

  const handleSectorSelect = (sector: RetailSectorId) => {
    sound.playClick();
    setRetailSector(sector);
    if (sector === 'minimarket') setEntityName('Minimarket San Pedro');
    else if (sector === 'constructora') setEntityName('Constructora Metropolitana');
    else if (sector === 'supermercado') setEntityName('Supermercados del Norte');
    else if (sector === 'autolote') setEntityName('Autolote El Diamante');
    else setEntityName('Taberna & Café El Portal');
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl w-full max-w-xl flex flex-col font-sans text-xs">
        {/* Barra de Título */}
        <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2 py-1 flex items-center justify-between select-none border-b border-[#808080]">
          <div className="flex items-center gap-1.5 font-bold">
            <span>⭐</span>
            <span>Nueva Partida: Asistente de Rol Puro</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#404040] text-black font-bold text-[10px] flex items-center justify-center hover:bg-[#d4d4d4]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-[#f0f0f0]">
          {/* Selección de las 3 Etapas Separadas */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              1. Selecciona la Etapa de Juego (Tres Modalidades Separadas):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Etapa 1: Empresario */}
              <button
                type="button"
                onClick={() => handleRoleSelect('empresario')}
                className={`p-2.5 text-left border-2 flex flex-col justify-between ${
                  roleMode === 'empresario'
                    ? 'bg-amber-50 border-amber-600 shadow-inner ring-1 ring-amber-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏪</span>
                    <span className="font-bold text-[9px] text-amber-900 bg-amber-200 px-1 py-0.2 border border-amber-400">
                      ETAPA 1
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs">Empresario / Negocio</span>
                  <span className="text-[10px] text-slate-600 block mt-1 leading-snug">
                    Diriges tu propio comercio. Eliges un único rubro aislado: tienda, constructora, súper o autolote.
                  </span>
                </div>
              </button>

              {/* Etapa 2: Banco */}
              <button
                type="button"
                onClick={() => handleRoleSelect('banquero')}
                className={`p-2.5 text-left border-2 flex flex-col justify-between ${
                  roleMode === 'banquero'
                    ? 'bg-blue-50 border-blue-600 shadow-inner ring-1 ring-blue-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏦</span>
                    <span className="font-bold text-[9px] text-blue-900 bg-blue-200 px-1 py-0.2 border border-blue-400">
                      ETAPA 2
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs">Banco (Bank 2000)</span>
                  <span className="text-[10px] text-slate-600 block mt-1 leading-snug">
                    Evalúas expedientes de crédito con casas y autos colaterales, sellos de tinta, bóveda y encaje 12% BCH.
                  </span>
                </div>
              </button>

              {/* Etapa 3: Grupo Empresarial */}
              <button
                type="button"
                onClick={() => handleRoleSelect('grupo_empresarial')}
                className={`p-2.5 text-left border-2 flex flex-col justify-between ${
                  roleMode === 'grupo_empresarial'
                    ? 'bg-purple-50 border-purple-600 shadow-inner ring-1 ring-purple-400'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏢</span>
                    <span className="font-bold text-[9px] text-purple-900 bg-purple-200 px-1 py-0.2 border border-purple-400">
                      ETAPA 3
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs">Grupo Empresarial</span>
                  <span className="text-[10px] text-slate-600 block mt-1 leading-snug">
                    Holding conglomerado: coordinas banco + filiales, sinergias intragrupo, M&A y las 4 bancas.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Selección de Rubro Exclusivo si es Empresario */}
          {roleMode === 'empresario' && (
            <div className="bg-white border border-[#808080] p-3">
              <label className="font-bold text-slate-800 block mb-1">
                2. Selecciona qué negocio deseas dirigir (Aislamiento Total):
              </label>
              <p className="text-[10px] text-slate-500 mb-2">
                Solo se activarán las herramientas del negocio seleccionado. No se mezclarán rubros.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Tienda */}
                <button
                  type="button"
                  onClick={() => handleSectorSelect('minimarket')}
                  className={`p-2 border text-left flex items-start gap-2 ${
                    retailSector === 'minimarket'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🛒</span>
                  <div>
                    <span className="block text-xs text-slate-900">Tienda / Minimarket</span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      Abarrotes, refrescos, mostrador, caja y proveedores de consumo.
                    </span>
                  </div>
                </button>

                {/* Constructora */}
                <button
                  type="button"
                  onClick={() => handleSectorSelect('constructora')}
                  className={`p-2 border text-left flex items-start gap-2 ${
                    retailSector === 'constructora'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🏗️</span>
                  <div>
                    <span className="block text-xs text-slate-900">Constructora & Obras</span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      Licitaciones SIT y privadas, casas, puentes, cemento, varillas y maquinaria 1-5★.
                    </span>
                  </div>
                </button>

                {/* Supermercado */}
                <button
                  type="button"
                  onClick={() => handleSectorSelect('supermercado')}
                  className={`p-2 border text-left flex items-start gap-2 ${
                    retailSector === 'supermercado'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🏪</span>
                  <div>
                    <span className="block text-xs text-slate-900">Supermercado de Cadena</span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      Góndolas de alimentos, lácteos, carnes, perecederos y mermas de caducidad.
                    </span>
                  </div>
                </button>

                {/* Autolote */}
                <button
                  type="button"
                  onClick={() => handleSectorSelect('autolote')}
                  className={`p-2 border text-left flex items-start gap-2 ${
                    retailSector === 'autolote'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🚗</span>
                  <div>
                    <span className="block text-xs text-slate-900">Autolote & Concesionaria</span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      Venta de vehículos, pickups 4x4, trade-in de autos usados y crédito de piso.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Nombre y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-[#808080] p-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                {roleMode === 'empresario' ? 'Nombre de tu Empresa / Negocio:' : (roleMode === 'banquero' ? 'Nombre de tu Banco:' : 'Nombre de tu Grupo / Holding:')}
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
                <option value="San Pedro Sula">San Pedro Sula (Centro Industrial y Comercial)</option>
                <option value="Tegucigalpa">Tegucigalpa (Distrito Central)</option>
                <option value="La Ceiba">La Ceiba (Caribe Atlántico)</option>
                <option value="Roatán">Roatán (Zona Turística)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#808080]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-md flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>
                Iniciar en {roleMode === 'empresario' ? `Etapa 1: Empresario (${retailSector})` : (roleMode === 'banquero' ? 'Etapa 2: Banco (Bank 2000)' : 'Etapa 3: Grupo Empresarial')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
