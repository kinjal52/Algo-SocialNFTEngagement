"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function NftBuyerQuestionsPage() {
  const [buyers, setBuyers] = useState<string[]>([]);
  const { nftid } = useParams();
  const router = useRouter();
  const [nft, setNft] = useState<any>(null);


  useEffect(() => {
    if (!nftid) return;

    // Fetch buyers
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}/buyers`)
      .then((res) => {
        console.log("Buyers from API:", res.data);
        setBuyers(res.data);
      })
      .catch((err) => console.error("Failed to load buyers", err));

    // Fetch NFT details
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}`)
      .then((res) => {
        console.log("NFT details:", res.data);
        setNft(res.data);
      })
      .catch((err) => console.error("Failed to load NFT details", err));
  }, [nftid]);


  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold mb-4">Buyers who asked questions</h1>
      </div>
      {nft && (
        <div className="mb-6 bg-[#1A1A1A] border border-gray-700 rounded-lg p-4 flex justify-between items-start gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-yellow-400">{nft.name}</h2>
            <p className="text-sm text-gray-300 mb-2">{nft.description}</p>

            <p className="text-sm text-gray-400">
              <strong className="text-gray-500">Minted On:</strong> {nft.minting}
            </p>
            <p className="text-sm text-green-400 font-semibold mt-2">Price: {nft.price}</p>
          </div>

          {nft.url && (
            <img
              src={
                nft.url.startsWith("ipfs://")
                  ? `https://ipfs.io/ipfs/${nft.url.replace("ipfs://", "")}`
                  : nft.url
              }
              alt={nft.name}
              className="w-[100px] h-[120px] rounded object-cover border border-gray-600"
            />
          )}
        </div>
      )}


      {buyers.length === 0 ? (
        <p>No questions asked yet.</p>
      ) : (
        <ul className="space-y-4">
          {buyers.map((buyer) => (
            <li
              key={buyer}
              className="bg-[#1A1A1A] p-4 rounded shadow flex justify-between items-center"
            >
              <span className="text-yellow-400">{buyer}</span>
              {/* <p className="text-yellow-400 font-semibold">{buyer}</p> */}
              <button
                onClick={() => router.push(`/user/chat/${nftid}?buyer=${buyer}`)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
              >
                Open Chat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
