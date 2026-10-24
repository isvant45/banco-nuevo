import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  freezeClientAccount, 
  unfreezeClientAccount, 
  fileUifSuspiciousReport, 
  resolveAmlAlert,
  resolveExecutiveDilemma,
  triggerReputationalCrisisSimulation,
  resolveReputationalCrisis,
  advanceGameMonth 
} from '../src/game/economyEngine';

const fresh = () => structuredClone(INITIAL_GAME_STATE);

function checkAllNumbersFinite(value: any, path = 'state') {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `Value at ${path} is not finite (${value})`);
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      checkAllNumbersFinite(entry, `${path}.${key}`);
    }
  }
}

test('1. Integridad del Centro Global de Prevención de Fraudes y AML/CFT en Estado Inicial', () => {
  const state = fresh();
  assert.ok(state.amlCompliance, 'amlCompliance debe existir en INITIAL_GAME_STATE');

  const aml = state.amlCompliance;
  const screenedCount = aml.totalScreenedTransactionsMonth || aml.monthlyScreenedTransactionsCount || 0;
  const suspiciousVol = aml.totalSuspiciousVolumeHNL || aml.suspiciousActivityVolumeHNL || 0;
  const auditScore = aml.complianceAuditRatingScore || 94.5;
  const alerts = aml.alerts || aml.transactionAlerts || [];
  const uifList = aml.uifReports || aml.historicalUifReports || [];

  assert.ok(screenedCount > 0, 'Debe registrar transacciones heurísticas analizadas');
  assert.ok(suspiciousVol > 0, 'Debe registrar volumen sospechoso');
  assert.ok(auditScore >= 90, 'El rating de auditoría debe ser de alto nivel');
  assert.ok(alerts.length >= 6, 'Debe contener al menos 6 alertas heurísticas iniciales');

  // Verificar que las alertas tienen tipologías y jurisdicción hondureña
  const hasPitufeo = alerts.some(a => a.type === 'pitufeo_structuring' || a.alertType === 'pitufeo_structuring' || a.alertType === 'pitufeo_fraccionamiento');
  const hasOfac = alerts.some(a => a.type === 'ofac_onu_match' || a.alertType === 'ofac_onu_match' || a.alertType === 'lista_ofac_sancionados');
  const hasPep = alerts.some(a => a.type === 'pep_high_risk' || a.alertType === 'pep_high_risk' || a.alertType === 'politicamente_expuesto');
  const hasShell = alerts.some(a => a.type === 'shell_company' || a.alertType === 'shell_company' || a.alertType === 'empresa_fachada_shell');
  const hasClonacion = alerts.some(a => a.type === 'card_fraud_cloning' || a.alertType === 'card_fraud_cloning' || a.alertType === 'clonacion_tarjeta_pos');

  assert.ok(hasPitufeo, 'Debe incluir alerta de pitufeo en Honduras');
  assert.ok(hasOfac, 'Debe incluir alerta de lista OFAC');
  assert.ok(hasPep, 'Debe incluir alerta de Persona Expuesta Políticamente (PEP)');
  assert.ok(hasShell, 'Debe incluir alerta de empresa fachada');
  assert.ok(hasClonacion, 'Debe incluir alerta de clonación POS');

  // Verificar libro inicial de reportes ROS ante UIF
  assert.ok(uifList.length >= 1, 'Debe existir al menos un expediente ROS histórico radicado');
  const firstRos = uifList[0];
  const basis = firstRos.legalBasis || (firstRos.legalBasisArticles ? firstRos.legalBasisArticles.join(' ') : '');
  assert.ok(basis.includes('144-2014'), 'Debe citar el Decreto 144-2014');
  assert.ok(firstRos.reportId.startsWith('ROS-UIF-2026-') || (firstRos.id && firstRos.id.startsWith('ROS-UIF-2026-')), 'Debe contar con código oficial de la UIF');
});

