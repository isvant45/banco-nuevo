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

interface CreditRiskDashboardProps {
  state: GameState;
  onRestructureLoan: (clientId: string) => void;
  onSellNPLToCompetitor: (clientId: string, buyerBank: string, discountPct: number) => void;
}

export const CreditRiskDashboard: React.FC<CreditRiskDashboardProps> = ({
  state,
  onRestructureLoan,
  onSellNPLToCompetitor
}) => {
  const fin = state.financials;
  const riskMatrix = calculateCreditRiskMatrix(state);
  const totalRequiredProvisions = riskMatrix.reduce((acc, cat) => acc + cat.provisionRequiredHNL, 0);
  const totalConstitudedProvisions = fin.loanLossProvisions;
  const isProvisionCovered = totalConstitudedProvisions >= totalRequiredProvisions;

  // Clientes con atraso o mora activa que no hayan sido vendidos
  const delinquentClients = state.clients.filter(c => (c.pastDueDays > 0 || c.cnbsCategory !== 'I - Normal') && !c.isSoldToRival);

  // Estado para el modal de venta o negociación
  const [selectedClientForAction, setSelectedClientForAction] = useState<IndividualClient | null>(null);
  const [actionType, setActionType] = useState<'restructure' | 'sell' | null>(null);
  const [selectedBuyerBank, setSelectedBuyerBank] = useState<string>('Banco Atlántida S.A.');
  const [selectedDiscountPct, setSelectedDiscountPct] = useState<number>(78);

  const buyerOptions = [
    { bank: 'Banco Atlántida S.A.', discount: 78, tag: 'Líder en recuperación' },
    { bank: 'Banco Ficohsa S.A.', discount: 75, tag: 'Fuerte en cobranza' },
    { bank: 'Banco del País S.A. (Banpaís)', discount: 72, tag: 'Especialista zona norte' },
    { bank: 'Banco de Occidente S.A.', discount: 70, tag: 'Conservador' }
  ];

  const handleOpenRestructure = (client: IndividualClient) => {
    sound.playClick();
    setSelectedClientForAction(client);
    setActionType('restructure');
  };

  const handleOpenSell = (client: IndividualClient) => {
    sound.playClick();
    setSelectedClientForAction(client);
    setActionType('sell');
    setSelectedBuyerBank(buyerOptions[0].bank);
    setSelectedDiscountPct(buyerOptions[0].discount);
  };

  const handleConfirmRestructure = () => {
    if (!selectedClientForAction) return;
    sound.playApprovalStamp();
    onRestructureLoan(selectedClientForAction.id);
    setActionType(null);
    setSelectedClientForAction(null);
  };

  const handleConfirmSell = () => {
    if (!selectedClientForAction) return;
    sound.playCashChime();
    onSellNPLToCompetitor(selectedClientForAction.id, selectedBuyerBank, selectedDiscountPct);
    setActionType(null);
    setSelectedClientForAction(null);
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
            <span className="text-slate-400">Casos en Mora Activa:</span>
            <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold">
              {delinquentClients.length} cuentas
            </span>
          </div>
        </div>

        {delinquentClients.length === 0 ? (
          <div className="p-8 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm mb-1">Toda la Cartera se Encuentra al Día</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              No hay cuentas con días de atraso en mora severa. Si deseas simular un caso moroso, puedes editar un cliente en las Bancas reduciendo su saldo y préstamo sin garantía.
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
                  <th className="py-2.5 px-3 text-right font-sans">Acción de Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {delinquentClients.map(c => {
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Negociar / Reestructurar */}
                          <button
                            onClick={() => handleOpenRestructure(c)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Handshake className="w-3 h-3" />
                            <span>Negociar</span>
                          </button>

                          {/* Botón Vender a Banco Rival con Descuento */}
                          <button
                            onClick={() => handleOpenSell(c)}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Vender Cartera</span>
                          </button>
                        </div>
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

      {/* Modal de Reestructuración de Deuda */}
      {actionType === 'restructure' && selectedClientForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Acuerdo de Reestructuración de Crédito
                </h3>
                <p className="text-xs text-slate-400">Cliente: {selectedClientForAction.name}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo Capital Vencido:</span>
                <span className="font-mono text-white font-bold">{formatHNL(selectedClientForAction.loanBalanceHNL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Días de Atraso Acumulados:</span>
                <span className="font-mono text-rose-400 font-bold">{selectedClientForAction.pastDueDays} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tasa de Salvamento Propuesta:</span>
                <span className="font-mono text-emerald-400 font-bold">12.0% Anual (Tasa Social)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cláusula de Garantía:</span>
                <span className="text-emerald-300 font-semibold">Activación de Pago Garantizado Automático</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Al formalizar la reestructuración, se condonarán recargos moratorios, la cuenta volverá a <strong>Categoría I - Normal (Al día)</strong> y se liberará la provisión obligatoria requerida por la CNBS.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestructure}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Firmar Reestructuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Venta de Cartera a Banco Competidor */}
      {actionType === 'sell' && selectedClientForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Venta de Cartera Castigada (Cesión de Derechos de Crédito)
                </h3>
                <p className="text-xs text-slate-400">Cliente Deudor: {selectedClientForAction.name}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo Nominal del Crédito:</span>
                <span className="font-mono text-white font-bold">{formatHNL(selectedClientForAction.loanBalanceHNL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banco Comprador Seleccionado:</span>
                <span className="text-amber-400 font-bold">{selectedBuyerBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Factor de Descuento:</span>
                <span className="font-mono text-blue-400 font-bold">{selectedDiscountPct}% del valor</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="text-emerald-300 font-bold">Efectivo Inmediato a Recibir:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatHNL(Math.round(selectedClientForAction.loanBalanceHNL * (selectedDiscountPct / 100)))}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 block">Selecciona la Oferta de Compra:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {buyerOptions.map(opt => (
                  <button
                    key={opt.bank}
                    type="button"
                    onClick={() => {
                      setSelectedBuyerBank(opt.bank);
                      setSelectedDiscountPct(opt.discount);
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      selectedBuyerBank === opt.bank
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold truncate">{opt.bank}</div>
                    <div className="flex justify-between items-center text-[10px] mt-1 text-slate-400">
                      <span>Paga al: <strong className="text-amber-400">{opt.discount}%</strong></span>
                      <span className="text-[9px] text-slate-500">{opt.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Al confirmar la venta, <strong>Áureo Bank transferirá el cobro judicial y riesgo a {selectedBuyerBank}</strong>. Recibirás {formatHNL(Math.round(selectedClientForAction.loanBalanceHNL * (selectedDiscountPct / 100)))} de inmediato en la reserva de caja y se liberará la provisión obligatoria de este crédito.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSell}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirmar Venta y Cobrar Efectivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
