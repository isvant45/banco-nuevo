import React, { useState } from 'react';
import { BankerDocketApplicant } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface BankerDocketWindowProps {
  queue: BankerDocketApplicant[];
  vaultCash: number;
  onApprove: (docketId: string, adjustedAmount: number, adjustedRate: number) => void;
  onReject: (docketId: string) => void;
  onBatchProcess: () => void;
  onBoostAmount?: (docketId: string) => void;
  onDiscountRate?: (docketId: string) => void;
}

export const BankerDocketWindow: React.FC<BankerDocketWindowProps> = ({
  queue,
  vaultCash,
  onApprove,
  onReject,
  onBatchProcess
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentApplicant = queue[currentIndex] || queue[0];

  const [adjustedAmount, setAdjustedAmount] = useState<number>(() => currentApplicant?.requestedAmount || 50000);
  const [adjustedRate, setAdjustedRate] = useState<number>(() => currentApplicant?.proposedInterestRate || 18.0);
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [rateDiscount, setRateDiscount] = useState<number>(0);

  // Sincronizar ajustes al cambiar de solicitante
  React.useEffect(() => {
    if (currentApplicant) {
      setAdjustedAmount(currentApplicant.requestedAmount);
      setAdjustedRate(currentApplicant.proposedInterestRate);
      setBonusAmount(0);
      setRateDiscount(0);
    }
  }, [currentApplicant?.id]);

  if (!currentApplicant) {
    return (
      <div className="p-8 text-center bg-[#f4ebd0] border-2 border-[#b59e72] shadow-inner text-slate-800">
        <span className="text-4xl block mb-2">📭</span>
        <h3 className="font-bold text-base mb-1">Ventanilla Vacía por Hoy</h3>
        <p className="text-xs text-slate-600 mb-4">
          Has evaluado todas las solicitudes de la jornada. Cierra el día laboral en la barra inferior para generar nuevos clientes.
        </p>
      </div>
    );
  }

  const isPending = currentApplicant.decisionStatus === 'pendiente';
  const isApproved = currentApplicant.decisionStatus === 'aprobado';
  const isRejected = currentApplicant.decisionStatus === 'rechazado';
  const hasVaultCash = vaultCash >= adjustedAmount;

  const totalCollateral = currentApplicant.totalCollateralValue || 0;
  const hasCollateral = totalCollateral > 0;

  // Botón para elevar el monto del préstamo basado en garantía real
  const handleBoostWithCollateral = () => {
    if (!hasCollateral) return;
    sound.playCashChime();
    const boost = Math.round(currentApplicant.requestedAmount * 0.35);
    setBonusAmount(prev => prev + boost);
    setAdjustedAmount(prev => prev + boost);
  };

  // Botón para mejorar la tasa de interés debido al menor riesgo por garantía
  const handleDiscountRateWithCollateral = () => {
    if (!hasCollateral) return;
    sound.playApprovalStamp();
    const discount = 2.5;
    setRateDiscount(prev => prev + discount);
    setAdjustedRate(prev => Math.max(7.5, Number((prev - discount).toFixed(1))));
  };

  const handleApproveClick = () => {
    if (!hasVaultCash && currentApplicant.requestType !== 'Cuenta Corriente') {
      sound.playRejectBuzzer();
      alert('¡Liquidez insuficiente en bóveda! No puedes desembolsar este préstamo sin fondos suficientes.');
      return;
    }
    sound.playApprovalStamp();
    onApprove(currentApplicant.id, adjustedAmount, adjustedRate);
  };

  const handleRejectClick = () => {
    sound.playRejectBuzzer();
    onReject(currentApplicant.id);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Navegación de Expedientes */}
      <div className="bg-[#dfdfdf] border border-[#808080] p-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Cola de Solicitudes:</span>
          <span className="font-mono bg-white px-2 py-0.5 border border-[#808080]">
            Expediente {currentIndex + 1} de {queue.length}
          </span>
          <span className="text-slate-500">({queue.filter(q => q.decisionStatus === 'pendiente').length} pendientes)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentIndex === 0}
            onClick={() => {
              sound.playClick();
              setCurrentIndex(prev => Math.max(0, prev - 1));
            }}
            className="px-2 py-0.5 bg-[#c0c0c0] border border-white border-b-[#404040] border-r-[#404040] disabled:opacity-40"
          >
            ◀ Anterior
          </button>
          <button
            disabled={currentIndex >= queue.length - 1}
            onClick={() => {
              sound.playClick();
              setCurrentIndex(prev => Math.min(queue.length - 1, prev + 1));
            }}
            className="px-2 py-0.5 bg-[#c0c0c0] border border-white border-b-[#404040] border-r-[#404040] disabled:opacity-40"
          >
            Siguiente ▶
          </button>
          <button
            onClick={() => {
              sound.playApprovalStamp();
              onBatchProcess();
            }}
            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-500 font-semibold ml-2"
            title="Aprobar automáticamente solicitudes de bajo riesgo y rechazar las insolventes"
          >
            ⚡ Procesar Lote
          </button>
        </div>
      </div>

      {/* Carpeta Dossier de Cartón Manila Retro */}
      <div className="relative bg-[#f7eed6] border-2 border-[#bfa26e] p-4 shadow-md rounded-sm">
        {/* Sello de Decisión si ya fue evaluado */}
        {isApproved && (
          <div className="absolute top-6 right-6 pointer-events-none transform rotate-[-12deg] border-4 border-emerald-700 text-emerald-800 px-4 py-1.5 font-mono text-2xl font-black tracking-widest bg-emerald-100/90 shadow-lg">
            ✓ APROBADO
          </div>
        )}
        {isRejected && (
          <div className="absolute top-6 right-6 pointer-events-none transform rotate-[12deg] border-4 border-red-700 text-red-800 px-4 py-1.5 font-mono text-2xl font-black tracking-widest bg-red-100/90 shadow-lg">
            ✕ RECHAZADO
          </div>
        )}

        {/* Encabezado del Expediente */}
        <div className="flex items-start justify-between border-b-2 border-[#bfa26e] pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#e6d8b5] border border-[#a8894d] flex items-center justify-center text-2xl shadow-inner">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-900 font-bold">{currentApplicant.dossierNumber}</span>
                <span className="text-[11px] bg-amber-200/70 text-amber-900 px-1.5 border border-amber-400">
                  {currentApplicant.requestType}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{currentApplicant.applicantName}</h2>
              <div className="text-xs text-slate-600 flex gap-2">
                <span>{currentApplicant.occupation}</span>
                <span>·</span>
                <span>{currentApplicant.city}</span>
                <span>·</span>
                <span>{currentApplicant.age} años</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Efectivo en Bóveda</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              L {vaultCash.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Datos Financieros & Buró de Crédito */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Ingresos & Gastos */}
          <div className="bg-white/80 p-2.5 border border-[#c9b48c] text-xs">
            <span className="font-bold text-slate-800 block mb-1">Capacidad Financiera</span>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600">Ingreso Mensual:</span>
                <span className="font-semibold text-emerald-700">L {currentApplicant.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Gastos Habituales:</span>
                <span className="text-slate-800">L {currentApplicant.monthlyExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Deudas Previas:</span>
                <span className="text-red-700">L {currentApplicant.existingDebts.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-bold">
                <span>Superávit Neto:</span>
                <span className="text-slate-900">
                  L {(currentApplicant.monthlyIncome - currentApplicant.monthlyExpenses - currentApplicant.existingDebts).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Historial Buró & CNBS */}
          <div className="bg-white/80 p-2.5 border border-[#c9b48c] text-xs">
            <span className="font-bold text-slate-800 block mb-1">Buró Equifax & CNBS</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Score Crediticio:</span>
                <span className={`font-mono font-bold px-1.5 py-0.2 border text-xs ${
                  currentApplicant.creditScore >= 700 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  currentApplicant.creditScore >= 600 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {currentApplicant.creditScore} / 850
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Categoría CNBS:</span>
                <span className="font-mono text-xs text-slate-800 font-semibold">{currentApplicant.cnbsCategory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Ratio DTI Estimado:</span>
                <span className={`font-mono font-bold ${
                  currentApplicant.riskEvaluation.dtiRatioPct > 45 ? 'text-red-600' : 'text-slate-800'
                }`}>
                  {currentApplicant.riskEvaluation.dtiRatioPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Evaluación de Riesgo del Banco */}
          <div className="bg-white/80 p-2.5 border border-[#c9b48c] text-xs">
            <span className="font-bold text-slate-800 block mb-1">Dictamen de Riesgo</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Riesgo de Pérdida:</span>
                <span className={`font-mono font-bold ${
                  currentApplicant.riskEvaluation.lossProbabilityPct > 30 ? 'text-red-600' :
                  currentApplicant.riskEvaluation.lossProbabilityPct > 15 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {currentApplicant.riskEvaluation.lossProbabilityPct}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Recomendación:</span>
                <span className={`font-bold uppercase text-[11px] ${
                  currentApplicant.riskEvaluation.recommendedDecision === 'aprobar' ? 'text-emerald-700' :
                  currentApplicant.riskEvaluation.recommendedDecision === 'revisar' ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {currentApplicant.riskEvaluation.recommendedDecision}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 italic truncate" title={currentApplicant.purpose}>
                {currentApplicant.purpose}
              </div>
            </div>
          </div>
        </div>

        {/* Ficha Patrimonial y Garantías Reales (Casas, Carros, Terrenos) */}
        <div className="bg-[#fff9eb] border-2 border-[#d0b47e] p-3 mb-3 text-xs">
          <div className="flex justify-between items-center border-b border-[#d0b47e] pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="text-base">🛡️</span>
              <span>Patrimonio Real & Bienes del Solicitante (Avalúos Certificados)</span>
            </div>
            <div className="font-mono text-[11px] text-amber-950">
              Valor Total Colateral: <strong>L {totalCollateral.toLocaleString()}</strong> 
              {currentApplicant.collateralCoveragePct > 0 && ` (${currentApplicant.collateralCoveragePct}% cobertura)`}
            </div>
          </div>

          {/* Listado de Bienes Inmuebles */}
          {currentApplicant.realEstateAssets && currentApplicant.realEstateAssets.length > 0 ? (
            <div className="space-y-1.5 mb-2">
              <span className="font-semibold text-slate-700 text-[11px] block">🏠 Bienes Inmuebles (Casas, Terrenos, Locales):</span>
              {currentApplicant.realEstateAssets.map((re, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-1.5 border border-amber-200 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900">{re.type}: </span>
                    <span className="text-slate-700">{re.description}</span>
                    <span className="text-slate-500"> ({re.location})</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800">
                    L {re.appraisedValue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-[11px] italic mb-2">
              Sin propiedades inmobiliarias registradas a su nombre.
            </div>
          )}

          {/* Listado de Vehículos */}
          {currentApplicant.vehicleAssets && currentApplicant.vehicleAssets.length > 0 ? (
            <div className="space-y-1.5 mb-2">
              <span className="font-semibold text-slate-700 text-[11px] block">🚗 Vehículos & Transporte:</span>
              {currentApplicant.vehicleAssets.map((veh, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-1.5 border border-amber-200 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900">{veh.makeModel}</span>
                    <span className="text-slate-600"> ({veh.year}) · Placa: {veh.plateNumber}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-900">
                    L {veh.commercialValue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-[11px] italic mb-2">
              Sin vehículos automotores registrados.
            </div>
          )}

          {/* Botones para Elevar Monto o Mejorar Tasa por Garantías */}
          {isPending && hasCollateral && (
            <div className="pt-2 border-t border-[#d0b47e] flex flex-wrap gap-2 items-center justify-between">
              <span className="text-[11px] text-amber-950 font-semibold">
                Opciones por Respaldo Patrimonial del Cliente:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBoostWithCollateral}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-500 text-[11px] flex items-center gap-1 shadow-sm"
                  title="Aumentar el monto del préstamo en base al valor de la casa o vehículo"
                >
                  <span>📈</span>
                  <span>Elevar Monto (+35% por Garantía)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDiscountRateWithCollateral}
                  className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold border border-blue-500 text-[11px] flex items-center gap-1 shadow-sm"
                  title="Ofrecer tasa de interés preferencial más baja por el menor riesgo de la garantía"
                >
                  <span>📉</span>
                  <span>Mejorar Tasa (-2.5% Preferencial)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ajustes de Condiciones por el Banquero */}
        {isPending && (
          <div className="bg-[#ece5ce] p-2.5 border border-[#bfa26e] text-xs mb-3">
            <span className="font-bold text-slate-800 block mb-1">Condiciones Finales del Préstamo a Visar</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 text-[11px] block">
                  Monto a Desembolsar (Lempiras): {bonusAmount > 0 && <span className="text-emerald-700 font-bold">(+L {bonusAmount.toLocaleString()} por garantía)</span>}
                </label>
                <input
                  type="number"
                  step="5000"
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-white border border-[#808080] px-2 py-1 font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-slate-700 text-[11px] block">
                  Tasa de Interés Anual (%): {rateDiscount > 0 && <span className="text-blue-700 font-bold">(-{rateDiscount}% descuento colateral)</span>}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustedRate}
                  onChange={(e) => setAdjustedRate(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-[#808080] px-2 py-1 font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de Sellos Táctiles estilo Bank 2000 */}
        {isPending ? (
          <div className="flex gap-4 pt-1">
            <button
              onClick={handleApproveClick}
              disabled={!hasVaultCash && currentApplicant.requestType !== 'Cuenta Corriente'}
              className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-sm uppercase tracking-wider border-t-2 border-l-2 border-emerald-400 border-b-2 border-r-2 border-emerald-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>📗</span>
              <span>ESTAMPA: APROBAR CRÉDITO</span>
            </button>

            <button
              onClick={handleRejectClick}
              className="flex-1 py-3 bg-red-800 hover:bg-red-900 active:bg-red-950 text-white font-black text-sm uppercase tracking-wider border-t-2 border-l-2 border-red-400 border-b-2 border-r-2 border-red-950 shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>📕</span>
              <span>ESTAMPA: RECHAZAR SOLICITUD</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-2 border-t border-[#c9b48c] text-xs">
            <span className="text-slate-600">
              Expediente ya sellado a las {currentApplicant.stampedAt}. 
              {isApproved && ` Desembolsados L ${currentApplicant.adjustedAmount?.toLocaleString()} al ${currentApplicant.adjustedRate}%.`}
            </span>
            <button
              disabled={currentIndex >= queue.length - 1}
              onClick={() => {
                sound.playClick();
                setCurrentIndex(prev => Math.min(queue.length - 1, prev + 1));
              }}
              className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-800"
            >
              Pasar al Siguiente Solicitante ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
