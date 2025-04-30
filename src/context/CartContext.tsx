// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside a CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (book: CartItem) => {
    setCart(prev => {
      const exists = prev.find(x => x.id === book.id);
      if (exists) {
        return prev.map(x =>
          x.id === book.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev =>
      prev.map(x => (x.id === id ? { ...x, quantity } : x))
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(x => x.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
