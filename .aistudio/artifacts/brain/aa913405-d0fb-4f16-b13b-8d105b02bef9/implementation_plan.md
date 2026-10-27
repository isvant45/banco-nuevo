# Plan de Implementación: Asignación Masiva de Cartera, Quita de Mora Efectiva y Nuevos Ítems Institucionales

Este plan aborda las necesidades solicitadas por el usuario:
1. **Asignador Masivo de Cartera & Segmentos ("el coso")**: Permitir definir en bloque que *X* cantidad de personas tienen *Y* dinero en depósitos y *Z* personas tienen *W* dinero en préstamos por banca, sin tener que modificar cliente por cliente.
2. **Reingeniería de la Quita de Mora ("mejora eso de la mora que cuando toco la quita mora no funciona para nada")**: Resolver la causa raíz por la cual la condonación no se aplicaba efectivamente, agregando acciones de quita de mora individuales (en la ficha de cada cliente en mora) y masivas (a nivel de toda la banca o cartera morosa).
3. **Nuevos Ítems Institucionales ("los tres")**: Incorporar nuevos programas de alivio financiero/reactivación, instrumentos de tesorería/bolsa, y alianzas de planilla y comercios POS.

---

## 1. Arquitectura y Análisis de Causa Raíz

### A. Diagnóstico de la falla de "Quita de Mora"
* **Causa detectada**: En el `ProgramsSuite20View.tsx` (Programa 19: *Calificador y Reclasificación CNBS*), la acción de condonación estaba cableada a `state.clients[0]?.id`. Si el primer cliente de la lista no tenía mora (`pastDueDays === 0`), no ocurría ningún cambio visible ni en balances ni en indicadores. Adicionalmente, los clientes sintéticos de la paginación no se persistían si se modificaban en el modal.
* **Solución Implementada**:
  1. **Acción Individual en Expediente**: En `ClientActionsModal.tsx`, se implementó una tarjeta destacada de Alivio de Mora con el botón **"⚡ Condonar y Quitar Mora 100% Inmediato"**, reseteando `pastDueDays: 0` y `cnbsCategory: 'I - Normal'`, persistiendo clientes tanto reales como sintéticos a `state.clients`.
  2. **Acción Masiva por División y Cartera**: En `BankingDivisionsTab.tsx` se agregaron los botones **"Asignación Masiva («El Coso»)"** y **"Condonar Toda la Mora"**, además de botones rápidos **"⚡ Quitar Mora"** en cada fila de clientes morosos.
  3. **Impacto Financiero Real**: Descuenta la mora contable, ajusta provisiones en el balance general y reduce la tasa de morosidad de la división a 0.2%.

### B. Módulo de Asignación Masiva de Cartera ("El Coso")
* **Implementado**: Componente `BulkPortfolioAllocatorModal.tsx` y función `applyBulkPortfolioAllocation`.
* **Funcionalidad**:
  - Selector de Banca (Personas, PYME, Premier, Corporativa, Privada).
  - Presets ejecutivos: Retail Masivo (18k), PYME Comercial (4.2k), Premier Exclusivo (1.8k).
  - Configuración granular de Cuentahabientes y Saldo promedio (HNL), Deudores y Monto de crédito promedio (HNL), Tasa y Plazo.
  - Sincronización inmediata con `queryDivisionClients` para que las páginas de 18,000+ clientes reflejen instantáneamente los nuevos montos.

### C. Nuevos Ítems Institucionales (Tres Ejes Incorporados)
1. **Eje 1: Alivio Financiero & Reactivación**:
   * *Programa 21*: Plan Respiro BCH: Condonación Total de Mora & Saneamiento.
   * *Programa 22*: Garantía FOGAPI PYME: Respaldo Estatal al 80%.
   * *Programa 23*: Cero Mora Estudiantil & Tecnológica Hondureña.
2. **Eje 2: Instrumentos de Tesorería & Mercado de Capitales (Bolsa de Valores)**:
   * *sec-cdn-ficohsa*: Certificado de Depósito Negociable (CDN) Ficohsa BCV 180D (8.45% anual).
   * *sec-green-bch*: Bono Verde BCH Parque Solar & Eólico Copán 2032 (8.75% anual).
   * *sec-fid-inmob*: Certificado Fiduciario Inmobiliario Metrópolis Tegucigalpa (9.35% anual).
3. **Eje 3: Alianzas Corporativas y Red Comercial POS**:
   * Nuevos convenios de nómina:
     - *Consorcio Hospitalario & Clínicas del Valle S.A.* (1,200 colaboradores, L. 38.4M/mes).
     - *Grupo Maquilador del Norte / Green Valley Industrial* (3,400 operarios, L. 62.9M/mes).
   * Nuevos comercios POS de alto volumen:
     - *Supermercados La Colonia San Pedro* (16 POS físicos, L. 5.4M/mes).
     - *Distribuidora Farmacéutica del Caribe* (8 POS físicos, L. 3.1M/mes).

---

## 2. Estado de Verificación
- **Pruebas Unitarias**: 37 de 37 pruebas pasando exitosamente (`npm test`).
- **Linter TypeScript**: `tsc --noEmit` completado sin errores.
- **Compilación de Producción**: `vite build` verificado exitosamente mediante `compile_applet`.
