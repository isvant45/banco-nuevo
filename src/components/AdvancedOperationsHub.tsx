import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Wallet, 
  Layers, 
  Sparkles, 
  Sliders, 
  BarChart3, 
  Lock, 
  FileText, 
  Globe, 
  Activity,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  GameState, 
  BranchDepartment, 
  AtmUnit, 
  SubordinatedBondEmission,
  SovereignHolding,
  CorporateTrustContract,
  MicroInsuranceProduct
} from '../game/types';
import { 
  formatHNL, 
  formatUSD, 
  formatPct,
  openOrExpandDepartmentBranch,
  installNewAtmUnit,
  reloadAtmVaultCash,
  affiliateBankingAgent,
  upgradeArmoredTransportSecurity,
  addDriveThruOrLounge,
  issueSubordinatedBond,
  submitFxBchBid,
  investInSovereignAsset,
  drawMultilateralLine,
  investInMutualFund,
  executeOvernightCall,
  executeAdvancedStressTest,
  rebalanceIfrs9Provisions,
  upgradeCyberSecurityFirewall,
  fileAmlComplianceInspection,
  executeAlcoRateAdjustment,
  disperseCorporateCashManagement,
  createCorporateFiduciaryTrust,
  enrollMicroInsuranceBatch,
  launchRetentionCampaign,
  disburseDigitalInstantLoanBatch,
  simulateDividendDistribution
} from '../game/economyEngine';
import { sound } from '../game/audioFx';

interface Props {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onNavigateTab: (tabId: string) => void;
}

