import React, { useState, useMemo } from 'react';
import { GameState, BankingDivisionId, IndividualClient } from '../game/types';
import { formatHNL, formatPct, BulkAllocationParams } from '../game/economyEngine';
import { queryDivisionClients, HONDURAN_CITIES } from '../game/clientRegistry';
import { sound } from '../game/audioFx';
import { BulkPortfolioAllocatorModal } from './BulkPortfolioAllocatorModal';
import { 
  Users, 
  Sparkles, 
  Crown, 
  Briefcase, 
  Building, 
  Globe2, 
  CreditCard, 
  CheckCircle2, 
  Edit3, 
  Search, 
  UserPlus,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Sliders,
  Layers
} from 'lucide-react';

interface BankingDivisionsTabProps {
  state: GameState;
  onUpdateRates: (divisionId: BankingDivisionId, depositRate: number, lendingRate: number) => void;
  onSelectClientToEdit: (client: IndividualClient) => void;
  onOpenClient360: (client: IndividualClient) => void;
  onToggleClientGuaranteed: (clientId: string) => void;
  onAddClient: (divisionId: BankingDivisionId) => void;
  onOpenClientActions?: (client: IndividualClient) => void;
  onApplyBulkAllocation?: (params: BulkAllocationParams) => void;
  onBulkDivisionMoraRelief?: (divisionId: BankingDivisionId) => void;
  onWaiveSingleClientMora?: (client: IndividualClient) => void;
}

