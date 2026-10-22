# Simulador Económico & Bancario Integral: Áureo Bank Honduras

Ecosistema ampliado de simulación macroeconómica y bancaria institucional conforme a las regulaciones del Banco Central de Honduras (BCH) y la Comisión Nacional de Bancos y Seguros (CNBS), incorporando transmisión de política monetaria, curva de rendimientos, cámara de compensación ACH/LBTR, subastas de divisas con forwards cambiarios, liquidez Basilea III (LCR/NSFR), y ciclo mensual obligatorio de amortizaciones, límites crediticios e indexación de tasas.

## User Review & Critical Decisions

> [!IMPORTANT]
> Nuevas innovaciones macroeconómicas y bancarias incorporadas a partir de la revisión:

- **Mecanismo de Transmisión de Política Monetaria & Curva de Rendimientos BCH**: Modelado del impacto de la TPM sobre la curva de rendimientos soberana (letras a 7, 28, 91, 182 y 364 días), con rezago temporal (pass-through) en tasas activas y pasivas, alertando ante escenarios de curva invertida (recesión económica).
- **Subasta Pública de Divisas BCH & Forwards Cambiarios USD/HNL**: Simulación del mecanismo de asignación de divisas del BCH con factor de prorrateo para importadores, y contratación interactiva de contratos forward no entregables (NDF) para mitigar el riesgo cambiario de empresas.
- **Ratios Regulatorios Basilea III (LCR & NSFR)**: Cálculo en tiempo real del Coeficiente de Cobertura de Liquidez (LCR $\ge 100\%$) y Fondeo Estable Neto (NSFR $\ge 100\%$) frente a choques sistémicos de retiros.
- **Cámara de Compensación ACH y Liquidación Bruta en Tiempo Real (LBTR / SIPSA)**: Posición neta multilateral ante el BCH con activación de facilidad de sobregiro diurno si hay desfase al corte de liquidación.
- **Pruebas de Estrés Macroeconómico Multivariado**: Choques de caída en precios internacionales del café, reducción de remesas familiares desde EE.UU., y eventos climáticos en el agro.
- **Actualización Mensual Obligatoria con Débito Flexible**: Amortización determinista de préstamos con cargo a cuentas, aviso previo de insuficiencia con botón de renegociación preventiva, y ajuste dinámico de límites de crédito según score Equifax.

---

## 1. Overview & Core Concept

- **Qué hace**: Convierte a Áureo Bank en un simulador bancario y macroeconómico de alta fidelidad técnica. Permite gestionar tanto el balance individual de cada cliente (cuentas, préstamos, tarjetas, garantías) como la tesorería de nivel central: encaje legal ante el BCH, compras en el mercado primario de letras soberanas, contratos de cobertura cambiaria y posicionamiento interbancario frente a competidores (Ficohsa, Atlántida, BAC, Banpaís, Banco de Occidente).
- **Público objetivo**: Gerencia de Tesorería, Comité de Activos y Pasivos (ALCO), Dirección de Riesgos y Oficiales de Cumplimiento Regulatorio.
- **Valor principal**: Reproducción fiel de la macroeconomía hondureña (inflación, tipo de cambio Lempira/Dólar, subasta de divisas BCH, remesas familiares y estacionalidades de Catorceavo y Aguinaldo).

---

## 2. User Experience & Visual Design

### Módulos e Innovaciones Interactivas
1. **Mesa de Dinero & Ventanilla de Liquidez BCH**:
   - Monitoreo en vivo de la posición de Encaje Legal (12% en moneda nacional, 9% en moneda extranjera).
   - Acceso directo a Ventanilla de Liquidez del BCH para reportos automáticos de 7 a 28 días con tasa de penalización si existe déficit de encaje.
   - Pizarra de Cotización Interbancaria (Call Money): Colocación o captación de fondos overnight con bancos del sistema hondureño.
2. **Mercado Cambiario & Coberturas Forwards (USD/HNL)**:
   - Panel de postura en la Subasta de Divisas del BCH con porcentaje de adjudicación y tipo de cambio oficial.
   - Emisión de contratos Forward para clientes corporativos (asegurando el tipo de cambio a 30, 60 y 90 días con cobro de comisión estructurada).
3. **Curva de Rendimientos y Transmisión de Tasas (ALCO)**:
   - Visualización de la curva de tipos de interés soberana del BCH por plazo.
   - Control del spread bancario y análisis del Margen Financiero Neto (NIM).
4. **Pruebas de Estrés Macroeconómico (Stress Testing)**:
   - Ejecución interactiva de escenarios: "Caída del Café -25%", "Freno en Remesas -15%", "Devaluación del Lempira +8%".
   - Verificación del impacto inmediato en el Índice de Adecuación de Capital (CAR) y provisiones CNBS.
5. **Cierre Mensual Obligatorio & Débito Flexible**:
   - Reporte con desglose de cuotas debitadas, créditos en aviso previo de mora, intereses de DPF capitalizados y recálculo de límites de tarjeta.
   - Opciones inmediatas de acción: "Renegociar Préstamo", "Condonar Recargos", o "Abonar Extraordinario a Capital".

