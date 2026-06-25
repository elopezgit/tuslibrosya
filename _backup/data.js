// ─── INDUSTRY TEMPLATES ──────────────────────────────────────────
const INDUSTRY_TEMPLATES = {
  gastronomia: {
    label: 'Gastronomía',
    icon: '🍽️',
    heroTag: 'Pedí online',
    heroTitle: '¿Qué se te antoja hoy?',
    heroDesc: 'Elegí del catálogo y recibilo en casa o retiralo por el local.',
    searchPlaceholder: 'Buscá tu pizza, empanada...',
    cartLabel: 'Tu pedido',
    checkoutLabel: 'Enviar pedido por WhatsApp',
    checkoutIcon: '📲',
    promoLabel: 'Promociones',
    categoriesLabel: 'Categorías',
    menuLabel: 'Menú',
    featuredLabel: 'Los más pedidos',
    emptyCart: 'Tu carrito está vacío',
    emptyCartSub: 'Navegá por el menú y agregá productos para armar tu pedido',
    orderMsgPrefix: 'NUEVO PEDIDO',
    deliveryToggle: true,
    unitLabel: 'unidad',
    hasPackSelector: true,
    hasCrossSell: true,
    hasScheduledOrders: false,
    hasPrices: true,
    categories: [
      { id: 'todos', name: 'Ver Todo', emoji: '🍽️', subtitle: 'Menú completo', span2: true },
      { id: 'pizzas', name: 'Pizzas', emoji: '🍕', subtitle: 'Gourmet', tall: true },
      { id: 'empanadas', name: 'Empanadas', emoji: '🥟', subtitle: 'Packs' },
      { id: 'bebidas', name: 'Bebidas', emoji: '🥤', subtitle: 'Heladas' },
      { id: 'postres', name: 'Postres', emoji: '🍰', subtitle: 'Caseros' }
    ]
  },
  perfumeria: {
    label: 'Perfumería',
    icon: '💄',
    heroTag: 'Catálogo digital',
    heroTitle: 'Elegí tu producto favorito',
    heroDesc: 'Explorá nuestro catálogo y solicitá lo que necesitás.',
    searchPlaceholder: 'Buscá por nombre o marca...',
    cartLabel: 'Tu solicitud',
    checkoutLabel: 'Enviar solicitud por WhatsApp',
    checkoutIcon: '💬',
    promoLabel: 'Ofertas',
    categoriesLabel: 'Categorías',
    menuLabel: 'Productos',
    featuredLabel: 'Lo más buscado',
    emptyCart: 'Tu solicitud está vacía',
    emptyCartSub: 'Agregá los productos que te interesan',
    orderMsgPrefix: 'SOLICITUD',
    deliveryToggle: false,
    unitLabel: 'unidad',
    hasPackSelector: false,
    hasCrossSell: true,
    hasScheduledOrders: false,
    hasPrices: true,
    categories: [
      { id: 'todos', name: 'Ver Todo', emoji: '✨', subtitle: 'Catálogo completo', span2: true },
      { id: 'perfumes', name: 'Perfumes', emoji: '🌸', subtitle: 'Fragancias', tall: true },
      { id: 'skincare', name: 'Skincare', emoji: '🧴', subtitle: 'Cuidado facial' },
      { id: 'maquillaje', name: 'Maquillaje', emoji: '💋', subtitle: 'Color' },
      { id: 'accesorios', name: 'Accesorios', emoji: '💎', subtitle: 'Complementos' }
    ]
  },
  mayorista: {
    label: 'Mayorista',
    icon: '📦',
    heroTag: 'Presupuestos online',
    heroTitle: 'Consultá precios y disponibilidad',
    heroDesc: 'Envianos tu solicitud y te armamos el presupuesto.',
    searchPlaceholder: 'Buscá por código o producto...',
    cartLabel: 'Tu presupuesto',
    checkoutLabel: 'Solicitar presupuesto',
    checkoutIcon: '📋',
    promoLabel: 'Ofertas especiales',
    categoriesLabel: 'Rubros',
    menuLabel: 'Catálogo mayorista',
    featuredLabel: 'Más consultados',
    emptyCart: 'Tu presupuesto está vacío',
    emptyCartSub: 'Agregá los productos que necesitás cotizar',
    orderMsgPrefix: 'SOLICITUD DE PRESUPUESTO',
    deliveryToggle: false,
    unitLabel: 'unidad',
    hasPackSelector: false,
    hasCrossSell: false,
    hasScheduledOrders: false,
    hasPrices: true,
    categories: [
      { id: 'todos', name: 'Ver Todo', emoji: '📦', subtitle: 'Catálogo completo', span2: true },
      { id: 'electrones', name: 'Electrónica', emoji: '📱', subtitle: 'Tecnología', tall: true },
      { id: 'indumentaria', name: 'Indumentaria', emoji: '👕', subtitle: 'Textil' },
      { id: 'alimentos', name: 'Alimentos', emoji: '🥫', subtitle: 'Comestibles' },
      { id: 'otros', name: 'Otros', emoji: '🔗', subtitle: 'Varios' }
    ]
  },
  servicios: {
    label: 'Servicios',
    icon: '🔧',
    heroTag: 'Solicitudes online',
    heroTitle: 'Pedí tu presupuesto sin llamadas',
    heroDesc: 'Completá el formulario y te contactamos.',
    searchPlaceholder: 'Buscá el servicio...',
    cartLabel: 'Tu solicitud',
    checkoutLabel: 'Enviar solicitud',
    checkoutIcon: '📩',
    promoLabel: 'Servicios destacados',
    categoriesLabel: 'Servicios',
    menuLabel: 'Nuestros servicios',
    featuredLabel: 'Más solicitados',
    emptyCart: 'Tu solicitud está vacía',
    emptyCartSub: 'Agregá los servicios que necesitás',
    orderMsgPrefix: 'SOLICITUD DE SERVICIO',
    deliveryToggle: false,
    unitLabel: 'servicio',
    hasPackSelector: false,
    hasCrossSell: false,
    hasScheduledOrders: true,
    hasPrices: false,
    categories: [
      { id: 'todos', name: 'Ver Todo', emoji: '🔧', subtitle: 'Todos', span2: true },
      { id: 'limpieza', name: 'Limpieza', emoji: '🧹', subtitle: 'Hogar', tall: true },
      { id: 'jardineria', name: 'Jardinería', emoji: '🌿', subtitle: 'Exteriores' },
      { id: 'plomeria', name: 'Plomería', emoji: '🚿', subtitle: 'Instalaciones' },
      { id: 'pintura', name: 'Pintura', emoji: '🎨', subtitle: 'Decoración' }
    ]
  },
  general: {
    label: 'General',
    icon: '🏪',
    heroTag: 'Tu negocio online',
    heroTitle: 'Explorá nuestro catálogo',
    heroDesc: 'Elegí lo que necesitás y envianos tu pedido.',
    searchPlaceholder: 'Buscá un producto...',
    cartLabel: 'Tu pedido',
    checkoutLabel: 'Enviar pedido por WhatsApp',
    checkoutIcon: '📲',
    promoLabel: 'Destacados',
    categoriesLabel: 'Categorías',
    menuLabel: 'Productos',
    featuredLabel: 'Destacados',
    emptyCart: 'Tu carrito está vacío',
    emptyCartSub: 'Agregá productos para armar tu pedido',
    orderMsgPrefix: 'PEDIDO',
    deliveryToggle: true,
    unitLabel: 'unidad',
    hasPackSelector: false,
    hasCrossSell: true,
    hasScheduledOrders: false,
    hasPrices: true,
    categories: [
      { id: 'todos', name: 'Ver Todo', emoji: '🏪', subtitle: 'Todo', span2: true },
      { id: 'tecnologia', name: 'Tecnología', emoji: '📱', subtitle: 'Gadgets', tall: true },
      { id: 'hogar', name: 'Hogar', emoji: '🛋️', subtitle: 'Deco' },
      { id: 'indumentaria', name: 'Indumentaria', emoji: '👕', subtitle: 'Vestimenta' },
      { id: 'deportes', name: 'Deportes', emoji: '⚽', subtitle: 'Fitness' }
    ]
  }
};

