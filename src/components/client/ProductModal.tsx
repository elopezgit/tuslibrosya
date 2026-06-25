import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes: string) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, notes);
    onClose();
  };

  const getPlaceholder = (name: string) => {
    return 'Ej: Envolver para regalo, dedicar a nombre de...';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/80 z-[100] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-surface rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] md:max-w-md md:mx-auto md:bottom-4 md:rounded-3xl shadow-2xl border border-amber-200"
          >
            <div className="relative h-64 bg-slate-900 shrink-0">
              <img 
                src={product.image_url || `https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80`} 
                alt={product.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/60 text-slate-900 rounded-full backdrop-blur-md hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 bg-surface">
              <h2 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h2>
              <div className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap text-base">
                {product.description || 'Sin descripción disponible para este libro.'}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Aclaraciones (Opcional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={getPlaceholder(product.name)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none h-16"
                />
              </div>
            </div>

            <div className="p-6 border-t border-amber-200 bg-surface shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 bg-white rounded-full p-1 border border-amber-300">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-surface rounded-full shadow-sm text-slate-700 active:scale-95 transition-transform"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-bold w-4 text-center text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-primary rounded-full shadow-sm text-black active:scale-95 transition-transform"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ${(product.price * quantity).toLocaleString('es-AR')}
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-2xl font-black uppercase tracking-wide text-lg shadow-[0_5px_20px_-5px_rgba(255,184,0,0.4)] transition-all active:scale-[0.98]"
              >
                Agregar al carrito
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
