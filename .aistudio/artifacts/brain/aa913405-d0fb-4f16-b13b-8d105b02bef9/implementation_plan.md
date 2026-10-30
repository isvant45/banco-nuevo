# Rediseño Integral de Arquitectura y Core Bancario: Terminal Bloomberg Profesional & Fusión en 5 Estaciones

Plan de modernización estructural y limpieza de código obsoleto para **Áureo Bank**. Transforma la interfaz dispersa de 20 pestañas horizontales en un **Terminal Bancario Unificado de Alta Densidad** (estilo Bloomberg Terminal / J.P. Morgan Executive Suite) organizado en **5 Estaciones Centrales de Operaciones**, combinando simulación financiera en tiempo real, competencia territorial de mercado y gestión regulatoria BCH / CNBS.

---

## Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> **Decisiones Confirmadas en la Fase 1:**
> - **Estilo Visual & Arquitectura:** Enfoque analítico profesional estilo **Bloomberg Terminal** y Core Bancario de alta densidad informativa, con tipografía monoespaciada tabular (`tabular-nums`), sin etiquetas tipo píldora estáticas y con contrastes de grado institucional.
> - **Depuración de Módulos Obsoletos:** Se eliminan las listas fragmentadas de más de 20 sub-pestañas horizontales y módulos redundantes de micro-características para fusionarlos en **5 Estaciones Centrales de Mando**.
> - **Experiencia Central de Juego:** Modo híbrido que integra **gestión patrimonial libre en tiempo real** (simulador económico reactivo con auto-timer) y **modo competitivo multilateral** (League Tables en 4 categorías, Guerra Territorial departamental y Árbol Tecnológico).

---

## Análisis de Módulos Obsoletos vs. Nuevas Estaciones Unificadas

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MAPA DE DEPURACIÓN, FUSIÓN Y CONSOLIDACIÓN ESTRUCTURAL                         │
├───────────────────────────────────────────────────┬────────────────────────────────────────────────────┤
│ ESTRUCTURA ANTERIOR DISPERSA (20 PESTAÑAS)        │ NUEVA ARQUITECTURA UNIFICADA (5 ESTACIONES BLOOMBERG)│
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ • CampaignMissionsTab                             │ 1. TERMINAL EJECUTIVO & MERCADO COMPETITIVO        │
│ • BankRankingsLeagueTab                           │    (TerminalCommandStation.tsx)                    │
│ • CompetitorArenaTab                              │    - Ticker BCH en vivo y cockpit institucional    │
│ • OverviewDashboard                               │    - League Tables (Tarjetas, Consumo, AUM, CAR)   │
│                                                   │    - Conquista territorial y contraataques IA      │
│                                                   │    - Campaña y metas por capítulos I a IV          │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ • TermDepositsTab (DPF)                           │ 2. CORE BANCARIO & PRODUCTOS INTEGRADOS            │
│ • BackToBackLendingTab (Créditos/Tarjetas B2B)    │    (CoreBankingStation.tsx)                        │
│ • DemandDepositsTab (Cuentas Vista/ACH)           │    - Captación DPF (certificados con retención SAR)│
│ • CreditOriginationTab (Asesores hasta L. 50M)    │    - Back-to-Back (Tarjetas revolventes cupo 90-95%│
│ • BankingDivisionsTab                             │      sin cuota francesa y pago mínimo del 5%)      │
│ • PosAcquiringView & ClearingAndPayrollTab        │    - Cuentas corrientes, cheques y ACH CEPROBAN   │
│                                                   │    - Bandeja de originación crediticia y nóminas   │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ • BchMoneyDeskView                                │ 3. MESA DE DINERO, TESORERÍA ALCO & SINDICADOS     │
│ • TreasuryAndAlmTab / TreasuryMarketTab           │    (TreasuryAlmStation.tsx)                        │
│ • CorporateTradeTab                               │    - Curva de rendimientos soberana BCH (7 a 364d) │
│ • FxAndForwardsModal                              │    - Encaje Legal BCH 12% con auditoría de buffer  │
│ • SyndicatedLendingTab                            │    - Mercado interbancario call & repos de liquidez│
│                                                   │    - Mesa FX y coberturas cambiarias forwards      │
│                                                   │    - Créditos sindicados corporativos Lead Arranger│
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ • CreditRiskDashboard                             │ 4. RIESGOS CNBS, AML UIF & GOBIERNO CORPORATIVO    │
│ • AmlFraudComplianceHub                           │    (RiskComplianceStation.tsx)                     │
│ • ExecutiveDilemmasModal                          │    - Matriz de provisiones y categorías deudor I-V │
│ • DividendRankingDashboard                        │    - Prevención de lavado AML (pitufeo, OFAC, ROS) │
│ • PolicySandboxPanel                              │    - Dilemas éticos y crisis de Directorio         │
│                                                   │    - Sandbox fiscal SAR y política de dividendos   │
├───────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│ • BankTechTreeTab                                 │ 5. ARQUITECTURA TECNOLÓGICA & EFICIENCIA OPEX      │
│ • AdvancedOperationsHub (24 mejoras dispersas)    │    (TechModernizationStation.tsx)                  │
│ • ProgramsSuite20View (20 programas dispersos)    │    - Árbol tecnológico unificado de 4 ramas        │
│ • OperationsAndEfficiencyTab                      │    - Inversión CAPEX y ahorro permanente en OPEX   │
│ • BankingInnovationsTab                           │    - Sustituye listas duplicadas de mejoras        │
└───────────────────────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 1. Visión General del Producto y Valor para el Usuario

