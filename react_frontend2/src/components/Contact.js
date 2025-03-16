import React, { useState } from "react";
import LeaveQuestionComponent from "./LeaveQuestionComponent"; 
import CalendarContainer from "./CalendarContainer"; 
import styles from "../styles/Contact.module.css";

const ContactComponent = ({ agentPhone, agentEmail, handleUserSelection }) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleBackClick = () => {
    setShowQuestionForm(false);
    setShowCalendar(false); // Go back to contact page
  };
	
  const availableTimes = {
    '2024-09-23': ['10:00 AM', '2:00 PM'],
    '2024-09-24': ['9:00 AM', '1:00 PM'],
    '2024-09-25': ['12:00 PM', '3:00 PM'],
  };	

  const handleSubmit = (data) => {
    console.log("Submitted Data:", data);
    // Process the submitted question data (e.g., send it to a server)
  };

  if (showQuestionForm) {
    return (
      <LeaveQuestionComponent
        handleBackClick={handleBackClick}
        handleSubmit={handleSubmit}
      />
    );
  }

if (showCalendar) {
  return (
    <CalendarContainer
      availableTimes={availableTimes}  
      agentEmail={agentEmail}          
      handleBackClick={handleBackClick} 
    />
  );
}
  return (
    <div className={styles.contactContainer}>
      <button
        className={styles.contactButton}
        onClick={() => handleUserSelection("phone")}
      >
        <a href={`tel:${agentPhone}`}>Call Agent: {agentPhone}</a>
      </button>

      <button
        className={styles.contactButton}
        onClick={() => handleUserSelection("email")}
      >
        <a href={`mailto:${agentEmail}`}>Email Agent: {agentEmail}</a>
      </button>

      {/* Button for Scheduling a Meeting */}
      <button
        className={styles.contactButton}
        onClick={() => setShowCalendar(true)} // Show calendar
      >
        Schedule a Meeting
      </button>

      <button
        className={styles.contactButton}
        onClick={() => setShowQuestionForm(true)}
      >
        Leave a Question
      </button>
    </div>
  );
};

export default ContactComponent;
