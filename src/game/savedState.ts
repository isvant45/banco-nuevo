import { INITIAL_GAME_STATE } from './initialState';
import type { GameState } from './types';
import type { DailySimulationState } from './retroSimTypes';
import { 
  createDefaultRealEstateCollaterals, 
  createInitialSimulatedEmails, 
  createDefaultBankRelationships 
} from './commercialBanksEngine';
import { DEFAULT_INITIAL_SAR_RECORD } from './constructionEngine';

// Fill newly introduced fields without replacing the player's balances or lists.
function mergeDefaults(defaults: any, saved: any): any {
  if (saved === undefined || saved === null) return structuredClone(defaults);
  if (Array.isArray(defaults)) {
    if (!Array.isArray(saved)) return structuredClone(defaults);
    return saved.map(item => {
      const template = defaults.find(d => d?.id && d.id === item?.id);
      return template ? mergeDefaults(template, item) : structuredClone(item);
    });
  }
  if (defaults && typeof defaults === 'object') {
    if (typeof saved !== 'object' || Array.isArray(saved)) return structuredClone(defaults);
    const result = { ...saved };
    for (const key of Object.keys(defaults)) result[key] = mergeDefaults(defaults[key], saved[key]);
    return result;
  }
  if (typeof saved !== typeof defaults || (typeof saved === 'number' && !Number.isFinite(saved))) return defaults;
  return saved;
}

export function restoreGameState(saved: unknown): GameState {
  const state = mergeDefaults(INITIAL_GAME_STATE, saved) as GameState;
  state.payrollAgreements = state.payrollAgreements.map(p => ({
    ...p,
    linkedDivision: p.linkedDivision || 'corporativa',
    bankAccountBalanceHNL: p.bankAccountBalanceHNL ?? 0,
    accountNumber: p.accountNumber || `CEE-${p.id}`,
  }));
  state.dynamicAlerts = state.dynamicAlerts.map(a => ({
    ...a, targetTab: a.targetTab === 'risk' ? 'credit_risk' : a.targetTab === 'credit' ? 'origination' : a.targetTab,
  }));
  if (!state.dividendGovernance) {
    state.dividendGovernance = structuredClone(INITIAL_GAME_STATE.dividendGovernance);
  }
  if (!state.financialSandbox) {
    state.financialSandbox = structuredClone(INITIAL_GAME_STATE.financialSandbox);
  }
  if (!state.strategicImprovements) {
    state.strategicImprovements = structuredClone(INITIAL_GAME_STATE.strategicImprovements);
  }
  if (!state.amlCompliance) {
    state.amlCompliance = structuredClone(INITIAL_GAME_STATE.amlCompliance);
  }
  if (!state.executiveDilemmas) {
    state.executiveDilemmas = structuredClone(INITIAL_GAME_STATE.executiveDilemmas);
  }
  if (!state.termDeposits || state.termDeposits.length === 0) {
    state.termDeposits = structuredClone(INITIAL_GAME_STATE.termDeposits);
  }
  if (!state.backToBackFacilities || state.backToBackFacilities.length === 0) {
    state.backToBackFacilities = structuredClone(INITIAL_GAME_STATE.backToBackFacilities);
  }
  if (!state.demandAccounts || state.demandAccounts.length === 0) {
    state.demandAccounts = structuredClone(INITIAL_GAME_STATE.demandAccounts);
  }
  if (!state.achTransactions || state.achTransactions.length === 0) {
    state.achTransactions = structuredClone(INITIAL_GAME_STATE.achTransactions);
  }
  if (!state.payrollBatches || state.payrollBatches.length === 0) {
    state.payrollBatches = structuredClone(INITIAL_GAME_STATE.payrollBatches);
  }
  if (!state.lettersOfCredit || state.lettersOfCredit.length === 0) {
    state.lettersOfCredit = structuredClone(INITIAL_GAME_STATE.lettersOfCredit);
  }
  if (!state.campaignState) {
    state.campaignState = structuredClone(INITIAL_GAME_STATE.campaignState);
  }
  if (!state.territoryCompetition) {
    state.territoryCompetition = structuredClone(INITIAL_GAME_STATE.territoryCompetition);
  }
  if (!state.bankTechTree) {
    state.bankTechTree = structuredClone(INITIAL_GAME_STATE.bankTechTree);
  }
  if (!state.syndicatedLending) {
    state.syndicatedLending = structuredClone(INITIAL_GAME_STATE.syndicatedLending);
  }
  if (!state.maDeals || state.maDeals.length === 0) {
    state.maDeals = structuredClone(INITIAL_GAME_STATE.maDeals || []);
  }
  if (!state.macroNewsFeed || state.macroNewsFeed.length === 0) {
    state.macroNewsFeed = structuredClone(INITIAL_GAME_STATE.macroNewsFeed || []);
  }
  if (!state.roleMode) {
    state.roleMode = INITIAL_GAME_STATE.roleMode || 'grupo_empresarial';
  }
  if (!state.enterprises || state.enterprises.length === 0) {
    state.enterprises = structuredClone(INITIAL_GAME_STATE.enterprises || []);
  }
  if (!state.selectedEnterpriseId) {
    state.selectedEnterpriseId = state.enterprises[0]?.id || 'ent-001';
  }
  if (!state.lastCashFlowReport) {
    state.lastCashFlowReport = structuredClone(INITIAL_GAME_STATE.lastCashFlowReport);
  }
  if (!state.lastCausalAudit) {
    state.lastCausalAudit = structuredClone(INITIAL_GAME_STATE.lastCausalAudit);
  }
  if (!state.gameSetup) {
    state.gameSetup = structuredClone(INITIAL_GAME_STATE.gameSetup);
  }
  return state;
}

