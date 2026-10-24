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
  return state;
}
