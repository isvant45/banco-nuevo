# Plan Maestro: Simulador Macroeconómico, Empresarial y Bancario 360°

Transformación de **banco-nuevo** en un simulador económico de alta fidelidad basado en cuatro fases interconectadas: **Arquitectura Macroeconómica y Banco Central**, **Gestión Microeconómica del Empresario (OPEX/CAPEX/Supply Chain)**, **Gestión de Riesgo y Liquidez del Banquero (Encaje Legal/Bank Runs/Embargos)** y la **Mesa de Negociación Interactiva (Smart Contracts & Dashboards)**, completamente integrado dentro del Escritorio Retro Windows con cambio dinámico de rol.

---

## Decisiones Confirmadas con el Usuario

> [!IMPORTANT]
> Decisiones de diseño y producto acordadas en la fase de clarificación:
> - **Ritmo de Simulación**: Turnos diarios con cierres de jornada, reportes macroeconómicos mensuales automáticos y alertas de liquidez inmediatas en caso de tensión financiera.
> - **Experiencia de Juego**: Modo dual conmutable en tiempo real entre rol **Empresario** y **Banquero** desde la barra de tareas y escritorio retro, permitiendo ver las dos caras de la misma transacción económica.
> - **Visualización Macroeconómica**: Nueva ventana dedicada en el escritorio retro: **«🏛️ Banco Central & Macroeconomía»** con indicadores vivos de Tasa de Referencia (Prime Rate), Ciclo Económico (Expansión, Estancamiento, Recesión, Crisis), Tasa de Inflación y Reservas Internacionales.

---

## 1. Visión General del Sistema y Reglas Económicas

El simulador se apoya en un motor central autoritativo (`src/game/macroEconomyEngine.ts`) que orquesta el ecosistema macroeconómico y gobierna las interacciones entre el Empresario y el Banquero:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BANCO CENTRAL (IA & REGULADOR)                      │
│   • Tasa Prime (2% - 15%)      • Encaje Legal Obligatorio (20%)        │
│   • Ciclo Económico Dinámico    • Línea de Rescate de Liquidez Punitiva │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Tasa base e inflación          │ Encaje y rescate
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       MÓDULO DEL EMPRESARIO          │  │     MÓDULO DEL BANQUERO      │
│ • OPEX: Nómina, alquiler, servicios  │  │ • Depósitos de ahorristas    │
│ • CAPEX: Maquinaria, sucursales      │  │ • Bóveda y Encaje Legal 20%  │
│ • Credit Score dinámico (DTI/Mora)   │  │ • Auditoría Due Diligence    │
│ • Cadena de Suministro e inventario  │  │ • Clasificación de Mora      │
│ • Riesgo de quiebra por liquidez     │  │ • Riesgo de Bank Run (Pánico)│
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    └──────────────► ◄───────────────────┘
                             MESA DE NEGOCIACIÓN
                         (Smart Contract Interactivo)
                     • Monto, Plazo, Tasa Negociada
                     • Periodo de Gracia • Garantías 80%
                     • Firma bilateral del contrato
