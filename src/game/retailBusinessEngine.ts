import { 
  RetailProduct, 
  RetailSectorId, 
  RetailCustomerWalkIn, 
  SalesReceipt, 
  SupplierOrder, 
  DailySimulationState,
  WarehouseTier,
  WarehouseOwnership,
  WageLevel,
  TycoonVictoryType,
  RealEstateCollateralItem
} from './retroSimTypes';

export const SECTOR_DEFAULT_PRODUCTS: Record<RetailSectorId, RetailProduct[]> = {
  minimarket: [
    {
      id: 'prod-milk',
      name: 'Leche Entera / Deslactosada 1L',
      category: 'Lácteos & Frescos',
      icon: '🥛',
      stock: 45,
      unitCost: 22,
      sellingPrice: 32,
      supplierDeliveryDays: 1,
      minOrderUnits: 20,
      dailyDemandBase: 12,
      spoilageRatePct: 4
    },
    {
      id: 'prod-bread',
      name: 'Pan de Molde Blanco & Integral',
      category: 'Panadería',
      icon: '🍞',
      stock: 35,
      unitCost: 28,
      sellingPrice: 42,
      supplierDeliveryDays: 1,
      minOrderUnits: 15,
      dailyDemandBase: 10,
      spoilageRatePct: 6
    },
    {
      id: 'prod-soda',
      name: 'Refresco Familiar 2.5 Litros',
      category: 'Bebidas',
      icon: '🥤',
      stock: 60,
      unitCost: 38,
      sellingPrice: 58,
      supplierDeliveryDays: 2,
      minOrderUnits: 24,
      dailyDemandBase: 15,
      spoilageRatePct: 1
    },
    {
      id: 'prod-chips',
      name: 'Papas & Snacks Crunch 180g',
      category: 'Snacks & Golosinas',
      icon: '🍟',
      stock: 50,
      unitCost: 16,
      sellingPrice: 28,
      supplierDeliveryDays: 2,
      minOrderUnits: 30,
      dailyDemandBase: 14,
      spoilageRatePct: 1
    },
    {
      id: 'prod-coffee',
      name: 'Café Molido Gourmet 454g',
      category: 'Abarrotes',
      icon: '☕',
      stock: 30,
      unitCost: 75,
      sellingPrice: 115,
      supplierDeliveryDays: 3,
      minOrderUnits: 12,
      dailyDemandBase: 6,
      spoilageRatePct: 1
    },
    {
      id: 'prod-soap',
      name: 'Detergente Líquido Multiusos 1L',
      category: 'Hogar & Limpieza',
      icon: '🧼',
      stock: 40,
      unitCost: 45,
      sellingPrice: 72,
      supplierDeliveryDays: 3,
      minOrderUnits: 15,
      dailyDemandBase: 5,
      spoilageRatePct: 0
    }
  ],
  bar_restaurante: [
    {
      id: 'prod-beer',
      name: 'Cerveza Artesanal Draft / Botella',
      category: 'Bebidas & Licores',
      icon: '🍺',
      stock: 120,
      unitCost: 28,
      sellingPrice: 65,
      supplierDeliveryDays: 2,
      minOrderUnits: 48,
      dailyDemandBase: 35,
      spoilageRatePct: 2
    },
    {
      id: 'prod-burger',
      name: 'Hamburguesa Doble Angus & Papas',
      category: 'Cocina & Platos',
      icon: '🍔',
      stock: 50,
      unitCost: 65,
      sellingPrice: 160,
      supplierDeliveryDays: 1,
      minOrderUnits: 25,
      dailyDemandBase: 22,
      spoilageRatePct: 5
    },
    {
      id: 'prod-cocktail',
      name: 'Cóctel Mojito / Gin Tonic Premium',
      category: 'Coctelería',
      icon: '🍸',
      stock: 80,
      unitCost: 40,
      sellingPrice: 120,
      supplierDeliveryDays: 2,
      minOrderUnits: 30,
      dailyDemandBase: 18,
      spoilageRatePct: 2
    },
    {
      id: 'prod-wings',
      name: 'Alitas Glaseadas BBQ 12 Unidades',
      category: 'Entradas & Tapas',
      icon: '🍗',
      stock: 40,
      unitCost: 75,
      sellingPrice: 175,
      supplierDeliveryDays: 1,
      minOrderUnits: 20,
      dailyDemandBase: 16,
      spoilageRatePct: 6
    },
    {
      id: 'prod-nachos',
      name: 'Nachos Supremos con Queso y Guacamole',
      category: 'Entradas & Tapas',
      icon: '🧀',
      stock: 45,
      unitCost: 42,
      sellingPrice: 110,
      supplierDeliveryDays: 1,
      minOrderUnits: 20,
      dailyDemandBase: 15,
      spoilageRatePct: 4
    },
    {
      id: 'prod-dessert',
      name: 'Cheesecake Frutos Rojos / Café',
      category: 'Postres & Cafetería',
      icon: '🍰',
      stock: 25,
      unitCost: 35,
      sellingPrice: 85,
      supplierDeliveryDays: 2,
      minOrderUnits: 15,
      dailyDemandBase: 8,
      spoilageRatePct: 8
    }
  ],
  constructora: [
    {
      id: 'prod-cement',
      name: 'Cemento Portland Gris 42.5kg',
      category: 'Materiales Pesados',
      icon: '🧱',
      stock: 150,
      unitCost: 195,
      sellingPrice: 260,
      supplierDeliveryDays: 3,
      minOrderUnits: 50,
      dailyDemandBase: 25,
      spoilageRatePct: 1
    },
    {
      id: 'prod-rebar',
      name: 'Varilla Corrugada Grado 60 3/8"',
      category: 'Aceros & Estructura',
      icon: '🏗️',
      stock: 120,
      unitCost: 140,
      sellingPrice: 195,
      supplierDeliveryDays: 4,
      minOrderUnits: 40,
      dailyDemandBase: 18,
      spoilageRatePct: 0
    },
    {
      id: 'prod-blocks',
      name: 'Bloques de Concreto Estructural 6"',
      category: 'Mampostería',
      icon: '🧱',
      stock: 500,
      unitCost: 12,
      sellingPrice: 19,
      supplierDeliveryDays: 2,
      minOrderUnits: 200,
      dailyDemandBase: 80,
      spoilageRatePct: 2
    },
    {
      id: 'prod-paint',
      name: 'Cubeta Pintura Látex Blanco 5 Gal',
      category: 'Acabados & Pintura',
      icon: '🎨',
      stock: 35,
      unitCost: 650,
      sellingPrice: 980,
      supplierDeliveryDays: 3,
      minOrderUnits: 10,
      dailyDemandBase: 5,
      spoilageRatePct: 1
    },
    {
      id: 'prod-sand',
      name: 'Arena Fina de Río (Metro Cúbico)',
      category: 'Agregados',
      icon: '🏜️',
      stock: 40,
      unitCost: 320,
      sellingPrice: 480,
      supplierDeliveryDays: 2,
      minOrderUnits: 15,
      dailyDemandBase: 8,
      spoilageRatePct: 3
    },
    {
      id: 'prod-machinery',
      name: 'Mantenimiento & Combustible Maquinaria (Lote)',
      category: 'Equipos & Flete',
      icon: '🚜',
      stock: 20,
      unitCost: 1200,
      sellingPrice: 1950,
      supplierDeliveryDays: 2,
      minOrderUnits: 5,
      dailyDemandBase: 3,
      spoilageRatePct: 0
    }
  ],
  supermercado: [
    {
      id: 'prod-super-meat',
      name: 'Cortes de Res & Pollo Fresco (Lote 50kg)',
      category: 'Carnicería & Perecederos',
      icon: '🥩',
      stock: 40,
      unitCost: 2800,
      sellingPrice: 4200,
      supplierDeliveryDays: 1,
      minOrderUnits: 10,
      dailyDemandBase: 12,
      spoilageRatePct: 6
    },
    {
      id: 'prod-super-dairy',
      name: 'Lácteos, Yogures & Quesos Frescos (Caja)',
      category: 'Lácteos & Refrigerados',
      icon: '🧀',
      stock: 60,
      unitCost: 1200,
      sellingPrice: 1850,
      supplierDeliveryDays: 1,
      minOrderUnits: 15,
      dailyDemandBase: 18,
      spoilageRatePct: 5
    },
    {
      id: 'prod-super-grains',
      name: 'Granos Básicos: Frijol Rojo & Arroz (Quintal)',
      category: 'Granos & Alimentos Básicos',
      icon: '🌾',
      stock: 50,
      unitCost: 950,
      sellingPrice: 1400,
      supplierDeliveryDays: 2,
      minOrderUnits: 15,
      dailyDemandBase: 14,
      spoilageRatePct: 2
    },
    {
      id: 'prod-super-produce',
      name: 'Verduras, Hortalizas & Frutas Frescas (Cajas)',
      category: 'Frutas & Legumbres',
      icon: '🍎',
      stock: 45,
      unitCost: 750,
      sellingPrice: 1250,
      supplierDeliveryDays: 1,
      minOrderUnits: 20,
      dailyDemandBase: 22,
      spoilageRatePct: 8
    },
    {
      id: 'prod-super-clean',
      name: 'Detergentes, Cloro & Cuidado del Hogar (Pack)',
      category: 'Cuidado del Hogar',
      icon: '🧴',
      stock: 70,
      unitCost: 850,
      sellingPrice: 1350,
      supplierDeliveryDays: 3,
      minOrderUnits: 15,
      dailyDemandBase: 10,
      spoilageRatePct: 0
    }
  ],
  autolote: [
    {
      id: 'prod-auto-sedan',
      name: 'Sedán Familiar Japonés 1.6L 2023',
      category: 'Vehículos Nuevos & Seminuevos',
      icon: '🚗',
      stock: 8,
      unitCost: 260000,
      sellingPrice: 345000,
      supplierDeliveryDays: 5,
      minOrderUnits: 2,
      dailyDemandBase: 1,
      spoilageRatePct: 0
    },
    {
      id: 'prod-auto-pickup',
      name: 'Pickup Doble Cabina 4x4 Diésel 2024',
      category: 'Vehículos Comerciales & Trabajo',
      icon: '🛻',
      stock: 5,
      unitCost: 520000,
      sellingPrice: 675000,
      supplierDeliveryDays: 7,
      minOrderUnits: 1,
      dailyDemandBase: 1,
      spoilageRatePct: 0
    },
    {
      id: 'prod-auto-suv',
      name: 'Camioneta SUV 4x2 Automática 2022',
      category: 'SUVs & Familiares',
      icon: '🚙',
      stock: 6,
      unitCost: 340000,
      sellingPrice: 440000,
      supplierDeliveryDays: 5,
      minOrderUnits: 2,
      dailyDemandBase: 1,
      spoilageRatePct: 0
    },
    {
      id: 'prod-auto-truck',
      name: 'Camión Liviano 3.5 Toneladas Chasis',
      category: 'Transporte & Flotillas',
      icon: '🚛',
      stock: 3,
      unitCost: 480000,
      sellingPrice: 615000,
      supplierDeliveryDays: 8,
      minOrderUnits: 1,
      dailyDemandBase: 0.5,
      spoilageRatePct: 0
    },
    {
      id: 'prod-auto-tradein',
      name: 'Lote Vehículos Usados Retirados (Trade-in)',
      category: 'Trade-in & Valuaciones',
      icon: '🔄',
      stock: 4,
      unitCost: 140000,
      sellingPrice: 195000,
      supplierDeliveryDays: 1,
      minOrderUnits: 1,
      dailyDemandBase: 1,
      spoilageRatePct: 0
    }
  ]
};

