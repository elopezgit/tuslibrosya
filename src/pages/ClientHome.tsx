import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Search, Info, MapPin, Plus, Star, ChevronRight, RotateCcw, Phone } from 'lucide-react';
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
  
  const [lastOrder, setLastOrder] = useState<any[]>([]);
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
        const { data: empData, error: empError } = await supabase
          .from('empresas')
          .select('*')
          .eq('slug', empresaSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (empError) throw empError;
        if (!empData) throw new Error('El restaurante no existe o la base de datos no tiene datos cargados.');
        
        setEmpresa(empData);

        // Check for last order in localStorage
        const savedOrder = localStorage.getItem(`lastOrder_${empData.id}`);
        if (savedOrder) {
          try {
            setLastOrder(JSON.parse(savedOrder));
          } catch(e) {}
        }

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
          className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200/30 via-amber-50 to-white"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {/* Logo Animator */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="w-56 h-56 rounded-full shadow-[0_0_80px_rgba(255,184,0,0.4)] flex items-center justify-center p-2 mb-6 bg-white border border-yellow-500/20"
            >
               <img src={empresa?.logo_url || "/img/logo/logo/logoNuevo.png"} alt="Tus Libros Ya Logo" className="w-full h-full object-contain rounded-full" onError={(e) => {
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
              className="text-2xl font-bold text-slate-900 mb-2"
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
        <div className="bg-surface p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-amber-200">
          <Info size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Ops! Algo salió mal</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
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

  const handleReorder = () => {
    clearCart();
    lastOrder.forEach(item => {
      // Recreamos el producto simulando que se agregó
      addToCart({ id: item.id, name: item.name, price: item.price }, item.quantity, item.notes);
    });
    setIsCartOpen(true);
  };

  const fixedBanner: any = { id: 'fixed-1', image_url: '/img/Banner/bannertupedido.png', link: null };
  const displayBanners = [fixedBanner, ...banners];

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-slate-800">
      {/* 1. HERO HEADER */}
      <header className="bg-surface pt-8 pb-4 px-4 sticky top-0 z-40 border-b border-slate-200/50 backdrop-blur-xl bg-surface/80">
         <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-full border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                <img src={empresa?.logo_url || "/img/logo/logo/logoNuevo.png"} alt="Logo" className="w-full h-full object-cover" onError={(e) => {
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
            className="w-full bg-white/50 border border-amber-300 text-slate-900 rounded-2xl py-3 pl-12 pr-4 shadow-inner outline-none focus:border-primary transition-all text-sm placeholder:text-slate-500"
          />
        </div>

        {/* Active Order Tracker Button */}
        {activeOrderId && !searchQuery && (
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsTrackerOpen(true)}
            className="w-full mt-4 bg-primary/20 border border-primary text-primary py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm shadow-[0_0_15px_rgba(255,184,0,0.2)] animate-pulse"
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
        {/* HERO INFO STORE */}
        {!searchQuery && (
          <section className="px-4 pt-4 pb-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-200 flex flex-col relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              
              <h2 className="text-lg font-black text-slate-900 mb-4 z-10 font-display flex items-center gap-2">
                <Star size={18} className="text-primary fill-primary" /> Tu librería ideal
              </h2>
              
              <div className="text-xs text-slate-700 font-medium z-10 flex flex-col gap-2.5">
                <motion.div initial={{x:-10, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.1}} className="flex items-center gap-3">
                  <span className="text-lg">📚</span> <span>Compra y venta de libros</span>
                </motion.div>
                <motion.div initial={{x:-10, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.2}} className="flex items-center gap-3">
                  <span className="text-lg">✨</span> <span>Nuevos / usados / consignación</span>
                </motion.div>
                <motion.div initial={{x:-10, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.3}} className="flex items-center gap-3">
                  <span className="text-lg">🏪</span> <span className="font-black uppercase tracking-wider">Mayor y Menor</span>
                </motion.div>
                <motion.div initial={{x:-10, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.4}} className="flex items-center gap-3">
                  <span className="text-lg">📦</span> <span>Envíos a todo el país 🇦🇷</span>
                </motion.div>
                <motion.div initial={{x:-10, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.5}} className="flex items-center gap-3">
                  <span className="text-lg">📍</span> <span>Tucumán | Showroom</span>
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}

        {/* REORDER BUTTON (If last order exists) */}
        {lastOrder.length > 0 && !searchQuery && (
          <section className="px-4 py-2 mt-2">
            <button 
              onClick={handleReorder}
              className="w-full bg-gradient-to-r from-amber-100 to-white border border-primary/50 p-4 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pedir lo mismo de nuevo</h3>
                  <p className="text-xs text-slate-600">Tu último pedido fue increíble.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-primary" />
            </button>
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
                    className="shrink-0 w-[85vw] max-w-[320px] md:w-80 h-40 rounded-3xl overflow-hidden relative border border-amber-200 shadow-xl block bg-white snap-center"
                  >
                    <img 
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

        {/* 3. CATEGORY SELECTOR (App Style Layout) */}
        {!searchQuery && (
           <section className="pl-4 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-3 pr-4">Categorías</h2>
              
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pr-4 pb-2">
                <button
                  onClick={() => setActiveCategory('todas')}
                  className={`shrink-0 w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === 'todas' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-surface border border-amber-200 text-slate-700 hover:bg-amber-100'}`}
                >
                  <Star size={24} className={activeCategory === 'todas' ? 'text-black' : 'text-primary'} />
                  <span className="text-xs font-bold">Todas</span>
                </button>

                {/* Tarjeta grande y animada para Promociones */}
                {promosCategory && (
                  <motion.button
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => setActiveCategory(promosCategory.id)}
                    className={`shrink-0 w-48 h-28 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden transition-all ${activeCategory === promosCategory.id ? 'border-2 border-primary' : 'border border-primary/50'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/40 to-red-900/40 z-0"></div>
                    <div className="absolute -right-4 -top-4 opacity-20 text-[80px] z-0">🔥</div>
                    <div className="relative z-10 text-left">
                      <span className="text-3xl mb-1 block">{promosCategory.icon}</span>
                      <span className="text-sm font-black uppercase tracking-wider text-slate-900 drop-shadow-md">Promociones</span>
                    </div>
                  </motion.button>
                )}

                {/* Tarjetas normales para el resto */}
                {regularCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-surface border border-amber-200 text-slate-700 hover:bg-amber-100'}`}
                  >
                    <span className="text-3xl drop-shadow-sm">{cat.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1 truncate w-full">{cat.name}</span>
                  </button>
                ))}
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
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <span>{category.icon}</span> {category.name}
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
                        className="bg-surface rounded-2xl border border-slate-200/80 p-3 flex gap-4 relative cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        {/* Text Content Area (Left) */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1 pr-2">{product.name}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-black text-slate-900 text-base tracking-tight">${product.price.toLocaleString('es-AR')}</span>
                            {qty > 0 && (
                              <span className="bg-primary/20 text-primary font-bold text-[10px] px-2 py-0.5 rounded-md border border-primary/30 uppercase tracking-wider">
                                {qty} en pedido
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image & Add Button Area (Right) */}
                        <div className="w-28 h-28 shrink-0 bg-white rounded-xl relative overflow-hidden shadow-inner border border-amber-200">
                           <img 
                             src={product.image_url || `https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80`} 
                             alt={product.name}
                             className="w-full h-full object-cover opacity-90"
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
            <div className="text-center py-16 bg-surface rounded-3xl border border-amber-200">
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
              className="w-full bg-primary text-black p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,184,0,0.6)] flex items-center justify-between transition-transform active:scale-95 border border-primary/50"
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
