import React, { useState } from 'react';
import { IndividualClient, OtherBankProduct, BankingDivisionId } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Sparkles, 
  ArrowRightLeft, 
  Percent, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Client360ModalProps {
  client: IndividualClient | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyoutLoan: (client: IndividualClient, product: OtherBankProduct, proposedRate: number) => void;
  onTransferCardBalance: (client: IndividualClient, product: OtherBankProduct) => void;
  onPortDeposits: (client: IndividualClient, product: OtherBankProduct) => void;
}

export const Client360Modal: React.FC<Client360ModalProps> = ({
  client,
  isOpen,
  onClose,
  onBuyoutLoan,
  onTransferCardBalance,
  onPortDeposits
}) => {
  const [proposedLoanRate, setProposedLoanRate] = useState<number>(11.5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !client) return null;

  const getRivalColor = (bankName: string) => {
    if (bankName.includes('Atlántida')) return 'bg-red-500/20 text-red-300 border-red-500/40';
    if (bankName.includes('Ficohsa')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (bankName.includes('BAC')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (bankName.includes('Banpaís')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const handleBuyLoan = (prod: OtherBankProduct) => {
    sound.playCashChime();
    onBuyoutLoan(client, prod, proposedLoanRate);
    setSuccessMessage(`¡Compra de Cartera Exitosa! Se ha adquirido el saldo de ${formatHNL(prod.balanceHNL)} de ${prod.bankName} al ${proposedLoanRate}% anual.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCardTransfer = (prod: OtherBankProduct) => {
    sound.playApprovalStamp();
    onTransferCardBalance(client, prod);
    setSuccessMessage(`¡Portabilidad de Tarjeta Aprobada! Se transfirió el saldo de ${formatHNL(prod.balanceHNL)} a Áureo Bank con 0% de interés a 12 meses.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDepositPort = (prod: OtherBankProduct) => {
    sound.playCashChime();
    onPortDeposits(client, prod);
    setSuccessMessage(`¡Captación de Fondos Lograda! El cliente ha trasladado ${formatHNL(prod.balanceHNL)} de ${prod.bankName} a su cuenta en Áureo Bank con bono de tasa.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Encabezado del Expediente 360 */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Expediente Financiero 360° · {client.name}
                </h2>
                <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded border border-slate-700">
                  {client.cif}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="text-amber-400 font-semibold uppercase">{client.division}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{client.city}</span>
                </span>
                <span>·</span>
                <span>Score Equifax: <strong className="text-emerald-400 font-mono">{client.equifaxScore}</strong></span>
                <span>·</span>
                <span>Categoría CNBS: <strong className="text-slate-200 font-mono">{client.cnbsCategory}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mensaje de feedback de acción */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* 1. Posición Actual en Áureo Bank */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Productos Actuales en Áureo Bank</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Cuentas y Depósitos</span>
              <span className="font-mono font-bold text-sm text-emerald-400 block">
                {formatHNL(client.accountBalanceHNL)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                {client.accountType}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Préstamos Activos</span>
              {client.hasLoan ? (
                <>
                  <span className="font-mono font-bold text-sm text-amber-400 block">
                    {formatHNL(client.loanBalanceHNL)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Cuota: {formatHNL(client.loanMonthlyPaymentHNL)} · Tasa: {client.loanInterestRateAnnual}%
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500 block">Sin préstamos activos</span>
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Tarjeta de Crédito</span>
              {client.hasCreditCard ? (
                <>
                  <span className="font-mono font-bold text-sm text-blue-400 block">
                    {formatHNL(client.creditCardBalanceHNL)} / {formatHNL(client.creditCardLimitHNL)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {client.creditCardBrand}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500 block">Sin tarjeta emitida</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Detección en Buró: Productos en Bancos Competidores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>Radiografía en la Competencia (Buró CNBS / Equifax)</span>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              {client.otherBankProducts?.length || 0} productos detectados
            </span>
          </div>

          <p className="text-xs text-slate-400">
            El buró detecta los saldos que este cliente mantiene en otras instituciones bancarias hondureñas. Puedes lanzar ofertas agresivas de compra de deuda, portabilidad de saldos y beneficios para captar su liquidez y cartera hacia Áureo Bank.
          </p>

          {(!client.otherBankProducts || client.otherBankProducts.length === 0) ? (
            <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Este cliente mantiene toda su operación exclusivamente con Áureo Bank. No se detectan productos en la competencia.
            </div>
          ) : (
            <div className="space-y-3">
              {client.otherBankProducts.map(prod => {
                const isLoan = prod.productType.includes('Préstamo');
                const isCard = prod.productType.includes('Tarjeta');
                const isDeposit = prod.productType.includes('Depósitos') || prod.productType.includes('Ahorros');

                return (
                  <div
                    key={prod.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRivalColor(prod.bankName)}`}>
                          {prod.bankName}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {prod.productType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Saldo en el competidor: <strong className="font-mono text-amber-400">{formatHNL(prod.balanceHNL)}</strong> · Tasa cobrada/pagada: <strong className="font-mono text-white">{prod.interestRatePct}% anual</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {prod.details}
                      </p>
                    </div>

                    {/* Acciones de Robo de Cartera y Captación */}
                    <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {isLoan && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400">Tasa oferta:</span>
                            <input
                              type="number"
                              min="8"
                              max="20"
                              step="0.5"
                              value={proposedLoanRate}
                              onChange={e => setProposedLoanRate(Number(e.target.value))}
                              className="w-12 bg-transparent text-amber-300 font-mono font-bold text-xs focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">%</span>
                          </div>
                          <button
                            onClick={() => handleBuyLoan(prod)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Comprar Cartera</span>
                          </button>
                        </div>
                      )}

                      {isCard && (
                        <button
                          onClick={() => handleCardTransfer(prod)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Traslado a Tarjeta 0%</span>
                        </button>
                      )}

                      {isDeposit && (
                        <button
                          onClick={() => handleDepositPort(prod)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Portabilidad de Fondos (+2.5% Bono)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
