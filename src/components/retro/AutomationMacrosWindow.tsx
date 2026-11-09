import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import { BusinessAutomationRule, TriggerConditionField, AutomationActionType } from '../../game/tycoonAdvancedTypes';

interface AutomationMacrosWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const AutomationMacrosWindow: React.FC<AutomationMacrosWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const rules = state.automationRules || [];
  const [ruleName, setRuleName] = useState('');
  const [triggerField, setTriggerField] = useState<TriggerConditionField>('caja_menor_que');
  const [triggerValue, setTriggerValue] = useState<number>(20000);
  const [actionType, setActionType] = useState<AutomationActionType>('transferir_de_banco_a_caja');
  const [actionValue, setActionValue] = useState<number>(50000);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleRule = (ruleId: string) => {
    const updatedRules = rules.map(r => r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r);
    onUpdateState({
      ...state,
      automationRules: updatedRules
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = rules.filter(r => r.id !== ruleId);
    onUpdateState({
      ...state,
      automationRules: updatedRules
    });
    setMessage('Regla de automatización eliminada.');
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      setMessage('Escribe un nombre para la regla de negocio.');
      return;
    }

    const newRule: BusinessAutomationRule = {
      id: `rule_${Date.now()}`,
      name: ruleName.trim(),
      triggerField,
      triggerValue,
      actionType,
      actionValue,
      isEnabled: true,
      executionsCount: 0
    };

    onUpdateState({
      ...state,
      automationRules: [...rules, newRule]
    });

    setRuleName('');
    setMessage(`¡Regla "${newRule.name}" creada y activada correctamente!`);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>⚙️</span>
          <span>PROGRAMADOR DE AUTOMATIZACIONES CONDICIONALES (MACROS ERP)</span>
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
            Crea secuencias lógicas <strong>"SI [Condición] ENTONCES [Acción]"</strong> para delegar la microgestión de tesorería y recursos humanos. Las macros se evalúan automáticamente al cierre y avance de cada jornada.
          </p>
        </div>

        {/* Creador de Reglas */}
        <form onSubmit={handleCreateRule} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-xs text-[#000080] border-b pb-1 mb-2">
            ➕ Nueva Regla de Negocio Automatizada
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Nombre de la Regla:</label>
              <input
                type="text"
                placeholder="Ej: Inyección de Liquidez Diaria"
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                className="w-full p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">SI [Condición Disparadora]:</label>
              <div className="flex gap-1.5">
                <select
                  value={triggerField}
                  onChange={e => setTriggerField(e.target.value as TriggerConditionField)}
                  className="flex-1 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs"
                >
                  <option value="caja_menor_que">Caja Chica es menor que (L)</option>
                  <option value="moral_menor_que">Moral de empleados menor que (%)</option>
                  <option value="deuda_bancaria_mayor_que">Deuda bancaria mayor que (L)</option>
                </select>
                <input
                  type="number"
                  value={triggerValue}
                  onChange={e => setTriggerValue(Number(e.target.value))}
                  className="w-24 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">ENTONCES [Ejecutar Acción]:</label>
              <div className="flex gap-1.5">
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as AutomationActionType)}
                  className="flex-1 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs"
                >
                  <option value="transferir_de_banco_a_caja">Transferir de Banco a Caja Chica (L)</option>
                  <option value="bono_moral_empleados">Pagar Bono de Moral a Empleados (L)</option>
                </select>
                <input
                  type="number"
                  value={actionValue}
                  onChange={e => setActionValue(Number(e.target.value))}
                  className="w-24 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-1.5 bg-[#000080] text-white hover:bg-blue-900 font-bold border-t-2 border-l-2 border-blue-400 border-b-2 border-r-2 border-black"
            >
              Guardar y Activar Macro
            </button>
          </div>
        </form>

        {/* Lista de Macros Existentes */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-xs text-gray-700 border-b pb-1 mb-2">
            📋 Macros Programadas ({rules.length})
          </div>

          <div className="space-y-2">
            {rules.map(r => (
              <div
                key={r.id}
                className="p-2 border border-gray-400 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <div>
                  <div className="font-bold text-gray-900 text-xs flex items-center gap-2">
                    <span>{r.name}</span>
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase ${r.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {r.isEnabled ? 'ACTIVA' : 'PAUSADA'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5 font-mono">
                    SI [{r.triggerField} {r.triggerValue.toLocaleString()}] ➔ ENTONCES [{r.actionType} {r.actionValue.toLocaleString()}]
                  </div>
                  {r.lastExecutedMessage && (
                    <div className="text-[10px] text-blue-800 italic mt-0.5">
                      Última ejecución (Día {r.lastExecutedDay}): {r.lastExecutedMessage}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {r.executionsCount} ejecuciones
                  </span>
                  <button
                    onClick={() => handleToggleRule(r.id)}
                    className="px-2 py-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold text-[10px] border-t border-l border-white border-b-2 border-r-2 border-black"
                  >
                    {r.isEnabled ? 'Pausar' : 'Reanudar'}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(r.id)}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[10px] border border-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
