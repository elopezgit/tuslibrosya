import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Search, Info, MapPin, Plus, Star, ChevronRight, Phone } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import CartModal from '../components/client/CartModal';
import ProductModal from '../components/client/ProductModal';
import OrderTrackerModal from '../components/client/OrderTrackerModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Empresa {
  id: string;
  name: string;
  phone: string;
  instagram_url: string;
  maps_url: string;
  logo_url?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_active: boolean;
}

interface Banner {
  id: string;
  image_url: string;
  link?: string;
}

export default function ClientHome() {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { items, setIsCartOpen, addToCart, clearCart } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const firstChild = scrollRef.current.children[0] as HTMLElement;
        const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 320; 
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const handleTouchStart = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      startAutoScroll();
    }, 5000);
  };

  useEffect(() => {
    async function loadData() {
      if (!empresaSlug) return;
      try {
        let { data: empData, error: empError } = await supabase
          .from('empresas')
          .select('*')
          .or(`slug.eq.${empresaSlug},slug.ilike.${empresaSlug}`)
          .eq('is_active', true)
          .maybeSingle();

        if (!empData) {
          const { data: fallbackEmp } = await supabase
            .from('empresas')
            .select('*')
            .ilike('name', '%libro%')
            .eq('is_active', true)
            .maybeSingle();
          empData = fallbackEmp;
        }

        if (empError) throw empError;
        if (!empData) throw new Error('La librería no existe o la base de datos no tiene datos cargados.');
        
        setEmpresa(empData);

        // Check for active order tracking
        const activeOrder = localStorage.getItem(`activeOrder_${empData.id}`);
        if (activeOrder) {
          setActiveOrderId(activeOrder);
        }

        const [cats, prods, bans] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', empData.id),
          supabase.from('products').select('*').eq('empresa_id', empData.id).eq('is_active', true),
          supabase.from('banners').select('*').eq('empresa_id', empData.id).eq('is_active', true)
        ]);

        if (cats.data) setCategories(cats.data);
        if (prods.data) setProducts(prods.data);
        if (bans.data) {
          // Sort banners by sort_order in memory so it doesn't crash if column doesn't exist yet
          const sortedBans = bans.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setBanners(sortedBans);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setShowSplash(false), 3500); // Dar más tiempo para la animación completa
      }
    }
    loadData();
  }, [empresaSlug]);



  if (loading || showSplash) {
    return (
      <AnimatePresence>
        <motion.div 
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="min-h-screen bg-mesh flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-mesh"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {/* Logo Animator */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="w-56 h-56 rounded-full shadow-[0_0_80px_rgba(236,1,0,0.25)] flex items-center justify-center p-3 mb-6 glass-strong animate-float"
            >
               <img loading="eager" decoding="async" src={empresa?.logo_url || "/img/logo/logo/logoNuevo.png"} alt="Tus Libros Ya Logo" className="w-full h-full object-contain rounded-full" onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 if (e.currentTarget.nextElementSibling) {
                   (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                 }
               }} />
               <h1 style={{display: 'none'}} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-yellow-600 leading-tight">TUS<br/><span className="text-xl text-slate-900">LIBROS</span><br/>YA</h1>
            </motion.div>

            {/* Phrase 1 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-2xl font-bold text-slate-900 mb-2 animate-fade-up stagger-2"
            >
              ¡Encontrá tu próximo libro!
            </motion.h2>


          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-strong p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-white/50">
          <Info size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Ops! Algo salió mal</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const normalizeText = (text?: string | null) => (text || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const getCategoryImageUrl = (categoryName: string, customImage?: string) => {
    if (customImage && (customImage.startsWith('http') || customImage.startsWith('/'))) {
      return customImage;
    }
    const norm = normalizeText(categoryName);
    if (norm.includes('todo')) return '/img/categorias/todas.jpg';
    if (norm.includes('literatura') || norm.includes('ficcion') || norm.includes('novela')) return '/img/categorias/literatura-ficcion.jpg';
    if (norm.includes('romance') || norm.includes('amor') || norm.includes('pasion')) return '/img/categorias/romance.jpg';
    if (norm.includes('policial') || norm.includes('thriller') || norm.includes('crimen') || norm.includes('misterio') || norm.includes('detective')) return '/img/categorias/policial-thriller.jpg';
    if (norm.includes('infantil') || norm.includes('juvenil') || norm.includes('nino') || norm.includes('cuento') || norm.includes('chicos')) return '/img/categorias/infantil-juvenil.jpg';
    if (norm.includes('negocio') || norm.includes('finanza') || norm.includes('empresa') || norm.includes('economia') || norm.includes('inversion')) return '/img/categorias/negocios-finanzas.jpg';
    if (norm.includes('biografia') || norm.includes('memoria') || norm.includes('historia')) return '/img/categorias/biografias-memorias.jpg';
    if (norm.includes('desarrollo') || norm.includes('autoayuda') || norm.includes('personal') || norm.includes('crecimiento') || norm.includes('habito')) return '/img/categorias/desarrollo-personal.jpg';
    if (norm.includes('ciencia ficcion') || norm.includes('fantasia') || norm.includes('sci-fi') || norm.includes('magia')) return '/img/categorias/ciencia-ficcion-fantasia.jpg';
    if (norm.includes('psicologia') || norm.includes('mente') || norm.includes('filosofia') || norm.includes('salud mental')) return '/img/categorias/psicologia-mente.jpg';
    if (norm.includes('terror') || norm.includes('suspenso') || norm.includes('miedo') || norm.includes('horror') || norm.includes('oscuro')) return '/img/categorias/terror-suspenso.jpg';
    return '/img/categorias/todas.jpg';
  };
  
  const filteredProducts = products.filter(p => {
    const normSearch = normalizeText(searchQuery);
    const normName = normalizeText(p.name);
    const normDesc = normalizeText(p.description);
    
    const matchesSearch = normName.includes(normSearch) || normDesc.includes(normSearch);
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const promosCategory = categories.find(c => c.name.toLowerCase().includes('promo'));
  const regularCategories = categories.filter(c => c.id !== promosCategory?.id);

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const fixedBanner: any = { id: 'fixed-1', image_url: '/img/Banner/bannertupedido.png', link: null };
  const displayBanners = [fixedBanner, ...banners];

  return (
    <div className="min-h-screen bg-[#F7F4F1] pb-24 font-sans text-slate-800">
      {/* 1. HERO HEADER */}
      <header className="glass-strong pt-6 pb-3 px-4 sticky top-0 z-40 border-b border-white/40 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
         <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden glass">
                <img loading="eager" decoding="async" src={empresa?.logo_url || "/img/logo/logo/logoNuevo.png"} alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }} />
                <span style={{display: 'none'}} className="text-sm font-black text-primary leading-none text-center">TLY</span>
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tight text-slate-900 font-display">{empresa.name}</h1>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                 <span className="flex items-center gap-1"><MapPin size={10} className="text-secondary"/> Envío a Domicilio</span>
               </div>
             </div>
          </div>
          
          {/* Social / Location Links */}
          <div className="flex items-center gap-2">
            <a 
              href={`https://wa.me/${empresa.phone?.replace(/\D/g, '') || ''}`}
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors border border-green-200"
            >
              <Phone size={16} />
            </a>
            <a 
              href={empresa.instagram_url || "#"} 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors border border-pink-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a 
              href={empresa.maps_url || "#"} 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <MapPin size={16} />
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="¿Qué libro estás buscando?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Active Order Tracker Button */}
        {activeOrderId && !searchQuery && (
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsTrackerOpen(true)}
            className="w-full mt-4 glass border border-primary/40 text-primary py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm shadow-[0_0_20px_rgba(236,1,0,0.15)] animate-pulse-glow"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Sigue tu pedido en vivo
            </div>
            <ChevronRight size={18} />
          </motion.button>
        )}
      </header>

      <main className="mt-2">
        {/* HERO INFO STORE - MODERN WITH AMBIENT VIDEO */}
        {!searchQuery && (
          <section className="px-4 pt-3 pb-2">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-slate-950 text-white min-h-[260px] md:min-h-[280px] flex flex-col justify-between p-6 sm:p-8 glass-dark"
            >
              {/* Background Ambient Video */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  preload="metadata"
                  poster="/img/Banner/bannertupedido.png"
                  className="w-full h-full object-cover opacity-40 scale-105 filter brightness-75 contrast-125"
                >
                  <source src="/video/books-ambient.webm" type="video/webm" />
                </video>
                {/* Rich Cinematic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Top Badge & Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-amber-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Showroom Abierto · Tucumán
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium bg-amber-950/40 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>Tu librería ideal</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="relative z-10 my-4 max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight font-display mb-2 drop-shadow-md">
                  El universo de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">próximas lecturas</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Libros nuevos, clásicos, usados y en consignación con asesoramiento personalizado y envíos a todo el país.
                </p>
              </div>

              {/* Highlights Chips Grid */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex items-center gap-2.5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-base shrink-0">
                    📚
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-medium">Catálogo</p>
                    <p className="text-xs font-bold text-white leading-tight">+500 Títulos</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex items-center gap-2.5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-base shrink-0">
                    🏪
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-medium">Modalidad</p>
                    <p className="text-xs font-bold text-white leading-tight">Mayor y Menor</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex items-center gap-2.5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-base shrink-0">
                    📦
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-medium">Despachos</p>
                    <p className="text-xs font-bold text-white leading-tight">Todo el país 🇦🇷</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex items-center gap-2.5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-base shrink-0">
                    📍
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-medium">Showroom</p>
                    <p className="text-xs font-bold text-white leading-tight">Galería Pezza L.42</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* 2. BANNERS CAROUSEL (Manual & Auto Scroll) */}
        {!searchQuery && (
          <section className="py-4 overflow-hidden relative group">
            <div 
              ref={scrollRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={handleTouchStart}
              onMouseLeave={handleTouchEnd}
              className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {displayBanners.map((banner) => {
                const isFixed = banner.image_url.includes('bannertupedido.png');
                return (
                  <a 
                    key={banner.id} 
                    href={banner.link || '#'} 
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 w-[85vw] max-w-[320px] md:w-80 h-40 rounded-3xl overflow-hidden relative border border-white/50 shadow-xl block bg-white snap-center glass"
                  >
                    <img loading="lazy" decoding="async" 
                      src={banner.image_url} 
                      alt="Promo" 
                      className={`w-full h-full ${isFixed ? 'object-contain' : 'object-cover opacity-80'}`} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    {banner.link && (
                      <div className="absolute bottom-4 left-4 bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-primary/30">
                        Ver más <ChevronRight size={14} />
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. CATEGORY SELECTOR (Circular Story Style) */}
        {!searchQuery && (
          <section className="px-4 mb-8">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Categorías</h2>
              {activeCategory !== 'todas' && (
                <button 
                  onClick={() => setActiveCategory('todas')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver todas
                </button>
              )}
            </div>
            
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 pt-1 -mx-4 px-4 scroll-smooth">
              {/* Botón Circular: TODAS */}
              <button
                onClick={() => setActiveCategory('todas')}
                className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 w-[76px] sm:w-[84px] text-center select-none"
              >
                <div 
                  className={`w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] transition-all duration-300 relative ${
                    activeCategory === 'todas'
                      ? 'bg-gradient-to-tr from-primary via-amber-500 to-yellow-400 shadow-[0_4px_16px_rgba(211,47,47,0.35)] scale-105'
                      : 'bg-slate-200/90 hover:bg-amber-300 shadow-sm'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                    <img loading="lazy" decoding="async" 
                      src={getCategoryImageUrl('todas')} 
                      alt="Todas las categorías" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {activeCategory === 'todas' && (
                      <span className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
                    )}
                  </div>
                </div>
                <span 
                  className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[76px] sm:max-w-[84px] ${
                    activeCategory === 'todas' 
                      ? 'font-extrabold text-primary scale-105' 
                      : 'font-semibold text-slate-700 group-hover:text-slate-900'
                  }`}
                >
                  Todas
                </span>
              </button>

              {/* Botones Circulares para cada Categoría */}
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const imgUrl = getCategoryImageUrl(cat.name, (cat as any).image_url || (cat.icon && cat.icon.startsWith('/') ? cat.icon : undefined));
                const isPromo = cat.name.toLowerCase().includes('promo');

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 w-[76px] sm:w-[84px] text-center select-none"
                  >
                    <div 
                      className={`w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] transition-all duration-300 relative ${
                        isActive
                          ? 'bg-gradient-to-tr from-primary via-amber-500 to-yellow-400 shadow-[0_4px_16px_rgba(211,47,47,0.35)] scale-105'
                          : 'bg-slate-200/90 hover:bg-amber-300 shadow-sm'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                        <img loading="lazy" decoding="async" 
                          src={imgUrl} 
                          alt={cat.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/img/categorias/todas.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        {isActive && (
                          <span className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
                        )}
                        {isPromo && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                            🔥
                          </span>
                        )}
                      </div>
                    </div>
                    <span 
                      className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-2 max-w-[76px] sm:max-w-[84px] ${
                        isActive 
                          ? 'font-extrabold text-primary scale-105' 
                          : 'font-semibold text-slate-700 group-hover:text-slate-900'
                      }`}
                      title={cat.name}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. PRODUCT LIST */}
        <section className="px-4">
          {[...categories]
            .sort((a, b) => {
              const aIsPromo = a.name.toLowerCase().includes('promo');
              const bIsPromo = b.name.toLowerCase().includes('promo');
              if (aIsPromo && !bIsPromo) return -1;
              if (!aIsPromo && bIsPromo) return 1;
              return 0;
            })
            .map(category => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
            if (categoryProducts.length === 0) return null;

            const isPromo = category.name.toLowerCase().includes('promo');

            return (
              <div key={category.id} className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-primary/30 shadow-sm">
                    <img loading="lazy" decoding="async" 
                      src={getCategoryImageUrl(category.name, (category as any).image_url)} 
                      alt={category.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/categorias/todas.jpg'; }}
                    />
                  </div>
                  <span>{category.name}</span>
                  {isPromo && <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest ml-2">Especial</span>}
                </h2>
                
                <div className="flex flex-col gap-4">
                  {categoryProducts.map((product, idx) => {
                    const qty = getProductQuantity(product.id);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className="glass rounded-2xl border border-white/50 p-3 flex gap-4 relative cursor-pointer active:scale-[0.98] transition-transform hover:shadow-[0_12px_40px_-12px_rgba(236,1,0,0.18)] transition-shadow"
                      >
                        {/* Text Content Area (Left) */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1 pr-2">{product.name}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-black text-slate-900 text-base tracking-tight">${(product.price ?? 0).toLocaleString('es-AR')}</span>
                            {qty > 0 && (
                              <span className="bg-primary/20 text-primary font-bold text-[10px] px-2 py-0.5 rounded-md border border-primary/30 uppercase tracking-wider">
                                {qty} en pedido
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image & Add Button Area (Right) */}
                        <div className="w-28 h-28 shrink-0 bg-white rounded-xl relative overflow-hidden shadow-inner border border-amber-200">
                           <img loading="lazy" decoding="async" 
                             src={product.image_url || '/img/book-placeholder.svg'} 
                             alt={product.name}
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               (e.currentTarget as HTMLImageElement).src = '/img/book-placeholder.svg';
                             }}
                           />
                           
                           {/* Small Add Button inside image corner */}
                           <button 
                             className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-white rounded-full text-black shadow-md active:scale-90 transition-transform"
                           >
                             <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 glass rounded-3xl border border-white/50">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-700">No encontramos nada</p>
              <p className="text-slate-500 text-sm">Prueba buscando con otras palabras.</p>
            </div>
          )}
        </section>
      </main>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:max-w-md md:mx-auto z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-primary text-black p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(236,1,0,0.5)] flex items-center justify-between transition-transform active:scale-95 border border-primary/50"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-inner">
                  {cartItemCount}
                </div>
                <span className="font-black text-lg tracking-tight uppercase">Ver mi pedido</span>
              </div>
              <ShoppingCart size={24} className="text-black" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart}
      />

      <CartModal 
        empresaId={empresa.id} 
        empresaName={empresa.name} 
        empresaPhone={empresa.phone} 
        onOrderPlaced={(id) => {
          setActiveOrderId(id);
          setIsTrackerOpen(true); // Open it immediately to surprise the user
        }}
      />

      <OrderTrackerModal 
        orderId={activeOrderId}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onClearActiveOrder={() => {
          localStorage.removeItem(`activeOrder_${empresa.id}`);
          setActiveOrderId(null);
        }}
      />
    </div>
  );
}
