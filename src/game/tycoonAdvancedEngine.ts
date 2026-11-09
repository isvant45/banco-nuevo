/**
 * tycoonAdvancedEngine.ts
 * Motor central de lógica empresarial y financiera para los 14 sistemas Tycoon avanzados:
 * 1. Big Data, Niebla de Guerra & Broker de Datos
 * 2. Lobby Político, Aranceles y Rescates "Too Big to Fail"
 * 3. C-Suite RPG (Ego, Estrés, Fugas de "El Topo", Retención)
 * 4. Tomas Hostiles M&A (51% y Píldora de Veneno)
 * 5. ESG & TwitHN (Virality, Boicots y Relaciones Públicas)
 * 6. Automatización Condicional (Macros de Negocio)
 * 7. Deep Web Corporativa & Sabotajes
 * 8. Cisnes Negros (Eventos Macroeconómicos Inesperados)
 * 9. Meta-Juego Personal del CEO (Salarios, Dividendos con 10% SAR, Activos de Lujo, Burnout)
 * 10. Guerra de Patentes y Secretos Industriales
 * 11. Sindicatos, Huelgas y Negociación Colectiva
 * 12. Terminal de Trading de Tesorería (Commodities, Café, Petróleo, Oro)
 * 13. Regulación Ambiental e Impuesto al Carbono
 * 14. Reproductor Multimedia "ÁureoAmp"
 */

import { DailySimulationState } from './retroSimTypes';
import {
  MarketIntelligenceState,
  PoliticalLobbyState,
  CSuiteExecutive,
  HostileMnaCompetitor,
  PublicRelationsState,
  BusinessAutomationRule,
  DeepWebState,
  DeepWebSabotageContract,
  BlackSwanEvent,
  CeoPersonalLifeState,
  LuxuryPersonalAsset,
  CorporatePatent,
  PatentPortfolioState,
  UnionLaborState,
  TreasuryTradingState,
  CommodityAssetHolding,
  EnvironmentalAgencyState,
  AureoAmpState,
  AureoAmpTrack
} from './tycoonAdvancedTypes';

// ============================================================================
// VALORES POR DEFECTO E INICIALIZADORES
// ============================================================================

export const DEFAULT_LUXURY_CATALOG: LuxuryPersonalAsset[] = [
  {
    id: 'lux_penthouse',
    name: 'Penthouse en Torre Morazán (Piso 22)',
    category: 'mansion',
    priceHNL: 4500000,
    monthlyMaintenanceHNL: 25000,
    stressReliefPoints: 20,
    prestigeUnlocksAngelInvestors: false
  },
  {
    id: 'lux_golf_club',
    name: 'Membresía Vitalicia Country Club de Tegucigalpa',
    category: 'club_golf',
    priceHNL: 1200000,
    monthlyMaintenanceHNL: 15000,
    stressReliefPoints: 15,
    prestigeUnlocksAngelInvestors: true
  },
  {
    id: 'lux_supercar',
    name: 'Porsche 911 Turbo S Edición Ejecutiva',
    category: 'superauto',
    priceHNL: 3800000,
    monthlyMaintenanceHNL: 30000,
    stressReliefPoints: 25,
    prestigeUnlocksAngelInvestors: false
  },
  {
    id: 'lux_yacht',
    name: 'Yate Sunseeker Predator 55 (Roatán Marina)',
    category: 'yate',
    priceHNL: 12500000,
    monthlyMaintenanceHNL: 80000,
    stressReliefPoints: 40,
    prestigeUnlocksAngelInvestors: true
  },
  {
    id: 'lux_jet',
    name: 'Cessna Citation CJ3+ (Hangar Toncontín)',
    category: 'jet_privado',
    priceHNL: 28000000,
    monthlyMaintenanceHNL: 150000,
    stressReliefPoints: 50,
    prestigeUnlocksAngelInvestors: true
  }
];

export const DEFAULT_AUREOAMP_TRACKS: AureoAmpTrack[] = [
  { id: 'track_1', title: 'Silicon Tegucigalpa 1999', artist: 'Honduras Synth Division', durationSec: 215, genre: 'Synthwave' },
  { id: 'track_2', title: 'Bolsa Centroamericana Lo-Fi', artist: 'Lempira Beats', durationSec: 184, genre: 'Lo-Fi' },
  { id: 'track_3', title: 'Bóveda de Medianoche (ASMR)', artist: 'Áureo Sound Labs', durationSec: 240, genre: 'Ambient Bank' },
  { id: 'track_4', title: 'Café de Marcala & Ledger Jazz', artist: 'Tegus Jazz Quartet', durationSec: 198, genre: 'Office Jazz' },
  { id: 'track_5', title: 'Terminal Financiero 56k Modem', artist: 'CyberCopán', durationSec: 165, genre: 'Synthwave' }
];

export const DEFAULT_COMMODITY_PORTFOLIO: CommodityAssetHolding[] = [
  {
    symbol: 'CAFE-HN',
    name: 'Café Grano Oro Especial (Quintales)',
    category: 'commodity',
    units: 0,
    avgCostHNL: 3800,
    currentPriceHNL: 3850,
    dailyPriceHistory: [3700, 3750, 3800, 3820, 3850]
  },
  {
    symbol: 'PETRO-WTI',
    name: 'Petróleo Diésel Industrial (Barriles)',
    category: 'commodity',
    units: 0,
    avgCostHNL: 1950,
    currentPriceHNL: 1980,
    dailyPriceHistory: [2100, 2050, 2000, 1970, 1980]
  },
  {
    symbol: 'ORO-TROY',
    name: 'Onza Troy Oro de Inversión Fiduciario',
    category: 'commodity',
    units: 0,
    avgCostHNL: 62000,
    currentPriceHNL: 62800,
    dailyPriceHistory: [61000, 61500, 62000, 62400, 62800]
  },
  {
    symbol: 'BONO-BCH',
    name: 'Bono Soberano del Banco Central (BCH 10.5%)',
    category: 'bono',
    units: 0,
    avgCostHNL: 10000,
    currentPriceHNL: 10000,
    dailyPriceHistory: [10000, 10000, 10000, 10000, 10000]
  }
];

