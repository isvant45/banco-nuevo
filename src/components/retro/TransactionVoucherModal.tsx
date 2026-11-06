import React from 'react';
import { TransactionVoucher } from '../../game/retroSimTypes';
import { formatHNLAmount } from '../common/CustomAmountInput';

interface TransactionVoucherModalProps {
  voucher: TransactionVoucher;
  companyName: string;
  onClose: () => void;
}

export const TransactionVoucherModal: React.FC<TransactionVoucherModalProps> = ({
  voucher,
  companyName,
  onClose
}) => {
  const getTitle = () => {
    switch (voucher.operationType) {
      case 'desembolso_prestamo':
        return 'COMPROBANTE OFICIAL DE DESEMBOLSO DE CRÉDITO';
      case 'pago_cuota':
        return 'RECIBO OFICIAL DE PAGO DE CUOTA BANCARIA';
      case 'pago_parcial':
        return 'RECIBO DE PAGO PARCIAL DE OBLIGACIÓN';
      case 'abono_capital':
        return 'COMPROBANTE DE AMORTIZACIÓN EXTRAORDINARIA A CAPITAL';
      case 'cancelacion_total':
        return 'CERTIFICADO DE FINIQUITO Y CANCELACIÓN TOTAL DE DEUDA';
      case 'retiro_caja':
        return 'COMPROBANTE DE RETIRO DE FONDOS A CAJA CHICA';
      case 'deposito_cuenta':
        return 'COMPROBANTE DE DEPÓSITO EN CUENTA BANCARIA';
      case 'transferencia_cuentas':
        return 'COMPROBANTE DE TRANSFERENCIA ENTRE CUENTAS PROPIAS';
      case 'pago_impuesto_sar':
        return 'BOLETA OFICIAL DE PAGO DE TRIBUTOS SAR-HONDURAS';
      case 'liberacion_garantia':
        return 'ACTA NOTARIAL DE CANCELACIÓN DE GRAVAMEN Y LIBERACIÓN';
      default:
        return 'COMPROBANTE DE OPERACIÓN FINANCIERA';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in">
      <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-lg w-full text-slate-900 font-sans p-1">
        {/* Barra de título retro */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span>📑</span>
            <span>{getTitle()}</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Recibo */}
        <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
          {/* Encabezado Institucional */}
          <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-start">
            <div>
              <h3 className="font-black text-sm text-slate-900 tracking-tight">SISTEMA BANCARIO NACIONAL DE HONDURAS</h3>
              <p className="text-[10px] text-slate-600 font-mono">Comprobante Fiscal Electrónico Homologado por CNBS & SAR</p>
              <p className="text-[11px] font-bold text-blue-900 mt-0.5">{voucher.title}</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                No. {voucher.voucherNumber}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">{voucher.timestamp}</p>
            </div>
          </div>

          {/* Información del Titular y Cuentas */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Titular / Razón Social:</span>
              <span className="font-bold text-slate-900">{companyName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Código de Operación:</span>
              <span className="font-mono font-bold text-slate-800">{voucher.referenceCode}</span>
            </div>

            {voucher.accountNumber && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cuenta Débito / Origen:</span>
                <span className="font-mono text-slate-900">{voucher.accountNumber}</span>
              </div>
            )}

            {voucher.destinationAccountNumber && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cuenta Crédito / Destino:</span>
                <span className="font-mono text-emerald-900 font-bold">{voucher.destinationAccountNumber}</span>
              </div>
            )}
          </div>

          {/* Desglose Monetario: Monto Aprobado, Deducciones y Desembolso Neto */}
          <div className="space-y-1.5 border border-slate-300 p-2.5 bg-white">
            <div className="flex justify-between text-xs py-0.5 border-b border-dashed border-slate-200">
              <span className="text-slate-600 font-medium">Monto Bruto / Aprobado:</span>
              <span className="font-mono font-bold text-slate-900">{formatHNLAmount(voucher.grossAmountHNL)}</span>
            </div>

            {voucher.deductionsHNL > 0 && (
              <div className="flex justify-between text-xs py-0.5 text-rose-700 border-b border-dashed border-slate-200">
                <span className="flex items-center gap-1">
                  <span>(-) Deducciones & Comisiones de Apertura (1.5%):</span>
                </span>
                <span className="font-mono font-bold">-{formatHNLAmount(voucher.deductionsHNL)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm py-1 font-black bg-blue-50/60 px-1 border border-blue-200 text-blue-950">
              <span>{voucher.operationType === 'desembolso_prestamo' ? 'DESEMBOLSO NETO ACREDITADO:' : 'IMPORTE NETO APLICADO:'}</span>
              <span className="font-mono text-emerald-700">{formatHNLAmount(voucher.netDisbursedOrPaidHNL)}</span>
            </div>
          </div>

          {/* Reglas de Prelación y Distribución BCH en Pagos de Préstamo */}
          {voucher.distributionBreakdown && (
            <div className="bg-amber-50/70 border border-amber-300 p-2 text-[10px] space-y-1">
              <span className="font-bold text-amber-950 block">DISTRIBUCIÓN LEGAL DE FONDOS (ORDEN DE PRELACIÓN CNBS):</span>
              <div className="grid grid-cols-3 gap-1 pt-0.5 text-center font-mono">
                <div className="p-1 bg-white border border-amber-200">
                  <span className="text-slate-500 block text-[9px]">1. Cargos & Mora</span>
                  <span className="font-bold text-rose-700">{formatHNLAmount(voucher.distributionBreakdown.cargosMora)}</span>
                </div>
                <div className="p-1 bg-white border border-amber-200">
                  <span className="text-slate-500 block text-[9px]">2. Intereses</span>
                  <span className="font-bold text-amber-900">{formatHNLAmount(voucher.distributionBreakdown.interesesDevengados)}</span>
                </div>
                <div className="p-1 bg-white border border-amber-200">
                  <span className="text-slate-500 block text-[9px]">3. Capital</span>
                  <span className="font-bold text-emerald-800">{formatHNLAmount(voucher.distributionBreakdown.amortizacionCapital)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 italic mt-0.5">
                Regla aplicada: {voucher.distributionBreakdown.reglaAplicada}
              </p>
            </div>
          )}

          {/* Saldos Anteriores y Nuevos */}
          <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-300 p-2 bg-slate-50">
            <div>
              <span className="text-slate-500 block text-[10px]">Saldo Cuenta Anterior:</span>
              <span className="font-mono font-semibold text-slate-800">{formatHNLAmount(voucher.priorBalanceHNL)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Nuevo Saldo en Cuenta:</span>
              <span className="font-mono font-bold text-blue-900">{formatHNLAmount(voucher.newBalanceHNL)}</span>
            </div>

            {voucher.loanBalancePriorHNL !== undefined && voucher.loanBalanceNewHNL !== undefined && (
              <>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Deuda Anterior:</span>
                  <span className="font-mono font-semibold text-rose-800">{formatHNLAmount(voucher.loanBalancePriorHNL)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Saldo Deuda Restante:</span>
                  <span className="font-mono font-bold text-emerald-800">{formatHNLAmount(voucher.loanBalanceNewHNL)}</span>
                </div>
              </>
            )}
          </div>

          {/* Garantías Liberadas */}
          {voucher.releasedCollaterals && voucher.releasedCollaterals.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-300 p-1.5 text-[11px] text-emerald-950 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>
                <strong>Garantía liberada con éxito:</strong> {voucher.releasedCollaterals.join(', ')}. El bien queda libre de todo gravamen.
              </span>
            </div>
          )}

          {/* Pie de Firma y Sello */}
          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-slate-500">
            <div>
              <span>Sello Digital: </span>
              <span className="font-mono font-bold text-slate-700">{voucher.authStamp}</span>
            </div>
            <button
              onClick={() => {
                alert(`Comprobante No. ${voucher.voucherNumber} descargado a la bitácora del juego.`);
              }}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-slate-800 cursor-pointer"
            >
              Imprimir / Guardar 🖨️
            </button>
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="p-2 flex justify-end bg-[#c0c0c0]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
          >
            Aceptar y Continuar ➔
          </button>
        </div>
      </div>
    </div>
  );
};
