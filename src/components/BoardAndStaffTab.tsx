import React, { useState } from 'react';
import { GameState, StaffRole, BoardDirector } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Users, 
  Award, 
  UserPlus, 
  UserMinus, 
  Briefcase, 
  ShieldCheck, 
  Percent, 
  Crown, 
  HeartHandshake 
} from 'lucide-react';

interface BoardAndStaffTabProps {
  state: GameState;
  onModifyStaff: (roleId: string, delta: number) => void;
  onUpdateBoardBonus: (directorId: string, newBonus: number) => void;
}

export const BoardAndStaffTab: React.FC<BoardAndStaffTabProps> = ({
  state,
  onModifyStaff,
  onUpdateBoardBonus
}) => {
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [bonusInput, setBonusInput] = useState<number>(0);

  const handleHire = (roleId: string) => {
    sound.playApprovalStamp();
    onModifyStaff(roleId, 1);
  };

  const handleFire = (roleId: string) => {
    sound.playRejectBuzzer();
    onModifyStaff(roleId, -1);
  };

  const openBonusModal = (director: BoardDirector) => {
    setSelectedDirector(director.id);
    setBonusInput(director.annualBonusHNL);
  };

  const handleSaveBonus = () => {
    if (selectedDirector) {
      sound.playCashChime();
      onUpdateBoardBonus(selectedDirector, bonusInput);
      setSelectedDirector(null);
    }
  };

  const totalStaffCount = state.staff.reduce((acc, s) => acc + s.count, 0);
  const totalStaffMonthlyPayroll = state.staff.reduce((acc, s) => acc + (s.count * s.monthlySalaryPerPerson), 0);

  return (
    <div className="space-y-6">
      {/* 1. Junta Directiva (Board of Directors) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Junta Directiva y Gobernanza Corporativa
              </h2>
              <p className="text-xs text-slate-400">
                Liderazgo ejecutivo de Áureo Bank. Cada director aporta ventajas pasivas estratégicas y requiere incentivos para mantener su máxima lealtad.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Directores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.board.map(director => (
            <div
              key={director.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm shadow-amber-500/20 shrink-0">
                    {director.avatarSeed}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{director.name}</h3>
                    <p className="text-[11px] text-amber-400 font-medium truncate">{director.title}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 mb-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Lealtad al Banco:</span>
                    <span className="font-mono font-bold text-emerald-400">{director.loyalty}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${director.loyalty}%` }} />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed mb-3">
                  <span className="text-amber-400 font-semibold block mb-0.5">Impacto Estratégico:</span>
                  {director.passivePerk}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Bono Anual:</span>
                  <span className="font-mono text-slate-200 font-semibold">{formatHNL(director.annualBonusHNL)}</span>
                </div>

                <button
                  onClick={() => openBonusModal(director)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium border border-slate-700 transition-colors"
                >
                  Ajustar Bono
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fuerza Operativa y Plantilla Bancaria */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Personal Operativo y Departamentos
              </h2>
              <p className="text-xs text-slate-400">
                Fuerza laboral que ejecuta las operaciones bancarias. Su número afecta directamente el volumen de colocación, la detección de fraudes y el control de mora.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Colaboradores Totales:</span>
              <span className="text-white font-bold">{totalStaffCount} plazas</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Planilla Mensual (OPEX):</span>
              <span className="text-rose-400 font-bold">{formatHNL(totalStaffMonthlyPayroll)}</span>
            </div>
          </div>
        </div>

        {/* Roles Operativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.staff.map(role => (
            <div
              key={role.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">{role.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{role.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-amber-400">{role.count}</span>
                    <span className="text-[10px] text-slate-400 block">empleados</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {role.benefitDescription}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 p-2 bg-slate-900/60 rounded-lg border border-slate-800 mb-3">
                  <span>Salario Individual:</span>
                  <span className="text-white font-semibold">{formatHNL(role.monthlySalaryPerPerson)} / mes</span>
                </div>
              </div>

              {/* Botones de Contratación / Despido */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">
                  Gasto total: {formatHNL(role.count * role.monthlySalaryPerPerson)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFire(role.id)}
                    disabled={role.count <= 2}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 disabled:opacity-40 transition-colors"
                    title="Despedir 1 colaborador"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleHire(role.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    title="Contratar 1 nuevo colaborador"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Contratar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Ajustar Bonificación de Director */}
      {selectedDirector && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ajustar Bonificación Anual por Desempeño
            </h3>
            <p className="text-xs text-slate-400">
              Un bono competitivo eleva la lealtad del director, potenciando sus habilidades pasivas al cierre de cada mes.
            </p>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">Bono Anual (Lempiras):</label>
              <input
                type="number"
                min="0"
                step="50000"
                value={bonusInput}
                onChange={e => setBonusInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedDirector(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBonus}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Guardar Bono
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
