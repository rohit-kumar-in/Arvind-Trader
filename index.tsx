/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AboutPage } from './AboutPage.tsx';

// --- DATA & TYPES ---

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
}


const products: Product[] = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 249.99, description: 'Immerse yourself in music with these high-fidelity, noise-cancelling headphones. Long-lasting battery and comfortable design.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, name: 'Smartwatch Series 7', price: 399.00, description: 'Stay connected and track your fitness goals. Features a bright always-on display and advanced health sensors.', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop' },
  { id: 3, name: 'Portable Bluetooth Speaker', price: 89.95, description: 'Take your music anywhere. This speaker is waterproof, dustproof, and delivers surprisingly powerful sound.', imageUrl: 'https://images.unsplash.com/photo-1589256469038-5961021415a7?q=80&w=1974&auto=format&fit=crop' },
  { id: 4, name: '4K Ultra HD Streaming Device', price: 49.99, description: 'Upgrade your TV with stunning 4K streaming. Access all your favorite apps and services in one place.', imageUrl: 'https://images.unsplash.com/photo-1601944177324-697357493103?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, name: 'Ergonomic Mechanical Keyboard', price: 159.00, description: 'Type faster and more comfortably. Features customizable RGB lighting and satisfying tactile switches.', imageUrl: 'https://images.unsplash.com/photo-1618384887924-33634b398080?q=80&w=2070&auto=format&fit=crop' },
  { id: 6, name: 'High-Performance Gaming Mouse', price: 79.99, description: 'Gain a competitive edge with this ultra-lightweight and responsive gaming mouse. Customizable buttons and precision sensor.', imageUrl: 'https://images.unsplash.com/photo-1615663245652-8de3ab723b53?q=80&w=1931&auto=format&fit=crop' },
];

// --- CART CONTEXT ---
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getCartItemCount = () => {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, getCartTotal, getCartItemCount, clearCart }}>
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


// --- ROUTING ---
const navigate = (href: string) => {
    window.history.pushState({}, '', href);
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
};

const usePath = () => {
    const [path, setPath] = useState(window.location.pathname);
    useEffect(() => {
        const onLocationChange = () => {
            setPath(window.location.pathname);
        };
        window.addEventListener('popstate', onLocationChange);
        return () => window.removeEventListener('popstate', onLocationChange);
    }, []);
    return path;
};

const Link = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
    const onClick = (event: React.MouseEvent) => {
        event.preventDefault();
        navigate(href);
    };
    return <a href={href} onClick={onClick} className={className}>{children}</a>;
};


