import React, { useState, useEffect } from 'react';
import { Product } from './index.tsx';

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
    onSave(formData as Product);
  };

  return (
    <div className="admin-form-container">
      <h2>{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} required />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (for simple products)</label>
          <input type="number" name="price" value={formData.price || ''} onChange={handleChange} step="0.01" />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageUpload} />
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
export const AdminPage = ({ products, setProducts }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    const password = prompt('Enter admin password:');
    if (password === 'admin123') {
      setIsAuthenticated(true);
    }
  }, []);
  
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
    if (productToSave.id) {
        // Update existing product
        setProducts(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
    } else {
        // Add new product
        const newProduct = { ...productToSave, id: Date.now() }; // Simple unique ID
        setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null); // Close form
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
      <h1>Manage Products</h1>
      <button className="btn" onClick={handleAddNew} style={{marginBottom: '1rem'}}>Add New Product</button>
      <div className="admin-product-list">
        {products.map(product => (
          <div key={product.id} className="admin-product-item">
            <img src={product.imageUrl} alt={product.name} />
            <span>{product.name}</span>
            <div className="admin-product-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(product)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
