import Navbar from "@/components/navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "NFT Marketplace",
    description: "Explore and mint NFTs",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main
            suppressHydrationWarning
            className={cn(
                "bg-background text-foreground font-sans antialiased w-full"
            )}
        >
            {/* <div className="mt-5"> */}
            <Navbar />
            {/* </div> */}

            <div className="pt-18 px-4 container mx-auto">
                <ScrollArea>{children}</ScrollArea>
            </div>
        </main>
    );
}

