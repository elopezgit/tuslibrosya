import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/CartContext';
import { Search, Plus, Minus, Trash2, Wallet, CreditCard, Send, Coffee, Utensils } from 'lucide-react';

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
  code?: string;
}

export default function POSHome({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [fastCode, setFastCode] = useState('');
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [globalComment, setGlobalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const { items, addToCart, removeFromCart, updateQuantity, updateItemNotes, total, clearCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: empData, error: empError } = await supabase
          .from('empresas')
          .select('id')
          .eq('slug', empresaSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (empError) throw empError;
        if (!empData) throw new Error('Empresa no encontrada.');
        
        setEmpresaId(empData.id);

        const [cats, prods] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', empData.id),
          supabase.from('products').select('*').eq('empresa_id', empData.id).eq('is_active', true)
        ]);

        if (cats.data) setCategories(cats.data);
        if (prods.data) setProducts(prods.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (empresaSlug) loadData();
  }, [empresaSlug]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleFastCodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!fastCode.trim()) return;
      const codeToSearch = fastCode.trim().toLowerCase();
      const prod = products.find(p => p.code?.toLowerCase() === codeToSearch);
      if (prod) {
        addToCart(prod, 1);
        setFastCode('');
      } else {
        alert('Producto no encontrado con el código: ' + codeToSearch);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!empresaId || items.length === 0) return;
    setIsSubmitting(true);

    const finalComment = `${paymentMethod === 'transferencia' ? '[TRANSFERENCIA] ' : '[EFECTIVO] '}${globalComment}`;

    try {
      const { error } = await supabase.from('orders').insert({
        empresa_id: empresaId,
        customer_name: 'Pedido en Caja',
        customer_phone: '0000000',
        delivery_address: 'En local',
        comment: finalComment,
        total: total,
        items: items,
        status: 'pendiente'
      });

      if (error) throw error;

      alert('¡Pedido enviado a cocina!');
      clearCart();
      setGlobalComment('');
      setShowSummaryModal(false);
    } catch (err) {
      alert('Error al procesar el pedido.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-slate-500">Cargando POS...</div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      
      {/* LEFT PANE: Menu & Grid (70%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header & Filters */}
        <div className="bg-white p-4 shadow-sm z-10">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Cód. Rápido + Enter" 
                value={fastCode}
                onChange={(e) => setFastCode(e.target.value)}
                onKeyDown={handleFastCodeSubmit}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors font-bold"
              />
            </div>
          </div>

          {/* Category Scroller */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            <button
              onClick={() => setActiveCategory('todas')}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeCategory === 'todas' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const qty = getProductQuantity(product.id);
              return (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product, 1)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-95 group relative"
                >
                  {qty > 0 && (
                    <div className="absolute -top-2 -right-2 bg-primary text-black font-black w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg border border-primary/50">
                      {qty}
                    </div>
                  )}
                  <div className="w-full h-24 bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Utensils className="text-slate-300" size={32} />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2 flex-1">{product.name}</h3>
                  <p className="font-black text-slate-800">${product.price.toLocaleString('es-AR')}</p>
                </div>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-bold">
              No hay productos con esa búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Cart (30%) */}
      <div className="w-[350px] shrink-0 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
            Comanda en Vivo
          </h2>
          <span className="bg-primary/20 text-primary-hover font-bold px-2 py-1 rounded text-xs">{items.length} ítems</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Coffee size={48} className="text-slate-200" />
              <p className="font-bold text-sm">Comanda vacía</p>
              <p className="text-xs text-center px-4">Toca los productos a la izquierda para agregarlos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-slate-800 flex-1 pr-2">{item.name}</h4>
                    <span className="font-black text-sm text-slate-800">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Ej: Sin sal, extra mayo..."
                    value={item.notes || ''}
                    onChange={(e) => updateItemNotes(item.id, item.notes, e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-600 rounded px-2 py-1 text-xs outline-none focus:border-primary mb-2 shadow-inner"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.notes)} className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.notes)} className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.id, item.notes)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-500 uppercase">Total Final</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight">${total.toLocaleString('es-AR')}</span>
          </div>

          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Notas generales (ej: sin sal)" 
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-3 outline-none focus:border-primary text-sm shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => setPaymentMethod('efectivo')}
              className={`flex items-center justify-center gap-1 p-2.5 rounded-lg font-bold text-xs transition-all border ${paymentMethod === 'efectivo' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <Wallet size={16} /> Efectivo
            </button>
            <button 
              onClick={() => setPaymentMethod('transferencia')}
              className={`flex items-center justify-center gap-1 p-2.5 rounded-lg font-bold text-xs transition-all border ${paymentMethod === 'transferencia' ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              <CreditCard size={16} /> Transf.
            </button>
          </div>

          <button 
            onClick={() => setShowSummaryModal(true)}
            disabled={items.length === 0 || isSubmitting}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-lg transition-all shadow-lg ${items.length > 0 && !isSubmitting ? 'bg-primary text-black hover:bg-yellow-400 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Revisar y Enviar <Send size={20} />
          </button>
        </div>
      </div>

      {/* SUMMARY MODAL */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Verificar Pedido</h2>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white">
                <Trash2 size={24} className="hidden" /> {/* Placeholder for alignment or just use a standard 'X' icon if imported. Using simple text below. */}
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50">
              <ul className="space-y-4">
                {items.map((item, idx) => (
                  <li key={`${item.id}-${idx}`} className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <div className="font-bold text-slate-800">
                        {item.quantity}x {item.name}
                      </div>
                      {item.notes && (
                        <div className="text-sm text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-1">
                          Nota: {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-black text-slate-800">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </div>
                  </li>
                ))}
              </ul>

              {globalComment && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="font-bold text-yellow-800 text-sm block mb-1">Nota General:</span>
                  <span className="text-yellow-900 text-sm">{globalComment}</span>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-bold">Método de Pago:</span>
                <span className="text-slate-800 font-black uppercase bg-slate-100 px-3 py-1 rounded-lg">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-slate-800">Total a Cobrar:</span>
                <span className="text-4xl font-black text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowSummaryModal(false)}
                  className="py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Volver a Editar
                </button>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl font-black text-black bg-primary hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
