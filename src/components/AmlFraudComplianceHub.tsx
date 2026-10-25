import React, { useState } from 'react';
import { GameState, AmlTransactionAlert, AmlAlertSeverity, AmlInvestigationStatus } from '../game/types';
import { 
  formatHNL, 
  freezeClientAccount, 
  unfreezeClientAccount, 
  fileUifSuspiciousReport, 
  resolveAmlAlert,
  scanAmlTransactions 
} from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  FileCheck2, 
  Archive, 
  AlertTriangle, 
  Search, 
  Scale, 
  Building2, 
  UserX, 
  Clock, 
  FileText,
  BadgeAlert,
  HelpCircle,
  Eye,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface AmlFraudComplianceHubProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
}

export const AmlFraudComplianceHub: React.FC<AmlFraudComplianceHubProps> = ({
  state,
  onUpdateState
}) => {
  const aml = state.amlCompliance;
  const [activeSubTab, setActiveSubTab] = useState<'alertas' | 'uif_dossiers' | 'congeladas' | 'matriz_riesgo'>('alertas');
  const [severityFilter, setSeverityFilter] = useState<'todas' | AmlAlertSeverity>('todas');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pendientes' | 'congeladas' | 'remitidas' | 'archivadas'>('todas');
  const [selectedAlertForReport, setSelectedAlertForReport] = useState<AmlTransactionAlert | null>(null);
  const [customReportNote, setCustomReportNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!aml) {
    return (
      <div className="p-8 text-center text-slate-400">
        Centro AML no inicializado.
      </div>
    );
  }

  const alerts = aml.alerts || aml.transactionAlerts || [];
  const uifReportsList = aml.uifReports || aml.historicalUifReports || [];
  const screenedCount = aml.totalScreenedTransactionsMonth || aml.monthlyScreenedTransactionsCount || 0;
  const suspiciousVol = aml.totalSuspiciousVolumeHNL || aml.suspiciousActivityVolumeHNL || 0;
  const uifCount = aml.uifReportsFiledCount || uifReportsList.length;
  const frozenFunds = aml.totalFrozenFundsHNL || aml.frozenFundsTotalHNL || 0;
  const auditRating = aml.complianceAuditRatingScore || 94.5;

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'todas' && alert.severity !== severityFilter) return false;
    if (statusFilter === 'pendientes' && (alert.status !== 'detectada' && alert.status !== 'bajo_investigacion' && alert.status !== 'abierta' && alert.status !== 'en_analisis')) return false;
    if (statusFilter === 'congeladas' && (alert.status !== 'cuenta_congelada' && alert.status !== 'congelada' && !alert.isAccountFrozen)) return false;
    if (statusFilter === 'remitidas' && (alert.status !== 'remitida_uif' && alert.status !== 'reportada_uif' && !alert.uifReportId)) return false;
    if (statusFilter === 'archivadas' && alert.status !== 'archivada_justificada') return false;
    return true;
  });

  const frozenClients = (state.clients || []).filter(c => c.isFrozen);

  const handleFreeze = (alertId: string, clientName: string) => {
    sound.playAlert();
    const reason = `Inmovilización preventiva por orden de Oficial de Cumplimiento bajo Decreto 144-2014 (Alerta ${alertId})`;
    const res = freezeClientAccount(state, alertId, reason);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleUnfreeze = (clientId: string) => {
    sound.playClick();
    const res = unfreezeClientAccount(state, clientId);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleOpenUifModal = (alert: AmlTransactionAlert) => {
    sound.playClick();
    setSelectedAlertForReport(alert);
    setCustomReportNote(`Se remite Reporte de Operación Sospechosa (ROS) sobre el expediente ${alert.ticketCode || alert.id} correspondiente a ${alert.clientName}. Tipología identificada: ${alert.alertType || alert.type}. Se adjuntan estados de cuenta y pólizas de transacción.`);
  };

  const handleConfirmUifReport = () => {
    if (!selectedAlertForReport) return;
    sound.playInvest();
    const res = fileUifSuspiciousReport(state, selectedAlertForReport.id, customReportNote);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setSelectedAlertForReport(null);
    setCustomReportNote('');
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleArchive = (alertId: string) => {
    sound.playClick();
    const res = resolveAmlAlert(state, alertId, 'archivar_justificada', 'Documentación de respaldo comercial verificada por Oficialía de Cumplimiento. Se archiva sin mérito penal.');
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleFreezeAndReport = (alertId: string) => {
    sound.playAlert();
    const res = resolveAmlAlert(state, alertId, 'congelar_y_reportar', 'Operación de alto riesgo. Se inmovilizan los saldos de inmediato y se traslada expediente al Ministerio Público y UIF.');
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleScanNetwork = () => {
    sound.playApprovalStamp();
    const res = scanAmlTransactions(state);
    onUpdateState(res.updatedState);
    setStatusMessage(res.successMessage);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const getSeverityBadge = (sev: AmlAlertSeverity) => {
    switch (sev) {
      case 'critica':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Severidad Crítica</span>;
      case 'alta':
        return <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Severidad Alta</span>;
      case 'media':
        return <span className="text-blue-400 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" /> Severidad Media</span>;
      default:
        return <span className="text-slate-400 font-medium">Baja</span>;
    }
  };

  const getStatusBadge = (st: AmlInvestigationStatus) => {
    switch (st) {
      case 'cuenta_congelada':
      case 'congelada':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Cuenta Inmovilizada</span>;
      case 'remitida_uif':
      case 'reportada_uif':
        return <span className="text-amber-300 font-semibold flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5" /> Remitida a UIF (ROS)</span>;
      case 'archivada_justificada':
        return <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Archivada Justificada</span>;
      case 'bajo_investigacion':
      case 'en_analisis':
        return <span className="text-cyan-400 font-medium flex items-center gap-1"><Search className="w-3.5 h-3.5" /> En Investigación</span>;
      default:
        return <span className="text-yellow-400 font-medium flex items-center gap-1"><BadgeAlert className="w-3.5 h-3.5" /> Detectada Heurística</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Banner de Notificación de Acción */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-amber-400 hover:text-amber-200 font-mono text-xs ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header Institucional */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Marco Legal Hondureño: Decreto 144-2014 & CNBS Res. 082/2021</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Consola de Prevención de Fraudes, AML/CFT y Cumplimiento UIF
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Monitoreo heurístico transaccional en tiempo real, detección de lavado de activos, listas internacionales OFAC/ONU, congelamiento cautelar de saldos y remisión de expedientes ROS a la Unidad de Información Financiera.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-3 text-right">
            <div>
              <div className="text-xs text-slate-400">Oficial de Cumplimiento Titular</div>
              <div className="text-sm font-bold text-white font-mono">Lic. Fernando Zelaya</div>
              <div className="text-[11px] text-emerald-400 font-medium">Acreditación CNBS #OF-094</div>
            </div>
            <button
              onClick={handleScanNetwork}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              title="Auditar y escanear transacciones en la red bancaria a demanda"
            >
              <Zap className="w-4 h-4" />
              <span>Escanear Red Transaccional</span>
            </button>
          </div>
        </div>

        {/* Barra de KPIs Principales en Formato Denso */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5">
          <div className="border-r border-slate-800/80 pr-2">
            <div className="text-[11px] text-slate-400">Transacciones Analizadas</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              {screenedCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Motor Heurístico 24/7</div>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <div className="text-[11px] text-slate-400">Volumen Sospechoso</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-0.5 tabular-nums">
              {formatHNL(suspiciousVol)}
            </div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Bajo supervisión activa</div>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <div className="text-[11px] text-slate-400">Cuentas Inmovilizadas</div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5 tabular-nums">
              {aml.frozenAccountsCount || 0} titulares
            </div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Orden UIF Decreto 144</div>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <div className="text-[11px] text-slate-400">Fondos Retenidos Custodia</div>
            <div className="text-lg font-bold font-mono text-rose-300 mt-0.5 tabular-nums">
              {formatHNL(frozenFunds)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Inmovilizados en BCH</div>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <div className="text-[11px] text-slate-400">Reportes ROS a UIF</div>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5 tabular-nums">
              {uifCount} remitidos
            </div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">Con acuse de recibo</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Auditoría de Cumplimiento</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {auditRating}%
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Dictamen Favorable</div>
          </div>
        </div>
      </div>

      {/* Navegación por Sub-Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('alertas');
          }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'alertas'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Alertas Heurísticas ({alerts.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('uif_dossiers');
          }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'uif_dossiers'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Expedientes ROS ante UIF ({aml.historicalUifReports?.length || 0})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('congeladas');
          }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'congeladas'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Cuentas Inmovilizadas ({frozenClients.length || aml.frozenAccountsCount})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('matriz_riesgo');
          }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'matriz_riesgo'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Matriz de Tipologías y Marco CNBS
        </button>
      </div>

      {/* SUB-PESTAÑA 1: ALERTAS HEURÍSTICAS */}
      {activeSubTab === 'alertas' && (
        <div className="space-y-4">
          {/* Filtros de Severidad y Estado */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Severidad:</span>
              {(['todas', 'critica', 'alta', 'media'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    severityFilter === sev
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estado de Investigación:</span>
              {(['todas', 'pendientes', 'congeladas', 'remitidas', 'archivadas'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                No hay alertas heurísticas que coincidan con los filtros seleccionados.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isFrozen = alert.status === 'cuenta_congelada';
                const isReported = alert.status === 'remitida_uif';
                const isArchived = alert.status === 'archivada_justificada';

                return (
                  <div
                    key={alert.id}
                    className={`bg-slate-900 border rounded-xl p-4 transition-all shadow-sm ${
                      alert.severity === 'critica'
                        ? 'border-rose-900/60 hover:border-rose-700'
                        : alert.severity === 'alta'
                        ? 'border-amber-900/50 hover:border-amber-700'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="font-mono font-bold text-amber-300">{alert.ticketCode || alert.id}</span>
                        <span className="text-slate-500">·</span>
                        {getSeverityBadge(alert.severity)}
                        <span className="text-slate-500">·</span>
                        {getStatusBadge(alert.status)}
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-mono">Mes {alert.detectedAtMonth || alert.detectedMonth || 1}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 capitalize">Banca {alert.division}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 mr-2">Monto Involucrado:</span>
                        <span className="text-sm font-bold font-mono text-white tabular-nums">
                          {formatHNL(alert.involvedAmountHNL || alert.amountHNL || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Contenido Central del Alerta */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 text-xs">
                      <div className="lg:col-span-2 space-y-2">
                        <div>
                          <span className="text-slate-400">Titular Sospechoso:</span>{' '}
                          <span className="font-bold text-white text-sm">{alert.clientName}</span>{' '}
                          <span className="text-slate-400 font-mono">({alert.clientRtnOrId || alert.clientRtn})</span>
                        </div>

                        <div>
                          <span className="text-slate-400">Heurística Activada:</span>{' '}
                          <span className="text-amber-200">{alert.triggerHeuristic || (alert.evidenceNotes ? alert.evidenceNotes.join(' · ') : 'Patrón heurístico inusual')}</span>
                        </div>

                        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                          {alert.description}
                        </p>
                      </div>

                      {/* Columna Derecha: Acciones Rápidas */}
                      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 space-y-2.5">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-400">Recomendación Oficialía:</div>
                          <div className="text-xs text-slate-300">{alert.recommendedAction || 'Revisar antecedentes comerciales y justificación de fondos'}</div>
                          {(alert.assignedInvestigator || alert.clearedByOfficer) && (
                            <div className="text-[10px] text-cyan-400 font-mono pt-1">
                              Asignado: {alert.assignedInvestigator || alert.clearedByOfficer}
                            </div>
                          )}
                        </div>

                        {/* Botones Operativos */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                          {!isFrozen ? (
                            <button
                              onClick={() => handleFreeze(alert.id, alert.clientName)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                              title="Inmovilizar fondos de la cuenta bajo el Decreto 144-2014"
                            >
                              <Lock className="w-3.5 h-3.5" /> Congelar Saldo
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnfreeze(alert.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                              title="Reactivar cuenta tras descargo técnico"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Descongelar
                            </button>
                          )}

                          {!isReported ? (
                            <button
                              onClick={() => handleOpenUifModal(alert)}
                              className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                              title="Elaborar expediente y radicar Reporte de Operación Sospechosa ante la UIF"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" /> Radicar ROS
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 text-[11px] text-amber-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ROS Remitido
                            </span>
                          )}

                          {!isArchived && !isFrozen && !isReported && (
                            <button
                              onClick={() => handleArchive(alert.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors"
                              title="Archivar caso con sustento técnico documental"
                            >
                              <Archive className="w-3.5 h-3.5" /> Archivar
                            </button>
                          )}

                          {!isFrozen && !isReported && (
                            <button
                              onClick={() => handleFreezeAndReport(alert.id)}
                              className="px-2 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs flex items-center gap-1 transition-colors"
                              title="Acción fulminante: Inmovilizar y Radicar ROS en un solo paso"
                            >
                              Inmovilizar + ROS
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-PESTAÑA 2: EXPEDIENTES ROS ANTE UIF */}
      {activeSubTab === 'uif_dossiers' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white text-sm">Libro Oficial de Reportes de Operaciones Sospechosas (ROS)</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Expedientes radicados bajo estricto sigilo bancario de conformidad con el Art. 34 del Decreto 144-2014 y transmitidos a la plataforma segura de la UIF / CNBS.
              </p>
            </div>
            <div className="font-mono text-cyan-400 font-bold">
              {aml.historicalUifReports?.length || 0} Expedientes Transmitidos
            </div>
          </div>

          <div className="space-y-3">
            {uifReportsList.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                No se han radicado reportes ROS en el ejercicio actual.
              </div>
            ) : (
              uifReportsList.map(dossier => {
                const reportCode = dossier.reportId || dossier.id || 'ROS-UIF-2026-001';
                const expNum = dossier.expedienteNumber || reportCode;
                const fileDate = dossier.filingDate || (dossier.filingMonth ? `Mes ${dossier.filingMonth} - 2026` : 'Mes 1');
                const amount = dossier.involvedAmountHNL || dossier.totalFlaggedAmountHNL || 0;
                const articles = dossier.legalBasisArticles || (dossier.legalBasis ? [dossier.legalBasis] : ['Decreto 144-2014 Art. 34']);
                const receipt = dossier.uifAcknowledgmentReceipt || 'BCH-UIF-REC-771920';

                return (
                  <div key={reportCode} className="bg-slate-900 border border-cyan-900/40 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                          ROS
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{reportCode}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-cyan-300 font-mono text-xs">{expNum}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Fecha de Remisión: {fileDate} · Tipología: <span className="capitalize text-slate-300">{(dossier.typology || 'pitufeo_structuring').replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Monto del Reporte</div>
                        <div className="text-base font-bold font-mono text-amber-300 tabular-nums">
                          {formatHNL(amount)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-slate-400">Titular Reportado:</div>
                        <div className="font-semibold text-white">{dossier.clientName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">RTN/ID: {dossier.clientRtnOrId || dossier.clientRtn}</div>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <div className="text-slate-400">Fundamentación de la Sospecha:</div>
                        <p className="text-slate-300 font-mono text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                          {dossier.suspicionSummary}
                        </p>
                      </div>
                    </div>

                    {/* Estado de Resolución Judicial a 1-2 Meses */}
                    {dossier.rulingOutcome && dossier.rulingOutcome !== 'Pendiente' ? (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-emerald-400" /> Dictamen Judicial Definitivo: {dossier.rulingOutcome}
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                            Mes {dossier.rulingMonth || state.gameMonth}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          {dossier.rulingDetails}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>En trámite procesal ante la UIF: Resolución judicial esperada en <strong>{dossier.monthsUntilResolution !== undefined ? dossier.monthsUntilResolution : 2} mes(es)</strong></span>
                      </div>
                    )}

                    <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400">Base Jurídica Aplicada:</span>
                        <div className="text-slate-300 flex flex-wrap gap-2">
                          {articles.map((art, i) => (
                            <span key={i} className="text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                              {art}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-slate-400">Acuse de Recibo UIF:</span>{' '}
                        <span className="text-emerald-400 font-bold">{receipt}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-PESTAÑA 3: CUENTAS INMOVILIZADAS */}
      {activeSubTab === 'congeladas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white text-sm">Registro de Cuentas Congeladas e Inmovilización de Fondos</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Cuentas bancarias sujetas a restricción total de retiros, transferencias ACH y emisión de cheques por investigación de lavado de activos o fraude financiero.
              </p>
            </div>
            <div className="font-mono text-rose-400 font-bold">
              {formatHNL(aml.frozenFundsTotalHNL || aml.totalFrozenFundsHNL || 0)} en custodia judicial
            </div>
          </div>

          <div className="space-y-3">
            {frozenClients.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                No hay cuentas bancarias inmovilizadas activamente en el catálogo de clientes. Puedes congelar preventivamente cuentas desde la pestaña de Alertas Heurísticas.
              </div>
            ) : (
              frozenClients.map(client => (
                <div key={client.id} className="bg-slate-900 border border-rose-900/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-white text-sm">{client.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 font-mono">{client.cif}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-rose-400 font-mono">RTN: {client.rtn || '0801-1990-00000'}</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px]">
                      Motivo: {client.frozenReason || 'Inmovilización preventiva por orden UIF Decreto 144-2014'}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Segmento: {client.division.toUpperCase()} · Ciudad: {client.city}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Saldo Retenido</div>
                      <div className="text-base font-bold font-mono text-rose-300 tabular-nums">
                        {formatHNL(client.accountBalanceHNL)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnfreeze(client.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                      title="Levantar inmovilización cautelar"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" /> Desbloquear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-PESTAÑA 4: MATRIZ DE TIPOLOGÍAS Y MARCO JURÍDICO */}
      {activeSubTab === 'matriz_riesgo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Marco Legal y Regulatorio de Honduras
            </div>
            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">· Decreto 144-2014:</span>
                <span>Ley Especial contra el Lavado de Activos. Obliga al reporte inmediato de transacciones no justificadas de más de USD 10,000 o equivalentes en Lempiras.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">· Resolución CNBS 082/2021:</span>
                <span>Normas para la Gestión del Riesgo de LA/FT/FPADM en las Instituciones del Sistema Financiero Hondureño.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">· Formulario SAR de Declaración de Origen:</span>
                <span>Obligatoriedad de justificar fuentes comerciales en depósitos en efectivo superiores a L. 240,000.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">· Unidad de Información Financiera (UIF):</span>
                <span>Órgano desconcentrado de la CNBS receptor de los Reportes de Operaciones Sospechosas (ROS) con enlace directo al Ministerio Público.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm border-b border-slate-800 pb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Tipologías de Riesgo Supervisadas en Honduras
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="font-bold text-white">1. Pitufeo o Fraccionamiento (Smurfing)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Depósitos fragmentados en ventanilla bajo L. 200,000 en distintos departamentos (Olancho, Cortés, Comayagua) para evadir el umbral regulatorio.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="font-bold text-white">2. Personas Expuestas Políticamente (PEP)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Depósitos en efectivo y transferencias a cuentas de servidores públicos o sus familiares directos sin correlación con sus ingresos declarados.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="font-bold text-white">3. Sociedades de Pantalla en Zonas Turísticas / Roatán</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Empresas con beneficiarios finales opacos o apoderados en paraísos fiscales que intentan colocar fondos en proyectos inmobiliarios.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="font-bold text-white">4. Clonación de Tarjetas y Fraude en Comercios POS</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Ventas anómalas en horarios nocturnos en gasolineras y comercios afiliados en el Valle de Sula con tarjetas emitidas en el extranjero.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RADICACIÓN DE REPORTE ROS */}
      {selectedAlertForReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                Radicar Reporte de Operación Sospechosa (ROS)
              </div>
              <button
                onClick={() => setSelectedAlertForReport(null)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expediente Alerta:</span>
                  <span className="font-mono text-amber-300 font-bold">{selectedAlertForReport.ticketCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular Reportado:</span>
                  <span className="font-bold text-white">{selectedAlertForReport.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RTN / Documento:</span>
                  <span className="font-mono text-slate-300">{selectedAlertForReport.clientRtnOrId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Involucrado:</span>
                  <span className="font-mono text-white font-bold">{formatHNL(selectedAlertForReport.involvedAmountHNL || selectedAlertForReport.amountHNL || 0)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Fundamento Técnico y Descripción Heurística del ROS:
                </label>
                <textarea
                  value={customReportNote}
                  onChange={e => setCustomReportNote(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Este documento se radicará formalmente con firma digital del Oficial de Cumplimiento Titular ante la plataforma interconectada de la UIF/CNBS en cumplimiento del Decreto 144-2014.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedAlertForReport(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUifReport}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                Transmitir ROS a UIF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
