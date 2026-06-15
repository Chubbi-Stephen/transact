import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
	const { user } = useAuth();
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (user?._id) {
			const newSocket = io(SOCKET_URL, {
				withCredentials: true,
			});

			newSocket.on("connect", () => {
				console.log("Connected to real-time engine");
				newSocket.emit("join", user._id);
			});

			newSocket.on("transactionUpdate", (transaction) => {
				const isCredit = transaction.type === "credit";
				toast.success(
					<div>
						<p className="font-bold">{isCredit ? "💰 Payment Received" : "💸 Payment Sent"}</p>
						<p className="text-xs opacity-70">₦{transaction.amount.toLocaleString()} - {transaction.description}</p>
					</div>,
					{ duration: 5000 }
				);
			});

			setSocket(newSocket);

			return () => {
				newSocket.close();
			};
		}
	}, [user]);

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => useContext(SocketContext);
