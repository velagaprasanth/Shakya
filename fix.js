const fs = require('fs');
const file = 'src/pages/Shop/components/ShopProducts/ShopProducts.jsx';
let content = fs.readFileSync(file, 'utf8');
const regex = /\/\/ If a category with subcategories is selected and NO subcategory is picked.*?<\/select>\n            <\/div>/s;
const replacement = 
    return (
        <div className="shop-products">
            {selectedCategory && availableSubcategories.length > 0 && (
                <div className="subcategories-view py-4">
                    <h2 className="text-center mb-4">Subcategories for {selectedCategory}</h2>
                    <div className="subcategories-grid-row">
                        <div
                            className={\subcategory-circle-item \\}
                            onClick={() => dispatch(handleSubcategory("All"))}
                        >
                            <div className="category-image-container">
                                <span className="all-text">All Products</span>
                            </div>
                            <h4 style={{ color: (selectedSubcategory === 'All' || !selectedSubcategory) ? '#b8860b' : '#333' }}>All {selectedCategory}</h4>
                        </div>

                        {availableSubcategories.map(sub => (
                            <div
                                key={sub.id}
                                className={\subcategory-circle-item \\}
                                onClick={() => dispatch(handleSubcategory(sub.name))}
                            >
                                <div className="category-image-container">
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
            </div>;
content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
