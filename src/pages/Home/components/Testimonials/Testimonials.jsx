import React, { useState, useEffect } from 'react';
import TestimonialsItem from './TestimonialsItem';
import { supabase } from '../../../../services/supabaseClient';
import { useDispatch } from 'react-redux';
import { handleCategory } from '../../../../store/features/filterSlice';
import { setCache } from '../../../../utils/cache';

const Testimonials = () => {
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Cache for 30 minutes
            setCache('categories', data || [], 30);
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCategoryClick = (category) => {
        dispatch(handleCategory(category));
    }
    
    return (
        <div className="testimonials-part page-container">
            <h3 className='text-center part-title'>Categories</h3>
            <div className="divider-part">
                <div className="divider"></div>
            </div>
            {loading ? (
                <p className="text-center">Loading categories...</p>
            ) : categories.length === 0 ? (
                <p className="text-center">No categories available</p>
            ) : (
                <div className="row g-0 px-2">
                    {categories.map((item) => (
                        <TestimonialsItem
                            key={item.id}
                            name={item.name}
                            image={item.cover_image}
                            category={item.name}
                            onCategoryClick={handleCategoryClick}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Testimonials;