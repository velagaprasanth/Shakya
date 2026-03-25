import React, { useState } from 'react';
import { supabase, supabaseAdmin } from '../../../services/supabaseClient';

/**
 * EditProduct Component
 * Modal form for editing existing products
 * Features:
 * - File upload for product images (stores to Supabase Storage)
 * - Image preview before submission
 * - Updates product data in database
 * - Form validation
 */
const EditProduct = ({ product, onClose, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        title: product.title,
        category: product.category,
        content: product.content || '',
        price: product.price,
        image: product.image || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(product.image);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image file selection and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create local preview using FileReader
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            let imageUrl = formData.image;

            // Upload new image if file is selected
            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { error: uploadError, data } = await supabaseAdmin.storage
                    .from('product-images')
                    .upload(`products/${fileName}`, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrl } = supabaseAdmin.storage
                    .from('product-images')
                    .getPublicUrl(`products/${fileName}`);

                imageUrl = publicUrl.publicUrl;
            }

            const { error } = await supabase
                .from('products')
                .update({
                    title: formData.title,
                    category: formData.category,
                    content: formData.content,
                    price: parseFloat(formData.price),
                    image: imageUrl
                })
                .eq('id', product.id);

            if (error) throw error;

            alert('Product updated successfully!');
            onProductUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating product:', error.message);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-product-modal">
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Product</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option>Chair</option>
                            <option>Sofa</option>
                            <option>Table</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Price (£) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Image *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <div style={{ marginTop: '10px' }}>
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
