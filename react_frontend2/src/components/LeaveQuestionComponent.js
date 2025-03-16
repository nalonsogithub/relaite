import React, { useState } from "react";
import styles from "../styles/LeaveQuestionComponent.module.css"; // Import CSS module

const LeaveQuestionComponent = ({ handleBackClick, handleSubmit }) => {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const commonQuestions = [
    "What are the property taxes?",
    "Is the house still available?",
    "Can I schedule a tour?",
    "What is the neighborhood like?",
  ];

  const handleDropdownChange = (e) => {
    setQuestion(e.target.value); // Fill question input based on dropdown selection
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError(true); // Set error state if email is missing
      return;
    }
    setEmailError(false); // Clear error if validation passes
    // Send question and email data to the parent (or any API)
    handleSubmit({ email, question });
    setSubmitted(true); // Show confirmation message
  };

  if (submitted) {
    return (
      <div className={styles.confirmationContainer}>
        <p>Your message has been delivered!</p>
        <button onClick={handleBackClick}>Back to Contact</button>
      </div>
    );
  }

  return (
    <div className={styles.leaveQuestionContainer}>
      <div className={styles.header}>
        <span className={styles.backIcon} onClick={handleBackClick}>
          &#8592;
        </span>
        <h2>Leave your agent a question</h2>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.form}>
        <label htmlFor="common-questions">Common Questions:</label>
        <select
          id="common-questions"
          onChange={handleDropdownChange}
          className={styles.select}
        >
          <option value="">--Select a question--</option>
          {commonQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </select>

        <label htmlFor="email">Your Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`${styles.input} ${emailError ? styles.inputError : ""}`}
        />
        {emailError && (
          <p className={styles.errorMessage}>Email is required</p>
        )}

        <label htmlFor="question">Your Question:</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className={styles.textarea}
        />

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default LeaveQuestionComponent;
