"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import io from "socket.io-client";
import { nftData } from "@/app/(user)/user/nft/page"; // Adjust path as needed

type Message = {
    text: string;
    sender: "buyer" | "owner";
    timestamp: string;
    isSellerResponse?: boolean;
    questionId?: string;
};

export default function ChatPage() {
    const router = useRouter();
    const [nft, setNft] = useState<nftData | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const param = useParams<{ id: string }>();
    const nftid = param.id;

    // Initialize WebSocket connection
    useEffect(() => {
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        const storedWallet = localStorage.getItem("walletAddress");
        setWalletAddress(storedWallet);

        const fetchNftData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}`);
                const data = await response.json();
                setNft(data);
            } catch (error) {
                console.error("Error fetching NFT:", error);
            }
        };
        fetchNftData();
    }, [nftid]);

    // Fetch chat messages and set up socket room
    useEffect(() => {
        if (!nft || !walletAddress || !socketRef.current) return;

        socketRef.current.emit("join_nft_room", nftid);

        const fetchMessages = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/chat/${nftid}`);
                const data = await response.json();
                const formattedMessages: Message[] = data.map((msg: any) => ({
                    text: msg.message,
                    sender: msg.isSellerResponse ? "owner" : "buyer",
                    timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    isSellerResponse: msg.isSellerResponse,
                    questionId: msg._id,
                }));
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // Listen for new messages via socket
        socketRef.current.on("newMessage", (msg: any) => {
            console.log("Received message via socket:", msg);
            if (msg.nftId !== nftid) return;
            const newMsg: Message = {
                text: msg.message,
                sender: msg.isSellerResponse ? "owner" : "buyer",
                timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isSellerResponse: msg.isSellerResponse,
                questionId: msg._id,
            };
            setMessages((prev) => [...prev, newMsg]);
        });

        return () => {
            socketRef.current.off("newMessage");
        };
    }, [nft, walletAddress, nftid]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !nft || !walletAddress) return;

        const isOwner = walletAddress === nft.ownerAddress;

        try {
            if (isOwner) {
                const latestQuestion = messages
                    .filter((msg) => !msg.isSellerResponse)
                    .slice(-1)[0];

                if (!latestQuestion?.questionId) {
                    alert("No question to reply to.");
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/reply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionId: latestQuestion.questionId,
                        answer: inputMessage,
                        ownerAddress: walletAddress,
                    }),
                });

                if (!response.ok) throw new Error("Failed to send reply");
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/ask`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nftId: nftid,
                        askerAddress: walletAddress,
                        message: inputMessage,
                    }),
                });

                if (!response.ok) throw new Error("Failed to send question");
            }

            setInputMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        }
    };

    if (!nft) {
        return (
            <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col">
            <div className="flex items-center p-4 bg-[#1A1A1A] border-b border-gray-700">
                <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h3 className="text-lg font-bold">{nft.name}</h3>
                    <p className="text-sm text-gray-400">
                        Chat with {walletAddress === nft.ownerAddress ? "Buyer" : "Owner"}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#1A1A1A]">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === "buyer" ? "justify-start" : "justify-end"} mb-3`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg ${message.sender === "buyer" ? "bg-gray-700" : "bg-green-600"
                                } text-white`}
                        >
                            <p>{message.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700 bg-[#1A1A1A] flex items-center gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                    placeholder="Type your message..."
                />
                <button
                    className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition"
                    onClick={handleSendMessage}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
