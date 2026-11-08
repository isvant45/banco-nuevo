import React, { useState } from 'react';
import { DailySimulationState, CommercialBankId } from '../../game/retroSimTypes';
import { formatHNLAmount } from '../common/CustomAmountInput';
import { 
  createSmartLoanContract, 
  signSmartLoanContract, 
  calculateBusinessCreditScore 
} from '../../game/macroEconomyEngine';
import { COMMERCIAL_BANKS_PROFILES } from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface NegotiationTableModalProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
  initialBankId?: CommercialBankId;
}

export const NegotiationTableModal: React.FC<NegotiationTableModalProps> = ({
  state,
  onUpdateState,
  onClose,
  initialBankId = 'ficohsa'
}) => {
  const [selectedBankId, setSelectedBankId] = useState<CommercialBankId>(initialBankId);
  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(3);
  const [selectedCollateralId, setSelectedCollateralId] = useState<string>(
    state.realEstateCollaterals?.[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const bankName = COMMERCIAL_BANKS_PROFILES[selectedBankId]?.name || selectedBankId.toUpperCase();
  const creditReport = calculateBusinessCreditScore(state);

  // Colateral seleccionado
  const selectedCollateral = (state.realEstateCollaterals || []).find(c => c.id === selectedCollateralId);
  const collateralAppraisal = selectedCollateral?.appraisalValueHNL || selectedCollateral?.acquisitionValueHNL || 0;
  const collateralCoverageHNL = Math.round(collateralAppraisal * ((selectedCollateral?.ltvAcceptedPct || 80) / 100));
  const coverageRatioPct = loanAmount > 0 ? Math.round((collateralCoverageHNL / loanAmount) * 100) : 0;

  // Smart Contract actual
  const currentContract = createSmartLoanContract(state, {
    bankId: selectedBankId,
    principalAmountHNL: loanAmount,
    interestRateAnnual: interestRate,
    termMonths,
    gracePeriodMonths,
    collateralId: selectedCollateralId || undefined
  });

  const handleSignContract = () => {
    sound.playApprovalStamp();
    const result = signSmartLoanContract(state, currentContract);
    if (result.success) {
      onUpdateState(result.updatedState);
      setFeedback(result.message);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setFeedback(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-black font-sans text-xs">
        {/* Barra de Título Retro */}
        <div className="bg-[#000080] text-white px-3 py-1.5 font-bold flex justify-between items-center select-none shrink-0">
          <div className="flex items-center gap-2">
            <span>📜</span>
            <span className="truncate">Mesa de Negociación Bilateral (Smart Contract) — {state.storeName} & {bankName}</span>
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

        {/* Contenido en Dos Columnas: Empresario vs Banquero */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {feedback && (
            <div className="p-2.5 bg-emerald-100 border-2 border-emerald-600 text-emerald-950 font-bold text-xs flex justify-between items-center shadow">
              <span>{feedback}</span>
            </div>
          )}

          {/* Selector de Banco Aliado */}
          <div className="flex items-center justify-between bg-white p-2 border border-slate-400">
            <span className="font-bold text-xs text-slate-800">Seleccionar Banco en la Mesa de Negociación:</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LADO IZQUIERDO: EL EMPRESARIO (Demanda & Perfil de Solvencia) */}
            <div className="p-3 bg-slate-50 border-2 border-slate-400 space-y-3">
              <div className="border-b pb-1 flex justify-between items-center">
                <span className="font-bold text-xs text-blue-900 uppercase">🏢 Postura del Empresario (Prestatario)</span>
                <span className="font-mono text-[10px] font-bold bg-blue-100 px-1.5 py-0.5 border border-blue-300 text-blue-950">
                  Credit Score: {creditReport.score} ({creditReport.tier})
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Monto de Capital Requerido:</span>
                    <span className="font-mono font-bold text-blue-950">{formatHNLAmount(loanAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="20000000"
                    step="250000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>L 500,000</span>
                    <span>L 10,000,000</span>
                    <span>L 20,000,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Plazo de Financiamiento (Meses):</span>
                    <span className="font-mono font-bold text-slate-900">{termMonths} meses ({(termMonths / 12).toFixed(1)} años)</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="84"
                    step="6"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>12 m</span>
                    <span>36 m</span>
                    <span>60 m</span>
                    <span>84 m</span>
                  </div>
                </div>

                {/* Selección de Garantía Aportada */}
                <div className="space-y-1 pt-1">
                  <span className="font-bold text-xs text-slate-700 block">Garantía Real Vinculada al Contrato:</span>
                  <select
                    value={selectedCollateralId}
                    onChange={(e) => setSelectedCollateralId(e.target.value)}
                    className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                  >
                    <option value="">(Sin garantía real - Crédito Fiduciario Limpio)</option>
                    {(state.realEstateCollaterals || []).map(c => (
                      <option key={c.id} value={c.id} disabled={c.isPledged}>
                        {c.title} — Tasación: L {(c.appraisalValueHNL || 0).toLocaleString()} (Aforo {c.ltvAcceptedPct || 80}%){c.isPledged ? ' [PIGNORADO]' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedCollateral && (
                    <div className="p-1.5 bg-blue-50 border border-blue-200 text-[10px] text-blue-950 flex justify-between font-mono">
                      <span>Cobertura Admisible: L {collateralCoverageHNL.toLocaleString()}</span>
                      <span className={coverageRatioPct >= 80 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                        Aforo: {coverageRatioPct}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LADO DERECHO: EL BANQUERO (Ajuste de Riesgo, Tasa & Periodo de Gracia) */}
            <div className="p-3 bg-slate-50 border-2 border-slate-400 space-y-3">
              <div className="border-b pb-1 flex justify-between items-center">
                <span className="font-bold text-xs text-emerald-950 uppercase">🏦 Condiciones del Banquero (Comité de Riesgo)</span>
                <span className="font-mono text-[10px] font-bold text-slate-600">
                  Descuento Score: {creditReport.rateDiscountPct > 0 ? `+${creditReport.rateDiscountPct}%` : `${creditReport.rateDiscountPct}%`}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Tasa de Interés Anual Pactada:</span>
                    <span className="font-mono font-black text-emerald-900 text-sm">{interestRate.toFixed(2)}% anual</span>
                  </div>
                  <input
                    type="range"
                    min="6.5"
                    max="24.0"
                    step="0.25"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-emerald-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>6.5% (Prime)</span>
                    <span>12.0% (Media)</span>
                    <span>24.0% (Máx)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Periodo de Gracia de Capital:</span>
                    <span className="font-mono font-bold text-slate-900">{gracePeriodMonths} meses de gracia</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={gracePeriodMonths}
                    onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
                    className="w-full accent-emerald-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 meses</span>
                    <span>6 meses</span>
                    <span>12 meses</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    Durante la gracia solo se liquidan intereses (L {currentContract.monthlyInterestDuringGraceHNL.toLocaleString()}/mes) sin amortizar capital.
                  </span>
                </div>

                {/* Resumen del Contrato Inteligente */}
                <div className="p-2.5 bg-white border border-slate-300 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between border-b pb-1 text-slate-700">
                    <span>Cuota Mes 1 a {gracePeriodMonths || 1} (Gracia):</span>
                    <span className="font-bold text-amber-900">
                      {formatHNLAmount(currentContract.monthlyInterestDuringGraceHNL)}/mes
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-900">
                    <span className="font-bold">Cuota Regular Amortizable:</span>
                    <span className="font-black text-blue-900 text-sm">
                      {formatHNLAmount(currentContract.monthlyPaymentHNL)}/mes
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-[10px] text-slate-500">
                    <span>Comisión Apertura (1.5%):</span>
                    <span>-{formatHNLAmount(Math.round(loanAmount * 0.015))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Acciones y Firma Bilateral */}
        <div className="p-3 bg-[#dfdfdf] border-t-2 border-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono">
              Invariante Smart Contract: Aforo {coverageRatioPct}% • Tasa {interestRate}% • Plazo {termMonths}m
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-700 border-b-gray-700 font-bold hover:bg-[#d0d0d0]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSignContract}
              className="px-5 py-1.5 bg-emerald-800 text-white font-bold border-2 border-t-emerald-400 border-l-emerald-400 border-r-emerald-950 border-b-emerald-950 hover:bg-emerald-700 active:border-t-emerald-950 active:border-l-emerald-950 flex items-center gap-1 shadow"
            >
              ✍️ Firmar Contrato y Desembolsar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
