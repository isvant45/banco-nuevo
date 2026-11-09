import React, { useState } from 'react';
import { RealEstateCollateralItem, DailySimulationState } from '../../game/retroSimTypes';
import { sound } from '../../game/audioFx';
import { requestCollateralAppraisal, releaseRealEstateCollateral } from '../../game/commercialBanksEngine';

interface RealEstateCollateralWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onOpenWindow: (windowId: string, payload?: any) => void;
}

const ASSET_ICONS: Record<string, string> = {
  casa_habitacion: '🏡',
  terreno_comercial: '🗺️',
  local_bodega: '🏭',
  vehiculo_comercial: '🚛',
  maquinaria_pesada: '🚜',
  deposito_plazo: '📜',
  cuentas_por_cobrar: '📄'
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  disponible: { label: 'DISPONIBLE (LIBRE)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400' },
  en_evaluacion: { label: 'EN EVALUACIÓN', color: 'bg-amber-100 text-amber-900 border-amber-400' },
  comprometida: { label: 'GRAVADA / COMPROMETIDA', color: 'bg-rose-100 text-rose-900 border-rose-400' },
  parcialmente_liberada: { label: 'PARCIALMENTE LIBERADA', color: 'bg-sky-100 text-sky-900 border-sky-400' },
  liberada: { label: 'LIBERADA (100% LIBRE)', color: 'bg-teal-100 text-teal-900 border-teal-400' },
  en_recuperacion: { label: 'EN PROCESO JUDICIAL', color: 'bg-red-200 text-red-950 border-red-600' }
};

