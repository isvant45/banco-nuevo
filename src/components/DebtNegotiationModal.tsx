import React, { useState } from 'react';
import { IndividualClient, CompetitorBank, CompetitorId } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { Handshake, AlertTriangle, Building2, CheckCircle2, DollarSign, X, ArrowRight, ShieldCheck, Scale } from 'lucide-react';

interface DebtNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: IndividualClient | null;
  competitors: CompetitorBank[];
  onNegotiate: (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => void;
  onSellToRival: (clientId: string, rivalId: CompetitorId) => void;
}

export function DebtNegotiationModal({
  isOpen,
  onClose,
  client,
  competitors,
  onNegotiate,
  onSellToRival
}: DebtNegotiationModalProps) {
  const [activeAction, setActiveAction] = useState<'reestructurar' | 'vender'>('reestructurar');
  const [selectedRivalId, setSelectedRivalId] = useState<CompetitorId>('ficohsa');

  if (!isOpen || !client) return null;

  const pastDueAmount = client.pastDueAmountHNL > 0 ? client.pastDueAmountHNL : client.loanBalanceHNL;

  const discounts: Record<string, number> = {
    'I - Normal': 0.05,
    'II - Especial': 0.12,
    'III - Subnormal': 0.25,
    'IV - Dudoso Recaudo': 0.45,
    'V - Pérdida': 0.70
  };
  const discountRate = discounts[client.cnbsCategory] || 0.35;
  const cashProceeds = Math.round(pastDueAmount * (1 - discountRate));

  const handleExecuteNegotiation = (type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => {
    sound.playApprovalStamp();
    onNegotiate(client.id, type);
    onClose();
  };

  const handleExecuteSale = () => {
    sound.playCoinClink();
    onSellToRival(client.id, selectedRivalId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Centro de Negociación y Venta de Cartera</h2>
              <p className="text-xs text-slate-400">Resolución de Cartera Vencida y Mora CNBS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha del Deudor */}
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{client.name}</span>
                <span className="text-xs text-slate-400">· {client.cif}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {client.city} · Banca {client.division.toUpperCase()} · Préstamo: {client.loanType}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${
                client.cnbsCategory === 'I - Normal' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                client.cnbsCategory === 'II - Especial' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                client.cnbsCategory === 'III - Subnormal' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                client.cnbsCategory === 'IV - Dudoso Recaudo' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {client.cnbsCategory}
              </span>
              <p className="text-xs font-mono text-slate-400 mt-1">{client.pastDueDays} días de atraso</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-center">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Deuda en Atraso</p>
              <p className="text-sm font-bold font-mono text-rose-400">{formatHNL(pastDueAmount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Saldo Total Crédito</p>
              <p className="text-sm font-bold font-mono text-slate-200">{formatHNL(client.loanBalanceHNL)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">Scoring Buró</p>
              <p className="text-sm font-bold font-mono text-amber-400">{client.equifaxScore} pts</p>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas: Negociar con Cliente vs Vender a Competencia */}
        <div className="flex gap-2 p-1 mt-4 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveAction('reestructurar')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeAction === 'reestructurar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            1. Negociar Directamente con el Cliente
          </button>
          <button
            onClick={() => setActiveAction('vender')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeAction === 'vender'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            2. Vender Cartera a Banco Competidor
          </button>
        </div>

        {/* Contenido Pestaña 1: Negociación Directa */}
        {activeAction === 'reestructurar' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-300">
              Selecciona una estrategia de cobranza legal y reestructuración para sanear este crédito y reducir provisiones exigidas por la CNBS:
            </p>

            {/* Opción A: Condonación y Reactivación */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-400">A. Reestructurar con Quita Parcial de Intereses</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Condonar 40% de recargos moratorios. El cliente realiza un abono inmediato del 25% de la mora ({formatHNL(Math.round(pastDueAmount * 0.25))}), extiende plazo 12 meses y vuelve a <strong className="text-emerald-400">Categoría I - Normal</strong> con cláusula de Pago Garantizado.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteNegotiation('reestructurar_quitas')}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors ml-3 shrink-0"
                >
                  Pactar Quita
                </button>
              </div>
            </div>

            {/* Opción B: Ampliar Plazo y Bajar Cuota */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-blue-400">B. Ampliación de Plazo y Alivio de Cuota</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Extender el plazo en 24 meses adicionales y reducir la cuota mensual un 35% ({formatHNL(Math.round(client.loanMonthlyPaymentHNL * 0.65))}/mes). El cliente se reclasifica en <strong className="text-blue-400">Categoría II - Especial</strong> para seguimiento.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteNegotiation('ampliar_plazo')}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors ml-3 shrink-0"
                >
                  Extender Plazo
                </button>
              </div>
            </div>

            {/* Opción C: Dación en Pago */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">C. Dación en Pago / Liquidación Extrajudicial</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Adjudicación de la garantía real del deudor (terreno, maquinaria o vehículo). El banco cancela el crédito y recupera el 75% del capital adeudado (<strong className="text-emerald-300">{formatHNL(Math.round(client.loanBalanceHNL * 0.75))}</strong>) de forma inmediata en caja.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteNegotiation('dacion_pago')}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors ml-3 shrink-0"
                >
                  Ejecutar Dación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Pestaña 2: Venta de Cartera a Competidores */}
        {activeAction === 'vender' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-300">
              Vende este préstamo vencido en el mercado secundario a un banco rival para eliminar de tu balance el riesgo y provisiones CNBS a cambio de liquidez inmediata con descuento por riesgo:
            </p>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Descuento aplicado por riesgo ({client.cnbsCategory}):</span>
                <span className="font-bold text-rose-400">{(discountRate * 100).toFixed(0)}% de descuento</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Valor nominal transferido:</span>
                <span className="font-mono text-slate-300">{formatHNL(pastDueAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-emerald-400">Efectivo recibido en reservas:</span>
                <span className="font-mono text-emerald-300 font-bold">{formatHNL(cashProceeds)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seleccionar Banco Competidor Comprador:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {competitors.map(rival => (
                  <button
                    key={rival.id}
                    onClick={() => setSelectedRivalId(rival.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                      selectedRivalId === rival.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{rival.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rival.specialty}</p>
                    </div>
                    {selectedRivalId === rival.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteSale}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <DollarSign className="w-4 h-4" />
              Perfeccionar Venta a la Competencia por {formatHNL(cashProceeds)}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
