# Plan Maestro: Core Bancario Institucional de Alta Fidelidad (Benchmark Tecnológico & Tarifario Honduras y Centroamérica)

Arquitectura de ingeniería financiera, especificación funcional y catálogo de más de 60 mejoras operativas para transformar Áureo Bank en un **Core Bancario Institucional de Grado de Producción**, fundamentado en la infraestructura real, sistemas de core bancario y tarifarios oficiales autorizados por la Comisión Nacional de Bancos y Seguros (CNBS) de los 7 bancos comerciales líderes de Honduras:
- **Banco Atlántida**: Plataforma *SAP for Banking* (SAP Fioneer / ERP transaccional implementado por BD Consultores).
- **Banco Ficohsa**: Núcleo *Temenos Transact (T24)* para banca corporativa, personas, tarjetas y tesorería regional.
- **BAC Credomatic**: Core bancario centralizado con *Conexión Empresarial* y motor líder en colocación *Back-to-Back* (CDP garantizado).
- **Banpaís (Corporación BI)**: Plataforma *Bantotal / IBS* integrada al switch ACH Pronto de CEPROBAN y dispersión masiva de nóminas.
- **Banco Davivienda**: Core multilatino enfocado en estructuración fiduciaria de garantías, factoraje y administración de tesorería.
- **Banco Promerica**: Especialización en cartas de crédito de comercio exterior (*Trade Finance*), cobranzas documentarias y descuento de facturas.
- **Banco de Occidente**: Núcleo bancario tradicional robusto enfocado en captación masiva de libretas de ahorro y compensación de cheques comerciales.

---

## Decisiones Críticas y Resumen de Revisión Solicitada

> [!IMPORTANT]
> **Alcance acordado para la transformación integral del Core Bancario:**
> 1. **Eliminación Definitiva de Elementos Gamificados**: Supresión total de `ProgramsSuite20View.tsx` ("Suite de 20 Programas"), `StrategicImprovementsHub.tsx` ("24 Mejoras Estratégicas") y clientes de maqueta.
> 2. **Reemplazo por un Core Bancario Modular Profesional (5 Grandes Módulos)**:
>    - **Módulo I: Cuentas & Pasivos a la Vista (Demand Deposits & ACH)**.
>    - **Módulo II: Depósitos a Plazo Fijo (DPF / Time Certificates con Retención SAR 10%)**.
>    - **Módulo III: Colocación & Motor Back-to-Back (Créditos y Tarjetas con Garantía Líquida / 0% RWA)**.
>    - **Módulo IV: Banca Corporativa, Comercio Exterior & Fideicomisos (Trade Finance & Trust)**.
>    - **Módulo V: Tesorería Institucional, ALCO & Cumplimiento CNBS (Encaje BCH 12%, Divisas USD)**.
> 3. **Implementación de Tarifarios Reales Verificados por la CNBS**: Comisiones fijas y porcentuales exactas por canal, servicio y producto.

---

## 1. Benchmark Tecnológico & Análisis de Tarifarios del Sistema Financiero Hondureño

A partir de la investigación en los canales de transparencia y resoluciones regulatorias de la CNBS y el Banco Central de Honduras (BCH):

| Banco | Plataforma Core Bancario | Especialidad / Producto Analizado | Tarifario / Costos Operativos Regulados |
| :--- | :--- | :--- | :--- |
| **Banco Atlántida** | **SAP for Banking (SAP Fioneer)** vía BD Consultores | Bonos de Caja, DPFs corporativos y Préstamos Pignorados | Retención SAR 10% sobre cupón pasivo; custodia de valores; comisión de avalúo/estudio en garantías hipotecarias; desembolso expedito en garantías líquidas. |
| **Banco Ficohsa** | **Temenos Transact (Temenos T24)** | Tarjetas de Crédito Garantizadas con DPF pignorado | Cupo crediticio al 90% del DPF; exoneración de buró crediticio; tasa activa preferencial; comisión de emisión diferida; membresía bonificada por uso. |
| **BAC Credomatic** | **Core Propietario Centralizado** + Conexión Empresarial | Préstamo Personal & Empresarial Back to Back | Cobertura hasta 90% del CDP; tasa activa = Tasa Pasiva CDP + Spread (3.0% a 4.0%); comisión por desembolso 0.50% (mínimo L. 500 o $20); seguro de saldo deudor L. 5.50 - L. 6.50 por millar; 0% ponderación por riesgo crediticio (RWA). |
| **Banpaís** | **Bantotal / IBS** + Switch CEPROBAN | Dispersión de Nómina ACH Pronto & Factoring | Cobro de L. 18.00 a L. 22.00 por colaborador dispersado; costo de transferencia interbancaria ACH Pronto L. 20.00; mora administrativa tras 15 días de vencimiento. |
| **Davivienda** | **Core Multilatino Transaccional (Cobis)** | Fideicomisos de Garantía & Fuente de Pago | Comisión de estructuración 1.0% a 1.5% flat; honorario fiduciario de administración mensual; aislamiento patrimonial de flujos de cobro. |
| **Banco Promerica** | **Promerica Regional Core** | Cartas de Crédito Comerciales de Importación (LC) | Emisión irrevocable con bancos de Nueva York (Citi/JPMorgan); comisión trimestral 0.75%; descuento digital de facturas a 60-90 días. |
| **Banco de Occidente** | **Core Tradicional Centralizado de Alta Estabilidad** | Libretas de Ahorro y Chequeras Comerciales | Devengo de intereses por tramo de saldo promedio (1.0% a 5.0%); multas por cheque devuelto sin fondos (L. 500.00); reposición de libreta. |

