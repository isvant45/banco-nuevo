import { 
  GameState, 
  CompetitorBank, 
  BCHIndicators, 
  BankFinancialStatements, 
  BankDivisionConfig, 
  StaffRole, 
  BoardDirector, 
  BranchLocation, 
  CorporatePayrollAgreement, 
  ClearingHouseStats,
  CreditApplication,
  TreasuryAsset,
  FamilyRemittanceChannel,
  SwiftTransaction,
  IndividualClient,
  PensionFund,
  PosMerchant,
  SecondaryMarketSecurity,
  InterbankPortfolioOffer,
  DynamicAlert,
  ExpertOpinion,
  TenInnovationsState,
  BchMoneyDeskState,
  FxForwardContract,
  AureoProgramsState,
  AdvancedOperationsState,
  DividendGovernanceState,
  FinancialSandboxConfig
} from './types';

export const INITIAL_COMPETITORS: CompetitorBank[] = [
  {
    id: 'atlantida',
    name: 'Banco Atlántida S.A.',
    shortName: 'Atlántida',
    brandColor: '#dc2626',
    marketShare: 21.8,
    assets: 125000000000,
    depositRateAvg: 6.2,
    lendingRateAvg: 16.5,
    reputation: 92,
    specialty: 'Banca Corporativa, Fiduciaria y Remesas'
  },
  {
    id: 'ficohsa',
    name: 'Banco Ficohsa S.A.',
    shortName: 'Ficohsa',
    brandColor: '#1d4ed8',
    marketShare: 20.4,
    assets: 118000000000,
    depositRateAvg: 6.5,
    lendingRateAvg: 18.2,
    reputation: 90,
    specialty: 'Tarjetas de Crédito, Banca Premier y Consumo'
  },
  {
    id: 'bac',
    name: 'BAC Credomatic Honduras',
    shortName: 'BAC',
    brandColor: '#b91c1c',
    marketShare: 18.2,
    assets: 98000000000,
    depositRateAvg: 5.8,
    lendingRateAvg: 19.0,
    reputation: 89,
    specialty: 'Adquirencia POS, Tarjetas y Canales Digitales'
  },
  {
    id: 'banpais',
    name: 'Banco del País S.A.',
    shortName: 'Banpaís',
    brandColor: '#059669',
    marketShare: 12.1,
    assets: 65000000000,
    depositRateAvg: 6.4,
    lendingRateAvg: 17.0,
    reputation: 84,
    specialty: 'Comercio PYME en Valle de Sula y Agroindustria'
  },
  {
    id: 'occidente',
    name: 'Banco de Occidente S.A.',
    shortName: 'Occidente',
    brandColor: '#d97706',
    marketShare: 10.9,
    assets: 59000000000,
    depositRateAvg: 6.0,
    lendingRateAvg: 15.8,
    reputation: 86,
    specialty: 'Depósitos Tradicionales y Crédito Agropecuario'
  }
];

export const INITIAL_BCH: BCHIndicators = {
  month: 1,
  year: 2026,
  tpmRate: 5.75, // Tasa de Política Monetaria
  interannualInflation: 4.85,
  reserveRequirementPct: 12.0, // 12% Encaje Legal obligatorio
  exchangeRateHNLtoUSD: 24.88, // Lempiras por Dólar
  monthlyFXAuctionVolumeUSD: 185000000,
  economicSentiment: 'Crecimiento Sólido',
  lastBulletinTitle: 'BCH mantiene Tasa de Política Monetaria en 5.75%',
  lastBulletinText: 'El Directorio del Banco Central de Honduras evaluó las condiciones macroeconómicas internas y el comportamiento de la inflación interanual, decidiendo mantener la TPM y vigilar la liquidez interbancaria.'
};

export const INITIAL_CLIENTS: IndividualClient[] = [
  // 1. Banca Personas (Retail)
  {
    id: 'CLI-PER-01',
    cif: 'CIF-0501-1988-02451',
    name: 'Rigoberto Mejía Ramos',
    division: 'personas',
    city: 'San Pedro Sula',
    notes: 'Ingeniero industrial en maquila de Choloma. Excelente historial, cliente desde 2024.',
    joinedMonth: 1,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 48500,
    hasCreditCard: true,
    creditCardBrand: 'Visa Clásica',
    creditCardLimitHNL: 35000,
    creditCardBalanceHNL: 12400,
    hasLoan: true,
    loanType: 'Préstamo Personal',
    loanPrincipalHNL: 85000,
    loanBalanceHNL: 52000,
    loanMonthlyPaymentHNL: 3450,
    loanInterestRateAnnual: 22.0,
    loanMonthsRemaining: 24,
    guaranteedPayment: false,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 680,
    cnbsCategory: 'I - Normal',
    pensionFundEnrolled: true,
    pensionFundProfile: 'Conservador',
    pensionBalanceHNL: 38000,
    otherBankProducts: [
      {
        id: 'obp-01',
        bankName: 'Banco Ficohsa',
        productType: 'Préstamo Personal',
        balanceHNL: 120000,
        interestRatePct: 24.5,
        details: 'Préstamo de consumo con cuota mensual de L. 5,200.'
      },
      {
        id: 'obp-02',
        bankName: 'BAC Credomatic',
        productType: 'Tarjeta de Crédito',
        balanceHNL: 28000,
        interestRatePct: 44.0,
        details: 'Tarjeta Mastercard Clásica con tasa elevada.'
      }
    ]
  },
  {
    id: 'CLI-PER-02',
    cif: 'CIF-0801-1992-14890',
    name: 'Ana Suyapa Flores Pineda',
    division: 'personas',
    city: 'Tegucigalpa',
    notes: 'Docente universitaria y servidora pública. Salario acreditado por planilla.',
    joinedMonth: 1,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 28400,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Oro',
    creditCardLimitHNL: 50000,
    creditCardBalanceHNL: 18600,
    hasLoan: true,
    loanType: 'Deducción por Planilla',
    loanPrincipalHNL: 95000,
    loanBalanceHNL: 64000,
    loanMonthlyPaymentHNL: 3100,
    loanInterestRateAnnual: 19.5,
    loanMonthsRemaining: 30,
    guaranteedPayment: true, // Planilla con pago garantizado
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 715,
    cnbsCategory: 'I - Normal',
    pensionFundEnrolled: false,
    otherBankProducts: [
      {
        id: 'obp-03',
        bankName: 'Banco Atlántida',
        productType: 'Cuenta de Depósitos / Ahorros',
        balanceHNL: 75000,
        interestRatePct: 2.2,
        details: 'Cuenta de ahorros pasiva ganando rendimiento mínimo.'
      }
    ]
  },
  {
    id: 'CLI-PER-03',
    cif: 'CIF-0101-1985-00912',
    name: 'José Carlos Vásquez',
    division: 'personas',
    city: 'La Ceiba',
    notes: 'Comerciante independiente con atraso en pagos por baja de ventas turísticas.',
    joinedMonth: 1,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 19500,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: 'Préstamo Personal',
    loanPrincipalHNL: 45000,
    loanBalanceHNL: 31000,
    loanMonthlyPaymentHNL: 2200,
    loanInterestRateAnnual: 24.0,
    loanMonthsRemaining: 18,
    guaranteedPayment: false,
    pastDueDays: 65, // En mora activa
    pastDueAmountHNL: 4400,
    equifaxScore: 620,
    cnbsCategory: 'III - Subnormal',
    pensionFundEnrolled: false,
    otherBankProducts: [
      {
        id: 'obp-04',
        bankName: 'Banco Ficohsa',
        productType: 'Tarjeta de Crédito',
        balanceHNL: 18500,
        interestRatePct: 45.0,
        details: 'Tarjeta Visa Oro al límite en cobro pre-judicial.'
      }
    ]
  },

  // 2. Banca Premier / Banca+ ($10k - $100k pasivos)
  {
    id: 'CLI-PRE-01',
    cif: 'CIF-0501-1979-00123',
    name: 'Dra. María Elena Villeda',
    division: 'premier',
    city: 'Tegucigalpa',
    notes: 'Médico especialista y accionista en clínica privada. Cliente preferencial Premier.',
    joinedMonth: 1,
    accountType: 'Cuenta DPF Plazo Fijo',
    accountBalanceHNL: 890000,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Platinum',
    creditCardLimitHNL: 250000,
    creditCardBalanceHNL: 42000,
    hasLoan: true,
    loanType: 'Préstamo de Vivienda',
    loanPrincipalHNL: 2800000,
    loanBalanceHNL: 2450000,
    loanMonthlyPaymentHNL: 28900,
    loanInterestRateAnnual: 11.5,
    loanMonthsRemaining: 140,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 885,
    cnbsCategory: 'I - Normal',
    pensionFundEnrolled: true,
    pensionFundProfile: 'Moderado',
    pensionBalanceHNL: 185000,
    otherBankProducts: [
      {
        id: 'obp-05',
        bankName: 'Banco Atlántida',
        productType: 'Cuenta de Depósitos / Ahorros',
        balanceHNL: 650000,
        interestRatePct: 3.5,
        details: 'DPF en Atlántida por vencer. Oportunidad de captación de fondos.'
      },
      {
        id: 'obp-06',
        bankName: 'Banco Ficohsa',
        productType: 'Tarjeta de Crédito',
        balanceHNL: 95000,
        interestRatePct: 38.0,
        details: 'Tarjeta Infinite Ficohsa Premier.'
      }
    ]
  },
  {
    id: 'CLI-PRE-02',
    cif: 'CIF-0801-1980-05678',
    name: 'Ing. Fernando Caraccioli',
    division: 'premier',
    city: 'San Pedro Sula',
    notes: 'Consultor de software e infraestructura para telecomunicaciones en Centroamérica.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 420000,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Platinum',
    creditCardLimitHNL: 180000,
    creditCardBalanceHNL: 31000,
    hasLoan: false,
    loanType: 'Ninguno',
    loanPrincipalHNL: 0,
    loanBalanceHNL: 0,
    loanMonthlyPaymentHNL: 0,
    loanInterestRateAnnual: 0,
    loanMonthsRemaining: 0,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 840,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-07',
        bankName: 'BAC Credomatic',
        productType: 'Préstamo Hipotecario',
        balanceHNL: 1650000,
        interestRatePct: 13.8,
        details: 'Crédito hipotecario en BAC con tasa ajustable.'
      }
    ]
  },

  // 3. Banca Privada & Fiduciaria (Wealth Management > $100k)
  {
    id: 'CLI-PRI-01',
    cif: 'CIF-PRIV-00918',
    name: 'Familia Larach & Asociados',
    division: 'privada',
    city: 'San Pedro Sula',
    notes: 'Grupo familiar con inversiones inmobiliarias, hoteleras y retail en SPS y Roatán.',
    joinedMonth: 1,
    accountType: 'Cuenta Offshore Multidivisa',
    accountBalanceHNL: 14500000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Infinite / Black',
    creditCardLimitHNL: 1200000,
    creditCardBalanceHNL: 85000,
    hasLoan: false,
    loanType: 'Ninguno',
    loanPrincipalHNL: 0,
    loanBalanceHNL: 0,
    loanMonthlyPaymentHNL: 0,
    loanInterestRateAnnual: 0,
    loanMonthsRemaining: 0,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 940,
    cnbsCategory: 'I - Normal',
    pensionFundEnrolled: true,
    pensionFundProfile: 'Crecimiento',
    pensionBalanceHNL: 3200000,
    otherBankProducts: [
      {
        id: 'obp-08',
        bankName: 'Banco Atlántida',
        productType: 'Cuenta de Depósitos / Ahorros',
        balanceHNL: 18000000,
        interestRatePct: 4.8,
        details: 'Mesa de dinero en Atlántida Fiduciaria. Trasladable con bono de tasa.'
      }
    ]
  },
  {
    id: 'CLI-PRI-02',
    cif: 'CIF-PRIV-00442',
    name: 'Fideicomiso Inmobiliario Morazán',
    division: 'privada',
    city: 'Tegucigalpa',
    notes: 'Fideicomiso de desarrollo de torres corporativas en bulevar Morazán.',
    joinedMonth: 1,
    accountType: 'Cuenta DPF Plazo Fijo',
    accountBalanceHNL: 8200000,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: 'Crédito de Desarrollo Fiduciario',
    loanPrincipalHNL: 6000000,
    loanBalanceHNL: 4800000,
    loanMonthlyPaymentHNL: 72000,
    loanInterestRateAnnual: 13.5,
    loanMonthsRemaining: 60,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 910,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-09',
        bankName: 'Banco de Occidente',
        productType: 'Préstamo Hipotecario',
        balanceHNL: 5200000,
        interestRatePct: 14.5,
        details: 'Financiamiento de terreno con garantía de primer grado.'
      }
    ]
  },

  // 4. Banca Comercial PYME
  {
    id: 'CLI-PYM-01',
    cif: 'CIF-PYME-0501-441',
    name: 'Ferretería El Tornillo de Oro S. de R.L.',
    division: 'pyme',
    city: 'San Pedro Sula',
    notes: 'Distribuidora ferretera en barrio Medina. Retraso de 95 días por cuentas por cobrar.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 380000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Empresarial',
    creditCardLimitHNL: 150000,
    creditCardBalanceHNL: 68000,
    hasLoan: true,
    loanType: 'Capital de Trabajo PYME',
    loanPrincipalHNL: 650000,
    loanBalanceHNL: 490000,
    loanMonthlyPaymentHNL: 32500,
    loanInterestRateAnnual: 18.0,
    loanMonthsRemaining: 20,
    guaranteedPayment: false,
    pastDueDays: 95, // En mora severa (Categoría IV)
    pastDueAmountHNL: 97500,
    equifaxScore: 610,
    cnbsCategory: 'IV - Dudoso Recaudo',
    otherBankProducts: [
      {
        id: 'obp-10',
        bankName: 'Banpaís',
        productType: 'Préstamo Personal',
        balanceHNL: 350000,
        interestRatePct: 19.5,
        details: 'Línea de sobregiro comercial en cobro administrativo.'
      }
    ]
  },
  {
    id: 'CLI-PYM-02',
    cif: 'CIF-PYME-0801-992',
    name: 'Café & Restaurante Mirador El Picacho',
    division: 'pyme',
    city: 'Tegucigalpa',
    notes: 'Negocio gastronómico icónico con alta afluencia y terminales POS activas.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 195000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Empresarial',
    creditCardLimitHNL: 80000,
    creditCardBalanceHNL: 24000,
    hasLoan: false,
    loanType: 'Ninguno',
    loanPrincipalHNL: 0,
    loanBalanceHNL: 0,
    loanMonthlyPaymentHNL: 0,
    loanInterestRateAnnual: 0,
    loanMonthsRemaining: 0,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 760,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-11',
        bankName: 'Banco Ficohsa',
        productType: 'Préstamo Personal',
        balanceHNL: 280000,
        interestRatePct: 17.5,
        details: 'Crédito de remodelación de cocina industrial.'
      }
    ]
  },

  // 5. Banca Corporativa
  {
    id: 'CLI-COR-01',
    cif: 'CIF-CORP-00109',
    name: 'Manufacturas Textiles del Norte (Gildan sub)',
    division: 'corporativa',
    city: 'Choloma',
    notes: 'Planta de confección textil con más de 1,200 colaboradores en parque industrial.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 12500000,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Corporativa',
    creditCardLimitHNL: 2000000,
    creditCardBalanceHNL: 450000,
    hasLoan: true,
    loanType: 'Línea de Factoring y Tesorería',
    loanPrincipalHNL: 18000000,
    loanBalanceHNL: 12500000,
    loanMonthlyPaymentHNL: 410000,
    loanInterestRateAnnual: 13.0,
    loanMonthsRemaining: 36,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 890,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-12',
        bankName: 'Banco Atlántida',
        productType: 'Préstamo Hipotecario',
        balanceHNL: 22000000,
        interestRatePct: 13.5,
        details: 'Crédito sindicado para naves industriales con tasa fija.'
      }
    ]
  },
  {
    id: 'CLI-COR-02',
    cif: 'CIF-CORP-00224',
    name: 'Agroindustria Palma de la Costa S.A.',
    division: 'corporativa',
    city: 'El Progreso / Tela',
    notes: 'Cultivo y procesamiento de palma aceitera con certificación internacional.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 6800000,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Corporativa',
    creditCardLimitHNL: 1500000,
    creditCardBalanceHNL: 280000,
    hasLoan: true,
    loanType: 'Préstamo Sindicado Corp',
    loanPrincipalHNL: 25000000,
    loanBalanceHNL: 22000000,
    loanMonthlyPaymentHNL: 580000,
    loanInterestRateAnnual: 12.8,
    loanMonthsRemaining: 50,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 840,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-13',
        bankName: 'Banpaís',
        productType: 'Préstamo Personal',
        balanceHNL: 15000000,
        interestRatePct: 14.0,
        details: 'Línea revolvente agroindustrial con garantía prendaria.'
      }
    ]
  },

  // 6. Banca Internacional
  {
    id: 'CLI-INT-01',
    cif: 'CIF-INT-09812',
    name: 'Grupo Agroindustrial Sula (División Export)',
    division: 'internacional',
    city: 'San Pedro Sula',
    notes: 'Exportador líder de concentrados y derivados a Estados Unidos y Europa.',
    joinedMonth: 1,
    accountType: 'Cuenta Offshore Multidivisa',
    accountBalanceHNL: 5400000,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: 'Carta de Crédito de Exportación',
    loanPrincipalHNL: 8500000,
    loanBalanceHNL: 6200000,
    loanMonthlyPaymentHNL: 185000,
    loanInterestRateAnnual: 11.2,
    loanMonthsRemaining: 24,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 870,
    cnbsCategory: 'I - Normal',
    otherBankProducts: [
      {
        id: 'obp-14',
        bankName: 'Banco Ficohsa',
        productType: 'Cuenta de Depósitos / Ahorros',
        balanceHNL: 9800000,
        interestRatePct: 3.2,
        details: 'Depósitos en dólares en banca corresponsal Ficohsa.'
      }
    ]
  },

  // 7. Cartera Institucional en Mora (Categorías I a V - Total L. 55,294,191.00)
  {
    id: 'CLI-MORA-01',
    cif: 'CIF-0501-1975-00891',
    name: 'Inversiones Comerciales Guaymuras S. de R.L.',
    division: 'pyme',
    city: 'San Pedro Sula',
    notes: 'Distribuidora de abarrotes. Atraso leve de 20 días por desfase de pagos en cadena de supermercados.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 145000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Empresarial',
    creditCardLimitHNL: 200000,
    creditCardBalanceHNL: 98000,
    hasLoan: true,
    loanType: 'Capital de Trabajo PYME',
    loanPrincipalHNL: 16000000,
    loanBalanceHNL: 14500000,
    loanMonthlyPaymentHNL: 420000,
    loanInterestRateAnnual: 17.5,
    loanMonthsRemaining: 42,
    guaranteedPayment: false,
    pastDueDays: 20,
    pastDueAmountHNL: 12450000,
    equifaxScore: 685,
    cnbsCategory: 'I - Normal',
    otherBankProducts: []
  },
  {
    id: 'CLI-MORA-02',
    cif: 'CIF-0101-1982-01449',
    name: 'Desarrollos Hoteleros de la Bahía S.A.',
    division: 'premier',
    city: 'La Ceiba / Roatán',
    notes: 'Complejo eco-turístico. Temporada baja generó retraso de 48 días en pago de cuotas hipotecarias.',
    joinedMonth: 1,
    accountType: 'Cuenta DPF Plazo Fijo',
    accountBalanceHNL: 320000,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Platinum',
    creditCardLimitHNL: 400000,
    creditCardBalanceHNL: 185000,
    hasLoan: true,
    loanType: 'Préstamo de Vivienda / Hotelero',
    loanPrincipalHNL: 18500000,
    loanBalanceHNL: 16800000,
    loanMonthlyPaymentHNL: 495000,
    loanInterestRateAnnual: 14.8,
    loanMonthsRemaining: 68,
    guaranteedPayment: false,
    pastDueDays: 48,
    pastDueAmountHNL: 14800000,
    equifaxScore: 620,
    cnbsCategory: 'II - Especial',
    otherBankProducts: []
  },
  {
    id: 'CLI-MORA-03',
    cif: 'CIF-0501-1980-03312',
    name: 'Transportes y Cargas del Norte S.A.',
    division: 'corporativa',
    city: 'Puerto Cortés',
    notes: 'Flota de transporte pesado. Contrato estatal impago provocó atraso de 75 días. Requiere plan de reestructuración.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 210000,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: 'Préstamo Sindicado Corp',
    loanPrincipalHNL: 15000000,
    loanBalanceHNL: 13500000,
    loanMonthlyPaymentHNL: 410000,
    loanInterestRateAnnual: 15.2,
    loanMonthsRemaining: 45,
    guaranteedPayment: false,
    pastDueDays: 75,
    pastDueAmountHNL: 11250000,
    equifaxScore: 560,
    cnbsCategory: 'III - Subnormal',
    otherBankProducts: []
  },
  {
    id: 'CLI-MORA-04',
    cif: 'CIF-0801-1976-00921',
    name: 'Agropecuaria El Zamorano / Valle Verde',
    division: 'pyme',
    city: 'Comayagua',
    notes: 'Cultivos bajo riego afectados por sequía. 135 días de atraso. Evaluar dación en pago de maquinaria o venta de cartera.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 85000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Empresarial',
    creditCardLimitHNL: 100000,
    creditCardBalanceHNL: 78000,
    hasLoan: true,
    loanType: 'Capital de Trabajo PYME',
    loanPrincipalHNL: 12000000,
    loanBalanceHNL: 10800000,
    loanMonthlyPaymentHNL: 340000,
    loanInterestRateAnnual: 18.0,
    loanMonthsRemaining: 38,
    guaranteedPayment: false,
    pastDueDays: 135,
    pastDueAmountHNL: 9450000,
    equifaxScore: 490,
    cnbsCategory: 'IV - Dudoso Recaudo',
    otherBankProducts: []
  },
  {
    id: 'CLI-MORA-05',
    cif: 'CIF-1501-1971-00109',
    name: 'Consorcio Maderero Olancho S.A.',
    division: 'corporativa',
    city: 'Juticalpa / Catacamas',
    notes: 'Planta de aserrío clausurada por litigio judicial. 240 días de atraso. Cartera en pérdida; candidato para venta a fondo de cobro o castigo.',
    joinedMonth: 1,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 12000,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: 'Préstamo Sindicado Corp',
    loanPrincipalHNL: 10000000,
    loanBalanceHNL: 8500000,
    loanMonthlyPaymentHNL: 290000,
    loanInterestRateAnnual: 19.5,
    loanMonthsRemaining: 30,
    guaranteedPayment: false,
    pastDueDays: 240,
    pastDueAmountHNL: 7344191,
    equifaxScore: 380,
    cnbsCategory: 'V - Pérdida',
    otherBankProducts: []
  }
];

