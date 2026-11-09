import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { executeDeepWebContract } from '../../game/tycoonAdvancedEngine';

interface DeepWebTerminalWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const DeepWebTerminalWindow: React.FC<DeepWebTerminalWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const dw = state.deepWeb || {
    isConsoleUnlocked: false,
    accessCodeEntered: '',
    ipTraceRiskPct: 0,
    policeRaidPending: false,
    activeContracts: []
  };

  const [passwordInput, setPasswordInput] = useState('');
  const [selectedContract, setSelectedContract] = useState<'sabotaje_fabrica' | 'robo_patente' | 'rompehuelgas_clandestino'>('sabotaje_fabrica');
  const [selectedTargetId, setSelectedTargetId] = useState(state.hostileMnaTargets?.[0]?.id || '');
  const [message, setMessage] = useState<string | null>(null);

  const rivals = state.hostileMnaTargets || [];
  const selectedTarget = rivals.find(r => r.id === selectedTargetId) || rivals[0];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === 'CIPHER99' || passwordInput.trim() === 'aureo') {
      onUpdateState({
        ...state,
        deepWeb: {
          ...dw,
          isConsoleUnlocked: true
        }
      });
      setMessage('ACCESO CONCEDIDO A LA RED TOR CORPORATIVA.');
    } else {
      setMessage('CLAVE DE CIFRADO INVÁLIDA. INTENTO REGISTRADO.');
    }
  };

  const handleLaunchOperation = () => {
    if (!selectedTarget) return;
    const res = executeDeepWebContract(state, selectedContract, selectedTarget.id, selectedTarget.name);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#00ff66] font-mono text-xs select-none border-2 border-green-500 shadow-2xl">
      {/* Top Banner Clandestino */}
      <div className="bg-[#161b22] text-green-400 px-3 py-1 font-bold flex justify-between items-center border-b border-green-600">
        <span className="flex items-center gap-2">
          <span className="animate-pulse">●</span>
          <span>ONION ROUTER v0.9b // CORPORATE BLACK OPS</span>
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-400 font-bold px-1.5"
        >
          [✕ DISCONNECT]
        </button>
      </div>

      {message && (
        <div className="m-2 p-2 bg-black border border-green-400 text-green-300 text-xs">
          {`> ${message}`}
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {!dw.isConsoleUnlocked ? (
          <form onSubmit={handleUnlock} className="bg-black p-4 border border-green-600 space-y-3">
            <div className="text-red-400 font-bold text-sm">
              [!] ADVERTENCIA: ACCESO RESTRINGIDO A SERVICIOS ENCRIPTADOS
            </div>
            <p className="text-gray-400 text-xs">
              Ingresa la frase de paso de descifrado PGP para autenticar la consola de operaciones no atribuibles. (Pista: <code className="text-green-300">CIPHER99</code> o <code className="text-green-300">aureo</code>).
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Passphrase..."
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="flex-1 bg-[#161b22] border border-green-500 text-green-300 p-1.5 text-xs font-mono"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-green-900 hover:bg-green-800 text-green-100 font-bold border border-green-400"
              >
                DESCIFRAR
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Estado de Rastreo Forense */}
            <div className="bg-black p-3 border border-green-600 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-gray-400 text-[10px]">NIVEL DE RASTREO IP FORENSE</div>
                <div className="text-lg font-bold text-red-400">{dw.ipTraceRiskPct.toFixed(0)}%</div>
                <div className="w-full bg-gray-900 h-2 border border-green-800 mt-1">
                  <div
                    className={`h-full ${dw.ipTraceRiskPct > 60 ? 'bg-red-600' : 'bg-yellow-500'}`}
                    style={{ width: `${dw.ipTraceRiskPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-[10px]">ORDEN JUDICIAL DE ALLANAMIENTO</div>
                <div className={`text-sm font-bold mt-1 ${dw.policeRaidPending ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                  {dw.policeRaidPending ? '🚨 ORDEN PENDIENTE (MINISTERIO PÚBLICO)' : '✓ SIN RASTREO VINCULANTE'}
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-[10px]">OPERACIONES EN CURSO</div>
                <div className="text-sm font-bold text-yellow-400 mt-1">
                  {dw.activeContracts.length} contratos activos
                </div>
              </div>
            </div>

            {/* Contratación de Operaciones */}
            <div className="bg-black p-3 border border-green-600 space-y-3">
              <div className="text-green-300 font-bold border-b border-green-800 pb-1">
                [CATÁLOGO DE SERVICIOS CLANDESTINOS]
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">TIPO DE OPERACIÓN:</label>
                  <select
                    value={selectedContract}
                    onChange={e => setSelectedContract(e.target.value as any)}
                    className="w-full bg-[#161b22] border border-green-500 text-green-300 p-1.5 text-xs font-mono"
                  >
                    <option value="sabotaje_fabrica">Sabotaje de Planta / Maquinaria (L 180,000)</option>
                    <option value="robo_patente">Exfiltración de Secretos Industriales (L 250,000)</option>
                    <option value="rompehuelgas_clandestino">Agencia de Rompehuelgas Clandestinos (L 90,000)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">CORPORACIÓN OBJETIVO:</label>
                  <select
                    value={selectedTargetId}
                    onChange={e => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#161b22] border border-green-500 text-green-300 p-1.5 text-xs font-mono"
                  >
                    {rivals.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.sector})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleLaunchOperation}
                className="w-full py-2 bg-red-950 hover:bg-red-900 text-red-200 font-bold border border-red-500 text-xs"
              >
                DESPLEGAR OPERATIVO ENCRIPTADO
              </button>
            </div>

            {/* Contratos Activos */}
            {dw.activeContracts.length > 0 && (
              <div className="bg-black p-3 border border-green-600 space-y-2">
                <div className="text-green-300 font-bold border-b border-green-800 pb-1">
                  [OPERATIVOS EN EJECUCIÓN]
                </div>
                {dw.activeContracts.map(c => (
                  <div key={c.id} className="p-2 bg-[#161b22] border border-green-800 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="text-yellow-400 font-bold uppercase">{c.type}</span> contra <span className="text-white">{c.targetCompetitorName}</span>
                    </div>
                    <div className="text-right text-gray-400 font-mono">
                      <span>{c.daysRemaining} días restantes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
