import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../lib/CartContext';
import { supabase } from '../../lib/supabase';
import { X, Minus, Plus, Trash2, MapPin, Wallet, Receipt, CreditCard, Copy, CheckCircle2 } from 'lucide-react';

interface CartModalProps {
  empresaId: string;
  empresaName: string;
  empresaPhone: string;
  onOrderPlaced?: (orderId: string) => void;
}

export default function CartModal({ empresaId, empresaName, empresaPhone, onOrderPlaced }: CartModalProps) {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, total, originalTotal, discount, totalQuantity, clearCart } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAlias = () => {
    navigator.clipboard.writeText('aventus.perfumeria');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);

    const fullComment = `${paymentMethod === 'transferencia' ? '[PAGA CON TRANSFERENCIA] ' : '[PAGA EN EFECTIVO] '}${comment}`;

    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          empresa_id: empresaId,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          comment: fullComment,
          total: total,
          items: items,
          status: 'pendiente'
        })
        .select()
        .single();

      if (error) throw error;

      let wpMessage = `*NUEVO PEDIDO - ${empresaName}*\n`;
      wpMessage += `Orden #${orderData.id.split('-')[0].toUpperCase()}\n\n`;
      wpMessage += `*Cliente:* ${customerName}\n`;
      wpMessage += `*Teléfono:* ${customerPhone}\n`;
      if (deliveryAddress) wpMessage += `*Dirección:* ${deliveryAddress}\n`;
      wpMessage += `\n*Detalle del pedido:*\n`;
      items.forEach(item => {
        wpMessage += `• ${item.quantity}x ${item.name} ($${item.price})\n`;
        if (item.notes) wpMessage += `  _Nota: ${item.notes}_\n`;
      });
      wpMessage += `\n*Medio de Pago:* ${paymentMethod.toUpperCase()}`;
      if (comment) wpMessage += `\n*Comentarios:* ${comment}`;
      wpMessage += `\n\n*TOTAL: $${total.toLocaleString('es-AR')}*`;

      const wpUrl = `https://wa.me/${empresaPhone.replace(/\D/g, '')}?text=${encodeURIComponent(wpMessage)}`;
      window.open(wpUrl, '_blank');

      // Save order to localStorage for the "Reorder" feature
      localStorage.setItem(`lastOrder_${empresaId}`, JSON.stringify(items));
      // Save order id for Tracking feature
      localStorage.setItem(`activeOrder_${empresaId}`, orderData.id);
      
      if (onOrderPlaced) onOrderPlaced(orderData.id);

      clearCart();
      setIsCartOpen(false);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-white/80 z-[100] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 top-12 md:top-auto md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:h-[85vh] bg-surface z-[101] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-200"
          >
            <div className="p-5 border-b border-amber-200 flex items-center justify-between bg-surface shrink-0">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Receipt size={22} className="text-primary" /> Mi Pedido
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-amber-100 text-slate-700 rounded-full hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar bg-background">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                  <Receipt size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-bold">Tu carrito está vacío</p>
                  <p className="text-sm mt-1">¡Agrega algunos productos deliciosos!</p>
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  {totalQuantity >= 10 && (
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl border border-yellow-300 font-bold text-center">
                      ¡Compra mayorista! Contactanos para recibir precios especiales.
                    </div>
                  )}
                  {/* Items List */}
                  <div className="bg-surface rounded-2xl p-4 border border-amber-200 space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start border-b border-amber-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                          {item.notes && <p className="text-xs text-primary mt-1 italic">"{item.notes}"</p>}
                          <div className="text-slate-700 font-bold mt-1">${(item.price * item.quantity).toLocaleString('es-AR')}</div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <button onClick={() => removeFromCart(item.id, item.notes)} className="text-slate-500 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                          <div className="flex items-center gap-3 bg-white rounded-full border border-amber-300 p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.notes)} className="w-7 h-7 flex items-center justify-center bg-surface rounded-full shadow-sm text-slate-700">
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm w-4 text-center text-slate-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.notes)} className="w-7 h-7 flex items-center justify-center bg-primary rounded-full shadow-sm text-black">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form id="checkout-form" onSubmit={handleSubmit} className="bg-surface rounded-2xl p-5 border border-amber-200 space-y-4">
                    <h3 className="font-bold text-slate-900 mb-2 border-b border-amber-200 pb-2">Tus Datos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Nombre y Apellido</label>
                        <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none" placeholder="Juan Pérez" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono (WhatsApp)</label>
                        <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none" placeholder="381 123 4567" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><MapPin size={14} /> Dirección de Envío</label>
                      <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none" placeholder="Calle Falsa 123 (Opcional si retira)" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Comentarios Generales</label>
                      <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none h-16" placeholder="Ej: Pago con $10000, timbre no funciona, etc." />
                    </div>

                    <div className="pt-4 border-t border-amber-200">
                      <label className="block text-xs font-bold text-slate-600 mb-3">Método de Pago</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setPaymentMethod('efectivo')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'efectivo' ? 'bg-primary border-primary text-black' : 'bg-white border-amber-300 text-slate-600 hover:bg-amber-100'}`}
                        >
                          <Wallet size={18} /> Efectivo
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPaymentMethod('transferencia')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'transferencia' ? 'bg-primary border-primary text-black' : 'bg-white border-amber-300 text-slate-600 hover:bg-amber-100'}`}
                        >
                          <CreditCard size={18} /> Transferencia
                        </button>
                      </div>

                      {paymentMethod === 'transferencia' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="mt-4 overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-900/10"
                        >
                          <div className="p-3 bg-yellow-500/20 text-yellow-300 text-xs font-bold text-center border-b border-yellow-500/20">
                            Datos para Transferencia
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-yellow-500/20">
                              <span className="text-xs text-slate-600">Titular</span>
                              <span className="text-sm font-bold text-slate-900">Lucas Cristian Díaz</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-yellow-500/20">
                              <span className="text-xs text-slate-600">Alias</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-primary tracking-wider">aventus.perfumeria</span>
                                <button
                                  type="button"
                                  onClick={handleCopyAlias}
                                  className="p-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 rounded-md transition-colors"
                                  title="Copiar Alias"
                                >
                                  {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-yellow-500 text-center px-4 pb-4">
                            Recuerda enviar el comprobante por WhatsApp al finalizar el pedido.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Total & Button */}
            {items.length > 0 && (
              <div className="p-5 border-t border-amber-200 bg-surface shrink-0">
                {discount > 0 && (
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex justify-between items-center text-sm text-slate-500 line-through">
                      <span>Antes:</span>
                      <span>${originalTotal.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                      <span>Ahorrás:</span>
                      <span>${discount.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600 font-bold">Ahora (Total a pagar)</span>
                  <span className="text-3xl font-black text-slate-900">${total.toLocaleString('es-AR')}</span>
                </div>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-2xl font-black text-lg shadow-[0_5px_20px_-5px_rgba(255,184,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 uppercase tracking-wide"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
