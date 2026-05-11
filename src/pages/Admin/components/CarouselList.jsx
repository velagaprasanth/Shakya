import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';
import '../admin.scss';

const CarouselList = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null); // Track which image is being deleted
    const [position, setPosition] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Helper function to retry operations with exponential backoff
    const retryWithBackoff = async (operation, maxRetries = 3) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                // Check if it's a lock-related error
                if (error?.message?.includes('Lock broken') || error?.name === 'AbortError') {
                    const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
                    if (attempt < maxRetries - 1) {
                        console.warn(`Lock error, retrying in ${delay}ms...`, error);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                throw error;
            }
        }
    };

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await retryWithBackoff(async () => {
                return await supabase.storage
                    .from('product-images')
                    .list('carousel', {
                        limit: 10,
                        offset: 0,
                        sortBy: { column: 'name', order: 'asc' },
                    });
            });

            if (error) throw error;
            
            // Filter out system files
            const files = (data || []).filter(f => 
                !f.name.startsWith('.') && f.name !== '.emptyFolderPlaceholder'
            );

            // Generate public URLs for all files in parallel (getPublicUrl is synchronous)
            const imageUrls = files.map(file => {
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(`carousel/${file.name}`);
                
                return {
                    name: file.name,
                    url: publicUrlData.publicUrl
                };
            });

            setImages(imageUrls);
        } catch (error) {
            console.error('Error fetching carousel images:', error);
            alert('Failed to load carousel images. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        setImageFile(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select an image to upload.');
            return;
        }

        try {
            setUploading(true);

            // Determine prefix based on selected position
            const prefix = `slide_${position}_`;
            const existingFile = images.find(img => img.name.startsWith(prefix));

            // If an image already exists at this position, delete it first
            if (existingFile) {
                try {
                    await retryWithBackoff(async () => {
                        return await supabase.storage
                            .from('product-images')
                            .remove([`carousel/${existingFile.name}`]);
                    });
                    console.log(`Replaced old slide at position ${position}`);
                } catch (removeError) {
                    console.warn('Could not remove existing file. Proceeding with upload anyway.', removeError);
                }
            }

            const fileName = `${prefix}${Date.now()}_${imageFile.name}`;
            const filePath = `carousel/${fileName}`;

            const { error: uploadError } = await retryWithBackoff(async () => {
                return await supabase.storage
                    .from('product-images')
                    .upload(filePath, imageFile);
            });

            if (uploadError) throw uploadError;

            // Update state locally instead of refetching all images
            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setImages(prev => {
                // Remove old image if it existed
                const updated = prev.filter(img => !img.name.startsWith(prefix));
                // Add new image
                updated.push({
                    name: fileName,
                    url: publicUrlData.publicUrl
                });
                return updated;
            });

            alert('Carousel image uploaded successfully!');
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileName) => {
        if (!window.confirm('Delete this carousel image?')) return;
        
        try {
            setDeleting(fileName);
            
            const { error } = await retryWithBackoff(async () => {
                return await supabase.storage
                    .from('product-images')
                    .remove([`carousel/${fileName}`]);
            });

            if (error) throw error;

            // Update state locally instead of refetching
            setImages(prev => prev.filter(img => img.name !== fileName));
            alert('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error: ' + error.message);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="admin-list-container">
            <div className="admin-header d-flex justify-content-between align-items-center">
                <h2>Manage Carousel Images</h2>
            </div>

            <div className="admin-form-container mt-4 mb-5 p-4 border rounded">
                <h4>Add New Slide</h4>
                <p className="text-muted mb-3">
                    <strong>Note:</strong> Select the position (1 to 5) for your slide. Uploading to a specific position will automatically replace any existing slide at that number. Max 5 slides.
                </p>
                <form onSubmit={handleUpload} className="d-flex align-items-center gap-3 flex-wrap">
                    <div>
                        <select 
                            className="form-select" 
                            style={{ minWidth: '120px' }}
                            value={position} 
                            onChange={(e) => setPosition(Number(e.target.value))}
                            disabled={uploading}
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>Position {num}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="form-control"
                            disabled={uploading}
                        />
                    </div>
                    {imagePreview && (
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ height: '60px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} 
                        />
                    )}
                    <button type="submit" className="btn btn-primary" disabled={uploading || !imageFile}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                </form>
            </div>

            <div className="admin-grid row">
                {loading ? (
                    <p>Loading images...</p>
                ) : images.length === 0 ? (
                    <p>No custom carousel images found. The website is currently displaying the default local images.</p>
                ) : (
                    images.map((img) => (
                        <div key={img.name} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card h-100">
                                <img 
                                    src={img.url} 
                                    className="card-img-top" 
                                    alt={img.name}
                                    style={{ height: '200px', objectFit: 'cover' }} 
                                />
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0 text-truncate" style={{ maxWidth: '80%' }}>
                                        {img.name}
                                    </h6>
                                    <button 
                                        className="btn btn-sm btn-danger px-2"
                                        onClick={() => handleDelete(img.name)}
                                        disabled={deleting === img.name}
                                        title={deleting === img.name ? 'Deleting...' : 'Delete Image'}
                                    >
                                        {deleting === img.name ? '⏳' : '✕'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CarouselList;