"use client";

import { ShoppingBag, Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="bg-[#0d0d0d] text-white py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo-rarible.png" alt="Logo" width={36} height={36} />
          <span className="text-xl font-bold tracking-wide">Rarible</span>
        </div>

        {/* Center Nav */}
        <div className="hidden lg:flex items-center gap-6 flex-1 mx-8">
          <input
            type="text"
            placeholder="Search for collections, NFTs or users"
            className="w-full bg-[#1a1a1a] rounded-full px-5 py-2 text-sm placeholder-white/50 focus:outline-none transition-all border border-transparent focus:border-yellow-400"
          />
          <div className="flex items-center gap-5 text-sm text-white/80 font-medium">
            {["Create", "Explore", "Sell"].map((item) => (
              <span key={item} className="hover:text-white cursor-pointer transition-colors duration-200">
                {item}
              </span>
            ))}
            <span className="hover:text-white cursor-pointer flex items-center gap-1">
              Drops
              <span className="bg-[#2c2c2c] text-[10px] px-2 py-[2px] rounded-full font-bold text-white/60">
                NEW
              </span>
            </span>
          </div>
        </div>

        {/* Right: Wallet & Icons */}
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 rounded-full w-10 h-10 hidden sm:block" />
          <Button variant="outline" className="rounded-full text-sm font-semibold px-4 hover:bg-white hover:text-black transition">
            Connect wallet
          </Button>
          <ShoppingBag className="text-white" size={22} />
          <Menu className="text-white lg:hidden cursor-pointer" size={26} />
        </div>
      </div>
    </nav>
  );
}
