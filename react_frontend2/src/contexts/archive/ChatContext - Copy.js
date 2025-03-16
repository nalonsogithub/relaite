import React, { createContext, useState, useContext } from 'react';

// Create Context
export const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider Component
export const ChatProvider = ({ children }) => {
  const [chatLog, setChatLog] = useState([]);
  const [initialQuestion, setInitialQuestion] = useState("");
  const [assistantName, setAssistantName] = useState("");

  const addMessageToChatLog = (message) => {
    setChatLog((prevLog) => [...prevLog, message]);
  };

  const resetChatLog = () => {
    setChatLog([]);  // Reset Chat logs to initial state
    setInitialQuestion("");  // Reset initial question
    setAssistantName("");  // Reset assistant name
  };

  const clearChatLog = () => {
    console.log('clearing chat');
    setChatLog([]);
  };

  const setQuestion = (question) => {
    setInitialQuestion(question);
  };

  const setAssistant = (name) => {
    setAssistantName(name);
  };

  return (
    <ChatContext.Provider value={{ chatLog, addMessageToChatLog, clearChatLog, initialQuestion, setQuestion, assistantName, setAssistant, resetChatLog }}>
      {children}
    </ChatContext.Provider>
  );
};
