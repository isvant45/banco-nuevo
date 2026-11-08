import React, { useState } from 'react';
import { 
  DailySimulationState, 
  WarehouseTier, 
  WageLevel, 
  TycoonVictoryType 
} from '../../game/retroSimTypes';
import { 
  WAREHOUSE_CONFIG, 
  TYCOON_TECH_TREE, 
  buyBuilding, 
  upgradeWarehouse, 
  unlockTech, 
  updatePricingMarkup, 
  updateMarketingSpend, 
  updateWagePolicy, 
  resolveStrikeWithBonus, 
  withdrawPersonalDividends, 
  executeIpoVictory, 
  executeMonopolyVictory 
} from '../../game/retailBusinessEngine';
import { sound } from '../../game/audioFx';

interface TycoonProgressionHubWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onOpenBank?: () => void;
}

export const TycoonProgressionHubWindow: React.FC<TycoonProgressionHubWindowProps> = ({
  state,
  onUpdateState,
  onOpenBank
}) => {
  const [activeTab, setActiveTab] = useState<'logistica' | 'marketing' | 'id' | 'rrhh' | 'endgame'>('logistica');
  const [dividendWithdrawInput, setDividendWithdrawInput] = useState<number>(500000);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const currentTier: WarehouseTier = state.warehouseTier || 'garaje';
  const tierConfig = WAREHOUSE_CONFIG[currentTier];
  const maxCapacity = state.maxInventoryCapacity || tierConfig.capacity;
  const currentTotalUnits = (state.products || []).reduce((sum, p) => sum + p.stock, 0);
  const capacityPct = Math.min(100, Math.round((currentTotalUnits / maxCapacity) * 100));
  const isBuildingOwned = state.warehouseOwnership === 'propio';

  const showFeedback = (text: string, isError: boolean = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // 1. Acciones Bienes Raíces
  const handleBuyBuilding = () => {
    const res = buyBuilding(state);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playApprovalStamp();
      showFeedback('¡Enhorabuena! Has adquirido el inmueble como activo propio de la empresa. Alquiler L 0 y registrado como Garantía Real.');
      onUpdateState(res.updatedState);
    }
  };

  const handleUpgradeWarehouse = (targetTier: WarehouseTier) => {
    const res = upgradeWarehouse(state, targetTier);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playCashChime();
      showFeedback(`¡Mudanza corporativa completada a ${WAREHOUSE_CONFIG[targetTier].name}! Capacidad ampliada a ${WAREHOUSE_CONFIG[targetTier].capacity} uds.`);
      onUpdateState(res.updatedState);
    }
  };

  // 2. Acciones Marketing y PVP
  const handleMarkupChange = (val: number) => {
    const updated = updatePricingMarkup(state, val);
    onUpdateState(updated);
  };

  const handleMarketingChange = (val: number) => {
    const updated = updateMarketingSpend(state, val);
    onUpdateState(updated);
  };

  // 3. Acciones I+D
  const handleUnlockTech = (techId: string) => {
    const res = unlockTech(state, techId);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playApprovalStamp();
      showFeedback('¡Investigación completada con éxito! Las mejoras y ventajas competitivas ya están activas.');
      onUpdateState(res.updatedState);
    }
  };

  // 4. Acciones RRHH
  const handleWageChange = (wage: WageLevel) => {
    sound.playClick();
    const updated = updateWagePolicy(state, wage);
    onUpdateState(updated);
  };

  const handleResolveStrike = () => {
    const res = resolveStrikeWithBonus(state);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playApprovalStamp();
      showFeedback('¡Acuerdo laboral firmado! Los trabajadores levantaron la huelga y reanudaron operaciones.');
      onUpdateState(res.updatedState);
    }
  };

  // 5. Acciones Endgame
  const handleWithdrawDividends = () => {
    const res = withdrawPersonalDividends(state, dividendWithdrawInput);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playCashChime();
      showFeedback(`Retiraste L ${res.netReceived?.toLocaleString()} netos a tu cuenta personal tras retener L ${res.taxDeducted?.toLocaleString()} del 10% ISR de dividendos al SAR.`);
      onUpdateState(res.updatedState);
    }
  };

  const handleExecuteIpo = () => {
    const res = executeIpoVictory(state);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playMonthEndBell();
      onUpdateState(res.updatedState);
    }
  };

  const handleExecuteMonopoly = () => {
    const res = executeMonopolyVictory(state);
    if (res.error) {
      sound.playRejectBuzzer();
      showFeedback(res.error, true);
    } else {
      sound.playMonthEndBell();
      onUpdateState(res.updatedState);
    }
  };

  const acquiredCompetitorsCount = (state.activeCompetitors || []).filter(c => c.isAcquired || c.status === 'adquirido_jugador').length;
  const totalCompetitorsCount = (state.activeCompetitors || []).length || 3;
  const profitableMonths = state.consecutiveProfitableMonths || 0;
  const companyValuation = state.companyValuationHNL || 0;
  const personalWealth = state.personalWealthHNL || 0;

  return (
    <div className="font-sans text-xs bg-[#f4f4f4] p-3 space-y-3">
      {/* Banner de Feedback si existe */}
      {feedbackMsg && (
        <div className={`p-2 border font-bold text-xs flex items-center justify-between ${
          feedbackMsg.isError ? 'bg-red-100 border-red-500 text-red-900' : 'bg-emerald-100 border-emerald-500 text-emerald-900'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 font-bold px-1">✕</button>
        </div>
      )}

      {/* Pestañas de Navegación Windows 98 */}
      <div className="flex border-b border-[#808080] gap-1 select-none overflow-x-auto pb-0.5">
        {[
          { id: 'logistica', label: '1. Expansión & Inmuebles', icon: '🏬' },
          { id: 'marketing', label: '2. Demanda & Marketing', icon: '📢' },
          { id: 'id', label: '3. Árbol de I+D', icon: '🔬' },
          { id: 'rrhh', label: '4. Cultura Laboral & RRHH', icon: '👔' },
          { id: 'endgame', label: '5. El Endgame (Victoria)', icon: '🏆' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-3 py-1.5 font-bold text-xs flex items-center gap-1.5 border-t border-l border-r rounded-t ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 border-[#808080] border-b-white -mb-[1px] shadow-sm'
                : 'bg-[#d8d8d8] text-slate-600 border-transparent hover:bg-[#e4e4e4]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de la Pestaña Seleccionada */}
      <div className="bg-white border border-[#808080] p-3 shadow-inner space-y-3">
        {/* ============================================================== */}
        {/* PESTAÑA 1: EXPANSIÓN & BIENES RAÍCES (LOGÍSTICA) */}
        {/* ============================================================== */}
        {activeTab === 'logistica' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{tierConfig.icon}</span>
                  <span>Sede Corporativa Actual: {tierConfig.name}</span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Gestiona la capacidad logística de inventario y la decisión estratégica de Alquiler vs. Compra de inmueble.
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 border ${
                  isBuildingOwned 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {isBuildingOwned ? 'PROPIEDAD PRIVADA (CAPEX)' : 'ALQUILER MENSUAL (OPEX)'}
                </span>
              </div>
            </div>

            {/* Medidor de Capacidad de Almacenamiento */}
            <div className="bg-slate-50 border border-slate-300 p-2.5 space-y-1.5">
              <div className="flex justify-between font-bold text-xs">
                <span>Capacidad de Almacenamiento Ocupada:</span>
                <span className={`font-mono ${currentTotalUnits > maxCapacity ? 'text-red-700' : 'text-slate-800'}`}>
                  {currentTotalUnits} / {maxCapacity} unidades ({capacityPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3 border border-slate-400 overflow-hidden rounded-sm">
                <div
                  className={`h-full transition-all ${
                    capacityPct > 90 ? 'bg-red-600' : capacityPct > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, capacityPct)}%` }}
                />
              </div>
              {currentTotalUnits > maxCapacity && (
                <div className="text-[11px] text-red-700 font-bold flex items-center gap-1 mt-1">
                  <span>⚠️ Cuello de botella logístico: Pagas una multa diaria de L 20 por cada unidad excedida.</span>
                </div>
              )}
            </div>

            {/* Módulo: Decisión Alquiler vs Compra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 border ${isBuildingOwned ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-amber-50/50 border-amber-300'}`}>
                <h4 className="font-bold text-slate-900 mb-1">Régimen Actual: Alquiler (OPEX)</h4>
                <p className="text-[11px] text-slate-600 mb-2">
                  Costo operativo fijo de <span className="font-bold font-mono">L {tierConfig.dailyRent.toLocaleString()}/día</span> (aprox. L {(tierConfig.dailyRent * 30).toLocaleString()}/mes). No requiere inversión inicial pero drena flujo de caja continuamente.
                </p>
                <div className="text-[10px] text-slate-500">
                  Estado: {isBuildingOwned ? 'Superado (Inmueble adquirido)' : 'Activo (se deduce del balance diario)'}
                </div>
              </div>

              <div className={`p-3 border ${isBuildingOwned ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-blue-300'}`}>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Compra del Edificio (CAPEX)</span>
                  <span className="font-mono text-xs font-bold text-blue-900">L {tierConfig.purchasePrice.toLocaleString()}</span>
                </h4>
                <p className="text-[11px] text-slate-600 mb-2.5">
                  Elimina el alquiler a L 0. El edificio pasa al Balance General como Activo Tangible, eleva el Credit Score (+90 pts) y sirve de Garantía Real hipotecaria para préstamos.
                </p>
                {isBuildingOwned ? (
                  <div className="font-bold text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 p-1.5 text-center">
                    ✓ Inmueble propio registrado en Catastro Mercantil
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      disabled={state.storeCash < tierConfig.purchasePrice}
                      onClick={handleBuyBuilding}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-950 disabled:opacity-40"
                    >
                      Comprar Sede al Contado
                    </button>
                    {onOpenBank && (
                      <button
                        onClick={onOpenBank}
                        className="py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950"
                        title="Solicitar crédito hipotecario o comercial"
                      >
                        🏦 Préstamo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Niveles de Sede Disponibles */}
            <div>
              <span className="font-bold text-slate-800 block mb-1.5 text-xs">Escalar Nivel de Sede Corporativa:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {(['garaje', 'bodega', 'fabrica', 'mega_fabrica'] as WarehouseTier[]).map(tierKey => {
                  const cfg = WAREHOUSE_CONFIG[tierKey];
                  const isCurrent = currentTier === tierKey;
                  const isPast = ['garaje', 'bodega', 'fabrica', 'mega_fabrica'].indexOf(currentTier) > ['garaje', 'bodega', 'fabrica', 'mega_fabrica'].indexOf(tierKey);

                  return (
                    <div
                      key={tierKey}
                      className={`p-2.5 border flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' 
                          : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{cfg.icon}</span>
                          <span className="font-mono text-[10px] font-bold text-slate-600">{cfg.capacity} uds</span>
                        </div>
                        <span className="font-bold text-xs block text-slate-900">{cfg.name}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                          {cfg.description}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200">
                        {isCurrent ? (
                          <span className="text-center block text-[10px] font-bold text-blue-800 bg-blue-100 py-0.5">
                            SEDE ACTUAL
                          </span>
                        ) : isPast ? (
                          <span className="text-center block text-[10px] text-slate-400 py-0.5">
                            Nivel Anterior
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpgradeWarehouse(tierKey)}
                            className="w-full py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] border border-amber-500"
                          >
                            Mudarme (L {Math.round(cfg.purchasePrice * 0.05).toLocaleString()})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: MOTOR DE DEMANDA & MARKETING */}
        {/* ============================================================== */}
        {activeTab === 'marketing' && (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Motor de Demanda, Elasticidad y Publicidad</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                La fricción del mercado real: si subes demasiado el precio de venta sin publicidad, los clientes dejarán de comprar.
              </p>
            </div>

            {/* Slider de Elasticidad de Precios (Markup) */}
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Margen de Venta al Público (PVP):</span>
                  <span className="text-[11px] text-slate-500">
                    {state.pricingMarkupPct && state.pricingMarkupPct > 130
                      ? '⚠️ Precio Alto: Los consumidores compran con reserva. Menor afluencia diaria.'
                      : state.pricingMarkupPct && state.pricingMarkupPct < 90
                      ? '🔥 Precio de Oferta: Clientes masivos atraídos por gangas. Cuidado con el inventario.'
                      : '✓ Precio Competitivo: Equilibrio óptimo entre margen de ganancia y rotación.'}
                  </span>
                </div>
                <div className="font-mono text-base font-black text-blue-900 bg-blue-100 px-3 py-1 border border-blue-400">
                  {state.pricingMarkupPct ?? 100}%
                </div>
              </div>

              <input
                type="range"
                min={50}
                max={220}
                step={5}
                value={state.pricingMarkupPct ?? 100}
                onChange={(e) => handleMarkupChange(Number(e.target.value))}
                className="w-full h-3 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50% (Liquidación / Descuento)</span>
                <span>100% (Precio Estándar de Mercado)</span>
                <span>220% (Margen Excesivo)</span>
              </div>
            </div>

            {/* Presupuesto de Marketing Diario */}
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Presupuesto Diario de Publicidad:</span>
                  <span className="text-[11px] text-slate-500">
                    Inyección de capital en canales publicitarios (radio, prensa, vallas y marketing digital).
                  </span>
                </div>
                <div className="font-mono text-base font-black text-emerald-900 bg-emerald-100 px-3 py-1 border border-emerald-400">
                  L {(state.dailyMarketingSpend || 0).toLocaleString()} / día
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={20000}
                step={500}
                value={state.dailyMarketingSpend || 0}
                onChange={(e) => handleMarketingChange(Number(e.target.value))}
                className="w-full h-3 cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                <div className="bg-white p-1 border">L 0 (Solo Orgánico)</div>
                <div className="bg-white p-1 border">L 2,000 (Radio Local)</div>
                <div className="bg-white p-1 border">L 7,500 (Vallas & Redes)</div>
                <div className="bg-white p-1 border">L 15,000+ (TV Nacional)</div>
              </div>
            </div>

            {/* Reputación de Marca & Calidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-2.5 border border-slate-300">
                <span className="text-slate-600 block text-[11px]">Reputación de Marca</span>
                <span className="font-mono text-base font-bold text-amber-900">
                  {state.brandReputation ?? 50} / 100
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Multiplica la efectividad de las campañas publicitarias.
                </span>
              </div>

              <div className="bg-white p-2.5 border border-slate-300">
                <span className="text-slate-600 block text-[11px]">Impacto Proyectado</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  +{Math.floor((state.dailyMarketingSpend || 0) / 250)} Clientes Extra
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Afluencia diaria adicional según inversión de marketing.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: ÁRBOL DE INVESTIGACIÓN Y DESARROLLO (I+D) */}
        {/* ============================================================== */}
        {activeTab === 'id' && (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Árbol de Tecnologías & Investigación (I+D)</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Invierte capital en avances científicos, automatización y nuevos canales comerciales de alta rentabilidad.
              </p>
            </div>

            <div className="space-y-2.5">
              {TYCOON_TECH_TREE.map(tech => {
                const isUnlocked = (state.unlockedTechs || []).includes(tech.id);
                const canAfford = state.storeCash >= tech.costHNL;

                return (
                  <div
                    key={tech.id}
                    className={`p-3 border flex flex-wrap items-center justify-between gap-3 ${
                      isUnlocked 
                        ? 'bg-emerald-50 border-emerald-400' 
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-300 flex items-center justify-center text-xl shadow-sm">
                        {tech.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{tech.name}</span>
                          {isUnlocked && (
                            <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.2 border border-emerald-400">
                              INVESTIGADO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{tech.description}</p>
                        <div className="text-[10px] font-semibold text-blue-900 mt-1">
                          Ventaja: {tech.bonusSummary}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <span className="font-bold text-emerald-800 text-xs px-3 py-1 bg-emerald-100 border border-emerald-300">
                          ✓ ACTIVO
                        </span>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => handleUnlockTech(tech.id)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 disabled:opacity-40"
                        >
                          Investigar (L {tech.costHNL.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: GESTIÓN DE CRISIS & CULTURA LABORAL (RRHH) */}
        {/* ============================================================== */}
        {activeTab === 'rrhh' && (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Cultura Laboral, Salarios y Moral del Personal</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Los colaboradores no son solo un gasto: su motivación influye directamente en la productividad o en el riesgo de huelgas paralizantes.
              </p>
            </div>

            {/* Alerta de Huelga Activa si aplica */}
            {state.isStrikeActive && (
              <div className="bg-red-600 text-white p-3 border-2 border-red-950 flex items-center justify-between shadow">
                <div>
                  <span className="font-black text-sm block">🚨 ¡HUELGA GENERAL DE OPERARIOS!</span>
                  <span className="text-[11px] text-red-100">
                    Las operaciones comerciales están detenidas ({state.strikeDaysRemaining || 1} días restantes). Los costos fijos siguen corriendo.
                  </span>
                </div>
                <button
                  onClick={handleResolveStrike}
                  className="px-3 py-1.5 bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs border border-black shadow cursor-pointer"
                >
                  Negociar Fin de Huelga (Bono L {(state.staffCount * 2000).toLocaleString()})
                </button>
              </div>
            )}

            {/* Medidor de Moral del Personal */}
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-1.5">
              <div className="flex justify-between font-bold text-xs">
                <span>Nivel de Moral y Satisfacción Laboral:</span>
                <span className={`font-mono text-sm ${
                  (state.employeeMorale ?? 80) < 35 ? 'text-red-700' : (state.employeeMorale ?? 80) > 75 ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {Math.round(state.employeeMorale ?? 80)}% {
                    (state.employeeMorale ?? 80) < 35 ? '(Riesgo Inminente de Huelga)' : (state.employeeMorale ?? 80) > 75 ? '(Alta Productividad Activa)' : '(Estable)'
                  }
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3 border border-slate-400 overflow-hidden rounded-sm">
                <div
                  className={`h-full transition-all ${
                    (state.employeeMorale ?? 80) < 35 ? 'bg-red-600' : (state.employeeMorale ?? 80) > 75 ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, state.employeeMorale ?? 80))}%` }}
                />
              </div>
            </div>

            {/* Política Salarial */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Fijar Política Salarial de la Empresa:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'minimo' as WageLevel,
                    title: 'Salario Mínimo Legal',
                    amount: 'L 12,000 / mes',
                    desc: 'Ahorro a corto plazo, pero la moral se deteriora con el tiempo.',
                    moraleEffect: 'Moral decrece (-1.5% diario)'
                  },
                  {
                    id: 'competitivo' as WageLevel,
                    title: 'Salario Competitivo (+20%)',
                    amount: 'L 14,400 / mes',
                    desc: 'Mantiene la armonía laboral y estabilidad en la fuerza de trabajo.',
                    moraleEffect: 'Moral estable (~75%)'
                  },
                  {
                    id: 'premium' as WageLevel,
                    title: 'Salario Premium (+42%)',
                    amount: 'L 17,000 / mes',
                    desc: 'Máxima motivación. Activa el Bono de Productividad (+15% ventas).',
                    moraleEffect: 'Moral máxima (95-100%)'
                  }
                ].map(wageItem => {
                  const isSelected = (state.wageLevel || 'minimo') === wageItem.id;
                  return (
                    <button
                      key={wageItem.id}
                      type="button"
                      onClick={() => handleWageChange(wageItem.id)}
                      className={`p-3 border text-left flex flex-col justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500 shadow-sm' 
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-slate-900">{wageItem.title}</span>
                          {isSelected && <span className="text-blue-700 font-bold text-xs">✓</span>}
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-900 block mb-1">{wageItem.amount}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">{wageItem.desc}</span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] font-semibold text-slate-700">
                        {wageItem.moraleEffect}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 5: EL ENDGAME (CONDICIONES DE VICTORIA) */}
        {/* ============================================================== */}
        {activeTab === 'endgame' && (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Objetivos de Fin de Juego (Endgame)</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Completa cualquiera de los 3 caminos supremos para coronarte como el máximo magnate de la economía hondureña.
              </p>
            </div>

            {/* Camino 1: IPO en Bolsa de Valores */}
            <div className="p-3 border bg-slate-50 border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">1. Salida a Bolsa de Valores (IPO)</h4>
                    <span className="text-[10px] text-slate-500">Valuación mayor a L 50,000,000 + 12 meses rentables consecutivos.</span>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div>Valuación: L {companyValuation.toLocaleString()} / 50M</div>
                  <div>Meses Rentables: {profitableMonths} / 12</div>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-2 border border-slate-300 overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${Math.min(100, (companyValuation / 50000000) * 100)}%` }} 
                />
              </div>

              <div className="flex justify-end">
                <button
                  disabled={companyValuation < 50000000 || profitableMonths < 12}
                  onClick={handleExecuteIpo}
                  className="px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border border-blue-950 disabled:opacity-40"
                >
                  🔔 Tocar la Campana de Wall Street
                </button>
              </div>
            </div>

            {/* Camino 2: Monopolio Absoluto M&A */}
            <div className="p-3 border bg-slate-50 border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">2. Monopolio Absoluto del Mercado (M&A)</h4>
                    <span className="text-[10px] text-slate-500">Adquiere y absorbe al 100% de los 3 rivales comerciales de la ciudad.</span>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-purple-900">
                  {acquiredCompetitorsCount} / {totalCompetitorsCount} Competidores Absorbidos
                </div>
              </div>

              <div className="w-full bg-slate-200 h-2 border border-slate-300 overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${Math.min(100, (acquiredCompetitorsCount / totalCompetitorsCount) * 100)}%` }} 
                />
              </div>

              <div className="flex justify-end">
                <button
                  disabled={acquiredCompetitorsCount < totalCompetitorsCount}
                  onClick={handleExecuteMonopoly}
                  className="px-4 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs border border-purple-950 disabled:opacity-40"
                >
                  👑 Declarar Monopolio Absoluto
                </button>
              </div>
            </div>

            {/* Camino 3: Jubilación Dorada */}
            <div className="p-3 border bg-slate-50 border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌴</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">3. Jubilación Dorada en Roatán</h4>
                    <span className="text-[10px] text-slate-500">Acumula L 10,000,000 netos en tu fortuna personal mediante dividendos (10% ISR al SAR).</span>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-900">
                  Fortuna Personal: L {personalWealth.toLocaleString()} / 10M
                </div>
              </div>

              <div className="w-full bg-slate-200 h-2 border border-slate-300 overflow-hidden">
                <div 
                  className="h-full bg-emerald-600" 
                  style={{ width: `${Math.min(100, (personalWealth / 10000000) * 100)}%` }} 
                />
              </div>

              {/* Retiro de Dividendos */}
              <div className="bg-white p-2 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700">Retirar Utilidades a Cuenta Personal (L):</span>
                  <input
                    type="number"
                    min={10000}
                    step={50000}
                    value={dividendWithdrawInput}
                    onChange={(e) => setDividendWithdrawInput(Math.max(0, Number(e.target.value)))}
                    className="w-32 bg-amber-50 border border-slate-400 px-2 py-0.5 font-mono font-bold text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500">(10% retenido por SAR)</span>
                </div>

                <button
                  disabled={state.storeCash < dividendWithdrawInput || dividendWithdrawInput <= 0}
                  onClick={handleWithdrawDividends}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-950 disabled:opacity-40"
                >
                  Cobrar Dividendos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Victoria Endgame si el jugador lo logró */}
      {state.victoryAchieved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#c0c0c0] border-4 border-amber-400 shadow-2xl p-4 w-full max-w-lg text-center font-sans space-y-3">
            <div className="text-4xl animate-bounce">🏆</div>
            <h2 className="text-xl font-black text-slate-950">
              {state.victoryAchieved === 'ipo' ? '¡SALIDA A BOLSA TRIUNFAL!' : state.victoryAchieved === 'monopolio' ? '¡MONOPOLIO ABSOLUTO ALCANZADO!' : '¡JUBILACIÓN DORADA EN ROATÁN!'}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {state.victoryAchieved === 'ipo'
                ? `Has tocado la campana en la Bolsa de Valores. Tu empresa ${state.storeName} está valuada en más de L 50,000,000 con 12 meses de EBITDA impecable.`
                : state.victoryAchieved === 'monopolio'
                ? `Has absorbido a todos los competidores comerciales. Controlas el 100% de la cuota de mercado en la región.`
                : `Has retirado exitosamente más de L 10,000,000 netos a tu patrimonio personal. Disfrutas de tu retiro frente a las aguas cristalinas del Caribe hondureño.`}
            </p>
            <div className="bg-white p-3 border font-mono text-xs space-y-1 text-left">
              <div>• Empresa: {state.storeName}</div>
              <div>• Valuación Final: L {(state.companyValuationHNL || 0).toLocaleString()}</div>
              <div>• Fortuna Personal: L {(state.personalWealthHNL || 0).toLocaleString()}</div>
              <div>• Sede: {tierConfig.name} ({isBuildingOwned ? 'Propiedad Propia' : 'Alquiler'})</div>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateState({ ...state, victoryAchieved: undefined });
                }}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-black shadow"
              >
                Continuar en Modo Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
