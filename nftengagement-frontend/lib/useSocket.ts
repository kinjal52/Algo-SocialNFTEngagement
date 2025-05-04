"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL;

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Skip socket connection logic if running on the server (Next.js SSR)
    if (typeof window === "undefined") return;

    // Initialize the socket connection if it doesn't exist
    if (!socketRef.current) {
      const socket = io(SOCKET_SERVER_URL, {
        autoConnect: false, // Prevent automatic connection to allow more control
      });

      socketRef.current = socket;
    }

    const socket = socketRef.current;

    // Connect the socket
    socket.connect();
    console.log("Socket connecting...");

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty dependency ensures this runs only once

  // Wrapper functions for socket `on`, `off`, and `emit`
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};

export default useSocket;
