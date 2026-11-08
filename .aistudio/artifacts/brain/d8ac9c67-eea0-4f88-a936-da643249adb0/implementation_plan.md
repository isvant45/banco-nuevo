# Plan Maestro Integrado Revisado: Separación de Roles, Bandeja de Entrada con CSS Grid, AML y Contabilidad

Este plan integra la separación estricta de roles desde el arranque (Pantalla de Selección Cero y Dashboards raíz independientes), la reconstrucción del Sistema de Correo con CSS Grid y estados de acción consumida (prevención de doble clic y etiquetas de estado), la mecánica AML/UIF con disparadores automáticos de fin de turno, y la contabilidad de partida doble con estados financieros completos.

---

## Decisiones Críticas y Nuevos Requerimientos Integrados

> [!IMPORTANT]
> Se han incorporado las directrices de aislamiento arquitectónico y corrección de interfaz solicitadas:

1. **Pantalla de Selección de Rol Inicial (`currentRole = null`):**
   - Al iniciar o resetear el juego, no se cargan datos cruzados ni dashboards mezclados. Se muestra la pantalla de selección con 2 tarjetas:
     - 🏭 **Jugar como Empresario:** Gestión de inventario, compras de materia prima, pedidos a proveedores, nómina y solicitud de financiamiento.
     - 🏛️ **Jugar como Banquero:** Captación de depósitos públicos, encaje legal (20%), auditoría de crédito (Due Diligence), monitoreo de mora y mesa de rescate del Banco Central.
   - Enrutamiento raíz condicional: el componente renderiza `DashboardEmpresario` o `DashboardBanquero` de forma excluyente, haciendo imposible que un rol vea controles del otro.
2. **Reconstrucción del Correo con CSS Grid y Acción Consumida:**
   - **Grid Estricto sin Traslapes:** Cada fila de correo utiliza `grid-template-columns: 20% 1fr 120px 200px` con números en `font-mono` y alineación derecha, evitando encimamiento de textos y desbordes.
   - **Estado `accionEjecutada: boolean`:** Los botones de acción ([Pagar Factura], [Diferir], [Aceptar Capital Ilícito], [Emitir ROS], [Ignorar Alerta]) se deshabilitan tras el primer clic y se reemplazan por etiquetas estáticas (`✔ Pagado`, `✔ Capital Aceptado`, `✔ ROS Emitido`, `❌ Rechazado`).
3. **Disparador Dinámico de Fin de Turno (Oferta Clandestina AML):**
   - Si la liquidez del empresario es inferior a los gastos operativos del próximo turno, existe un 40% de probabilidad de recibir el correo del "Inversor Fantasma" (`Capitales Offshore LLC`), inyectando fondos marcados con `isTainted: true`.
4. **Desembolso Atómico por Partida Doble en Contratos Inteligentes:**
   - Banquero: Reduce Bóveda y aumenta Cartera de Crédito (validando encaje legal).
   - Empresario: Aumenta Caja Chica/Banco y aumenta Deuda Bancaria.

---

## 1. Visión General & Flujos de Usuario

### A. Flujo de Arranque y Selección de Roles

```
                      ┌──────────────────────────────────────┐
                      │    PANTALLA DE SELECCIÓN INICIAL     │
                      │         (currentRole === null)       │
                      └──────────────────┬───────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
     ┌─────────────────────────────┐           ┌─────────────────────────────┐
     │    DASHBOARD EMPRESARIO     │           │     DASHBOARD BANQUERO      │
     │ - KPIs: Caja, Stock, Score, │           │ - KPIs: Bóveda, Cartera,    │
     │   Carga de Deuda            │           │   Encaje Legal 20%, Tasa BCH│
     │ - Módulos: ERP, Operaciones,│           │ - Módulos: Due Diligence,   │
     │   Pasivos y Correo Accionable│          │   Mora, AML, Rescate BCH    │
     └─────────────────────────────┘           └─────────────────────────────┘
```

### B. Dashboard del Empresario
- **Barra Superior (KPIs en tiempo real):**
  - **Caja Chica (Liquidez):** Alerta visual en rojo si el saldo no cubre el OPEX del próximo turno.
  - **Inventario:** Stock valorizado y unidades listas para despacho.
  - **Score Crediticio:** Valor 300–850 con indicador de tendencia (▲/▼).
  - **Carga de Deuda:** Suma de cuotas exigibles en el mes actual.
- **Cuerpo de Operaciones:**
  - **Resumen ERP:** Gráfico de barras de Ingresos vs Egresos y Patrimonio Neto.
  - **Operaciones:** Compras de materias primas/suministros e inversión en maquinaria (CAPEX).
  - **Gestión de Pasivos:** Deudas vigentes, banco acreedor, saldo y botón para abrir la Mesa de Negociación.
  - **Bandeja de Correo:** Lista con CSS Grid de facturas pendientes con botones directos `[Pagar Factura]` y ofertas de capital ilícito.

### C. Dashboard del Banquero
- **Barra Superior (KPIs en tiempo real):**
  - **Liquidez en Bóveda:** Efectivo físico para desembolsos y retiros de ahorristas NPCs.
  - **Cartera Activa:** Total prestado devengando intereses.
  - **Índice de Encaje Legal:** Porcentaje actual vs 20% legal (parpadeo en rojo si baja del umbral).
  - **Tasa Prime (Banco Central):** Costo de referencia para el fondeo interbancario.
