import React, { useState } from 'react';
import { DailySimulationState, CommercialBankId } from '../../game/retroSimTypes';
import { COMMERCIAL_BANKS_PROFILES } from '../../game/commercialBanksEngine';
import { formatHNLAmount } from '../common/CustomAmountInput';
import { 
  generateDueDiligenceDossier, 
  executeForeclosureAndLiquidation,
  calculateOpexCapexBreakdown 
} from '../../game/macroEconomyEngine';
import { sound } from '../../game/audioFx';

interface DueDiligenceModalProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
  onOpenNegotiation: (bankId: CommercialBankId) => void;
  bankId?: CommercialBankId;
}

export const DueDiligenceModal: React.FC<DueDiligenceModalProps> = ({
  state,
  onUpdateState,
  onClose,
  onOpenNegotiation,
  bankId = 'ficohsa'
}) => {
  const [selectedBankId, setSelectedBankId] = useState<CommercialBankId>(bankId);
  const [requestedAmount, setRequestedAmount] = useState<number>(4500000);
  const [feedback, setFeedback] = useState<string | null>(null);

  const bankRel = state.commercialBanks[selectedBankId];
  const bankName = COMMERCIAL_BANKS_PROFILES[selectedBankId]?.name || selectedBankId.toUpperCase();
  const dossier = generateDueDiligenceDossier(state, requestedAmount, selectedBankId);
  const opexReport = calculateOpexCapexBreakdown(state);

  const activeLoan = bankRel?.activeLoan;
  const isLoanOverdue = (activeLoan as any)?.isOverdue || (activeLoan && (activeLoan as any).monthsOverdue >= 1);

  const handleApproveStandard = () => {
    sound.playApprovalStamp();
    // Abrir la mesa de negociación para formalizar el contrato
    onOpenNegotiation(selectedBankId);
  };

  const handleExecuteForeclosure = (collateralId: string, outstandingDebt: number) => {
    sound.playApprovalStamp();
    try {
      const result = executeForeclosureAndLiquidation(state, selectedBankId, collateralId, outstandingDebt);
      onUpdateState(result.updatedState);
      setFeedback(result.message);
    } catch (err: any) {
      setFeedback(err.message || 'Error al ejecutar el embargo judicial.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-black font-sans text-xs">
        {/* Barra de Título */}
        <div className="bg-[#000080] text-white px-3 py-1.5 font-bold flex justify-between items-center select-none shrink-0">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <span>Auditoría de Crédito & Due Diligence Bancario — Comité de Riesgo {bankName}</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-5 h-5 bg-[#c0c0c0] text-black font-bold flex items-center justify-center border border-white hover:bg-red-600 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Contenido del Dossier */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {feedback && (
            <div className="p-2.5 bg-blue-100 border-2 border-blue-600 text-blue-950 font-bold text-xs flex justify-between items-center shadow">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-xs font-bold px-1.5 bg-white border">✕</button>
            </div>
          )}

          {/* Selector de Banco Evaluador */}
          <div className="flex items-center justify-between bg-white p-2 border border-slate-400">
            <span className="font-bold text-xs text-slate-800">Comité de Riesgos y Auditoría Bancaria:</span>
            <div className="flex gap-1">
              {(['ficohsa', 'atlantida', 'bac', 'occidente'] as CommercialBankId[]).map(bId => (
                <button
                  key={bId}
                  onClick={() => {
                    sound.playClick();
                    setSelectedBankId(bId);
                  }}
                  className={`px-3 py-1 text-xs font-bold border ${
                    selectedBankId === bId
                      ? 'bg-blue-900 text-white border-blue-950 shadow-inner'
                      : 'bg-[#dfdfdf] border-slate-400 text-slate-800 hover:bg-white'
                  }`}
                >
                  {COMMERCIAL_BANKS_PROFILES[bId]?.shortName || bId.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Encabezado del Dossier */}
          <div className="p-3 bg-white border-2 border-slate-400 space-y-2">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">DOSSIER AUDITADO: {dossier.dossierId}</span>
                <h2 className="text-base font-bold text-slate-900">{dossier.companyName}</h2>
                <span className="text-[11px] text-slate-600">{dossier.sectorName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Dictamen de Riesgo:</span>
                <span className={`px-2 py-0.5 font-bold text-xs rounded uppercase ${
                  dossier.riskClassification === 'BAJO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-400' :
                  dossier.riskClassification === 'MODERADO' ? 'bg-blue-100 text-blue-800 border border-blue-400' :
                  dossier.riskClassification === 'ALTO' ? 'bg-amber-100 text-amber-800 border border-amber-400' :
                  'bg-rose-100 text-rose-800 border border-rose-400'
                }`}>
                  Riesgo {dossier.riskClassification}
                </span>
              </div>
            </div>

            {/* 4 Métricas Clave de Due Diligence */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-slate-50 border text-center">
                <span className="text-[10px] text-slate-500 block">Credit Score:</span>
                <span className="font-mono font-black text-blue-950 text-base">{dossier.creditScore}</span>
                <span className="text-[9px] text-slate-600 block">Clasificación: {dossier.scoreTier}</span>
              </div>

              <div className="p-2 bg-slate-50 border text-center">
                <span className="text-[10px] text-slate-500 block">Ratio Deuda/Ingreso (DTI):</span>
                <span className="font-mono font-black text-slate-900 text-base">{dossier.dtiRatioPct}%</span>
                <span className="text-[9px] text-slate-600 block">Norma CNBS: &lt; 40%</span>
              </div>

              <div className="p-2 bg-slate-50 border text-center">
                <span className="text-[10px] text-slate-500 block">Ventas Mensuales Brutas:</span>
                <span className="font-mono font-black text-emerald-900 text-sm">{formatHNLAmount(dossier.grossMonthlySalesHNL)}</span>
                <span className="text-[9px] text-slate-600 block">Flujo operativo base</span>
              </div>

              <div className="p-2 bg-slate-50 border text-center">
                <span className="text-[10px] text-slate-500 block">OPEX Fijo Mensual:</span>
                <span className="font-mono font-black text-rose-900 text-sm">{formatHNLAmount(dossier.monthlyOpexHNL)}</span>
                <span className="text-[9px] text-slate-600 block">Nómina, renta y servicios</span>
              </div>
            </div>

            {/* Dictamen del Analista de Riesgo */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 text-slate-800 text-[11px] leading-relaxed">
              <span className="font-bold text-blue-950 block mb-0.5">Dictamen Técnico del Oficial de Riesgo:</span>
              <p>{dossier.analystSummary}</p>
            </div>
          </div>

          {/* Sección de Gestión de Cartera en Mora & Ejecución Judicial */}
          <div className="p-3 bg-white border-2 border-slate-400 space-y-2">
            <h3 className="font-bold text-xs text-slate-900 border-b pb-1">
              GESTIÓN DE CARTERA VIGENTE / EN MORA CON {bankName}
            </h3>

            {activeLoan ? (
              <div className="p-2.5 bg-slate-50 border space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{(activeLoan as any).loanName || activeLoan.purpose || 'Crédito Comercial'} ({(activeLoan as any).loanId || activeLoan.id})</span>
                    <span className="text-[10px] text-slate-500 block">
                      Saldo adeudado: L {activeLoan.balanceRemaining.toLocaleString()} • Cuota: L {activeLoan.monthlyPayment.toLocaleString()}/mes
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                    isLoanOverdue ? 'bg-red-700 text-white animate-pulse' : 'bg-emerald-700 text-white'
                  }`}>
                    {isLoanOverdue ? 'ESTADO: MORA JUDICIAL' : 'ESTADO: VIGENTE'}
                  </span>
                </div>

                {/* Si hay colateral vinculado y está en riesgo o mora, habilitar botón de embargo */}
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-[10px] text-slate-600">
                    Garantía vinculada: <strong className="text-slate-900">{(activeLoan as any).collateralPledged || (activeLoan as any).collateralIdRef || 'Garantía Hipotecaria'}</strong>
                  </span>
                  
                  {state.realEstateCollaterals && state.realEstateCollaterals.length > 0 && (
                    <button
                      onClick={() => {
                        const targetCol = state.realEstateCollaterals?.find(c => c.isPledged) || state.realEstateCollaterals?.[0];
                        if (targetCol) {
                          handleExecuteForeclosure(targetCol.id, activeLoan.balanceRemaining);
                        }
                      }}
                      className="px-3 py-1 bg-red-800 text-white font-bold text-xs hover:bg-red-700 border border-black shadow"
                    >
                      ⚖️ Ejecutar Garantía (Remate Judicial al 60%)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border text-slate-600 text-[11px]">
                Actualmente no existen créditos activos ni moras registradas con esta institución bancaria.
              </div>
            )}
          </div>
        </div>

        {/* Acciones del Banquero */}
        <div className="p-3 bg-[#dfdfdf] border-t-2 border-white flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-600 font-mono">
            Pista de caja de la empresa: {opexReport.daysOfCashRunway} días • Liquidez: L {((state.storeCash || 0) + (state.storeBankBalance || 0)).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-700 border-b-gray-700 font-bold hover:bg-[#d0d0d0]"
            >
              Cerrar Dossier
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenNegotiation(selectedBankId);
              }}
              className="px-4 py-1.5 bg-blue-900 text-white font-bold border-2 border-t-blue-400 border-l-blue-400 border-r-blue-950 border-b-blue-950 hover:bg-blue-800 active:border-t-blue-950 active:border-l-blue-950 flex items-center gap-1 shadow"
            >
              🤝 Abrir Mesa de Negociación (Smart Contract)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
