# Plan de Expansión Integral del Simulador Financiero Hondureño: Áureo Bank

Plan arquitectónico y funcional para transformar **Áureo Bank** en un simulador bancario y macroeconómico de nivel institucional, incorporando dinámicas mensuales automáticas, negociación de moras (I a V), mercado interbancario de carteras con competidores, edición y creación de comercios POS y planillas corporativas, autonomía del oficial de crédito (hasta L. 20M) vs. comité directivo (L. 21M+), bolsa de bonos y acciones fluctuante, red SWIFT global enriquecida, estados financieros normados por la CNBS, alertas en tiempo real, 4 dashboards especializados y el paquete completo de 10 innovaciones bancarias.

---

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Se han incorporado las elecciones directas del usuario para gobernar las nuevas dinámicas del simulador:
> - **Compra y Venta de Carteras Interbancarias**: Estructurado mediante un **Mercado Interbancario con Ofertas y Descuentos por Riesgo** (descuentos agresivos para mora V y primas sobre cartera sana).
> - **Autonomía Crediticia del Oficial**: Regida por **Filtro de Scoring y Capacidad de Pago con Dictamen Automático** para solicitudes hasta L. 20,000,000.00; las solicitudes de L. 21,000,000.00 en adelante se reservan al Presidente/Comité con dictamen y nota del oficial.
> - **Innovaciones Bancarias**: Se integran **todas las 10 innovaciones bancarias** sugeridas de manera armónica en los módulos del banco.

---

## 1. Visión General y Concepto Central

- **Propósito**: Proveer una experiencia ejecutiva de alta dirección bancaria hondureña, donde cada avance mensual refleja el impacto de la inflación, las resoluciones del BCH y las normas de la CNBS en balances, liquidez, carteras morosas, cotizaciones de títulos, convenios corporativos y transferencias internacionales.
- **Audiencia / Rol**: Presidente Ejecutivo y Junta Directiva de Áureo Bank, interactuando con oficiales de crédito, mesas de dinero, auditores de la CNBS y bancos competidores (Ficohsa, Atlántida, BAC, Banpaís, Occidente).
- **Valor Agregado**: Control granular y estratégico sobre activos, pasivos, riesgos y operaciones sin perder agilidad gracias a la automatización inteligente del oficial de crédito.

---

## 2. Experiencia de Usuario y Arquitectura Visual

### Flujos Principales
1. **Avance Mensual Dinámico**:
   - Al pulsar "Avanzar Mes", el motor actualiza la inflación, la TPM del BCH, las tasas pasivas y activas del sistema, la mora de clientes (Categorías I a V-Pérdida), las cotizaciones de bonos y acciones, los flujos de POS y planillas, las transferencias SWIFT y genera alertas dinámicas inmediatas.
2. **Gestión y Venta de Cartera en Atraso (L. 55.29M)**:
   - Panel interactivo para clasificar clientes en mora desde Cat I hasta Cat V-Pérdida.
   - Opciones con un clic: *Negociar con el Cliente* (reestructuración, condonación parcial de recargos, ampliación de plazo) o *Vender a Banco Rival* (venta con descuento a Ficohsa, Atlántida o fondo de recuperación).
3. **M&A y Mercado Interbancario de Carteras**:
   - Pestaña para adquirir paquetes de préstamos vigentes o carteras de depósitos ofertadas por competidores con primas o descuentos, inyectando o consumiendo liquidez.
4. **Comercios POS y Planillas Modificables**:
   - Tablas interactivas con botones "Editar" y "Agregar Empresa / Comercio".
   - Ajuste de saldos en cuenta, volumen de facturación, cantidad de terminales, empleados y nóminas.
   - Apertura garantizada de cuentas bancarias en la división correspondiente (PYME, Corporativa) vinculadas a los depósitos del banco.
5. **Autonomía de Aprobación Crediticia**:
   - Solicitudes $\le$ L. 20,000,000: Botón de resolución automática del Oficial de Crédito según scoring y DTI.
   - Solicitudes $\ge$ L. 21,000,000: Tarjetas destacadas de Comité Ejecutivo con la *Nota Oficial del Analista* (dictamen de garantías, patrimonio y recomendación) para decisión del jugador.
