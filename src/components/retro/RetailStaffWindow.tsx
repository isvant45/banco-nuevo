import React from 'react';
import { sound } from '../../game/audioFx';

interface RetailStaffWindowProps {
  staffCount: number;
  dailyWages: number;
  dailyRent: number;
  reputation: number;
  cleanliness: number;
  storeCash: number;
  onHireStaff: () => void;
  onFireStaff: () => void;
  onCleanStore: () => void;
}

export const RetailStaffWindow: React.FC<RetailStaffWindowProps> = ({
  staffCount,
  dailyWages,
  dailyRent,
  reputation,
  cleanliness,
  storeCash,
  onHireStaff,
  onFireStaff,
  onCleanStore
}) => {
  return (
    <div className="space-y-3 font-sans text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Nómina Activa</span>
          <span className="font-mono text-base font-bold text-slate-900">
            {staffCount} Empleados
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Sueldo promedio L 12,000/mes</span>
        </div>

        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Costo Operativo Diario</span>
          <span className="font-mono text-base font-bold text-red-700">
            L {(dailyWages + dailyRent).toLocaleString()} / día
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Sueldos (L {dailyWages}) + Alquiler (L {dailyRent})</span>
        </div>

        <div className="bg-white p-2.5 border border-[#808080]">
          <span className="text-slate-600 block text-[11px]">Higiene & Presentación</span>
          <span className="font-mono text-base font-bold text-emerald-800">
            {cleanliness}% Óptimo
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Afecta la reputación y afluencia</span>
        </div>
      </div>

      <div className="bg-[#eaeaea] border border-[#808080] p-3 space-y-3">
        <span className="font-bold text-slate-800 block text-xs border-b border-[#a0a0a0] pb-1">
          Gestión de Personal y Local Comercial
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-2.5 border border-[#a0a0a0] flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Contratar / Reducir Personal</span>
              <p className="text-[11px] text-slate-600 mb-2">
                Más empleados aumentan la velocidad de atención a clientes y mantienen el local limpio, pero elevan el gasto diario de sueldos.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playApprovalStamp();
                  onHireStaff();
                }}
                className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b border-r border-emerald-950"
              >
                + Contratar (+L 400/día)
              </button>
              <button
                disabled={staffCount <= 1}
                onClick={() => {
                  sound.playRejectBuzzer();
                  onFireStaff();
                }}
                className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs border-t border-l border-red-300 border-b border-r border-red-950 disabled:opacity-40"
              >
                - Despedir
              </button>
            </div>
          </div>

          <div className="bg-white p-2.5 border border-[#a0a0a0] flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Mantenimiento y Limpieza del Local</span>
              <p className="text-[11px] text-slate-600 mb-2">
                Contrata una jornada de sanitización profunda e iluminación para restaurar la presentación al 100%.
              </p>
            </div>
            <button
              disabled={storeCash < 450}
              onClick={() => {
                sound.playCashChime();
                onCleanStore();
              }}
              className="py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs border-t border-l border-blue-300 border-b border-r border-blue-950 disabled:opacity-40"
            >
              🧹 Limpieza Profunda (Costo: L 450)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
