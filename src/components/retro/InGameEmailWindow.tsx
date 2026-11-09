import React, { useState, useMemo } from 'react';
import { InGameEmail, InGameEmailCategory, DailySimulationState } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface InGameEmailWindowProps {
  state: DailySimulationState;
  onUpdateEmail: (emailId: string, updates: Partial<InGameEmail>) => void;
  onOpenWindow: (windowId: string, payload?: any) => void;
  onComposeReply?: (replyToEmail: InGameEmail, replyContent: string) => void;
}

type EmailFolder = 'inbox' | 'unread' | 'starred' | 'archived' | 'sent';

const CATEGORY_LABELS: Record<InGameEmailCategory, { label: string; icon: string; color: string }> = {
  ventas_clientes: { label: 'Ventas y Clientes', icon: '🛍️', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  bancos_financiamiento: { label: 'Bancos y Créditos', icon: '🏦', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  pagos_vencimientos: { label: 'Pagos y Vencimientos', icon: '📅', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  proveedores: { label: 'Proveedores', icon: '📦', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  sar_tributario: { label: 'SAR e Impuestos', icon: '🏛️', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  garantias: { label: 'Garantías Reales', icon: '🏠', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  proyectos: { label: 'Proyectos y Obras', icon: '🏗️', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  competidores_mna: { label: 'Competidores y M&A', icon: '🏢', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  avisos_sistema: { label: 'Avisos del Sistema', icon: '⚙️', color: 'bg-slate-100 text-slate-800 border-slate-300' }
};

export const InGameEmailWindow: React.FC<InGameEmailWindowProps> = ({
  state,
  onUpdateEmail,
  onOpenWindow,
  onComposeReply
}) => {
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const emails = state.inGameEmails || [];

  // Conteo de no leídos
  const unreadCount = useMemo(() => {
    return emails.filter(e => !e.isRead && !e.isArchived).length;
  }, [emails]);

  // Filtrado de correos
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Filtro de carpeta
      if (currentFolder === 'inbox' && (email.isArchived || email.isSent)) return false;
      if (currentFolder === 'unread' && (email.isRead || email.isArchived || email.isSent)) return false;
      if (currentFolder === 'starred' && (!email.isStarred || email.isArchived)) return false;
      if (currentFolder === 'archived' && !email.isArchived) return false;
      if (currentFolder === 'sent' && !email.isSent) return false;

      // Filtro de categoría
      if (selectedCategoryId !== 'all' && email.category !== selectedCategoryId) return false;

      // Filtro de búsqueda
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchSubject = email.subject.toLowerCase().includes(q);
        const matchSender = (email.sender || email.senderName || '').toLowerCase().includes(q);
        const matchBody = email.body.toLowerCase().includes(q);
        if (!matchSubject && !matchSender && !matchBody) return false;
      }

      return true;
    });
  }, [emails, currentFolder, selectedCategoryId, searchQuery]);

  // Correo activo
  const activeEmail = useMemo(() => {
    if (!selectedEmailId) return filteredEmails[0] || null;
    return emails.find(e => e.id === selectedEmailId) || filteredEmails[0] || null;
  }, [emails, selectedEmailId, filteredEmails]);

  const handleSelectEmail = (email: InGameEmail) => {
    sound.playClick();
    setSelectedEmailId(email.id);
    setIsReplying(false);
    if (!email.isRead) {
      onUpdateEmail(email.id, { isRead: true });
    }
  };

  const handleToggleStar = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const item = emails.find(x => x.id === emailId);
    if (item) {
      onUpdateEmail(emailId, { isStarred: !item.isStarred });
    }
  };

  const handleToggleArchive = (emailId: string) => {
    sound.playClick();
    const item = emails.find(x => x.id === emailId);
    if (item) {
      onUpdateEmail(emailId, { isArchived: !item.isArchived });
    }
  };

  const handleSendReply = () => {
    if (!activeEmail || !replyText.trim()) return;
    sound.playCashRegister();
    if (onComposeReply) {
      onComposeReply(activeEmail, replyText);
    } else {
      // Crear correo de respuesta en enviados
      const newSentEmail: InGameEmail = {
        id: `email-reply-${Date.now().toString().slice(-6)}`,
        sender: `${state.storeName} (Gerencia)`,
        senderEmail: state.corporateEmailAccounts?.enterpriseEmail || `gerencia@${state.retailSector}.hn`,
        recipientEmail: activeEmail.senderEmail,
        recipientName: activeEmail.sender,
        subject: `RE: ${activeEmail.subject}`,
        simulatedDate: `Día ${state.currentDay}, Mes ${state.currentMonth}, ${state.currentYear}`,
        category: activeEmail.category,
        isRead: true,
        isStarred: false,
        isArchived: false,
        isSent: true,
        body: `${replyText}\n\n--- Mensaje Original ---\nDe: ${activeEmail.sender} <${activeEmail.senderEmail}>\nFecha: ${activeEmail.simulatedDate}\n\n${activeEmail.body}`
      };
      onUpdateEmail(activeEmail.id, { isResolved: true });
      state.inGameEmails = [newSentEmail, ...(state.inGameEmails || [])];
    }
    setReplyText('');
    setIsReplying(false);
  };

  const enterpriseEmailAddress = state.corporateEmailAccounts?.enterpriseEmail || `gerencia@${state.retailSector.toLowerCase()}.com.hn`;

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Barra de menú superior y estado de cuenta */}
      <div className="bg-[#000080] text-white p-2 border-b-2 border-[#808080] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📧</span>
          <div>
            <h2 className="font-bold text-xs tracking-wider">
              ÁUREO MAIL EXPRESS v2.0 · CORREO EMPRESARIAL INTERNO
            </h2>
            <p className="text-[10px] text-sky-200">
              Bandeja Corporativa: <strong className="text-white font-mono">{enterpriseEmailAddress}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#001f3f] px-2 py-0.5 border border-sky-600 text-[10px] font-mono">
            Empresa: <strong className="text-sky-300">{state.storeName}</strong>
          </div>
          <div className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 text-[10px] rounded-none border border-black shadow">
            {unreadCount} No leídos
          </div>
        </div>
      </div>

      {/* Contenido en dos columnas: Carpetas / Lista y Visor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral de carpetas */}
        <div className="w-44 bg-[#d4d0c8] border-r-2 border-[#808080] p-1.5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-600 px-1 py-0.5 uppercase tracking-wider">
              Carpetas
            </div>

            <button
              onClick={() => { sound.playClick(); setCurrentFolder('inbox'); }}
              className={`w-full flex items-center justify-between px-2 py-1 text-left font-bold border ${
                currentFolder === 'inbox'
                  ? 'bg-[#000080] text-white border-black'
                  : 'bg-[#c0c0c0] hover:bg-[#e0e0e0] text-slate-900 border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>📥</span> Bandeja
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[9px] px-1 font-mono rounded-none">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { sound.playClick(); setCurrentFolder('unread'); }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left font-semibold border ${
                currentFolder === 'unread'
                  ? 'bg-[#000080] text-white border-black'
                  : 'bg-[#c0c0c0] hover:bg-[#e0e0e0] text-slate-900 border-transparent'
              }`}
            >
              <span>✉️</span> No leídos
            </button>

            <button
              onClick={() => { sound.playClick(); setCurrentFolder('starred'); }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left font-semibold border ${
                currentFolder === 'starred'
                  ? 'bg-[#000080] text-white border-black'
                  : 'bg-[#c0c0c0] hover:bg-[#e0e0e0] text-slate-900 border-transparent'
              }`}
            >
              <span>⭐</span> Destacados
            </button>

            <button
              onClick={() => { sound.playClick(); setCurrentFolder('sent'); }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left font-semibold border ${
                currentFolder === 'sent'
                  ? 'bg-[#000080] text-white border-black'
                  : 'bg-[#c0c0c0] hover:bg-[#e0e0e0] text-slate-900 border-transparent'
              }`}
            >
              <span>📤</span> Enviados
            </button>

            <button
              onClick={() => { sound.playClick(); setCurrentFolder('archived'); }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left font-semibold border ${
                currentFolder === 'archived'
                  ? 'bg-[#000080] text-white border-black'
                  : 'bg-[#c0c0c0] hover:bg-[#e0e0e0] text-slate-900 border-transparent'
              }`}
            >
              <span>📦</span> Archivados
            </button>

            <div className="pt-2 text-[10px] font-bold text-slate-600 px-1 uppercase tracking-wider">
              Filtrar Categoría
            </div>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-white border border-[#808080] text-[10px] p-1 font-sans"
            >
              <option value="all">Todas las categorías</option>
              {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>
                  {info.icon} {info.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 p-1.5 bg-slate-200 border border-slate-400 text-[10px] text-slate-600 leading-tight">
            💡 <strong>Simulación:</strong> Correo operativo interno conectado a bancos, proveedores, obras y SAR.
          </div>
        </div>

        {/* Lista central de mensajes */}
        <div className="w-80 border-r-2 border-[#808080] bg-white flex flex-col overflow-hidden">
          {/* Buscador */}
          <div className="p-1.5 bg-[#d4d0c8] border-b border-[#808080]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar asunto, remitente o texto..."
              className="w-full px-2 py-1 bg-white border border-[#808080] text-xs font-sans focus:outline-none"
            />
          </div>

          {/* Listado de correos con scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {filteredEmails.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                No hay correos en esta bandeja o criterio de búsqueda.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = activeEmail?.id === email.id;
                const catInfo = CATEGORY_LABELS[email.category] || CATEGORY_LABELS.avisos_sistema;

                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#000080] text-white'
                        : !email.isRead
                          ? 'bg-amber-50 hover:bg-amber-100/80 font-bold text-slate-900'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(email.id, e)}
                          className="hover:scale-125 transition-transform"
                        >
                          {email.isStarred ? '⭐' : '☆'}
                        </button>
                        <span className="truncate max-w-[140px] font-semibold">
                          {email.sender}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>
                        {email.simulatedDate}
                      </span>
                    </div>

                    <div className="text-xs truncate font-semibold mb-1">
                      {email.subject}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-1 py-0.2 border rounded-none ${catInfo.color}`}>
                        {catInfo.icon} {catInfo.label}
                      </span>

                      {email.isResolved && (
                        <span className={`text-[9px] px-1 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                          ✓ Resuelto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visor del correo seleccionado */}
        <div className="flex-1 bg-[#f4f2ee] p-3 flex flex-col justify-between overflow-y-auto">
          {activeEmail ? (
            <div className="space-y-3">
              {/* Encabezado del mensaje */}
              <div className="bg-white border-2 border-[#808080] p-3 shadow-sm space-y-2">
                <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {activeEmail.subject}
                    </h3>
                    <div className="text-[11px] text-slate-600 mt-1">
                      <strong>De:</strong> {activeEmail.sender} &lt;<span className="font-mono text-blue-700">{activeEmail.senderEmail}</span>&gt;
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Para:</strong> {activeEmail.recipientName} &lt;<span className="font-mono text-slate-700">{activeEmail.recipientEmail}</span>&gt;
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-mono text-[10px] bg-slate-100 border border-slate-300 px-2 py-0.5 block">
                      {activeEmail.simulatedDate}
                    </span>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleToggleStar(activeEmail.id, e)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-[10px]"
                        title="Marcar como destacado"
                      >
                        {activeEmail.isStarred ? '⭐ Destacado' : '☆ Destacar'}
                      </button>
                      <button
                        onClick={() => handleToggleArchive(activeEmail.id)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-[10px]"
                        title="Archivar mensaje"
                      >
                        {activeEmail.isArchived ? '📥 Desarchivar' : '📦 Archivar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acciones principales asociadas al correo */}
                {activeEmail.actions && activeEmail.actions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 bg-amber-50 p-2 border border-amber-300">
                    <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                      ⚡ ACCIONES DISPONIBLES:
                    </span>
                    {activeEmail.actions.map((act: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playClick();
                          if (act.actionType === 'open_window' && act.targetWindowId) {
                            onOpenWindow(act.targetWindowId, act.payload);
                          } else if (act.actionType === 'open_loan_offer') {
                            onOpenWindow('commercial_banks', { loanOfferData: activeEmail.loanOfferData });
                          } else if (act.actionType === 'open_payment') {
                            onOpenWindow('liabilities_manager');
                          } else if (act.actionType === 'open_sar') {
                            onOpenWindow('sar_audit');
                          } else if (act.actionType === 'open_collateral') {
                            onOpenWindow('collaterals_manager');
                          } else if (act.actionType === 'mark_resolved') {
                            onUpdateEmail(activeEmail.id, { isResolved: true });
                          }
                        }}
                        className="px-3 py-1 bg-[#000080] hover:bg-[#1010a0] text-white font-bold text-xs border-t border-l border-sky-300 border-b border-r border-black shadow cursor-pointer"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ficha técnica de Oferta Bancaria si aplica */}
              {activeEmail.loanOfferData && (
                <div className="bg-blue-50 border-2 border-blue-400 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-1">
                    <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      <span>🏦</span> OFERTA FORMAL DE CRÉDITO BANCARIO
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${activeEmail.loanOfferData.isPreApproved ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-amber-100 text-amber-900 border-amber-400'}`}>
                      {activeEmail.loanOfferData.isPreApproved ? '✓ PREAPROBADA' : 'SUJETA A EVALUACIÓN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-1.5 border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Monto / Cupo:</span>
                      <strong className="text-slate-900">L {activeEmail.loanOfferData.amountHNL.toLocaleString()}</strong>
                    </div>
                    <div className="bg-white p-1.5 border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Tasa Anual:</span>
                      <strong className="text-blue-900">{activeEmail.loanOfferData.nominalRatePct}%</strong>
                    </div>
                    <div className="bg-white p-1.5 border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Plazo Amortización:</span>
                      <strong className="text-slate-900">{activeEmail.loanOfferData.termMonths} Meses</strong>
                    </div>
                    <div className="bg-white p-1.5 border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Cuota Mensual Est.:</span>
                      <strong className="text-emerald-900">L {activeEmail.loanOfferData.estimatedPaymentHNL.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-600">
                      Vence: Día {activeEmail.loanOfferData.expirationSimDay}, Mes {activeEmail.loanOfferData.expirationSimMonth} (Calendario Simulado)
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenWindow('commercial_banks', { loanOfferData: activeEmail.loanOfferData });
                      }}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-950 shadow cursor-pointer"
                    >
                      Ver Condiciones y Formalizar Desembolso
                    </button>
                  </div>
                </div>
              )}

              {/* Cuerpo del correo */}
              <div className="bg-white border border-[#808080] p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                {activeEmail.body}
              </div>

              {/* Formulario de Respuesta Rápida dentro del juego */}
              <div className="bg-slate-200 border border-[#808080] p-2 space-y-1.5">
                {!isReplying ? (
                  <button
                    onClick={() => { sound.playClick(); setIsReplying(true); }}
                    className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d8d8d8] text-slate-900 font-bold text-xs border-t border-l border-white border-b border-r border-black shadow flex items-center gap-1 cursor-pointer"
                  >
                    <span>↩️</span> Redactar Respuesta Formal
                  </button>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-800 block">
                      Respuesta a {activeEmail.sender}:
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe la respuesta formal u oficio de respuesta..."
                      rows={3}
                      className="w-full p-2 bg-white border border-[#808080] text-xs font-mono focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendReply}
                        className="px-4 py-1 bg-[#000080] hover:bg-[#1010a0] text-white font-bold text-xs border border-black shadow cursor-pointer"
                      >
                        Enviar Respuesta Interna
                      </button>
                      <button
                        onClick={() => setIsReplying(false)}
                        className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d8d8d8] text-slate-800 font-bold text-xs border border-[#808080] cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">📫</span>
              <p className="text-xs">Selecciona un mensaje para leer su contenido.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
