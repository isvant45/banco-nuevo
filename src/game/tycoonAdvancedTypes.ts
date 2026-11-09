/**
 * tycoonAdvancedTypes.ts
 * Definición exhaustiva de tipos de datos para los 14 sistemas Tycoon avanzados:
 * 1. Mercado de Información (Big Data & Fog of War)
 * 2. Lobby Político y Aranceles
 * 3. Dinámicas RPG para C-Suite
 * 4. Tomas Hostiles y Fusiones (M&A)
 * 5. ESG & TwitHN (Fake Twitter)
 * 6. Automatización Condicional (Macros)
 * 7. Deep Web Corporativa
 * 8. Cisnes Negros
 * 9. Vida Privada del CEO & Fortuna Personal
 * 10. Patentes y Propiedad Intelectual
 * 11. Sindicatos y Huelgas Colectivas
 * 12. Especulación de Tesorería (Terminal Financiero)
 * 13. Impacto Ambiental y Sostenibilidad
 * 14. Reproductor Multimedia Retro (ÁureoAmp)
 */

// 1. MERCADO DE INFORMACIÓN (BIG DATA & FOG OF WAR)
export type AnalyticsSubscriptionTier = 'none' | 'basic' | 'corporate';

export interface MarketIntelligenceState {
  subscriptionTier: AnalyticsSubscriptionTier;
  subscriptionCostMonthly: number;
  dataBrokerOptIn: boolean; // Vender datos de clientes
  accumulatedDataRecords: number;
  dataBreachRiskPct: number; // 0 a 100
  dataBreachOccurred: boolean;
  totalDataSalesRevenueHNL: number;
  lastDataSaleDay?: number;
  revealedCompetitorDossiers: Record<string, {
    revealedAtDay: number;
    exactOperatingCost: number;
    exactInventoryUnits: number;
    exactProfitMarginPct: number;
  }>;
}

// 2. LOBBY POLÍTICO Y MANIPULACIÓN DEL ENTORNO
export interface PoliticalLobbyState {
  campaignDonationsTotalHNL: number;
  politicalInfluencePoints: number; // Puntos ganados con donaciones
  importTariffActive: boolean; // 25% de arancel a materias primas extranjeras
  importTariffDaysRemaining: number;
  subsidiesGrantedHNL: number;
  tooBigToFailWorkforcePct: number; // Porcentaje de la fuerza laboral local
  bailoutRequested: boolean;
  bailoutReceivedHNL: number;
  governmentRelationsScore: number; // 0 - 100
}

// 3. DINÁMICAS RPG PARA EL C-SUITE
export type CSuiteRole = 'CFO' | 'COO' | 'CMO' | 'CLO';
export type CSuiteStatus = 'activo' | 'tentado' | 'renunciado' | 'topo_filtrando';

export interface CSuiteExecutive {
  id: string;
  name: string;
  role: CSuiteRole;
  avatar: string;
  bio: string;
  stress: number; // 0 - 100 (sube con deudas y huelgas)
  loyalty: number; // 0 - 100 (baja con alto estrés o bajos sueldos)
  ego: number; // 0 - 100
  monthlySalaryHNL: number;
  perks: string[]; // 'coche_empresa', 'equity_bonus', 'oficina_penthouse', 'club_golf'
  status: CSuiteStatus;
  headhuntedByRival?: {
    rivalName: string;
    offeredSalaryHNL: number;
    daysToRespond: number;
  };
  moleLeakedSecretsCount?: number;
}

// 4. TOMAS HOSTILES Y FUSIONES (M&A)
export interface HostileMnaCompetitor {
  id: string;
  name: string;
  sector: string;
  totalShares: number;
  sharePriceHNL: number;
  playerSharesOwned: number;
  marketSharePct: number;
  companyValuationHNL: number;
  cashSurplusHNL: number;
  poisonPillActive: boolean;
  poisonPillDebtTriggered: boolean;
  isHostileTakeoverComplete: boolean;
}

// 5. ESG Y TWITHN (RED SOCIAL SIMULADA)
export interface FakeTweet {
  id: string;
  authorName: string;
  handle: string;
  avatar: string;
  content: string;
  likes: number;
  retweets: number;
  simDay: number;
  simMonth: number;
  sentiment: 'positivo' | 'negativo' | 'polemico';
  category: 'esg' | 'producto' | 'banca' | 'escandalo' | 'politica';
}

export interface PublicRelationsState {
  esgScore: number; // 0 - 100
  carbonNeutralCertified: boolean;
  boycottActive: boolean;
  boycottDaysRemaining: number;
  prCampaignActive: boolean;
  prCampaignBudgetDailyHNL: number;
  tweets: FakeTweet[];
}

// 6. AUTOMATIZACIÓN CONDICIONAL (REGLAS SI-ENTONCES)
export type TriggerConditionField = 
  | 'caja_menor_que'
  | 'inventario_menor_que'
  | 'moral_menor_que'
  | 'deuda_bancaria_mayor_que';

export type AutomationActionType = 
  | 'transferir_de_banco_a_caja'
  | 'reabastecer_inventario_automatico'
  | 'pagar_cuota_banco_inmediato'
  | 'bono_moral_empleados';

