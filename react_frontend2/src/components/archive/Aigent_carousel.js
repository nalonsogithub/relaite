import { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import styles from '../styles/Aigent.module.css';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LoadingOverlay from '../components/LoadingOverlay';
import Slider from "react-slick";

const Aigent = () => {
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
	
  const SampleNextArrow = (props) => {
      const { className, style, onClick } = props;
      return (
          <div
              className={className}
              style={{ ...style, display: "block", background: '#4a6fa5', color: "white", right: "5px" }}
              onClick={onClick}
          />
      );
  };

  const SamplePrevArrow = (props) => {
      const { className, style, onClick } = props;
      return (
          <div
              className={className}
              style={{ ...style, display: "block", background: '#4a6fa5', color: "white", left: "5px"  }}
              onClick={onClick}
          />
      );
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
      // Assuming `initialQuestion` is the question to focus on initially
      const initialIndex = defaultQuestions.indexOf(initialQuestion);
      if (initialIndex >= 0) {
          sliderRef.slickGoTo(initialIndex);
      }
  }, [initialQuestion]);
	
  useEffect(() => {
      if (initialQuestion) {
          console.log(`Talking to: ${assistantName}`);
          setUserInput(initialQuestion);  
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
    console.log('USERINPUT', question);
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

const QuestionBarContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  @media (max-width: 768px) { /* Adjust this value based on what you consider 'mobile' */
      .slick-arrow {
          display: none;
      }
  }
  .slick-arrow {
      z-index: 10;
      top: 50%; /* Align vertically */
      transform: translateY(-50%);
      -webkit-transform: translateY(-50%);
      cursor: pointer;
      border: none;
      background: transparent;

      width: 30px; /* Set width for better control */
      height: 30px; /* Set height for better control */
      border: none;
      cursor: pointer;
      background-color: blue;
      color: white;
      font-size: 16px; /* Adjust as necessary */
      line-height: 30px; /* Align text vertically */
      text-align: center; /* Align text horizontally */

  }

  /* Specific to your styled component or wherever the slider is used */
  .slick-prev {
      left: -40px; /* Adjust based on your needs */
  }

  .slick-next {
      right: -40px; /* Adjust based on your needs */
  }

  .slick-slide {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding: 0 10px; // Adjust padding to control spacing
    min-width: 160px; // Increase min-width if needed
  }

  .slick-track {
    display: flex;
    align-items: center;
  }

  .slick-list {
    overflow: hidden;
  }
`;

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
            <div className={styles.headerContainer}>
                <h1>AIgent Chatbot</h1>
            </div>
            <div className={styles.backbuttonContainer}>
                <button onClick={() => navigate('/carousel')} className={styles.backButton}>Back to Carousel</button>
            </div>
            <div className={styles.chatbotContainer}>
				{imageUrl && (
				  <div className={styles.imageContainer}>
					<img src={imageUrl} alt="Chatbot" className={styles.chatbotImage} />
				  </div>
				)}				
                <div className={styles.chatLog} ref={chatLogRef}>
                    {messages.map((message, index) => (
                        <p key={index}><strong>{message.user}:</strong> {message.text}</p>
                    ))}
                </div>
                <div className={styles.questionsBar}>
                    <Slider ref={sliderRef} {...settings}>
                        {questions.map((question, index) => (
                            <div key={index} style={{ width: 'auto', padding: '0 10px' }}>
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

export default Aigent;
