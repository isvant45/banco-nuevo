import React, { useState } from 'react';
import { GameState, FiscalYearDividendRecord } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { updateCurrentYearDividendPolicy } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Coins, 
  Sliders, 
  CheckCircle2, 
  Building2,
  Calendar,
  FileCheck,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onNavigateTab?: (tabId: string) => void;
}

export function DividendRankingDashboard({ state, onUpdateState }: Props) {
  const gov = state.dividendGovernance;
  const history = gov?.historical10Years || [];
  
  const [selectedMetric, setSelectedMetric] = useState<'amount' | 'payout' | 'perShare'>('amount');
  const [hoveredYear, setHoveredYear] = useState<FiscalYearDividendRecord | null>(null);
  const [selectedYear, setSelectedYear] = useState<FiscalYearDividendRecord>(
    history.find(h => h.fiscalYear === 2026) || history[history.length - 1]
  );
  const [payoutSlider, setPayoutSlider] = useState<number>(gov?.currentYearPolicy2026.targetPayoutPct || 55);
  const [ratificationMessage, setRatificationMessage] = useState<string | null>(null);

  // Sorting state for table
  const [sortField, setSortField] = useState<'rankingPosition' | 'fiscalYear' | 'netIncomeAuditHNL' | 'dividendCashDistributedHNL' | 'payoutRatioPct'>('rankingPosition');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Handlers
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPayoutSlider(val);
    const updated = updateCurrentYearDividendPolicy(state, val);
    onUpdateState(updated);
    const updated2026 = updated.dividendGovernance.historical10Years.find(h => h.fiscalYear === 2026);
    if (updated2026) setSelectedYear(updated2026);
  };

  const handleRatifyPolicy = () => {
    sound.playApprovalStamp();
    setRatificationMessage(`¡Política de Dividendos 2026 ratificada por la Junta Directiva! Payout fijado en ${payoutSlider}%. Se convocará a la Asamblea Ordinaria de Accionistas.`);
    setTimeout(() => setRatificationMessage(null), 5000);
  };

  const sortedHistory = [...history].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (sortField === 'rankingPosition') return (a.rankingPosition - b.rankingPosition) * mult;
    if (sortField === 'fiscalYear') return (a.fiscalYear - b.fiscalYear) * mult;
    if (sortField === 'netIncomeAuditHNL') return (a.netIncomeAuditHNL - b.netIncomeAuditHNL) * mult;
    if (sortField === 'dividendCashDistributedHNL') return (a.dividendCashDistributedHNL - b.dividendCashDistributedHNL) * mult;
    if (sortField === 'payoutRatioPct') return (a.payoutRatioPct - b.payoutRatioPct) * mult;
    return 0;
  });

  // SVG Chart Geometry
  const chartHeight = 260;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;
  const barSlotWidth = (chartWidth - paddingX * 2) / history.length;
  const barWidth = Math.max(18, barSlotWidth * 0.55);

  const maxNetIncome = Math.max(...history.map(h => h.netIncomeAuditHNL), 1);
  const maxPerShare = Math.max(...history.map(h => h.bookValuePerShareHNL), 1);

  return (
    <div className="space-y-6">
      {/* 1. Header Institucional de Gobierno Corporativo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <span>GOBIERNO CORPORATIVO</span>
              <span aria-hidden="true">·</span>
              <span>JUNTA DIRECTIVA DE ÁUREO BANK</span>
              <span aria-hidden="true">·</span>
              <span>CNBS & CÓDIGO DE COMERCIO</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Ranking Histórico de Dividendos (10 Años Fiscales: 2017–2026)
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1">
              Registro histórico auditado de distribución de utilidades, fortalecimiento de Capital Primario Tier 1 
              y rentabilidad por acción bajo la supervisión de la Comisión Nacional de Bancos y Seguros (CNBS).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right font-mono text-xs hidden sm:block">
              <span className="text-slate-400 block text-[10px] uppercase">Acciones en Circulación</span>
              <span className="text-slate-100 font-bold">10,000,000 Acciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tira de 4 KPIs Macro de Dividendos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Total Dividendos Pagados (10 Años)</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold font-mono text-emerald-300">
            {formatHNL(gov.totalHistoricalDividendsHNL)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Distribuido en efectivo a los accionistas
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Payout Promedio Histórico</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold font-mono text-amber-300">
            {formatPct(gov.avgHistoricalPayoutPct)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Rango objetivo estatutario: 40% a 60%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Capital Tier 1 Acumulado</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold font-mono text-blue-300">
            {formatHNL(gov.accumulatedTier1RetainedHNL)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Utilidades retenidas para respaldar solvencia
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Dividendo Estimado 2026 (DPS)</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold font-mono text-purple-300">
            L. {(gov.currentYearPolicy2026.proposedCashDividendHNL / 10000000).toFixed(2)} / acc.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Rendimiento Yield estimado: {history.find(h => h.fiscalYear === 2026)?.dividendYieldPct}%
          </p>
        </div>
      </div>

      {/* 3. Sección Central: Gráfico de Barras Histórico y Selector de Métrica */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Evolución Gráfica de Utilidades y Dividendos (2017 – 2026)
            </h3>
            <p className="text-xs text-slate-400">
              Pase el cursor sobre las barras para inspeccionar el desglose financiero de cada ejercicio fiscal.
            </p>
          </div>

          {/* Selector de Métrica (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMetric('amount');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedMetric === 'amount'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monto en Lempiras (HNL)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMetric('payout');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedMetric === 'payout'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tasa de Payout (%)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMetric('perShare');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedMetric === 'perShare'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DPS vs. Valor Libros
            </button>
          </div>
        </div>

        {/* Leyenda de Colores */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
          {selectedMetric === 'amount' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500/80 inline-block" />
                <span>Utilidad Neta Auditada CNBS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span>Dividendos en Efectivo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                <span>Retención para Capital Tier 1</span>
              </div>
            </>
          )}

          {selectedMetric === 'payout' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                <span>Payout Ratio (% Distribuido)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" />
                <span>Retención Tier 1 (% Reinvertido)</span>
              </div>
            </>
          )}

          {selectedMetric === 'perShare' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                <span>Dividendo por Acción (DPS en L.)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-400/50 inline-block" />
                <span>Valor en Libros por Acción (L.)</span>
              </div>
            </>
          )}
        </div>

        {/* Renderizado de Gráfico SVG de Barras Interactivo */}
        <div className="relative overflow-x-auto py-2">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-64 select-none"
          >
            {/* Líneas Guía de Fondo */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = chartHeight - paddingY - (chartHeight - paddingY * 2) * pct;
              return (
                <g key={idx}>
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="#1e293b" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingX - 6} 
                    y={y + 3} 
                    fill="#64748b" 
                    fontSize="9" 
                    fontFamily="monospace" 
                    textAnchor="end"
                  >
                    {selectedMetric === 'amount' && `${Math.round((maxNetIncome * pct) / 1000000)}M`}
                    {selectedMetric === 'payout' && `${Math.round(100 * pct)}%`}
                    {selectedMetric === 'perShare' && `L. ${Math.round(maxPerShare * pct)}`}
                  </text>
                </g>
              );
            })}

            {/* Barras por Año Fiscal */}
            {history.map((record, index) => {
              const xSlot = paddingX + index * barSlotWidth;
              const isSelected = selectedYear.fiscalYear === record.fiscalYear;
              const isHovered = hoveredYear?.fiscalYear === record.fiscalYear;

              // Alturas según la métrica seleccionada
              if (selectedMetric === 'amount') {
                const totalH = ((record.netIncomeAuditHNL / maxNetIncome) * (chartHeight - paddingY * 2));
                const divH = ((record.dividendCashDistributedHNL / maxNetIncome) * (chartHeight - paddingY * 2));
                const retH = ((record.retainedTier1HNL / maxNetIncome) * (chartHeight - paddingY * 2));

                const yBase = chartHeight - paddingY;

                return (
                  <g 
                    key={record.fiscalYear}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredYear(record)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => {
                      sound.playClick();
                      setSelectedYear(record);
                    }}
                  >
                    {/* Resaltado de fondo al pasar cursor */}
                    {(isHovered || isSelected) && (
                      <rect
                        x={xSlot}
                        y={paddingY}
                        width={barSlotWidth}
                        height={chartHeight - paddingY * 2}
                        fill="#334155"
                        fillOpacity={isSelected ? 0.35 : 0.2}
                        rx="4"
                      />
                    )}

                    {/* Barra de Dividendos en Efectivo (Verde) */}
                    <rect
                      x={xSlot + (barSlotWidth - barWidth) / 2}
                      y={yBase - divH}
                      width={barWidth / 2}
                      height={Math.max(2, divH)}
                      fill="#10b981"
                      rx="2"
                    />

                    {/* Barra de Retención Tier 1 (Ámbar) */}
                    <rect
                      x={xSlot + (barSlotWidth - barWidth) / 2 + barWidth / 2 + 1}
                      y={yBase - retH}
                      width={barWidth / 2}
                      height={Math.max(2, retH)}
                      fill="#f59e0b"
                      rx="2"
                    />

                    {/* Etiqueta de Año Fiscal */}
                    <text
                      x={xSlot + barSlotWidth / 2}
                      y={chartHeight - 10}
                      fill={isSelected ? '#fbbf24' : '#94a3b8'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {record.fiscalYear}
                    </text>
                  </g>
                );
              }

              if (selectedMetric === 'payout') {
                const payoutH = (record.payoutRatioPct / 100) * (chartHeight - paddingY * 2);
                const retainedH = ((100 - record.payoutRatioPct) / 100) * (chartHeight - paddingY * 2);
                const yBase = chartHeight - paddingY;

                return (
                  <g 
                    key={record.fiscalYear}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(record)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => {
                      sound.playClick();
                      setSelectedYear(record);
                    }}
                  >
                    {(isHovered || isSelected) && (
                      <rect
                        x={xSlot}
                        y={paddingY}
                        width={barSlotWidth}
                        height={chartHeight - paddingY * 2}
                        fill="#334155"
                        fillOpacity={isSelected ? 0.35 : 0.2}
                        rx="4"
                      />
                    )}

                    {/* Barra apilada: Retención arriba, Payout abajo */}
                    <rect
                      x={xSlot + (barSlotWidth - barWidth) / 2}
                      y={yBase - payoutH}
                      width={barWidth}
                      height={payoutH}
                      fill="#fbbf24"
                      rx="2"
                    />
                    <rect
                      x={xSlot + (barSlotWidth - barWidth) / 2}
                      y={yBase - payoutH - retainedH}
                      width={barWidth}
                      height={retainedH}
                      fill="#475569"
                      rx="2"
                    />

                    <text
                      x={xSlot + barSlotWidth / 2}
                      y={chartHeight - 10}
                      fill={isSelected ? '#fbbf24' : '#94a3b8'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {record.fiscalYear}
                    </text>
                  </g>
                );
              }

              // Per Share
              const dpsH = (record.dividendPerShareHNL / maxPerShare) * (chartHeight - paddingY * 2);
              const bvH = (record.bookValuePerShareHNL / maxPerShare) * (chartHeight - paddingY * 2);
              const yBase = chartHeight - paddingY;

              return (
                <g 
                  key={record.fiscalYear}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredYear(record)}
                  onMouseLeave={() => setHoveredYear(null)}
                  onClick={() => {
                    sound.playClick();
                    setSelectedYear(record);
                  }}
                >
                  {(isHovered || isSelected) && (
                    <rect
                      x={xSlot}
                      y={paddingY}
                      width={barSlotWidth}
                      height={chartHeight - paddingY * 2}
                      fill="#334155"
                      fillOpacity={isSelected ? 0.35 : 0.2}
                      rx="4"
                    />
                  )}

                  {/* Valor en libros de fondo más ancho */}
                  <rect
                    x={xSlot + (barSlotWidth - barWidth) / 2}
                    y={yBase - bvH}
                    width={barWidth}
                    height={bvH}
                    fill="#3b82f6"
                    fillOpacity="0.4"
                    rx="2"
                  />

                  {/* DPS al frente */}
                  <rect
                    x={xSlot + (barSlotWidth - (barWidth * 0.6)) / 2}
                    y={yBase - dpsH}
                    width={barWidth * 0.6}
                    height={dpsH}
                    fill="#34d399"
                    rx="2"
                  />

                  <text
                    x={xSlot + barSlotWidth / 2}
                    y={chartHeight - 10}
                    fill={isSelected ? '#fbbf24' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {record.fiscalYear}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Ficha Detallada del Ejercicio Fiscal Seleccionado */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white font-mono">
                Ejercicio Fiscal {selectedYear.fiscalYear}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                Ranking #{selectedYear.rankingPosition}
              </span>
              {selectedYear.fiscalYear === 2026 && (
                <span className="text-xs text-indigo-400 font-mono font-medium">
                  (Ejercicio en curso / Proyectado)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dictamen Auditoría: {selectedYear.governanceAuditorOpinion}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Utilidad Neta Auditada</span>
              <span className="font-bold text-slate-200">{formatHNL(selectedYear.netIncomeAuditHNL)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Dividendos Efectivo</span>
              <span className="font-bold text-emerald-400">{formatHNL(selectedYear.dividendCashDistributedHNL)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Retención Tier 1</span>
              <span className="font-bold text-amber-400">{formatHNL(selectedYear.retainedTier1HNL)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Payout Ratio</span>
              <span className="font-bold text-purple-400">{formatPct(selectedYear.payoutRatioPct)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Dividendo por Acción (DPS)</span>
              <span className="font-bold text-slate-100">L. {selectedYear.dividendPerShareHNL.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Solvencia CAR Cierre</span>
              <span className="font-bold text-blue-400">{formatPct(selectedYear.carClosingPct)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Simulador Interactivo de Política de Dividendos 2026 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-0.5">
              <span>ASAMBLEA GENERAL ORDINARIA DE ACCIONISTAS 2026</span>
              <span aria-hidden="true">·</span>
              <span>SIMULADOR EN TIEMPO REAL</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Simulador de Propuesta de Dividendos para la Junta Directiva
            </h3>
            <p className="text-xs text-slate-300">
              Ajuste el porcentaje de Payout proyectado para visualizar inmediatamente el impacto en el desembolso a accionistas, el dividendo por acción y el fortalecimiento del Capital Primario Tier 1.
            </p>
          </div>

          <button
            onClick={handleRatifyPolicy}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ratificar en Directorio</span>
          </button>
        </div>

        {ratificationMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{ratificationMessage}</span>
          </div>
        )}

        {/* Control Deslizante de Payout */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">Tasa Payout Propuesta:</span>
            <span className="text-amber-300 text-base font-bold px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              {payoutSlider}%
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="80"
            step="1"
            value={payoutSlider}
            onChange={handleSliderChange}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>15% (Ultra-conservador / Máxima Retención)</span>
            <span>50% (Estándar Histórico Áureo)</span>
            <span>80% (Agresivo para Accionistas)</span>
          </div>

          {/* Comparativa Dinámica Post-Ajuste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dividendo en Efectivo 2026:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatHNL(gov.currentYearPolicy2026.proposedCashDividendHNL)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Retención para Tier 1:</span>
              <span className="font-bold text-amber-400 text-sm">
                {formatHNL(gov.currentYearPolicy2026.retainedCapitalTier1HNL)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dividendo por Acción (DPS):</span>
              <span className="font-bold text-purple-400 text-sm">
                L. {(gov.currentYearPolicy2026.proposedCashDividendHNL / 10000000).toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Impacto en CAR / Solvencia:</span>
              <span className="font-bold text-blue-400 text-sm">
                +{gov.currentYearPolicy2026.expectedCarImpactPct}% Tier 1 Buffer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tabla Comparativa Auditada de los 10 Ejercicios Fiscales */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Tabla Oficial de los 10 Ejercicios Fiscales Auditados
            </h3>
            <p className="text-xs text-slate-400">
              Haga clic en las columnas para ordenar por dividendo, año fiscal o ratio de payout.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('rankingPosition');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Posición {sortField === 'rankingPosition' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('fiscalYear');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Año Fiscal {sortField === 'fiscalYear' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('netIncomeAuditHNL');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Utilidad Neta (HNL) {sortField === 'netIncomeAuditHNL' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('dividendCashDistributedHNL');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Dividendo Efectivo {sortField === 'dividendCashDistributedHNL' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('payoutRatioPct');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Payout % {sortField === 'payoutRatioPct' && (sortAsc ? '▲' : '▼')}
                </th>
                <th className="py-3 px-3">DPS (L./acc.)</th>
                <th className="py-3 px-3">Yield %</th>
                <th className="py-3 px-3">CAR Cierre</th>
                <th className="py-3 px-3">Dictamen CNBS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {sortedHistory.map((rec) => {
                const isSelected = selectedYear.fiscalYear === rec.fiscalYear;
                return (
                  <tr 
                    key={rec.fiscalYear}
                    onClick={() => {
                      sound.playClick();
                      setSelectedYear(rec);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-amber-500/10 text-white font-semibold' 
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold ${
                        rec.rankingPosition <= 3 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rec.rankingPosition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">
                      {rec.fiscalYear}
                      {rec.fiscalYear === 2026 && <span className="text-[10px] text-amber-400 ml-1.5">(Activo)</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {formatHNL(rec.netIncomeAuditHNL)}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {formatHNL(rec.dividendCashDistributedHNL)}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300">
                      {rec.payoutRatioPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      L. {rec.dividendPerShareHNL.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-amber-300">
                      {rec.dividendYieldPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-blue-400">
                      {rec.carClosingPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {rec.governanceAuditorOpinion}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
