import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const LCClient = ({ userID, listingID, agentID }) => {
  const [message, setMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [agentAvailability, setAgentAvailability] = useState({});
  const clientSocketRef = useRef(null);
  const availabilityIntervalRef = useRef(null);

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
	  
    clientSocketRef.current = socketIOClient(socketURL, {
      path: '/socket.io',
      query: { user_id: userID, role: 'user', listing_id: listingID, agent_id: agentID }
    });

    clientSocketRef.current.on('connect', () => {
      console.log('Client connected to WebSocket server');
      clientSocketRef.current.emit('initiate_chat', { user_id: userID, listing_id: listingID, agent_id: agentID });

      // Start the interval to check for agent availability
      availabilityIntervalRef.current = setInterval(() => {
        clientSocketRef.current.emit('check_agent_availability', { listing_id: listingID, agent_id: agentID });
      }, 5000); // Check every 5 seconds
    });

    clientSocketRef.current.on('disconnect', (reason) => {
      console.log('Client disconnected from WebSocket server:', reason);

      // Clear the interval to stop checking for agent availability
      clearInterval(availabilityIntervalRef.current);
    });

    clientSocketRef.current.on('private_message', (data) => {
      console.log('Client received private_message:', data);
      setChatLogs((prevChatLogs) => [...prevChatLogs, data]);
    });

    clientSocketRef.current.on('agent_availability', (data) => {
      console.log('Agent availability:', data);
      setAgentAvailability(data);
    });

    return () => {
      clientSocketRef.current.disconnect();
      clearInterval(availabilityIntervalRef.current);
    };
  }, [userID, listingID, agentID]);

  const sendMessage = () => {
    if (message.trim() && clientSocketRef.current) {
      const data = { message, user_id: userID, listing_id: listingID, sender: userID };
      clientSocketRef.current.emit('private_message', data);
      setMessage('');
    }
  };

  const isAgentAvailable = () => {
    return Object.values(agentAvailability).some(status => status === true);
  };

  return (
    <div>
      <h4>Client {userID} at Listing {listingID}</h4>
      <div>
        Agent Availability: 
        <span style={{ color: isAgentAvailable() ? 'green' : 'red' }}>
          {isAgentAvailable() ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        <h4>Chat Log</h4>
        {chatLogs.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LCClient;
