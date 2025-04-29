"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/component/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface nftData {
  _id: string;
  creator: string;
  ownerAddress: string;
  name: string;
  image: string;
  description: string;
  verified: boolean;
  minting: string;
  price: string;
}

export interface Paginatednft {
  data: nftData[];
}

export const NFTList = ({ nftData }: { nftData: Paginatednft }) => {
  const { data } = nftData;
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    setWalletAddress(storedWallet);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-white">
        <p>No NFTs found.</p>
      </div>
    );
  }

  return (
    <section className="py-10 px-4 md:px-12 bg-transparent text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Your NFTs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((nft) => {
          const isOwner = walletAddress === nft.ownerAddress;
          console.log("isOwner", isOwner);
          console.log("walletAddress", walletAddress);
          console.log("nft.ownerAddress", nft.ownerAddress);

          return (
            <Card
              key={nft._id}
              className="relative bg-[#1A1A1A] hover:scale-[1.02] transition-all cursor-pointer overflow-hidden rounded-xl shadow-md"
            >
              <div className="relative w-full h-56">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover rounded-t-xl"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-sm font-semibold gap-2 text-gray-400 mb-1 truncate">
                  {nft.ownerAddress?.length > 10
                    ? `${nft.ownerAddress.slice(0, 6)}...${nft.ownerAddress.slice(-4)}`
                    : nft.ownerAddress}
                  <BadgeCheck className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-sm text-white/70 mb-1 flex items-center gap-1">
                  {nft.creator}
                  {nft.verified && <BadgeCheck size={14} className="text-yellow-400" />}
                </div>
                <div className="text-lg font-semibold truncate mb-2">{nft.name}</div>
                <div className="text-sm text-white/70 mb-2 truncate">{nft.description}</div>

                <div className="flex justify-between text-sm mt-auto">
                  <div className="flex items-center gap-2 text-green-400">
                    Minting Now
                  </div>
                  <div className="font-semibold text-white">
                    {nft.price ? `${nft.price} algo` : "Free"}
                  </div>
                </div>

                {/* Conditional Button */}
                {isOwner ? (
                  <button className="w-full bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-400 transition"
                  onClick={() => router.push(`/user/chat/${nft._id}`)}>
                    View Questions
                  </button>
                ) : (
                  <button
                    className=" mt-1 w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 transition"
                    onClick={() => router.push(`/user/chat/${nft._id}`)}
                  >
                    Ask Question
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};