// ─── TENANT CONFIGURATION ────────────────────────────────────────
const TENANTS = {
  demo: {
    name: 'Tu Marca',
    phone: '+5493814767643',
    industry: 'general',
    theme: { brand: '#6C5CE7', brand2: '#00B894' },
    logo: 'img/logo/logo.png',
    address: 'Av. Siempre Viva 123, Tucumán',
    hours: 'Lun–Sáb 10:00–21:00',
    social: {
      instagram: 'https://instagram.com/tumarca',
      facebook: 'https://facebook.com/tumarca',
      whatsapp: '+5493814767643'
    },
    heroImage: '',
    menu: [
      // ── TECNOLOGÍA ──
      { id: 1, cat: 'tecnologia', name: 'Auriculares Bluetooth', desc: 'Sonido envolvente, batería de 40hs y cancelación de ruido activa', price: 12500, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', emoji: '🎧', tags: ['popular'], hot: true, rating: 4.8 },
      { id: 2, cat: 'tecnologia', name: 'Cargador Inalámbrico', desc: 'Carga rápida 15W compatible con todos los celulares', price: 4200, img: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', emoji: '🔋', tags: [], hot: false, rating: 4.6 },
      { id: 3, cat: 'tecnologia', name: 'Smartwatch Deportivo', desc: 'GPS, monitor cardíaco, resistencia al agua IP68', price: 18900, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', emoji: '⌚', tags: ['popular', 'pop'], hot: true, rating: 4.9 },
      { id: 4, cat: 'tecnologia', name: 'Parlante Portátil', desc: 'Sonido 360°, impermeable IPX7, 12hs de batería', price: 8700, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', emoji: '🔊', tags: [], hot: false, rating: 4.7 },
      { id: 5, cat: 'tecnologia', name: 'Mouse Ergonómico', desc: 'Diseño vertical, 4 DPI ajustables, conexión USB-C', price: 5400, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', emoji: '🖱️', tags: [], hot: false, rating: 4.5 },
      // ── HOGAR ──
      { id: 10, cat: 'hogar', name: 'Lámpara LED de Mesa', desc: 'Luz cálida regulable, carga USB, diseño minimalista', price: 6300, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400', emoji: '💡', tags: ['popular'], hot: true, rating: 4.7 },
      { id: 11, cat: 'hogar', name: 'Juego de Sábanas', desc: 'Algodón egipcio 400 hilos, king size, 4 piezas', price: 14500, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', emoji: '🛏️', tags: [], hot: false, rating: 4.8 },
      { id: 12, cat: 'hogar', name: 'Set de Cocina Antiadherente', desc: '3 piezas, revestimento cerámico, apta lavavajillas', price: 19800, img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', emoji: '🍳', tags: ['pop'], hot: true, rating: 4.9 },
      { id: 13, cat: 'hogar', name: 'Difusor de Aromas', desc: 'Ultrasonido, 7 luces LED, tanque de 300ml', price: 5100, img: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400', emoji: '🌿', tags: [], hot: false, rating: 4.6 },
      // ── INDUMENTARIA ──
      { id: 20, cat: 'indumentaria', name: 'Remera Oversize Algodón', desc: 'Algodón peinado 240gsm, colores surtidos, talle S-XL', price: 4800, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', emoji: '👕', tags: ['popular'], hot: true, rating: 4.7 },
      { id: 21, cat: 'indumentaria', name: 'Buzo con Capucha', desc: 'Fleece premium,forro interior, diseño unisex', price: 9200, img: 'https://images.unsplash.com/photo-1556821840-3a63f756006c?w=400', emoji: '🧥', tags: [], hot: false, rating: 4.8 },
      { id: 22, cat: 'indumentaria', name: 'Jeans Slim Fit', desc: 'Denim stretch, corte moderno, colores azul y negro', price: 7600, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', emoji: '👖', tags: ['popular'], hot: false, rating: 4.6 },
      { id: 23, cat: 'indumentaria', name: 'Gorra Trucker', desc: 'Malla transpirable, ajuste snapback, bordado frontal', price: 2900, img: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400', emoji: '🧢', tags: [], hot: false, rating: 4.5 },
      // ── DEPORTES ──
      { id: 30, cat: 'deportes', name: 'Mancuernas Ajustables', desc: 'De 2 a 20kg, sistema rápido de cambio, par', price: 22000, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', emoji: '🏋️', tags: ['popular', 'pop'], hot: true, rating: 4.9 },
      { id: 31, cat: 'deportes', name: 'Colchoneta Yoga', desc: 'Espuma EVA antideslizante, 6mm, con bolsa de transporte', price: 3400, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', emoji: '🧘', tags: [], hot: false, rating: 4.7 },
      { id: 32, cat: 'deportes', name: 'Botella Térmica 1L', desc: 'Acero inoxidable, mantiene frío 24hs / caliente 12hs', price: 4100, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', emoji: '🫗', tags: ['popular'], hot: false, rating: 4.8 },
      { id: 33, cat: 'deportes', name: 'Pelota Multiusos', desc: 'Goma de alta densidad, apta fútbol, vóley y handball', price: 2800, img: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400', emoji: '⚽', tags: [], hot: false, rating: 4.5 },
      // ── ACCESORIOS ──
      { id: 40, cat: 'accesorios', name: 'Mochila Urban', desc: 'Impermeable, puerto USB, compartimento laptop 15.6"', price: 8900, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', emoji: '🎒', tags: ['popular'], hot: true, rating: 4.8 },
      { id: 41, cat: 'accesorios', name: 'Lentes de Sol Polarizados', desc: 'Protección UV400, lente polarizado, armazón liviano', price: 5600, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', emoji: '🕶️', tags: [], hot: false, rating: 4.6 },
      { id: 42, cat: 'accesorios', name: 'Reloj Clásico', desc: 'Correa de cuarzo, caja de acero, resistente al agua', price: 11200, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', emoji: '⌚', tags: ['pop'], hot: true, rating: 4.9 },
      { id: 43, cat: 'accesorios', name: 'Billetera Cuero', desc: 'Cuero genuino, 12 compartimentos, RFID blocking', price: 4700, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', emoji: '👛', tags: [], hot: false, rating: 4.7 }
    ]
  }
};

// ─── LANDING PAGE COPY ──
const LANDING = {
  heroTag: 'Plataforma de gestión de pedidos',
  heroTitle: 'Cada solicitud es una venta que no podés perder',
  heroDesc: 'Organizá las consultas, pedidos y presupuestos de tus clientes en un solo lugar.',
  heroCtaPrimary: 'Creá tu sucursal gratis',
  heroCtaSecondary: 'Mirá cómo funciona',
  heroUsps: [
    'Sin comisiones por venta',
    'Listo en 24 horas',
    'Directo a tu WhatsApp'
  ],
  painTitle: '¿Cuántos pedidos se te escapan cada semana?',
  painPoints: [
    { icon: '📞', title: 'Consultas perdidas', desc: 'Los clientes preguntan por WhatsApp y no hay un catálogo claro para mostrarles.' },
    { icon: '📝', title: 'Pedidos desordenados', desc: 'Los mensajes se mezclan y los pedidos se pierden en el chat.' },
    { icon: '💰', title: 'Comisiones que duelen', desc: 'Las apps de delivery se quedan con hasta el 30% de cada venta.' }
  ],
  howTitle: '¿Cómo funciona?',
  howSubtitle: 'En 3 pasos tenés tu sucursal virtual funcionando.',
  howSteps: [
    { num: 1, icon: '📋', title: 'Nos enviás tu catálogo', desc: 'Productos, precios, fotos y categorías.' },
    { num: 2, icon: '⚡', title: 'Configuramos tu sucursal', desc: 'Con tu logo, colores y productos en 24 horas.' },
    { num: 3, icon: '📲', title: 'Empezá a recibir pedidos', desc: 'Directo a tu WhatsApp, sin comisiones.' }
  ],
  featuresTitle: 'Todo lo que necesitás para no perder ni una venta más',
  features: [
    { icon: '📱', title: 'Catálogo digital', desc: 'Mostrá todos tus productos con fotos, precios y descripciones.' },
    { icon: '🛵', title: 'Delivery y retiro', desc: 'El cliente elige cómo recibir su pedido.' },
    { icon: '💬', title: 'WhatsApp directo', desc: 'Cada pedido llega formateado a tu celular.' },
    { icon: '🏪', title: 'Sin comisiones', desc: 'No pagás porcentajes por ninguna venta.' }
  ],
  verticalsTitle: 'Funciona para lo que vos vendás',
  verticals: [
    { icon: '🍕', title: 'Gastronomía', desc: 'Restaurantes, pizzerías, rotiserías.' },
    { icon: '💄', title: 'Perfumería', desc: 'Cosméticos, fragancias, cuidado personal.' },
    { icon: '📦', title: 'Mayorista', desc: 'Distribuidores y venta por mayor.' },
    { icon: '🔧', title: 'Servicios', desc: 'Talleres, reparaciones, oficios.' },
    { icon: '🏪', title: 'Comercio general', desc: 'Indumentaria, tecnología, hogar.' }
  ],
  testimonialsTitle: 'Lo que dicen nuestros socios',
  testimonials: [
    { text: 'Pasamos de recibir pedidos desordenados por WhatsApp a tener todo organizado. Ahora no se nos escapa ni una venta.', avatar: '👩‍💼', name: 'Carolina Méndez', business: 'Perfumería Caro' },
    { text: 'Mis clientes usan la plataforma todos los días. Es muy fácil para ellos y para mí.', avatar: '👨‍🍳', name: 'Diego Ríos', business: 'Pizzería Don Diego' },
    { text: 'Lo mejor es que no pagamos comisión. Cada pedido es ganancia neta.', avatar: '👩‍🌾', name: 'Lucía Montenegro', business: 'Distribuidora LM' }
  ],
  pricingTitle: 'Empezá gratis. Escalá cuando quieras.',
  pricingSubtitle: 'Sin plazos fijos. Cancelá cuando quieras.',
  plans: [
    { name: 'Básico', price: 'Gratis', period: 'Siempre', desc: 'Perfecto para probar.', features: ['Catálogo digital', 'Categorías ilimitadas', 'Pedidos por WhatsApp', 'Cobro en efectivo'], cta: 'Empezar ahora', highlighted: false },
    { name: 'Profesional', price: '$9.900', period: '/mes', desc: 'Para negocios en crecimiento.', features: ['Todo lo de Básico', 'Personalización de colores', 'Productos destacados', 'Múltiples medios de pago', 'Banners promocionales'], cta: 'Lo quiero', highlighted: true },
    { name: 'Premium', price: '$19.900', period: '/mes', desc: 'Para sucursales con alto volumen.', features: ['Todo lo de Profesional', 'Múltiples sucursales', 'API de integración', 'Soporte prioritario 24/7', 'Reportes de ventas'], cta: 'Ir a Premium', highlighted: false }
  ],
  faqTitle: 'Preguntas frecuentes',
  faq: [
    { q: '¿Cuánto tarda en estar lista mi sucursal?', a: 'Entre 24 y 48 horas hábiles, dependiendo de la cantidad de productos.' },
    { q: '¿Puedo usar mi propio dominio?', a: 'Sí, en los planes Profesional y Premium podés vincular tu propio dominio.' },
    { q: '¿Hay límite de productos?', a: 'No. Podés agregar todos los productos que quieras.' },
    { q: '¿Cómo recibo los pedidos?', a: 'Cada pedido llega directo a tu WhatsApp con todos los detalles.' }
  ],
  finalCtaTitle: 'Unile a los negocios que ya no pierden pedidos',
  finalCtaDesc: 'Creá tu sucursal virtual gratis en menos de 5 minutos.',
  finalCtaButton: 'Empezá gratis ahora',
  footerAbout: 'La plataforma que convierte cada consulta en una venta. Sin comisiones. Sin apps externas.',
  footerProduct: 'Producto',
  footerProductLinks: ['Catálogo digital', 'Precios', 'FAQ'],
  footerCompany: 'Empresa',
  footerCompanyLinks: ['Blog', 'Contáctanos'],
  footerLegal: 'Legal',
  footerLegalLinks: ['Términos y condiciones', 'Privacidad']
};

// ─── GLOBALS ──────────────────────────────────────────────────────
let WA_NUMBER = TENANTS.demo.phone;
let MENU = TENANTS.demo.menu;
let CURRENT_INDUSTRY = TENANTS.demo.industry;
let ACTIVE_VIEW = 'storefront';
