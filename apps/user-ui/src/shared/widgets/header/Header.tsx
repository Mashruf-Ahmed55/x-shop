'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { NavItems } from '@/configs/constants';
import { cn } from '@/lib/utils';
import {
  AlignLeft,
  ChevronDown,
  ChevronRight,
  Globe,
  Heart,
  Megaphone,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const categories = [
  {
    id: 1,
    name: 'Food',
    icon: '🍽️',
    subcategories: [
      'Fresh Vegetables',
      'Fruits',
      'Meat & Fish',
      'Dairy Products',
      'Bakery Items',
      'Spices & Seasonings',
    ],
  },
  {
    id: 2,
    name: 'Baby Food & Care',
    icon: '👶',
    subcategories: [
      'Baby Formula',
      'Baby Food',
      'Diapers',
      'Baby Care',
      'Toys & Games',
      'Clothing',
    ],
  },
  {
    id: 3,
    name: 'Home Cleaning',
    icon: '🏠',
    subcategories: [
      'Detergents',
      'Dishwashing',
      'Floor Cleaners',
      'Bathroom Cleaners',
      'Air Fresheners',
      'Cleaning Tools',
    ],
  },
  {
    id: 4,
    name: 'Pet Care',
    icon: '🐾',
    subcategories: [
      'Pet Food',
      'Pet Accessories',
      'Pet Grooming',
      'Pet Health',
      'Pet Toys',
      'Pet Beds',
    ],
  },
  {
    id: 5,
    name: 'Beauty & Health',
    icon: '💄',
    subcategories: [
      'Skincare',
      'Haircare',
      'Makeup',
      'Personal Care',
      'Health Supplements',
      'Medical Supplies',
    ],
  },
  {
    id: 6,
    name: 'Fashion & Lifestyle',
    icon: '👕',
    subcategories: [
      "Men's Fashion",
      "Women's Fashion",
      'Kids Fashion',
      'Accessories',
      'Footwear',
      'Bags & Luggage',
    ],
  },
  {
    id: 7,
    name: 'Home & Kitchen',
    icon: '🍳',
    subcategories: [
      'Cookware',
      'Kitchen Appliances',
      'Dinnerware',
      'Storage Solutions',
      'Home Decor',
      'Furniture',
    ],
  },
  {
    id: 8,
    name: 'Stationeries',
    icon: '📚',
    subcategories: [
      'Office Supplies',
      'School Supplies',
      'Art & Craft',
      'Books',
      'Writing Instruments',
      'Paper Products',
    ],
  },
  {
    id: 9,
    name: 'Toys & Sports',
    icon: '🎮',
    subcategories: [
      'Action Figures',
      'Board Games',
      'Sports Equipment',
      'Outdoor Toys',
      'Educational Toys',
      'Electronic Toys',
    ],
  },
  {
    id: 10,
    name: 'Gadget',
    icon: '📱',
    subcategories: [
      'Mobile Phones',
      'Laptops',
      'Headphones',
      'Smart Watches',
      'Cameras',
      'Gaming Consoles',
    ],
  },
];

// Hook for detecting outside clicks
function useOutsideAlerter<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

// Debounce helper
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function HeaderComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isShow, setIsShow] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const pathName = usePathname();

  // Close dropdown on outside click
  useOutsideAlerter(categoryDropdownRef, () => setIsShow(false));

  // Delayed hover handlers to prevent flicker
  let hoverTimeout: ReturnType<typeof setTimeout>;
  const handleCategoryMouseEnter = (id: number) => {
    clearTimeout(hoverTimeout);
    setHoveredCategory(id);
  };
  const handleCategoryMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  // Debounced scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
      setIsShow(scrollPosition <= 500);
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const isSticky = isScrolled;

  return (
    <div className="relative">
      {/* Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="bg-primary text-foreground py-2 px-4 text-center text-sm relative">
          <div className="flex items-center justify-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span>
              🎉 Free shipping on orders over $50! Limited time offer.
            </span>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-blue-700 rounded p-1"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header First Section */}
      <div
        className={`bg-white border-b transition-all duration-300 ${
          isScrolled
            ? 'transform -translate-y-full opacity-0 h-0 overflow-hidden'
            : 'opacity-100'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">X-Store</span>
            </Link>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="pl-10 pr-4 py-2 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">EN</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>🇺🇸 English</DropdownMenuItem>
                  <DropdownMenuItem>🇧🇩 বাংলা</DropdownMenuItem>
                  <DropdownMenuItem>🇪🇸 Español</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Login/Register */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>My Account</DropdownMenuItem>
                  <DropdownMenuItem>Orders</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-transparent"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:border-transparent"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Header Bottom Section - Sticky */}
      <div
        className={`bg-white border-b transition-all duration-300 ${
          isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-xs' : 'relative'
        }`}
      >
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6 relative">
              {/* Category Dropdown */}
              <div className="relative">
                <div
                  ref={categoryDropdownRef}
                  className={`w-[250px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-primary hover:bg-lime-700/80 transition-colors duration-200 ${
                    isSticky ? 'mb-0' : ''
                  }`}
                  onClick={() => setIsShow((prev) => !prev)}
                  onMouseLeave={() => {
                    // Close dropdown only if mouse leaves dropdown container (optional)
                    // Or comment out if you want it only on outside click
                  }}
                  aria-expanded={isShow}
                  aria-haspopup="menu"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsShow((prev) => !prev);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <AlignLeft color="#fff" size={18} />
                    <span className="text-white font-medium text-sm">
                      All Categories
                    </span>
                  </div>
                  <ChevronDown
                    color="#fff"
                    size={18}
                    className={`transition-transform duration-200 ${
                      isShow ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Dropdown Menu */}
                <div
                  className={`absolute left-0 w-[250px] bg-white border border-gray-200 z-[60] transition-all duration-300 ease-in-out ${
                    isShow
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  } top-[56px]`}
                >
                  <div className="max-h-md">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="relative group"
                        onMouseEnter={() =>
                          handleCategoryMouseEnter(category.id)
                        }
                        onMouseLeave={handleCategoryMouseLeave}
                      >
                        {category.subcategories.length > 0 ? (
                          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{category.icon}</span>
                              <span className="text-gray-700 hover:text-lime-600 font-medium text-sm">
                                {category.name}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 hover:text-lime-700 transition-colors" />
                          </div>
                        ) : (
                          <Link
                            href={`/category/${category.id}`}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                            onClick={() => setIsShow(false)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{category.icon}</span>
                              <span className="text-gray-700 hover:text-lime-600 font-medium text-sm">
                                {category.name}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 hover:text-lime-700 transition-colors" />
                          </Link>
                        )}

                        {/* Nested Subcategories */}
                        {hoveredCategory === category.id && (
                          <div className="absolute left-full top-0 w-64 bg-white border border-gray-200 z-[70] ml-1 transition-all duration-200 ease-in-out">
                            <div className="p-3 border-b bg-gray-50">
                              <h4 className="font-semibold text-gray-800 text-sm">
                                {category.name}
                              </h4>
                            </div>
                            <div className="py-2 max-h-md overflow-y-auto">
                              {category.subcategories.map(
                                (subcategory, index) => (
                                  <Link
                                    key={index}
                                    href={`/category/${
                                      category.id
                                    }/${subcategory
                                      .toLowerCase()
                                      .replace(/\s+/g, '-')}`}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-lime-600 transition-colors"
                                    onClick={() => setIsShow(false)}
                                  >
                                    {subcategory}
                                  </Link>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-6">
                {NavItems.map((item: any, index: number) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'relative px-2 py-1 font-medium transition-all duration-200',
                      'hover:text-lime-700',
                      pathName === item.href
                        ? 'text-lime-700 border-b-2 border-lime-700'
                        : 'border-b-2 border-transparent'
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section - Only visible when scrolled */}
            <div
              className={`flex items-center gap-4 transition-all duration-300 ${
                isScrolled
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
            >
              {/* Search (compact) */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-1 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Login/Register */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>My Account</DropdownMenuItem>
                  <DropdownMenuItem>Orders</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-transparent"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:border-transparent"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
