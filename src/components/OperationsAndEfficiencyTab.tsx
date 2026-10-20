import React from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { Cpu, Zap, TrendingDown, Users, CheckCircle2, ArrowRight, Building, Smartphone } from 'lucide-react';

interface OperationsAndEfficiencyTabProps {
  gameState: GameState;
  onUpgradeTech: () => void;
}

export function OperationsAndEfficiencyTab({ gameState, onUpgradeTech }: OperationsAndEfficiencyTabProps) {
  const { financials, staff, branches, digitalTechLevel, innovations } = gameState;

  const grossIncome = financials.netInterestMargin + financials.totalFeeIncome;
  const costToIncome = grossIncome > 0 ? +((financials.totalOperatingExpense / grossIncome) * 100).toFixed(1) : 45.0;

  const totalEmployees = staff.reduce((acc, s) => acc + s.count, 0);
  const openBranches = branches.filter(b => b.isOpen).length;

  const costPerBranch = openBranches > 0 ? Math.round(financials.branchesOpexExpense / openBranches) : 0;
  const loansPerOfficer = Math.round(financials.loanPortfolioCurrent / (staff.find(s => s.id === 'oficiales_credito')?.count || 20));

  const digitalSavings = innovations?.digitalBanking?.costSavingsMonthlyHNL || 420000;
  const mobileAdoption = innovations?.digitalBanking?.mobileAdoptionPct || 68.5;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Dashboard de Eficiencia Operativa y Productividad</h2>
            <p className="text-xs text-slate-400">
              Control de Cost-to-Income, productividad de ventanillas y automatización de procesos bancarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playUpgradeJingle();
              onUpgradeTech();
            }}
            disabled={digitalTechLevel >= 5}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              digitalTechLevel >= 5
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            {digitalTechLevel >= 5 ? 'Tecnología Nivel Máximo (5/5)' : `Modernizar Core Bancario (Nivel ${digitalTechLevel + 1})`}
          </button>
        </div>
      </div>

      {/* KPI Cards de Operaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Ratio Cost-to-Income</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{costToIncome}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Estándar del sistema: 48.0% (Menor es más eficiente)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Adopción de Canales Móviles</p>
          <p className="text-2xl font-bold font-mono text-blue-400 mt-1">{mobileAdoption}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Ahorro mensual generado: {formatHNL(digitalSavings)}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Cartera por Oficial de Crédito</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{formatHNL(loansPerOfficer)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Productividad de colocación individual</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Opex Mensual por Sucursal</p>
          <p className="text-2xl font-bold font-mono text-slate-200 mt-1">{formatHNL(costPerBranch)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Costos de alquiler, suministros y energía</p>
        </div>
      </div>

      {/* Comparativa: Ventanilla Tradicional vs Canales Digitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Canal Tradicional: Ventanillas & Sucursales</h3>
          </div>
          <p className="text-xs text-slate-400">
            Atención presencial en 4 ciudades principales. Procesa cheques interbancarios, depósitos en efectivo y apertura presencial de cuentas.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Costo promedio por transacción en caja:</span>
              <span className="font-mono font-bold text-rose-400">L. 38.50 / transacción</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Personal operativo asignado:</span>
              <span className="font-mono text-slate-200">{totalEmployees} colaboradores</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sucursales y agencias abiertas:</span>
              <span className="font-mono text-slate-200">{openBranches} ubicaciones</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Canal Digital: App Móvil Áureo & Web Banking</h3>
          </div>
          <p className="text-xs text-slate-400">
            Plataforma cloud transaccional de alta disponibilidad con token digital, transferencias ACH en 5 segundos y pago de servicios.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Costo por transacción digital:</span>
              <span className="font-mono font-bold text-emerald-400">L. 2.10 / transacción (-94%)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Usuarios activos en la App Móvil:</span>
              <span className="font-mono text-slate-200">{(innovations?.digitalBanking?.appUsersCount || 42500).toLocaleString('es-HN')} usuarios</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Nivel tecnológico del Core:</span>
              <span className="font-mono text-emerald-400 font-bold">Nivel {digitalTechLevel} de 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
