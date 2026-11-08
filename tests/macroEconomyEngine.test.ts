import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  createInitialMacroEconomyState, 
  calculateOpexCapexBreakdown, 
  calculateBusinessCreditScore, 
  generateDueDiligenceDossier, 
  executeForeclosureAndLiquidation, 
  createSmartLoanContract, 
  signSmartLoanContract, 
  advanceMacroEconomyMonth 
} from '../src/game/macroEconomyEngine';
import { DailySimulationState } from '../src/game/retroSimTypes';

function createMockState(): DailySimulationState {
  return {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 9,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,
    retailSector: 'minimarket',
    storeName: 'Minimarket San Pedro',
    storeCash: 150000,
    storeBankBalance: 850000,
    storeReputation: 80,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [
      {
        id: 'rc-1',
        time: '10:00',
        day: 1,
        customerName: 'Cliente 1',
        itemsCount: 3,
        subtotal: 10434,
        tax: 1566,
        total: 12000,
        totalHNL: 12000,
        totalAmount: 12000,
        costOfGoods: 8000,
        paymentMethod: 'efectivo'
      }
    ],
    staffCount: 4,
    dailyWages: 1600,
    dailyRent: 600,
    monthlySalesAccumulated: 360000,
    smartBankOffers: [],
    smartBankCreditRating: 'AA',
    constructionMaterials: {} as any,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],
    sarTaxRecord: {} as any,
    fiscalSolvenciaActive: true,
    commercialBanks: {
      ficohsa: {
        bankId: 'ficohsa',
        relationshipScore: 75,
        checkingAccount: {
          accountNumber: 'CTA-0101-FIC-9921',
          balance: 850000,
          overdraftLimit: 500000,
          overdraftUsed: 0,
          checksUsedCount: 3,
          interestRateAnnual: 4.5
        },
        guaranteeDeposits: [],
        termDeposits: []
      },
      atlantida: { bankId: 'atlantida', relationshipScore: 60, guaranteeDeposits: [], termDeposits: [] },
      bac: { bankId: 'bac', relationshipScore: 50, guaranteeDeposits: [], termDeposits: [] },
      occidente: { bankId: 'occidente', relationshipScore: 50, guaranteeDeposits: [], termDeposits: [] }
    },
    ownedMachinery: [
      {
        id: 'mach-1',
        dealerId: 'cat_hn',
        dealerName: 'Distribuidora CAT Honduras',
        modelName: 'Montacargas Hidráulico Industrial',
        title: 'Montacargas Hidráulico Industrial',
        category: 'grua_torre',
        icon: '🏗️',
        ratingStars: 5,
        purchasePrice: 600000,
        purchaseCost: 600000,
        conditionPct: 95,
        totalHoursWorked: 120,
        hourlyFuelCost: 150
      }
    ],
    machineryDealers: [],
    materialManufacturerQuotes: [],
    bankerVaultCash: 1200000,
    bankerBchReserve: 500000,
    bankerTotalDeposits: 2500000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 85,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 15,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    realEstateCollaterals: [
      {
        id: 'col-edif-01',
        title: 'Local Comercial y Bodega Central',
        assetType: 'local_bodega',
        ownerName: 'Minimarket San Pedro',
        companyName: 'Minimarket San Pedro',
        description: 'Bodega de 800 m²',
        location: 'San Pedro Sula',
        status: 'disponible',
        acquisitionValueHNL: 4000000,
        marketValueHNL: 5000000,
        appraisalValueHNL: 4500000,
        appraisalDate: '2026-01-01',
        ltvAcceptedPct: 80,
        eligibleCollateralValueHNL: 3600000,
        liens: [],
        pledgedAmountTotal: 0,
        availableCoverageHNL: 3600000,
        isPledged: false,
        isLockedForSale: false,
        registrationNumber: 'MAT-LOC-01',
        simulatedDocumentNumber: 'DOC-LOC-01',
        situationNotes: 'Libre de gravamen'
      }
    ],
    dailyHistory: [],
    macroEconomyState: createInitialMacroEconomyState()
  };
}