export interface BusinessAutomationRule {
  id: string;
  name: string;
  triggerField: TriggerConditionField;
  triggerValue: number;
  actionType: AutomationActionType;
  actionValue: number;
  isEnabled: boolean;
  executionsCount: number;
  lastExecutedDay?: number;
  lastExecutedMessage?: string;
}

// 7. LA DEEP WEB / MERCADO NEGRO CORPORATIVO
export interface DeepWebSabotageContract {
  id: string;
  type: 'sabotaje_fabrica' | 'robo_patente' | 'rompehuelgas_clandestino' | 'campana_difamacion';
  targetCompetitorId: string;
  targetCompetitorName: string;
  costHNL: number;
  successProbabilityPct: number;
  detectionRiskPct: number;
  daysRemaining: number;
  status: 'en_progreso' | 'exitoso' | 'detectado';
}

export interface DeepWebState {
  isConsoleUnlocked: boolean;
  accessCodeEntered: string;
  ipTraceRiskPct: number; // Si llega a 100% -> Redada Judicial del Ministerio Público
  policeRaidPending: boolean;
  activeContracts: DeepWebSabotageContract[];
}

// 8. CISNES NEGROS (EVENTOS GLOBALES IMPREVISTOS)
export type BlackSwanType = 
  | 'bloqueo_canal_panama' 
  | 'pandemia_cuarentena' 
  | 'revolucion_ia_disruptiva' 
  | 'devaluacion_lempira_shock';

export interface BlackSwanEvent {
  id: string;
  type: BlackSwanType;
  title: string;
  description: string;
  daysRemaining: number;
  rawMaterialsCostMultiplier: number;
  b2cSalesDemandMultiplier: number;
  interestRateSpreadShock: number;
}

// 9. VIDA PRIVADA DEL CEO & PATRIMONIO PERSONAL
export interface LuxuryPersonalAsset {
  id: string;
  name: string;
  category: 'mansion' | 'yate' | 'superauto' | 'club_golf' | 'jet_privado';
  priceHNL: number;
  monthlyMaintenanceHNL: number;
  stressReliefPoints: number;
  prestigeUnlocksAngelInvestors: boolean;
  purchasedDay?: number;
}

export interface CeoPersonalLifeState {
  personalBankBalanceHNL: number;
  ceoStress: number; // 0 - 100 (80+ = riesgo de colapso de salud)
  burnoutWarning: boolean;
  monthlySalaryDrawHNL: number; // Salario asignado del CEO deducible
  luxuryAssetsOwned: LuxuryPersonalAsset[];
  angelInvestorsUnlocked: boolean;
  vacationDaysTaken: number;
}

// 10. PROPIEDAD INTELECTUAL & PATENTES
export interface CorporatePatent {
  id: string;
  title: string;
  registrationType: 'patente_oficial' | 'secreto_industrial';
  protectionYearsRemaining: number;
  dailyPassiveRoyaltiesHNL: number;
  infringementDefended: boolean;
}

export interface PatentLawsuit {
  id: string;
  patentId: string;
  opponentName: string;
  damagesClaimHNL: number;
  defenseCostHNL: number;
  daysRemaining: number;
  isNuisanceTroll: boolean;
}

export interface PatentPortfolioState {
  registeredPatents: CorporatePatent[];
  activeLawsuits: PatentLawsuit[];
  totalRoyaltiesEarnedHNL: number;
}

// 11. SINDICATOS Y HUELGAS COLECTIVAS
export interface UnionLaborState {
  unionizationPct: number; // 0 a 100
  collectiveBargainingCycleDays: number;
  strikeActive: boolean;
  strikeDaysRemaining: number;
  wageDemandIncreasePct: number;
  strikebreakersHired: boolean;
  unionDisputeHistory: string[];
}

// 12. ESPECULACIÓN DE TESORERÍA (TERMINAL FINANCIERO)
export interface CommodityAssetHolding {
  symbol: string;
  name: string;
  category: 'commodity' | 'divisa' | 'bono';
  units: number;
  avgCostHNL: number;
  currentPriceHNL: number;
  dailyPriceHistory: number[];
}

export interface TreasuryTradingState {
  tradingAccountCashHNL: number;
  marginDebtHNL: number;
  marginLimitHNL: number;
  holdings: CommodityAssetHolding[];
  realizedProfitLossHNL: number;
  marginCallActive: boolean;
}

// 13. IMPACTO AMBIENTAL Y SOSTENIBILIDAD
export interface EnvironmentalAgencyState {
  carbonEmissionsTonsMonthly: number;
  greenFiltersInstalled: boolean;
  carbonTaxPenaltyMonthlyHNL: number;
  ministryInspectionPending: boolean;
  environmentalCertificationValid: boolean;
}

// 14. REPRODUCTOR RETRO ÁUREOAMP
export interface AureoAmpTrack {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  genre: 'Synthwave' | 'Lo-Fi' | 'Ambient Bank' | 'Office Jazz';
}

export interface AureoAmpState {
  isPlaying: boolean;
  currentTrackIndex: number;
  volumePct: number;
  repeat: boolean;
  shuffle: boolean;
  playbackSec: number;
}
