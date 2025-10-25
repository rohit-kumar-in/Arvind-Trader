/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AboutPage } from './AboutPage.tsx';
import { AdminPage } from './AdminPage.tsx';

// --- DATA & TYPES ---

export interface Variant {
  id: number;
  size: string;
  color: string;
  price: number;
  sku: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
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


const initialProducts: Product[] = [
  { 
    id: 1, 
    name: 'Standard PP Carry Bag', 
    description: 'Durable and lightweight PP (polypropylene) bags, perfect for retail stores and groceries. Available in multiple sizes and colors.', 
    imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg',
    category: 'PP Bags',
    variants: [
        { id: 101, size: '500g', color: 'White', price: 150, sku: 'PP-500-W', imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg' },
        { id: 102, size: '500g', color: 'Black', price: 160, sku: 'PP-500-B', imageUrl: 'https://i.imgur.com/TpHy2P5.jpeg' },
        { id: 103, size: '1kg', color: 'White', price: 250, sku: 'PP-1KG-W', imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg' },
        { id: 104, size: '1kg', color: 'Black', price: 265, sku: 'PP-1KG-B', imageUrl: 'https://i.imgur.com/TpHy2P5.jpeg' },
        { id: 105, size: '2kg', color: 'White', price: 400, sku: 'PP-2KG-W', imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg' },
        { id: 106, size: '2kg', color: 'Black', price: 420, sku: 'PP-2KG-B', imageUrl: 'https://i.imgur.com/TpHy2P5.jpeg' },
        { id: 107, size: '5kg', color: 'White', price: 600, sku: 'PP-5KG-W', imageUrl: 'https://i.imgur.com/8L5s2aN.jpeg' },
        { id: 108, size: '5kg', color: 'Black', price: 630, sku: 'PP-5KG-B', imageUrl: 'https://i.imgur.com/TpHy2P5.jpeg' },
    ]
  },
  { id: 2, name: 'Printed Non-Woven D-Cut Bag', price: 300, description: 'Eco-friendly non-woven fabric bags with a D-cut handle. Ideal for promotional events and boutiques. Price per 100 pieces. Custom printing available on bulk orders.', imageUrl: 'https://i.imgur.com/k2V3L4U.jpeg', category: 'Non-Woven Bags' },
  { id: 3, name: 'Heavy Duty Grocery Bag (W-Cut)', price: 250, description: 'Strong, reusable W-cut (vest style) bags designed to carry heavy grocery items without tearing. Price per 100 pieces. A reliable choice for supermarkets.', imageUrl: 'https://i.imgur.com/7ZQ2jL5.jpeg', category: 'Grocery Bags' },
  { id: 4, name: 'Custom Logo Fabric Tote Bag', price: 120, description: 'High-quality cotton fabric tote bags. Perfect for branding with your company logo. Stylish, washable, and reusable. Price per piece.', imageUrl: 'https://i.imgur.com/v13MCMF.jpeg', category: 'Fabric & Tote Bags' },
  { id: 5, name: 'Transparent Garment Bags', price: 500, description: 'Clear polythene bags to protect clothing from dust and moisture. Price per roll. Ideal for dry cleaners, laundromats, and boutiques.', imageUrl: 'https://i.imgur.com/f0tqY45.jpeg', category: 'Specialty Bags' },
  { id: 6, name: 'Eco-Friendly Jute Shopping Bag', price: 150, description: 'A stylish and sustainable option. These sturdy jute bags are perfect for eco-conscious brands and customers. Price per piece.', imageUrl: 'https://i.imgur.com/J3q2T6h.jpeg', category: 'Fabric & Tote Bags' },
  { id: 7, name: 'Brown Kraft Paper Bag with Handle', price: 450, description: 'Classic and recyclable brown paper bags with strong twisted paper handles. Price per 100 pieces. A great choice for restaurants and retail.', imageUrl: 'https://i.imgur.com/U8V1i9v.jpeg', category: 'Paper Bags' },
  { id: 8, name: 'Tamper-Proof Courier Bags (100 Pack)', price: 400, description: 'Secure, self-sealing courier bags for e-commerce shipping. Tear-resistant and waterproof to protect contents.', imageUrl: 'https://i.imgur.com/tIuYpZI.jpeg', category: 'Specialty Bags' },
  { id: 9, name: 'Small Polythene Pouch Bags (5x7)', price: 100, description: 'Versatile small clear pouches for packing spices, hardware, or other small items. Price per pack of 100.', imageUrl: 'https://i.imgur.com/g05kY9E.jpeg', category: 'PP Bags' },
  { id: 10, name: 'Large Industrial Packaging Bag', price: 60, description: 'Extra-large and durable woven polypropylene sack for bulk storage and transport of grains, sand, or construction materials. Price per piece.', imageUrl: 'https://i.imgur.com/s6Xm1q8.jpeg', category: 'Industrial Bags' },
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

  // Only set meta image tags if it's a real URL, not a long data URI
  if (imageUrl && !imageUrl.startsWith('data:')) {
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'twitter:image', imageUrl);
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
        <p>&copy; {new Date().getFullYear()} Arvind Trader. All Rights Reserved. | <Link href="/admin">Admin</Link></p>
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

const HomePage = ({ products, heroImageUrl }: { products: Product[], heroImageUrl: string }) => {
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

    const heroStyle = {
      backgroundImage: `linear-gradient(rgba(10, 37, 64, 0.6), rgba(10, 37, 64, 0.6)), url('${heroImageUrl}')`
    };

    return (
        <div className="container">
            <JsonLd data={organizationSchema} />
            <div className="hero" style={heroStyle}>
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

const ProductListPage = ({ products }: { products: Product[] }) => {
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

const ProductDetailPage = ({ id, products }: { id: number, products: Product[] }) => {
    const { addToCart } = useCart();
    const product = products.find(p => p.id === id);

    const [selectedColor, setSelectedColor] = useState<string | null>(product?.variants ? product.variants[0].color : null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product?.variants ? product.variants[0].size : null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product?.variants ? product.variants[0] : null);
    const [currentImage, setCurrentImage] = useState<string | undefined>(product?.imageUrl);
    
    useEffect(() => {
        if (product?.variants && selectedColor && selectedSize) {
            const newVariant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
            setSelectedVariant(newVariant || null);
        }
    }, [product, selectedColor, selectedSize]);

    useEffect(() => {
      if (selectedVariant?.imageUrl) {
        setCurrentImage(selectedVariant.imageUrl);
      } else if (product?.imageUrl) {
        setCurrentImage(product.imageUrl);
      }
    }, [selectedVariant, product]);

    useEffect(() => {
        if (product) {
            updateSeoTags(`${product.name} | Arvind Trader`, product.description, currentImage);
        } else {
            updateSeoTags('Product Not Found | Arvind Trader', 'The product you are looking for does not exist.');
        }
    }, [product, currentImage]);

    if (!product) {
        return <div className="container"><h2>Product not found!</h2></div>;
    }

    const handleAddToCart = () => {
        if (product.variants && selectedVariant) {
            addToCart(product, selectedVariant, 1);
        } else if (product.price) {
            const simpleVariant: Variant = { id: product.id, price: product.price, sku: `AT-CB-${product.id}`, size: 'Standard', color: 'N/A' };
            addToCart(product, simpleVariant, 1);
        }
    };
    
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const isCurrentSizeAvailable = product.variants?.some(v => v.color === color && v.size === selectedSize);
        if (!isCurrentSizeAvailable) {
            const firstAvailableSize = product.variants?.find(v => v.color === color)?.size;
            setSelectedSize(firstAvailableSize || null);
        }
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSize(e.target.value);
    };

    const relatedProducts = products
        .filter(p => p.id !== product.id && p.category === product.category)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
    const getProductSchema = () => {
        const imagesForSchema = product.imageUrl && !product.imageUrl.startsWith('data:') ? [product.imageUrl] : [];

        const baseSchema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": imagesForSchema,
            "description": product.description,
            "category": product.category,
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

    const uniqueColors = product.variants ? [...new Set(product.variants.map(v => v.color))] : [];
    const availableSizes = product.variants ? product.variants.filter(v => v.color === selectedColor).map(v => v.size) : [];

    return (
        <div className="container">
            <JsonLd data={getProductSchema()} />
            <div className="product-detail-container">
                <div className="product-detail-image">
                    <img src={currentImage} alt={`${product.name} - ${selectedColor}`} />
                </div>
                <div className="product-detail-info">
                    <h1>{product.name}</h1>
                    <p className="product-detail-price">₹{(selectedVariant?.price || product.price || 0).toFixed(2)}</p>
                    <p className="product-detail-desc">{product.description}</p>

                    {product.variants && (
                      <div className="variant-selectors">
                        {uniqueColors.length > 0 && (
                            <div className="variant-selector">
                              <label>Color</label>
                              <div className="color-selector">
                                {uniqueColors.map(color => (
                                  <button 
                                    key={color} 
                                    className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    onClick={() => handleColorChange(color)}
                                    aria-label={`Select color ${color}`}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {availableSizes.length > 0 && (
                            <div className="variant-selector">
                              <label htmlFor="size-select">Size</label>
                              <select id="size-select" value={selectedSize || ''} onChange={handleSizeChange}>
                                {availableSizes.map(size => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                      </div>
                    )}
                    
                    <div className="discount-callout">
                      For bulk orders and discounts, please <a href="tel:7644000929">call us at 7644000929</a>.
                    </div>

                    <button onClick={handleAddToCart} className="btn" disabled={!selectedVariant && !!product.variants}>Add to Cart</button>
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
                        <img src={item.variant.imageUrl || item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
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
    const defaultHeroImage = 'https://i.imgur.com/5z02k5c.jpeg';

    const [products, setProducts] = useState<Product[]>(() => {
        try {
            const savedProducts = localStorage.getItem('arvind-trader-products');
            return savedProducts ? JSON.parse(savedProducts) : initialProducts;
        } catch (error) {
            console.error("Could not parse products from localStorage", error);
            return initialProducts;
        }
    });
    
    const [heroImageUrl, setHeroImageUrl] = useState<string>(() => {
        return localStorage.getItem('arvind-trader-hero-image') || defaultHeroImage;
    });


    useEffect(() => {
        localStorage.setItem('arvind-trader-products', JSON.stringify(products));
    }, [products]);


    // Handle Google site verification file route
    if (path === '/googlef1dff6d4da7988a6.html') {
        // We render the verification string directly. This is a workaround
        // for issues where static file serving might fail. Google's crawler
        // will find this string in the page body.
        return <>google-site-verification: googlef1dff6d4da7988a6.html</>;
    }
    
    const parts = path.split('/').filter(Boolean);

    const renderPage = () => {
        if (parts.length === 0) return <HomePage products={products} heroImageUrl={heroImageUrl} />;
        if (parts[0] === 'products') return <ProductListPage products={products} />;
        if (parts[0] === 'product' && parts[1]) {
            const id = parseInt(parts[1], 10);
            return <ProductDetailPage id={id} products={products} />;
        }
        if (parts[0] === 'cart') return <CartPage />;
        if (parts[0] === 'about') return <AboutPage />;
        if (parts[0] === 'checkout') return <CheckoutPage />;
        if (parts[0] === 'confirmation') return <ConfirmationPage />;
        if (parts[0] === 'admin') return <AdminPage products={products} setProducts={setProducts} setHeroImageUrl={setHeroImageUrl} />;
        
        return <HomePage products={products} heroImageUrl={heroImageUrl} />; // Fallback to home page
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