const CUSTOMER_NAMES = [
  'Juan Carlos', 'Rosa María', 'Luis Fernando', 'Mirian Santos', 'José Antonio',
  'Carmen Leticia', 'Gabriel Paz', 'Silvia Reyes', 'Óscar Mendoza', 'Laura Nicole',
  'Eduardo Valle', 'Patricia Gómez', 'Wilmer Castro', 'Andrea Solís', 'Héctor Nuñez'
];

export interface DailyCustomerOptions {
  markupPct?: number; // 50% - 250%
  dailyMarketingSpend?: number; // Lempiras
  isStrikeActive?: boolean;
  unlockedTechs?: string[];
  employeeMorale?: number;
}

export function generateDailyStoreCustomers(
  sector: RetailSectorId,
  products: RetailProduct[],
  reputation: number,
  day: number,
  options?: DailyCustomerOptions
): RetailCustomerWalkIn[] {
  // Si hay huelga laboral activa, la atención queda totalmente paralizada
  if (options?.isStrikeActive) {
    return [];
  }

  const baseCustomerCount = Math.max(3, Math.round(5 + (reputation / 15) + Math.sin(day) * 2));

  // Factor de elasticidad de precios:
  const markup = options?.markupPct ?? 100;
  let elasticityFactor = 1.0;
  if (markup > 100) {
    // Si el precio sube demasiado, la demanda de los consumidores disminuye drásticamente
    elasticityFactor = Math.max(0.15, 1 - ((markup - 100) / 100) * 0.75);
  } else if (markup < 100) {
    // Precios con descuento aumentan la demanda masivamente
    elasticityFactor = 1 + ((100 - markup) / 100) * 0.65;
  }

  // Presupuesto de marketing: cada L 250 añade 1 cliente más (hasta +50/día)
  const marketingBonus = options?.dailyMarketingSpend ? Math.min(50, Math.floor(options.dailyMarketingSpend / 250)) : 0;

  // Tecnología de E-commerce: +35% de tráfico virtual
  const ecommerceBonus = options?.unlockedTechs?.includes('ecommerce_erp') ? 1.35 : 1.0;

  // Moral laboral alta (>75%): +15% de efectividad/atención
  const moraleBonus = (options?.employeeMorale ?? 80) >= 75 ? 1.15 : 1.0;

  const totalCustomerCount = Math.max(1, Math.round((baseCustomerCount * elasticityFactor * ecommerceBonus * moraleBonus) + marketingBonus));

  const queue: RetailCustomerWalkIn[] = [];
  const types: RetailCustomerWalkIn['customerType'][] = [
    'Estudiante', 'Trabajador', 'Familia', 'Empresario', 'Turista'
  ];

  for (let i = 0; i < totalCustomerCount; i++) {
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const cType = types[Math.floor(Math.random() * types.length)];
    const baseBudget = cType === 'Empresario' ? 8000 : cType === 'Familia' ? 1800 : cType === 'Trabajador' ? 650 : 250;
    const budget = Math.round(baseBudget * (markup > 120 ? 1.4 : 1.0));
    
    // Armar carrito según productos disponibles
    const cartItemsCount = Math.min(products.length, 1 + Math.floor(Math.random() * 3));
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const cart = [];

    for (let c = 0; c < cartItemsCount; c++) {
      const prod = shuffled[c];
      if (!prod) continue;
      const desiredUnits = Math.max(1, Math.min(5, Math.round(prod.dailyDemandBase / 3) || 1));
      const inStock = prod.stock >= desiredUnits;

      // Precio efectivo calculado con el markup de elasticidad
      const effectivePrice = Math.round(prod.sellingPrice * (markup / 100));

      cart.push({
        productId: prod.id,
        productName: prod.name,
        units: desiredUnits,
        unitPrice: effectivePrice,
        inStock
      });
    }

    queue.push({
      id: `walkin-${Date.now()}-${i}-${Math.random()}`,
      name,
      avatar: `avatar-${(i + day) % 15 + 1}`,
      customerType: cType,
      patience: 60 + Math.floor(Math.random() * 40),
      budget,
      cart,
      isServed: false,
      leftWithoutBuying: false
    });
  }

  return queue;
}

