import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import Draggable from 'react-draggable';
import '../styles/LCClient.css';

const LCClient = ({ userID, listingID }) => {
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [chatState, setChatState] = useState('closed'); // 'closed', 'normal', 'maximized'
    const userSocketRef = useRef(null);

    useEffect(() => {
        const socketURL = 'http://localhost:5000';
        userSocketRef.current = socketIOClient(socketURL, {
            path: '/socket.io',
            query: { user_id: userID, listing_id: listingID, role: 'user' }
        });

        userSocketRef.current.on('connect', () => {
            console.log('User connected to WebSocket server');
        });

        userSocketRef.current.on('disconnect', (reason) => {
            console.log('User disconnected from WebSocket server:', reason);
        });

        userSocketRef.current.on('private_message', (data) => {
            if (data.user_id === userID && data.listing_id === listingID) {
                console.log('User received private_message:', data);
                setChatLog((prevChatLog) => [...prevChatLog, data]);
            }
        });

        return () => {
            userSocketRef.current.disconnect();
        };
    }, [userID, listingID]);

    const initiateChat = () => {
        console.log('Initiating chat');
        userSocketRef.current.emit('initiate_chat', { user_id: userID, listing_id: listingID });
    };

    const sendMessage = () => {
        if (message.trim() && userSocketRef.current) {
            console.log('Sending private_message from user:', message);
            userSocketRef.current.emit('private_message', { message, user_id: userID, listing_id: listingID, sender: 'User' });
            setMessage('');
        }
    };

    const toggleChatState = () => {
        if (chatState === 'closed') {
            setChatState('normal');
            initiateChat();
        } else if (chatState === 'normal') {
            setChatState('maximized');
        } else {
            setChatState('closed');
        }
    };

    const minimizeChat = () => {
        setChatState('closed');
    };

    const normalizeChat = () => {
        setChatState('normal');
    };

    return (
        <div>
            {chatState === 'closed' && (
                <Draggable>
                    <button onClick={toggleChatState} className="live-chat-button">
                        💬
                    </button>
                </Draggable>
            )}
            {chatState !== 'closed' && (
                <Draggable handle=".chat-header">
                    <div className={`chat-window ${chatState === 'maximized' ? 'chat-window-maximized' : 'chat-window-normal'}`}>
                        <div className="chat-header">
                            <div>Chat</div>
                            <div>
                                <button onClick={minimizeChat}>_</button>
                                {chatState === 'maximized' ? (
                                    <button onClick={normalizeChat}>🗗</button>
                                ) : (
                                    <button onClick={toggleChatState}>🗖</button>
                                )}
                            </div>
                        </div>
                        <div className={chatState === 'maximized' ? 'chat-log chat-log-maximized' : 'chat-log'}>
                            <div>
                                <h4>Chat Log</h4>
                                {chatLog.map((msg, index) => (
                                    <div key={index}>
                                        <strong>{msg.sender}:</strong> {msg.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="chat-input">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message as User"
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default LCClient;
