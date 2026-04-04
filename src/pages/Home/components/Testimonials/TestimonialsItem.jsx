import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./testimonialsItem.scss";

const TestimonialsItem = (props) => {
    const { name, image, category, onCategoryClick } = props;
    const navigate = useNavigate();
    
    const handleClick = () => {
        onCategoryClick(category);
        navigate('/shop');
    }
    
    return (
        <div
            className="testimonial-item d-flex flex-column pb-4"
            onClick={handleClick}
        >
            <div className="category-image-container">
                {image ? (
                    <img src={image} alt={name} />
                ) : (
                    <span className="fallback-text">{name ? name[0] : ''}</span>
                )}
            </div>
            <h4>{name}</h4>
        </div>
    )
}

export default TestimonialsItem