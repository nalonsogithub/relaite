import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const agentID = 'agent_1';

const LCAgent = () => {
    const [agentMessages, setAgentMessages] = useState({});
    const [chatRooms, setChatRooms] = useState([]);
    const [chatLogs, setChatLogs] = useState({});
    const agentSocketRef = useRef(null);

    const roomUserMap = useRef({});

    useEffect(() => {
        const socketURL = 'http://localhost:5000';
        agentSocketRef.current = socketIOClient(socketURL, {
            path: '/socket.io',
            query: { user_id: agentID, role: 'agent' }
        });

        agentSocketRef.current.on('connect', () => {
            console.log('Agent connected to WebSocket server');
        });

        agentSocketRef.current.on('disconnect', (reason) => {
            console.log('Agent disconnected from WebSocket server:', reason);
        });

        agentSocketRef.current.on('relevant_chat_rooms', (rooms) => {
            console.log('Received relevant chat rooms:', rooms);
            const roomNames = rooms.map(room => room.listing_id);
            setChatRooms(roomNames);
            roomNames.forEach(room => {
                const roomName = `${room}_agent`;
                console.log(`Joining room: ${roomName}`);
                agentSocketRef.current.emit('join_room', roomName);
            });
        });

        agentSocketRef.current.on('chat_request', (data) => {
            console.log('Received chat request with data:', data);
            const { user_id, listing_id } = data;
            const private_room = `${listing_id}_${user_id}`;
            roomUserMap.current[listing_id] = user_id; // Store the user_id associated with this listing
            console.log(`Joining private room: ${private_room}`);
            agentSocketRef.current.emit('join_private_room', { agent_id: agentID, user_id, listing_id });
        });

        agentSocketRef.current.on('private_message', (data) => {
            console.log('Agent received private_message:', data);
            const { listing_id, sender, message } = data;
            setChatLogs((prevChatLogs) => {
                const updatedLogs = { ...prevChatLogs };
                if (!updatedLogs[listing_id]) {
                    updatedLogs[listing_id] = [];
                }
                updatedLogs[listing_id].push({ sender, message });
                return updatedLogs;
            });
        });

        return () => {
            agentSocketRef.current.disconnect();
        };
    }, []);

    const handleAgentMessageChange = (listingID, message) => {
        setAgentMessages(prevMessages => ({
            ...prevMessages,
            [listingID]: message
        }));
    };

    const sendAgentMessage = (listingID) => {
        const userID = roomUserMap.current[listingID];
        const message = agentMessages[listingID];
        if (message.trim() && userID && agentSocketRef.current) {
            const room = `${listingID}_${userID}`;
            console.log(`Sending private_message from agent to ${room}:`, message);
            agentSocketRef.current.emit('private_message', { message, user_id: userID, listing_id: listingID, agent_id: agentID, sender: 'Agent' });
            handleAgentMessageChange(listingID, ''); // Clear the input field for the listing
        }
    };

    return (
        <div>
            <h4>Agent</h4>
            {chatRooms.map((room, index) => (
                <div key={index} style={{ border: '1px solid black', padding: '10px', margin: '10px 0' }}>
                    <h5>Chat Room: {room}</h5>
                    <input
                        type="text"
                        value={agentMessages[room] || ''}
                        onChange={(e) => handleAgentMessageChange(room, e.target.value)}
                        placeholder="Type a message as Agent"
                    />
                    <button onClick={() => sendAgentMessage(room)}>Send as Agent</button>
                    <div>
                        <h4>Chat Log for {room}</h4>
                        {chatLogs[room] && chatLogs[room].map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.sender}:</strong> {msg.message}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LCAgent;