// --- SEO HELPERS ---
export const updateSeoTags = (title: string, description: string, imageUrl?: string) => {
  document.title = title;

  const setMeta = (name: string, property: string, content: string) => {
    let element = document.querySelector(`meta[${name}="${property}"]`) as HTMLMetaElement;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(name, property);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', window.location.href);
  if (imageUrl) {
    setMeta('property', 'og:image', imageUrl);
  }
};

const JsonLd = ({ data }: { data: object }) => {
  useEffect(() => {
    const scriptId = 'json-ld-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(data);

    return () => {
      // Clean up script on component unmount
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};


// --- COMPONENTS ---
const Header = () => {
    const { getCartItemCount } = useCart();
    const itemCount = getCartItemCount();

    return (
        <header className="app-header">
            <div className="header-content">
                <Link href="/" className="logo">Arvind Trader</Link>
                <nav className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/products">Products</Link>
                    <Link href="/about">About Us</Link>
                </nav>
                <Link href="/cart" className="cart-icon" aria-label={`Shopping cart with ${itemCount} items`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>
            </div>
        </header>
    );
}

const Footer = () => (
    <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Arvind Trader. All Rights Reserved.</p>
    </footer>
);

const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    return (
        <div className="product-card">
            <Link href={`/product/${product.id}`}>
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                </div>
            </Link>
             <div className="product-info">
                <p className="product-price">${product.price.toFixed(2)}</p>
                <button onClick={() => addToCart(product)} className="btn">Add to Cart</button>
            </div>
        </div>
    );
};

// --- PAGES ---

const HomePage = () => {
    useEffect(() => {
        updateSeoTags('Arvind Trader | High-Quality Electronics', 'Your one-stop shop for the latest and greatest in tech. High-quality electronics, from headphones to smartwatches.');
    }, []);
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Arvind Trader",
      "url": "https://arvind-trader.vercel.app/",
      "logo": "https://arvind-trader.vercel.app/logo.png", // Assume you have a logo
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-800-555-0199",
        "contactType": "customer service"
      }
    };

    return (
        <div className="container">
            <JsonLd data={organizationSchema} />
            <div className="hero">
                <h1>Welcome to Arvind Trader</h1>
                <p>Your one-stop shop for the latest and greatest in tech.</p>
                <Link href="/products" className="btn">Shop Now</Link>
            </div>
            <h2>Featured Products</h2>
            <div className="product-grid">
                {products.slice(0, 3).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
        </div>
    );
};

const ProductListPage = () => {
    useEffect(() => {
        updateSeoTags('All Products | Arvind Trader', 'Browse our full collection of high-quality electronic gadgets and accessories.');
    }, []);
    return (
        <div className="container">
            <h1>All Products</h1>
            <div className="product-grid">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
        </div>
    );
};

const ProductDetailPage = ({ id }: { id: number }) => {
    const { addToCart } = useCart();
    const product = products.find(p => p.id === id);

    useEffect(() => {
        if (product) {
            updateSeoTags(`${product.name} | Arvind Trader`, product.description, product.imageUrl);
        } else {
            updateSeoTags('Product Not Found | Arvind Trader', 'The product you are looking for does not exist.');
        }
    }, [product]);

    if (!product) {
        return <div className="container"><h2>Product not found!</h2></div>;
    }

    const relatedProducts = products
        .filter(p => p.id !== product.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.imageUrl],
        "description": product.description,
        "sku": `AT-${product.id}`,
        "mpn": `AT-MPN-${product.id}`,
        "brand": {
          "@type": "Brand",
          "name": "Arvind Trader"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "USD",
          "price": product.price.toFixed(2),
          "priceValidUntil": "2024-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
    };

    return (
        <div className="container">
            <JsonLd data={productSchema} />
            <div className="product-detail-container">
                <div className="product-detail-image">
                    <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-detail-info">
                    <h1>{product.name}</h1>
                    <p className="product-detail-price">${product.price.toFixed(2)}</p>
                    <p className="product-detail-desc">{product.description}</p>
                    <button onClick={() => addToCart(product)} className="btn">Add to Cart</button>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-products">
                    <h2>You Might Also Like</h2>
                    <div className="product-grid">
                        {relatedProducts.map(related => <ProductCard key={related.id} product={related} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    
    useEffect(() => {
        updateSeoTags('Your Shopping Cart | Arvind Trader', 'Review, update, or remove items from your shopping cart before proceeding to checkout.');
    }, []);

    if (cartItems.length === 0) {
        return (
            <div className="container empty-cart">
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link href="/products" className="btn">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container cart-container">
            <h1>Your Shopping Cart</h1>
            {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                    <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="btn btn-danger">Remove</button>
                </div>
            ))}
            <div className="cart-summary">
                 <h2>Order Summary</h2>
                <p className="cart-total">Total: ${getCartTotal().toFixed(2)}</p>
                <Link href="/checkout" className="btn">Proceed to Checkout</Link>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { getCartTotal, clearCart } = useCart();
    
    useEffect(() => {
        updateSeoTags('Checkout | Arvind Trader', 'Complete your purchase by providing your shipping and payment information.');
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearCart();
        navigate('/confirmation');
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>Checkout</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Shipping Address</label>
                        <input type="text" id="address" required />
                    </div>
                    <h3>Total: ${getCartTotal().toFixed(2)}</h3>
                    <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Place Order</button>
                </form>
            </div>
        </div>
    );
}

const ConfirmationPage = () => {
    useEffect(() => {
        updateSeoTags('Order Confirmed! | Arvind Trader', 'Thank you for your purchase from Arvind Trader.');
    }, []);
    return (
        <div className="container confirmation-page">
            <h1>Thank You For Your Order!</h1>
            <p>Your order has been placed successfully. We'll send you an email confirmation shortly.</p>
            <Link href="/" className="btn">Continue Shopping</Link>
        </div>
    );
};


// --- APP ---
const App = () => {
    const path = usePath();
    const parts = path.split('/').filter(Boolean);

    const renderPage = () => {
        if (parts.length === 0) return <HomePage />;
        if (parts[0] === 'products') return <ProductListPage />;
        if (parts[0] === 'product' && parts[1]) {
            const id = parseInt(parts[1], 10);
            return <ProductDetailPage id={id} />;
        }
        if (parts[0] === 'cart') return <CartPage />;
        if (parts[0] === 'about') return <AboutPage />;
        if (parts[0] === 'checkout') return <CheckoutPage />;
        if (parts[0] === 'confirmation') return <ConfirmationPage />;
        
        return <HomePage />; // Fallback to home page
    };

    return (
        <CartProvider>
            <Header />
            <main>
                {renderPage()}
            </main>
            <Footer />
        </CartProvider>
    );
};


const container = document.getElementById('root');
if (container) {
  // Global click handler for client-side routing
  document.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor && anchor.target !== '_blank' && anchor.href.startsWith(window.location.origin)) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      const newPath = new URL(anchor.href).pathname;
      if(currentPath !== newPath) {
        navigate(newPath);
      }
    }
  });

  const root = createRoot(container);
  root.render(<App />);
}