import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { FaRegUser } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { LuHeart } from 'react-icons/lu';
import HeaderBottom from './HeaderBottom';
export default function Header() {
  return (
    <div className="w-full bg-white">
      <div className="w-4/5 mx-auto py-4 flex items-center justify-between px-4 lg:px-0">
        <Link
          href="/"
          className="text-2xl font-bold text-lime-600 font-montserrat"
        >
          X-shop
        </Link>

        <div className="relative w-full max-w-md overflow-hidden">
          <Input
            type="text"
            className="w-full h-11 border-lime-500 outline-none focus-visible:ring-0 rounded-none"
            placeholder="Search for products..."
          />
          <button className="absolute right-0 top-0 h-full w-12 flex items-center justify-center bg-lime-600 rounded-none">
            <Search className="text-white" size={20} />
          </button>
        </div>

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
      </div>
      <Separator />
      <HeaderBottom />
    </div>
  );
}
