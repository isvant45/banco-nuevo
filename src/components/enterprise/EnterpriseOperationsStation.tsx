import React, { useState } from 'react';
import { GameState, EnterpriseProfile, RoleMode } from '../../game/types';
import { formatHNL } from '../../game/economyEngine';
import { sound } from '../../game/audioFx';
import { 
  Building, 
  ShoppingBag, 
  Coffee, 
  Shirt, 
  HardHat, 
  Package, 
  TrendingUp, 
  Users, 
  Coins, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  Percent,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface EnterpriseOperationsStationProps {
  state: GameState;
  onSelectEnterprise: (enterpriseId: string) => void;
  onPurchaseMaterials: (enterpriseId: string, units: number) => void;
  onAdjustPricing: (enterpriseId: string, newPriceHNL: number) => void;
  onHireStaff: (enterpriseId: string, count: number) => void;
  onFireStaff: (enterpriseId: string, count: number) => void;
  onRequestBankLoan: (enterpriseId: string, amountHNL: number, termMonths?: number) => void;
  onRepayBankLoan: (enterpriseId: string, amountHNL: number) => void;
  onOpenCausalAudit?: () => void;
}

export const EnterpriseOperationsStation: React.FC<EnterpriseOperationsStationProps> = ({
  state,
  onSelectEnterprise,
  onPurchaseMaterials,
  onAdjustPricing,
  onHireStaff,
  onFireStaff,
  onRequestBankLoan,
  onRepayBankLoan,
  onOpenCausalAudit
}) => {
  const enterprises = state.enterprises || [];
  const selectedId = state.selectedEnterpriseId || enterprises[0]?.id || 'ent-001';
  const selectedEnterprise = enterprises.find(e => e.id === selectedId) || enterprises[0];

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'pricing' | 'staff' | 'financing'>('inventory');

  // Input states for interactive management
  const [purchaseUnits, setPurchaseUnits] = useState<number>(1000);
  const [targetPrice, setTargetPrice] = useState<number>(selectedEnterprise?.sellingPriceHNL || 300);
  const [staffCountDelta, setStaffCountDelta] = useState<number>(2);
  const [loanRequestAmount, setLoanRequestAmount] = useState<number>(500000);
  const [loanRepayAmount, setLoanRepayAmount] = useState<number>(250000);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!selectedEnterprise) {
    return (
      <div className="p-8 text-center text-slate-400">
        No se encontraron empresas operativas registradas en el conglomerado.
      </div>
    );
  }

  const handleSelect = (id: string) => {
    sound.playClick();
    onSelectEnterprise(id);
    const ent = enterprises.find(e => e.id === id);
    if (ent) {
      setTargetPrice(ent.sellingPriceHNL);
      setFeedbackNotice(null);
    }
  };

  const getSectorIcon = (sector: EnterpriseProfile['sector']) => {
    switch (sector) {
      case 'supermercado': return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'agroindustria_cafe': return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'tienda_retail': return <Shirt className="w-5 h-5 text-purple-400" />;
      case 'construccion': return <HardHat className="w-5 h-5 text-amber-500" />;
      default: return <Building className="w-5 h-5 text-sky-400" />;
    }
  };

  const getRawMaterialName = (sector: EnterpriseProfile['sector']) => {
    switch (sector) {
      case 'supermercado': return 'Mercadería & Abarrotes Perecederos';
      case 'agroindustria_cafe': return 'Café Pergamino & Fertilizantes';
      case 'tienda_retail': return 'Telas, Confección & Calzado';
      case 'construccion': return 'Cemento, Varilla & Agregados';
      default: return 'Insumos Industriales';
    }
  };

  // Metrics for current selected enterprise
  const currentTotalStock = selectedEnterprise.rawMaterialsStockUnits + selectedEnterprise.finishedGoodsStockUnits;
  const storageUsagePct = Math.min(100, Math.round((currentTotalStock / Math.max(1, selectedEnterprise.storageCapacityUnits)) * 100));
  const grossMarginHNL = selectedEnterprise.sellingPriceHNL - selectedEnterprise.unitCostHNL;
  const grossMarginPct = selectedEnterprise.sellingPriceHNL > 0 
    ? ((grossMarginHNL / selectedEnterprise.sellingPriceHNL) * 100).toFixed(1)
    : '0.0';
  const monthlyPayrollTotal = selectedEnterprise.employeeCount * selectedEnterprise.averageMonthlySalaryHNL;

  const isConglomerate = (state.roleMode || 'grupo_empresarial') === 'grupo_empresarial';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-mono">
            <span>Operaciones Corporativas & Empresas Filiales</span>
            <span>·</span>
            <span className="text-slate-400 font-sans">
              Modo Actual: {state.roleMode === 'empresario' ? 'Empresario Independiente' : state.roleMode === 'banquero' ? 'Banca & Aliados' : 'Grupo Empresarial Conglomerado'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Gestión Operativa de Negocios Reales
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Compras de inventario, fijación de precios, plantilla laboral y financiamiento bancario sin botones ciegos.
          </p>
        </div>

        {onOpenCausalAudit && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenCausalAudit();
            }}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-medium rounded transition-colors flex items-center gap-2 shrink-0"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Auditoría Causal ("¿Por qué gané o perdí?")
          </button>
        )}
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-blue-950/70 border border-blue-800/80 rounded text-xs text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Grid de Selector de Empresas Filiales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {enterprises.map(ent => {
          const isSelected = ent.id === selectedId;
          const isProfitable = ent.monthlyNetProfitHNL >= 0;

          return (
            <button
              key={ent.id}
              onClick={() => handleSelect(ent.id)}
              className={`p-4 rounded-lg text-left transition-all border ${
                isSelected
                  ? 'bg-slate-800/95 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  {getSectorIcon(ent.sector)}
                </div>
                <span className={`text-xs font-mono tabular-nums ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isProfitable ? '+' : ''}{formatHNL(ent.monthlyNetProfitHNL)}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-slate-100 truncate">{ent.name}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{ent.city}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Caja:</span>
                <span className="font-mono text-slate-200 tabular-nums">{formatHNL(ent.cashHNL)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hub Central de la Empresa Seleccionada */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {/* Barra de Título y Métricas Clave */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
              {getSectorIcon(selectedEnterprise.sector)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-amber-400 uppercase font-semibold">{selectedEnterprise.sector.replace('_', ' ')}</span>
                <span>·</span>
                <span>{selectedEnterprise.city}</span>
                <span>·</span>
                <span>{selectedEnterprise.employeeCount} Empleados</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">{selectedEnterprise.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedEnterprise.description}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Caja Disponible</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">{formatHNL(selectedEnterprise.cashHNL)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Deuda Bancaria</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">{formatHNL(selectedEnterprise.activeBankLoanHNL)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Ventas del Mes</span>
              <span className="text-sm font-bold text-sky-400 tabular-nums">{selectedEnterprise.monthlyUnitsSold.toLocaleString()} u.</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Utilidad Neta Mes</span>
              <span className={`text-sm font-bold tabular-nums ${selectedEnterprise.monthlyNetProfitHNL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatHNL(selectedEnterprise.monthlyNetProfitHNL)}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Pestañas de Operación */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 gap-6 text-xs font-medium">
          <button
            onClick={() => { sound.playClick(); setActiveSubTab('inventory'); }}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'inventory'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            1. Inventario & Compras
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSubTab('pricing'); }}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'pricing'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            2. Precios & Elasticidad
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSubTab('staff'); }}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'staff'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            3. Personal & Nómina
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSubTab('financing'); }}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'financing'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            4. Financiamiento Bancario
          </button>
        </div>

        {/* Contenido de la Sub-Pestaña Activa */}
        <div className="p-6">
          {/* TAB 1: INVENTARIO & COMPRAS */}
          {activeSubTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Situación Actual de Almacén */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Capacidad de Almacenamiento & Existencias
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Uso de Bodega</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {currentTotalStock.toLocaleString()} / {selectedEnterprise.storageCapacityUnits.toLocaleString()} unidades ({storageUsagePct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          storageUsagePct > 85 ? 'bg-rose-500' : storageUsagePct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${storageUsagePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 block">Materia Prima en Stock</span>
                      <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
                        {selectedEnterprise.rawMaterialsStockUnits.toLocaleString()} u.
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{getRawMaterialName(selectedEnterprise.sector)}</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 block">Producto Terminado Disponible</span>
                      <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
                        {selectedEnterprise.finishedGoodsStockUnits.toLocaleString()} u.
                      </span>
                      <span className="text-[11px] text-emerald-400 block mt-0.5">Listo para despacho comercial</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Costo unitario de adquisición:</span>
                      <span className="font-mono text-slate-200 tabular-nums">{formatHNL(selectedEnterprise.unitCostHNL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacidad de producción/despacho:</span>
                      <span className="font-mono text-slate-200 tabular-nums">{selectedEnterprise.monthlyProductionCapacityUnits.toLocaleString()} u. / mes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calidad de proveedores:</span>
                      <span className="capitalize text-amber-400 font-medium">{selectedEnterprise.supplierQuality}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orden de Compra de Suministros */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Emitir Orden de Reabastecimiento
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Cantidad de unidades a comprar:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={purchaseUnits}
                        onChange={(e) => setPurchaseUnits(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono tabular-nums w-full focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    {/* Botones de incremento rápido */}
                    <div className="flex gap-2 mt-2">
                      {[250, 500, 1000, 2500, 5000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => { sound.playClick(); setPurchaseUnits(amt); }}
                          className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                            purchaseUnits === amt
                              ? 'bg-amber-950 border-amber-600 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de costos de compra */}
                  {(() => {
                    const totalCost = purchaseUnits * selectedEnterprise.unitCostHNL;
                    const canAfford = selectedEnterprise.cashHNL >= totalCost;
                    const spaceAvailable = selectedEnterprise.storageCapacityUnits - currentTotalStock >= purchaseUnits;

                    return (
                      <div className="bg-slate-900 p-3.5 rounded border border-slate-800 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Inversión requerida:</span>
                          <span className="font-bold text-amber-400 font-mono tabular-nums">{formatHNL(totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Caja actual en filial:</span>
                          <span className="font-mono text-slate-300 tabular-nums">{formatHNL(selectedEnterprise.cashHNL)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Espacio en almacén:</span>
                          <span className={`font-mono tabular-nums ${spaceAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {spaceAvailable ? 'Disponible' : 'Insuficiente (ampliar bodega)'}
                          </span>
                        </div>

                        {!canAfford && (
                          <div className="p-2 bg-rose-950/60 border border-rose-800/80 rounded text-rose-300 flex items-center gap-1.5 mt-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Fondos insuficientes: solicite un crédito bancario antes de comprar.</span>
                          </div>
                        )}

                        <button
                          disabled={!canAfford || purchaseUnits <= 0}
                          onClick={() => {
                            sound.playCashChime();
                            onPurchaseMaterials(selectedEnterprise.id, purchaseUnits);
                            setFeedbackNotice(`Orden de reabastecimiento por ${purchaseUnits.toLocaleString()} unidades emitida con éxito.`);
                          }}
                          className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded text-xs transition-colors shadow"
                        >
                          Confirmar Compra ({formatHNL(totalCost)})
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRECIOS & ELASTICIDAD */}
          {activeSubTab === 'pricing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-400" />
                  Estrategia de Fijación de Precios Unitarios
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">
                      Precio de Venta Unitario Actual: <span className="font-bold text-amber-400 font-mono tabular-nums">{formatHNL(selectedEnterprise.sellingPriceHNL)}</span>
                    </label>
                    <input
                      type="range"
                      min={Math.round(selectedEnterprise.unitCostHNL * 0.9)}
                      max={Math.round(selectedEnterprise.unitCostHNL * 3.5)}
                      step="5"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(parseInt(e.target.value) || selectedEnterprise.unitCostHNL)}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                      <span>Costo base: {formatHNL(selectedEnterprise.unitCostHNL)}</span>
                      <span className="text-amber-400 font-bold">{formatHNL(targetPrice)}</span>
                      <span>Máximo: {formatHNL(Math.round(selectedEnterprise.unitCostHNL * 3.5))}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Margen Bruto Unitario:</span>
                      <span className="font-bold text-emerald-400 font-mono tabular-nums">
                        {formatHNL(targetPrice - selectedEnterprise.unitCostHNL)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Margen Porcentual s/Venta:</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {targetPrice > 0 ? (((targetPrice - selectedEnterprise.unitCostHNL) / targetPrice) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playApprovalStamp();
                      onAdjustPricing(selectedEnterprise.id, targetPrice);
                      setFeedbackNotice(`Precio actualizado a ${formatHNL(targetPrice)} en ${selectedEnterprise.name}.`);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow"
                  >
                    Aplicar Nueva Tarifa de Venta
                  </button>
                </div>
              </div>

              {/* Elasticidad de la Demanda y Causa-Efecto */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Simulación de Demanda & Elasticidad
                </h3>

                <div className="text-xs text-slate-400 space-y-3">
                  <p>
                    Los clientes en {selectedEnterprise.city} reaccionan al precio según la elasticidad del sector comercial. Un precio demasiado alto reducirá el volumen de pedidos; un precio bajo aumentará las ventas pero comprimirá el margen unitario.
                  </p>

                  <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span>Ventas estimadas mensuales:</span>
                      <span className="text-sky-400 font-bold tabular-nums">
                        {Math.round(selectedEnterprise.monthlyUnitsSold * (selectedEnterprise.sellingPriceHNL / Math.max(1, targetPrice))).toLocaleString()} u.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingreso bruto estimado:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {formatHNL(Math.round(selectedEnterprise.monthlyUnitsSold * (selectedEnterprise.sellingPriceHNL / Math.max(1, targetPrice))) * targetPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Ciclo económico macro:</span>
                      <span className="text-slate-300">{state.bch.economicSentiment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL & NÓMINA */}
          {activeSubTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Estructura Laboral & Salarios
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 block">Colaboradores Activos</span>
                      <span className="text-lg font-bold text-slate-100 font-mono tabular-nums">
                        {selectedEnterprise.employeeCount} personas
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 block">Salario Promedio Mensual</span>
                      <span className="text-lg font-bold text-slate-100 font-mono tabular-nums">
                        {formatHNL(selectedEnterprise.averageMonthlySalaryHNL)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Compromiso Mensual de Planilla:</span>
                    <span className="text-sm font-bold text-rose-400 font-mono tabular-nums">{formatHNL(monthlyPayrollTotal)}</span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Nota laboral: Cada trabajador aporta capacidad productiva y de atención comercial. Las desvinculaciones implican pago de prestaciones legales (1.5 meses de salario por ley hondureña).
                  </p>
                </div>
              </div>

              {/* Contratación o Despido */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Building className="w-4 h-4 text-sky-400" />
                  Ajuste de Plantilla
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Cantidad de colaboradores a ajustar:</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={staffCountDelta}
                      onChange={(e) => setStaffCountDelta(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono tabular-nums w-full focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onHireStaff(selectedEnterprise.id, staffCountDelta);
                        setFeedbackNotice(`+${staffCountDelta} plazas contratadas en ${selectedEnterprise.name}.`);
                      }}
                      className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-slate-100 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Contratar (+{staffCountDelta})
                    </button>

                    <button
                      disabled={selectedEnterprise.employeeCount <= staffCountDelta}
                      onClick={() => {
                        sound.playRejectBuzzer();
                        onFireStaff(selectedEnterprise.id, staffCountDelta);
                        setFeedbackNotice(`-${staffCountDelta} plazas desvinculadas con liquidación legal.`);
                      }}
                      className="py-2.5 bg-rose-900 hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Minus className="w-4 h-4" />
                      Liquidación (-{staffCountDelta})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAMIENTO BANCARIO */}
          {activeSubTab === 'financing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deuda Actual */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Estado de Crédito Bancario
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Saldo deudor bancario:</span>
                      <span className="font-bold text-amber-400 font-mono tabular-nums text-sm">
                        {formatHNL(selectedEnterprise.activeBankLoanHNL)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cuota mensual de amortización:</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {formatHNL(selectedEnterprise.bankMonthlyPaymentHNL)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entidad acreedora:</span>
                      <span className="font-medium text-slate-200">
                        {isConglomerate ? 'Áureo Bank Honduras (Préstamo Intragrupo)' : 'Banca Comercial Aliada'}
                      </span>
                    </div>
                  </div>

                  {selectedEnterprise.activeBankLoanHNL > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-slate-300 block">Amortizar deuda anticipada:</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="50000"
                          value={loanRepayAmount}
                          onChange={(e) => setLoanRepayAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono tabular-nums w-full"
                        />
                        <button
                          onClick={() => {
                            sound.playCashChime();
                            onRepayBankLoan(selectedEnterprise.id, loanRepayAmount);
                            setFeedbackNotice(`Amortización de ${formatHNL(loanRepayAmount)} abonada.`);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs shrink-0"
                        >
                          Abonar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Solicitar Nuevo Crédito */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Línea de Capital de Trabajo Bancario
                </h3>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">
                    {isConglomerate
                      ? 'En modalidad de Grupo Empresarial, Áureo Bank financia a sus filiales a tasa preferencial corporativa (13.5% anual).'
                      : 'Línea de crédito para inyectar liquidez y financiar compras de gran escala de inventario.'}
                  </p>

                  <div>
                    <label className="text-slate-300 block mb-1">Monto solicitado:</label>
                    <input
                      type="number"
                      step="100000"
                      value={loanRequestAmount}
                      onChange={(e) => setLoanRequestAmount(Math.max(10000, parseInt(e.target.value) || 0))}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono tabular-nums w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[250000, 500000, 1000000, 2000000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => { sound.playClick(); setLoanRequestAmount(amt); }}
                        className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                          loanRequestAmount === amt
                            ? 'bg-amber-950 border-amber-600 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {formatHNL(amt)}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      sound.playApprovalStamp();
                      onRequestBankLoan(selectedEnterprise.id, loanRequestAmount);
                      setFeedbackNotice(`Solicitud de crédito por ${formatHNL(loanRequestAmount)} procesada.`);
                    }}
                    className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow"
                  >
                    Desembolsar Crédito Bancario ({formatHNL(loanRequestAmount)})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
