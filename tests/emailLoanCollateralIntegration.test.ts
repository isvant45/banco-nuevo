import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  evaluateContractorEconomicCapacity,
  calculateCreditTermsDisclosure,
  calculateCollateralAvailableCoverage,
  evaluateSelectedCollateralsCoverage,
  requestFullCommercialCredit,
  payCommercialLoan,
  getInboxUnreadCount,
  negotiateBankOfferFromEmail,
  createDefaultBankRelationships,
  createDefaultRealEstateCollaterals,
  createInitialSimulatedEmails
} from '../src/game/commercialBanksEngine';
import { restoreDailySimulationState } from '../src/game/savedState';
import { DailySimulationState, RealEstateCollateralItem, DynamicBankOffer } from '../src/game/retroSimTypes';
import { DEFAULT_CONSTRUCTION_MATERIALS, DEFAULT_INITIAL_SAR_RECORD } from '../src/game/constructionEngine';

function createMockIntegrationState(overrides: Partial<DailySimulationState> = {}): DailySimulationState {
  const storeName = 'Constructora Hondureña Metropolitana';
  const initialSector = 'constructora';
  const storeBank = 850000;

  const base: DailySimulationState = {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 9,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,

    retailSector: initialSector,
    storeName,
    storeCash: 150000,
    storeBankBalance: storeBank,
    storeReputation: 85,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 12,
    dailyWages: 4800,
    dailyRent: 1500,
    monthlySalesAccumulated: 650000,
    smartBankOffers: [],
    smartBankCreditRating: 'AA',

    constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],

    sarTaxRecord: { ...DEFAULT_INITIAL_SAR_RECORD, sarNoticesPending: 1 },
    fiscalSolvenciaActive: true,

    commercialBanks: createDefaultBankRelationships(storeBank),
    ownedMachinery: [],
    machineryDealers: [],
    materialManufacturerQuotes: [],

    bankerVaultCash: 500000,
    bankerBchReserve: 200000,
    bankerTotalDeposits: 3000000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 80,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 10,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,

    realEstateCollaterals: createDefaultRealEstateCollaterals(storeName, initialSector),
    simulatedEmails: createInitialSimulatedEmails(storeName, initialSector, storeBank),
    transactionVouchers: [],
    dynamicBankOffers: [],
    fiscalPeriods: [],
    dailyHistory: []
  };

  return { ...base, ...overrides };
}

