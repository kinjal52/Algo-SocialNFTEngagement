"use client";

import { Bell, Copy, Search, Wallet, X } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function getInitials(address: string) {
  if (!address) return "";
  if (address.startsWith("0x") && address.length > 6) return address.slice(2, 6).toUpperCase();
  return address.slice(0, 4).toUpperCase();
}

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    setWalletAddress(storedWallet);
    setAvatarUrl("/user.png");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("walletAddress");
    setWalletAddress(null);
    setDrawerOpen(false);
    router.push("/"); 
  };

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };


  return (
    <header className="w-full bg-[#0b1320] border-[#1c2230]">
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
        <div className="flex items-center gap-6 relative">

          {!walletAddress ? (
            <Button 
              className="px-4 py-3 rounded-md bg-sky-500 hover:bg-sky-300 hover:text-black text-white flex items-center gap-2"              
              onClick={() => {router.push("/"); 
    }}
            >
              <Wallet className="w-6 h-6" />
              Connect Wallet
            </Button>
          ) : (
            <>
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="relative cursor-pointer w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-600 shadow-lg select-none"
                    title={walletAddress}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {getInitials(walletAddress)}
                      </span>
                    )}
                    {/* <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 border-2 border-[#0b1320] rounded-full"></span> */}
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-[#1A1A1A] border border-gray-700 text-white min-w-[200px] p-2"
                >
                  {/* Wallet address row */}
                  <div className="px-2 py-2 text-sm flex items-center justify-between gap-2">
                    <span className="truncate max-w-[140px]">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </span>
                    <Copy
                      className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer"
                      onClick={handleCopy}
                    />
                  </div>

                  <DropdownMenuSeparator />

                  {/* Logout button */}
                  <Button
                    // variant="default"
                    className="rounded-sm w-full mt-2 bg-red-400 hover:bg-red-300 hover:text-black"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Bell className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <hr />
      </div>
    </header>
  );
}
