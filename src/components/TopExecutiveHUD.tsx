import React, { useState, useEffect } from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct, getMonthName } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  BadgePercent, 
  Coins,
  Bell,
  Clock,
  Vote,
  Sparkles
} from 'lucide-react';

interface TopExecutiveHUDProps {
  state: GameState;
  onAdvanceMonth: () => void;
  onResetGame: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenFinancialStatements: () => void;
  onOpenInterbankMarket: () => void;
  onOpenMonthlySummary?: () => void;
  onOpenFxForwards?: () => void;
  onOpenStressTesting?: () => void;
  onOpenExecutiveDilemmas?: () => void;
}

export const TopExecutiveHUD: React.FC<TopExecutiveHUDProps> = ({
  state,
  onAdvanceMonth,
  onResetGame,
  activeTab,
  onSelectTab,
  onOpenFinancialStatements,
  onOpenInterbankMarket,
  onOpenMonthlySummary,
  onOpenFxForwards,
  onOpenStressTesting,
  onOpenExecutiveDilemmas
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const { name: monthName, year, fullLabel } = getMonthName(state.gameMonth);

  // Auto-Timer de Avance Mensual (para respuesta a "¿A qué hora se reinicia?")
  const [isAutoTimerRunning, setIsAutoTimerRunning] = useState<boolean>(false);
  const [timerIntervalSeconds, setTimerIntervalSeconds] = useState<number>(20);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoTimerRunning) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            onAdvanceMonth();
            return timerIntervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSecondsRemaining(timerIntervalSeconds);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoTimerRunning, timerIntervalSeconds, onAdvanceMonth]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleAutoTimer = () => {
    sound.playClick();
    setIsAutoTimerRunning(!isAutoTimerRunning);
    setSecondsRemaining(timerIntervalSeconds);
  };

  const car = state.financials.capitalAdequacyRatioCAR;
  const isCarCompliant = car >= 10.0;
  const requiredReserves = state.financials.requiredReserveAmount;
  const actualReserves = state.financials.cashAndBCHReserves;
  const isReserveCompliant = actualReserves >= requiredReserves;

  const alerts = state.dynamicAlerts || [];
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;
  const amlPendingCount = state.amlCompliance?.transactionAlerts?.filter(a => (a.status as string) === 'bajo_investigacion' || (a.status as string) === 'detectada' || a.status === 'abierta' || a.status === 'en_analisis').length || 0;
  const pendingDilemmasCount = state.executiveDilemmas?.dilemmas?.filter(d => d.status === 'pendiente').length || 0;

  // Jerarquía Core Bancario Profesional (Honduras & Américas)
  const totalRetailClients = state.divisions.personas.clientCount;
  const nplRatio = state.financials.delinquencyRatioNPL;

  // Mapa de Estaciones Centrales de Operaciones estilo Bloomberg Terminal
  const stationItems = [
    { 
      id: 'terminal_market', 
      label: '1. TERMINAL & MERCADO', 
      subtext: 'Rankings · Arena · Campaña',
      badge: '4 Tablas'
    },
    { 
      id: 'core_banking', 
      label: '2. CORE BANCARIO', 
      subtext: 'DPF · Back-to-Back · Cuentas · Asesores',
      badge: `${totalRetailClients.toLocaleString()} Clientes`
    },
    { 
      id: 'treasury_desk', 
      label: '3. MESA & TESORERÍA', 
      subtext: 'Mesa BCH · Encaje 12% · Sindicados · FX',
      badge: isReserveCompliant ? 'Encaje OK' : 'Déficit Encaje'
    },
    { 
      id: 'risk_compliance', 
      label: '4. RIESGO & CUMPLIMIENTO', 
      subtext: 'Provisiones CNBS · AML UIF · Directorio',
      badge: `${nplRatio.toFixed(1)}% Mora`
    },
    { 
      id: 'tech_modernization', 
      label: '5. TECNOLOGÍA & EFICIENCIA', 
      subtext: 'Árbol Tech 4 Ramas · Ahorro OPEX',
      badge: `Nivel ${state.digitalTechLevel}/5`
    }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      {/* Zona 1: Barra de Control Institucional y Tickers BCH */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 text-xs">
        {/* Marca y Mes */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 shadow-sm shadow-amber-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">ÁUREO BANK</span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-400 font-semibold">{fullLabel}</span>
              <span className="text-slate-500 font-mono text-[11px]">(Turno {state.gameMonth})</span>
            </div>
            <p className="text-[11px] text-slate-400">Sistema Financiero de Honduras</p>
          </div>
        </div>

        {/* Tickers Regulatorios BCH / CNBS */}
        <div className="flex flex-wrap items-center gap-5 text-slate-300">
          <div className="flex items-center gap-1.5" title="Tasa de Política Monetaria fijada por el Banco Central de Honduras">
            <BadgePercent className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">TPM BCH:</span>
            <span className="font-mono font-bold text-blue-300">{formatPct(state.bch.tpmRate)}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Inflación interanual según IPC del Banco Central">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Inflación:</span>
            <span className="font-mono font-bold text-amber-300">{formatPct(state.bch.interannualInflation)}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Tipo de cambio de referencia del BCH">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">USD/HNL:</span>
            <span className="font-mono font-bold text-emerald-300">L. {state.bch.exchangeRateHNLtoUSD}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Coeficiente de Adecuación de Capital (Mínimo CNBS 10%)">
            <ShieldCheck className={`w-3.5 h-3.5 ${isCarCompliant ? 'text-emerald-400' : 'text-rose-500'}`} />
            <span className="text-slate-400">CAR CNBS:</span>
            <span className={`font-mono font-bold ${isCarCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPct(car)}
            </span>
          </div>
        </div>

        {/* Acciones Rápidas, Auto-Timer y Cierre Mensual */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Acceso a Dilemas de Junta Directiva */}
          {onOpenExecutiveDilemmas && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenExecutiveDilemmas();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors relative"
              title="Abrir Centro de Dilemas Éticos y Decisiones de Directorio"
            >
              <Vote className="w-3.5 h-3.5 text-amber-400" />
              <span>Dilemas Directorio</span>
              {pendingDilemmasCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {pendingDilemmasCount}
                </span>
              )}
            </button>
          )}

          {/* Controlador de Avance Automático por Timer */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
            <button
              onClick={toggleAutoTimer}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                isAutoTimerRunning 
                  ? 'bg-emerald-500 text-slate-950 animate-pulse shadow-sm shadow-emerald-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isAutoTimerRunning ? 'Pausar avance automático de mes' : 'Iniciar avance automático de mes contable'}
            >
              {isAutoTimerRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isAutoTimerRunning ? `Auto (${secondsRemaining}s)` : 'Auto-Mes'}</span>
            </button>

            <select
              value={timerIntervalSeconds}
              onChange={e => {
                const sec = Number(e.target.value);
                setTimerIntervalSeconds(sec);
                setSecondsRemaining(sec);
              }}
              className="bg-transparent text-slate-400 hover:text-slate-200 text-[11px] font-mono pr-1 focus:outline-none cursor-pointer"
              title="Intervalo en segundos para el avance automático de mes"
            >
              <option value={10} className="bg-slate-900 text-white">10s</option>
              <option value={15} className="bg-slate-900 text-white">15s</option>
              <option value={20} className="bg-slate-900 text-white">20s</option>
              <option value={30} className="bg-slate-900 text-white">30s</option>
              <option value={60} className="bg-slate-900 text-white">60s</option>
            </select>
          </div>

          {/* Campanita de Notificaciones Dinámicas */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowAlertsDropdown(!showAlertsDropdown);
              }}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors relative"
              title="Alertas Dinámicas del Sistema"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Dropdown de Alertas Dinámicas */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" /> Alertas Dinámicas del Banco
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{alerts.length} eventos</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {alerts.length === 0 ? (
                    <p className="text-slate-500 py-3 text-center">No hay alertas pendientes.</p>
                  ) : (
                    alerts.map(a => {
                      const isCritical = a.severity === 'critica';
                      const isWarn = a.severity === 'advertencia';
                      return (
                        <div
                          key={a.id}
                          onClick={() => {
                            setShowAlertsDropdown(false);
                            if (a.targetTab) onSelectTab(a.targetTab);
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            isCritical ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' :
                            isWarn ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' :
                            'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px] mb-0.5">
                            <span>{a.title}</span>
                            <span className="text-[9px] uppercase font-mono px-1 rounded bg-black/40">
                              {a.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{a.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label="Silenciar o activar audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onResetGame}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
            title="Reiniciar simulador"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          {/* Botón Manual Clásico de Cierre Mensual */}
          <button
            onClick={onAdvanceMonth}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            title="Cerrar el mes contable actual y liquidar todas las operaciones"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cerrar Mes Contable</span>
          </button>
        </div>
      </div>

      {/* Zona 2: Command Dock de 5 Estaciones Estilo Bloomberg Terminal */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navegación de 5 Estaciones Centrales */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full md:w-auto">
          {stationItems.map((item, idx) => {
            const isCurrent = activeTab === item.id || (
              (item.id === 'terminal_market' && ['league_rankings', 'campaign_missions', 'competitor_arena', 'overview'].includes(activeTab)) ||
              (item.id === 'core_banking' && ['back_to_back', 'term_deposits', 'demand_accounts', 'origination', 'divisions', 'pos_acquiring', 'clearing'].includes(activeTab)) ||
              (item.id === 'treasury_desk' && ['bch_money_desk', 'syndicated_lending', 'treasury_alm', 'corporate_trade', 'secondary_securities', 'treasury'].includes(activeTab)) ||
              (item.id === 'risk_compliance' && ['credit_risk', 'aml_compliance', 'sandbox_sar', 'sandbox', 'dividends'].includes(activeTab)) ||
              (item.id === 'tech_modernization' && ['bank_tech_tree', 'advanced_ops', 'innovations'].includes(activeTab))
            );

            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(item.id);
                }}
                className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
                title={`Acceso a ${item.label} (Alt+${idx + 1})`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-[11px] font-bold tracking-tight ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                    Alt+{idx + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="truncate max-w-[130px]">{item.subtext}</span>
                  <span className={`ml-1 text-[9px] font-semibold ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Resumen rápido de liquidez y utilidad */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Caja BCH:</span>
            <span className={`font-bold ${isReserveCompliant ? 'text-slate-200' : 'text-rose-400'}`}>
              {formatHNL(actualReserves)}
            </span>
            <span className="text-[10px] text-slate-500">(Encaje 12%: {formatHNL(requiredReserves)})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-400">Utilidad Mes:</span>
            <span className={`font-bold ${state.financials.currentMonthProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatHNL(state.financials.currentMonthProfit)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
