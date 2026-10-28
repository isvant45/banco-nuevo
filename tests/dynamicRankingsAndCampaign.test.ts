import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import {
  originateBackToBackFacility,
  useGuaranteedCreditCard,
  payBackToBackInstallment,
  getLeagueTableRankings,
  evaluateCampaignProgress,
  claimCampaignReward,
  executeMarketWarOffensive,
  unlockTechTreeNode,
  structureSyndicatedLoanDeal,
  issueTermDepositCertificate
} from '../src/game/economyEngine';

test('1. Tarjeta de crédito garantizada revolvente: SIN cuota mensual nivelada francesa, límite 90-95% DPF y pago mínimo 5%', () => {
  // 1. Emitir un DPF de L. 1,000,000
  const certRes = issueTermDepositCertificate(INITIAL_GAME_STATE, {
    clientName: 'Inversiones Centroamericanas S.A.',
    principalHNL: 1000000,
    termDays: 360,
    interestRateAnnualPct: 8.5
  });
  const dpf = certRes.certificate;
  assert.ok(dpf);

  // 2. Originar tarjeta de crédito garantizada con 92% de cobertura
  const res = originateBackToBackFacility(certRes.updatedState, {
    dpfCertificateId: dpf.id,
    type: 'tarjeta_garantizada',
    coverageRatioPct: 92,
    spreadRatePct: 3.5
  });

  assert.ok(res.facility);
  const card = res.facility!;

  assert.equal(card.type, 'tarjeta_garantizada');
  assert.equal(card.isRevolving, true);
  // NO debe tener cuota francesa mensual
  assert.equal(card.monthlyQuotaHNL, 0);
  // Límite del 92% de L. 1,000,000 = L. 920,000
  assert.equal(card.approvedAmountHNL, 920000);
  assert.equal(card.creditCardLimitHNL, 920000);
  assert.equal(card.outstandingBalanceHNL, 0);
  assert.equal(card.minimumMonthlyPaymentHNL, 0);
  assert.equal(card.riskWeightingRwaPct, 0);
  assert.equal(card.requiredProvisionHNL, 0);

  // DPF pignorado
  const pledgedDpf = res.updatedState.termDeposits?.find(d => d.id === dpf.id);
  assert.equal(pledgedDpf?.isPledged, true);
  assert.equal(pledgedDpf?.status, 'pignorado');

  // 3. Simular consumo de L. 50,000
  const chargeRes = useGuaranteedCreditCard(res.updatedState, card.id, 50000);
  assert.ok(chargeRes.facility);
  const usedCard = chargeRes.facility!;
  assert.equal(usedCard.outstandingBalanceHNL, 50000);
  // Pago mínimo: 5% de 50,000 = L. 2,500
  assert.equal(usedCard.minimumMonthlyPaymentHNL, 2500);

  // El banco percibe comisión de intercambio de adquirencia (1.8%)
  assert.ok(chargeRes.updatedState.financials.totalFeeIncome > res.updatedState.financials.totalFeeIncome);

  // 4. Pago de L. 20,000 a la tarjeta
  const payRes = payBackToBackInstallment(chargeRes.updatedState, card.id, 20000);
  const updatedCard = payRes.facility!;
  assert.equal(updatedCard.outstandingBalanceHNL, 30000);
  // 5% de 30,000 = L. 1,500
  assert.equal(updatedCard.minimumMonthlyPaymentHNL, 1500);
  // La tarjeta sigue vigente y el DPF sigue pignorado
  assert.equal(updatedCard.status, 'vigente');
});

test('2. Préstamo amortizable Back-to-Back: cuota nivelada francesa y saldo activo', () => {
  const certRes = issueTermDepositCertificate(INITIAL_GAME_STATE, {
    clientName: 'Constructora Sula S.A.',
    principalHNL: 500000,
    termDays: 360,
    interestRateAnnualPct: 8.0
  });
  const dpf = certRes.certificate;

  const res = originateBackToBackFacility(certRes.updatedState, {
    dpfCertificateId: dpf.id,
    type: 'prestamo_garantizado',
    coverageRatioPct: 90,
    termMonths: 24,
    spreadRatePct: 3.0
  });

  const loan = res.facility!;
  assert.equal(loan.type, 'prestamo_garantizado');
  assert.equal(loan.isRevolving, false);
  assert.equal(loan.approvedAmountHNL, 450000);
  assert.equal(loan.outstandingBalanceHNL, 450000);
  assert.ok(loan.monthlyQuotaHNL > 0);
});

