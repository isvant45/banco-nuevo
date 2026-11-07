import React, { useState, useMemo } from 'react';
import { 
  SimulatedEmail, 
  EmailCategory, 
  DailySimulationState, 
  CommercialBankId, 
  CommercialLoanType,
  TransactionVoucher,
  DynamicBankOffer
} from '../../game/retroSimTypes';
import { CustomAmountInput, formatHNLAmount } from '../common/CustomAmountInput';
import { 
  COMMERCIAL_BANKS_PROFILES, 
  getInboxUnreadCount, 
  negotiateBankOfferFromEmail, 
  calculateCollateralAvailableCoverage 
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface BusinessEmailWindowProps {
  state: DailySimulationState;
  companyName: string;
  onUpdateState?: (nextSt: DailySimulationState) => void;
  onOpenBank?: () => void;
  onOpenSar?: () => void;
  onOpenRegister?: () => void;
  onOpenLoanTerms?: (bankId: CommercialBankId, productType: CommercialLoanType, amount: number, termMonths: number, offerId?: string) => void;
  onPayLoanFromEmail?: (bankId: CommercialBankId, amount: number, payFromAccount: 'checking' | 'cash') => { success: boolean; message: string; remainingBalance?: number };
  onPaySarFromEmail?: (amount: number, payFromAccount: 'checking' | 'cash') => { success: boolean; message: string; remainingDebt?: number };
  onOpenWindow?: (windowId: string) => void;
  onViewVoucher?: (voucher: TransactionVoucher) => void;
  onUpdateEmailState?: (emailId: string, updates: Partial<SimulatedEmail>) => void;
  onRespondEmail?: (originalEmail: SimulatedEmail, replyText: string) => void;
  onNegotiateOffer?: (offerOrId: DynamicBankOffer | string, proposal: { requestedAmount?: number; requestedRate?: number; requestedTerm?: number; requestedFee?: number; collateralIds?: string[]; requestedCollateralIds?: string[] }) => { outcome?: 'aprobado' | 'contraoferta' | 'rechazado'; success?: boolean; reason?: string; message?: string; dialogue?: string; updatedOffer?: DynamicBankOffer };
  onAcceptOfferFromEmail?: (offerOrId: DynamicBankOffer | string, destinationAccount?: 'checking' | 'cash' | CommercialBankId, destinationAccountType?: 'checking' | 'cash', collateralIds?: string[]) => { success: boolean; message: string; voucher?: TransactionVoucher };
}

const CATEGORY_LABELS: Record<EmailCategory, { label: string; icon: string; color: string }> = {
  ventas_clientes: { label: 'Ventas y Clientes', icon: '🛒', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  bancos_financiamiento: { label: 'Bancos y Financiamiento', icon: '🏛️', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  pagos_vencimientos: { label: 'Pagos y Vencimientos', icon: '⏱️', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  proveedores: { label: 'Proveedores', icon: '📦', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  sar_tributario: { label: 'SAR & Solvencia Fiscal', icon: '📋', color: 'bg-red-100 text-red-900 border-red-300' },
  garantias: { label: 'Garantías Reales', icon: '🛡️', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  proyectos: { label: 'Proyectos y Licitaciones', icon: '🏗️', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  competidores_adquisiciones: { label: 'Competidores y M&A', icon: '🤝', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  sistema_avisos: { label: 'Avisos del Sistema', icon: '⚙️', color: 'bg-slate-100 text-slate-900 border-slate-300' }
};

export const BusinessEmailWindow: React.FC<BusinessEmailWindowProps> = ({
  state,
  companyName,
  onOpenLoanTerms,
  onPayLoanFromEmail,
  onPaySarFromEmail,
  onOpenWindow,
  onViewVoucher,
  onUpdateEmailState,
  onRespondEmail,
  onNegotiateOffer,
  onAcceptOfferFromEmail
}) => {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'starred' | 'sent' | 'archive'>('inbox');
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | 'all'>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<'all' | 'company' | 'personal'>('all');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);

  // Modal de pago directo
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentTarget, setPaymentTarget] = useState<{
    type: 'loan' | 'sar' | 'supplier';
    bankId?: CommercialBankId;
    title: string;
    amountDue: number;
    accountSource: 'checking' | 'cash';
  } | null>(null);
  const [directPayAmount, setDirectPayAmount] = useState<number>(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessFeedback, setPaymentSuccessFeedback] = useState<string | null>(null);

  // Redacción de respuestas
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  // Negociación de oferta bancaria
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [negotiateAmount, setNegotiateAmount] = useState<number>(0);
  const [negotiateRate, setNegotiateRate] = useState<number>(10.5);
  const [negotiateTerm, setNegotiateTerm] = useState<number>(36);
  const [negotiateFee, setNegotiateFee] = useState<number>(1.0);
  const [selectedCollateralsForOffer, setSelectedCollateralsForOffer] = useState<string[]>([]);
  const [negotiationResultFeedback, setNegotiationResultFeedback] = useState<{
    outcome: 'aprobado' | 'contraoferta' | 'rechazado';
    message: string;
  } | null>(null);

  // Modal de desembolso y aceptación de oferta
  const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);
  const [offerToAccept, setOfferToAccept] = useState<DynamicBankOffer | null>(null);
  const [acceptDestinationAccount, setAcceptDestinationAccount] = useState<'checking' | 'cash'>('checking');
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const companyEmailAddress = `gerencia@${companySlug}.hn`;
  const personalEmailAddress = `propietario@${companySlug}.hn`;

  const emails = state.simulatedEmails || [];

  // Filtrado de correos respetando carpeta y regla de no leídos
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Carpeta
      if (selectedFolder === 'inbox' && (email.folder !== 'inbox' || email.isArchived)) return false;
      if (selectedFolder === 'starred' && (!email.isStarred || email.isArchived)) return false;
      if (selectedFolder === 'sent' && email.folder !== 'sent') return false;
      if (selectedFolder === 'archive' && !email.isArchived) return false;

      // Filtro de Solo no leídos (mantener el correo seleccionado abierto si el usuario lo está leyendo)
      if (onlyUnread) {
        if (email.isRead && email.id !== selectedEmailId) return false;
      }

      // Filtro de Cuenta
      const recip = (email.recipientEmail || email.recipient || '').toLowerCase();
      if (accountFilter === 'company' && !recip.includes('gerencia@')) return false;
      if (accountFilter === 'personal' && !recip.includes('propietario@')) return false;

      // Categoría
      if (selectedCategory !== 'all' && email.category !== selectedCategory) return false;

      // Buscador
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesSubject = (email.subject || '').toLowerCase().includes(q);
        const senderName = email.senderName || email.sender || '';
        const matchesSender = senderName.toLowerCase().includes(q) || (email.senderEmail || '').toLowerCase().includes(q);
        const matchesBody = (email.body || '').toLowerCase().includes(q);
        if (!matchesSubject && !matchesSender && !matchesBody) return false;
      }

      return true;
    });
  }, [emails, selectedFolder, selectedCategory, searchQuery, accountFilter, onlyUnread, selectedEmailId]);

  // Correo seleccionado: si no hay selección explícita o se cambió de vista, no mostrar correo ajeno
  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    const found = emails.find(e => e.id === selectedEmailId);
    if (!found) return null;
    // Si el correo fue archivado y estamos en inbox, no mostrarlo
    if (selectedFolder === 'inbox' && found.isArchived) return null;
    if (selectedFolder === 'archive' && !found.isArchived) return null;
    if (selectedFolder === 'sent' && found.folder !== 'sent') return null;
    return found;
  }, [emails, selectedEmailId, selectedFolder]);

  // Conteo unificado: mensajes recibidos, no leídos y no archivados
  const inboxUnreadCount = getInboxUnreadCount(emails);
  const starredCount = emails.filter(e => e.isStarred && !e.isArchived).length;

  const handleSelectEmail = (email: SimulatedEmail) => {
    sound.playClick();
    setSelectedEmailId(email.id);
    setIsReplying(false);
    setIsNegotiating(false);
    setNegotiationResultFeedback(null);
    if (!email.isRead && onUpdateEmailState) {
      onUpdateEmailState(email.id, { isRead: true });
    }
  };

  const handleToggleReadStatus = (email: SimulatedEmail) => {
    sound.playClick();
    if (onUpdateEmailState) {
      onUpdateEmailState(email.id, { isRead: !email.isRead });
    }
  };

  const handleToggleStar = (e: React.MouseEvent, email: SimulatedEmail) => {
    e.stopPropagation();
    sound.playClick();
    if (onUpdateEmailState) {
      onUpdateEmailState(email.id, { isStarred: !email.isStarred });
    }
  };

  const handleToggleArchive = (email: SimulatedEmail) => {
    sound.playClick();
    if (onUpdateEmailState) {
      const willArchive = !email.isArchived;
      onUpdateEmailState(email.id, { 
        isArchived: willArchive, 
        folder: willArchive ? 'archive' : 'inbox' 
      });
      // Si se archiva el correo actualmente visible, deseleccionarlo para evitar que quede huérfano
      setSelectedEmailId(null);
    }
  };

  const handleMarkAllAsRead = () => {
    sound.playClick();
    if (onUpdateEmailState) {
      emails.forEach(e => {
        if (!e.isRead && (e.folder === 'inbox' || !e.folder) && !e.isArchived) {
          onUpdateEmailState(e.id, { isRead: true });
        }
      });
    }
  };

  const handleArchiveRead = () => {
    sound.playClick();
    if (onUpdateEmailState) {
      emails.forEach(e => {
        if (e.isRead && (e.folder === 'inbox' || !e.folder) && !e.isArchived) {
          onUpdateEmailState(e.id, { isArchived: true, folder: 'archive' });
        }
      });
      if (selectedEmail?.isRead) {
        setSelectedEmailId(null);
      }
    }
  };

  const handleOpenDirectPayment = (
    type: 'loan' | 'sar' | 'supplier',
    amountDue: number,
    bankId?: CommercialBankId,
    title?: string
  ) => {
    sound.playClick();
    setPaymentError(null);
    setPaymentTarget({
      type,
      bankId,
      title: title || (type === 'loan' ? 'Pago de Cuota Bancaria' : 'Pago de Impuestos SAR'),
      amountDue,
      accountSource: 'checking'
    });
    setDirectPayAmount(amountDue);
    setPaymentModalOpen(true);
  };

  const handleConfirmDirectPayment = () => {
    if (!paymentTarget || directPayAmount <= 0) return;
    setPaymentError(null);

    if (paymentTarget.type === 'loan' && paymentTarget.bankId) {
      if (onPayLoanFromEmail) {
        const res = onPayLoanFromEmail(paymentTarget.bankId, directPayAmount, paymentTarget.accountSource);
        if (!res.success) {
          setPaymentError(res.message);
          return;
        }
        if (res.remainingBalance <= 0) {
          if (selectedEmail && onUpdateEmailState) {
            onUpdateEmailState(selectedEmail.id, { statusTag: 'Resuelto', actionRequired: false });
          }
          setPaymentSuccessFeedback(`¡Préstamo cancelado en su totalidad! Saldo L 0.00.`);
        } else {
          if (selectedEmail && onUpdateEmailState) {
            onUpdateEmailState(selectedEmail.id, {
              statusTag: 'Pendiente',
              paymentNoticePayload: selectedEmail.paymentNoticePayload ? {
                ...selectedEmail.paymentNoticePayload,
                amountDueHNL: res.remainingBalance
              } : undefined
            });
          }
          setPaymentSuccessFeedback(`Abono aplicado. Saldo deudor restante: L ${res.remainingBalance.toLocaleString()}.`);
        }
      }
    } else if (paymentTarget.type === 'sar') {
      if (onPaySarFromEmail) {
        const res = onPaySarFromEmail(directPayAmount, paymentTarget.accountSource);
        if (!res.success) {
          setPaymentError(res.message);
          return;
        }
        if (res.remainingDebt <= 0) {
          if (selectedEmail && onUpdateEmailState) {
            onUpdateEmailState(selectedEmail.id, { statusTag: 'Resuelto', actionRequired: false });
          }
          setPaymentSuccessFeedback(`¡Obligación fiscal SAR cancelada al 100%! Habilitado para Solvencia.`);
        } else {
          if (selectedEmail && onUpdateEmailState) {
            onUpdateEmailState(selectedEmail.id, {
              statusTag: 'Pendiente',
              paymentNoticePayload: selectedEmail.paymentNoticePayload ? {
                ...selectedEmail.paymentNoticePayload,
                amountDueHNL: res.remainingDebt
              } : undefined
            });
          }
          setPaymentSuccessFeedback(`Abono al SAR aplicado. Saldo fiscal pendiente: L ${res.remainingDebt.toLocaleString()}.`);
        }
      }
    }

    setPaymentModalOpen(false);
    setPaymentTarget(null);
  };

  const handleSendReply = () => {
    if (!selectedEmail || !replyText.trim()) return;
    if (onRespondEmail) {
      onRespondEmail(selectedEmail, replyText);
    }
    setReplyText('');
    setIsReplying(false);
  };

  // Apertura de Drawer de Negociación de Oferta
  const handleStartNegotiateOffer = (offer: DynamicBankOffer) => {
    sound.playClick();
    setIsNegotiating(true);
    setNegotiateAmount(offer.amountOrLimitHNL);
    setNegotiateRate(offer.annualRatePct);
    setNegotiateTerm(offer.termMonths);
    setNegotiateFee(offer.openingFeePct);
    setSelectedCollateralsForOffer(offer.linkedCollateralIds || []);
    setNegotiationResultFeedback(null);
  };

  const handleExecuteNegotiation = () => {
    if (!selectedEmail?.bankOfferPayload) return;
    sound.playClick();
    const offer = selectedEmail.bankOfferPayload;

    const proposal = {
      requestedAmount: negotiateAmount,
      requestedRate: negotiateRate,
      requestedTerm: negotiateTerm,
      requestedFee: negotiateFee,
      collateralIds: selectedCollateralsForOffer
    };

    let result;
    if (onNegotiateOffer) {
      result = onNegotiateOffer(offer, proposal);
    } else {
      result = negotiateBankOfferFromEmail(state, offer, proposal);
    }

    setNegotiationResultFeedback({
      outcome: result.outcome,
      message: result.reason
    });

    if (onUpdateEmailState) {
      onUpdateEmailState(selectedEmail.id, {
        bankOfferPayload: result.updatedOffer,
        statusTag: result.outcome === 'aprobado' || result.outcome === 'contraoferta' ? 'Pre-Aprobado' : selectedEmail.statusTag
      });
    }

    // Registrar en sent/diálogo
    if (onRespondEmail) {
      onRespondEmail(
        selectedEmail,
        `Solicitud de Negociación: Monto L ${negotiateAmount.toLocaleString()}, Tasa ${negotiateRate}%, Plazo ${negotiateTerm} meses.${selectedCollateralsForOffer.length > 0 ? ` Con ${selectedCollateralsForOffer.length} garantía(s) real(es).` : ''}`
      );
    }
  };

  // Apertura de Modal de Aceptación y Desembolso
  const handleOpenAcceptOfferModal = (offer: DynamicBankOffer) => {
    sound.playClick();
    setOfferToAccept(offer);
    setAcceptError(null);
    setAcceptDestinationAccount('checking');
    setAcceptModalOpen(true);
  };

  const handleConfirmDisbursement = () => {
    if (!offerToAccept) return;
    setAcceptError(null);

    // Validar vigencia
    const isExpired = offerToAccept.expiresDay < state.currentDay && offerToAccept.expiresMonth <= state.currentMonth;
    if (isExpired) {
      setAcceptError(`La oferta venció el Día ${offerToAccept.expiresDay} y no puede ser contratada.`);
      return;
    }

    // Validar si ya fue aceptada
    if (offerToAccept.status === 'aceptada') {
      setAcceptError('Esta oferta ya fue contratada y desembolsada anteriormente.');
      return;
    }

    if (onAcceptOfferFromEmail) {
      const res = onAcceptOfferFromEmail(offerToAccept, acceptDestinationAccount, offerToAccept.linkedCollateralIds);
      if (!res.success) {
        setAcceptError(res.message);
        return;
      }
    }

    sound.playApprovalStamp();
    if (selectedEmail && onUpdateEmailState) {
      onUpdateEmailState(selectedEmail.id, {
        statusTag: 'Resuelto',
        bankOfferPayload: {
          ...offerToAccept,
          status: 'aceptada',
          acceptedDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`
        }
      });
    }

    setAcceptModalOpen(false);
    setOfferToAccept(null);
  };

  return (
    <div className="flex h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* ------------------------------------------------------------- */}
      {/* BARRA LATERAL IZQUIERDA: CARPETAS Y CUENTAS                    */}
      {/* ------------------------------------------------------------- */}
      <div className="w-52 bg-[#dfdfdf] border-r-2 border-[#808080] p-2 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          {/* Cuentas de la empresa */}
          <div className="bg-white border border-slate-400 p-2 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Buzones Activos</span>
            <div className="space-y-1">
              <button
                onClick={() => setAccountFilter('all')}
                className={`w-full text-left px-1.5 py-0.5 rounded-xs flex items-center justify-between font-bold text-[11px] cursor-pointer ${
                  accountFilter === 'all' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>📬 Todos los Buzones</span>
              </button>

              <button
                onClick={() => setAccountFilter('company')}
                className={`w-full text-left px-1.5 py-0.5 rounded-xs flex flex-col font-medium text-[10px] cursor-pointer ${
                  accountFilter === 'company' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="font-bold">🏢 Empresa:</span>
                <span className="truncate font-mono">{companyEmailAddress}</span>
              </button>

              <button
                onClick={() => setAccountFilter('personal')}
                className={`w-full text-left px-1.5 py-0.5 rounded-xs flex flex-col font-medium text-[10px] cursor-pointer ${
                  accountFilter === 'personal' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="font-bold">👤 Propietario:</span>
                <span className="truncate font-mono">{personalEmailAddress}</span>
              </button>
            </div>
          </div>

          {/* Carpetas Principales */}
          <div className="space-y-1">
            <button
              onClick={() => { sound.playClick(); setSelectedFolder('inbox'); setSelectedEmailId(null); }}
              className={`w-full text-left px-2 py-1.5 rounded-xs flex items-center justify-between font-bold cursor-pointer border ${
                selectedFolder === 'inbox'
                  ? 'bg-[#000080] text-white border-blue-950 shadow-inner'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>📥</span>
                <span>Bandeja de Entrada</span>
              </div>
              {inboxUnreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  selectedFolder === 'inbox' ? 'bg-rose-500 text-white' : 'bg-blue-800 text-white'
                }`}>
                  {inboxUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { sound.playClick(); setSelectedFolder('starred'); setSelectedEmailId(null); }}
              className={`w-full text-left px-2 py-1.5 rounded-xs flex items-center justify-between font-bold cursor-pointer border ${
                selectedFolder === 'starred'
                  ? 'bg-[#000080] text-white border-blue-950 shadow-inner'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>⭐</span>
                <span>Destacados</span>
              </div>
              {starredCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                  {starredCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { sound.playClick(); setSelectedFolder('sent'); setSelectedEmailId(null); }}
              className={`w-full text-left px-2 py-1.5 rounded-xs flex items-center justify-between font-bold cursor-pointer border ${
                selectedFolder === 'sent'
                  ? 'bg-[#000080] text-white border-blue-950 shadow-inner'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>📤</span>
                <span>Enviados</span>
              </div>
            </button>

            <button
              onClick={() => { sound.playClick(); setSelectedFolder('archive'); setSelectedEmailId(null); }}
              className={`w-full text-left px-2 py-1.5 rounded-xs flex items-center justify-between font-bold cursor-pointer border ${
                selectedFolder === 'archive'
                  ? 'bg-[#000080] text-white border-blue-950 shadow-inner'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>📁</span>
                <span>Archivados</span>
              </div>
            </button>
          </div>

          {/* Categorías Temáticas */}
          <div className="pt-2 border-t border-[#808080]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Categorías</span>
            <div className="space-y-0.5">
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedEmailId(null); }}
                className={`w-full text-left px-2 py-1 text-[11px] rounded-xs font-semibold cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-slate-300 font-bold text-slate-950' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas las Categorías
              </button>

              {(Object.keys(CATEGORY_LABELS) as EmailCategory[]).map(catKey => {
                const cat = CATEGORY_LABELS[catKey];
                const count = emails.filter(e => e.category === catKey && !e.isArchived).length;
                return (
                  <button
                    key={catKey}
                    onClick={() => { setSelectedCategory(catKey); setSelectedEmailId(null); }}
                    className={`w-full text-left px-2 py-1 text-[11px] rounded-xs flex items-center justify-between cursor-pointer ${
                      selectedCategory === catKey ? 'bg-slate-300 font-bold text-slate-950' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="truncate">{cat.icon} {cat.label}</span>
                    {count > 0 && <span className="text-[10px] text-slate-500 font-mono">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-1 text-[10px] text-slate-500 text-center font-mono border-t border-slate-300">
          Red Simbólica Áureo HN v3.0
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PANEL CENTRAL: LISTA DE MENSAJES Y FILTROS                     */}
      {/* ------------------------------------------------------------- */}
      <div className="w-84 bg-white border-r-2 border-[#808080] flex flex-col shrink-0">
        {/* Buscador y Controles Superiores */}
        <div className="p-2 bg-[#dfdfdf] border-b border-[#808080] space-y-1.5">
          <div className="relative flex items-center">
            <span className="absolute left-2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar remitente, asunto, contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-white border border-slate-400 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Barra de Filtros Rápidos y Acciones Masivas */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <button
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={`px-1.5 py-0.5 rounded-xs border font-bold cursor-pointer transition-colors ${
                onlyUnread ? 'bg-amber-500 text-white border-amber-600 shadow-inner' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {onlyUnread ? '✓ Solo No Leídos' : 'Ver Todos'}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllAsRead}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
                title="Marcar todos como leídos"
              >
                Leer Todos
              </button>
              <button
                onClick={handleArchiveRead}
                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xs font-semibold cursor-pointer active:scale-95"
                title="Archivar mensajes ya leídos"
              >
                Archivar Leídos
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-600">
            <span>{filteredEmails.length} mensaje(s) · {inboxUnreadCount} no leído(s)</span>
            <span className="font-mono">Día {state.currentDay}, Mes {state.currentMonth}</span>
          </div>
        </div>

        {/* Lista de Correos con Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic space-y-1">
              <span className="text-2xl block">📭</span>
              <span>No hay mensajes en esta vista.</span>
            </div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              const catConfig = CATEGORY_LABELS[email.category] || CATEGORY_LABELS.sistema_avisos;

              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-2.5 cursor-pointer transition-colors relative border-l-4 ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-blue-900'
                      : !email.isRead
                      ? 'bg-white font-bold border-l-amber-500 hover:bg-slate-50'
                      : 'bg-slate-50/50 border-l-transparent hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate text-[11px] text-slate-900 max-w-[170px]">
                      {email.senderName || email.sender}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleToggleStar(e, email)}
                        className="text-xs hover:scale-125 transition-transform cursor-pointer"
                        title={email.isStarred ? 'Quitar destacado' : 'Destacar'}
                      >
                        {email.isStarred ? '⭐' : '☆'}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Día {email.simDay || email.dateDay || 1}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-950 truncate mb-1">
                    {!email.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-700 mr-1.5" />}
                    {email.subject}
                  </div>

                  <div className="text-[10px] text-slate-500 line-clamp-1 mb-1 font-sans">
                    {email.body.replace(/\n+/g, ' ')}
                  </div>

                  {/* Etiquetas de Categoría y Estado */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-xs border font-medium ${catConfig.color}`}>
                      {catConfig.icon} {catConfig.label}
                    </span>

                    {email.bankOfferPayload && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-xs border font-bold ${
                        email.bankOfferPayload.status === 'aceptada'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : email.bankOfferPayload.status === 'en_negociacion'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : email.bankOfferPayload.status === 'rechazada'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      }`}>
                        {email.bankOfferPayload.status === 'aceptada' ? 'Oferta Aceptada ✅' : 'Oferta Pre-Aprobada 🏛️'}
                      </span>
                    )}

                    {email.statusTag && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-bold border ${
                        email.statusTag === 'Resuelto'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {email.statusTag}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PANEL DERECHO: LECTURA Y ACCIONES DEL CORREO SELECCIONADO       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* Barra de Acciones del Correo */}
            <div className="p-2 bg-[#dfdfdf] border-b border-[#808080] flex justify-between items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 font-bold text-xs cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <span>↩️</span>
                  <span>Responder</span>
                </button>

                <button
                  onClick={() => handleToggleReadStatus(selectedEmail)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 font-bold text-xs cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <span>{selectedEmail.isRead ? '✉️' : '📩'}</span>
                  <span>{selectedEmail.isRead ? 'Marcar No Leído' : 'Marcar Leído'}</span>
                </button>

                <button
                  onClick={() => handleToggleArchive(selectedEmail)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 font-bold text-xs cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <span>{selectedEmail.isArchived ? '📥' : '📁'}</span>
                  <span>{selectedEmail.isArchived ? 'Desarchivar' : 'Archivar'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-mono">Buzón:</span>
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-300 px-1.5 py-0.5 rounded-xs">
                  {selectedEmail.recipientEmail || companyEmailAddress}
                </span>
              </div>
            </div>

            {/* Contenido Completo del Correo con Scroll */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {paymentSuccessFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-400 text-emerald-950 font-bold text-xs rounded flex justify-between items-center">
                  <span>✅ {paymentSuccessFeedback}</span>
                  <button onClick={() => setPaymentSuccessFeedback(null)} className="text-emerald-800 hover:text-black">✕</button>
                </div>
              )}

              {/* Metadatos del Mensaje */}
              <div className="border-b border-slate-300 pb-3 space-y-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-base font-black text-slate-900 leading-snug">
                    {selectedEmail.subject}
                  </h2>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-2">
                    {selectedEmail.sentDate || `Día ${selectedEmail.simDay || 1}, Mes ${selectedEmail.simMonth || 1} (2026)`}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500 font-bold">De:</span>
                  <span className="font-bold text-slate-900">{selectedEmail.senderName || selectedEmail.sender}</span>
                  <span className="text-slate-500 font-mono">&lt;{selectedEmail.senderEmail}&gt;</span>
                </div>

                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-slate-500 font-bold">Para:</span>
                  <span className="font-mono text-slate-700">{selectedEmail.recipientEmail || companyEmailAddress}</span>
                </div>
              </div>

              {/* Tarjeta Interactiva de Oferta Bancaria Dinámica */}
              {selectedEmail.bankOfferPayload && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 p-3.5 rounded-xs space-y-2.5 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">
                          OFERTA DE FINANCIAMIENTO PRE-APROBADA
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          selectedEmail.bankOfferPayload.status === 'aceptada'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : selectedEmail.bankOfferPayload.status === 'en_negociacion'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : selectedEmail.bankOfferPayload.status === 'rechazada'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : selectedEmail.bankOfferPayload.expiresDay < state.currentDay && selectedEmail.bankOfferPayload.expiresMonth <= state.currentMonth
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          Estado: {selectedEmail.bankOfferPayload.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-black text-sm text-blue-950 mt-1">
                        {selectedEmail.bankOfferPayload.title}
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Entidad Emisora: <strong>{COMMERCIAL_BANKS_PROFILES[selectedEmail.bankOfferPayload.bankId]?.name || selectedEmail.bankOfferPayload.bankId}</strong> | Vence el Día {selectedEmail.bankOfferPayload.expiresDay}, Mes {selectedEmail.bankOfferPayload.expiresMonth}
                      </p>
                    </div>
                    <span className="text-2xl">🏛️</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 p-2.5 border border-blue-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Monto / Límite:</span>
                      <strong className="text-emerald-800 font-mono text-sm">
                        {formatHNLAmount(selectedEmail.bankOfferPayload.amountOrLimitHNL)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tasa de Interés:</span>
                      <strong className="text-blue-900 font-mono text-sm">
                        {selectedEmail.bankOfferPayload.annualRatePct}% anual
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Plazo:</span>
                      <strong className="text-slate-800 font-mono text-sm">
                        {selectedEmail.bankOfferPayload.termMonths} meses
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cuota Estimada:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {formatHNLAmount(selectedEmail.bankOfferPayload.estimatedMonthlyPaymentHNL)}/mes
                      </strong>
                    </div>
                  </div>

                  {selectedEmail.bankOfferPayload.previousTerms && (
                    <div className="text-[10px] text-slate-500 bg-blue-50/50 p-1.5 border border-blue-100">
                      Términos previos negociados: Monto {formatHNLAmount(selectedEmail.bankOfferPayload.previousTerms.amount)} · Tasa {selectedEmail.bankOfferPayload.previousTerms.rate}% · Plazo {selectedEmail.bankOfferPayload.previousTerms.term}m.
                    </div>
                  )}

                  {/* Acciones de la Oferta */}
                  <div className="flex justify-end gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => {
                        if (selectedEmail.bankOfferPayload && onOpenLoanTerms) {
                          onOpenLoanTerms(
                            selectedEmail.bankOfferPayload.bankId,
                            selectedEmail.bankOfferPayload.productType,
                            selectedEmail.bankOfferPayload.amountOrLimitHNL,
                            selectedEmail.bankOfferPayload.termMonths,
                            selectedEmail.bankOfferPayload.id
                          );
                        } else if (onOpenWindow) {
                          onOpenWindow('bancos_comerciales');
                        }
                      }}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 font-bold text-xs cursor-pointer active:scale-95"
                    >
                      Ver Condiciones en Banco ➔
                    </button>

                    <button
                      onClick={() => handleStartNegotiateOffer(selectedEmail.bankOfferPayload!)}
                      disabled={selectedEmail.bankOfferPayload.status === 'aceptada' || (selectedEmail.bankOfferPayload.expiresDay < state.currentDay && selectedEmail.bankOfferPayload.expiresMonth <= state.currentMonth)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-bold text-xs border border-amber-700 cursor-pointer active:scale-95"
                    >
                      💬 Negociar Condiciones
                    </button>

                    <button
                      onClick={() => handleOpenAcceptOfferModal(selectedEmail.bankOfferPayload!)}
                      disabled={selectedEmail.bankOfferPayload.status === 'aceptada' || (selectedEmail.bankOfferPayload.expiresDay < state.currentDay && selectedEmail.bankOfferPayload.expiresMonth <= state.currentMonth)}
                      className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                    >
                      {selectedEmail.bankOfferPayload.status === 'aceptada' ? 'Oferta Ya Contratada ✅' : 'Aceptar y Desembolsar ✍️'}
                    </button>
                  </div>
                </div>
              )}

              {/* Panel Desplegable de Negociación */}
              {isNegotiating && selectedEmail?.bankOfferPayload && (
                <div className="bg-amber-50/70 border-2 border-amber-400 p-3.5 rounded-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-amber-300 pb-1.5">
                    <span className="font-bold text-amber-950 text-xs">
                      Mesa de Negociación de Crédito (Dictamen Simulado de Comité Local)
                    </span>
                    <button
                      onClick={() => setIsNegotiating(false)}
                      className="text-slate-500 hover:text-black font-bold text-xs cursor-pointer"
                    >
                      Cerrar ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Monto Pretendido (HNL):</label>
                      <input
                        type="number"
                        step={50000}
                        value={negotiateAmount}
                        onChange={(e) => setNegotiateAmount(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-400 bg-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Tasa Pretendida (% Anual):</label>
                      <input
                        type="number"
                        step={0.25}
                        min={7.5}
                        max={18}
                        value={negotiateRate}
                        onChange={(e) => setNegotiateRate(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-400 bg-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Plazo Pretendido (Meses):</label>
                      <select
                        value={negotiateTerm}
                        onChange={(e) => setNegotiateTerm(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-400 bg-white font-bold"
                      >
                        <option value={12}>12 meses (1 año)</option>
                        <option value={24}>24 meses (2 años)</option>
                        <option value={36}>36 meses (3 años)</option>
                        <option value={48}>48 meses (4 años)</option>
                        <option value={60}>60 meses (5 años)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Comisión Pretendida (%):</label>
                      <input
                        type="number"
                        step={0.25}
                        min={0.5}
                        max={2.5}
                        value={negotiateFee}
                        onChange={(e) => setNegotiateFee(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-400 bg-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Selector de Garantías Reales de Respaldo */}
                  <div>
                    <label className="block font-bold text-slate-800 text-[11px] mb-1">
                      Aportar Garantías Reales para Respaldar la Contrapropuesta:
                    </label>
                    {(state.realEstateCollaterals || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 border border-slate-300">
                        No mantienes bienes inmuebles ni maquinaria registrados en tu catálogo patrimonial.
                      </p>
                    ) : (
                      <div className="space-y-1 bg-white p-2 border border-slate-300 max-h-32 overflow-y-auto">
                        {(state.realEstateCollaterals || []).map(col => {
                          const avail = calculateCollateralAvailableCoverage(col);
                          const isChecked = selectedCollateralsForOffer.includes(col.id);
                          return (
                            <label key={col.id} className="flex items-center justify-between p-1 hover:bg-slate-50 text-[11px] cursor-pointer">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCollateralsForOffer([...selectedCollateralsForOffer, col.id]);
                                    } else {
                                      setSelectedCollateralsForOffer(selectedCollateralsForOffer.filter(id => id !== col.id));
                                    }
                                  }}
                                />
                                <span className="font-semibold">{col.title}</span>
                              </div>
                              <span className="font-mono text-slate-600">Disp: {formatHNLAmount(avail)}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {negotiationResultFeedback && (
                    <div className={`p-2.5 border text-xs ${
                      negotiationResultFeedback.outcome === 'aprobado'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : negotiationResultFeedback.outcome === 'contraoferta'
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                        : 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                    }`}>
                      {negotiationResultFeedback.message}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleExecuteNegotiation}
                      className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                    >
                      Enviar Propuesta a Evaluación 📤
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Pago Directo de Cuota / SAR / Proveedor */}
              {selectedEmail.paymentNoticePayload && (
                <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-950 block text-xs">
                      AVISO DE OBLIGACIÓN PENDIENTE DE PAGO
                    </span>
                    <span className="text-xs text-slate-700">
                      Importe adeudado: <strong className="text-rose-900">{formatHNLAmount(selectedEmail.paymentNoticePayload.amountDueHNL)}</strong> | Vence el Día {selectedEmail.paymentNoticePayload.dueDay}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedEmail.paymentNoticePayload) {
                        handleOpenDirectPayment(
                          selectedEmail.paymentNoticePayload.targetType,
                          selectedEmail.paymentNoticePayload.amountDueHNL,
                          selectedEmail.paymentNoticePayload.bankId
                        );
                      }
                    }}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                  >
                    Pagar Ahora 💳
                  </button>
                </div>
              )}

              {/* Comprobante Vinculado si existe */}
              {selectedEmail.voucherPayload && (
                <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📑</span>
                    <div>
                      <span className="font-bold text-slate-900 block">{selectedEmail.voucherPayload.title}</span>
                      <span className="text-[11px] text-slate-500">
                        Comprobante No. {selectedEmail.voucherPayload.voucherNumber} · Importe: {formatHNLAmount(selectedEmail.voucherPayload.netDisbursedOrPaidHNL)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onViewVoucher && selectedEmail.voucherPayload) {
                        onViewVoucher(selectedEmail.voucherPayload);
                      }
                    }}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-400 font-bold text-xs text-blue-900 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    Ver Comprobante Oficial 🖨️
                  </button>
                </div>
              )}

              {/* Cuerpo del Mensaje */}
              <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-slate-50/40 p-3 border border-slate-200">
                {selectedEmail.body}
              </div>

              {/* Panel Desplegable para Redactar Respuesta */}
              {isReplying && (
                <div className="border-t-2 border-blue-900 pt-3 space-y-2 bg-blue-50/30 p-3 rounded-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-950 text-xs">
                      Redactando respuesta a: {selectedEmail.senderName || selectedEmail.sender} ({selectedEmail.senderEmail})
                    </span>
                    <button
                      onClick={() => setIsReplying(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      Cancelar ✕
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta ejecutiva aquí..."
                    className="w-full p-2 border border-slate-400 bg-white text-xs font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />

                  <div className="flex justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => setReplyText('Aceptamos la propuesta en los términos estipulados. Procederemos con la formalización contractual y la firma digital.')}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-medium text-slate-700 cursor-pointer"
                    >
                      Plantilla: Aceptar propuesta
                    </button>
                    <button
                      onClick={() => setReplyText('Agradecemos el planteamiento. Solicitamos una revisión de las tasas y una contraoferta con mejores condiciones para continuar.')}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-medium text-slate-700 cursor-pointer"
                    >
                      Plantilla: Negociar condiciones
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                    >
                      Enviar Respuesta 📤
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
            <span className="text-4xl mb-2">✉️</span>
            <p className="text-sm font-bold text-slate-600">Selecciona un correo para leerlo</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Aquí puedes revisar notificaciones de clientes, cotizaciones de proveedores, ofertas bancarias y resoluciones del SAR.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE DESEMBOLSO Y ACEPTACIÓN DE OFERTA PRE-APROBADA        */}
      {/* ------------------------------------------------------------- */}
      {acceptModalOpen && offerToAccept && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-lg w-full text-slate-900 font-sans p-1">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>✍️ Contratación y Desembolso de Oferta</span>
              <button
                onClick={() => setAcceptModalOpen(false)}
                className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
              <div>
                <h4 className="font-black text-sm text-slate-900">{offerToAccept.title}</h4>
                <p className="text-[11px] text-slate-600">
                  Banco Acreedor: <strong>{COMMERCIAL_BANKS_PROFILES[offerToAccept.bankId]?.name || offerToAccept.bankId}</strong>
                </p>
              </div>

              {acceptError && (
                <div className="p-2 bg-rose-50 border border-rose-400 text-rose-950 font-bold rounded">
                  ⚠️ {acceptError}
                </div>
              )}

              {/* Desglose de Condiciones Finales */}
              <div className="space-y-1.5 border border-slate-300 p-2.5 bg-slate-50">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Monto Aprobado:</span>
                  <span className="font-mono font-bold text-slate-900">{formatHNLAmount(offerToAccept.amountOrLimitHNL)}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-rose-700">
                  <span>(-) Comisión de Apertura ({offerToAccept.openingFeePct}%):</span>
                  <span className="font-mono font-bold">-{formatHNLAmount(Math.round(offerToAccept.amountOrLimitHNL * (offerToAccept.openingFeePct / 100)))}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-black bg-blue-100 px-2 border border-blue-300 text-blue-950">
                  <span>DESEMBOLSO NETO LÍQUIDO:</span>
                  <span className="font-mono text-emerald-800">
                    {formatHNLAmount(offerToAccept.amountOrLimitHNL - Math.round(offerToAccept.amountOrLimitHNL * (offerToAccept.openingFeePct / 100)))}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Cuota Mensual Pactada:</span>
                  <span className="font-mono font-bold text-slate-900">{formatHNLAmount(offerToAccept.estimatedMonthlyPaymentHNL)}/mes</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Tasa Nominal / Plazo:</span>
                  <span className="font-mono font-bold text-slate-900">{offerToAccept.annualRatePct}% anual · {offerToAccept.termMonths} meses</span>
                </div>
              </div>

              {/* Selector de Cuenta Destino */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Cuenta de Acreditación de Fondos:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAcceptDestinationAccount('checking')}
                    className={`p-2 border text-left cursor-pointer ${
                      acceptDestinationAccount === 'checking'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Cuenta Corriente</span>
                    <span className="text-[10px] text-slate-600">{formatHNLAmount(state.storeBankBalance)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAcceptDestinationAccount('cash')}
                    className={`p-2 border text-left cursor-pointer ${
                      acceptDestinationAccount === 'cash'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Caja Chica (Efectivo)</span>
                    <span className="text-[10px] text-slate-600">{formatHNLAmount(state.storeCash)}</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic bg-amber-50 p-2 border border-amber-200">
                Al confirmar, el importe líquido se acreditará inmediatamente, la deuda quedará registrada en el banco correspondiente y se emitirá el comprobante oficial.
              </p>

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setAcceptModalOpen(false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDisbursement}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                >
                  Confirmar Desembolso Oficial ✍️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE PAGO DIRECTO DESDE EL CORREO                          */}
      {/* ------------------------------------------------------------- */}
      {paymentModalOpen && paymentTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-md w-full text-slate-900 font-sans p-1">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>💳 Liquidación de Obligación</span>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{paymentTarget.title}</h4>
                <p className="text-[11px] text-slate-600">
                  Importe adeudado registrado: <strong>{formatHNLAmount(paymentTarget.amountDue)}</strong>
                </p>
              </div>

              {paymentError && (
                <div className="p-2 bg-rose-50 border border-rose-400 text-rose-950 font-bold rounded">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* Selector de cuenta origen */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Cuenta de Cargo:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTarget({ ...paymentTarget, accountSource: 'checking' })}
                    className={`p-2 border text-left cursor-pointer ${
                      paymentTarget.accountSource === 'checking'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Cuenta Corriente</span>
                    <span className="text-[10px] text-slate-600">{formatHNLAmount(state.storeBankBalance)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTarget({ ...paymentTarget, accountSource: 'cash' })}
                    className={`p-2 border text-left cursor-pointer ${
                      paymentTarget.accountSource === 'cash'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Caja Chica</span>
                    <span className="text-[10px] text-slate-600">{formatHNLAmount(state.storeCash)}</span>
                  </button>
                </div>
              </div>

              {/* Campo con CustomAmountInput */}
              <CustomAmountInput
                label="Monto a Aplicar (HNL):"
                value={directPayAmount}
                onChange={setDirectPayAmount}
                availableBalance={paymentTarget.accountSource === 'checking' ? state.storeBankBalance : state.storeCash}
                maxAllowed={paymentTarget.amountDue}
                minAllowed={1}
                operationType="pago_cuota"
                helpText="Escribe cualquier monto personalizado con centavos o usa los botones de porcentaje."
              />

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDirectPayment}
                  disabled={directPayAmount <= 0}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                >
                  Confirmar Pago 💳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
