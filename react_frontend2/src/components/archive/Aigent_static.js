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
  const [isSwiping, setIsSwiping] = useState(false);
  const sliderRef = useRef(null);			
  const [questions, setQuestions] = useState([]);

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
      handleSubmit(null, initialQuestion, assistantName);  
      setQuestion("");  
    }
  }, [initialQuestion, assistantName]);  
  const handleQuestionClick = async (index) => {
      if (isSwiping) {
          setIsSwiping(false);  // Reset the swiping flag
          return;  // Ignore the click because it was part of a swipe
      }

      const selectedQuestion = questions[index];
      setUserInput(selectedQuestion);  // Set the input field to the question
      setCurrentIndex(index);  // Update the current index

      // Call handleSubmit to send the question to the server
      // Since handleSubmit expects 'event' as the first argument which can be null,
      // ensure to pass 'null' when programmatically submitting
      await handleSubmit(null, selectedQuestion, assistantName);
  };	
	
  const handleSubmit = async (event, input = userInput, assistant = assistantName) => {
    if (event) event.preventDefault();  // Only call preventDefault if event is provided

    console.log('USERINPUT', input, 'ASSISTANT', assistant);
	setIsLoading(true);

    if (!input.trim()) {
        console.error("Input is empty or invalid");
        const errorMessage = { user: "Bot", text: "Please enter a question." };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
		setIsLoading(false);
        return;
    }

    const newMessage = { user: "User", text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setUserInput(""); // Clear the input after submission

    try {
        const payload = {
            user_question: input.trim(),
            assistant_name: assistant
        };
		console.log('Sending payload:', payload); 
        const response = await axios.post('/api/ask', payload);
        console.log('response', response.data);

        if (response.data && response.data.questions) {
//            setQuestions(response.data.questions.map(q => q.question_text));  // Update questions from the response
			setQuestions(response.data.questions)
        }		
		
        const responseData = response.data;
        if (responseData && responseData.message) {
            const botReply = { user: "Bot", text: responseData.message };
            setMessages(prevMessages => [...prevMessages, botReply]);
        } else {
            console.error("No message provided in response");
            const errorMessage = { user: "Bot", text: "No message received from server." };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        const errorMessage = {
            user: "Aigent",
            text: error.response ? (error.response.data.error || "Failed to fetch response.") : "Failed to connect to the server."
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);  // Hide the loading overlay after processing is complete
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
	
	return (
	  <div className={styles.AigentContainer}>
		{isLoading && <LoadingOverlay />}
		<div className={styles.headerContainer}>
		  <h1>AIgent Chatbot</h1>
		</div>
		<div className={styles.backbuttonContainer}>
		  <button onClick={() => navigate('/carousel')} className={styles.backButton}>Back to Carousel</button>
		
		</div>
		<div className={styles.chatbotContainer}>
		  <div className={styles.chatLog}>
			{messages.map((message, index) => (
			  <p key={index}><strong>{message.user}:</strong> {message.text}</p>
			))}
		  </div>
          <div className={styles.questionsBar}>
			<QuestionBarContainer>

				<Slider ref={sliderRef} {...settings}>
					{questions.map((question, index) => (
						<div key={index} style={{ width: 'auto', padding: '0 10px' }}>
							<button onClick={() => handleQuestionClick(index)} className={styles.questionButton}>
								{question}
							</button>
						</div>
					))}
				</Slider>

			</QuestionBarContainer>
          </div>
          <form onSubmit={(event) => handleSubmit(event, userInput, assistantName)} className={styles.inputForm}>
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