6. **Bolsa de Bonos y Acciones Dinámica**:
   - Cotizaciones mensuales fluctuantes basadas en la TPM y la inflación para Bonos BCH/SEFIN, Bonos Bancarios y Acciones de la BCV, con gráficos de tendencia y botones de Compra/Venta.
7. **Red SWIFT Global Ampliada**:
   - Cobertura de corresponsalías en EE.UU., Suiza, China, Reino Unido, España y Japón, con liquidación, filtros AML/OFAC y cobro de comisiones multidivisa (USD, EUR, GBP, CHF).
8. **Cuatro Dashboards Especializados**:
   - **Riesgos y Cartera CNBS**: Provisiones, coberturas, mora por tramo y categorías I a V.
   - **Créditos y Colocación**: Concentración, DTI promedio, cosechas y ticket promedio.
   - **Operaciones y Eficiencia**: Cost-to-Income, rendimiento de sucursales y ventanillas.
   - **Opiniones de Expertos**: Boletines con dictámenes del FMI, economistas locales y directores de la CNBS.
9. **Estados Financieros Normados**:
   - Balance General, Estado de Resultados y Estado de Flujo/Encaje detallados y certificados.

### Estilo Visual y Principios de Diseño
- **Paleta y Acabado**: Fondo oscuro neutro institucional (`#080d1a`, `#0b1329`, `#111c38`) con acentos en oro financiero y esmeralda de liquidez.
- **Tipografía**: Títulos limpios en `Outfit`, cuerpo legible en `Plus Jakarta Sans`, y métricas monetarias estrictamente tabulares en `JetBrains Mono` (`font-mono tabular-nums`).
- **Disciplina Anti-Slop**: Cero cápsulas flotantes decorativas, cero puntos verdes parpadeantes sin telemetría real, sin bordes asimétricos gruesos `border-l-4`. Jerarquía pura con divisores hairline y espaciado proporcional.

---

