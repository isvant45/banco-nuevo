import React from 'react';
import { SarTaxAuditRecord } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface SarTaxAuditWindowProps {
  companyName: string;
  sarRecord: SarTaxAuditRecord;
  storeCash: number;
  storeBankBalance: number;
  currentYear: number;
  fiscalSolvenciaActive: boolean;
  onPayTax: () => void;
}

export const SarTaxAuditWindow: React.FC<SarTaxAuditWindowProps> = ({
  companyName,
  sarRecord,
  storeCash,
  storeBankBalance,
  currentYear,
  fiscalSolvenciaActive,
  onPayTax
}) => {
  const totalFunds = storeCash + storeBankBalance;
  const canAfford = totalFunds >= sarRecord.isrTaxAmount;

  const handlePay = () => {
    if (!canAfford) {
      sound.playRejectBuzzer();
      alert('Fondos insuficientes en banco y caja para liquidar el ISR ante el SAR.');
      return;
    }
    sound.playApprovalStamp();
    onPayTax();
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Encabezado Oficial SAR */}
      <div className="bg-[#003366] text-white p-2 border-b-2 border-[#808080] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-[#003366] font-black flex items-center justify-center text-sm border border-slate-300 shadow">
            SAR
          </div>
          <div>
            <h2 className="font-bold text-xs tracking-wider leading-tight">
              SERVICIO DE ADMINISTRACIÓN DE RENTAS (SAR) · REPÚBLICA DE HONDURAS
            </h2>
            <p className="text-[10px] text-sky-200">
              Sistema de Declaración Jurada Anual de Impuesto Sobre la Renta (ISR) & Solvencia Fiscal
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-[10px] bg-[#001f3f] px-2 py-1 border border-sky-600 block">
            RTN: 0501-1994-08241-8
          </span>
          <span className="text-[9px] text-sky-300">Régimen General de Personas Jurídicas</span>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-auto">
        {/* Formulario Contable Oficial de Liquidación */}
        <div className="md:col-span-8 bg-white border border-[#808080] p-3 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="border-b-2 border-slate-800 pb-1.5 mb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Declaración Jurada Anual de ISR — Ejercicio Fiscal {currentYear}
                </h3>
                <span className="text-[11px] text-slate-600">Contribuyente: <strong>{companyName}</strong></span>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 border border-slate-300 font-bold">
                FORMULARIO SAR-25
              </span>
            </div>

            {/* Cuadro de Liquidación Tributaria */}
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-left">
                  <th className="p-1.5 border border-slate-300 w-16 text-center">Casilla</th>
                  <th className="p-1.5 border border-slate-300">Concepto Contable Auditado</th>
                  <th className="p-1.5 border border-slate-300 text-right w-36">Monto en HNL</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500">101</td>
                  <td className="p-1.5 border border-slate-300 font-sans font-semibold">
                    Total Ingresos Brutos por Obras y Estimaciones Cobradas
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right font-bold text-blue-900">
                    L {sarRecord.grossRevenues.toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500">205</td>
                  <td className="p-1.5 border border-slate-300 font-sans">
                    (-) Costos Deducibles de Materiales de Construcción (Facturas con CAI)
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right text-rose-800">
                    -L {sarRecord.deductibleMaterialsExpenses.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500">210</td>
                  <td className="p-1.5 border border-slate-300 font-sans">
                    (-) Gastos Deducibles de Planilla Obrera y Sueldos Técnicos
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right text-rose-800">
                    -L {sarRecord.deductiblePayrollExpenses.toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500">220</td>
                  <td className="p-1.5 border border-slate-300 font-sans">
                    (-) Otros Gastos Operativos, Alquiler de Patio y Depreciación
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right text-rose-800">
                    -L {sarRecord.deductibleOtherCosts.toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-amber-50 font-bold">
                  <td className="p-1.5 border border-slate-300 text-center text-amber-900">300</td>
                  <td className="p-1.5 border border-slate-300 font-sans text-amber-900">
                    (=) RENTA NETA GRAVABLE (Base Imponible del Impuesto)
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right text-amber-950">
                    L {sarRecord.netTaxableIncome.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500">350</td>
                  <td className="p-1.5 border border-slate-300 font-sans">
                    (x) Tarifa Legal del Impuesto Sobre la Renta (Ley Tributaria de Honduras)
                  </td>
                  <td className="p-1.5 border border-slate-300 text-right font-bold text-slate-700">
                    {sarRecord.taxRatePct}.00%
                  </td>
                </tr>

                <tr className="bg-blue-50 font-bold text-xs">
                  <td className="p-2 border border-slate-300 text-center text-blue-900">401</td>
                  <td className="p-2 border border-slate-300 font-sans text-blue-950">
                    (=) IMPUESTO SOBRE LA RENTA DETERMINADO A PAGAR (ISR)
                  </td>
                  <td className="p-2 border border-slate-300 text-right text-blue-950 text-sm">
                    L {sarRecord.isrTaxAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Dictamen de Auditoría Oficial SAR */}
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-300 space-y-1">
              <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                <span>📋</span>
                <span>DICTAMEN Y NOTAS OFICIALES DE AUDITORÍA SAR:</span>
              </div>
              <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                {sarRecord.auditNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botón de Pago de Liquidación */}
          <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between">
            <div className="text-[11px]">
              <span className="text-slate-500">Fondos disponibles para pago: </span>
              <span className="font-mono font-bold text-slate-900">L {totalFunds.toLocaleString()}</span>
            </div>

            <button
              onClick={handlePay}
              disabled={sarRecord.isPaid || !canAfford}
              className={`px-6 py-2 font-bold text-xs border-t border-l border-white border-b-2 border-r-2 shadow flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                sarRecord.isPaid 
                  ? 'bg-slate-300 text-slate-600 border-slate-400' 
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-950'
              }`}
            >
              <span>🏛️</span>
              <span>{sarRecord.isPaid ? '✓ ISR LIQUIDADO Y PAGADO' : 'PRESENTAR Y PAGAR ISR AL SAR'}</span>
            </button>
          </div>
        </div>

        {/* Certificado Oficial de Solvencia Fiscal SAR */}
        <div className="md:col-span-4 bg-[#f0f0f0] border border-[#808080] p-2 flex flex-col justify-between">
          <div className="bg-white border-2 border-dashed border-[#003366] p-3 text-center space-y-2 relative shadow-sm">
            {/* Sello de Solvencia */}
            <div className={`inline-block px-3 py-1 font-black text-xs border-2 tracking-widest ${
              fiscalSolvenciaActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                : 'bg-rose-50 text-rose-800 border-rose-600'
            }`}>
              {fiscalSolvenciaActive ? 'SOLVENCIA FISCAL SAR: VIGENTE' : 'SOLVENCIA SAR: NO VIGENTE'}
            </div>

            <div className="text-xl">🏛️</div>

            <h4 className="font-bold text-xs text-slate-900 leading-tight">
              CONSTANCIA DE SOLVENCIA FISCAL
            </h4>
            <p className="text-[10px] text-slate-600">
              Emitida de conformidad con el Código Tributario de la República de Honduras.
            </p>

            <div className="text-left text-[10px] bg-slate-50 p-2 border border-slate-200 font-mono space-y-1">
              <div><strong>EMPRESA:</strong> {companyName}</div>
              <div><strong>ESTADO:</strong> {fiscalSolvenciaActive ? 'AL DÍA CON OBLIGACIONES' : 'OBLIGACIÓN PENDIENTE'}</div>
              <div><strong>VIGENCIA:</strong> Ejercicio {sarRecord.solvenciaExpirationYear}</div>
              <div><strong>AUTORIZACIÓN:</strong> Habilitado para Licitaciones Públicas y Obras Estatales</div>
            </div>

            <div className="text-[9px] text-slate-400 italic">
              Este documento electrónico cuenta con firma digital y plena validez legal ante SEFIN, SIT y Alcaldías Municipales.
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-500 bg-white p-2 border border-[#808080]">
            💡 <strong>Regla de Negocio:</strong> Las instituciones del gobierno (SIT, SEFIN, Municipalidades) exigen por Ley tener la Solvencia Fiscal del SAR vigente para poder adjudicarte cualquier obra pública de infraestructura.
          </div>
        </div>
      </div>
    </div>
  );
};