El nuevo simulador redefine la experiencia del jugador:
- **Claridad Operativa Inmediata:** Elimina la saturación cognitiva del menú anterior de 20 botones horizontales con desplazamiento incómodo. El usuario ahora interactúa con un panel de control coherente con acceso directo por teclado (`Alt+1` a `Alt+5`).
- **Simulación Bancaria Fiel a las Américas:** Preserva y potencia todas las reglas contables reales: depósitos a plazo pignorados (DPF), créditos Back-to-Back (donde las tarjetas de crédito garantizadas son revolventes, **sin cuota fija mensual**, con cobro de pago mínimo del 5% del saldo dispuesto y tasa efectiva del margen sobre DPF), encaje legal obligatorio del BCH del 12%, retención tributaria SAR del 10% y comisiones de estructuración (*Arranger Fees*) de créditos sindicados.
- **Rivalidad Dinámica Permanente:** Las decisiones del jugador impactan de inmediato su posición frente a **Banco Atlántida, Banco Ficohsa, BAC Credomatic, Banpaís y Banco de Occidente** en rankings auditados de tarjetas, préstamos personales, banca privada y solvencia patrimonial.

---

## 2. Experiencia de Usuario y Diseño Visual (Bloomberg Terminal)

### A. Dirección Estética y Paleta de Colores
- **Atmósfera:** Terminal financiero profesional de grado institucional, oscuro, preciso y limpio.
- **Colores Principales (Tokens Tailwind):**
  - Fondo Base: `bg-slate-950` (`#090D16`)
  - Superficies y Paneles: `bg-slate-900/90` con bordes sutiles `border-slate-800`
  - Acentos de Datos:
    - Oro / Ámbar (`text-amber-400`, `border-amber-500/40`): Indicadores macroeconómicos, marca Áureo y tasas clave.
    - Esmeralda (`text-emerald-400`): Crecimiento patrimonial, cumplimiento normativo y solvencia CAR.
    - Carmesí (`text-rose-400`): Mora NPL, alertas críticas AML y déficits de encaje legal.
    - Zafiro / Cian (`text-cyan-400`): Operaciones de tesorería, mercado interbancario y sindicaciones.

### B. Jerarquía Tipográfica y Cero Píldoras Estáticas
- **Números Tabulares Obligatorios:** Todas las cifras monetarias en Lempiras (`L.`), tasas porcentuales (`%`) y contadores usan `font-mono tabular-nums tracking-tight` para garantizar alineación vertical perfecta en balances y tablas.
- **Disciplina Anti-Píldoras:** Se erradican las etiquetas estáticas tipo pastilla o cápsulas de colores decorativas. Los metadatos se presentan como texto nítido con separadores tipográficos sutiles (`·`, `/`).
- **Navegación por Dock Superior Segmentado:** Barra de mando superior unificada con indicadores en vivo y 5 accesos directos principales.

---

## 3. Decisiones de Producto y Compensaciones (Trade-Offs)

1. **Eliminación de Sub-Pestañas Redundantes vs. Creación de Sub-Vistas Contextuales**:
   - *Decisión:* Las 20 pestañas del HUD se reducen a 5 estaciones principales. Dentro de cada estación, se utilizan sub-selectores segmentados contextuales (por ejemplo, en el Core Bancario: *DPF & Captación*, *Back-to-Back*, *Cuentas Vista & ACH*, *Originación & Asesores*).
   - *Razón:* Mantiene el 100% de la funcionalidad viva y accesible sin dispersar la atención en pantallas vacías o desconectadas.
2. **Consolidación de las "20 Características" y "24 Mejoras" en el Árbol Tecnológico**:
   - *Decisión:* Retirar las listas estáticas de texto repetitivo y fusionar sus efectos reales de eficiencia y margen en los 12 nodos de inversión del **Árbol Tecnológico Bancario**.
   - *Razón:* Las listas previas generaban sobrecarga informativa sin aportar interacción de juego significativa. El Árbol Tecnológico ofrece progresión visible con balance de CAPEX vs. ahorro de OPEX.
3. **Tarjeta Garantizada Back-to-Back como Línea Revolvente**:
   - *Decisión:* Confirmar de forma inamovible que la tarjeta de crédito garantizada con DPF **no tiene cuota fija mensual**. Su cupo es del 90% al 95% del DPF; el pago mínimo es del 5% del saldo utilizado y devenga intereses solo sobre el financiamiento activo.

