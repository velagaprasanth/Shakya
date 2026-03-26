import React from 'react';
import { Link } from 'react-router-dom';
import "./productCard.scss";
import { FaEye } from "react-icons/fa";

const ProductCard = (props) => {
    const { image, title, category, price, oldPrice, item } = props;
    
    // Ensure we have valid price data
    const displayPrice = price ? Math.round(price * 100) : 'N/A';
    const displayOldPrice = oldPrice ? Math.round(oldPrice * 100) : null;
    
    return (
        <div data-aos="fade-up" className="product-card pb-5 d-flex flex-column col-12 col-md-4 col-lg-3">
            <div className="product-image mb-1">
                <Link to={`/shop/${item.id}`}><img src={image} alt="product" /></Link>
            </div>
            <div className="product-info px-3 d-flex flex-column">
                <span className='product-category'>{category}</span>
                <h3><Link to={`/shop/${item.id}`}>{title}</Link></h3>
                <div className="product-prices d-flex">
                    {displayOldPrice ? (
                        <>
                            <span className='old-price pe-2'>₹{displayOldPrice}</span>
                            <span className='product-price'>₹{displayPrice}</span>
                        </>
                    ) : (
                        <span className='product-price'>₹{displayPrice}</span>
                    )}
                </div>
            </div>
            <div className="product-card-buttons d-flex flex-column">
                <button className='quick-view'><FaEye /><span>Quick View</span></button>
            </div>
            {oldPrice && <span className="product-sale">Sale!</span>}
        </div>
    )
}

export default ProductCard;