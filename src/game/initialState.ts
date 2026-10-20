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
  TenInnovationsState
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
  innovations: INITIAL_INNOVATIONS
};
