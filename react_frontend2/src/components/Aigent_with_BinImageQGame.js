import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Aigent_with_BinImageQGame.module.css';
import { useSwipeable } from 'react-swipeable';
import { useChat } from '../contexts/ChatContext';

const Aigent_with_BinImageQGame = ({ collapseCarousel, showFull = true, isModal = false, showLabels = true }) => {
  const [imageDescription, setImageDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false); // Track if streaming is cancelled
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
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
    context_questionId, 
    context_setQuestionId, 
    context_showUser, 
    context_setShowUser,  // Add setter for showUser
    context_showAgent, 
    context_setShowAgent, // Add setter for showAgent
    context_context, 
    context_setContext    // Add setter for context_context
  } = useChat();

  useEffect(() => {
    // Only trigger if system prompt is available
    if (context_systemPrompt) {

      // Call handleSubmit with the necessary context values
      handleSubmit(null, context_systemPrompt, context_userPrompt, context_questionId);

      // Reset context variables (except chatLog)
      context_setSystemPrompt("");
      context_setUserPrompt("");
      context_setQuestionId("");
      context_setShowUser(true);
      context_setShowAgent(true);
	  context_setContext("");
    }
  }, [context_systemPrompt, context_userPrompt, context_questionId]);

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

  // QUICK QUESTIONS
  // Limit the number of questions visible in the carousel
  const visibleQuestionCount = 3; // Only show 3 questions at a time
	
  // Quick question carousel state
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  // State for questions and system prompts
  const [questions, setQuestions] = useState([]); // Will hold the fetched questions
  const [questionPrompts, setQuestionPrompts] = useState([]); // Will hold the system prompts

  // Fetch questions from Flask API
const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/get_quick_questions?sl=${context_siteLocation}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      console.log("Fetched questions:", data);

      // Process the questions data
      const questionList = data.map(q => q.quick_question);
      setQuestions(questionList);

      const questionPromptList = data.map(q => q.quick_question_system_prompt);
      setQuestionPrompts(questionPromptList);

    } catch (error) {
      console.error("Error fetching questions:", error);
    }
};

	// Use useEffect to fetch questions on component mount
//  useEffect(() => {
//    fetchQuestions(); 
//  }, []); 


  const handleNext = () => {
    setVisibleStartIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const handlePrevious = () => {
    setVisibleStartIndex((prevIndex) => (prevIndex === 0 ? questions.length - 1 : prevIndex - 1));
  };
	
	

  const getVisibleQuestions = () => {
    const endSlice = questions.slice(visibleStartIndex, visibleStartIndex + visibleQuestionCount);
    const remainingItems = visibleStartIndex + visibleQuestionCount > questions.length 
      ? questions.slice(0, (visibleStartIndex + visibleQuestionCount) % questions.length) 
      : [];
    return [...endSlice, ...remainingItems];
  };	
	

	
	
//  const handleQuestionClick = (question) => {
//    setUserInput(question);
//  };	
	
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });
  // END QUICK QUESTIONS
	
const handleQuestionClick = (question, index) => {
  // Add the user question to the chat log
  setMessages(prevMessages => [
    ...prevMessages, 
    { user: "User", text: question }
  ]);

  // Set the user input with the clicked question
  setUserInput(question);

  // Trigger handleSubmit with the corresponding system prompt
  const selectedSystemPrompt = questionPrompts[index];
  handleSubmit(null, selectedSystemPrompt, question);
};	
	
	

const handleSubmit = async (event, prompt = null, input = userInput, questionID = null) => {
    if (event) event.preventDefault();

    const question = input || userInput;
    const effectivePrompt = prompt || userInput;
    const qID = questionID || "";

    setIsLoading(true);
    setIsCancelled(false); // Reset cancel status

    if (!question.trim()) {
      setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Please enter a question." }]);
      setIsLoading(false);
      return;
    }

    setMessages(prevMessages => [...prevMessages, { user: "User", text: question }]);
    setUserInput("");

    // Initialize AbortController to allow canceling
    const controller = new AbortController();
    controllerRef.current = controller; // Store reference to the controller

    try {
      const payload = {
        user_question: question.trim(),
        system_prompt: effectivePrompt,
        question_id: qID,
      };

      const response = await fetch("/api/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal // Attach the abort controller signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processText = async ({ done, value }) => {
        try {
          if (done || isCancelled) {
            setIsLoading(false);
            if (buffer.trim()) {
              setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage.user === "AIgent") {
                  return [...prevMessages.slice(0, -1), { ...lastMessage, text: lastMessage.text + buffer }];
                } else {
                  return [...prevMessages, { user: "AIgent", text: buffer }];
                }
              });
              buffer = '';
            }
            // Only call fetchQuestions after the stream is fully processed (done is true)
            if (done) {
              console.log('Fetching updated questions');
              fetchQuestions();
            }
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          setMessages(prevMessages => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.user === "AIgent") {
              return [...prevMessages.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunk }];
            } else {
              return [...prevMessages, { user: "AIgent", text: chunk }];
            }
          });

          return reader.read().then(processText);
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log("Stream has been aborted");
            return;
          } else {
            console.error("Error during reading stream: ", err);
            throw err;  // Re-throw other errors
          }
        }
      };

      reader.read().then(processText);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Fetch request was aborted");
      } else {
        console.error("Error fetching data: ", error);
        setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Failed to connect to the server." }]);
      }

      setIsLoading(false);
    }
};

  const cancelResponse = async () => {
    setIsCancelled(true); // Set cancel status
    setIsLoading(false);  // Stop the loading state
    if (controllerRef.current) {
      controllerRef.current.abort(); // Abort the fetch request
      console.log("Fetch request aborted");
    }
  };

  return (
    <div 
      className={`${styles.AigentContainer} ${isModal ? styles.AigentContainerModal : ''}`} 
	>
      {/* Add Cancel Button */}
      <div 
        className={`${styles.chatbotContainer} ${isModal ? styles.chatbotContainerModal : ''}`} 
      >	  
	  
        <div 
          className={`${styles.chatLog} ${isModal ? styles.chatLogModal : ''}`} 
          ref={chatLogRef}
        >	  
          {messages.map((message, index) => (
            <div key={index} >
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
          <div className={styles.scrollButtonContainer}>
            <button onClick={handleScrollToBottom} className={styles.scrollButton} style={{ display: showScrollButton ? 'block' : 'none' }}>
              v
            </button>
          </div>

        </div>


        {/* Only show the below sections if `showFull` is true */}
        {showFull && (
          <>
			{/* Quick Question Carousel */}
			<div className={styles.quickQuestionContainer}>
			  <div className={styles.arrowContainer} onClick={handlePrevious}>←</div>

			  <div className={styles.questionCarousel}>
				{getVisibleQuestions().map((question, index) => (
				  <div
					key={index}
					className={`${styles.questionItem} ${index === 0 ? styles.highlightedQuestion : ''}`}
					onClick={() => handleQuestionClick(question, visibleStartIndex + index)} 
				  >
					{question}
				  </div>
				))}			  
			  </div>

			  <div className={styles.arrowContainer} onClick={handleNext}>→</div>
			</div>

			<form onSubmit={handleSubmit} className={styles.inputForm}>
			  <input
				type="text"
				className={styles.inputField}
				value={userInput}
				onChange={(e) => setUserInput(e.target.value)}
				placeholder="Type your question..."
				onFocus={collapseCarousel}
			  />
			  {isLoading ? (
				<button onClick={cancelResponse} className={styles.cancelButton}>✕</button>

			  ) : (
				<button type="submit" className={styles.submitButton}>
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

export default Aigent_with_BinImageQGame;
