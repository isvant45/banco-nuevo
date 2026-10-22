import React, { useState } from 'react';
import { GameState, FxForwardContract } from '../game/types';
import { formatHNL, formatUSD } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  X, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

interface FxAndForwardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onCreateForward: (
    clientName: string, 
    companyName: string, 
    amountUSD: number, 
    agreedRateHNL: number, 
    termDays: 30 | 60 | 90 | 180
  ) => void;
  onTradeFxSpot: (action: 'BUY_USD' | 'SELL_USD', amountUSD: number) => void;
}

export const FxAndForwardsModal: React.FC<FxAndForwardsModalProps> = ({
  isOpen,
  onClose,
  state,
  onCreateForward,
  onTradeFxSpot
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'forwards' | 'bch_auction'>('forwards');
  const [companyName, setCompanyName] = useState('Textiles del Valle S.A.');
  const [clientName, setClientName] = useState('Carlos Facussé');
  const [amountUSD, setAmountUSD] = useState(250000);
  const [agreedRateHNL, setAgreedRateHNL] = useState(+(state.bch.exchangeRateHNLtoUSD + 0.15).toFixed(2));
  const [termDays, setTermDays] = useState<30 | 60 | 90 | 180>(60);
  const [spotAmountUSD, setSpotAmountUSD] = useState(100000);
  const [spotAction, setSpotAction] = useState<'BUY_USD' | 'SELL_USD'>('BUY_USD');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forwards: FxForwardContract[] = state.fxForwards || [];
  const fxReservesUSD = state.financials.fxReservesUSDValueInHNL / state.bch.exchangeRateHNLtoUSD;

  const handleCreateForward = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playApprovalStamp();
    onCreateForward(clientName, companyName, amountUSD, agreedRateHNL, termDays);
    setSuccessMessage(`Contrato Forward USD/HNL acordado con ${companyName} por ${formatUSD(amountUSD)} a L. ${agreedRateHNL}.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleExecuteSpot = () => {
    sound.playCoinClink();
    onTradeFxSpot(spotAction, spotAmountUSD);
    setSuccessMessage(`Operación Cambiaria ejecutada: ${spotAction === 'BUY_USD' ? 'Compra' : 'Venta'} de ${formatUSD(spotAmountUSD)} a tipo de cambio L. ${state.bch.exchangeRateHNLtoUSD}.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-emerald-400">
                  Mesa Cambiaria & Derivados
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-semibold">BCH & Empresas</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Subasta de Divisas BCH & Contratos Forwards USD/HNL
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas internas */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('forwards')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'forwards'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Contratos Forward Cambiarios ({forwards.length})
          </button>
          <button
            onClick={() => setActiveTab('bch_auction')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'bch_auction'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Subasta BCH & Spot Divisas
          </button>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {activeTab === 'forwards' ? (
            <div className="space-y-6">
              {/* Formulario para emitir nuevo Forward */}
              <form onSubmit={handleCreateForward} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Pactar Nuevo Contrato Forward (Cobertura Cambiaria)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Tipo de Cambio Spot: L. {state.bch.exchangeRateHNLtoUSD}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Empresa Cliente:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Representante Legal:</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Monto en Dólares (USD):</label>
                    <input
                      type="number"
                      step="50000"
                      value={amountUSD}
                      onChange={e => setAmountUSD(Math.max(10000, Number(e.target.value)))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Tipo de Cambio Pactado (HNL/USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={agreedRateHNL}
                      onChange={e => setAgreedRateHNL(Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Plazo de Cobertura:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([30, 60, 90, 180] as const).map(days => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setTermDays(days)}
                        className={`py-1.5 rounded-lg font-medium transition-colors border ${
                          termDays === days
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {days} Días
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Comisión por estructuración: <span className="text-emerald-400 font-bold">{formatHNL(Math.round(amountUSD * 0.12))}</span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-98"
                  >
                    Firmar Contrato Forward
                  </button>
                </div>
              </form>

              {/* Lista de Forwards Activos */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Contratos Forward en Vigencia</h3>
                {forwards.length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">No hay contratos forward vigentes.</p>
                ) : (
                  <div className="space-y-2">
                    {forwards.map(fwd => (
                      <div key={fwd.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{fwd.companyName}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 font-mono text-[11px]">{fwd.clientName}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-emerald-400 font-mono font-bold text-[11px]">{fwd.termDays} días</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Monto: <span className="text-slate-200 font-bold">{formatUSD(fwd.amountUSD)}</span> · Tasa pactada: <span className="text-amber-400 font-bold">L. {fwd.agreedRateHNL}</span> (Spot inicial: L. {fwd.marketRateAtAgreementHNL}) · Meses restantes: {fwd.monthsRemaining}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-semibold self-start sm:self-auto">
                          Vigente / Activo
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información de Subasta BCH */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mecanismo Electrónico de Asignación de Divisas (BCH)
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  El Banco Central de Honduras asigna divisas mediante subasta pública diaria a los agentes cambiarios autorizados para atender la demanda de importadores nacionales. El tipo de cambio de referencia actual es de <span className="font-mono text-emerald-400 font-bold">L. {state.bch.exchangeRateHNLtoUSD} por USD</span>.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Volumen Subastado BCH</span>
                    <span className="text-sm font-bold text-white">{formatUSD(state.bch.monthlyFXAuctionVolumeUSD)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Reservas Propias Áureo</span>
                    <span className="text-sm font-bold text-emerald-400">{formatUSD(fxReservesUSD)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Factor de Adjudicación</span>
                    <span className="text-sm font-bold text-amber-400">82.4% promedio</span>
                  </div>
                </div>
              </div>

              {/* Compra y Venta Spot de Dólares */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Operación Spot de Mesa Cambiaria</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSpotAction('BUY_USD')}
                    className={`py-2 rounded-lg font-medium transition-colors border flex items-center justify-center gap-1.5 ${
                      spotAction === 'BUY_USD'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Comprar USD para Reserva</span>
                  </button>
                  <button
                    onClick={() => setSpotAction('SELL_USD')}
                    className={`py-2 rounded-lg font-medium transition-colors border flex items-center justify-center gap-1.5 ${
                      spotAction === 'SELL_USD'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Vender USD y Liquidar HNL</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monto de la Operación (USD):</label>
                  <input
                    type="number"
                    step="25000"
                    value={spotAmountUSD}
                    onChange={e => setSpotAmountUSD(Math.max(5000, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Equivalente en Lempiras: {formatHNL(spotAmountUSD * state.bch.exchangeRateHNLtoUSD)}
                  </div>
                </div>

                <button
                  onClick={handleExecuteSpot}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-600"
                >
                  Confirmar Transacción Spot de Divisas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
