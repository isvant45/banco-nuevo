import { IndividualClient, BankingDivisionId } from './types';

// Ciudades y departamentos bancarios de Honduras
export const HONDURAN_CITIES = [
  { city: 'Tegucigalpa (Distrito Central)', deptCode: '0801', weight: 35 },
  { city: 'San Pedro Sula (Cortés)', deptCode: '0501', weight: 30 },
  { city: 'La Ceiba (Atlántida)', deptCode: '0101', weight: 8 },
  { city: 'Choluteca (Choluteca)', deptCode: '0601', weight: 6 },
  { city: 'Comayagua (Comayagua)', deptCode: '0301', weight: 5 },
  { city: 'Danlí (El Paraíso)', deptCode: '0703', weight: 4 },
  { city: 'Juticalpa (Olancho)', deptCode: '1501', weight: 4 },
  { city: 'Roatán (Islas de la Bahía)', deptCode: '1101', weight: 3 },
  { city: 'Santa Rosa de Copán (Copán)', deptCode: '0401', weight: 3 },
  { city: 'Progreso (Yoro)', deptCode: '1804', weight: 2 }
];

const FIRST_NAMES = [
  'Carlos', 'María', 'José', 'Ana', 'Juan', 'Suyapa', 'Mario', 'Rosa', 'Luis', 'Carmen',
  'Jorge', 'Martha', 'Roberto', 'Gloria', 'Marco', 'Elena', 'David', 'Silvia', 'Héctor', 'Patricia',
  'Ramón', 'Lourdes', 'Óscar', 'Norma', 'Ricardo', 'Leticia', 'Manuel', 'Sonia', 'Fernando', 'Claudia',
  'Francisco', 'Miriam', 'Edgardo', 'Lorena', 'Gustavo', 'Alejandra', 'Javier', 'Ingrid', 'Rubén', 'Karla'
];

const LAST_NAMES = [
  'Mejía', 'Flores', 'Vásquez', 'Rodríguez', 'Hernández', 'Martínez', 'López', 'García', 'Pérez', 'González',
  'Sánchez', 'Ramírez', 'Cruz', 'Gómez', 'Reyes', 'Morales', 'Jiménez', 'Castillo', 'Álvarez', 'Romero',
  'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vargas', 'Castro', 'Ramos', 'Mendoza', 'Aguilar', 'Medina',
  'Pineda', 'Bueso', 'Larach', 'Kafie', 'Canahuati', 'Facussé', 'Atala', 'Rosenthal', 'Nasser', 'Goldstein'
];

const BUSINESS_PREFIXES = [
  'Inversiones', 'Comercial', 'Distribuidora', 'Agropecuaria', 'Corporación', 'Industrias', 'Constructora',
  'Exportadora', 'Servicios', 'Transportes', 'Almacenes', 'Grupo', 'Consorcio', 'Beneficio', 'Laboratorios'
];

const BUSINESS_SUFFIXES = [
  'de Honduras S.A.', 'S. de R.L.', 'del Valle S.A.', 'del Norte S. de R.L.', 'Hondureña S.A.', 'Centroamericana',
  '& Asociados S. de R.L.', 'Internacional S.A.', 'del Litoral', 'de Occidente S.A.'
];

/** Pseudo-random determinista con semilla */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generador determinista de un cliente individual según índice y división.
 * Garantiza persistencia numérica exacta sin ocupar megabytes excesivos de RAM.
 */
