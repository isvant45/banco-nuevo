import React from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatUSD, formatPct, getMonthName } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  BadgePercent, 
  Coins 
} from 'lucide-react';

interface TopExecutiveHUDProps {
  state: GameState;
  onAdvanceMonth: () => void;
  onResetGame: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const TopExecutiveHUD: React.FC<TopExecutiveHUDProps> = ({
  state,
  onAdvanceMonth,
  onResetGame,
  activeTab,
  onSelectTab
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const { name: monthName, year, fullLabel } = getMonthName(state.gameMonth);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const car = state.financials.capitalAdequacyRatioCAR;
  const isCarCompliant = car >= 10.0;
  const requiredReserves = state.financials.requiredReserveAmount;
  const actualReserves = state.financials.cashAndBCHReserves;
  const isReserveCompliant = actualReserves >= requiredReserves;

  const navItems = [
    { id: 'overview', label: 'Directorio' },
    { id: 'divisions', label: '6 Bancas y Clientes' },
    { id: 'pos_acquiring', label: `Comercios POS (${state.posMerchants.length})` },
    { id: 'pension_funds', label: 'Fondos de Pensiones' },
    { id: 'credit_risk', label: 'Riesgo y Competencia' },
    { id: 'clearing', label: 'CCE y Planilla' },
    { id: 'origination', label: `Créditos (${state.pendingApplications.length})` },
    { id: 'treasury', label: 'Tesorería y Mercado Secundario' },
    { id: 'board_staff', label: 'Talento y Directiva' },
    { id: 'branches', label: 'Sucursales' }
  ];

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

        {/* Botones de acción derecha */}
        <div className="flex items-center gap-2">
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
            <span>Reiniciar</span>
          </button>

          <button
            onClick={onAdvanceMonth}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Avanzar al Próximo Mes</span>
          </button>
        </div>
      </div>

      {/* Zona 2: Indicadores Primarios de Caja y Navegación de Pestañas */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Navegación por Pestañas */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
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
