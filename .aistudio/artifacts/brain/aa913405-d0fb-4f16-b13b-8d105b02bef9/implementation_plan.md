# Plan de Implementación: Paginación Virtualizada de Cartera (18,000+ Clientes), Autonomía de Asesores hasta L. 50M, Resoluciones UIF Dinámicas (1-2 meses), Timer de Avance Automático y Jerarquía Bancaria

Este plan establece las especificaciones técnicas y de interfaz para cumplir con todas las solicitudes confirmadas, consolidando la estación de trabajo bancaria en estricto apego a las normas del Banco Central de Honduras (BCH) y la Comisión Nacional de Bancos y Seguros (CNBS).

---

## 1. Arquitectura y Módulos a Desarrollar

### A. Reordenamiento Jerárquico de la Estación de Trabajo (Navegación Prioritaria)
Reestructurar la barra superior (`TopExecutiveHUD.tsx` y `App.tsx`) para reflejar la cadena de valor de una institución financiera de primer orden:
1. **Bancas & Clientes**: Core de depósitos, cuentas y libro mayor de clientes individuales y corporativos.
2. **Créditos & Colocación**: Solicitudes, comités de crédito y colocación con delegación autónoma.
3. **Operaciones & Eficiencia**: 24 capacidades operativas, adquirencia POS, planillas y sucursales.
4. **Prevención de Fraudes & AML/UIF**: Centro de alertas transaccionales, congelamientos cautelares y expedientes ROS.
5. **Directorio & Dilemas Éticos**: Gobierno corporativo, votación de directores y simulador de crisis.
6. **Tesorería & BCH**: Mesa de dinero, encaje legal, operaciones REPO y divisas.
7. **Sandbox Regulatorio**: Parámetros de simulación en cascada instantánea.
8. **Ranking & Dividendos**: Posición en el sistema bancario hondureño y política de dividendos.

---

### B. Libro Mayor Completo de Cartera con Paginación Rápida y Carga Virtualizada
- **Escala de Cartera**:
  - Generador determinista y eficiente de clientes representativos para cada banca (alcanzando los 18,000 clientes en Banca Minorista y miles en Banca PYME, Premier, Corporativa, Privada y Global) con datos auténticos hondureños: RTN de 14 dígitos (ej. `0801-1985-12345`), CIF de 13 dígitos, ciudades (Tegucigalpa, San Pedro Sula, Ceiba, Choluteca, Danlí, Juticalpa, Santa Rosa de Copán, Roatán), saldos, tarjetas y categoría de riesgo CNBS (I a V).
- **Componente de Paginación Rápida en `BankingDivisionsTab`**:
  - Paginación paginada de 25/50/100 clientes por página con respuesta instantánea (< 16ms).
  - Buscador en tiempo real por **RTN**, **CIF**, **Nombre** o **Número de Cuenta**.
  - Filtro dinámico multidimensional por **Ciudad / Departamento**, **Categoría de Riesgo CNBS**, **Rango de Saldo** y **Estado AML**.
  - Modal o visor de expediente 360° para inspeccionar cualquier cliente de la base de datos masiva de inmediato.

---

### C. Aumento y Configuración de Autonomía de Crédito para Asesores (Hasta L. 50,000,000)
- **Slider Configurable en Tiempo Real**:
  - Control interactivo en el módulo de créditos para ajustar el límite delegado a los Oficiales de Crédito desde L. 5,000,000 hasta **L. 50,000,000** (anteriormente fijado en L. 20,000,000).
  - Toda solicitud dentro de la autonomía se aprueba de inmediato por el asesor sin requerir sesión del Directorio.
  - Solicitudes que superen el límite configurado se remitirán al Comité Ejecutivo / Junta Directiva.
  - Expansión de la capacidad de procesamiento mensual de los asesores.

---

### D. Resoluciones Dinámicas de la UIF en 1-2 Meses y Motor Actualizable de AML
- **Ciclo Temporal de Expedientes ROS ante la UIF/CNBS**:
  - Al radicar un Reporte de Operación Sospechosa (ROS) o congelar una cuenta, se inicia un expediente con tiempo de resolución de 1 a 2 meses del juego.
  - En `advanceGameMonth`, las alertas radicadas avanzan su ciclo procesal:
    * **Mes 1**: Acuse de recibo y apertura de investigación fiscal por el Ministerio Público / CNBS.
    * **Mes 2**: Dictamen definitivo emitido por la UIF:
      1. *Decomiso y Extinción de Dominio Fiscal*: Los fondos congelados son transferidos a la OABI (Oficina Administradora de Bienes Incautados), con bonificación en reputación y rating de cumplimiento.
      2. *Desestimación Justificada*: La cuenta es desbloqueada legalmente al acreditarse origen de fondos comercial lícito.
      3. *Sanción Administrativa Ratificada*: Cobro de multa legal al infractor y cierre definitivo de cuenta.
