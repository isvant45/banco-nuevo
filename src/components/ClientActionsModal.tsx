import React, { useState } from 'react';
import { IndividualClient } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  X, 
  Coins, 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Banknote,
  AlertCircle
} from 'lucide-react';

interface ClientActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: IndividualClient;
  onExtraordinaryPrepayment: (clientId: string, amountHNL: number) => void;
  onRecalibrateLimit: (clientId: string, newLimitHNL: number, notes: string) => void;
  onRenegotiateDebt: (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => void;
}

export const ClientActionsModal: React.FC<ClientActionsModalProps> = ({
  isOpen,
  onClose,
  client,
  onExtraordinaryPrepayment,
  onRecalibrateLimit,
  onRenegotiateDebt
}) => {
  if (!isOpen) return null;

  const [prepayAmount, setPrepayAmount] = useState<number>(Math.min(client.accountBalanceHNL, client.loanBalanceHNL));
  const [newLimit, setNewLimit] = useState<number>(client.creditCardLimitHNL);
  const [limitReason, setLimitReason] = useState<string>('Evaluación periódica de capacidad de pago');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handlePrepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prepayAmount <= 0) return;
    sound.playCoinClink();
    onExtraordinaryPrepayment(client.id, prepayAmount);
    setActionSuccessMsg(`Abono a capital por ${formatHNL(prepayAmount)} aplicado exitosamente.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    onRecalibrateLimit(client.id, newLimit, limitReason);
    setActionSuccessMsg(`Límite crediticio actualizado a ${formatHNL(newLimit)}.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const isHealthy = client.pastDueDays === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                Gestión Directa de Crédito & Saldos
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">{client.cif}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {client.name} ({client.division.toUpperCase()})
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Tarjeta de Estado de Amortización Mensual */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                {isHealthy ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                Estado de Amortización Mensual
              </span>
              <span className="font-mono font-bold text-amber-400">
                {client.cnbsCategory}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {client.lastAmortizationNotice || 'Cuenta al día. Las cuotas son debitadas automáticamente cada fin de mes.'}
            </p>
            {!isHealthy && (
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800">
                <span className="text-slate-400 font-medium">Acción sugerida:</span>
                <button
                  onClick={() => onRenegotiateDebt(client.id, 'ampliar_plazo')}
                  className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold"
                >
                  Ampliar a 36m
                </button>
                <button
                  onClick={() => onRenegotiateDebt(client.id, 'reestructurar_quitas')}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold"
                >
                  Quita 15% Mora
                </button>
              </div>
            )}
          </div>

          {/* Acción 1: Abono Extraordinario a Capital */}
          {client.hasLoan && client.loanBalanceHNL > 0 && (
            <form onSubmit={handlePrepaymentSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Abono Extraordinario a Capital del Préstamo
                </h3>
                <span className="font-mono text-slate-400">
                  Deuda Actual: {formatHNL(client.loanBalanceHNL)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900">
                  <span className="text-slate-500 block">Saldo en Cuenta Disponible:</span>
                  <span className="text-white font-bold">{formatHNL(client.accountBalanceHNL)}</span>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <span className="text-slate-500 block">Cuota Mensual Actual:</span>
                  <span className="text-amber-400 font-bold">{formatHNL(client.loanMonthlyPaymentHNL)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monto a amortizar hoy:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={prepayAmount}
                    max={Math.min(client.accountBalanceHNL, client.loanBalanceHNL)}
                    onChange={e => setPrepayAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                  >
                    Amortizar Capital
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Acción 2: Recalibración del Límite de Crédito */}
          {client.hasCreditCard && (
            <form onSubmit={handleLimitSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Recalibrar Límite de Tarjeta de Crédito
                </h3>
                <span className="font-mono text-slate-400">
                  Límite Actual: {formatHNL(client.creditCardLimitHNL)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nuevo Límite Crediticio:</label>
                  <input
                    type="number"
                    step="5000"
                    value={newLimit}
                    onChange={e => setNewLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Justificación Institucional:</label>
                  <input
                    type="text"
                    value={limitReason}
                    onChange={e => setLimitReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  Guardar Nuevo Límite
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