## 3. Decisiones de Producto y Arquitectura de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ÁUREO BANK CORE PLATFORM                        │
├────────────────────────────────┬───────────────────────────────────────┤
│    MOTOR MACROECONÓMICO BCH    │        ESTADOS FINANCIEROS CNBS       │
│  - TPM, Inflación, Encaje Legal│  - Balance General Detallado          │
│  - Tipo de Cambio HNL/USD      │  - Estado de Resultados Clasificado   │
│  - Subastas de Divisas         │  - Posición de Liquidez y Encaje      │
├────────────────────────────────┴───────────────────────────────────────┤
│                   SISTEMAS OPERATIVOS Y DE NEGOCIO                     │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────┐ │
│ │  MERCADO INTERBANCARIO   │ │   ORIGINACIÓN CRÉDITO    │ │ ADQUIR.  │ │
│ │  - Compra/Venta Carteras │ │  - Oficial (<= L. 20M)   │ │   POS    │ │
│ │  - Tasas y Primas M&A    │ │  - Comité (>= L. 21M)    │ │ & EDIC.  │ │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────┘ │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────┐ │
│ │   CARTERA MORA (I a V)   │ │   MERCADO DE VALORES     │ │ PLANILLA │ │
│ │  - L. 55.29M Gestionable │ │  - Bonos BCH, Corp, BCV  │ │ CORP.    │ │
│ │  - Negociación y Venta   │ │  - Precios y Yields Vivos│ │ & EDIC.  │ │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────┘ │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────┐ │
│ │    RED SWIFT GLOBAL      │ │  ALERTAS EN TIEMPO REAL  │ │ 10 INNO- │ │
│ │  - 6 Plazas Corresponsal │ │  - Encaje, Mora, Riesgo  │ │ VACIONES │ │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Paquete de las 10 Innovaciones Bancarias Integradas
1. **Mesa de Divisas (FX Trading & Subastas BCH)**: Compra/venta de divisas directas con spread cambiario y adjudicación de dólares del BCH.
2. **Auditorías Sorpresa de la CNBS**: Inspecciones reglamentarias con requerimientos de capital o certificaciones de cumplimiento.
3. **Mesa de Dinero Interbancario (Call / Overnight)**: Colocar o captar liquidez interbancaria a 24-48 horas con otros bancos para equilibrar encaje.
4. **Calificación de Riesgo Internacional (Fitch / Moody's)**: Calificación pública de solvencia (AAA a B-) que influye en costos de fondeo y captaciones.
5. **Centro de Negociación y Condonación de Deudas**: Modal especializado de dación en pago, refinanciamiento o quitas controladas para recuperar capital.
6. **Banca Digital & App Móvil Áureo**: Inversión en canales digitales con reducción progresiva de costos operativos y migración de clientes.
7. **Red Nacional de Remesas Familiares**: Alianzas con Western Union y MoneyGram para captar remesas directamente en depósitos bancarios.
8. **Simulador de Pruebas de Estrés (Stress Testing CNBS)**: Módulo de escenarios de crisis (devaluación, shock de tasas o sequía agroindustrial).
9. **Sindicación de Mega-Créditos de Infraestructura**: Participación en préstamos sindicados para proyectos de energía y carreteras con banca multilateral.
10. **Adquisición de Activos de Bancos en Liquidación**: Subastas especiales de sucursales y carteras con descuento de liquidación forzosa.

---

## 4. Estrategia de Implementación por Fases

### Fase 1: Expansión de Modelos y Tipos (`src/game/types.ts`)
- Añadir interfaces para:
  - Ofertas de Compra/Venta Interbancaria de Carteras.
  - Alertas Dinámicas del Banco con niveles de severidad (`critica`, `advertencia`, `informativa`).
  - Opiniones de Expertos Financieros.
  - Dictamen y Nota del Oficial para créditos de L. 21M+.
  - Módulos de las 10 innovaciones bancarias (Mesa de divisas, Stress Testing, Rating internacional, etc.).

### Fase 2: Motor Macroeconómico y de Actualización Mensual (`src/game/economyEngine.ts` y `initialState.ts`)
- Configurar la cartera inicial en mora por L. 55,294,191.00 en categorías I a V con nombres de clientes, montos y días de atraso reales.
- Dinámica mensual de actualización de inflación, TPM, tasas del sistema, precios de bonos/acciones y volumen de transacciones de POS/planillas.
- Lógica de evaluación automática del oficial de crédito ($\le$ 20M) y retención para comité ejecutivo ($\ge$ 21M).
- Lógica de negociación de mora (reestructuración con reducción de categoría y reactivación de pagos) y venta de cartera a bancos competidores.

### Fase 3: Modales de Creación y Edición (POS, Planillas y Negociación de Deudas)
- Modal para editar y agregar comercios POS (saldo en cuenta, ventas mensuales, cantidad de terminales POS).
- Modal para editar y agregar convenios de planillas corporativas (monto de nómina, empleados, banco correspondiente con cuenta garantizada).
- Modal interactivo de negociación de deudas y venta de cartera a competidores.

### Fase 4: Dashboards Especializados y Vistas Interactivas
- Componente de **Dashboard de Riesgos y Cartera CNBS** con desglose de provisiones de I a V y cartera de L. 55.29M.
- Componente de **Mercado Interbancario de Carteras (M&A)** con ofertas de compra y venta a competidores.
- Componente de **Mercado Bursátil Dinámico** para bonos y acciones fluctuantes.
- Componente de **Red SWIFT Global** con bancos de Europa, Asia y América.
- Componente de **Opiniones de Expertos y Boletines Regulatorios**.
- Componente de **Alertas Dinámicas en el HUD Principal**.
- Vista de **Innovaciones Bancarias y Mesa de Dinero / Divisas**.

### Fase 5: Verificación y Pruebas
- Verificar persistencia en `localStorage` con migración de estado sin roturas.
- Compilar la aplicación y validar con `lint_applet` y `compile_applet`.
- Asegurar cero advertencias TypeScript y rendimiento fluido.