export function serveRetailCustomer(
  customer: RetailCustomerWalkIn,
  products: RetailProduct[],
  paymentMethod: 'efectivo' | 'tarjeta',
  day: number
): {
  updatedCustomer: RetailCustomerWalkIn;
  updatedProducts: RetailProduct[];
  receipt: SalesReceipt | null;
  revenue: number;
  cogs: number;
  reason?: string;
} {
  // Verificar si hay algún producto quebrado
  const hasOutOfStock = customer.cart.some(item => {
    const p = products.find(prod => prod.id === item.productId);
    return !p || p.stock < item.units;
  });

  if (hasOutOfStock) {
    return {
      updatedCustomer: {
        ...customer,
        isServed: true,
        leftWithoutBuying: true,
        leaveReason: 'Falta de inventario en mostrador (Quiebre de stock)'
      },
      updatedProducts: products,
      receipt: null,
      revenue: 0,
      cogs: 0,
      reason: 'El cliente no pudo comprar porque uno o más productos estaban agotados.'
    };
  }

  // Si todo está disponible, descontar inventario y emitir ticket
  let subtotal = 0;
  let totalCost = 0;
  let itemsCount = 0;

  const updatedProducts = products.map(prod => {
    const cartItem = customer.cart.find(c => c.productId === prod.id);
    if (cartItem) {
      subtotal += cartItem.units * prod.sellingPrice;
      totalCost += cartItem.units * prod.unitCost;
      itemsCount += cartItem.units;
      return {
        ...prod,
        stock: Math.max(0, prod.stock - cartItem.units)
      };
    }
    return prod;
  });

  const tax = Math.round(subtotal * 0.15); // 15% ISV Honduras
  const total = subtotal + tax;

  const receipt: SalesReceipt = {
    id: `REC-${Date.now().toString().slice(-6)}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day,
    customerName: customer.name,
    itemsCount,
    subtotal,
    tax,
    total,
    costOfGoods: totalCost,
    paymentMethod
  };

  return {
    updatedCustomer: {
      ...customer,
      isServed: true,
      leftWithoutBuying: false
    },
    updatedProducts,
    receipt,
    revenue: total,
    cogs: totalCost
  };
}

export const WAREHOUSE_CONFIG: Record<WarehouseTier, {
  name: string;
  capacity: number;
  dailyRent: number;
  purchasePrice: number;
  description: string;
  icon: string;
}> = {
  garaje: {
    name: 'Garaje / Local Pequeño',
    capacity: 100,
    dailyRent: 450,
    purchasePrice: 450000,
    description: 'Espacio inicial limitado a 100 unidades de inventario.',
    icon: '🏚️'
  },
  bodega: {
    name: 'Bodega Comercial Urbana',
    capacity: 500,
    dailyRent: 1200,
    purchasePrice: 1400000,
    description: 'Almacén con estanterías industriales para 500 unidades.',
    icon: '🏬'
  },
  fabrica: {
    name: 'Fábrica & Centro Distribución Regional',
    capacity: 2500,
    dailyRent: 3500,
    purchasePrice: 4800000,
    description: 'Complejo logístico de alta capacidad (2,500 unidades).',
    icon: '🏭'
  },
  mega_fabrica: {
    name: 'Mega-Complejo Industrial Internacional',
    capacity: 10000,
    dailyRent: 9000,
    purchasePrice: 15000000,
    description: 'Mega-parque industrial automatizado (10,000 unidades).',
    icon: '🌐'
  }
};

export interface TycoonTechItem {
  id: string;
  name: string;
  category: 'operaciones' | 'logistica' | 'comercial' | 'expansion';
  costHNL: number;
  description: string;
  icon: string;
  bonusSummary: string;
}

export const TYCOON_TECH_TREE: TycoonTechItem[] = [
  {
    id: 'automatizacion_pos',
    name: 'Cajero Automático & POS Inteligente',
    category: 'operaciones',
    costHNL: 40000,
    description: 'Terminales de cobro autónomo. Reduce costos de nómina en 15% y permite atención automática.',
    icon: '🤖',
    bonusSummary: '-15% nómina mensual y desbloqueo de Atención Automática en Caja'
  },
  {
    id: 'optimizacion_materiales',
    name: 'Optimización de Materiales & JIT',
    category: 'logistica',
    costHNL: 75000,
    description: 'Gestión logística avanzada. Elimina mermas y desperdicios negociando compras por volumen.',
    icon: '⚙️',
    bonusSummary: '-20% de costo en pedidos de compras a proveedores y 0% mermas'
  },
  {
    id: 'linea_premium',
    name: 'Línea Exclusiva Corporativa',
    category: 'comercial',
    costHNL: 140000,
    description: 'Lanza una línea de productos o contratos de lujo con margen triplicado.',
    icon: '💎',
    bonusSummary: 'Desbloquea artículos de alta gama con margen bruto del 65%'
  },
  {
    id: 'ecommerce_erp',
    name: 'Plataforma E-Commerce & Logística Digital',
    category: 'comercial',
    costHNL: 220000,
    description: 'Apertura de canal de venta virtual con entregas a nivel nacional.',
    icon: '🛒',
    bonusSummary: '+35% de afluencia de clientes de alto ticket a nivel nacional'
  },
  {
    id: 'expansion_franquicias',
    name: 'Modelo de Franquicias y Licencias',
    category: 'expansion',
    costHNL: 400000,
    description: 'Expande la marca otorgando derechos de franquicia en otras ciudades.',
    icon: '🏢',
    bonusSummary: '+L 5,000 / día en regalías netas pasivas'
  }
];

export const SECTOR_PREMIUM_PRODUCTS: Record<RetailSectorId, RetailProduct> = {
  minimarket: {
    id: 'prod-premium-gourmet',
    name: 'Canasta Gourmet Importada & Vinos',
    category: 'Línea Premium',
    icon: '🍾',
    stock: 12,
    unitCost: 350,
    sellingPrice: 1050,
    supplierDeliveryDays: 2,
    minOrderUnits: 2,
    dailyDemandBase: 4,
    spoilageRatePct: 0
  },
  supermercado: {
    id: 'prod-premium-cuts',
    name: 'Cortes Finos Angus & Delicatessen',
    category: 'Línea Premium',
    icon: '🥩',
    stock: 15,
    unitCost: 450,
    sellingPrice: 1350,
    supplierDeliveryDays: 2,
    minOrderUnits: 3,
    dailyDemandBase: 5,
    spoilageRatePct: 0
  },
  autolote: {
    id: 'prod-premium-luxury',
    name: 'Sedán Ejecutivo Alemán Blindado Nivel IV',
    category: 'Línea Premium',
    icon: '🏎️',
    stock: 2,
    unitCost: 800000,
    sellingPrice: 2400000,
    supplierDeliveryDays: 6,
    minOrderUnits: 1,
    dailyDemandBase: 0.5,
    spoilageRatePct: 0
  },
  constructora: {
    id: 'prod-premium-tower',
    name: 'Lote Prefabricado Torre Penthouse Deluxe',
    category: 'Línea Premium',
    icon: '🏙️',
    stock: 3,
    unitCost: 650000,
    sellingPrice: 1950000,
    supplierDeliveryDays: 5,
    minOrderUnits: 1,
    dailyDemandBase: 1,
    spoilageRatePct: 0
  },
  bar_restaurante: {
    id: 'prod-premium-champagne',
    name: 'Cava Exclusiva Champagne Francés',
    category: 'Línea Premium',
    icon: '🥂',
    stock: 8,
    unitCost: 600,
    sellingPrice: 1800,
    supplierDeliveryDays: 2,
    minOrderUnits: 2,
    dailyDemandBase: 2,
    spoilageRatePct: 0
  }
};

export function orderFromSupplier(
  productId: string,
  units: number,
  products: RetailProduct[],
  storeCash: number,
  unlockedTechs?: string[]
): {
  updatedProducts: RetailProduct[];
  order: SupplierOrder | null;
  newCash: number;
  error?: string;
} {
  const prod = products.find(p => p.id === productId);
  if (!prod) return { updatedProducts: products, order: null, newCash: storeCash, error: 'Producto no encontrado' };

  if (units < prod.minOrderUnits) {
    return {
      updatedProducts: products,
      order: null,
      newCash: storeCash,
      error: `El pedido mínimo para ${prod.name} es de ${prod.minOrderUnits} unidades.`
    };
  }

  // Descuento del 20% si desbloqueó Optimización de Materiales
  const hasOptimization = unlockedTechs?.includes('optimizacion_materiales');
  const effectiveCost = hasOptimization ? Math.round(prod.unitCost * 0.8) : prod.unitCost;
  const totalCost = units * effectiveCost;

  if (storeCash < totalCost) {
    return {
      updatedProducts: products,
      order: null,
      newCash: storeCash,
      error: `Fondos insuficientes en caja. Requieres L ${totalCost.toLocaleString()} y dispones de L ${storeCash.toLocaleString()}.`
    };
  }

  const order: SupplierOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    productId: prod.id,
    productName: prod.name,
    units,
    unitCost: effectiveCost,
    totalCost,
    daysRemaining: prod.supplierDeliveryDays,
    orderDate: new Date().toLocaleDateString()
  };

  return {
    updatedProducts: products,
    order,
    newCash: storeCash - totalCost
  };
}

export function advanceRetailDay(state: DailySimulationState): DailySimulationState {
  const nextDay = state.currentDay + 1;
  const isMonthEnd = nextDay > 30;
  const effectiveDay = isMonthEnd ? 1 : nextDay;
  const effectiveMonth = isMonthEnd ? (state.currentMonth === 12 ? 1 : state.currentMonth + 1) : state.currentMonth;
  const effectiveYear = isMonthEnd && state.currentMonth === 12 ? state.currentYear + 1 : state.currentYear;

  // Actualizar pedidos a proveedores en tránsito
  let newlyArrivedStock: { productId: string; units: number }[] = [];
  const remainingOrders: SupplierOrder[] = [];

  for (const ord of state.supplierOrders) {
    const nextDays = ord.daysRemaining - 1;
    if (nextDays <= 0) {
      newlyArrivedStock.push({ productId: ord.productId, units: ord.units });
    } else {
      remainingOrders.push({ ...ord, daysRemaining: nextDays });
    }
  }

  // Reabastecer productos con los pedidos recibidos
  let updatedProducts = state.products.map(prod => {
    const arrived = newlyArrivedStock.find(a => a.productId === prod.id);
    if (arrived) {
      return { ...prod, stock: prod.stock + arrived.units };
    }
    return prod;
  });

  // Asegurar producto premium si fue investigado
  if (state.unlockedTechs?.includes('linea_premium')) {
    const prem = SECTOR_PREMIUM_PRODUCTS[state.retailSector];
    if (prem && !updatedProducts.some(p => p.id === prem.id)) {
      updatedProducts.push(prem);
    }
  }

  // 1. Ejecución del Cajero Automático POS (Atención Automática)
  let dayReceipts = [...state.dailyReceipts];
  let autoCashAdded = 0;
  let autoBankAdded = 0;
  let autoServedCount = 0;

  if (state.autoCashierEnabled) {
    state.walkInQueue.forEach(cust => {
      if (!cust.isServed) {
        const payMethod: 'efectivo' | 'tarjeta' = Math.random() > 0.4 ? 'efectivo' : 'tarjeta';
        const res = serveRetailCustomer(cust, updatedProducts, payMethod, state.currentDay);
        updatedProducts = res.updatedProducts;
        if (res.receipt) {
          dayReceipts.push(res.receipt);
          if (payMethod === 'efectivo') autoCashAdded += res.revenue;
          else autoBankAdded += res.revenue;
          autoServedCount++;
        }
      }
    });
  }

  // 2. Capacidad de Inventario y Multa por Sobrealmacenamiento
  const currentTier = state.warehouseTier || 'garaje';
  const tierConfig = WAREHOUSE_CONFIG[currentTier];
  const maxCapacity = state.maxInventoryCapacity || tierConfig.capacity;
  const currentTotalUnits = updatedProducts.reduce((sum, p) => sum + p.stock, 0);
  let storagePenalty = 0;
  if (currentTotalUnits > maxCapacity) {
    const excess = currentTotalUnits - maxCapacity;
    storagePenalty = excess * 20; // L 20/unidad/día
  }

  // 3. Alquiler vs Compra (Inmueble propio en balance = L 0 alquiler)
  const isBuildingOwned = state.warehouseOwnership === 'propio';
  const dailyRent = isBuildingOwned ? 0 : Math.round(state.dailyRent || tierConfig.dailyRent);

  // 4. Salarios según Política Salarial (Mínimo, Competitivo, Premium) y Buff I+D
  const wageLevel = state.wageLevel || 'minimo';
  const baseMonthlyWage = wageLevel === 'premium' ? 17000 : wageLevel === 'competitivo' ? 14400 : 12000;
  let dailyWages = Math.round((state.staffCount * baseMonthlyWage) / 30);
  if (state.unlockedTechs?.includes('automatizacion_pos')) {
    dailyWages = Math.round(dailyWages * 0.85); // Ahorro del 15% en nómina
  }

  // 5. Presupuesto de Marketing diario
  const dailyMarketing = Math.max(0, state.dailyMarketingSpend || 0);

  // Gastos operativos totales
  const dailyOverhead = dailyWages + dailyRent + storagePenalty + dailyMarketing;

  // Totalizar ventas registradas hoy
  const daySalesTotal = dayReceipts.reduce((sum, r) => sum + r.total, 0);
  const dayCogsTotal = dayReceipts.reduce((sum, r) => sum + r.costOfGoods, 0);

  // 6. Regalías pasivas de Red de Franquicias
  const franchiseRoyalties = state.unlockedTechs?.includes('expansion_franquicias') ? 5000 : 0;

  // 7. Moral Laboral & Huelgas
  let currentMorale = state.employeeMorale ?? 80;
  let isStrikeActive = state.isStrikeActive || false;
  let strikeDaysRemaining = state.strikeDaysRemaining || 0;

  if (wageLevel === 'premium') {
    currentMorale = Math.min(100, currentMorale + 1.5);
  } else if (wageLevel === 'competitivo') {
    currentMorale = currentMorale < 75 ? Math.min(75, currentMorale + 0.8) : currentMorale;
  } else {
    currentMorale = Math.max(10, currentMorale - 1.2);
  }

  if (isStrikeActive) {
    strikeDaysRemaining -= 1;
    if (strikeDaysRemaining <= 0) {
      isStrikeActive = false;
      currentMorale = 45;
    }
  } else if (currentMorale < 35 && Math.random() < 0.30) {
    isStrikeActive = true;
    strikeDaysRemaining = 2;
  }

  const grossProfit = daySalesTotal - dayCogsTotal + franchiseRoyalties;
  const netDailyProfit = grossProfit - dailyOverhead;

  const newStoreCash = Math.max(0, state.storeCash + daySalesTotal + franchiseRoyalties - dailyOverhead);
  const newBankBalance = (state.storeBankBalance || 0) + autoBankAdded;

  // Eventos de auditoría
  const events = [
    `Ingresos brutos por ventas de mostrador: +L ${daySalesTotal.toLocaleString()} (${dayReceipts.length} tickets)`,
    `Costo de mercadería vendida (COGS): -L ${dayCogsTotal.toLocaleString()}`,
    `Nómina diaria (${state.staffCount} empleados a salario ${wageLevel}): -L ${dailyWages.toLocaleString()}`,
    isBuildingOwned ? `🏢 Inmueble Propio en Balance (L 0 alquiler)` : `Alquiler diario (${tierConfig.name}): -L ${dailyRent.toLocaleString()}`
  ];

  if (autoServedCount > 0) {
    events.push(`🤖 Cajero Automático POS cobró ${autoServedCount} compras desatendidas: +L ${(autoCashAdded + autoBankAdded).toLocaleString()}`);
  }

  if (storagePenalty > 0) {
    events.push(`⚠️ Almacén saturado (${currentTotalUnits}/${maxCapacity} uds). Multa por exceso de almacenamiento: -L ${storagePenalty.toLocaleString()}`);
  }

  if (dailyMarketing > 0) {
    events.push(`📢 Campaña publicitaria y mercadeo: -L ${dailyMarketing.toLocaleString()}`);
  }

  if (franchiseRoyalties > 0) {
    events.push(`🏢 Regalías diarias pasivas de Franquicias: +L 5,000`);
  }

  if (isStrikeActive) {
    events.push(`🚨 ¡HUELGA LABORAL ACTIVA! Operaciones paralizadas (${strikeDaysRemaining} días restantes).`);
  }

  if (newlyArrivedStock.length > 0) {
    const totalArrivedUnits = newlyArrivedStock.reduce((s, a) => s + a.units, 0);
    events.push(`¡Llegó pedido de proveedor! Se ingresaron ${totalArrivedUnits} unidades nuevas al inventario.`);
  }

  // Nueva cola de clientes para el siguiente día
  const newQueue = generateDailyStoreCustomers(
    state.retailSector, 
    updatedProducts, 
    state.storeReputation, 
    effectiveDay,
    {
      markupPct: state.pricingMarkupPct ?? 100,
      dailyMarketingSpend: state.dailyMarketingSpend ?? 0,
      isStrikeActive,
      unlockedTechs: state.unlockedTechs,
      employeeMorale: currentMorale
    }
  );

  const updatedHistory = [
    {
      day: state.currentDay,
      month: state.currentMonth,
      revenue: daySalesTotal + franchiseRoyalties,
      expenses: dayCogsTotal + dailyOverhead,
      netProfit: netDailyProfit,
      summary: `Día ${state.currentDay}: Ventas L ${(daySalesTotal + franchiseRoyalties).toLocaleString()}, Ganancia Neta L ${netDailyProfit.toLocaleString()}`
    },
    ...state.dailyHistory.slice(0, 29)
  ];

  const newMonthlySales = isMonthEnd ? daySalesTotal : (state.monthlySalesAccumulated || 0) + daySalesTotal;

  // Racha de meses consecutivos con EBITDA/flujo positivo
  const consecutiveMonths = isMonthEnd 
    ? (netDailyProfit >= 0 ? (state.consecutiveProfitableMonths || 0) + 1 : 0)
    : (state.consecutiveProfitableMonths || 0);

  // Verificación de Condiciones de Victoria Endgame
  let victoryAchieved = state.victoryAchieved;
  if (!victoryAchieved) {
    if ((state.companyValuationHNL || 0) >= 50000000 && consecutiveMonths >= 12) {
      victoryAchieved = 'ipo';
    } else if (state.activeCompetitors && state.activeCompetitors.length > 0 && state.activeCompetitors.every(c => c.isAcquired || c.status === 'adquirido_jugador')) {
      victoryAchieved = 'monopolio';
    } else if ((state.personalWealthHNL || 0) >= 10000000) {
      victoryAchieved = 'jubilacion';
    }
  }

  // Actualizar ofertas bancarias del banco inteligente según ventas acumuladas
  const updatedBankOffers = evaluateSmartBankOffers(newMonthlySales, state.smartBankOffers || DEFAULT_SMART_BANK_OFFERS);

  return {
    ...state,
    currentDay: effectiveDay,
    currentMonth: effectiveMonth,
    currentYear: effectiveYear,
    dailyHour: 9,
    isDayClosed: false,
    products: updatedProducts,
    supplierOrders: remainingOrders,
    walkInQueue: newQueue,
    dailyReceipts: [],
    storeCash: newStoreCash,
    storeBankBalance: newBankBalance,
    monthlySalesAccumulated: newMonthlySales,
    smartBankOffers: updatedBankOffers,
    dailyHistory: updatedHistory,
    warehouseTier: currentTier,
    warehouseOwnership: state.warehouseOwnership || 'alquiler',
    maxInventoryCapacity: maxCapacity,
    pricingMarkupPct: state.pricingMarkupPct ?? 100,
    dailyMarketingSpend: state.dailyMarketingSpend ?? 0,
    brandReputation: state.brandReputation ?? 50,
    employeeMorale: currentMorale,
    wageLevel,
    isStrikeActive,
    strikeDaysRemaining,
    consecutiveProfitableMonths: consecutiveMonths,
    victoryAchieved,
    lastClosingSummary: {
      revenue: daySalesTotal + franchiseRoyalties,
      cogs: dayCogsTotal,
      operatingCosts: dailyOverhead,
      netProfit: netDailyProfit,
      events
    }
  };
}

export const DEFAULT_SMART_BANK_OFFERS: import('./retroSimTypes').SmartBankFacility[] = [
  {
    id: 'fac-working-capital-1',
    title: 'Préstamo de Capital de Trabajo PyME',
    productType: 'prestamo_capital',
    amount: 50000,
    interestRateAnnual: 14.5,
    monthlyPayment: 4500,
    termMonths: 12,
    status: 'disponible',
    balanceRemaining: 50000,
    minMonthlySalesRequired: 8000,
    description: 'Inyección de liquidez directa a caja para compra masiva de inventario con descuento mayorista.'
  },
  {
    id: 'fac-credit-card-biz',
    title: 'Tarjeta de Crédito Corporativa Visa Business',
    productType: 'tarjeta_corporativa',
    amount: 30000,
    interestRateAnnual: 24.0,
    monthlyPayment: 1500,
    termMonths: 24,
    status: 'disponible',
    balanceRemaining: 30000,
    minMonthlySalesRequired: 5000,
    description: 'Línea de crédito rotativo para pagar compras a distribuidores y proveedores sin desembolsar efectivo inmediato.'
  },
  {
    id: 'fac-overdraft-line',
    title: 'Línea de Sobregiro Automático en Cuenta',
    productType: 'linea_sobregiro',
    amount: 15000,
    interestRateAnnual: 18.0,
    monthlyPayment: 850,
    termMonths: 6,
    status: 'disponible',
    balanceRemaining: 15000,
    minMonthlySalesRequired: 3000,
    description: 'Respaldo automático para evitar quiebres de caja al pagar nómina o alquiler comercial.'
  },
  {
    id: 'fac-expansion-loan',
    title: 'Crédito de Expansión y Remodelación de Local',
    productType: 'prestamo_capital',
    amount: 120000,
    interestRateAnnual: 12.0,
    monthlyPayment: 10800,
    termMonths: 12,
    status: 'disponible',
    balanceRemaining: 120000,
    minMonthlySalesRequired: 25000,
    description: 'Financiamiento mayor para duplicar capacidad de estanterías o abrir segundo punto de venta.'
  }
];

export function evaluateSmartBankOffers(
  monthlySales: number,
  currentOffers: import('./retroSimTypes').SmartBankFacility[]
): import('./retroSimTypes').SmartBankFacility[] {
  return currentOffers.map(offer => {
    // Si ya está activo o pagado, mantener estado
    if (offer.status !== 'disponible') return offer;
    return offer;
  });
}

export function acceptSmartBankFacility(
  state: DailySimulationState,
  facilityId: string
): { updatedState: DailySimulationState; message: string } {
  const offers = state.smartBankOffers || DEFAULT_SMART_BANK_OFFERS;
  const offer = offers.find(o => o.id === facilityId);
  if (!offer || offer.status !== 'disponible') {
    return { updatedState: state, message: 'Producto bancario no disponible.' };
  }

  const updatedOffers = offers.map(o => 
    o.id === facilityId ? { ...o, status: 'activo' as const } : o
  );

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: state.storeCash + offer.amount,
    smartBankOffers: updatedOffers
  };

  return {
    updatedState,
    message: `¡Desembolso aprobado por el Banco Aliado! Se han depositado L ${offer.amount.toLocaleString()} en la caja de tu empresa.`
  };
}

export function repaySmartBankFacility(
  state: DailySimulationState,
  facilityId: string,
  paymentAmount: number
): { updatedState: DailySimulationState; message: string; error?: string } {
  const offers = state.smartBankOffers || DEFAULT_SMART_BANK_OFFERS;
  const offer = offers.find(o => o.id === facilityId);
  if (!offer || offer.status !== 'activo') {
    return { updatedState: state, message: '', error: 'Este crédito no se encuentra activo.' };
  }

  if (state.storeCash < paymentAmount) {
    return {
      updatedState: state,
      message: '',
      error: `Fondos insuficientes en caja. Tienes L ${state.storeCash.toLocaleString()} y el pago es de L ${paymentAmount.toLocaleString()}.`
    };
  }

  const newBalance = Math.max(0, offer.balanceRemaining - paymentAmount);
  const isPaid = newBalance === 0;

  const updatedOffers = offers.map(o =>
    o.id === facilityId ? { ...o, balanceRemaining: newBalance, status: isPaid ? ('pagado' as const) : ('activo' as const) } : o
  );

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - paymentAmount,
      smartBankOffers: updatedOffers
    },
    message: isPaid 
      ? `¡Felicidades! Has cancelado por completo tu crédito de ${offer.title}. Tu historial financiero ha mejorado.`
      : `Se amortizaron L ${paymentAmount.toLocaleString()} a la facilidad bancaria. Saldo restante: L ${newBalance.toLocaleString()}.`
  };
}

// ----------------------------------------------------------------------------
// 5 Sistemas de Progresión Tycoon & Expansión Corporativa
// ----------------------------------------------------------------------------

export function buyBuilding(
  state: DailySimulationState
): { updatedState: DailySimulationState; error?: string } {
  if (state.warehouseOwnership === 'propio') {
    return { updatedState: state, error: 'Esta sede comercial ya es propiedad de la empresa.' };
  }

  const tier = state.warehouseTier || 'garaje';
  const tierConfig = WAREHOUSE_CONFIG[tier];
  const price = tierConfig.purchasePrice;

  if (state.storeCash < price) {
    return {
      updatedState: state,
      error: `Fondos insuficientes en caja. Requieres L ${price.toLocaleString()} y dispones de L ${state.storeCash.toLocaleString()}. Puedes solicitar un préstamo hipotecario en Bancos Comerciales.`
    };
  }

  const newCollateral: RealEstateCollateralItem = {
    id: `collat-property-${Date.now()}`,
    title: `Inmueble Comercial Propio: ${tierConfig.name}`,
    assetType: tier === 'fabrica' || tier === 'mega_fabrica' ? 'planta_industrial' : 'local_bodega',
    ownerName: state.storeName,
    companyName: state.storeName,
    description: `Propiedad titularidad de la empresa. Capacidad ${tierConfig.capacity} unidades. Registrada en catastro mercantil y libre de gravamen.`,
    location: 'Bulevar Morazán / Zona Industrial',
    status: 'disponible',
    acquisitionValueHNL: price,
    marketValueHNL: Math.round(price * 1.15),
    appraisalValueHNL: Math.round(price * 1.1),
    appraisalDate: `${state.currentDay}/${state.currentMonth}/${state.currentYear}`,
    ltvAcceptedPct: 80,
    eligibleCollateralValueHNL: Math.round(price * 1.1 * 0.8),
    liens: [],
    pledgedAmountTotal: 0,
    availableCoverageHNL: Math.round(price * 1.1 * 0.8),
    isPledged: false,
    isLockedForSale: false,
    registrationNumber: `REG-PROP-${Date.now()}`,
    simulatedDocumentNumber: `DOC-CAT-2026-${tier.toUpperCase()}`,
    situationNotes: 'Inmueble comercial propio libre de gravamen hipotecario.'
  };

  const currentProfile = state.companyCreditProfile || { 
    score: 650, 
    tier: 'A_BUENO' as const,
    tierLabel: 'A - Bueno',
    onTimePaymentsStreak: 3,
    lastBiweeklyReviewDay: 1,
    totalCreditLimit: 500000,
    creditUtilizationPct: 20,
    autoLimitIncreaseUnlocked: true,
    rateDiscountPct: 0,
    dtiRatioPct: 25
  };
  const updatedScore = Math.min(850, currentProfile.score + 90);
  const updatedTier = updatedScore >= 800 ? 'AAA_EXCELENTE' as const : updatedScore >= 740 ? 'AA_MUY_BUENO' as const : 'A_BUENO' as const;

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - price,
      warehouseOwnership: 'propio',
      dailyRent: 0,
      buildingAssetValue: price,
      realEstateCollaterals: [...(state.realEstateCollaterals || []), newCollateral],
      companyCreditProfile: {
        ...currentProfile,
        score: updatedScore,
        tier: updatedTier
      }
    }
  };
}

export function upgradeWarehouse(
  state: DailySimulationState,
  targetTier: WarehouseTier
): { updatedState: DailySimulationState; error?: string } {
  const currentTier = state.warehouseTier || 'garaje';
  if (currentTier === targetTier) {
    return { updatedState: state, error: 'Ya te encuentras en este nivel de sede.' };
  }

  const targetConfig = WAREHOUSE_CONFIG[targetTier];
  const relocationCost = Math.round(targetConfig.purchasePrice * 0.05);

  if (state.storeCash < relocationCost) {
    return {
      updatedState: state,
      error: `Fondos insuficientes para la mudanza y depósito del nuevo local. Requieres L ${relocationCost.toLocaleString()}.`
    };
  }

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - relocationCost,
      warehouseTier: targetTier,
      warehouseOwnership: 'alquiler',
      maxInventoryCapacity: targetConfig.capacity,
      dailyRent: targetConfig.dailyRent
    }
  };
}

export function unlockTech(
  state: DailySimulationState,
  techId: string
): { updatedState: DailySimulationState; error?: string } {
  const tech = TYCOON_TECH_TREE.find(t => t.id === techId);
  if (!tech) return { updatedState: state, error: 'Tecnología no encontrada.' };

  const currentUnlocked = state.unlockedTechs || [];
  if (currentUnlocked.includes(techId)) {
    return { updatedState: state, error: 'Esta investigación ya ha sido completada.' };
  }

  if (state.storeCash < tech.costHNL) {
    return {
      updatedState: state,
      error: `Fondos insuficientes en tesorería para financiar I+D. Requieres L ${tech.costHNL.toLocaleString()}.`
    };
  }

  const updatedProducts = [...state.products];
  if (techId === 'linea_premium') {
    const prem = SECTOR_PREMIUM_PRODUCTS[state.retailSector];
    if (prem && !updatedProducts.some(p => p.id === prem.id)) {
      updatedProducts.push(prem);
    }
  }

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - tech.costHNL,
      unlockedTechs: [...currentUnlocked, techId],
      products: updatedProducts,
      autoCashierEnabled: techId === 'automatizacion_pos' ? true : state.autoCashierEnabled
    }
  };
}

export function updatePricingMarkup(
  state: DailySimulationState,
  markupPct: number
): DailySimulationState {
  const clamped = Math.max(50, Math.min(250, markupPct));
  return {
    ...state,
    pricingMarkupPct: clamped
  };
}

export function updateMarketingSpend(
  state: DailySimulationState,
  spendHNL: number
): DailySimulationState {
  const clamped = Math.max(0, Math.min(25000, spendHNL));
  return {
    ...state,
    dailyMarketingSpend: clamped
  };
}

export function updateWagePolicy(
  state: DailySimulationState,
  wageLevel: WageLevel
): DailySimulationState {
  return {
    ...state,
    wageLevel
  };
}

export function resolveStrikeWithBonus(
  state: DailySimulationState
): { updatedState: DailySimulationState; error?: string } {
  if (!state.isStrikeActive) {
    return { updatedState: state, error: 'No hay ninguna huelga activa en este momento.' };
  }

  const bonusCost = state.staffCount * 2000;
  if (state.storeCash < bonusCost) {
    return {
      updatedState: state,
      error: `Fondos insuficientes para negociar el bono de emergencia. Requieres L ${bonusCost.toLocaleString()}.`
    };
  }

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - bonusCost,
      isStrikeActive: false,
      strikeDaysRemaining: 0,
      employeeMorale: 65,
      wageLevel: state.wageLevel === 'minimo' ? 'competitivo' : state.wageLevel
    }
  };
}

export function withdrawPersonalDividends(
  state: DailySimulationState,
  amountHNL: number
): { updatedState: DailySimulationState; error?: string; netReceived?: number; taxDeducted?: number } {
  if (amountHNL <= 0) {
    return { updatedState: state, error: 'El monto a retirar debe ser mayor a cero.' };
  }

  if (state.storeCash < amountHNL) {
    return {
      updatedState: state,
      error: `Caja insuficiente en la empresa. Tienes L ${state.storeCash.toLocaleString()} y deseas retirar L ${amountHNL.toLocaleString()}.`
    };
  }

  const taxDeducted = Math.round(amountHNL * 0.10);
  const netReceived = amountHNL - taxDeducted;
  const newWealth = (state.personalWealthHNL || 0) + netReceived;

  let victoryAchieved = state.victoryAchieved;
  if (newWealth >= 10000000 && !victoryAchieved) {
    victoryAchieved = 'jubilacion';
  }

  return {
    updatedState: {
      ...state,
      storeCash: state.storeCash - amountHNL,
      personalWealthHNL: newWealth,
      dividendsPaidYTD: (state.dividendsPaidYTD || 0) + amountHNL,
      victoryAchieved
    },
    netReceived,
    taxDeducted
  };
}

export function checkTycoonVictory(state: DailySimulationState): TycoonVictoryType | null {
  if ((state.companyValuationHNL || 0) >= 50000000 && (state.consecutiveProfitableMonths || 0) >= 12) {
    return 'ipo';
  }
  if (state.activeCompetitors && state.activeCompetitors.length > 0 && state.activeCompetitors.every(c => c.isAcquired || c.status === 'adquirido_jugador')) {
    return 'monopolio';
  }
  if ((state.personalWealthHNL || 0) >= 10000000) {
    return 'jubilacion';
  }
  return null;
}

export function executeIpoVictory(
  state: DailySimulationState
): { updatedState: DailySimulationState; error?: string } {
  const valuation = state.companyValuationHNL || 0;
  const profitableMonths = state.consecutiveProfitableMonths || 0;

  if (valuation < 50000000 || profitableMonths < 12) {
    return {
      updatedState: state,
      error: `No cumples los requisitos de la Bolsa de Valores: Valuación L ${valuation.toLocaleString()}/50,000,000 y Meses Rentables ${profitableMonths}/12.`
    };
  }

  return {
    updatedState: {
      ...state,
      victoryAchieved: 'ipo'
    }
  };
}

export function executeMonopolyVictory(
  state: DailySimulationState
): { updatedState: DailySimulationState; error?: string } {
  if (!state.activeCompetitors || state.activeCompetitors.length === 0 || !state.activeCompetitors.every(c => c.isAcquired || c.status === 'adquirido_jugador')) {
    return {
      updatedState: state,
      error: 'Debes adquirir al 100% de las 3 empresas competidoras del mercado para declarar el Monopolio.'
    };
  }

  return {
    updatedState: {
      ...state,
      victoryAchieved: 'monopolio',
      marketSharePct: 100
    }
  };
}

