import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  backImage?: string;
  description?: string;
  size?: string;
  isOutOfStock?: boolean;
  isNew?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  updateSize: (productId: number, oldSize: string | undefined, newSize: string) => void;
  updateQuantity: (productId: number, size: string | undefined, delta: number) => void;
  removeFromCart: (productId: number, size?: string) => void;
  clearCart: () => void;
  total: number;
  checkoutWhatsApp: () => void;
  productStock: Record<number, boolean>;
  toggleStock: (productId: number) => void;
  cartError: string | null;
  setCartError: (msg: string | null) => void;
  products: Product[];
  saveProducts: (newProducts: Product[]) => void;
}

const DEFAULT_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'Easymoney Black', 
    price: 25, 
    image: '/negro1.PNG',
    backImage: '/negro2.PNG',
    description: '100% Algodón | Corte Oversize | 150gr',
    isNew: true
  },
  { 
    id: 3, 
    name: 'Easymoney White', 
    price: 25, 
    image: '/blanco.PNG',
    backImage: '/blanco2.PNG',
    description: '100% Algodón | Corte Oversize | 150gr',
    isNew: true
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('montelari_products');
    return savedProducts ? JSON.parse(savedProducts) : DEFAULT_PRODUCTS;
  });

  const [productStock, setProductStock] = useState<Record<number, boolean>>(() => {
    const savedStock = localStorage.getItem('montelari_stock');
    return savedStock ? JSON.parse(savedStock) : {};
  });

  useEffect(() => {
    localStorage.setItem('montelari_stock', JSON.stringify(productStock));
  }, [productStock]);

  useEffect(() => {
    setCartError(null);
  }, [cart, isCartOpen]);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('montelari_products', JSON.stringify(newProducts));
    alert('¡Cambios guardados con éxito!');
  };

  const toggleStock = (productId: number) => {
    setProductStock(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const addToCart = (product: Product) => {
    if (productStock[product.id]) return;

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.size === undefined
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.size === undefined
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, size: undefined, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const updateSize = (productId: number, oldSize: string | undefined, newSize: string) => {
    setCart((prev) => {
      const itemIndex = prev.findIndex(item => item.id === productId && item.size === oldSize);
      if (itemIndex === -1) return prev;

      const newCart = [...prev];
      const targetItem = { ...newCart[itemIndex], size: newSize };
      newCart.splice(itemIndex, 1);

      const duplicateIndex = newCart.findIndex(
        (item) => item.id === productId && item.size === newSize
      );

      if (duplicateIndex !== -1) {
        newCart[duplicateIndex] = {
          ...newCart[duplicateIndex],
          quantity: newCart[duplicateIndex].quantity + targetItem.quantity
        };
      } else {
        newCart.splice(itemIndex, 0, targetItem);
      }

      return newCart;
    });
  };

  const updateQuantity = (productId: number, size: string | undefined, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId && item.size === size) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size))
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return;

    const missingSize = cart.some(item => !item.size);
    if (missingSize) {
      setCartError("Por favor selecciona una talla para todos los productos.");
      return;
    }

    const phoneNumber = "50763542035";

    let message = "Hola Montelari Club! Me gustaria realizar el siguiente pedido:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   - Talla: ${item.size}\n`;
      message += `   - Cantidad: ${item.quantity}\n\n`;
    });

    message += "Quedo atento a su respuesta. Muchas gracias.";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateSize,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        checkoutWhatsApp,
        productStock,
        toggleStock,
        cartError,
        setCartError,
        products,
        saveProducts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