- **Botón de Escaneo Activo**:
  - Función de *"Escanear Red Transaccional"* para auditar transacciones sospechosas adicionales a demanda.

---

### E. Inmediatez Reactiva Absoluta (Zero-Lag Updates)
- Cuando el usuario aprueba un crédito, toma una decisión del Directorio, congela una cuenta o modifica una tasa/parámetro:
  - Impacto visual y contable en el balance general, patrimonio, CAR e ingresos **en el milisegundo exacto** del clic.
  - Retroalimentación auditiva sintetizada y banner flotante tipo "toast" de confirmación bancaria inmediata.
  - Actualización reactiva sin requerir recargar la página ni cambiar de pestaña.

---

### F. Controlador de Avance de Tiempo y Auto-Timer
- **Respuesta a "¿A qué hora se reinicia?"**:
  - En el simulador, el tiempo avanza por **Meses Contables** (Enero 2026, Febrero 2026, etc.).
  - Incorporar en el encabezado HUD un **Controlador de Avance**:
    * Botón manual clásico *"Cerrar Mes Contable"*.
    * Botón *"Avance Automático"* (Play / Pause) con selector de intervalo (ej. cada 15s, 30s o 60s avanza un mes automáticamente con sonido de campana de cierre).

---

## 2. Archivos a Modificar

1. **`src/game/types.ts`**:
   - Ampliar tipos de clientes para admitir metadatos masivos y paginación.
   - Parámetro `advisorAutoApprovalThresholdHNL` (configurable hasta L. 50,000,000).
   - Estado de expediente ROS con ciclo de resolución a 1-2 meses (`uifResolutionPendingMonths`, `uifFinalRuling`).
   - Soporte para auto-timer en el estado del juego.

2. **`src/game/initialState.ts`**:
   - Generador optimizado determinista de 18,000 clientes representativos distribuidos en las 6 bancas.
   - Umbral inicial de delegación de crédito a asesores en L. 35,000,000 (ajustable hasta L. 50M).

3. **`src/game/economyEngine.ts`**:
   - Lógica de resolución diferida a 1-2 meses para reportes UIF en `advanceGameMonth`.
   - Función reactiva instantánea para ajustar el límite delegado de asesores de crédito.
   - Filtros de búsqueda optimizados por RTN y ciudad.

4. **`src/components/BankingDivisionsTab.tsx`**:
   - Componente de paginación virtualizada de alto rendimiento.
   - Barra de búsqueda por RTN, nombre y CIF.
   - Selectores de ciudad (Tegucigalpa, San Pedro Sula, etc.) y categoría CNBS.

5. **`src/components/CreditManagementTab.tsx`**:
   - Slider en tiempo real de límite de aprobación de asesores (L. 5M - L. 50M).
   - Aprobación instantánea reactiva.

6. **`src/components/AmlFraudComplianceHub.tsx`**:
   - Indicador de estado de resolución de expedientes (cuenta regresiva 1-2 meses).
   - Botón de escaneo activo de transacciones y libro de resoluciones de la UIF.

7. **`src/components/TopExecutiveHUD.tsx` & `src/App.tsx`**:
   - Reordenamiento de pestañas en la jerarquía bancaria indicada.
   - Control de avance automático por timer (Play/Pausa y velocidad).

8. **`tests/clientPaginationAndUifTimer.test.ts`**:
   - Pruebas unitarias de paginación de 18,000 clientes, búsqueda por RTN, resoluciones UIF a 1-2 meses y autonomía de crédito hasta L. 50M.

---

## 3. Criterios de Aceptación
1. **Rendimiento**: Búsqueda por RTN y filtrado de la cartera masiva responde en < 16ms sin congelar la interfaz.
2. **Autonomía**: Solicitudes de crédito de hasta L. 50M se aprueban de inmediato si el slider está en ese nivel.
3. **AML / UIF**: Casos remitidos a la UIF reciben resolución definitiva en 1 a 2 meses contables con impacto financiero real.
4. **Reactividad**: Cualquier cambio se refleja de inmediato en toda la pantalla.
5. **Pruebas y Compilación**: `npm test`, `lint_applet` y `compile_applet` pasan al 100% con 0 errores.
