# Suite Bancaria Avanzada: Tarjetas Multi-Nivel, Reestructuración de Deuda, Garantías con Rendimiento y DPF Compuesto

Plan integral para modernizar y profundizar los servicios financieros del simulador empresarial (retro Windows 98/2000), respondiendo con exactitud a las tres directrices confirmadas por el usuario.

---

## Decisiones Críticas & Revisión del Usuario

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas en la fase de clarificación:
> 1. **Tarjetas y Préstamos**: Tarjetas en 3 niveles (Business Clásica, Oro Ejecutiva, Black Platinum), catálogo interactivo de canje de puntos de recompensas corporativas y asistente de reestructuración de deuda para refinanciar pasivos pesados.
> 2. **Depósitos en Garantía**: Generación de rendimiento pasivo diario sobre los fondos pignorados y liberación automática con intereses acumulados al concluir obras o licitaciones.
> 3. **Inversiones a Plazo Fijo (DPF)**: Interés compuesto diario con cálculo de proyección exacta, tasas escalonadas por volumen de capital depositado (hasta +2.2% anual) y opción de cancelación anticipada para rescate de liquidez inmediata.

---

## 1. Visión General & Concepto Central

- **Propósito**: Elevar la profundidad estratégica de la gestión financiera para empresarios (Constructoras, Supermercados y Restaurantes), transformando el Banco en un socio integral para apalancar proyectos grandes, mitigar riesgos de liquidez y rentabilizar excedentes de tesorería.
- **Audiencia / Persona**: Empresarios virtuales que buscan optimizar su flujo de caja, licitar obras públicas y privadas sin perder liquidez, obtener financiamiento blando y canjear beneficios reales por sus transacciones diarias.
- **Valor Agregado**:
  - Elimina el dinero ocioso: los depósitos en garantía ahora generan rendimiento diario.
  - Opciones ante crisis de liquidez: la reestructuración de préstamos evita la quiebra al reducir la cuota mensual extendiendo el plazo.
  - Flexibilidad en inversiones: DPF con interés compuesto diario y rescate anticipado si surge una emergencia operativa.
  - Gamificación y recompensas: puntos por compras con tarjeta corporativa canjeables por beneficios tributarios y operativos.

---

## 2. Experiencia de Usuario & Diseño Visual

### A. Estética Retro y Filosofía de Diseño
- **Dirección Visual**: Auténtica interfaz Windows 98 / 2000 (`#c0c0c0`, bordes biselados 3D inset/outset, sombreado gris carbón `#404040` y luz blanca `#ffffff`).
- **Tipografía**: Fuentes del sistema en caja alta/baja, títulos nítidos y cifras financieras tabulares estrictas en monoespaciado (`font-mono tabular-nums`) con separadores de miles (`L 1,250,000.00`).
- **Cero Elementos Genéricos (Anti-Slop)**: Sin etiquetas de píldora innecesarias, sin gradientes púrpuras ni tarjetas flotantes modernas; botones clásicos con efecto de pulsación tridimensional.

### B. Flujos de Usuario Mejorados

#### Flujo 1: Tarjetas Corporativas Multi-Nivel & Catálogo de Recompensas
1. **Selector de Nivel de Tarjeta**:
   - *Business Clásica*: Límite básico (L 100k - 300k), 1.0% cashback, 1 pt por cada L 100 gastados.
   - *Oro Ejecutiva*: Límite intermedio (L 300k - 800k), 2.2% cashback, 1.5 pts por cada L 100, seguro de carga y descuento en combustible.
   - *Black Platinum*: Límite prémium (L 800k - 3M), 3.5% cashback, 2.5 pts por cada L 100, concierge corporativo y exención de comisiones cambiarias.
2. **Catálogo de Canje de Puntos**:
   - Vales de Combustible (L 5,000 para maquinaria/flota - 500 pts).
   - Crédito Fiscal ISR ante SAR (Deducción de L 25,000 - 2,000 pts).
   - Mantenimiento Preventivo de Flota (+15% condición mecánica - 1,200 pts).
   - Reembolso Directo en Efectivo a Cuenta Corriente (L 10,000 - 900 pts).

#### Flujo 2: Préstamos Comerciales & Reestructuración de Deuda
1. **Visualizador de Amortización**: Barra de progreso de amortización, cuota periódica y desglose capital/interés.
2. **Modal de Reestructuración de Deuda**:
   - Se activa cuando el empresario busca alivio financiero o ante un elevado ratio de endeudamiento (DTI).
   - Permite seleccionar un nuevo plazo (hasta +36 meses adicionales).
   - Muestra en tiempo real la nueva cuota mensual reducida (hasta un 45% menor).
   - Aplica tasa preferencial si el Score Crediticio de la empresa es superior a 680 pts.

