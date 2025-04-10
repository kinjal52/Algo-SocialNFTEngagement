"use client";

import { Button } from "@/component/ui/button";
import { PeraWalletConnect } from "@perawallet/connect";
import { motion } from "framer-motion";
import { Wallet, Play } from "lucide-react";
import { useState } from "react";
import { Bounce, toast } from "react-toastify";

export default function PeraConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  async function handleConnectWallet() {
    try {
      const peraWallet = new PeraWalletConnect();
      const accounts = await peraWallet.connect();
      setWalletAddress(accounts[0]);
      toast.success("Connected wallet address:"), {
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
    } catch (error:any) {
      console.error("Wallet connection failed:", error);
      toast.error(error), {
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
    }
  }
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-[#1B1B2F] px-6 overflow-hidden">
      {/* Blobs & Background */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-purple-700 via-pink-500 to-red-400 rounded-full top-[-100px] left-[-150px] blur-[150px] opacity-30 z-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] bg-gradient-to-br from-indigo-500 to-blue-400 rounded-full bottom-[100px] right-[100px] blur-[120px] opacity-20 z-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Glass Card with Hero Content */}
      <div className="relative z-10 grid md:grid-cols-2 items-center gap-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] p-10 max-w-6xl w-full">
        {/* Text Content */}
        <div className="text-white">
          <motion.h2
            className="text-sm uppercase tracking-widest text-white/60 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            powered by algorand
          </motion.h2>

          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            List. Discover. Trade NFTs.
          </motion.h1>

          <motion.p
            className="text-white/70 text-lg leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Experience the next-gen NFT marketplace. Connect securely with your Pera Wallet and explore verified digital collectibles on the Algorand blockchain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={handleConnectWallet}
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 py-4 rounded-full flex items-center gap-2"
            >
              <Wallet size={20} /> Connect Pera Wallet
            </Button>
            {walletAddress && (
              <p className="mt-4 text-sm text-green-300">
                Connected: {walletAddress}
              </p>
            )}
          </motion.div>
        </div>

        {/* Visual Right Side */}
        <div className="relative flex items-center justify-center">
          {/* Floating Blob with Play Icon */}
          <motion.div
            className="w-72 h-72 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 flex items-center justify-center shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <button className="w-14 h-14 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition">
              <Play size={28}

              />
            </button>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
