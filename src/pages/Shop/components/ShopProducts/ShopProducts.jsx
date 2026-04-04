import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../../../components/ProductCard/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const selectedCategory = useSelector((state) => state.products.selectedCategory);
    const selectedSubcategory = useSelector((state) => state.products.selectedSubcategory);
    const [subcategories, setSubcategories] = useState([]);

    const fetchProductsAndSubcategories = async () => {
        try {
            setLoading(true);
            
            // First fetch products
            const cachedProducts = getCache('products');
            let fetchedProducts = [];
            if (cachedProducts) {
                fetchedProducts = cachedProducts;
            } else {
                const { data, error } = await supabaseAdmin
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                fetchedProducts = data || [];
                setCache('products', fetchedProducts, 30);
            }
            setProducts(fetchedProducts);

            // Then fetch subcategories if they haven't been cached (or cache if you want)
            // (For simplicity we'll just fetch subcategories unconditionally or reuse cache utils)
            const { data: subcats, error: subError } = await supabaseAdmin
                .from('subcategories')
                .select('*')
                .order('name', { ascending: true });
            
            if (!subError && subcats) {
                setSubcategories(subcats);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

        // Apply subcategory filter
        if (selectedSubcategory && selectedSubcategory !== 'All') {
            filtered = filtered.filter(p =>
                p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()
            );
        }

        // Apply sorting
        if (sortValue === 'Low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'High') {
            filtered.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, selectedSubcategory, sortValue]);

    useEffect(() => {
        fetchProductsAndSubcategories();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    if (loading) {
        return <div className="shop-products"><p>Loading products...</p></div>;
    }

    const availableSubcategories = subcategories.filter(sub => sub.category_name && selectedCategory && sub.category_name.toLowerCase() === selectedCategory.toLowerCase());

        return (
        <div className="shop-products">
            {selectedCategory && availableSubcategories.length > 0 && (      
                <div className="subcategories-view py-4">
                    <h2 className="text-center mb-4">Subcategories for {selectedCategory}</h2>
                    <div className="subcategories-grid-row">

                        {availableSubcategories.map(sub => (
                            <div
                                key={sub.id}
                                className={`subcategory-circle-item ${selectedSubcategory === sub.name ? 'active-circle' : ''}`}
                                onClick={() => navigate(`/subcategory/${encodeURIComponent(sub.name)}`)}
                            >
                                <div className="category-image-container" style={{ borderColor: selectedSubcategory === sub.name ? '#b8860b' : '#ccc' }}>   
                                    {sub.cover_image ? (
                                        <img src={sub.cover_image} alt={sub.name} />
                                    ) : (
                                        <span className="fallback-text">{sub.name[0]}</span>
                                    )}
                                </div>
                                <h4 style={{ color: selectedSubcategory === sub.name ? '#b8860b' : '#333' }}>{sub.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="filter-part d-flex justify-content-end py-3 align-items-center flex-wrap gap-3">
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

