import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../../../services/supabaseClient';
import HomeCollectionItem from '../HomeCollectionItem/HomeCollectionItem';
import { getCache, setCache } from '../../../../utils/cache';

const HomeCollection = () => {
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                setCache('home_categories', data, 30);
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fallback if no categories or error
    if (categories.length === 0) {
        return (
            <div className="home-collection">
                <div className="page-container">
                    <p className="text-center py-5">Loading collections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-collection">
            <div className="page-container">
                {categories.map((cat, index) => (
                    <HomeCollectionItem
                        key={cat.id}
                        image={cat.cover_image || 'https://websitedemos.net/furniture-store-04/wp-content/uploads/sites/155/2020/02/chair.jpg'}
                        title={`${cat.name} Collection`}
                        comment='Explore our premium collection'
                        reverse={index % 2 !== 0}
                        category_name={cat.name}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomeCollection;