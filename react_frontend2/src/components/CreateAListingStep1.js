import React, { useState } from 'react';
import styles from '../styles/CreateAListing.module.css';

const CreateAListingStep1 = ({ onNext }) => {
  const [assistantId, setAssistantId] = useState('');

  const handleNext = () => {
    if (assistantId.trim() !== '') {
      onNext(assistantId); // Pass the assistant ID to the parent component
    } else {
      alert('Please enter the Assistant ID before proceeding.');
    }
  };

  return (
    <div className={styles.createListingContainer}>
      <div className={styles.instructionsBox}>
        <h2>Step 1: Create an OpenAI Assistant</h2>
        <p>
          Follow these steps to set up an assistant for your listing:
        </p>
        <ol className={styles.instructionList}>
          <li>
            <strong>Role Definition:</strong>  
            Create an assistant with the following role:  
            <em>"You are a real estate Listing Agent hosting an open house. Your goal is to have an engaging, 2-way conversation with the user while gathering useful data and providing information that encourages the user to follow up. You should inquire what the user was told or saw online about the property that intrigued them enough to visit today. Be inquisitive, slightly humorous, and always professional."</em>
          </li>
          <li>
            <strong>General Guidelines:</strong>  
            <ul>
              <li>Primary Goals: Engage in meaningful dialogue and gather relevant information for decision-making.</li>
              <li>Provide beneficial details to the user to encourage further discussion or follow-up.</li>
              <li>Keep your responses brief and to the point.</li>
            </ul>
          </li>
          <li>
            <strong>Setting Up a Vector Store:</strong> Create a vector store that contains text documents with the following information:
            <ul>
              <li>
                <strong>House Details:</strong> These are descriptions of the property’s features and unique aspects.  
                <span className={styles.linkText} onClick={() => alert('Sample House Details: \n\n"3-bedroom, 2-bathroom single-family home with an open floor plan, modern kitchen, and private backyard."')}>See Example</span>
              </li>
              <li>
                <strong>Neighborhood Details:</strong> Include information about the surrounding area, nearby amenities, transportation options, and points of interest.
              </li>
              <li>
                <strong>Agent Details:</strong> Details about the agent, their background, and supporting documents.
              </li>
              <li>
                <strong>Room Details:</strong> Create a text file for each image used in the Binary Question Image Game with a detailed description. Use the following prompt to generate room descriptions:
                <p>
                  <em>"I am building a vector store for a chatbot and need some details on this image. What do you see in the attached image?"</em>
                </p>
              </li>
              <li>
                <strong>Renovation Ideas:</strong> Provide low-cost, medium-cost, and high-cost renovation ideas for each room image.
                <p>
                  <em>"What low-cost, medium-cost, and high-cost renovation ideas do you have for the attached image?"</em>
                </p>
              </li>
            </ul>
          </li>
          <li>
            Once the assistant and vector store are configured, copy the **Assistant ID** and paste it into the field below.
          </li>
        </ol>
      </div>

      {/* Assistant ID Input */}
      <div className={styles.inputContainer}>
        <label htmlFor="assistantId" className={styles.inputLabel}>
          Assistant ID:
        </label>
        <input
          type="text"
          id="assistantId"
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
          className={styles.inputField}
          placeholder="Paste the Assistant ID here..."
        />
      </div>

      {/* Next Button */}
      <button className={styles.nextButton} onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default CreateAListingStep1;
