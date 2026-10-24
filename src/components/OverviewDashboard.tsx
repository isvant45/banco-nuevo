import React from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct, getMonthName } from '../game/economyEngine';
import { 
  Landmark, 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  Newspaper, 
  Swords, 
  Scale, 
  Percent, 
  FileCheck2, 
  AlertCircle,
  ArrowRight,
  Building2,
  Coins,
  Sliders
} from 'lucide-react';

interface OverviewDashboardProps {
  state: GameState;
  onSetMarketing: (level: GameState['marketingAggressiveness']) => void;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  state,
  onSetMarketing,
  onNavigateTab
}) => {
  const fin = state.financials;
  const { fullLabel } = getMonthName(state.gameMonth);

  // Calcular cuota de mercado de Áureo respecto a los competidores
  const totalAssetsMarket = state.competitors.reduce((acc, c) => acc + c.assets, 0) + fin.totalAssets;
  const aureoMarketSharePct = +((fin.totalAssets / totalAssetsMarket) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* 1. Tira de 4 Métricas Clave de Alto Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ACTIVOS TOTALES</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatHNL(fin.totalAssets)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Cuota nacional:</span>
            <span className="font-semibold text-amber-400">{aureoMarketSharePct}%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>CARTERA DE PRÉSTAMOS</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatHNL(fin.loanPortfolioCurrent)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Mora (NPL):</span>
            <span className={`font-semibold ${fin.delinquencyRatioNPL <= 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPct(fin.delinquencyRatioNPL)}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>DEPÓSITOS DEL PÚBLICO</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {formatHNL(fin.depositsPublicTotal)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Encaje legal (12%):</span>
            <span className="text-slate-300 font-mono">{formatHNL(fin.requiredReserveAmount)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>UTILIDAD NETA MENSUAL</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-bold font-mono mb-1 ${fin.currentMonthProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatHNL(fin.currentMonthProfit)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Retorno ROE:</span>
            <span className="font-semibold text-emerald-400">{formatPct(fin.returnOnEquityROE)}</span>
          </div>
        </div>
      </div>

      {/* Spotlight: Suite de 20 Programas e Innovaciones Bancarias */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 hover:border-amber-500/30 rounded-xl p-5 shadow-sm transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <span>20 Programas Financieros Activos</span>
            <span aria-hidden="true">·</span>
            <span>Retail · Pyme · Agro · Corporativo · Regulación</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Suite Integral de Programas e Innovaciones Bancarias
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Remesas QR, Rewards, Hucha Digital, Factoring, Líneas Verdes, Bono de Prenda, Cartas de Crédito, DPF Step-Up y Auditoría CNBS/UIF. Todos integrados con liquidación mensual.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('programs20')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Abrir Catálogo de 20 Programas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Spotlight: Centro de Operaciones Avanzadas (24 Nuevas Características) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl p-5 shadow-sm transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">NUEVO MÓDULO ESTRATÉGICO</span>
            <span aria-hidden="true">·</span>
            <span>24 Características · Red Departamental · Bonos Tier 2 · Estrés CNBS</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Centro de Operaciones Avanzadas
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Expansión de sucursales departamentales, cajeros inteligentes ATM, bonos subordinados de capital complementario, subasta cambiaria de divisas BCH, pruebas de estrés en vivo y cash management corporativo.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('advanced_ops')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Abrir Centro de Operaciones (24)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Highlights: Ranking Histórico de Dividendos & Sandbox Central de Políticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta Ranking de Dividendos */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 hover:border-amber-400/50 rounded-xl p-4 shadow-sm transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <span>GOBIERNO CORPORATIVO</span>
              <span aria-hidden="true">·</span>
              <span>10 AÑOS FISCALES (2017–2026)</span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Ranking Histórico de Dividendos
            </h3>
            <p className="text-xs text-slate-300">
              Gráficos de barras de distribución de utilidades, Payout Ratio %, retención para Capital Tier 1 y rendimiento por acción (DPS).
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {formatHNL(state.dividendGovernance?.totalHistoricalDividendsHNL || 1351830000)} Distribuidos
            </span>
            <button
              onClick={() => onNavigateTab('dividends')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Ver Ranking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tarjeta Sandbox Central de Políticas */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20 border border-blue-500/30 hover:border-blue-400/50 rounded-xl p-4 shadow-sm transition-colors flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <span>SIMULADOR EN TIEMPO REAL</span>
              <span aria-hidden="true">·</span>
              <span>BCH · SAR · ALCO · CNBS</span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Sandbox Central de Parámetros y Scoring
            </h3>
            <p className="text-xs text-slate-300">
              Ajuste deslizadores de TPM, Encaje, ISR bancario y scoring crediticio con propagación simultánea e inmediata en todo el balance.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-blue-300 font-bold">
              Normativa Oficial de Honduras Activa
            </span>
            <button
              onClick={() => onNavigateTab('sandbox')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Abrir Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sección Central: Boletín Oficial BCH y Guerra de Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boletín del Banco Central de Honduras */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Boletín Macroeconómico del Banco Central de Honduras (BCH)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{fullLabel}</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-amber-300">
              {state.bch.lastBulletinTitle}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {state.bch.lastBulletinText}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Tasa TPM:</span>
                <span className="font-bold font-mono text-white text-sm">{formatPct(state.bch.tpmRate)}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Inflación Anual:</span>
                <span className="font-bold font-mono text-amber-400 text-sm">{formatPct(state.bch.interannualInflation)}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Tipo de Cambio:</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">L. {state.bch.exchangeRateHNLtoUSD}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Sentimiento:</span>
                <span className="font-semibold text-blue-300 text-xs">{state.bch.economicSentiment}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Agresividad y Guerra de Tasas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <Swords className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Estrategia de Mercado
              </h2>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Determina cómo compites contra Ficohsa, Atlántida y BAC por captar depósitos y robar clientes corporativos.
            </p>

            <div className="space-y-2">
              {(['Prudente Conservadora', 'Moderada', 'Agresiva (Guerra de Tasas)', 'Ultra Agresiva (Robo de Cartera)'] as GameState['marketingAggressiveness'][]).map(level => (
                <button
                  key={level}
                  onClick={() => onSetMarketing(level)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    state.marketingAggressiveness === level
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{level}</span>
                    {state.marketingAggressiveness === level && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Activa</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span className="block font-medium text-slate-300">Impacto actual:</span>
            {state.marketingAggressiveness.includes('Ultra') 
              ? '+85% efectividad en robar clientes corporativos; mayor gasto en marketing.'
              : state.marketingAggressiveness.includes('Agresiva')
              ? '+35% captación de depósitos frente a la competencia.'
              : 'Enfoque estable para maximizar margen neto.'}
          </div>
        </div>
      </div>

      {/* 3. Comparativa del Sistema Bancario Hondureño */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Sistema Bancario de Honduras (Ranking de Competidores)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Fuente: CNBS y BCH</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Institución</th>
                <th className="py-2.5 px-3">Especialidad</th>
                <th className="py-2.5 px-3 text-right">Activos (L.)</th>
                <th className="py-2.5 px-3 text-right">Cuota Mercado</th>
                <th className="py-2.5 px-3 text-right">Tasa Pasiva Prom.</th>
                <th className="py-2.5 px-3 text-right">Tasa Activa Prom.</th>
                <th className="py-2.5 px-3 text-center">Reputación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Fila destacada de Áureo Bank */}
              <tr className="bg-amber-500/10 text-amber-200 font-semibold">
                <td className="py-3 px-3 flex items-center gap-2 font-sans">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Áureo Bank (Tú)</span>
                </td>
                <td className="py-3 px-3 font-sans text-slate-300">Banca Integral, Pyme y SWIFT</td>
                <td className="py-3 px-3 text-right">{formatHNL(fin.totalAssets)}</td>
                <td className="py-3 px-3 text-right text-amber-400 font-bold">{aureoMarketSharePct}%</td>
                <td className="py-3 px-3 text-right">5.8%</td>
                <td className="py-3 px-3 text-right">18.5%</td>
                <td className="py-3 px-3 text-center font-sans">
                  <span className="text-emerald-400 font-bold">88 / 100</span>
                </td>
              </tr>

              {/* Competidores */}
              {state.competitors.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 text-slate-300">
                  <td className="py-3 px-3 flex items-center gap-2 font-sans font-medium text-white">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.brandColor }} />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400">{c.specialty}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatHNL(c.assets)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">{formatPct(c.marketShare)}</td>
                  <td className="py-3 px-3 text-right">{formatPct(c.depositRateAvg)}</td>
                  <td className="py-3 px-3 text-right">{formatPct(c.lendingRateAvg)}</td>
                  <td className="py-3 px-3 text-center font-sans">
                    <span className="text-slate-300">{c.reputation} / 100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Resumen Sintético: Balance General y Estado de Resultados Certificado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance General */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Balance General Certificado (Lempiras)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Norma CNBS</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Activos */}
            <div>
              <div className="flex justify-between font-bold text-slate-200 pb-1 border-b border-slate-800">
                <span className="font-sans">TOTAL ACTIVOS</span>
                <span className="text-amber-400">{formatHNL(fin.totalAssets)}</span>
              </div>
              <div className="pl-3 pt-1.5 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Caja y Disponibilidades en BCH:</span>
                  <span className="text-slate-200">{formatHNL(fin.cashAndBCHReserves)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartera de Créditos Vigente:</span>
                  <span className="text-slate-200">{formatHNL(fin.loanPortfolioCurrent)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Cartera en Mora (&gt;90 días):</span>
                  <span>{formatHNL(fin.loanPortfolioPastDue)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>(-) Provisiones por Incobrabilidad:</span>
                  <span>-{formatHNL(fin.loanLossProvisions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inversiones en Títulos del BCH:</span>
                  <span className="text-slate-200">{formatHNL(fin.treasuryBondsBCH)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserva en Divisas USD (valor HNL):</span>
                  <span className="text-slate-200">{formatHNL(fin.fxReservesUSDValueInHNL)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bienes de Uso y Sucursales:</span>
                  <span className="text-slate-200">{formatHNL(fin.fixedAssetsBranches)}</span>
                </div>
              </div>
            </div>

            {/* Pasivos y Patrimonio */}
            <div>
              <div className="flex justify-between font-bold text-slate-200 pb-1 border-b border-slate-800">
                <span className="font-sans">TOTAL PASIVOS Y PATRIMONIO</span>
                <span className="text-blue-400">{formatHNL(fin.totalLiabilities + fin.totalEquity)}</span>
              </div>
              <div className="pl-3 pt-1.5 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Depósitos del Público (6 Bancas):</span>
                  <span className="text-slate-200">{formatHNL(fin.depositsPublicTotal)}</span>
                </div>
                {fin.interbankBorrowingBCH > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Fondeo Interbancario Emergencia BCH:</span>
                    <span>{formatHNL(fin.interbankBorrowingBCH)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Otros Pasivos y Retenciones:</span>
                  <span className="text-slate-200">{formatHNL(fin.otherLiabilities)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold pt-1">
                  <span>Patrimonio Contable (Capital + Reservas):</span>
                  <span>{formatHNL(fin.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Resultados */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Estado de Resultados del Mes ({fullLabel})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">ISR 25%</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Ingresos por Intereses de Préstamos:</span>
              <span className="text-emerald-400">+{formatHNL(fin.interestIncomeLoans)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Rendimiento Inversiones y Bonos BCH:</span>
              <span className="text-emerald-400">+{formatHNL(fin.interestIncomeTreasury)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span className="font-sans">(-) Costo Financiero de Depósitos:</span>
              <span>-{formatHNL(fin.interestExpenseDeposits)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-800">
              <span className="font-sans">MARGEN FINANCIERO BRUTO:</span>
              <span className="text-blue-300">{formatHNL(fin.netInterestMargin)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Comisiones CCE / ACH Pronto:</span>
                <span className="text-slate-200">+{formatHNL(fin.feeIncomeClearingACH)}</span>
              </div>
              <div className="flex justify-between">
                <span>Comisiones por Pago de Planilla:</span>
                <span className="text-slate-200">+{formatHNL(fin.feeIncomePayrollServices)}</span>
              </div>
              <div className="flex justify-between">
                <span>Comisiones SWIFT y Remesas Ext.:</span>
                <span className="text-slate-200">+{formatHNL(fin.feeIncomeSwiftAndFX + fin.feeIncomeRemittances)}</span>
              </div>
              <div className="flex justify-between">
                <span>Comisiones Tarjetas y POS Afiliados:</span>
                <span className="text-slate-200">+{formatHNL(fin.feeIncomeCardsAndPOS)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-rose-400">
              <div className="flex justify-between">
                <span>(-) Gastos de Personal y Directiva:</span>
                <span>-{formatHNL(fin.staffSalariesExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Operación de Sucursales y Canales:</span>
                <span>-{formatHNL(fin.branchesOpexExpense + fin.technologyAndMarketingExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Provisiones de Cartera CNBS:</span>
                <span>-{formatHNL(fin.creditProvisionExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Impuesto Sobre la Renta (ISR 25%):</span>
                <span>-{formatHNL(fin.incomeTaxISR)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-slate-700">
              <span className="font-sans text-white">UTILIDAD NETA FINAL:</span>
              <span className={fin.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatHNL(fin.netIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
