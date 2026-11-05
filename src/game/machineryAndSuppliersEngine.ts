import { 
  DailySimulationState, 
  MachineryDealer, 
  OwnedMachineryUnit, 
  MaterialManufacturerQuote,
  ConstructionMaterialOrder
} from './retroSimTypes';

/**
 * Catálogo Oficial de 5 Concesionarias de Maquinaria Pesada y Volquetas (1 a 5 Estrellas)
 */
export const DEFAULT_MACHINERY_DEALERS: MachineryDealer[] = [
  {
    id: 'covesa_cat',
    name: 'COVESA · Caterpillar Honduras',
    city: 'San Pedro Sula / Tegucigalpa',
    ratingStars: 5,
    tagline: 'Distribuidor exclusivo Caterpillar: Máxima potencia, confiabilidad y durabilidad de obra',
    reputationDiscountPct: 0.05,
    catalog: [
      {
        id: 'cat_volqueta_770',
        modelName: 'Volqueta CAT 770G (14 m³ Reforzada)',
        category: 'volqueta_14m3',
        icon: '🚛',
        ratingStars: 5,
        priceHNL: 2350000,
        hourlyFuelCost: 220,
        description: 'Capacidad 14m3 cúbicos con tolva para roca pesada y motor diésel de alta eficiencia.'
      },
      {
        id: 'cat_retro_420',
        modelName: 'Retroexcavadora CAT 420F2 4x4',
        category: 'retroexcavadora_4x4',
        icon: '🚜',
        ratingStars: 5,
        priceHNL: 1850000,
        hourlyFuelCost: 180,
        description: 'Brazo extensible de excavación con balde frontal de 1.0 m3 y tracción integral.'
      },
      {
        id: 'cat_mixer_ct660',
        modelName: 'Camión Trompo Mixer CAT CT660 (8 m³)',
        category: 'camion_mixer',
        icon: '🚚',
        ratingStars: 5,
        priceHNL: 2150000,
        hourlyFuelCost: 210,
        description: 'Tambor mezclador hidráulico de alto rendimiento para concreto premezclado en obra.'
      },
      {
        id: 'cat_grua_potain',
        modelName: 'Grúa Torre Automontable Potain MC 85',
        category: 'grua_torre',
        icon: '🏗️',
        ratingStars: 5,
        priceHNL: 3100000,
        hourlyFuelCost: 260,
        description: 'Alcance de pluma de 50 metros y capacidad de elevación de hasta 5 toneladas.'
      }
    ]
  },
  {
    id: 'camosa_komatsu',
    name: 'CAMOSA · Komatsu & John Deere',
    city: 'San Pedro Sula / Choloma',
    ratingStars: 5,
    tagline: 'Ingeniería japonesa y estadounidense de alto rendimiento para infraestructura pesada',
    reputationDiscountPct: 0.04,
    catalog: [
      {
        id: 'komatsu_retro_wb97',
        modelName: 'Retroexcavadora Komatsu WB97R-5',
        category: 'retroexcavadora_4x4',
        icon: '🚜',
        ratingStars: 5,
        priceHNL: 1750000,
        hourlyFuelCost: 175,
        description: 'Sistema hidráulico HydrauMind con control sensible a la carga y bajo consumo.'
      },
      {
        id: 'komatsu_volqueta_hd325',
        modelName: 'Volqueta Komatsu HD325 (14 m³)',
        category: 'volqueta_14m3',
        icon: '🚛',
        ratingStars: 5,
        priceHNL: 2280000,
        hourlyFuelCost: 215,
        description: 'Chasis robusto con transmisión automática K-Atomics para acarreo continuo.'
      },
      {
        id: 'jd_motoniveladora_670g',
        modelName: 'Motoniveladora John Deere 670G',
        category: 'motoniveladora',
        icon: '🚧',
        ratingStars: 5,
        priceHNL: 2550000,
        hourlyFuelCost: 195,
        description: 'Cuchilla de 14 pies con transmisión Powershift para nivelación vial milimétrica.'
      }
    ]
  },
  {
    id: 'tmh_jcb',
    name: 'Tractores y Maquinaria Hondureña (TMH)',
    city: 'Tegucigalpa M.D.C.',
    ratingStars: 4,
    tagline: 'Líder en excavación y acarreo con marcas británicas y americanas JCB y Case',
    reputationDiscountPct: 0.03,
    catalog: [
      {
        id: 'jcb_retro_3cx',
        modelName: 'Retroexcavadora JCB 3CX Eco',
        category: 'retroexcavadora_4x4',
        icon: '🚜',
        ratingStars: 4,
        priceHNL: 1480000,
        hourlyFuelCost: 160,
        description: 'Motor diésel EcoMax sin filtro de partículas. Fácil mantenimiento y repuestos.'
      },
      {
        id: 'intl_volqueta_workstar',
        modelName: 'Volqueta International WorkStar 14 m³',
        category: 'volqueta_14m3',
        icon: '🚛',
        ratingStars: 4,
        priceHNL: 1820000,
        hourlyFuelCost: 190,
        description: 'Ejes tándem de 46,000 lbs con motor Navistar de alto torque.'
      },
      {
        id: 'mack_mixer_granite',
        modelName: 'Camión Mixer Mack Granite 8 m³',
        category: 'camion_mixer',
        icon: '🚚',
        ratingStars: 4,
        priceHNL: 1780000,
        hourlyFuelCost: 200,
        description: 'Chasis CornerCap reforzado ideal para vaciados de concreto masivo.'
      }
    ]
  },
  {
    id: 'distribuidora_sany',
    name: 'Distribuidora SANY / Dongfeng',
    city: 'San Pedro Sula (Bulevar del Sur)',
    ratingStars: 3,
    tagline: 'Equipos nuevos con excelente relación precio-calidad y entrega inmediata',
    reputationDiscountPct: 0.02,
    catalog: [
      {
        id: 'dongfeng_volqueta_kingrun',
        modelName: 'Volqueta Dongfeng Kingrun 14 m³',
        category: 'volqueta_14m3',
        icon: '🚛',
        ratingStars: 3,
        priceHNL: 1280000,
        hourlyFuelCost: 180,
        description: 'Motor Cummins ISDe 270 con caja Eaton de 9 velocidades. Económica y fiable.'
      },
      {
        id: 'sany_retro_bhl75',
        modelName: 'Retroexcavadora Sany BHL75',
        category: 'retroexcavadora_4x4',
        icon: '🚜',
        ratingStars: 3,
        priceHNL: 1180000,
        hourlyFuelCost: 155,
        description: 'Estructura ROPS/FOPS certificada con joystick electrohidráulico.'
      },
      {
        id: 'sany_mixer_sy306',
        modelName: 'Camión Mixer Sany SY306C (6 m³)',
        category: 'camion_mixer',
        icon: '🚚',
        ratingStars: 3,
        priceHNL: 1390000,
        hourlyFuelCost: 170,
        description: 'Tambor de acero especial antidesgaste para obras comerciales y pavimentación.'
      }
    ]
  },
  {
    id: 'central_usadas',
    name: 'Concesionaria Central de Equipos Usados',
    city: 'Comayagua / Siguatepeque',
    ratingStars: 2,
    tagline: 'Maquinaria seminueva y reconstruida para contratistas que inician',
    reputationDiscountPct: 0.0,
    catalog: [
      {
        id: 'fl_volqueta_columbia_used',
        modelName: 'Volqueta Freightliner Columbia Usada (14 m³)',
        category: 'volqueta_14m3',
        icon: '🚛',
        ratingStars: 2,
        priceHNL: 780000,
        hourlyFuelCost: 240,
        description: 'Motor Detroit DD13 reconstruido en taller local con tolva reacondicionada.'
      },
      {
        id: 'case_retro_580m_used',
        modelName: 'Retroexcavadora Case 580M Reconstruida',
        category: 'retroexcavadora_4x4',
        icon: '🚜',
        ratingStars: 2,
        priceHNL: 690000,
        hourlyFuelCost: 210,
        description: 'Bomba hidráulica nueva con pasadores y bujes reemplazados.'
      }
    ]
  }
];

