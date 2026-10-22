# Plan de Implementación: Centro de Operaciones Avanzadas y 24 Nuevas Características Bancarias

El banco Áureo Bank expandirá su ecosistema operativo, financiero y regulatorio mediante una nueva suite de **24 características interactivas** organizadas en un **Centro de Operaciones Avanzadas** con simulación bancaria profunda de balance, liquidez, solvencia (IAC) y cumplimiento CNBS/BCH.

---

## 1. Arquitectura de las 24 Nuevas Características (4 Ejes Estratégicos)

### Eje 1: Red Física, Canales y Logística Bancaria (Features 1 a 6)
1. **Red Departamental de Sucursales**: Apertura y gestión de agencias en los 18 departamentos de Honduras (Tegucigalpa/MDC, San Pedro Sula, La Ceiba, Choluteca, Santa Rosa de Copán, Juticalpa, etc.) con costes de adecuación, nómina local, meta de captación de depósitos y volumen de créditos.
2. **Parque Inteligente de Cajeros Automáticos (ATM Smart Fleet)**: Gestión de flota de cajeros (básicos vs. multifunción inteligentes), monitoreo de efectivo disponible, recarga de bóveda de ATM, comisiones interbancarias y costos de conectividad.
3. **Red de Agentes Corresponsales ("Caja Amiga Áureo")**: Alianzas con pulperías, farmacias y ferreterías para corresponsalía bancaria en zonas periurbanas y rurales, con bajo capex y aumento masivo de inclusión financiera.
4. **Logística y Bóveda Central de Transporte de Valores**: Programación de rutas de blindados inter-agencias, cobertura de seguros contra siniestros/asaltos y optimización de efectivo ocioso.
5. **Autobanco y Canales Express de Ventanilla**: Infraestructura para atención ágil de alto flujo vehicular y comercial, reduciendo los tiempos de espera y descongestionando sucursales.
6. **Salón VIP de Banca Privada (Áureo Private Lounge)**: Espacio exclusivo de asesoría patrimonial para clientes de alto patrimonio (HNW) que asegura depósitos a largo plazo y captación de fondos institucionales.

### Eje 2: Mercado de Capitales, Tesorería y Divisas (Features 7 a 12)
7. **Emisión de Bonos Subordinados y Corporativos**: Emisión de deuda en bolsa para computar en Capital Complementario (Tier 2) de la CNBS, fijando tasa cupón y plazo (3 a 7 años) para fondear proyectos de gran escala.
8. **Mesa Cambiaria Activa (FX Spot y Subasta BCH)**: Operaciones de compraventa mayorista de USD/HNL en la subasta electrónica del Banco Central de Honduras, administración del diferencial cambiario y forwards de cobertura para importadores.
9. **Portafolio de Inversión Soberana (Títulos BCH / SEFIN)**: Inversión activa de excedentes en Letras del BCH y Bonos del Tesoro con rendimiento garantizado, liquidez inmediata y elegibilidad de colateral.
10. **Líneas Multilaterales de Crédito Internacional (BCIE, IFC, BID Invest)**: Acceso a líneas de financiamiento blando y concesional a largo plazo para fondeo de obras de energía renovable, exportaciones e infraestructura.
11. **Fondo Mutuo de Liquidez Áureo (Asset Management)**: Fondo de inversión administrado que genera comisiones de gestión (AUM fee) sin consumir encaje bancario tradicional.
12. **Mesa Interbancaria de Liquidez Diaria (Overnight / Call Money)**: Colocación y captación entre bancos hondureños para equilibrar con exactitud el cumplimiento de encaje bancario diario y arbitrar tasas del mercado monetario.

### Eje 3: Inteligencia Ejecutiva, Pruebas de Estrés y Cumplimiento CNBS (Features 13 a 18)
13. **Simulador de Pruebas de Estrés CNBS (Stress Testing Engine)**: Simulador interactivo donde el usuario aplica choques macroeconómicos (devaluación severa del HNL, sequía climática en agro, shock de mora o alza abrupta de TPM del BCH) y evalúa el impacto en solvencia (IAC) y reservas.
14. **Calculadora Dinámica de Provisiones IFRS 9 / CNBS por Tramos de Mora**: Matriz regulatoria de categorías crediticias (I-Normal a V-Pérdida) con reclasificaciones preventivas y cálculo dinámico de gasto por reservas.
15. **Centro de Ciberseguridad y Escudo Antifraude**: Detección en tiempo real de transacciones sospechosas, mitigación de clonación de tarjetas y certificación PCI-DSS / ISO 27001 para blindar la reputación bancaria.
16. **Matriz de Prevención de Lavado de Activos (AML/CFT & Oficialía de Cumplimiento)**: Monitoreo de transferencias atípicas mayores a USD 10,000, verificación de listas de Personas Políticamente Expuestas (PEPs) y reportes a la UIF.
17. **Estado de Resultados y Balance General Dinámico (Auditoría Financiera)**: Desglose interactivo en tiempo real de Margen de Intermediación Financiera (NIM), ROE, ROA, Índice de Eficiencia Operativa (CIR) y Costo de Fondeo.
18. **Comité de Activos y Pasivos Interactivo (ALCO Advisor)**: Herramienta estratégica de simulación de curvas de tasas de interés activas y pasivas para maximizar el margen financiero neto frente al ciclo del BCH.

