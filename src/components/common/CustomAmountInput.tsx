import React, { useState, useEffect } from 'react';

export function formatHNLAmount(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'L 0.00';
  return `L ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Parsea cadenas con formatos monetarios habituales:
 * - "L 1,250.50"
 * - "1250,50"
 * - "L. 25,000.75"
 * - "1.500.000,25"
 * - "500.9"
 * - "  75000.00  "
 * - "0.05"
 * Devuelve 0 para entradas vacías, y NaN para entradas inválidas o negativas.
 */
export function parseMonetaryInput(val: string): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).trim();
  if (str === '') return 0;
  if (str.includes('-')) return NaN;

  // Eliminar prefijos de moneda como "L.", "L", "l.", "l"
  let cleaned = str.replace(/^[Ll]\.?\s*/, '').trim();
  if (!cleaned) return 0;

  // Validar caracteres no numéricos
  if (/[^0-9.,\s]/.test(cleaned)) {
    return NaN;
  }

  // Detectar formato europeo vs formato americano
  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  if (lastDot !== -1 && lastComma !== -1) {
    if (lastComma > lastDot) {
      // Formato Europeo: 1.500.000,25 -> quitar puntos, cambiar coma por punto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato US: 1,500,000.25 -> quitar comas
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // Solo comas presentes
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal con coma: "1250,50" -> "1250.50"
      cleaned = parts[0] + '.' + parts[1];
    } else {
      // Separador de miles: "1,250" -> "1250"
      cleaned = cleaned.replace(/,/g, '');
    }
  } else {
    // Solo puntos presentes
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      // Puntos como separadores de miles
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num) || num < 0) return NaN;
  return Math.round(num * 100) / 100;
}

export interface CustomAmountInputProps {
  label: string;
  value: number;
  onChange: (newVal: number) => void;
  availableBalance?: number;
  maxAllowed?: number;
  minAllowed?: number;
  operationType?: 'pago_cuota' | 'abono_capital' | 'retiro_caja' | 'deposito_cuenta' | 'transferencia' | 'prestamo' | 'inversion' | 'generico';
  helpText?: string;
  disabled?: boolean;
}

export const CustomAmountInput: React.FC<CustomAmountInputProps> = ({
  label,
  value,
  onChange,
  availableBalance,
  maxAllowed,
  minAllowed = 0.01,
  operationType = 'generico',
  helpText,
  disabled = false
}) => {
  // Mantener el texto tal cual lo escribe el usuario para permitir borrar y editar centavos
  const [inputText, setInputText] = useState<string>(() => (value > 0 ? value.toString() : ''));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sincronizar texto externo cuando no se tiene foco
  useEffect(() => {
    if (!isFocused) {
      setInputText(value > 0 ? value.toString() : '');
    }
  }, [value, isFocused]);

  const parsedAmount = parseMonetaryInput(inputText);
  const currentNumericValue = parsedAmount !== null ? parsedAmount : 0;

  // Validaciones no silenciosas
  let validationError: string | null = null;
  if (inputText.trim() !== '' && parsedAmount === null) {
    validationError = 'Por favor escribe un monto numérico válido (ej. 1500.50).';
  } else if (currentNumericValue > 0 && currentNumericValue < minAllowed) {
    validationError = `El monto mínimo permitido es ${formatHNLAmount(minAllowed)}.`;
  } else if (maxAllowed !== undefined && currentNumericValue > maxAllowed) {
    validationError = `El monto excede el límite máximo permitido para esta operación (${formatHNLAmount(maxAllowed)}). No se reducirá automáticamente para que puedas corregirlo.`;
  } else if (availableBalance !== undefined && currentNumericValue > availableBalance) {
    validationError = `Fondos insuficientes. El saldo disponible es de ${formatHNLAmount(availableBalance)}, pero estás intentando usar ${formatHNLAmount(currentNumericValue)}.`;
  }

  // Cálculo de saldo resultante proyectado
  let resultingBalance: number | null = null;
  if (availableBalance !== undefined) {
    if (operationType === 'deposito_cuenta') {
      resultingBalance = availableBalance + currentNumericValue;
    } else {
      resultingBalance = Math.max(0, availableBalance - currentNumericValue);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);
    const parsed = parseMonetaryInput(raw);
    if (parsed !== null) {
      onChange(parsed);
    } else if (raw.trim() === '') {
      onChange(0);
    }
  };

  const handleApplyPercentage = (pct: number) => {
    const base = maxAllowed !== undefined ? Math.min(maxAllowed, availableBalance ?? maxAllowed) : (availableBalance ?? 0);
    if (base <= 0) return;
    const computed = Math.round(base * pct * 100) / 100;
    setInputText(computed.toString());
    onChange(computed);
  };

  const handleUseMax = () => {
    const maxVal = maxAllowed !== undefined ? (availableBalance !== undefined ? Math.min(maxAllowed, availableBalance) : maxAllowed) : (availableBalance ?? 0);
    if (maxVal <= 0) return;
    const computed = Math.round(maxVal * 100) / 100;
    setInputText(computed.toString());
    onChange(computed);
  };

  return (
    <div className="space-y-1.5 font-sans text-xs">
      {/* Etiqueta y Ayuda */}
      <div className="flex justify-between items-baseline">
        <label className="font-bold text-slate-800 text-xs">{label}</label>
        {availableBalance !== undefined && (
          <span className="text-[11px] text-slate-600">
            Saldo disponible: <strong className="text-slate-900">{formatHNLAmount(availableBalance)}</strong>
          </span>
        )}
      </div>

      {/* Input de cantidad personalizada con centavos */}
      <div className="relative flex items-center">
        <span className="absolute left-2.5 font-bold text-slate-500 font-mono text-xs select-none">
          L
        </span>
        <input
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="0.00"
          className={`w-full pl-7 pr-3 py-1.5 border font-mono font-bold text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 ${
            validationError
              ? 'border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50/40'
              : 'border-slate-400 focus:border-blue-600 focus:ring-blue-100'
          }`}
        />
      </div>

      {/* Accesos rápidos de porcentaje y Botón Máximo Disponible */}
      <div className="flex items-center gap-1 text-[11px] flex-wrap">
        <button
          type="button"
          onClick={() => handleApplyPercentage(0.25)}
          disabled={disabled}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => handleApplyPercentage(0.50)}
          disabled={disabled}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => handleApplyPercentage(0.75)}
          disabled={disabled}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
        >
          75%
        </button>
        <button
          type="button"
          onClick={() => handleApplyPercentage(1.0)}
          disabled={disabled}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
        >
          100%
        </button>
        <button
          type="button"
          onClick={handleUseMax}
          disabled={disabled}
          className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xs font-bold cursor-pointer ml-auto active:scale-95"
        >
          Usar máximo disponible
        </button>
      </div>

      {/* Alerta de validación detallada (sin recorte silencioso) */}
      {validationError && (
        <div className="p-1.5 bg-red-100 border border-red-300 text-red-800 text-[11px] flex items-start gap-1 rounded-xs">
          <span className="font-bold text-red-900">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Saldo que quedaría y ayuda contextual */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
        {helpText && <span>{helpText}</span>}
        {resultingBalance !== null && !validationError && (
          <span className="ml-auto font-medium text-slate-700">
            Saldo que quedaría:{' '}
            <strong className={resultingBalance >= 0 ? 'text-emerald-800 font-bold' : 'text-red-700 font-bold'}>
              {formatHNLAmount(resultingBalance)}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
};
