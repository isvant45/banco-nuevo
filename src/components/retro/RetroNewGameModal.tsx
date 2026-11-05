import React, { useState } from 'react';
import { RetailSectorId } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface RetroNewGameModalProps {
  isOpen: boolean;
  currentRole: 'empresario' | 'banquero';
  currentSector: RetailSectorId;
  currentName: string;
  onClose: () => void;
  onStartNewGame: (params: {
    roleMode: 'empresario' | 'banquero';
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
  const [roleMode, setRoleMode] = useState<'empresario' | 'banquero'>(currentRole);
  const [retailSector, setRetailSector] = useState<RetailSectorId>(currentSector);
  const [entityName, setEntityName] = useState(currentName);
  const [city, setCity] = useState('San Pedro Sula');

  if (!isOpen) return null;

  const handleRoleSelect = (mode: 'empresario' | 'banquero') => {
    sound.playClick();
    setRoleMode(mode);
    if (mode === 'empresario') {
      if (retailSector === 'minimarket') setEntityName('Minimarket San Pedro');
      else if (retailSector === 'bar_restaurante') setEntityName('Taberna & Café El Portal');
      else setEntityName('Constructora Metropolitana');
    } else {
      setEntityName('Banco Mercantil Áureo');
    }
  };

  const handleSectorSelect = (sector: RetailSectorId) => {
    sound.playClick();
    setRetailSector(sector);
    if (sector === 'minimarket') setEntityName('Minimarket San Pedro');
    else if (sector === 'bar_restaurante') setEntityName('Taberna & Café El Portal');
    else setEntityName('Constructora Metropolitana');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playMonthEndBell();
    onStartNewGame({
      roleMode,
      retailSector,
      entityName: entityName.trim() || (roleMode === 'empresario' ? 'Mi Negocio' : 'Mi Banco'),
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
          {/* Selección de Rol Principal Binario */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              1. Elige qué tipo de negocio vas a dirigir (Dos Opciones Puras):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleSelect('empresario')}
                className={`p-3 text-left border-2 flex flex-col justify-between ${
                  roleMode === 'empresario'
                    ? 'bg-amber-50 border-amber-600 shadow-inner'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏪</span>
                    <span className="font-bold text-[10px] text-amber-900 bg-amber-200 px-1.5 py-0.2 border border-amber-400">
                      100% EMPRESARIO
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs">Empresario (Obras, Supermercado o Comida)</span>
                  <span className="text-[10px] text-slate-600 block mt-1">
                    Administra tus operaciones y accede a tu <strong>Banco</strong> para préstamos a cuotas, abonos a capital, tarjetas de crédito quincenales, cuentas corrientes con tasas negociables y concesionarias con financiamiento.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('banquero')}
                className={`p-3 text-left border-2 flex flex-col justify-between ${
                  roleMode === 'banquero'
                    ? 'bg-blue-50 border-blue-600 shadow-inner'
                    : 'bg-white border-[#808080] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🏦</span>
                    <span className="font-bold text-[10px] text-blue-900 bg-blue-200 px-1.5 py-0.2 border border-blue-400">
                      100% BANCO
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs">Ventanilla de Crédito (Bank 2000)</span>
                  <span className="text-[10px] text-slate-600 block mt-1">
                    Revisa expedientes con <strong>casas, vehículos y terrenos valuados</strong>. Eleva montos o descuenta tasas por colateral real.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Selección de Rubro si es Empresario */}
          {roleMode === 'empresario' && (
            <div className="bg-white border border-[#808080] p-3">
              <label className="font-bold text-slate-800 block mb-1.5">
                2. Selecciona el rubro comercial específico:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSectorSelect('minimarket')}
                  className={`p-2 border text-left flex items-center gap-2 ${
                    retailSector === 'minimarket'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🛒</span>
                  <div>
                    <span className="block text-xs">Minimarket / Tienda</span>
                    <span className="text-[10px] text-slate-500 font-normal">Abarrotes y consumo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSectorSelect('bar_restaurante')}
                  className={`p-2 border text-left flex items-center gap-2 ${
                    retailSector === 'bar_restaurante'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🍔</span>
                  <div>
                    <span className="block text-xs">Bar & Restaurante</span>
                    <span className="text-[10px] text-slate-500 font-normal">Comida y bebidas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSectorSelect('constructora')}
                  className={`p-2 border text-left flex items-center gap-2 ${
                    retailSector === 'constructora'
                      ? 'bg-amber-100 border-amber-600 font-bold'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <span className="text-lg">🏗️</span>
                  <div>
                    <span className="block text-xs">Constructora & Obras</span>
                    <span className="text-[10px] text-slate-500 font-normal">Materiales pesados</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Nombre y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-[#808080] p-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                {roleMode === 'empresario' ? 'Nombre de tu Comercio:' : 'Nombre de tu Banco:'}
              </label>
              <input
                type="text"
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-semibold text-xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Ciudad Sede:</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-sans text-xs"
              >
                <option value="San Pedro Sula">San Pedro Sula (Centro Industrial)</option>
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
              <span>Iniciar en Modo {roleMode === 'empresario' ? '100% Empresario' : '100% Banco'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
