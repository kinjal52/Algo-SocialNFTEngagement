import { NFTList } from "@/component/userComponent/nftData";
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
}

export interface Paginatednft {
  data: nftData[];
}

export default async function UserNftPage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/allnfts`, {
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/signin");
    }

    if (!res.ok) {
      throw new Error("Failed to fetch NFTs");
    }

    let data = await res.json();

    // Ensure shape consistency
    const nftData: Paginatednft = Array.isArray(data) ? { data } : data;

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
