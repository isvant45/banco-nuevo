import React, { useState } from 'react';
import { GameState, AureoProgramItem } from '../game/types';
import { 
  formatHNL, 
  formatUSD, 
  formatPct,
  executeRemittanceCashQR,
  redeemAureoRewardsPoints,
  configureMicroSavings,
  disburseSalaryAdvance,
  enrollClientInInsuranceProtege,
  drawPymeRevolvingCredit,
  approveMujerEmprendeCredit,
  advancePosSalesImmediate,
  createEscrowContract,
  disburseAgroCosechaSegura,
  disburseEcoCreditoVerde,
  issueBonoPrendaCafe,
  discountFactoringInvoice,
  issueTradeLetterOfCredit,
  createCorporateFxForward,
  createRealEstateTrust,
  openStepUpDpfDeposit,
  executeInterbankRepoTrade,
  reclassifyCnbsLoanWorkout,
  fileUifComplianceDeclaration,
  executeBulkDivisionMoraWaiver
} from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  CreditCard, 
  PiggyBank, 
  Clock, 
  ShieldCheck, 
  Building2, 
  HeartHandshake, 
  Store, 
  Lock, 
  Sprout, 
  Leaf, 
  Package, 
  FileCheck, 
  Globe2, 
  TrendingUp, 
  Landmark, 
  LineChart, 
  RefreshCw, 
  AlertTriangle, 
  FileText,
  Sliders
} from 'lucide-react';

