import React, { useState } from 'react';
import { GameState, PosMerchant } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Store, 
  CreditCard, 
  Smartphone, 
  Plus, 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Building 
} from 'lucide-react';

interface PosAcquiringViewProps {
  state: GameState;
  onGrantMerchantLoan: (merchantId: string, loanAmount: number) => void;
  onGrantMerchantCard: (merchantId: string) => void;
  onAffiliateNewMerchant: (merchantName: string, category: PosMerchant['businessCategory'], city: string) => void;
  onUpdateMerchantFee: (merchantId: string, newFeePct: number) => void;
}

export const PosAcquiringView: React.FC<PosAcquiringViewProps> = ({
  state,
  onGrantMerchantLoan,
  onGrantMerchantCard,
  onAffiliateNewMerchant,
  onUpdateMerchantFee
}) => {
  const [showAffiliateModal, setShowAffiliateModal] = useState<boolean>(false);
  const [newMerchantName, setNewMerchantName] = useState<string>('Repuestos El Halcón S. de R.L.');
  const [newCategory, setNewCategory] = useState<PosMerchant['businessCategory']>('Taller & Repuestos');
  const [newCity, setNewCity] = useState<string>('San Pedro Sula');

  const totalMonthlySales = state.posMerchants.reduce((acc, m) => acc + m.monthlySalesVolumeHNL, 0);
  const totalPhysicalPos = state.posMerchants.reduce((acc, m) => acc + m.physicalPosCount, 0);
  const totalVirtualPos = state.posMerchants.reduce((acc, m) => acc + m.virtualPosCount, 0);

  // Ordenar comercios por volumen de ventas (ranking)
  const rankedMerchants = [...state.posMerchants].sort((a, b) => b.monthlySalesVolumeHNL - a.monthlySalesVolumeHNL);

  const handleGrantLoan = (merchant: PosMerchant) => {
    const loanAmount = Math.round(merchant.monthlySalesVolumeHNL * 0.4); // 40% de facturación mensual
    sound.playApprovalStamp();
    onGrantMerchantLoan(merchant.id, loanAmount);
  };

  const handleGrantCard = (merchant: PosMerchant) => {
    sound.playCashChime();
    onGrantMerchantCard(merchant.id);
  };

  const handleAffiliateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    onAffiliateNewMerchant(newMerchantName, newCategory, newCity);
    setShowAffiliateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Métricas de Adquirencia Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>FACTURACIÓN PROCESADA</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
            {formatHNL(totalMonthlySales)}
          </div>
          <div className="text-xs text-slate-400">
            Comisión promedio: <span className="text-white font-mono font-semibold">2.3% por transacción</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>PARQUE DE TERMINALES</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {totalPhysicalPos + totalVirtualPos} Terminales
          </div>
          <div className="text-xs text-slate-400">
            Físicos: <span className="text-blue-300 font-mono font-semibold">{totalPhysicalPos}</span> · Virtuales: <span className="text-amber-300 font-mono font-semibold">{totalVirtualPos}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>COMERCIOS AFILIADOS</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mb-1">
            {state.posMerchants.length} Comercios
          </div>
          <div className="text-xs text-slate-400">
            Comercios con Tap to Pay: <span className="text-emerald-400 font-semibold">{state.posMerchants.filter(m => m.hasTapToPay).length} activos</span>
          </div>
        </div>
      </div>

      {/* 2. Ranking de Comercios Afiliados y Otorgamiento de Crédito */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Ranking de Facturación Comercial & Adquirencia PYME
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifica qué comercios venden más y tienen mayor saldo en cuenta para otorgarles créditos de capital de trabajo y tarjetas empresariales preaprobadas.
            </p>
          </div>

          <button
            onClick={() => setShowAffiliateModal(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Afiliar Nuevo Comercio</span>
          </button>
        </div>

        {/* Tabla de Comercios Afiliados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Ranking / Comercio</th>
                <th className="py-2.5 px-3">Categoría y Ciudad</th>
                <th className="py-2.5 px-3 text-center">Terminales</th>
                <th className="py-2.5 px-3 text-right">Facturación Mes (L.)</th>
                <th className="py-2.5 px-3 text-right">Saldo en Cuenta (L.)</th>
                <th className="py-2.5 px-3 text-center">Comisión POS</th>
                <th className="py-2.5 px-3 text-right">Productos y Financiación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rankedMerchants.map((merchant, idx) => {
                return (
                  <tr key={merchant.id} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[10px] font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">{merchant.merchantName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{merchant.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <span className="text-slate-300 block">{merchant.businessCategory}</span>
                      <span className="text-[10px] text-slate-400">{merchant.city}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-2 text-[11px]">
                        <span className="text-slate-300" title="Terminales físicos">{merchant.physicalPosCount} POS</span>
                        {merchant.hasTapToPay && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                            Tap to Pay
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatHNL(merchant.monthlySalesVolumeHNL)}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-200">
                      {formatHNL(merchant.bankAccountBalanceHNL)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-amber-300 font-bold">{formatPct(merchant.transactionFeePct)}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        {merchant.hasCommercialLoan ? (
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Crédito: {formatHNL(merchant.commercialLoanAmount)}
                          </span>
                        ) : merchant.creditEligible ? (
                          <button
                            onClick={() => handleGrantLoan(merchant)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                          >
                            Otorgar Crédito
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Volumen insuficiente</span>
                        )}

                        {!merchant.hasBusinessCard ? (
                          <button
                            onClick={() => handleGrantCard(merchant)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium border border-slate-700 transition-colors"
                          >
                            + Tarjeta Visa
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Visa Corp activa</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Afiliar Nuevo Comercio */}
      {showAffiliateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Afiliar Comercio a Red de POS Áureo
              </h3>
              <button
                onClick={() => setShowAffiliateModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAffiliateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nombre Comercial de la Empresa:</label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={e => setNewMerchantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Categoría de Negocio:</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2"
                >
                  <option value="Supermercado & Abarrotería">Supermercado & Abarrotería</option>
                  <option value="Restaurante & Café">Restaurante & Café</option>
                  <option value="Ferretería & Construcción">Ferretería & Construcción</option>
                  <option value="Farmacia & Salud">Farmacia & Salud</option>
                  <option value="Tienda Retail & Moda">Tienda Retail & Moda</option>
                  <option value="Taller & Repuestos">Taller & Repuestos</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Ciudad:</label>
                <select
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2"
                >
                  <option value="San Pedro Sula">San Pedro Sula</option>
                  <option value="Tegucigalpa">Tegucigalpa</option>
                  <option value="Choloma">Choloma</option>
                  <option value="La Ceiba">La Ceiba</option>
                  <option value="Roatán">Roatán</option>
                  <option value="Comayagua">Comayagua</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAffiliateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Afiliar e Instalar POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