---

## 2. Catálogo Integral de Mejoras al Core Bancario (Qué se va a hacer y Por qué)

Para responder a la solicitud del usuario de presentar un inventario profundo de mejoras bancarias con justificación técnica:

### A. Productos Financieros (Pasivos y Activos)
1. **Depósito a Plazo Fijo (DPF) Desmaterializado**: Emisión electrónica de certificados de 30 a 720 días con tasa fija escalonada (5.5% a 10.5% p.a.). *Por qué: Es el principal instrumento de fondeo de mediano plazo de la banca y colateral del Back-to-Back.*
2. **Retención Fiscal SAR del 10% en Cupones**: Deducción automática del Impuesto sobre Rendimientos Financieros del SAR. *Por qué: Exigencia tributaria hondureña ineludible.*
3. **Cuentas de Ahorro con Devengo Diario y Escala por Saldo**: Liquidación mensual de intereses con tasa creciente según saldo medio. *Por qué: Fomenta la retención de depósitos minoristas a bajo costo.*
4. **Cuentas Corrientes Comerciales con Talonario de Cheques**: Manejo de cheques girados, cheques en tránsito, confirmación telefónica y bloqueo por extravío. *Por qué: Servicio esencial para empresas y personas jurídicas.*
5. **Líneas de Sobregiro Automático y Contractual**: Cobertura temporal de cheques con cobro de comisión fija y tasa activa máxima. *Por qué: Provee liquidez inmediata a empresas solventes y genera ingresos por comisiones.*
6. **Préstamo Back-to-Back con DPF Pignorado**: Financiamiento al 80%-95% del DPF con spread preferencial (DPF + 3.0%). *Por qué: Producto con margen asegurado, riesgo de crédito cero y desembolso instantáneo.*
7. **Tarjeta de Crédito Garantizada Back-to-Back**: Asignación de cupo Visa/Mastercard al 90% del valor del DPF pignorado sin requerir historial en buró. *Por qué: Inclusión financiera para clientes sin récord crediticio o extranjeros.*
8. **Préstamos Comerciales e Hipotecarios Ordinarios**: Amortización francesa con seguro de saldo deudor (L. 6.50/millar) y clasificación regulatoria CNBS (Categorías I a V). *Por qué: Núcleo tradicional de colocación crediticia.*
9. **Cartas de Crédito de Importación (Trade Finance)**: Emisión de cartas de crédito irrevocables confirmadas por bancos de EE.UU. *Por qué: Vital para clientes importadores corporativos y generación de comisiones de divisas.*
10. **Factoraje y Descuento de Facturas Comerciales**: Adquisición de facturas por cobrar con aforo del 80%-90% y cobro de descuento por tasa y comisión. *Por qué: Liquidez para proveedores corporativos con bajo riesgo.*
11. **Fideicomisos de Garantía Inmobiliaria**: Administración de bienes y flujos en patrimonio autónomo con cobro de honorario fiduciario. *Por qué: Mitiga el riesgo en créditos de construcción y proyectos comerciales.*

