# Plan de Implementación: Sistema Dinámico de Campaña, Rankings de Mercado (League Tables estilo J.P. Morgan & BAC), Core Back-to-Back Revolvente y Árbol Tecnológico

Plan maestro revisado que responde a los requerimientos de dinamismo, competitividad y autenticidad institucional, incorporando:
1. **Corrección de Tarjeta de Crédito Garantizada Back-to-Back**: Rediseño operativo a **Línea de Crédito Revolvente** sin cuota mensual amortizable fija, asignando cupo del 90% al 95% del DPF pignorado, facturación mensual de pago mínimo (5% del saldo consumido) y cobro de intereses únicamente sobre el saldo efectivamente utilizado.
2. **Sistema Nacional de Rankings & Tablas de Liga (League Tables estilo J.P. Morgan & BAC Credomatic)**:
   - **Ranking de Tarjetas de Crédito**: Posición en plásticos activos, saldo financiado, facturación comercial y cuota de mercado vs. BAC y Ficohsa.
   - **Ranking de Préstamos de Consumo y Personales**: Volumen de cartera, tasa promedio ponderada y morosidad NPL.
   - **Ranking de Banca Privada & Wealth Management (Estilo J.P. Morgan Private Bank)**: Activos Bajo Administración (AUM), clientes de alto patrimonio (HNWI / UHNW) y rendimiento medio de portafolios patrimoniales.
   - **Ranking de Solvencia y Rating de Riesgo (Fitch / Moody's)**: Capital Adequacy Ratio (CAR Tier 1) y ratio de eficiencia *Cost-to-Income*.
3. **Préstamos Sindicados Corporativos (J.P. Morgan Corporate & Investment Bank Style)**: Estructuración de financiamientos multilaterales para megaproyectos energéticos e industriales actuando como *Lead Arranger* con cobro de comisiones de estructuración (*Arranger Fees* de 1.5% a 2.5%).
4. **Modo Campaña con Misiones por Capítulos & Hitos de Recompensa**: 4 capítulos evolutivos con metas claras de solvencia, liquidez, colocación y expansión.
5. **Arena Competitiva Multilateral contra los 5 Bancos Rivales**: Robo directo de cartera, batallas territoriales por departamento y eventos de contraataque reactivo de la IA competidora.
6. **Árbol Tecnológico Modular de Mejoras Continuas**: 4 ramas de especialización con inversión CAPEX y reducción permanente de OPEX.

---

## 1. Corrección Operativa: Tarjeta Garantizada Back-to-Back como Línea Revolvente

Bajo las mejores prácticas de la banca regional (BAC, Ficohsa, Lafise) y norteamericana (JPMorgan Chase):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             MECÁNICA OPERATIVA: CRÉDITO AMORTIZABLE VS. TARJETA GARANTIZADA            │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│ PRÉSTAMO AMORTIZABLE BACK-TO-BACK      │ TARJETA DE CRÉDITO GARANTIZADA BACK-TO-BACK   │
├────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Desembolso único en cuenta de caja   │ • Línea revolvente asignada al 90% - 95% DPF  │
│ • Sistema francés con cuota fija nivel │ • NO TIENE CUOTA FIJA MENSUAL DE PRÉSTAMO     │
│   (Capital + Intereses pactados)       │ • Saldo utilizado varía según consumo cliente │
│ • Plazo definido (12 a 60 meses)       │ • Pago Mínimo mensual = 5% del saldo consumido│
│ • Se cancela al completar las cuotas   │ • Intereses aplican SOLO sobre saldo utilizado│
│ • DPF se desgrava al saldo = L. 0.00   │ • DPF pignorado sigue ganando intereses pasiv.│
└────────────────────────────────────────┴───────────────────────────────────────────────┘
```

### Reglas Contables en Core:
- **Límite de Crédito Revolvente**: `cupoTarjeta = dpfPrincipal * (coveragePct / 100)` (90% a 95%).
- **Saldo Consumido Inicial**: L. 0.00 (el cliente dispone de su tarjeta según lo requiera).
- **Pago Mínimo Mensual**: $\max(\text{L. 500}, \text{Saldo Utilizado} \times 5\%)$.
- **Devengo de Intereses Activos**: Se computa mensualmente exclusivamente sobre el saldo financiado no cancelado al corte.
- **Cobro de Comisión de Emisión**: 0.50% del límite asignado (mínimo L. 500 o USD $20).
- **Exoneración de Provisiones CNBS**: 0% RWA / L. 0.00 en provisiones por riesgo nulo colateralizado.

---

## 2. Sistema de Rankings & Tablas de Liga Institucionales (League Tables)

Tablero comparativo en tiempo real auditado con la información de los 6 bancos del sistema (Áureo Bank, Banco Atlántida, Banco Ficohsa, BAC Credomatic, Banpaís y Banco de Occidente):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    TABLAS DE LIGA NACIONALES & RANKING BANCARIO                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [1. Tarjetas de Crédito] │ [2. Préstamos Consumo] │ [3. Banca Privada] │ [4. Solvencia]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ VISTA: LEAGUE TABLE - TARJETAS DE CRÉDITO & ADQUIRENCIA COMERCIAL                      │
│                                                                                        │
│ Pos  Banco                   Plásticos Activos  Facturación Mes  Cartera      Cuota %  │
│ ───  ──────────────────────  ─────────────────  ───────────────  ───────────  ───────  │
│  1   Banco Ficohsa           485,000            L. 1,450.0 M     L. 5,800.0 M  31.2%   │
│  2   BAC Credomatic          440,000            L. 1,380.0 M     L. 5,200.0 M  28.0%   │
│  3   Banco Atlántida         280,000            L.   720.0 M     L. 2,900.0 M  15.6%   │
│  4   Áureo Bank (Jugador)    195,000            L.   540.0 M     L. 2,150.0 M  11.6%   │
│  5   Banpaís                 145,000            L.   390.0 M     L. 1,600.0 M   8.6%   │
│  6   Banco de Occidente       90,000            L.   210.0 M     L.   950.0 M   5.0%   │
│                                                                                        │
│ ACCIÓN ESTRATÉGICA DISPONIBLE:                                                         │
│ [Lanzar Campaña Cashback Combustibles]  [Guerra de Millas Viajeras]  [Tarjetas Metal]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Las 4 Tablas de Liga:
1. **Tarjetas de Crédito**: Mide la facturación comercial mensual, parque de plásticos, saldo deudor financiado y cuota de mercado.
2. **Préstamos de Consumo y Personales**: Evalúa cartera colocada, tasa activa media, satisfacción del deudor y ratio de mora (NPL %).
3. **Banca Privada & Wealth Management (Estilo J.P. Morgan Private Bank)**:
   - **Activos Bajo Administración (AUM)**: Volumen fiduciario en custodia y patrimonios autónomos.
   - **Cuentas High-Net-Worth (HNWI / UHNW)**: Número de familias y clientes con patrimonios superiores a USD $1,000,000.
   - **Retorno Medio de Portafolios Fiduciarios**: Rendimiento anualizado otorgado a los inversionistas de Banca Privada.
4. **Solvencia, Calidad de Activos & Rating de Riesgo**:
   - Calificación crediticia internacional (de AAA a B+).
   - Índice de Adecuación de Capital (CAR Tier 1 + Tier 2 $\ge 10.0\%$).
   - Ratio de Eficiencia Operativa (*Cost-to-Income Ratio*, meta $< 50\%$).

---

## 3. Préstamos Sindicados Corporativos (J.P. Morgan Corporate Bank Style)

Para operaciones de gran envergadura (L. 100M a L. 500M) que superan el límite individual de crédito de un solo banco:
- **Estructuración como Lead Arranger**: Áureo Bank convoca a otros bancos del sistema (Ficohsa, Atlántida, Banpaís) para financiar en consorcio proyectos como:
  - Parques de Energía Solar en Choluteca (L. 350,000,000).
  - Expansión de Terminal de Contenedores en Puerto Cortés (L. 450,000,000).
  - Parques Industriales y Naves Textiles en ZIP Choloma (L. 280,000,000).
- **Ingresos por Estructuración**: El banco cobra una comisión por estructuración (*Arranger Fee*) de 1.5% a 2.5% flat del total del sindicado, acreditando comisiones millonarias sin asumir el 100% del riesgo crediticio.

---

## 4. Modo Campaña, Guerra Territorial e IA Rival

1. **4 Capítulos de Campaña**:
   - Capítulo 1: Consolidación Regional y Solvencia.
   - Capítulo 2: La Ofensiva del Valle de Sula y Disputa a Banpaís.
   - Capítulo 3: Batalla Nacional por el Podio (BAC & Ficohsa).
   - Capítulo 4: Hegemonía Financiera y Trono a Banco Atlántida.
2. **Guerra Bancaria por Departamento**: Disputa territorial en Cortés, Francisco Morazán, Atlántida, Islas de la Bahía y Occidente.
3. **Contraataques de la IA Competidora**: Eventos procedurales mensuales (alzas agresivas de tasas pasivas de Atlántida, guerras de cashback de Ficohsa, despliegue de TPVs de BAC).

---

## 5. Árbol Tecnológico Modular de 4 Ramas (Tech Tree)

- **Rama 1: Canales Digitales & Omnicanalidad** (Kioskos Smart ATM $\rightarrow$ App Móvil con Biometría $\rightarrow$ Open Banking API).
- **Rama 2: Motor de Scoring & Decisión de Crédito** (Buró Predictivo Equifax $\rightarrow$ Aprobación Inmediata en 3 Segundos $\rightarrow$ Algoritmo CNBS AI).
- **Rama 3: Eficiencia Operativa & Reducción de OPEX** (Digitalización de Expedientes $\rightarrow$ Conciliación Automática ACH $\rightarrow$ RPA Back-Office).
- **Rama 4: ALM & Tesorería Sofisticada** (Monitor Algorítmico BCH $\rightarrow$ Mesa Cambiaria Spot Automatizada $\rightarrow$ Emisión Bonos Tier 2).

---

## 6. Arquitectura de Componentes & Estado

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ARQUITECTURA DE VISTAS Y NAVEGACIÓN                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [HUD Superior]                                                                         │
│   ├── 1. Bancas & Clientes                                                             │
│   ├── 2. Back-to-Back & Garantías Líquidas (Revolvente 90%-95% sin cuota fija)         │
│   ├── 3. Depósitos DPF (Retención SAR 10%)                                             │
│   ├── 4. Cuentas Vista & ACH Pronto (CEPROBAN L. 20)                                   │
│   ├── 5. Rankings & League Tables (Consumo, Tarjetas, Private Bank J.P. Morgan)       │
│   ├── 6. Campaña & Misiones (4 Capítulos con Recompensas)                              │
│   ├── 7. Guerra de Bancos & Territorio (5 Rivales e IA)                                │
│   ├── 8. Sindicados & Fideicomisos (Préstamos Corporativos)                            │
│   ├── 9. Árbol Tecnológico & OPEX (4 Ramas)                                            │
│   └── 10. Tesorería & ALCO (BCH 12%)                                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Componentes a Crear / Actualizar:
- `src/components/BackToBackLendingTab.tsx`: Actualizado para soportar línea revolvente sin cuota fija en tarjeta garantizada, y préstamo amortizable con cuota nivelada en préstamo.
- `src/components/BankRankingsLeagueTab.tsx`: Tablero de rankings nacionales estilo Wall Street / CNBS para Tarjetas, Consumo, Banca Privada (AUM) y Solvencia.
- `src/components/CampaignMissionsTab.tsx`: Tablero de campaña por capítulos, misiones activas y cobro de recompensas.
- `src/components/CompetitorArenaTab.tsx`: Guerra territorial por departamento, robo de cartera y feed de contraataques de la IA.
- `src/components/SyndicatedLendingTab.tsx`: Módulo de sindicación corporativa y comisiones fiduciarias.
- `src/components/BankTechTreeTab.tsx`: Visualizador interactivo de las 4 ramas del árbol tecnológico.

---

## 7. Plan de Verificación & Pruebas Automatizadas

1. **Pruebas de Tarjeta Garantizada Revolvente (`tests/backToBackRevolving.test.ts`)**:
   - Tarjeta garantizada asigna cupo al 90%-95% del DPF.
   - `monthlyQuotaHNL` es 0 o pago mínimo del 5% del saldo consumido (no cuota francesa amortizable).
   - Desgravamen automático del DPF colateral si el saldo de la tarjeta se liquida al 100%.
2. **Pruebas de Rankings y Tablas de Liga (`tests/leagueTablesRankings.test.ts`)**:
   - Cálculo exacto de posiciones en las 4 tablas de liga (Tarjetas, Consumo, Banca Privada AUM, Solvencia).
   - Actualización dinámica al ganar cuota de mercado mediante robo de cartera.
3. **Pruebas de Sindicación y Comisiones J.P. Morgan Style**:
   - Estructuración de préstamo sindicado con distribución de participaciones y cobro de comisión de *Lead Arranger*.
4. **Pruebas de Campaña y Árbol Tecnológico**:
   - Verificación de avance entre capítulos y reducción de OPEX del árbol tecnológico.
5. **Compilación y Linteo**:
   - `npm test`: 100% pruebas aprobadas.
   - `lint_applet`: Cero errores de tipos.
   - `compile_applet`: Compilación exitosa para producción en Vite.
