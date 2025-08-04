import { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const prevTokenRef = useRef(null);

    const saveLocalCart = (items) => {
        localStorage.setItem('cart', JSON.stringify(items));
    };

    const loadLocalCart = () => {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    };

    const fetchUserCart = useCallback(async () => {
        if (!token) return [];
        try {
            const res = await fetch('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const serverCart = await res.json();
                return serverCart;
            }
        } catch (err) {
            console.error('Fetch user cart failed:', err);
        }
        return [];
    }, [token]);

    const mergeCarts = useCallback((local, server) => {
        const mergedMap = new Map();

        server.forEach(item => {
            const productId = item.product._id || item.product;
            mergedMap.set(productId, {
                product: productId,
                quantity: item.quantity,
            });
        });

        local.forEach(localItem => {
            const productId = localItem._id || localItem.product?._id || localItem.product;
            if (!productId) return;

            if (mergedMap.has(productId)) {
                const existing = mergedMap.get(productId);
                mergedMap.set(productId, {
                    product: productId,
                    quantity: existing.quantity + (localItem.quantity || 1),
                });
            } else {
                mergedMap.set(productId, {
                    product: productId,
                    quantity: localItem.quantity || 1,
                });
            }
        });

        return Array.from(mergedMap.values());
    }, []);


    const syncCartToBackend = useCallback(async (cart) => {
        if (!token) return;
        try {
            await fetch('http://localhost:5000/api/cart/clear', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            await fetch('http://localhost:5000/api/cart/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.product,
                        quantity: item.quantity,
                    })),
                }),
            });

            const updatedCart = await fetchUserCart();
            setCartItems(updatedCart);
        } catch (err) {
            console.error('Sync cart to backend failed:', err);
        }
    }, [token, fetchUserCart]);

    useEffect(() => {
        const handleCartSyncOnTokenChange = async () => {
            const prevToken = prevTokenRef.current;
            prevTokenRef.current = token;

            if (token && !prevToken) {
                const localCart = loadLocalCart();
                const serverCart = await fetchUserCart();

                if (localCart.length > 0) {
                    const mergedCart = mergeCarts(localCart, serverCart);
                    await syncCartToBackend(mergedCart);
                    localStorage.removeItem('cart');
                } else {
                    setCartItems(serverCart);
                }
            } else if (!token) {
                setCartItems(loadLocalCart());
            }
        };

        handleCartSyncOnTokenChange();
    }, [token, fetchUserCart, mergeCarts, syncCartToBackend]);

    useEffect(() => {
        if (!token) {
            saveLocalCart(cartItems);
        }
    }, [cartItems, token]);

    const addToCart = async (product) => {
        const existingIndex = cartItems.findIndex(
            (item) => (item.product?._id || item._id) === product._id
        );

        let newCart;
        if (existingIndex > -1) {
            newCart = cartItems.map((item, idx) =>
                idx === existingIndex
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            );
        } else {
            newCart = [...cartItems, { product, quantity: 1 }];
        }

        setCartItems(newCart);

        if (token) {
            try {
                await fetch('http://localhost:5000/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productId: product._id,
                        quantity: 1,
                    }),
                });
            } catch (err) {
                console.error('Failed to add to backend cart:', err);
            }
        }

        alert(`${product.name} has been added to your cart!`);
    };

    const removeFromCart = async (productId) => {
        const newCart = cartItems.filter(
            (item) => (item.product?._id || item._id) !== productId
        );

        setCartItems(newCart);

        if (token) {
            try {
                await fetch(`http://localhost:5000/api/cart/${productId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error('Failed to remove from backend cart:', err);
            }
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        localStorage.removeItem('cart');

        if (token) {
            try {
                await fetch('http://localhost:5000/api/cart/clear', {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error('Failed to clear backend cart:', err);
            }
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