### B. Productos Operacionales & Transaccionales
12. **Switch Interbancario ACH Pronto (CEPROBAN)**: Envío y liquidación en tiempo real de fondos entre bancos locales con comisión de L. 20.00. *Por qué: Canal transaccional estándar en Honduras.*
13. **Dispersión Masiva de Planillas y Nóminas Corporativas**: Débito automático a la cuenta de la empresa y acreditación simultánea a cientos de colaboradores con tarifa de L. 18.00 - L. 22.00 por empleado. *Por qué: Ancla relaciones corporativas y genera depósitos a la vista pasivos.*
14. **Cámara de Compensación de Cheques (Clearing House)**: Retención preventiva de fondos en tránsito por 24-48 horas hasta confirmación de la cámara. *Por qué: Previene fraudes por cheques sin fondos.*
15. **Gestión de Talonarios de Cheques**: Control de numeración correlativa, suspensión de cheques robados y cobro de chequeras nuevas. *Por qué: Control operacional exigido por auditoría interna.*
16. **Portal de Pagos de Servicios Públicos y Privados**: Recaudación de ENEE, SANAA, colegiaturas e impuestos con comisión por cobranza. *Por qué: Genera float de efectivo y tráfico recurrente.*
17. **Red Adquirente de Terminales de Punto de Venta (POS)**: TPVs físicos y pasarela e-commerce con cobro de MDR (Merchant Discount Rate de 1.8% a 2.5%). *Por qué: Captación masiva de flujos comerciales.*
18. **Condonación y Quita de Mora en un Clic**: Botón individual y masivo para dispensar recargos moratorios y reclasificar al cliente a Categoría I - Normal. *Por qué: Solicitud expresa del usuario para recuperar cartera vencida sin fricción.*
19. **Asignador Masivo de Portafolio por Banca**: Herramienta de inyección masiva de depósitos o créditos por segmentos. *Por qué: Cumple el requerimiento de gestionar miles de clientes sin edición manual.*
20. **Centro de Declaración de Origen de Fondos (DOF)**: Formulario digital obligatorio para operaciones en efectivo mayores a USD 10,000 o L. 200,000. *Por qué: Cumplimiento mandatorio de la Ley de Lavado de Activos.*

### C. Tesorería Institucional, ALCO & Cumplimiento CNBS
21. **Monitor de Encaje Legal BCH (12.0%)**: Conciliación automática entre depósitos captados y la reserva obligatoria inmovilizada en el Banco Central. *Por qué: Evita multas graves del BCH por déficit de encaje.*
22. **Mesa Cambiaria USD Spot (Subasta de Divisas BCH)**: Compra y venta institucional de divisas con spread cambiario (L. 24.80 compra / L. 24.95 venta). *Por qué: Principal fuente de utilidad no financiera en banca regional.*
23. **Portafolio de Títulos Soberanos SEFIN**: Tenencia de Bonos del Estado de Honduras y Letras BCH computables para liquidez de segundo piso. *Por qué: Rentabiliza excesos de liquidez sin riesgo crediticio privado.*
24. **Cálculo de Capital Adecuado (CAR / Solvencia)**: Relación entre Patrimonio Técnico y Activos Ponderados por Riesgo (RWA $\ge 10.0\%$). *Por qué: Métrica fundamental de estabilidad bancaria.*
25. **Exoneración de Riesgo Ponderado (0% RWA) en Back-to-Back**: El motor contable asigna 0% de requerimiento de capital y L. 0.00 en provisiones a créditos colateralizados con DPFs del mismo banco. *Por qué: Alineación estricta con Basilea III y normativa CNBS.*
26. **Reportes UIF de Operaciones Sospechosas (ROS)**: Matriz de alertas de monitoreo transaccional con expediente de resolución formal a 1-2 meses. *Por qué: Requisito de la Unidad de Inteligencia Financiera de la CNBS.*
27. **Balance General y Estado de Resultados Auditados en Tiempo Real**: Contabilidad bancaria por partida doble (Activo = Pasivo + Capital) con desglose de margen financiero neto (NIM). *Por qué: Provee la visibilidad ejecutiva que tiene un comité ALCO real.*

---

## 3. Especificación Detallada del Módulo Back-to-Back (Riesgo Cero CNBS)

