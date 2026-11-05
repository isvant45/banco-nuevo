import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  evaluateApplicantRisk, 
  generateDailyBankApplicants, 
  stampDocket, 
  calculateBankRunRisk, 
  advanceBankDay,
  boostLoanAmountWithCollateral,
  discountInterestRateWithCollateral
} from '../src/game/bank2000Engine';
import { 
  SECTOR_DEFAULT_PRODUCTS, 
  serveRetailCustomer, 
  orderFromSupplier, 
  advanceRetailDay,
  DEFAULT_SMART_BANK_OFFERS,
  acceptSmartBankFacility,
  repaySmartBankFacility
} from '../src/game/retailBusinessEngine';
import { DailySimulationState, RetailProduct } from '../src/game/retroSimTypes';
import { 
  DEFAULT_CONSTRUCTION_MATERIALS, 
  DEFAULT_INITIAL_SAR_RECORD 
} from '../src/game/constructionEngine';
import { createDefaultBankRelationships } from '../src/game/commercialBanksEngine';
import { DEFAULT_MACHINERY_DEALERS, DEFAULT_MANUFACTURER_QUOTES } from '../src/game/machineryAndSuppliersEngine';

describe('Bank 2000 Engine: Evaluación Crediticia y Ventanilla', () => {
  it('calcula correctamente el DTI y riesgo de pérdida para solicitantes solventes vs insolventes', () => {
    const solventRisk = evaluateApplicantRisk(50000, 0, 30000, 18.0, 24, 780);
    assert.ok(solventRisk.dtiRatioPct < 20);
    assert.ok(solventRisk.lossProbabilityPct < 15);
    assert.equal(solventRisk.recommendedDecision, 'aprobar');

    const overindebtedRisk = evaluateApplicantRisk(20000, 10000, 80000, 24.0, 12, 500);
    assert.ok(overindebtedRisk.dtiRatioPct > 50);
    assert.equal(overindebtedRisk.recommendedDecision, 'rechazar');
  });

  it('genera expedientes diarios con bienes patrimoniales detallados (casas, carros)', () => {
    const applicants = generateDailyBankApplicants(5, 1, 1);
    assert.equal(applicants.length, 5);

    applicants.forEach(app => {
      assert.match(app.dossierNumber, /^EXP-0101-\d{3}$/);
      assert.ok(app.applicantName.length > 0);
      assert.ok(app.monthlyIncome > 0);
      assert.ok(app.creditScore >= 300 && app.creditScore <= 850);
      assert.equal(app.decisionStatus, 'pendiente');
      assert.ok(app.riskEvaluation !== undefined);
      assert.ok(Array.isArray(app.realEstateAssets));
      assert.ok(Array.isArray(app.vehicleAssets));
    });
  });

  it('permite elevar el monto de préstamo y descontar tasa de interés por respaldo colateral', () => {
    const applicants = generateDailyBankApplicants(1, 1, 1);
    const applicant = applicants[0]!;

    // Inyectar un colateral para probar la ampliación y descuento
    applicant.totalCollateralValue = 1500000;
    applicant.requestedAmount = 100000;
    applicant.proposedInterestRate = 18.0;

    const boosted = boostLoanAmountWithCollateral(applicant);
    assert.ok((boosted.adjustedAmount || 0) > applicant.requestedAmount);
    assert.ok((boosted.amountBonusApplied || 0) > 0);

    const discounted = discountInterestRateWithCollateral(applicant);
    assert.ok((discounted.adjustedRate || 0) < applicant.proposedInterestRate);
    assert.ok((discounted.rateDiscountApplied || 0) > 0);
  });

  it('sella expedientes con decisiones de Aprobado o Rechazado y ajusta condiciones', () => {
    const applicants = generateDailyBankApplicants(1, 1, 1);
    const first = applicants[0]!;

    const approved = stampDocket(first, 'aprobado', 40000, 16.5);
    assert.equal(approved.decisionStatus, 'aprobado');
    assert.equal(approved.adjustedAmount, 40000);
    assert.equal(approved.adjustedRate, 16.5);
    assert.ok(approved.stampedAt !== undefined);

    const rejected = stampDocket(first, 'rechazado');
    assert.equal(rejected.decisionStatus, 'rechazado');
  });

  it('calcula riesgo de corrida bancaria según ratio de cobertura de efectivo en bóveda', () => {
    const highRisk = calculateBankRunRisk(50000, 1000000, 40, 2.0);
    assert.ok(highRisk > 40);

    const lowRisk = calculateBankRunRisk(250000, 1000000, 85, 5.0);
    assert.ok(lowRisk < 15);
  });

  it('avanza la jornada bancaria calculando intereses devengados y gastos operativos', () => {
    const mockState: DailySimulationState = {
      currentDay: 1,
      currentMonth: 1,
      currentYear: 2026,
      dailyHour: 9,
      isDayClosed: false,
      roleMode: 'banquero',
      lastClosingSummary: null,
      retailSector: 'minimarket',
      storeName: 'Banco Test',
      storeCash: 0,
      storeBankBalance: 0,
      storeReputation: 80,
      storeCleanliness: 90,
      products: [],
      supplierOrders: [],
      walkInQueue: [],
      dailyReceipts: [],
      staffCount: 2,
      dailyWages: 800,
      dailyRent: 400,
      monthlySalesAccumulated: 0,
      smartBankOffers: [],
      smartBankCreditRating: 'AA',

      constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
      constructionOrders: [],
      availableTenders: [],
      activeWorks: [],
      completedWorksHistory: [],
      sarTaxRecord: DEFAULT_INITIAL_SAR_RECORD,
      fiscalSolvenciaActive: true,

      commercialBanks: createDefaultBankRelationships(0),
      ownedMachinery: [],
      machineryDealers: DEFAULT_MACHINERY_DEALERS,
      materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,

      bankerVaultCash: 500000,
      bankerBchReserve: 200000,
      bankerTotalDeposits: 2000000,
      bankerDepositRatePct: 4.0,
      bankerMonthlyFee: 30,
      bankerAtmFee: 15,
      bankerReputation: 80,
      bankerRunRiskPct: 10,
      docketQueue: [],
      activeLoansCount: 20,
      totalLoanPortfolio: 5000000,
      delinquentLoansCount: 1,
      processedDocketsToday: 3,
      approvedAmountToday: 150000,
      rejectedCountToday: 1,
      dailyHistory: []
    };

    const nextState = advanceBankDay(mockState);
    assert.equal(nextState.currentDay, 2);
    assert.ok(nextState.docketQueue.length > 0);
    assert.equal(nextState.processedDocketsToday, 0);
    assert.equal(nextState.dailyHistory.length, 1);
    assert.ok(nextState.lastClosingSummary !== null);
  });
});

