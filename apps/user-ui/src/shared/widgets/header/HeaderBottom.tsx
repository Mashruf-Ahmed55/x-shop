'use client';

import { NavItems } from '@/configs/constants';
import { AlignLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaRegUser } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { LuHeart } from 'react-icons/lu';

export default function HeaderBottom() {
  const [isShow, setIsShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? 'bg-white shadow-sm fixed top-0 left-0 z-[100]' : 'relative'
      }`}
    >
      <div
        className={`w-4/5 relative mx-auto flex items-center justify-between h-[73px]  ${
          isSticky ? 'pt-3' : 'py-0'
        }`}
      >
        <div
          className={`w-[250px] ${
            isSticky && '-mb-2'
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-lime-600`}
          onClick={() => setIsShow(!isShow)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="#fff" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="#fff" />
        </div>
        {/* Dropdown Menu */}
        {isShow && (
          <div
            className={`absolute left-0 ${
              isSticky ? 'top-[70px]' : 'top-[61.5px]'
            } w-[250px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}
        {/* Navigation Links */}
        <div className="flex items-center">
          {NavItems.map((i: NavItemsType, index) => {
            return (
              <Link
                className="px-5 text-base font-medium"
                href={i.href}
                key={index}
              >
                {i.title}
              </Link>
            );
          })}
        </div>
        <div className="">
          {isSticky && (
            <div className="flex items-center gap-6 font-montserrat">
              <Link href="/login" className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
                  <FaRegUser size={18} />
                </div>
                <div>
                  <span className="block text-gray-600">Hello,</span>
                  <span className="font-semibold">Sign In</span>
                </div>
              </Link>

              <Link href="/wishlist" className="relative">
                <LuHeart size={24} />
                <span className="absolute -top-2 -right-2 bg-lime-600 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              <Link href="/cart" className="relative">
                <FiShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-lime-600 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  9
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
