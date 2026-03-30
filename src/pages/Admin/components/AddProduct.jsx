import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../../services/supabaseClient';
import { compressImage, formatFileSize, validateFileSize } from '../../../utils/imageCompression';

const AddProduct = ({ onProductAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: '',
        price: ''
    });
    const [categories, setCategories] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageStats, setImageStats] = useState([]); // Track compression stats
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
            
            // Set first category as default if available
            if (data && data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    category: data[0].name
                }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        const maxImages = 3;

        if (files.length + imageFiles.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images`);
            return;
        }

        try {
            const compressedImages = [];
            const newStats = [...imageStats];

            for (const file of files) {
                // Determine quality based on file size
                let quality = 0.75; // Default quality
                if (file.size > 2 * 1024 * 1024) { // > 2MB
                    quality = 0.5; // Aggressive compression
                }

                // Compress image
                const compressed = await compressImage(file, quality);
                compressedImages.push(compressed.file);
                newStats.push({
                    name: file.name,
                    original: compressed.originalSize,
                    compressed: compressed.compressedSize,
                    compression: compressed.compression
                });
            }

            const newFiles = [...imageFiles, ...compressedImages];
            setImageFiles(newFiles);
            setImageStats(newStats);

            // Create previews
            const previews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        } catch (error) {
            console.error('Error processing images:', error);
            alert('Error processing images: ' + error.message);
        }
    };

    const removeImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const newStats = imageStats.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        setImageStats(newStats);
    };

    const uploadImages = async () => {
        const uploadedUrls = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const fileName = `${Date.now()}_${i}_${file.name}`;
            const filePath = `products/${fileName}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(data.publicUrl);
            } catch (error) {
                console.error('Image upload error:', error);
                alert('Error uploading image: ' + error.message);
                return null;
            }
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imageFiles.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        try {
            setLoading(true);

            // Upload images to Supabase Storage
            const imageUrls = await uploadImages();
            if (!imageUrls) return;

            // Use first image as main image
            const mainImage = imageUrls[0];

            // Insert product into database
            const { error } = await supabase
                .from('products')
                .insert([
                    {
                        title: formData.title,
                        category: formData.category,
                        content: formData.content,
                        price: parseFloat(formData.price),
                        image: mainImage,
                        images: imageUrls
                    }
                ]);

            if (error) throw error;

            alert('Product added successfully!');
            setFormData({
                title: '',
                category: categories.length > 0 ? categories[0].name : '',
                content: '',
                price: ''
            });
            setImageFiles([]);
            setImagePreviews([]);
            setImageStats([]);
            onProductAdded();
        } catch (error) {
            console.error('Error adding product:', error.message);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-form">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Armchair with Head Rester"
                    />
                </div>

                <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Product description..."
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
                    <label>Images (Up to 4) *</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={imageFiles.length >= 4}
                    />
                    <small>Upload up to 4 images. {imageFiles.length}/4 selected</small>
                </div>

                {imagePreviews.length > 0 && (
                    <div className="image-previews">
                        <h4>Image Previews:</h4>
                        <div className="preview-grid">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="preview-item">
                                    <img src={preview} alt={`Preview ${index}`} />
                                    <div className="preview-info">
                                        {imageStats[index] && (
                                            <small className="file-size-info">
                                                <div>Compressed</div>
                                                <div>{formatFileSize(imageStats[index].compressed)}</div>
                                                {imageStats[index].compression > 0 && (
                                                    <div style={{ color: '#4caf50' }}>↓ {imageStats[index].compression}%</div>
                                                )}
                                            </small>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
