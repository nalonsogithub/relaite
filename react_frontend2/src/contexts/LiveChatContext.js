import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import socketIOClient from 'socket.io-client';

// Create Live Chat Context
export const LiveChatContext = createContext();

// Custom hook to use the live chat context
export const useLiveChat = () => useContext(LiveChatContext);

// Function to get the socket URL
const getSocketURL = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'http://localhost:5000';
    } else if (hostname === 'www.aigentTechnologies.com') {
        return 'https://www.aigentTechnologies.com';
    } else if (hostname === 'www.openhouseaigent.com') {
        return 'https://www.openhouseaigent.com';
    } else {
        return 'https://hbb-zzz.azurewebsites.net'; // Default URL if no match
    }
};

// Provider Component
export const LiveChatProvider = ({ children }) => {
    const [agentStatus, setAgentStatus] = useState({ 'aigent_1': true });  // Set default agent status to available
    const socket = useRef(null);
    const [listingID, setListingID] = useState("");
    const [chatId, setChatId] = useState("aigent_1");

    useEffect(() => {
        const socketURL = getSocketURL();
        socket.current = socketIOClient(socketURL, {
            path: '/socket.io',
            query: { listing_id: listingID, user_id: chatId, role: 'user' }
        });

        socket.current.on('agent_status', (data) => {
            console.log('Received agent status:', data); // Print agent status data
            setAgentStatus((prevStatus) => ({ ...prevStatus, [data.agent_id]: data.available }));
        });

        socket.current.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        return () => {
            socket.current.disconnect();
        };
    }, [listingID, chatId]);

    return (
        <LiveChatContext.Provider value={{
            agentStatus,
            setAgentStatus,
            socket,
            listingID,
            setListingID,
            chatId,
            setChatId
        }}>
            {children}
        </LiveChatContext.Provider>
    );
};