export const INITIAL_SECONDARY_SECURITIES: SecondaryMarketSecurity[] = [
  // 1. Bonos Soberanos / SEFIN
  {
    id: 'sec-bch-01',
    name: 'Bono Soberano SEFIN 2030 (Tesoro Nacional)',
    category: 'Bono Soberano BCH / SEFIN',
    issuer: 'Gobierno de la República / SEFIN',
    issuerBadgeColor: '#0284c7',
    annualYieldOrDividendPct: 8.25,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 150,
    totalInvestedHNL: 15000000,
    riskRating: 'AAA',
    description: 'Bono respaldado por el Tesoro Nacional de Honduras a tasa fija con pago de cupón semestral.'
  },
  {
    id: 'sec-bch-02',
    name: 'Letra de Regulación Monetaria BCH 360D',
    category: 'Bono Soberano BCH / SEFIN',
    issuer: 'Banco Central de Honduras (BCH)',
    issuerBadgeColor: '#0284c7',
    annualYieldOrDividendPct: 7.10,
    pricePerUnitHNL: 50000,
    unitType: 'Bono',
    ownedUnits: 200,
    totalInvestedHNL: 10000000,
    riskRating: 'AAA',
    description: 'Instrumento monetario de corto plazo para absorción de liquidez del sistema bancario.'
  },

  // 2. Bonos Corporativos de Bancos Rivales
  {
    id: 'sec-bank-01',
    name: 'Bono Financiero Banco Atlántida S.A. 2028',
    category: 'Bono Corporativo Bancario',
    issuer: 'Banco Atlántida S.A.',
    issuerBadgeColor: '#dc2626',
    annualYieldOrDividendPct: 7.60,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 80,
    totalInvestedHNL: 8000000,
    riskRating: 'AA+',
    description: 'Bono senior colocado en Bolsa de Valores para financiamiento de proyectos de energía.'
  },
  {
    id: 'sec-bank-02',
    name: 'Bono Senior Banco Ficohsa S.A. 2027',
    category: 'Bono Corporativo Bancario',
    issuer: 'Banco Ficohsa S.A.',
    issuerBadgeColor: '#1d4ed8',
    annualYieldOrDividendPct: 7.90,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 60,
    totalInvestedHNL: 6000000,
    riskRating: 'AA+',
    description: 'Emisión respaldada por la cartera comercial preferencial de Grupo Ficohsa.'
  },
  {
    id: 'sec-bank-03',
    name: 'Bono Subordinado Banpaís 2029',
    category: 'Bono Corporativo Bancario',
    issuer: 'Banco del País S.A.',
    issuerBadgeColor: '#059669',
    annualYieldOrDividendPct: 7.75,
    pricePerUnitHNL: 50000,
    unitType: 'Bono',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA',
    description: 'Emisión subordinada de Banpaís para computar en su capital complementario Tier 2.'
  },
  {
    id: 'sec-bank-04',
    name: 'Bono Hipotecario Banco de Occidente 2030',
    category: 'Bono Corporativo Bancario',
    issuer: 'Banco de Occidente S.A.',
    issuerBadgeColor: '#d97706',
    annualYieldOrDividendPct: 7.30,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA',
    description: 'Bono garantizado por cartera hipotecaria del occidente y zona norte del país.'
  },

  // 3. Bonos Corporativos de Empresas Hondureñas
  {
    id: 'sec-corp-01',
    name: 'Bono Corporativo Cervecería Hondureña 2028',
    category: 'Bono Corporativo Empresa',
    issuer: 'Cervecería Hondureña (AB InBev)',
    issuerBadgeColor: '#eab308',
    annualYieldOrDividendPct: 8.10,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 50,
    totalInvestedHNL: 5000000,
    riskRating: 'AAA',
    description: 'Emisión del principal conglomerado de bebidas de Honduras para ampliación de flota ecológica.'
  },
  {
    id: 'sec-corp-02',
    name: 'Bono Industrial Corporación Dinant 2027',
    category: 'Bono Corporativo Empresa',
    issuer: 'Corporación Dinant S.A.',
    issuerBadgeColor: '#16a34a',
    annualYieldOrDividendPct: 8.40,
    pricePerUnitHNL: 50000,
    unitType: 'Bono',
    ownedUnits: 40,
    totalInvestedHNL: 2000000,
    riskRating: 'AA',
    description: 'Bono para expansión agroindustrial de aceites y snacks en el Valle de Aguán.'
  },
  {
    id: 'sec-corp-03',
    name: 'Bono Corporación Flores / Toyota 2029',
    category: 'Bono Corporativo Empresa',
    issuer: 'Grupo Flores Honduras',
    issuerBadgeColor: '#ef4444',
    annualYieldOrDividendPct: 7.85,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA+',
    description: 'Financiamiento de cartera automotriz y talleres de servicio técnico a nivel nacional.'
  },
  {
    id: 'sec-corp-04',
    name: 'Bono Agroindustrial Lacthosa Sula 2028',
    category: 'Bono Corporativo Empresa',
    issuer: 'Lacthosa Sula',
    issuerBadgeColor: '#06b6d4',
    annualYieldOrDividendPct: 8.15,
    pricePerUnitHNL: 100000,
    unitType: 'Bono',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA',
    description: 'Emisión para acopio y modernización de cadenas de frío lácteas y jugos cítricos.'
  },

  // 4. Acciones Ordinarias (Renta Variable Hondureña)
  {
    id: 'sec-stk-01',
    name: 'Acciones Ordinarias Grupo Financiero Ficohsa',
    category: 'Acción Ordinaria',
    issuer: 'Grupo Financiero Ficohsa',
    issuerBadgeColor: '#1d4ed8',
    annualYieldOrDividendPct: 9.20,
    pricePerUnitHNL: 420,
    unitType: 'Acción',
    ownedUnits: 12000,
    totalInvestedHNL: 5040000,
    riskRating: 'AA+',
    description: 'Participación patrimonial con pago regular de dividendos trimestrales y valorización bursátil.'
  },
  {
    id: 'sec-stk-02',
    name: 'Acciones Ordinarias Inversiones Atlántida S.A.',
    category: 'Acción Ordinaria',
    issuer: 'Inversiones Atlántida S.A.',
    issuerBadgeColor: '#dc2626',
    annualYieldOrDividendPct: 8.80,
    pricePerUnitHNL: 580,
    unitType: 'Acción',
    ownedUnits: 8000,
    totalInvestedHNL: 4640000,
    riskRating: 'AAA',
    description: 'Acciones del grupo financiero decano de Honduras con operaciones bancarias y fiduciarias.'
  },
  {
    id: 'sec-stk-03',
    name: 'Acciones Banco de Occidente S.A.',
    category: 'Acción Ordinaria',
    issuer: 'Banco de Occidente',
    issuerBadgeColor: '#d97706',
    annualYieldOrDividendPct: 8.50,
    pricePerUnitHNL: 650,
    unitType: 'Acción',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA',
    description: 'Entidad de solidez histórica y alta liquidez con presencia en zonas cafetaleras y ganaderas.'
  },
  {
    id: 'sec-stk-04',
    name: 'Acciones Cervecería Hondureña S.A.',
    category: 'Acción Ordinaria',
    issuer: 'Cervecería Hondureña',
    issuerBadgeColor: '#eab308',
    annualYieldOrDividendPct: 10.10,
    pricePerUnitHNL: 820,
    unitType: 'Acción',
    ownedUnits: 5000,
    totalInvestedHNL: 4100000,
    riskRating: 'AAA',
    description: 'Empresa líder de consumo masivo con altísima rentabilidad sobre patrimonio (ROE > 22%).'
  },
  {
    id: 'sec-stk-05',
    name: 'Acciones Corporación Dinant S.A.',
    category: 'Acción Ordinaria',
    issuer: 'Corporación Dinant',
    issuerBadgeColor: '#16a34a',
    annualYieldOrDividendPct: 9.50,
    pricePerUnitHNL: 310,
    unitType: 'Acción',
    ownedUnits: 0,
    totalInvestedHNL: 0,
    riskRating: 'AA',
    description: 'Acciones ordinarias de agroalimentos y productos para el hogar con fuerte exportación regional.'
  }
];

