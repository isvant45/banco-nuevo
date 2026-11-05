import React, { useState } from 'react';
import { 
  Building2, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Percent, 
  Calendar, 
  ShieldCheck, 
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { ExplainableCreditScore, CollateralAsset } from '../game/unifiedEconomyEngine';

interface NegotiationMessage {
  id: string;
  sender: 'advisor' | 'player';
  text: string;
  timestamp: string;
  offerDetails?: {
    amountHNL: number;
    interestRatePct: number;
    termMonths: number;
    collateralRequired?: string;
  };
}

interface CreditAdvisorNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName: string;
  segment: 'personas' | 'pyme' | 'corporativo' | 'privada';
  monthlySales: number;
  currentDebt: number;
  creditScore: ExplainableCreditScore;
  collaterals: CollateralAsset[];
  onDisburseLoan: (amountHNL: number, ratePct: number, termMonths: number, bankName: string) => void;
}

export const CreditAdvisorNegotiationModal: React.FC<CreditAdvisorNegotiationModalProps> = ({
  isOpen,
  onClose,
  bankName,
  segment,
  monthlySales,
  currentDebt,
  creditScore,
  collaterals,
  onDisburseLoan
}) => {
  // Deterministic limits based on financial reality
  const maxBorrowing = Math.round(monthlySales * (segment === 'corporativo' ? 6 : segment === 'pyme' ? 4 : 2.5));
  const baseRate = segment === 'privada' ? 9.5 : segment === 'corporativo' ? 10.8 : segment === 'pyme' ? 12.0 : 16.5;

  const [counterAmount, setCounterAmount] = useState<number>(Math.min(maxBorrowing, 1200000));
  const [counterRate, setCounterRate] = useState<number>(baseRate);
  const [counterTerm, setCounterTerm] = useState<number>(36);
  const [playerInputText, setPlayerInputText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [currentOffer, setCurrentOffer] = useState<{
    amountHNL: number;
    interestRatePct: number;
    termMonths: number;
    collateralRequired: string;
    approvedByBank: boolean;
  }>({
    amountHNL: Math.min(maxBorrowing, 1000000),
    interestRatePct: baseRate + 0.8,
    termMonths: 36,
    collateralRequired: 'Fianza Solidaria y Pagaré Libre',
    approvedByBank: true
  });

  const [messages, setMessages] = useState<NegotiationMessage[]>([
    {
      id: 'msg-01',
      sender: 'advisor',
      text: `Buen día. Le atiende el Comité de Crédito de ${bankName} para la división de ${segment.toUpperCase()}. Hemos revisado sus ventas mensuales de ${formatHNL(monthlySales)} y su Score Crediticio de ${creditScore.score} pts (${creditScore.rating}). Podemos ofrecerle inicialmente ${formatHNL(Math.min(maxBorrowing, 1000000))} al ${baseRate + 0.8}% anual. ¿Qué condiciones desea plantear?`,
      timestamp: 'Ahora',
      offerDetails: {
        amountHNL: Math.min(maxBorrowing, 1000000),
        interestRatePct: baseRate + 0.8,
        termMonths: 36,
        collateralRequired: 'Fianza Solidaria'
      }
    }
  ]);

  if (!isOpen) return null;

  const handleSendCounterOffer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    sound.playClick();
    const userMessage = playerInputText.trim() || `Propongo un monto de ${formatHNL(counterAmount)} a una tasa del ${counterRate}% a ${counterTerm} meses.`;

    const userMsgObj: NegotiationMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'player',
      text: userMessage,
      timestamp: 'Ahora',
      offerDetails: {
        amountHNL: counterAmount,
        interestRatePct: counterRate,
        termMonths: counterTerm
      }
    };

    setMessages(prev => [...prev, userMsgObj]);
    setPlayerInputText('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gemini/negotiate-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          segment,
          clientProfile: {
            name: 'Director Ejecutivo',
            monthlySales,
            currentDebt,
            collateralsSummary: collaterals.map(c => `${c.title} (L ${c.appraisalValueHNL.toLocaleString()})`).join(', ')
          },
          requestDetails: {
            amountHNL: counterAmount,
            targetRatePct: counterRate,
            termMonths: counterTerm
          },
          creditScore: {
            score: creditScore.score,
            rating: creditScore.rating,
            dtiPct: creditScore.dtiPct
          },
          deterministicLimits: {
            maxAmountHNL: maxBorrowing,
            minInterestRatePct: baseRate - 1.0,
            maxTermMonths: 60
          },
          playerCounterOffer: userMessage
        })
      });

      const data = await response.json();
      sound.playApprovalStamp();

      setCurrentOffer({
        amountHNL: data.proposedAmountHNL || counterAmount,
        interestRatePct: data.proposedRatePct || counterRate,
        termMonths: data.proposedTermMonths || counterTerm,
        collateralRequired: data.collateralRequired || 'Garantía Colateral Registrada',
        approvedByBank: data.approvedByBank !== false
      });

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-adv`,
          sender: 'advisor',
          text: data.advisorSpeech || 'Hemos evaluado su solicitud y formulado nuestra mejor oferta.',
          timestamp: 'Ahora',
          offerDetails: {
            amountHNL: data.proposedAmountHNL || counterAmount,
            interestRatePct: data.proposedRatePct || counterRate,
            termMonths: data.proposedTermMonths || counterTerm,
            collateralRequired: data.collateralRequired
          }
        }
      ]);
    } catch (err) {
      // Fallback determinista en caso de fallo de red
      const fallbackApproval = counterAmount <= maxBorrowing;
      const approvedRate = Math.max(baseRate, counterRate);

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-fallback`,
          sender: 'advisor',
          text: fallbackApproval
            ? `Tras deliberar con el comité de riesgos, aceptamos financiar ${formatHNL(counterAmount)} al ${approvedRate}% a ${counterTerm} meses.`
            : `El monto solicitado excede nuestra capacidad técnica. Lo máximo autorizable es ${formatHNL(maxBorrowing)}.`,
          timestamp: 'Ahora',
          offerDetails: {
            amountHNL: fallbackApproval ? counterAmount : maxBorrowing,
            interestRatePct: approvedRate,
            termMonths: counterTerm
          }
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = () => {
    sound.playCashChime();
    onDisburseLoan(
      currentOffer.amountHNL,
      currentOffer.interestRatePct,
      currentOffer.termMonths,
      bankName
    );
    onClose();
  };

  // Cuota mensual aproximada
  const monthlyRate = currentOffer.interestRatePct / 100 / 12;
  const estimatedMonthlyQuota = Math.round(
    (currentOffer.amountHNL * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -currentOffer.termMonths))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Mesa de Negociación Crediticia · {bankName}
                </h2>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 uppercase font-bold">
                  {segment}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diálogo en tiempo real con Asesor Senior de Crédito respaldado por Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo: Chat de Negociación + Ficha de Términos */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Columna Izquierda: Mensajes de Diálogo */}
          <div className="md:col-span-2 flex flex-col border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={`flex gap-3 text-xs ${m.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'advisor' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'player'
                      ? 'bg-amber-600/20 border border-amber-500/40 text-amber-100'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-sm'
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.offerDetails && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] grid grid-cols-2 gap-2 text-slate-300">
                        <div>Monto: <strong className="text-emerald-400">{formatHNL(m.offerDetails.amountHNL)}</strong></div>
                        <div>Tasa: <strong className="text-amber-400">{formatPct(m.offerDetails.interestRatePct)}</strong></div>
                        <div>Plazo: <strong className="text-white">{m.offerDetails.termMonths} meses</strong></div>
                        {m.offerDetails.collateralRequired && (
                          <div className="col-span-2 text-slate-400">Garantía: {m.offerDetails.collateralRequired}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {m.sender === 'player' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic font-mono">
                  <Bot className="w-4 h-4 animate-spin text-amber-400" />
                  El Comité de Riesgo de {bankName} está deliberando...
                </div>
              )}
            </div>

            {/* Input de Mensaje de Contraoferta */}
            <form onSubmit={handleSendCounterOffer} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={playerInputText}
                onChange={e => setPlayerInputText(e.target.value)}
                placeholder="Escribe tu argumento o contraoferta al asesor..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Columna Derecha: Panel de Términos Vigentes & Controles */}
          <div className="p-5 bg-slate-950/70 space-y-4 text-xs font-mono">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Propuesta en Mesa
              </span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {formatHNL(currentOffer.amountHNL)}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Cuota mensual estimada: <strong className="text-white">{formatHNL(estimatedMonthlyQuota)}</strong>
              </div>
            </div>

            {/* Desglose de Parámetros */}
            <div className="space-y-2.5">
              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Monto a Negociar (Lempiras):</label>
                <input
                  type="range"
                  min={100000}
                  max={maxBorrowing * 1.5}
                  step={50000}
                  value={counterAmount}
                  onChange={e => setCounterAmount(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>L 100K</span>
                  <span className="font-bold text-white">{formatHNL(counterAmount)}</span>
                  <span>Max pre-aprobado: {formatHNL(maxBorrowing)}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Tasa Anual Objetivo (%):</label>
                <input
                  type="range"
                  min={8.0}
                  max={24.0}
                  step={0.25}
                  value={counterRate}
                  onChange={e => setCounterRate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>8.0%</span>
                  <span className="font-bold text-amber-400">{counterRate}%</span>
                  <span>24.0%</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Plazo de Pago (Meses):</label>
                <div className="grid grid-cols-4 gap-1">
                  {[12, 24, 36, 48].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCounterTerm(m)}
                      className={`py-1 rounded text-center text-[11px] font-bold border transition-colors ${
                        counterTerm === m
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Score y Garantías Aportadas */}
            <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Score Crediticio:</span>
                <span className="font-bold text-amber-400">{creditScore.score} pts ({creditScore.rating})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ratio DTI Actual:</span>
                <span className="font-bold text-slate-200">{creditScore.dtiPct}%</span>
              </div>
              <div className="text-slate-400 pt-1">
                Garantía requerida: <span className="text-white font-medium">{currentOffer.collateralRequired}</span>
              </div>
            </div>

            {/* Botón de Formalización y Desembolso */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleAcceptOffer}
                disabled={!currentOffer.approvedByBank}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Firmar y Desembolsar Crédito</span>
              </button>

              <button
                onClick={() => handleSendCounterOffer()}
                disabled={isSubmitting}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Actualizar Contraoferta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
