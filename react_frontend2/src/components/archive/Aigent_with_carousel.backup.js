import { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import styles from '../styles/Aigent_with_carousel.module.css';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LoadingOverlay from '../components/LoadingOverlay';
import Slider from "react-slick";
import ReactMarkdown from 'react-markdown';
import { useImages } from '../contexts/CarouselImageContext';



const Aigent_with_carousel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const { chatLog, addMessageToChatLog, initialQuestion, setQuestion, assistantName , setAssistant } = useChat();
  const navigate = useNavigate(); // for navigating back to Welcome
  const defaultQuestions = ["What is the process of buying a home?", "How can I apply for a mortgage?", "What are the latest market trends?", "What are the latest market trends?", "What are the latest market trends?", "What are the latest market trends?"];	
  const defaultQuestionPrompts = defaultQuestions;
  const [isSwiping, setIsSwiping] = useState(false);
  const sliderRef = useRef(null);			
  const [questions, setQuestions] = useState([]);
  const [questionPrompts, setQuestionPrompts] = useState([]);
  const chatLogRef = useRef(null);
  const [isCleaned, setIsCleaned] = useState(false);
  const { images } = useImages();
	
  const SampleNextArrow = (props) => {
    const { className, onClick } = props;
    return <div className={`${className} ${styles.nextArrow}`} onClick={onClick} />;
  };

  const SamplePrevArrow = (props) => {
    const { className, onClick } = props;
    return <div className={`${className} ${styles.prevArrow}`} onClick={onClick} />;
  };

	
	
  const settings = {
      dots: true, 
      infinite: false,  // Disable infinite swiping
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1, 
      centerMode: false, 
      swipeToSlide: true,
      variableWidth: true,
      focusOnSelect: false,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,	  
      afterChange: function(current) {
          setCurrentIndex(current); // Update the current index after any change
      }
  };
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // For testing purposes, set the image URL
//    setImageUrl('https://hbbreact.blob.core.windows.net/hbbblob2/After.HouseFront.png');
  }, []);

  useEffect(() => {
      // Assuming initialQuestion is the question to focus on initially
      const initialIndex = defaultQuestions.indexOf(initialQuestion);
      if (initialIndex >= 0) {
          sliderRef.slickGoTo(initialIndex);
      }
  }, [initialQuestion]);
	
  useEffect(() => {
      if (initialQuestion) {
          console.log(`Talking to: ${assistantName}`);
          setUserInput(initialQuestion);  
		  console.log('FROM USEEFFECT initialQuestion', initialQuestion)

          handleSubmit(null, initialQuestion);  // Pass initialQuestion directly to handleSubmit
          setQuestion("");  
		  
      }
  }, [initialQuestion, assistantName]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

const handleQuestionClick = async (index) => {
	console.log('questions[index]', questions[index], 'questionPrompts[index]', questionPrompts[index]);
    const selectedQuestion = questions[index];
    const selectedPrompt =  questionPrompts[index];
    setUserInput(selectedPrompt);  // Set the input field to the question_prompt
    setCurrentIndex(index);  // Update the current index

    // Call handleSubmit to send the question_prompt to the server
    await handleSubmit(null, selectedPrompt);
};


	
const handleSubmit = async (event, input = userInput) => {
    if (event) event.preventDefault();  // Only call preventDefault if event is provided

    const question = input || userInput;
	const userPrompt = question
//    const activeImage = images[currentIndex];
//    const userPrompt = activeImage ? activeImage.userPrompt : '';
//    console.log('handleSubmit activeImage', activeImage);
//    console.log('handleSubmit USERINPUT', question);
//    console.log('handleSubmit UserPrompt:', userPrompt);  // Log the userPrompt to verify it's being passed
    setIsLoading(true);

    if (!question.trim()) {
        console.error("Input is empty or invalid");
        const errorMessage = { user: "Bot", text: "Please enter a question." };
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
            user_prompt: userPrompt.trim(),
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
                        if (lastMessage.user === "Bot") {
                            const updatedMessage = { ...lastMessage, text: lastMessage.text + buffer };
                            return [...prevMessages.slice(0, -1), updatedMessage];
                        } else {
                            const botReply = { user: "Bot", text: buffer };
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
            // Log the received chunk
//            console.log("Received chunk:", chunk);

            // Update the last message in real-time
            setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage.user === "Bot") {
                    const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
                    return [...prevMessages.slice(0, -1), updatedMessage];
                } else {
                    const botReply = { user: "Bot", text: chunk };
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

        // Map the data to extract the 'question' field
        const questionList = data.map(q => q.question);
        setQuestions(questionList);
		
        // Map the data to extract the 'question' field
        const questionPromptList = data.map(q => q.question_prompt);
		console.log('fetch questionPromptList', questionPromptList)
        setQuestionPrompts(questionPromptList);
		
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
};

  // Add onMouseDown and onMouseUp to detect swipes more effectively
  const handleMouseDown = () => {
      setIsSwiping(false);  // Assume it's not a swipe initially
  };

  const handleMouseUp = () => {
      if (isSwiping) {
          setIsSwiping(false);  // Reset after determining it was a swipe
      }
  };	

  // useEffect to clean the chat log
  useEffect(() => {
    if (messages.length > 0 && !isCleaned) {
	  console.log('IN IS CLEANED')
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
				{imageUrl && (
				  <div className={styles.imageContainer}>
					<img src={imageUrl} alt="Chatbot" className={styles.chatbotImage} />
				  </div>
				)}				
                <div className={styles.chatLog} ref={chatLogRef}>
                    {messages.map((message, index) => (
					<div key={index}>
					  <strong>{message.user}:</strong>
					  <ReactMarkdown>{message.text}</ReactMarkdown>
					</div>
                    ))}
                </div>
                <div className={styles.questionsBar}>
                    <Slider ref={sliderRef} {...settings}>
                        {questions.map((question, index) => (
                            <div key={index} className={styles.questionSlide}>
                                <button onClick={() => handleQuestionClick(index)} className={styles.questionButton}>
                                    {question}
                                </button>
                            </div>
                        ))}
                    </Slider>
                </div>
                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <input
                        type="text"
                        className={styles.inputField}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your question..."
                    />
                    <button type="submit" className={styles.submitButton}>➤</button>
                </form>
            </div>
        </div>		
		
	);
	
};

export default Aigent_with_carousel;