export const INITIAL_PENSION_FUNDS: PensionFund[] = [
  {
    id: 'pen-conservador',
    name: 'Fondo de Pensiones Conservador Áureo',
    profile: 'Conservador',
    description: 'Portafolio enfocado en preservación de capital mediante Letras y Bonos Soberanos del BCH y DPF interbancarios.',
    annualReturnMinPct: 6.0,
    annualReturnMaxPct: 9.0,
    currentAnnualReturnPct: 7.5,
    managementFeePct: 0.85,
    totalAUM_HNL: 185000000,
    affiliateCount: 4200
  },
  {
    id: 'pen-moderado',
    name: 'Fondo de Pensiones Mixto Moderado',
    profile: 'Moderado',
    description: 'Equilibrio prudencial: 70% títulos del Estado de Honduras y 30% participaciones sindicadas corporativas.',
    annualReturnMinPct: 7.5,
    annualReturnMaxPct: 11.0,
    currentAnnualReturnPct: 9.2,
    managementFeePct: 1.15,
    totalAUM_HNL: 145000000,
    affiliateCount: 2850
  },
  {
    id: 'pen-crecimiento',
    name: 'Fondo de Cesantías y Retiro Crecimiento',
    profile: 'Crecimiento',
    description: 'Portafolio dinámico invertido en proyectos de infraestructura, energía renovable y divisas internacionales.',
    annualReturnMinPct: 9.0,
    annualReturnMaxPct: 14.5,
    currentAnnualReturnPct: 11.8,
    managementFeePct: 1.50,
    totalAUM_HNL: 98000000,
    affiliateCount: 1620
  }
];

export const INITIAL_POS_MERCHANTS: PosMerchant[] = [
  {
    id: 'pos-01',
    merchantName: 'Supermercados La Económica S.A.',
    businessCategory: 'Supermercado & Abarrotería',
    city: 'San Pedro Sula',
    physicalPosCount: 12,
    virtualPosCount: 2,
    hasTapToPay: true,
    monthlySalesVolumeHNL: 4850000,
    bankAccountBalanceHNL: 1420000,
    transactionFeePct: 2.1,
    creditEligible: true,
    hasCommercialLoan: true,
    commercialLoanAmount: 1200000,
    hasBusinessCard: true,
    accountNumber: 'CTA-PYM-0501-8812-01',
    division: 'pyme'
  },
  {
    id: 'pos-02',
    merchantName: 'Ferretería & Materiales del Norte',
    businessCategory: 'Ferretería & Construcción',
    city: 'Choloma',
    physicalPosCount: 6,
    virtualPosCount: 1,
    hasTapToPay: true,
    monthlySalesVolumeHNL: 2950000,
    bankAccountBalanceHNL: 890000,
    transactionFeePct: 2.2,
    creditEligible: true,
    hasCommercialLoan: false,
    commercialLoanAmount: 0,
    hasBusinessCard: true,
    accountNumber: 'CTA-PYM-0501-9923-04',
    division: 'pyme'
  },
  {
    id: 'pos-03',
    merchantName: 'Restaurante & Carnes El Leñador',
    businessCategory: 'Restaurante & Café',
    city: 'Tegucigalpa',
    physicalPosCount: 4,
    virtualPosCount: 1,
    hasTapToPay: false,
    monthlySalesVolumeHNL: 1650000,
    bankAccountBalanceHNL: 420000,
    transactionFeePct: 2.5,
    creditEligible: true,
    hasCommercialLoan: false,
    commercialLoanAmount: 0,
    hasBusinessCard: false,
    accountNumber: 'CTA-PYM-0801-7714-02',
    division: 'pyme'
  },
  {
    id: 'pos-04',
    merchantName: 'Farmacias Sagrado Corazón',
    businessCategory: 'Farmacia & Salud',
    city: 'Comayagua',
    physicalPosCount: 3,
    virtualPosCount: 0,
    hasTapToPay: true,
    monthlySalesVolumeHNL: 980000,
    bankAccountBalanceHNL: 280000,
    transactionFeePct: 2.3,
    creditEligible: true,
    hasCommercialLoan: true,
    commercialLoanAmount: 350000,
    hasBusinessCard: true,
    accountNumber: 'CTA-PYM-0301-3315-08',
    division: 'pyme'
  },
  {
    id: 'pos-05',
    merchantName: 'Boutique & Moda D’Lujo',
    businessCategory: 'Tienda Retail & Moda',
    city: 'Roatán',
    physicalPosCount: 2,
    virtualPosCount: 2,
    hasTapToPay: true,
    monthlySalesVolumeHNL: 720000,
    bankAccountBalanceHNL: 160000,
    transactionFeePct: 2.8,
    creditEligible: false,
    hasCommercialLoan: false,
    commercialLoanAmount: 0,
    hasBusinessCard: false,
    accountNumber: 'CTA-PYM-1101-5516-11',
    division: 'pyme'
  }
];

export const INITIAL_DIVISIONS: Record<string, BankDivisionConfig> = {
  personas: {
    id: 'personas',
    name: 'Banca Personas (Retail)',
    categoryTag: 'Cuentas, Préstamos y Tarjetas',
    description: 'Atención a personas naturales, asalariados y familias en Honduras con cuentas de ahorro, tarjetas y remesas.',
    clientCount: 18450,
    totalDeposits: 680000000,
    totalLoans: 520000000,
    avgDepositRate: 5.5,
    avgLendingRate: 22.0,
    feeIncomeMonthly: 1450000,
    delinquencyRate: 2.4,
    satisfactionScore: 82,
    activeAccountsCount: 22100,
    activeCardsCount: 8900,
    specificFeatures: [
      { label: 'Cuentas de Ahorro Rendimiento', value: '5.5% anual', status: 'activo' },
      { label: 'Tarjeta Visa Clásica / Oro', value: 'Hasta L. 60,000', status: 'activo' },
      { label: 'Préstamos Personales y Auto', value: 'Plazo hasta 60 meses', status: 'activo' },
      { label: 'Recepción de Remesas Familiares', value: 'Cobro en ventanilla y App', status: 'destacado' }
    ]
  },
  premier: {
    id: 'premier',
    name: 'Banca Premier / Banca+',
    categoryTag: 'Segmento Preferencial ($10k-$100k)',
    description: 'Clientes de ingresos medios-altos y profesionales con pasivos entre US$ 10,000 y US$ 100,000 con atención dedicada.',
    clientCount: 1420,
    totalDeposits: 410000000,
    totalLoans: 310000000,
    avgDepositRate: 6.8,
    avgLendingRate: 17.5,
    feeIncomeMonthly: 890000,
    delinquencyRate: 1.1,
    satisfactionScore: 89,
    activeAccountsCount: 2150,
    activeCardsCount: 1650,
    specificFeatures: [
      { label: 'Ejecutivo de Negocio Asignado', value: 'Atención personalizada', status: 'activo' },
      { label: 'Tarjeta Mastercard Platinum', value: 'Salas VIP y seguros', status: 'activo' },
      { label: 'Tasa DPF Preferencial', value: '+0.8% s/tasa regular', status: 'destacado' },
      { label: 'Línea de Sobregiro Automático', value: 'Precalificada', status: 'disponible' }
    ]
  },
  privada: {
    id: 'privada',
    name: 'Banca Privada y Fiduciaria',
    categoryTag: 'Wealth Management (> $100,000)',
    description: 'Grandes patrimonios familiares, fondos de inversión y fideicomisos estructurados testamentarios y mercantiles.',
    clientCount: 195,
    totalDeposits: 580000000,
    totalLoans: 290000000,
    avgDepositRate: 7.2,
    avgLendingRate: 14.5,
    feeIncomeMonthly: 1250000,
    delinquencyRate: 0.4,
    satisfactionScore: 94,
    activeAccountsCount: 420,
    activeCardsCount: 280,
    specificFeatures: [
      { label: 'Fideicomisos y Planificación Patrimonial', value: 'Comisión 0.85%', status: 'activo' },
      { label: 'Tarjeta Visa Infinite / Black', value: 'Cupos internacionales', status: 'activo' },
      { label: 'Cuentas Offshore Multidivisa', value: 'USD, EUR y CHF', status: 'activo' },
      { label: 'Salas Privadas de Directorio', value: 'SPS y Tegucigalpa', status: 'destacado' }
    ]
  },
  pyme: {
    id: 'pyme',
    name: 'Banca Comercial PYME',
    categoryTag: 'Negocios, POS y Agroindustria',
    description: 'Comercios, distribuidoras, talleres y empresas medianas con líneas de capital de trabajo y terminales de cobro POS.',
    clientCount: 2850,
    totalDeposits: 320000000,
    totalLoans: 490000000,
    avgDepositRate: 5.0,
    avgLendingRate: 19.5,
    feeIncomeMonthly: 1680000,
    delinquencyRate: 2.8,
    satisfactionScore: 81,
    activeAccountsCount: 3900,
    activeCardsCount: 1850,
    specificFeatures: [
      { label: 'Terminales POS Físicas y Virtuales', value: 'Comisión 2.2% MDR', status: 'activo' },
      { label: 'Líneas de Capital de Trabajo', value: 'Desembolso en 48h', status: 'activo' },
      { label: 'Tarjeta Visa Empresarial', value: 'Control de gastos pyme', status: 'activo' },
      { label: 'Pago Link & Botón de Pago', value: 'E-commerce integrado', status: 'disponible' }
    ]
  },
  corporativa: {
    id: 'corporativa',
    name: 'Banca Corporativa',
    categoryTag: 'Grandes Empresas y Maquilas',
    description: 'Servicio a corporaciones multinacionales, consorcios azucareros, textileras de maquila y cadenas de supermercados.',
    clientCount: 85,
    totalDeposits: 280000000,
    totalLoans: 340000000,
    avgDepositRate: 6.0,
    avgLendingRate: 13.0,
    feeIncomeMonthly: 2150000,
    delinquencyRate: 0.2,
    satisfactionScore: 92,
    activeAccountsCount: 190,
    activeCardsCount: 120,
    specificFeatures: [
      { label: 'Dispersión Automática de Planillas', value: 'ACH Pronto y cuentas', status: 'activo' },
      { label: 'Préstamos Sindicados Multibancarios', value: 'Liderazgo con Atlántida', status: 'activo' },
      { label: 'Factoraje y Cesión de Facturas', value: 'Liquidez inmediata', status: 'destacado' },
      { label: 'Banca en Línea Empresarial (Host to Host)', value: 'Seguridad tokenizada', status: 'activo' }
    ]
  },
  internacional: {
    id: 'internacional',
    name: 'Banca Internacional & SWIFT',
    categoryTag: 'Comercio Exterior y Corresponsalía',
    description: 'Gestión de transferencias internacionales SWIFT, cartas de crédito comerciales y mesas de cambio de divisas.',
    clientCount: 120,
    totalDeposits: 70000000,
    totalLoans: 45000000,
    avgDepositRate: 3.5, // En USD
    avgLendingRate: 10.5,
    feeIncomeMonthly: 1850000,
    delinquencyRate: 0.1,
    satisfactionScore: 90,
    activeAccountsCount: 155,
    activeCardsCount: 45,
    specificFeatures: [
      { label: 'Corresponsalía Directa EEUU (JPMorgan/Citi)', value: 'MT103 instantáneo', status: 'activo' },
      { label: 'Corresponsalía Suiza (UBS / Credit Suisse)', value: 'Cuentas Custodia', status: 'activo' },
      { label: 'Corresponsalía China (ICBC / Bank of China)', value: 'Financiamiento import', status: 'activo' },
      { label: 'Cartas de Crédito y Garantías Standby', value: 'Avales comerciales', status: 'destacado' }
    ]
  }
};

export const INITIAL_STAFF: StaffRole[] = [
  {
    id: 'oficiales_credito',
    title: 'Oficiales de Crédito y Negocios',
    category: 'Comercial',
    count: 20,
    monthlySalaryPerPerson: 22000,
    efficiencyBonus: 1.15,
    benefitDescription: 'Colocan préstamos, prospectan pymes y aumentan la cartera crediticia.'
  },
  {
    id: 'analistas_riesgo',
    title: 'Analistas de Riesgo Crediticio',
    category: 'Riesgo y Análisis',
    count: 6,
    monthlySalaryPerPerson: 28000,
    efficiencyBonus: 1.25,
    benefitDescription: 'Evalúan scoring de buró y reducen el índice de morosidad (NPL) del banco.'
  },
  {
    id: 'cajeros_ventanilla',
    title: 'Cajeros y Oficiales de Ventanilla',
    category: 'Operaciones y Ventanilla',
    count: 35,
    monthlySalaryPerPerson: 16000,
    efficiencyBonus: 1.10,
    benefitDescription: 'Atienden remesas, depósitos de ventanilla y mejoran la satisfacción al cliente.'
  },
  {
    id: 'cumplimiento_aml',
    title: 'Oficiales de Cumplimiento AML / OFAC',
    category: 'Cumplimiento Legal AML',
    count: 4,
    monthlySalaryPerPerson: 32000,
    efficiencyBonus: 1.30,
    benefitDescription: 'Monitorean transferencias SWIFT, previenen multas de la CNBS y blindan el banco.'
  }
];

export const INITIAL_BOARD: BoardDirector[] = [
  {
    id: 'dir_riesgo',
    name: 'Lic. Guillermo Bueso Morales',
    title: 'Director de Riesgo Crediticio',
    loyalty: 88,
    annualBonusHNL: 1200000,
    passivePerk: '-0.35% de morosidad mensual general y menor gasto en provisiones CNBS.',
    avatarSeed: 'director_riesgo'
  },
  {
    id: 'dir_tesoreria',
    name: 'Msc. Claudia Atala Kafati',
    title: 'Director de Finanzas y Tesorería',
    loyalty: 92,
    annualBonusHNL: 1400000,
    passivePerk: '+0.5% de rendimiento en títulos soberanos BCH y subastas de divisas USD.',
    avatarSeed: 'directora_tesoreria'
  },
  {
    id: 'dir_comercial',
    name: 'Ing. Eduardo Facussé Handal',
    title: 'Director de Banca Comercial',
    loyalty: 85,
    annualBonusHNL: 1100000,
    passivePerk: '+15% de efectividad en campañas agresivas de robo de cartera y atracción de clientes.',
    avatarSeed: 'director_comercial'
  }
];

