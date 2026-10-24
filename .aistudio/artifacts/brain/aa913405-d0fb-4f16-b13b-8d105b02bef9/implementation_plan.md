# Panel Ejecutivo de Ranking Histórico de Dividendos y Sandbox Macrofinanciero & Scoring CNBS en Tiempo Real

Sistema ejecutivo para la Junta Directiva de Áureo Bank que incorpora un **Ranking Histórico de Dividendos a 10 Años Fiscales** (2017–2026) con gráficos de barras analíticos y un **Sandbox Central de Configuración Financiera, Fiscal y de Scoring Crediticio** con reactividad instantánea en tiempo real según la normativa del BCH, CNBS y el SAR de Honduras.

---

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Decisiones confirmadas durante la fase interactiva de alineación:
> 
> - **Marco Regulatorio y Jurisdicción**: Normativa estricta de la República de Honduras (Banco Central de Honduras - BCH, Comisión Nacional de Bancos y Seguros - CNBS, Servicio de Administración de Rentas - SAR, expresado en Lempiras HNL y divisa USD).
> - **Arquitectura de Interacción**: Sandbox interactivo central con deslizadores (sliders) numéricos y campos en tiempo real donde cualquier ajuste recalculó inmediatamente el balance general, estado de resultados, solvencia de capital (CAR/IAC), encaje legal y scoring de clientes en toda la aplicación.
> - **Profundidad del Historial de Dividendos**: Desglose analítico completo de Payout Ratio (%), Retención para Capital Primario Tier 1 (%), Dividendo por Acción (DPS en L.), Dividend Yield y comparativa de los últimos 10 años fiscales (2017 a 2026).

---

## 1. Visión General y Capacidades Centrales

### 1.1 Ranking Histórico de Dividendos (Últimos 10 Años Fiscales: 2017–2026)
- **Visualización en Gráficos de Barras**: Componente SVG de alta precisión que ilustra la evolución anual de Utilidad Neta Contable vs. Dividendos Pagados en Efectivo vs. Utilidades Capitalizadas en Reserva Legal y Tier 1.
- **Métricas Clave por Ejercicio Fiscal**:
  - Utilidad Neta Auditada por la CNBS.
  - Tasa de Distribución (*Payout Ratio* %): Política histórica del 40% al 65%.
  - Retención Estratégica Tier 1: Monto acreditado a capital complementario y reservas patrimoniales.
  - Dividendo por Acción (DPS) y Rendimiento por Dividendo (*Dividend Yield* %).
  - Ranking de Rendimiento Anual: Ordenamiento interactivo por año más rentable, mayor dividendo desembolsado y mayor fortalecimiento de solvencia.
- **Simulador Predictivo para el Año en Curso (2026)**: El usuario puede modificar la política de dividendos del ejercicio activo y ver en tiempo real cómo impacta la proyección del ratio CAR de cierre.

### 1.2 Sandbox Central de Configuración Financiera, Fiscal y Scoring en Tiempo Real
Un centro de comando paramétrico donde cualquier ajuste de variables impacta simultáneamente a todos los submódulos bancarios:

1. **Parámetros Macroeconómicos & BCH**:
   - Tasa de Política Monetaria (TPM BCH, 3.00% – 12.00%).
   - Tasa de Inflación Interanual del IPC (2.0% – 14.0%).
   - Tipo de Cambio de Referencia USD/HNL (L. 20.00 – L. 32.00).
   - Tasa de Encaje Legal Requerido (8.0% – 18.0%, estándar actual 12.0%).
2. **Parámetros Fiscales & SAR (Régimen Bancario Hondureño)**:
   - Impuesto Sobre la Renta Bancario (ISR general 25.0%).
   - Aportación Solidaria Temporal (5.0% aplicable al exceso de renta gravable).
   - Retención en la fuente por dividendos (10.0% según Código Tributario).
   - Deducción máxima de reservas de saneamiento IFRS 9 / CNBS.
3. **Parámetros de Intermediación y Eficiencia Financiera**:
   - Spread objetivo de intermediación (Margen Activo - Pasivo).
   - Índice de Costo de Fondeo mayorista y minorista.
   - Meta de Coeficiente de Eficiencia Operativa (CIR %).
4. **Modelo Paramétrico de Score Crediticio CNBS (Resolución CNBS No. 284/2003)**:
   - Ponderación de Historial de Pago y Comportamiento Crediticio (35% – 50%).
   - Límite de Relación Deuda a Ingreso (DTI máximo permitido, 30% – 55%).
   - Cobertura de Garantías Reales e Hipotecarias (LTV máximo, 50% – 90%).
   - Umbral de Score Buró (Equifax / TransUnion, 300 a 850 puntos).
   - Reclasificación automática e inmediata de la cartera y recálculo de provisiones crediticias.

---

## 2. Experiencia de Usuario y Diseño Visual

