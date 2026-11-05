import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Layers, 
  Percent, 
  ShieldCheck, 
  Calendar, 
  Info,
  Maximize2
} from 'lucide-react';
import type { GameState, YieldCurvePoint } from '../../game/types';
import { formatHNL, formatPct } from '../../game/economyEngine';

interface FinancialChartsViewProps {
  state: GameState;
  onOpenAuditReportModal?: () => void;
}

type MetricKey = 'profit' | 'assets' | 'car';

export const FinancialChartsView: React.FC<FinancialChartsViewProps> = ({
  state,
  onOpenAuditReportModal
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('profit');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Generate 12-month data points from state.historyMonthlyProfits or fallback
  const rawHistory = state.historyMonthlyProfits && state.historyMonthlyProfits.length > 0
    ? state.historyMonthlyProfits
    : [
        { monthLabel: 'Mes -5', profit: 48000000, assets: 48000000000, car: 14.2 },
        { monthLabel: 'Mes -4', profit: 51000000, assets: 49200000000, car: 14.5 },
        { monthLabel: 'Mes -3', profit: 49500000, assets: 50100000000, car: 14.4 },
        { monthLabel: 'Mes -2', profit: 54000000, assets: 51200000000, car: 14.8 },
        { monthLabel: 'Mes -1', profit: 57500000, assets: 52400000000, car: 15.0 },
        { monthLabel: `Mes ${state.gameMonth}`, profit: state.financials.netIncome, assets: state.financials.totalAssets, car: state.financials.capitalAdequacyRatioCAR }
      ];

  const dataPoints = rawHistory.slice(-12);

  // Calculate SVG Chart coordinate mapping
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 60;
  const paddingY = 40;

  const values = dataPoints.map(d => d[selectedMetric]);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;
  const range = maxValue - minValue || 1;

  const points = dataPoints.map((d, i) => {
    const x = paddingX + (i / Math.max(1, dataPoints.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d[selectedMetric] - minValue) / range) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  // BCH Yield Curve points
  const yieldCurve: YieldCurvePoint[] = state.bchMoneyDesk?.yieldCurve || [
    { termLabel: '7 días', termDays: 7, bchYieldPct: 5.75, previousYieldPct: 5.75, trend: 'estable' as const },
    { termLabel: '28 días', termDays: 28, bchYieldPct: 6.10, previousYieldPct: 6.05, trend: 'alza' as const },
    { termLabel: '91 días', termDays: 91, bchYieldPct: 6.85, previousYieldPct: 6.80, trend: 'alza' as const },
    { termLabel: '182 días', termDays: 182, bchYieldPct: 7.40, previousYieldPct: 7.45, trend: 'baja' as const },
    { termLabel: '364 días', termDays: 364, bchYieldPct: 8.20, previousYieldPct: 8.15, trend: 'alza' as const }
  ];

  const yieldSvgWidth = 600;
  const yieldSvgHeight = 180;
  const yieldPaddingX = 50;
  const yieldPaddingY = 30;

  const minYield = 4.0;
  const maxYield = 10.0;
  const yieldPoints = yieldCurve.map((pt: YieldCurvePoint, i: number) => {
    const x = yieldPaddingX + (i / Math.max(1, yieldCurve.length - 1)) * (yieldSvgWidth - yieldPaddingX * 2);
    const y = yieldSvgHeight - yieldPaddingY - ((pt.bchYieldPct - minYield) / (maxYield - minYield)) * (yieldSvgHeight - yieldPaddingY * 2);
    return { x, y, pt };
  });

  const yieldPathD = yieldPoints.reduce((acc: string, p: { x: number; y: number }, i: number) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Core Financial Ratios calculations
  const totalAssets = state.financials.totalAssets || 1;
  const totalEquity = state.financials.totalEquity || 1;
  const totalLoans = (state.financials.loanPortfolioCurrent + state.financials.loanPortfolioPastDue) || 1;
  const pastDue = state.financials.loanPortfolioPastDue || 0;
  const nplRatioPct = (pastDue / totalLoans) * 100;

  const netInterestMargin = state.financials.netInterestMargin || 1;
  const totalFeeIncome = state.financials.totalFeeIncome || 0;
  const totalOpex = state.financials.totalOperatingExpense || 1;
  const costToIncomePct = (totalOpex / (netInterestMargin + totalFeeIncome)) * 100;

  const roeAnnualizedPct = ((state.financials.netIncome * 12) / totalEquity) * 100;
  const roaAnnualizedPct = ((state.financials.netIncome * 12) / totalAssets) * 100;
  const carRatioPct = state.financials.capitalAdequacyRatioCAR;
  const lcrRatioPct = state.financials.liquidityCoverageRatioLCR;

  return (
    <div className="space-y-6">
      {/* Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f1d] border border-amber-900/30 p-4 rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-slate-100 uppercase">
              Terminal de Analítica Financiera & Curva de Rendimientos BCH
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Serie de tiempo histórica (12 meses) · Estructura intertemporal de tasas BCH · Auditoría CNBS
          </p>
        </div>

        {onOpenAuditReportModal && (
          <button
            onClick={onOpenAuditReportModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-mono font-semibold transition shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Emitir Dictamen de Auditoría CNBS</span>
          </button>
        )}
      </div>

      {/* Main Multi-Series Time Chart */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-lg p-5 space-y-4">
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Serie:</span>
            <div className="flex items-center gap-1 bg-[#121929] p-0.5 rounded border border-slate-700/60 font-mono text-xs">
              <button
                onClick={() => setSelectedMetric('profit')}
                className={`px-3 py-1 rounded transition ${
                  selectedMetric === 'profit'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Utilidad Neta (HNL)
              </button>
              <button
                onClick={() => setSelectedMetric('assets')}
                className={`px-3 py-1 rounded transition ${
                  selectedMetric === 'assets'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Activos Totales (HNL)
              </button>
              <button
                onClick={() => setSelectedMetric('car')}
                className={`px-3 py-1 rounded transition ${
                  selectedMetric === 'car'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CAR Regulatorio (%)
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Último valor registrado:</span>
            <span className="font-bold text-slate-100 tabular-nums">
              {selectedMetric === 'car' 
                ? `${state.financials.capitalAdequacyRatioCAR.toFixed(2)}%`
                : selectedMetric === 'profit'
                ? formatHNL(state.financials.netIncome)
                : formatHNL(state.financials.totalAssets)}
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedMetric === 'profit' ? '#f59e0b' : selectedMetric === 'assets' ? '#38bdf8' : '#10b981'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={selectedMetric === 'profit' ? '#f59e0b' : selectedMetric === 'assets' ? '#38bdf8' : '#10b981'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = paddingY + pct * (svgHeight - paddingY * 2);
              const gridVal = maxValue - pct * range;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {selectedMetric === 'car'
                      ? `${gridVal.toFixed(1)}%`
                      : formatHNL(gridVal).replace('L. ', '')}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Main Line */}
            <path
              d={pathD}
              fill="none"
              stroke={selectedMetric === 'profit' ? '#f59e0b' : selectedMetric === 'assets' ? '#38bdf8' : '#10b981'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPointIdx === i ? 6 : 4}
                  fill={hoveredPointIdx === i ? '#ffffff' : selectedMetric === 'profit' ? '#f59e0b' : selectedMetric === 'assets' ? '#38bdf8' : '#10b981'}
                  stroke="#0b101b"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPointIdx(i)}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                />
                <text
                  x={p.x}
                  y={svgHeight - 12}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.data.monthLabel}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Info Tooltip Banner */}
          {hoveredPointIdx !== null && points[hoveredPointIdx] && (
            <div className="absolute top-2 right-4 bg-[#0f172a] border border-amber-500/50 rounded px-3 py-1.5 text-xs font-mono shadow-lg flex items-center gap-3">
              <span className="text-amber-400 font-bold">{points[hoveredPointIdx].data.monthLabel}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-200">
                {selectedMetric === 'car'
                  ? `CAR: ${points[hoveredPointIdx].data.car.toFixed(2)}%`
                  : selectedMetric === 'profit'
                  ? `Utilidad: ${formatHNL(points[hoveredPointIdx].data.profit)}`
                  : `Activos: ${formatHNL(points[hoveredPointIdx].data.assets)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Yield Curve + Financial Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Curve Box */}
        <div className="bg-[#0b101b] border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                Curva Soberana de Rendimientos BCH (Tasas Pasivas Interbancarias)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">TPM: {state.bch.tpmRate}%</span>
          </div>

          <p className="text-xs text-slate-400">
            Estructura temporal de tasas de interés de las Letras y Bonos del Banco Central de Honduras según horizonte temporal.
          </p>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${yieldSvgWidth} ${yieldSvgHeight}`} className="w-full h-36 select-none">
              {/* Horizontal Reference Lines */}
              {[4, 6, 8, 10].map(yVal => {
                const y = yieldSvgHeight - yieldPaddingY - ((yVal - minYield) / (maxYield - minYield)) * (yieldSvgHeight - yieldPaddingY * 2);
                return (
                  <g key={yVal}>
                    <line x1={yieldPaddingX} y1={y} x2={yieldSvgWidth - yieldPaddingX} y2={y} stroke="#1e293b" strokeDasharray="2 2" />
                    <text x={yieldPaddingX - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Yield Curve Line */}
              <path d={yieldPathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

              {/* Points & Labels */}
              {yieldPoints.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#38bdf8" stroke="#0b101b" strokeWidth="2" />
                  <text x={p.x} y={p.y - 8} fill="#7dd3fc" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    {p.pt.bchYieldPct.toFixed(2)}%
                  </text>
                  <text x={p.x} y={yieldSvgHeight - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {p.pt.termLabel}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Financial Ratios Matrix */}
        <div className="bg-[#0b101b] border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                Matriz de Ratios Financieros & Normativa CNBS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Dictamen: Apto CNBS</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">CAR (Adecuación de Capital)</div>
              <div className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                {carRatioPct.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Mínimo regulatorio CNBS: 10.0%</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">LCR (Cobertura de Liquidez)</div>
              <div className="text-base font-mono font-bold text-cyan-400 tabular-nums">
                {lcrRatioPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Umbral de estrés: 100.0%</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">NPL (Índice de Cartera Vencida)</div>
              <div className="text-base font-mono font-bold text-amber-400 tabular-nums">
                {nplRatioPct.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Meta de sanidad: &lt; 3.0%</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">CIR (Eficiencia Operativa)</div>
              <div className="text-base font-mono font-bold text-purple-400 tabular-nums">
                {costToIncomePct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Cost-to-Income bancario</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">ROE Anualizado</div>
              <div className="text-base font-mono font-bold text-slate-100 tabular-nums">
                {roeAnnualizedPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Rendimiento sobre Patrimonio</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">ROA Anualizado</div>
              <div className="text-base font-mono font-bold text-slate-100 tabular-nums">
                {roaAnnualizedPct.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Rendimiento sobre Activos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
