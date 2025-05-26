import { NFTList } from "@/components/userComponent/nftData";
import { redirect } from "next/navigation";

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
  assetId: number; // Added to match backend
}

export interface Paginatednft {
  data: nftData[];
}

export default async function UserNftPage() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/nft/allnfts`;

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/signin");
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch NFTs: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    const nftData: Paginatednft = {
      data: Array.isArray(data)
        ? data
          .filter((nft) => nft && (nft._id || nft.id))
          .map((nft) => {
            let imageUrl = "/images/placeholder.jpg";
            if (nft.url) {
              if (nft.url.startsWith("ipfs://")) {
                imageUrl = `https://ipfs.io/ipfs/${nft.url.replace("ipfs://", "").split("#")[0]}`;
              } else if (nft.url.startsWith("http://") || nft.url.startsWith("https://")) {
                imageUrl = nft.url;
              }
            }

            return {
              _id: nft._id || nft.id,
              assetId: Number(nft.assetId),
              creator: nft.creator || "Unknown",
              ownerAddress: nft.creator,
              name: nft.name || "Unnamed NFT",
              image: imageUrl,
              description: nft.description || "No description available",
              verified: nft.verified ?? false,
              minting: nft.minting || "Algorand Testnet",
              price: nft.price || "0 ALGO",
            };
          })
        : []
    };


    return (
      <section suppressHydrationWarning>
        <NFTList nftData={nftData} />
      </section>
    );
  } catch (error) {
    console.error("Error loading NFTs:", error);
    return (
      <section>
        <p>Error loading NFTs. Please try again later.</p>
      </section>
    );
  }
}