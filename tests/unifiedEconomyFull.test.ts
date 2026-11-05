import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  evaluateBankingSegment, 
  calculateExplainableCreditScore, 
  simulateSupermarketDay,
  DEFAULT_SUPERMARKET_CATALOG,
  DEFAULT_INITIAL_CONSTRUCTION_PROJECT
} from '../src/game/unifiedEconomyEngine';

test('Unified Economy: Clasificación estricta en las 4 bancas', () => {
  // 1. Banca de Personas (< L 250K y sin patrimonio privado)
  const personas = evaluateBankingSegment(180000, 1, 2500000);
  assert.equal(personas.businessSegment, 'personas');
  assert.equal(personas.hasPrivateBanking, false);

  // 2. Banca Pyme (L 250K a L 3.5M con local formal)
  const pyme = evaluateBankingSegment(1200000, 2, 4500000);
  assert.equal(pyme.businessSegment, 'pyme');
  assert.equal(pyme.hasPrivateBanking, false);

  // 3. Banca Corporativa (> L 3.5M o cadena grande)
  const corp = evaluateBankingSegment(4500000, 5, 8000000);
  assert.equal(corp.businessSegment, 'corporativo');
  assert.equal(corp.hasPrivateBanking, false);

  // 4. Banca Privada (Patrimonio personal > L 15M conviviendo con cualquier segmento de empresa)
  const privatePymeOwner = evaluateBankingSegment(800000, 1, 18500000);
  assert.equal(privatePymeOwner.businessSegment, 'pyme');
  assert.equal(privatePymeOwner.hasPrivateBanking, true);
  assert.match(privatePymeOwner.explanation, /BANCA PRIVADA/);
});

test('Unified Economy: Score crediticio explicable en 7 dimensiones cuantitativas', () => {
  const scoreHealthy = calculateExplainableCreditScore(
    850000, // Ventas
    300000, // Deuda
    18000,  // Cuota mensual
    0,      // Sin mora
    true,   // Libros auditados
    4500000 // Colateral
  );

  assert.ok(scoreHealthy.score >= 700, `Score esperado alto pero fue ${scoreHealthy.score}`);
  assert.equal(scoreHealthy.rating === 'AAA' || scoreHealthy.rating === 'AA' || scoreHealthy.rating === 'A', true);
  assert.equal(scoreHealthy.dtiPct <= 30, true);
  assert.equal(scoreHealthy.factors.paymentHistoryScore.value, 350);

  // Cliente con morosidad grave y alto DTI
  const scoreDistressed = calculateExplainableCreditScore(
    200000, // Ventas bajas
    1800000, // Deuda enorme
    95000,  // Cuota pesada
    120,    // Mora > 90 días
    false,
    500000
  );

  assert.ok(scoreDistressed.score < 550, `Score esperado bajo pero fue ${scoreDistressed.score}`);
  assert.equal(scoreDistressed.factors.paymentHistoryScore.value, 70);
  assert.ok(scoreDistressed.dtiPct > 60);
});

test('Unified Economy: Caducidad y mermas en inventario de supermercado', () => {
  const stock = [...DEFAULT_SUPERMARKET_CATALOG];
  const day1 = simulateSupermarketDay(stock, 300);

  assert.ok(day1.salesRevenueHNL > 0, 'Debe haber ventas del día');
  assert.ok(day1.unitsSold > 0, 'Debe haber unidades vendidas');
  assert.equal(day1.updatedStock.length, stock.length);

  // Simular envejecimiento forzado para verificar mermas
  const agedStock = day1.updatedStock.map(p => ({ ...p, daysToPerish: 1 }));
  const dayAged = simulateSupermarketDay(agedStock, 100);
  assert.ok(dayAged.spoilageCostHNL > 0, 'Perecederos vencidos deben generar costo de merma');
  assert.ok(dayAged.unitsSpoiled > 0);
});

test('Unified Economy: Fases constructivas, desembolsos e hipotecas habitacionales', () => {
  const proj = { ...DEFAULT_INITIAL_CONSTRUCTION_PROJECT };
  assert.equal(proj.stages.length, 5);
  assert.ok(proj.totalApprovedBankFacilityHNL >= 18000000);
  assert.ok(proj.totalDisbursedBankHNL > 0);
  assert.equal(proj.stages[0].inspectionPassed, true);
});