export function generateSyntheticClient(index: number, division: BankingDivisionId): IndividualClient {
  const seed = index * 1337 + (division.charCodeAt(0) * 97) + (division.charCodeAt(1) || 42);
  
  const cityObj = HONDURAN_CITIES[Math.floor(seededRandom(seed + 1) * HONDURAN_CITIES.length)];
  const birthYear = 1960 + Math.floor(seededRandom(seed + 2) * 44); // 1960 - 2004
  const corrSeq = String(10000 + Math.floor(seededRandom(seed + 3) * 89999)).padStart(5, '0');
  const rtn = `${cityObj.deptCode}-${birthYear}-${corrSeq}`;
  const cif = `CIF-${cityObj.deptCode}-${corrSeq}`;

  let name = '';
  let accountType: IndividualClient['accountType'] = 'Cuenta de Ahorro Rendimiento';
  let balance = 0;
  let hasCreditCard = false;
  let cardBrand: IndividualClient['creditCardBrand'] = 'Sin Tarjeta';
  let cardLimit = 0;
  let cardBalance = 0;
  let hasLoan = false;
  let loanType = 'Ninguno';
  let loanPrincipal = 0;
  let loanBalance = 0;
  let loanPayment = 0;
  let loanRate = 0;
  let loanMonths = 0;
  let equifaxScore = 400 + Math.floor(seededRandom(seed + 4) * 550); // 400 - 950
  let cnbsCategory: IndividualClient['cnbsCategory'] = 'I - Normal';
  let amlRisk = Math.floor(seededRandom(seed + 5) * 45); // la mayoría bajo riesgo

  if (division === 'personas') {
    const fn = FIRST_NAMES[Math.floor(seededRandom(seed + 6) * FIRST_NAMES.length)];
    const ln1 = LAST_NAMES[Math.floor(seededRandom(seed + 7) * LAST_NAMES.length)];
    const ln2 = LAST_NAMES[Math.floor(seededRandom(seed + 8) * LAST_NAMES.length)];
    name = `${fn} ${ln1} ${ln2}`;
    balance = Math.floor(3500 + seededRandom(seed + 9) * 145000);
    hasCreditCard = seededRandom(seed + 10) > 0.45;
    if (hasCreditCard) {
      cardBrand = seededRandom(seed + 11) > 0.6 ? 'Mastercard Oro' : 'Visa Clásica';
      cardLimit = Math.floor(15000 + seededRandom(seed + 12) * 65000);
      cardBalance = Math.floor(cardLimit * seededRandom(seed + 13) * 0.7);
    }
    hasLoan = seededRandom(seed + 14) > 0.6;
    if (hasLoan) {
      loanType = seededRandom(seed + 15) > 0.5 ? 'Préstamo Personal' : 'Deducción por Planilla';
      loanPrincipal = Math.floor(25000 + seededRandom(seed + 16) * 180000);
      loanBalance = Math.floor(loanPrincipal * (0.3 + seededRandom(seed + 17) * 0.65));
      loanRate = 18.5 + +(seededRandom(seed + 18) * 6.5).toFixed(1);
      loanMonths = Math.floor(12 + seededRandom(seed + 19) * 48);
      loanPayment = Math.floor((loanBalance * (1 + loanRate / 100)) / loanMonths);
    }
  } else if (division === 'premier') {
    const fn = FIRST_NAMES[Math.floor(seededRandom(seed + 6) * FIRST_NAMES.length)];
    const ln1 = LAST_NAMES[Math.floor(seededRandom(seed + 7) * LAST_NAMES.length)];
    name = `Lic. ${fn} ${ln1} (${cityObj.city.split(' ')[0]})`;
    accountType = seededRandom(seed + 9) > 0.4 ? 'Cuenta Corriente / Cheques' : 'Cuenta DPF Plazo Fijo';
    balance = Math.floor(180000 + seededRandom(seed + 10) * 1850000);
    hasCreditCard = true;
    cardBrand = seededRandom(seed + 11) > 0.3 ? 'Mastercard Platinum' : 'Visa Infinite / Black';
    cardLimit = Math.floor(120000 + seededRandom(seed + 12) * 350000);
    cardBalance = Math.floor(cardLimit * 0.25);
    hasLoan = seededRandom(seed + 13) > 0.5;
    if (hasLoan) {
      loanType = 'Préstamo Hipotecario Premier';
      loanPrincipal = Math.floor(850000 + seededRandom(seed + 14) * 2500000);
      loanBalance = Math.floor(loanPrincipal * 0.75);
      loanRate = 13.5;
      loanMonths = 120;
      loanPayment = Math.floor(loanBalance / 60);
    }
  } else if (division === 'pyme') {
    const p = BUSINESS_PREFIXES[Math.floor(seededRandom(seed + 6) * BUSINESS_PREFIXES.length)];
    const s = BUSINESS_SUFFIXES[Math.floor(seededRandom(seed + 7) * BUSINESS_SUFFIXES.length)];
    const core = LAST_NAMES[Math.floor(seededRandom(seed + 8) * LAST_NAMES.length)];
    name = `${p} ${core} ${s}`;
    accountType = 'Cuenta Corriente / Cheques';
    balance = Math.floor(120000 + seededRandom(seed + 9) * 1650000);
    hasCreditCard = seededRandom(seed + 10) > 0.35;
    if (hasCreditCard) {
      cardBrand = 'Visa Empresarial';
      cardLimit = Math.floor(80000 + seededRandom(seed + 11) * 350000);
      cardBalance = Math.floor(cardLimit * 0.4);
    }
    hasLoan = seededRandom(seed + 12) > 0.4;
    if (hasLoan) {
      loanType = 'Línea de Capital de Trabajo PYME';
      loanPrincipal = Math.floor(350000 + seededRandom(seed + 13) * 3200000);
      loanBalance = Math.floor(loanPrincipal * 0.7);
      loanRate = 17.5;
      loanMonths = 36;
      loanPayment = Math.floor(loanBalance / 24);
    }
  } else if (division === 'corporativa') {
    const p = BUSINESS_PREFIXES[Math.floor(seededRandom(seed + 6) * BUSINESS_PREFIXES.length)];
    const core = LAST_NAMES[Math.floor(seededRandom(seed + 8) * LAST_NAMES.length)];
    name = `${p} Industrial ${core} Corporación S.A.`;
    accountType = 'Cuenta Corriente / Cheques';
    balance = Math.floor(2500000 + seededRandom(seed + 9) * 28000000);
    hasCreditCard = true;
    cardBrand = 'Mastercard Corporativa';
    cardLimit = Math.floor(800000 + seededRandom(seed + 10) * 3500000);
    cardBalance = Math.floor(cardLimit * 0.2);
    hasLoan = seededRandom(seed + 11) > 0.3;
    if (hasLoan) {
      loanType = 'Préstamo Sindicado Corporativo';
      loanPrincipal = Math.floor(12000000 + seededRandom(seed + 12) * 45000000);
      loanBalance = Math.floor(loanPrincipal * 0.85);
      loanRate = 11.8;
      loanMonths = 60;
      loanPayment = Math.floor(loanBalance / 48);
    }
  } else if (division === 'privada') {
    const ln1 = LAST_NAMES[Math.floor(seededRandom(seed + 7) * LAST_NAMES.length)];
    const ln2 = LAST_NAMES[Math.floor(seededRandom(seed + 8) * LAST_NAMES.length)];
    name = `Familia ${ln1} & ${ln2} (Family Trust)`;
    accountType = 'Cuenta Offshore Multidivisa';
    balance = Math.floor(4500000 + seededRandom(seed + 9) * 32000000);
    hasCreditCard = true;
    cardBrand = 'Visa Infinite / Black';
    cardLimit = Math.floor(1500000 + seededRandom(seed + 10) * 4000000);
    cardBalance = Math.floor(cardLimit * 0.15);
    hasLoan = seededRandom(seed + 11) > 0.6;
    if (hasLoan) {
      loanType = 'Crédito de Gestión Patrimonial Fiduciaria';
      loanPrincipal = Math.floor(5000000 + seededRandom(seed + 12) * 15000000);
      loanBalance = Math.floor(loanPrincipal * 0.7);
      loanRate = 10.5;
      loanMonths = 72;
      loanPayment = Math.floor(loanBalance / 60);
    }
  } else {
    // internacional
    const core = LAST_NAMES[Math.floor(seededRandom(seed + 8) * LAST_NAMES.length)];
    name = `Consorcio Exportador & Logístico ${core} Global`;
    accountType = 'Cuenta Offshore Multidivisa';
    balance = Math.floor(3200000 + seededRandom(seed + 9) * 22000000);
    hasCreditCard = false;
    cardBrand = 'Sin Tarjeta';
    cardLimit = 0;
    cardBalance = 0;
    hasLoan = true;
    loanType = 'Carta de Crédito SWIFT Comercial';
    loanPrincipal = Math.floor(6500000 + seededRandom(seed + 10) * 18000000);
    loanBalance = Math.floor(loanPrincipal * 0.65);
    loanRate = 9.8;
    loanMonths = 24;
    loanPayment = Math.floor(loanBalance / 18);
  }

  // Asignar categorías CNBS según score
  if (equifaxScore >= 750) {
    cnbsCategory = 'I - Normal';
  } else if (equifaxScore >= 660) {
    cnbsCategory = 'II - Especial';
  } else if (equifaxScore >= 560) {
    cnbsCategory = 'III - Subnormal';
  } else if (equifaxScore >= 450) {
    cnbsCategory = 'IV - Dudoso Recaudo';
  } else {
    cnbsCategory = 'V - Pérdida';
  }

  return {
    id: `CLI-${division.toUpperCase().slice(0, 3)}-${String(index + 1).padStart(5, '0')}`,
    cif,
    rtn,
    name,
    division,
    city: cityObj.city,
    joinedMonth: 1,
    accountType,
    accountBalanceHNL: balance,
    hasCreditCard,
    creditCardBrand: cardBrand,
    creditCardLimitHNL: cardLimit,
    creditCardBalanceHNL: cardBalance,
    hasLoan,
    loanType,
    loanPrincipalHNL: loanPrincipal,
    loanBalanceHNL: loanBalance,
    loanMonthlyPaymentHNL: loanPayment,
    loanInterestRateAnnual: loanRate,
    loanMonthsRemaining: loanMonths,
    guaranteedPayment: seededRandom(seed + 20) > 0.4,
    pastDueDays: cnbsCategory === 'I - Normal' ? 0 : Math.floor(30 + seededRandom(seed + 21) * 150),
    pastDueAmountHNL: cnbsCategory === 'I - Normal' ? 0 : Math.floor(loanPayment * (1 + seededRandom(seed + 22) * 3)),
    equifaxScore,
    cnbsCategory,
    amlRiskScore: amlRisk,
    amlStatus: amlRisk > 80 ? 'alerta_pitufeo' : amlRisk > 50 ? 'bajo_monitoreo' : 'normal',
    notes: `Expediente oficial registrado en la División ${division.toUpperCase()} de Áureo Bank Honduras.`,
    otherBankProducts: []
  };
}