#### Flujo 3: Depósitos en Garantía con Rendimiento Diario y Liberación Automática
1. **Constitución de Fianza**: Inmovilización de fondos vinculada opcionalmente a un proyecto/licitación.
2. **Generación Diaria de Intereses**: Los fondos pignorados devengan un rendimiento diario visible (3.5% - 4.5% anual) que se acumula en el depósito.
3. **Liberación Automática o Manual**:
   - Al finalizar exitosamente la obra en `advanceConstructionDay` o al avanzar el tiempo, la garantía se libera automáticamente acreditando el capital original + todos los intereses devengados en la cuenta corriente.
   - Registro en el historial con certificado de solvencia de la fianza.

#### Flujo 4: Inversión a Plazo Fijo (DPF) con Interés Compuesto y Cancelación Anticipada
1. **Tasas Escalonadas por Tramo**:
   - Tramo Estándar (< L 250,000): Tasa base (6.5% - 7.2%).
   - Tramo Plata (L 250,000 - L 999,999): +0.8% de bonificación.
   - Tramo Oro (L 1,000,000 - L 4,999,999): +1.5% de bonificación.
   - Tramo Diamante ($\ge$ L 5,000,000): +2.2% de bonificación.
2. **Capitalización Diaria**: El interés se reinvierte diariamente sobre el saldo acumulado.
3. **Cancelación Anticipada (Rescate Inmediato)**:
   - Permite al usuario liquidar el DPF antes del vencimiento si requiere fondos urgentes.
   - Retiene el 75% del rendimiento generado a la fecha como penalidad leve y devuelve de inmediato el 100% del capital a la cuenta corriente.

---

## 3. Decisiones de Producto & Trade-Offs

- **Decisión 1: Puntos de Recompensa vs. Cashback Directo**
  - *Enfoque*: Ofrecer ambos. El cashback se aplica automáticamente como saldo a favor en la tarjeta, mientras que los puntos acumulables permiten canjear recompensas operativas de alto impacto (combustible, beneficios fiscales del SAR y mantenimiento de maquinaria).
  - *Razón*: Conecta la banca con los otros subsistemas del juego (flota, obras y tributación).
- **Decisión 2: Tasa de Interés en Garantías Pignoradas**
  - *Enfoque*: Otorgar una tasa pasiva moderada (3.5% - 4.5%) inferior a un DPF formal (7% - 9%), reconociendo la naturaleza cautiva del colateral pero premiando al contratista.
- **Decisión 3: Penalidad por Cancelación Anticipada de DPF**
  - *Enfoque*: En lugar de confiscar todo el interés devengado, se liquida el 75% del interés ganado para mantener una experiencia justa y pedagógica en el simulador.

---

## 4. Arquitectura Técnica & Estrategia de Datos

### Diagrama del Sistema y Jerarquía de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RetroDesktop (Sistema OS)                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             CommercialBanksWindow (Ventana Principal)          │   │
│   │                                                                │   │
│   │  [Selector Bancos: Ficohsa · Atlántida · BAC · Occidente]      │   │
│   │  [HUD Score Crediticio Empresarial: 300 - 850 pts]             │   │
│   │                                                                │   │
│   │  ┌────────────┬────────────┬────────────┬───────────┬───────┐  │   │
│   │  │ Préstamos  │  Tarjetas  │ Cta. Cheq  │ Garantías │  DPF  │  │   │
│   │  └─────┬──────┴─────┬──────┴─────┬──────┴─────┬─────┴───┬───┘  │   │
│   │        │            │            │            │         │      │   │
│   │        ▼            ▼            ▼            ▼         ▼      │   │
│   │   [Restruct.]  [3 Tiers &]  [Depósitos &]  [Interés &] [Comp. &]│   │
│   │   [Abonos]     [Rewards]    [Retiros]      [Auto-Rel]  [Rescate]│   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     commercialBanksEngine.ts (Lógica)                  │
│                                                                        │
│  - calculateCompanyCreditScore()                                       │
│  - restructureCommercialLoan()           [NUEVO]                       │
│  - upgradeCorporateCardTier()            [NUEVO]                       │
│  - redeemCardRewardPoints()              [NUEVO]                       │
│  - processDailyGuaranteeAccrual()        [NUEVO]                       │
│  - releaseGuaranteeDeposit()             [ACTUALIZADO: Auto + Manual]  │
│  - processDailyDpfCompounding()          [NUEVO: Interés Compuesto]    │
│  - earlyLiquidateDpf()                   [NUEVO: Cancelación Ant.]     │
│  - processDailyLoanAmortization()                                      │
│  - processBiweeklyCardEvaluation()                                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Estructuras de Datos Extendidas (`src/game/retroSimTypes.ts`)

