import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from "../../data/data";
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import "./Product.scss";

const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState()
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        const productDetail = data.find((item) =>
            +item.id === +id
        );
        setProduct(productDetail)
        setSelectedImage(0)
    }, [id])

    const getProductImages = () => {
        if (!product) return [];
        if (product.images && product.images.length > 0) {
            return product.images.slice(0, 4);
        }
        // Fallback: if images array doesn't exist, create one from main image
        return [product.image];
    }

    const handlePlaceOrder = () => {
        const phoneNumber = "919533556501"; // WhatsApp format: country code + number
        const message = `Hi, I'm interested in ordering: ${product?.title}`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    const images = getProductImages();
    const mainImage = images[selectedImage] || product?.image;

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
                    {images.length > 1 && (
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
                    <h2>{product?.title}</h2>
                    <span className='product-category'>{product?.category}</span>
                    <p>{product?.content}</p>
                    <div className="product-prices d-flex pb-2">
                        {product?.oldPrice ? (<><del className='product-price pe-2'>£{product?.oldPrice}.00</del><span className='product-price'>£{product?.price}.00</span></>) : (<span className='product-price'>£{product?.price}.00</span>)}
                    </div>
                    <button className='general-button' onClick={handlePlaceOrder}>Place Order</button>
                </div>
            </div>
        </div>
    )
}

export default Product;