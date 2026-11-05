import React, { useState } from 'react';
import { 
  ConstructionTender, 
  ActiveConstructionWork, 
  ConstructionMaterial, 
  ConstructionMaterialId 
} from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';

interface ConstructionBidsWindowProps {
  tenders: ConstructionTender[];
  activeWorks: ActiveConstructionWork[];
  completedWorks: {
    id: string;
    title: string;
    clientName: string;
    contractPrice: number;
    completionDay: number;
    profitEarned: number;
    penaltiesDeducted: number;
  }[];
  materials: ConstructionMaterial[];
  fiscalSolvenciaActive: boolean;
  storeReputation: number;
  staffCount: number;
  onSubmitBid: (tenderId: string, price: number, days: number) => void;
}

export const ConstructionBidsWindow: React.FC<ConstructionBidsWindowProps> = ({
  tenders,
  activeWorks,
  completedWorks,
  materials,
  fiscalSolvenciaActive,
  storeReputation,
  staffCount,
  onSubmitBid
}) => {
  const [activeTab, setActiveTab] = useState<'licitaciones' | 'obras' | 'historial'>('licitaciones');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(tenders[0]?.id || '');
  
  const selectedTender = tenders.find(t => t.id === selectedTenderId) || tenders[0];

  const [bidPrice, setBidPrice] = useState<number>(() => selectedTender ? Math.round(selectedTender.referenceBudget * 0.95) : 3000000);
  const [bidDays, setBidDays] = useState<number>(() => selectedTender ? selectedTender.durationDays : 45);

  const handleSelectTender = (tender: ConstructionTender) => {
    sound.playClick();
    setSelectedTenderId(tender.id);
    setBidPrice(Math.round(tender.referenceBudget * 0.95));
    setBidDays(tender.durationDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;
    sound.playApprovalStamp();
    onSubmitBid(selectedTender.id, bidPrice, bidDays);
  };

  // Helper para verificar inventario versus requerimiento
  const getStock = (id: ConstructionMaterialId) => {
    return materials.find(m => m.id === id)?.stock || 0;
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Barra de Pestañas Retro */}
      <div className="flex items-center gap-1 border-b-2 border-[#808080] p-1 bg-[#dfdfdf]">
        <button
          onClick={() => { sound.playClick(); setActiveTab('licitaciones'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
            activeTab === 'licitaciones' 
              ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' 
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
          }`}
        >
          🏛️ Mesa de Licitaciones ({tenders.filter(t => t.status === 'convocatoria_abierta').length})
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('obras'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
            activeTab === 'obras' 
              ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' 
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
          }`}
        >
          🏗️ Obras en Ejecución ({activeWorks.length})
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('historial'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 ${
            activeTab === 'historial' 
              ? 'bg-[#c0c0c0] border-b-transparent shadow-sm' 
              : 'bg-[#d0d0d0] border-[#808080] text-slate-700'
          }`}
        >
          📜 Historial Entregadas ({completedWorks.length})
        </button>

        <div className="ml-auto flex items-center gap-2 pr-2">
          <span className={`px-2 py-0.5 font-bold border text-[11px] ${
            fiscalSolvenciaActive 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-400' 
              : 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
          }`}>
            {fiscalSolvenciaActive ? '✓ SOLVENCIA FISCAL SAR VIGENTE' : '⚠️ SAR PENDIENTE - NO PUEDE LICITAR CON EL ESTADO'}
          </span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-2 overflow-auto">
        {activeTab === 'licitaciones' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-full">
            {/* Lista Izquierda de Convocatorias */}
            <div className="md:col-span-5 bg-white border border-[#808080] p-1.5 flex flex-col overflow-y-auto">
              <div className="bg-[#000080] text-white px-2 py-1 font-bold text-[11px] mb-1.5 flex justify-between">
                <span>CONVOCATORIAS DISPONIBLES</span>
                <span>TIPO</span>
              </div>

              <div className="space-y-1.5">
                {tenders.map((tender) => {
                  const isSelected = selectedTender?.id === tender.id;
                  const isPublic = tender.category === 'obra_publica';

                  return (
                    <div
                      key={tender.id}
                      onClick={() => handleSelectTender(tender)}
                      className={`p-2 border cursor-pointer ${
                        isSelected 
                          ? 'bg-[#000080] text-white border-blue-900' 
                          : tender.status === 'adjudicada_jugador'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : tender.status === 'adjudicada_rival'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate pr-1">{tender.title}</span>
                        <span className={`text-[10px] px-1 py-0.5 border ${
                          isPublic 
                            ? isSelected ? 'bg-amber-300 text-slate-950 border-amber-400' : 'bg-amber-100 text-amber-900 border-amber-300'
                            : isSelected ? 'bg-sky-200 text-sky-950 border-sky-300' : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}>
                          {isPublic ? '🏛️ GOBIERNO' : '🏢 PRIVADA'}
                        </span>
                      </div>

                      <div className={`text-[11px] mt-1 ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                        Cliente: {tender.clientName}
                      </div>

                      <div className="flex justify-between items-center mt-1.5 text-[11px] font-mono">
                        <span>Base: L {tender.referenceBudget.toLocaleString()}</span>
                        <span>Plazo: {tender.durationDays}d</span>
                      </div>

                      {tender.status === 'adjudicada_jugador' && (
                        <div className="mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 border border-emerald-300">
                          🏆 ¡ADJUDICADA A TU CONSTRUCTORA!
                        </div>
                      )}

                      {tender.status === 'adjudicada_rival' && (
                        <div className="mt-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1 py-0.5 border border-rose-300 truncate">
                          ✗ Adjudicada a {tender.winningBidder} (L {tender.awardedPrice?.toLocaleString()})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Derecho: Detalle de Convocatoria y Presentación de Oferta */}
            {selectedTender ? (
              <div className="md:col-span-7 bg-[#f0f0f0] border border-[#808080] p-2 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-2">
                  <div className="bg-white border border-[#808080] p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{selectedTender.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                        selectedTender.category === 'obra_publica'
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-sky-100 text-sky-900 border-sky-400'
                      }`}>
                        {selectedTender.category === 'obra_publica' ? 'LICITACIÓN PÚBLICA (EXIGE SAR)' : 'LICITACIÓN PRIVADA'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                      <div><strong>Entidad Contratante:</strong> {selectedTender.clientName}</div>
                      <div><strong>Ubicación:</strong> {selectedTender.location}</div>
                      <div><strong>Presupuesto Oficial:</strong> L {selectedTender.referenceBudget.toLocaleString()}</div>
                      <div><strong>Plazo Oficial:</strong> {selectedTender.durationDays} días calendario</div>
                      <div><strong>Anticipo de Inicio:</strong> {selectedTender.advancePaymentPct}% del valor contratado</div>
                      <div><strong>Cuadrilla Mínima:</strong> {selectedTender.requiredWorkersPerDay || 15} hombres/día (Disponibles: {staffCount})</div>
                      <div><strong>Reputación Mínima:</strong> {selectedTender.technicalReputationReq}% (Tuya: {storeReputation}%)</div>
                    </div>

                    {/* Alerta de Solvencia SAR */}
                    {selectedTender.requiresSarSolvencia && (
                      <div className={`mt-2 p-1.5 border text-[11px] flex items-center gap-1.5 ${
                        fiscalSolvenciaActive 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}>
                        <span>{fiscalSolvenciaActive ? '✓' : '⚠️'}</span>
                        <span>
                          {fiscalSolvenciaActive 
                            ? 'Cumple con el requisito: Tu empresa cuenta con Solvencia Fiscal del SAR vigente.' 
                            : 'REQUISITO LEGAL OBLIGATORIO: Se requiere Certificado de Solvencia Fiscal del SAR emitido para adjudicar esta obra pública.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Materiales Estimados Necesarios vs Stock en Almacén */}
                  <div className="bg-white border border-[#808080] p-2">
                    <div className="font-bold text-slate-800 mb-1 flex justify-between">
                      <span>CUBICACIÓN Y MATERIALES NECESARIOS PARA LA OBRA:</span>
                      <span className="text-[10px] text-slate-500">Revisa tu Almacén de Obras</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">🧱 Cemento Gris:</span>
                        <span>{selectedTender.requiredMaterials.cemento_gris} bolsas</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('cemento_gris')}</span>
                      </div>

                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">⛓️ Varilla de Acero:</span>
                        <span>{selectedTender.requiredMaterials.varilla_acero} quintales</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('varilla_acero')}</span>
                      </div>

                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">🧱 Bloques 6":</span>
                        <span>{selectedTender.requiredMaterials.bloque_concreto} millares</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('bloque_concreto')}</span>
                      </div>

                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">🪵 Tablas Encofrado:</span>
                        <span>{selectedTender.requiredMaterials.tabla_encofrado} docenas</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('tabla_encofrado')}</span>
                      </div>

                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">🏖️ Arena y Grava:</span>
                        <span>{selectedTender.requiredMaterials.arena_grava} m³</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('arena_grava')}</span>
                      </div>

                      <div className="p-1 border border-slate-200 bg-slate-50">
                        <span className="font-semibold block">🚜 Maquinaria Pesada:</span>
                        <span>{selectedTender.requiredMaterials.maquinaria_pesada} horas</span>
                        <span className="text-[10px] text-slate-500 block">Stock: {getStock('maquinaria_pesada')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de Oferta si está Abierta */}
                  {selectedTender.status === 'convocatoria_abierta' ? (
                    <form onSubmit={handleSubmit} className="bg-white border border-[#808080] p-2.5 space-y-2">
                      <div className="font-bold text-slate-900 border-b pb-1">
                        FORMULARIO DE PROPUESTA ECONÓMICA Y TÉCNICA (SOBRE CERRADO)
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5">
                            Precio de Oferta (HNL):
                          </label>
                          <input
                            type="number"
                            required
                            min={Math.round(selectedTender.referenceBudget * 0.7)}
                            max={Math.round(selectedTender.referenceBudget * 1.3)}
                            step={10000}
                            value={bidPrice}
                            onChange={(e) => setBidPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-slate-900"
                          />
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Diferencia: {bidPrice < selectedTender.referenceBudget ? '-' : '+'}{Math.abs(Math.round(((bidPrice - selectedTender.referenceBudget) / selectedTender.referenceBudget) * 100))}% vs Base
                          </span>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5">
                            Plazo de Entrega (Días):
                          </label>
                          <input
                            type="number"
                            required
                            min={15}
                            max={120}
                            value={bidDays}
                            onChange={(e) => setBidDays(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-[#808080] px-2 py-1 font-mono font-bold text-slate-900"
                          />
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Oficial: {selectedTender.durationDays} días
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#000080] hover:bg-[#1084d0] text-white font-bold text-xs border-t border-l border-white border-b-2 border-r-2 border-[#000040] shadow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>📨</span>
                        <span>PRESENTAR OFERTA EN MESA DE LICITACIÓN</span>
                      </button>
                    </form>
                  ) : (
                    /* Resultados de la Apertura de Plicas */
                    <div className="bg-white border border-[#808080] p-2.5">
                      <div className="font-bold text-slate-900 border-b pb-1 mb-2">
                        ACTA DE APERTURA DE PLICAS Y RESOLUCIÓN
                      </div>

                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="p-1.5 bg-slate-100 border border-slate-300 font-bold flex justify-between">
                          <span>Oferta de Tu Empresa:</span>
                          <span>L {selectedTender.playerBid?.offeredPrice.toLocaleString()} ({selectedTender.playerBid?.offeredDays} días)</span>
                        </div>

                        <div className="font-bold text-slate-700 text-[10px] mt-2 mb-1">
                          CONTRATISTAS RIVALES QUE COMPITIERON:
                        </div>

                        {selectedTender.rivalBids.map((rival, i) => (
                          <div key={i} className="flex justify-between p-1 border-b border-slate-100 text-slate-700">
                            <span>{rival.contractorName}</span>
                            <span>L {rival.offeredPrice.toLocaleString()} ({rival.offeredDays}d)</span>
                          </div>
                        ))}

                        <div className={`mt-2 p-2 border font-bold text-center ${
                          selectedTender.winningBidder?.includes('Minimarket') || selectedTender.status === 'adjudicada_jugador'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : 'bg-rose-100 text-rose-900 border-rose-400'
                        }`}>
                          {selectedTender.status === 'adjudicada_jugador'
                            ? `¡GANADOR OFICIAL: TU CONSTRUCTORA! Adjudicado por L ${selectedTender.awardedPrice?.toLocaleString()}`
                            : `ADJUDICADO A: ${selectedTender.winningBidder} por L ${selectedTender.awardedPrice?.toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Obras en Ejecución */}
        {activeTab === 'obras' && (
          <div className="space-y-2">
            {activeWorks.length === 0 ? (
              <div className="bg-white border border-[#808080] p-6 text-center text-slate-500">
                <span className="text-3xl block mb-2">🏗️</span>
                <span className="font-bold">No tienes obras en ejecución actualmente.</span>
                <p className="text-xs text-slate-600 mt-1">
                  Participa en la <strong>Mesa de Licitaciones</strong> para adjudicarte contratos del gobierno o de inversión privada.
                </p>
              </div>
            ) : (
              activeWorks.map((work) => (
                <div key={work.id} className="bg-white border-2 border-[#808080] p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{work.title}</h4>
                      <span className="text-[11px] text-slate-600">Cliente: {work.clientName}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-blue-900">
                        L {work.totalContractPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Facturado: L {work.billedMilestonesAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Avance de Obra: {Math.round(work.progressPct)}%</span>
                      <span>Días restantes: {work.daysRemaining} de {work.totalDaysEstimated}</span>
                    </div>

                    <div className="w-full h-4 bg-slate-200 border border-[#808080] p-0.5">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          work.isHaltedForMissingMaterials ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${work.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Cuadrilla y Mano de Obra Diaria */}
                  <div className="mt-2 text-[10px] bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-between">
                    <span>Cuadrilla Requerida: <strong>{work.requiredWorkersPerDay || 15} hombres/día</strong></span>
                    <span>Personal en Obra: <strong>{staffCount} obreros</strong></span>
                    <span className={`px-1.5 py-0.5 font-bold border ${
                      staffCount >= (work.requiredWorkersPerDay || 15) 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {staffCount >= (work.requiredWorkersPerDay || 15) 
                        ? '✓ Cuadrilla Óptima (100% velocidad)' 
                        : `⚠️ Cuadrilla Insuficiente (${Math.round((staffCount / (work.requiredWorkersPerDay || 15)) * 100)}% velocidad)`}
                    </span>
                  </div>

                  {/* Alerta de Paralización por Falta de Materiales */}
                  {work.isHaltedForMissingMaterials && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-300 text-rose-900 text-[11px]">
                      <div className="font-bold flex items-center gap-1">
                        <span>⚠️ OBRA PARALIZADA POR DESABASTECIMIENTO EN EL ALMACÉN</span>
                      </div>
                      <p className="text-[10px] mt-0.5">
                        Insumos agotados requeridos hoy: {work.missingMaterialsList.join(', ')}.
                      </p>
                      <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                        Se están acumulando multas contractuales de L 4,500/día. Compra materiales de inmediato en el Almacén.
                      </p>
                    </div>
                  )}

                  {/* Consumo Diario */}
                  <div className="mt-2 text-[10px] text-slate-600 flex flex-wrap gap-2 bg-slate-50 p-1.5 border border-slate-200">
                    <span className="font-semibold">Consumo diario programado:</span>
                    <span>🧱 Cemento: {work.dailyMaterialNeeds.cemento_gris}/día</span>
                    <span>⛓️ Acero: {work.dailyMaterialNeeds.varilla_acero}/día</span>
                    <span>🧱 Bloques: {work.dailyMaterialNeeds.bloque_concreto}/día</span>
                    <span>🪵 Tablas: {work.dailyMaterialNeeds.tabla_encofrado}/día</span>
                    <span>🏖️ Arena: {work.dailyMaterialNeeds.arena_grava} m³/día</span>
                    <span>🚜 Maquinaria: {work.dailyMaterialNeeds.maquinaria_pesada} hrs/día</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Historial de Obras Entregadas */}
        {activeTab === 'historial' && (
          <div className="bg-white border border-[#808080] p-2">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-[11px] mb-2 flex justify-between">
              <span>OBRA ENTREGADA</span>
              <span>VALOR CONTRATADO</span>
              <span>UTILIDAD NETA</span>
            </div>

            {completedWorks.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No hay obras finalizadas en el archivo aún.
              </div>
            ) : (
              <div className="space-y-1.5">
                {completedWorks.map((comp) => (
                  <div key={comp.id} className="p-2 border border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-bold text-slate-900">{comp.title}</div>
                      <div className="text-[10px] text-slate-500">Cliente: {comp.clientName} · Entregada en Día {comp.completionDay}</div>
                    </div>

                    <div className="font-mono text-slate-700">
                      L {comp.contractPrice.toLocaleString()}
                    </div>

                    <div className="font-mono font-bold text-emerald-800">
                      +L {comp.profitEarned.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