export const INITIAL_BRANCHES: BranchLocation[] = [
  {
    id: 'suc-sps-centro',
    cityName: 'San Pedro Sula',
    zone: 'Centro Histórico (3ra Avenida)',
    tier: 'Sucursal Principal',
    isOpen: true,
    costToOpen: 0,
    monthlyOpex: 450000,
    capturedDepositsM: 920,
    loansDisbursedM: 840,
    staffAssigned: 24
  },
  {
    id: 'suc-teg-morazan',
    cityName: 'Tegucigalpa',
    zone: 'Bulevar Morazán / Las Lomas',
    tier: 'Sucursal Principal',
    isOpen: true,
    costToOpen: 0,
    monthlyOpex: 420000,
    capturedDepositsM: 880,
    loansDisbursedM: 780,
    staffAssigned: 22
  },
  {
    id: 'suc-ceiba-sanisidro',
    cityName: 'La Ceiba',
    zone: 'Avenida San Isidro',
    tier: 'Agencia Completa',
    isOpen: true,
    costToOpen: 0,
    monthlyOpex: 180000,
    capturedDepositsM: 320,
    loansDisbursedM: 260,
    staffAssigned: 12
  },
  {
    id: 'suc-comayagua-palmerola',
    cityName: 'Comayagua',
    zone: 'Corredor Logístico Palmerola',
    tier: 'Agencia Completa',
    isOpen: true,
    costToOpen: 0,
    monthlyOpex: 150000,
    capturedDepositsM: 220,
    loansDisbursedM: 190,
    staffAssigned: 9
  },
  {
    id: 'suc-choluteca-sur',
    cityName: 'Choluteca',
    zone: 'Boulevard Enrique Weddle',
    tier: 'Agencia Completa',
    isOpen: false,
    costToOpen: 4500000,
    monthlyOpex: 130000,
    capturedDepositsM: 0,
    loansDisbursedM: 0,
    staffAssigned: 0
  },
  {
    id: 'suc-roatan-coxen',
    cityName: 'Roatán',
    zone: 'Coxen Hole & West Bay',
    tier: 'Agencia Completa',
    isOpen: false,
    costToOpen: 6000000,
    monthlyOpex: 210000,
    capturedDepositsM: 0,
    loansDisbursedM: 0,
    staffAssigned: 0
  }
];

export const INITIAL_PAYROLL_AGREEMENTS: CorporatePayrollAgreement[] = [
  {
    id: 'pay-01',
    companyName: 'Manufacturas Textiles del Valle S.A.',
    industry: 'Sector Textil Maquila (Choloma)',
    employeeCount: 1450,
    monthlyPayrollVolume: 26825000, // L. 18,500 salario promedio
    feePerEmployee: 18, // L. 18 por dispersión al mes
    averageSalary: 18500,
    eligiblePayrollLoansCount: 420,
    status: 'Activo',
    monthsWithBank: 8,
    isAutoRenewed: true,
    loyaltyBonusPct: 5,
    linkedDivision: 'corporativa',
    bankAccountBalanceHNL: 14500000,
    accountNumber: 'CTA-CORP-0501-8841-01'
  },
  {
    id: 'pay-02',
    companyName: 'Distribuidora Alimentos Maya S. de R.L.',
    industry: 'Consumo Masivo y Logística (SPS)',
    employeeCount: 680,
    monthlyPayrollVolume: 14960000,
    feePerEmployee: 20,
    averageSalary: 22000,
    eligiblePayrollLoansCount: 190,
    status: 'Activo',
    monthsWithBank: 6,
    isAutoRenewed: true,
    loyaltyBonusPct: 5,
    linkedDivision: 'corporativa',
    bankAccountBalanceHNL: 8900000,
    accountNumber: 'CTA-CORP-0501-4412-09'
  },
  {
    id: 'pay-03',
    companyName: 'Hospital Quirúrgico Metropolitano',
    industry: 'Salud Privada (Tegucigalpa)',
    employeeCount: 380,
    monthlyPayrollVolume: 12160000,
    feePerEmployee: 25,
    averageSalary: 32000,
    eligiblePayrollLoansCount: 140,
    status: 'Activo',
    monthsWithBank: 4,
    isAutoRenewed: false,
    loyaltyBonusPct: 0,
    linkedDivision: 'pyme',
    bankAccountBalanceHNL: 4200000,
    accountNumber: 'CTA-PYM-0801-9921-03'
  }
];

export const INITIAL_CLEARING: ClearingHouseStats = {
  achIncomingTransfers: 38500,
  achOutgoingTransfers: 41200,
  achFeePerTransfer: 20, // L. 20 por transferencia ACH Pronto
  achNetClearingPosition: 1850000, // Saldo a favor neto ante BCH
  interbankChecksProcessed: 6800,
  checkRejectionRate: 0.85,
  clearingFeeIncome: 824000
};

export const INITIAL_REMITTANCES: FamilyRemittanceChannel[] = [
  {
    name: 'Western Union',
    monthlyVolumeUSD: 4200000,
    remittancesCount: 12500,
    feePerRemittanceUSD: 4.5,
    directAccountDepositPct: 45
  },
  {
    name: 'MoneyGram',
    monthlyVolumeUSD: 3100000,
    remittancesCount: 9200,
    feePerRemittanceUSD: 4.0,
    directAccountDepositPct: 38
  },
  {
    name: 'Ventanilla Áureo Express',
    monthlyVolumeUSD: 1800000,
    remittancesCount: 5400,
    feePerRemittanceUSD: 5.5,
    directAccountDepositPct: 65
  }
];

export const INITIAL_SWIFT: SwiftTransaction[] = [
  {
    id: 'SW-2601-01',
    direction: 'Saliente',
    counterpartyBank: 'JPMorgan Chase (Nueva York)',
    counterpartyCountry: 'Estados Unidos',
    currency: 'USD',
    amountFX: 180000,
    clientName: 'Grupo Agroindustrial Sula',
    purpose: 'Pago de Importación de Maquinaria',
    feeUSD: 45,
    settlementStatus: 'Liquidado',
    complianceCheck: 'Aprobado OFAC/BCH'
  },
  {
    id: 'SW-2601-02',
    direction: 'Saliente',
    counterpartyBank: 'ICBC (Shanghái)',
    counterpartyCountry: 'China',
    currency: 'USD',
    amountFX: 340000,
    clientName: 'Comercializadora Electrónica Hondureña',
    purpose: 'Materia Prima Textil',
    feeUSD: 55,
    settlementStatus: 'Liquidado',
    complianceCheck: 'Aprobado OFAC/BCH'
  },
  {
    id: 'SW-2601-03',
    direction: 'Entrante',
    counterpartyBank: 'UBS (Zúrich)',
    counterpartyCountry: 'Suiza',
    currency: 'USD',
    amountFX: 250000,
    clientName: 'Inversiones Familia Larach',
    purpose: 'Inversión Financiera',
    feeUSD: 50,
    settlementStatus: 'Liquidado',
    complianceCheck: 'Aprobado OFAC/BCH'
  }
];

export const INITIAL_TREASURY: TreasuryAsset[] = [
  {
    id: 'bono-bch-26',
    type: 'Bono Soberano BCH',
    title: 'Bono BCH Rendimiento Monetario 2026-A',
    principalHNL: 150000000,
    interestRateAnnual: 6.85,
    maturityMonthsRemaining: 18,
    currentYieldAnnual: 6.85,
    liquidityTier: 'Alta'
  },
  {
    id: 'letra-bch-180',
    type: 'Letra de Regulación BCH',
    title: 'Letra de Absorción de Liquidez 180 días',
    principalHNL: 80000000,
    interestRateAnnual: 6.10,
    maturityMonthsRemaining: 5,
    currentYieldAnnual: 6.10,
    liquidityTier: 'Alta'
  },
  {
    id: 'accion-dinant',
    type: 'Acción Bursátil',
    title: 'Corporación Industrial Agroalimentaria (Bolsa HNL)',
    principalHNL: 35000000,
    interestRateAnnual: 8.50,
    maturityMonthsRemaining: 36,
    currentYieldAnnual: 9.10,
    liquidityTier: 'Media'
  }
];

export const INITIAL_APPLICATIONS: CreditApplication[] = [
  {
    id: 'SOL-2026-081',
    applicantName: 'Dra. María Elena Villeda',
    division: 'premier',
    productType: 'Préstamo de Vivienda',
    requestedAmount: 2800000,
    termMonths: 180,
    proposedRate: 11.5,
    monthlyIncome: 140000,
    monthlyObligations: 26000,
    calculatedDTI: 34.2,
    cnbsCategory: 'I - Normal',
    equifaxScore: 885,
    collateralType: 'Hipoteca Inmobiliaria',
    collateralValue: 4200000,
    location: 'Tegucigalpa (Las Lomas)',
    riskVerdict: 'Bajo Riesgo',
    reasonText: 'Médico especialista con 12 años en Hospital Viera. Capacidad de pago comprobada y garantía con LTV 66%.',
    officerNote: 'Solicitud dentro de la autonomía máxima de L. 20M. Scoring excelente (885) y ratio DTI holgado. El Oficial de Crédito aprueba automáticamente bajo política institucional.',
    officerRecommendation: 'Favorable (Aprobación Sugerida)',
    officerCanAutoApprove: true,
    requiresExecutiveBoardApproval: false,
    officerDecisionStatus: 'Pendiente'
  },
  {
    id: 'SOL-2026-082',
    applicantName: 'Ferretería El Tornillo de Oro S. de R.L.',
    division: 'pyme',
    productType: 'Capital de Trabajo PYME',
    requestedAmount: 650000,
    termMonths: 24,
    proposedRate: 18.0,
    monthlyIncome: 280000,
    monthlyObligations: 72000,
    calculatedDTI: 41.5,
    cnbsCategory: 'I - Normal',
    equifaxScore: 730,
    collateralType: 'Garantía Solidaria',
    collateralValue: 900000,
    location: 'San Pedro Sula (Medina)',
    riskVerdict: 'Riesgo Moderado',
    reasonText: 'Comercio con 7 años de operación. Ventas estables, solicita compra de inventario importado para temporada.',
    officerNote: 'Comercio afiliado a la red POS de Áureo. Flujo verificable en cuentas del banco. Oficial de crédito faculta desembolso inmediato.',
    officerRecommendation: 'Favorable (Aprobación Sugerida)',
    officerCanAutoApprove: true,
    requiresExecutiveBoardApproval: false,
    officerDecisionStatus: 'Pendiente'
  },
  {
    id: 'SOL-2026-083',
    applicantName: 'Carlos Roberto Pineda',
    division: 'personas',
    productType: 'Deducción por Planilla',
    requestedAmount: 95000,
    termMonths: 36,
    proposedRate: 19.0,
    monthlyIncome: 24000,
    monthlyObligations: 4200,
    calculatedDTI: 32.8,
    cnbsCategory: 'I - Normal',
    equifaxScore: 695,
    collateralType: 'Retención Salarial',
    collateralValue: 95000,
    location: 'Choloma (ZIP Choloma)',
    riskVerdict: 'Bajo Riesgo',
    reasonText: 'Supervisor de planta en empresa con convenio de nómina Áureo. Descuento automático por planilla.',
    officerNote: 'Deducción directa garantizada por convenio de nómina con Manufacturas Textiles del Valle S.A. Oficial de Crédito aprueba automáticamente.',
    officerRecommendation: 'Favorable (Aprobación Sugerida)',
    officerCanAutoApprove: true,
    requiresExecutiveBoardApproval: false,
    officerDecisionStatus: 'Pendiente'
  },
  {
    id: 'SOL-2026-084',
    applicantName: 'Agroindustria Palma de la Costa S.A.',
    division: 'corporativa',
    productType: 'Préstamo Sindicado Corp',
    requestedAmount: 25000000,
    termMonths: 60,
    proposedRate: 12.8,
    monthlyIncome: 8500000,
    monthlyObligations: 1900000,
    calculatedDTI: 29.5,
    cnbsCategory: 'I - Normal',
    equifaxScore: 840,
    collateralType: 'Hipoteca Inmobiliaria',
    collateralValue: 42000000,
    location: 'El Progreso / Tela',
    riskVerdict: 'Bajo Riesgo',
    reasonText: 'Exportadora consolidada. Financiamiento para ampliación de planta extractora. Participación conjunta con Banpaís.',
    officerNote: 'NOTA DEL OFICIAL DE CRÉDITO: El monto solicitado de L. 25,000,000.00 supera mi límite autónomo de 20 millones. La empresa exporta a México y la UE, cuenta con hipoteca industrial de L. 42M (LTV 59.5%) y liquidez sólida. Emitimos DICTAMEN FAVORABLE y remitimos el caso a su decisión como Presidente y al Comité Ejecutivo de Crédito.',
    officerRecommendation: 'Favorable (Aprobación Sugerida)',
    officerCanAutoApprove: false,
    requiresExecutiveBoardApproval: true,
    officerDecisionStatus: 'Enviado a Comité'
  },
  {
    id: 'SOL-2026-085',
    applicantName: 'Constructora & Pavimentos Morazán S.A.',
    division: 'corporativa',
    productType: 'Préstamo Sindicado Corp',
    requestedAmount: 38000000,
    termMonths: 72,
    proposedRate: 13.5,
    monthlyIncome: 12000000,
    monthlyObligations: 3400000,
    calculatedDTI: 36.2,
    cnbsCategory: 'I - Normal',
    equifaxScore: 810,
    collateralType: 'Hipoteca Inmobiliaria',
    collateralValue: 55000000,
    location: 'San Pedro Sula (Bulevar del Norte)',
    riskVerdict: 'Bajo Riesgo',
    reasonText: 'Consorcio vial con licitación pública adjudicada para infraestructura urbana.',
    officerNote: 'NOTA DEL OFICIAL DE CRÉDITO: Solicitud de L. 38,000,000.00 reservada estrictamente al Presidente Ejecutivo. Garantía hipotecaria y cesión de flujos del fideicomiso vial. Emitimos recomendación favorable con condición de retención del 10% en cuenta de reserva.',
    officerRecommendation: 'Favorable (Aprobación Sugerida)',
    officerCanAutoApprove: false,
    requiresExecutiveBoardApproval: true,
    officerDecisionStatus: 'Enviado a Comité'
  },
  {
    id: 'SOL-2026-086',
    applicantName: 'Juan Carlos Midence',
    division: 'personas',
    productType: 'Préstamo Personal',
    requestedAmount: 180000,
    termMonths: 48,
    proposedRate: 24.0,
    monthlyIncome: 22000,
    monthlyObligations: 12500,
    calculatedDTI: 68.4,
    cnbsCategory: 'III - Subnormal',
    equifaxScore: 540,
    collateralType: 'Sin Garantía',
    collateralValue: 0,
    location: 'Comayagüela',
    riskVerdict: 'Alto Riesgo',
    reasonText: 'DTI excede el 68%. Tarjetas en atraso de 45 días en Ficohsa. Riesgo de mora elevado; requiere aval o rechazo.',
    officerNote: 'Oficial de Crédito dictamina RECHAZO AUTOMÁTICO por sobreendeudamiento (DTI > 65%) e historial negativo en buró Equifax.',
    officerRecommendation: 'Desfavorable (Riesgo Excesivo)',
    officerCanAutoApprove: true,
    requiresExecutiveBoardApproval: false,
    officerDecisionStatus: 'Pendiente'
  }
];

