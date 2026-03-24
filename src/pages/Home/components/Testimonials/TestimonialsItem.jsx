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
            data-aos="fade-up" 
            className="testimonial-item d-flex flex-column col-12 col-md-4 pb-4"
            onClick={handleClick}
        >
            <div className="category-image-container">
                <img src={image} alt={name} />
            </div>
            <h4>{name}</h4>
        </div>
    )
}

export default TestimonialsItem