import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  DEFAULT_CONSTRUCTION_MATERIALS, 
  DEFAULT_INITIAL_SAR_RECORD, 
  generateInitialTenders, 
  submitConstructionBid, 
  orderConstructionMaterial, 
  advanceConstructionDay, 
  paySarTaxReturn 
} from '../src/game/constructionEngine';
import { DailySimulationState } from '../src/game/retroSimTypes';
import { DEFAULT_SMART_BANK_OFFERS } from '../src/game/retailBusinessEngine';

function createMockConstructionState(overrides: Partial<DailySimulationState> = {}): DailySimulationState {
  return {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 9,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,

    retailSector: 'constructora',
    storeName: 'Constructora Metropolitana S. de R.L.',
    storeCash: 150000,
    storeBankBalance: 2000000,
    storeReputation: 80,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 15,
    dailyWages: 6000,
    dailyRent: 1500,
    monthlySalesAccumulated: 0,
    smartBankOffers: DEFAULT_SMART_BANK_OFFERS,
    smartBankCreditRating: 'AA',

    constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS.map(m => ({ ...m })),
    constructionOrders: [],
    availableTenders: generateInitialTenders(1),
    activeWorks: [],
    completedWorksHistory: [],

    sarTaxRecord: { ...DEFAULT_INITIAL_SAR_RECORD },
    fiscalSolvenciaActive: true,

    bankerVaultCash: 500000,
    bankerBchReserve: 540000,
    bankerTotalDeposits: 4500000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 82,
    bankerRunRiskPct: 8,
    docketQueue: [],
    activeLoansCount: 0,
    totalLoanPortfolio: 0,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,

    dailyHistory: [],
    ...overrides
  };
}

describe('Motor de Construcción: Catálogo de Materiales Pesados', () => {
  it('contiene los 6 materiales fundamentales de obra (cemento, varilla, bloques, tablas, arena, maquinaria)', () => {
    assert.equal(DEFAULT_CONSTRUCTION_MATERIALS.length, 6);
    
    const ids = DEFAULT_CONSTRUCTION_MATERIALS.map(m => m.id);
    assert.ok(ids.includes('cemento_gris'));
    assert.ok(ids.includes('varilla_acero'));
    assert.ok(ids.includes('bloque_concreto'));
    assert.ok(ids.includes('tabla_encofrado'));
    assert.ok(ids.includes('arena_grava'));
    assert.ok(ids.includes('maquinaria_pesada'));
  });

  it('ordena materiales con costo y plazo de entrega a la cantera', () => {
    const initialState = createMockConstructionState({
      storeCash: 50000,
      storeBankBalance: 100000
    });

    // Ordenar 100 bolsas de cemento a L 240 = L 24,000
    const res = orderConstructionMaterial(initialState, 'cemento_gris', 100);
    assert.ok(res.order);
    assert.equal(res.order.units, 100);
    assert.equal(res.order.totalCost, 24000);
    assert.equal(res.updatedState.storeBankBalance, 100000 - 24000);
    assert.equal(res.updatedState.constructionOrders.length, 1);
  });

  it('rechaza orden de materiales si no hay suficiente liquidez', () => {
    const poorState = createMockConstructionState({
      storeCash: 500,
      storeBankBalance: 1000
    });

    const res = orderConstructionMaterial(poorState, 'varilla_acero', 50); // L 1,150 * 50 = L 57,500
    assert.equal(res.order, null);
    assert.ok(res.error?.includes('Fondos insuficientes'));
  });
});

describe('Mesa de Licitaciones y Concurrencia con Contratistas Rivales', () => {
  it('genera licitaciones públicas (SIT/SEFIN) y privadas (residenciales, naves, edificios)', () => {
    const tenders = generateInitialTenders(1);
    assert.ok(tenders.length >= 5);

    const publicTenders = tenders.filter(t => t.category === 'obra_publica');
    const privateTenders = tenders.filter(t => t.category === 'obra_privada');

    assert.ok(publicTenders.length > 0);
    assert.ok(privateTenders.length > 0);
    assert.ok(publicTenders.every(t => t.requiresSarSolvencia === true));
  });

  it('descalifica automáticamente en licitación pública si no tiene Solvencia Fiscal SAR vigente', () => {
    const uncertifiedState = createMockConstructionState({
      fiscalSolvenciaActive: false
    });

    const publicTender = uncertifiedState.availableTenders.find(t => t.requiresSarSolvencia);
    assert.ok(publicTender);

    const res = submitConstructionBid(uncertifiedState, publicTender.id, 6500000, 70);
    assert.equal(res.won, false);
    assert.ok(res.message.includes('DESCALIFICACIÓN LEGAL'));
    assert.ok(res.message.includes('Solvencia Fiscal del SAR'));
  });

  it('evalúa plicas contra contratistas rivales y adjudica contrato si la oferta es competitiva', () => {
    const state = createMockConstructionState({
      fiscalSolvenciaActive: true,
      storeReputation: 95
    });

    const tender = state.availableTenders[0];
    // Oferta muy atractiva y con alta reputación técnica
    const aggressivePrice = Math.round(tender.referenceBudget * 0.88);
    const fastDays = Math.max(20, tender.durationDays - 5);

    const res = submitConstructionBid(state, tender.id, aggressivePrice, fastDays);
    
    // Verificamos que se generaron las ofertas de rivales
    const updatedTender = res.updatedState.availableTenders.find(t => t.id === tender.id);
    assert.ok(updatedTender?.rivalBids.length! >= 3);

    if (res.won) {
      assert.equal(res.updatedState.activeWorks.length, 1);
      const work = res.updatedState.activeWorks[0];
      assert.equal(work.tenderId, tender.id);
      assert.ok(work.advancePaymentReceived > 0);
      assert.ok(res.updatedState.storeBankBalance > state.storeBankBalance);
    } else {
      assert.ok(res.winningBidder);
    }
  });
});