### 2.1 Estética y Sistema de Diseño
- **Dirección Visual**: Estética ejecutiva de banca corporativa premium basada en el tema oscuro de Áureo Bank (`#080d1a` / `#0b1329`), superficies con bordes sutiles en `slate-800`, acentos en dorado institucional (`amber-400`/`amber-500`), azul financiero (`blue-400`/`indigo-500`) y verde fiscal (`emerald-400`).
- **Tipografía y Rigor Tabular**: Títulos ejecutivos en `Outfit`, interfaz de lectura en `Plus Jakarta Sans`, y todas las cifras monetarias, porcentajes, ratios y sliders en `JetBrains Mono` con soporte `tabular-nums` para evitar saltos de línea y desalineaciones.
- **Disciplina Anti-Slop**: Cero píldoras decorativas estáticas; metadata limpia separada por interpunto (`·`); gráficos vectoriales SVG limpios con tooltips interactivos al posar el cursor; sliders de rango ergonómicos con badges numéricos editables.

### 2.2 Flujo de Usuario y Vistas
1. **Pestaña 'Gobierno Corporativo & Dividendos'**:
   - Header con indicadores macro: Total Dividendos Distribuidos (10 años), Tasa Promedio de Payout, Capital Tier 1 Acumulado.
   - Gráfico de Barras Histórico (2017–2026) con selector de métrica (Monto Lempiras vs. Payout Ratio % vs. Rendimiento por Acción).
   - Tabla comparativa de los 10 ejercicios con opción de exportación / vista ejecutiva.
   - Simulador de propuesta de dividendos para la Asamblea de Accionistas 2026.
2. **Pestaña 'Sandbox Central de Políticas'**:
   - Panel de control en 4 cuadrantes (BCH / SAR Fiscal / ALCO Tesorería / Scoring CNBS).
   - Modificación con sliders interactivos: a medida que el usuario arrastra la perilla, una barra de impacto proyecta en vivo el `Δ Utilidad Neta`, `Δ Ratio CAR`, `Δ Encaje Requerido` y `Δ Provisiones Crediticias`.
   - Botón de restablecimiento rápido a "Normativa Oficial Vigente".

---

## 3. Decisiones Técnicas y de Arquitectura

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ESTADO CENTRAL REACTIVO                         │
│                           (GameState en App)                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Propagación instantánea
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Sandbox State │           │ Dividend Data │           │ Credit Scoring│
│  (BCH / SAR / │           │  (2017-2026   │           │    Engine     │
│   Tasas / LCR)│           │  Histórico)   │           │  (CNBS 284)   │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               MOTOR DE RECALCULO INSTANTÁNEO EN VIVO                   │
│   - Balance General, Depósitos, Cartera y Provisiones IFRS 9           │
│   - Coeficiente de Adecuación de Capital (CAR) & Encaje Legal BCH      │
│   - Impuesto ISR (25%) + Aportación Solidaria (5%)                     │
│   - Reclasificación y Tasas de Aprobación Crediticia                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 INTERFACES Y COMPONENTES VISUALES                      │
│   - DividendHistoryDashboard (Gráficos de Barras SVG 10 años)          │
│   - PolicySandboxPanel (Sliders interactivos en tiempo real)           │
│   - TopExecutiveHUD & Financials (Actualización inmediata en vivo)     │
└────────────────────────────────────────────────────────────────────────┘
```

- **Almacenamiento y Persistencia**: Integrado directamente en `GameState` mediante `savedState.ts`, garantizando compatibilidad con partidas anteriores y preservación de balances.
- **Gráficos SVG Nativos**: Sin dependencias pesadas de terceros para evitar incompatibilidades de versión con React 19, con renderizado nítido a 60fps, tooltips dinámicos y transiciones fluidas.
- **Cálculo Determinista de Impuestos**: Se modela el esquema fiscal bancario hondureño exacto:
  $$\text{Renta Neta Gravable} = \text{Utilidad Operativa} - \text{Gastos Deducibles} - \text{Gasto Provisiones CNBS}$$
  $$\text{ISR} = \text{Renta Neta Gravable} \times 25\%$$
  $$\text{Aportación Solidaria} = \max(0, \text{Renta Neta Gravable} - 1,000,000) \times 5\%$$
  $$\text{Utilidad Neta Disponible} = \text{Renta Neta Gravable} - \text{ISR} - \text{Aportación Solidaria}$$

---

## 4. Plan de Pruebas y Validación

1. **Pruebas Unitarias Automatizadas (`/tests/dividendsAndSandbox.test.ts`)**:
   - Carga e integridad del registro histórico de 10 años fiscales (2017 a 2026).
   - Consistencia matemática entre Utilidad Neta, Dividendos Pagados y Capitalización Tier 1.
   - Reacción en tiempo real del motor ante variaciones de TPM BCH, Encaje Legal, ISR y umbrales de Scoring.
   - Preservación de tipos finitos y no mutabilidad indebida tras avances de turno.
2. **Verificación Estática y Compilación**:
   - `lint_applet` ejecutando `tsc --noEmit` con 0 errores.
   - `compile_applet` validando build de producción con Vite.