describe('Motor Macroeconómico, Banco Central y Smart Contracts', () => {
  it('inicializa el estado macroeconómico con las tasas normativas del Banco Central', () => {
    const macro = createInitialMacroEconomyState();
    assert.equal(macro.cycleState, 'EXPANSION');
    assert.equal(macro.primeRatePct, 6.5);
    assert.equal(macro.inflationRatePct, 4.2);
    assert.equal(macro.legalReservePct, 20.0);
    assert.equal(macro.centralBankBailoutRatePct, 16.5); // Prime (6.5) + 10%
    assert.equal(macro.activeBailoutDebtHNL, 0);
  });

  it('calcula con precisión el desglose de OPEX y la pista de liquidez (Cash Runway)', () => {
    const state = createMockState();
    const opex = calculateOpexCapexBreakdown(state);

    assert.equal(opex.monthlyWagesHNL, 1600 * 30); // 48,000
    assert.equal(opex.monthlyRentHNL, 600 * 30); // 18,000
    assert.ok(opex.monthlyUtilitiesHNL > 0);
    assert.ok(opex.totalMonthlyOpexHNL > 66000);
    assert.ok(opex.daysOfCashRunway > 300); // 1,000,000 / ~70,000 * 30
    assert.equal(opex.isLiquidityCritical, false);
  });

  it('calcula el Credit Score empresarial en la escala 300 - 850 y asigna Tier', () => {
    const state = createMockState();
    const report = calculateBusinessCreditScore(state);

    assert.ok(report.score >= 300 && report.score <= 850);
    assert.ok(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C', 'D'].includes(report.tier));
    assert.ok(report.dtiRatioPct >= 0);
    assert.ok(report.paymentHistoryScore > 0);
  });

  it('genera el Dossier de Due Diligence con auditoría de riesgo para el Banquero', () => {
    const state = createMockState();
    const dossier = generateDueDiligenceDossier(state, 2000000, 'ficohsa', 36, 'Expansión de stock');

    assert.equal(dossier.companyName, 'Minimarket San Pedro');
    assert.equal(dossier.requestedAmountHNL, 2000000);
    assert.ok(['BAJO', 'MODERADO', 'ALTO', 'CRITICO'].includes(dossier.riskClassification));
    assert.ok(['APROBAR', 'CONDICIONAR_GARANTIA', 'RECHAZAR'].includes(dossier.recommendedDecision));
    assert.ok(dossier.analystSummary.length > 20);
  });

  it('ejecuta embargo judicial de garantía confiscándola y liquidándola al 60% de tasación', () => {
    const state = createMockState();
    const initialVault = state.bankerVaultCash;

    const result = executeForeclosureAndLiquidation(
      state,
      'ficohsa',
      'col-edif-01',
      2000000
    );

    assert.equal(result.success, true);
    assert.equal(result.foreclosure.originalAppraisalHNL, 4500000);
    assert.equal(result.foreclosure.liquidatedValueHNL, 2700000); // 60% de 4.5M
    assert.equal(result.foreclosure.recoveredFundsHNL, 2000000); // Cubre la deuda de 2M
    assert.equal(result.foreclosure.surplusReturnedToDebtorHNL, 700000); // Excedente devuelto
    assert.equal(result.updatedState.bankerVaultCash, initialVault + 2000000); // Bóveda recupera capital
    assert.equal(result.updatedState.realEstateCollaterals?.[0]?.isLockedForSale, true);
  });

  it('crea y formaliza un Smart Contract bilateral con desembolso neto y voucher', () => {
    const state = createMockState();
    const contract = createSmartLoanContract(state, {
      bankId: 'ficohsa',
      principalAmountHNL: 3000000,
      interestRateAnnual: 11.0,
      termMonths: 36,
      gracePeriodMonths: 3,
      collateralId: 'col-edif-01'
    });

    assert.equal(contract.principalAmountHNL, 3000000);
    assert.equal(contract.gracePeriodMonths, 3);
    assert.ok(contract.monthlyPaymentHNL > 0);
    assert.ok(contract.monthlyInterestDuringGraceHNL > 0);

    const signResult = signSmartLoanContract(state, contract);
    assert.equal(signResult.success, true);
    assert.ok(signResult.updatedState.commercialBanks.ficohsa.activeLoan);
    assert.equal(signResult.updatedState.commercialBanks.ficohsa.activeLoan?.principalAmount, 3000000);
    assert.equal(signResult.updatedState.realEstateCollaterals?.[0]?.isPledged, true);
  });

  it('advanceMacroEconomyMonth activa rescate punitivo (Prime + 10%) si la bóveda entra en déficit', () => {
    const state = createMockState();
    // Provocar estrés de liquidez extrema en la bóveda del Banquero
    state.bankerVaultCash = -200000;
    state.bankerTotalDeposits = 3000000;

    const nextState = advanceMacroEconomyMonth(state);
    const nextMacro = nextState.macroEconomyState!;

    assert.ok(nextState.bankerVaultCash > 0, 'El rescate debe inyectar liquidez para sacar la bóveda del saldo negativo');
    assert.ok(nextMacro.activeBailoutDebtHNL > 0, 'Debe registrar la deuda del rescate');
    assert.equal(nextMacro.centralBankBailoutRatePct, Number((nextMacro.primeRatePct + 10.0).toFixed(2)));
    assert.ok(nextState.simulatedEmails && nextState.simulatedEmails.length > 0, 'Debe emitir alerta oficial del Banco Central');
  });
});
