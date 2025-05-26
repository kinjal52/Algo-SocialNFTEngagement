"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bounce, toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";


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
  const [notifications, setNotifications] = useState<{ [nftId: string]: number }>({});


  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    setWalletAddress(storedWallet);

    if (storedWallet) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/notifications/${storedWallet}`)
        .then((res) => res.json())
        .then((data) => {
          const notifMap: { [key: string]: number } = {};
          data.forEach((item: any) => {
            notifMap[item._id] = item.questionCount;
          });
          setNotifications(notifMap);
        })
        .catch((err) => console.error("Notification fetch error:", err));
    }
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
                  {/* {nft.creator} */}
                  {nft.verified && <BadgeCheck size={14} className="text-yellow-400" />}
                </div>
                <div className="text-lg font-semibold truncate mb-2">{nft.name}</div>
                <div className="text-sm text-white/70 mb-2 truncate">{nft.description}</div>

                <div className="flex justify-between text-sm mt-auto">
                  <div className="flex items-center gap-2 text-green-400">
                    Minting Now
                  </div>
                  <div className="font-semibold text-white">
                    {nft.price}
                  </div>
                </div>

                {/* Conditional Button */}
                {isOwner ? (
                  <Button
                    // style={{ backgroundColor: "salmon", color: "black" }}
                    // className="w-full py-2 mt-3 rounded "
                    className="w-full bg-pink-400 text-block py-2 mt-2 rounded hover:bg-pink-200 hover:text-black transition"
                    onClick={() => router.push(`/user/nft/${nft._id}/question`)}
                  >
                    View Questions
                  </Button> 
                ) : (
                  <Button
                    className="mt-2 w-full bg-yellow-400 text-block text-black py-2 rounded hover:bg-yellow-300 transition"
                    onClick={() => {
                      if (!walletAddress) {
                        toast.info("Please connect your wallet first"), {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "light",
                          transition: Bounce,
                        };
                        router.push("/"); // your wallet connection page
                      } else {
                        router.push(`/user/chat/${nft._id}`);
                      }
                    }}
                  >
                    Ask Question
                  </Button>
                )}


              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};