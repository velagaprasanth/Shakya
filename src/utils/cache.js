/**
 * Simple caching utility to store and retrieve data with TTL (time-to-live)
 */
const cache = {};

export const setCache = (key, data, ttlMinutes = 30) => {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    cache[key] = {
        data,
        expiresAt
    };
};

export const getCache = (key) => {
    if (!cache[key]) return null;

    // Check if cache has expired
    if (Date.now() > cache[key].expiresAt) {
        delete cache[key];
        return null;
    }

    return cache[key].data;
};

export const clearCache = (key) => {
    if (key) {
        delete cache[key];
    } else {
        // Clear all cache
        Object.keys(cache).forEach(k => delete cache[k]);
    }
};

export const isCached = (key) => {
    return getCache(key) !== null;
};
