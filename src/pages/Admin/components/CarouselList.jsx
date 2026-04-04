import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import '../admin.scss';

const CarouselList = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [position, setPosition] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.storage
                .from('product-images')
                .list('carousel', {
                    limit: 10,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) throw error;
            
            // Filter out system files or empty placeholders if any
            const files = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.DS_Store');

            // Generate public URLs for each file
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
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

            // If an image already exists at this position, try to delete it first
            if (existingFile) {
                const { error: removeError } = await supabase.storage
                    .from('product-images')
                    .remove([`carousel/${existingFile.name}`]);
                
                if (removeError) {
                    console.warn('Could not remove previously existing file at this position. You might need to update Storage Policies in Supabase.', removeError);
                } else {
                    console.log(`Replaced old slide at position ${position}`);
                }
            }

            const fileName = `${prefix}${Date.now()}_${imageFile.name}`;
            const filePath = `carousel/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            alert('Carousel image uploaded successfully!');
            setImageFile(null);
            setImagePreview(null);
            document.getElementById('carousel-upload').value = ''; // Reset input
            fetchImages();
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
            const { error } = await supabase.storage
                .from('product-images')
                .remove([`carousel/${fileName}`]);

            if (error) throw error;

            alert('Image deleted successfully!');
            fetchImages();
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error: ' + error.message);
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
                <form onSubmit={handleUpload} className="d-flex align-items-center gap-3">
                    <div>
                        <select 
                            className="form-select" 
                            style={{ minWidth: '120px' }}
                            value={position} 
                            onChange={(e) => setPosition(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>Position {num}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            type="file"
                            id="carousel-upload"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="form-control"
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
                    images.map((img, index) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card h-100">
                                <img 
                                    src={img.url} 
                                    className="card-img-top" 
                                    alt={`Slide ${index + 1}`} 
                                    style={{ height: '200px', objectFit: 'cover' }} 
                                />
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0 text-truncate" style={{ maxWidth: '80%' }}>
                                        {img.name}
                                    </h6>
                                    <button 
                                        className="btn btn-sm btn-danger px-2"
                                        onClick={() => handleDelete(img.name)}
                                        title="Delete Image"
                                    >
                                        ✕
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