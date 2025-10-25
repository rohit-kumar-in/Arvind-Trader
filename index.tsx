/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AboutPage } from './AboutPage.tsx';

// --- DATA & TYPES ---

interface Variant {
  id: number;
  size: string;
  color: string;
  price: number;
  sku: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  variants?: Variant[];
  price?: number; // For simple products without variants
}


interface CartItem {
    product: Product;
    variant: Variant;
    quantity: number;
}


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: Variant, quantity?: number) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
}


const products: Product[] = [
  { 
    id: 1, 
    name: 'Standard PP Carry Bag', 
    description: 'Durable and lightweight PP (polypropylene) bags, perfect for retail stores and groceries. Available in multiple sizes and colors.', 
    imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg',
    variants: [
        { id: 101, size: '500g', color: 'White', price: 150, sku: 'PP-500-W' },
        { id: 102, size: '500g', color: 'Black', price: 160, sku: 'PP-500-B' },
        { id: 103, size: '1kg', color: 'White', price: 250, sku: 'PP-1KG-W' },
        { id: 104, size: '1kg', color: 'Black', price: 265, sku: 'PP-1KG-B' },
        { id: 105, size: '2kg', color: 'White', price: 400, sku: 'PP-2KG-W' },
        { id: 106, size: '2kg', color: 'Black', price: 420, sku: 'PP-2KG-B' },
        { id: 107, size: '5kg', color: 'White', price: 600, sku: 'PP-5KG-W' },
        { id: 108, size: '5kg', color: 'Black', price: 630, sku: 'PP-5KG-B' },
    ]
  },
  { id: 2, name: 'Printed Non-Woven D-Cut Bag', price: 300, description: 'Eco-friendly non-woven fabric bags with a D-cut handle. Ideal for promotional events and boutiques. Price per 100 pieces. Custom printing available on bulk orders.', imageUrl: 'https://images.unsplash.com/photo-1623485790323-95f70a255956?q=80&w=1935&auto=format&fit=crop' },
  { id: 3, name: 'Heavy Duty Grocery Bag (W-Cut)', price: 250, description: 'Strong, reusable W-cut (vest style) bags designed to carry heavy grocery items without tearing. Price per 100 pieces. A reliable choice for supermarkets.', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop' },
  { id: 4, name: 'Custom Logo Fabric Tote Bag', price: 120, description: 'High-quality cotton fabric tote bags. Perfect for branding with your company logo. Stylish, washable, and reusable. Price per piece.', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, name: 'Transparent Garment Bags', price: 500, description: 'Clear polythene bags to protect clothing from dust and moisture. Price per roll. Ideal for dry cleaners, laundromats, and boutiques.', imageUrl: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1974&auto=format&fit=crop' },
  { id: 6, name: 'Eco-Friendly Jute Shopping Bag', price: 150, description: 'A stylish and sustainable option. These sturdy jute bags are perfect for eco-conscious brands and customers. Price per piece.', imageUrl: 'https://images.unsplash.com/photo-1621495474723-38c642e05f6a?q=80&w=1964&auto=format&fit=crop' },
  { id: 7, name: 'Brown Kraft Paper Bag with Handle', price: 450, description: 'Classic and recyclable brown paper bags with strong twisted paper handles. Price per 100 pieces. A great choice for restaurants and retail.', imageUrl: 'https://images.unsplash.com/photo-1526310242159-7b33989fb51e?q=80&w=1974&auto=format&fit=crop' },
  { id: 8, name: 'Tamper-Proof Courier Bags (100 Pack)', price: 400, description: 'Secure, self-sealing courier bags for e-commerce shipping. Tear-resistant and waterproof to protect contents.', imageUrl: 'https://images.unsplash.com/photo-1594894334346-a60205935b5b?q=80&w=2070&auto=format&fit=crop' },
  { id: 9, name: 'Small Polythene Pouch Bags (5x7)', price: 100, description: 'Versatile small clear pouches for packing spices, hardware, or other small items. Price per pack of 100.', imageUrl: 'https://images.unsplash.com/photo-1606554862580-0a544c4a4533?q=80&w=2070&auto=format&fit=crop' },
  { id: 10, name: 'Large Industrial Packaging Bag', price: 60, description: 'Extra-large and durable woven polypropylene sack for bulk storage and transport of grains, sand, or construction materials. Price per piece.', imageUrl: 'https://images.unsplash.com/photo-1618218932159-dd404748115b?q=80&w=2070&auto=format&fit=crop' },
];


// --- CART CONTEXT ---
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, variant: Variant, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id && item.variant.id === variant.id);
      if (existingItem) {
        return prevItems.map(item =>
          (item.product.id === product.id && item.variant.id === variant.id) ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { product, variant, quantity }];
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          `${item.product.id}-${item.variant.id}` === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => `${item.product.id}-${item.variant.id}` !== cartItemId));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.variant.price * item.quantity, 0);
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
const updateCanonicalUrl = (url: string) => {
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
};

export const updateSeoTags = (title: string, description: string, imageUrl?: string) => {
  document.title = title;
  updateCanonicalUrl(window.location.href);

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
    const getPriceDisplay = () => {
        if (product.variants && product.variants.length > 0) {
            const minPrice = Math.min(...product.variants.map(v => v.price));
            return `From ₹${minPrice.toFixed(2)}`;
        }
        return `₹${product.price?.toFixed(2)}`;
    };

    return (
        <div className="product-card">
            <Link href={`/product/${product.id}`}>
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                </div>
            </Link>
             <div className="product-info">
                <p className="product-price">{getPriceDisplay()}</p>
                <Link href={`/product/${product.id}`} className="btn">
                    {product.variants ? 'Select Options' : 'View Product'}
                </Link>
            </div>
        </div>
    );
};