interface ProgramsSuite20ViewProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProgramsSuite20View: React.FC<ProgramsSuite20ViewProps> = ({
  state,
  onUpdateState,
  onNavigateTab
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProgram, setActiveModalProgram] = useState<AureoProgramItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form states for modals
  const [inputVal1, setInputVal1] = useState<string>('');
  const [inputVal2, setInputVal2] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string | number>(50000);

  const programsData = state.bankingPrograms20 || {
    programs: []
  };
  const programs = programsData.programs || [];

  const filteredPrograms = programs.filter(p => {
    const matchesPillar = selectedPillar === 'todos' || p.pillar === selectedPillar;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  const totalMonthlyIncomeAll = programs.reduce((acc, p) => acc + (p.monthlyNetIncomeHNL || 0), 0);
  const totalVolumeAll = programs.reduce((acc, p) => acc + (p.monthlyVolumeHNL || 0), 0);
  const totalParticipantsAll = programs.reduce((acc, p) => acc + (p.participantsCount || 0), 0);

  const handleOpenActionModal = (program: AureoProgramItem) => {
    sound.playClick();
    setActiveModalProgram(program);
    setActionFeedback(null);
    setInputVal1('');
    setInputVal2('');
    if (program.number === 1) setInputAmount(500); // USD
    else if (program.number === 2) setInputAmount(10000); // pts
    else if (program.number === 4) setInputAmount(4500); // HNL
    else setInputAmount(50000);
  };

  const handleExecuteModalAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProgram) return;

    sound.playApprovalStamp();
    let res: { updatedState: GameState; successMessage: string } | null = null;
    const numericAmount = typeof inputAmount === 'number' ? inputAmount : (parseFloat(String(inputAmount)) || 0);

    switch (activeModalProgram.number) {
      case 1:
        res = executeRemittanceCashQR(
          state, 
          'Estados Unidos', 
          inputVal1.trim() || 'Juan Ángel Rivera', 
          numericAmount || 450
        );
        break;
      case 2:
        res = redeemAureoRewardsPoints(state, numericAmount || 10000);
        break;
      case 3:
        res = configureMicroSavings(state, 50, numericAmount || 25000);
        break;
      case 4:
        res = disburseSalaryAdvance(state, inputVal1.trim() || 'Empleado Planilla', numericAmount || 5000);
        break;
      case 5:
        res = enrollClientInInsuranceProtege(state, state.clients[0]?.id || 'CLI-01');
        break;
      case 6:
        res = drawPymeRevolvingCredit(state, inputVal1.trim() || 'Distribuidora del Norte', numericAmount || 150000);
        break;
      case 7:
        res = approveMujerEmprendeCredit(state, inputVal1.trim() || 'Confecciones Maya S. de R.L.', numericAmount || 120000);
        break;
      case 8:
        res = advancePosSalesImmediate(state, state.posMerchants[0]?.id || 'pos-01', numericAmount || 85000);
        break;
      case 9:
        res = createEscrowContract(
          state, 
          inputVal1.trim() || 'Comercial Sula', 
          inputVal2.trim() || 'Importadora Maya', 
          numericAmount || 75000, 
          'Entrega de lote de abarrotes con guía sellada'
        );
        break;
      case 10:
        res = disburseAgroCosechaSegura(state, inputVal1.trim() || 'Cooperativa Cafetalera Marcala', numericAmount || 500000);
        break;
      case 11:
        res = disburseEcoCreditoVerde(state, inputVal1.trim() || 'Granja Solar Valle de Sula', numericAmount || 850000, 'Paneles Solares');
        break;
      case 12:
        res = issueBonoPrendaCafe(state, inputVal1.trim() || 'Almacenes Generales de Depósito AGD', 450, numericAmount || 650000);
        break;
      case 13:
        res = discountFactoringInvoice(
          state, 
          inputVal1.trim() || 'Proveedor Textil S.A.', 
          inputVal2.trim() || 'Maquila Villanueva', 
          numericAmount || 350000, 
          60
        );
        break;
      case 14:
        res = issueTradeLetterOfCredit(
          state, 
          inputVal1.trim() || 'Importadora de Motores S.A.', 
          'JPMorgan Chase Nueva York', 
          numericAmount || 85000
        );
        break;
      case 15:
        res = createCorporateFxForward(
          state, 
          inputVal1.trim() || 'Roberto Facussé', 
          inputVal2.trim() || 'Harinera del Valle', 
          numericAmount || 150000, 
          25.10, 
          60
        );
        break;
      case 16:
        res = createRealEstateTrust(
          state, 
          inputVal1.trim() || 'Torre Morazán Residencial', 
          inputVal2.trim() || 'Desarrolladora Urbana SPS', 
          numericAmount || 2500000
        );
        break;
      case 17:
        res = openStepUpDpfDeposit(state, inputVal1.trim() || 'Fundación Inversora Copán', numericAmount || 500000);
        break;
      case 18:
        res = executeInterbankRepoTrade(state, 'Banco Atlántida', numericAmount || 20000000, 14, 6.25);
        break;
      case 19:
        res = reclassifyCnbsLoanWorkout(state, state.clients[0]?.id || 'CLI-01', 'condonacion_mora');
        break;
      case 20:
        res = fileUifComplianceDeclaration(
          state, 
          inputVal1.trim() || 'Empresario Inversionista', 
          numericAmount || 25000, 
          'Venta de Activos Inmobiliarios Comerciales'
        );
        break;
      case 21:
        res = executeBulkDivisionMoraWaiver(state, 'personas');
        break;
      case 22: {
        const amt = numericAmount || 5000000;
        const updatedDivisions = { ...state.divisions };
        updatedDivisions.pyme = {
          ...updatedDivisions.pyme,
          totalLoans: updatedDivisions.pyme.totalLoans + amt,
          delinquencyRate: Math.max(0, +(updatedDivisions.pyme.delinquencyRate * 0.8).toFixed(2))
        };
        res = {
          updatedState: {
            ...state,
            divisions: updatedDivisions,
            financials: {
              ...state.financials,
              loanPortfolioCurrent: state.financials.loanPortfolioCurrent + amt
            }
          },
          successMessage: `Fondo FOGAPI PYME activado: Aval al 80% emitido para ${inputVal1 || 'Comercios de SPS y Tegucigalpa'} por ${formatHNL(amt)}.`
        };
        break;
      }
      case 23: {
        const waiverRes = executeBulkDivisionMoraWaiver(state, 'personas');
        res = {
          updatedState: waiverRes.updatedState,
          successMessage: `Plan Cero Mora Estudiantil aplicado: 100% de recargos moratorios condonados y cuotas atrasadas regularizadas a tasa 0%.`
        };
        break;
      }
      default:
        break;
    }

    if (res) {
      onUpdateState(res.updatedState);
      setActionFeedback(res.successMessage);
      setTimeout(() => {
        setActionFeedback(null);
        setActiveModalProgram(null);
      }, 1800);
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'retail': return <Coins className="w-4 h-4 text-amber-400" />;
      case 'pyme': return <Store className="w-4 h-4 text-emerald-400" />;
      case 'agro': return <Sprout className="w-4 h-4 text-lime-400" />;
      case 'corporativo': return <Building2 className="w-4 h-4 text-sky-400" />;
      case 'tesoreria_regulacion': return <Landmark className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getPillarLabel = (pillar: string) => {
    switch (pillar) {
      case 'retail': return 'Banca Retail & Personas';
      case 'pyme': return 'Pyme & Microfinanzas';
      case 'agro': return 'Agropecuario & Verde';
      case 'corporativo': return 'Corporativa & Trade';
      case 'tesoreria_regulacion': return 'Tesorería & Regulación CNBS';
      default: return 'Institucional';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal y Resumen del Ecosistema */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span>Ecosistema Bancario de Honduras</span>
              <span aria-hidden="true">·</span>
              <span>20 Programas Activos</span>
              <span aria-hidden="true">·</span>
              <span>Cierre Mensual Automático</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Suite de 20 Innovaciones, Programas y Soluciones para Clientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1">
              Catálogo operativo integral para Áureo Bank. Cada programa se actualiza automáticamente mes a mes con registro contable, cuotas, tasas y auditoría de la CNBS.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateTab('divisions');
                }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Ver en 6 Bancas
              </button>
            )}
            <div className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold whitespace-nowrap shrink-0">
              Ingresos de Programas: {formatHNL(totalMonthlyIncomeAll)}/mes
            </div>
          </div>
        </div>

        {/* Franja de Indicadores Clave del Ecosistema */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Volumen Mensual Movilizado</span>
            <p className="font-mono font-bold text-slate-100 text-sm mt-0.5">{formatHNL(totalVolumeAll)}</p>
          </div>
          <div>
            <span className="text-slate-400">Clientes & Beneficiarios</span>
            <p className="font-mono font-bold text-slate-100 text-sm mt-0.5">{totalParticipantsAll.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-400">Ahorro & Fondeo Acumulado</span>
            <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
              {formatHNL(programsData.microSavingsHuchas?.totalAccumulatedHNL || 4200000)}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Índice Auditoría AML/UIF</span>
            <p className="font-mono font-bold text-sky-400 text-sm mt-0.5">
              {programsData.uifCompliancePortal?.complianceAuditScorePct || 98.5}% Favorable
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros por Pilar y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pestañas de Segmento (Functional Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'todos', label: 'Todos (20)' },
            { id: 'retail', label: 'Banca Retail (5)' },
            { id: 'pyme', label: 'Pyme (4)' },
            { id: 'agro', label: 'Agro & Verde (3)' },
            { id: 'corporativo', label: 'Corporativo (4)' },
            { id: 'tesoreria_regulacion', label: 'Tesorería & CNBS (4)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setSelectedPillar(tab.id);
              }}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedPillar === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador de Programas */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar entre los 20 programas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Grid de Tarjetas de los 20 Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map(prog => (
          <div
            key={prog.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              {/* Encabezado de Tarjeta sin pastillas */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
                    {getPillarIcon(prog.pillar)}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 block">
                      {prog.number < 10 ? `0${prog.number}` : prog.number} · {getPillarLabel(prog.pillar)}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {prog.name}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {prog.tagline}
              </p>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {prog.description}
              </p>
            </div>

            {/* Métricas Tabulares y Botón de Acción */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Volumen Mensual</span>
                  <span className="font-mono font-bold text-slate-200">{formatHNL(prog.monthlyVolumeHNL)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Ingreso / Margen Mes</span>
                  <span className="font-mono font-bold text-emerald-400">+{formatHNL(prog.monthlyNetIncomeHNL)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span>{prog.keyMetricLabel}:</span>
                  <span className="font-mono font-semibold text-amber-300">{prog.keyMetricValue}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {prog.participantsCount.toLocaleString()} part.
                </span>
              </div>

              <button
                onClick={() => handleOpenActionModal(prog)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Operar o Simular</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
          <p className="text-sm font-medium">No se encontraron programas que coincidan con la búsqueda.</p>
          <button
            onClick={() => {
              setSelectedPillar('todos');
              setSearchQuery('');
            }}
            className="text-xs text-amber-400 hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Modal Operativo Interactivo para cada uno de los 20 programas */}
      {activeModalProgram && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {getPillarIcon(activeModalProgram.pillar)}
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Programa {activeModalProgram.number} · {getPillarLabel(activeModalProgram.pillar)}
                  </span>
                  <h3 className="text-base font-bold text-white">{activeModalProgram.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModalProgram(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeModalProgram.description}
            </p>

            {actionFeedback ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Operación Completada Exitosamente</span>
                </div>
                <p className="font-mono text-[11px] text-emerald-200/90">{actionFeedback}</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteModalAction} noValidate className="space-y-4 text-xs">
                {/* Campos contextuales según el programa */}
                {activeModalProgram.number === 1 && (
                  <>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Nombre del Beneficiario en Honduras:</span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Ángel Rivera"
                        value={inputVal1}
                        onChange={e => setInputVal1(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Monto de la Remesa (USD):</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={inputAmount}
                        onChange={e => setInputAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold"
                      />
                    </label>
                  </>
                )}

                {activeModalProgram.number === 2 && (
                  <label className="block space-y-1">
                    <span className="text-slate-400">Puntos a Canjear (L. 0.25 por punto):</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={inputAmount}
                      onChange={e => setInputAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold"
                    />
                    <span className="text-[11px] text-slate-500 block">
                      Abono estimado: {formatHNL((parseFloat(String(inputAmount)) || 0) * 0.25)}
                    </span>
                  </label>
                )}

                {activeModalProgram.number === 3 && (
                  <label className="block space-y-1">
                    <span className="text-slate-400">Depósito Adicional a la Hucha Digital:</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={inputAmount}
                      onChange={e => setInputAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-400 font-bold"
                    />
                  </label>
                )}

                {activeModalProgram.number === 4 && (
                  <>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Nombre del Empleado de Planilla:</span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Roberto Mejía"
                        value={inputVal1}
                        onChange={e => setInputVal1(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Monto de Adelanto Solicitado (Lempiras):</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={inputAmount}
                        onChange={e => setInputAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold"
                      />
                    </label>
                  </>
                )}

                {activeModalProgram.number > 4 && (
                  <>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Empresa, Cliente o Proyecto:</span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Distribuidora Morazán S.A."
                        value={inputVal1}
                        onChange={e => setInputVal1(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-slate-400">Monto de la Operación (HNL):</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={inputAmount}
                        onChange={e => setInputAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold"
                      />
                    </label>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveModalProgram(null)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors"
                  >
                    Confirmar Ejecución
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
