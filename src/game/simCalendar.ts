/**
 * Calendario y Gestión Temporal del Simulador Financiero Áureo Bank
 * 
 * Reglas de simulación temporal:
 * - 30 días exactos por mes financiero
 * - 12 meses por ejercicio anual (Mes 1 a Mes 12)
 * - Año base inicial: 2026
 * - Las ofertas bancarias y obligaciones son válidas hasta el final de la jornada de su fecha de vencimiento.
 *   Una oferta con vencimiento Día 15 vence a partir del inicio del Día 16.
 */

export interface SimDate {
  day: number;
  month: number;
  year?: number;
}

export interface SimCurrentDate {
  currentDay: number;
  currentMonth: number;
  currentYear?: number;
}

export interface SimOfferExpiry {
  expiresDay: number;
  expiresMonth: number;
  expiresYear?: number;
}

/**
 * Convierte una fecha simulada en un número cardinal absoluto de días continuos.
 * Permite comparaciones directas aritméticas (>, <, ==).
 */
export function getSimAbsoluteDay(day: number, month: number, year: number = 2026): number {
  const safeYear = Number.isFinite(year) ? year : 2026;
  const safeMonth = Number.isFinite(month) ? month : 1;
  const safeDay = Number.isFinite(day) ? day : 1;
  return safeYear * 360 + (safeMonth - 1) * 30 + safeDay;
}

/**
 * Compara dos fechas del calendario simulado.
 * Retorna:
 *  < 0 si dateA es anterior a dateB
 *  0 si dateA es exactamente igual a dateB
 *  > 0 si dateA es posterior a dateB
 */
export function compareSimDates(dateA: SimDate, dateB: SimDate, defaultYear: number = 2026): number {
  const dayA = getSimAbsoluteDay(dateA.day, dateA.month, dateA.year ?? defaultYear);
  const dayB = getSimAbsoluteDay(dateB.day, dateB.month, dateB.year ?? defaultYear);
  return dayA - dayB;
}

/**
 * Determina si una oferta o plazo ha expirado respecto a la fecha actual del juego.
 * Regla: La oferta es válida DURANTE TODO el día de vencimiento (hasta las 23:59 del día de vencimiento).
 * Se considera vencida ÚNICAMENTE cuando la fecha actual es posterior a la fecha de expiración.
 * 
 * Casos contemplados:
 * - Mismo mes: vence si currentDay > expiresDay
 * - Mes posterior: vence si el mes actual es mayor (ej. Día 5 Mes 2 vs Día 25 Mes 1)
 * - Año posterior: vence en el cambio de diciembre a enero
 */
export function isSimOfferExpired(
  current: SimCurrentDate,
  expiry: SimOfferExpiry
): boolean {
  const curYear = current.currentYear ?? 2026;
  const curAbs = getSimAbsoluteDay(current.currentDay, current.currentMonth, curYear);
  
  // Si la oferta no tiene año explícito, inferir según el mes:
  // Si expiresMonth < currentMonth pero el año no está especificado, corresponde al año en que se emitió
  const expYear = expiry.expiresYear ?? curYear;
  const expAbs = getSimAbsoluteDay(expiry.expiresDay, expiry.expiresMonth, expYear);
  
  return curAbs > expAbs;
}

/**
 * Calcula cuántos días calendario faltan para el vencimiento de una oferta o plazo.
 * Retorna un número negativo si ya está vencida.
 */
export function getDaysUntilExpiry(
  current: SimCurrentDate,
  expiry: SimOfferExpiry
): number {
  const curYear = current.currentYear ?? 2026;
  const curAbs = getSimAbsoluteDay(current.currentDay, current.currentMonth, curYear);
  const expYear = expiry.expiresYear ?? curYear;
  const expAbs = getSimAbsoluteDay(expiry.expiresDay, expiry.expiresMonth, expYear);
  return expAbs - curAbs;
}

/**
 * Avanza una cantidad arbitraria de días en el calendario del juego
 * respetando el ciclo de 30 días por mes y 12 meses por año.
 */
export function advanceSimCalendar(
  day: number,
  month: number,
  year: number,
  daysToAdvance: number
): { day: number; month: number; year: number } {
  let totalDays = (month - 1) * 30 + day + daysToAdvance;
  let newYear = year;
  
  while (totalDays > 360) {
    totalDays -= 360;
    newYear += 1;
  }
  
  const newMonth = Math.floor((totalDays - 1) / 30) + 1;
  const newDay = ((totalDays - 1) % 30) + 1;
  
  return {
    day: newDay,
    month: newMonth,
    year: newYear
  };
}

/**
 * Formato estándar de presentación de fechas en el simulador
 */
export function formatSimDateLabel(day: number, month: number, year: number = 2026): string {
  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  return `Día ${dd}/${mm}/${year}`;
}
