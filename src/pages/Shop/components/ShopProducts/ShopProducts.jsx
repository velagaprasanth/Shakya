import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../../../components/ProductCard/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { handleSort } from '../../../../store/features/filterSlice';
import { supabaseAdmin } from '../../../../services/supabaseClient';
import { getCache, setCache } from '../../../../utils/cache';
import "./shopProducts.scss";

const ShopProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortValue, setSortValue] = useState('');
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const selectedCategory = useSelector((state) => state.products.selectedCategory);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Check cache first
            const cachedData = getCache('products');
            if (cachedData) {
                setProducts(cachedData);
                setLoading(false);
                return;
            }
            
            const { data, error } = await supabaseAdmin
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Cache for 30 minutes
            setCache('products', data || [], 30);
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSorting = (e) => {
        const value = e.target.value;
        setSortValue(value);
        dispatch(handleSort(value));
    };

    const applyFilters = useCallback(() => {
        let filtered = [...products];

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => 
                p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Apply sorting
        if (sortValue === 'Low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'High') {
            filtered.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, sortValue]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    if (loading) {
        return <div className="shop-products"><p>Loading products...</p></div>;
    }

    return (
        <div className="shop-products">
            <div className="filter-part d-flex justify-content-end py-5 align-items-center gap-3">
                <select name="sort-list" id="sort-list" value={sortValue} onChange={handleSorting}>
                    <option value="">Default sorting</option>
                    <option value="Low">Sort by price: low to high</option>
                    <option value="High">Sort by price: high to low</option>
                </select>
            </div>

            {filteredProducts.length === 0 ? (
                <p>No products found</p>
            ) : (
                <div className="row">
                    {filteredProducts.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            image={item.image}
                            title={item.title}
                            category={item.category}
                            price={item.price}
                            oldPrice={item.oldPrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopProducts;