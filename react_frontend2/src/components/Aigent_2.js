import React, { useState, useEffect, useRef, useContext} from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Aigent_2.module.css';
import { useSwipeable } from 'react-swipeable';
import { useChat } from '../contexts/ChatContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons"; // Clipboard icon
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import { flushSync } from "react-dom";
import axios from 'axios';

const Aigent_2 = ({ collapseCarousel, showFull = true, isModal = false, showLabels = true, maxHeight = "300px", chat_type= "home", onCopyToClipboard }) => {
  const minHeight = maxHeight;
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false); // Track if streaming is cancelled
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [visibleQuestionCount, setVisibleQuestionCount] = useState(3);	
  const { listingJson, imageURL } = useContext(ListingAdminContext);
  const [errorMessage, setErrorMessage] = useState(null);
	
  const { 
    context_chatLog, 
    context_addMessageToChatLog, 
    context_systemPrompt, 
    context_setSystemPrompt, 
    context_userPrompt, 
    context_setUserPrompt, 
    context_chatId, 
    context_setChatId, 
    context_siteLocation, 
    context_setSiteLocation, 
    context_ConvoTop, 
    context_setConvoTop, 
    context_questionId, 
    context_setQuestionId, 
    context_showUser, 
    context_setShowUser,  
    context_showAgent, 
    context_setShowAgent, 
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
  } = useChat();
  
	useEffect(() => {
    	if (context_systemPrompt) {
			
//      		context_setConvoTop("");
			
      		handleSubmit(null, context_systemPrompt, context_userPrompt, context_questionId);
			const question = context_systemPrompt;
	  		const action = 'context question';
			const actionSource = 'agent_2';
			const questionSource = 'context';
			const answer = null;
    		context_logUserInteraction(question, answer, questionSource, action, actionSource);
		

			context_setSystemPrompt("");
      		context_setUserPrompt("");
      		context_setQuestionId("");
      		context_setShowUser(true);
      		context_setShowAgent(true);
	  		context_setContext("");
    	}
  	}, [context_systemPrompt, context_userPrompt]);

  const chatLogRef = useRef(null);
  const controllerRef = useRef(null);
	
  // SCROLLING CODE
  // 1. Track if auto-scroll is enabled and if the scroll button should be shown
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false); // Control auto-scroll
  const [showScrollButton, setShowScrollButton] = useState(false); // Show when content exceeds the visible area

  // 2. Detect user scrolling and content overflow to show the scroll button
  useEffect(() => {
    const chatLog = chatLogRef.current;

    const handleScroll = () => {
      if (chatLog) {
		setShowScrollButton(false);
        const isAtBottom = chatLog.scrollHeight - chatLog.scrollTop === chatLog.clientHeight;
        setIsAutoScrollEnabled(false); 
      }
    };

    if (chatLog) {
      chatLog.addEventListener('scroll', handleScroll);
      chatLog.addEventListener('touchmove', handleScroll); 
    }

    return () => {
      if (chatLog) {
        chatLog.removeEventListener('scroll', handleScroll);
        chatLog.removeEventListener('touchmove', handleScroll);
      }
    };
  }, [chatLogRef]);

	
	
  // 3. Check if content exceeds the visible area and show the scroll button
  useEffect(() => {
    const chatLog = chatLogRef.current;

    if (chatLog) {
      const isScrollable = chatLog.scrollHeight > chatLog.clientHeight;
      setShowScrollButton(isScrollable); 
    }
  }, [messages]); 
	
	
  // Function to copy chat to clipboard
  const copyChatToClipboard = () => {
	console.log("Copy to Clicpboard");
    const chatContent = messages
      .map((message) => `${message.user}: ${message.text}`)
      .join("\n");
    navigator.clipboard.writeText(chatContent).then(() => {
	  // Notify the parent component
      if (onCopyToClipboard) {
        onCopyToClipboard(chatContent); // Pass the copied content to the parent
      }
    });
  };	

  // 5. Handle when the user clicks the scroll button to enable auto-scroll and hide the button immediately
  const handleScrollToBottom = () => {
    // Hide the button immediately when clicked, regardless of whether the chat log reaches the bottom or not
    setShowScrollButton(false);
    // Enable auto-scroll
    setIsAutoScrollEnabled(true);

    // Scroll to the bottom (auto-scroll will handle the rest for new messages)
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
	
  // END SCROLLING CODE

	
  // Quick question carousel state
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  // State for questions and system prompts
  const [questions, setQuestions] = useState([]); // Will hold the fetched questions
  const [questionPrompts, setQuestionPrompts] = useState([]); // Will hold the system prompts
  const [aIgentQuickQuestion, setAIgentQuickQuestion] = useState(null); // State to hold OWQQ question

  // Ref to store the previous state of aIgentQuickQuestion
  const previousQuickQuestionRef = useRef(null);

  // Effect to handle updates to aIgentQuickQuestion
  useEffect(() => {
    if (
      aIgentQuickQuestion &&
      JSON.stringify(aIgentQuickQuestion) !==
        JSON.stringify(previousQuickQuestionRef.current)
    ) {
      // aIgentQuickQuestion has changed
      console.log("New Quick Question detected:", aIgentQuickQuestion);

      // Update questions or perform other logic
      setQuestions((prevQuestions) => [
        ...prevQuestions,
        ...(Array.isArray(aIgentQuickQuestion)
          ? aIgentQuickQuestion
          : [aIgentQuickQuestion]),
      ]);
      fetchQuestions();

      // Update the ref to track the new state
      previousQuickQuestionRef.current = aIgentQuickQuestion;
    }
  }, [aIgentQuickQuestion]);	
	
	

  useEffect(() => {
	console.log('Change Detected Loading Questons');  
  }, [context_siteLocation, context_ConvoTop]); // Watch for changes in `context_siteLocation`

  // Function to fetch questions based on `SITE_LOCATION` and `CONVOTOP`
  const fetchQuestions = async () => {
    try {
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
		
      // Fetch `SITE_LOCATION` questions, continue with empty response if not found
      const siteLocationResponse = await axios.get(`${baseUrl}/get_site_location_questions`, {
        params: { SITE_LOCATION: context_siteLocation }
      }).catch(error => {
        console.error("Error fetching SITE_LOCATION questions:", error.response || error.message);
        return { data: [] }; // Return empty data if an error occurs
      });

      // If no `SITE_LOCATION` questions found, move to `CONVOTOP` only
      let combinedData = siteLocationResponse.data.map(q => ({ ...q, source: 'SITE_LOCATION' }));

      // Fetch `CONVOTOP` questions and add to the combined data
      const convotopResponse = await axios.get(`${baseUrl}/get_convotop_questions`, {
        params: { CONVOTOP: convoTop }
      }).catch(error => {
        console.error("Error fetching CONVOTOP questions:", error.response || error.message);
        return { data: [] }; // Return empty data if an error occurs
      });

      combinedData = [...combinedData, ...convotopResponse.data.map(q => ({ ...q, source: 'CONVOTOP' }))];

      // **If OWQQ was found earlier, append it**
      if (aIgentQuickQuestion) {
		// Ensure `aIgentQuickQuestion` is an array of question objects
		const normalizedOWQQQuestions = Array.isArray(aIgentQuickQuestion)
		  ? aIgentQuickQuestion.map((question, index) => ({
			  question_id: question.question_id || `owqq-${index}`, // Generate an ID if missing
			  quick_question: question.quick_question || question,
			  quick_question_system_prompt: question.quick_question_system_prompt || '',
			  qucik_question_order: question.qucik_question_order || index,
			  source: question.source || 'OWQQ'
			}))
		  : [aIgentQuickQuestion]; // Wrap in array if it's a single object		  
		combinedData = [...combinedData, ...normalizedOWQQQuestions];
      }

		
      // If questions are found, set the state
      if (combinedData.length > 0) {
        const questionList = combinedData.map(q => q.quick_question);
        const questionPromptList = combinedData.map(q => q.quick_question_system_prompt);

        setQuestions(combinedData.flat());
        setQuestionPrompts(questionPromptList);
        setVisibleQuestionCount(combinedData.length);
      } else {
        console.log('No questions found for either CONVOTOP or SITE_LOCATION.');
      }

    } catch (error) {
      console.error('Error fetching questions:', error.response || error.message);
    }
  };
	
	
	const handleNext = () => {
    	setVisibleStartIndex((prevIndex) => (prevIndex + 1) % questions.length);
		const question = null;
	  	const action = 'next image';
		const actionSource = 'agent_2';
		const questionSource = null;
		const answer = null;
//    	context_logUserInteraction(question, answer, questionSource, action, actionSource);
  	};

  	const handlePrevious = () => {
    	setVisibleStartIndex((prevIndex) => (prevIndex === 0 ? questions.length - 1 : prevIndex - 1));
		const question = null;
	  	const action = 'prev image';
		const actionSource = 'agent_2';
		const questionSource = null;
		const answer = null;
//    	context_logUserInteraction(question, answer, questionSource, action, actionSource);
  	};
	
	

  const getVisibleQuestions = () => {
    const endSlice = questions.slice(visibleStartIndex, visibleStartIndex + visibleQuestionCount);
	  
    const remainingItems = visibleStartIndex + visibleQuestionCount > questions.length 
      ? questions.slice(0, (visibleStartIndex + visibleQuestionCount) % questions.length) 
      : [];
    return [...endSlice, ...remainingItems];
  };	
	

	
	

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });
  // END QUICK QUESTIONS
  // UseEffect to watch for updates to questions
  useEffect(() => {
    if (aIgentQuickQuestion) {
      setQuestions((prevQuestions) => [...prevQuestions, aIgentQuickQuestion]);
    }

	  
  }, [aIgentQuickQuestion]);	
	
  const handleQuestionClick = (question, index) => {

    // Set the user input with the clicked question
    setUserInput(question);
	  
	  

    // Trigger handleSubmit with the corresponding system prompt
    const selectedSystemPrompt = questionPrompts[index];
//	console.log('handleQuestionClick', selectedSystemPrompt, question);
    handleSubmit(null, question, question);
	const action = 'question click';
	const actionSource = 'agent_2';
	const questionSource = 'quick question';
	const answer = null;
    context_logUserInteraction(question, answer, questionSource, action, actionSource);
	  
	  
	  
  };	
	
	

  const bufferRef = useRef('');	
  const handleSubmit = async (event, prompt = null, input = userInput, questionID = null) => {
    if (event) event.preventDefault();
	  
	// RESET TOPIC QUESTIONS
	context_setConvoTop("");
	setAIgentQuickQuestion(null);

	if (prompt == null) {
		const action = 'user question';
		const actionSource = 'user';
		const questionSource = 'agent_2';
		const answer = null;

		context_logUserInteraction(userInput, answer, questionSource, action, actionSource);
	}
	  
	  
    const question = input || userInput;
    let effectivePrompt = prompt || userInput;
    const qID = questionID || "";
	const questionSource = context_ContextQuestionOrigin || 'NA';

	  
	  
	  
    setIsLoading(true);
    setIsCancelled(false); // Reset cancel status
	  
	  
	  
    // Check if `context_context` exists, and update the prompt accordingly
    if (context_context) {
    }
	  


    if (!question.trim()) {
      setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Please enter a question." }]);
      setIsLoading(false);
      return;
    }

    setMessages(prevMessages => [...prevMessages, { user: "User", text: question }]);
	if (!isModal){
		const userQuestion = { user: 'User', text: question };
		context_updateChatHistory(chat_type, userQuestion);
	}
    setUserInput("");

    // Initialize AbortController to allow canceling
    const controller = new AbortController();
    controllerRef.current = controller; // Store reference to the controller

    try {
      const payload = {
        user_question: question.trim(),
        system_prompt: effectivePrompt,
        question_id: qID,
        question_origin: questionSource,
		assistant_id: listingJson.assistant.assistant_id_OAI,
		listing_id: listingJson.assistant.listing_id,
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
			  if (!isModal){
			    context_updateChatHistory(chat_type, aiResponse);
				const question = userInput;
				const action = 'aigent response';
				const actionSource = 'agent_2';
				const questionSource = null;
				const answer = JSON.stringify(aiResponse);
				context_logUserInteraction(question, answer, questionSource, action, actionSource, prompt);
				  
			  }
			  
            return;
          }			
			
			
          const chunk = decoder.decode(value, { stream: true });
		  bufferRef.current += chunk; // Append chunk to the local buffer
		  ENTIRE_RESPONSE += chunk;

		  // JSON Detection and Processing
		  if (waiting_for_json) {
			console.log('Waiting for JSON - NEW CODE');
			const [before, cleanedBuffer] = bufferRef.current.split("```json", 2);  
			console.log('cleanedBuffer', cleanedBuffer);
			  
			if (cleanedBuffer && cleanedBuffer.includes("```")) {
				console.log('Cleaned Buffer includes ```');
				bufferRef.current = cleanedBuffer;
				
				// Split the JSON part from the remaining text
				const [jsonPart, remaining] = cleanedBuffer.split("```", 2);

				console.log('jsonPart:', jsonPart.trim());
				console.log('remaining:', remaining);
				

			  // Process the extracted JSON
			  try {
				const cleanedJson = jsonPart.trim();
				console.log('cleanedJson', cleanedJson);
				const extractedJson = JSON.parse(cleanedJson);

			    // Extract data from JSON
			    const { convotop, suggested_questions: suggestedQuestions = [], binary_responses: binaryResponses } = extractedJson;

			    // Add Yes/No at the beginning if binary_responses is "yes"
			    let updatedQuestions = [...suggestedQuestions];
			    if (binaryResponses && binaryResponses.toLowerCase() === "yes") {
				  updatedQuestions = ["Yes", "No", ...suggestedQuestions];
			    }


			    // Update context and state with extracted data
			    if (convotop) {
			 	  console.log("Updating Context -> Convotop:", convotop);
				  context_setConvoTop(convotop);
				  fetchQuestions();
			    }

			    if (updatedQuestions.length > 0) {
			 	  console.log("Updating Quick Questions -> updatedQuestions:", updatedQuestions);
				  setAIgentQuickQuestion(
				    updatedQuestions.map((question) => ({
					  quick_question: question,
					  source: 'OWQQ',
				    }))
				  );
			    }				  
				  
			  } catch (err) {
				console.error("Error parsing JSON:", err);
			  }

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
		    let contentBefore = splitParts[0]; // Content before the first backtick
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

			// Update the chat with the error message
			const errorMessage = error.message || "An unexpected error occurred while processing the response.";
			setMessages((prevMessages) => [
			  ...prevMessages,
			  { user: "AIgent", text: errorMessage },
			]);
			setErrorMessage(errorMessage); // Optionally set the error in the state
		  }
		};
			
			
      reader.read().then(processText);

	  } catch (error) {
		if (error.name === 'AbortError') {
		  // Handle request cancellation
		  setMessages((prevMessages) => [
			...prevMessages,
			{ user: "AIgent", text: "Request canceled by the user." },
		  ]);
		} else {
		  console.error("Error fetching data: ", error);

		  // Display the error in the chat window
		  const errorMessage = "Failed to connect to the server. Please try again later.";
		  setMessages((prevMessages) => [
			...prevMessages,
			{ user: "AIgent", text: errorMessage },
		  ]);
		  setErrorMessage(error.message || errorMessage); // Set detailed error message if available
		}

		setIsLoading(false);
	  }		
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
	
	
	
  const removeTrailingBracket = (message) => {
    // Check if the message ends with a "]" and remove it if it does
    if (message.endsWith(']')) {
      return message.slice(0, -1).trim(); // Remove the last character and trim any extra spaces
    }
    return message;
  };	
	
	
  	const cancelResponse = async () => {
		const question = context_systemPrompt;
	  	const action = 'user response canceled';
		const actionSource = 'agent_2';
		const questionSource = null;
		const answer = null;
    	context_logUserInteraction(question, answer, questionSource, action, actionSource);
	  
	  
    	setIsCancelled(true); // Set cancel status
    	setIsLoading(false);  // Stop the loading state
    	if (controllerRef.current) {
      		controllerRef.current.abort(); // Abort the fetch request
    	}
  	};
	
    useEffect(() => {
		if (chat_type == "home") {
			setMessages(context_homeChatHist);
		} else if (chat_type == "agent") {
			setMessages(context_agentChatHist);
		
		} else if (chat_type == "town") {
			setMessages(context_townChatHist);
		}
    }, [context_homeChatHist, context_agentChatHist, context_townChatHist]);	
	

  return (
    <div 
      className={`${styles.AigentContainer} ${isModal ? styles.AigentContainerModal : ''}`} 
	  style={{ position: 'relative' }} 
	>
	  {/* Clipboard Icon */}
	  <div 
		className={styles.clipboardIconContainer} 
		title="Copy chat to clipboard"
	  >
		<FontAwesomeIcon
		  icon={faClipboard}
		  className={styles.clipboardIcon}
		  onClick={copyChatToClipboard}
		/>
	  </div>

      {/* Add Cancel Button */}
      <div 
        className={`${styles.AigentchatbotContainer} ${isModal ? styles.AigentchatbotContainerModal : ''}`} 
      >	  
	  
        <div 
          className={`${styles.AigentchatLog} ${isModal ? styles.AigentchatLogModal : ''}`} 
          ref={chatLogRef}
 		  style={{ maxHeight }} 
 		  style={{ minHeight }} 
        >	  
          {messages.map((message, index) => (
            <div key={index} className={styles.AigentmessageContainer}>
              {/* Only display the user label if showLabels is true */}
              {showLabels && (
                <strong>{message.user}:</strong>
              )}

              {/* Conditionally render the message text: 
                  Show the text unless showLabels is false and message.user is "User" */}
              {!(showLabels === false && message.user === "User") && (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              )}
            </div>
          ))}
          {/* Scroll Button */}
          <div className={styles.AigentscrollButtonContainer}>
            <button onClick={handleScrollToBottom} className={styles.AigentscrollButton} style={{ display: showScrollButton ? 'block' : 'none' }}>
              v
            </button>
          </div>

        </div>


        {/* Only show the below sections if `showFull` is true */}
        {showFull && (
          <>
			{/* Quick Question Carousel */}
			<div className={styles.AigentquickQuestionContainer}>
			  <div className={styles.AigentarrowContainer} onClick={handlePrevious}>←</div>

			  <div className={styles.AigentquestionCarousel}>
			    {getVisibleQuestions().map((question, index) => (
				  <div
					key={index}
					className={`${styles.AigentquestionItem} ${index === 0 ? styles.AigenthighlightedQuestion : ''} ${
	  					question.source === 'CONVOTOP' 
						  ? styles.CONVOTOPBackground 
						  : question.source === 'SITE_LOCATION' 
						  ? styles.SITELOCATIONBackground 
						  : question.source === 'OWQQ' 
						  ? styles.OWQQBackground 
						  : ''
					  }`}
					  onClick={() => handleQuestionClick(question.quick_question, index)}
					>
					{question.quick_question}
				  </div>
				))}
		      </div>

			  <div className={styles.AigentarrowContainer} onClick={handleNext}>→</div>
			</div>

			<form onSubmit={handleSubmit} className={styles.AigentinputForm}>
			  <input
				type="text"
				className={styles.AigentinputField}
				value={userInput}
				onChange={(e) => setUserInput(e.target.value)}
				placeholder="Type your question..."
				onFocus={collapseCarousel}
			  />
			  {isLoading ? (
				<button onClick={cancelResponse} className={styles.AigentcancelButton}>✕</button>

			  ) : (
				<button type="submit" className={styles.AigentsubmitButton}>
				  ➤
				</button>
			  )}

			</form>
          </>
        )}
      </div>
    </div>
  );
};

export default Aigent_2;

