# Plan de Implementación: Desembolsos Netos, Montos Personalizados, Correo Empresarial y Garantías Reales

## Resumen Ejecutivo de Implementación Completa

Todas las prioridades solicitadas han sido implementadas en el código, verificadas con 124 pruebas unitarias y de integración pasando al 100%, y compiladas sin errores de sintaxis ni de tipado.

---

### 1. Desembolso Neto de Préstamos Acreditado en Cuenta
- **Selección de Cuenta**: En la solicitud de cualquiera de los 12+ productos de crédito se permite seleccionar la cuenta de cheques de destino en cualquiera de las 4 entidades bancarias (Banco Atlántida, Banco Ficohsa, BAC Honduras, Banco de Occidente).
- **Acreditación Exacta**: El monto aprobado menos deducciones legales/comisiones de apertura ingresa directamente a `checkingAccount.balance` del banco seleccionado y a `storeBankBalance`.
- **Comprobante y Registro**: Se genera un `BankDisbursementVoucher` con saldo anterior, saldo nuevo, deducciones y número de referencia, y se envía automáticamente un correo formal de confirmación a la bandeja de entrada.

---

### 2. Escritura de Montos Personalizados (`CustomAmountInput.tsx`)
- **Precisión Monetaria**: Campo numérico editable con centavos (`1,237.50`), compatible con formatos hondureños, europeos o con prefijos de Lempiras (`L`).
- **Validación No Destructiva**: Si el usuario introduce una cifra que supera el límite disponible o fondos, el texto escrito se conserva intacto en pantalla con una advertencia explicativa en rojo/ámbar sin reducirse silenciosamente.
- **Atajos Ergonómicos**: Botón "Usar máximo disponible" y botones de acceso rápido `25%`, `50%`, `75%`, `100%`.
- **Cálculo en Vivo**: Muestra el saldo disponible y el saldo proyectado que quedaría tras confirmar la operación.

---

### 3. Pagos y Retiros Flexibles
- **Modal de Pago Integral**: Admite 5 modalidades:
  1. *Cuota normal*: Amortización estándar de capital e interés pactado.
  2. *Múltiples cuotas*: Pago anticipado de varias cuotas consecutivas.
  3. *Pago parcial*: Amortiza intereses devengados y abona el remanente a capital sin marcar falsamente la cuota como cancelada.
  4. *Abono extraordinario a capital*: Permite elegir entre **Reducir Plazo** (máximo ahorro de intereses futuros) o **Reducir Cuota** (alivio de flujo de caja).
  5. *Cancelación total anticipada*: Calcula la deuda líquida a la fecha sin cobrar intereses futuros no devengados, extingue el pasivo y libera automáticamente cualquier garantía real hipotecada.
- **Transferencias ACH Interbancarias**: Transferencias entre cuentas corrientes propias mediante la red ACH Pronto Honduras sin duplicación de dinero ni distorsión del patrimonio neto.

---

### 4. Gestor de Correo Empresarial Interno (`InGameEmailWindow.tsx`)
- **Estilo Retro Outlook Express**: Interfaz con barra de carpetas (Bandeja de Entrada, No Leídos, Destacados, Archivados, Enviados).
- **Filtros y Búsqueda**: Filtrado por categorías (*Ventas y Clientes*, *Bancos y Crédito*, *Pagos y Vencimientos*, *Proveedores*, *SAR Tributario*, *Garantías Reales*, *Proyectos*, *Avisos del Sistema*).
- **Ofertas Dinámicas**: Ofertas preaprobadas con tarjetas de condiciones financieras y botones de acción (*Ver Condiciones*, *Negociar*, *Abrir SAR*, *Pagar*).
- **Composición de Respuestas**: Redacción de respuestas formales internas guardadas en la carpeta de *Enviados*.
- **Contador en Vivo**: Notificación visual con contador rojo de correos no leídos en el icono del escritorio y en el menú Inicio.

---

### 5. SAR y Solvencia Fiscal Simulada (`SarTaxAuditWindow.tsx`)
- **Rotulación Obligatoria**: Rotulado permanentemente como **"SIMULACIÓN — SIN VALIDEZ OFICIAL"**.
- **Declaración Jurada SAR-25**: Distingue claramente el estado de *Declaración Presentada* del *Impuesto Pagado*.
- **Verificación de Solvencia Fiscal**: Auditoría que enumera bloqueadores e impedimentos vigentes (declaración pendiente, saldos por pagar) antes de expedir la Constancia de Solvencia Fiscal requerida para licitaciones estatales.

---

### 6. Garantías Reales Hipotecarias y Avalúos (`RealEstateCollateralWindow.tsx`)
- **Fórmula Regulatoria**: `Valor Elegible = Avalúo Oficial × % LTV Aceptado`.
- **Cobertura Restante**: `Cobertura Restante = Valor Elegible - Gravámenes Comprometidos`.
- **Prelación y Gravámenes**: Registro de gravámenes con orden de prioridad (1er gravamen, 2do gravamen).
- **Reavalúo Técnico**: Solicitud de reavalúo con perito de la CNBS con actualización del valor elegible y cobro de honorarios profesionales.
- **Liberación Automática**: Emisión de testimonio notarial de cancelación y liberación de gravamen al liquidar la deuda vinculada.

---

### 7. Eliminación de "Auditoría General"
- **Retiro Completo**: Eliminado el acceso y botón de "Auditoría General" del escritorio y de la barra de tareas, sustituyéndolos por **Correo Empresarial** y **Garantías Reales**, manteniendo intacta la consistencia contable del Balance General y el Estado de Resultados.
