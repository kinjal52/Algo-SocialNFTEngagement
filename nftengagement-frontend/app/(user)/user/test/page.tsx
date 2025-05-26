"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";

const drops = [
    {
        creator: "Paris Saint-Germain",
        title: "Girl",
        image: "/nft/girlnft1.jpg",
        verified: true,
        minting: "Now",
        price: "FREE",
        cta: false,
    },
    {
        creator: "Rarible Drops",
        title: "Kitten in Box",
        image: "/nft/Kitten.jpg",
        verified: true,
        minting: "2 days",
        price: "FREE",
        cta: true,
    },
    {
        creator: "Max Capacity",
        title: "leopard with pink fur and gold leopard",
        image: "/nft/leopard.jpg",
        verified: true,
        minting: "Now",
        price: "4 XTZ",
        cta: false,
    },
    {
        creator: "Rarible Drops",
        title: "Elegant Aesthetic_ Cute Girl with Artistic Charm",
        image: "/nft/Elegant Girl.jpg",
        verified: true,
        minting: "Now",
        price: "FREE",
        cta: false,
    },
];

export default function NFTDrops() {
    return (
        <section className="py-10 px-4 md:px-12 bg-transparent text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Drops</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {drops.map((drop, idx) => (
                    <Card
                        key={idx}
                        className="relative bg-[#1A1A1A] hover:scale-[1.02] transition-all cursor-pointer overflow-hidden rounded-xl shadow-md"
                    >
                        <div className="relative w-full h-56">
                            <Image
                                src={drop.image}
                                alt={drop.title}
                                fill
                                className="object-cover rounded-t-xl"
                            />
                            {drop.cta && (
                                <div className="absolute bottom-2 left-2 bg-white text-black px-3 py-1 text-sm font-semibold rounded-full shadow">
                                    Mint Now
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="text-sm text-white/70 mb-1 flex items-center gap-1">
                                {drop.creator}
                                {drop.verified && <BadgeCheck size={14} className="text-yellow-400" />}
                            </div>
                            <div className="text-lg font-semibold truncate mb-3">{drop.title}</div>
                            <div className="flex justify-between text-sm text-white/80">
                                <div>
                                    <div className="text-white/60">Minting</div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                                        {drop.minting}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/60">Price</div>
                                    <div>{drop.price}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
