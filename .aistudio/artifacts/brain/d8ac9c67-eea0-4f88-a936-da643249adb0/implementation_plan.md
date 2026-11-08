# Plan de Integración: Sistema ERP Corporativo & Libro Mayor en el Simulador

Integración de un sistema ERP corporativo integral y realista en el simulador empresarial, estructurado bajo una ventana dedicada de escritorio retro (**«ERP Corporativo & Libro Mayor»** con icono **📑**) que articula los 4 pilares financieros y operativos en tiempo real.

---

## Decisiones Críticas & Respuestas Confirmadas por el Usuario

> [!IMPORTANT]
> Decisiones de arquitectura y diseño confirmadas por el usuario en la fase de clarificación:

- **Punto de Entrada en la UI**: Ventana dedicada de primer nivel (`erp_ledger`) con icono propio en el Escritorio Retro (**«ERP & Libro Mayor»**) y entrada en la barra de tareas.
- **Gestión de Proveedores y Facturas**: Soporte de pagos al contado y financiamiento en cuotas mensuales, registrando automáticamente cada desembolso en el Libro Mayor General (partida doble).
- **Operaciones y Realidad Empresarial**: La apertura de sucursales, capacitación del personal y campañas de publicidad tendrán impacto directo y dinámico en las ventas diarias, la moral del equipo y el posicionamiento de marca de la empresa.
- **Auditoría del Contador**: Libro Mayor con filtros por categoría de cuenta (Activo, Pasivo, Patrimonio, Ingreso, Gasto), trazabilidad de quién y cuándo autorizó cada transacción, y módulo de cálculo fiscal a fin de mes (ISR 25% + Aportación Solidaria).

---

## 1. Visión General & Concepto Central

El sistema ERP conecta la operativa comercial con la contabilidad formal:
1. **Pilar 1: Tarjetas Corporativas**: Control estricto de límite, saldo disponible y deuda, validando fondos antes de cada consumo o pago.
2. **Pilar 2: Proveedores y Cuentas por Pagar**: Facturas entrantes con estados (`PENDING`, `PARTIAL`, `PAID`), cronograma de vencimientos y liquidación de cuotas.
3. **Pilar 3: Auditoría y Contador**: Libro Mayor General (*General Ledger*) con asientos contables de cada movimiento financiero, control de flujo de caja y liquidación fiscal de fin de mes.
4. **Pilar 4: Operaciones Empresariales**: Apertura de sucursales con costo de capital y dotación mínima de personal, plan de incentivos laborales (moral/eficiencia) y campañas de mercadeo.

---

## 2. Experiencia de Usuario & Diseño Visual

### Flujo de Navegación Retro
- **Icono en el Escritorio**: `📑 ERP & Libro Mayor` ubicado en la cuadrícula del escritorio retro junto a los iconos empresariales.
- **Estructura de la Ventana Retro (`ErpLedgerWindow`)**:
  - **Barra de Pestañas Retro**:
    - `💳 1. Tarjetas Corporativas`: Visualización gráfica de la tarjeta, límite disponible, saldos y formulario de compras/pagos.
    - `📦 2. Proveedores & Facturas`: Cartera de cuentas por pagar, facturas pendientes, abono al contado o por cuotas.
    - `⚖️ 3. Libro Mayor & Contador`: Consola de auditoría contable, asientos detallados (Debe/Haber), filtros y liquidación mensual de ISR/Aportación Solidaria.
    - `🏢 4. Operaciones & Expansión`: Apertura de sucursales en ciudades de Honduras (Tegucigalpa, San Pedro Sula, La Ceiba, Choluteca), gestión de moral de empleados y campañas publicitarias.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📑 ERP Corporativo & Libro Mayor - Áureo Enterprise                    [_][X]│
├─────────────────────────────────────────────────────────────────────────────┤
│ [💳 Tarjetas Corp] [📦 Cuentas por Pagar] [⚖️ Libro Mayor] [🏢 Operaciones] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Capital Disponible: L 3,850,000 │ Renta Gravable: L 420,000 │ Marca: 68/100  │
├─────────────────────────────────────────────────────────────────────────────┤
│  (Contenido dinámico interactivo con tablas retro, inputs y botones clásicos)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Decisiones Técnicas & Reglas de Negocio

### Restricciones Empresariales Estrictas
1. **Prohibición de Sobregiro no Autorizado**: Si una compra excede el saldo disponible de la tarjeta o si un pago a proveedor supera la caja/banco disponible, la operación se rechaza con una alerta financiera explicativa.
2. **Regla de Expansión con Capital y Personal**: No se puede abrir una sucursal sin contar con el capital de instalación necesario y un mínimo de 2 empleados asignados.
3. **Integridad de Partida Doble**: Toda compra, pago de nómina, pago a proveedor o impuesto genera simultáneamente un asiento en el Libro Mayor vinculando cuenta débito y crédito.

---

## 4. Arquitectura de Datos & Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA DEL SISTEMA ERP                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/game/erpCorporateTypes.ts                                              │
│   ├─ IErpSupplierInvoice (Facturas por pagar, cuotas, estados)              │
│   ├─ ILedgerTransactionEntry (Asientos del Libro Mayor)                     │
│   ├─ IErpBranchOffice (Sucursales, costo operativo, personal)               │
│   └─ IErpMarketingCampaign (Campañas y brand equity)                         │
│                                │                                            │
│                                ▼                                            │
│  src/game/erpCorporateEngine.ts                                             │
│   ├─ recordLedgerEntry(state, entry)                                        │
│   ├─ paySupplierInvoiceInstallment(state, invoiceId, amount, source)        │
│   ├─ openCompanyBranch(state, branchData)                                   │
│   ├─ executeMarketingCampaign(state, campaignData)                          │
│   └─ calculateMonthlyTaxLiquidation(state)                                  │
│                                │                                            │
│                                ▼                                            │
│  src/components/retro/ErpLedgerWindow.tsx                                   │
│   └─ Componente UI retro con las 4 pestañas interactivas                   │
│                                │                                            │
│                                ▼                                            │
│  src/components/retro/RetroDesktop.tsx                                      │
│   └─ Icono en escritorio, registro en openWindows y barra de tareas         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Plan de Verificación

1. **Pruebas de Compilación**: Ejecutar `compile_applet` para garantizar que no existan errores de sintaxis ni de empaquetado.
2. **Chequeo de Tipado Estricto**: Ejecutar `lint_applet` (`tsc --noEmit`) asegurando 0 errores de TypeScript.
3. **Verificación Funcional**:
   - Abrir la ventana desde el icono del escritorio `📑 ERP & Libro Mayor`.
   - Comprobar que los consumos y pagos con tarjeta actualicen el disponible y generen asientos en el Libro Mayor.
   - Pagar facturas a proveedores por cuotas o al contado y verificar la reducción del pasivo.
   - Probar la apertura de sucursales con validación de costo y empleados mínimos.
   - Verificar la provisión de impuestos de fin de mes calculada con las tasas reales (25% ISR + 5% Solidario).