describe('Retail Business Engine: Gestión de Inventario, Ventas y Proveedores', () => {
  it('contiene catálogos diferenciados con precios de compra y venta para cada rubro', () => {
    const sectors: ('minimarket' | 'bar_restaurante' | 'constructora')[] = ['minimarket', 'bar_restaurante', 'constructora'];

    sectors.forEach(sec => {
      const prods = SECTOR_DEFAULT_PRODUCTS[sec];
      assert.ok(prods.length >= 5);

      prods.forEach(p => {
        assert.ok(p.unitCost > 0);
        assert.ok(p.sellingPrice > p.unitCost);
        assert.ok(p.stock > 0);
        assert.ok(p.minOrderUnits > 0);
        assert.ok(p.supplierDeliveryDays >= 1);
      });
    });
  });

  it('atiende a clientes en mostrador, descuenta inventario físico y emite ticket fiscal', () => {
    const prods: RetailProduct[] = [
      {
        id: 'p1',
        name: 'Leche 1L',
        category: 'Lácteos',
        icon: '🥛',
        stock: 10,
        unitCost: 20,
        sellingPrice: 30,
        supplierDeliveryDays: 1,
        minOrderUnits: 5,
        dailyDemandBase: 5,
        spoilageRatePct: 1
      }
    ];

    const customer = {
      id: 'c1',
      name: 'Cliente Prueba',
      avatar: 'a1',
      customerType: 'Familia' as const,
      patience: 80,
      budget: 500,
      cart: [
        { productId: 'p1', productName: 'Leche 1L', units: 2, unitPrice: 30, inStock: true }
      ],
      isServed: false,
      leftWithoutBuying: false
    };

    const result = serveRetailCustomer(customer, prods, 'efectivo', 1);
    assert.equal(result.updatedCustomer.isServed, true);
    assert.equal(result.updatedCustomer.leftWithoutBuying, false);
    assert.equal(result.updatedProducts[0]!.stock, 8);
    assert.ok(result.receipt !== null);
    assert.equal(result.receipt?.subtotal, 60);
    assert.equal(result.receipt?.tax, 9);
    assert.equal(result.receipt?.total, 69);
    assert.equal(result.cogs, 40);
  });

  it('detecta quiebre de stock cuando el producto está agotado y el cliente se retira sin comprar', () => {
    const prods: RetailProduct[] = [
      {
        id: 'p1',
        name: 'Leche 1L',
        category: 'Lácteos',
        icon: '🥛',
        stock: 0,
        unitCost: 20,
        sellingPrice: 30,
        supplierDeliveryDays: 1,
        minOrderUnits: 5,
        dailyDemandBase: 5,
        spoilageRatePct: 1
      }
    ];

    const customer = {
      id: 'c1',
      name: 'Cliente Decepcionado',
      avatar: 'a1',
      customerType: 'Familia' as const,
      patience: 80,
      budget: 500,
      cart: [
        { productId: 'p1', productName: 'Leche 1L', units: 1, unitPrice: 30, inStock: false }
      ],
      isServed: false,
      leftWithoutBuying: false
    };

    const result = serveRetailCustomer(customer, prods, 'efectivo', 1);
    assert.equal(result.updatedCustomer.isServed, true);
    assert.equal(result.updatedCustomer.leftWithoutBuying, true);
    assert.equal(result.receipt, null);
    assert.equal(result.revenue, 0);
  });

  it('gestiona órdenes de compra a proveedores validando dinero disponible y unidades mínimas', () => {
    const prods = SECTOR_DEFAULT_PRODUCTS.minimarket;
    const milk = prods[0]!;

    const failMin = orderFromSupplier(milk.id, milk.minOrderUnits - 5, prods, 50000);
    assert.equal(failMin.order, null);
    assert.ok(failMin.error?.includes('pedido mínimo'));

    const failFunds = orderFromSupplier(milk.id, milk.minOrderUnits, prods, 10);
    assert.equal(failFunds.order, null);
    assert.ok(failFunds.error?.includes('Fondos insuficientes'));

    const valid = orderFromSupplier(milk.id, milk.minOrderUnits, prods, 10000);
    assert.ok(valid.order !== null);
    assert.equal(valid.order?.units, milk.minOrderUnits);
    assert.equal(valid.newCash, 10000 - (milk.minOrderUnits * milk.unitCost));
  });

  it('permite a la empresa aceptar financiamiento del Banco Inteligente IA y amortizar la deuda', () => {
    const mockState: DailySimulationState = {
      currentDay: 1,
      currentMonth: 1,
      currentYear: 2026,
      dailyHour: 9,
      isDayClosed: false,
      roleMode: 'empresario',
      lastClosingSummary: null,
      retailSector: 'minimarket',
      storeName: 'Tienda Test',
      storeCash: 10000,
      storeBankBalance: 0,
      storeReputation: 80,
      storeCleanliness: 90,
      products: [],
      supplierOrders: [],
      walkInQueue: [],
      dailyReceipts: [],
      staffCount: 2,
      dailyWages: 800,
      dailyRent: 400,
      monthlySalesAccumulated: 20000,
      smartBankOffers: DEFAULT_SMART_BANK_OFFERS,
      smartBankCreditRating: 'AA',

      constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
      constructionOrders: [],
      availableTenders: [],
      activeWorks: [],
      completedWorksHistory: [],
      sarTaxRecord: DEFAULT_INITIAL_SAR_RECORD,
      fiscalSolvenciaActive: true,

      commercialBanks: createDefaultBankRelationships(0),
      ownedMachinery: [],
      machineryDealers: DEFAULT_MACHINERY_DEALERS,
      materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,

      bankerVaultCash: 0,
      bankerBchReserve: 0,
      bankerTotalDeposits: 0,
      bankerDepositRatePct: 0,
      bankerMonthlyFee: 0,
      bankerAtmFee: 0,
      bankerReputation: 0,
      bankerRunRiskPct: 0,
      docketQueue: [],
      activeLoansCount: 0,
      totalLoanPortfolio: 0,
      delinquentLoansCount: 0,
      processedDocketsToday: 0,
      approvedAmountToday: 0,
      rejectedCountToday: 0,
      dailyHistory: []
    };

    // Aceptar facilidad de capital de trabajo (L 50,000)
    const accepted = acceptSmartBankFacility(mockState, 'fac-working-capital-1');
    assert.equal(accepted.updatedState.storeCash, 60000); // 10,000 + 50,000
    assert.equal(accepted.updatedState.smartBankOffers!.find(o => o.id === 'fac-working-capital-1')?.status, 'activo');

    // Amortizar cuota de L 4,500
    const repaid = repaySmartBankFacility(accepted.updatedState, 'fac-working-capital-1', 4500);
    assert.equal(repaid.updatedState.storeCash, 55500);
    assert.equal(repaid.updatedState.smartBankOffers!.find(o => o.id === 'fac-working-capital-1')?.balanceRemaining, 45500);
  });
});
