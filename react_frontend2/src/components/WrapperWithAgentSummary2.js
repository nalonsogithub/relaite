import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the hook for navigation
import { useChat } from "../contexts/ChatContext";
import ReactMarkdown from "react-markdown";
import styles from "../styles/WrapperWithAgentSummary2.module.css";
import { flushSync } from "react-dom";



const WrapperWithAgentSummary2 = () => {
  const [activeChat, setActiveChat] = useState(null); // Tracks the active chat for the modal
  const [modalVisible, setModalVisible] = useState(false); // Controls modal visibility
  const { context_homeChatHist, context_agentChatHist, context_townChatHist, context_Summary, context_updateChatHistory } = useChat();
  const navigate = useNavigate(); // Initialize navigation
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState([]);
  const [isCancelled, setIsCancelled] = useState(false); // Track if streaming is cancelled
  const chat_type = "home";
	
  const bufferRef = useRef(""); 
  const controllerRef = useRef(null); // Move useRef here to resolve the issue	
	

  // Function to toggle the modal
  const toggleModal = (chatType) => {
    setActiveChat(chatType);
    setModalVisible(!modalVisible);
  };

	const summarizeSpecificChat = async (chatType) => {
	  console.log(`Summarizing ${chatType} chat...`);
	  setIsLoading(true);
	  bufferRef.current = ""; // Clear buffer
	  setMessages([]); // Clear messages

	  // Get the chat messages for the specific chat type
	  const chatMessages = getChatMessages(chatType);
	  const prompt = `Summarize the following ${chatType} in the form of a letter where you greet the user, list the relevent details of the chat, and signoff as Your AIgent.  Include any elements of the conversation that can make it feel personal if possible. Add any contact information for the listing agent you might have. [chat:\n\n${chatMessages}]`;

	  try {
		await handleSubmit(
		  null,
		  prompt,
		  "",
		  null,
		  (result) => {
			console.log("Specific chat summarized:", result);
			setIsLoading(false);
		  }
		);
	  } catch (error) {
		console.error("Error summarizing specific chat:", error);
		setIsLoading(false);
	  }
	};

	const summarizeAllChats = async () => {
	  console.log("Summarizing all chats...");
	  setIsLoading(true);
	  bufferRef.current = ""; // Clear buffer
	  setMessages([]); // Clear messages

	  // Combine all chat histories
	  const allChatMessages = `
		Home Chat:\n${getChatMessages("home")}\n\n
		Agent Chat:\n${getChatMessages("agent")}\n\n
		Neighborhood Chat:\n${getChatMessages("neighborhood")}
	  `;
//	  const prompt = `Summarize the following chats:\n\n${allChatMessages}`;
	  const prompt = `Summarize the following chat logs in the form of a letter where you greet the user, list the relevent details of the chat, and signoff as Your AIgent.  Include any elements of the conversation that can make it feel personal if possible.  Add any contact information for the listing agent you might have. [chat:\n\n${allChatMessages}]`;

	  try {
		await handleSubmit(
		  null,
		  prompt,
		  "",
		  null,
		  (result) => {
			console.log("All chats summarized:", result);
			setIsLoading(false);
		  }
		);
	  } catch (error) {
		console.error("Error summarizing all chats:", error);
		setIsLoading(false);
	  }
	};

  const chatHistories = [
    { type: "home", name: "Home Chat History", data: context_homeChatHist },
    { type: "agent", name: "Agent Chat History", data: context_agentChatHist },
    { type: "neighborhood", name: "Neighborhood Chat History", data: context_townChatHist },
  ];

  const getChatMessages = (chatType) => {
	console.log('IN getChatMessages');
    const chatData = {
      home: context_homeChatHist,
      agent: context_agentChatHist,
      neighborhood: context_townChatHist,
      summary: context_Summary,
    }[chatType];
	
    if (!chatData || chatData.length === 0) return "No chat history available.";

    return chatData
      .map((msg) => `${msg.user}: ${msg.text}`)
      .join("\n\n"); // Format messages with prefixes
  };

  // Navigation handlers
  const handleNavigateToCarousel = () => {
    navigate("/WrapperMainSiteCarousel");
  };

  const handleNavigateToChat = (chatType) => {
    const routes = {
      home: "/WrapperWithCarouselAndBinImageQGame",
      agent: "/WrapperWithContactAndBot",
      neighborhood: "/WrapperWithAgentAndRenderNeighborhoodMap",
    };
    navigate(routes[chatType]);
  };
	
//  const summarizeChat = async () => {
//    setIsLoading(true);
//	console.log('in summarizeChat');
//    bufferRef.current = ""; 
//	setMessages([]); 
//	  
//	  
//    try {
//		console.log('in summarizeChat awaiting');
//      await handleSubmit(null, "Write a formal letter to the user summarizing the conversation", "Hi", null, (result) => {
//		console.log('in summarizeChat awaiting - awaited');
////        setSummary(result);
//		console.log('in summarizeChat awaiting - awaitecompleed');
//        setIsLoading(false);
//      });
//    } catch (error) {
//      console.error("Error summarizing chat:", error);
//      setSummary("An error occurred while summarizing the chat.");
//      setIsLoading(false);
//    }
//  };


//  const bufferRef = useRef('');	
  const handleSubmit = async (event, prompt = null, input = "", questionID = null) => {
    if (event) event.preventDefault();

    const question = input || "";
    let effectivePrompt = prompt || "";
    const qID = questionID || "";
	const questionSource =  'NA';

    setIsLoading(true);
    setIsCancelled(false); // Reset cancel status
	  
    // Initialize AbortController to allow canceling
    const controller = new AbortController();
    controllerRef.current = controller; 
	  

    try {
      const payload = {
        user_question: question.trim(),
        system_prompt: effectivePrompt,
        question_id: qID,
        question_origin: questionSource,
      };

      const response = await fetch("/api/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal // Attach the abort controller signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

	  let buffer = ""; // Declare a local buffer for this function
	  let jsonBuffer = ""; // Buffer for collecting JSON data
	  let waiting_for_json = false; // Tracks if we're collecting JSON
	  let isJson = false; // Tracks if backticks indicate a JSON block
	  let ENTIRE_RESPONSE = "";
		
      const processText = async ({ done, value }) => {
        try {
		  
          if (done || isCancelled) {
            setIsLoading(false);
			  
			  // UPDATE RESPONSE
			  const aiResponse = { user: 'AIgent', text: cleanMessageAndExtractJson(ENTIRE_RESPONSE) };
  		      context_updateChatHistory("summary", aiResponse);
			  
			  
            return;
          }			
			
			
          const chunk = decoder.decode(value, { stream: true });
		  bufferRef.current += chunk; // Append chunk to the local buffer
		  ENTIRE_RESPONSE += chunk;
			
		  // JSON Detection and Processing
		  if (waiting_for_json) {
			console.log('Waiting for JSON');
			const cleanedBuffer = bufferRef.current
			  .replace(/```json/g, "") // Remove occurrences of ```json
			  .replace(/``` json/g, ""); // Remove occurrences of ``` json			  
			  
			if (cleanedBuffer.includes("```")) {
				console.log('Cleaned Buffer includes ```');
				const [jsonPart, remaining] = cleanedBuffer.split("```", 2);				
				const cleanedJson = jsonPart
				  .replace(/```json/g, "") // Remove opening backticks and `json`
				  .replace(/``` json/g, "") // Handle possible space after `json`
				  .replace(/```/g, "") // Remove ending backticks
				  .replace(/[\n\r]/g, "") 
				  .trim(); // Clean extra spaces			
				

			  isJson = false; // Exit JSON mode for non-JSON patterns
			  jsonBuffer = ""; // Clear JSON buffer
			  waiting_for_json = false; // Exit JSON collection mode
			  bufferRef.current = ""; // Append remaining text to the buffer
			  buffer += remaining; // Append remaining text to the buffer
			} else {
			  // Continue collecting JSON
			  jsonBuffer += chunk;
			}
		  } else if (isJson || bufferRef.current.includes("`")) {
			console.log('JSON buffer FOUND', bufferRef.current);
			isJson = true;
			
			// SPLIT BUFFER AND CHECK IF THERE IS CONTENT BEFORE
  			const splitParts = bufferRef.current.split("`", 2); // Split into at most two parts

		    // Extract the content before and after the first backtick
		    const contentBefore = splitParts[0]; // Content before the first backtick
		    const contentAfter = "`" + splitParts[1]; // Content after, re-adding the backtick
			  
		    // Check if contentBefore is empty
		    if (contentBefore === "") {
			  console.log("Content before the backtick is empty.");
		    } else {
			  console.log("Content before the backtick:", contentBefore);
			  flushSync(() => {
			    setMessages((prevMessages) => {
			  	const updatedMessages = [...prevMessages];
				const lastMessage = updatedMessages[updatedMessages.length - 1];
				if (lastMessage?.user === "AIgent") {
				  updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					text: lastMessage.text + contentBefore,
				  };
				} else {
				  updatedMessages.push({ user: "AIgent", text: contentBefore });
				}
				  return updatedMessages;
			    });
			  });			  
			  contentBefore = "";
				
		    }			  
		    // Update the buffer to only contain the content after the backtick
			  
			if (bufferRef.current.includes("```json") || bufferRef.current.includes("``` json")) {
			  console.log('JSON FOUND', bufferRef.current);
			  waiting_for_json = true;

			  // Start JSON mode
			  const [textPart, jsonPart] = bufferRef.current.split(
				bufferRef.current.includes("```json") ? "```json" : "``` json",
				2
			  );
			  bufferRef.current += textPart; // Append non-JSON part
			  jsonBuffer = jsonPart; // Start collecting JSON
			  return reader.read().then(processText);
			} else if (
				/```[^j\s]/.test(bufferRef.current) || // Detect non-JSON backticks
			  	/``` [^\sj]/.test(bufferRef.current)
				) {
			  	console.log('JSON CHUNK FALSE', bufferRef.current);
			  	waiting_for_json = false;
			  	isJson = false; // Exit JSON mode for non-JSON patterns
			} 
		  } else if (!waiting_for_json) {
			console.log('NOT WAITING FOR JSON');
			flushSync(() => {
			  setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				const lastMessage = updatedMessages[updatedMessages.length - 1];
				if (lastMessage?.user === "AIgent") {
				  updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					text: lastMessage.text + bufferRef.current,
				  };
				} else {
				  updatedMessages.push({ user: "AIgent", text: bufferRef.current });
				}
				return updatedMessages;
			  });
			});			  
			bufferRef.current = "";
			  
			  
		  }			
				
          return reader.read().then(processText);
        } catch (error) {
          console.error("Error processing text:", error);
        }
      };
			
      reader.read().then(processText);

    } catch (error) {
      if (error.name === 'AbortError') {
      } else {
        console.error("Error fetching data: ", error);
        setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Failed to connect to the server." }]);
      }

      setIsLoading(false);
    }
  };
	
  const copyToClipboard = () => {
    const content = messages.map((msg) => `${msg.user}: ${msg.text}`).join("\n");
    navigator.clipboard.writeText(content).then(
      () => alert("Content copied to clipboard!"),
      (err) => console.error("Failed to copy text: ", err)
    );
  };	
	
  const cleanMessageAndExtractJson = (message) => {
	  // Define the regular expression to match both patterns of JSON blocks
	  const jsonRegex = /```json\s*([\s\S]*?)\s*```|``` json\s*([\s\S]*?)\s*```/;

	  // Attempt to match the JSON block
	  const jsonMatch = message.match(jsonRegex);

	  if (jsonMatch) {
		try {
		  // Parse the matched JSON block
		  const jsonData = JSON.parse(jsonMatch[1] || jsonMatch[2]); // Handle both capture groups

		  // You could process `jsonData` here if needed
		  // e.g., extracting `convotop` or suggested questions

		} catch (error) {
		  console.error("Failed to parse JSON:", error);
		}

		// Remove the matched JSON block from the message
		const cleanedMessage = message.replace(jsonRegex, '').trim();
		return cleanedMessage; // Return the cleaned message without the JSON
	  }

	  // Return the original message if no JSON block is found
	  return message;
  };
	
    useEffect(() => {
	  setMessages(context_Summary);
    }, [context_Summary]);
	

  return (
    <div className={styles.container}>
      {/* Chat History Tiles */}
      <div className={styles.chatHistoryContainer}>
        {chatHistories.map(({ type, name, data }) => (
          data && data.length > 0 && ( // Render only if the chat history exists
            <div key={type} className={styles.chatTile}>
              <h3 className={styles.chatTileTitle}>{name}</h3>
              <div className={styles.buttonContainer}>
                <button onClick={() => handleNavigateToChat(type)}>
                  Return to Chat
                </button>
                <button onClick={() => summarizeSpecificChat (type)}>
                  Summarize Chat
                </button>
                <button onClick={() => toggleModal(type)}>
                  View Chat
                </button>
              </div>
            </div>
          )
        ))}
      </div>

	  <div className={styles.summaryButtonContainer}>
		{/* Summarize All Chats Button */}
		<button onClick={summarizeAllChats} className={styles.summaryButton}>
		  Summarize All Chats
		</button>

		{/* Return to Carousel */}
		<button onClick={handleNavigateToCarousel} className={styles.summaryButton}>
		  Return to Carousel
		</button>
	  </div>

      {/* Modal for Viewing Chat */}
      {modalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButtonTopRight} onClick={toggleModal}>
              ✖
            </button>
            <h2>{activeChat && chatHistories.find((chat) => chat.type === activeChat)?.name}</h2>
            <div className={styles.modalContent}>
              <ReactMarkdown>
                {getChatMessages(activeChat)}
              </ReactMarkdown>
            </div>
            <button className={styles.closeButton} onClick={toggleModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ChatSummaryToMarkdown Component */}
      <div className={styles.paper}>
        <div className={styles.header}>
          <button className={styles.copyButton} onClick={copyToClipboard} disabled={!messages.length}>
            📋 Copy
          </button>
        </div>	  
        <div className={styles.chatLog}>
			{messages &&
			  Array.isArray(messages) &&
			  messages
				.filter((message) => message.user === "AIgent") // Only include messages from "AIgent"
				.map((message, index) => (
				  <div key={index} className={styles.messageContainer}>
					{message.text && <ReactMarkdown>{message.text}</ReactMarkdown>}
				  </div>
				))}			

        </div>

      </div>

    </div>
  );
};

export default WrapperWithAgentSummary2;