test('3. Generación íntegra de League Tables en 4 categorías con 6 bancos rankeados', () => {
  const cardsRankings = getLeagueTableRankings(INITIAL_GAME_STATE, 'tarjetas_credito');
  assert.equal(cardsRankings.length, 6);
  assert.equal(cardsRankings[0].rank, 1);
  assert.equal(cardsRankings[5].rank, 6);
  assert.ok(cardsRankings.some(r => r.isPlayer));

  const consumerRankings = getLeagueTableRankings(INITIAL_GAME_STATE, 'prestamos_consumo');
  assert.equal(consumerRankings.length, 6);

  const privateBankRankings = getLeagueTableRankings(INITIAL_GAME_STATE, 'banca_privada_aum');
  assert.equal(privateBankRankings.length, 6);
  assert.ok(privateBankRankings.some(r => r.bankName.includes('Atlántida')));

  const carRankings = getLeagueTableRankings(INITIAL_GAME_STATE, 'solvencia_car');
  assert.equal(carRankings.length, 6);
});

test('4. Evaluación del progreso de campaña y cobro de recompensas', () => {
  const evaluated = evaluateCampaignProgress(INITIAL_GAME_STATE);
  assert.ok(evaluated.campaignState);

  const ch1 = evaluated.campaignState!.chapters[0];
  const completedMission = ch1.missions.find(m => m.isCompleted && !m.isClaimed);
  assert.ok(completedMission);

  const initialCash = evaluated.financials.cashAndBCHReserves;
  const initialRep = evaluated.executiveDilemmas?.publicReputationScore || 80;

  const claimRes = claimCampaignReward(evaluated, completedMission!.id);
  assert.equal(claimRes.updatedState.campaignState?.totalRewardsClaimedHNL, completedMission!.rewardHNL);
  assert.equal(claimRes.updatedState.financials.cashAndBCHReserves, initialCash + completedMission!.rewardHNL);
  if (claimRes.updatedState.executiveDilemmas) {
    assert.equal(claimRes.updatedState.executiveDilemmas.publicReputationScore, initialRep + completedMission!.rewardReputation);
  }
});

test('5. Ofensiva comercial territorial y conquista de cuota departamental', () => {
  const deptBefore = INITIAL_GAME_STATE.territoryCompetition?.departments.find(d => d.id === 'cortes');
  const playerShareBefore = deptBefore?.playerMarketSharePct || 7.8;

  const res = executeMarketWarOffensive(INITIAL_GAME_STATE, 'cortes', 'tarjetas_promocionales');
  const deptAfter = res.updatedState.territoryCompetition?.departments.find(d => d.id === 'cortes');

  assert.ok(deptAfter!.playerMarketSharePct > playerShareBefore);
  assert.equal(deptAfter?.offensiveCampaignActive, true);
});

test('6. Desbloqueo de nodo en el Árbol Tecnológico Bancario con reducción permanente de OPEX', () => {
  const nodeToUnlock = 'tech-dig-1'; // Banca Móvil 3.0
  const node = INITIAL_GAME_STATE.bankTechTree?.nodes.find(n => n.id === nodeToUnlock);
  assert.ok(node);

  const opexBefore = INITIAL_GAME_STATE.financials.totalOperatingExpense;
  const cashBefore = INITIAL_GAME_STATE.financials.cashAndBCHReserves;

  const res = unlockTechTreeNode(INITIAL_GAME_STATE, nodeToUnlock);
  assert.equal(res.errorMessage, undefined);

  const unlockedNode = res.updatedState.bankTechTree?.nodes.find(n => n.id === nodeToUnlock);
  assert.equal(unlockedNode?.isUnlocked, true);
  assert.equal(res.updatedState.financials.cashAndBCHReserves, cashBefore - node!.capexCostHNL);
  assert.equal(res.updatedState.financials.totalOperatingExpense, opexBefore - node!.monthlyOpexSavingsHNL);
});

test('7. Estructuración de crédito sindicado como Lead Arranger y cobro de honorarios', () => {
  const dealId = 'SYN-2026-003';
  const deal = INITIAL_GAME_STATE.syndicatedLending?.activeDeals.find(d => d.id === dealId);
  assert.ok(deal);

  const expectedFee = Math.round(deal!.totalFacilityAmountHNL * (deal!.arrangerFeePct / 100));

  const res = structureSyndicatedLoanDeal(INITIAL_GAME_STATE, dealId, 'Lead Arranger');
  const updatedDeal = res.updatedState.syndicatedLending?.activeDeals.find(d => d.id === dealId);

  assert.equal(updatedDeal?.status, 'cerrado_vigente');
  assert.equal(updatedDeal?.isPlayerLeadArranger, true);
  assert.equal(updatedDeal?.arrangerFeeEarnedHNL, expectedFee);
  assert.ok((res.updatedState.syndicatedLending?.totalArrangerFeesCollectedHNL || 0) >= expectedFee);
});
