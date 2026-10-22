import React, { useState } from 'react';
import { GameState, BankingDivisionId, IndividualClient } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Users, 
  Sparkles, 
  Crown, 
  Briefcase, 
  Building, 
  Globe2, 
  CreditCard, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  Search, 
  UserPlus,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface BankingDivisionsTabProps {
  state: GameState;
  onUpdateRates: (divisionId: BankingDivisionId, depositRate: number, lendingRate: number) => void;
  onSelectClientToEdit: (client: IndividualClient) => void;
  onOpenClient360: (client: IndividualClient) => void;
  onToggleClientGuaranteed: (clientId: string) => void;
  onAddClient: (divisionId: BankingDivisionId) => void;
  onOpenClientActions?: (client: IndividualClient) => void;
}

export const BankingDivisionsTab: React.FC<BankingDivisionsTabProps> = ({
  state,
  onUpdateRates,
  onSelectClientToEdit,
  onOpenClient360,
  onToggleClientGuaranteed,
  onAddClient,
  onOpenClientActions
}) => {
  const [selectedDivId, setSelectedDivId] = useState<BankingDivisionId>('personas');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const divisionsList: { id: BankingDivisionId; label: string; icon: React.ReactNode; tag: string }[] = [
    { id: 'personas', label: 'Banca Personas', icon: <Users className="w-4 h-4" />, tag: 'Retail & Remesas' },
    { id: 'premier', label: 'Banca Premier / Banca+', icon: <Sparkles className="w-4 h-4" />, tag: '$10k - $100k Pasivos' },
    { id: 'privada', label: 'Banca Privada & Fiduciaria', icon: <Crown className="w-4 h-4" />, tag: 'Wealth Mgmt >$100k' },
    { id: 'pyme', label: 'Banca Comercial PYME', icon: <Briefcase className="w-4 h-4" />, tag: 'POS & Comercios' },
    { id: 'corporativa', label: 'Banca Corporativa', icon: <Building className="w-4 h-4" />, tag: 'Sindicados & Maquila' },
    { id: 'internacional', label: 'Banca Internacional', icon: <Globe2 className="w-4 h-4" />, tag: 'SWIFT & Corresponsalía' }
  ];

  const currentDiv = state.divisions[selectedDivId];

  const [depositRate, setDepositRate] = useState<number>(currentDiv.avgDepositRate);
  const [lendingRate, setLendingRate] = useState<number>(currentDiv.avgLendingRate);

  React.useEffect(() => {
    setDepositRate(currentDiv.avgDepositRate);
    setLendingRate(currentDiv.avgLendingRate);
  }, [selectedDivId, currentDiv.avgDepositRate, currentDiv.avgLendingRate]);

  const handleApplyRates = () => {
    sound.playApprovalStamp();
    onUpdateRates(selectedDivId, depositRate, lendingRate);
  };

  // Clientes de la división seleccionada que no hayan sido vendidos a la competencia
  const divisionClients = state.clients.filter(c => {
    const matchesDiv = c.division === selectedDivId && !c.isSoldToRival;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.cif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Selector Superior de las 6 Bancas Especializadas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {divisionsList.map(div => {
          const isSelected = selectedDivId === div.id;
          const divisionData = state.divisions[div.id];
          const countInState = state.clients.filter(c => c.division === div.id && !c.isSoldToRival).length;
          return (
            <button
              key={div.id}
              onClick={() => {
                sound.playClick();
                setSelectedDivId(div.id);
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={isSelected ? 'text-amber-400' : 'text-slate-400'}>{div.icon}</span>
                <span className="text-[11px] font-bold truncate">{div.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mb-1">{div.tag}</p>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-200">
                  {formatHNL(divisionData.totalDeposits).split('.')[0]}
                </span>
                <span className="text-[10px] text-amber-400/90 font-sans">
                  {countInState} exp.
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Detalle de la División Seleccionada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Métricas e Indicadores de la División */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {currentDiv.name}
                  </h2>
                  <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                    {currentDiv.categoryTag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentDiv.description}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Total Clientes Cartera:</span>
                <span className="font-bold text-white">{currentDiv.clientCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Grid de Métricas de la División */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Depósitos Captados:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">{formatHNL(currentDiv.totalDeposits)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tasa paga: {formatPct(currentDiv.avgDepositRate)}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Cartera de Crédito:</span>
                <span className="font-mono font-bold text-sm text-blue-400">{formatHNL(currentDiv.totalLoans)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tasa cobra: {formatPct(currentDiv.avgLendingRate)}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Índice de Mora (NPL):</span>
                <span className={`font-mono font-bold text-sm ${currentDiv.delinquencyRate <= 2.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPct(currentDiv.delinquencyRate)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Límite CNBS: 3.0%</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Comisiones del Mes:</span>
                <span className="font-mono font-bold text-sm text-amber-300">{formatHNL(currentDiv.feeIncomeMonthly)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Satisfacción: {currentDiv.satisfactionScore}%</span>
              </div>
            </div>

            {/* Taxonomía y Servicios Específicos de la División */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Servicios y Catálogo Especializado del Segmento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentDiv.specificFeatures.map((feat, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{feat.label}</span>
                    <span className="text-amber-400 font-mono font-medium">{feat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Fijación Estratégica de Tasas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Sliders className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Política de Precios y Tasas</h3>
                <p className="text-[11px] text-slate-400">Ajusta según la inflación y TPM del BCH</p>
              </div>
            </div>

            {/* Slider Tasa Pasiva (Depósitos) */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tasa Pasiva (Depósitos):</span>
                <span className="font-mono font-bold text-emerald-400">{formatPct(depositRate)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.25"
                value={depositRate}
                onChange={e => setDepositRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 rounded h-1.5 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Pagar más tasa atrae depósitos de la competencia pero incrementa el gasto financiero.
              </p>
            </div>

            {/* Slider Tasa Activa (Préstamos) */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tasa Activa (Préstamos):</span>
                <span className="font-mono font-bold text-blue-400">{formatPct(lendingRate)}</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="34.0"
                step="0.5"
                value={lendingRate}
                onChange={e => setLendingRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-slate-950 rounded h-1.5 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Tasas competitivas atraen solicitudes de crédito de calidad; tasas excesivas elevan la mora.
              </p>
            </div>

            {/* Spread Bancario */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Spread de Intermediación:</span>
                <span className="text-emerald-400 font-bold">+{formatPct(lendingRate - depositRate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>TPM BCH Referencia:</span>
                <span className="text-slate-300">{formatPct(state.bch.tpmRate)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyRates}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplicar Nuevas Tasas</span>
          </button>
        </div>
      </div>

      {/* 3. Directorio y Lista de Clientes Individuales de esta Banca */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Clientes Individuales en {currentDiv.name} ({divisionClients.length})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulta el <strong>Expediente 360°</strong> para ver qué productos tienen en otros bancos y captar su cartera, o usa <strong>Modificar</strong> para cambiar nombres, préstamos, tarjetas y activar el <strong>Pago Garantizado</strong>. Si su saldo supera L. 250,000 o L. 1.2M, ascenderá automáticamente de banca.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre o CIF..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 w-48 sm:w-64 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                sound.playApprovalStamp();
                onAddClient(selectedDivId);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* Tabla de Clientes Individuales */}
        {divisionClients.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No se encontraron clientes en este segmento con el criterio de búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Cliente / CIF</th>
                  <th className="py-2.5 px-3">Ciudad / Buró</th>
                  <th className="py-2.5 px-3 text-right">Saldo Cuenta (L.)</th>
                  <th className="py-2.5 px-3">Tarjeta Crédito</th>
                  <th className="py-2.5 px-3 text-right">Saldo Préstamo (L.)</th>
                  <th className="py-2.5 px-3 text-center">Estado Mora</th>
                  <th className="py-2.5 px-3 text-center">Pago Garantizado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {divisionClients.map(client => {
                  const hasRivalProducts = (client.otherBankProducts?.length || 0) > 0;
                  const isDelinquent = client.pastDueDays > 0;

                  return (
                    <tr key={client.id} className="hover:bg-slate-800/40 text-slate-300">
                      <td className="py-3 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white block">{client.name}</span>
                          {hasRivalProducts && (
                            <span 
                              className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1 py-0.2 rounded font-mono"
                              title={`${client.otherBankProducts.length} productos en la competencia`}
                            >
                              360°
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{client.cif}</span>
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-400">
                        <span className="text-slate-200 block">{client.city}</span>
                        <span className="text-[10px] font-mono text-emerald-400">Score: {client.equifaxScore} ({client.cnbsCategory.split(' ')[0]})</span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        {formatHNL(client.accountBalanceHNL)}
                      </td>

                      <td className="py-3 px-3 font-sans">
                        {client.hasCreditCard ? (
                          <div>
                            <span className="text-slate-200 text-xs block">{client.creditCardBrand}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Uso: {formatHNL(client.creditCardBalanceHNL)} / {formatHNL(client.creditCardLimitHNL)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Sin tarjeta</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        {client.hasLoan ? (
                          <div>
                            <span className="text-amber-400">{formatHNL(client.loanBalanceHNL)}</span>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Cuota: {formatHNL(client.loanMonthlyPaymentHNL)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-sans">Sin préstamo</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        {isDelinquent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>Mora {client.pastDueDays}d</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold">Al día</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => onToggleClientGuaranteed(client.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                            client.guaranteedPayment
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                          title="Alternar cláusula de pago garantizado"
                        >
                          {client.guaranteedPayment ? '✓ Garantizado' : 'Sin Garantía'}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Acciones Financieras (Abono a capital / Límites) */}
                          {onOpenClientActions && (
                            <button
                              onClick={() => {
                                sound.playClick();
                                onOpenClientActions(client);
                              }}
                              className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Abono a capital, ajuste de límite y estado mensual"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Finanzas</span>
                            </button>
                          )}

                          {/* Botón Expediente 360 */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              onOpenClient360(client);
                            }}
                            className="px-2 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Abrir Expediente 360 y productos en otros bancos"
                          >
                            <Eye className="w-3 h-3" />
                            <span>360°</span>
                          </button>

                          {/* Botón Modificar */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectClientToEdit(client);
                            }}
                            className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
