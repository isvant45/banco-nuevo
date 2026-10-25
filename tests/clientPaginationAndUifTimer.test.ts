import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { queryDivisionClients, generateSyntheticClient } from '../src/game/clientRegistry';
import { 
  setAdvisorCreditLimit, 
  approveCreditByOfficer,
  fileUifSuspiciousReport, 
  advanceGameMonth, 
  scanAmlTransactions 
} from '../src/game/economyEngine';
import { GameState } from '../src/game/types';

function fresh(): GameState {
  return JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
}

function checkAllNumbersFinite(obj: any, path = ''): void {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'number') {
    assert.ok(Number.isFinite(obj), `Numero no finito en ${path}: ${obj}`);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => checkAllNumbersFinite(item, `${path}[${i}]`));
    return;
  }
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(k => checkAllNumbersFinite(obj[k], path ? `${path}.${k}` : k));
  }
}

test('1. Paginación y Carga Virtualizada de Cartera Masiva (18,000+ Clientes en Retail)', () => {
  const state = fresh();
  const retailCount = state.divisions.personas.clientCount; // ~18,450
  assert.ok(retailCount >= 18000, 'La banca personas debe tener al menos 18,000 clientes');

  // Página 1 con 25 registros
  const page1 = queryDivisionClients(state.clients, 'personas', retailCount, {
    page: 1,
    pageSize: 25
  });

  assert.equal(page1.clients.length, 25, 'Debe retornar exactamente 25 clientes');
  assert.equal(page1.currentPage, 1);
  assert.equal(page1.pageSize, 25);
  assert.ok(page1.totalPages > 700, 'Debe calcular mas de 700 páginas totales para 18,000+ clientes');
  assert.equal(page1.divisionTotalClients, retailCount);

  // Verificar que los clientes tienen RTN SAR válido y ciudad hondureña
  const firstClient = page1.clients[0];
  assert.ok(firstClient.name.length > 0, 'Debe tener nombre');
  assert.ok(firstClient.rtn || firstClient.cif, 'Debe tener identificador fiscal o CIF');
  assert.ok(firstClient.city.length > 0, 'Debe tener ciudad hondureña');

  // Página 20 con 50 registros
  const page20 = queryDivisionClients(state.clients, 'personas', retailCount, {
    page: 20,
    pageSize: 50
  });
  assert.equal(page20.clients.length, 50);
  assert.equal(page20.currentPage, 20);

  // Búsqueda por filtro de ciudad
  const sulaClients = queryDivisionClients(state.clients, 'personas', retailCount, {
    city: 'San Pedro Sula',
    page: 1,
    pageSize: 25
  });
  assert.ok(sulaClients.clients.length > 0, 'Debe encontrar clientes en San Pedro Sula');
  assert.ok(sulaClients.clients.every(c => c.city.includes('San Pedro Sula')), 'Todos los clientes deben ser de San Pedro Sula');
});

test('2. Autonomía Delegada de Crédito para Asesores hasta L. 50,000,000', () => {
  let state = fresh();

  // Configurar límite a L. 45,000,000 mediante slider
  state = setAdvisorCreditLimit(state, 45000000);
  assert.equal(state.advisorAutoApprovalThresholdHNL, 45000000);

  // Todas las solicitudes menores a 45M deben estar facultadas para aprobación de oficial
  const underLimitApps = state.pendingApplications.filter(a => a.requestedAmount <= 45000000);
  assert.ok(underLimitApps.every(a => a.officerCanAutoApprove === true), 'Deben tener officerCanAutoApprove en true');

  // Aprobar una solicitud dentro del nuevo límite
  const appToApprove = underLimitApps[0];
  const initialCash = state.financials.cashAndBCHReserves;
  const initialLoans = state.financials.loanPortfolioCurrent;

  const res = approveCreditByOfficer(state, appToApprove.id);
  assert.ok(res.successMessage.includes('aprobado con éxito'), 'Debe aprobar de inmediato');
  assert.equal(res.updatedState.financials.cashAndBCHReserves, initialCash - appToApprove.requestedAmount);
  assert.equal(res.updatedState.financials.loanPortfolioCurrent, initialLoans + appToApprove.requestedAmount);
  assert.equal(res.updatedState.advisorApprovalsUsedThisMonth, 1);
});

test('3. Ciclo Procesal UIF: Resolución Legal Diferida a 1-2 Meses', () => {
  let state = fresh();
  const alertToReport = state.amlCompliance.alerts[0];

  // 1. Radicar reporte ROS ante UIF
  const fileRes = fileUifSuspiciousReport(state, alertToReport.id, 'Pruebas de sospecha fundamentadas.');
  state = fileRes.updatedState;

  const filedDossier = state.amlCompliance.uifReports.find(r => r.alertId === alertToReport.id);
  assert.ok(filedDossier, 'El expediente debe existir en el libro');
  assert.equal(filedDossier?.monthsUntilResolution, 2, 'Debe iniciar con plazo de 2 meses');
  assert.equal(filedDossier?.rulingOutcome, 'Pendiente', 'Debe estar pendiente');

  // 2. Avanzar 1 mes -> pasa a plazo de 1 mes y estado en investigación fiscal
  state = advanceGameMonth(state);
  const m1Dossier = state.amlCompliance.uifReports.find(r => r.alertId === alertToReport.id);
  assert.equal(m1Dossier?.monthsUntilResolution, 1, 'Debe quedar en 1 mes de plazo');
  assert.equal(m1Dossier?.uifCaseStatus, 'En Investigación Fiscal');

  // 3. Avanzar segundo mes -> dictamen legal formal emitido
  state = advanceGameMonth(state);
  const m2Dossier = state.amlCompliance.uifReports.find(r => r.alertId === alertToReport.id);
  assert.equal(m2Dossier?.monthsUntilResolution, 0, 'El plazo debe haber concluido');
  assert.ok(m2Dossier?.rulingOutcome && m2Dossier.rulingOutcome !== 'Pendiente', 'Debe haber emitido dictamen judicial formal');
  assert.ok(m2Dossier?.rulingDetails && m2Dossier.rulingDetails.length > 0, 'Debe tener fundamentación del fallo');
});

test('4. Escaneo Activo de la Red Transaccional a Demanda', () => {
  const state = fresh();
  const initialScreened = state.amlCompliance.totalScreenedTransactionsMonth || 124500;

  const scanRes = scanAmlTransactions(state);
  assert.ok(scanRes.successMessage.includes('Escaneo transaccional completado'), 'Debe reportar éxito del escaneo');
  assert.ok(scanRes.updatedState.amlCompliance.totalScreenedTransactionsMonth > initialScreened, 'Debe incrementar transacciones analizadas');
  assert.equal(scanRes.updatedState.amlCompliance.lastScanMonth, state.gameMonth);

  checkAllNumbersFinite(scanRes.updatedState.amlCompliance, 'aml_scan');
});