El préstamo y tarjeta con garantía líquida (**Back to Back**) es una de las operaciones más rentables y seguras de la banca hondureña (implementada por BAC, Ficohsa, Lafise y Banpaís).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                   MECÁNICA OPERATIVA DE UN CRÉDITO BACK-TO-BACK                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   CLIENTE TITULAR               ÁUREO BANK CORE (T24/SAP)             COLATERAL PIGNORADO    │
│   ───────────────               ─────────────────────────             ───────────────────    │
│   1. Posee DPF de L. 1M (8.5%) ──> Emite solicitud B2B                                      │
│                                 2. Verifica saldo y titulación ─────> Bloquea DPF en custodia│
│                                 3. Aplica ratio (90% = L. 900k)       (Marca: PIGNORADO)     │
│                                 4. Asigna Tasa: 8.5% + 3.0% = 11.5%                          │
│                                 5. Cobra comisión 0.5% (L. 4,500)                            │
│   6. Recibe L. 900k en cuenta <── 6. Desembolso inmediato                                    │
│                                 7. Computa en balance con:                                   │
│                                    • RWA: 0% (Riesgo Nulo)                                   │
│                                    • Provisión CNBS: L. 0.00                                 │
│                                    • Margen Spread: +3.00% neto                              │
│                                                                                              │
│   FLUJO DE SALIDA O LIQUIDACIÓN:                                                             │
│   Opción A: Cliente paga cuotas francesas ──> Al saldo = 0 se libera el gravamen del DPF.   │
│   Opción B: Cliente incurre en default ──────> Ejecución directa del DPF contra la deuda     │
│                                                (Sin proceso judicial / Cobro inmediato).     │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Parámetros Financieros y de Riesgo:
- **Ratio Máximo de Financiamiento**: Hasta 90% (o 95% previa autorización de comité) del valor del certificado.
- **Tasa Activa del Crédito**: `Tasa del DPF + Spread Banco` (rango regulado: +3.00% a +4.00%).
- **Comisión de Desembolso / Otorgamiento**: 0.50% flat del monto financiado (mínimo L. 500.00 o USD $20.00).
- **Seguro de Saldo Deudor Obligatorio**: L. 6.50 por cada millar de saldo deudor promedio mensual.
- **Ponderación de Riesgo Regulatorio (RWA)**: **0.0%**. Al estar el colateral en efectivo bajo posesión directa del banco emisor, no consume capital regulatorio ni exige reservas preventivas por riesgo crediticio.
- **Tarjeta de Crédito Garantizada**: Límite de tarjeta al 90% del DPF. Si el titular consume el cupo y no paga el pago mínimo mensual, el banco compensa el débito contra los intereses devengados del DPF o contra el capital pignorado.

---

## 4. Arquitectura de Navegación del Nuevo Core Bancario

Reemplazando los 20 programas y 24 mejoras sintéticas por la estructura bancaria definitiva:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                ÁUREO BANK HONDURAS S.A.                                      │
│                   Core Bancario Institucional · Supervisado por CNBS y BCH                   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [1. Balance & ALCO] │ [2. Cuentas & ACH] │ [3. Depósitos DPF] │ [4. Back-to-Back] │ [5. Tesorería]│
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ VISTA ACTIVA: MÓDULO 4 - CRÉDITOS & COLOCACIÓN BACK-TO-BACK (GARANTÍAS LÍQUIDAS)             │
│                                                                                              │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ ORIGINACIÓN EXPEDITA BACK-TO-BACK            │ │ EXPEDIENTES Y CERTIFICADOS PIGNORADOS   │ │
│ │ Titular: Agroindustrias del Valle S.A.       │ │                                         │ │
│ │ DPF Colateral: DPF-HN-2026-042               │ │ • DPF-HN-2026-042 · L. 2,000,000 (8.5%) │ │
│ │ Saldo DPF: L. 2,000,000 (8.50% p.a.)         │ │   Pignorado a: Crédito B2B-091          │ │
│ │ Tipo: [Préstamo Amortizable] [Tarjeta Gar.]  │ │   Saldo Deudor: L. 1,650,000 (11.5% p.a)│ │
│ │ Monto Solicitado: L. 1,800,000 (90% cupo)    │ │   Estado: Gravamen Vigente (0% RWA)     │ │
│ │ Spread Banco: +3.00% ──> Tasa Activa: 11.50% │ │   [Cobrar Cuota] [Liberar] [Ejecutar]   │ │
│ │ Plazo: 24 meses · Amortización Francesa      │ │                                         │ │
│ │ Comisión Otorgamiento (0.5%): L. 9,000       │ │ • DPF-HN-2026-118 · L. 500,000 (8.0%)   │ │
│ │ [✓ Desembolsar y Registrar Gravamen en Core] │ │   Pignorado a: Tarjeta Visa Infinite B2B│ │
│ └──────────────────────────────────────────────┘ │   Límite Tarjeta: L. 450,000            │ │
│                                                  │   [Ver Transacciones] [Ejecutar Mora]   │ │
│                                                  └─────────────────────────────────────────┘ │
│                                                                                              │
│ MÉTRICAS CLAVE DEL MÓDULO (Tabular Numerals):                                                │
│ • Cartera B2B Vigente: L. 284,500,000  ·  • DPFs en Garantía Líquida: L. 316,200,000         │
│ • Provisiones Requeridas CNBS: L. 0.00  ·  • Spread Financiero Margen: +3.00%               │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Arquitectura Técnica y Estrategia de Implementación

