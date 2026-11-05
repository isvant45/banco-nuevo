import React, { useState } from 'react';
import { GameSetupProfile, RoleMode } from '../../game/types';
import { formatHNL } from '../../game/economyEngine';
import { sound } from '../../game/audioFx';
import { 
  X, 
  Building, 
  Landmark, 
  Layers, 
  MapPin, 
  User, 
  Coins, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface NewGameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewGame: (setup: GameSetupProfile) => void;
  currentProfile?: GameSetupProfile;
}

export const NewGameSetupModal: React.FC<NewGameSetupModalProps> = ({
  isOpen,
  onClose,
  onStartNewGame,
  currentProfile
}) => {
  const [roleMode, setRoleMode] = useState<RoleMode>(currentProfile?.roleMode || 'grupo_empresarial');
  const [founderName, setFounderName] = useState<string>(currentProfile?.founderName || 'Director Ejecutivo');
  const [entityName, setEntityName] = useState<string>(currentProfile?.entityName || 'Grupo Financiero & Empresarial Áureo');
  const [startingCity, setStartingCity] = useState<string>(currentProfile?.startingCity || 'San Pedro Sula');
  const [difficulty, setDifficulty] = useState<'principiante' | 'estandar' | 'crisis'>(currentProfile?.difficulty || 'estandar');
  const [initialCapitalHNL, setInitialCapitalHNL] = useState<number>(currentProfile?.initialCapitalHNL || 5000000);

  if (!isOpen) return null;

  const handleRoleChange = (role: RoleMode) => {
    sound.playClick();
    setRoleMode(role);
    if (role === 'empresario') {
      setEntityName('Corporación Comercial del Valle');
      setInitialCapitalHNL(3000000);
    } else if (role === 'banquero') {
      setEntityName('Áureo Bank Honduras S.A.');
      setInitialCapitalHNL(10000000);
    } else {
      setEntityName('Grupo Financiero & Empresarial Áureo');
      setInitialCapitalHNL(5000000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCashChime();
    onStartNewGame({
      founderName: founderName.trim() || 'Director Ejecutivo',
      entityName: entityName.trim() || 'Grupo Financiero & Empresarial Áureo',
      roleMode,
      startingCity,
      difficulty,
      initialCapitalHNL,
      isCustomGame: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>Nueva Partida Estratégica</span>
              <span>·</span>
              <span className="text-slate-400">Personalización de Experiencia Tycoon</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-0.5">
              Configurar Rol y Modelo Económico
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          {/* PASO 1: SELECCIÓN DEL ROL */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              1. Elige qué tipo de negocio vas a dirigir:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Empresario */}
              <div
                onClick={() => handleRoleChange('empresario')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  roleMode === 'empresario'
                    ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-slate-900 text-amber-400 border border-slate-800">
                    <Building className="w-5 h-5" />
                  </div>
                  {roleMode === 'empresario' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-3">Empresario</h3>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Administras supermercados, tiendas, café y fábricas. Compras insumos, fijas precios, contratas personal y pides créditos a la banca.
                </p>
                <span className="mt-2 block text-[10px] text-amber-400 font-mono">Meta: Rentabilidad y flujo operativo</span>
              </div>

              {/* Banquero */}
              <div
                onClick={() => handleRoleChange('banquero')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  roleMode === 'banquero'
                    ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-slate-900 text-sky-400 border border-slate-800">
                    <Landmark className="w-5 h-5" />
                  </div>
                  {roleMode === 'banquero' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-3">Banquero</h3>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Administras depósitos, originación de créditos, agencias, encaje legal BCH (12%), provisiones CNBS y confianza de clientes.
                </p>
                <span className="mt-2 block text-[10px] text-sky-400 font-mono">Meta: Margen financiero y solvencia CAR</span>
              </div>

              {/* Grupo Empresarial */}
              <div
                onClick={() => handleRoleChange('grupo_empresarial')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  roleMode === 'grupo_empresarial'
                    ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-slate-900 text-purple-400 border border-slate-800">
                    <Layers className="w-5 h-5" />
                  </div>
                  {roleMode === 'grupo_empresarial' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-3">Grupo Empresarial</h3>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Conglomerado unificado: diriges el banco líder y 4 empresas operativas con financiamiento intragrupo y sinergias comerciales.
                </p>
                <span className="mt-2 block text-[10px] text-purple-400 font-mono">Meta: Coordinación total y dominio de mercado</span>
              </div>
            </div>
          </div>

          {/* PASO 2: DATOS DEL FUNDADOR Y PLAZA */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              2. Perfil de Identidad & Sede Principal:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Nombre del Director / Fundador:</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded px-3 py-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    className="bg-transparent text-slate-100 w-full focus:outline-none"
                    placeholder="Ej. Ing. Carlos Mejía"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nombre de la Entidad o Razón Social:</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded px-3 py-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="bg-transparent text-slate-100 w-full focus:outline-none"
                    placeholder="Ej. Grupo Financiero Áureo"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Ciudad Sede de Operaciones:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  'San Pedro Sula',
                  'Tegucigalpa',
                  'Choloma',
                  'La Ceiba',
                  'Comayagua'
                ].map(city => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => { sound.playClick(); setStartingCity(city); }}
                    className={`py-2 px-3 rounded border text-center transition-colors ${
                      startingCity === city
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PASO 3: DIFICULTAD Y CAPITAL INICIAL */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              3. Capital Inicial & Nivel de Desafío:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'principiante', label: 'Principiante', desc: 'Mercado expansivo, mayor holgura de capital (+50%) y menor morosidad inicial.' },
                { id: 'estandar', label: 'Estándar', desc: 'Condiciones macroeconómicas reales del BCH y regulación CNBS.' },
                { id: 'crisis', label: 'Crisis Macroeconómica', desc: 'Presión inflacionaria, TPM elevada, mora ajustada y capital inicial limitado.' }
              ].map(diff => (
                <div
                  key={diff.id}
                  onClick={() => { sound.playClick(); setDifficulty(diff.id as any); }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    difficulty === diff.id
                      ? 'bg-slate-850 border-amber-500 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span className="font-bold block text-slate-100">{diff.label}</span>
                  <p className="text-[11px] mt-1 text-slate-400 leading-normal">{diff.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Capital Inicial Asignado: <span className="font-mono text-amber-400 font-bold">{formatHNL(initialCapitalHNL)}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[2000000, 5000000, 10000000, 25000000].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => { sound.playClick(); setInitialCapitalHNL(amt); }}
                    className={`py-1.5 px-3 rounded border font-mono tabular-nums transition-colors ${
                      initialCapitalHNL === amt
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {formatHNL(amt)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { sound.playClick(); onClose(); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition-colors shadow flex items-center gap-2"
            >
              <span>Iniciar Partida Estratégica</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
