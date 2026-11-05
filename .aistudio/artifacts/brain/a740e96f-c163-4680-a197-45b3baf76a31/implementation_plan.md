# Plan de Implementación: Sistema Bancario Empresarial, Score Crediticio y Auto-Financiamiento Multi-Rubro

## Resumen Ejecutivo de Implementación
Se ha modernizado completamente la suite financiera de los empresarios en el simulador retro (Windows 98/2000), habilitando capacidades bancarias completas tanto para **Constructora** (rubro por defecto) como para **Supermercado** y **Bar/Restaurante/Comida**. Se eliminó por completo el "Banco Aliado de la IA" y se reemplazó la etiqueta "4 Bancos" por **"Banco"**.

---

## Cambios Implementados

### 1. Rubro por Defecto: Constructora & Eliminación de "Banco Aliado IA"
- **Predeterminado**: Tanto en la inicialización de `App.tsx`, como en `RetroTitleScreen.tsx` y `RetroNewGameModal.tsx`, el rubro por defecto es **Constructora & Obras** (`'constructora'`) con capital inicial y empresa `"Constructora Metropolitana"`.
- **Eliminación Total de Smart Bank**: Se removió el módulo y ventana `smart_bank` / `SmartBankEnterpriseWindow` de la barra de tareas, del escritorio y del ciclo de vida de la empresa.
- **Nomenclatura Limpia**: Se renombraron todas las referencias a `"Banco"` (ícono 🏦 / 🏛️), eliminando menciones como `"4 Bancos"`.

### 2. Score Crediticio de la Empresa (300 a 850 Puntos)
- Motor algorítmico `calculateCompanyCreditScore` que evalúa:
  - Solvencia fiscal SAR (sin sanciones ni reparos)
  - Reputación corporativa (0-100)
  - Liquidez acumulada en caja y cuentas bancarias
  - Facturación acumulada mensual
  - Racha de pagos puntuales
  - Índice DTI (Compromisos mensuales vs Facturación)
  - Utilización de líneas de crédito (< 30% otorga bonificación)
- Clasificación por categorías: **AAA (Excelente)**, **AA (Muy Bueno)**, **A (Bueno)**, **B (Aceptable)** y **C (En Riesgo)**.
- Desbloquea descuentos en tasas de interés (hasta 2.5% anual) y aumentos automáticos de límites de tarjeta.

### 3. Cuentas de Cheques y Ahorro: Depósitos, Retiros y Rendimiento Negociable
- **Agregar Fondos**: Los empresarios pueden transferir efectivo acumulado en su caja registradora a su cuenta corriente bancaria (`depositCashToCheckingAccount`).
- **Retirar Efectivo**: Posibilidad de retirar fondos de la cuenta bancaria para abastecer la caja registradora (`withdrawCashFromCheckingAccount`).
- **Negociación de Tasa Pasiva**: Posibilidad de negociar rendimientos preferenciales de hasta 7.8% anual en cuenta de cheques según el Score Crediticio (`negotiateCheckingAccountRate`).

### 4. Préstamos Bancarios: Deducción Automática y Abonos Extraordinarios a Capital
- **Amortización Periódica**: En los días de corte (quincena 15 y mes 30), el simulador descuenta automáticamente la cuota mensual correspondiente, reduciendo el saldo de deuda y contabilizando el plazo restante (`processDailyLoanAmortization`).
- **Abono Extraordinario a Capital**: Botón interactivo para realizar pagos directos a capital sin penalidad (`makeExtraordinaryLoanPayment`). Recalcula automáticamente a la baja la cuota mensual futura.
- **Negociación de Tasa Activa**: Permite solicitar reducciones de tasa de interés anual ante los bancos (`negotiateLoanRate`).

### 5. Tarjetas de Crédito Corporativas con Aumento Quincenal (Cada 15 Días)
- Cada 15 días (días 15 y 30), el motor `processBiweeklyCardEvaluation` revisa el comportamiento de pago y el Score Crediticio.
- Otorga aumentos automáticos de límite de crédito (+15% a +25%), mejoras en cashback (+0.5%) y reducciones de tasa APR, notificando al empresario en el escritorio.

### 6. Concesionarias y Auto-Financiamiento Bancario Directo (1 a 5 Años)
- Catálogo extendido con concesionarias para cada rubro (`getDealersForSector`):
  - **Supermercados**: Camiones refrigerados Hino 3.5T, montacargas eléctricos Toyota, furgones Hyundai H350 y cámaras frigoríficas industriales.
  - **Comida / Restaurantes**: Flotas de motos delivery Honda Cargo 150cc, vans refrigeradas Peugeot Partner, hornos combinados industriales Rational y líneas de enfriamiento True.
  - **Constructoras**: Volquetas reforzadas CAT 770G, retroexcavadoras CAT 420F2 4x4, camiones mixer trompo y grúas torre.
- **Financiamiento Bancario en el Concesionario**:
  - Selector de Banco comercial oferente (Ficohsa, Atlántida, BAC, Occidente).
  - Configuración de prima (enganche) del 10% al 30%.
  - Plazos configurables de 1 a 5 años (12 a 60 meses).
  - Tasa de interés preferencial ajustada por el Score Crediticio.
  - Botón de negociación de tasa y cálculo en tiempo real de la cuota mensual estimada.
  - Al aprobar, se debita la prima y se incorpora de inmediato la unidad con sus llaves a la flota propia del negocio.

---

## Verificación de Calidad
- **Pruebas Automatizadas**: 101 tests unitarios ejecutados exitosamente en `npm test`, incluyendo la nueva suite completa `tests/commercialBanksAndScore.test.ts`.
- **Compilación & Tipos**: `compile_applet` y `lint_applet` verificados conjuntamente sin errores.
- **Servidor Dev**: Dev server reiniciado y operativo en el puerto 3000.
