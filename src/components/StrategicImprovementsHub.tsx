import React, { useState, useMemo } from 'react';
import { 
  GameState, 
  StrategicImprovementItem, 
  StrategicImprovementPillar, 
  StrategicActivationMode 
} from '../game/types';
import { 
  formatHNL, 
  formatPct, 
  toggleStrategicImprovement, 
  setStrategicFilter, 
  setStrategicInteractionMode,
  checkAndUnlockMilestones
} from '../game/economyEngine';
import { INITIAL_STRATEGIC_IMPROVEMENTS } from '../game/initialState';
import { sound } from '../game/audioFx';
import { 
  ShieldCheck, 
  Cpu, 
  Leaf, 
  Scale, 
  TrendingUp, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Landmark, 
  Sparkles, 
  Layers, 
  Award, 
  Search, 
  Filter, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCw,
  Coins,
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onNavigateTab?: (tabId: string) => void;
}

export function StrategicImprovementsHub({ state, onUpdateState, onNavigateTab }: Props) {
  const improvements = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentMode = improvements.interactionMode;
  const currentFilter = improvements.activeFilter;

  const handleModeChange = (mode: StrategicActivationMode) => {
    sound.playClick();
    const nextState = setStrategicInteractionMode(state, mode);
    onUpdateState(nextState);
  };

  const handleFilterChange = (filter: StrategicImprovementPillar | 'all') => {
    sound.playClick();
    const nextState = setStrategicFilter(state, filter);
    onUpdateState(nextState);
  };

  const handleToggle = (item: StrategicImprovementItem) => {
    sound.playClick();
    const result = toggleStrategicImprovement(state, item.id, currentMode);
    onUpdateState(result.updatedState);
    setFeedbackMessage(result.successMessage);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  const handleRefreshMilestones = () => {
    sound.playClick();
    const nextState = checkAndUnlockMilestones(state);
    onUpdateState(nextState);
    setFeedbackMessage('Hitos institucionales recalculados frente al balance y ratios actuales del banco.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Filtered improvements
  const filteredItems = useMemo(() => {
    return improvements.items.filter(item => {
      const matchesPillar = currentFilter === 'all' || item.pillar === currentFilter;
      const matchesSearch = searchTerm.trim() === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regulatoryReference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPillar && matchesSearch;
    });
  }, [improvements.items, currentFilter, searchTerm]);

  // Aggregate stats
  const activeCount = improvements.items.filter(i => i.status === 'active').length;
  const totalCapex = improvements.items
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.capexCostHNL, 0);
  const totalMonthlyOpex = improvements.items
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.monthlyOpexHNL, 0);
  const totalMonthlyBoost = improvements.items
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.monthlyProfitBoostHNL, 0);
  const netMonthlyReturn = totalMonthlyBoost - totalMonthlyOpex;
  const totalCarBps = improvements.items
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.carImpactBps, 0);

  const getPillarBadge = (pillar: StrategicImprovementPillar) => {
    switch (pillar) {
      case 'digital_inclusion':
        return {
          label: 'Digital & Ciberseguridad',
          icon: Cpu,
          badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/50'
        };
      case 'prudential_cnbs':
        return {
          label: 'Prudencial CNBS / SAR',
          icon: Scale,
          badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/50'
        };
      case 'treasury_esg':
        return {
          label: 'Tesorería & Finanzas Verdes',
          icon: Leaf,
          badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-0.5 rounded">
                <Sparkles className="w-3.5 h-3.5" />
                Plan Maestro de Innovación Institucional
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-slate-400 text-xs font-medium">BCH · CNBS · SAR Honduras</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Hub Estratégico de 24 Mejoras Bancarias
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Suite integral de 24 iniciativas de alto rendimiento distribuidas equitativamente en 3 pilares clave: Ciberseguridad e Inclusión Digital, Cumplimiento Normativo CNBS/SAR y Tesorería Avanzada ESG.
            </p>
          </div>

          {/* Selector de Mecanismo de Interacción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => handleModeChange('formal_board')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                currentMode === 'formal_board'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              Junta Directiva (CAPEX/OPEX)
            </button>
            <button
              onClick={() => handleModeChange('sandbox_instant')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                currentMode === 'sandbox_instant'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Sandbox Instantáneo
            </button>
            <button
              onClick={() => handleModeChange('milestone_unlock')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                currentMode === 'milestone_unlock'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Hitos de Desbloqueo
            </button>
          </div>
        </div>

        {/* Notificación de feedback */}
        {feedbackMessage && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button 
              onClick={() => setFeedbackMessage(null)}
              className="text-amber-400 hover:text-amber-200 font-medium ml-4"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Barra de KPIs y Métricas de Rendimiento Consolidado */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Mejoras Activas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-100 tabular-nums">{activeCount}</span>
            <span className="text-xs text-slate-400">/ 24</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(activeCount / 24) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">CAPEX Comprometido</span>
          <span className="text-lg font-bold text-slate-100 tabular-nums">
            {formatHNL(totalCapex)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Activo fijo capitalizado</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">OPEX Mensual</span>
          <span className="text-lg font-bold text-rose-400 tabular-nums">
            {formatHNL(totalMonthlyOpex)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Gasto operativo recurrente</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Ingresos / Ahorro Mes</span>
          <span className="text-lg font-bold text-emerald-400 tabular-nums">
            {formatHNL(totalMonthlyBoost)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Beneficio bruto mensual</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Retorno Neto Mensual</span>
          <span className={`text-lg font-bold tabular-nums ${netMonthlyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatHNL(netMonthlyReturn)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Impacto neto en P&L</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Impacto Solvencia CAR</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-sky-400 tabular-nums">
              +{ (totalCarBps / 100).toFixed(2) }%
            </span>
            <span className="text-[10px] text-slate-400">({totalCarBps} bps)</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Buffer sobre Tier 1 CNBS</span>
        </div>
      </div>

      {/* Dictamen de Auditoría y Gobierno Corporativo */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">
                Dictamen del Comité Técnico y Auditoría de Junta Directiva
              </h3>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                Calificación Institucional A+
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentMode === 'formal_board' 
                ? 'El modo Junta Directiva ejerce control estricto de caja: las inversiones requieren fondos líquidos y capitalizan activos fijos bajo normas internacionales NIIF y CNBS.' 
                : currentMode === 'sandbox_instant'
                  ? 'El modo Sandbox opera como entorno de simulación rápida: permite conmutar iniciativas en tiempo real para proyectar solvencia CAR y retorno sobre patrimonio (ROE).'
                  : 'El modo Hitos premia la gestión prudencial: las iniciativas se habilitan progresivamente a medida que el banco escala en activos, solvencia y masa crítica.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefreshMilestones}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalcular Hitos
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dividends')}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-800/50 transition-colors"
            >
              <span>Ver Ranking Dividendos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controles de Filtrado y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        {/* Pestañas de Ejes / Pilares */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              currentFilter === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Todas (24)
          </button>
          <button
            onClick={() => handleFilterChange('digital_inclusion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              currentFilter === 'digital_inclusion'
                ? 'bg-sky-900/60 text-sky-200 border border-sky-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            Digital & Ciberseguridad (8)
          </button>
          <button
            onClick={() => handleFilterChange('prudential_cnbs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              currentFilter === 'prudential_cnbs'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Prudencial CNBS / SAR (8)
          </button>
          <button
            onClick={() => handleFilterChange('treasury_esg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              currentFilter === 'treasury_esg'
                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Tesorería & ESG (8)
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o norma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid de las 24 Mejoras Estratégicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isActive = item.status === 'active';
          const pillarInfo = getPillarBadge(item.pillar);
          const PillarIcon = pillarInfo.icon;
          const milestone = item.unlockMilestone;
          const isMilestoneLocked = currentMode === 'milestone_unlock' && milestone && !milestone.isAchieved;

          const netMonthly = item.monthlyProfitBoostHNL - item.monthlyOpexHNL;
          const roiMonths = netMonthly > 0 ? (item.capexCostHNL / netMonthly).toFixed(1) : 'N/A';

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-md shadow-amber-500/5'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Encabezado de la Tarjeta */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 tabular-nums">
                      #{item.number.toString().padStart(2, '0')}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${pillarInfo.badgeColor}`}>
                      <PillarIcon className="w-3 h-3" />
                      {pillarInfo.label}
                    </span>
                  </div>

                  {/* Badge de Estado */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug mb-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {item.description}
                </p>

                {/* Detalles Técnicos y Referencia Regulatoria */}
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 mb-3 space-y-1 text-[11px]">
                  <div className="text-slate-300">
                    <span className="text-slate-500">Detalle: </span>
                    {item.technicalDetails}
                  </div>
                  <div className="text-amber-400/90 font-medium">
                    <span className="text-slate-500">Regulación: </span>
                    {item.regulatoryReference}
                  </div>
                </div>

                {/* Métricas Financieras y ROI */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Inversión CAPEX</span>
                    <span className="font-semibold text-slate-200 tabular-nums">
                      {formatHNL(item.capexCostHNL)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">OPEX Mensual</span>
                    <span className="font-semibold text-rose-300 tabular-nums">
                      {formatHNL(item.monthlyOpexHNL)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Retorno Mensual Bruto</span>
                    <span className="font-semibold text-emerald-400 tabular-nums">
                      +{formatHNL(item.monthlyProfitBoostHNL)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Impacto CAR / Payback</span>
                    <span className="font-semibold text-sky-400 tabular-nums">
                      +{item.carImpactBps} bps · {roiMonths}m
                    </span>
                  </div>
                </div>

                {/* Progreso del Hito de Desbloqueo */}
                {milestone && (
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 mb-3 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">Requisito de Desbloqueo</span>
                      <span className={`font-semibold ${milestone.isAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {milestone.isAchieved ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[10px] mb-1.5">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            milestone.isAchieved ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(0, (milestone.currentValue / milestone.targetValue) * 100))}%` 
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {milestone.metricType === 'totalAssets' 
                          ? formatHNL(milestone.currentValue) 
                          : milestone.currentValue} / {milestone.metricType === 'totalAssets' 
                          ? formatHNL(milestone.targetValue) 
                          : milestone.targetValue}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Activación según Modo */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Margen neto: </span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    +{formatHNL(netMonthly)}/mes
                  </span>
                </div>

                {currentMode === 'sandbox_instant' ? (
                  <button
                    onClick={() => handleToggle(item)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                ) : currentMode === 'formal_board' ? (
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={!isActive && state.financials.cashAndBCHReserves < item.capexCostHNL}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50'
                        : state.financials.cashAndBCHReserves >= item.capexCostHNL
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isActive ? (
                      'Pausar Iniciativa'
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        Invertir {formatHNL(item.capexCostHNL)}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={isMilestoneLocked}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/50'
                        : !isMilestoneLocked
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isActive ? (
                      'Activo (Hito Superado)'
                    ) : !isMilestoneLocked ? (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        Activar por Hito
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Hito Bloqueado
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