export const INITIAL_INTERBANK_OFFERS: InterbankPortfolioOffer[] = [
  {
    id: 'mna-01',
    sellerBankId: 'ficohsa',
    sellerBankName: 'Banco Ficohsa S.A.',
    portfolioType: 'activos_creditos',
    name: 'Paquete Préstamos Hipotecarios Residenciales San Pedro Sula',
    faceValueHNL: 40000000,
    offerPriceHNL: 38400000,
    discountOrPremiumPct: -4.0,
    averageRatePct: 13.5,
    riskRating: 'Bajo (A+)',
    clientCount: 22,
    termMonthsAvg: 140,
    description: 'Cartera hipotecaria de primer orden en colonias residenciales de San Pedro Sula (Trejo, Bella Vista). 100% al día con garantía hipotecaria inscrita.',
    status: 'disponible'
  },
  {
    id: 'mna-02',
    sellerBankId: 'atlantida',
    sellerBankName: 'Banco Atlántida S.A.',
    portfolioType: 'activos_creditos',
    name: 'Cartera Comercial PYME Agroindustrial Valle de Sula',
    faceValueHNL: 65000000,
    offerPriceHNL: 58500000,
    discountOrPremiumPct: -10.0,
    averageRatePct: 16.2,
    riskRating: 'Moderado (BBB)',
    clientCount: 38,
    termMonthsAvg: 36,
    description: 'Créditos productivos a procesadoras de granos y cítricos. Atlántida busca liberar espacio en su cupo de concentración agroindustrial.',
    status: 'disponible'
  },
  {
    id: 'mna-03',
    sellerBankId: 'bac',
    sellerBankName: 'BAC Credomatic',
    portfolioType: 'activos_creditos',
    name: 'Paquete Crédito de Consumo y Tarjetas Oro/Platinum',
    faceValueHNL: 28000000,
    offerPriceHNL: 23800000,
    discountOrPremiumPct: -15.0,
    averageRatePct: 24.5,
    riskRating: 'Alto (B)',
    clientCount: 140,
    termMonthsAvg: 24,
    description: 'Clientes de consumo con alto rendimiento financiero pero atrasos rotativos de 30-45 días. Ofrece alto margen de cobro mensual.',
    status: 'disponible'
  },
  {
    id: 'mna-04',
    sellerBankId: 'occidente',
    sellerBankName: 'Banco de Occidente S.A.',
    portfolioType: 'pasivos_depositos',
    name: 'Paquete de Captación: Depósitos a Plazo Fijo DPF Fiduciarios',
    faceValueHNL: 50000000,
    offerPriceHNL: 50000000,
    discountOrPremiumPct: 0.0,
    averageRatePct: 5.75,
    riskRating: 'Bajo (A+)',
    clientCount: 12,
    termMonthsAvg: 18,
    description: 'Transferencia de pasivos estables de cooperativas y fondos del occidente. Incrementa de inmediato la liquidez y depósitos de Áureo Bank.',
    status: 'disponible'
  }
];

export const INITIAL_DYNAMIC_ALERTS: DynamicAlert[] = [
  {
    id: 'alert-01',
    severity: 'critica',
    category: 'regulatorio_cnbs',
    title: 'Monitoreo de Encaje Legal Obligatorio BCH',
    message: 'El encaje legal requerido por el BCH se sitúa en L. 280,800,000.00 (12.0% de captaciones). Tu disponibilidad de caja cubre holgadamente la exigencia.',
    timestampMonth: 1,
    targetTab: 'overview',
    isRead: false
  },
  {
    id: 'alert-02',
    severity: 'advertencia',
    category: 'credito',
    title: 'Cartera en Atraso CNBS: L. 55,294,191.00',
    message: 'Se identifican créditos en mora distribuidos desde Categoría I hasta Categoría V (Pérdida). Puedes reestructurarlos con los clientes o venderlos en el mercado interbancario.',
    timestampMonth: 1,
    targetTab: 'credit_risk',
    isRead: false
  },
  {
    id: 'alert-03',
    severity: 'informativa',
    category: 'credito',
    title: 'Solicitudes Mayores a L. 20M en Espera de Presidencia',
    message: 'Agroindustria Palma de la Costa (L. 25M) y Constructora Morazán (L. 38M) cuentan con nota favorable del oficial y requieren tu ratificación en Créditos.',
    timestampMonth: 1,
    targetTab: 'origination',
    isRead: false
  },
  {
    id: 'alert-04',
    severity: 'informativa',
    category: 'mercado_bursatil',
    title: 'Rendimientos en Títulos Soberanos BCH / SEFIN',
    message: 'Los Bonos Soberanos 2030 del Gobierno de Honduras cotizan a la par con cupón anual de 8.25%. Oportunidad para fortalecer el margen financiero.',
    timestampMonth: 1,
    targetTab: 'treasury',
    isRead: false
  }
];

export const INITIAL_EXPERT_OPINIONS: ExpertOpinion[] = [
  {
    id: 'exp-01',
    author: 'Dr. Hugo Noé Pino',
    role: 'Ex-Presidente del BCH y Doctor en Economía',
    organization: 'Colegio Hondureño de Economistas (CHE)',
    headline: 'Preservar coberturas de liquidez ante el ciclo de importaciones',
    summary: 'La factura petrolera y la demanda de dólares en la subasta del BCH imponen mantener un coeficiente LCR superior al 120%. Los bancos que vigilan su liquidez captan los mejores convenios corporativos.',
    sentiment: 'Cauteloso' as any,
    recommendedAction: 'Mantener depósitos estables y no sobrecolocar sin respaldo de encaje legal.',
    month: 1
  },
  {
    id: 'exp-02',
    author: 'Lic. José Luis Moncada',
    role: 'Ex-Comisionado Presidente de la CNBS',
    organization: 'Consultoría Financiera Internacional',
    headline: 'Estrategia de saneamiento de cartera morosa (Categorías III a V)',
    summary: 'Tener L. 55.29M en mora es una cifra manejable para un banco de L. 3,000M, pero las provisiones del 50% y 100% de la norma CNBS drenan capital si no se renegocia a tiempo con el deudor o se liquida a bancos rivales.',
    sentiment: 'Alerta de Riesgo' as any,
    recommendedAction: 'Ofrecer condonación de recargos moratorios para reactivar pagos a Categoría I.',
    month: 1
  },
  {
    id: 'exp-03',
    author: 'Licda. Mayra Falck',
    role: 'Ex-Presidenta de Banhprovi y Asesora de Fondeo',
    organization: 'Asociación Bancaria Hondureña',
    headline: 'Potencial de los comercios afiliados POS y nóminas CEE',
    summary: 'La captación proveniente de saldos retenidos en cuentas de planillas y comercios POS es el fondeo más barato del sistema bancario nacional, con costo inferior al 2% anual.',
    sentiment: 'Oportunidad Estratégica' as any,
    recommendedAction: 'Afiliar activamente nuevas empresas de nómina y elevar el ticket de los comercios POS.',
    month: 1
  },
  {
    id: 'exp-04',
    author: 'Msc. Roberto Lagos',
    role: 'Macroeconomista y Catedrático Internacional',
    organization: 'Análisis Económico Washington D.C.',
    headline: 'El arbitraje en la curva soberana del BCH y títulos bursátiles',
    summary: 'Con la TPM en 5.75%, los bonos soberanos SEFIN a 8.25% y las emisiones corporativas de Cervecería Hondureña y Dinant ofrecen una prima de riesgo altamente atractiva.',
    sentiment: 'Favorable / Crecimiento' as any,
    recommendedAction: 'Incrementar compras de bonos soberanos en la bolsa secundaria.',
    month: 1
  }
];

export const INITIAL_INNOVATIONS: TenInnovationsState = {
  fxDesk: {
    openPositionUSD: 7450000,
    bchAuctionBiddedUSD: 2500000,
    bchAuctionWonUSD: 2000000,
    fxSpreadIncomeMonthly: 850000
  },
  cnbsAudits: {
    lastAuditResult: 'Inspección General Ordinaria Favorable - Sin observaciones graves en encaje legal',
    complianceRating: 94,
    requiredProvisionCorrection: 0,
    isAuditedThisPeriod: false
  },
  interbankCallMoney: {
    lentAmountHNL: 0,
    borrowedAmountHNL: 0,
    callRatePct: 6.25
  },
  internationalRating: {
    agency: 'Fitch Ratings',
    currentRating: 'AAA (hnd) / BB- Global',
    outlook: 'Estable',
    fundingCostDiscountPct: 0.40
  },
  debtWorkouts: {
    totalRestructuredAmountHNL: 0,
    totalSoldToRivalsAmountHNL: 0,
    recoveredCapitalHNL: 0
  },
  digitalBanking: {
    appUsersCount: 42500,
    mobileAdoptionPct: 68.5,
    costSavingsMonthlyHNL: 420000
  },
  remittanceAlliances: {
    directDepositBonusPct: 2.0,
    monthlyCapturedRemittanceDepositsHNL: 18500000
  },
  stressTesting: {
    lastScenarioRun: 'Línea Base Sin Shocks Macroeconómicos',
    simulatedCAR: 14.8,
    simulatedLCR: 130.0,
    capitalGapHNL: 0
  },
  syndicatedMegaLoans: {
    participatedProjectsCount: 1,
    activeSyndicatedExposureHNL: 25000000
  },
  distressedAssetAuctions: {
    activeAuctionsCount: 2,
    acquiredBranchesCount: 0
  }
};

export const INITIAL_FINANCIALS: BankFinancialStatements = {
  // Balance General (Lempiras)
  cashAndBCHReserves: 365000000,
  requiredReserveAmount: 280800000, // 12% de 2,340,000,000
  loanPortfolioCurrent: 1995000000,
  loanPortfolioPastDue: 55294191, // Cartera en atraso exacta: L. 55,294,191.00
  loanLossProvisions: 58000000,
  treasuryBondsBCH: 265000000,
  secondarySecuritiesValueHNL: 48780000, // Valor total de títulos y acciones en posesión inicial
  fxReservesUSDValueInHNL: 185000000,
  fixedAssetsBranches: 147000000,
  totalAssets: 3019074191,

  depositsPublicTotal: 2340000000,
  interbankBorrowingBCH: 0,
  otherLiabilities: 185000000,
  totalLiabilities: 2525000000,

  capitalStock: 350000000,
  retainedEarnings: 130574191,
  currentMonthProfit: 13500000,
  totalEquity: 494074191,

  // Ratios Regulatorios CNBS
  capitalAdequacyRatioCAR: 14.8, // 14.8% (muy por encima del 10.0% mínimo)
  liquidityCoverageRatioLCR: 130.0, // 130%
  delinquencyRatioNPL: 2.69, // 2.69% de mora
  returnOnEquityROE: 16.5, // 16.5% anualizado

  // Estado de Resultados del Mes (Lempiras)
  interestIncomeLoans: 29800000,
  interestIncomeTreasury: 1850000,
  interestIncomeSecurities: 385000, // Cupones y dividendos mercado secundario
  totalFinancialIncome: 32035000,

  interestExpenseDeposits: 11450000,
  interestExpenseInterbank: 0,
  totalFinancialExpense: 11450000,

  netInterestMargin: 20585000,

  feeIncomeClearingACH: 824000,
  feeIncomePayrollServices: 485000,
  feeIncomeSwiftAndFX: 1850000,
  feeIncomeRemittances: 920000,
  feeIncomeCardsAndPOS: 1450000,
  feeIncomePensionFunds: 360000,
  totalFeeIncome: 5889000,

  staffSalariesExpense: 1850000,
  branchesOpexExpense: 1150000,
  technologyAndMarketingExpense: 950000,
  totalOperatingExpense: 3950000,

  creditProvisionExpense: 1250000,
  incomeBeforeTax: 21274000,
  incomeTaxISR: 5318500, // 25% ISR de Honduras
  netIncome: 15955500
};

export const INITIAL_BCH_MONEY_DESK: BchMoneyDeskState = {
  cashInBchCurrentAccountHNL: 345000000,
  requiredReserveHNL: 280800000, // 12% de ~2,340,000,000 depósitos
  reserveSurplusOrDeficitHNL: 64200000,
  isCompliant: true,
  emergencyRepoActive: false,
  activeRepos: [
    {
      id: 'repo-bch-01',
      type: 'repo_bch_liquidez',
      counterparty: 'Banco Central de Honduras (BCH)',
      termDays: 14,
      amountHNL: 50000000,
      interestRatePct: 6.25,
      monthsRemaining: 1,
      collateralAsset: 'Letra de Regulación Monetaria BCH-LRM-2026',
      status: 'activo'
    }
  ],
  yieldCurve: [
    { termLabel: '7 días', termDays: 7, bchYieldPct: 5.75, previousYieldPct: 5.75, trend: 'estable' },
    { termLabel: '28 días', termDays: 28, bchYieldPct: 5.95, previousYieldPct: 5.90, trend: 'alza' },
    { termLabel: '91 días', termDays: 91, bchYieldPct: 6.30, previousYieldPct: 6.25, trend: 'alza' },
    { termLabel: '182 días', termDays: 182, bchYieldPct: 6.85, previousYieldPct: 6.80, trend: 'alza' },
    { termLabel: '364 días', termDays: 364, bchYieldPct: 7.45, previousYieldPct: 7.40, trend: 'alza' }
  ],
  dailyInterbankCallOffers: [
    { bankId: 'atlantida', bankName: 'Banco Atlántida', offeredRatePct: 6.10, availableAmountHNL: 80000000, direction: 'ofrece_liquidez' },
    { bankId: 'ficohsa', bankName: 'Banco Ficohsa', offeredRatePct: 6.35, availableAmountHNL: 60000000, direction: 'demanda_liquidez' },
    { bankId: 'bac', bankName: 'BAC Credomatic', offeredRatePct: 6.15, availableAmountHNL: 95000000, direction: 'ofrece_liquidez' },
    { bankId: 'banpais', bankName: 'Banpaís', offeredRatePct: 6.40, availableAmountHNL: 40000000, direction: 'demanda_liquidez' },
    { bankId: 'occidente', bankName: 'Banco de Occidente', offeredRatePct: 6.05, availableAmountHNL: 120000000, direction: 'ofrece_liquidez' }
  ]
};

export const INITIAL_FX_FORWARDS: FxForwardContract[] = [
  {
    id: 'fwd-corp-01',
    clientName: 'Roberto Facussé',
    companyName: 'Textiles Villanueva S. de R.L.',
    direction: 'venta_usd_a_cliente',
    amountUSD: 500000,
    agreedRateHNL: 25.10,
    marketRateAtAgreementHNL: 24.88,
    termDays: 60,
    monthsRemaining: 2,
    premiumFeeHNL: 75000,
    status: 'activo'
  },
  {
    id: 'fwd-corp-02',
    clientName: 'Elena Kafati',
    companyName: 'Cafés Finos de Marcala S.A.',
    direction: 'compra_usd_a_cliente',
    amountUSD: 850000,
    agreedRateHNL: 24.95,
    marketRateAtAgreementHNL: 24.88,
    termDays: 90,
    monthsRemaining: 3,
    premiumFeeHNL: 110000,
    status: 'activo'
  }
];