export function createInitialCSuiteExecutives(): CSuiteExecutive[] {
  return [
    {
      id: 'exec_cfo',
      name: 'Lic. Roberto Villeda',
      role: 'CFO',
      avatar: '👨‍💼',
      bio: 'Ex-auditor de PriceWaterhouse y Banco Atlántida. Especialista en blindaje tributario SAR y colocación de papel comercial.',
      stress: 20,
      loyalty: 85,
      ego: 70,
      monthlySalaryHNL: 65000,
      perks: ['oficina_penthouse'],
      status: 'activo'
    },
    {
      id: 'exec_coo',
      name: 'Ing. Sandra Murillo',
      role: 'COO',
      avatar: '👩‍💼',
      bio: 'Ingeniera industrial graduada en Monterrey. Experta en optimización de inventarios Just-In-Time y renegociación mayorista.',
      stress: 25,
      loyalty: 80,
      ego: 60,
      monthlySalaryHNL: 60000,
      perks: [],
      status: 'activo'
    },
    {
      id: 'exec_cmo',
      name: 'Lic. David Echenique',
      role: 'CMO',
      avatar: '🧑‍💻',
      bio: 'Creativo publicitario galardonado en Centroamérica. Domina el marketing digital viral, posicionamiento de marca y contención de crisis.',
      stress: 15,
      loyalty: 90,
      ego: 75,
      monthlySalaryHNL: 55000,
      perks: ['coche_empresa'],
      status: 'activo'
    }
  ];
}

export function createInitialHostileMnaTargets(): HostileMnaCompetitor[] {
  return [
    {
      id: 'comp_distribuidora_valle',
      name: 'Distribuidora del Valle S. de R.L.',
      sector: 'Comercio Mayorista e Insumos',
      totalShares: 100000,
      sharePriceHNL: 45,
      playerSharesOwned: 0,
      marketSharePct: 18.5,
      companyValuationHNL: 4500000,
      cashSurplusHNL: 950000,
      poisonPillActive: false,
      poisonPillDebtTriggered: false,
      isHostileTakeoverComplete: false
    },
    {
      id: 'comp_logistica_sur',
      name: 'Transportes y Logística del Sur S.A.',
      sector: 'Flota de Carga y Bodegaje',
      totalShares: 200000,
      sharePriceHNL: 62,
      playerSharesOwned: 0,
      marketSharePct: 24.0,
      companyValuationHNL: 12400000,
      cashSurplusHNL: 2100000,
      poisonPillActive: true, // Defensiva activa
      poisonPillDebtTriggered: false,
      isHostileTakeoverComplete: false
    },
    {
      id: 'comp_prefabricados_istmo',
      name: 'Industrias y Prefabricados del Istmo',
      sector: 'Materiales y Manufactura',
      totalShares: 150000,
      sharePriceHNL: 88,
      playerSharesOwned: 0,
      marketSharePct: 21.0,
      companyValuationHNL: 13200000,
      cashSurplusHNL: 1850000,
      poisonPillActive: false,
      poisonPillDebtTriggered: false,
      isHostileTakeoverComplete: false
    }
  ];
}

export function createInitialPublicRelations(): PublicRelationsState {
  return {
    esgScore: 72,
    carbonNeutralCertified: false,
    boycottActive: false,
    boycottDaysRemaining: 0,
    prCampaignActive: false,
    prCampaignBudgetDailyHNL: 0,
    tweets: [
      {
        id: 'tw_init_1',
        authorName: 'Cámara de Comercio e Industrias',
        handle: '@CCIT_Honduras',
        avatar: '🏛️',
        content: 'Felicitamos a las empresas hondureñas que impulsan el empleo formal y la transparencia contable en este ejercicio fiscal.',
        likes: 342,
        retweets: 89,
        simDay: 1,
        simMonth: 1,
        sentiment: 'positivo',
        category: 'politica'
      },
      {
        id: 'tw_init_2',
        authorName: 'Consumidor Alerta HN',
        handle: '@ConsumidorHN',
        avatar: '🛒',
        content: '¿Han notado los precios de la canasta comercial? Ojo con la calidad de los proveedores locales y las fechas de vencimiento.',
        likes: 128,
        retweets: 45,
        simDay: 2,
        simMonth: 1,
        sentiment: 'polemico',
        category: 'producto'
      }
    ]
  };
}

export function createInitialAutomationRules(): BusinessAutomationRule[] {
  return [
    {
      id: 'rule_auto_cash_transfer',
      name: 'Inyección Automática de Caja Chica',
      triggerField: 'caja_menor_que',
      triggerValue: 15000,
      actionType: 'transferir_de_banco_a_caja',
      actionValue: 50000,
      isEnabled: true,
      executionsCount: 0
    },
    {
      id: 'rule_auto_staff_morale',
      name: 'Bono de Emergencia por Moral Baja',
      triggerField: 'moral_menor_que',
      triggerValue: 40,
      actionType: 'bono_moral_empleados',
      actionValue: 10000,
      isEnabled: false,
      executionsCount: 0
    }
  ];
}

export function createInitialTycoonAdvancedState(): {
  marketIntelligence: MarketIntelligenceState;
  politicalLobby: PoliticalLobbyState;
  cSuiteExecutives: CSuiteExecutive[];
  hostileMnaTargets: HostileMnaCompetitor[];
  publicRelations: PublicRelationsState;
  automationRules: BusinessAutomationRule[];
  deepWeb: DeepWebState;
  activeBlackSwan: BlackSwanEvent | null;
  ceoPersonalLife: CeoPersonalLifeState;
  patentPortfolio: PatentPortfolioState;
  unionLabor: UnionLaborState;
  treasuryTrading: TreasuryTradingState;
  environmentalAgency: EnvironmentalAgencyState;
  aureoAmp: AureoAmpState;
} {
  return {
    marketIntelligence: {
      subscriptionTier: 'none',
      subscriptionCostMonthly: 0,
      dataBrokerOptIn: false,
      accumulatedDataRecords: 1250,
      dataBreachRiskPct: 5,
      dataBreachOccurred: false,
      totalDataSalesRevenueHNL: 0,
      revealedCompetitorDossiers: {}
    },
    politicalLobby: {
      campaignDonationsTotalHNL: 0,
      politicalInfluencePoints: 0,
      importTariffActive: false,
      importTariffDaysRemaining: 0,
      subsidiesGrantedHNL: 0,
      tooBigToFailWorkforcePct: 8.5,
      bailoutRequested: false,
      bailoutReceivedHNL: 0,
      governmentRelationsScore: 45
    },
    cSuiteExecutives: createInitialCSuiteExecutives(),
    hostileMnaTargets: createInitialHostileMnaTargets(),
    publicRelations: createInitialPublicRelations(),
    automationRules: createInitialAutomationRules(),
    deepWeb: {
      isConsoleUnlocked: false,
      accessCodeEntered: '',
      ipTraceRiskPct: 0,
      policeRaidPending: false,
      activeContracts: []
    },
    activeBlackSwan: null,
    ceoPersonalLife: {
      personalBankBalanceHNL: 350000,
      ceoStress: 25,
      burnoutWarning: false,
      monthlySalaryDrawHNL: 45000,
      luxuryAssetsOwned: [],
      angelInvestorsUnlocked: false,
      vacationDaysTaken: 0
    },
    patentPortfolio: {
      registeredPatents: [
        {
          id: 'pat_001',
          title: 'Algoritmo de Optimización Logística y Despacho Automatizado',
          registrationType: 'patente_oficial',
          protectionYearsRemaining: 8,
          dailyPassiveRoyaltiesHNL: 450,
          infringementDefended: true
        }
      ],
      activeLawsuits: [],
      totalRoyaltiesEarnedHNL: 0
    },
    unionLabor: {
      unionizationPct: 35,
      collectiveBargainingCycleDays: 90,
      strikeActive: false,
      strikeDaysRemaining: 0,
      wageDemandIncreasePct: 15,
      strikebreakersHired: false,
      unionDisputeHistory: []
    },
    treasuryTrading: {
      tradingAccountCashHNL: 150000,
      marginDebtHNL: 0,
      marginLimitHNL: 500000,
      holdings: DEFAULT_COMMODITY_PORTFOLIO,
      realizedProfitLossHNL: 0,
      marginCallActive: false
    },
    environmentalAgency: {
      carbonEmissionsTonsMonthly: 42,
      greenFiltersInstalled: false,
      carbonTaxPenaltyMonthlyHNL: 0,
      ministryInspectionPending: false,
      environmentalCertificationValid: true
    },
    aureoAmp: {
      isPlaying: false,
      currentTrackIndex: 0,
      volumePct: 75,
      repeat: true,
      shuffle: false,
      playbackSec: 0
    }
  };
}