- **Cuerpo de Gestión:**
  - **Mesa de Crédito (Due Diligence):** Expedientes de empresarios con balance y score. Botones `[Aprobar]`, `[Contraofertar]`, `[Rechazar]`.
  - **Monitoreo de Cartera:** Clasificación semafórica: Verde (Vigente), Amarillo (Mora 1 mes), Rojo (Mora 3+ meses con botón activo `[Ejecutar Garantía al 60%]`).
  - **Cumplimiento (AML / UIF):** Monitor de fondos sucios con botones `[Emitir ROS y Congelar]` o `[Ignorar Alerta]`.
  - **Banco Central:** Ventanilla de rescate de liquidez de emergencia a tasa punitiva (`Prime + 10%`).

---

## 2. Especificación del Sistema de Correo Accionable

### A. Estructura de CSS Grid para Filas de Correo
```css
.email-row-grid {
  display: grid;
  grid-template-columns: 20% 1fr 120px 200px;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #94a3b8;
}

.email-amount-cell {
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### B. Ciclo de Vida de Acciones (`accionEjecutada`)
```
[Entrada de Correo] ──► [Usuario Clickea Botón] ──► ¿accionEjecutada == true? ──► Ignorar (Return)
                                │
                                └──► Falso:
                                      1. Ejecutar transacción contable en TransactionManager
                                      2. Marcar correo.accionEjecutada = true
                                      3. Reemplazar botones por etiqueta: "✔ Pagado" / "✔ ROS Emitido"
```

---

## 3. Disparadores Dinámicos de Fin de Turno (Turn Triggers)

Al ejecutarse el cierre diario o mensual:
1. Se calculan los gastos operativos fijos (OPEX: salarios, renta, suministros) del siguiente período.
2. Si `storeCash + storeBankBalance < proximoOpex` y no existe una oferta AML activa:
   - Se genera una tirada con 40% de probabilidad.
   - En éxito: Se inyecta un correo de `Capitales Offshore LLC` ofreciendo una inyección inmediata de capital ($L 100,000$ a $L 500,000$).
   - Si el empresario acepta: El dinero entra a cuenta con `isTainted = true`, registrando el asiento contable correspondiente y notificando al módulo de cumplimiento del banco.
3. Si el banco absorbe el dinero sucio y no emite ROS, el medidor de riesgo de auditoría de la UIF se incrementa, activando auditorías federales aleatorias con sanciones proporcionales.

---

## 4. Arquitectura Técnica de Archivos a Crear y Modificar

```
src/
├── game/
│   ├── retroSimTypes.ts            <-- Tipos: MailEvent con accionEjecutada, roles estrictos, AML state
│   ├── transactionManager.ts       <-- Motor de partida doble y desembolso atómico
│   ├── amlComplianceEngine.ts      <-- Reglas de KYC, disparador de correos AML y auditorías UIF
│   └── macroEconomyEngine.ts       <-- Cálculos de OPEX/CAPEX, encaje legal y scoring
├── components/retro/
│   ├── RoleSelectionScreen.tsx     <-- Pantalla inicial cero (Empresario vs Banquero)
│   ├── EntrepreneurDashboard.tsx   <-- Vista exclusiva de Empresario (KPIs, ERP, Pasivos, Operaciones)
│   ├── BankerDashboard.tsx         <-- Vista exclusiva de Banquero (KPIs, Due Diligence, Cartera, AML, BCH)
│   ├── ActionableEmailWindow.tsx   <-- Sistema de correo con CSS Grid y accionEjecutada
│   ├── AmlComplianceWindow.tsx     <-- Consola de monitoreo de cumplimiento y auditorías UIF
│   ├── AccountingLedgerWindow.tsx  <-- ERP completo: Flujo de Caja, P&L y Balance General
│   └── RetroDesktop.tsx            <-- Enrutador condicional raíz y barra de tareas retro
```

---

## 5. Criterios de Verificación y Pruebas

1. **Aislamiento de Roles:**
   - Al iniciar con `roleMode: null`, verificar que se presente la pantalla de selección de roles.
   - Al elegir "Empresario", verificar que sea imposible ver botones o ventanas de banquero (Bóveda, Rescate BCH, Encaje).
   - Al elegir "Banquero", verificar que solo aparezcan módulos de intermediación financiera, carteras y cumplimiento.
2. **Sistema de Correo sin Colisiones:**
   - Validar que remitente, asunto, monto en `font-mono tabular-nums` y botones mantengan su ancho exacto en CSS Grid.
   - Probar clic en "Pagar Factura": verificar que se descuente el dinero, se registre en el Libro Mayor y el botón se transforme en `"✔ Pagado"` sin permitir doble cobro.
3. **Disparador AML:**
   - Forzar caja en rojo y verificar la recepción del correo de "Capitales Offshore LLC".
   - Aceptar la inyección y validar que el dinero quede marcado como ilícito (`isTainted: true`) y dispare la alerta de cumplimiento en el dashboard del banquero.
4. **Compilación y Suite de Tests:**
   - Ejecutar `compile_applet`, `lint_applet` y `npm test` garantizando 100% de pruebas unitarias exitosas.