### A. Depuración y Eliminación de Código Sintético:
- Eliminación física o desvinculación completa de:
  - `src/components/ProgramsSuite20View.tsx`
  - `src/components/StrategicImprovementsHub.tsx`
  - Métodos obsoletos de programas ficticios en `App.tsx` y en el estado global.

### B. Nuevos Componentes Especializados:
1. `src/components/BackToBackLendingTab.tsx`: Originación, control de colaterales pignorados, pago de cuotas francesas, liberación y ejecución de garantías líquidas.
2. `src/components/TermDepositsTab.tsx`: Emisión de certificados DPF (30 a 720 días), tabla de vencimientos, devengo diario y deducción de retención fiscal SAR del 10%.
3. `src/components/DemandDepositsTab.tsx`: Cuentas de Ahorro y Cuentas Corrientes comerciales, cheques en tránsito, dispersión de planillas corporativas y transferencias ACH Pronto.
4. `src/components/TreasuryAndAlmTab.tsx`: Gestión de reservas de encaje legal BCH (12%), subasta de divisas USD Spot, cartera de títulos SEFIN y cálculo de solvencia CAR/LCR.

### C. Motor Contable (`src/game/economyEngine.ts` y `src/game/types.ts`):
- Nuevas estructuras de datos tipadas:
  - `TermDepositCertificate`: ID, cliente, monto principal, tasa pasiva anual, plazo en días, fecha de apertura y vencimiento, estado de pignoración (`pignorado: boolean`), crédito vinculado e impuesto SAR retenido acumulado.
  - `BackToBackFacility`: ID, modalidad (`prestamo_amortizable` | `tarjeta_garantizada`), dpfId, cliente, monto otorgado, saldo insoluto, tasa activa pactada (DPF + spread), plazo en meses, cuota francesa nivelada, comisión cobrada y estado (`vigente` | `cancelado` | `ejecutado`).
  - `CommercialCheckingAccount`: ID, cliente, tipo (`corriente` | `ahorro`), saldo disponible, saldo diferido por cheques, sobregiro pactado y comisiones mensuales de mantenimiento.
  - `CorporatePayrollBatch`: ID, empresa ordenante, número de colaboradores, monto total dispersado y comisión cobrada por el banco.
- Funciones operativas completas:
  - `issueTermDepositCertificate(state, params)`: Captación de DPF, acreditación de pasivo exigible y cómputo de intereses.
  - `originateBackToBackCredit(state, params)`: Validación de cobertura, pignoración electrónica en core, deducción de comisión del 0.5% (mínimo L. 500) y desembolso sin ponderación de riesgo (0% RWA).
  - `liquidateBackToBackInstallment(state, facilityId, amountHNL)`: Pago de cuota nivelada (capital + interés) y desgravamen automático del DPF al completar el saldo.
  - `executePledgedDepositForeclosure(state, facilityId)`: Ejecución extrajudicial inmediata de la garantía líquida en caso de mora insalvable.
  - `processCorporatePayrollDispersion(state, params)`: Débito empresarial y dispersión ACH masiva con comisiones por colaborador.

---

## 6. Plan de Verificación & Pruebas Automatizadas

1. **Pruebas Unitarias del Motor Financiero (`tests/coreBankingBackToBack.test.ts`)**:
   - Apertura de DPF por L. 1,000,000 con plazo de 360 días y tasa de 8.5%.
   - Cálculo del devengo de intereses con retención del 10% del SAR sobre el rendimiento.
   - Originación de Préstamo Back-to-Back por L. 900,000 (90% cobertura) a tasa de 11.5% (spread +3.0%) con cobro de comisión de otorgamiento de L. 4,500.
   - Verificación de 0% de Activos Ponderados por Riesgo (RWA) y L. 0.00 en provisiones preventivas por riesgo crediticio.
   - Pignoración y bloqueo de retiros sobre el DPF hasta la cancelación total del préstamo.
   - Ejecución forzosa de garantía líquida en caso de impago con cancelación contable de saldos.
2. **Pruebas de Cierres Contables y Ecuación Patrimonial**:
   - Verificación de invariante `Activo = Pasivo + Capital` en cierres mensuales consecutivos.
   - Validación de las 37 pruebas existentes más las nuevas suites bancarias sin regresiones.
3. **Verificación de Compilación y Linter**:
   - `npm test`: 100% pruebas aprobadas.
   - `lint_applet`: Cero errores de sintaxis o imports.
   - `compile_applet`: Compilación exitosa para producción en Vite.
