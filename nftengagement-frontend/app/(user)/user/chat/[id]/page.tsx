//chat not workd

"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { nftData, Paginatednft } from "@/app/(user)/user/nft/page"; // Adjust the import path as needed
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
});


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

    const nftid = param.id;

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to Socket.IO server:", socket.id);
        });
        socket.on("connect_error", (error) => {
            console.error("Socket.IO connection error:", error);
        });
        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
        };
    }, []);

    useEffect(() => {
        if (!nftid) {
            console.error("nftid is undefined");
            return;
        }

      
        socket.emit("join-room", nftid);

        // Listen for new questions
        socket.on("new-question", (data) => {
            console.log("Received new-question:", data);
            const newMessage: Message = {
                text: data.message,
                sender: "buyer",
                timestamp: new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isSellerResponse: false,
                questionId: data._id,
            };
            setMessages((prev) => [...prev, newMessage]);
        });

        // Listen for new replies
        socket.on("new-reply", (data) => {
            console.log("Received new-reply:", data);
            const newMessage: Message = {
                text: data.message,
                sender: "owner",
                timestamp: new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isSellerResponse: true,
                questionId: data._id,
            };
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            console.log("Leaving room:", nftid);
            socket.emit("leave-room", nftid);
            socket.off("new-question");
            socket.off("new-reply");
        };
    }, [nftid]);


    useEffect(() => {
        const storedWallet = localStorage.getItem("walletAddress");

        setWalletAddress(storedWallet);

        const fetchNftData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/${nftid}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch NFT");
                }
                const data = await response.json();
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

        socket.emit("join-room", nftid);

        // Listen for new questions
        socket.on("new-question", (data) => {
            const newMessage: Message = {
                text: data.message,
                sender: "buyer",
                timestamp: new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isSellerResponse: false,
                questionId: data._id, // Adjust based on backend response
            };
            setMessages((prev) => [...prev, newMessage]);
        });

        // Listen for new replies
        socket.on("new-reply", (data) => {
            const newMessage: Message = {
                text: data.message,
                sender: "owner",
                timestamp: new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isSellerResponse: true,
                questionId: data._id, // Adjust based on backend response
            };
            setMessages((prev) => [...prev, newMessage]);
        });

        // Cleanup Socket.IO listeners
        return () => {
            socket.off("new-question");
            socket.off("new-reply");
        };

    }, [nft, walletAddress, nftid]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !nft || !walletAddress) return;

        const isOwner = walletAddress === nft.ownerAddress;

        try {
            if (isOwner) {
                // Owner replying
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
                console.log("newMessage,", newMessage);


                // Update local UI
                setMessages((prev) => [...prev, newMessage]);

                //  Emit to Socket.IO
                socket.emit("new-reply", {
                    roomId: nftid,
                    message: newMessage,
                });

            } else {
                // Buyer asking
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

                //  Emit to Socket.IO
                socket.emit("new-question", {
                    roomId: nftid,
                    message: newMessage,
                });
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