```typescript
export type CorporateCardTierId = 'business_standard' | 'corporate_gold' | 'infinite_black';

export interface CorporateCardRewardItem {
  id: string;
  title: string;
  category: 'combustible' | 'sar_fiscal' | 'mantenimiento' | 'cash_rebate';
  pointsCost: number;
  description: string;
  benefitValue: number;
}

export interface BankCorporateCreditCard {
  cardId: string;
  bankId: CommercialBankId;
  brand: string;
  tier: CorporateCardTierId;
  creditLimit: number;
  currentBalance: number;
  interestRateAnnual: number;
  minPaymentMonthly: number;
  rewardPoints: number;
  cashbackPct?: number;
  lastLimitIncreaseDay?: number;
  limitIncreasesCount?: number;
}

export interface BankCommercialLoan {
  id: string;
  bankId: CommercialBankId;
  principalAmount: number;
  balanceRemaining: number;
  monthlyPayment: number;
  interestRateAnnual: number;
  termMonthsRemaining: number;
  purpose: string;
  loanType?: 'capital_trabajo' | 'vehicular_equipo' | 'reestructurado';
  originalTermMonths?: number;
  isRestructured?: boolean;
  amortizedPrincipalTotal?: number;
}

export interface BankGuaranteeDeposit {
  id: string;
  bankId: CommercialBankId;
  amountPledged: number;
  accruedInterest: number;
  annualRatePct: number;
  tenderIdRef?: string;
  purpose: string;
  status: 'activo' | 'liberado';
  createdDay: number;
}

export interface BankTermDeposit {
  id: string;
  bankId: CommercialBankId;
  principalAmount: number;
  currentBalance: number; // Saldo con interés compuesto acumulado
  annualRatePct: number;
  tierBonusPct: number; // Bonificación por tramo de capital
  termDays: number;
  daysRemaining: number;
  accruedInterest: number;
  isEarlyLiquidated?: boolean;
}
```

---

## 5. Plan de Ejecución en Código (Siguiente Turno tras Aprobación)

1. **Modelos de Tipos (`src/game/retroSimTypes.ts`)**:
   - Ampliar `BankCorporateCreditCard` con `tier`, `rewardPoints` y catálogo.
   - Extender `BankCommercialLoan` con historial de reestructuración.
   - Agregar acumulador de intereses `accruedInterest` y `annualRatePct` en `BankGuaranteeDeposit`.
   - Extender `BankTermDeposit` con `currentBalance`, `tierBonusPct` y registro de capitalización compuesta.

2. **Motor Financiero (`src/game/commercialBanksEngine.ts`)**:
   - Implementar `upgradeCorporateCardTier` y `redeemCardRewardPoints`.
   - Implementar `restructureCommercialLoan` (recalculando cuota a menor valor).
   - Implementar `processDailyGuaranteeAccrual` y sincronizar la liberación automática de garantías cuando se complete una obra o licitación.
   - Implementar `processDailyDpfCompounding` y `earlyLiquidateDpf`.
   - Actualizar `createDefaultBankRelationships` con los nuevos campos de tier y recompensas.

3. **Interfaz Gráfica Retro (`src/components/retro/CommercialBanksWindow.tsx`)**:
   - Pestaña **Tarjetas**: Selector visual de nivel de tarjeta (Clásica, Oro, Black), badge de puntos de recompensa acumulados y catálogo modal de canje.
   - Pestaña **Préstamos**: Botón y panel de "Reestructurar Préstamo" con cálculo comparativo de cuota vieja vs cuota nueva.
   - Pestaña **Garantías**: Muestra los intereses diarios acumulados en tiempo real y el botón de liberación formal con liquidación a cuenta corriente.
   - Pestaña **DPF**: Visualizador de tasa escalonada por tramo de inversión, tabla de proyección de capitalización compuesta y botón de "Cancelación Anticipada (Liquidez Inmediata)".

4. **Integración Temporal en Escritorio (`src/components/retro/RetroDesktop.tsx`)**:
   - En `handleAdvanceDay` y `handleAdvanceDays`, incorporar `processDailyGuaranteeAccrual` y `processDailyDpfCompounding` para que los rendimientos maduren de forma orgánica con el paso del tiempo.

5. **Pruebas Automatizadas**:
   - Extender `tests/commercialBanksAndScore.test.ts` para cubrir:
     - Reestructuración de préstamos y reducción de cuota.
     - Acumulación y canje de puntos de recompensa.
     - Tiers de tarjetas corporativas.
     - Interés devengado en garantías y liberación con rendimiento.
     - Capitalización compuesta en DPF y liquidación anticipada.
