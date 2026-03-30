import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        restaurantId: null,
        items: []
    });

    const addToCart = (restaurantId, item) => {
        setCart(prev => {
            // Check if adding from a different restaurant - reset cart if MVP
            if (prev.restaurantId && prev.restaurantId !== restaurantId) {
                if(!window.confirm("You have items from another restaurant in your cart. Replace them?")) {
                    return prev;
                }
                return {
                    restaurantId,
                    items: [{ ...item, quantity: 1 }]
                };
            }

            // Existing cart logic
            const existingItem = prev.items.find(i => i._id === item._id);
            if (existingItem) {
                return {
                    ...prev,
                    items: prev.items.map(i => 
                        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                    )
                };
            }

            return {
                restaurantId,
                items: [...prev.items, { ...item, quantity: 1 }]
            };
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.filter(i => i._id !== itemId)
        }));
    };

    const clearCart = () => setCart({ restaurantId: null, items: [] });

    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};
