import React, { useState, useEffect } from 'react';

export function parseMonetaryInput(raw: string): { amount: number; isValid: boolean; error?: string } {
  if (!raw || raw.trim() === '') {
    return { amount: 0, isValid: false, error: 'Ingresa un monto.' };
  }

  // Limpiar caracteres de moneda y espacios
  let clean = raw.trim().replace(/[L\$HNL\s]/gi, '');

  // Detectar separadores
  const hasComma = clean.includes(',');
  const hasDot = clean.includes('.');

  if (hasComma && hasDot) {
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    if (lastDot > lastComma) {
      // Formato estándar hondureño/anglosajón: 1,234,567.89
      clean = clean.replace(/,/g, '');
    } else {
      // Formato europeo/latino: 1.234.567,89
      clean = clean.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    // Si tiene coma única con 1 o 2 decimales al final: 1237,50 -> 1237.50
    const parts = clean.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      clean = `${parts[0]}.${parts[1]}`;
    } else {
      // Es separador de miles: 1,000,000
      clean = clean.replace(/,/g, '');
    }
  }

  const num = Number(clean);

  if (isNaN(num)) {
    return { amount: 0, isValid: false, error: 'Formato no numérico inválido.' };
  }

  if (num < 0) {
    return { amount: num, isValid: false, error: 'No se permiten importes negativos.' };
  }

  if (!isFinite(num) || num > 1e12) {
    return { amount: num, isValid: false, error: 'El monto excede el rango monetario permitido.' };
  }

  // Redondear a 2 decimales para precisión de centavos
  const rounded = Math.round(num * 100) / 100;
  return { amount: rounded, isValid: true };
}