export function restoreDailySimulationState(saved: any): DailySimulationState {
  if (!saved || typeof saved !== 'object') {
    throw new Error('Estado de partida inválido');
  }

  const result: DailySimulationState = { ...saved };
  const storeName = result.storeName || (result.retailSector === 'constructora' ? 'Constructora Metropolitana' : 'Minimarket San Pedro');
  const retailSector = result.retailSector || 'minimarket';
  const storeBank = result.storeBankBalance ?? 120000;

  if (!Array.isArray(result.realEstateCollaterals)) {
    result.realEstateCollaterals = createDefaultRealEstateCollaterals(storeName, retailSector);
  }
  if (!Array.isArray(result.simulatedEmails)) {
    result.simulatedEmails = createInitialSimulatedEmails(storeName, retailSector, storeBank);
  }
  if (!Array.isArray(result.transactionVouchers)) {
    result.transactionVouchers = [];
  }
  if (!Array.isArray(result.dynamicBankOffers)) {
    result.dynamicBankOffers = (result.simulatedEmails || [])
      .filter((e: any) => e.bankOfferPayload)
      .map((e: any) => e.bankOfferPayload!);
  }
  if (!Array.isArray(result.fiscalPeriods)) {
    result.fiscalPeriods = [];
  }
  if (!result.commercialBanks) {
    result.commercialBanks = createDefaultBankRelationships(storeBank);
  }
  if (!result.sarTaxRecord) {
    result.sarTaxRecord = structuredClone(DEFAULT_INITIAL_SAR_RECORD);
  }
  if (result.fiscalSolvenciaActive === undefined) {
    result.fiscalSolvenciaActive = true;
  }
  if (!result.warehouseTier) {
    result.warehouseTier = 'garaje';
  }
  if (!result.warehouseOwnership) {
    result.warehouseOwnership = 'alquiler';
  }
  if (!result.maxInventoryCapacity) {
    result.maxInventoryCapacity = 100;
  }
  if (result.pricingMarkupPct === undefined) {
    result.pricingMarkupPct = 100;
  }
  if (result.dailyMarketingSpend === undefined) {
    result.dailyMarketingSpend = 0;
  }
  if (result.brandReputation === undefined) {
    result.brandReputation = 50;
  }
  if (!Array.isArray(result.unlockedTechs)) {
    result.unlockedTechs = [];
  }
  if (result.employeeMorale === undefined) {
    result.employeeMorale = 80;
  }
  if (!result.wageLevel) {
    result.wageLevel = 'minimo';
  }
  if (result.isStrikeActive === undefined) {
    result.isStrikeActive = false;
  }
  if (result.autoCashierEnabled === undefined) {
    result.autoCashierEnabled = false;
  }
  if (result.personalWealthHNL === undefined) {
    result.personalWealthHNL = 0;
  }
  return result;
}
