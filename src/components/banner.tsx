'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Sparkles, ArrowRight, Star } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export function HomepageBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchActiveBanner();
  }, []);

  const fetchActiveBanner = async () => {
    try {
      const response = await fetch('/api/banners/active');
      if (response.ok) {
        const bannerData = await response.json();
        setBanner(bannerData);
        setTimeout(() => setIsAnimating(true), 100);
      }
    } catch (error) {
      console.error('Failed to fetch banner:', error);
    }
  };

  const isBannerActive = (banner: Banner) => {
    if (!banner.isActive) return false;
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return false;
    if (banner.endDate && new Date(banner.endDate) < now) return false;
    return true;
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!banner || !isBannerActive(banner) || !isVisible) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {/* background with gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-600">
        {/* some particles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div
            className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute bottom-16 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-1/3 right-10 w-1 h-1 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: '1.5s' }}
          ></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Content section */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">
                Special Announcement
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-r from-white via-white to-yellow-100 bg-clip-text text-transparent leading-tight">
              {banner.title}
            </h2>

            {/* Description */}
            {banner.description && (
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                {banner.description}
              </p>
            )}

            {/* CTA Button */}
            {banner.linkUrl && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href={banner.linkUrl}
                  className="group inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Discover Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Optional secondary CTA */}
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  <span>Dismiss</span>
                </button>
              </div>
            )}
          </div>

          {/* Visual section */}
          {banner.imageUrl && (
            <div className="shrink-0 relative">
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    width={300}
                    height={200}
                    className="object-cover w-full h-48 md:h-56 lg:h-64"
                  />
                  {/* little gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-emerald-900 rounded-full p-2 shadow-lg animate-bounce">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-2 text-white hover:text-gray-200 transition-all duration-200 border border-white/20"
        aria-label="Close banner"
      >
        <X className="h-5 w-5" />
      </button>

      {/* accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-400 opacity-80"></div>
    </div>
  );
}
