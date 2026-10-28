import { INITIAL_GAME_STATE } from './initialState';
import type { GameState } from './types';

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
  return state;
}