---

## 4. Arquitectura Técnica y Estrategia de Datos

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DEL SISTEMA: ESTACIONES BLOOMBERG                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │     TopExecutiveHUD.tsx     │
                     │  (Dock de Mando 5 Estaciones│
                     │   + Live Ticker BCH / CAR)  │
                     └──────────────┬──────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│   ESTACIÓN 1: MERCADO  │  │   ESTACIÓN 2: CORE     │  │   ESTACIÓN 3: MESA     │
│   Y LEAGUE TABLES      │  │   BANCARIO INTEGRADO   │  │   TESORERÍA & SINDIC.  │
│                        │  │                        │  │                        │
│ • League Tables (4 cat)│  │ • DPFs pignorados      │  │ • Curva BCH 7-364 días │
│ • Arena Territorial    │  │ • Back-to-Back revolv. │  │ • Encaje Legal 12%     │
│ • Misiones de Campaña  │  │ • Cuentas Vista & ACH  │  │ • Call & Repos interb. │
│ • Ticker Macro BCH     │  │ • Asesores de Crédito  │  │ • Créditos Sindicados  │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
    ┌───────────────────────┴───────────────────────┐
    │                                               │
    ▼                                               ▼
┌────────────────────────┐              ┌────────────────────────┐
│   ESTACIÓN 4: RIESGOS  │              │   ESTACIÓN 5: TECH     │
│   CNBS & CUMPLIMIENTO  │              │   Y EFICIENCIA OPEX    │
│                        │              │                        │
│ • Provisiones CNBS I-V │              │ • Árbol Tech 4 ramas   │
│ • Alertas AML y ROS    │              │ • CAPEX vs Ahorro OPEX │
│ • Crisis de Directorio │              │ • Automatización Core  │
│ • Sandbox SAR Fiscal   │              │ • Respaldo y Auditoría │
└────────────────────────┘              └────────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │    economyEngine.ts / State │
                     │  (Devengo Contable Mensual, │
                     │   Persistencia & Validación)│
                     └─────────────────────────────┘
```

### Plan de Componentes y Refactorización:
1. **`src/components/TopExecutiveHUD.tsx`**:
   - Reemplazar la barra horizontal de 20 botones por el **Bloomberg Command Dock** de 5 Estaciones (`terminal_market`, `core_banking`, `treasury_desk`, `risk_compliance`, `tech_modernization`).
   - Mantener accesos rápidos para Estados Financieros, Cierre Mensual, Modo de Avance Automático y Alertas en Vivo.
2. **`src/components/stations/` (Nuevas Estaciones Modulares)**:
   - `TerminalMarketStation.tsx`: Unifica League Tables (Tarjetas, Consumo, Banca Privada, Solvencia), Guerra Territorial departamental y Misiones de Campaña.
   - `CoreBankingStation.tsx`: Unifica DPFs, Back-to-Back revolvente sin cuota francesa, Cuentas Vista, ACH Pronto, Originación de Asesores y Planillas.
   - `TreasuryDeskStation.tsx`: Unifica Mesa de Dinero BCH, Encaje Legal, Curva Soberana, Mercado Interbancario, Divisas FX y Créditos Sindicados.
   - `RiskComplianceStation.tsx`: Unifica Matriz de Provisiones CNBS, Alertas AML UIF, Dilemas Ejecutivos de Directorio y Sandbox de Políticas.
   - `TechModernizationStation.tsx`: Árbol tecnológico interactivo de 4 ramas con reducción permanente de OPEX y optimización de ratios.
3. **`src/App.tsx`**:
   - Enlazar la navegación del nuevo Command Dock a las 5 estaciones.
   - Mantener todos los manejadores de estado ya implementados y validados por las 56 pruebas automatizadas (`npm test`).
4. **Verificación**:
   - Ejecución de `npm test` garantizando 56/56 pruebas exitosas.
   - Verificación de tipos `tsc --noEmit` y compilación de producción con `compile_applet`.

---

## 5. Plan de Verificación y Criterios de Aceptación

- [x] **Cero Pestañas Rotas o Sobrecargadas:** El usuario navega entre 5 estaciones limpias y bien estructuradas sin desplazamiento horizontal infinito.
- [x] **Tarjeta Garantizada Revolvente Verificada:** Se mantiene comprobado que el límite es del 90%-95% del DPF, la cuota francesa es de L. 0.00 y el pago mínimo es del 5% del saldo consumido.
- [x] **Rankings y Dinamismo Competitivo Operativo:** Los 6 bancos compiten en tiempo real en los 4 tableros de liga con métricas auditables.
- [x] **Preservación de Estado de Partida:** Compatible con partidas guardadas previas mediante los esquemas de restauración seguros en `savedState.ts`.
- [x] **Pruebas Automatizadas:** 100% de las pruebas unitarias pasan sin fallos.
