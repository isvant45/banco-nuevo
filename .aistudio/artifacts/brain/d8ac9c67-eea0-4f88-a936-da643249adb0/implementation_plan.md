# Plan de Resolución de Errores de Tipado y Lógica Bancaria en el Simulador

Resolución paso a paso de los 7 errores de tipado, inconsistencias de propiedades y lógicas pendientes para el despliegue exitoso en GitHub Actions del simulador bancario y fiscal en TypeScript/React.

---

## Decisiones Críticas & Revisión del Usuario

> [!IMPORTANT]
> Todos los cambios se mantienen estrictamente enfocados en corregir los errores de compilación de TypeScript (`tsc --noEmit`), garantizar la consistencia de los tipos en `TransactionVoucher`, reparar las referencias de propiedades en garantías reales (`RealEstateCollateralItem`), y estructurar los flujos de crédito comercial, cálculo de capacidad, y crédito revolvente.

- **Punto 1 (Tipado Voucher)**: Agregar `disclaimer?: string;` como propiedad opcional en `TransactionVoucher` (`src/game/retroSimTypes.ts`).
- **Punto 2 (Garantías Reales)**: Reemplazar `col.propertyName` por `col.title` en `src/game/commercialBanksEngine.ts` (línea ~2872).
- **Punto 3 (Negociación RetroDesktop)**: Retornar explícitamente el contrato completo `BankOfferNegotiationResult` con `outcome` y `reason` en `handleNegotiateOffer` (`src/components/retro/RetroDesktop.tsx`).
- **Punto 4 (Motor Fiscal SAR)**: Vincular `paySarTaxObligation` en `SarTaxAuditWindow.tsx` y separar de forma determinista la presentación de la declaración (`isDeclared: true, isPaid: false`) del pago tributario.
- **Punto 5 (Capacidad de Pago)**: Eliminar la caja como sustituto de ingresos cuando las ventas sean 0 y eliminar el piso artificial de L 1,500 en la cuota.
- **Punto 6 (Garantías sin Tope de 15M)**: Eliminar el tope rígido de L 15,000,000 en la capacidad por garantías, respetando el avalúo real multiplicado por el porcentaje de aforo (LTV).
- **Punto 7 (Crédito Revolvente)**: Implementar y conectar `chargeCorporateCard` (resta disponible, suma a saldo utilizado) y `payCorporateCreditCard` (resta saldo utilizado, restituye disponible).

---

## 1. Visión General & Alcance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE FLUJO Y TIPADO                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/game/retroSimTypes.ts                                                  │
│   └─ TransactionVoucher { ..., disclaimer?: string; }                       │
│   └─ BankOfferNegotiationResult { outcome, reason, ... }                    │
│   └─ RealEstateCollateralItem { title: string, appraisalValue, ltvPct }     │
│                                │                                            │
│                                ▼                                            │
│  src/game/commercialBanksEngine.ts                                          │
│   ├─ [Fix 2] col.title en validación de gravamen                            │
│   ├─ [Fix 5] Capacidad de pago basada en flujo operativo real (sin caja)    │
│   ├─ [Fix 6] Garantías sin tope de 15M (Avalúo real x aforo LTV)           │
│   └─ [Fix 7] chargeCorporateCard & payCorporateCreditCard                   │
│                                │                                            │
│                                ▼                                            │
│  src/game/sarFiscalEngine.ts & SarTaxAuditWindow.tsx                         │
│   └─ [Fix 4] Declaración vs Pago en dos pasos diferenciados                │
│                                │                                            │
│                                ▼                                            │
│  src/components/retro/RetroDesktop.tsx                                      │
│   └─ [Fix 3] handleNegotiateOffer entrega BankOfferNegotiationResult        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Plan Detallado de Implementación Paso a Paso

### Paso 1: Tipado en `TransactionVoucher`
- **Archivo:** `src/game/retroSimTypes.ts`
- **Cambio:** Agregar `disclaimer?: string;` a la interfaz `TransactionVoucher`.
- **Resultado:** Elimina el error `Object literal may only specify known properties, and 'disclaimer' does not exist in type 'TransactionVoucher'` en `sarFiscalEngine.ts#L261` y `commercialBanksEngine.ts#L3092`.

### Paso 2: Propiedad Correcta en Garantías
- **Archivo:** `src/game/commercialBanksEngine.ts` (línea ~2872)
- **Cambio:** Sustituir `col.propertyName` por `col.title` al emitir el mensaje de validación de gravamen de la garantía seleccionada.

### Paso 3: Tipado de Negociación en `RetroDesktop.tsx`
- **Archivo:** `src/components/retro/RetroDesktop.tsx`
- **Cambio:** Ajustar el valor de retorno de `handleNegotiateOffer` para cumplir con la firma estricta de `BankOfferNegotiationResult`:
  ```typescript
  return {
    outcome: res.outcome,
    reason: res.reason,
    success: res.success,
    message: res.message,
    dialogue: res.dialogue,
    updatedOffer: res.updatedOffer
  };
  ```

### Paso 4: Motor Fiscal SAR en Dos Fases
- **Archivos:** `src/game/sarFiscalEngine.ts` y `src/components/retro/SarTaxAuditWindow.tsx`
- **Cambio A:** Conectar `paySarTaxObligation` al botón de pago de impuestos en `SarTaxAuditWindow.tsx`.
- **Cambio B:** Garantizar que `fileSarDeclaration` establezca `isDeclared = true, isPaid = false`, mientras que `paySarTaxObligation` sea la única responsable de saldar la obligación y marcar `isPaid = true`.

### Paso 5: Capacidad de Pago Basada en Flujo Operativo Real
- **Archivo:** `src/game/commercialBanksEngine.ts` (en `calculateCreditTermsDisclosure`)
- **Cambio A:** Eliminar el uso de `storeCash` o `storeBankBalance` como ingreso cuando `monthlySales` sea 0.
- **Cambio B:** Si `netFlow <= 0`, la cuota permitida y la capacidad de pago deben ser exactamente 0, sin el piso artificial de L 1,500.

### Paso 6: Eliminación del Límite de 15 Millones en Garantías
- **Archivo:** `src/game/commercialBanksEngine.ts` (en `calculateCreditTermsDisclosure`)
- **Cambio:** Remover la constante rígida `bankExposureLimitHNL = 15000000;`. Utilizar el valor neto disponible de la garantía (`calculateCollateralAvailableCoverage(col) = appraisalValue * (ltvPct / 100) - currentLienHNL`) y calcular la cobertura total sin topes artificiales.

### Paso 7: Implementación de Crédito Revolvente en Tarjetas
- **Archivo:** `src/game/commercialBanksEngine.ts`
- **Cambio A (`chargeCorporateCard`):** Valida que el monto no exceda `availableCredit`, incrementa `currentBalance`, reduce `availableCredit` y actualiza el pago mínimo.
- **Cambio B (`payCorporateCreditCard`):** Permite abonos desde cuenta corriente o caja chica, reduce `currentBalance`, restituye `availableCredit` y genera el comprobante correspondiente.

---

## 3. Plan de Verificación

1. **Chequeo de Tipos TypeScript:** Ejecutar `tsc --noEmit` mediante `lint_applet` para asegurar 0 errores de compilación.
2. **Compilación de la App:** Ejecutar `compile_applet` para confirmar un build exitoso.
3. **Validación de Funcionalidad:** Comprobar que todas las ventanas del simulador operan de forma fluida con las nuevas lógicas.