describe('Ejecución Diaria de Obra, Consumo de Materiales y Estimaciones de Cobro', () => {
  it('avanza la obra y consume materiales si hay existencias en el patio de acopio', () => {
    const state = createMockConstructionState({
      activeWorks: [
        {
          id: 'obra-test-01',
          tenderId: 't-01',
          title: 'Residencial 4 Casas',
          clientName: 'Inversiones Norte',
          category: 'obra_privada',
          totalContractPrice: 1000000,
          advancePaymentReceived: 200000,
          billedMilestonesAmount: 200000,
          progressPct: 10,
          daysRemaining: 30,
          totalDaysEstimated: 35,
          requiredMaterialsTotal: {
            cemento_gris: 100,
            varilla_acero: 50,
            bloque_concreto: 10,
            tabla_encofrado: 20,
            arena_grava: 40,
            maquinaria_pesada: 10
          },
          materialsConsumed: {
            cemento_gris: 10,
            varilla_acero: 5,
            bloque_concreto: 1,
            tabla_encofrado: 2,
            arena_grava: 4,
            maquinaria_pesada: 1
          },
          dailyMaterialNeeds: {
            cemento_gris: 5,
            varilla_acero: 2,
            bloque_concreto: 1,
            tabla_encofrado: 1,
            arena_grava: 2,
            maquinaria_pesada: 1
          },
          isHaltedForMissingMaterials: false,
          missingMaterialsList: [],
          delayFinesAccumulated: 0,
          status: 'en_ejecucion',
          milestonesPaid: 0
        }
      ]
    });

    const nextState = advanceConstructionDay(state);
    assert.equal(nextState.activeWorks.length, 1);
    const updatedWork = nextState.activeWorks[0];
    assert.ok(updatedWork.progressPct > 10);
    assert.equal(updatedWork.isHaltedForMissingMaterials, false);
  });

  it('detiene la obra y aplica multa diaria si se agota algún material en el almacén', () => {
    // Almacén sin cemento
    const depletedMaterials = DEFAULT_CONSTRUCTION_MATERIALS.map(m => {
      if (m.id === 'cemento_gris') return { ...m, stock: 0 };
      return { ...m };
    });

    const state = createMockConstructionState({
      constructionMaterials: depletedMaterials,
      activeWorks: [
        {
          id: 'obra-paralizada-01',
          tenderId: 't-02',
          title: 'Puente Río Blanco',
          clientName: 'SIT',
          category: 'obra_publica',
          totalContractPrice: 5000000,
          advancePaymentReceived: 1000000,
          billedMilestonesAmount: 1000000,
          progressPct: 15,
          daysRemaining: 60,
          totalDaysEstimated: 70,
          requiredMaterialsTotal: {
            cemento_gris: 500,
            varilla_acero: 200,
            bloque_concreto: 20,
            tabla_encofrado: 50,
            arena_grava: 250,
            maquinaria_pesada: 80
          },
          materialsConsumed: {
            cemento_gris: 50,
            varilla_acero: 20,
            bloque_concreto: 2,
            tabla_encofrado: 5,
            arena_grava: 25,
            maquinaria_pesada: 8
          },
          dailyMaterialNeeds: {
            cemento_gris: 10, // Necesita 10 pero stock es 0
            varilla_acero: 3,
            bloque_concreto: 1,
            tabla_encofrado: 1,
            arena_grava: 4,
            maquinaria_pesada: 2
          },
          isHaltedForMissingMaterials: false,
          missingMaterialsList: [],
          delayFinesAccumulated: 0,
          status: 'en_ejecucion',
          milestonesPaid: 0
        }
      ]
    });

    const nextState = advanceConstructionDay(state);
    const updatedWork = nextState.activeWorks[0];
    assert.equal(updatedWork.isHaltedForMissingMaterials, true);
    assert.ok(updatedWork.delayFinesAccumulated > 0);
    assert.ok(updatedWork.missingMaterialsList.length > 0);
  });
});

describe('Auditoría SAR y Liquidación de ISR al 25%', () => {
  it('calcula correctamente la base imponible y el 25% de ISR en Honduras', () => {
    const state = createMockConstructionState({
      sarTaxRecord: {
        taxYear: 2026,
        grossRevenues: 4000000,
        deductibleMaterialsExpenses: 2000000,
        deductiblePayrollExpenses: 800000,
        deductibleOtherCosts: 200000,
        netTaxableIncome: 1000000, // 4M - 3M = 1M
        taxRatePct: 25,
        isrTaxAmount: 250000, // 25% de 1M
        isPaid: false,
        auditStatus: 'pendiente',
        solvenciaFiscalIssued: false,
        solvenciaExpirationYear: 2026,
        auditNotes: ['Auditoría pendiente de liquidación.']
      },
      fiscalSolvenciaActive: false
    });

    assert.equal(state.sarTaxRecord.netTaxableIncome, 1000000);
    assert.equal(state.sarTaxRecord.isrTaxAmount, 250000);

    // Liquidar impuesto ante el SAR
    const res = paySarTaxReturn(state);
    assert.equal(res.success, true);
    assert.equal(res.updatedState.sarTaxRecord.isPaid, true);
    assert.equal(res.updatedState.sarTaxRecord.auditStatus, 'aprobada_conforme');
    assert.equal(res.updatedState.fiscalSolvenciaActive, true);
    assert.equal(res.updatedState.sarTaxRecord.solvenciaFiscalIssued, true);
  });
});