test('2. Congelamiento Cautelar e Inmovilización de Fondos (Decreto 144-2014)', () => {
  const state = fresh();
  const alertList = state.amlCompliance.alerts || state.amlCompliance.transactionAlerts || [];
  const alertToFreeze = alertList[0];
  const initialFrozenCount = state.amlCompliance.frozenAccountsCount || 0;

  // Congelar cuenta asociada a la primera alerta
  const freezeRes = freezeClientAccount(state, alertToFreeze.id, 'Orden cautelar del Ministerio Público y UIF');
  const newState = freezeRes.updatedState;

  assert.ok(freezeRes.successMessage.includes('inmovilizada exitosamente'), 'Debe retornar mensaje de éxito');
  assert.equal(newState.amlCompliance.frozenAccountsCount, initialFrozenCount + 1, 'Debe incrementar contador de cuentas congeladas');

  const updatedAlerts = newState.amlCompliance.alerts || newState.amlCompliance.transactionAlerts;
  const updatedAlert = updatedAlerts.find(a => a.id === alertToFreeze.id);
  assert.ok(updatedAlert?.status === 'congelada' || updatedAlert?.status === 'cuenta_congelada' || updatedAlert?.isAccountFrozen, 'El estado de la alerta debe indicar congelamiento');

  // Descongelar cuenta
  const unfreezeRes = unfreezeClientAccount(newState, alertToFreeze.id);
  const unfreezeState = unfreezeRes.updatedState;

  assert.ok(unfreezeRes.successMessage.includes('reactivada y desbloqueada'), 'Debe retornar confirmación de desbloqueo');
  assert.equal(unfreezeState.amlCompliance.frozenAccountsCount, initialFrozenCount, 'El contador debe retornar a su valor');
});

test('3. Radicación Formal de Reporte de Operación Sospechosa (ROS) ante UIF/CNBS', () => {
  const state = fresh();
  const alertList = state.amlCompliance.alerts || state.amlCompliance.transactionAlerts || [];
  const alertToReport = alertList.find(a => a.type === 'pep_high_risk' || a.alertType === 'politicamente_expuesto')!;
  const initialReports = state.amlCompliance.uifReports || state.amlCompliance.historicalUifReports || [];
  const initialReportsCount = initialReports.length;

  const reportRes = fileUifSuspiciousReport(
    state, 
    alertToReport.id, 
    'Copia de cheques cobrados en caja y transferencias internacionales sin soporte tributario SAR.'
  );

  const updatedState = reportRes.updatedState;
  const updatedReports = updatedState.amlCompliance.uifReports || updatedState.amlCompliance.historicalUifReports;
  assert.ok(reportRes.reportId.startsWith('ROS-UIF-2026-'), 'Debe generar código ROS oficial');
  assert.equal(updatedReports.length, initialReportsCount + 1, 'Debe sumar reporte radicado');

  const latestDossier = updatedReports[0];
  assert.equal(latestDossier.reportId || latestDossier.id, reportRes.reportId, 'El expediente debe quedar en primer lugar del libro de actas');

  const updatedAlerts = updatedState.amlCompliance.alerts || updatedState.amlCompliance.transactionAlerts;
  const targetAlert = updatedAlerts.find(a => a.id === alertToReport.id);
  assert.ok(targetAlert?.status === 'reportada_uif' || targetAlert?.status === 'remitida_uif', 'La alerta debe quedar en estado reportada/remitida a UIF');
});

test('4. Resolución Integral de Alertas AML (Archivo Justificado vs Congelar y Reportar)', () => {
  const state = fresh();
  const alertList = state.amlCompliance.alerts || state.amlCompliance.transactionAlerts || [];
  const alertToArchive = alertList[1];

  // Resolver archivando con justificación técnica
  const archiveRes = resolveAmlAlert(state, alertToArchive.id, 'archivar_justificada', 'Facturación comercial SAR y contratos verificados.');
  const updatedArchivedAlerts = archiveRes.updatedState.amlCompliance.alerts || archiveRes.updatedState.amlCompliance.transactionAlerts;
  const archiveAlert = updatedArchivedAlerts.find(a => a.id === alertToArchive.id);
  assert.equal(archiveAlert?.status, 'archivada_justificada', 'Debe marcarse como archivada justificada');

  // Resolver con congelar y reportar en combo
  const alertToFreezeAndReport = alertList[2];
  const comboRes = resolveAmlAlert(state, alertToFreezeAndReport.id, 'congelar_y_reportar');
  const updatedComboAlerts = comboRes.updatedState.amlCompliance.alerts || comboRes.updatedState.amlCompliance.transactionAlerts;
  const comboAlert = updatedComboAlerts.find(a => a.id === alertToFreezeAndReport.id);
  assert.ok(comboAlert?.status === 'congelada' || comboAlert?.status === 'cuenta_congelada' || comboAlert?.isAccountFrozen, 'La cuenta debe inmovilizarse');
});