export const INITIAL_BANKING_PROGRAMS_20: AureoProgramsState = {
  programs: [
    // 1. Pilar Retail (1 a 5)
    {
      id: 'prog-remesas-qr',
      number: 1,
      pillar: 'retail',
      name: 'Remesas Familiares ÁureoCash QR',
      tagline: 'Acreditación directa y retiro sin tarjeta en cajeros mediante PIN/QR temporal',
      status: 'activo',
      monthlyVolumeHNL: 18500000,
      monthlyNetIncomeHNL: 645000,
      participantsCount: 3420,
      keyMetricLabel: 'Diferencial Cambiario',
      keyMetricValue: '+L. 0.10 por USD',
      description: 'Canal de recepción de divisas de USA y España con tipo de cambio preferencial y retiro inmediato con código seguro de 6 dígitos sin necesidad de tarjeta plástica.'
    },
    {
      id: 'prog-rewards-multicomercio',
      number: 2,
      pillar: 'retail',
      name: 'Áureo Rewards & Puntos Canjeables',
      tagline: 'Fidelización multi-comercio: 1 punto por dólar para abono a saldo o combustible',
      status: 'optimizado',
      monthlyVolumeHNL: 24800000,
      monthlyNetIncomeHNL: 380000,
      participantsCount: 6850,
      keyMetricLabel: 'Puntos Circulantes',
      keyMetricValue: '1,420,000 pts',
      description: 'Programa de recompensas sobre consumos con tarjetas de débito y crédito. Cada punto equivale a L. 0.25 aplicable directo al saldo de la tarjeta o transferencias.'
    },
    {
      id: 'prog-redondeo-hucha',
      number: 3,
      pillar: 'retail',
      name: 'Micro-Ahorro Automático "Hucha Digital"',
      tagline: 'Redondeo al múltiplo de L. 10 / L. 50 en consumos con tarjeta para ahorro remunerado',
      status: 'activo',
      monthlyVolumeHNL: 4200000,
      monthlyNetIncomeHNL: 145000,
      participantsCount: 4120,
      keyMetricLabel: 'Tasa Rendimiento Hucha',
      keyMetricValue: '4.25% anual',
      description: 'Ahorro invisible en cada transacción cotidiana. La diferencia se transfiere a un sub-bolsillo remunerado mensualmente con interés capitalizable.'
    },
    {
      id: 'prog-adelanto-salario',
      number: 4,
      pillar: 'retail',
      name: 'Adelanto de Salario 24/7 en Planilla',
      tagline: 'Línea de liquidez pre-aprobada hasta el 35% de nómina con auto-cancelación mensual',
      status: 'activo',
      monthlyVolumeHNL: 8900000,
      monthlyNetIncomeHNL: 222500,
      participantsCount: 1250,
      keyMetricLabel: 'Comisión Plana',
      keyMetricValue: '2.5% por retiro',
      description: 'Disposición instantánea de fondos devengados por empleados bajo convenio corporativo de nómina, descontado automáticamente el día de pago sin mora.'
    },
    {
      id: 'prog-seguros-protege',
      number: 5,
      pillar: 'retail',
      name: 'Seguros Colectivos "Áureo Protege"',
      tagline: 'Microseguro de vida y cesantía (L. 95/mes) que cubre hasta 3 cuotas crediticias',
      status: 'en_expansion',
      monthlyVolumeHNL: 1450000,
      monthlyNetIncomeHNL: 420000,
      participantsCount: 5200,
      keyMetricLabel: 'Cobertura por Siniestro',
      keyMetricValue: 'Hasta 3 cuotas',
      description: 'Póliza colectiva con débito automático en cuenta que ampara al cliente ante desempleo involuntario o accidentes personales, blindando el índice de morosidad bancario.'
    },

    // 2. Pilar Pyme (6 a 9)
    {
      id: 'prog-linea-revolvente-pyme',
      number: 6,
      pillar: 'pyme',
      name: 'Línea de Crédito Revolvente Capital de Trabajo',
      tagline: 'Cupo ágil para inventario y proveedores pagando intereses solo por el monto dispuesto',
      status: 'optimizado',
      monthlyVolumeHNL: 48000000,
      monthlyNetIncomeHNL: 890000,
      participantsCount: 380,
      keyMetricLabel: 'Tasa Activa Media',
      keyMetricValue: '17.2% anual',
      description: 'Facilidad de tesorería empresarial que permite desembolsar y amortizar de forma flexible según el ciclo de cobranza comercial de la Pyme.'
    },
    {
      id: 'prog-mujer-emprende',
      number: 7,
      pillar: 'pyme',
      name: 'Programa "Mujer Emprende" con Tasa Bonificada',
      tagline: 'Subsidio de tasa (-2.00% anual) con aval de garantía del fondo FOHDE',
      status: 'activo',
      monthlyVolumeHNL: 21500000,
      monthlyNetIncomeHNL: 345000,
      participantsCount: 290,
      keyMetricLabel: 'Aval FOHDE Cobertura',
      keyMetricValue: '70% de garantía',
      description: 'Iniciativa de inclusión financiera y género que facilita crédito productivo con tasas preferenciales y acompañamiento gerencial a lideresas empresariales.'
    },
    {
      id: 'prog-pos-anticipo-24h',
      number: 8,
      pillar: 'pyme',
      name: 'POS Áureo Smart con Anticipo de Ventas',
      tagline: 'Factoraje express de hasta el 80% del flujo en tarjeta con comisión del 1.8%',
      status: 'optimizado',
      monthlyVolumeHNL: 32000000,
      monthlyNetIncomeHNL: 576000,
      participantsCount: 410,
      keyMetricLabel: 'Anticipo Inmediato',
      keyMetricValue: '80% ventas fin semana',
      description: 'Permite a gasolineras, farmacias y supermercados disponer de su cobranza de tarjetas antes de la compensación habitual bancaria.'
    },
    {
      id: 'prog-escrow-custodia',
      number: 9,
      pillar: 'pyme',
      name: 'Cuentas Escrow / Custodia Segura de Proveedores',
      tagline: 'Fondos en custodia mercantil liberados tras confirmación y guía de remisión',
      status: 'activo',
      monthlyVolumeHNL: 16500000,
      monthlyNetIncomeHNL: 247500,
      participantsCount: 85,
      keyMetricLabel: 'Comisión Fiduciaria',
      keyMetricValue: '1.5% del monto',
      description: 'Intermediación segura para compraventas entre distribuidores y minoristas. Los fondos permanecen bloqueados en Áureo Bank hasta el acta de entrega conforme.'
    },

    // 3. Pilar Agropecuario & Verde (10 a 12)
    {
      id: 'prog-cosecha-segura-cafe',
      number: 10,
      pillar: 'agro',
      name: 'Crédito Estacional Cafetalero "Cosecha Segura"',
      tagline: 'Amortización semestral/anual atada al ciclo de corte con seguro climático paramétrico',
      status: 'en_expansion',
      monthlyVolumeHNL: 65000000,
      monthlyNetIncomeHNL: 1150000,
      participantsCount: 145,
      keyMetricLabel: 'Plazo de Gracia',
      keyMetricValue: 'Hasta cosecha (6m)',
      description: 'Financiamiento agroindustrial para cooperativas de Marcala, Santa Bárbara y El Paraíso, estructurado para liquidarse con las liquidaciones de exportación de café.'
    },
    {
      id: 'prog-eco-credito-verde',
      number: 11,
      pillar: 'agro',
      name: 'Eco-Crédito Verde y Eficiencia Renovable',
      tagline: 'Fondos multilaterales BCIE para paneles solares y sistemas de riego hasta 84 meses',
      status: 'activo',
      monthlyVolumeHNL: 38000000,
      monthlyNetIncomeHNL: 580000,
      participantsCount: 65,
      keyMetricLabel: 'CO2 Evitado Anual',
      keyMetricValue: '4,850 tons',
      description: 'Línea ambiental para transición solar en maquilas, granjas avícolas y fincas, con tasa blanda respaldada por organismos multilaterales internacionales.'
    },
    {
      id: 'prog-bono-prenda-agd',
      number: 12,
      pillar: 'agro',
      name: 'Bono de Prenda & Pignoración de Café en AGD',
      tagline: 'Financiamiento sobre café certificado en Almacenes Generales de Depósito (AGD)',
      status: 'optimizado',
      monthlyVolumeHNL: 52000000,
      monthlyNetIncomeHNL: 890000,
      participantsCount: 52,
      keyMetricLabel: 'Categoría CNBS',
      keyMetricValue: 'Categoría I (Líquida)',
      description: 'Crédito prendario garantizado con certificados de depósito warrant. Si el exportador requiere liquidez, pignora el grano a precio de mercado de futuros de Nueva York.'
    },

    // 4. Pilar Corporativo & Comercio Exterior (13 a 16)
    {
      id: 'prog-factoring-confirming',
      number: 13,
      pillar: 'corporativo',
      name: 'Factoring Electrónico y Confirming Corporativo',
      tagline: 'Descuento digital de facturas a 30/60/90 días para proveedores de grandes cadenas',
      status: 'activo',
      monthlyVolumeHNL: 78000000,
      monthlyNetIncomeHNL: 1420000,
      participantsCount: 195,
      keyMetricLabel: 'Plazo Medio Facturas',
      keyMetricValue: '58 días',
      description: 'Adquisición de carteras de proveedores con cesión irrevocable de cobro a pagadores triple-A (maquilas de Villanueva y cadenas minoristas nacionales).'
    },
    {
      id: 'prog-cartas-credito-trade',
      number: 14,
      pillar: 'corporativo',
      name: 'Cartas de Crédito y Avales de Comercio Exterior',
      tagline: 'Trade finance irrevocable respaldado por red de bancos corresponsales de Nueva York',
      status: 'activo',
      monthlyVolumeHNL: 45000000,
      monthlyNetIncomeHNL: 720000,
      participantsCount: 78,
      keyMetricLabel: 'Comisión de Emisión',
      keyMetricValue: '0.75% trimestral',
      description: 'Emisión de cartas de crédito de importación para maquinaria y fertilizantes, y fianzas de cumplimiento para licitaciones del Fondo Vial de SEFIN.'
    },
    {
      id: 'prog-mesa-usd-forward',
      number: 15,
      pillar: 'corporativo',
      name: 'Mesa Cambiaria USD Spot & FX Forward Cobertura',
      tagline: 'Contratos forward para fijar tipo de cambio y blindar costos de importación',
      status: 'optimizado',
      monthlyVolumeHNL: 62000000,
      monthlyNetIncomeHNL: 980000,
      participantsCount: 64,
      keyMetricLabel: 'Volumen Cobertura USD',
      keyMetricValue: '$2.5M cubiertos',
      description: 'Instrumentos derivados de divisas a plazo que protegen los márgenes de importadores de trigo y combustible frente a devaluaciones del Lempira.'
    },
    {
      id: 'prog-fideicomisos-inmobiliarios',
      number: 16,
      pillar: 'corporativo',
      name: 'Fideicomisos de Garantía y Administración Inmobiliaria',
      tagline: 'Patrimonios autónomos para torres residenciales y parques industriales con desembolso por hito',
      status: 'activo',
      monthlyVolumeHNL: 85000000,
      monthlyNetIncomeHNL: 1250000,
      participantsCount: 22,
      keyMetricLabel: 'Activos en Custodia',
      keyMetricValue: 'L. 850M AUM',
      description: 'Estructuración fiduciaria que administra preventas y desembolsa créditos de construcción exclusivamente contra dictámenes de avance de obra firmados por peritos.'
    },

    // 5. Pilar Tesorería, Inversiones & Cumplimiento (17 a 20)
    {
      id: 'prog-dpf-step-up',
      number: 17,
      pillar: 'tesoreria_regulacion',
      name: 'DPF Digital Step-Up con Tasa Creciente',
      tagline: 'Depósito a plazo fijo cuya tasa pasiva aumenta cada 3 meses premiando la permanencia',
      status: 'activo',
      monthlyVolumeHNL: 95000000,
      monthlyNetIncomeHNL: 540000,
      participantsCount: 140,
      keyMetricLabel: 'Escala Rendimiento',
      keyMetricValue: '7.5% a 10.5%',
      description: 'Fondeo de captación a largo plazo que escala la tasa trimestralmente (Mes 1-3: 7.5%, Mes 4-6: 8.5%, Mes 7-9: 9.5%, Mes 10-12: 10.5%), blindando la liquidez.'
    },
    {
      id: 'prog-mesa-repos-interbancaria',
      number: 18,
      pillar: 'tesoreria_regulacion',
      name: 'Mesa Interbancaria de Repos y Subasta Nocturna BCH',
      tagline: 'Manejo activo del encaje legal obligatorio (12%) mediante reportos a 7, 14 y 28 días',
      status: 'optimizado',
      monthlyVolumeHNL: 110000000,
      monthlyNetIncomeHNL: 890000,
      participantsCount: 6,
      keyMetricLabel: 'Spread Interbancario',
      keyMetricValue: '+0.50% vs TPM',
      description: 'Colocación de excedentes de caja o captación de liquidez de última instancia con Letras del BCH y bancos competidores (Atlántida, Ficohsa, BAC).'
    },
    {
      id: 'prog-calificador-riesgo-cnbs',
      number: 19,
      pillar: 'tesoreria_regulacion',
      name: 'Calificador Inteligente CNBS & Alerta Temprana de Mora',
      tagline: 'Modelación regulatoria de categorías I a V con provisión automática y rescate de cartera',
      status: 'activo',
      monthlyVolumeHNL: 55294191,
      monthlyNetIncomeHNL: 620000,
      participantsCount: 48,
      keyMetricLabel: 'Cobertura Provisiones',
      keyMetricValue: '104.9% requerida',
      description: 'Motor algorítmico que monitorea atrasos de 30, 60 y 90+ días, sugiriendo renegociaciones inmediatas antes de que el crédito migre a castigo de capital.'
    },
    {
      id: 'prog-portal-uif-cumplimiento',
      number: 20,
      pillar: 'tesoreria_regulacion',
      name: 'Portal de Auditoría y Cumplimiento Regulatorio CNBS / UIF',
      tagline: 'Declaración obligatoria de origen de fondos ($10,000+ USD) y archivo de reportes ROS',
      status: 'optimizado',
      monthlyVolumeHNL: 34000000,
      monthlyNetIncomeHNL: 180000,
      participantsCount: 512,
      keyMetricLabel: 'Índice Auditoría AML',
      keyMetricValue: '98.5% Favorable',
      description: 'Módulo de gobernanza y prevención de lavado de activos conforme a la Ley Especial de la CNBS, con trazabilidad digital y bloqueo de operaciones atípicas.'
    }
  ],

  remesasQrTransactions: [
    {
      id: 'rem-qr-01',
      senderCountry: 'Estados Unidos',
      beneficiaryName: 'Marlon Roberto Enamorado',
      amountUSD: 450,
      amountHNL: 11241,
      exchangeRateUsed: 24.98,
      qrPinCode: '894201',
      status: 'Acreditado_Cuenta'
    },
    {
      id: 'rem-qr-02',
      senderCountry: 'España',
      beneficiaryName: 'Suyapa Maritza Carvajal',
      amountUSD: 600,
      amountHNL: 14988,
      exchangeRateUsed: 24.98,
      qrPinCode: '315792',
      status: 'Pendiente_Cajero'
    },
    {
      id: 'rem-qr-03',
      senderCountry: 'Estados Unidos',
      beneficiaryName: 'Carlos Adolfo Pineda',
      amountUSD: 350,
      amountHNL: 8743,
      exchangeRateUsed: 24.98,
      qrPinCode: '640188',
      status: 'Cobrado'
    }
  ],

  rewardsSystem: {
    totalPointsIssued: 1420000,
    totalPointsRedeemed: 650000,
    exchangeRatePerPointHNL: 0.25,
    activeEnrolledCardholders: 6850
  },

  microSavingsHuchas: {
    totalEnrolledClients: 4120,
    totalAccumulatedHNL: 4200000,
    annualYieldPct: 4.25,
    roundingThreshold: 10
  },

  salaryAdvanceLedger: {
    totalAdvancesDisbursedHNL: 8900000,
    activeAdvancesCount: 1250,
    flatFeePct: 2.5,
    repaymentRatePct: 99.2
  },

  insuranceProtege: {
    enrolledPoliciesCount: 5200,
    monthlyPremiumHNL: 95,
    claimsPaidThisYearHNL: 480000,
    lossRatioPct: 18.5
  },

  pymeRevolvingLines: {
    totalApprovedLimitHNL: 65000000,
    totalDrawnBalanceHNL: 48000000,
    annualInterestRatePct: 17.2,
    activePymesCount: 380
  },

  mujerEmprendeProgram: {
    enrolledBusinessesCount: 290,
    totalPortfolioHNL: 21500000,
    fohdeGuaranteeCoveragePct: 70,
    subsidizedRatePct: 13.5
  },

  smartPosAdvances: {
    participatingMerchantsCount: 410,
    advancedSalesVolumeHNL: 32000000,
    discountFeePct: 1.8
  },

  escrowCustodyAccounts: {
    activeEscrowsCount: 85,
    fundsInCustodyHNL: 16500000,
    annualCustodyFeePct: 1.5
  },

  agroCosechaSegura: {
    coveredFincasCount: 145,
    seasonalFinancingHNL: 65000000,
    harvestCollectionMonth: 3,
    climateInsuranceActive: true
  },

  ecoCreditoVerde: {
    financedProjectsCount: 65,
    totalGreenPortfolioHNL: 38000000,
    bcieSubsidyYieldPct: 1.25,
    co2TonsAvoided: 4850
  },

  bonoPrendaCafeAgd: {
    storedBagsQuintales: 34000,
    warrantValueHNL: 85000000,
    pawnLoanDisbursedHNL: 52000000,
    internationalPriceUSD: 245.50
  },

  factoringConfirming: {
    discountedInvoicesCount: 195,
    outstandingFactoringHNL: 78000000,
    avgDiscountRatePct: 14.8,
    defaultRatePct: 0.85
  },

  tradeLettersOfCredit: {
    issuedLettersCount: 78,
    totalGuaranteedAmountUSD: 45000000,
    commissionRatePct: 0.75
  },

  fxCorporateDesk: {
    activeSpotVolumeMonthlyUSD: 14500000,
    hedgedVolumeUSD: 2500000,
    monthlySpreadEarningsHNL: 980000
  },

  realEstateTrusts: {
    activeTrustsCount: 22,
    managedAssetsHNL: 850000000,
    fiduciaryCommissionMonthlyHNL: 1250000
  },

  stepUpDpfTranches: [
    {
      id: 'step-01',
      clientName: 'Inversiones Morazán S.A.',
      principalHNL: 15000000,
      currentMonthInTerm: 4,
      currentRatePct: 8.50,
      nextQuarterRatePct: 9.50
    },
    {
      id: 'step-02',
      clientName: 'Fundación Médica Hondureña',
      principalHNL: 8000000,
      currentMonthInTerm: 8,
      currentRatePct: 9.50,
      nextQuarterRatePct: 10.50
    }
  ],

  interbankReposOverview: {
    overnightVolumeHNL: 110000000,
    weightedAverageRepoRatePct: 6.25,
    collateralCoverageRatio: 1.15
  },

  cnbsRiskScoringEngine: {
    evaluatedPortfoliosCount: 1840,
    portfolioWeightedRiskPct: 2.69,
    requiredProvisionHNL: 55294191,
    currentProvisionCoveragePct: 104.9
  },

  uifCompliancePortal: {
    declarations10kFiledCount: 512,
    suspiciousRosReportsGenerated: 14,
    complianceAuditScorePct: 98.5,
    lastInspectionDateLabel: 'Enero 2026'
  }
};

