import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/SummaryView.module.css';

const SummaryView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const { chatLog, addMessageToChatLog, initialQuestion, setQuestion, assistantName, setAssistant, isLoading, setIsLoading, carouselType, setCarouselType } = useChat();
  const navigate = useNavigate();
  const chatLogRef = useRef(null);
  const [isCleaned, setIsCleaned] = useState(false);
  const [currentDate, setCurrentDate] = useState('');


  useEffect(() => {
    const today = new Date();
    const date = today.toLocaleDateString();
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    if (initialQuestion) {
//      console.log(`Talking to: ${assistantName}`);
      setUserInput(initialQuestion);
//      console.log('initialQuestion', initialQuestion);
      handleSubmit(null, initialQuestion);
      setQuestion("");
    }
  }, [initialQuestion, assistantName]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event, input = userInput) => {
    if (isLoading) return;
    if (event) event.preventDefault();

    const question = input || userInput;

    if (!question.trim()) {
      const errorMessage = { user: "Bot", text: "Please enter a question." };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
      return;
    }

    const newMessage = { user: "User", text: question };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setUserInput("");
    setIsLoading(true);

    const userPrompt = 'BLA';
    try {
      const payload = {
        user_question: question.trim(),
        user_prompt: userPrompt,
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
        if (done) {
          setIsLoading(false);
          if (buffer.trim()) {
            setMessages(prevMessages => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage?.user === "Aigent") {
                const updatedMessage = { ...lastMessage, text: lastMessage.text + buffer };
                return [...prevMessages.slice(0, -1), updatedMessage];
              } else {
                const botReply = { user: "Aigent", text: buffer };
                return [...prevMessages, botReply];
              }
            });
            buffer = '';
          }
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        setIsCleaned(false);

        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.user === "Bot") {
            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
            return [...prevMessages.slice(0, -1), updatedMessage];
          } else {
            const botReply = { user: "Bot", text: chunk };
            return [...prevMessages, botReply];
          }
        });

        return reader.read().then(processText);
      };

      reader.read().then(processText);

    } catch (error) {
      const errorMessage = {
        user: "Aigent",
        text: "Failed to connect to the server."
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && !isCleaned) {
      const cleanedMessages = messages
        .map(message => {
          if (message && message.text) {
            return { ...message, text: message.text.replace(/\[SITE_LOCATION: (.*?)\]/g, '').replace(/^Aigent: /, '') };
          }
          return message;
        })
        .filter(message => message?.user === 'Bot'); // Only keep bot messages
      setMessages(cleanedMessages);
      setIsCleaned(true);
    }
  }, [messages, isCleaned]);
				
  const handleBackToCarousel = () => {
	setAssistant('main');
    setCarouselType('main');
    navigate('/WrapperMainSiteCarousel');
  };
				
  const getMessageJSON = () => {
    const jsonMessage = JSON.stringify(messages.map((message, index) => ({
      id: index,
      user: message.user,
      text: message.text
    })));
    console.log("JSON message to be sent:", jsonMessage);
    return jsonMessage;
  };				

  return (
    <div className={styles.SummaryContainer}>
      <div className={styles.summaryHeaderContainer}>
        <h1>Summary</h1>
      </div>

				
      <div className={styles.buttonContainer}>
        <button onClick={handleBackToCarousel} className={styles.smallButton}>Back to Carousel</button>
        <form action="/api/save_summary_as_pdf" method="POST" style={{ display: 'inline' }}>
          <input type="hidden" name="message" value={getMessageJSON()} />
          <button type="submit" className={styles.smallButton}>Save as PDF</button>
        </form>
      </div>				
	  
      <div className={styles.chatbotContainer}>
        <div className={styles.summary} ref={chatLogRef}>
          {messages.map((message, index) => (
            <div key={index} className={styles.message}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