export function formatHNLAmount(amount: number): string {
  return `L ${amount.toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

interface CustomAmountInputProps {
  label?: string;
  value: number;
  onChange: (numericValue: number, rawString: string) => void;
  maxAmount?: number;
  minAmount?: number;
  currentBalance?: number;
  balanceLabel?: string;
  resultingBalanceLabel?: string;
  operationMode?: 'deduct' | 'add' | 'neutral';
  placeholder?: string;
  disabled?: boolean;
  explanationNote?: string;
  id?: string;
}

export const CustomAmountInput: React.FC<CustomAmountInputProps> = ({
  label = 'Monto a Operar (HNL):',
  value,
  onChange,
  maxAmount,
  minAmount = 1,
  currentBalance,
  balanceLabel = 'Saldo Disponible',
  resultingBalanceLabel = 'Saldo Resultante',
  operationMode = 'deduct',
  placeholder = '0.00',
  disabled = false,
  explanationNote,
  id = 'custom-amount-input'
}) => {
  const [rawText, setRawText] = useState<string>(value > 0 ? value.toString() : '');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sincronizar texto cuando el valor cambia desde el exterior (ej: presets o inicialización)
  useEffect(() => {
    if (!isFocused) {
      if (value === 0 && rawText === '') return;
      // Si el valor numérico difiere significativamente del parseado actual
      const parsed = parseMonetaryInput(rawText);
      if (parsed.amount !== value) {
        setRawText(value > 0 ? value.toString() : '');
      }
    }
  }, [value, isFocused]);

  const parsed = parseMonetaryInput(rawText);
  const currentNum = parsed.isValid ? parsed.amount : 0;

  // Validaciones no destructivas (mantiene el texto ingresado por el usuario)
  let validationError: string | undefined = undefined;
  if (rawText.trim() !== '') {
    if (!parsed.isValid) {
      validationError = parsed.error;
    } else if (minAmount !== undefined && currentNum < minAmount && currentNum > 0) {
      validationError = `El monto mínimo para esta operación es ${formatHNLAmount(minAmount)}.`;
    } else if (maxAmount !== undefined && currentNum > maxAmount) {
      validationError = `El monto ingresado (${formatHNLAmount(currentNum)}) supera el límite autorizado o saldo disponible (${formatHNLAmount(maxAmount)}).`;
    }
  }

  // Cálculo del saldo resultante proyectado
  let projectedResult: number | null = null;
  if (currentBalance !== undefined && parsed.isValid) {
    if (operationMode === 'deduct') {
      projectedResult = currentBalance - currentNum;
    } else if (operationMode === 'add') {
      projectedResult = currentBalance + currentNum;
    } else {
      projectedResult = currentBalance;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setRawText(text);
    const res = parseMonetaryInput(text);
    onChange(res.isValid ? res.amount : 0, text);
  };

  const setPercentage = (pct: number) => {
    if (maxAmount === undefined || maxAmount <= 0) return;
    const calc = Math.round((maxAmount * pct) * 100) / 100;
    setRawText(calc.toString());
    onChange(calc, calc.toString());
  };

  return (
    <div className="space-y-1.5 text-xs font-sans">
      <div className="flex justify-between items-center text-[11px]">
        <label htmlFor={id} className="font-bold text-slate-800">
          {label}
        </label>
        {currentBalance !== undefined && (
          <span className="text-slate-600 font-mono">
            {balanceLabel}: <strong className="text-slate-900">{formatHNLAmount(currentBalance)}</strong>
          </span>
        )}
      </div>

      {/* Input retro Windows con centavos */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 font-bold font-mono">
          L
        </div>
        <input
          id={id}
          type="text"
          value={rawText}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-8 pr-24 py-1.5 font-mono text-sm font-bold bg-white text-slate-900 border-2 shadow-inner focus:outline-none ${
            validationError
              ? 'border-red-600 bg-red-50 text-red-900'
              : 'border-[#808080] border-t-black border-l-black focus:border-[#000080]'
          } disabled:bg-slate-200 disabled:text-slate-500`}
        />
        {/* Vista previa formateada a la derecha */}
        {parsed.isValid && currentNum > 0 && (
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-[11px] font-mono text-slate-500">
            {formatHNLAmount(currentNum)}
          </div>
        )}
      </div>

      {/* Botones de atajo porcentual y Máximo */}
      {maxAmount !== undefined && maxAmount > 0 && !disabled && (
        <div className="flex items-center gap-1 pt-0.5">
          <span className="text-[10px] text-slate-500 font-semibold mr-1">Atajos:</span>
          {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setPercentage(ratio)}
              className="px-1.5 py-0.5 bg-[#c0c0c0] hover:bg-[#d8d8d8] active:bg-[#a0a0a0] border-t border-l border-white border-b border-r border-[#404040] text-[10px] font-bold text-slate-800 shadow-sm cursor-pointer"
            >
              {ratio === 1.0 ? '100%' : `${ratio * 100}%`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPercentage(1.0)}
            className="ml-auto px-2 py-0.5 bg-[#000080] hover:bg-[#1010a0] active:bg-[#000060] text-white border-t border-l border-[#8080ff] border-b border-r border-black text-[10px] font-bold shadow-sm cursor-pointer"
          >
            Usar máximo disponible
          </button>
        </div>
      )}

      {/* Saldo que quedaría tras la transacción */}
      {projectedResult !== null && parsed.isValid && currentNum > 0 && !validationError && (
        <div className="flex justify-between items-center px-2 py-1 bg-slate-100 border border-slate-300 text-[11px] font-mono">
          <span className="text-slate-600">{resultingBalanceLabel}:</span>
          <span className={`font-bold ${projectedResult < 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {formatHNLAmount(projectedResult)}
          </span>
        </div>
      )}

      {/* Mensaje de validación explicativo no destructivo */}
      {validationError && (
        <div className="p-1.5 bg-rose-50 border border-rose-400 text-rose-800 text-[11px] flex items-start gap-1.5 shadow-sm">
          <span className="text-xs">⚠️</span>
          <span className="font-semibold leading-tight">{validationError}</span>
        </div>
      )}

      {explanationNote && !validationError && (
        <p className="text-[10px] text-slate-500 leading-tight">
          ℹ️ {explanationNote}
        </p>
      )}
    </div>
  );
};
