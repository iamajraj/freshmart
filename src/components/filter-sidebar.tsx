"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
  _count: {
    products: number
  }
}

interface Filters {
  categories: string[]
  priceRange: [number, number]
  availability: string
  sortBy: string
  sortOrder: string
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  availableCategories: Category[]
  priceRange: { min: number; max: number }
  isDesktop?: boolean
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  priceRange,
  isDesktop = false,
}: FilterSidebarProps) {
  const [tempFilters, setTempFilters] = useState<Filters>(filters)

  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...tempFilters.categories, categoryId]
      : tempFilters.categories.filter(id => id !== categoryId)

    setTempFilters(prev => ({ ...prev, categories: newCategories }))
  }

  const handlePriceChange = (value: number[]) => {
    setTempFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }))
  }

  const handleAvailabilityChange = (availability: string) => {
    setTempFilters(prev => ({ ...prev, availability }))
  }

  const handleSortChange = (sortBy: string) => {
    setTempFilters(prev => ({ ...prev, sortBy }))
  }

  const handleSortOrderChange = (sortOrder: string) => {
    setTempFilters(prev => ({ ...prev, sortOrder }))
  }

  const applyFilters = () => {
    onFiltersChange(tempFilters)
    onClose()
  }

  const clearFilters = () => {
    const clearedFilters: Filters = {
      categories: [],
      priceRange: [priceRange.min, priceRange.max],
      availability: "all",
      sortBy: "newest",
      sortOrder: "desc",
    }
    setTempFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (tempFilters.categories.length > 0) count++
    if (tempFilters.priceRange[0] > priceRange.min || tempFilters.priceRange[1] < priceRange.max) count++
    if (tempFilters.availability !== "all") count++
    return count
  }

  if (!isOpen && !isDesktop) return null

  const sidebarContent = (
    <div className={`${isDesktop ? 'w-80' : 'w-80 bg-white shadow-lg'} h-full overflow-y-auto`}>
      <div className="sticky top-0 border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
        </h2>
        {!isDesktop && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

        <div className="p-4 space-y-6">
          {/* Sort Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sort By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Select value={tempFilters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={tempFilters.sortOrder} onValueChange={handleSortOrderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={tempFilters.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                      <span className="text-gray-500 ml-1">({category._count.products})</span>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Price Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={tempFilters.priceRange}
                onValueChange={handlePriceChange}
                max={priceRange.max}
                min={priceRange.min}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${tempFilters.priceRange[0]}</span>
                <span>${tempFilters.priceRange[1]}</span>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability-all"
                    checked={tempFilters.availability === "all"}
                    onCheckedChange={() => handleAvailabilityChange("all")}
                  />
                  <label htmlFor="availability-all" className="text-sm cursor-pointer">
                    All Products
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability-in-stock"
                    checked={tempFilters.availability === "in-stock"}
                    onCheckedChange={() => handleAvailabilityChange("in-stock")}
                  />
                  <label htmlFor="availability-in-stock" className="text-sm cursor-pointer">
                    In Stock Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability-out-of-stock"
                    checked={tempFilters.availability === "out-of-stock"}
                    onCheckedChange={() => handleAvailabilityChange("out-of-stock")}
                  />
                  <label htmlFor="availability-out-of-stock" className="text-sm cursor-pointer">
                    Out of Stock Only
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={clearFilters} variant="outline" className="flex-1">
              Clear All
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
  )

  if (isDesktop) {
    return sidebarContent
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/20 lg:hidden" onClick={onClose}>
      <div className="fixed right-0 top-0 h-full" onClick={e => e.stopPropagation()}>
        {sidebarContent}
      </div>
    </div>
  )
}
