import React, { useState } from 'react';
import { SmartBankFacility } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface SmartBankEnterpriseWindowProps {
  offers: SmartBankFacility[];
  monthlySales: number;
  storeCash: number;
  creditRating: string;
  onAcceptFacility: (facilityId: string) => void;
  onRepayFacility: (facilityId: string, amount: number) => void;
}

export const SmartBankEnterpriseWindow: React.FC<SmartBankEnterpriseWindowProps> = ({
  offers,
  monthlySales,
  storeCash,
  creditRating,
  onAcceptFacility,
  onRepayFacility
}) => {
  const [repayAmount, setRepayAmount] = useState<Record<string, number>>({});

  const activeFacilities = offers.filter(o => o.status === 'activo');
  const availableOffers = offers.filter(o => o.status === 'disponible');

  const handleRepay = (facilityId: string) => {
    const offer = offers.find(o => o.id === facilityId);
    if (!offer) return;
    const amount = repayAmount[facilityId] || offer.monthlyPayment;

    if (storeCash < amount) {
      sound.playRejectBuzzer();
      alert(`Fondos insuficientes en caja. Requieres L ${amount.toLocaleString()} y dispones de L ${storeCash.toLocaleString()}.`);
      return;
    }

    sound.playCashChime();
    onRepayFacility(facilityId, amount);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Diagnóstico de Calificación Crediticia de la Empresa */}
      <div className="bg-[#f2ede4] border-2 border-[#b59e72] p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#000080] text-white flex items-center justify-center font-black text-xl border border-white shadow">
            {creditRating || 'AA'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Banco Aliado: Evaluación de Crédito PyME</span>
              <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-1.5 py-0.5 border border-emerald-300 font-semibold">
                FINANCIAMIENTO AUTOMATIZADO
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              El sistema bancario IA evalúa tu facturación diaria y preaprueba financiamiento sin trámites manuales ni papeleos.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Ventas Acumuladas este Mes</span>
          <span className="font-mono font-bold text-base text-emerald-800">
            L {monthlySales.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Créditos y Tarjetas Activas */}
      <div className="space-y-2">
        <span className="font-bold text-slate-800 block text-xs">
          📋 Facilidades Bancarias Activas ({activeFacilities.length}):
        </span>

        {activeFacilities.length === 0 ? (
          <div className="bg-white border border-[#808080] p-4 text-center text-slate-500">
            No tienes préstamos ni tarjetas activas actualmente. Tu empresa opera 100% libre de pasivos bancarios.
          </div>
        ) : (
          activeFacilities.map(fac => (
            <div key={fac.id} className="bg-white border border-[#808080] p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{fac.title}</span>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.2 border border-blue-300">
                    {fac.interestRateAnnual}% Tasa Anual
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 flex gap-3 font-mono">
                  <span>Saldo Restante: <strong>L {fac.balanceRemaining.toLocaleString()}</strong></span>
                  <span>·</span>
                  <span>Cuota Sugerida: <strong>L {fac.monthlyPayment.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  step="500"
                  min="100"
                  max={fac.balanceRemaining}
                  value={repayAmount[fac.id] !== undefined ? repayAmount[fac.id] : fac.monthlyPayment}
                  onChange={(e) => setRepayAmount({ ...repayAmount, [fac.id]: Math.min(fac.balanceRemaining, Number(e.target.value)) })}
                  className="w-24 bg-slate-50 border border-[#808080] px-2 py-1 font-mono text-xs font-semibold"
                />
                <button
                  onClick={() => handleRepay(fac.id)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow-sm"
                >
                  Pagar Cuota
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ofertas Disponibles Preaprobadas */}
      <div className="space-y-2 pt-1">
        <span className="font-bold text-slate-800 block text-xs">
          ⭐ Financiamiento Preaprobado por el Banco IA para tu Negocio:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {availableOffers.map(offer => {
            const meetsRequirements = monthlySales >= offer.minMonthlySalesRequired;

            return (
              <div key={offer.id} className="bg-white border-2 border-[#a0a0a0] p-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{offer.title}</span>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300">
                      L {offer.amount.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-2">
                    {offer.description}
                  </p>

                  <div className="bg-slate-50 p-2 border border-slate-200 text-[11px] font-mono space-y-0.5 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tasa de Interés:</span>
                      <span className="font-semibold text-slate-800">{offer.interestRateAnnual}% Anual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plazo de Amortización:</span>
                      <span className="font-semibold text-slate-800">{offer.termMonths} Meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cuota Mensual:</span>
                      <span className="font-semibold text-slate-800">L {offer.monthlyPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {meetsRequirements ? (
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onAcceptFacility(offer.id);
                      }}
                      className="w-full py-1.5 bg-[#1084d0] hover:bg-[#000080] text-white font-bold text-xs border-t border-l border-white border-b border-r border-[#000040] shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Aceptar y Desembolsar a Caja</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-center text-amber-800 bg-amber-50 p-1 border border-amber-300">
                      🔒 Requiere ventas de L {offer.minMonthlySalesRequired.toLocaleString()} (Faltan L {(offer.minMonthlySalesRequired - monthlySales).toLocaleString()})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
