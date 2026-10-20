import React, { useState } from 'react';
import { GameState, IndividualClient, CompetitorId } from '../game/types';
import { formatHNL, formatPct, calculateCreditRiskMatrix } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Swords, 
  CheckCircle2, 
  Handshake, 
  DollarSign, 
  ArrowRight,
  TrendingDown,
  Building,
  Check
} from 'lucide-react';

import { DebtNegotiationModal } from './DebtNegotiationModal';

interface CreditRiskDashboardProps {
  state: GameState;
  onRestructureLoan: (clientId: string) => void;
  onSellNPLToCompetitor: (clientId: string, buyerBank: string, discountPct: number) => void;
  onNegotiateWorkout?: (clientId: string, workoutType: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => void;
}

export const CreditRiskDashboard: React.FC<CreditRiskDashboardProps> = ({
  state,
  onRestructureLoan,
  onSellNPLToCompetitor,
  onNegotiateWorkout
}) => {
  const fin = state.financials;
  const riskMatrix = calculateCreditRiskMatrix(state);
  const totalRequiredProvisions = riskMatrix.reduce((acc, cat) => acc + cat.provisionRequiredHNL, 0);
  const totalConstitudedProvisions = fin.loanLossProvisions;
  const isProvisionCovered = totalConstitudedProvisions >= totalRequiredProvisions;

  // Filtro de Categoría CNBS (I a V)
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Clientes para negociación
  const [selectedClientForDebtModal, setSelectedClientForDebtModal] = useState<IndividualClient | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState<boolean>(false);

  // Clientes con atraso o mora activa que no hayan sido vendidos
  const allDelinquentClients = state.clients.filter(c => (c.pastDueDays > 0 || c.cnbsCategory !== 'I - Normal') && !c.isSoldToRival);
  
  const displayedClients = allDelinquentClients.filter(c => {
    if (categoryFilter === 'all') return true;
    return c.cnbsCategory.startsWith(categoryFilter);
  });

  const handleOpenNegotiationModal = (client: IndividualClient) => {
    sound.playClick();
    setSelectedClientForDebtModal(client);
    setIsDebtModalOpen(true);
  };

  const handleExecuteWorkout = (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => {
    sound.playApprovalStamp();
    if (onNegotiateWorkout) {
      onNegotiateWorkout(clientId, type);
    } else {
      onRestructureLoan(clientId);
    }
    setIsDebtModalOpen(false);
  };

  const handleExecuteSaleToRival = (clientId: string, rivalId: CompetitorId) => {
    sound.playCashChime();
    const rival = state.competitors.find(c => c.id === rivalId) || state.competitors[0];
    const client = state.clients.find(c => c.id === clientId);
    const discounts: Record<string, number> = {
      'I - Normal': 5,
      'II - Especial': 12,
      'III - Subnormal': 25,
      'IV - Dudoso Recaudo': 45,
      'V - Pérdida': 70
    };
    const discount = client ? (discounts[client.cnbsCategory] || 35) : 35;
    onSellNPLToCompetitor(clientId, rival.name, 100 - discount);
    setIsDebtModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Métricas de Solvencia y Calificación CNBS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>COEFICIENTE DE SOLVENCIA (CAR)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
            {formatPct(fin.capitalAdequacyRatioCAR)}
          </div>
          <div className="text-xs text-slate-400">
            Mínimo prudencial CNBS: <span className="text-white font-mono font-semibold">10.0%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ÍNDICE DE MOROSIDAD (NPL)</span>
            <AlertTriangle className={`w-4 h-4 ${fin.delinquencyRatioNPL <= 3.0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono mb-1 ${fin.delinquencyRatioNPL <= 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatPct(fin.delinquencyRatioNPL)}
          </div>
          <div className="text-xs text-slate-400">
            Cartera en atraso: <span className="text-rose-400 font-mono font-semibold">{formatHNL(fin.loanPortfolioPastDue)}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>COBERTURA DE PROVISIONES</span>
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatHNL(totalConstitudedProvisions)}
          </div>
          <div className="text-xs text-slate-400">
            Requeridas CNBS: <span className="text-slate-200 font-mono font-semibold">{formatHNL(totalRequiredProvisions)}</span>
          </div>
        </div>
      </div>

      {/* 2. Módulo de Gestión de Cuentas en Mora, Negociaciones y Venta de Cartera Castigada */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Mesa de Negociación de Cartera en Mora y Venta a Bancos Rivales (NPLs)
              </h2>
              <p className="text-xs text-slate-400">
                Monitorea qué cuentas están en mora para negociar un acuerdo de pago reestructurado, o véndelas a un banco competidor con factor de descuento para obtener liquidez inmediata y limpiar tu balance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Casos Filtrados:</span>
            <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold">
              {displayedClients.length} cuentas
            </span>
          </div>
        </div>

        {/* Barra de Filtro de Categorías CNBS I a V */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: `Todos los Atrasos (${allDelinquentClients.length})` },
            { id: 'I ', label: 'Cat. I - Normal' },
            { id: 'II ', label: 'Cat. II - Especial' },
            { id: 'III ', label: 'Cat. III - Subnormal' },
            { id: 'IV ', label: 'Cat. IV - Dudoso' },
            { id: 'V ', label: 'Cat. V - Pérdida' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setCategoryFilter(f.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                categoryFilter === f.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {displayedClients.length === 0 ? (
          <div className="p-8 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm mb-1">No hay cuentas en esta categoría</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Puedes seleccionar otra categoría o ver todos los atrasos para negociar o vender créditos vencidos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-sans">
                  <th className="py-2.5 px-3">Cliente / CIF</th>
                  <th className="py-2.5 px-3">Segmento</th>
                  <th className="py-2.5 px-3 text-center">Días Atraso</th>
                  <th className="py-2.5 px-3 text-right">Saldo Deuda (L.)</th>
                  <th className="py-2.5 px-3 text-right">Mora Vencida (L.)</th>
                  <th className="py-2.5 px-3 text-center">Categoría CNBS</th>
                  <th className="py-2.5 px-3 text-right font-sans">Acción de Negociación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedClients.map(c => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 text-slate-300">
                      <td className="py-3 px-3 font-sans">
                        <span className="font-semibold text-white block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.cif}</span>
                      </td>

                      <td className="py-3 px-3 font-sans text-amber-300 uppercase text-[11px] font-semibold">
                        {c.division}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {c.pastDueDays} días
                      </td>

                      <td className="py-3 px-3 text-right text-slate-200 font-bold">
                        {formatHNL(c.loanBalanceHNL)}
                      </td>

                      <td className="py-3 px-3 text-right text-rose-400 font-bold">
                        {formatHNL(c.pastDueAmountHNL || c.loanMonthlyPaymentHNL)}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                          {c.cnbsCategory}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleOpenNegotiationModal(c)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 ml-auto shadow-sm transition-colors"
                          title="Negociar Quitas, Ampliar Plazo o Vender a Bancos Rivales"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Negociar / Vender</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Matriz Regulatoria de Categorías Crediticias (I a V) CNBS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Matriz de Clasificación Crediticia y Provisiones CNBS
              </h2>
              <p className="text-xs text-slate-400">
                Supervisión obligatoria de cartera según días de atraso y porcentajes de constitución de reservas contra capital.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Estado de Cobertura:</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border ${
              isProvisionCovered 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isProvisionCovered ? '100% Cubierto' : 'Déficit de Provisiones'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Categoría CNBS</th>
                <th className="py-2.5 px-3">Días de Atraso</th>
                <th className="py-2.5 px-3 text-center">% Provisión</th>
                <th className="py-2.5 px-3 text-right">Saldo Cartera (L.)</th>
                <th className="py-2.5 px-3 text-right">Expedientes</th>
                <th className="py-2.5 px-3 text-right">Provisión Requerida (L.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {riskMatrix.map(row => {
                const isNormal = row.category.startsWith('I ');
                const isLoss = row.category.startsWith('V ');
                return (
                  <tr key={row.category} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isNormal ? 'bg-emerald-400' : isLoss ? 'bg-rose-500' : 'bg-amber-400'}`} />
                      <span>{row.category}</span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400">{row.daysOverdue}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-300">{row.provisionPct}%</td>
                    <td className="py-3 px-3 text-right text-slate-200">{formatHNL(row.balanceHNL)}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{row.clientCount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-rose-400">{formatHNL(row.provisionRequiredHNL)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Dashboard de Competencia Bancaria en Honduras */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <Swords className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Dashboard de Competencia e Instituciones del Sistema Hondureño
            </h2>
            <p className="text-xs text-slate-400">
              Monitoreo de cuota de mercado, tasas activas/pasivas promedio y especialidad de los 5 bancos líderes de Honduras.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.competitors.map(comp => (
            <div key={comp.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.brandColor }} />
                  <span className="font-bold text-white text-xs">{comp.name}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {comp.marketShare}% cuota
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tasa Pasiva:</span>
                  <span className="text-emerald-400 font-bold">{comp.depositRateAvg}% anual</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tasa Activa:</span>
                  <span className="text-blue-400 font-bold">{comp.lendingRateAvg}% anual</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                {comp.specialty}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Interactivo de Negociación y Venta de Deuda CNBS */}
      {isDebtModalOpen && selectedClientForDebtModal && (
        <DebtNegotiationModal
          isOpen={true}
          client={selectedClientForDebtModal}
          competitors={state.competitors}
          onClose={() => setIsDebtModalOpen(false)}
          onNegotiate={(clientId, type) => handleExecuteWorkout(clientId, type)}
          onSellToRival={(clientId, rivalId) => handleExecuteSaleToRival(clientId, rivalId)}
        />
      )}
    </div>
  );
};