describe('Integración Correo, Préstamos, Garantías y Persistencia', () => {

  // =========================================================================
  // REQUISITO 2: Correos leídos, archivados y regla única de conteo
  // =========================================================================
  describe('Requisito 2: Regla de conteo, lectura y archivado', () => {
    it('calcula unread count considerando únicamente inbox, no leídos y no archivados', () => {
      const state = createMockIntegrationState();
      const initialCount = getInboxUnreadCount(state.simulatedEmails);
      assert.ok(initialCount > 0, 'Debe haber correos no leídos al inicio');

      // Marcar primer correo como leído
      const firstEmail = state.simulatedEmails[0];
      const updatedEmails = state.simulatedEmails.map((e, idx) => 
        idx === 0 ? { ...e, isRead: true } : e
      );

      const newCount = getInboxUnreadCount(updatedEmails);
      assert.strictEqual(newCount, initialCount - 1, 'Marcar como leído debe descontar exactamente 1');

      // Archivar un correo no leído no debe contarse en bandeja de entrada
      const archivedEmails = updatedEmails.map((e, idx) => 
        idx === 1 ? { ...e, isArchived: true } : e
      );
      assert.strictEqual(getInboxUnreadCount(archivedEmails), initialCount - 2, 'Archivar un correo no leído lo excluye del contador de inbox');

      // Un correo en carpeta "sent" no leído no debe contarse en el inbox
      const sentEmail = {
        ...firstEmail,
        id: 'sent_test_1',
        folder: 'sent' as const,
        isRead: false,
        isArchived: false
      };
      assert.strictEqual(getInboxUnreadCount([...archivedEmails, sentEmail]), initialCount - 2, 'Correos enviados no deben contarse como inbox unread');
    });

    it('conserva el estado de leído y archivado tras restaurar la partida (persistencia)', () => {
      const state = createMockIntegrationState();
      state.simulatedEmails[0].isRead = true;
      state.simulatedEmails[1].isArchived = true;

      const restored = restoreDailySimulationState(state);
      assert.strictEqual(restored.simulatedEmails[0].isRead, true, 'El primer correo debe seguir leído');
      assert.strictEqual(restored.simulatedEmails[1].isArchived, true, 'El segundo correo debe seguir archivado');
      assert.strictEqual(getInboxUnreadCount(restored.simulatedEmails), getInboxUnreadCount(state.simulatedEmails));
    });
  });

  // =========================================================================
  // REQUISITO 3: Ofertas preaprobadas funcionales y desembolso único
  // =========================================================================
  describe('Requisito 3: Ofertas preaprobadas y prevención de doble desembolso', () => {
    it('desembolsa una oferta preaprobada válida a la cuenta seleccionada y emite comprobante', () => {
      const state = createMockIntegrationState();
      const offerEmail = state.simulatedEmails.find(e => e.bankOfferPayload);
      assert.ok(offerEmail, 'Debe existir un correo con oferta preaprobada inicial');
      const offer = offerEmail.bankOfferPayload!;

      const initialBankBalance = state.commercialBanks[offer.bankId]?.checkingAccount?.balance || 0;
      const initialTotalDebt = state.commercialBanks[offer.bankId]?.activeLoan?.balanceRemaining || 0;

      const res = requestFullCommercialCredit(
        state,
        offer.bankId,
        offer.productType,
        offer.approvedAmount,
        offer.termMonths,
        'Desembolso de oferta inicial',
        0,
        undefined,
        offer.bankId,
        'checking',
        offer.id
      );

      assert.strictEqual(res.success, true, 'El desembolso debe ser exitoso');
      assert.ok(res.voucher, 'Debe haberse generado un comprobante de transacción');

      // Verificar actualización de saldo neto y deuda
      const newBankBalance = res.updatedState.commercialBanks[offer.bankId]?.checkingAccount?.balance || 0;
      assert.strictEqual(newBankBalance, initialBankBalance + res.disclosure.netDisbursementHNL);
      assert.strictEqual(res.updatedState.commercialBanks[offer.bankId]?.activeLoan?.balanceRemaining, offer.approvedAmount);

      // Verificar que la oferta quedó marcada como aceptada
      const updatedOfferInState = res.updatedState.dynamicBankOffers.find(o => o.id === offer.id)
        || res.updatedState.simulatedEmails.find(e => e.bankOfferPayload?.id === offer.id)?.bankOfferPayload;
      assert.strictEqual(updatedOfferInState?.status, 'aceptada');

      // Intento de doble contratación debe ser denegado
      const doubleRes = requestFullCommercialCredit(
        res.updatedState,
        offer.bankId,
        offer.productType,
        offer.approvedAmount,
        offer.termMonths,
        'Intento de doble desembolso',
        0,
        undefined,
        offer.bankId,
        'checking',
        offer.id
      );
      assert.strictEqual(doubleRes.success, false, 'No se puede contratar la misma oferta dos veces');
      assert.match(doubleRes.message, /ya fue contratada|no se puede/i);
    });

    it('permite desembolsar en efectivo de caja chica cuando el usuario lo elige', () => {
      const state = createMockIntegrationState();
      const offerEmail = state.simulatedEmails.find(e => e.bankOfferPayload);
      assert.ok(offerEmail);
      const offer = offerEmail.bankOfferPayload!;

      const initialCash = state.storeCash;
      const res = requestFullCommercialCredit(
        state,
        offer.bankId,
        offer.productType,
        offer.approvedAmount,
        offer.termMonths,
        'Desembolso en efectivo',
        0,
        undefined,
        offer.bankId,
        'cash',
        offer.id
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.updatedState.storeCash, initialCash + res.disclosure.netDisbursementHNL, 'Efectivo en caja debe incrementarse con el desembolso neto');
    });

    it('rechaza una oferta vencida', () => {
      const state = createMockIntegrationState({ currentDay: 25, currentMonth: 3 });
      const expiredOffer: DynamicBankOffer = {
        id: 'offer_expired_test',
        bankId: 'atlantida',
        productType: 'capital_trabajo',
        approvedAmount: 300000,
        interestRateAnnual: 11.5,
        termMonths: 24,
        openingFeePct: 1.5,
        requiredCollateralPct: 0,
        expiresDay: 10,
        expiresMonth: 2,
        status: 'vencida',
        reasoning: 'Vencida por plazo'
      };
      state.dynamicBankOffers = [expiredOffer];

      const res = requestFullCommercialCredit(
        state,
        'atlantida',
        'capital_trabajo',
        300000,
        24,
        'Intento de contratar vencida',
        0,
        undefined,
        'atlantida',
        'checking',
        'offer_expired_test'
      );

      assert.strictEqual(res.success, false);
      assert.match(res.message, /venci/i);
    });
  });

  // =========================================================================
  // REQUISITO 4: Negociación desde el correo
  // =========================================================================
  describe('Requisito 4: Negociación de ofertas desde correo', () => {
    it('permite contraofertar menor tasa y mayor plazo y registra la propuesta', () => {
      const state = createMockIntegrationState();
      const offerEmail = state.simulatedEmails.find(e => e.bankOfferPayload);
      assert.ok(offerEmail);
      const offer = offerEmail.bankOfferPayload!;

      const res = negotiateBankOfferFromEmail(state, offer.id, {
        requestedRate: offer.interestRateAnnual - 1.0,
        requestedTerm: offer.termMonths + 6
      });

      assert.ok(res.dialogue.length > 0, 'Debe generar un diálogo del comité de crédito');
      assert.ok(res.outcome === 'aprobada' || res.outcome === 'aprobado' || res.outcome === 'contraoferta', 'Debe resolverse favorablemente con buen perfil');

      const updatedOffer = res.updatedState.dynamicBankOffers.find(o => o.id === offer.id);
      assert.ok(updatedOffer);
      assert.strictEqual(updatedOffer.status, 'en_negociacion');
      assert.ok(updatedOffer.negotiationHistory && updatedOffer.negotiationHistory.length > 0);
      assert.ok(updatedOffer.previousTerms, 'Debe guardar las condiciones previas');
    });

    it('explica el rechazo si la solicitud es desmedida sin capacidad', () => {
      const state = createMockIntegrationState({
        monthlySalesAccumulated: 20000,
        staffCount: 15,
        dailyWages: 6000,
        dailyRent: 2000
      });
      const offerEmail = state.simulatedEmails.find(e => e.bankOfferPayload);
      assert.ok(offerEmail);
      const offer = offerEmail.bankOfferPayload!;

      // Solicitar el cuádruple de monto a tasa irrisoria
      const res = negotiateBankOfferFromEmail(state, offer.id, {
        requestedAmount: (offer.amountOrLimitHNL || offer.approvedAmount || 1000000) * 4,
        requestedRate: 2.0
      });

      assert.ok(res.outcome === 'rechazada' || res.outcome === 'rechazado');
      assert.match(res.dialogue, /Comité de Riesgos|Riesgo Crediticio|DENEGADO|rechaz/i);
    });
  });

  // =========================================================================
  // REQUISITO 5 & 6: Garantías reales, límites estructurados y explicación
  // =========================================================================
  describe('Requisito 5 & 6: Evaluación estructurada de 5 límites y explicación en tiempo real', () => {
    it('calcula la cobertura no comprometida de garantías reales y no inventa bienes cuando la lista está vacía', () => {
      const emptyState = createMockIntegrationState({ realEstateCollaterals: [] });
      const collaterals = emptyState.realEstateCollaterals || [];
      assert.strictEqual(collaterals.length, 0, 'No debe inventar garantías por defecto si la lista está vacía');

      const disclosureEmpty = calculateCreditTermsDisclosure(
        emptyState,
        'atlantida',
        'capital_trabajo',
        500000,
        24,
        0,
        undefined
      );
      assert.strictEqual(disclosureEmpty.collateralCoverageProvidedHNL, 0);
      assert.strictEqual(disclosureEmpty.collateralSatisfied, true); // No exigida para capital_trabajo sin garantías
    });

    it('la garantía amplía el monto aprobado cuando la capacidad de pago es suficiente', () => {
      const state = createMockIntegrationState({
        monthlySalesAccumulated: 1500000,
        dailyWages: 2000,
        dailyRent: 1000
      });

      // Límite sin garantías
      const disclosureSinGarantia = calculateCreditTermsDisclosure(
        state,
        'ficohsa',
        'linea_sobregiro',
        2000000,
        36,
        0,
        []
      );

      // Ahora seleccionamos el primer bien inmueble
      const colId = state.realEstateCollaterals[0].id;
      const disclosureConGarantia = calculateCreditTermsDisclosure(
        state,
        'ficohsa',
        'linea_sobregiro',
        2000000,
        36,
        0,
        [colId]
      );

      assert.ok(
        disclosureConGarantia.finalMaxApprovedHNL >= disclosureSinGarantia.finalMaxApprovedHNL,
        'Aportar garantía real debe mantener o incrementar el límite final'
      );
      assert.ok(disclosureConGarantia.collateralCoverageProvidedHNL > 0, 'Debe registrar la cobertura de la garantía');
    });

    it('la capacidad de pago limita el préstamo aunque la garantía sea millonaria', () => {
      // Flujo bajo pero con un terreno millonario
      const state = createMockIntegrationState({
        monthlySalesAccumulated: 60000,
        dailyWages: 1500,
        dailyRent: 500,
        realEstateCollaterals: [
          {
            id: 'col_mega_terreno',
            title: 'Terreno Industrial Valle de Amarateca',
            assetType: 'terreno_comercial',
            appraisalValueHNL: 10000000,
            ltvAcceptedPct: 75,
            eligibleCollateralValueHNL: 7500000,
            registrationNumber: 'MAT-999999',
            isPledged: false,
            pledgedAmountTotal: 0,
            availableCoverageHNL: 7500000,
            isLockedForSale: false,
            appraisalDateDay: 1,
            appraisalDateMonth: 1,
            appraisalDateYear: 2026,
            status: 'disponible'
          }
        ]
      });

      const disclosure = calculateCreditTermsDisclosure(
        state,
        'atlantida',
        'construccion_desarrollo',
        5000000,
        24,
        0,
        ['col_mega_terreno']
      );

      // La garantía respalda hasta 7.5 millones / 1.2 = 6.25M, pero el flujo disponible solo permite un monto mucho menor
      assert.ok(disclosure.collateralBackedMaxHNL >= 5000000, 'Garantía respalda más de 5 millones');
      assert.ok(disclosure.finalMaxApprovedHNL < 5000000, 'El límite final debe estar restringido por capacidad de pago');
      assert.match(
        disclosure.limitReasonExplanation,
        /capacidad de pago|flujo/i,
        'Debe explicar explícitamente que la capacidad de pago es el limitante'
      );
    });

    it('permite seleccionar múltiples garantías sumando su cobertura sin duplicar', () => {
      const state = createMockIntegrationState();
      assert.ok(state.realEstateCollaterals.length >= 2, 'Debe haber al menos 2 garantías');

      const col1 = state.realEstateCollaterals[0];
      const col2 = state.realEstateCollaterals[1];

      const cov1 = calculateCollateralAvailableCoverage(col1);
      const cov2 = calculateCollateralAvailableCoverage(col2);

      const combined = evaluateSelectedCollateralsCoverage(state.realEstateCollaterals, [col1.id, col2.id]);
      assert.strictEqual(combined.totalAvailableCoverageHNL, cov1 + cov2, 'La cobertura conjunta debe ser exactamente la suma de ambas');

      // Si se pasa el mismo ID duplicado, no debe duplicar la cobertura
      const deduplicated = evaluateSelectedCollateralsCoverage(state.realEstateCollaterals, [col1.id, col1.id, col2.id]);
      assert.strictEqual(deduplicated.totalAvailableCoverageHNL, cov1 + cov2, 'No debe duplicar garantías repetidas');
    });
  });

  // =========================================================================
  // REQUISITO 7: Gravamen y liberación automática de garantías
  // =========================================================================
  describe('Requisito 7: Gravamen al desembolso y liberación automática al liquidar', () => {
    it('grava las garantías al desembolsar y las libera automáticamente al cancelar el préstamo', () => {
      const state = createMockIntegrationState();
      const col = state.realEstateCollaterals[0];
      assert.strictEqual(col.isPledged, false);

      // 1. Desembolsar préstamo vinculando la garantía
      const disburseRes = requestFullCommercialCredit(
        state,
        'atlantida',
        'capital_trabajo',
        250000,
        12,
        'Financiamiento garantizado',
        0,
        [col.id],
        'atlantida',
        'checking'
      );

      assert.strictEqual(disburseRes.success, true);
      const pledgedCol = disburseRes.updatedState.realEstateCollaterals.find(c => c.id === col.id);
      assert.ok(pledgedCol);
      assert.strictEqual(pledgedCol.isPledged, true, 'La garantía debe quedar marcada como pignorada');
      assert.strictEqual(pledgedCol.isLockedForSale, true, 'Debe quedar bloqueada para venta');
      assert.strictEqual(pledgedCol.pledgedBankId, 'atlantida');

      // 2. Liquidar completamente el préstamo
      const activeLoan = disburseRes.updatedState.commercialBanks.atlantida.activeLoan!;
      const totalPayoff = activeLoan.balanceRemaining + 5000;

      const payRes = payCommercialLoan(
        disburseRes.updatedState,
        'atlantida',
        totalPayoff,
        true, // cancelacion total
        'checking'
      );

      assert.strictEqual(payRes.success, true);
      assert.strictEqual(payRes.updatedState.commercialBanks.atlantida.activeLoan, undefined, 'El préstamo debe quedar cancelado');

      // 3. Verificar que la garantía se liberó automáticamente
      const releasedCol = payRes.updatedState.realEstateCollaterals.find(c => c.id === col.id);
      assert.ok(releasedCol);
      assert.strictEqual(releasedCol.isPledged, false, 'La garantía debe haberse liberado');
      assert.strictEqual(releasedCol.isLockedForSale, false, 'El activo ya no debe estar bloqueado');
      assert.strictEqual(releasedCol.pledgedAmountTotal, 0);

      // 4. Verificar emisión de comprobante de cancelación y notificación
      assert.ok(payRes.voucher);
      assert.strictEqual(payRes.voucher.operationType, 'cancelacion_total');
      const confirmationEmail = payRes.updatedState.simulatedEmails.find(e => /cancelaci[oó]n total|finiquito/i.test(e.subject));
      assert.ok(confirmationEmail, 'Debe enviarse un correo de confirmación de finiquito bancario');
    });
  });

  // =========================================================================
  // REQUISITO 8: Pagos desde el correo
  // =========================================================================
  describe('Requisito 8: Pago de créditos y de SAR desde el correo', () => {
    it('permite realizar pagos parciales al crédito desde el correo con saldo remanente correcto', () => {
      const state = createMockIntegrationState();
      // Crear un préstamo activo de 400,000
      const disburseRes = requestFullCommercialCredit(
        state,
        'ficohsa',
        'capital_trabajo',
        400000,
        24,
        'Préstamo para prueba de abono',
        0,
        undefined,
        'ficohsa',
        'checking'
      );
      assert.strictEqual(disburseRes.success, true);

      // Pagar un abono parcial de 50,000 desde checking
      const initialBankBalance = disburseRes.updatedState.commercialBanks.ficohsa.checkingAccount!.balance;
      const payRes = payCommercialLoan(disburseRes.updatedState, 'ficohsa', 50000, false, 'checking');

      assert.strictEqual(payRes.success, true);
      const remainingLoan = payRes.updatedState.commercialBanks.ficohsa.activeLoan;
      assert.ok(remainingLoan);
      assert.strictEqual(remainingLoan.balanceRemaining, 350000, 'El saldo remanente debe ser exactamente 350,000');
      assert.strictEqual(payRes.updatedState.commercialBanks.ficohsa.checkingAccount!.balance, initialBankBalance - 50000);
    });

    it('deniega el pago si los fondos son insuficientes sin emitir éxito falso', () => {
      const state = createMockIntegrationState({
        storeCash: 500
      });
      // Dejar la cuenta con solo L 1,000
      state.commercialBanks.atlantida.checkingAccount!.balance = 1000;
      state.storeBankBalance = 1000;

      // Poner préstamo activo
      state.commercialBanks.atlantida.activeLoan = {
        id: 'loan_fail_test',
        bankId: 'atlantida',
        productType: 'capital_trabajo',
        originalAmount: 100000,
        balanceRemaining: 100000,
        monthlyPayment: 5000,
        interestRateAnnual: 12,
        termMonthsRemaining: 24,
        purpose: 'Test'
      };

      const payRes = payCommercialLoan(state, 'atlantida', 15000, false, 'checking');
      assert.strictEqual(payRes.success, false, 'Debe fallar por fondos insuficientes');
      assert.strictEqual(state.commercialBanks.atlantida.activeLoan.balanceRemaining, 100000, 'La deuda no debe alterarse');
    });
  });
});
