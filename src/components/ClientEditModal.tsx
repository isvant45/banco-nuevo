import React, { useState, useEffect } from 'react';
import { IndividualClient } from '../game/types';
import { formatHNL, formatPct, evaluateClientDivisionUpgrade } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  User, 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Landmark,
  FileText,
  AlertTriangle,
  Tag
} from 'lucide-react';

interface ClientEditModalProps {
  client: IndividualClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: IndividualClient) => void;
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState<string>(client?.name || '');
  const [city, setCity] = useState<string>(client?.city || '');
  const [notes, setNotes] = useState<string>(client?.notes || '');

  const [accountBalance, setAccountBalance] = useState<number>(client?.accountBalanceHNL || 0);
  const [hasCard, setHasCard] = useState<boolean>(client?.hasCreditCard || false);
  const [cardBrand, setCardBrand] = useState(client?.creditCardBrand || 'Visa Clásica');
  const [cardLimit, setCardLimit] = useState<number>(client?.creditCardLimitHNL || 0);
  const [cardBalance, setCardBalance] = useState<number>(client?.creditCardBalanceHNL || 0);

  const [hasLoan, setHasLoan] = useState<boolean>(client?.hasLoan || false);
  const [loanBalance, setLoanBalance] = useState<number>(client?.loanBalanceHNL || 0);
  const [loanRate, setLoanRate] = useState<number>(client?.loanInterestRateAnnual || 0);
  const [loanMonths, setLoanMonths] = useState<number>(client?.loanMonthsRemaining || 0);
  const [guaranteedPayment, setGuaranteedPayment] = useState<boolean>(client?.guaranteedPayment || false);

  const [pensionEnrolled, setPensionEnrolled] = useState<boolean>(client?.pensionFundEnrolled || false);
  const [pensionProfile, setPensionProfile] = useState(client?.pensionFundProfile || 'Conservador');

  // Actualizar estados si cambia el cliente seleccionado
  useEffect(() => {
    if (client) {
      setName(client.name);
      setCity(client.city);
      setNotes(client.notes || '');
      setAccountBalance(client.accountBalanceHNL);
      setHasCard(client.hasCreditCard);
      setCardBrand(client.creditCardBrand);
      setCardLimit(client.creditCardLimitHNL);
      setCardBalance(client.creditCardBalanceHNL);
      setHasLoan(client.hasLoan);
      setLoanBalance(client.loanBalanceHNL);
      setLoanRate(client.loanInterestRateAnnual);
      setLoanMonths(client.loanMonthsRemaining);
      setGuaranteedPayment(client.guaranteedPayment);
      setPensionEnrolled(client.pensionFundEnrolled || false);
      setPensionProfile(client.pensionFundProfile || 'Conservador');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  // Proyección de división automática según el saldo tipeado
  const projectedUpgrade = evaluateClientDivisionUpgrade(client, accountBalance);

  const handleToggleGuaranteed = () => {
    sound.playApprovalStamp();
    setGuaranteedPayment(!guaranteedPayment);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();

    // Reclasificación automática de división si aplica
    const upgradedDivision = projectedUpgrade.wasUpgraded 
      ? projectedUpgrade.upgradedDivision 
      : client.division;

    onSave({
      ...client,
      name: name.trim() || client.name,
      city: city.trim() || client.city,
      notes: notes.trim(),
      division: upgradedDivision,
      accountBalanceHNL: accountBalance,
      hasCreditCard: hasCard,
      creditCardBrand: cardBrand,
      creditCardLimitHNL: hasCard ? cardLimit : 0,
      creditCardBalanceHNL: hasCard ? cardBalance : 0,
      hasLoan: hasLoan,
      loanBalanceHNL: hasLoan ? loanBalance : 0,
      loanInterestRateAnnual: hasLoan ? loanRate : 0,
      loanMonthsRemaining: hasLoan ? loanMonths : 0,
      loanMonthlyPaymentHNL: hasLoan && loanMonths > 0 
        ? Math.round((loanBalance * (loanRate / 100 / 12)) / (1 - Math.pow(1 + (loanRate / 100 / 12), -loanMonths)) || 0)
        : 0,
      guaranteedPayment: guaranteedPayment,
      pensionFundEnrolled: pensionEnrolled,
      pensionFundProfile: pensionEnrolled ? pensionProfile : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del Cliente */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Modificación de Cliente: {name}
                </h2>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {client.cif}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400 font-semibold uppercase">{client.division}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{client.city}</span>
                </span>
                <span>·</span>
                <span>Score Equifax: <strong className="text-emerald-400 font-mono">{client.equifaxScore}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Notificación de Promoción de Banca Automática en Tiempo Real */}
        {projectedUpgrade.wasUpgraded && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong className="block font-semibold">¡Reclasificación de Segmento Automática!</strong>
              <span>
                Con este saldo de {formatHNL(accountBalance)}, el cliente será promovido inmediatamente a la <strong>Banca {projectedUpgrade.upgradedDivision.toUpperCase()}</strong>.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* 1. Datos Personales y Nombre Modificable */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <User className="w-4 h-4 text-blue-400" />
              <span>Identificación del Cliente</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Nombre Completo del Cliente:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Carlos Roberto Mejía"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Ciudad de Residencia / Agencia:</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="San Pedro Sula, Tegucigalpa, etc."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Notas de Personalización Ejecutiva:</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Perfil del cliente, profesión, empresas vinculadas o acuerdos especiales..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Cláusula de Pago Garantizado Destacada */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
            guaranteedPayment 
              ? 'bg-emerald-500/10 border-emerald-500/40' 
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${guaranteedPayment ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="font-bold text-white text-xs">Cláusula de Pago Garantizado</span>
                {guaranteedPayment && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                    PAGO 100% PUNTUAL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {guaranteedPayment 
                  ? 'Este cliente nunca pierde un pago. La cuota mensual se deduce automáticamente de sus depósitos sin generar mora ni provisiones CNBS.'
                  : 'Cobranza ordinaria. Sujeto a retrasos y provisiones de mora si incumple la fecha límite.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleGuaranteed}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors ${
                guaranteedPayment
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {guaranteedPayment ? 'Garantizado Activo' : 'Activar Garantía'}
            </button>
          </div>

          {/* 3. Cuentas de Depósito */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-200 font-semibold">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Cuenta Bancaria ({client.accountType})</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                {formatHNL(accountBalance)}
              </span>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Saldo en Cuenta (Lempiras) — <span className="text-slate-500">Si subes de L. 250,000 pasa a Premier, y sobre L. 1.2M pasa a Privada</span>:
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={accountBalance}
                onChange={e => setAccountBalance(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Tarjeta de Crédito */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Tarjeta de Crédito</span>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCard}
                  onChange={e => setHasCard(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500"
                />
                <span>Tarjeta Activa</span>
              </label>
            </div>

            {hasCard && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Gama de Tarjeta:</label>
                  <select
                    value={cardBrand}
                    onChange={e => setCardBrand(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs"
                  >
                    <option value="Visa Clásica">Visa Clásica</option>
                    <option value="Mastercard Oro">Mastercard Oro</option>
                    <option value="Mastercard Platinum">Mastercard Platinum</option>
                    <option value="Visa Infinite / Black">Visa Infinite / Black</option>
                    <option value="Visa Empresarial">Visa Empresarial</option>
                    <option value="Mastercard Corporativa">Mastercard Corporativa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Límite Aprobado (L.):</label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={cardLimit}
                    onChange={e => setCardLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Saldo Utilizado (L.):</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={cardBalance}
                    onChange={e => setCardBalance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-amber-400 rounded p-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Préstamos y Financiamiento */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Préstamo Bancario Activo</span>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLoan}
                  onChange={e => setHasLoan(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Préstamo Vigente</span>
              </label>
            </div>

            {hasLoan && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Saldo Deudor (L.):</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={loanBalance}
                    onChange={e => setLoanBalance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tasa Anual (%):</label>
                  <input
                    type="number"
                    min="8"
                    max="36"
                    step="0.5"
                    value={loanRate}
                    onChange={e => setLoanRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Meses Restantes:</label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={loanMonths}
                    onChange={e => setLoanMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Fondo de Pensiones y Retiro */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Fondo de Pensiones Áureo Futuro</span>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pensionEnrolled}
                  onChange={e => setPensionEnrolled(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500"
                />
                <span>Afiliado a Pensiones</span>
              </label>
            </div>

            {pensionEnrolled && (
              <div className="pt-1">
                <label className="block text-[10px] text-slate-400 mb-1">Perfil de Portafolio:</label>
                <select
                  value={pensionProfile}
                  onChange={e => setPensionProfile(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs"
                >
                  <option value="Conservador">Conservador (7.5% anual · Bonos BCH)</option>
                  <option value="Moderado">Moderado (9.2% anual · Mixto)</option>
                  <option value="Crecimiento">Crecimiento (11.8% anual · Sindicados)</option>
                </select>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md shadow-amber-500/20"
            >
              Guardar Modificaciones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
