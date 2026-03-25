import React, { useState, useMemo } from 'react';
import { supabase } from '../../../services/supabaseClient';
import EditProduct from './EditProduct';

const ProductsList = ({ products, onProductDeleted, onProductUpdated, categories = [] }) => {
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Product deleted successfully!');
            onProductDeleted();
        } catch (error) {
            console.error('Error deleting product:', error.message);
            alert('Error: ' + error.message);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    if (products.length === 0) {
        return <p className="no-products">No products found. Add your first product!</p>;
    }

    return (
        <div className="products-list">
            <div className="products-controls">
                <div className="search-box">
                    <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-box">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <h2>Products ({filteredProducts.length})</h2>
            
            {filteredProducts.length === 0 ? (
                <p className="no-products">No products match your search or filter.</p>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th className="category-th">Category</th>
                                <th className="price-th">Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="img-cell">
                                        <img src={product.image} alt={product.title} />
                                    </td>
                                    <td className="title-cell">{product.title}</td>
                                    <td className="category-cell">{product.category}</td>
                                    <td className="price-cell">£{product.price}</td>
                                    <td className="actions">
                                        <button 
                                            className="btn-edit"
                                            onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                                        >
                                            {editingId === product.id ? '✕' : '✎ Edit'}
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingId && (
                <EditProduct 
                    product={filteredProducts.find(p => p.id === editingId)}
                    onClose={() => setEditingId(null)}
                    onProductUpdated={onProductUpdated}
                />
            )}
        </div>
    );
};

export default ProductsList;
