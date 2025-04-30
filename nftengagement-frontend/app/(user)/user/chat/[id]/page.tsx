"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { nftData, Paginatednft } from "@/app/(user)/user/nft/page"; // Adjust the import path as needed

type Message = {
    text: string;
    sender: "buyer" | "owner";
    timestamp: string;
    isSellerResponse?: boolean;
    questionId?: string; // For replies
};

type ChatPageProps = {
    params: { nftId: string };
};

export default function ChatPage() {

    const router = useRouter();
    const [nft, setNft] = useState<nftData | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const param = useParams<{ id: string }>();
    console.log("param", param);

    const nftid = param.id;
    console.log("nftid", nftid);


    // Fetch NFT data and wallet address
    // useEffect(() => {
    //     const storedWallet = localStorage.getItem("walletAddress");
    //     setWalletAddress(storedWallet);

    //     // Fetch NFT data (mocked for now; replace with API call)
    //     const fetchNftData = async () => {
    //         try {
    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}`);
    //             const data: Paginatednft = await response.json();
    //             const selectedNft = data.data.find((item) => item._id === nftid);
    //             setNft(selectedNft || null);
    //         } catch (error) {
    //             console.error("Error fetching NFT:", error);
    //         }
    //     };

    //     // Mocked data for now (replace with actual fetch)
    //     const mockData: Paginatednft = {
    //         data: [
    //             {
    //                 _id: nftid,
    //                 creator: "Creator Name",
    //                 ownerAddress: "2NTOTS3UL6ZAEPA55PEV7TETPUGBFDWSVJK5UCPSKPYMSV6NXKGUJJFZCI",
    //                 name: "Leopard",
    //                 image: "http://localhost:3000/uploads/1745839182368.jpg",
    //                 description: "Leopard NFT",
    //                 verified: true,
    //                 minting: "Now",
    //                 price: "0",
    //             },
    //         ],
    //     };
    //     const selectedNft = mockData.data.find((item) => item._id === nftid);
    //     setNft(selectedNft || null);
    // }, [nftid]);

    useEffect(() => {
        const storedWallet = localStorage.getItem("walletAddress");
        console.log("storedWallet", storedWallet);

        setWalletAddress(storedWallet);

        const fetchNftData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}`);
                console.log("response", response);
                if (!response.ok) {
                    throw new Error("Failed to fetch NFT");
                }
                const data = await response.json();
                console.log("data", data); // Debug the raw response
                // Expecting a single NFT object, not a paginated response
                if (!data || typeof data !== "object" || !data._id) {
                    throw new Error("Invalid NFT data received");
                }
                setNft(data);
            } catch (error) {
                console.error("Error fetching NFT:", error);
            }
        };
        fetchNftData();
    }, [nftid]);


    // Fetch chat messages
    useEffect(() => {
        if (!nft || !walletAddress) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/chat/${nftid}`);
                console.log("chat response", response);

                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }
                const data = await response.json();
                // Map backend data to frontend Message format
                const formattedMessages: Message[] = data.map((msg: any) => ({
                    text: msg.message,
                    sender: msg.isSellerResponse ? "owner" : "buyer",
                    timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    isSellerResponse: msg.isSellerResponse,
                    questionId: msg._id, // Store questionId for replies
                }));
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [nft, walletAddress]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        console.log("handleSendMessage called");
        console.log("inputMessage", inputMessage);
        console.log("nft", nft);
        console.log("walletAddress", walletAddress);


        if (!inputMessage.trim() || !nft || !walletAddress) return;

        const isOwner = walletAddress === nft.ownerAddress;
        console.log("isOwner", isOwner);

        try {
            if (isOwner) {
                console.log("isOwner", isOwner);

                // Owner replying to a question
                // Find the latest question from the buyer to reply to
                const latestQuestion = messages
                    .filter((msg) => !msg.isSellerResponse)
                    .slice(-1)[0];

                if (!latestQuestion || !latestQuestion.questionId) {
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
                console.log("response", response);


                if (!response.ok) {
                    throw new Error("Failed to send reply");
                }

                const replyData = await response.json();
                const newMessage: Message = {
                    text: inputMessage,
                    sender: "owner",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isSellerResponse: true,
                    questionId: replyData.data._id,
                };
                setMessages((prev) => [...prev, newMessage]);
            } else {
                console.log("nftId", nft._id);

                // Buyer asking a question
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/ask`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nftId: nftid,
                        askerAddress: walletAddress,
                        message: inputMessage,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to send question");
                }

                const questionData = await response.json();
                const newMessage: Message = {
                    text: inputMessage,
                    sender: "buyer",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isSellerResponse: false,
                    questionId: questionData._id,
                };
                setMessages((prev) => [...prev, newMessage]);
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
            {/* Chat Header */}
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

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#1A1A1A]">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === "buyer" ? "justify-start" : "justify-end"
                            } mb-3`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg ${message.sender === "buyer"
                                ? "bg-gray-700 text-white"
                                : "bg-green-600 text-white"
                                }`}
                        >
                            <p>{message.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
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