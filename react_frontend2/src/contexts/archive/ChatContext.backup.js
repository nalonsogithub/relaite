// ChatContext.js
import React, { createContext, useState, useContext } from 'react';

// Create Context
export const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider Component
export const ChatProvider = ({ children }) => {
  const [chatLogs, setChatLogs] = useState({});
  const [initialQuestion, setInitialQuestion] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [carouselType, setCarouselType] = useState("");
  const [conversationDescriptionList, setConversationDescriptionList] = useState(['Click on an image to start a conversation']);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState("aigent_1");  // Add chatId state
  const [listingID, setListingID] = useState("");
	
  const addMessageToChatLog = (id, message) => {
    setChatLogs((prevLogs) => ({
      ...prevLogs,
      [id]: [...(prevLogs[id] || []), message]
    }));
  };
  
  const resetChatLog = (id) => {
    setChatLogs((prevLogs) => ({
      ...prevLogs,
      [id]: []
    }));
  };
  
  const clearChatLog = (id) => {
    setChatLogs((prevLogs) => ({
      ...prevLogs,
      [id]: []
    }));
  };

  return (
    <ChatContext.Provider value={{
      chatLogs, 
      addMessageToChatLog, 
      clearChatLog, 
      resetChatLog, 
      initialQuestion, 
      initialPrompt,
      setPrompt: setInitialPrompt,
      setQuestion: setInitialQuestion,
      assistantName, 
      setAssistant: setAssistantName, 
      carouselType, 
      setCarouselType, 
      conversationDescriptionList, 
      setConversationDescriptionList, 
      setIsLoading,
      isLoading,
      chatId, 
      setChatId,  // Provide chatId and setChatId
	  listingID,
	  setListingID
    }}>
      {children}
    </ChatContext.Provider>
  );
};