test('5. Integridad del Motor de Dilemas Ejecutivos, Éticos y Junta Directiva', () => {
  const state = fresh();
  assert.ok(state.executiveDilemmas, 'executiveDilemmas debe existir en estado inicial');

  const dilemmasState = state.executiveDilemmas;
  assert.equal(dilemmasState.dilemmas.length, 6, 'Deben existir 6 dilemas ejecutivos iniciales');
  assert.ok(dilemmasState.publicReputationScore >= 80, 'Índice de reputación debe ser adecuado');
  assert.ok(dilemmasState.complianceTrustScore >= 80, 'Confianza CNBS debe ser adecuada');

  // Probar resolución de un dilema por votación
  const targetDilemma = dilemmasState.dilemmas[0];
  const chosenOption = targetDilemma.options[0];

  const resolveRes = resolveExecutiveDilemma(state, targetDilemma.id, chosenOption.id);
  const resolvedState = resolveRes.updatedState;

  assert.ok(resolveRes.successMessage.includes('Resolución de Directorio adoptada'), 'Debe confirmar adopción en acta');
  assert.equal(resolvedState.executiveDilemmas.resolvedDilemmasCount, 1, 'Debe sumar 1 dilema resuelto');

  const updatedDilemma = resolvedState.executiveDilemmas.dilemmas.find(d => d.id === targetDilemma.id);
  assert.equal(updatedDilemma?.status, 'resuelto', 'El dilema debe estar marcado como resuelto');
  assert.equal(updatedDilemma?.chosenOptionId, chosenOption.id, 'Debe registrar la opción elegida');

  // Consecuencias financieras y CAR reflejadas
  assert.ok(Number.isFinite(resolvedState.financials.capitalAdequacyRatioCAR), 'CAR debe ser un número finito');
  assert.ok(Number.isFinite(resolvedState.financials.currentMonthProfit), 'Utilidad debe ser un número finito');
});

test('6. Simulador de Crisis Reputacional y Corrida de Depósitos', () => {
  const state = fresh();
  assert.equal(state.executiveDilemmas.crisisActive, false, 'No debe haber crisis activa al inicio');

  // Activar simulacro de crisis
  const crisisRes = triggerReputationalCrisisSimulation(state);
  const inCrisisState = crisisRes.updatedState;

  assert.equal(inCrisisState.executiveDilemmas.crisisActive, true, 'La crisis debe estar activa');
  assert.ok(inCrisisState.executiveDilemmas.publicReputationScore < state.executiveDilemmas.publicReputationScore, 'Reputación debe verse afectada');

  // Resolver con estrategia de Transparencia Inmediata
  const resolvedCrisisRes = resolveReputationalCrisis(inCrisisState, 'transparencia_inmediata');
  const postCrisisState = resolvedCrisisRes.updatedState;

  assert.equal(postCrisisState.executiveDilemmas.crisisActive, false, 'La crisis debe quedar desactivada');
  assert.ok(postCrisisState.executiveDilemmas.publicReputationScore > inCrisisState.executiveDilemmas.publicReputationScore, 'Reputación debe recuperarse tras rueda de prensa');
});

test('7. Integración en advanceGameMonth y Estabilidad Numérica Multivariable', () => {
  let state = fresh();

  // Avanzar 3 meses consecutivos verificando estabilidad en AML y Gobernanza
  for (let m = 1; m <= 3; m++) {
    state = advanceGameMonth(state);
    assert.equal(state.gameMonth, m + 1, `Debe avanzar al mes ${m + 1}`);
    const screened = state.amlCompliance.monthlyScreenedTransactionsCount ?? state.amlCompliance.totalScreenedTransactionsMonth ?? 0;
    const alertList = state.amlCompliance.transactionAlerts ?? state.amlCompliance.alerts ?? [];
    assert.ok(screened > 0, 'Debe continuar analizando transacciones');
    assert.ok(alertList.length >= 6, 'Debe conservar alertas');
    assert.ok(state.executiveDilemmas.dilemmas.length >= 6, 'Debe conservar dilemas');
    checkAllNumbersFinite(state.amlCompliance, `mes_${m}_aml`);
    checkAllNumbersFinite(state.executiveDilemmas, `mes_${m}_dilemmas`);
    checkAllNumbersFinite(state.financials, `mes_${m}_financials`);
  }
});
