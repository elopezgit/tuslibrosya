import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }, quantity?: number, notes?: string) => void;
  removeFromCart: (id: string, notes?: string) => void;
  updateQuantity: (id: string, quantity: number, notes?: string) => void;
  updateItemNotes: (id: string, oldNotes: string | undefined, newNotes: string) => void;
  clearCart: () => void;
  originalTotal: number;
  total: number;
  discount: number;
  totalQuantity: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: { id: string; name: string; price: number }, quantity = 1, notes = '') => {
    setItems(current => {
      const cartKey = notes ? `${product.id}-${notes}` : product.id;
      
      const existing = current.find(item => (item.notes ? `${item.id}-${item.notes}` : item.id) === cartKey);
      if (existing) {
        return current.map(item => 
          (item.notes ? `${item.id}-${item.notes}` : item.id) === cartKey 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...current, { ...product, quantity, notes }];
    });
  };

  const removeFromCart = (id: string, notes?: string) => {
    setItems(current => current.filter(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const removeKey = notes ? `${id}-${notes}` : id;
      return itemKey !== removeKey;
    }));
  };

  const updateQuantity = (id: string, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, notes);
      return;
    }
    setItems(prev => prev.map(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const targetKey = notes ? `${id}-${notes}` : id;
      return itemKey === targetKey ? { ...item, quantity } : item;
    }));
  };

  const updateItemNotes = (id: string, oldNotes: string | undefined, newNotes: string) => {
    setItems(prev => prev.map(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const targetKey = oldNotes ? `${id}-${oldNotes}` : id;
      return itemKey === targetKey ? { ...item, notes: newNotes } : item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Lógica de promoción
  let total = originalTotal;
  let discount = 0;
  
  // Promo actual (escalable):
  // 1 libro = $15.000
  // 2 libros = $25.000
  // 3 libros = $35.000
  // >= 10 libros = $10.000 cada uno
  if (totalQuantity >= 10) {
    let calculatedPromoTotal = totalQuantity * 10000;
    if (calculatedPromoTotal < originalTotal) {
      total = calculatedPromoTotal;
      discount = originalTotal - total;
    }
  } else if (totalQuantity > 0) {
    // Se agrupan de a 3 (el nivel máximo de la promo actual)
    const groupsOf3 = Math.floor(totalQuantity / 3);
    const remainder = totalQuantity % 3;
    
    let calculatedPromoTotal = groupsOf3 * 35000;
    if (remainder === 2) calculatedPromoTotal += 25000;
    if (remainder === 1) calculatedPromoTotal += 15000;
    
    // Aplicar la promo solo si realmente hay un beneficio
    if (calculatedPromoTotal < originalTotal) {
      total = calculatedPromoTotal;
      discount = originalTotal - total;
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemNotes,
      clearCart,
      originalTotal,
      total,
      discount,
      totalQuantity,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
