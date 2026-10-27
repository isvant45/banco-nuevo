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
  onWaiveClientMora?: (client: IndividualClient) => void;
}

export const ClientActionsModal: React.FC<ClientActionsModalProps> = ({
  isOpen,
  onClose,
  client,
  onExtraordinaryPrepayment,
  onRecalibrateLimit,
  onRenegotiateDebt,
  onWaiveClientMora
}) => {
  if (!isOpen) return null;

  const [currentClient, setCurrentClient] = useState<IndividualClient>(client);
  const [prepayAmount, setPrepayAmount] = useState<number>(Math.min(client.accountBalanceHNL, client.loanBalanceHNL));
  const [newLimit, setNewLimit] = useState<number>(client.creditCardLimitHNL);
  const [limitReason, setLimitReason] = useState<string>('Evaluación periódica de capacidad de pago');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync with prop when client changes
  React.useEffect(() => {
    setCurrentClient(client);
    setPrepayAmount(Math.min(client.accountBalanceHNL, client.loanBalanceHNL));
    setNewLimit(client.creditCardLimitHNL);
  }, [client]);

  const handlePrepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prepayAmount <= 0) return;
    sound.playCoinClink();
    onExtraordinaryPrepayment(currentClient.id, prepayAmount);
    setCurrentClient(prev => ({
      ...prev,
      loanBalanceHNL: Math.max(0, prev.loanBalanceHNL - prepayAmount),
      accountBalanceHNL: Math.max(0, prev.accountBalanceHNL - prepayAmount)
    }));
    setActionSuccessMsg(`Abono a capital por ${formatHNL(prepayAmount)} aplicado exitosamente.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    onRecalibrateLimit(currentClient.id, newLimit, limitReason);
    setCurrentClient(prev => ({
      ...prev,
      creditCardLimitHNL: newLimit
    }));
    setActionSuccessMsg(`Límite crediticio actualizado a ${formatHNL(newLimit)}.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleApplyMoraRelief = () => {
    sound.playApprovalStamp();
    if (onWaiveClientMora) {
      onWaiveClientMora(currentClient);
    }
    // Instant reactive visual update in the modal
    setCurrentClient(prev => ({
      ...prev,
      pastDueDays: 0,
      cnbsCategory: 'I - Normal',
      lastAmortizationNotice: 'Condonación de mora del 100% aprobada. Cliente regularizado al día.'
    }));
    setActionSuccessMsg('¡Quita de mora del 100% procesada de inmediato! El expediente ha retornado a Categoría I (Bueno).');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const isHealthy = currentClient.pastDueDays === 0;

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
              <span className="text-xs text-slate-400 font-mono">{currentClient.cif}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {currentClient.name} ({currentClient.division.toUpperCase()})
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
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Tarjeta de Quita de Mora / Regularización destacada */}
          {!isHealthy ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-amber-950/40 border border-rose-500/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Expediente en Mora ({currentClient.pastDueDays} días)
                    </h3>
                    <p className="text-[11px] text-rose-200">
                      Categoría CNBS actual: <span className="font-bold text-amber-300">{currentClient.cnbsCategory}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                  {currentClient.pastDueDays} días mora
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                La quita de mora condona los intereses moratorios acumulados, elimina la penalización de provisión regulatoria y reincorpora el crédito inmediatamente a categoría I sin mancha crediticia.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
                <button
                  type="button"
                  onClick={handleApplyMoraRelief}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold shadow flex items-center gap-1.5 transition-all text-xs"
                >
                  ⚡ Condonar y Quitar Mora 100% Inmediato
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onRenegotiateDebt(currentClient.id, 'ampliar_plazo');
                    setCurrentClient(prev => ({ ...prev, pastDueDays: 0, cnbsCategory: 'I - Normal' }));
                    setActionSuccessMsg('Plazo ampliado a 36 meses con cuota reestructurada.');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  Ampliar Plazo a 36 Meses
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-xs">
                  Cliente al día sin mora registrada (Categoría I - Crédito Bueno)
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                Sin Mora
              </span>
            </div>
          )}

          {/* Tarjeta de Estado de Amortización Mensual */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Notificación del Sistema de Cobranzas
              </span>
              <span className="font-mono font-bold text-amber-400">
                {currentClient.cnbsCategory}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentClient.lastAmortizationNotice || 'Cuenta al día. Las cuotas son debitadas automáticamente cada fin de mes.'}
            </p>
          </div>

          {/* Acción 1: Abono Extraordinario a Capital */}
          {client.hasLoan && client.loanBalanceHNL > 0 && (
            <form onSubmit={handlePrepaymentSubmit} noValidate className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
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
                    step="any"
                    value={prepayAmount}
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
            <form onSubmit={handleLimitSubmit} noValidate className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
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
                    step="any"
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
