# Constructora & Banca Dinámica: Multi-Bancos, Licitación de Materiales/Maquinaria 1-5 Estrellas, Cuadrilla Hombres/Día y Saltos Temporales

Plan de implementación para expandir el simulador retro en el modo Constructora con competencia de 4 bancos comerciales reales, licitaciones privadas de materiales y maquinaria pesada categorizadas de 1 a 5 estrellas, dimensionamiento diario de cuadrilla obrera (hombres/día), controles de avance temporal de 1 día, 15 días y 1 mes, y optimización de arrastre de ventanas.

---

## Decisiones Confirmadas por el Usuario

1. **Competencia de 4 Bancos Comerciales**:
   - Cuatro bancos hondureños principales compitiendo por la constructora: **Banco Ficohsa**, **Banco Atlántida**, **BAC Credomatic** y **Banco de Occidente**.
   - Cada banco ofrece de forma dinámica según la capacidad económica de la empresa:
     - Préstamos comerciales de capital de trabajo y maquinaria (con tasa y plazo variables).
     - Tarjetas de crédito corporativas (límites dinámicos según facturación mensual).
     - Cuentas corrientes con chequera para pago ágil a subcontratistas y proveedores.
     - Depósitos en garantía para emisión de fianzas de cumplimiento de obras públicas.
     - Depósitos a Plazo Fijo (DPF) para rentabilizar la liquidez retenida.
2. **Licitación de Materiales y Maquinaria (1 a 5 Estrellas)**:
   - **Fabricantes de Insumos (1⭐ a 5⭐)**: Licitaciones de suministro a fábricas de cemento, acererías y canteras (desde 1 estrella económico hasta 5 estrellas industrial/ISO), influyendo en costo, mermas y calidad de entrega.
   - **Concesionarias de Maquinaria y Volquetas (1⭐ a 5⭐)**: 5 concesionarias del país (*COVESA - Caterpillar*, *CAMOSA - Komatsu/John Deere*, *TMH*, *Distribuidora Sany/Dongfeng*, *Concesionaria Central de Usadas*). Comprar volquetas y retroexcavadoras reduce el costo operativo de renta por hora a cero (solo combustible).
3. **Control de Cuadrilla (Hombres/Día) y Saltos Temporales**:
   - Cada obra especifica con exactitud los **hombres/día necesarios** (ej: 18 albañiles y 2 maestros de obra). Si la cuadrilla activa en personal es insuficiente, la obra avanza más lento y se arriesga a retrasos y multas. Si es óptima, avanza a tiempo o antes de plazo.
   - Botones de avance de tiempo flexible en la barra de tareas: **Avanzar 1 Día**, **Avanzar 15 Días (Quincena)** y **Avanzar 1 Mes (30 Días)**.
   - Las licitaciones de obra y las ofertas de crédito bancario se renuevan dinámicamente cada 15 a 30 días.
4. **Perfeccionamiento de Movimiento de Ventanas**:
   - Arrastre suave con captura de puntero global, delimitación estricta de bordes de pantalla para que ninguna ventana se pierda fuera de la vista, y elevación de z-index inmediata al hacer clic.

---

## 1. Arquitectura de Datos (`src/game/retroSimTypes.ts`)

### A. Bancos Comerciales Competidores
```ts
export type CommercialBankId = 'ficohsa' | 'atlantida' | 'bac' | 'occidente';

export interface CommercialBankProfile {
  id: CommercialBankId;
  name: string; // ej: "Banco Ficohsa S.A."
  logo: string;
  relationshipScore: number; // 0 a 100
  offeredLoanRatePct: number; // Tasa activa para préstamos
  offeredDpfRatePct: number; // Tasa pasiva DPF
  creditCardLimitMax: number;
  maxWorkingCapitalLoan: number;
  perks: string;
}

export interface CommercialBankProducts {
  bankId: CommercialBankId;
  activeLoan?: {
    id: string;
    amount: number;
    balance: number;
    monthlyPayment: number;
    interestRate: number;
    termMonths: number;
  };
  creditCard?: {
    cardBrand: string;
    creditLimit: number;
    currentBalance: number;
    interestRateAnnual: number;
  };
  checkingAccountBalance: number;
  guaranteeDepositHeld: number; // Para fianzas
  termDepositBalance: number; // DPF ganando intereses
}
```

### B. Concesionarias y Maquinaria Propia
```ts
export interface MachineryDealer {
  id: string;
  name: string; // "COVESA Caterpillar", "CAMOSA Komatsu", etc.
  city: string;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  catalog: {
    id: string;
    model: string;
    category: 'volqueta_14m3' | 'retroexcavadora_4x4' | 'camion_mixer' | 'grua_torre' | 'motoniveladora';
    priceHNL: number;
    ratingStars: 1 | 2 | 3 | 4 | 5;
    hourlyFuelMaintenanceCost: number; // Costo por hora si es propia
  }[];
}

export interface OwnedMachineryUnit {
  id: string;
  model: string;
  category: 'volqueta_14m3' | 'retroexcavadora_4x4' | 'camion_mixer' | 'grua_torre' | 'motoniveladora';
  ratingStars: 1 | 2 | 3 | 4 | 5;
  dealerName: string;
  conditionPct: number; // 100% nueva
  operatingHours: number;
}
```

