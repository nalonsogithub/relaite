import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
//import styles from '../styles/Aigent.module.css';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import Slider from 'react-slick';
import styles from '../styles/SummaryView.module.css';

const SummaryView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const { chatLog, addMessageToChatLog, initialQuestion, setQuestion, assistantName, setAssistant } = useChat();
  const navigate = useNavigate();
  const defaultQuestions = [
    'What is the process of buying a home?',
    'How can I apply for a mortgage?',
    'What are the latest market trends?',
    'What are the latest market trends?',
    'What are the latest market trends?',
    'What are the latest market trends?'
  ];
  const defaultQuestionPrompts = defaultQuestions;
  const [isSwiping, setIsSwiping] = useState(false);
  const sliderRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [questionPrompts, setQuestionPrompts] = useState([]);

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div className={className} style={{ ...style, display: 'block', background: '#4a6fa5', color: 'white', right: '5px' }} onClick={onClick} />
    );
  };

  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div className={className} style={{ ...style, display: 'block', background: '#4a6fa5', color: 'white', left: '5px' }} onClick={onClick} />
    );
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    swipeToSlide: true,
    variableWidth: true,
    focusOnSelect: false,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    afterChange: function (current) {
      setCurrentIndex(current); // Update the current index after any change
    }
  };

  useEffect(() => {
    const initialIndex = defaultQuestions.indexOf(initialQuestion);
    if (initialIndex >= 0) {
      sliderRef.current.slickGoTo(initialIndex);
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (initialQuestion) {
      console.log(`Talking to: ${assistantName}`);
      console.log(`initialQuestion to: ${initialQuestion}`);
      setUserInput(initialQuestion);
      handleSubmit(null, initialQuestion); // Pass initialQuestion directly to handleSubmit
      setQuestion('');
    }
  }, [initialQuestion, assistantName]);

  const handleQuestionClick = async (index) => {
    const selectedQuestion = questions[index];
    const selectedPrompt = questionPrompts[index];
    setUserInput(selectedPrompt); 
    setCurrentIndex(index); 

    // Call handleSubmit to send the question_prompt to the server
    await handleSubmit(null, selectedPrompt);
  };

  const handleSubmit = async (event, input = userInput) => {
    if (event) event.preventDefault(); // Only call preventDefault if event is provided

    const question = input || userInput;
    setIsLoading(true);

    if (!question.trim()) {
      console.error('Input is empty or invalid');
      const errorMessage = { user: 'Bot', text: 'Please enter a question.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
      return;
    }

    const newMessage = { user: 'User', text: question };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput(''); // Clear the input after submission

    try {
      const payload = {
        user_question: question.trim(),
        assistant_name: assistantName
      };

      const response = await fetch('/api/ask_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // Buffer to accumulate partial messages

      const processText = async ({ done, value }) => {
        if (done) {
          setIsLoading(false);

          if (buffer.trim()) {
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage.user === 'Bot') {
                const updatedMessage = { ...lastMessage, text: lastMessage.text + buffer };
                return [...prevMessages.slice(0, -1), updatedMessage];
              } else {
                const botReply = { user: 'Bot', text: buffer };
                return [...prevMessages, botReply];
              }
            });
            buffer = ''; // Clear the buffer
          }

//          await fetchQuestions();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.user === 'Bot') {
            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
            return [...prevMessages.slice(0, -1), updatedMessage];
          } else {
            const botReply = { user: 'Bot', text: chunk };
            return [...prevMessages, botReply];
          }
        });

        return reader.read().then(processText);
      };

      reader.read().then(processText);
    } catch (error) {
      const errorMessage = {
        user: 'Aigent',
        text: 'Failed to connect to the server.'
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleSaveAsPDF = () => {
    fetch('/api/save_summary_as_pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'summary.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error('Error generating PDF:', error));
  };


//  const fetchQuestions = async () => {
//    try {
//      const response = await fetch('/api/get_question_for_site_location', {
//        method: 'GET',
//        headers: { 'Content-Type': 'application/json' }
//      });
//
//      const data = await response.json();
//      const questionList = data.map((q) => q.question);
//      setQuestions(questionList);
//
//      const questionPromptList = data.map((q) => q.question_prompt);
//      setQuestionPrompts(questionPromptList);
//    } catch (error) {
//      console.error('Error fetching questions:', error);
//    }
//  };
//
//  const handleMouseDown = () => {
//    setIsSwiping(false);
//  };

  const handleMouseUp = () => {
    if (isSwiping) {
      setIsSwiping(false);
    }
  };

  return (
    <div className={styles.SummaryAigentContainer}>
      <div className={styles.headerContainer}>
        <h1>Summary</h1>
      </div>
	  <div className={styles.buttonContainer}>
        <button onClick={() => navigate('/carousel')} className={styles.backButton}>Back to Carousel</button>
        <button onClick={handleSaveAsPDF} className={styles.saveButton}>Save as PDF</button>
      </div>
      <div className={styles.letterContainer}>
          {messages
            .filter((message) => message.user !== 'User')
            .map((message, index) => (
              <p key={index}>{message.text}</p>
            ))}		  
      </div>
    </div>	  
  );
};

export default SummaryView;