/**
 * Catálogo de Fabricantes para Licitación Mayorista de Materiales (1 a 5 Estrellas)
 */
export const DEFAULT_MANUFACTURER_QUOTES: MaterialManufacturerQuote[] = [
  {
    id: 'fab-cemento-bijao',
    manufacturerName: 'Cementos del Norte (Bijao)',
    materialId: 'cemento_gris',
    ratingStars: 5,
    unitCost: 222, // L 222 vs L 240 estándar
    discountPct: 7.5,
    minBatchUnits: 300,
    deliveryDays: 1,
    qualityBadge: 'Norma ASTM C150 Tipo I/II (Máxima resistencia a 28 días)'
  },
  {
    id: 'fab-cemento-argos',
    manufacturerName: 'Cementos Argos Honduras',
    materialId: 'cemento_gris',
    ratingStars: 4,
    unitCost: 228,
    discountPct: 5.0,
    minBatchUnits: 200,
    deliveryDays: 1,
    qualityBadge: 'Certificación ISO 9001 con adición puzolánica estructural'
  },
  {
    id: 'fab-acero-acenca',
    manufacturerName: 'Aceros de Centroamérica (ACENCA)',
    materialId: 'varilla_acero',
    ratingStars: 5,
    unitCost: 1070, // L 1,070 vs L 1,150 estándar
    discountPct: 7.0,
    minBatchUnits: 80,
    deliveryDays: 2,
    qualityBadge: 'Acero Grado 60 Sismo-Resistente certificado ASTM A615'
  },
  {
    id: 'fab-acero-siderurgica',
    manufacturerName: 'Siderúrgica del Sur',
    materialId: 'varilla_acero',
    ratingStars: 4,
    unitCost: 1100,
    discountPct: 4.3,
    minBatchUnits: 50,
    deliveryDays: 2,
    qualityBadge: 'Varilla corrugada laminada en caliente de alta soldabilidad'
  },
  {
    id: 'fab-bloques-cortes',
    manufacturerName: 'Bloqueras Industriales de Cortés',
    materialId: 'bloque_concreto',
    ratingStars: 5,
    unitCost: 13500, // L 13,500 vs L 14,500 estándar
    discountPct: 6.9,
    minBatchUnits: 15,
    deliveryDays: 2,
    qualityBadge: 'Bloque curado al vapor con resistencia a compresión 120 kg/cm²'
  },
  {
    id: 'fab-bloques-artesanal',
    manufacturerName: 'Bloquera El Roble',
    materialId: 'bloque_concreto',
    ratingStars: 3,
    unitCost: 12600,
    discountPct: 13.0,
    minBatchUnits: 10,
    deliveryDays: 1,
    qualityBadge: 'Bloque comercial estándar para muros perimetrales'
  },
  {
    id: 'fab-tablas-forestal',
    manufacturerName: 'Maderera Forestal del Valle',
    materialId: 'tabla_encofrado',
    ratingStars: 4,
    unitCost: 1720, // L 1,720 vs L 1,850 estándar
    discountPct: 7.0,
    minBatchUnits: 25,
    deliveryDays: 1,
    qualityBadge: 'Pino Oocarpa cepillado y tratado para múltiples vaciados de encofrado'
  },
  {
    id: 'fab-arena-rio-blanco',
    manufacturerName: 'Cantera y Agregados Río Blanco',
    materialId: 'arena_grava',
    ratingStars: 5,
    unitCost: 375, // L 375 vs L 420 estándar
    discountPct: 10.7,
    minBatchUnits: 100,
    deliveryDays: 1,
    qualityBadge: 'Arena de río lavada y clasificada por granulometría ASTM C33'
  }
];

