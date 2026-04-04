import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../../services/supabaseClient';

const SubcategoriesList = ({ onSubcategoriesChanged }) => {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category_name: '',
        coverImage: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
            
            if (data && data.length > 0 && !formData.category_name) {
                setFormData(prev => ({ ...prev, category_name: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabaseAdmin
                .from('subcategories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubcategories(data || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
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
            const filePath = `subcategories/${fileName}`;

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

        if (!formData.category_name) {
            alert('Please select a main category');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = formData.coverImage;

            if (imageFile) {
                imageUrl = await uploadImage();
                if (imageFile && !imageUrl) return; // if it failed
            }

            if (editingId) {
                const { error } = await supabaseAdmin
                    .from('subcategories')
                    .update({
                        name: formData.name,
                        category_name: formData.category_name,
                        cover_image: imageUrl
                    })
                    .eq('id', editingId);

                if (error) throw error;
                alert('Subcategory updated successfully!');
                setEditingId(null);
            } else {
                const { error } = await supabaseAdmin
                    .from('subcategories')
                    .insert([{
                        name: formData.name,
                        category_name: formData.category_name,
                        cover_image: imageUrl
                    }]);

                if (error) throw error;
                alert('Subcategory added successfully!');
            }

            setFormData(prev => ({ name: '', category_name: prev.category_name, coverImage: '' }));
            setImageFile(null);
            setImagePreview(null);
            setShowAddForm(false);
            fetchSubcategories();
            if (onSubcategoriesChanged) onSubcategoriesChanged();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (subcategory) => {
        setFormData({
            name: subcategory.name,
            category_name: subcategory.category_name,
            coverImage: subcategory.cover_image || ''
        });
        setImageFile(null);
        setImagePreview(subcategory.cover_image || null);
        setEditingId(subcategory.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subcategory?')) return;
        try {
            // Get subcategory to retrieve image URL
            const { data: subcategory, error: fetchError } = await supabaseAdmin
                .from('subcategories')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Delete image from storage
            if (subcategory.cover_image) {
                const urlParts = subcategory.cover_image.split('/');
                const fileName = urlParts[urlParts.length - 1];

                await supabase.storage
                    .from('product-images')
                    .remove([`subcategories/${fileName}`]);
            }

            const { error } = await supabaseAdmin
                .from('subcategories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Subcategory and image deleted successfully!');
            fetchSubcategories();
            if (onSubcategoriesChanged) onSubcategoriesChanged();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData(prev => ({ name: '', category_name: prev.category_name, coverImage: '' }));
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div className="categories-management">
            <div className="section-header mb-4">
                <h2>Subcategories Management</h2>
                {!showAddForm && (
                    <button 
                        className="btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Subcategory
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="add-category-form mb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label>Parent Category *</label>
                            <select 
                                name="category_name" 
                                value={formData.category_name} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">-- Select Parent Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mb-3">
                            <label>Subcategory Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Office Chairs, Recliners"
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label>Cover Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </div>

                        {imagePreview && (
                            <div className="image-preview">
                                <p>Preview:</p>
                                <img src={imagePreview} alt="Cover preview" className="preview-image" />
                            </div>
                        )}

                        <div className="form-actions mt-4">
                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : (editingId ? 'Update Subcategory' : 'Add Subcategory')}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn-cancel" disabled={uploading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading subcategories...</p>
            ) : subcategories.length === 0 ? (
                <p>No subcategories yet</p>
            ) : (
                <div className="categories-grid">
                    {subcategories.map(sub => (
                        <div key={sub.id} className="category-card">
                            <div className="category-image">
                                {sub.cover_image ? (
                                    <img src={sub.cover_image} alt={sub.name} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#999' }}>No Image</div>
                                )}
                            </div>
                            <div className="category-info">
                                <h3 className="category-name">{sub.name}</h3>
                                <p style={{ fontSize: '0.8em', color: '#777', margin: '4px 0' }}>Under: {sub.category_name}</p>
                                <div className="category-actions">
                                    <button className="btn-edit" onClick={() => handleEdit(sub)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(sub.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubcategoriesList;