export const BankingDivisionsTab: React.FC<BankingDivisionsTabProps> = ({
  state,
  onUpdateRates,
  onSelectClientToEdit,
  onOpenClient360,
  onToggleClientGuaranteed,
  onAddClient,
  onOpenClientActions,
  onApplyBulkAllocation,
  onBulkDivisionMoraRelief,
  onWaiveSingleClientMora
}) => {
  const [selectedDivId, setSelectedDivId] = useState<BankingDivisionId>('personas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Todas las Ciudades');
  const [selectedCnbs, setSelectedCnbs] = useState<string>('Todas las Categorías');
  const [selectedAml, setSelectedAml] = useState<string>('Todos los Estados');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [isBulkAllocatorOpen, setIsBulkAllocatorOpen] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const divisionsList: { id: BankingDivisionId; label: string; icon: React.ReactNode; tag: string }[] = [
    { id: 'personas', label: 'Banca Minorista & Patrimonial', icon: <Users className="w-4 h-4" />, tag: 'Consumer & Nómina' },
    { id: 'premier', label: 'Banca Premier / Affluent', icon: <Sparkles className="w-4 h-4" />, tag: '$10k - $100k Pasivos' },
    { id: 'privada', label: 'Banca Privada & Trusts', icon: <Crown className="w-4 h-4" />, tag: 'Wealth Mgmt >$100k' },
    { id: 'pyme', label: 'Banca Comercial PYME', icon: <Briefcase className="w-4 h-4" />, tag: 'POS & Comercios' },
    { id: 'corporativa', label: 'Banca Corporativa & CIB', icon: <Building className="w-4 h-4" />, tag: 'Sindicados & CIB' },
    { id: 'internacional', label: 'Banca Global & Tesorería', icon: <Globe2 className="w-4 h-4" />, tag: 'SWIFT & Corresponsalía' }
  ];

  const currentDiv = state.divisions[selectedDivId];

  const [depositRate, setDepositRate] = useState<number>(currentDiv.avgDepositRate);
  const [lendingRate, setLendingRate] = useState<number>(currentDiv.avgLendingRate);

  React.useEffect(() => {
    setDepositRate(currentDiv.avgDepositRate);
    setLendingRate(currentDiv.avgLendingRate);
    setPage(1); // Reiniciar a página 1 al cambiar de banca
  }, [selectedDivId, currentDiv.avgDepositRate, currentDiv.avgLendingRate]);

  const handleApplyRates = () => {
    sound.playApprovalStamp();
    onUpdateRates(selectedDivId, depositRate, lendingRate);
  };

  // Consulta paginada y filtrada sobre la cartera completa (18,000+ clientes) con calibración masiva
  const paginatedResult = useMemo(() => {
    return queryDivisionClients(
      state.clients,
      selectedDivId,
      currentDiv.clientCount,
      {
        searchQuery: searchTerm,
        city: selectedCity,
        cnbsCategory: selectedCnbs,
        amlStatus: selectedAml,
        page,
        pageSize
      },
      currentDiv
    );
  }, [state.clients, selectedDivId, currentDiv, searchTerm, selectedCity, selectedCnbs, selectedAml, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* 1. Selector Superior de las 6 Bancas Especializadas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {divisionsList.map(div => {
          const isSelected = selectedDivId === div.id;
          const divisionData = state.divisions[div.id];
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
                <span className={isSelected ? 'text-amber-400' : 'text-slate-500'}>{div.icon}</span>
                <span className="font-bold text-xs truncate">{div.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mb-1">{div.tag}</p>
              <div className="flex items-center justify-between text-[11px] font-mono mt-1 border-t border-slate-800/80 pt-1">
                <span className="text-slate-400">Clientes:</span>
                <span className="text-white font-bold">{divisionData.clientCount.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Tarjetas de Resumen Financiero y Modulador de Tasas de la División */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
                {currentDiv.categoryTag}
              </span>
              <h2 className="text-lg font-bold text-white">{currentDiv.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                Mora: <strong className={currentDiv.delinquencyRate > 3 ? 'text-rose-400' : 'text-emerald-400'}>{formatPct(currentDiv.delinquencyRate)}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                Satisfacción: <strong className="text-amber-400">{currentDiv.satisfactionScore}/100</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {currentDiv.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Depósitos Captados</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formatHNL(currentDiv.totalDeposits)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Tasa Pagada: {formatPct(currentDiv.avgDepositRate)}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Cartera de Crédito</span>
              <span className="text-sm font-bold text-blue-400 font-mono">{formatHNL(currentDiv.totalLoans)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Tasa Cobrada: {formatPct(currentDiv.avgLendingRate)}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Comisiones / Mes</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{formatHNL(currentDiv.feeIncomeMonthly)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Servicios y Canales</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Base Registrada</span>
              <span className="text-sm font-bold text-white font-mono">{currentDiv.clientCount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Cuentas: {currentDiv.activeAccountsCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Características Específicas */}
          <div className="border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Servicios y Condiciones Activas:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentDiv.specificFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <span className="text-slate-400">{feat.label}</span>
                  <span className="font-mono text-slate-200 font-medium">{feat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Ajuste de Tasas de Interés en Tiempo Real */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Política de Tasas: {currentDiv.id.toUpperCase()}
              </h3>
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
                Pagar más tasa pasiva atrae depósitos de la competencia pero incrementa el gasto financiero.
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
            <span>Aplicar Nuevas Tasas de Inmediato</span>
          </button>
        </div>
      </div>

      {/* 3. Libro Mayor Completo de Clientes con Paginación Virtualizada (18,000+ Clientes) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Cartera Completa en {currentDiv.name} ({paginatedResult.divisionTotalClients.toLocaleString()} Clientes Totales)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Libro mayor de cuentas bancarias hondureñas con RTN SAR, buró de crédito Equifax, categoría CNBS (I a V) y filtros de localización geográfica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsBulkAllocatorOpen(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="Configurar masivamente cantidad de clientes, saldos y montos promedio de préstamos sin modificar uno a uno"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Asignación Masiva («El Coso»)</span>
            </button>

            <button
              onClick={() => {
                sound.playApprovalStamp();
                if (onBulkDivisionMoraRelief) {
                  onBulkDivisionMoraRelief(selectedDivId);
                }
                setFeedbackToast(`¡Condonación masiva aplicada en ${currentDiv.name}! La mora se redujo a 0.2% y los clientes recuperaron Categoría I.`);
                setTimeout(() => setFeedbackToast(null), 4500);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 active:scale-95"
              title="Condonar 100% de intereses moratorios a todos los clientes morosos de esta banca"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />
              <span>Condonar Toda la Mora</span>
            </button>

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

        {/* Notificación Toast de Operaciones Masivas */}
        {feedbackToast && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Filtros de Búsqueda y Paginación Rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 text-xs">
          {/* Buscador RTN / CIF / Nombre */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por RTN (SAR), CIF o Nombre..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Filtro por Ciudad / Departamento */}
          <div>
            <select
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="Todas las Ciudades">Todas las Ciudades</option>
              {HONDURAN_CITIES.map(c => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>
          </div>

          {/* Filtro Categoría CNBS */}
          <div>
            <select
              value={selectedCnbs}
              onChange={e => {
                setSelectedCnbs(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="Todas las Categorías">Todas las Categorías CNBS</option>
              <option value="I - Normal">Categoría I - Normal</option>
              <option value="II - Especial">Categoría II - Especial</option>
              <option value="III - Subnormal">Categoría III - Subnormal</option>
              <option value="IV - Dudoso Recaudo">Categoría IV - Dudoso Recaudo</option>
              <option value="V - Pérdida">Categoría V - Pérdida</option>
            </select>
          </div>

          {/* Filtro de Tamaño de Página */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Mostrar:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:border-amber-500 focus:outline-none"
            >
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
            </select>
          </div>
        </div>

        {/* Resumen de Coincidencias */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <div>
            Mostrando <strong>{paginatedResult.clients.length}</strong> de <strong>{paginatedResult.totalMatching.toLocaleString()}</strong> clientes filtrados
            {selectedCity !== 'Todas las Ciudades' && ` · ${selectedCity}`}
            {selectedCnbs !== 'Todas las Categorías' && ` · ${selectedCnbs}`}
          </div>
          <div className="text-slate-500 text-[11px]">
            Página {paginatedResult.currentPage} de {paginatedResult.totalPages}
          </div>
        </div>

        {/* Tabla de Clientes Individuales */}
        {paginatedResult.clients.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No se encontraron clientes en este segmento con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Cliente / RTN (SAR) / CIF</th>
                  <th className="py-2.5 px-3">Ciudad / Buró CNBS</th>
                  <th className="py-2.5 px-3 text-right">Saldo Cuenta (L.)</th>
                  <th className="py-2.5 px-3">Tarjeta de Crédito</th>
                  <th className="py-2.5 px-3 text-right">Saldo Préstamo (L.)</th>
                  <th className="py-2.5 px-3 text-center">Estado Mora</th>
                  <th className="py-2.5 px-3 text-center">Garantía</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paginatedResult.clients.map(client => {
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
                          {client.amlStatus && client.amlStatus !== 'normal' && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2 rounded font-mono flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              <span>{client.amlStatus}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                          <span>RTN: {client.rtn || '0801-1988-12345'}</span>
                          <span>·</span>
                          <span>{client.cif}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-400">
                        <div className="flex items-center gap-1 text-slate-200">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{client.city}</span>
                        </div>
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
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Mora {client.pastDueDays}d</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playApprovalStamp();
                                if (onWaiveSingleClientMora) {
                                  onWaiveSingleClientMora(client);
                                }
                                setFeedbackToast(`¡Mora condonada para ${client.name}! Expediente restaurado a Categoría I.`);
                                setTimeout(() => setFeedbackToast(null), 3500);
                              }}
                              className="px-1.5 py-0.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded text-[9px] font-bold shadow-sm transition-all flex items-center gap-0.5 active:scale-95"
                              title="Quitar mora y penalizaciones de inmediato"
                            >
                              <span>⚡ Quitar Mora</span>
                            </button>
                          </div>
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

        {/* Barra de Paginación */}
        {paginatedResult.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
            <div className="text-slate-400">
              Página <strong>{paginatedResult.currentPage}</strong> de <strong>{paginatedResult.totalPages}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => {
                  sound.playClick();
                  setPage(1);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                disabled={page <= 1}
                onClick={() => {
                  sound.playClick();
                  setPage(p => Math.max(1, p - 1));
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <div className="px-3 py-1 bg-slate-950 rounded border border-slate-800 text-amber-400 font-bold">
                {page}
              </div>

              <button
                disabled={page >= paginatedResult.totalPages}
                onClick={() => {
                  sound.playClick();
                  setPage(p => Math.min(paginatedResult.totalPages, p + 1));
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition-colors flex items-center gap-1"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={page >= paginatedResult.totalPages}
                onClick={() => {
                  sound.playClick();
                  setPage(paginatedResult.totalPages);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded text-slate-300 transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Asignación Masiva ("El Coso") */}
      {isBulkAllocatorOpen && (
        <BulkPortfolioAllocatorModal
          isOpen={true}
          onClose={() => setIsBulkAllocatorOpen(false)}
          division={currentDiv}
          onApplyBulkAllocation={(params) => {
            if (onApplyBulkAllocation) {
              onApplyBulkAllocation(params);
            }
            setIsBulkAllocatorOpen(false);
            setFeedbackToast(`¡Asignación masiva en ${currentDiv.name} aplicada exitosamente!`);
            setTimeout(() => setFeedbackToast(null), 4000);
          }}
        />
      )}
    </div>
  );
};