### Eje 4: Soluciones Corporativas, Retail y Retención de Clientes (Features 19 a 24)
19. **Banca Transaccional Corporativa & Cash Management**: Módulo integral de recaudación masiva de servicios públicos, pago a proveedores y factoring digital con cobro de comisión por dispersión.
20. **Fideicomisos Bancarios de Garantía y Administración**: Estructuración de contratos fiduciarios para proyectos de vivienda social, centros comerciales y obras públicas, devengando comisiones recurrentes fiduciarias.
21. **Microseguros Bancaseguros Populares**: Distribución de pólizas de bajo costo (salud ambulatoria, vida familiar, seguro agrícola paramétrico) integradas a cuentas de ahorro.
22. **Motor de Retención & Scoring NPS (Predictor de Churn)**: Monitoreo de satisfacción de clientes, lealtad y activación de campañas preventivas de retención antes de que los cuentahabientes migren a la competencia.
23. **Crédito de Consumo Express con Firma Digital**: Motor de aprobación biométrica inmediata para préstamos personales y créditos de nómina en menos de 3 minutos para usuarios calificados.
24. **Portal del Accionista y Política de Dividendos**: Simulación de distribución de dividendos en efectivo vs. capitalización de utilidades para fortalecer el capital social primario (Tier 1) de cara a la asamblea anual.

---

## 2. Modificaciones Técnicas en el Código

### 2.1 Modelo de Datos (`/src/game/types.ts`)
- Añadir interfaces para:
  - `BranchDepartment`: Datos de red física por departamento (departamento, sucursales activas, empleados, capex, depósitos captados).
  - `AtmFleet`: Flota de cajeros (total cajeros, cajeros inteligentes, disponibilidad de efectivo, tasa de falla, ingresos por comisión).
  - `BankingAgentNetwork`: Agentes corresponsales comunitarios (puntos activos, transacciones promedio, comisión).
  - `CapitalMarketTreasury`: Bonos subordinados emitidos, cartera soberana BCH, posición en subasta FX, fondos mutuos gestionados.
  - `StressTestScenario`: Definición de parámetros de estrés (shock de mora, shock cambiario, shock de tasa, impacto en IAC).
  - `CorporateFiduciary`: Fideicomisos activos, cartera de factoring y comisiones devengadas.
  - `AdvancedOperationsState`: Estado consolidado que agrupa todas las 24 características con sus métricas y estados de activación.

### 2.2 Motor Económico (`/src/game/economyEngine.ts`)
- Extender el ciclo mensual (`advanceMonth`):
  - Liquidación de ingresos por comisiones de red física (ATM, agentes, sucursales) y costes operativos.
  - Pago de cupones de bonos corporativos e ingresos por títulos soberanos del BCH.
  - Ingresos por fideicomisos, cash management corporativo y bancaseguros.
  - Cálculo interactivo de las pruebas de estrés sin romper el estado base del juego.
  - Actualización de depósitos captados por la red física y aumento de base de clientes.

### 2.3 Componente Principal: Centro de Operaciones Avanzadas (`/src/components/AdvancedOperationsHub.tsx`)
- Crear un componente de primer nivel con sub-pestañas intuitivas y herramientas interactivas:
  1. **Red Física & Canales** (Sucursales por departamento, simulador de cajeros ATM, agentes comunitarios, bóveda y autobanco).
  2. **Mercado de Capitales & Tesorería** (Emisión de bonos, mesa FX BCH, portafolio soberano, líneas internacionales y fondos mutuos).
  3. **Inteligencia Ejecutiva & Pruebas de Estrés** (Simulador en vivo de choques macroeconómicos, matriz de provisiones IFRS 9, ciberseguridad y comité ALCO).
  4. **Soluciones Corporativas & Clientes** (Cash management, fideicomisos, bancaseguros, retención de clientes y portal del accionista).
- Diseñado con estética premium (Tailwind CSS, badges de estado, gráficos de barras de progreso, controles numéricos y botones de acción rápida).

### 2.4 Integración en Navegación y Vistas (`/src/App.tsx`, `/src/components/OverviewDashboard.tsx`)
- Añadir el botón y acceso directo "Centro de Operaciones" en la barra de navegación superior.
- Integrar widgets de resumen en el Dashboard general (resumen de sucursales activas, bonos en circulación y estado de solvencia ante pruebas de estrés).

---

## 3. Pruebas y Validación
- Crear pruebas unitarias automáticas en `/tests/advancedOperations.test.ts` verificando:
  - Inicialización limpia de las 24 características.
  - Apertura de sucursales departamentales y cálculo de impacto en balance.
  - Emisión de bonos subordinados e incremento en Capital Tier 2.
  - Ejecución del simulador de estrés CNBS y cálculo matemático de solvencia (IAC).
  - Liquidación mensual automática sin discrepancias contables.
- Validar compilación limpia mediante `compile_applet` y verificación estática con `lint_applet`.
