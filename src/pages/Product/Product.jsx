import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { supabase } from '../../services/supabaseClient';
import { updateMetaTags, resetMetaTags } from '../../utils/updateMetaTags';
import { getCache, setCache } from '../../utils/cache';
import "./Product.scss";

const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            
            // Check cache first
            const cacheKey = `product_${id}`;
            const cachedData = getCache(cacheKey);
            if (cachedData) {
                setProduct(cachedData);
                setSelectedImage(0);
                updateMetaTags({
                    title: cachedData.title,
                    image: cachedData.image,
                    price: cachedData.price,
                    description: cachedData.content || `Premium ${cachedData.category}`
                });
                setLoading(false);
                return;
            }
            
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
            setSelectedImage(0);

            // Cache for 60 minutes
            setCache(cacheKey, data, 60);

            // Update meta tags for social sharing
            if (data) {
                updateMetaTags({
                    title: data.title,
                    image: data.image,
                    price: data.price,
                    description: data.content || `Premium ${data.category}`
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Cleanup: Reset meta tags when component unmounts
    useEffect(() => {
        return () => {
            resetMetaTags();
        };
    }, []);

    const getProductImages = () => {
        if (!product) return [];
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images.slice(0, 4);
        }
        // Fallback: if images array doesn't exist, create one from main image
        return product.image ? [product.image] : [];
    };

    const handlePlaceOrder = () => {
        const phoneNumber = "919533556501"; // WhatsApp format: country code + number
        const message = `Hi, I'm interested in ordering: ${product?.title}`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return <div className="product page-container"><p>Loading product...</p></div>;
    }

    if (!product) {
        return <div className="product page-container"><p>Product not found</p></div>;
    }

    const images = getProductImages();
    const mainImage = images[selectedImage] || product.image;

    return (
        <div className="product page-container">
            <div className="back-shop">
                <h6 className="mb-0"><Link to="/shop"><HiOutlineArrowNarrowLeft />Back to Shop</Link></h6>
            </div>
            <div className="row">
                <div className="col-12 col-md-7 p-5">
                    <div className="product-image-container">
                        <img src={mainImage} alt="product" className='main-product-image w-100' />
                    </div>
                    {images.length > 0 && (
                        <div className="product-thumbnails mt-3">
                            {images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`product-${index}`}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="col-12 col-md-5 p-5 product-info">
                    <h2>{product.title}</h2>
                    <span className='product-category'>{product.category}</span>
                    <p>{product.content}</p>
                    <div className="product-prices d-flex pb-2">
                        {product.oldPrice ? (
                            <>
                                <del className='product-price pe-2'>£{product.oldPrice}.00</del>
                                <span className='product-price'>£{product.price}.00</span>
                            </>
                        ) : (
                            <span className='product-price'>£{product.price}.00</span>
                        )}
                    </div>
                    <button className='general-button' onClick={handlePlaceOrder}>Place Order</button>
                </div>
            </div>
        </div>
    );
};

export default Product;