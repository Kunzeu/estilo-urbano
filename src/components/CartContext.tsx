"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  talla: string;
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "cantidad">) => void;
  removeFromCart: (id: number, talla: string) => void;
  clearCart: () => void;
  totalItems: number;
  increaseQuantity: (id: number, talla: string) => void;
  decreaseQuantity: (id: number, talla: string) => void;
  updateTalla: (id: number, tallaVieja: string, tallaNueva: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "cantidad">) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === item.id && p.talla === item.talla);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].cantidad += 1;
        return updated;
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const removeFromCart = (id: number, talla: string) => {
    setCart(prev => prev.filter(p => !(p.id === id && p.talla === talla)));
  };

  const clearCart = () => setCart([]);

  const increaseQuantity = (id: number, talla: string) => {
    setCart(prev => prev.map(item =>
      item.id === id && item.talla === talla ? { ...item, cantidad: item.cantidad + 1 } : item
    ));
  };

  const decreaseQuantity = (id: number, talla: string) => {
    setCart(prev => prev.map(item =>
      item.id === id && item.talla === talla && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  };

  const updateTalla = (id: number, tallaVieja: string, tallaNueva: string) => {
    setCart(prev => prev.map(item =>
      item.id === id && item.talla === tallaVieja
        ? { ...item, talla: tallaNueva }
        : item
    ));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, increaseQuantity, decreaseQuantity, updateTalla }}>
      {children}
    </CartContext.Provider>
  );
}; 