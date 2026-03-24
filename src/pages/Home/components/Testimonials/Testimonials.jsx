import React from 'react';
import TestimonialsItem from './TestimonialsItem';
import testimonials from "../../../../data/testimonials"
import { useDispatch } from 'react-redux';
import { handleCategory } from '../../../../store/features/filterSlice';

const Testimonials = () => {
    const dispatch = useDispatch();
    
    const handleCategoryClick = (category) => {
        dispatch(handleCategory(category));
    }
    
    return (
        <div className="testimonials-part page-container">
            <h3 className='text-center part-title'>Categories</h3>
            <div className="divider-part">
                <div className="divider"></div>
            </div>
            <div className="row g-0 px-2">
                {testimonials.map((item) => (
                    <TestimonialsItem
                        key={item.id}
                        name={item.user}
                        image={item.image}
                        category={item.category}
                        onCategoryClick={handleCategoryClick}
                    />
                ))}
            </div>
        </div>
    )
}

export default Testimonials;