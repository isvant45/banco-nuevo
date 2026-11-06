# Plan de Implementación: Potenciación Financiera (Tarjetas, Préstamos, Fianzas, DPF) y Caja Registradora Interactiva

## 1. Visión y Objetivos
El usuario ha solicitado optimizar los instrumentos financieros empresariales:
1. **Tarjetas de crédito corporativas**: compras directas con tarjeta para suministros/inventario/maquinaria, facturación de corte y pago, límites dinámicos y bonificaciones de cashback.
2. **Préstamos comerciales**: líneas de capital de trabajo y vehicular con amortización de capital, tabla de pagos, negociación de tasas y cuotas.
3. **Depósitos en garantía (Fianzas)**: emisión de fianzas de cumplimiento/oferta, inmovilización de fondos y su liberación o liquidación con certificación.
4. **Depósitos a Plazo Fijo (DPF)**: cálculo acumulativo de intereses según días transcurridos, liquidación anticipada o al vencimiento con abono automático de capital + intereses.
5. **Caja Registradora Interactiva**: calculadora de cambio en efectivo recibida, cobro ágil con tarjeta POS o efectivo, desglose de IVA/ISV, arqueo diario de caja y cinta fiscal detallada.
6. **Eliminación Total de "Banco Aliado IA"**: remover todo rastro de iconos, ventanas, referencias y enlaces a `smart_bank` en el escritorio y taskbar, unificando todo en el **Banco** oficial.

---

## 2. Cambios a Desarrollar

### A. Motor Financiero (`src/game/commercialBanksEngine.ts` y tipos)
- **DPF con Liquidación y Devengo**:
  - Función `liquidateTermDeposit(state, bankId, depositId, isEarly)` para cobrar capital acumulado + intereses generados hasta la fecha.
  - Función `accrueTermDepositInterests(state, days)` que añade intereses a cada DPF al avanzar días o meses.
- **Fianzas Bancarias con Liquidación Formal**:
  - Función `releaseBankGuarantee` optimizada con reintegro íntegro a cuenta y registro de solvencia ante el SAR/SIT.
- **Compras Directas con Tarjeta Corporativa**:
  - Función `chargeCorporateCard(state, bankId, amount, concept)` para financiar compras de inventario, suministros y maquinaria con crédito rotativo, generando saldo utilizado y cashback.

### B. Ventana Bancaria Oficial (`src/components/retro/CommercialBanksWindow.tsx`)
- Pestaña **Fianzas & Garantías**:
  - Certificados visuales de garantía bancaria (SIT, municipal, privada).
  - Botones de "Liberar y Liquidar Fianza" con acreditación de saldo inmediata.
- Pestaña **Inversión DPF**:
  - Vista de certificados con barra de progreso de días restantes e intereses acumulados en Lempiras.
  - Botón de "Liquidar DPF y Cobrar Rendimiento" (al vencimiento o anticipado con penalidad mínima).
- Pestaña **Tarjetas de Crédito**:
  - Simulación de compras con tarjeta corporativa, pago para liberar cupo y visualización de beneficios (cashback ganado y corte).
- Pestaña **Préstamos**:
  - Tabla de amortización con cuota, abonos extraordinarios y estado de la deuda.

### C. Caja Registradora Interactiva (`src/components/retro/RetailRegisterWindow.tsx`)
- Teclado numérico / botones rápidos de billetes recibidos (L 50, L 100, L 500) para calcular automáticamente el **cambio / vuelto** del cliente.
- Botón de "Arqueo de Caja del Día" para cuadrar efectivo físico vs ventas registradas.
- Emisión visual de ticket con desglose de impuestos ISV 15%, subtotal y vuelto.
- Soporte para cobro con tarjeta POS comercial con acreditación bancaria directa.

### D. Eliminación Total de Banco Aliado IA (`src/components/retro/RetroDesktop.tsx` y `RetroTaskbar.tsx`)
- Eliminar el icono de escritorio "Banco Aliado (IA)".
- Eliminar la ventana y componente `SmartBankEnterpriseWindow` de `RetroDesktop.tsx`.
- Renombrar cualquier título a "Banco Comercial" o "Banco", dejando una experiencia bancaria pura y unificada.

---

## 3. Verificación
1. Ejecutar suite de pruebas con `npm test` verificando que todas las pruebas financieras sigan pasando y añadiendo tests para liquidación de DPF y cobro con tarjeta.
2. Compilar con `compile_applet` y validar con `lint_applet`.
