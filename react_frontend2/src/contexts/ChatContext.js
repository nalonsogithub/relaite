import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useSiteAuth } from '../contexts/SiteAuthContext'; 


// Create Context
export const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider Component
export const ChatProvider = ({ children }) => {
  const [context_systemPrompt, context_setSystemPrompt] = useState("");
  const [context_userPrompt, context_setUserPrompt] = useState("");
  const [context_showUser, context_setShowUser] = useState(true);
  const [context_showAgent, context_setShowAgent] = useState(true);
  const [context_chatLog, context_setChatLog] = useState({});
  const [context_questionId, context_setQuestionId] = useState("");
  const [context_siteLocation, context_setSiteLocation] = useState("");
  const [context_ConvoTop, context_setConvoTop] = useState("");
  const [context_chatId, context_setChatId] = useState("");
  const [context_context, context_setContext] = useState("");
  const [context_listing_id, context_set_listing_id] = useState("");  // New state for listing ID
  const [context_ContextQuestionOrigin, context_setContextQuestionOrigin] = useState("");
  // Define chatHistory state
  // Define state for multiple chat histories
  const [context_homeChatHist, context_setHomeChatHist] = useState([]);
  const [context_agentChatHist, context_setAgentChatHist] = useState([]);
  const [context_townChatHist, context_setTownChatHist] = useState([]);
  const [context_Summary, context_setSummary] = useState([]);
	
  const {siteUser,
		 siteIsLoggedIn,
		 siteIsAdmin,
		 siteLogin,
		 siteSignup,
		 siteLogout,
		 siteLoading,
		 userID,
		 userJson} = useSiteAuth([])
	
	
  // Generalized function to update chat history
  const context_updateChatHistory = (type, newMessage) => {
    switch (type) {
      case 'summary':
        context_setSummary([newMessage]); // Directly set the latest summary
        break;
      case 'home':
        context_setHomeChatHist((prevHistory) => [...prevHistory, newMessage]);
        break;
      case 'agent':
        context_setAgentChatHist((prevHistory) => [...prevHistory, newMessage]);
        break;
      case 'town':
        context_setTownChatHist((prevHistory) => [...prevHistory, newMessage]);
        break;
      default:
        console.error(`Invalid chat history type: ${type}`);
    }
  };
	
  // Function to log user interactions to the Flask API
  const context_logUserInteraction = async (question, answer, action, questionSource = 'system', action_source='system', prompt=null) => {
    const logData = {
      listing_id: context_listing_id, // Use the listing ID from the context
      question: question,             // Question presented to the user
	  action: action,
      system_prompt: prompt, // System prompt from the context
      question_source: questionSource,     // Source of the question (default to 'system')
	  action_source: action_source,
      answer: answer,                  // User's response
	  userID: userID
    };

    const baseUrl = (() => {
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        return 'http://localhost:5000/api';
      } else if (hostname === 'www.aigentTechnologies.com') {
        return 'https://www.aigentTechnologies.com/api';
      } else if (hostname === 'www.openhouseaigent.com') {
        return 'https://www.openhouseaigent.com/api';
      } else {
        return 'https://hbb-zzz.azurewebsites.net/api';
      }
    })();
  
    const convoTop = context_ConvoTop || 'default';

    try {
      const response = await axios.post(`${baseUrl}/log-user-interaction`, logData); 
    } catch (error) {
      console.error('Error logging user interaction:', error);
    }
  };	
	
  // Provide the state and functions to the context consumers
  return (
    <ChatContext.Provider value={{
      context_systemPrompt,
      context_setSystemPrompt,
      context_userPrompt,
      context_setUserPrompt,
      context_showUser,
      context_setShowUser,
      context_showAgent,
      context_setShowAgent,
      context_chatLog,
      context_setChatLog,
      context_siteLocation,
      context_setSiteLocation,
      context_ConvoTop,
      context_setConvoTop,
      context_questionId,
      context_setQuestionId,
      context_chatId,
      context_setChatId,
      context_context, 
      context_setContext,
	  context_ContextQuestionOrigin,  // for logging
	  context_setContextQuestionOrigin,
      context_listing_id,          // Provide listing_id
      context_set_listing_id,       // Provide setter for listing_id
	  context_logUserInteraction,
	  context_updateChatHistory,
	  context_homeChatHist, 
	  context_agentChatHist, 
	  context_townChatHist,
	  context_Summary,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
