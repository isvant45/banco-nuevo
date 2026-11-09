import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import {
  retainCSuiteExecutive,
  fireCSuiteExecutive
} from '../../game/tycoonAdvancedEngine';

interface CSuiteManagerWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const CSuiteManagerWindow: React.FC<CSuiteManagerWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const executives = state.cSuiteExecutives || [];
  const [message, setMessage] = useState<string | null>(null);

  const handleRetain = (execId: string, action: 'aumentar_sueldo' | 'coche_empresa' | 'bono_equity') => {
    const res = retainCSuiteExecutive(state, execId, action);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleFire = (execId: string) => {
    const res = fireCSuiteExecutive(state, execId);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>👔</span>
          <span>DIRECCIÓN EJECUTIVA & RECURSOS HUMANOS ESTRATÉGICOS (C-SUITE)</span>
        </span>
        <button
          onClick={onClose}
          className="bg-[#c0c0c0] text-black hover:bg-red-600 hover:text-white px-1.5 py-0.5 font-bold border-t border-l border-white border-b-2 border-r-2 border-black"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="m-2 p-2 bg-yellow-100 border border-yellow-700 text-yellow-900 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
          <p className="text-gray-700">
            Tus altos ejecutivos poseen emociones, egos y ambiciones. Si la empresa se endeuda en exceso o el estrés sube a niveles críticos, su lealtad colapsará y los competidores intentarán ficharlos duplicándoles el sueldo. Despedir a un directivo resentido puede convertirlo en <strong>"El Topo"</strong>, filtrando secretos a la prensa y al SAR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {executives.map(exec => {
            const isTentado = exec.status === 'tentado';
            const isHighStress = exec.stress >= 70;

            return (
              <div
                key={exec.id}
                className={`bg-white border-2 ${isTentado ? 'border-red-600 ring-2 ring-red-400' : 'border-t-white border-l-white border-b-gray-800 border-r-gray-800'} p-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl p-1 bg-gray-100 border border-gray-300 rounded">{exec.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{exec.name}</div>
                        <div className="text-[11px] font-bold text-blue-900">{exec.role}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                      isTentado ? 'bg-red-100 text-red-800 border-red-500' : 'bg-green-100 text-green-800 border-green-500'
                    }`}>
                      {exec.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 mb-2 italic">
                    "{exec.bio}"
                  </p>

                  {/* Barras de Estado RPG */}
                  <div className="space-y-1.5 my-2.5 bg-gray-50 p-2 border border-gray-300">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>ESTRÉS</span>
                        <span className={isHighStress ? 'text-red-600' : 'text-gray-700'}>{exec.stress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 border border-gray-400">
                        <div
                          className={`h-full ${isHighStress ? 'bg-red-600' : 'bg-yellow-500'}`}
                          style={{ width: `${exec.stress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>LEALTAD</span>
                        <span className={exec.loyalty < 40 ? 'text-red-600' : 'text-blue-900'}>{exec.loyalty}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 border border-gray-400">
                        <div
                          className={`h-full ${exec.loyalty < 40 ? 'bg-red-500' : 'bg-blue-600'}`}
                          style={{ width: `${exec.loyalty}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>EGO & STATUS</span>
                        <span className="text-purple-900">{exec.ego}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 border border-gray-400">
                        <div
                          className="h-full bg-purple-600"
                          style={{ width: `${exec.ego}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-800 mb-1">
                    <strong>Salario Actual:</strong> <span className="font-mono">L {exec.monthlySalaryHNL.toLocaleString()} / mes</span>
                  </div>

                  <div className="text-[11px] text-gray-600 mb-2">
                    <strong>Beneficios Activos:</strong> {exec.perks.length > 0 ? exec.perks.join(', ') : 'Ninguno'}
                  </div>

                  {/* Alerta de Headhunting / Fuga de Talentos */}
                  {isTentado && exec.headhuntedByRival && (
                    <div className="p-2 bg-red-50 border border-red-500 text-red-900 text-[11px] mb-2 font-semibold">
                      ⚠️ <strong>Tentado por {exec.headhuntedByRival.rivalName}:</strong> Le ofrecen L {exec.headhuntedByRival.offeredSalaryHNL.toLocaleString()}/mes. Plazo de respuesta: {exec.headhuntedByRival.daysToRespond} días.
                    </div>
                  )}
                </div>

                {/* Acciones de Retención */}
                <div className="space-y-1.5 pt-2 border-t mt-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleRetain(exec.id, 'aumentar_sueldo')}
                      className="py-1 px-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold text-[10px] border-t border-l border-white border-b-2 border-r-2 border-black"
                    >
                      +35% Sueldo
                    </button>
                    <button
                      onClick={() => handleRetain(exec.id, 'coche_empresa')}
                      className="py-1 px-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold text-[10px] border-t border-l border-white border-b-2 border-r-2 border-black"
                    >
                      Coche de Lujo (650k)
                    </button>
                  </div>
                  <button
                    onClick={() => handleRetain(exec.id, 'bono_equity')}
                    className="w-full py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] border border-blue-400"
                  >
                    Asignar Bono de Acciones (Equity)
                  </button>
                  <button
                    onClick={() => handleFire(exec.id)}
                    className="w-full py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[10px] border border-red-400"
                  >
                    Despedir (Riesgo "El Topo")
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
