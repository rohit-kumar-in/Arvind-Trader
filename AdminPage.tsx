import React, { useState, useEffect, useMemo } from 'react';
import { Product } from './index.tsx';

const PRODUCTS_PER_PAGE = 5;

// --- HELPERS ---
const getProductMinPrice = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
        return Math.min(...product.variants.map(v => v.price));
    }
    return product.price || 0;
};


// --- SUB-COMPONENT: PRODUCT FORM ---
const ProductForm = ({
  product,
  onSave,
  onCancel,
}: {
  product: Partial<Product>;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
        alert('Please enter a category for the product.');
        return;
    }
    onSave(formData as Product);
  };

  return (
    <div className="admin-form-container">
      <h2>{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input type="text" id="category" name="category" value={formData.category || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={4} required />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (for simple products)</label>
          <input type="number" id="price" name="price" value={formData.price || ''} onChange={handleChange} step="0.01" />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image</label>
          <input type="file" id="imageUrl" name="image" accept="image/*" onChange={handleImageUpload} />
          {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="image-preview" />}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn">Save Product</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// --- MAIN COMPONENT: ADMIN PAGE ---
export const AdminPage = ({ products, setProducts, setHeroImageUrl }: { 
    products: Product[]; 
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    setHeroImageUrl: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  
  const defaultHeroImage = 'https://i.imgur.com/5z02k5c.jpeg';
  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.category)))], [products]);


  useEffect(() => {
    const password = prompt('Enter admin password:');
    if (password === 'admin123') {
      setIsAuthenticated(true);
    }
  }, []);
  
  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter);
    
    switch (sortOrder) {
        case 'az':
            processedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'za':
            processedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-lh':
            processedProducts.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
            break;
        case 'price-hl':
            processedProducts.sort((a, b) => getProductMinPrice(b) - getProductMinPrice(a));
            break;
    }
    
    return processedProducts;
  }, [products, searchTerm, categoryFilter, sortOrder]);
  
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, categoryFilter]);


  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleAddNew = () => {
    setEditingProduct({});
  };

  const handleDelete = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleSave = (productToSave: Product) => {
    // Create a mutable copy to ensure we can modify it.
    const updatedProduct = { ...productToSave };

    // If the product has variants, we need to ensure their images are
    // synchronized with the main product image that was just uploaded.
    // The product detail page prioritizes variant images, so if they
    // aren't updated, the new main image won't show.
    if (updatedProduct.variants && updatedProduct.variants.length > 0) {
      updatedProduct.variants = updatedProduct.variants.map(variant => ({
        ...variant,
        imageUrl: updatedProduct.imageUrl, // Set variant image to the main product image
      }));
    }

    if (updatedProduct.id) {
        // This is an existing product, so we update it in the list.
        setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    } else {
        // This is a new product.
        const placeholderImage = 'https://i.imgur.com/dynTM3k.png'; // Generic placeholder
        const newProduct = { 
            ...updatedProduct, 
            id: Date.now(),
            // Ensure new products without an uploaded image get a placeholder.
            imageUrl: updatedProduct.imageUrl || placeholderImage 
        };
        setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
  };
  
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newImageUrl = reader.result as string;
              setHeroImageUrl(newImageUrl);
              localStorage.setItem('arvind-trader-hero-image', newImageUrl);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleResetBanner = () => {
      setHeroImageUrl(defaultHeroImage);
      localStorage.removeItem('arvind-trader-hero-image');
  };


  if (!isAuthenticated) {
    return <div className="container"><h2>Admin Access Only</h2><p>Please refresh and enter the correct password.</p></div>;
  }

  if (editingProduct) {
    return (
        <div className="container">
            <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setEditingProduct(null)} />
        </div>
    );
  }

  return (
    <div className="container admin-container">
      <h1>Admin Panel</h1>
      <div className="admin-section">
          <div className="admin-header">
              <h2>Manage Products ({filteredAndSortedProducts.length})</h2>
              <button className="btn" onClick={handleAddNew}>Add New Product</button>
          </div>
          
          <div className="admin-controls">
            <input 
                type="text" 
                placeholder="Search products..." 
                className="admin-search-input" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="admin-control-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
            <select className="admin-control-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="default">Sort by Default</option>
                <option value="az">Sort by Name (A-Z)</option>
                <option value="za">Sort by Name (Z-A)</option>
                <option value="price-lh">Sort by Price (Low to High)</option>
                <option value="price-hl">Sort by Price (High to Low)</option>
            </select>
          </div>

          <div className="admin-product-list">
            {currentProducts.map(product => (
              <div key={product.id} className="admin-product-item">
                <img src={product.imageUrl} alt={product.name} />
                <div className="admin-product-details">
                    <span className="admin-product-name">{product.name}</span>
                    <span className="admin-product-category">{product.category}</span>
                </div>
                <div className="admin-product-actions">
                    <button className="btn btn-secondary" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                </div>
              </div>
            ))}
             {filteredAndSortedProducts.length === 0 && <p>No products found.</p>}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
                <button className="btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className="btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
      </div>
      <div className="admin-section">
        <h2>Homepage Banner</h2>
        <div className="form-group">
            <label htmlFor="banner-upload">Upload New Banner</label>
            <input type="file" id="banner-upload" name="banner" accept="image/*" onChange={handleBannerUpload} />
        </div>
        <button className="btn btn-secondary" onClick={handleResetBanner}>Reset to Default</button>
      </div>
    </div>
  );
};