```

---

## 2. Desglose Detallado de las 4 Fases de Implementación

### Fase 1: Arquitectura Macroeconómica (El Motor del Juego)
- **Tasa de Referencia (Prime Rate / TPM)**:
  - Generada y ajustada por el Banco Central mensualmente según la inflación y el ciclo (rango 2.0% – 15.0%).
  - Influye en el costo del dinero para el Banquero (tasas pasivas a ahorristas y tasas activas de préstamos) y la carga financiera del Empresario.
- **Mecánica de Rescate Punitivo de Liquidez**:
  - Si la bóveda del Banquero cae por debajo del 0% o incumple el encaje legal durante retiros masivos, el Banco Central inyecta un crédito de salvamento obligatorio a una tasa punitiva (`Prime Rate + 10.0%`).
  - La penalización se debita automáticamente de las ganancias del Banquero.
- **Ciclos Económicos Dinámicos**:
  - 4 estados: `EXPANSIÓN`, `ESTANCAMIENTO`, `RECESIÓN` y `CRISIS`.
  - Transiciones estocásticas calibradas por turno mensual.
  - **Efectos en Recesión/Crisis**: Demanda y ventas del Empresario caen (-25% a -40%), el riesgo de impago aumenta y el índice de desconfianza de los ahorristas se dispara.
  - **Efectos en Expansión**: Las ventas aumentan (+15% a +35%), pero la inflación sube, incrementando el OPEX y el costo de insumos en inventario.

### Fase 2: Módulo del Empresario (Gestión Microeconómica)
- **Desglose Estricto OPEX vs. CAPEX**:
  - **OPEX**: Nómina de colaboradores, alquiler de locales, servicios públicos y mantenimiento operativo mensual.
  - **CAPEX**: Adquisición de maquinaria industrial, apertura de sucursales comerciales e infraestructura con depreciación mensual acumulada y vida útil.
  - **Control de Flujo de Caja**: Alerta de liquidez crítica si las reservas líquidas no cubren al menos 15 días de OPEX.
- **Motor de Calificación Crediticia (Credit Score Algorítmico)**:
  - Algoritmo de 300 a 850 puntos basado en:
    1. Historial de puntualidad de pagos (40%).
    2. Ratio de Endeudamiento vs. Ingresos Brutos (DTI - Debt to Income) (35%).
    3. Solvencia patrimonial y garantías reales libres de gravamen (15%).
    4. Antigüedad y reputación comercial (10%).
  - Puntuaciones altas (>750) otorgan descuentos en tasas de interés bancarias.
- **Cadena de Suministro y Shocks de Costos**:
  - Compra de materia prima e insumos que se transforman en inventario vendible.
  - Si un shock macroeconómico encarece los suministros (+20%), el empresario puede elegir en UI: *Absorber el sobrecosto reduciendo margen* o *Trasladarlo al precio final arriesgando volumen de clientes*.

### Fase 3: Módulo del Banquero (Gestión de Riesgo y Liquidez)
- **Simulación de Ahorristas y Encaje Legal (20%)**:
  - Depósitos de ciudadanos y empresas locales que representan pasivos del banco.
  - Exigencia regulatoria del 20% inmovilizado en cuenta de encaje del Banco Central.
  - La bóveda operativa solo puede prestar el 80% restante de los depósitos captados.
- **Riesgo de Pánico Bancario (*Bank Run*)**:
  - Modelado en función del ciclo económico, la tasa pasiva ofrecida y el índice de solvencia del banco.
  - Si el banco entra en estrés de liquidez, los depositantes inician retiros masivos.
- **Auditoría de Crédito y Dossier de Due Diligence**:
  - Ventana interactiva donde el Banquero evalúa solicitudes de crédito con:
    - Estado de resultados (P&L) y flujo de caja del solicitante.
    - Credit Score y nivel de endeudamiento actual.
    - Garantías hipotecarias/prendarias ofrecidas (con aforo del 75%-80%).
    - Opciones de acción: **Aprobar Solicitud**, **Denegar por Riesgo**, o **Abrir Mesa de Negociación**.
- **Gestión de Cartera en Mora y Embargos**:
  - Estados: `VIGENTE` -> `MORA TEMPRANA (1 periodo)` -> `CARTERA VENCIDA (2 periodos)` -> `JUDICIAL (3 periodos)`.
  - Acción judicial de **Ejecutar Garantía / Embargo**: Confisca el bien o maquinaria en garantía, lo liquida en remate público al 60% de su valor comercial y abona los fondos recuperados a la bóveda del banco.

### Fase 4: La Interfaz de Interacción (Smart Contracts y Dashboards)
- **Mesa de Negociación (Smart Contract Interactivo)**:
  - Modal/Ventana especializada donde interactúan el solicitante y el banco.
  - Sliders interactivos para:
    - *Monto del préstamo*.
    - *Plazo de amortización (meses)*.
    - *Tasa de interés pactada*.
    - *Periodo de gracia de capital (meses de solo intereses)*.
    - *Garantía vinculada exigida*.
  - Cálculo en tiempo real de la cuota mensual, cobertura de garantía y firma bilateral ("Firmar Contrato y Desembolsar").
- **Dashboards Financieros Avanzados**:
  - **Dashboard del Empresario**: Curva de ingresos vs. servicio de la deuda, semáforo de liquidez para OPEX y proyección de flujo neto.
  - **Dashboard del Banquero**: Distribución de cartera por nivel de riesgo (A, B, C, D, E), indicador de encaje legal versus liquidez disponible y margen de intermediación financiera (NIM).
- **Nueva Ventana Retro: «🏛️ Banco Central & Macroeconomía»**:
  - Visualización del velocímetro del ciclo económico, gráfica histórica de la tasa Prime e inflación, botón de solicitud de Facilidad de Liquidez de Emergencia y boletines oficiales de política monetaria.

---

## 3. Arquitectura Técnica y Modelo de Datos

```
src/
├── game/
│   ├── macroEconomyTypes.ts          # Tipos: Ciclo, Tasa Prime, Encaje, OPEX/CAPEX, Dossier, SmartContract
│   ├── macroEconomyEngine.ts         # Motor del Banco Central, ciclo, encaje legal, rescates y shocks
│   ├── creditScoreEngine.ts          # Algoritmo de scoring empresarial (DTI, historial, capacidad)
│   ├── retroSimTypes.ts              # Integración en DailySimulationState (macroState, bankRunRisk, etc.)
│   └── commercialBanksEngine.ts      # Conexión con cartera de préstamos, embargo y liquidación al 60%
└── components/
    └── retro/
        ├── CentralBankWindow.tsx      # Ventana retro del Banco Central, ciclo, tasas y liquidez
        ├── NegotiationTableModal.tsx  # Mesa de negociación / Smart Contract con sliders interactivos
        ├── DueDiligenceModal.tsx      # Dossier de auditoría crediticia del Banquero
        ├── RetroDesktop.tsx           # Selector dual de rol (Empresario / Banquero), iconos y ventanas
        └── RetroTaskbar.tsx           # Ticker con el ciclo macroeconómico actual e icono del Banco Central
