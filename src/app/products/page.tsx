'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart,
  Search,
  Filter,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

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
  _count: {
    reviews: number;
  };
}

interface Category {
  id: string;
  name: string;
  _count: {
    products: number;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Filters {
  categories: string[];
  priceRange: [number, number];
  availability: string;
  sortBy: string;
  sortOrder: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const {status} = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [categoryParam, setCategoryParam] = useState(
    searchParams.get('category') || ''
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRange: [0, 100],
    availability: 'all',
    sortBy: 'newest',
    sortOrder: 'desc',
  });
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters, searchQuery]);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/products/filters');
      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(data.categories);
        setPriceRange(data.priceRange);

        let categoriesFilter = [];
        if (categoryParam && (data.categories as Category[]).find(category => category.id === categoryParam)){
          categoriesFilter.push(categoryParam);
        }

        setFilters((prev) => ({
          ...prev,
          priceRange: [data.priceRange.min, data.priceRange.max],
          categories: categoriesFilter
        }));
      }
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.categories.length > 0 && {
          category: filters.categories.join(','),
        }),
        ...(filters.priceRange[0] > priceRange.min && {
          minPrice: filters.priceRange[0].toString(),
        }),
        ...(filters.priceRange[1] < priceRange.max && {
          maxPrice: filters.priceRange[1].toString(),
        }),
        ...(filters.availability !== 'all' && {
          availability: filters.availability,
        }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (
      filters.priceRange[0] > priceRange.min ||
      filters.priceRange[1] < priceRange.max
    )
      count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [priceRange.min, priceRange.max],
      availability: 'all',
      sortBy: 'newest',
      sortOrder: 'desc',
    });
    setCategoryParam('');
    setCurrentPage(1);
  };

  const addToCart = async (productId: string) => {
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
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success('Added to cart!');
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableCategories={availableCategories}
              priceRange={priceRange}
              isDesktop={true}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Visible Filters */}
            <div className="mb-6 lg:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Sort Dropdown */}
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      handleFiltersChange({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filter Button */}
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>

                  {/* Active Filters */}
                  {getActiveFilterCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {getActiveFilterCount()} filter
                        {getActiveFilterCount() > 1 ? 's' : ''} applied
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Filter Sidebar */}
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableCategories={availableCategories}
              priceRange={priceRange}
              isDesktop={false}
            />

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={
                            currentPage === i + 1 ? 'default' : 'outline'
                          }
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
