import React, { useState } from 'react';
import { 
  HardHat, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  FileText, 
  Users, 
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Home
} from 'lucide-react';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { RealEstateConstructionProject } from '../game/unifiedEconomyEngine';

interface RealEstateProjectsViewProps {
  project: RealEstateConstructionProject;
  developerCashHNL: number;
  onAdvanceStageProgress: (projectId: string, investmentHNL: number) => void;
  onRequestDisbursement: (projectId: string, stageNumber: number) => void;
  onSellHousingUnit: (projectId: string) => void;
  onOpenCreditNegotiation: () => void;
}

export const RealEstateProjectsView: React.FC<RealEstateProjectsViewProps> = ({
  project,
  developerCashHNL,
  onAdvanceStageProgress,
  onRequestDisbursement,
  onSellHousingUnit,
  onOpenCreditNegotiation
}) => {
  const [stageInvestmentHNL, setStageInvestmentHNL] = useState<number>(500000);
  const [notice, setNotice] = useState<string | null>(null);

  const activeStage = project.stages[project.currentStageIndex] || project.stages[project.stages.length - 1];

  const handleInvestInWork = () => {
    if (developerCashHNL < stageInvestmentHNL) {
      sound.playRejectBuzzer();
      alert(`Fondos insuficientes en caja (${formatHNL(developerCashHNL)}). Se requieren ${formatHNL(stageInvestmentHNL)}. Puedes solicitar un desembolso al banco.`);
      return;
    }
    sound.playApprovalStamp();
    onAdvanceStageProgress(project.id, stageInvestmentHNL);
    setNotice(`Inversión de ${formatHNL(stageInvestmentHNL)} aplicada a la etapa "${activeStage.title}".`);
  };

  const handleRequestBankDisbursement = () => {
    sound.playCashChime();
    onRequestDisbursement(project.id, activeStage.stageNumber);
    setNotice(`Solicitud de desembolso bancario enviada a ${project.bankAssignedId.toUpperCase()}. Fondos acreditados tras peritaje.`);
  };

  const handleSellUnitToBankClient = () => {
    if (project.unitsSold >= project.totalHousingUnits) {
      alert('¡Todas las unidades de este proyecto ya fueron vendidas!');
      return;
    }
    sound.playCashChime();
    onSellHousingUnit(project.id);
    setNotice(`¡Venta cerrada! Unidad habitacional vendida por ${formatHNL(project.unitSalePriceHNL)}. El banco financió al comprador mediante hipoteca, amortizando parte del crédito constructor y acreditando utilidad líquida.`);
  };

  const remainingUnits = project.totalHousingUnits - project.unitsSold;
  const totalProjectProgressPct = Math.round(
    project.stages.reduce((acc, s) => acc + s.completionPct, 0) / project.stages.length
  );

  return (
    <div className="space-y-4">
      {/* KPI Header de Inmobiliaria y Obras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AVANCE GLOBAL DEL PROYECTO</span>
            <HardHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {totalProjectProgressPct}%
          </div>
          <span className="text-[11px] text-slate-500">{project.stages.length} etapas constructivas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>LÍNEA CONSTRUCTORA (BANCO)</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-300">
            {formatHNL(project.totalApprovedBankFacilityHNL)}
          </div>
          <span className="text-[11px] text-slate-500">Desembolsado: {formatHNL(project.totalDisbursedBankHNL)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>VENTAS & HIPOTECAS CERRADAS</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {project.unitsSold} / {project.totalHousingUnits} Unids
          </div>
          <span className="text-[11px] text-slate-500">{remainingUnits} unidades disponibles</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CAJA DESARROLLADOR</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatHNL(developerCashHNL)}
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid: Etapas del Proyecto y Panel de Control de Desembolsos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Etapas de la Obra */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FASES CONSTRUCTIVAS E HITOS POR DESEMBOLSO VERIFICABLE</span>
            <span className="text-amber-400 font-bold">{project.title}</span>
          </div>

          <div className="space-y-3">
            {project.stages.map((stg, idx) => {
              const isCurrent = idx === project.currentStageIndex;
              return (
                <div 
                  key={stg.stageNumber}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent 
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                      : stg.completionPct === 100
                      ? 'bg-slate-950/80 border-slate-800/80'
                      : 'bg-slate-950/40 border-slate-900 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">FASE {stg.stageNumber}</span>
                        <span className="text-slate-500">·</span>
                        <h4 className="text-sm font-bold text-white">{stg.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stg.description}</p>
                    </div>

                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded ${
                      stg.completionPct === 100 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      isCurrent ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-900 text-slate-500'
                    }`}>
                      {stg.completionPct}%
                    </span>
                  </div>

                  {/* Barra de Progreso de Etapa */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden my-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        stg.completionPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${stg.completionPct}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>Presupuesto: <strong className="text-slate-200">{formatHNL(stg.budgetRequiredHNL)}</strong></div>
                    <div>Invertido: <strong className="text-white">{formatHNL(stg.spentSoFarHNL)}</strong></div>
                    <div>Desembolsado banco: <strong className="text-blue-300">{formatHNL(stg.disbursedByBankHNL)}</strong></div>
                    <div>
                      Peritaje: <strong className={stg.inspectionPassed ? 'text-emerald-400' : 'text-amber-400'}>
                        {stg.inspectionPassed ? 'Aprobado' : 'Pendiente Verificación'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Operaciones: Inversión en Obra, Desembolso y Venta Hipotecaria */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Control de Finanzas Constructoras
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Etapa {activeStage.stageNumber}: {activeStage.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Los intereses bancarios solo se devengan sobre los fondos efectivamente desembolsados.
            </p>
          </div>

          {/* Acción 1: Inyectar Fondos a la Obra */}
          <div className="space-y-2 text-xs font-mono">
            <label className="text-slate-300 block font-semibold">
              INVERTIR FONDOS EN EJECUCIÓN FÍSICA:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={100000}
                step={100000}
                value={stageInvestmentHNL}
                onChange={e => setStageInvestmentHNL(Number(e.target.value))}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
              />
              <button
                type="button"
                onClick={handleInvestInWork}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Ejecutar
              </button>
            </div>
          </div>

          {/* Acción 2: Solicitar Desembolso al Banco contra Peritaje */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
            <label className="text-slate-300 block font-semibold">
              DESEMBOLSO BANCARIO POR AVANCE:
            </label>
            <p className="text-[11px] text-slate-400">
              El banco libera el siguiente tramo una vez que la inspección pericial corrobora la aplicación real de fondos en la obra.
            </p>
            <button
              onClick={handleRequestBankDisbursement}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Landmark className="w-4 h-4" />
              <span>Solicitar Desembolso de Etapa</span>
            </button>
          </div>

          {/* Acción 3: Venta de Viviendas con Crédito Hipotecario a Clientes del Banco */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
            <label className="text-slate-300 block font-semibold text-emerald-400">
              VENTA DE UNIDAD CON HIPOTECA BANCARIA:
            </label>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Precio por apartamento:</span>
                <span className="font-bold text-white">{formatHNL(project.unitSalePriceHNL)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Unidades disponibles:</span>
                <span className="font-bold text-emerald-400">{remainingUnits} viviendas</span>
              </div>
            </div>

            <button
              onClick={handleSellUnitToBankClient}
              disabled={remainingUnits <= 0}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-40"
            >
              <Home className="w-4 h-4" />
              <span>Vender Unidad (Hipoteca a Cliente Banco)</span>
            </button>
            <p className="text-[10px] text-slate-500">
              Al vender, el banco cancela la porción correspondiente del crédito constructor y deposita la ganancia líquida al desarrollador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
