import React from 'react';
import { GameState, BranchLocation } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  MapPin, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  Store 
} from 'lucide-react';

interface BranchesTabProps {
  state: GameState;
  onOpenBranch: (branchId: string) => void;
  onUpgradeTech: () => void;
}

export const BranchesTab: React.FC<BranchesTabProps> = ({
  state,
  onOpenBranch,
  onUpgradeTech
}) => {
  const handleOpen = (branch: BranchLocation) => {
    if (state.financials.cashAndBCHReserves < branch.costToOpen) {
      sound.playRejectBuzzer();
      alert('Fondos en caja insuficientes para costear la apertura de esta agencia.');
      return;
    }
    sound.playApprovalStamp();
    onOpenBranch(branch.id);
  };

  const handleTech = () => {
    const techCost = state.digitalTechLevel * 5000000;
    if (state.financials.cashAndBCHReserves < techCost) {
      sound.playRejectBuzzer();
      alert('Fondos en caja insuficientes para la inversión tecnológica.');
      return;
    }
    sound.playCashChime();
    onUpgradeTech();
  };

  const openBranchesCount = state.branches.filter(b => b.isOpen).length;
  const nextTechCost = state.digitalTechLevel * 5000000;

  return (
    <div className="space-y-6">
      {/* 1. Módulo de Transformación Digital y Canales Electrónicos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Canales Digitales y Banca Móvil Áureo
              </h2>
              <p className="text-xs text-slate-400">
                La digitalización reduce costos operativos de ventanilla, habilita cobros QR y fideliza a clientes jóvenes y PYMES.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Nivel Tecnológico:</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                Nivel {state.digitalTechLevel} de 5
              </span>
            </div>
            {state.digitalTechLevel < 5 && (
              <button
                onClick={handleTech}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Modernizar Core (Costo: {formatHNL(nextTechCost)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Niveles de Transformación Digital */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`p-3 rounded-lg border ${state.digitalTechLevel >= 2 ? 'bg-slate-950/70 border-emerald-500/40' : 'bg-slate-950/30 border-slate-800'}`}>
            <span className="font-semibold text-white block mb-0.5">App Móvil Áureo & Retiro QR</span>
            <span className="text-[11px] text-slate-400">
              Transferencias ACH Pronto en segundos y consulta de saldos sin comisiones de ventanilla.
            </span>
          </div>

          <div className={`p-3 rounded-lg border ${state.digitalTechLevel >= 3 ? 'bg-slate-950/70 border-emerald-500/40' : 'bg-slate-950/30 border-slate-800'}`}>
            <span className="font-semibold text-white block mb-0.5">Atlántida / Áureo Tap to Pay</span>
            <span className="text-[11px] text-slate-400">
              Convierte los smartphones de comercios PYME en datáfonos de cobro sin costo de hardware POS.
            </span>
          </div>

          <div className={`p-3 rounded-lg border ${state.digitalTechLevel >= 4 ? 'bg-slate-950/70 border-emerald-500/40' : 'bg-slate-950/30 border-slate-800'}`}>
            <span className="font-semibold text-white block mb-0.5">Ciberseguridad & Token Digital</span>
            <span className="text-[11px] text-slate-400">
              Blindaje biométrico bancario que reduce el riesgo operativo de fraude electrónico a cero.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Red Física de Sucursales en Ciudades de Honduras */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Red Regional de Sucursales y Agencias
              </h2>
              <p className="text-xs text-slate-400">
                Presencia física en los principales centros comerciales e industriales de Honduras.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300">
            <span className="text-slate-400">Agencias en Operación: </span>
            <span className="font-bold text-white">{openBranchesCount} de {state.branches.length}</span>
          </div>
        </div>

        {/* Grid de Sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.branches.map(branch => (
            <div
              key={branch.id}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                branch.isOpen
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{branch.cityName}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{branch.zone}</p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    branch.isOpen
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {branch.isOpen ? 'Abierta' : 'Disponible'}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-amber-400 bg-slate-900/60 px-2 py-0.5 rounded w-fit mb-3">
                  {branch.tier}
                </div>

                <div className="space-y-1.5 text-xs font-mono text-slate-300 p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80 mb-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Gasto OPEX / mes:</span>
                    <span className="text-rose-400">{formatHNL(branch.monthlyOpex)}</span>
                  </div>
                  {branch.isOpen && (
                    <>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Depósitos zona:</span>
                        <span className="text-emerald-400 font-bold">L. {branch.capturedDepositsM}M</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Colocaciones:</span>
                        <span className="text-blue-400 font-bold">L. {branch.loansDisbursedM}M</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Personal:</span>
                        <span className="text-slate-200">{branch.staffAssigned} personas</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Botón de apertura si no está abierta */}
              {!branch.isOpen ? (
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex justify-between">
                    <span>Inversión CAPEX:</span>
                    <span className="font-bold text-white">{formatHNL(branch.costToOpen)}</span>
                  </div>
                  <button
                    onClick={() => handleOpen(branch)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir Nueva Agencia</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Agencia en plena operatividad</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
