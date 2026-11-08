import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CorporateCreditCard } from '../src/game/commercialBanksEngine';

describe('CorporateCreditCard: Módulo ERP Financiero de Tarjetas Corporativas', () => {
  it('inicializa una tarjeta corporativa respetando límites e invariantes', () => {
    const card = new CorporateCreditCard({
      cardId: 'card-corp-001',
      creditLimit: 250000,
      usedBalance: 50000
    });

    assert.equal(card.creditLimit, 250000);
    assert.equal(card.usedBalance, 50000);
    assert.equal(card.availableBalance, 200000);
    assert.equal(card.availableBalance + card.usedBalance, card.creditLimit);
  });

  it('rechaza inicialización con límite de crédito negativo', () => {
    assert.throws(() => {
      new CorporateCreditCard({
        creditLimit: -1000
      });
    }, /límite de crédito debe ser un valor numérico positivo o cero/i);
  });

  it('processPurchase descuenta del availableBalance y suma al usedBalance', () => {
    const card = new CorporateCreditCard({
      creditLimit: 100000,
      usedBalance: 20000
    });

    assert.equal(card.availableBalance, 80000);

    const purchaseRes = card.processPurchase(15000, 'Materiales de oficina y papelería');
    assert.equal(purchaseRes.success, true);
    assert.equal(card.usedBalance, 35000);
    assert.equal(card.availableBalance, 65000);
    assert.equal(purchaseRes.newUsedBalance, 35000);
    assert.equal(purchaseRes.newAvailableBalance, 65000);
    assert.equal(card.availableBalance + card.usedBalance, card.creditLimit);
  });

  it('processPurchase deniega transacciones que excedan el límite disponible', () => {
    const card = new CorporateCreditCard({
      creditLimit: 50000,
      usedBalance: 40000
    });

    assert.equal(card.availableBalance, 10000);

    assert.throws(() => {
      card.processPurchase(10001, 'Compra no autorizada por exceder cupo');
    }, /fondos insuficientes en la tarjeta corporativa/i);

    // Los saldos permanecen intactos
    assert.equal(card.usedBalance, 40000);
    assert.equal(card.availableBalance, 10000);
  });

  it('processPurchase rechaza montos negativos, cero o no numéricos', () => {
    const card = new CorporateCreditCard({
      creditLimit: 100000
    });

    assert.throws(() => card.processPurchase(0), /positivo y finito/i);
    assert.throws(() => card.processPurchase(-500), /positivo y finito/i);
    assert.throws(() => card.processPurchase(Number.NaN), /positivo y finito/i);
  });

  it('payCreditCard realiza la operación inversa: resta de usedBalance y suma a availableBalance', () => {
    const card = new CorporateCreditCard({
      creditLimit: 150000,
      usedBalance: 60000
    });

    assert.equal(card.availableBalance, 90000);

    const payRes = card.payCreditCard(25000);
    assert.equal(payRes.success, true);
    assert.equal(payRes.actualPayment, 25000);
    assert.equal(card.usedBalance, 35000);
    assert.equal(card.availableBalance, 115000);
    assert.equal(card.availableBalance + card.usedBalance, card.creditLimit);
  });

  it('payCreditCard no genera saldos negativos ni supera el creditLimit', () => {
    const card = new CorporateCreditCard({
      creditLimit: 100000,
      usedBalance: 30000
    });

    // Intentar pagar más de la deuda pendiente
    const payRes = card.payCreditCard(50000);
    assert.equal(payRes.success, true);
    assert.equal(payRes.actualPayment, 30000, 'Debe pagar únicamente la deuda remanente');
    assert.equal(card.usedBalance, 0);
    assert.equal(card.availableBalance, 100000);
  });

  it('payCreditCard rechaza pagos si la tarjeta ya está en saldo 0', () => {
    const card = new CorporateCreditCard({
      creditLimit: 100000,
      usedBalance: 0
    });

    assert.throws(() => {
      card.payCreditCard(5000);
    }, /no tiene saldo deudor pendiente/i);
  });

  it('exporta e importa fielmente mediante toJSON y fromCard', () => {
    const original = new CorporateCreditCard({
      cardId: 'card-atl-corp-99',
      bankId: 'atlantida',
      creditLimit: 200000,
      usedBalance: 45000,
      interestRateAnnual: 18.5
    });

    const json = original.toJSON();
    assert.equal(json.creditLimit, 200000);
    assert.equal(json.usedBalance, 45000);
    assert.equal(json.availableBalance, 155000);

    const restored = CorporateCreditCard.fromCard(json);
    assert.equal(restored.creditLimit, original.creditLimit);
    assert.equal(restored.usedBalance, original.usedBalance);
    assert.equal(restored.availableBalance, original.availableBalance);
  });
});
