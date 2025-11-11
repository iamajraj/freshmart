import { useState, useEffect } from 'react';

interface RecentlyViewedProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>(
    []
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedProduct[];
        // remove items older than 7 days
        const validItems = parsed.filter(
          (item) => Date.now() - item.viewedAt < 7 * 24 * 60 * 60 * 1000
        );
        setRecentlyViewed(validItems);
      }
    } catch (error) {
      console.error('Failed to load recently viewed products:', error);
      setRecentlyViewed([]);
    }
  }, []);

  const saveToLocalStorage = (items: RecentlyViewedProduct[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save recently viewed products:', error);
    }
  };

  const addRecentlyViewed = (
    product: Omit<RecentlyViewedProduct, 'viewedAt'>
  ) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);

      const newItem: RecentlyViewedProduct = {
        ...product,
        viewedAt: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

      saveToLocalStorage(updated);

      return updated;
    });
  };

  const removeRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    const updated: RecentlyViewedProduct[] = [];
    setRecentlyViewed(updated);
    saveToLocalStorage(updated);
  };

  return {
    recentlyViewed,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearRecentlyViewed,
  };
}