export const RealEstateCollateralWindow: React.FC<RealEstateCollateralWindowProps> = ({
  state,
  onUpdateState,
  onOpenWindow
}) => {
  const collaterals = state.realEstateCollaterals || [];
  const [selectedAssetId, setSelectedAssetId] = useState<string>(collaterals[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'ficha' | 'gravamenes' | 'documento'>('ficha');
  const [notification, setNotification] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const selectedAsset = collaterals.find(c => c.id === selectedAssetId) || collaterals[0];

  const handleSelectAsset = (id: string) => {
    sound.playClick();
    setSelectedAssetId(id);
    setNotification(null);
  };

  const handleRequestAppraisal = () => {
    if (!selectedAsset) return;
    sound.playClick();
    const res = requestCollateralAppraisal(state, selectedAsset.id);
    if (res.success) {
      sound.playCashRegister();
      onUpdateState(res.updatedState);
      setNotification({ type: 'ok', text: res.message });
    } else {
      sound.playRejectBuzzer();
      setNotification({ type: 'err', text: res.message });
    }
  };

  const handleRelease = () => {
    if (!selectedAsset) return;
    sound.playClick();
    const res = releaseRealEstateCollateral(state, selectedAsset.id);
    if (res.success) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      setNotification({ type: 'ok', text: res.message });
    } else {
      sound.playRejectBuzzer();
      setNotification({ type: 'err', text: res.message });
    }
  };

  // Cobertura total del portafolio
  const totalAppraisal = collaterals.reduce((sum, c) => sum + c.appraisalValueHNL, 0);
  const totalEligible = collaterals.reduce((sum, c) => sum + (c.eligibleValueHNL || c.appraisalValueHNL * 0.75), 0);
  const totalCommitted = collaterals.reduce((sum, c) => sum + (c.committedCoverageHNL || (c.isPledged ? (c.eligibleValueHNL || 0) : 0)), 0);
  const totalAvailableRemaining = Math.max(0, totalEligible - totalCommitted);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Encabezado oficial */}
      <div className="bg-[#003366] text-white p-2 border-b-2 border-[#808080] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <div>
            <h2 className="font-bold text-xs tracking-wider">
              REGISTRO DE GARANTÍAS REALES Y BIENES PATRIMONIALES (HONDURAS)
            </h2>
            <p className="text-[10px] text-sky-200">
              Gestión de Activos, Gravámenes Hipotecarios, Prendas Mercantiles y Capacidad de Respaldo Crediticio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <div className="bg-[#001f3f] px-2 py-0.5 border border-sky-600">
            Bienes Registrados: <strong>{collaterals.length}</strong>
          </div>
          <div className="bg-emerald-900 px-2 py-0.5 border border-emerald-500 text-emerald-200">
            Cobertura Libre: <strong>L {totalAvailableRemaining.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Resumen Métrico de Cobertura */}
      <div className="bg-[#d4d0c8] p-2 border-b border-[#808080] grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
        <div className="bg-white p-1.5 border border-slate-400">
          <span className="text-[10px] text-slate-600 block">Total Avalúo Pericial:</span>
          <strong className="text-slate-900">L {totalAppraisal.toLocaleString()}</strong>
        </div>
        <div className="bg-white p-1.5 border border-slate-400">
          <span className="text-[10px] text-slate-600 block">Valor Elegible Bancario:</span>
          <strong className="text-blue-900">L {totalEligible.toLocaleString()}</strong>
        </div>
        <div className="bg-white p-1.5 border border-slate-400">
          <span className="text-[10px] text-slate-600 block">Gravámenes Comprometidos:</span>
          <strong className="text-rose-900">L {totalCommitted.toLocaleString()}</strong>
        </div>
        <div className="bg-emerald-50 p-1.5 border border-emerald-400">
          <span className="text-[10px] text-emerald-700 block">Disponible para Préstamos:</span>
          <strong className="text-emerald-900">L {totalAvailableRemaining.toLocaleString()}</strong>
        </div>
      </div>

      {/* Mensaje de notificación */}
      {notification && (
        <div className={`p-2 text-xs font-semibold flex items-center justify-between border-b ${
          notification.type === 'ok' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-rose-100 text-rose-900 border-rose-400'
        }`}>
          <span>{notification.type === 'ok' ? '✓' : '⚠️'} {notification.text}</span>
          <button onClick={() => setNotification(null)} className="font-bold px-1 text-slate-600 hover:text-black">✕</button>
        </div>
      )}

      {/* Contenedor Principal: Lista a la izquierda, Ficha técnica a la derecha */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lista de bienes patrimoniales */}
        <div className="w-72 bg-[#e8e4dc] border-r-2 border-[#808080] overflow-y-auto p-1.5 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-600 uppercase px-1">
            Inventario de Bienes Registrados
          </div>

          {collaterals.map((asset) => {
            const isSelected = selectedAsset?.id === asset.id;
            const badge = STATUS_BADGES[asset.status] || STATUS_BADGES.disponible;
            const icon = ASSET_ICONS[asset.assetType] || '🏢';
            const eligible = asset.eligibleValueHNL || Math.round(asset.appraisalValueHNL * (asset.ltvAcceptedPct / 100));

            return (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset.id)}
                className={`p-2 border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#000080] text-white border-black shadow'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <span>{icon}</span> {asset.title}
                  </span>
                </div>

                <div className={`text-[9px] font-mono px-1 py-0.5 inline-block border mb-1.5 ${badge.color}`}>
                  {badge.label}
                </div>

                <div className={`text-[10px] font-mono space-y-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-600'}`}>
                  <div>Avalúo: <strong>L {asset.appraisalValueHNL.toLocaleString()}</strong> ({asset.ltvAcceptedPct}% LTV)</div>
                  <div>Valor Elegible: <strong className={isSelected ? 'text-amber-200' : 'text-blue-900'}>L {eligible.toLocaleString()}</strong></div>
                  <div>Cobertura Libre: <strong className={isSelected ? 'text-emerald-200' : 'text-emerald-800'}>L {(asset.remainingCoverageHNL ?? eligible).toLocaleString()}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ficha técnica detallada del bien seleccionado */}
        <div className="flex-1 bg-white p-3 flex flex-col justify-between overflow-y-auto">
          {selectedAsset ? (
            <div className="space-y-3">
              {/* Pestañas de la ficha */}
              <div className="flex items-center border-b-2 border-[#808080] gap-1 pb-1">
                <button
                  onClick={() => { sound.playClick(); setActiveTab('ficha'); }}
                  className={`px-3 py-1 font-bold text-xs border-t border-l border-white border-b-2 border-r-2 ${
                    activeTab === 'ficha' ? 'bg-[#c0c0c0] border-black text-slate-900' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  📋 Ficha Técnica y Avalúo
                </button>
                <button
                  onClick={() => { sound.playClick(); setActiveTab('gravamenes'); }}
                  className={`px-3 py-1 font-bold text-xs border-t border-l border-white border-b-2 border-r-2 ${
                    activeTab === 'gravamenes' ? 'bg-[#c0c0c0] border-black text-slate-900' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  ⚖️ Gravámenes y Prelación ({(selectedAsset.liensHistory?.length || (selectedAsset.isPledged ? 1 : 0))})
                </button>
                <button
                  onClick={() => { sound.playClick(); setActiveTab('documento'); }}
                  className={`px-3 py-1 font-bold text-xs border-t border-l border-white border-b-2 border-r-2 ${
                    activeTab === 'documento' ? 'bg-[#c0c0c0] border-black text-slate-900' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  📜 Escritura Catastral Simulada
                </button>
              </div>

              {activeTab === 'ficha' && (
                <div className="space-y-3">
                  {/* Encabezado del activo */}
                  <div className="bg-slate-50 border border-slate-300 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{ASSET_ICONS[selectedAsset.assetType] || '🏢'}</span>
                        <span>{selectedAsset.title}</span>
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 border ${STATUS_BADGES[selectedAsset.status]?.color}`}>
                        {STATUS_BADGES[selectedAsset.status]?.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{selectedAsset.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      📍 Ubicación: <strong>{selectedAsset.location}</strong> · Matrícula: <strong>{selectedAsset.registrationNumber}</strong>
                    </div>
                  </div>

                  {/* FÓRMULA DE VALORACIÓN BANCARIA */}
                  <div className="bg-amber-50 border-2 border-amber-300 p-3 space-y-2">
                    <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <span>📐</span> FÓRMULA MATEMÁTICA DE VALORACIÓN Y CAPACIDAD ELEGIBLE:
                    </h4>

                    <div className="p-2 bg-white border border-amber-200 font-mono text-center text-xs space-y-1">
                      <div className="text-slate-700">
                        Valor Avalúo (L {selectedAsset.appraisalValueHNL.toLocaleString()}) × Aceptación ({selectedAsset.ltvAcceptedPct}%) = <strong className="text-blue-900 text-sm">Valor Elegible (L {(selectedAsset.eligibleValueHNL || selectedAsset.appraisalValueHNL * (selectedAsset.ltvAcceptedPct / 100)).toLocaleString()})</strong>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Valor Elegible - Gravámenes Comprometidos (L {(selectedAsset.committedCoverageHNL || 0).toLocaleString()}) = <strong className="text-emerald-900">Cobertura Disponible Restante: L {((selectedAsset.remainingCoverageHNL ?? selectedAsset.eligibleValueHNL) ?? 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-800 leading-tight">
                      ℹ️ <strong>Criterio de Riesgo:</strong> La garantía real respalda el riesgo crediticio del banco. Sin embargo, la aprobación final exige tener capacidad de pago demostrable con el flujo de caja operativo del negocio.
                    </div>
                  </div>

                  {/* Tabla de valores económicos */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="bg-slate-50 p-2 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block">Costo de Adquisición:</span>
                      <strong className="text-slate-900">L {(selectedAsset.acquisitionCostHNL || selectedAsset.acquisitionValueHNL || selectedAsset.marketValueHNL * 0.75).toLocaleString()}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block">Valor Comercial Estimado:</span>
                      <strong className="text-slate-900">L {selectedAsset.marketValueHNL.toLocaleString()}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 border border-slate-300">
                      <span className="text-[10px] text-slate-500 block">Último Avalúo Pericial:</span>
                      <strong className="text-blue-900">L {selectedAsset.appraisalValueHNL.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 italic bg-slate-100 p-2 border border-slate-300">
                    Peritaje vigente: {selectedAsset.appraisalDate}
                  </div>
                </div>
              )}

              {activeTab === 'gravamenes' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-300 p-3">
                    <h4 className="font-bold text-xs text-slate-900 mb-2">
                      Historial de Cargas y Gravámenes Inscriptos (Orden de Prelación)
                    </h4>

                    {selectedAsset.liensHistory && selectedAsset.liensHistory.length > 0 ? (
                      <table className="w-full border-collapse border border-slate-300 text-[11px] font-mono">
                        <thead>
                          <tr className="bg-slate-200 text-slate-800 text-left">
                            <th className="p-1.5 border border-slate-300">Prioridad</th>
                            <th className="p-1.5 border border-slate-300">Acreedor</th>
                            <th className="p-1.5 border border-slate-300">Monto Gravado</th>
                            <th className="p-1.5 border border-slate-300">Fecha Registro</th>
                            <th className="p-1.5 border border-slate-300">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAsset.liensHistory.map((lien, i) => (
                            <tr key={i} className="hover:bg-amber-50">
                              <td className="p-1.5 border border-slate-300 font-bold text-center">
                                {lien.priorityOrder}º Gravamen
                              </td>
                              <td className="p-1.5 border border-slate-300 font-sans font-semibold">
                                {lien.bankName}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-right font-bold text-rose-900">
                                L {lien.committedAmountHNL.toLocaleString()}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-slate-600">
                                {lien.registrationDate}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-bold text-rose-700">
                                INSCRITO
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : selectedAsset.isPledged ? (
                      <div className="p-2 bg-rose-50 border border-rose-300 text-rose-900 text-xs">
                        Este bien tiene un gravamen hipotecario activo vinculado al préstamo <strong>{selectedAsset.linkedDebtId}</strong> con <strong>{selectedAsset.pledgedToBankId?.toUpperCase()}</strong>.
                      </div>
                    ) : (
                      <div className="p-4 text-center text-emerald-800 bg-emerald-50 border border-emerald-300 font-semibold text-xs">
                        ✓ Inmueble libre de todo gravamen. 100% de cobertura disponible para respaldar créditos o licitaciones.
                      </div>
                    )}
                  </div>

                  {selectedAsset.isPledged && (
                    <div className="p-2 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] space-y-1">
                      <strong>⚠️ Restricción Legal de Disposición:</strong>
                      <p>
                        Mientras el activo permanezca comprometido, no puede enajenarse, donarse ni traspasarse libremente. Para disponer de él, debe liquidarse la deuda vinculada o solicitar formalmente una sustitución de garantía ante el banco acreedor.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documento' && (
                <div className="bg-[#fffdf8] border-2 border-[#808080] p-4 font-mono text-xs text-slate-800 space-y-3 shadow-inner">
                  <div className="text-center border-b-2 border-slate-800 pb-2">
                    <span className="text-xl">📜</span>
                    <h3 className="font-bold text-sm tracking-widest uppercase">
                      TESTIMONIO DE ESCRITURA PÚBLICA CATASTRAL (SIMULADO)
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      INSTITUTO DE LA PROPIEDAD DE HONDURAS · SIMULACIÓN — SIN VALIDEZ OFICIAL
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div><strong>INSTRUMENTO NÚMERO:</strong> {selectedAsset.simulatedDeedDocument?.deedNumber || 'ESC-2026-0812'}</div>
                    <div><strong>NOTARIO PÚBLICO AUTORIZANTE:</strong> {selectedAsset.simulatedDeedDocument?.notaryPublic || 'Abogado y Notario Público Colegiado'}</div>
                    <div><strong>REGISTRO CATASTRAL:</strong> {selectedAsset.simulatedDeedDocument?.registrationOffice || 'Oficina Registral de la Propiedad'}</div>
                    <div><strong>PROPIETARIO / TITULAR:</strong> {selectedAsset.ownerName} ({selectedAsset.companyName})</div>
                    <div><strong>DESCRIPCIÓN DEL BIEN:</strong> {selectedAsset.description}</div>
                    <div><strong>VALOR PERICIAL HOMOLOGADO:</strong> L {selectedAsset.appraisalValueHNL.toLocaleString()} HNL</div>
                    <div><strong>ESTADO REGISTRAL:</strong> {selectedAsset.isPledged ? 'GRAVADO CON HIPOTECA BANCARIA' : 'LIBRE DE GRAVAMEN'}</div>
                  </div>

                  <div className="border-t border-slate-300 pt-2 text-[9px] text-slate-400 italic text-center">
                    Documento emitido exclusivamente para la simulación económica empresarial en Áureo Bank.
                  </div>
                </div>
              )}

              {/* Botonera de acciones sobre el activo */}
              <div className="pt-2 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestAppraisal}
                    className="px-3 py-1.5 bg-[#c0c0c0] hover:bg-[#d8d8d8] text-slate-900 font-bold text-xs border-t border-l border-white border-b border-r border-black shadow flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔍</span> Solicitar Nuevo Avalúo (L 4,500)
                  </button>

                  {selectedAsset.isPledged && (
                    <button
                      onClick={handleRelease}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-950 shadow flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔓</span> Solicitar Carta de Libertad de Hipoteca
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onOpenWindow('commercial_banks')}
                  className="px-4 py-1.5 bg-[#000080] hover:bg-[#1010a0] text-white font-bold text-xs border-t border-l border-sky-300 border-b border-r border-black shadow flex items-center gap-1 cursor-pointer"
                >
                  <span>🏦</span> Respaldar Crédito en Banco Comercial
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay bienes seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
