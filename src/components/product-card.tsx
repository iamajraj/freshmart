import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  unit: string;
  category: {
    id: string;
    name: string;
  };
  _count: {
    reviews: number;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  showRemoveButton?: boolean;
  onRemove?: (productId: string) => void;
  compact?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  showRemoveButton = false,
  onRemove,
  compact = false,
  className = '',
}: ProductCardProps) {
  const cardClass = compact
    ? 'pb-6 pt-0 hover:shadow-md transition-shadow overflow-hidden group'
    : 'pb-6 pt-0 hover:shadow-lg transition-shadow overflow-hidden';

  const imageHeight = compact ? 'h-32' : 'aspect-square';

  return (
    <Card className={`${cardClass} ${className}`}>
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className={`${imageHeight} relative bg-gray-100 ${compact ? 'rounded-t-lg' : 'rounded-t-lg'} overflow-hidden`}>
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover ${compact ? '' : 'group-hover:scale-105'} transition-transform`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🛒
              </div>
            )}
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product?.category?.name}
            </Badge>

            {/* Remove button for recently viewed */}
            {showRemoveButton && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(product.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Link>

        <div className={compact ? 'p-3' : 'p-4'}>
          <Link href={`/products/${product.id}`}>
            <h3 className={`font-semibold ${compact ? 'text-sm line-clamp-2 hover:text-primary mb-1' : 'text-lg mb-2 hover:text-primary'}`}>
              {product.name}
            </h3>
          </Link>

          {!compact && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className={`flex items-center justify-between ${compact ? 'mb-0' : 'mb-3'}`}>
            <span className={`font-bold text-primary ${compact ? 'text-lg' : 'text-2xl'}`}>
              ${product.price}
            </span>
            {!compact && (
              <span className="text-sm text-gray-500">
                per {product.unit}
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Stock: {product.stock}</span>
              <span>{product._count.reviews} reviews</span>
            </div>
          )}
        </div>
      </CardContent>

      {!compact && onAddToCart && (
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => onAddToCart(product.id)}
            className="w-full"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