### C. Proveedores Fabricantes de Materiales (1 a 5 Estrellas)
```ts
export interface MaterialManufacturerQuote {
  manufacturerId: string;
  manufacturerName: string; // ej: "Cementos del Norte (Bijao)", "Aceros de Centroamérica", etc.
  materialId: ConstructionMaterialId;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  pricePerUnit: number;
  discountPct: number;
  minBatchUnits: number;
  deliveryDays: number;
  qualityNotes: string;
}
```

### D. Requerimiento de Mano de Obra en Obras
```ts
// Se amplía ActiveConstructionWork y ConstructionTender:
requiredWorkersPerDay: number; // Hombres requeridos por día para cumplir plazo
currentWorkersAssigned: number; // Cuadrilla actual asignada
laborEfficiencyRatio: number; // workforce / requiredWorkersPerDay (ej: 1.0 = 100% velocidad)
```

---

## 2. Motores de Simulación

### A. Motor Multi-Bancos (`src/game/commercialBanksEngine.ts`)
- Evaluación de capacidad crediticia según facturación de los últimos 30 días, historial SAR y patrimonio de maquinaria.
- Cálculo de ofertas dinámicas de los 4 bancos con tasas competitivas.
- Operaciones de:
  - Apertura/cancelación de Cuentas Corrientes.
  - Solicitud de Tarjeta de Crédito Corporativa.
  - Solicitud de Préstamo Comercial.
  - Constitución de Depósitos en Garantía (para licitaciones del Estado).
  - Apertura de DPF a plazo fijo con capitalización de intereses.

### B. Motor de Maquinaria y Licitación de Insumos (`src/game/machineryAndSuppliersEngine.ts`)
- Licitación privada de adquisición de maquinaria con 5 concesionarias nacionales.
- Inventario de maquinaria propia: reduce la necesidad de alquilar horas externas en obras activas.
- Licitación privada de materiales con fabricantes clasificados de 1 a 5 estrellas.

### C. Actualización en `src/game/constructionEngine.ts`
- Soporte para saltos de tiempo de **1 día**, **15 días** y **1 mes (30 días)**.
- Renovación periódica de convocatorias de obra y ofertas bancarias cada quincena o mes.
- Factor de eficiencia obrera: si la empresa tiene menos cuadrilla de la requerida (`staffCount < requiredWorkersPerDay`), la obra avanza más lento en proporción directa y corre riesgo de retrasos contractuales.

---

## 3. Componentes de Interfaz Retro (Ventanas Draggable)

1. `CommercialBanksWindow.tsx`:
   - Portal de los 4 bancos competidores (*Banco Ficohsa*, *Banco Atlántida*, *BAC Credomatic*, *Banco de Occidente*).
   - Fichas comparativas de tasas, límites y comisiones.
   - Formularios para pedir préstamos, tarjetas, chequeras y constituir garantías o DPF.
2. `MachineryDealerWindow.tsx`:
   - Concesionarias de maquinaria pesada y volquetas del país (1 a 5 estrellas).
   - Licitación privada de compra, flota de maquinaria propia y estado de mantenimiento.
3. `MaterialTenderWindow.tsx`:
   - Cotizaciones y licitaciones de suministro con fabricantes de 1 a 5 estrellas para pedidos mayoristas de cemento, acero, bloques y áridos.
4. `ConstructionBidsWindow.tsx` (Actualización):
   - Muestra claramente los **hombres/día requeridos** en cada licitación y en cada obra activa.
   - Indicador de suficiencia de cuadrilla: Verde (óptimo), Amarillo (ajustado), Rojo (insuficiente - riesgo de mora).
5. `RetroTaskbar.tsx` (Actualización):
   - Botón selector de salto de tiempo:
     - `▶ 1 Día`
     - `▶▶ 15 Días (Quincena)`
     - `▶▶▶ 1 Mes (30 Días)`
   - Iconos agregados para los 4 Bancos, Concesionarias y Licitación de Materiales.
6. `RetroWindow.tsx` (Actualización de física):
   - Fijación estricta de límites (viewport clamping) para que ninguna ventana pueda ser arrastrada fuera de la pantalla visible.

---

## 4. Plan de Verificación

- Pruebas unitarias en `tests/multiBankAndMachinery.test.ts`:
  - Capacidad crediticia y oferta de los 4 bancos según ventas.
  - Deducción de costos de obra si se posee maquinaria propia.
  - Impacto de cuadrilla insuficiente (hombres/día) en el avance de obra.
  - Avance de 15 días y 30 días con liquidación de cuotas, salarios y refresco de licitaciones.
- Pruebas de compilación y linter con `compile_applet` y `lint_applet`.
- Verificación en navegador y prueba de arrastre de ventanas.