// ============================================================================
// CICLO DIARIO DE SIMULACIÓN AVANZADA
// ============================================================================

export function processDailyTycoonAdvancedStep(state: DailySimulationState): {
  updatedState: DailySimulationState;
  events: string[];
} {
  const events: string[] = [];
  let nextState = { ...state };

  // Inicializar subsistemas si vienen undefined de partidas previas
  if (!nextState.cSuiteExecutives) {
    const defaults = createInitialTycoonAdvancedState();
    nextState = {
      ...nextState,
      ...defaults
    };
  }

  const currentDay = nextState.currentDay;
  const currentMonth = nextState.currentMonth;

  // --------------------------------------------------------------------------
  // 1. EJECUTAR REGLAS DE AUTOMATIZACIÓN (MACROS)
  // --------------------------------------------------------------------------
  if (nextState.automationRules && nextState.automationRules.length > 0) {
    const updatedRules = nextState.automationRules.map(rule => {
      if (!rule.isEnabled) return rule;

      let triggered = false;
      let logMsg = '';

      if (rule.triggerField === 'caja_menor_que' && nextState.storeCash < rule.triggerValue) {
        if (rule.actionType === 'transferir_de_banco_a_caja') {
          const transferAmount = Math.min(rule.actionValue, nextState.storeBankBalance);
          if (transferAmount > 0) {
            nextState.storeBankBalance -= transferAmount;
            nextState.storeCash += transferAmount;
            triggered = true;
            logMsg = `Auto-Macro [${rule.name}]: Se transfirieron L ${transferAmount.toLocaleString()} de Banco a Caja Chica.`;
          }
        }
      } else if (rule.triggerField === 'moral_menor_que' && (nextState.employeeMorale || 50) < rule.triggerValue) {
        if (rule.actionType === 'bono_moral_empleados') {
          const bonus = rule.actionValue;
          if (nextState.storeCash >= bonus) {
            nextState.storeCash -= bonus;
            nextState.employeeMorale = Math.min(100, (nextState.employeeMorale || 50) + 15);
            triggered = true;
            logMsg = `Auto-Macro [${rule.name}]: Se pagó bono laboral de L ${bonus.toLocaleString()}. Moral +15%.`;
          }
        }
      }

      if (triggered) {
        events.push(logMsg);
        return {
          ...rule,
          executionsCount: rule.executionsCount + 1,
          lastExecutedDay: currentDay,
          lastExecutedMessage: logMsg
        };
      }
      return rule;
    });

    nextState.automationRules = updatedRules;
  }

  // --------------------------------------------------------------------------
  // 2. CISNE NEGRO (BLACK SWANS)
  // --------------------------------------------------------------------------
  if (nextState.activeBlackSwan) {
    const remaining = nextState.activeBlackSwan.daysRemaining - 1;
    if (remaining <= 0) {
      events.push(`Cisne Negro Concluido: El evento "${nextState.activeBlackSwan.title}" ha finalizado y los mercados se normalizan.`);
      nextState.activeBlackSwan = null;
    } else {
      nextState.activeBlackSwan = {
        ...nextState.activeBlackSwan,
        daysRemaining: remaining
      };
    }
  } else {
    // 2% de probabilidad diaria de Cisne Negro si no hay ninguno activo
    if (Math.random() < 0.02) {
      const blackSwansCatalog: BlackSwanEvent[] = [
        {
          id: `bs_panama_${Date.now()}`,
          type: 'bloqueo_canal_panama',
          title: 'Bloqueo en Rutas de Carga Marítima Internacional',
          description: 'Atochamiento crítico y sequía reducen el tránsito interoceánico. Los fletes y materias primas suben un 35%.',
          daysRemaining: 14,
          rawMaterialsCostMultiplier: 1.35,
          b2cSalesDemandMultiplier: 0.90,
          interestRateSpreadShock: 1.0
        },
        {
          id: `bs_ia_${Date.now()}`,
          type: 'revolucion_ia_disruptiva',
          title: 'Disrupción Acelerada por Agentes Autónomos',
          description: 'Nuevas tecnologías de inteligencia artificial disparan la productividad digital pero presionan la demanda tradicional.',
          daysRemaining: 20,
          rawMaterialsCostMultiplier: 0.85,
          b2cSalesDemandMultiplier: 1.25,
          interestRateSpreadShock: 0.5
        },
        {
          id: `bs_deval_${Date.now()}`,
          type: 'devaluacion_lempira_shock',
          title: 'Banda Cambiaria Ajustada por el Banco Central',
          description: 'Deslizamiento del tipo de cambio encarece importaciones y dispara demanda de productos locales hondureños.',
          daysRemaining: 15,
          rawMaterialsCostMultiplier: 1.20,
          b2cSalesDemandMultiplier: 1.15,
          interestRateSpreadShock: 1.5
        }
      ];
      const selectedSwan = blackSwansCatalog[Math.floor(Math.random() * blackSwansCatalog.length)];
      nextState.activeBlackSwan = selectedSwan;
      events.push(`⚠️ ALERTA CISNE NEGRO: "${selectedSwan.title}". Duración estimada: ${selectedSwan.daysRemaining} días.`);
    }
  }

  // --------------------------------------------------------------------------
  // 3. BIG DATA & NIEBLA DE GUERRA & DATA BROKERAGE
  // --------------------------------------------------------------------------
  if (nextState.marketIntelligence) {
    let intel = { ...nextState.marketIntelligence };
    
    // Acumular datos orgánicos de clientes (50 a 120 registros diarios por ventas)
    const newRecords = Math.floor(Math.random() * 70 + 50);
    intel.accumulatedDataRecords += newRecords;

    // Si monetiza datos de clientes (Broker de Datos)
    if (intel.dataBrokerOptIn) {
      intel.dataBreachRiskPct = Math.min(95, intel.dataBreachRiskPct + 1.5);
      
      // Venta recurrente semanal de paquetes de datos
      if (currentDay % 7 === 0) {
        const saleRevenue = Math.round(intel.accumulatedDataRecords * 4.5);
        nextState.storeBankBalance += saleRevenue;
        intel.totalDataSalesRevenueHNL += saleRevenue;
        intel.lastDataSaleDay = currentDay;
        events.push(`Monetización de Datos: Se vendieron ${intel.accumulatedDataRecords.toLocaleString()} perfiles de clientes por L ${saleRevenue.toLocaleString()} a brokers digitales.`);
      }

      // Verificación de Hackeo / Data Breach
      if (Math.random() * 100 < intel.dataBreachRiskPct && !intel.dataBreachOccurred) {
        intel.dataBreachOccurred = true;
        const breachFineHNL = 280000;
        nextState.storeBankBalance = Math.max(0, nextState.storeBankBalance - breachFineHNL);
        if (nextState.publicRelations) {
          nextState.publicRelations.esgScore = Math.max(10, nextState.publicRelations.esgScore - 30);
          nextState.publicRelations.boycottActive = true;
          nextState.publicRelations.boycottDaysRemaining = 7;
          nextState.publicRelations.tweets.unshift({
            id: `tw_breach_${Date.now()}`,
            authorName: 'Honduras Ciberseguridad',
            handle: '@CiberAlertHN',
            avatar: '🚨',
            content: `ESCÁNDALO: Filtración masiva de datos en ${nextState.storeName}. Millones de registros expuestos en la dark web. El Ministerio Público y SAR abren expediente.`,
            likes: 1850,
            retweets: 920,
            simDay: currentDay,
            simMonth: currentMonth,
            sentiment: 'negativo',
            category: 'escandalo'
          });
        }
        events.push(`🚨 CATASTRÓFICO DATA BREACH: Filtración de base de datos de clientes. Multa regulatoria de L ${breachFineHNL.toLocaleString()} y boicot en redes.`);
      }
    }

    nextState.marketIntelligence = intel;
  }

  // --------------------------------------------------------------------------
  // 4. DINÁMICAS RPG DEL C-SUITE (ESTRÉS, LEALTAD Y RIVAL HEADHUNTING)
  // --------------------------------------------------------------------------
  if (nextState.cSuiteExecutives && nextState.cSuiteExecutives.length > 0) {
    const totalCompanyDebt = Object.values(nextState.commercialBanks || {}).reduce((s, b) => s + (b.activeLoan?.balanceRemaining || 0), 0);
    const hasHighDebt = totalCompanyDebt > 2000000;

    const updatedExecutives = nextState.cSuiteExecutives.map(exec => {
      let stress = exec.stress;
      let loyalty = exec.loyalty;

      // Estrés aumenta con deudas o si la empresa está en huelga
      if (hasHighDebt) stress = Math.min(100, stress + 2);
      if (nextState.unionLabor?.strikeActive) stress = Math.min(100, stress + 3);

      // Si tiene perks de lujo, el estrés baja
      if (exec.perks.includes('coche_empresa')) stress = Math.max(0, stress - 1);
      if (exec.perks.includes('oficina_penthouse')) stress = Math.max(0, stress - 1);

      // Si el estrés supera 75, la lealtad cae en picada
      if (stress > 75) {
        loyalty = Math.max(0, loyalty - 3);
      }

      // Si el ejecutivo está resentido y fue despedido o renuncia, se convierte en "El Topo"
      if (loyalty < 20 && exec.status === 'activo' && Math.random() < 0.15) {
        events.push(`⚠️ RIESGO C-SUITE: ${exec.name} (${exec.role}) ha recibido una tentadora oferta de una corporación rival con salario duplicado.`);
        return {
          ...exec,
          stress,
          loyalty,
          status: 'tentado' as const,
          headhuntedByRival: {
            rivalName: 'Grupo Financiero Terra',
            offeredSalaryHNL: Math.round(exec.monthlySalaryHNL * 1.8),
            daysToRespond: 5
          }
        };
      }

      return {
        ...exec,
        stress,
        loyalty
      };
    });

    nextState.cSuiteExecutives = updatedExecutives;
  }

  // --------------------------------------------------------------------------
  // 5. RED SOCIAL TWITHN & VIRALIDAD
  // --------------------------------------------------------------------------
  if (nextState.publicRelations) {
    let pr = { ...nextState.publicRelations };

    // Boicot en curso
    if (pr.boycottActive) {
      pr.boycottDaysRemaining = Math.max(0, pr.boycottDaysRemaining - 1);
      if (pr.boycottDaysRemaining <= 0) {
        pr.boycottActive = false;
        events.push('Relaciones Públicas: El boicot ciudadano contra la empresa ha perdido fuerza y los clientes regresan.');
      }
    }

    // Campaña de lavado de imagen activa
    if (pr.prCampaignActive && pr.prCampaignBudgetDailyHNL > 0) {
      if (nextState.storeBankBalance >= pr.prCampaignBudgetDailyHNL) {
        nextState.storeBankBalance -= pr.prCampaignBudgetDailyHNL;
        pr.esgScore = Math.min(100, pr.esgScore + 2);
      } else {
        pr.prCampaignActive = false;
        events.push('Relaciones Públicas: Campaña de imagen suspendida por falta de fondos en banco.');
      }
    }

    // Generar tweet orgánico aleatorio cada 3 días
    if (currentDay % 3 === 0) {
      const handles = ['@TegucigalpaHoy', '@FinanzasHN', '@EcoHonduras', '@VozDelMercado'];
      const handle = handles[Math.floor(Math.random() * handles.length)];
      const isGoodEsg = pr.esgScore >= 70;
      
      const content = isGoodEsg
        ? `Consumidores destacan el compromiso ambiental y laboral de ${nextState.storeName}. Buen ejemplo para la industria nacional.`
        : `Surgen dudas entre proveedores por las demoras de pago de ${nextState.storeName}. ¿Problemas de liquidez en el sector?`;

      pr.tweets.unshift({
        id: `tw_org_${Date.now()}`,
        authorName: handle.replace('@', ''),
        handle,
        avatar: isGoodEsg ? '⭐' : '💬',
        content,
        likes: Math.floor(Math.random() * 400 + 80),
        retweets: Math.floor(Math.random() * 120 + 20),
        simDay: currentDay,
        simMonth: currentMonth,
        sentiment: isGoodEsg ? 'positivo' : 'polemico',
        category: 'esg'
      });

      // Mantener máximo 25 tweets en memoria
      if (pr.tweets.length > 25) {
        pr.tweets = pr.tweets.slice(0, 25);
      }
    }

    nextState.publicRelations = pr;
  }

  // --------------------------------------------------------------------------
  // 6. DEEP WEB & SABOTAJES ACTIVOS
  // --------------------------------------------------------------------------
  if (nextState.deepWeb && nextState.deepWeb.activeContracts.length > 0) {
    let dw = { ...nextState.deepWeb };
    const remainingContracts: DeepWebSabotageContract[] = [];

    for (const contract of dw.activeContracts) {
      const days = contract.daysRemaining - 1;
      if (days <= 0) {
        // Ejecución del contrato
        const isSuccess = Math.random() * 100 < contract.successProbabilityPct;
        const isDetected = Math.random() * 100 < contract.detectionRiskPct;

        if (isSuccess) {
          events.push(`🕶️ Operación Clandestina Exitosa: El contrato de "${contract.type}" contra "${contract.targetCompetitorName}" paralizó su producción por 2 semanas.`);
        } else {
          events.push(`❌ Operación Fallida: El operativo encubierto contra "${contract.targetCompetitorName}" fue frustrado.`);
        }

        if (isDetected) {
          dw.ipTraceRiskPct = Math.min(100, dw.ipTraceRiskPct + 45);
          events.push(`⚠️ RASTREO JUDICIAL: Peritos forenses rastrearon la dirección IP del ataque hacia sus servidores corporativos (+45% sospecha).`);
          if (dw.ipTraceRiskPct >= 90) {
            dw.policeRaidPending = true;
            events.push(`🚨 ALERTA CRÍTICA: El Ministerio Público ha solicitado orden de allanamiento a las oficinas de la empresa.`);
          }
        }
      } else {
        remainingContracts.push({ ...contract, daysRemaining: days });
      }
    }

    dw.activeContracts = remainingContracts;
    nextState.deepWeb = dw;
  }

  // --------------------------------------------------------------------------
  // 7. TERMINAL DE TRADING Y COMMODITIES (PRECIOS Y FLUCTUACIONES)
  // --------------------------------------------------------------------------
  if (nextState.treasuryTrading) {
    let tt = { ...nextState.treasuryTrading };
    const updatedHoldings = tt.holdings.map(h => {
      // Fluctuación browniana diaria razonable (+/- 1.5% a 3%)
      const changePct = (Math.random() * 6 - 2.8) / 100;
      const newPrice = Math.max(10, Math.round(h.currentPriceHNL * (1 + changePct)));
      const history = [...h.dailyPriceHistory.slice(-14), newPrice];
      return {
        ...h,
        currentPriceHNL: newPrice,
        dailyPriceHistory: history
      };
    });

    // Validar Margen y Margin Call
    const totalHoldingsValue = updatedHoldings.reduce((sum, h) => sum + (h.units * h.currentPriceHNL), 0);
    const totalEquity = tt.tradingAccountCashHNL + totalHoldingsValue - tt.marginDebtHNL;
    
    if (tt.marginDebtHNL > 0 && totalEquity < (tt.marginDebtHNL * 0.25)) {
      tt.marginCallActive = true;
      events.push(`⚠️ MARGIN CALL EN TESORERÍA: El valor de colateral bursátil cayó por debajo del requisito de mantenimiento. Deposite fondos para evitar liquidación forzosa.`);
    } else {
      tt.marginCallActive = false;
    }

    tt.holdings = updatedHoldings;
    nextState.treasuryTrading = tt;
  }

  // --------------------------------------------------------------------------
  // 8. ROYALTIES DE PATENTES
  // --------------------------------------------------------------------------
  if (nextState.patentPortfolio && nextState.patentPortfolio.registeredPatents.length > 0) {
    const dailyRoyalties = nextState.patentPortfolio.registeredPatents.reduce(
      (sum, p) => sum + p.dailyPassiveRoyaltiesHNL,
      0
    );
    if (dailyRoyalties > 0) {
      nextState.storeBankBalance += dailyRoyalties;
      nextState.patentPortfolio.totalRoyaltiesEarnedHNL += dailyRoyalties;
    }
  }

  // --------------------------------------------------------------------------
  // 9. VIDA PERSONAL DEL CEO (ESTRÉS Y ALIVIO POR ACTIVOS DE LUJO)
  // --------------------------------------------------------------------------
  if (nextState.ceoPersonalLife) {
    let ceo = { ...nextState.ceoPersonalLife };
    
    // Alivio diario de estrés si posee activos de lujo
    const totalRelief = (ceo.luxuryAssetsOwned || []).reduce((sum, a) => sum + Math.round(a.stressReliefPoints / 10), 0);
    if (totalRelief > 0) {
      ceo.ceoStress = Math.max(5, ceo.ceoStress - totalRelief);
    }

    // Advertencia de Burnout
    if (ceo.ceoStress >= 80) {
      ceo.burnoutWarning = true;
      events.push('🩺 SALUD DEL CEO EN PELIGRO: Nivel extremo de estrés (80%+). Riesgo inminente de colapso físico o infarto. Tome vacaciones inmediatamente.');
    } else {
      ceo.burnoutWarning = false;
    }

    nextState.ceoPersonalLife = ceo;
  }

  return {
    updatedState: nextState,
    events
  };
}

