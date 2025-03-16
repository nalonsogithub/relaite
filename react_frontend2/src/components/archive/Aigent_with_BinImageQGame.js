import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Aigent_with_carousel.module.css';
import { useChat } from '../contexts/ChatContext';

const Aigent_with_BinImageQGame = ({ collapseCarousel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const { chatLog, addMessageToChatLog, initialQuestion, initialPrompt, setQuestion, assistantName, setAssistant } = useChat();
  const defaultQuestions = ["What is the process of buying a home?", "How can I apply for a mortgage?", "What are the latest market trends?"];
  const [questions, setQuestions] = useState(defaultQuestions);
  const [isSwiping, setIsSwiping] = useState(false);
  const sliderRef = useRef(null);
  const chatLogRef = useRef(null);
  const [isCleaned, setIsCleaned] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [siteLocation, setSiteLocation] = useState(null);
	const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
      if (initialQuestion) {
          setUserInput(initialQuestion);  
          handleSubmit(null, initialPrompt, initialQuestion);  // Pass initialQuestion directly to handleSubmit
          setQuestion("");  
		  setAssistant("incoaigent");
		  
      }
  }, [initialPrompt, initialQuestion, assistantName]);

  useEffect(() => {
    if (chatLogRef.current) {
      // Check if the chat log requires scrolling
      const isScrollable = chatLogRef.current.scrollHeight > chatLogRef.current.clientHeight;
      setShowScrollButton(isScrollable); // Show the scroll button only if scrolling is needed
      chatLogRef.current.scrollTop = 0; // Scroll to the top when new messages arrive
    }
  }, [messages]);	
	
	
  const handleScrollToBottom = () => {
    if (chatLogRef.current) {
      // Animate the scroll to the bottom
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: 'smooth' // Smooth scroll behavior
      });
      setShowScrollButton(false); // Hide the scroll button after scrolling to the bottom
    }
  };
	
	
  const handleSubmit = async (event, prompt = null, input = userInput) => {
    if (event) event.preventDefault();  // Only call preventDefault if event is provided


    const question = input || userInput;
	const effectivePrompt = prompt || userInput;
	
    setIsLoading(true);	
	
    if (!question.trim()) {
        console.error("Input is empty or invalid");
        const errorMessage = { user: "AIgent", text: "Please enter a question." };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setIsLoading(false);
        return;
    }

    const newMessage = { user: "User", text: question };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setUserInput(""); // Clear the input after submission
    try {
        const payload = {
            user_question: question.trim(),
            user_prompt: effectivePrompt,
            assistant_name: assistantName
        };
        console.log('Sending payload:', payload);

        const response = await fetch("/api/ask_stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';  // Buffer to accumulate partial messages

        const processText = async ({ done, value }) => {
            if (done) {
                console.log("Stream complete");
                setIsLoading(false);

                // Update the final message
                if (buffer.trim()) {
                    setMessages(prevMessages => {
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage.user === "AIgent") {
                            const updatedMessage = { ...lastMessage, text: lastMessage.text + buffer };
                            return [...prevMessages.slice(0, -1), updatedMessage];
                        } else {
                            const botReply = { user: "AIgent", text: buffer };
                            return [...prevMessages, botReply];
                        }
                    });
                    buffer = '';  // Clear the buffer
                }

                // Fetch questions after the stream is complete
                await fetchQuestions();
                return;
            }

            // Decode the current chunk and add it to the buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
			setIsCleaned(false);
			console.log('chunk', chunk);

            // Update the last message in real-time
            setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage.user === "AIgent") {
                    const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
                    return [...prevMessages.slice(0, -1), updatedMessage];
                } else {
                    const botReply = { user: "AIgent", text: chunk };
                    return [...prevMessages, botReply];
                }
            });

            // Read the next chunk
            return reader.read().then(processText);
        };

        // Start reading the stream
        reader.read().then(processText);

    } catch (error) {
        console.error("Error fetching data: ", error);
        const errorMessage = {
            user: "Aigent",
            text: "Failed to connect to the server."
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setIsLoading(false);
    }
};

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/get_question_for_site_location", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();
      console.log("Fetched questions:", data);

      const questionList = data.map(q => q.question);
      setQuestions(questionList);

      const questionPromptList = data.map(q => q.question_prompt);
      console.log('fetch questionPromptList', questionPromptList);

    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && !isCleaned) {
      console.log('IN IS CLEANED');
      const cleanedMessages = messages.map(message => {
        if (message && message.text) {
          return { ...message, text: message.text.replace(/\[SITE_LOCATION: (.*?)\]/g, '') };
        }
        return message;
      });
      setMessages(cleanedMessages);
      setIsCleaned(true);
    }
  }, [messages, isCleaned]);

  return (
    <div className={styles.AigentContainer}>
      {isLoading && <div className={styles.overlay}></div>}
      <div className={styles.chatbotContainer}>
        <div className={styles.chatLog} ref={chatLogRef}>
          {messages.map((message, index) => (
            <div key={index}>
              <strong>{message.user}:</strong>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ))}
        </div>
        {showScrollButton && (
          <button onClick={handleScrollToBottom} className={styles.scrollButton}>
            v {/* Changed text to a simple down arrow */}
          </button>
        )}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            className={styles.inputField}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your question..."
            onFocus={collapseCarousel}
          />
          <button type="submit" className={styles.submitButton}>➤</button>
        </form>
      </div>
    </div>
  );
};
export default Aigent_with_BinImageQGame;
