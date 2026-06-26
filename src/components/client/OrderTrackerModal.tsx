import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { X, Clock, ChefHat, CheckCircle2, XCircle, BellRing } from 'lucide-react';

interface OrderTrackerModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onClearActiveOrder: () => void;
}

export default function OrderTrackerModal({ orderId, isOpen, onClose, onClearActiveOrder }: OrderTrackerModalProps) {
  const [status, setStatus] = useState<string>('pendiente');
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchStatus = async () => {
      // Usar RPC segura para saltar el RLS que bloquea la lectura pública de ordenes
      const { data, error } = await supabase.rpc('get_order_status', { p_order_id: orderId }).single();
      if (data && !error) {
        const result = data as { status: string, total: number };
        setStatus(result.status);
        setTotal(result.total);
      }
      setIsLoading(false);
    };

    fetchStatus();

    // Poll every 15 seconds
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [isOpen, orderId]);

  const handleClose = () => {
    if (status === 'entregado' || status === 'cancelado') {
      onClearActiveOrder();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-white/80 z-[100] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-surface z-[101] rounded-t-3xl shadow-2xl flex flex-col border border-amber-200"
          >
            <div className="p-5 border-b border-amber-200 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BellRing size={22} className="text-primary" /> Tu Pedido
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 bg-amber-100 text-slate-700 rounded-full hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {isLoading ? (
                <div className="text-center text-slate-600 py-8">Cargando estado...</div>
              ) : status === 'cancelado' ? (
                <div className="text-center py-8">
                  <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Pedido Cancelado</h3>
                  <p className="text-slate-600 text-sm">Tu pedido ha sido cancelado por el restaurante. Por favor contáctate por WhatsApp para más información.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Bar Background */}
                  <div className="absolute left-6 top-6 bottom-6 w-1 bg-amber-100 rounded-full z-0"></div>
                  
                  {/* Timeline Progress */}
                  <div 
                    className="absolute left-6 top-6 w-1 bg-primary rounded-full z-0 transition-all duration-1000"
                    style={{ 
                      height: status === 'entregado' ? '100%' : status === 'en_preparacion' ? '50%' : '0%' 
                    }}
                  ></div>

                  {/* Step 1: Pendiente */}
                  <div className="relative z-10 flex items-start gap-6 mb-12">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-colors duration-500 ${status === 'pendiente' || status === 'en_preparacion' || status === 'entregado' ? 'bg-primary text-black' : 'bg-amber-100 text-slate-500'}`}>
                      <Clock size={24} />
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg ${status === 'pendiente' || status === 'en_preparacion' || status === 'entregado' ? 'text-slate-900' : 'text-slate-500'}`}>Pendiente</h4>
                      <p className="text-xs text-slate-600 mt-1">El restaurante está revisando tu orden.</p>
                    </div>
                  </div>

                  {/* Step 2: En Preparación */}
                  <div className="relative z-10 flex items-start gap-6 mb-12">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-colors duration-500 ${status === 'en_preparacion' || status === 'entregado' ? 'bg-primary text-black' : 'bg-amber-100 text-slate-500'}`}>
                      <ChefHat size={24} />
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg ${status === 'en_preparacion' || status === 'entregado' ? 'text-slate-900' : 'text-slate-500'}`}>En Preparación</h4>
                      <p className="text-xs text-slate-600 mt-1">¡Tus platos ya están en la cocina!</p>
                    </div>
                  </div>

                  {/* Step 3: Entregado */}
                  <div className="relative z-10 flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-colors duration-500 ${status === 'entregado' ? 'bg-primary text-black' : 'bg-amber-100 text-slate-500'}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg ${status === 'entregado' ? 'text-slate-900' : 'text-slate-500'}`}>Entregado</h4>
                      <p className="text-xs text-slate-600 mt-1">Tu pedido está listo o en camino.</p>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="p-5 border-t border-amber-200 bg-white/50 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Orden #{orderId?.split('-')[0].toUpperCase()}</p>
              <p className="text-sm font-medium text-slate-700">Total del pedido: <span className="font-bold text-slate-900">${total.toLocaleString('es-AR')}</span></p>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