### Jerarquía Tipográfica y Estilo Visual
- **Paleta 60-30-10**: Fondo pizarra profunda (`slate-950`/`slate-900`), paneles con micro-bordes en `slate-800` y acentos contrastantes en oro institucional Áureo (`amber-400`/`amber-500`) y verde fiscal (`emerald-400`).
- **Figuras Tabulares**: Todas las tasas, montos en Lempiras y Dólares, plazos y scores formateados estrictamente con `tabular-nums font-mono`.
- **Top Bar Contract**: Barra superior con Marca Áureo Bank a la izquierda, enlaces a módulos sin saltos de línea al centro, y botón de acción principal ("Avanzar Mes Obligatorio") a la derecha.

---

## 3. Key Product Decisions & Trade-Offs

- **Transmisión Macro con Rezagos Realistas**:
  - *Decisión*: Las variaciones de la TPM del BCH no alteran el 100% de la cartera de inmediato; los préstamos a tasa fija conservan su tasa pactada, mientras que las líneas rotativas y préstamos comerciales variables se indexan de manera gradual.
  - *Por qué*: Refleja la elasticidad real de la cartera bancaria y evita distorsiones artificiales en los ingresos del banco.
- **Débito Flexible vs. Castigo Inmediato**:
  - *Decisión*: Si un cliente no tiene saldo suficiente al llegar el fin de mes, se le debita la porción disponible y se emite un "Aviso Previo de Insuficiencia", permitiendo renegociar el crédito antes de reclasificarlo en categorías severas (III a V de la CNBS).
  - *Por qué*: Satisface la directiva del usuario, otorgando una experiencia interactiva rica sin penalizaciones punitivas irreversibles.
- **Integración de Basilea III (LCR/NSFR) sin Fricción**:
  - *Decisión*: Modelar LCR y NSFR como indicadores regulatorios visibles en el HUD y en la Mesa de Dinero, con alertas preventivas antes de que caigan por debajo del 100%.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Áureo Bank Core Platform                        │
├────────────────────────────────────────────────────────────────────────┤
│ Top Bar: Áureo Bank · Módulos Financieros · Botón Avanzar Mes          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Mesa de Dinero BCH    │  │ Mercado Cambiario     │  │ Créditos &   │ │
│  │ - Encaje Legal (12%)  │  │ - Subasta Divisas BCH │  │   Cuentas    │ │
│  │ - Repos BCH 7/14/28d  │  │ - Forwards NDF USD/HNL│  │ - Cuotas     │ │
│  │ - Call Interbancario  │  │ - Posición Neta Moneda│  │ - Límites    │ │
│  │ - Curva Rendimientos  │  │   Extranjera (PNME)   │  │ - Mora/CNBS  │ │
│  └───────────────────────┘  └───────────────────────┘  └─────────────┘ │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Riesgo y Regulaciones │  │ Cámara ACH / LBTR     │  │ Banca Corp & │ │
│  │ - Basilea III (LCR)   │  │ - Liquidación Bruta   │  │   Comercial  │ │
│  │ - Stress Testing CNBS │  │ - Saldo Compensatorio │  │ - Planillas  │ │
│  │ - Matriz Provisiones  │  │ - Riesgo Sistémico    │  │ - POS Comer. │ │
│  └───────────────────────┘  └───────────────────────┘  └─────────────┘ │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│           advanceGameMonth() Engine (Actualización Obligatoria)        │
│  1. Recalibración de TPM BCH e indexación de tasas variables           │
│  2. Ejecución de amortizaciones con débito flexible y avisos de mora   │
│  3. Capitalización de intereses en cuentas y DPF                       │
│  4. Ajuste automático de límites crediticios según rotación y score    │
│  5. Verificación de Encaje Legal y balance de compensación ACH/LBTR    │
│  6. Despliegue de Modal de Cierre Contable con acciones de resolución  │
└────────────────────────────────────────────────────────────────────────┘
```

### Componentes y Vistas a Implementar
1. `BchMoneyDeskView.tsx`: Módulo integral de Mesa de Dinero (Encaje Legal BCH, Ventanilla de Liquidez, Reportos, Call Interbancario y Curva de Rendimientos).
2. `FxAndForwardsModal.tsx`: Gestión de posturas en la subasta de dólares del BCH y contratación de coberturas cambiarias Forward.
3. `MonthlyClosingSummaryModal.tsx`: Auditoría obligatoria mensual con detalle de cuotas procesadas, alertas preventivas, variación de tasas y ajustes de límites.
4. `ClientActionsModal.tsx`: Acciones directas sobre expedientes de clientes (abono a capital extraordinario, recalibración de límite y renegociación preventiva).
5. `StressTestingModal.tsx`: Simulador de choques macroeconómicos de café, remesas y tipos de cambio con impacto en CAR y liquidez.

---
