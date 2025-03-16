import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const LCAgent = ({ agentID }) => {
  const [agentMessages, setAgentMessages] = useState({});
  const [chatRooms, setChatRooms] = useState([]);
  const [chatLogs, setChatLogs] = useState({});
  const [availability, setAvailability] = useState({});
  const agentSocketRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const roomUserMap = useRef({});

  useEffect(() => {
//    const socketURL = 'http://localhost:5000';
      
	const socketURL = (() => {
      const hostname = window.location.hostname;
        if (hostname === 'localhost') {
          return 'http://localhost:5000/api';
        } else if (hostname === 'www.aigentTechnologies.com') {
          return 'https://www.aigentTechnologies.com/api';
        } else if (hostname === 'www.openhouseaigent.com') {
          return 'https://www.openhouseaigent.com/api';
        } else {
          return 'https://https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
        }
     })();	  
	  
    agentSocketRef.current = socketIOClient(socketURL, {
      path: '/socket.io',
      query: { user_id: agentID, role: 'agent' },
    });

    agentSocketRef.current.on('connect', () => {
      console.log('Agent connected to WebSocket server');
    });

    agentSocketRef.current.on('disconnect', (reason) => {
      console.log('Agent disconnected from WebSocket server:', reason);
    });

    agentSocketRef.current.on('relevant_chat_rooms', (data) => {
      console.log('Relevant chat rooms:', data);
      setChatRooms(data);
    });

    agentSocketRef.current.on('chat_request', (data) => {
      console.log('Received chat request:', data);
      const { user_id, listing_id } = data;
      const private_room = `${listing_id}|${user_id}`;
      roomUserMap.current[private_room] = user_id;
      console.log(`Joining private room: ${private_room}`);
      agentSocketRef.current.emit('join_private_room', { agent_id: agentID, user_id, listing_id });

      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(error => {
          console.error("Failed to play sound:", error);
        });
      }
    });

    agentSocketRef.current.on('private_message', (data) => {
      if (data.self) return; // Ignore self-sent messages
      console.log('Agent received private_message:', data);
      const { listing_id, sender, message, user_id } = data;
      const private_room = `${listing_id}|${user_id}`;
      setChatLogs((prevChatLogs) => {
        const updatedLogs = { ...prevChatLogs };
        if (!updatedLogs[private_room]) {
          updatedLogs[private_room] = [];
        }
        updatedLogs[private_room].push({ sender, message });
        return updatedLogs;
      });
    });

    return () => {
      agentSocketRef.current.disconnect();
    };
  }, [agentID]);

  const handleAgentMessageChange = (privateRoom, message) => {
    setAgentMessages(prevMessages => ({
      ...prevMessages,
      [privateRoom]: message
    }));
  };

  const sendAgentMessage = (listing_id, user_id) => {
    const privateRoom = `${listing_id}|${user_id}`;
    console.log('IN sendAgentMessage: ', privateRoom);
    const message = agentMessages[privateRoom];
    if (message.trim() && agentSocketRef.current) {
      console.log(`Sending private_message from agent to ${privateRoom}:`, message);
      agentSocketRef.current.emit('private_message', { message, user_id, listing_id, agent_id: agentID, sender: 'Agent', self: true });
      console.log(`Emitted private_message: { message: ${message}, user_id: ${user_id}, listing_id: ${listing_id}, agent_id: ${agentID}, sender: 'Agent', self: true }`);
      
      // Update chat logs directly without triggering another event
      setChatLogs((prevChatLogs) => {
        const updatedLogs = { ...prevChatLogs };
        if (!updatedLogs[privateRoom]) {
          updatedLogs[privateRoom] = [];
        }
        updatedLogs[privateRoom].push({ sender: 'Agent', message });
        return updatedLogs;
      });
      
      handleAgentMessageChange(privateRoom, ''); // Clear the input field for the listing
    } else {
      console.log('Message not sent. Conditions not met:', { message, agentSocketRef: agentSocketRef.current });
    }
  };

  const toggleAvailability = (listingID) => {
    const currentAvailability = availability[listingID] || false;
    const newAvailability = !currentAvailability;
    setAvailability((prevAvailability) => ({
      ...prevAvailability,
      [listingID]: newAvailability,
    }));
    agentSocketRef.current.emit('toggle_availability', { agent_id: agentID, listing_id: listingID, available: newAvailability });
  };

  return (
    <div>
      <h4>Agent {agentID}</h4>
      {chatRooms.map((listingID, index) => (
        <div key={index} style={{ border: '1px solid black', padding: '10px', margin: '10px 0' }}>
          <h5>Listing: {listingID}</h5>
          <button onClick={() => toggleAvailability(listingID)}>
            {availability[listingID] ? 'Set Unavailable' : 'Set Available'}
          </button>
          {Object.keys(chatLogs)
            .filter(room => room.startsWith(listingID))
            .map(privateRoom => {
              const [listing_id, user_id] = privateRoom.split('|');
              return (
                <div key={privateRoom}>
                  <h6>Chat with Client {user_id} for Listing {listing_id}</h6>
                  <input
                    type="text"
                    value={agentMessages[privateRoom] || ''}
                    onChange={(e) => handleAgentMessageChange(privateRoom, e.target.value)}
                    placeholder="Type a message as Agent"
                  />
                  <button onClick={() => sendAgentMessage(listing_id, user_id)}>Send as Agent</button>
                  <div>
                    <h6>Chat Log</h6>
                    {chatLogs[privateRoom] && chatLogs[privateRoom].map((msg, index) => (
                      <div key={index}>
                        <strong>{msg.sender === 'Agent' ? 'Agent' : msg.sender}:</strong> {msg.message}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      ))}
      <audio ref={notificationSoundRef} src="https://hbbreact.blob.core.windows.net/hbbblob2/REAL_ESTaiTE/notifier_sound.wav" />
    </div>
  );
};

export default LCAgent;
