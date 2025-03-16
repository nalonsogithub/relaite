import React, { createContext, useContext, useState, useEffect } from 'react';

const QuestionContext = createContext();

export const useQuestions = () => useContext(QuestionContext);

export const QuestionProvider = ({ children, questionType }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        console.log('QuestionProvider useEffect triggered');
        console.log(`Fetching questions for type: ${questionType}`);
        
        fetch(`/api/get_information_questions?type=${questionType}`)
            .then(response => {
//                console.log('API response received');
                return response.json();
            })
            .then(data => {
//                console.log('Data received from API:', data);

                if (!data || data.length === 0) {
                    console.error('Invalid data structure:', data);
                    return;
                }

                const parsedQuestions = data.map(q => ({
                    question: q.question,
                    answers: JSON.parse(q.answers),
                    required_responses: q.required_responses,
                    thank_you_message: q.thank_you_message
                }));
//                console.log('Parsed questions:', parsedQuestions);
                setQuestions(parsedQuestions);
            })
            .catch(error => {
//                console.error('Error fetching questions:', error);
            });
    }, [questionType]);

    const handleAnswerSelect = (question, answer) => {
//        console.log(`Selected answer for question "${question}": ${answer}`);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
//            console.log('Moving to next question. Current index:', currentQuestionIndex + 1);
        } else {
//            console.log('Completed all questions.');
            alert('Thank you for your time. You have completed the questionnaire!');
        }
    };

    return (
        <QuestionContext.Provider value={{ questions, currentQuestionIndex, handleAnswerSelect }}>
            {children}
        </QuestionContext.Provider>
    );
};