// ============================================================================
// ACCIONES INTERACTIVAS DEL JUGADOR
// ============================================================================

/**
 * 1. Mercado de Información: Comprar suscripción de analítica
 */
export function buyMarketIntelligenceTier(
  state: DailySimulationState,
  tier: 'basic' | 'corporate'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentIntel = state.marketIntelligence || createInitialTycoonAdvancedState().marketIntelligence;
  const cost = tier === 'basic' ? 35000 : 120000;

  if (state.storeBankBalance < cost) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos bancarios insuficientes para contratar el Plan ${tier.toUpperCase()} (L ${cost.toLocaleString()}).`
    };
  }

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance - cost,
    marketIntelligence: {
      ...currentIntel,
      subscriptionTier: tier,
      subscriptionCostMonthly: cost
    }
  };

  return {
    updatedState,
    success: true,
    message: `¡SUSCRIPCIÓN ACTIVADA! Módulo de Inteligencia ${tier === 'corporate' ? 'Corporativa Profunda' : 'Básica de Mercado'} habilitado. Niebla de guerra disipada.`
  };
}

/**
 * 2. Lobby Político: Donar a campañas políticas y presionar aranceles
 */
export function donateToPoliticalCampaign(
  state: DailySimulationState,
  amountHNL: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (amountHNL <= 0) return { updatedState: state, success: false, message: 'Monto de donación inválido.' };
  if (state.storeBankBalance < amountHNL) {
    return { updatedState: state, success: false, message: 'Saldo en banco insuficiente para realizar la donación corporativa.' };
  }

  const currentLobby = state.politicalLobby || createInitialTycoonAdvancedState().politicalLobby;
  const pointsEarned = Math.floor(amountHNL / 50000);

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance - amountHNL,
    politicalLobby: {
      ...currentLobby,
      campaignDonationsTotalHNL: currentLobby.campaignDonationsTotalHNL + amountHNL,
      politicalInfluencePoints: currentLobby.politicalInfluencePoints + pointsEarned,
      governmentRelationsScore: Math.min(100, currentLobby.governmentRelationsScore + pointsEarned * 5)
    }
  };

  return {
    updatedState,
    success: true,
    message: `¡DONACIÓN REGISTRADA! Se canalizaron L ${amountHNL.toLocaleString()} al fondo de relaciones gubernamentales (+${pointsEarned} Puntos de Influencia Política).`
  };
}

/**
 * 2b. Activar Guerra de Aranceles a la Importación
 */
export function enactImportTariffLobby(
  state: DailySimulationState
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentLobby = state.politicalLobby || createInitialTycoonAdvancedState().politicalLobby;
  const requiredPoints = 4;

  if (currentLobby.politicalInfluencePoints < requiredPoints) {
    return {
      updatedState: state,
      success: false,
      message: `Se requieren al menos ${requiredPoints} puntos de influencia política para promover el decreto arancelario (Disponibles: ${currentLobby.politicalInfluencePoints}).`
    };
  }

  const updatedState: DailySimulationState = {
    ...state,
    politicalLobby: {
      ...currentLobby,
      politicalInfluencePoints: currentLobby.politicalInfluencePoints - requiredPoints,
      importTariffActive: true,
      importTariffDaysRemaining: 30
    }
  };

  return {
    updatedState,
    success: true,
    message: '¡DECRETO LEGISLATIVO APROBADO! Se impuso un arancel del 25% a insumos importados por 30 días. La ventaja competitiva local destruye los márgenes de los rivales.'
  };
}

/**
 * 2c. Rescate Financiero "Too Big to Fail" del Banco Central
 */
export function requestTooBigToFailBailout(
  state: DailySimulationState
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentLobby = state.politicalLobby || createInitialTycoonAdvancedState().politicalLobby;

  if (currentLobby.bailoutRequested) {
    return {
      updatedState: state,
      success: false,
      message: 'El Banco Central ya otorgó un paquete de salvamento extraordinario en este ciclo de quiebra.'
    };
  }

  if (currentLobby.tooBigToFailWorkforcePct < 7.0 && (state.staffCount || 0) < 30) {
    return {
      updatedState: state,
      success: false,
      message: 'La empresa aún no califica como "Demasiado Grande para Caer". Se requiere emplear al menos al 7% de la fuerza laboral local.'
    };
  }

  const bailoutAmount = 2500000;

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance + bailoutAmount,
    politicalLobby: {
      ...currentLobby,
      bailoutRequested: true,
      bailoutReceivedHNL: bailoutAmount
    }
  };

  return {
    updatedState,
    success: true,
    message: `🏛️ ¡RESCATE DE ESTADO APROBADO! Ante el riesgo sistémico de colapso de empleo, el Banco Central inyecta un salvamento no reembolsable de L ${bailoutAmount.toLocaleString()}.`
  };
}

/**
 * 3. C-Suite RPG: Retención de directivo con incentivos
 */
export function retainCSuiteExecutive(
  state: DailySimulationState,
  execId: string,
  action: 'aumentar_sueldo' | 'coche_empresa' | 'bono_equity'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const executives = state.cSuiteExecutives || [];
  const exec = executives.find(e => e.id === execId);

  if (!exec) return { updatedState: state, success: false, message: 'Ejecutivo no encontrado.' };

  let costHNL = 0;
  let newSalary = exec.monthlySalaryHNL;
  let perks = [...exec.perks];
  let loyaltyBonus = 20;

  if (action === 'aumentar_sueldo') {
    newSalary = Math.round(exec.monthlySalaryHNL * 1.35);
    loyaltyBonus = 30;
  } else if (action === 'coche_empresa') {
    costHNL = 650000;
    if (state.storeBankBalance < costHNL) {
      return { updatedState: state, success: false, message: `Fondos insuficientes para adquirir el vehículo de lujo (L ${costHNL.toLocaleString()}).` };
    }
    perks.push('coche_empresa');
    loyaltyBonus = 35;
  } else if (action === 'bono_equity') {
    perks.push('equity_bonus');
    loyaltyBonus = 40;
  }

  const updatedExecutives = executives.map(e => e.id === execId ? {
    ...e,
    monthlySalaryHNL: newSalary,
    perks,
    loyalty: Math.min(100, e.loyalty + loyaltyBonus),
    stress: Math.max(0, e.stress - 25),
    status: 'activo' as const,
    headhuntedByRival: undefined
  } : e);

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance - costHNL,
    cSuiteExecutives: updatedExecutives
  };

  return {
    updatedState,
    success: true,
    message: `¡OFERTA ACEPTADA! ${exec.name} (${exec.role}) rechazó a la competencia y ratificó su lealtad corporativa (+${loyaltyBonus}% lealtad).`
  };
}

/**
 * 3b. Despedir a Ejecutivo ("El Topo" riesgo de filtración)
 */
export function fireCSuiteExecutive(
  state: DailySimulationState,
  execId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const executives = state.cSuiteExecutives || [];
  const exec = executives.find(e => e.id === execId);
  if (!exec) return { updatedState: state, success: false, message: 'Ejecutivo no encontrado.' };

  // Si su lealtad era baja (< 50), se fuga con secretos como "El Topo"
  const isMole = exec.loyalty < 50;

  let pr = state.publicRelations ? { ...state.publicRelations } : createInitialPublicRelations();

  if (isMole) {
    pr.esgScore = Math.max(10, pr.esgScore - 20);
    pr.tweets.unshift({
      id: `tw_mole_${Date.now()}`,
      authorName: 'El Pulso Noticias HN',
      handle: '@ElPulsoHN',
      avatar: '🕵️',
      content: `EXCLUSIVA: ${exec.name}, ex-${exec.role} de ${state.storeName}, filtra ante el Ministerio Público y la prensa supuestas irregularidades contables y contratos confidenciales.`,
      likes: 2150,
      retweets: 1100,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      sentiment: 'negativo',
      category: 'escandalo'
    });
  }

  const updatedExecutives = executives.filter(e => e.id !== execId);

  return {
    updatedState: {
      ...state,
      cSuiteExecutives: updatedExecutives,
      publicRelations: pr
    },
    success: true,
    message: isMole
      ? `🚨 ¡DESPIDO HOSTIL! ${exec.name} ha sido destituido, pero desertó hacia la competencia revelando información confidencial a los medios ("El Topo").`
      : `Despido procesado pacíficamente conforme al Código de Trabajo. El cargo de ${exec.role} queda vacante.`
  };
}

/**
 * 4. Tomas Hostiles M&A: Comprar acciones en mercado secundario
 */
export function buyCompetitorShares(
  state: DailySimulationState,
  targetId: string,
  sharesToBuy: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const targets = state.hostileMnaTargets || [];
  const target = targets.find(t => t.id === targetId);

  if (!target) return { updatedState: state, success: false, message: 'Empresa objetivo no encontrada en el registro M&A.' };
  if (target.isHostileTakeoverComplete) return { updatedState: state, success: false, message: 'Esta empresa ya fue absorbida y liquidada en el holding.' };

  const totalCost = sharesToBuy * target.sharePriceHNL;
  if (state.storeBankBalance < totalCost) {
    return { updatedState: state, success: false, message: `Fondos bancarios insuficientes para comprar ${sharesToBuy.toLocaleString()} acciones (L ${totalCost.toLocaleString()}).` };
  }

  const newSharesOwned = target.playerSharesOwned + sharesToBuy;
  const ownershipPct = (newSharesOwned / target.totalShares) * 100;

  // Si supera el 51% -> Toma Hostil Completada
  let isTakeover = ownershipPct >= 51;
  let absorbedCash = 0;

  if (isTakeover) {
    absorbedCash = target.cashSurplusHNL;
  }

  const updatedTargets = targets.map(t => t.id === targetId ? {
    ...t,
    playerSharesOwned: newSharesOwned,
    isHostileTakeoverComplete: isTakeover
  } : t);

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance - totalCost + absorbedCash,
    hostileMnaTargets: updatedTargets,
    marketSharePct: Math.min(100, (state.marketSharePct || 15) + (isTakeover ? target.marketSharePct : 0))
  };

  return {
    updatedState,
    success: true,
    message: isTakeover
      ? `👑 ¡TOMA HOSTIL CONSUMADA! Has alcanzado el ${ownershipPct.toFixed(1)}% de "${target.name}". Has destituido a su junta directiva, absorbido L ${absorbedCash.toLocaleString()} de su tesorería y ganado +${target.marketSharePct}% de cuota de mercado.`
      : `Adquisición bursátil: Se compraron ${sharesToBuy.toLocaleString()} acciones de "${target.name}" por L ${totalCost.toLocaleString()}. Participación acumulada: ${ownershipPct.toFixed(1)}%.`
  };
}

/**
 * 7. Deep Web: Lanzar operación de sabotaje corporativo
 */
export function executeDeepWebContract(
  state: DailySimulationState,
  contractType: 'sabotaje_fabrica' | 'robo_patente' | 'rompehuelgas_clandestino' | 'campana_difamacion',
  targetCompetitorId: string,
  targetName: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentDw = state.deepWeb || createInitialTycoonAdvancedState().deepWeb;

  const cost = contractType === 'sabotaje_fabrica' ? 180000 : contractType === 'robo_patente' ? 250000 : 90000;
  if (state.storeCash < cost && state.storeBankBalance < cost) {
    return { updatedState: state, success: false, message: `Fondos insuficientes para contratar el servicio clandestino (L ${cost.toLocaleString()}).` };
  }

  let newCash = state.storeCash;
  let newBank = state.storeBankBalance;
  if (newCash >= cost) {
    newCash -= cost;
  } else {
    newBank -= cost;
  }

  const newContract: DeepWebSabotageContract = {
    id: `dw_${Date.now()}`,
    type: contractType,
    targetCompetitorId,
    targetCompetitorName: targetName,
    costHNL: cost,
    successProbabilityPct: 75,
    detectionRiskPct: 20,
    daysRemaining: 4,
    status: 'en_progreso'
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    deepWeb: {
      ...currentDw,
      activeContracts: [...currentDw.activeContracts, newContract],
      ipTraceRiskPct: Math.min(100, currentDw.ipTraceRiskPct + 10)
    }
  };

  return {
    updatedState,
    success: true,
    message: `🕶️ CONTRATO CIFRADO ACTIVADO: Mercenarios informáticos desplegados contra "${targetName}". Plazo de ejecución: 4 días.`
  };
}

/**
 * 9. Meta-Juego Personal del CEO: Retirar Sueldo o Dividendos (10% Retención SAR)
 */
export function transferPersonalCeoFunds(
  state: DailySimulationState,
  grossAmountHNL: number,
  type: 'sueldo' | 'dividendo'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (grossAmountHNL <= 0) return { updatedState: state, success: false, message: 'Monto a retirar inválido.' };
  if (state.storeBankBalance < grossAmountHNL) {
    return { updatedState: state, success: false, message: 'La tesorería corporativa no dispone de fondos suficientes para este retiro.' };
  }

  const currentCeo = state.ceoPersonalLife || createInitialTycoonAdvancedState().ceoPersonalLife;

  // En Honduras, los dividendos a accionistas tienen una retención definitiva del 10% del SAR
  const retentionSarPct = type === 'dividendo' ? 0.10 : 0.0;
  const retentionHNL = Math.round(grossAmountHNL * retentionSarPct);
  const netReceived = grossAmountHNL - retentionHNL;

  const updatedCeo: CeoPersonalLifeState = {
    ...currentCeo,
    personalBankBalanceHNL: currentCeo.personalBankBalanceHNL + netReceived
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: state.storeBankBalance - grossAmountHNL,
    personalWealthHNL: (state.personalWealthHNL || 0) + netReceived,
    ceoPersonalLife: updatedCeo
  };

  return {
    updatedState,
    success: true,
    message: type === 'dividendo'
      ? `¡DIVIDENDO LIQUIDADO! Se transfirieron L ${grossAmountHNL.toLocaleString()} de la empresa. SAR retuvo 10% (L ${retentionHNL.toLocaleString()}). Fortuna personal acreditada: +L ${netReceived.toLocaleString()}.`
      : `¡SUELDO PERCIBIDO! Salario ejecutivo de L ${grossAmountHNL.toLocaleString()} acreditado a su cuenta bancaria personal.`
  };
}

/**
 * 9b. Comprar Activo de Lujo Personal
 */
export function purchaseCeoLuxuryAsset(
  state: DailySimulationState,
  assetId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const asset = DEFAULT_LUXURY_CATALOG.find(a => a.id === assetId);
  if (!asset) return { updatedState: state, success: false, message: 'Activo de lujo no encontrado en el catálogo.' };

  const currentCeo = state.ceoPersonalLife || createInitialTycoonAdvancedState().ceoPersonalLife;
  if (currentCeo.personalBankBalanceHNL < asset.priceHNL) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos personales insuficientes en su cuenta privada (Precio: L ${asset.priceHNL.toLocaleString()} - Saldo personal: L ${currentCeo.personalBankBalanceHNL.toLocaleString()}). Transfiera dividendos de la empresa primero.`
    };
  }

  const alreadyOwned = (currentCeo.luxuryAssetsOwned || []).some(a => a.id === assetId);
  if (alreadyOwned) {
    return { updatedState: state, success: false, message: 'Ya posees este activo en tu patrimonio privado.' };
  }

  const updatedCeo: CeoPersonalLifeState = {
    ...currentCeo,
    personalBankBalanceHNL: currentCeo.personalBankBalanceHNL - asset.priceHNL,
    ceoStress: Math.max(0, currentCeo.ceoStress - asset.stressReliefPoints),
    luxuryAssetsOwned: [...(currentCeo.luxuryAssetsOwned || []), { ...asset, purchasedDay: state.currentDay }],
    angelInvestorsUnlocked: currentCeo.angelInvestorsUnlocked || asset.prestigeUnlocksAngelInvestors
  };

  return {
    updatedState: {
      ...state,
      ceoPersonalLife: updatedCeo
    },
    success: true,
    message: `💎 ¡COMPRA EXCLUSIVA! Has adquirido "${asset.name}" por L ${asset.priceHNL.toLocaleString()}. Estrés reducido en -${asset.stressReliefPoints} puntos.${asset.prestigeUnlocksAngelInvestors ? ' ¡Círculo de Inversionistas Ángeles desbloqueado!' : ''}`
  };
}

