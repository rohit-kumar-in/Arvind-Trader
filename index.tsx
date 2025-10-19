/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

// --- DATA ---
const products = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 249.99, description: 'Immerse yourself in music with these high-fidelity, noise-cancelling headphones. Long-lasting battery and comfortable design.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, name: 'Smartwatch Series 7', price: 399.00, description: 'Stay connected and track your fitness goals. Features a bright always-on display and advanced health sensors.', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop' },
  { id: 3, name: 'Portable Bluetooth Speaker', price: 89.95, description: 'Take your music anywhere. This speaker is waterproof, dustproof, and delivers surprisingly powerful sound.', imageUrl: 'https://images.unsplash.com/photo-1589256469038-5961021415a7?q=80&w=1974&auto=format&fit=crop' },
  { id: 4, name: '4K Ultra HD Streaming Device', price: 49.99, description: 'Upgrade your TV with stunning 4K streaming. Access all your favorite apps and services in one place.', imageUrl: 'https://images.unsplash.com/photo-1601944177324-697357493103?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, name: 'Ergonomic Mechanical Keyboard', price: 159.00, description: 'Type faster and more comfortably. Features customizable RGB lighting and satisfying tactile switches.', imageUrl: 'https://images.unsplash.com/photo-1618384887924-33634b398080?q=80&w=2070&auto=format&fit=crop' },
  { id: 6, name: 'High-Performance Gaming Mouse', price: 79.99, description: 'Gain a competitive edge with this ultra-lightweight and responsive gaming mouse. Customizable buttons and precision sensor.', imageUrl: 'https://images.unsplash.com/photo-1615663245652-8de3ab723b53?q=80&w=1931&auto=format&fit=crop' },
];

// --- CART CONTEXT ---
const CartContext = createContext(null);

// FIX: Add explicit type for children prop to resolve type inference issues.
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
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

  const updateQuantity = (productId, newQuantity) => {
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
  
  const removeFromCart = (productId) => {
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

export const useCart = () => useContext(CartContext);


// --- ROUTING ---
const useHashNavigation = () => {
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    return hash;
}

const parseRoute = (hash) => {
    const path = hash.substring(1) || '/';
    const parts = path.split('/');
    if(parts[1] === 'product' && parts[2]) {
        return { page: 'product', id: parseInt(parts[2]) };
    }
    if(parts[1] === 'cart') return { page: 'cart' };
    if(parts[1] === 'checkout') return { page: 'checkout' };
    if(parts[1] === 'confirmation') return { page: 'confirmation' };
    return { page: 'home' };
}


// --- COMPONENTS ---

const Header = () => {
    const { getCartItemCount } = useCart();
    const itemCount = getCartItemCount();

    return (
        <header className="app-header">
            <div className="header-content">
                <a href="#/" className="logo">Arvind Trader</a>
                <nav className="nav-links">
                    <a href="#/">Home</a>
                    <a href="#/products">Products</a>
                </nav>
                <a href="#/cart" className="cart-icon" aria-label={`Shopping cart with ${itemCount} items`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </a>
            </div>
        </header>
    );
}

const Footer = () => (
    <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Arvind Trader. All Rights Reserved.</p>
    </footer>
);

// FIX: Add explicit type for product prop to resolve assignment errors in lists.
const ProductCard = ({ product }: { product: typeof products[0] }) => {
    const { addToCart } = useCart();
    return (
        <div className="product-card">
            <a href={`#/product/${product.id}`}>
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                </div>
            </a>
             <div className="product-info">
                <p className="product-price">${product.price.toFixed(2)}</p>
                <button onClick={() => addToCart(product)} className="btn">Add to Cart</button>
            </div>
        </div>
    );
};

// --- PAGES ---

const HomePage = () => (
    <div className="container">
        <div className="hero">
            <h1>Welcome to Arvind Trader</h1>
            <p>Your one-stop shop for the latest and greatest in tech.</p>
            <a href="#/products" className="btn">Shop Now</a>
        </div>
        <h2>Featured Products</h2>
        <div className="product-grid">
            {products.slice(0, 3).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
    </div>
);

const ProductListPage = () => (
    <div className="container">
        <h1>All Products</h1>
        <div className="product-grid">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
    </div>
);

// FIX: Add explicit type for id prop for type safety.
const ProductDetailPage = ({ id }: { id: number }) => {
    const { addToCart } = useCart();
    const product = products.find(p => p.id === id);

    if (!product) {
        return <div className="container"><h2>Product not found!</h2></div>;
    }

    return (
        <div className="container">
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
        </div>
    );
};

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container empty-cart">
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <a href="#/products" className="btn">Start Shopping</a>
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
                <a href="#/checkout" className="btn">Proceed to Checkout</a>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { getCartTotal, clearCart } = useCart();

    const handleSubmit = (e) => {
        e.preventDefault();
        clearCart();
        window.location.hash = '#/confirmation';
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

const ConfirmationPage = () => (
    <div className="container confirmation-page">
        <h1>Thank You For Your Order!</h1>
        <p>Your order has been placed successfully. We'll send you an email confirmation shortly.</p>
        <a href="#/" className="btn">Continue Shopping</a>
    </div>
);


// --- APP ---

const App = () => {
    const hash = useHashNavigation();
    const { page, id } = parseRoute(hash);

    const renderPage = () => {
        switch (page) {
            case 'product': return <ProductDetailPage id={id} />;
            case 'cart': return <CartPage />;
            case 'checkout': return <CheckoutPage />;
            case 'confirmation': return <ConfirmationPage />;
            case 'home': return <HomePage />;
            default: return <ProductListPage />;
        }
    }

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

ReactDOM.render(<App />, document.getElementById('root'));