/** Filtro y paginador de alta velocidad para miles de clientes */
export interface ClientFilterQuery {
  searchQuery?: string; // Busca por RTN, CIF o Nombre
  city?: string;
  cnbsCategory?: string;
  amlStatus?: string;
  page: number; // 1-indexed
  pageSize: number; // 25, 50, 100
}

export interface PaginatedClientsResult {
  clients: IndividualClient[];
  totalMatching: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  divisionTotalClients: number;
}

/**
 * Consulta eficiente que combina los clientes reales en estado con el libro mayor sintético.
 * Permite buscar entre los 18,000+ clientes sin colapsar memoria ni latencia.
 */
export function queryDivisionClients(
  stateClients: IndividualClient[],
  division: BankingDivisionId,
  divisionClientCount: number,
  query: ClientFilterQuery
): PaginatedClientsResult {
  const pageSize = Math.max(10, Math.min(200, query.pageSize || 25));
  const currentPage = Math.max(1, query.page || 1);
  const search = (query.searchQuery || '').trim().toLowerCase();
  const selectedCity = (query.city || '').trim();
  const selectedCnbs = (query.cnbsCategory || '').trim();
  const selectedAml = (query.amlStatus || '').trim();

  // 1. Filtrar clientes destacados del estado
  const existingDivisionClients = stateClients.filter(c => c.division === division);
  const existingIds = new Set(existingDivisionClients.map(c => c.id));

  // 2. Determinar cuántos sintéticos generar para alcanzar el total de la banca (ej. 18,450)
  const targetTotal = Math.max(existingDivisionClients.length, divisionClientCount);
  const syntheticCount = targetTotal - existingDivisionClients.length;

  // Si hay búsqueda activa o filtros específicos, buscamos en los existentes y un subconjunto muestreado
  // Si no hay búsqueda, usamos la paginación directa determinista
  const matchesFilter = (c: IndividualClient): boolean => {
    if (search) {
      const matchRtn = (c.rtn || '').toLowerCase().includes(search);
      const matchCif = (c.cif || '').toLowerCase().includes(search);
      const matchName = c.name.toLowerCase().includes(search);
      const matchCity = c.city.toLowerCase().includes(search);
      if (!matchRtn && !matchCif && !matchName && !matchCity) return false;
    }
    if (selectedCity && selectedCity !== 'Todas las Ciudades') {
      if (!c.city.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    }
    if (selectedCnbs && selectedCnbs !== 'Todas las Categorías') {
      if (c.cnbsCategory !== selectedCnbs) return false;
    }
    if (selectedAml && selectedAml !== 'Todos los Estados') {
      if (c.amlStatus !== selectedAml) return false;
    }
    return true;
  };

  if (!search && (!selectedCity || selectedCity === 'Todas las Ciudades') && (!selectedCnbs || selectedCnbs === 'Todas las Categorías') && (!selectedAml || selectedAml === 'Todos los Estados')) {
    // Modo directo sin filtros: paginación matemática inmediata
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(targetTotal, startIndex + pageSize);
    const pageClients: IndividualClient[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (i < existingDivisionClients.length) {
        pageClients.push(existingDivisionClients[i]);
      } else {
        const synthIndex = i - existingDivisionClients.length;
        pageClients.push(generateSyntheticClient(synthIndex, division));
      }
    }

    return {
      clients: pageClients,
      totalMatching: targetTotal,
      totalPages: Math.max(1, Math.ceil(targetTotal / pageSize)),
      currentPage,
      pageSize,
      divisionTotalClients: targetTotal
    };
  }

  // Modo filtrado: escaneo rápido sobre pool indexado determinista
  const matchingList: IndividualClient[] = [];

  // Revisar existentes primero
  for (const c of existingDivisionClients) {
    if (matchesFilter(c)) {
      matchingList.push(c);
    }
  }

  // Generar sintéticos bajo demanda hasta 2,500 candidatos representativos para no bloquear el loop
  const maxScan = Math.min(syntheticCount, 4000);
  for (let i = 0; i < maxScan; i++) {
    const synth = generateSyntheticClient(i, division);
    if (!existingIds.has(synth.id) && matchesFilter(synth)) {
      matchingList.push(synth);
      if (matchingList.length >= 1000) break; // Límite de seguridad
    }
  }

  const totalMatching = search ? matchingList.length : targetTotal;
  const totalPages = Math.max(1, Math.ceil(matchingList.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageClients = matchingList.slice(startIndex, startIndex + pageSize);

  return {
    clients: pageClients,
    totalMatching: matchingList.length,
    totalPages,
    currentPage: safePage,
    pageSize,
    divisionTotalClients: targetTotal
  };
}
