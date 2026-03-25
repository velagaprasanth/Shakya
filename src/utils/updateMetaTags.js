/**
 * Update meta tags for social sharing (WhatsApp, Facebook, Twitter, etc.)
 * @param {Object} data - Product data
 * @param {string} data.title - Product title
 * @param {string} data.image - Product image URL
 * @param {number} data.price - Product price
 * @param {string} data.description - Product description (optional)
 */
export const updateMetaTags = (data) => {
    const { title, image, price, description } = data;

    // Update basic meta tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description || `£${price}`);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', window.location.href);

    // Update Twitter Card meta tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description || `£${price}`);
    updateMetaTag('twitter:image', image);

    // Update document title
    document.title = title || 'Furniture Ecommerce';
};

/**
 * Helper function to update or create a meta tag
 * @param {string} property - Meta tag property (e.g., 'og:title')
 * @param {string} content - Meta tag content
 */
const updateMetaTag = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
};

/**
 * Reset meta tags to default values
 */
export const resetMetaTags = () => {
    updateMetaTags({
        title: 'Furniture Ecommerce',
        image: window.location.origin + '/furniturelogo.ico',
        price: 0,
        description: 'Premium furniture collection'
    });
};
