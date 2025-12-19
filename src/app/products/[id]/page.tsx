'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { RecentlyViewed } from '@/components/recently-viewed';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Star, Minus, Plus, Send, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
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
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    reviews: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  useEffect(() => {
    if (session && product) {
      checkPurchaseStatus();
      checkWishlistStatus();
    } else {
      setHasPurchased(false);
      setCheckingPurchase(false);
      setIsInWishlist(false);
    }
  }, [session, product]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);

        // Add to recently viewed
        addRecentlyViewed({
          id: data.id,
          name: data.name,
          image: data.image,
          price: data.price,
        });
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    if (status !== 'authenticated') {
      toast.info('Please login to add to cart');
      return;
    }
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        toast.success(`Added ${quantity} ${product.name} to cart!`);
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!session || !product) return;

    try {
      const response = await fetch(
        `/api/products/${product.id}/purchase-status`
      );
      if (response.ok) {
        const data = await response.json();
        setHasPurchased(data.hasPurchased);
      }
    } catch (error) {
      console.error('Failed to check purchase status:', error);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!session || !product) return;

    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const wishlist = await response.json();
        const isInWishlist = wishlist.some(
          (item: any) => item.product.id === product.id
        );
        setIsInWishlist(isInWishlist);
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!session || !product) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const wishlist = await response.json();
          const wishlistItem = wishlist.find(
            (item: any) => item.product.id === product.id
          );
          if (wishlistItem) {
            await fetch(`/api/wishlist/${wishlistItem.id}`, {
              method: 'DELETE',
            });
            setIsInWishlist(false);
            toast.success('Removed from wishlist');
          }
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
        } else {
          toast.error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!product) return;

    if (!hasPurchased) {
      toast.error(
        'You must purchase and receive this product before leaving a review'
      );
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setReviewComment('');
        setReviewRating(5);
        // Refresh product data to show new review
        fetchProduct();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🛒
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category.name}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product._count.reviews} reviews)
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-gray-600">per {product.unit}</span>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`font-semibold ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Wishlist and Add to Cart */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className="flex-1"
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    isInWishlist ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                {wishlistLoading
                  ? 'Loading...'
                  : isInWishlist
                  ? 'Remove from Wishlist'
                  : 'Add to Wishlist'}
              </Button>
              <Button
                size="lg"
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0
                  ? 'Out of Stock'
                  : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {session && !checkingPurchase && (
          <div className="mt-16">
            {hasPurchased ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Write a Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600 self-center">
                          {reviewRating} star{reviewRating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="comment"
                        className="block text-sm font-medium mb-2"
                      >
                        Comment (Optional)
                      </label>
                      <Textarea
                        id="comment"
                        placeholder="Share your thoughts about this product..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {submittingReview ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <Card className="bg-linear-to-r from-orange-50 to-amber-50 border-orange-200">
                  <CardContent className="p-8">
                    <Star className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Purchase Required to Review
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You must purchase and receive this product before you can
                      leave a review. Reviews help other customers make informed
                      decisions.
                    </p>
                    <p className="text-sm text-gray-500">
                      You can also leave reviews from your order history once
                      items are delivered.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {!session && (
          <div className="mt-16 text-center">
            <Card className="bg-linear-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-8">
                <Star className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Purchase Required to Review
                </h3>
                <p className="text-gray-600 mb-4">
                  Only verified buyers can leave reviews. Sign in and purchase
                  this product to share your experience.
                </p>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <a href="/auth/signin">Sign In</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {product && <RecentlyViewed currentProductId={product.id} />}

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {product.reviews.length === 0 ? (
            <p className="text-gray-600">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.user.image || ''} />
                        <AvatarFallback>
                          {review.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {review.user.name || 'Anonymous'}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
