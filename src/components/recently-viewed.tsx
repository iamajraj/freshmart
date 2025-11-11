'use client';

import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Product, ProductCard } from '@/components/product-card';

interface RecentlyViewedProps {
  currentProductId?: string; // for not showing current product from the list
  maxItems?: number;
}

export function RecentlyViewed({
  currentProductId,
  maxItems = 5,
}: RecentlyViewedProps) {
  const { recentlyViewed, removeRecentlyViewed } = useRecentlyViewed();

  // Filter out current product and limit items
  const displayItems = recentlyViewed
    .filter((item) => item.id !== currentProductId)
    .slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recently Viewed</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product as unknown as Product}
            compact
            showRemoveButton
            onRemove={removeRecentlyViewed}
          />
        ))}
      </div>
    </div>
  );
}
