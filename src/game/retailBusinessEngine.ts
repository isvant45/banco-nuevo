import { RetailProduct, RetailSectorId, RetailCustomerWalkIn, SalesReceipt, SupplierOrder, DailySimulationState } from './retroSimTypes';

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

export function generateDailyStoreCustomers(
  sector: RetailSectorId,
  products: RetailProduct[],
  reputation: number,
  day: number
): RetailCustomerWalkIn[] {
  const customerCount = Math.max(3, Math.round(5 + (reputation / 15) + Math.sin(day) * 2));
  const queue: RetailCustomerWalkIn[] = [];

  const types: RetailCustomerWalkIn['customerType'][] = [
    'Estudiante', 'Trabajador', 'Familia', 'Empresario', 'Turista'
  ];

  for (let i = 0; i < customerCount; i++) {
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const cType = types[Math.floor(Math.random() * types.length)];
    const budget = cType === 'Empresario' ? 8000 : cType === 'Familia' ? 1800 : cType === 'Trabajador' ? 650 : 250;
    
    // Armar carrito según productos disponibles
    const cartItemsCount = Math.min(products.length, 1 + Math.floor(Math.random() * 3));
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const cart = [];

    for (let c = 0; c < cartItemsCount; c++) {
      const prod = shuffled[c];
      if (!prod) continue;
      const desiredUnits = Math.max(1, Math.min(5, Math.round(prod.dailyDemandBase / 3) || 1));
      const inStock = prod.stock >= desiredUnits;

      cart.push({
        productId: prod.id,
        productName: prod.name,
        units: desiredUnits,
        unitPrice: prod.sellingPrice,
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

export function orderFromSupplier(
  productId: string,
  units: number,
  products: RetailProduct[],
  storeCash: number
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

  const totalCost = units * prod.unitCost;
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
    unitCost: prod.unitCost,
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
  const updatedProducts = state.products.map(prod => {
    const arrived = newlyArrivedStock.find(a => a.productId === prod.id);
    if (arrived) {
      return { ...prod, stock: prod.stock + arrived.units };
    }
    return prod;
  });

  // Gastos diarios fijos: sueldos y alquiler proporcional
  const dailyWages = Math.round((state.staffCount * 12000) / 30);
  const dailyRent = Math.round(state.dailyRent || 450);
  const dailyOverhead = dailyWages + dailyRent;

  // Totalizar ventas registradas hoy
  const daySalesTotal = state.dailyReceipts.reduce((sum, r) => sum + r.total, 0);
  const dayCogsTotal = state.dailyReceipts.reduce((sum, r) => sum + r.costOfGoods, 0);
  const grossProfit = daySalesTotal - dayCogsTotal;
  const netDailyProfit = grossProfit - dailyOverhead;

  const newStoreCash = Math.max(0, state.storeCash + daySalesTotal - dailyOverhead);

  // Eventos de auditoría
  const events = [
    `Ingresos brutos por ventas de mostrador: +L ${daySalesTotal.toLocaleString()} (${state.dailyReceipts.length} tickets)`,
    `Costo de mercadería vendida (COGS): -L ${dayCogsTotal.toLocaleString()}`,
    `Nómina diaria de personal (${state.staffCount} empleados): -L ${dailyWages.toLocaleString()}`,
    `Alquiler diario del local comercial: -L ${dailyRent.toLocaleString()}`
  ];

  if (newlyArrivedStock.length > 0) {
    const totalArrivedUnits = newlyArrivedStock.reduce((s, a) => s + a.units, 0);
    events.push(`¡Llegó pedido de proveedor! Se ingresaron ${totalArrivedUnits} unidades nuevas al inventario.`);
  }

  const newQueue = generateDailyStoreCustomers(state.retailSector, updatedProducts, state.storeReputation, effectiveDay);

  const updatedHistory = [
    {
      day: state.currentDay,
      month: state.currentMonth,
      revenue: daySalesTotal,
      expenses: dayCogsTotal + dailyOverhead,
      netProfit: netDailyProfit,
      summary: `Día ${state.currentDay}: Ventas L ${daySalesTotal.toLocaleString()}, Ganancia Neta L ${netDailyProfit.toLocaleString()}`
    },
    ...state.dailyHistory.slice(0, 29)
  ];

  const newMonthlySales = isMonthEnd ? daySalesTotal : (state.monthlySalesAccumulated || 0) + daySalesTotal;

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
    monthlySalesAccumulated: newMonthlySales,
    smartBankOffers: updatedBankOffers,
    dailyHistory: updatedHistory,
    lastClosingSummary: {
      revenue: daySalesTotal,
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