/**
 * Compra de Maquinaria Pesada en Concesionaria
 */
export function buyMachineryUnit(
  state: DailySimulationState,
  dealerId: string,
  machineryId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const dealer = state.machineryDealers.find(d => d.id === dealerId);
  if (!dealer) return { updatedState: state, success: false, message: 'Concesionaria no encontrada.' };

  const item = dealer.catalog.find(c => c.id === machineryId);
  if (!item) return { updatedState: state, success: false, message: 'Equipo no disponible en el catálogo.' };

  const price = item.priceHNL;
  const availableLiquidity = state.storeBankBalance + state.storeCash;

  if (availableLiquidity < price) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes. El equipo cuesta L ${price.toLocaleString()} (disponible: L ${availableLiquidity.toLocaleString()}). Puedes solicitar un préstamo en cualquiera de los 4 bancos competidores.`
    };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= price) {
    newBank -= price;
  } else {
    const rem = price - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const newUnit: OwnedMachineryUnit = {
    id: `mach-${Date.now().toString().slice(-4)}`,
    dealerId: dealer.id,
    dealerName: dealer.name,
    modelName: item.modelName,
    category: item.category,
    icon: item.icon,
    ratingStars: item.ratingStars,
    purchasePrice: item.priceHNL,
    conditionPct: 100,
    totalHoursWorked: 0,
    hourlyFuelCost: item.hourlyFuelCost
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      ownedMachinery: [...(state.ownedMachinery || []), newUnit],
      storeReputation: Math.min(100, state.storeReputation + 2)
    },
    success: true,
    message: `¡EQUIPO ADQUIRIDO! Has comprado "${item.modelName}" en ${dealer.name}. Se integró a tu flota propia de maquinaria, reduciendo los costos de alquiler en todas tus obras.`
  };
}

/**
 * Licitación Directa de Materiales con Fabricante
 */
export function orderFromMaterialManufacturer(
  state: DailySimulationState,
  quoteId: string,
  batchUnits: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const quote = (state.materialManufacturerQuotes || DEFAULT_MANUFACTURER_QUOTES).find(q => q.id === quoteId);
  if (!quote) return { updatedState: state, success: false, message: 'Cotización no encontrada.' };

  if (batchUnits < quote.minBatchUnits) {
    return {
      updatedState: state,
      success: false,
      message: `El pedido mínimo para esta licitación mayorista es de ${quote.minBatchUnits} unidades.`
    };
  }

  const totalCost = batchUnits * quote.unitCost;
  const available = state.storeBankBalance + state.storeCash;

  if (available < totalCost) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes. Se requieren L ${totalCost.toLocaleString()} (disponible: L ${available.toLocaleString()}).`
    };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= totalCost) {
    newBank -= totalCost;
  } else {
    const rem = totalCost - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const newOrder: ConstructionMaterialOrder = {
    id: `ord-fab-${Date.now().toString().slice(-4)}`,
    materialId: quote.materialId,
    materialName: `${quote.materialId} (${quote.manufacturerName})`,
    units: batchUnits,
    unitCost: quote.unitCost,
    totalCost,
    daysRemaining: quote.deliveryDays,
    orderDate: `Día ${state.currentDay}, Mes ${state.currentMonth}`
  };

  const updatedSar = {
    ...state.sarTaxRecord,
    deductibleMaterialsExpenses: state.sarTaxRecord.deductibleMaterialsExpenses + totalCost
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      constructionOrders: [...(state.constructionOrders || []), newOrder],
      sarTaxRecord: updatedSar
    },
    success: true,
    message: `¡Contrato de Suministro adjudicado a ${quote.manufacturerName}! Pedido de ${batchUnits} unidades procesado por L ${totalCost.toLocaleString()} (Ahorro del ${quote.discountPct}%). Llegada en ${quote.deliveryDays} día(s).`
  };
}
