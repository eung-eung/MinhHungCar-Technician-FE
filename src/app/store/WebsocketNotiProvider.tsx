'use client'
import { signOut, useSession } from "next-auth/react";
import { createContext, useEffect, useRef, useState } from "react";
import useAxiosAuth from "../utils/hooks/useAxiosAuth";
import ToastNotification from "../layouts/components/ToastNotification";
import toast from "react-hot-toast";
import { INotifcation } from "../models/Notification";
import { useRouter } from "next/navigation";

interface WebSocketContextValue {
    ws: WebSocket | null;
    isConnected: boolean;
    notifications: any;
    sound: any,
    setNotifications: any
}

export const WebSocketContext = createContext<WebSocketContextValue>({
    ws: null,
    isConnected: false,
    notifications: [],
    sound: true,
    setNotifications: () => { }
});

export const WebSocketNotiProvider = ({ children }: { children: React.ReactNode }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<any>()
    const { data: session } = useSession()
    const [sound, setSound] = useState<any>()
    const axiosAuth = useAxiosAuth()

    useEffect(() => {
        getNotificationList()
    }, [])

    // get notification list with api
    const getNotificationList = async () => {
        try {
            const response = await axiosAuth.get('/technician/notifications?offset=0&limit=100')
            setNotifications(response.data.data)
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        let timer: any
        const initSocket = async () => {
            try {
                const newWs = new WebSocket('wss://minhhungcar.xyz/tech/subscribe_notification')
                //notification socket
                newWs.onopen = () => {
                    setIsConnected(true)
                    newWs.send(JSON.stringify({ access_token: `Bearer ${session?.access_token}` }))
                    timer = setInterval(() => {
                        console.log(timer);

                        newWs.send('')
                    }, 7000)
                }
                setWs(newWs);
            } catch (error) {
                console.error('WebSocket connection error:', error);
                if (timer) {
                    clearInterval(timer)
                }
            }
        };

        initSocket();

        return () => {
            if (ws) {
                ws.close(); // Clean up on unmount
            }
        };

        // Cleanup function for the WebSocket instance
    }, []);

    return (
        <WebSocketContext.Provider value={
            { setNotifications, ws, isConnected, notifications, sound }}>
            {children}
        </WebSocketContext.Provider>
    );
};