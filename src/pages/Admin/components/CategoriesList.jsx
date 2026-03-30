import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../../services/supabaseClient';

const CategoriesList = ({ onCategoriesChanged }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        coverImage: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        try {
            const fileName = `${Date.now()}_${imageFile.name}`;
            const filePath = `categories/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Error uploading image: ' + error.message);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile && !formData.coverImage) {
            alert('Please upload or select an image');
            return;
        }
        
        try {
            setUploading(true);
            let imageUrl = formData.coverImage;

            // Upload image if a new file was selected
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) return;
            }

            if (editingId) {
                // Update
                const { error } = await supabaseAdmin
                    .from('categories')
                    .update({
                        name: formData.name,
                        cover_image: imageUrl
                    })
                    .eq('id', editingId);

                if (error) throw error;
                alert('Category updated successfully!');
                setEditingId(null);
            } else {
                // Insert
                const { error } = await supabaseAdmin
                    .from('categories')
                    .insert([{
                        name: formData.name,
                        cover_image: imageUrl
                    }]);

                if (error) throw error;
                alert('Category added successfully!');
            }

            setFormData({ name: '', coverImage: '' });
            setImageFile(null);
            setImagePreview(null);
            setShowAddForm(false);
            fetchCategories();
            if (onCategoriesChanged) onCategoriesChanged();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            coverImage: category.cover_image || ''
        });
        setImageFile(null);
        setImagePreview(category.cover_image || null);
        setEditingId(category.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;

        try {
            const { error } = await supabaseAdmin
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Category deleted successfully!');
            fetchCategories();
            if (onCategoriesChanged) onCategoriesChanged();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ name: '', coverImage: '' });
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div className="categories-management">
            <div className="section-header mb-4">
                <h2>Categories Management</h2>
                {!showAddForm && (
                    <button 
                        className="btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Category
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="add-category-form mb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Category Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Chair, Sofa, Table"
                            />
                        </div>

                        <div className="form-group">
                            <label>Cover Image (Up to 2MB) *</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            <small>Select an image file to upload</small>
                        </div>

                        {imagePreview && (
                            <div className="image-preview">
                                <p>Preview:</p>
                                <img src={imagePreview} alt="Cover preview" className="preview-image" />
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : (editingId ? 'Update Category' : 'Add Category')}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn-cancel" disabled={uploading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading categories...</p>
            ) : categories.length === 0 ? (
                <p>No categories yet</p>
            ) : (
                <div className="categories-grid">
                    {categories.map(cat => (
                        <div key={cat.id} className="category-card">
                            <div className="category-image">
                                {cat.cover_image && (
                                    <img src={cat.cover_image} alt={cat.name} />
                                )}
                            </div>
                            <div className="category-info">
                                <h3 className="category-name">{cat.name}</h3>
                                <div className="category-actions">
                                    <button 
                                        className="btn-edit"
                                        onClick={() => handleEdit(cat)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesList;