export const INITIAL_ADVANCED_OPERATIONS: AdvancedOperationsState = {
  // Eje 1: Red Física & Canales (Features 1 a 6)
  departmentBranches: [
    {
      id: 'dep-fm',
      name: 'Francisco Morazán',
      capitalCity: 'Tegucigalpa (Distrito Central)',
      activeBranches: 4,
      totalEmployees: 48,
      depositsCollectedHNL: 980000000,
      loansDisbursedHNL: 840000000,
      monthlyOperatingCostHNL: 1850000,
      expansionCostHNL: 6500000,
      status: 'Operativa'
    },
    {
      id: 'dep-cortes',
      name: 'Cortés',
      capitalCity: 'San Pedro Sula',
      activeBranches: 3,
      totalEmployees: 36,
      depositsCollectedHNL: 760000000,
      loansDisbursedHNL: 690000000,
      monthlyOperatingCostHNL: 1450000,
      expansionCostHNL: 6200000,
      status: 'Operativa'
    },
    {
      id: 'dep-atlantida',
      name: 'Atlántida',
      capitalCity: 'La Ceiba',
      activeBranches: 2,
      totalEmployees: 20,
      depositsCollectedHNL: 290000000,
      loansDisbursedHNL: 240000000,
      monthlyOperatingCostHNL: 820000,
      expansionCostHNL: 4800000,
      status: 'Operativa'
    },
    {
      id: 'dep-choluteca',
      name: 'Choluteca',
      capitalCity: 'Choluteca',
      activeBranches: 1,
      totalEmployees: 12,
      depositsCollectedHNL: 165000000,
      loansDisbursedHNL: 155000000,
      monthlyOperatingCostHNL: 490000,
      expansionCostHNL: 4200000,
      status: 'Operativa'
    },
    {
      id: 'dep-copan',
      name: 'Copán',
      capitalCity: 'Santa Rosa de Copán',
      activeBranches: 1,
      totalEmployees: 10,
      depositsCollectedHNL: 140000000,
      loansDisbursedHNL: 135000000,
      monthlyOperatingCostHNL: 420000,
      expansionCostHNL: 4000000,
      status: 'Operativa'
    },
    {
      id: 'dep-comayagua',
      name: 'Comayagua',
      capitalCity: 'Comayagua (Valle)',
      activeBranches: 1,
      totalEmployees: 11,
      depositsCollectedHNL: 155000000,
      loansDisbursedHNL: 145000000,
      monthlyOperatingCostHNL: 440000,
      expansionCostHNL: 4100000,
      status: 'Operativa'
    },
    {
      id: 'dep-olancho',
      name: 'Olancho',
      capitalCity: 'Juticalpa',
      activeBranches: 1,
      totalEmployees: 9,
      depositsCollectedHNL: 125000000,
      loansDisbursedHNL: 130000000,
      monthlyOperatingCostHNL: 390000,
      expansionCostHNL: 3900000,
      status: 'Operativa'
    },
    {
      id: 'dep-el-paraiso',
      name: 'El Paraíso',
      capitalCity: 'Danlí',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3800000,
      status: 'Planificada'
    },
    {
      id: 'dep-yoro',
      name: 'Yoro',
      capitalCity: 'El Progreso',
      activeBranches: 1,
      totalEmployees: 12,
      depositsCollectedHNL: 180000000,
      loansDisbursedHNL: 160000000,
      monthlyOperatingCostHNL: 510000,
      expansionCostHNL: 4200000,
      status: 'Operativa'
    },
    {
      id: 'dep-islas',
      name: 'Islas de la Bahía',
      capitalCity: 'Roatán',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 5500000,
      status: 'Planificada'
    },
    {
      id: 'dep-santa-barbara',
      name: 'Santa Bárbara',
      capitalCity: 'Santa Bárbara',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3700000,
      status: 'Planificada'
    },
    {
      id: 'dep-valle',
      name: 'Valle',
      capitalCity: 'San Lorenzo / Nacaome',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3600000,
      status: 'Planificada'
    },
    {
      id: 'dep-la-paz',
      name: 'La Paz',
      capitalCity: 'La Paz',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3500000,
      status: 'Planificada'
    },
    {
      id: 'dep-intibuca',
      name: 'Intibucá',
      capitalCity: 'La Esperanza',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3600000,
      status: 'Planificada'
    },
    {
      id: 'dep-lempira',
      name: 'Lempira',
      capitalCity: 'Gracias',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3600000,
      status: 'Planificada'
    },
    {
      id: 'dep-ocotepeque',
      name: 'Ocotepeque',
      capitalCity: 'Nueva Ocotepeque',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 3900000,
      status: 'Planificada'
    },
    {
      id: 'dep-colon',
      name: 'Colón',
      capitalCity: 'Tocoa / Trujillo',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 4100000,
      status: 'Planificada'
    },
    {
      id: 'dep-gracias-a-dios',
      name: 'Gracias a Dios',
      capitalCity: 'Puerto Lempira (La Mosquitia)',
      activeBranches: 0,
      totalEmployees: 0,
      depositsCollectedHNL: 0,
      loansDisbursedHNL: 0,
      monthlyOperatingCostHNL: 0,
      expansionCostHNL: 6000000,
      status: 'Planificada'
    }
  ],

  atmFleet: [
    {
      id: 'atm-01',
      location: 'Multiplaza Tegucigalpa (Mall)',
      type: 'Multifunción Smart',
      cashVaultHNL: 1850000,
      maxCapacityHNL: 2500000,
      monthlyTransactions: 8400,
      monthlyFeeIncomeHNL: 168000,
      maintenanceCostHNL: 22000,
      uptimePct: 99.6
    },
    {
      id: 'atm-02',
      location: 'City Mall San Pedro Sula',
      type: 'Multifunción Smart',
      cashVaultHNL: 1950000,
      maxCapacityHNL: 2500000,
      monthlyTransactions: 9100,
      monthlyFeeIncomeHNL: 182000,
      maintenanceCostHNL: 22000,
      uptimePct: 99.8
    },
    {
      id: 'atm-03',
      location: 'Aeropuerto Palmerola Comayagua',
      type: 'Multifunción Smart',
      cashVaultHNL: 1400000,
      maxCapacityHNL: 2000000,
      monthlyTransactions: 6200,
      monthlyFeeIncomeHNL: 148000,
      maintenanceCostHNL: 25000,
      uptimePct: 99.1
    },
    {
      id: 'atm-04',
      location: 'Bulevar Morazán Tegucigalpa (Agencia Central)',
      type: 'Multifunción Smart',
      cashVaultHNL: 2200000,
      maxCapacityHNL: 3000000,
      monthlyTransactions: 11200,
      monthlyFeeIncomeHNL: 224000,
      maintenanceCostHNL: 24000,
      uptimePct: 99.9
    },
    {
      id: 'atm-05',
      location: 'Mercado Dandy San Pedro Sula',
      type: 'Básico Dispensador',
      cashVaultHNL: 850000,
      maxCapacityHNL: 1500000,
      monthlyTransactions: 5400,
      monthlyFeeIncomeHNL: 98000,
      maintenanceCostHNL: 18000,
      uptimePct: 98.4
    },
    {
      id: 'atm-06',
      location: 'Avenida San Isidro La Ceiba',
      type: 'Básico Dispensador',
      cashVaultHNL: 950000,
      maxCapacityHNL: 1500000,
      monthlyTransactions: 4800,
      monthlyFeeIncomeHNL: 86000,
      maintenanceCostHNL: 17500,
      uptimePct: 98.9
    }
  ],

  bankingAgents: [
    {
      id: 'caja-01',
      businessName: 'Pulpería El Carmen',
      department: 'Cortés (Cofradía)',
      monthlyVolumeHNL: 420000,
      commissionSharedHNL: 14500,
      activeServices: ['Depósitos en Efectivo', 'Retiros con PIN', 'Pago de Servicios Públicos (ENEE/Sanaa)']
    },
    {
      id: 'caja-02',
      businessName: 'Farmacia San José',
      department: 'Francisco Morazán (Valle de Ángeles)',
      monthlyVolumeHNL: 580000,
      commissionSharedHNL: 19800,
      activeServices: ['Cobro de Remesas Familiares', 'Depósitos de Ahorro', 'Recargas de Celular']
    },
    {
      id: 'caja-03',
      businessName: 'Ferretería Morazán',
      department: 'Choluteca (San Lorenzo)',
      monthlyVolumeHNL: 690000,
      commissionSharedHNL: 23500,
      activeServices: ['Abono a Préstamos', 'Pago de Tarjetas de Crédito', 'Depósitos Comerciales']
    },
    {
      id: 'caja-04',
      businessName: 'Mini Súper Maya',
      department: 'Copán (Copán Ruinas)',
      monthlyVolumeHNL: 360000,
      commissionSharedHNL: 12200,
      activeServices: ['Cobro de Remesas Western Union / MoneyGram', 'Retiros con Tarjeta Débito']
    },
    {
      id: 'caja-05',
      businessName: 'Abarrotería Ceibeña',
      department: 'Atlántida (Tela)',
      monthlyVolumeHNL: 490000,
      commissionSharedHNL: 16700,
      activeServices: ['Depósitos en Efectivo', 'Pago de Matrícula Vehicular', 'Retiros']
    }
  ],

  armoredTransportFleet: {
    armoredTrucksCount: 8,
    monthlyRouteCostHNL: 420000,
    cashInTransitInsuredHNL: 180000000,
    riskIncidentsCount: 0
  },
  driveThruLanesCount: 14,
  privateLoungesCount: 4,

  // Eje 2: Mercado de Capitales & Tesorería (Features 7 a 12)
  subordinatedBonds: [
    {
      id: 'bond-sub-01',
      seriesName: 'Bono Subordinado Serie A 2026',
      faceValueHNL: 120000000,
      couponRateAnnualPct: 8.75,
      tenorYears: 5,
      tierCategory: 'Tier 2 Complementario',
      status: 'En Circulación',
      monthsElapsed: 6
    },
    {
      id: 'bond-sub-02',
      seriesName: 'Bono Verde Sostenible Energía Limpia',
      faceValueHNL: 80000000,
      couponRateAnnualPct: 7.95,
      tenorYears: 7,
      tierCategory: 'Bono Sostenible Verde',
      status: 'En Circulación',
      monthsElapsed: 3
    }
  ],

  fxBchBids: [
    {
      id: 'fx-bid-101',
      bidDate: '15 Ene 2026',
      requestedUSD: 2500000,
      offeredExchangeRate: 24.87,
      allocatedUSD: 2500000,
      status: 'Adjudicado'
    },
    {
      id: 'fx-bid-102',
      bidDate: '28 Ene 2026',
      requestedUSD: 3000000,
      offeredExchangeRate: 24.86,
      allocatedUSD: 2200000,
      status: 'Parcial'
    }
  ],

  sovereignHoldings: [
    {
      id: 'sov-01',
      securityType: 'Letra BCH (LRM)',
      principalHNL: 85000000,
      yieldPct: 6.25,
      termMonthsRemaining: 8,
      liquidCollateralRatio: 1.0
    },
    {
      id: 'sov-02',
      securityType: 'Bono Soberano SEFIN',
      principalHNL: 110000000,
      yieldPct: 7.45,
      termMonthsRemaining: 28,
      liquidCollateralRatio: 0.95
    }
  ],

  multilateralLines: [
    {
      id: 'multi-bcie',
      institution: 'BCIE',
      totalFacilityUSD: 15000000,
      drawnUSD: 9500000,
      spreadOverSofrPct: 2.15,
      dedicatedSector: 'Energía Renovable'
    },
    {
      id: 'multi-bid',
      institution: 'BID Invest',
      totalFacilityUSD: 20000000,
      drawnUSD: 12000000,
      spreadOverSofrPct: 1.95,
      dedicatedSector: 'Pymes Exportadoras'
    }
  ],

  mutualFunds: [
    {
      id: 'fund-liquidez',
      fundName: 'Fondo Mutuo Áureo Liquidez HNL',
      aumHNL: 65000000,
      navPerShareHNL: 108.45,
      investorCount: 420,
      managementFeePct: 1.25,
      targetAssetAllocation: '70% Letras BCH / 30% DPFs Interbancarios'
    },
    {
      id: 'fund-dolar',
      fundName: 'Fondo Mutuo Renta Fija Dólar USD',
      aumHNL: 48000000,
      navPerShareHNL: 112.10,
      investorCount: 185,
      managementFeePct: 1.40,
      targetAssetAllocation: 'US Treasuries & Bonos Soberanos Centroamérica'
    }
  ],

  overnightInterbankPositions: {
    lentOvernightHNL: 25000000,
    borrowedOvernightHNL: 0,
    weightedRatePct: 6.10
  },

  // Eje 3: Inteligencia Ejecutiva, Pruebas de Estrés & CNBS (Features 13 a 18)
  lastStressTest: undefined,
  ifrs9ProvisionsLedger: {
    stage1NormalHNL: 12500000,
    stage2WatchlistHNL: 14800000,
    stage3ImpairedHNL: 32000000,
    totalExpectedLossHNL: 59300000,
    coverageRatioPct: 112.5
  },
  cyberSecurityCenter: {
    ddosBlockedAttacksCount: 18420,
    suspiciousTxBlockedCount: 128,
    pciDssComplianceScorePct: 99.4,
    securityFirewallTier: 2
  },
  amlCompliancePortal: {
    transactionsOver10kScreened: 640,
    pepsAlertsTriggered: 18,
    uifReportsSubmitted: 5,
    complianceClearanceRatePct: 99.2
  },
  executiveAlcoMetrics: {
    netInterestMarginNIM: 5.85,
    costOfFundsPct: 4.15,
    efficiencyRatioCIR: 52.4,
    returnOnEquityROE: 16.8,
    returnOnAssetsROA: 2.15
  },
  alcoInterestRateForecast: {
    recommendedActiveRatePct: 15.25,
    recommendedPassiveRatePct: 5.75,
    expectedNIMImprovementBps: 24
  },

  // Eje 4: Soluciones Corporativas, Retail & Clientes (Features 19 a 24)
  corporateCashManagement: {
    corporateClientsEnrolled: 42,
    monthlyPayrollDispersalsHNL: 145000000,
    supplierPaymentsProcessedHNL: 88000000,
    feeGeneratedHNL: 485000
  },
  fiduciaryTrustContracts: [
    {
      id: 'fidei-01',
      trustName: 'Fideicomiso Residencial Los Próceres',
      settlorClientName: 'Constructora Morazán S.A.',
      fiduciaryAssetsHNL: 240000000,
      trustType: 'Administración Inmobiliaria',
      monthlyFiduciaryFeeHNL: 120000,
      activeBeneficiariesCount: 180
    },
    {
      id: 'fidei-02',
      trustName: 'Fideicomiso Parque Solar Valle de Nacaome',
      settlorClientName: 'Energías del Sur S.A.',
      fiduciaryAssetsHNL: 180000000,
      trustType: 'Garantía Crediticia',
      monthlyFiduciaryFeeHNL: 95000,
      activeBeneficiariesCount: 4
    },
    {
      id: 'fidei-03',
      trustName: 'Fideicomiso Recaudación Peaje Corredor Logístico',
      settlorClientName: 'Consorcio Vial de Honduras',
      fiduciaryAssetsHNL: 95000000,
      trustType: 'Pago de Infraestructura',
      monthlyFiduciaryFeeHNL: 65000,
      activeBeneficiariesCount: 12
    }
  ],
  microInsurancePortfolio: [
    {
      id: 'ins-salud',
      productName: 'Seguro Salud Áureo Familiar',
      monthlyPremiumHNL: 180,
      activePolicies: 4600,
      totalCoveragePerClaimHNL: 50000,
      monthlyLossRatioPct: 32.4,
      underwriterPartner: 'Seguros Atlántida'
    },
    {
      id: 'ins-vida',
      productName: 'Plan Protección Vida y Sepelio',
      monthlyPremiumHNL: 120,
      activePolicies: 5900,
      totalCoveragePerClaimHNL: 75000,
      monthlyLossRatioPct: 24.8,
      underwriterPartner: 'Ficohsa Seguros'
    },
    {
      id: 'ins-clima',
      productName: 'Microseguro Paramétrico Cosecha Segura',
      monthlyPremiumHNL: 350,
      activePolicies: 1850,
      totalCoveragePerClaimHNL: 120000,
      monthlyLossRatioPct: 41.0,
      underwriterPartner: 'Mapfre Seguros Honduras'
    }
  ],
  clientChurnPredictor: {
    overallNPSScore: 78,
    highRiskChurnClientsCount: 14,
    automatedRetentionRetentionRatePct: 86.5,
    activeLoyaltyCampaignsCount: 3
  },
  digitalInstantLoans: {
    disbursedThisMonthCount: 128,
    totalDisbursedHNL: 14200000,
    averageApprovalTimeMinutes: 2.4,
    badRatePct: 1.1
  },
  shareholdersPortal: {
    sharesOutstanding: 10000000,
    bookValuePerShareHNL: 42.50,
    declaredDividendPerShareHNL: 3.20,
    retainedEarningsRatioPct: 65.0
  }
};