/**
 * 12. Especulación de Tesorería: Operar commodities en el terminal
 */
export function tradeTreasuryCommodity(
  state: DailySimulationState,
  symbol: string,
  action: 'comprar' | 'vender',
  units: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentTt = state.treasuryTrading || createInitialTycoonAdvancedState().treasuryTrading;
  const holding = currentTt.holdings.find(h => h.symbol === symbol);

  if (!holding) return { updatedState: state, success: false, message: 'Instrumento financiero no encontrado.' };
  if (units <= 0) return { updatedState: state, success: false, message: 'Cantidad de unidades inválida.' };

  const tradeCost = units * holding.currentPriceHNL;

  if (action === 'comprar') {
    if (currentTt.tradingAccountCashHNL < tradeCost) {
      // Verificar si puede comprar con margen
      const availableMargin = currentTt.marginLimitHNL - currentTt.marginDebtHNL;
      if (currentTt.tradingAccountCashHNL + availableMargin < tradeCost) {
        return { updatedState: state, success: false, message: `Poder de compra insuficiente en tesorería (Requerido: L ${tradeCost.toLocaleString()}).` };
      }
    }

    let cashToDeduct = Math.min(tradeCost, currentTt.tradingAccountCashHNL);
    let marginToBorrow = tradeCost - cashToDeduct;

    const newUnits = holding.units + units;
    const newAvgCost = Math.round(((holding.units * holding.avgCostHNL) + tradeCost) / newUnits);

    const updatedHoldings = currentTt.holdings.map(h => h.symbol === symbol ? {
      ...h,
      units: newUnits,
      avgCostHNL: newAvgCost
    } : h);

    const updatedState: DailySimulationState = {
      ...state,
      treasuryTrading: {
        ...currentTt,
        tradingAccountCashHNL: currentTt.tradingAccountCashHNL - cashToDeduct,
        marginDebtHNL: currentTt.marginDebtHNL + marginToBorrow,
        holdings: updatedHoldings
      }
    };

    return {
      updatedState,
      success: true,
      message: `¡ORDEN EJECUTADA! Se compraron ${units.toLocaleString()} unidades de ${holding.name} a L ${holding.currentPriceHNL.toLocaleString()}/u.`
    };
  } else {
    // VENDER
    if (holding.units < units) {
      return { updatedState: state, success: false, message: `No posees suficientes unidades para vender (Posees: ${holding.units}).` };
    }

    const proceeds = tradeCost;
    const realizedPnl = Math.round(proceeds - (units * holding.avgCostHNL));

    const updatedHoldings = currentTt.holdings.map(h => h.symbol === symbol ? {
      ...h,
      units: h.units - units
    } : h);

    const updatedState: DailySimulationState = {
      ...state,
      treasuryTrading: {
        ...currentTt,
        tradingAccountCashHNL: currentTt.tradingAccountCashHNL + proceeds,
        realizedProfitLossHNL: currentTt.realizedProfitLossHNL + realizedPnl,
        holdings: updatedHoldings
      }
    };

    return {
      updatedState,
      success: true,
      message: `¡ORDEN DE VENTA EJECUTADA! Se vendieron ${units.toLocaleString()} unidades de ${holding.name} por L ${proceeds.toLocaleString()} (Utilidad/Pérdida realizada: L ${realizedPnl.toLocaleString()}).`
    };
  }
}
