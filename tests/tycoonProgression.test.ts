import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  WAREHOUSE_CONFIG, 
  TYCOON_TECH_TREE, 
  SECTOR_DEFAULT_PRODUCTS,
  SECTOR_PREMIUM_PRODUCTS,
  generateDailyStoreCustomers, 
  orderFromSupplier, 
  advanceRetailDay, 
  buyBuilding, 
  upgradeWarehouse, 
  unlockTech, 
  updatePricingMarkup, 
  updateMarketingSpend, 
  updateWagePolicy, 
  resolveStrikeWithBonus, 
  withdrawPersonalDividends, 
  executeIpoVictory, 
  executeMonopolyVictory,
  checkTycoonVictory
} from '../src/game/retailBusinessEngine';
import { DailySimulationState } from '../src/game/retroSimTypes';

function createMockSimState(overrides: Partial<DailySimulationState> = {}): DailySimulationState {
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
    storeCash: 500000,
    storeBankBalance: 150000,
    storeReputation: 80,
    storeCleanliness: 90,
    products: JSON.parse(JSON.stringify(SECTOR_DEFAULT_PRODUCTS.minimarket)),
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 3,
    dailyWages: 1200,
    dailyRent: 450,
    monthlySalesAccumulated: 0,
    warehouseTier: 'garaje',
    warehouseOwnership: 'alquiler',
    maxInventoryCapacity: 100,
    buildingAssetValue: 0,
    pricingMarkupPct: 100,
    dailyMarketingSpend: 0,
    brandReputation: 50,
    unlockedTechs: [],
    employeeMorale: 80,
    wageLevel: 'minimo',
    isStrikeActive: false,
    strikeDaysRemaining: 0,
    autoCashierEnabled: false,
    personalWealthHNL: 0,
    consecutiveProfitableMonths: 0,
    constructionMaterials: [] as any,
    constructionOrders: [] as any,
    availableTenders: [] as any,
    activeWorks: [] as any,
    completedWorksHistory: [] as any,
    sarTaxRecord: {} as any,
    fiscalSolvenciaActive: true,
    commercialBanks: {} as any,
    ownedMachinery: [] as any,
    machineryDealers: [] as any,
    materialManufacturerQuotes: [] as any,
    bankerVaultCash: 0,
    bankerBchReserve: 0,
    bankerTotalDeposits: 0,
    bankerDepositRatePct: 0,
    bankerMonthlyFee: 0,
    bankerAtmFee: 0,
    bankerReputation: 0,
    bankerRunRiskPct: 0,
    docketQueue: [] as any,
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

describe('Tycoon Progression & Corporate Systems', () => {

  describe('Sistema 1: Expansión (Bienes Raíces & Logística)', () => {
    it('detecta cuello de botella de inventario y aplica multa por sobrealmacenamiento en advanceRetailDay', () => {
      // Garaje tiene capacidad para 100 unidades
      const state = createMockSimState({
        warehouseTier: 'garaje',
        maxInventoryCapacity: 100,
        products: [
          {
            id: 'p1',
            name: 'Producto A',
            category: 'General',
            icon: '📦',
            stock: 150, // 50 unidades por encima de la capacidad de 100
            unitCost: 10,
            sellingPrice: 20,
            supplierDeliveryDays: 1,
            minOrderUnits: 1,
            dailyDemandBase: 1,
            spoilageRatePct: 0
          }
        ]
      });

      const nextState = advanceRetailDay(state);
      // Multa esperada: 50 * 20 = L 1,000
      assert.ok(nextState.lastClosingSummary?.events.some(e => e.includes('Multa por exceso de almacenamiento')));
    });

    it('permite comprar el inmueble comercial (CAPEX), elimina alquiler diario y eleva Credit Score', () => {
      const state = createMockSimState({
        storeCash: 600000,
        warehouseTier: 'garaje',
        warehouseOwnership: 'alquiler',
        dailyRent: 450,
        companyCreditProfile: { score: 680, tier: 'A_BUENO' }
      });

      const res = buyBuilding(state);
      assert.equal(res.error, undefined);
      assert.equal(res.updatedState.warehouseOwnership, 'propio');
      assert.equal(res.updatedState.dailyRent, 0);
      assert.equal(res.updatedState.storeCash, 600000 - WAREHOUSE_CONFIG.garaje.purchasePrice);
      assert.ok((res.updatedState.companyCreditProfile?.score || 0) > 680);
      assert.ok(res.updatedState.realEstateCollaterals && res.updatedState.realEstateCollaterals.length > 0);
      assert.equal(res.updatedState.realEstateCollaterals![0].status, 'disponible');
    });

    it('permite mudarse a una bodega de mayor nivel ampliando capacidad', () => {
      const state = createMockSimState({
        storeCash: 200000,
        warehouseTier: 'garaje',
        maxInventoryCapacity: 100
      });

      const res = upgradeWarehouse(state, 'bodega');
      assert.equal(res.error, undefined);
      assert.equal(res.updatedState.warehouseTier, 'bodega');
      assert.equal(res.updatedState.maxInventoryCapacity, 500);
      assert.equal(res.updatedState.dailyRent, 1200);
    });
  });

  describe('Sistema 2: Motor de Demanda y Marketing', () => {
    it('reduce la afluencia de clientes si el margen de precio (markup) es excesivo', () => {
      const products = SECTOR_DEFAULT_PRODUCTS.minimarket;
      const normalDemand = generateDailyStoreCustomers('minimarket', products, 80, 1, { markupPct: 100, dailyMarketingSpend: 0 });
      const expensiveDemand = generateDailyStoreCustomers('minimarket', products, 80, 1, { markupPct: 200, dailyMarketingSpend: 0 });

      assert.ok(expensiveDemand.length < normalDemand.length);
    });

    it('aumenta los clientes con presupuesto de marketing publicitario', () => {
      const products = SECTOR_DEFAULT_PRODUCTS.minimarket;
      const withoutMarketing = generateDailyStoreCustomers('minimarket', products, 80, 1, { markupPct: 100, dailyMarketingSpend: 0 });
      const withMarketing = generateDailyStoreCustomers('minimarket', products, 80, 1, { markupPct: 100, dailyMarketingSpend: 5000 });

      assert.ok(withMarketing.length > withoutMarketing.length);
    });

    it('cancela toda la afluencia de clientes si hay huelga laboral activa', () => {
      const products = SECTOR_DEFAULT_PRODUCTS.minimarket;
      const queue = generateDailyStoreCustomers('minimarket', products, 80, 1, { markupPct: 100, isStrikeActive: true });
      assert.equal(queue.length, 0);
    });
  });

  describe('Sistema 3: Árbol de Investigación y Desarrollo (I+D)', () => {
    it('desbloquea Automatización POS, reduciendo un 15% los costos de nómina y habilitando auto-cajero', () => {
      const state = createMockSimState({
        storeCash: 100000,
        unlockedTechs: [],
        autoCashierEnabled: false
      });

      const res = unlockTech(state, 'automatizacion_pos');
      assert.equal(res.error, undefined);
      assert.ok(res.updatedState.unlockedTechs?.includes('automatizacion_pos'));
      assert.equal(res.updatedState.autoCashierEnabled, true);

      // Al avanzar el día, la nómina debe tener un 15% de descuento
      const advanced = advanceRetailDay(res.updatedState);
      // 3 empleados a sueldo mínimo (L 12,000/mes) = L 1,200/día * 0.85 = L 1,020/día
      assert.ok(advanced.lastClosingSummary?.events.some(e => e.includes('Nómina diaria')));
    });

    it('Optimización de Materiales aplica 20% de descuento en pedidos a proveedores', () => {
      const state = createMockSimState({
        storeCash: 50000,
        unlockedTechs: ['optimizacion_materiales']
      });

      const prod = state.products[0];
      const effectiveUnitCost = Math.round(prod.unitCost * 0.8);
      const expectedTotal = prod.minOrderUnits * effectiveUnitCost;
      const res = orderFromSupplier(prod.id, prod.minOrderUnits, state.products, state.storeCash, state.unlockedTechs);

      assert.ok(res.order !== null);
      assert.equal(res.order?.totalCost, expectedTotal);
    });

    it('Línea Premium añade producto de lujo con margen triplicado al catálogo', () => {
      const state = createMockSimState({
        storeCash: 200000,
        retailSector: 'minimarket',
        unlockedTechs: []
      });

      const res = unlockTech(state, 'linea_premium');
      assert.equal(res.error, undefined);
      const premiumProd = res.updatedState.products.find(p => p.id === 'prod-premium-gourmet');
      assert.ok(premiumProd !== undefined);
      assert.equal(premiumProd?.sellingPrice, 1050);
      assert.equal(premiumProd?.unitCost, 350);
    });
  });

  describe('Sistema 4: Gestión de Crisis y Cultura Laboral (RRHH)', () => {
    it('permite cambiar a salario competitivo o premium afectando la moral y costos', () => {
      const state = createMockSimState({ wageLevel: 'minimo' });
      const updated = updateWagePolicy(state, 'premium');
      assert.equal(updated.wageLevel, 'premium');

      const nextDay = advanceRetailDay(updated);
      assert.ok((nextDay.employeeMorale || 0) > 80);
    });

    it('permite resolver una huelga activa mediante bono de emergencia', () => {
      const state = createMockSimState({
        isStrikeActive: true,
        strikeDaysRemaining: 2,
        employeeMorale: 25,
        storeCash: 50000,
        staffCount: 3
      });

      const res = resolveStrikeWithBonus(state);
      assert.equal(res.error, undefined);
      assert.equal(res.updatedState.isStrikeActive, false);
      assert.equal(res.updatedState.strikeDaysRemaining, 0);
      assert.equal(res.updatedState.employeeMorale, 65);
      assert.equal(res.updatedState.storeCash, 50000 - (3 * 2000));
    });
  });

  describe('Sistema 5: El Endgame (Condiciones de Victoria)', () => {
    it('retiene el 10% del SAR al retirar dividendos y acredita el 90% a la fortuna personal', () => {
      const state = createMockSimState({
        storeCash: 2000000,
        personalWealthHNL: 1000000
      });

      const res = withdrawPersonalDividends(state, 1000000);
      assert.equal(res.error, undefined);
      assert.equal(res.taxDeducted, 100000); // 10%
      assert.equal(res.netReceived, 900000); // 90%
      assert.equal(res.updatedState.personalWealthHNL, 1900000);
      assert.equal(res.updatedState.storeCash, 1000000);
    });

    it('valida requisitos y corona victoria por IPO o Monopolio', () => {
      const stateIpoIneligible = createMockSimState({
        companyValuationHNL: 30000000,
        consecutiveProfitableMonths: 8
      });
      const resIneligible = executeIpoVictory(stateIpoIneligible);
      assert.ok(resIneligible.error !== undefined);

      const stateIpoEligible = createMockSimState({
        companyValuationHNL: 55000000,
        consecutiveProfitableMonths: 12
      });
      const resEligible = executeIpoVictory(stateIpoEligible);
      assert.equal(resEligible.error, undefined);
      assert.equal(resEligible.updatedState.victoryAchieved, 'ipo');
    });

    it('corona victoria por Jubilación Dorada al alcanzar L 10M en fortuna personal', () => {
      const state = createMockSimState({
        storeCash: 12000000,
        personalWealthHNL: 9500000
      });

      const res = withdrawPersonalDividends(state, 1000000);
      // Recibe 900,000 -> 9,500,000 + 900,000 = 10,400,000
      assert.ok(res.updatedState.personalWealthHNL! >= 10000000);
      assert.equal(res.updatedState.victoryAchieved, 'jubilacion');
    });
  });

  describe('Atención Automática (Auto-Cashier POS)', () => {
    it('procesa automáticamente a clientes en fila durante advanceRetailDay cuando autoCashierEnabled es true', () => {
      const initialProducts = [
        {
          id: 'p1',
          name: 'Leche Entera',
          category: 'Lácteos',
          icon: '🥛',
          stock: 10,
          unitCost: 20,
          sellingPrice: 30,
          supplierDeliveryDays: 1,
          minOrderUnits: 1,
          dailyDemandBase: 5,
          spoilageRatePct: 0
        }
      ];

      const state = createMockSimState({
        products: initialProducts,
        autoCashierEnabled: true,
        walkInQueue: [
          {
            id: 'c1',
            name: 'Cliente Auto',
            avatar: 'a1',
            customerType: 'Trabajador',
            patience: 100,
            budget: 500,
            cart: [{ productId: 'p1', productName: 'Leche Entera', units: 2, unitPrice: 30, inStock: true }],
            isServed: false,
            leftWithoutBuying: false
          }
        ]
      });

      const nextDay = advanceRetailDay(state);
      // El cliente debe haber sido cobrado automáticamente
      assert.ok(nextDay.lastClosingSummary?.events.some(e => e.includes('Cajero Automático POS')));
      // Stock reducido
      const updatedP1 = nextDay.products.find(p => p.id === 'p1');
      assert.equal(updatedP1?.stock, 8);
    });
  });
});