```

### Entidades y Estados Clave
- `IMacroEconomyState`:
  - `cycleState`: `'EXPANSION' | 'STAGNATION' | 'RECESSION' | 'CRISIS'`
  - `primeRatePct`: number (ej. 6.5%)
  - `inflationRatePct`: number (ej. 4.2%)
  - `legalReservePct`: number (20.0%)
  - `centralBankBailoutRatePct`: number (`primeRatePct + 10.0%`)
  - `activeBailoutDebtHNL`: number
  - `marketShockEvent`: string | null
- `IOpexCapexBreakdown`:
  - `monthlyWagesHNL`, `monthlyRentHNL`, `monthlyUtilitiesHNL`
  - `machineryDepreciationMonthlyHNL`, `accumulatedDepreciationHNL`
  - `daysOfCashRunway`: number
- `ISmartLoanContract`:
  - `contractId`, `bankId`, `borrowerName`, `amountHNL`, `interestRateAnnual`, `gracePeriodMonths`, `termMonths`, `collateralId`, `status: 'OFFERED' | 'SIGNED' | 'REJECTED'`

---

## 4. Plan de Ejecución por Pasos

1. **Paso 1: Motor Macroeconómico y Tipos (`macroEconomyTypes.ts` y `macroEconomyEngine.ts`)**:
   - Crear las definiciones de datos y la lógica de fluctuación de tasas, ciclo económico, shocks y rescates punitivos del Banco Central.
   - Enlazar el cálculo del encaje legal (20%) y el simulador de desconfianza de ahorristas (*Bank Run*).
2. **Paso 2: Motor de Credit Score y OPEX/CAPEX del Empresario (`creditScoreEngine.ts`)**:
   - Programar el cálculo de score de 300 a 850 puntos.
   - Integrar la depreciación mensual de maquinarias e infraestructura y la evaluación de cobertura de nómina/servicios.
3. **Paso 3: Lógica de Cartera Bancaria, Auditoría y Embargo al 60%**:
   - Actualizar `commercialBanksEngine.ts` con transiciones de mora (`VIGENTE` -> `MORA` -> `VENCIDO` -> `JUDICIAL`).
   - Implementar la función de embargo que liquida garantías al 60% en remate para restituir liquidez a la bóveda.
4. **Paso 4: Componentes de UI Retro**:
   - Crear `CentralBankWindow.tsx` con widgets de aguja del ciclo económico, tasas de interés, inflación y solicitudes de liquidez.
   - Crear `NegotiationTableModal.tsx` (Mesa de negociación con sliders de tasa, periodo de gracia y garantía).
   - Crear `DueDiligenceModal.tsx` para el rol de Banquero.
5. **Paso 5: Conmutador de Rol Dual y Cableado en `RetroDesktop.tsx`**:
   - Añadir el botón conmutador rápido de rol en la barra de tareas (*Empresario* ⇄ *Banquero*).
   - Agregar el icono **«🏛️ Banco Central»** y registrar la ventana en el gestor de ventanas retro.
6. **Paso 6: Verificación y Pruebas**:
   - Compilación completa con `compile_applet` y verificación estricta de tipos con `lint_applet` (`tsc --noEmit`).
   - Pruebas unitarias para corroborar la estabilidad matemática del ciclo y el encaje legal.
