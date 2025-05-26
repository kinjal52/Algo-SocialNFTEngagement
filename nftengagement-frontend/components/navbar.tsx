"use client";

import { Bell, ArrowRight, Search, Wallet } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    setWalletAddress(storedWallet);
  }, []);
  return (
    <header className="mt-5 w-full bg-[#0b1320] border-[#1c2230] pt-4">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/vercel.svg" alt="Logo" width={28} height={28} />
          <span className="text-white text-lg font-semibold">NFT MarketPlace</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-[#1c2230] px-3 py-2 rounded-full text-sm text-gray-300">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Search DeFi protocols"
            className="bg-transparent outline-none w-full text-sm placeholder:text-gray-400 border-none focus:ring-0"
          />
        </div>

        {/* Buttons & Icons */}
        <div className="flex items-center gap-6">
          <button
            className={`px-4 py-3 rounded-md flex items-center gap-2  ${walletAddress}`}
            onClick={() => {
              if (walletAddress) {
                // Logout
                localStorage.removeItem("walletAddress");
                setWalletAddress(null);
                router.push("/"); // redirect to login page
              } else {
                // Simulated connect (replace with real logic)
                const dummyAddress = "0x1234...abcd";
                localStorage.setItem("walletAddress", dummyAddress);
                setWalletAddress(dummyAddress);
              }
            }}

          >
            <Wallet className="w-6 h-6" />
            {walletAddress ? "Logout" : "Connect Wallet"}
          </button>

          <Bell className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-5">
        <hr />
      </div>
    </header>
  );
}
