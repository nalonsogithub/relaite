import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/Aigent_with_carousel.module.css';
import { useChat } from '../contexts/ChatContext';
import RenderBinImageQGame from './RenderBinImageQGame'; // Import the RenderBinQGame component

const Aigent_with_BinImageQGame = ({ collapseCarousel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false); // Track if streaming is cancelled
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const { chatLog, addMessageToChatLog, initialQuestion, initialPrompt, setQuestion, assistantName, setAssistant } = useChat();
  const chatLogRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setUserInput(initialQuestion);
      handleSubmit(null, initialPrompt, initialQuestion);
      setQuestion("");  
      setAssistant("incoaigent");
    }
  }, [initialPrompt, initialQuestion, assistantName]);

  useEffect(() => {
    if (chatLogRef.current) {
      const isScrollable = chatLogRef.current.scrollHeight > chatLogRef.current.clientHeight;
      setShowScrollButton(isScrollable);
      chatLogRef.current.scrollTop = 0;
    }
  }, [messages]);

  const handleScrollToBottom = () => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  };

  const handleSubmit = async (event, prompt = null, input = userInput) => {
    if (event) event.preventDefault();

    const question = input || userInput;
    const effectivePrompt = prompt || userInput;

    setIsLoading(true);
    setIsCancelled(false); // Reset cancel status

    if (!question.trim()) {
      setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Please enter a question." }]);
      setIsLoading(false);
      return;
    }

    setMessages(prevMessages => [...prevMessages, { user: "User", text: question }]);
    setUserInput("");

    try {
      const payload = {
        user_question: question.trim(),
        user_prompt: effectivePrompt,
        assistant_name: assistantName
      };
      const response = await fetch("/api/ask_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processText = async ({ done, value }) => {
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
      };

      reader.read().then(processText);

    } catch (error) {
      setMessages(prevMessages => [...prevMessages, { user: "AIgent", text: "Failed to connect to the server." }]);
      setIsLoading(false);
    }
  };

  const cancelResponse = () => {
    setIsCancelled(true); // Set cancel status
    setIsLoading(false);  // Stop the loading state
  };

  return (
    <div className={styles.AigentContainer}>
      {/* Add Cancel Button */}
      {isLoading && (
        <div className={styles.overlay}>
          <button onClick={cancelResponse} className={styles.cancelButton}>✕</button>
        </div>
      )}
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
            v
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
      {/* Replace the carousel with RenderBinImageQGame */}
      <div className={styles.gameContainer}>
        <RenderBinImageQGame />
      </div>
    </div>
  );
};

export default Aigent_with_BinImageQGame;