// ------------------------------------------------------------------------------------
// GOBIERNO CORPORATIVO: RANKING HISTÓRICO DE DIVIDENDOS (10 AÑOS FISCALES 2017-2026)
// ------------------------------------------------------------------------------------

export const INITIAL_DIVIDEND_GOVERNANCE: DividendGovernanceState = {
  historical10Years: [
    {
      fiscalYear: 2017,
      netIncomeAuditHNL: 145000000,
      dividendCashDistributedHNL: 65250000,
      retainedTier1HNL: 79750000,
      payoutRatioPct: 45.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 6.53,
      bookValuePerShareHNL: 68.40,
      dividendYieldPct: 7.2,
      carClosingPct: 12.8,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 10
    },
    {
      fiscalYear: 2018,
      netIncomeAuditHNL: 168000000,
      dividendCashDistributedHNL: 78960000,
      retainedTier1HNL: 89040000,
      payoutRatioPct: 47.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 7.90,
      bookValuePerShareHNL: 74.20,
      dividendYieldPct: 7.6,
      carClosingPct: 13.1,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 9
    },
    {
      fiscalYear: 2019,
      netIncomeAuditHNL: 195000000,
      dividendCashDistributedHNL: 97500000,
      retainedTier1HNL: 97500000,
      payoutRatioPct: 50.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 9.75,
      bookValuePerShareHNL: 81.50,
      dividendYieldPct: 8.1,
      carClosingPct: 13.4,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 8
    },
    {
      fiscalYear: 2020,
      netIncomeAuditHNL: 152000000,
      dividendCashDistributedHNL: 60800000,
      retainedTier1HNL: 91200000,
      payoutRatioPct: 40.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 6.08,
      bookValuePerShareHNL: 87.20,
      dividendYieldPct: 5.8,
      carClosingPct: 14.2,
      governanceAuditorOpinion: 'Con Énfasis Normativo',
      rankingPosition: 7
    },
    {
      fiscalYear: 2021,
      netIncomeAuditHNL: 220000000,
      dividendCashDistributedHNL: 110000000,
      retainedTier1HNL: 110000000,
      payoutRatioPct: 50.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 11.00,
      bookValuePerShareHNL: 95.80,
      dividendYieldPct: 8.5,
      carClosingPct: 13.7,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 6
    },
    {
      fiscalYear: 2022,
      netIncomeAuditHNL: 258000000,
      dividendCashDistributedHNL: 134160000,
      retainedTier1HNL: 123840000,
      payoutRatioPct: 52.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 13.42,
      bookValuePerShareHNL: 106.40,
      dividendYieldPct: 9.1,
      carClosingPct: 13.9,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 5
    },
    {
      fiscalYear: 2023,
      netIncomeAuditHNL: 295000000,
      dividendCashDistributedHNL: 162250000,
      retainedTier1HNL: 132750000,
      payoutRatioPct: 55.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 16.23,
      bookValuePerShareHNL: 118.90,
      dividendYieldPct: 9.8,
      carClosingPct: 14.3,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 4
    },
    {
      fiscalYear: 2024,
      netIncomeAuditHNL: 340000000,
      dividendCashDistributedHNL: 187000000,
      retainedTier1HNL: 153000000,
      payoutRatioPct: 55.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 18.70,
      bookValuePerShareHNL: 132.50,
      dividendYieldPct: 10.2,
      carClosingPct: 14.6,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 3
    },
    {
      fiscalYear: 2025,
      netIncomeAuditHNL: 388000000,
      dividendCashDistributedHNL: 221160000,
      retainedTier1HNL: 166840000,
      payoutRatioPct: 57.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 22.12,
      bookValuePerShareHNL: 148.20,
      dividendYieldPct: 10.9,
      carClosingPct: 14.8,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 2
    },
    {
      fiscalYear: 2026,
      netIncomeAuditHNL: 425000000,
      dividendCashDistributedHNL: 233750000,
      retainedTier1HNL: 191250000,
      payoutRatioPct: 55.0,
      sharesCount: 10000000,
      dividendPerShareHNL: 23.38,
      bookValuePerShareHNL: 165.40,
      dividendYieldPct: 11.2,
      carClosingPct: 15.1,
      governanceAuditorOpinion: 'Favorable sin Salvedades',
      rankingPosition: 1
    }
  ],
  currentYearPolicy2026: {
    targetPayoutPct: 55.0,
    proposedCashDividendHNL: 233750000,
    retainedCapitalTier1HNL: 191250000,
    expectedCarImpactPct: 0.8,
    asambleaScheduledMonth: 4,
    asambleaStatus: 'Aprobada por Junta Directiva'
  },
  totalHistoricalDividendsHNL: 1351830000,
  avgHistoricalPayoutPct: 50.1,
  accumulatedTier1RetainedHNL: 1234970000
};

// ------------------------------------------------------------------------------------
// SANDBOX CENTRAL DE CONFIGURACIÓN FINANCIERA, FISCAL Y SCORING EN TIEMPO REAL
// ------------------------------------------------------------------------------------

export const INITIAL_FINANCIAL_SANDBOX: FinancialSandboxConfig = {
  macro: {
    tpmRatePct: 5.75,
    interannualInflationPct: 4.90,
    exchangeRateUsdHnl: 24.85,
    reserveReqPct: 12.0
  },
  fiscalSar: {
    isrRatePct: 25.0,
    aportacionSolidariaPct: 5.0,
    dividendWithholdingTaxPct: 10.0,
    maxDeductibleProvisionPct: 100.0
  },
  bankAlco: {
    targetIntermediationSpreadPct: 8.5,
    cirEfficiencyTargetPct: 52.0,
    minTier1CarBufferPct: 3.5
  },
  creditScoringCnbs: {
    paymentHistoryWeightPct: 40.0,
    maxDtiAllowedPct: 45.0,
    maxLtvCoveragePct: 80.0,
    minBureauScoreThreshold: 640,
    categoryVArrearsDaysTrigger: 180
  },
  lastAppliedTimestamp: Date.now(),
  realtimeReactivityActive: true
};

export const INITIAL_GAME_STATE: GameState = {
  bankName: 'Áureo Bank Honduras S.A.',
  gameMonth: 1,
  bch: INITIAL_BCH,
  financials: INITIAL_FINANCIALS,
  competitors: INITIAL_COMPETITORS,
  divisions: INITIAL_DIVISIONS,
  clients: INITIAL_CLIENTS,
  pensionFunds: INITIAL_PENSION_FUNDS,
  posMerchants: INITIAL_POS_MERCHANTS,
  pendingApplications: INITIAL_APPLICATIONS,
  clearingHouse: INITIAL_CLEARING,
  payrollAgreements: INITIAL_PAYROLL_AGREEMENTS,
  swiftTransactions: INITIAL_SWIFT,
  remittanceChannels: INITIAL_REMITTANCES,
  treasuryHoldings: INITIAL_TREASURY,
  secondarySecurities: INITIAL_SECONDARY_SECURITIES,
  staff: INITIAL_STAFF,
  board: INITIAL_BOARD,
  branches: INITIAL_BRANCHES,
  historyMonthlyProfits: [
    { monthLabel: 'Nov 2025', profit: 12800000, assets: 2820000000, car: 14.5 },
    { monthLabel: 'Dic 2025', profit: 14100000, assets: 2890000000, car: 14.6 },
    { monthLabel: 'Ene 2026', profit: 15955500, assets: 3019074191, car: 14.8 }
  ],
  notifications: [
    {
      id: 'notif-01',
      month: 1,
      year: 2026,
      type: 'bch_policy',
      title: 'Apertura del Ejercicio Financiero 2026',
      message: 'El Banco Central de Honduras (BCH) ratificó la tasa de encaje legal en 12.0% y la TPM en 5.75%. Mantén vigilada tu liquidez diaria.',
      impactSummary: 'Encaje legal requerido: L. 280.8 Millones'
    },
    {
      id: 'notif-02',
      month: 1,
      year: 2026,
      type: 'market_war',
      title: 'Presión Competitiva en el Mercado de SPS y Tegucigalpa',
      message: 'Banco Ficohsa y BAC han lanzado nuevas campañas de tarjetas con devolución en combustible y cuotas sin intereses. Ajusta tus tarifas para defender cuota.',
      impactSummary: 'Cuota de mercado actual de Áureo: 7.2%'
    }
  ],
  marketingAggressiveness: 'Agresiva (Guerra de Tasas)',
  digitalTechLevel: 2,
  advisorMonthlyLimitPerAdvisor: 25,
  advisorApprovalsUsedThisMonth: 0,
  // Nuevas propiedades institucionales
  interbankOffers: INITIAL_INTERBANK_OFFERS,
  dynamicAlerts: INITIAL_DYNAMIC_ALERTS,
  expertOpinions: INITIAL_EXPERT_OPINIONS,
  innovations: INITIAL_INNOVATIONS,
  // Mesa de Dinero BCH, Forwards y Cierre Mensual Obligatorio
  bchMoneyDesk: INITIAL_BCH_MONEY_DESK,
  fxForwards: INITIAL_FX_FORWARDS,
  // Suite de 20 Características, Programas e Innovaciones Bancarias
  bankingPrograms20: INITIAL_BANKING_PROGRAMS_20,
  // Centro de Operaciones Avanzadas (24 Características)
  advancedOperations: INITIAL_ADVANCED_OPERATIONS,
  // Gobierno Corporativo: Ranking Histórico de Dividendos (10 Años Fiscales 2017-2026)
  dividendGovernance: INITIAL_DIVIDEND_GOVERNANCE,
  // Sandbox Central de Configuración Financiera, Fiscal y Scoring en Tiempo Real
  financialSandbox: INITIAL_FINANCIAL_SANDBOX
};

