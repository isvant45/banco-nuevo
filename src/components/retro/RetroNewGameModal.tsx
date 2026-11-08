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
  currentRole = 'empresario',
  currentSector,
  currentName,
  onClose,
  onStartNewGame
}) => {
  const [retailSector, setRetailSector] = useState<RetailSectorId>(currentSector || 'minimarket');
  const [entityName, setEntityName] = useState(currentName || 'Minimarket San Pedro');
  const [city, setCity] = useState('San Pedro Sula');

  if (!isOpen) return null;

  const handleSectorSelect = (sector: RetailSectorId) => {
    sound.playClick();
    setRetailSector(sector);
    if (sector === 'minimarket') setEntityName('Minimarket San Pedro');
    else if (sector === 'constructora') setEntityName('Constructora Metropolitana');
    else if (sector === 'supermercado') setEntityName('Supermercados del Norte');
    else if (sector === 'autolote') setEntityName('Autolote El Diamante');
    else setEntityName('Comercio Hondureño S. de R.L.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playMonthEndBell();
    onStartNewGame({
      roleMode: 'empresario',
      retailSector,
      entityName: entityName.trim() || 'Mi Empresa',
      city
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl w-full max-w-lg flex flex-col font-sans text-xs">
        {/* Barra de Título Windows 98 */}
        <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2 py-1 flex items-center justify-between select-none border-b border-[#808080]">
          <div className="flex items-center gap-1.5 font-bold">
            <span>⭐</span>
            <span>Nueva Simulación Tycoon: Selección de Negocio</span>
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
          {/* Selección de Rubro Exclusivo */}
          <div className="bg-white border border-[#808080] p-3 shadow-inner">
            <label className="font-bold text-slate-900 block mb-1">
              1. Selecciona tu Tipo de Negocio:
            </label>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Empiezas desde una pequeña sede local y expandes tu empresa mediante créditos, I+D, logística y compras M&A.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Tienda */}
              <button
                type="button"
                onClick={() => handleSectorSelect('minimarket')}
                className={`p-2.5 border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                  retailSector === 'minimarket'
                    ? 'bg-amber-100 border-amber-600 ring-1 ring-amber-500'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🛒</span>
                <div>
                  <span className="block font-bold text-xs text-slate-900">Tienda / Minimarket</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Abarrotes, refrescos, estanterías, caja registradora y proveedores de consumo masivo.
                  </span>
                </div>
              </button>

              {/* Constructora */}
              <button
                type="button"
                onClick={() => handleSectorSelect('constructora')}
                className={`p-2.5 border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                  retailSector === 'constructora'
                    ? 'bg-amber-100 border-amber-600 ring-1 ring-amber-500'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🏗️</span>
                <div>
                  <span className="block font-bold text-xs text-slate-900">Constructora & Obras</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Licitaciones públicas SIT y privadas, cuadrillas de albañiles, cemento, varillas y maquinaria pesada.
                  </span>
                </div>
              </button>

              {/* Supermercado */}
              <button
                type="button"
                onClick={() => handleSectorSelect('supermercado')}
                className={`p-2.5 border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                  retailSector === 'supermercado'
                    ? 'bg-amber-100 border-amber-600 ring-1 ring-amber-500'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🏪</span>
                <div>
                  <span className="block font-bold text-xs text-slate-900">Supermercado de Cadena</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Góndolas de alimentos frescos, lácteos, carnes, gestión de mermas y pasillos de gran formato.
                  </span>
                </div>
              </button>

              {/* Autolote */}
              <button
                type="button"
                onClick={() => handleSectorSelect('autolote')}
                className={`p-2.5 border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                  retailSector === 'autolote'
                    ? 'bg-amber-100 border-amber-600 ring-1 ring-amber-500'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">🚗</span>
                <div>
                  <span className="block font-bold text-xs text-slate-900">Autolote & Concesionaria</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Pickups 4x4, SUVs familiares, camiones, trade-in de vehículos usados y financiamiento vehicular.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Nombre de la Empresa y Ciudad Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-[#808080] p-3 shadow-inner">
            <div>
              <label className="text-slate-800 font-bold block mb-1">
                2. Nombre de tu Empresa:
              </label>
              <input
                type="text"
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-semibold text-xs text-slate-900 focus:bg-white"
                placeholder="Ej. Inversiones del Norte S.A."
              />
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">
                3. Ciudad Sede:
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-sans text-xs text-slate-900"
              >
                <option value="San Pedro Sula">San Pedro Sula (Centro Industrial y Comercial)</option>
                <option value="Tegucigalpa">Tegucigalpa (Distrito Central & Gobierno)</option>
                <option value="La Ceiba">La Ceiba (Caribe & Turismo)</option>
                <option value="Roatán">Roatán (Zona Libre & Turística)</option>
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
              className="px-4 py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-semibold text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀</span>
              <span>Comenzar Simulación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
