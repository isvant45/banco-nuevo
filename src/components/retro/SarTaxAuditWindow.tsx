import React, { useState } from 'react';
import { 
  DailySimulationState, 
  SarFiscalPeriodRecord 
} from '../../game/retroSimTypes';
import { CustomAmountInput, formatHNLAmount } from '../common/CustomAmountInput';
import { sound } from '../../game/audioFx';
import { 
  getOrCreateCurrentFiscalPeriod, 
  fileSarDeclaration, 
  paySarTaxObligation, 
  requestSarSolvenciaCertificate 
} from '../../game/sarFiscalEngine';

interface SarTaxAuditWindowProps {
  companyName: string;
  sarRecord: any;
  storeCash: number;
  storeBankBalance: number;
  currentYear: number;
  fiscalSolvenciaActive: boolean;
  state: DailySimulationState;
  onUpdateState: (nextState: DailySimulationState) => void;
  onPayTax?: () => void;
}

export const SarTaxAuditWindow: React.FC<SarTaxAuditWindowProps> = ({
  companyName,
  storeCash,
  storeBankBalance,
  currentYear,
  fiscalSolvenciaActive,
  state,
  onUpdateState
}) => {
  const [activeTab, setActiveTab] = useState<'declaracion' | 'pago' | 'solvencia' | 'historial'>('declaracion');
  const [payAccountSource, setPayAccountSource] = useState<'checking' | 'cash'>('checking');
  
  const currentPeriod = getOrCreateCurrentFiscalPeriod(state);
  const remainingTaxDebt = currentPeriod.isPaid ? 0 : Math.max(0, currentPeriod.calculatedTaxAmount - (currentPeriod.paidAmountHNL || 0));
  const [payAmount, setPayAmount] = useState<number>(remainingTaxDebt);

  const availableFunds = payAccountSource === 'checking' ? storeBankBalance : storeCash;

  const handleFileDeclaration = () => {
    sound.playApprovalStamp();
    const res = fileSarDeclaration(state, currentYear);
    onUpdateState(res.updatedState);
    alert(res.message);
  };

  const handlePayTax = () => {
    if (payAmount <= 0) {
      alert('Ingresa un monto válido para pagar.');
      return;
    }
    sound.playApprovalStamp();
    const res = paySarTaxObligation(state, payAmount, payAccountSource);
    if (res.success) {
      onUpdateState(res.updatedState);
      alert(res.message);
      // Actualizar monto sugerido restante
      const updatedRemaining = Math.max(0, remainingTaxDebt - payAmount);
      setPayAmount(updatedRemaining);
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handleRequestSolvencia = () => {
    sound.playClick();
    const res = requestSarSolvenciaCertificate(state);
    if (res.success) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      alert(res.message);
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const allPeriods: SarFiscalPeriodRecord[] = state.fiscalPeriods && state.fiscalPeriods.length > 0 
    ? state.fiscalPeriods 
    : [currentPeriod];

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Pestañas de Navegación del SAR */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => { sound.playClick(); setActiveTab('declaracion'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
            activeTab === 'declaracion'
              ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>📝</span>
          <span>Formulario SAR-25 (ISR)</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('pago'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
            activeTab === 'pago'
              ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>💳</span>
          <span>Liquidación & Pagos</span>
          {remainingTaxDebt > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 rounded-full">
              Adeudo
            </span>
          )}
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('solvencia'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
            activeTab === 'solvencia'
              ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>🛡️</span>
          <span>Solvencia Fiscal</span>
          {fiscalSolvenciaActive && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 rounded-full">
              Vigente
            </span>
          )}
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('historial'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
            activeTab === 'historial'
              ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
          }`}
        >
          <span>📜</span>
          <span>Historial de Ejercicios</span>
        </button>
      </div>

      {/* Contenido de la Ventana */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* TAB 1: FORMULARIO SAR-25 */}
        {activeTab === 'declaracion' && (
          <div className="space-y-3 max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner">
            <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-start">
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase">
                  SERVICIO DE ADMINISTRACIÓN DE RENTAS (SAR)
                </h3>
                <p className="text-[11px] text-slate-600">
                  Formulario SAR-25: Declaración Jurada Anual de Impuesto Sobre la Renta (ISR)
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold bg-slate-100 border px-2 py-0.5">
                  Ejercicio {currentYear}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-2.5 space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-600">Contribuyente / Razón Social:</span>
                <span className="font-bold text-slate-900">{companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-600">RTN Registrado:</span>
                <span className="font-mono font-bold text-slate-800">08011990123456</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-600">Régimen Tributario:</span>
                <span className="font-bold text-blue-900">Régimen General de Sociedades Mercantiles</span>
              </div>
            </div>

            {/* Base Imponible e Impuesto */}
            <div className="border border-slate-300 p-3 bg-white space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-700">1. Ingresos Brutos Anuales:</span>
                <span className="font-mono font-bold text-slate-900">{formatHNLAmount(currentPeriod.grossRevenueHNL)}</span>
              </div>
              <div className="flex justify-between py-1 border-b text-slate-600">
                <span>2. Deducciones, Costos y Gastos Admitidos (65%):</span>
                <span className="font-mono font-bold text-rose-800">-{formatHNLAmount(currentPeriod.allowableDeductionsHNL)}</span>
              </div>
              <div className="flex justify-between py-1 border-b font-bold bg-slate-50 px-1">
                <span className="text-slate-900">3. Renta Neta Gravable:</span>
                <span className="font-mono text-slate-950">{formatHNLAmount(currentPeriod.taxableNetIncomeHNL)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span>4. Tasa Legal de ISR:</span>
                <span className="font-mono font-bold">25.0%</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-black bg-rose-50 border border-rose-300 px-2 text-rose-950">
                <span>5. TOTAL IMPUESTO DETERMINADO:</span>
                <span className="font-mono text-rose-900">{formatHNLAmount(currentPeriod.calculatedTaxAmount)}</span>
              </div>
            </div>

            {/* Estado de Presentación */}
            <div className="p-2.5 border rounded-xs flex items-center justify-between text-xs bg-slate-50">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estado de Declaración:</span>
                {currentPeriod.isDeclared ? (
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    ✓ Declaración Oficial Presentada ({currentPeriod.declarationFormNumber})
                  </span>
                ) : (
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    ⏱️ Declaración Pendiente de Presentación
                  </span>
                )}
              </div>

              {!currentPeriod.isDeclared ? (
                <button
                  onClick={handleFileDeclaration}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 shadow-sm cursor-pointer active:scale-95"
                >
                  Presentar Formulario SAR-25 📝
                </button>
              ) : (
                <button
                  onClick={() => alert(`Copia de Formulario ${currentPeriod.declarationFormNumber} generada en el registro de auditoría.`)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Imprimir Copia 🖨️
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 italic bg-amber-50 p-2 border border-amber-200">
              Aviso legal: Presentar la declaración jurada registra formalmente su obligación tributaria ante el SAR. No debita fondos hasta que realice el pago correspondiente.
            </p>
          </div>
        )}

        {/* TAB 2: PAGO DE IMPUESTOS CON CUSTOM AMOUNT INPUT */}
        {activeTab === 'pago' && (
          <div className="space-y-4 max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner">
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-black text-sm text-slate-900 uppercase">
                LIQUIDACIÓN Y PAGO DEL IMPUESTO SOBRE LA RENTA
              </h3>
              <p className="text-[11px] text-slate-600">
                Paga de forma flexible el total o abona parcialmente a tu obligación fiscal pendiente.
              </p>
            </div>

            {/* Resumen del Estado Tributario */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 border border-slate-300">
                <span className="text-slate-500 block text-[10px]">Impuesto Determinado:</span>
                <span className="font-mono font-bold text-slate-900">{formatHNLAmount(currentPeriod.calculatedTaxAmount)}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-300">
                <span className="text-slate-500 block text-[10px]">Total Pagado:</span>
                <span className="font-mono font-bold text-emerald-800">{formatHNLAmount(currentPeriod.paidAmountHNL)}</span>
              </div>
              <div className="p-2 bg-rose-50 border border-rose-300">
                <span className="text-rose-700 block text-[10px] font-bold">Saldo Pendiente:</span>
                <span className="font-mono font-black text-rose-900">{formatHNLAmount(remainingTaxDebt)}</span>
              </div>
            </div>

            {remainingTaxDebt <= 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-center space-y-1">
                <div className="text-2xl">🎉</div>
                <h4 className="font-black text-sm">¡Obligación Fiscal Totalmente Cancelada!</h4>
                <p className="text-xs">
                  Tu empresa no mantiene deudas tributarias pendientes para el ejercicio {currentYear}. Puedes solicitar tu Solvencia Fiscal.
                </p>
                <button
                  onClick={() => { sound.playClick(); setActiveTab('solvencia'); }}
                  className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-900 cursor-pointer shadow-sm"
                >
                  Ir a Solvencia Fiscal ➔
                </button>
              </div>
            ) : (
              <div className="space-y-3 border border-slate-300 p-3 bg-slate-50">
                {/* Selector de cuenta de origen */}
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1">
                    Seleccionar Cuenta de Origen del Pago:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayAccountSource('checking')}
                      className={`p-2 border text-left cursor-pointer ${
                        payAccountSource === 'checking'
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                          : 'bg-white border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-slate-900 block">Cuenta Corriente Bancaria</span>
                      <span className="text-[11px] text-slate-600">
                        Saldo: <strong>{formatHNLAmount(storeBankBalance)}</strong>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayAccountSource('cash')}
                      className={`p-2 border text-left cursor-pointer ${
                        payAccountSource === 'cash'
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                          : 'bg-white border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-slate-900 block">Caja Chica en Efectivo</span>
                      <span className="text-[11px] text-slate-600">
                        Saldo: <strong>{formatHNLAmount(storeCash)}</strong>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Entrada de Monto Personalizado con CustomAmountInput */}
                <CustomAmountInput
                  label="Monto a Pagar al SAR (HNL):"
                  value={payAmount}
                  onChange={setPayAmount}
                  availableBalance={availableFunds}
                  maxAllowed={remainingTaxDebt}
                  minAllowed={1}
                  operationType="pago_cuota"
                  helpText={`Puedes pagar la totalidad del impuesto (${formatHNLAmount(remainingTaxDebt)}) o realizar un abono parcial.`}
                />

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setPayAmount(remainingTaxDebt)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                  >
                    Pagar Saldo Completo
                  </button>

                  <button
                    onClick={handlePayTax}
                    disabled={payAmount <= 0 || payAmount > availableFunds}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                  >
                    Confirmar Pago de Impuesto 💳
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOLVENCIA FISCAL (ESTRICTA) */}
        {activeTab === 'solvencia' && (
          <div className="space-y-4 max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner">
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-black text-sm text-slate-900 uppercase">
                CONSTANCIA DE SOLVENCIA FISCAL
              </h3>
              <p className="text-[11px] text-slate-600">
                Documento extendido por el SAR que acredita que el contribuyente no tiene deudas tributarias firmes o vencidas.
              </p>
            </div>

            {/* Lista de Requisitos para Obtener Solvencia */}
            <div className="border border-slate-300 p-3 bg-slate-50 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-tight text-[11px]">
                REQUISITOS OBLIGATORIOS SEGÚN CÓDIGO TRIBUTARIO:
              </h4>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={currentPeriod.isDeclared ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                    {currentPeriod.isDeclared ? '✓' : '✗'}
                  </span>
                  <span className={currentPeriod.isDeclared ? 'text-slate-800' : 'text-rose-800 font-bold'}>
                    1. Declaración Jurada Formulario SAR-25 presentada formalmente.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={currentPeriod.isPaid ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                    {currentPeriod.isPaid ? '✓' : '✗'}
                  </span>
                  <span className={currentPeriod.isPaid ? 'text-slate-800' : 'text-rose-800 font-bold'}>
                    2. Saldo tributario del ejercicio cancelado al 100% (Saldo: {formatHNLAmount(remainingTaxDebt)}).
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span className="text-slate-800">
                    3. Sin multas por mora, requerimientos o sanciones pendientes.
                  </span>
                </div>
              </div>
            </div>

            {/* Certificado Renderizado Oficial si está Solvente */}
            {currentPeriod.solvenciaIssued && currentPeriod.isPaid ? (
              <div className="relative border-4 border-double border-slate-800 p-4 bg-amber-50/20 text-slate-900 space-y-2">
                {/* Marca de agua legal obligatoria */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-25deg]">
                  <span className="text-4xl font-black font-mono text-slate-900 border-4 border-slate-900 p-2">
                    SIMULACIÓN — SIN VALIDEZ OFICIAL
                  </span>
                </div>

                <div className="text-center border-b pb-2 space-y-0.5">
                  <span className="text-xs font-black tracking-widest block text-slate-800">REPÚBLICA DE HONDURAS</span>
                  <span className="text-sm font-black block text-blue-950">SERVICIO DE ADMINISTRACIÓN DE RENTAS (SAR)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 inline-block rounded">
                    CERTIFICADO OFICIAL DE SOLVENCIA FISCAL
                  </span>
                </div>

                <div className="text-xs space-y-1.5 py-2">
                  <p>
                    El Servicio de Administración de Rentas (SAR) <strong>HACE CONSTAR</strong> que:
                  </p>
                  <p className="font-bold text-center text-sm py-1 bg-white border border-slate-300">
                    {companyName} (RTN: 08011990123456)
                  </p>
                  <p className="text-justify text-[11px] leading-relaxed">
                    A la fecha de emisión del presente documento se encuentra al corriente de sus obligaciones tributarias correspondientes al Ejercicio Fiscal {currentYear}. Ha presentado su Formulario SAR-25 No. {currentPeriod.declarationFormNumber} y liquidado el importe tributario de {formatHNLAmount(currentPeriod.calculatedTaxAmount)} mediante boleta No. {currentPeriod.paymentReceiptNumber}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-2 text-[10px] bg-slate-50 p-2">
                  <div>
                    <span className="text-slate-500 block">Número de Certificado:</span>
                    <span className="font-mono font-bold text-slate-900">{currentPeriod.solvenciaNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vigencia Oficial:</span>
                    <span className="font-bold text-emerald-800">{currentPeriod.solvenciaExpiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
                  SIMULACIÓN — SIN VALIDEZ OFICIAL · CONTROL FINANCIERO ÁUREO BANK
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-400 space-y-2 bg-slate-50">
                <p className="text-xs text-slate-600">
                  {currentPeriod.isDeclared && currentPeriod.isPaid
                    ? 'Cumples con todos los requisitos para tramitar tu Constancia de Solvencia Fiscal.'
                    : 'Debes presentar la declaración SAR-25 y liquidar el saldo del impuesto para poder emitir tu Solvencia Fiscal.'}
                </p>

                <button
                  onClick={handleRequestSolvencia}
                  disabled={!currentPeriod.isDeclared || !currentPeriod.isPaid}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs border border-emerald-950 cursor-pointer shadow-sm active:scale-95"
                >
                  Solicitar Constancia de Solvencia Fiscal 🛡️
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTORIAL DE EJERCICIOS */}
        {activeTab === 'historial' && (
          <div className="space-y-3 max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner">
            <h3 className="font-black text-sm text-slate-900 uppercase border-b pb-1">
              HISTORIAL TRIBUTARIO Y ARCHIVO DE CONSTANCIAS
            </h3>

            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase text-slate-700 font-bold">
                  <tr>
                    <th className="p-2">Ejercicio</th>
                    <th className="p-2">Declaración</th>
                    <th className="p-2">Impuesto</th>
                    <th className="p-2">Pagado</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Solvencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allPeriods.map((p) => (
                    <tr key={p.fiscalYear} className="hover:bg-slate-50">
                      <td className="p-2 font-bold font-mono">{p.fiscalYear}</td>
                      <td className="p-2 text-[11px]">
                        {p.isDeclared ? (
                          <span className="text-blue-900 font-mono">{p.declarationFormNumber}</span>
                        ) : (
                          <span className="text-amber-800">Pendiente</span>
                        )}
                      </td>
                      <td className="p-2 font-mono">{formatHNLAmount(p.calculatedTaxAmount)}</td>
                      <td className="p-2 font-mono text-emerald-800">{formatHNLAmount(p.paidAmountHNL)}</td>
                      <td className="p-2">
                        {p.isPaid ? (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-xs text-[10px]">
                            Pagado
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 font-bold rounded-xs text-[10px]">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-[11px]">
                        {p.solvenciaIssued ? (
                          <span className="font-bold text-emerald-800">Emitida ({p.solvenciaNumber})</span>
                        ) : (
                          <span className="text-slate-400">Sin emitir</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