// --- PAGES ---

const HomePage = () => {
    useEffect(() => {
        updateSeoTags('Arvind Trader | Wholesale Carry Bags in Bhagalpur', 'Your one-stop shop for high-quality PP bags, non-woven bags, and custom printed carry bags. Serving Jagdishpur, Bhagalpur and nearby areas.');
    }, []);
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Arvind Trader",
      "url": "https://arvind-trader.vercel.app/",
      "logo": "https://arvind-trader.vercel.app/logo.png", // Assume you have a logo
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "7644000929",
        "contactType": "customer service"
      },
      "description": "Wholesale and retail supplier of carry bags in Jagdishpur, Bhagalpur, Bihar."
    };

    return (
        <div className="container">
            <JsonLd data={organizationSchema} />
            <div className="hero">
                <h1>Wholesale Carry Bags for Your Business</h1>
                <p>High-quality PP, Non-Woven, and Custom Bags at Bhagalpur Market Rates.</p>
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
        updateSeoTags('All Carry Bag Products | Arvind Trader', 'Browse our full collection of PP bags, non-woven bags, fabric totes, and more for all your packaging needs.');
    }, []);
    return (
        <div className="container">
            <h1>All Products</h1>
            <div className="discount-callout">
                For bulk orders and discounts, please <a href="tel:7644000929">call us at 7644000929</a>.
            </div>
            <div className="product-grid">
                {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
        </div>
    );
};

const ProductDetailPage = ({ id }: { id: number }) => {
    const { addToCart } = useCart();
    const product = products.find(p => p.id === id);

    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product?.variants ? product.variants[0] : null);

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

    const handleAddToCart = () => {
        if (product.variants && selectedVariant) {
            addToCart(product, selectedVariant, 1);
        } else if (product.price) {
            // Fallback for simple products
            const simpleVariant: Variant = { id: product.id, price: product.price, sku: `AT-CB-${product.id}`, size: 'Standard', color: 'N/A' };
            addToCart(product, simpleVariant, 1);
        }
    };
    
    const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const variantId = parseInt(e.target.value, 10);
        const newVariant = product.variants?.find(v => v.id === variantId) || null;
        setSelectedVariant(newVariant);
    };

    const relatedProducts = products
        .filter(p => p.id !== product.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
    const getProductSchema = () => {
        const baseSchema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.imageUrl],
            "description": product.description,
            "category": "Packaging & Bags",
            "brand": { "@type": "Brand", "name": "Arvind Trader" },
        };

        if (product.variants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.price);
            return {
                ...baseSchema,
                "sku": `AT-CB-${product.id}`,
                "mpn": `AT-MPN-CB-${product.id}`,
                "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "INR",
                    "lowPrice": Math.min(...prices).toFixed(2),
                    "highPrice": Math.max(...prices).toFixed(2),
                    "offerCount": product.variants.length,
                    "availability": "https://schema.org/InStock"
                }
            };
        }

        return {
            ...baseSchema,
            "sku": `AT-CB-${product.id}`,
            "mpn": `AT-MPN-CB-${product.id}`,
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "INR",
                "price": product.price?.toFixed(2),
                "priceValidUntil": "2024-12-31",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock"
            }
        };
    };

    return (
        <div className="container">
            <JsonLd data={getProductSchema()} />
            <div className="product-detail-container">
                <div className="product-detail-image">
                    <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-detail-info">
                    <h1>{product.name}</h1>
                    <p className="product-detail-price">₹{(selectedVariant?.price || product.price || 0).toFixed(2)}</p>
                    <p className="product-detail-desc">{product.description}</p>

                    {product.variants && (
                      <div className="variant-selectors">
                          <div className="variant-selector">
                              <label htmlFor="variant-select">Options</label>
                              <select id="variant-select" value={selectedVariant?.id} onChange={handleVariantChange}>
                                {product.variants.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.size} / {v.color} - ₹{v.price.toFixed(2)}
                                    </option>
                                ))}
                              </select>
                          </div>
                      </div>
                    )}
                    
                    <div className="discount-callout">
                      For bulk orders and discounts, please <a href="tel:7644000929">call us at 7644000929</a>.
                    </div>

                    <button onClick={handleAddToCart} className="btn">Add to Cart</button>
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
            {cartItems.map(item => {
                const cartItemId = `${item.product.id}-${item.variant.id}`;
                return (
                    <div key={cartItemId} className="cart-item">
                        <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
                        <div className="cart-item-info">
                            <h3 className="cart-item-name">{item.product.name}</h3>
                            <p className="cart-item-variant">{item.variant.size} / {item.variant.color}</p>
                            <p>₹{item.variant.price.toFixed(2)}</p>
                        </div>
                        <div className="quantity-controls">
                            <button onClick={() => updateQuantity(cartItemId, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(cartItemId, item.quantity + 1)}>+</button>
                        </div>
                        <p>₹{(item.variant.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(cartItemId)} className="btn btn-danger">Remove</button>
                    </div>
                );
            })}
            <div className="cart-summary">
                 <h2>Order Summary</h2>
                <p className="cart-total">Total: ₹{getCartTotal().toFixed(2)}</p>
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
                    <h3>Total: ₹{getCartTotal().toFixed(2)}</h3>
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