export function AdvancedOperationsHub({ state, onUpdateState, onNavigateTab }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'channels' | 'treasury' | 'intelligence' | 'corporate'>('channels');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Estados locales para formularios interactivos
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dep-el-paraiso');
  const [newAtmLocation, setNewAtmLocation] = useState<string>('Plaza Premier Tegucigalpa');
  const [newAtmType, setNewAtmType] = useState<'Multifunción Smart' | 'Básico Dispensador'>('Multifunción Smart');
  const [reloadAtmId, setReloadAtmId] = useState<string>('atm-01');
  const [reloadAmountHNL, setReloadAmountHNL] = useState<number>(500000);
  const [newAgentName, setNewAgentName] = useState<string>('Abarrotería El Esfuerzo');
  const [newAgentDept, setNewAgentDept] = useState<string>('Comayagua (Siguatepeque)');

  // Mercado de Capitales
  const [bondFaceHNL, setBondFaceHNL] = useState<number>(50000000);
  const [bondCouponPct, setBondCouponPct] = useState<number>(8.5);
  const [bondTenorYears, setBondTenorYears] = useState<number>(5);
  const [fxBidUSD, setFxBidUSD] = useState<number>(1500000);
  const [fxBidRate, setFxBidRate] = useState<number>(state.bch.exchangeRateHNLtoUSD);
  const [sovereignAmountHNL, setSovereignAmountHNL] = useState<number>(25000000);
  const [sovereignType, setSovereignType] = useState<'Letra BCH (LRM)' | 'Bono Soberano SEFIN'>('Letra BCH (LRM)');

  // Pruebas de Estrés
  const [stressScenario, setStressScenario] = useState<'devaluacion_hnl' | 'sequia_el_nino' | 'shock_tpm_bch' | 'crisis_liquidez_retiros'>('devaluacion_hnl');
  const [ifrsCoveragePct, setIfrsCoveragePct] = useState<number>(115);

  // Corporativo
  const [trustName, setTrustName] = useState<string>('Fideicomiso Edificio Corporativo Morazán');
  const [trustClient, setTrustClient] = useState<string>('Inversiones Caracol S.A.');
  const [trustAssetsHNL, setTrustAssetsHNL] = useState<number>(150000000);
  const [dividendPayoutPct, setDividendPayoutPct] = useState<number>(35);

  const ops = state.advancedOperations;

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 5500);
  };

  // 1. Expandir Sucursal
  const handleOpenBranch = (deptId: string) => {
    const res = openOrExpandDepartmentBranch(state, deptId);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 2. Instalar ATM
  const handleInstallAtm = () => {
    const res = installNewAtmUnit(state, newAtmLocation, newAtmType);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 3. Recargar Bóveda ATM
  const handleReloadAtm = () => {
    const res = reloadAtmVaultCash(state, reloadAtmId, reloadAmountHNL);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 4. Afiliar Agente Caja Amiga
  const handleAffiliateAgent = () => {
    const res = affiliateBankingAgent(state, newAgentName, newAgentDept, ['Depósitos', 'Retiros', 'Pago Servicios']);
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 5. Upgrade Transporte Blindado
  const handleUpgradeArmored = () => {
    const res = upgradeArmoredTransportSecurity(state);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 6. Autobanco o Lounge
  const handleAddDriveOrLounge = (type: 'autobanco' | 'lounge') => {
    const res = addDriveThruOrLounge(state, type);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 7. Emitir Bonos Subordinados
  const handleIssueBond = () => {
    const res = issueSubordinatedBond(state, `Bono Subordinado Serie B ${state.bch.year}`, bondFaceHNL, bondCouponPct, bondTenorYears, 'Tier 2 Complementario');
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 8. Postura en Subasta FX BCH
  const handleFxBid = () => {
    const res = submitFxBchBid(state, fxBidUSD, fxBidRate);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 9. Invertir en Título Soberano
  const handleInvestSovereign = () => {
    const res = investInSovereignAsset(state, sovereignType, sovereignAmountHNL);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 10. Desembolsar Multilateral
  const handleDrawMultilateral = (inst: 'BCIE' | 'BID Invest') => {
    const res = drawMultilateralLine(state, inst, 2000000);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 11. Promover Fondo Mutuo
  const handlePromoteMutualFund = (fundId: string) => {
    const res = investInMutualFund(state, fundId, 5000000);
    sound.playCashRegister();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 12. Overnight Call
  const handleOvernightCall = (dir: 'prestar' | 'tomar') => {
    const res = executeOvernightCall(state, dir, 15000000);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 13. Pruebas de Estrés CNBS
  const handleRunStressTest = () => {
    const res = executeAdvancedStressTest(state, stressScenario);
    sound.playWarningSiren();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 14. Rebalancear IFRS 9
  const handleRebalanceIfrs = () => {
    const res = rebalanceIfrs9Provisions(state, ifrsCoveragePct);
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 15. Ciberseguridad Firewall
  const handleUpgradeFirewall = () => {
    const res = upgradeCyberSecurityFirewall(state);
    if (res.updatedState !== state) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 16. AML Inspección UIF
  const handleAmlInspection = () => {
    const res = fileAmlComplianceInspection(state, 'Monitoreo de transferencias mayores a $10,000 verificado con éxito.');
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 17. Recomendación ALCO
  const handleApplyAlco = () => {
    const res = executeAlcoRateAdjustment(state);
    sound.playCashRegister();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 18. Dispersión Cash Management
  const handleDisperseCashMgmt = () => {
    const res = disperseCorporateCashManagement(state, 45000000, 28000000);
    sound.playCashRegister();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 19. Crear Fideicomiso
  const handleCreateTrust = () => {
    const res = createCorporateFiduciaryTrust(state, trustName, trustClient, trustAssetsHNL, 'Administración Inmobiliaria');
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 20. Microseguros
  const handleEnrollMicroInsurance = (prodId: string) => {
    const res = enrollMicroInsuranceBatch(state, prodId, 250);
    sound.playCashRegister();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  // 21. Campaña Fidelización
  const handleRetentionCampaign = () => {
    const res = launchRetentionCampaign(state, 1200000);
    if (res.updatedState !== state) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 22. Créditos Digitales
  const handleDisburseDigitalLoans = () => {
    const res = disburseDigitalInstantLoanBatch(state, 20, 2500000);
    if (res.updatedState !== state) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      showToast(res.successMessage);
    } else {
      sound.playRejectBuzzer();
      showToast(res.successMessage);
    }
  };

  // 23. Dividendos Accionistas
  const handleSimulateDividend = () => {
    const res = simulateDividendDistribution(state, dividendPayoutPct);
    sound.playApprovalStamp();
    onUpdateState(res.updatedState);
    showToast(res.successMessage);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Suite de 24 Capacidades Institucionales
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              Operaciones en Tiempo Real
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-amber-400" />
            Centro de Operaciones Avanzadas
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-3xl">
            Simulador de expansión territorial, mercado de capitales, pruebas de estrés regulatorias CNBS y banca transaccional de alto impacto para Áureo Bank Honduras.
          </p>
        </div>

        {/* Métricas Resumen de Operaciones */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/70 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Sucursales Activas</span>
            <span className="text-base font-bold text-amber-400">
              {ops?.departmentBranches?.reduce((a, d) => a + d.activeBranches, 0) || 14} en 10 Deptos
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Parque de ATMs</span>
            <span className="text-base font-bold text-blue-400">
              {ops?.atmFleet?.length || 6} Cajeros Smart
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Bonos Tier 2 Emitidos</span>
            <span className="text-base font-bold text-emerald-400">
              {formatHNL(ops?.subordinatedBonds?.reduce((a, b) => a + b.faceValueHNL, 0) || 200000000)}
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Feedback Interactivo */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-indigo-950/90 border border-indigo-500/40 text-indigo-100 flex items-start gap-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{feedbackMessage}</p>
        </div>
      )}

      {/* Selector de 4 Ejes Estratégicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('channels')}
          className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'channels'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          1. Red Física & Canales ({ops?.departmentBranches?.length || 10})
        </button>

        <button
          onClick={() => setActiveSubTab('treasury')}
          className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'treasury'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Landmark className="w-4 h-4" />
          2. Capitales & Tesorería ({ops?.subordinatedBonds?.length || 2})
        </button>

        <button
          onClick={() => setActiveSubTab('intelligence')}
          className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'intelligence'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. Estrés CNBS & Riesgo
        </button>

        <button
          onClick={() => setActiveSubTab('corporate')}
          className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'corporate'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          4. Corporativo & Retail
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EJE 1: RED FÍSICA, CANALES Y LOGÍSTICA (FEATURES 1 A 6) */}
      {/* ========================================================================= */}
      {activeSubTab === 'channels' && (
        <div className="space-y-6">
          {/* Ficha 1: Red Departamental de Sucursales */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">Característica #1</span>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Red Departamental de Sucursales en Honduras
                </h2>
                <p className="text-slate-400 text-xs">
                  Apertura y gestión operativa en los principales departamentos del país con captación de depósitos y nómina local.
                </p>
              </div>

              {/* Selector de expansión rápida */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  {(ops?.departmentBranches || []).map((d: BranchDepartment) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.activeBranches} agencias - Costo: {formatHNL(d.expansionCostHNL)})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleOpenBranch(selectedDeptId)}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
                >
                  Abrir Sucursal
                </button>
              </div>
            </div>

            {/* Grilla de Departamentos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(ops?.departmentBranches || []).map((dept: BranchDepartment) => (
                <div 
                  key={dept.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    dept.activeBranches > 0 
                      ? 'bg-slate-950/70 border-slate-700/80 hover:border-amber-500/40' 
                      : 'bg-slate-950/30 border-dashed border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-200">{dept.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      dept.status === 'Operativa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {dept.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{dept.capitalCity}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Agencias:</span>
                      <span className="font-bold text-amber-400">{dept.activeBranches} ({dept.totalEmployees} colab.)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Depósitos Captados:</span>
                      <span className="font-semibold text-slate-200">{formatHNL(dept.depositsCollectedHNL)}</span>
                    </div>
                  </div>

                  {dept.status !== 'Operativa' && (
                    <button
                      onClick={() => handleOpenBranch(dept.id)}
                      className="mt-2.5 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition"
                    >
                      Aperturar Departamento ({formatHNL(dept.expansionCostHNL)})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ficha 2 & 3: Cajeros ATM Smart & Red de Agentes "Caja Amiga" */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ficha 2: Flota de Cajeros ATM Smart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #2</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    Parque Inteligente de Cajeros Automáticos (ATM)
                  </h3>
                </div>
                <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                  {ops?.atmFleet?.length || 6} Cajeros Activos
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Dispensadores y cajeros multifunción con depósito de efectivo y cobro de comisiones interbancarias (L. 20/tx).
              </p>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(ops?.atmFleet || []).map((atm: AtmUnit) => (
                  <div key={atm.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{atm.location}</span>
                      <span className="text-[11px] text-slate-400">{atm.type} · Uptime {atm.uptimePct}%</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-semibold block">{formatHNL(atm.cashVaultHNL)} en Bóveda</span>
                      <span className="text-[10px] text-slate-400">+{formatHNL(atm.monthlyFeeIncomeHNL)}/mes comisiones</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de Acción para ATMs */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Instalar Nuevo Cajero</span>
                  <input
                    type="text"
                    value={newAtmLocation}
                    onChange={(e) => setNewAtmLocation(e.target.value)}
                    placeholder="Ubicación (ej. Mall Multiplaza)"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs mb-1.5"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={newAtmType}
                      onChange={(e) => setNewAtmType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs flex-1"
                    >
                      <option value="Multifunción Smart">Smart (L. 650k)</option>
                      <option value="Básico Dispensador">Básico (L. 350k)</option>
                    </select>
                    <button
                      onClick={handleInstallAtm}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Instalar
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Recargar Bóveda Central</span>
                  <select
                    value={reloadAtmId}
                    onChange={(e) => setReloadAtmId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs mb-1.5"
                  >
                    {(ops?.atmFleet || []).map((a: AtmUnit) => (
                      <option key={a.id} value={a.id}>{a.location}</option>
                    ))}
                  </select>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={reloadAmountHNL}
                      onChange={(e) => setReloadAmountHNL(Number(e.target.value))}
                      step="any"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                    />
                    <button
                      onClick={handleReloadAtm}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap"
                    >
                      Recargar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha 3: Red de Agentes "Caja Amiga" */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #3</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Red de Agentes Comunitarios ("Caja Amiga Áureo")
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  {ops?.bankingAgents?.length || 5} Puntos Afiliados
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Inclusión financiera en pulperías, farmacias y ferreterías con comisiones compartidas y bajo costo fijo.
              </p>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(ops?.bankingAgents || []).map((agent: any) => (
                  <div key={agent.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{agent.businessName}</span>
                      <span className="text-[11px] text-slate-400">{agent.department}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-400 font-semibold block">{formatHNL(agent.monthlyVolumeHNL)}/mes</span>
                      <span className="text-[10px] text-slate-400">Comisión: {formatHNL(agent.commissionSharedHNL)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario Afiliar Nuevo Agente */}
              <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300 block mb-1">Afiliar Nuevo Corresponsal Comunitario</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Nombre del Comercio (ej. Pulpería)"
                    className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={newAgentDept}
                    onChange={(e) => setNewAgentDept(e.target.value)}
                    placeholder="Municipio / Departamento"
                    className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  />
                </div>
                <button
                  onClick={handleAffiliateAgent}
                  className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Firmar Convenio Caja Amiga
                </button>
              </div>
            </div>
          </div>

          {/* Fichas 4, 5 & 6: Transporte de Valores, Autobanco Express y Salón VIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ficha 4: Transporte de Valores */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #4</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Flota de Transporte de Valores
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Blindaje IV y logística de remesas inter-sucursales aseguradas con cobertura integral.
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unidades Blindadas:</span>
                  <span className="font-bold text-slate-200">{ops?.armoredTransportFleet?.armoredTrucksCount || 8} camiones</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Efectivo Asegurado:</span>
                  <span className="font-mono text-emerald-400">{formatHNL(ops?.armoredTransportFleet?.cashInTransitInsuredHNL || 180000000)}</span>
                </div>
              </div>
              <button
                onClick={handleUpgradeArmored}
                className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/30 text-xs font-semibold transition"
              >
                Adquirir Camión Blindado (L. 2.8M)
              </button>
            </div>

            {/* Ficha 5: Autobanco Express */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #5</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Activity className="w-4 h-4 text-blue-400" />
                Autobanco y Canales Express
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Atención ágil para clientes en vehículos comerciales, descongestionando las agencias.
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Carriles en Operación:</span>
                  <span className="font-bold text-blue-400">{ops?.driveThruLanesCount || 14} carriles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiempo de Espera Promedio:</span>
                  <span className="font-semibold text-slate-200">1.8 minutos</span>
                </div>
              </div>
              <button
                onClick={() => handleAddDriveOrLounge('autobanco')}
                className="mt-3 w-full py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
              >
                Construir Carril Autobanco (L. 1.2M)
              </button>
            </div>

            {/* Ficha 6: Salón VIP Banca Privada */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #6</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Áureo Private Lounges VIP
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Espacios exclusivos para depositantes HNW con asesoría fiduciaria personalizada.
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Salones VIP Activos:</span>
                  <span className="font-bold text-purple-400">{ops?.privateLoungesCount || 4} lounges</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retención de Clientes HNW:</span>
                  <span className="font-semibold text-emerald-400">99.4% anual</span>
                </div>
              </div>
              <button
                onClick={() => handleAddDriveOrLounge('lounge')}
                className="mt-3 w-full py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
              >
                Inaugurar Salón VIP (L. 2.5M)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EJE 2: MERCADO DE CAPITALES, TESORERÍA Y DIVISAS (FEATURES 7 A 12) */}
      {/* ========================================================================= */}
      {activeSubTab === 'treasury' && (
        <div className="space-y-6">
          {/* Ficha 7: Emisión de Bonos Subordinados Tier 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #7</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Emisión de Bonos Subordinados y Deuda Tier 2 (Bolsa de Valores)
                </h3>
                <p className="text-slate-400 text-xs">
                  Emite títulos de deuda a largo plazo para computar como Capital Complementario (Tier 2) de la CNBS y fortalecer el CAR.
                </p>
              </div>

              {/* Formulario de Emisión Rápida */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Monto a Emitir:</span>
                  <select
                    value={bondFaceHNL}
                    onChange={(e) => setBondFaceHNL(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  >
                    <option value={50000000}>L. 50,000,000</option>
                    <option value={100000000}>L. 100,000,000</option>
                    <option value={200000000}>L. 200,000,000</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tasa Cupón (%):</span>
                  <input
                    type="number"
                    value={bondCouponPct}
                    onChange={(e) => setBondCouponPct(Number(e.target.value))}
                    step="any"
                    min="0"
                    className="w-20 bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Plazo (Años):</span>
                  <select
                    value={bondTenorYears}
                    onChange={(e) => setBondTenorYears(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  >
                    <option value={3}>3 años</option>
                    <option value={5}>5 años</option>
                    <option value={7}>7 años</option>
                  </select>
                </div>
                <button
                  onClick={handleIssueBond}
                  className="mt-3 px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Colocar en Bolsa
                </button>
              </div>
            </div>

            {/* Bonos en Circulación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(ops?.subordinatedBonds || []).map((bond: SubordinatedBondEmission) => (
                <div key={bond.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{bond.seriesName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      {bond.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Valor Facial:</span>
                      <span className="font-mono font-bold text-amber-400">{formatHNL(bond.faceValueHNL)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Cupón Anual:</span>
                      <span className="font-bold text-slate-200">{bond.couponRateAnnualPct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Plazo / Meses:</span>
                      <span className="font-semibold text-slate-300">{bond.tenorYears} años ({bond.monthsElapsed}m)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ficha 8 & 9: Subasta FX BCH & Títulos Soberanos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ficha 8: Mesa Cambiaria Subasta BCH */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #8</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Mesa Cambiaria Activa (Subasta de Divisas BCH)
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Posturas mayoristas de USD ante el Banco Central para abastecer a importadores y generar diferencial cambiario.
              </p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tipo de Cambio Oficial BCH:</span>
                  <span className="font-mono font-bold text-emerald-400">L. {state.bch.exchangeRateHNLtoUSD} / USD</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Demanda (USD):</span>
                    <input
                      type="number"
                      value={fxBidUSD}
                      onChange={(e) => setFxBidUSD(Number(e.target.value))}
                      step="any"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Postura (L. x USD):</span>
                    <input
                      type="number"
                      value={fxBidRate}
                      onChange={(e) => setFxBidRate(Number(e.target.value))}
                      step="any"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFxBid}
                  className="w-full mt-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Radicar Postura en Subasta Electrónica
                </button>
              </div>

              {/* Historial de Posturas */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
                {(ops?.fxBchBids || []).map((bid: any) => (
                  <div key={bid.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] flex justify-between items-center">
                    <span>{bid.bidDate} · Solicitado: {formatUSD(bid.requestedUSD)}</span>
                    <span className="font-bold text-emerald-400">{bid.status} ({formatUSD(bid.allocatedUSD)})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha 9: Cartera Soberana (Letras BCH y Bonos SEFIN) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #9</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Landmark className="w-4 h-4 text-blue-400" />
                Portafolio Soberano (Letras BCH & Bonos SEFIN)
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Títulos libres de riesgo para inversión de excedentes de liquidez y garantía para ventanilla de descuento BCH.
              </p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Instrumento:</span>
                    <select
                      value={sovereignType}
                      onChange={(e) => setSovereignType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                    >
                      <option value="Letra BCH (LRM)">Letra BCH (6.25% - 9m)</option>
                      <option value="Bono Soberano SEFIN">Bono SEFIN (7.60% - 36m)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Monto a Invertir:</span>
                    <select
                      value={sovereignAmountHNL}
                      onChange={(e) => setSovereignAmountHNL(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                    >
                      <option value={10000000}>L. 10,000,000</option>
                      <option value={25000000}>L. 25,000,000</option>
                      <option value={50000000}>L. 50,000,000</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleInvestSovereign}
                  className="w-full mt-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Adquirir Título Gubernamental
                </button>
              </div>

              {/* Tenencias Actuales */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
                {(ops?.sovereignHoldings || []).map((sov: SovereignHolding) => (
                  <div key={sov.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 block">{sov.securityType}</span>
                      <span className="text-slate-500">{sov.termMonthsRemaining} meses restantes</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-400 block">{formatHNL(sov.principalHNL)}</span>
                      <span className="text-emerald-400">{sov.yieldPct}% anual</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fichas 10, 11 & 12: Líneas Multilaterales, Fondos Mutuos & Call Money */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ficha 10: Multilaterales BCIE / BID */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #10</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Líneas Multilaterales (BCIE / BID)
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Fondeo concesional blando a largo plazo para obras de infraestructura y energía verde.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                {(ops?.multilateralLines || []).map((line: any) => (
                  <div key={line.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200">{line.institution}</span>
                      <span className="text-[10px] text-slate-500 block">{line.dedicatedSector}</span>
                    </div>
                    <button
                      onClick={() => handleDrawMultilateral(line.institution)}
                      className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px] font-semibold"
                    >
                      Disponer $2M
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha 11: Fondos Mutuos Áureo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #11</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Fondos Mutuos de Inversión (AUM)
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Captación sin encaje bancario que genera honorarios de administración de activos.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                {(ops?.mutualFunds || []).map((fund: any) => (
                  <div key={fund.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200 block truncate max-w-[140px]">{fund.fundName}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{formatHNL(fund.aumHNL)} AUM</span>
                    </div>
                    <button
                      onClick={() => handlePromoteMutualFund(fund.id)}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded text-[10px] font-semibold"
                    >
                      Suscripción
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha 12: Call Money Overnight */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #12</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Mercado Interbancario Call Money
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Balanceo a 24 horas del encaje legal diario con bancos competidores del sistema.
              </p>
              <div className="mt-3 p-2 bg-slate-950 rounded border border-slate-800 text-xs space-y-1 mb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tasa Call Vigente:</span>
                  <span className="font-bold text-blue-400 font-mono">{(state.bch.tpmRate + 0.35).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Colocado Hoy:</span>
                  <span className="font-mono text-emerald-400">{formatHNL(ops?.overnightInterbankPositions?.lentOvernightHNL || 0)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleOvernightCall('prestar')}
                  className="py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-[11px] font-semibold transition"
                >
                  Prestar L. 15M
                </button>
                <button
                  onClick={() => handleOvernightCall('tomar')}
                  className="py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-semibold transition"
                >
                  Tomar L. 15M
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EJE 3: INTELIGENCIA EJECUTIVA, PRUEBAS DE ESTRÉS Y CNBS (FEATURES 13 A 18) */}
      {/* ========================================================================= */}
      {activeSubTab === 'intelligence' && (
        <div className="space-y-6">
          {/* Ficha 13: Simulador en Vivo de Pruebas de Estrés CNBS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #13</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Simulador de Pruebas de Estrés CNBS (Stress Testing Engine)
                </h3>
                <p className="text-slate-400 text-xs">
                  Somete el balance del banco a choques macroeconómicos adversos para verificar resistencia de capital (CAR &gt; 10.0%).
                </p>
              </div>

              {/* Selector y botón de ejecución */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={stressScenario}
                  onChange={(e) => setStressScenario(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value="devaluacion_hnl">Choque 1: Devaluación HNL (+8.5%)</option>
                  <option value="sequia_el_nino">Choque 2: Sequía El Niño en Agro</option>
                  <option value="shock_tpm_bch">Choque 3: Alza Agresiva TPM (+250 bps)</option>
                  <option value="crisis_liquidez_retiros">Choque 4: Corrida de Depósitos (-15%)</option>
                </select>
                <button
                  onClick={handleRunStressTest}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Ejecutar Prueba de Choque
                </button>
              </div>
            </div>

            {/* Resultado del Último Estrés */}
            {ops?.lastStressTest ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-200">{ops.lastStressTest.scenarioName}</span>
                  <span className="text-slate-500 font-mono">Ejecutado en Turno {ops.lastStressTest.executedAtMonth}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2 border-y border-slate-800/80 mb-2">
                  <div>
                    <span className="text-slate-500 block">CAR Simulado:</span>
                    <span className={`font-mono text-base font-extrabold ${ops.lastStressTest.simulatedCAR >= 10 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {ops.lastStressTest.simulatedCAR}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">(Mínimo 10.0%)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LCR Liquidez Simulado:</span>
                    <span className="font-mono text-base font-bold text-blue-400">{ops.lastStressTest.simulatedLCR}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Provisiones Adicionales:</span>
                    <span className="font-mono font-bold text-amber-400">{formatHNL(ops.lastStressTest.provAdditionalHNL)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Brecha de Capital CNBS:</span>
                    <span className={`font-mono font-bold ${ops.lastStressTest.capitalShortfallHNL > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ops.lastStressTest.capitalShortfallHNL > 0 ? formatHNL(ops.lastStressTest.capitalShortfallHNL) : 'L. 0.00 (Solvente)'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 italic">
                  Dictamen Regulatorio CNBS: "{ops.lastStressTest.cnbsRegulatoryNotice}"
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                Selecciona un escenario de choque macroeconómico y haz clic en "Ejecutar Prueba de Choque" para ver la respuesta del balance.
              </div>
            )}
          </div>

          {/* Ficha 14 & 15: Matriz IFRS 9 & Ciberseguridad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ficha 14: Provisiones Dinámicas IFRS 9 / CNBS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #14</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Calculadora Dinámica de Provisiones IFRS 9
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Pérdida crediticia esperada dividida en Etapa 1 (Normal), Etapa 2 (Vigilancia) y Etapa 3 (Deterioro).
              </p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-slate-500 block text-[10px]">Etapa 1 (Normal)</span>
                    <span className="font-bold text-slate-200">{formatHNL(ops?.ifrs9ProvisionsLedger?.stage1NormalHNL || 12500000)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-slate-500 block text-[10px]">Etapa 2 (Especial)</span>
                    <span className="font-bold text-amber-400">{formatHNL(ops?.ifrs9ProvisionsLedger?.stage2WatchlistHNL || 14800000)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-slate-500 block text-[10px]">Etapa 3 (Mora/NPL)</span>
                    <span className="font-bold text-rose-400">{formatHNL(ops?.ifrs9ProvisionsLedger?.stage3ImpairedHNL || 32000000)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Cobertura Objetivo:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={ifrsCoveragePct}
                      onChange={(e) => setIfrsCoveragePct(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs text-right"
                    />
                    <span className="text-slate-400">%</span>
                    <button
                      onClick={handleRebalanceIfrs}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Ajustar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha 15: Ciberseguridad & Antifraude */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #15</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Lock className="w-4 h-4 text-cyan-400" />
                Centro de Ciberseguridad y Escudo Antifraude
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Monitoreo en tiempo real de transacciones sospechosas, mitigación DDoS y certificación PCI-DSS.
              </p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nivel de Firewall:</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800">
                    Tier {ops?.cyberSecurityCenter?.securityFirewallTier || 2} de 4
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ataques DDoS Mitigados:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {(ops?.cyberSecurityCenter?.ddosBlockedAttacksCount || 18420).toLocaleString()} intentos
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Score de Cumplimiento PCI-DSS:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {ops?.cyberSecurityCenter?.pciDssComplianceScorePct || 99.4}%
                  </span>
                </div>
                <button
                  onClick={handleUpgradeFirewall}
                  className="w-full mt-1 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
                >
                  Elevar Nivel de Firewall (Blindaje Militar)
                </button>
              </div>
            </div>
          </div>

          {/* Fichas 16, 17 & 18: AML UIF, Comité ALCO & Estados Financieros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ficha 16: AML & Oficialía de Cumplimiento */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #16</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Matriz AML / Prevención UIF
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Monitoreo de transferencias mayores a USD 10k y verificación de Personas Expuestas Políticamente (PEPs).
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operaciones $10k+:</span>
                  <span className="font-mono text-slate-200">{ops?.amlCompliancePortal?.transactionsOver10kScreened || 640}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reportes UIF Radicados:</span>
                  <span className="font-bold text-amber-400">{ops?.amlCompliancePortal?.uifReportsSubmitted || 5}</span>
                </div>
              </div>
              <button
                onClick={handleAmlInspection}
                className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/30 text-xs font-semibold transition"
              >
                Radicar Informe Semestral UIF
              </button>
            </div>

            {/* Ficha 17: Comité ALCO Asistente */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #17</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                Comité ALCO (Activos y Pasivos)
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Algoritmo recomendador de tasas activas y pasivas para maximizar el margen de intermediación (NIM).
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">NIM Actual del Banco:</span>
                  <span className="font-bold text-purple-400">{ops?.executiveAlcoMetrics?.netInterestMarginNIM || 5.85}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ganancia Sugerida:</span>
                  <span className="font-semibold text-emerald-400">+{ops?.alcoInterestRateForecast?.expectedNIMImprovementBps || 24} bps</span>
                </div>
              </div>
              <button
                onClick={handleApplyAlco}
                className="mt-3 w-full py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
              >
                Ejecutar Política ALCO
              </button>
            </div>

            {/* Ficha 18: Auditoría Financiera Proyectada */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #18</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <FileText className="w-4 h-4 text-amber-400" />
                Estados Financieros Auditados
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Inspecciona los balances completos auditados bajo formato estándar de la CNBS.
              </p>
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Eficiencia Operativa (CIR):</span>
                  <span className="font-bold text-slate-200">{ops?.executiveAlcoMetrics?.efficiencyRatioCIR || 52.4}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rentabilidad ROE:</span>
                  <span className="font-bold text-emerald-400">{ops?.executiveAlcoMetrics?.returnOnEquityROE || 16.8}%</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('overview')}
                className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition"
              >
                Ver Balance General Completo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EJE 4: PRODUCTOS CORPORATIVOS, RETAIL Y CLIENTES (FEATURES 19 A 24) */}
      {/* ========================================================================= */}
      {activeSubTab === 'corporate' && (
        <div className="space-y-6">
          {/* Ficha 19 & 20: Cash Management & Fideicomisos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ficha 19: Cash Management Transaccional */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #19</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Banca Transaccional Corporativa & Cash Management
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Dispersión masiva de pagos a proveedores, planillas CEE y recaudación corporativa con cobro de comisión.
              </p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Clientes Corporativos Afiliados:</span>
                  <span className="font-bold text-slate-200">{ops?.corporateCashManagement?.corporateClientsEnrolled || 42} grandes corporaciones</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nómina Mensual Dispersada:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{formatHNL(ops?.corporateCashManagement?.monthlyPayrollDispersalsHNL || 145000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisiones Devengadas:</span>
                  <span className="font-mono text-amber-400 font-bold">{formatHNL(ops?.corporateCashManagement?.feeGeneratedHNL || 485000)}/mes</span>
                </div>
                <button
                  onClick={handleDisperseCashMgmt}
                  className="w-full mt-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Dispersar Lote Masivo (L. 73M)
                </button>
              </div>
            </div>

            {/* Ficha 20: Fideicomisos de Garantía y Administración */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #20</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <Landmark className="w-4 h-4 text-purple-400" />
                Fideicomisos Bancarios y Patrimonios Autónomos
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Estructuración fiduciaria para megaproyectos inmobiliarios, energéticos y comerciales.
              </p>

              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {(ops?.fiduciaryTrustContracts || []).map((trust: CorporateTrustContract) => (
                  <div key={trust.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{trust.trustName}</span>
                      <span className="text-[10px] text-purple-400 font-semibold">{trust.trustType}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                      <span>Fideicomitente: {trust.settlorClientName}</span>
                      <span className="font-mono text-emerald-400">{formatHNL(trust.fiduciaryAssetsHNL)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario Crear Fideicomiso */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                  placeholder="Nombre del Proyecto"
                  className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs flex-1"
                />
                <button
                  onClick={handleCreateTrust}
                  className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs whitespace-nowrap"
                >
                  Constituir Fideicomiso
                </button>
              </div>
            </div>
          </div>

          {/* Fichas 21, 22, 23 & 24: Microseguros, Churn NPS, Crédito Digital & Accionistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ficha 21: Microseguros Populares */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #21</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Microseguros Populares
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Pólizas masivas de bajo costo (salud, vida y cosecha) vendidas a cuentahabientes.
              </p>
              <div className="mt-2.5 space-y-1.5 text-xs">
                {(ops?.microInsurancePortfolio || []).map((ins: MicroInsuranceProduct) => (
                  <div key={ins.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="truncate max-w-[120px] text-slate-300">{ins.productName}</span>
                    <button
                      onClick={() => handleEnrollMicroInsurance(ins.id)}
                      className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px]"
                    >
                      +250 Pólizas
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha 22: Motor de Retención & NPS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #22</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-blue-400" />
                Retención de Clientes & NPS
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Monitoreo predictivo de fuga de clientes con campañas automáticas de lealtad.
              </p>
              <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Score NPS:</span>
                  <span className="font-bold text-blue-400">{ops?.clientChurnPredictor?.overallNPSScore || 78} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">En Riesgo de Fuga:</span>
                  <span className="font-bold text-amber-400">{ops?.clientChurnPredictor?.highRiskChurnClientsCount || 14} clientes</span>
                </div>
              </div>
              <button
                onClick={handleRetentionCampaign}
                className="mt-3 w-full py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
              >
                Lanzar Campaña (L. 1.2M)
              </button>
            </div>

            {/* Ficha 23: Crédito Digital Instantáneo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #23</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                Crédito Digital Instantáneo
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Aprobación biométrica y desembolso automático en cuenta en menos de 3 minutos.
              </p>
              <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiempo Aprobación:</span>
                  <span className="font-bold text-purple-400">{ops?.digitalInstantLoans?.averageApprovalTimeMinutes || 2.4} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tasa de Mora Digital:</span>
                  <span className="font-semibold text-emerald-400">{ops?.digitalInstantLoans?.badRatePct || 1.1}%</span>
                </div>
              </div>
              <button
                onClick={handleDisburseDigitalLoans}
                className="mt-3 w-full py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
              >
                Desembolsar Lote (L. 2.5M)
              </button>
            </div>

            {/* Ficha 24: Portal del Accionista & Dividendos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Característica #24</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Portal de Accionistas
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Simulación de política de dividendos vs capitalización de utilidades para la Asamblea General.
              </p>
              <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor en Libros:</span>
                  <span className="font-bold text-amber-400 font-mono">L. {ops?.shareholdersPortal?.bookValuePerShareHNL || 42.50} / acc.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dividendo Propuesto:</span>
                  <span className="font-semibold text-emerald-400">L. {ops?.shareholdersPortal?.declaredDividendPerShareHNL || 3.20}</span>
                </div>
              </div>
              <div className="mt-2 flex gap-1">
                <select
                  value={dividendPayoutPct}
                  onChange={(e) => setDividendPayoutPct(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-1 flex-1"
                >
                  <option value={20}>Payout 20%</option>
                  <option value={35}>Payout 35%</option>
                  <option value={50}>Payout 50%</option>
                </select>
                <button
                  onClick={handleSimulateDividend}
                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Simular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
