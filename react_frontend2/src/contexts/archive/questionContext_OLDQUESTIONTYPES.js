import React, { createContext, useContext, useState, useEffect } from 'react';

const QuestionContext = createContext();

export const useQuestions = () => useContext(QuestionContext);

export const QuestionProvider = ({ children, questionType }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        fetch(`/api/get_information_questions?type=${questionType}`)
            .then(response => response.json())
            .then(data => {
                const parsedQuestions = data.map(q => ({
                    ...q,
                    answer_list: JSON.parse(q.answer_list)
                }));
                setQuestions(parsedQuestions);
            });
    }, [questionType]);

    const handleAnswerSelect = (question, answer) => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            alert('Thank you for your time. You have completed the questionnaire!');
        }
    };

    return (
        <QuestionContext.Provider value={{ questions, currentQuestionIndex, handleAnswerSelect }}>
            {children}
        </QuestionContext.Provider>
    );
};
