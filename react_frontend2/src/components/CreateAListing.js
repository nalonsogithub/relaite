import React, { useState } from 'react';
import styles from '../styles/CreateAListing.module.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const CreateAListing = ({ onNext }) => {
  const [currentView, setCurrentView] = useState('assistant');
  const [assistantId, setAssistantId] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [copyStatus, setCopyStatus] = useState(''); // Track copy status for each button
  const [assistantName, setAssistantName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // New state variables for Step 2: Listing Details
  const [primaryLogo, setPrimaryLogo] = useState(null);
  const [primaryLogoDescription, setPrimaryLogoDescription] = useState('');
  const [primaryLogoPreview, setPrimaryLogoPreview] = useState('');

  const [secondaryLogo, setSecondaryLogo] = useState(null);
  const [secondaryLogoDescription, setSecondaryLogoDescription] = useState('');
  const [secondaryLogoPreview, setSecondaryLogoPreview] = useState('');
	
  const [agentImage, setAgentImage] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [agentImagePreview, setAgentImagePreview] = useState('');
  const [agentDescription, setAgentDescription] = useState('');

  const [houseImage, setHouseImage] = useState(null);
  const [houseDescription, setHouseDescription] = useState('');
  const [houseImagePreview, setHouseImagePreview] = useState('');	
  const [houseAddress, setHouseAddress] = useState('');
	
  const [logo1, setLogo1] = useState(null);
  const [logo1Description, setLogo1Description] = useState('');
  const [logo2, setLogo2] = useState(null);
  const [logo2Description, setLogo2Description] = useState('');
  const [listingDescription, setListingDescription] = useState('');
  const [listingAddress, setListingAddress] = useState('');
  const [listingId, setListingId] = useState('');  

  // UPSET DICTIONARY
  const [listingData, setListingData] = useState({
    t_hbb_listing: {},
    t_hbb_listing_agent: {},
    t_hbb_image: [],
    t_hbb_listing_agent_logo: []
  });	
	


  // Function to update data for a specific table
  const updateTableData = (table, newData) => {
	console.log('updateTableData: table, newData', table, newData, listingData);
    setListingData((prevData) => ({
      ...prevData,
      [table]: newData
    }));
  };	
	
	
	
  // Function to handle assistant verification
  const handleVerifyAssistant = async () => {
    try {
	    console.log('assistantId', assistantId);
        const response = await axios.post(
          '/api/verify_assistant',
          { assistant_name: assistantId },  // Pass assistantName directly as JSON
          { headers: { 'Content-Type': 'application/json' } }  // Explicitly set JSON headers
        );

        if (response.data.success) {
          setAssistantId(response.data.assistant_id); // Store assistant ID
          setErrorMessage(''); // Clear any error messages
          setCurrentView('listingDetails'); // Move to the next view
        } else {
          setErrorMessage(response.data.message); // Show the error message
        }
      } catch (error) {
        setErrorMessage('An error occurred during verification. Please try again.');
      }
    };	
	
  // Handle the Next button click
  const handleNext = () => {
    if (assistantId) {
      onNext(assistantId);
    } else {
      alert('Please enter the Assistant ID.');
    }
  };

  // Copy to Clipboard Handler
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(''), 2000); // Reset status after 2 seconds
    });
  };

	
  // Handle image selection and preview
  // Function to update image state and listingData
  const handleImageChange = (e, setImage, setPreview, imageType, description = '') => {
    const file = e.target.files[0];
	console.log('handleImageChange file', file);

    if (file) {
      // Step 1: Set the image file and generate preview
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Step 2: Update `listingData` with file and preview
      const newImageEntry = {
        image_id: uuidv4(), // Unique ID for the image
        image_file_name: sanitizeFileName(file.name), // Use sanitized file name
        image_url: previewUrl, // Use preview URL
        image_description: description, // Description (if provided)
        file: file // Keep the file object for future upload
      };

      // Step 3: Update the specific `imageType` in `listingData`
      setListingData((prevData) => ({
        ...prevData,
        t_hbb_image: [...prevData.t_hbb_image, newImageEntry]
      }));
    }
  };
	
//  const handleImageChange = (e, setImage, setPreview) => {
//    const file = e.target.files[0];
//  
//    if (file) {
//      setImage(file); 
//      const previewUrl = URL.createObjectURL(file); 
//      setPreview(previewUrl); 
//    }
//  };	
	
	
  // Function to validate form fields
  const validateFields = () => {
    if (!assistantId) {
      setErrorMessage('Please enter the Assistant ID.');
      return false;
    }
    if (!primaryLogo) {
      setErrorMessage('Please upload a primary logo.');
      return false;
    }
    if (!primaryLogoDescription) {
      setErrorMessage('Please provide a description for the primary logo.');
      return false;
    }
    if (!agentImage) {
      setErrorMessage('Please upload an agent image.');
      return false;
    }
    if (!agentName) {
      setErrorMessage('Please enter the agent name.');
      return false;
    }
    if (!agentDescription) {
      setErrorMessage('Please provide an agent description.');
      return false;
    }
    if (!houseImage) {
      setErrorMessage('Please upload a house image.');
      return false;
    }
    if (!houseDescription) {
      setErrorMessage('Please provide a description for the house.');
      return false;
    }
    if (!houseAddress) {
      setErrorMessage('Please enter the house address.');
      return false;
    }
    return true;
  };
	
	
	
  // Create a debug function to log FormData
  const logFormData = (formData) => {
    const formDataEntries = {};
    formData.forEach((value, key) => {
      formDataEntries[key] = value instanceof File ? value.name : value;
    });
    console.log('Form Data Entries:', formDataEntries);
    return formDataEntries;
  };
	
  const sanitizeFileName = (fileName) => {
    return fileName.replace(/\s+/g, '_'); // Replace spaces with underscores
  };	
	
//  const handleCreateListing = async () => {
//    // Validate fields before proceeding
//    if (!validateFields()) {
//      return; // Stop if validation fails
//    }
//
//    // Step 1: Construct the `listingData` dictionary for database insertion
//    const newListingData = {
//      t_hbb_listing: {
//        listing_id: uuidv4(), // Example unique listing ID
//        listing_description: houseDescription,
//        listing_address: houseAddress,
//        assistant_id: assistantId
//      },
//      t_hbb_listing_agent: {
//        agent_id: uuidv4(), // Example unique agent ID
//        listing_agent_name: agentName,
//        listing_agent_description: agentDescription
//      },
//      t_hbb_image: [
//        {
//          image_id: uuidv4(),
//          image_file_name: sanitizeFileName(primaryLogo?.name) || '',
//         image_url: primaryLogoPreview,
//          image_description: primaryLogoDescription  
//        },
//        {
//          image_id: uuidv4(),
//          image_file_name: sanitizeFileName(secondaryLogo?.name) || '',
//          image_url: secondaryLogoPreview,
//          image_description: secondaryLogoDescription
//        },
//        {
//          image_id: uuidv4(),
//          image_file_name: sanitizeFileName(agentImage?.name) || '',
//          image_url: agentImagePreview,
//          image_description: agentDescription
//        },
//        {
//          image_id: uuidv4(),
//          image_file_name: sanitizeFileName(houseImage?.name) || '',
//          image_url: houseImagePreview,
//          image_description: houseDescription
//        }
//      ],
//      t_hbb_listing_agent_logo: [
//        {
//          listing_agent_logo_id: uuidv4(),
//          logo_image_id: uuidv4(),
//          logo_description: primaryLogoDescription
//        },
//          secondaryLogo ? {
//          listing_agent_logo_id: uuidv4(),
//          logo_image_id: uuidv4(),
//          logo_description: secondaryLogoDescription
//        } : null
//      ].filter(Boolean) // Remove empty entries if secondaryLogo is not provided
//    };
//
//    setListingData(newListingData); // Update the listingData state
//
//    // Step 2: Prepare form data to send to the backend
//    const formData = new FormData();
//    formData.append('listing_data', JSON.stringify(newListingData));
//
//    // Append images for uploading
//    formData.append('primary_logo', primaryLogo);
//    formData.append('secondary_logo', secondaryLogo);
//    formData.append('agent_image', agentImage);
//    formData.append('house_image', houseImage);
//
//	console.log('FORM DATA', logFormData(formData));
//    setCurrentView('createCarousel'); // Move to the next view
//
//  };

  // Construct the listing data before uploading or moving to the next step
  const handleCreateListing = async () => {
    // Validate fields before proceeding
    if (!validateFields()) return;

    const newListingData = {
      ...listingData,
      t_hbb_listing: {
        listing_id: uuidv4(),
        listing_description: houseDescription,
        listing_address: houseAddress,
        assistant_id: assistantId
      },
      t_hbb_listing_agent: {
        agent_id: uuidv4(),
        listing_agent_name: agentName,
        listing_agent_description: agentDescription
      },
      t_hbb_listing_agent_logo: [
        {
          listing_agent_logo_id: uuidv4(),
          logo_image_id: uuidv4(),
          logo_description: primaryLogoDescription
        },
        secondaryLogo ? {
          listing_agent_logo_id: uuidv4(),
          logo_image_id: uuidv4(),
          logo_description: secondaryLogoDescription
        } : null
      ].filter(Boolean) // Remove empty entries if secondaryLogo is not provided
    };

    setListingData(newListingData);

    const formData = new FormData();
    formData.append('listing_data', JSON.stringify(newListingData));

    // Append images for uploading using file objects stored in `listingData`
    newListingData.t_hbb_image.forEach((image) => {
      formData.append(image.image_file_name, image.file);
    });

    console.log('FORM DATA:', logFormData(formData));
    setCurrentView('carousel');
  };	
	
  const instructionsText = `
Open House AIgent Instruction Set:
Role:
You are a real estate Listing Agent hosting an open house. Your goal is to have an engaging, 2-way conversation with the user while gathering useful data and providing information that encourages the user to follow up. You should inquire what the user was told or saw online about the property that intrigued them enough to visit today. Be inquisitive, slightly humorous, and always professional.

General Guidelines:
Primary Goals:

Engage in meaningful dialogue and gather relevant information for decision-making.
Provide beneficial details to the user to encourage further discussion or follow-up.
Keep your responses brief and to the point.
Ask One Question at a Time:
Keep the flow simple by only posing one question per interaction.

End Every Interaction with a Question:
Always close each message with a question to keep the conversation progressing.

Appointment Inquiries:
Periodically ask the user if they would like to schedule an appointment or follow-up call with the listing agent. If they say yes, ask for their meeting preferences and let them know you will contact the agent on their behalf.

Discussion Topics:

Information About the Home – Present key facts and features of the property.
Renovation Possibilities – Discuss potential renovation projects, including the user’s thoughts, likes, and dislikes.
Listing Agent Information – Inquire about the user’s relationship with a realtor and provide relevant agent information. Help determine the best follow-up action.
Conversation Topic Instructions:
IMPORTANT:
At the end of every response, include a Conversation Topic in exactly the following format:
[CONVOTOP: {location}]

DO NOT MAKE UP A CONVOTOP. Use only the topics listed below.
Always include a CONVOTOP in every response to systematically track the conversation stage.
If you are uncertain of the current location in the conversation, always provide the default: [CONVOTOP: default].
List of Conversation Topics:
[CONVOTOP: default] – Use this if you are unsure of the conversation’s location or if the user’s inquiry is vague.
Example: If the user asks a general or unclear question.

[CONVOTOP: help] – Use this when the user seems confused, frustrated, or requires assistance.
Example: “I don’t understand this,” or “Can you help me?”

[CONVOTOP: property-details] – When the user asks about specific features of the property (e.g., rooms, floor plans, square footage, amenities).
Example: “Does this house have a backyard?” or “How many bedrooms?”

[CONVOTOP: pricing] – When the user inquires about the price of the home, taxes, or other financial information.
Example: “What’s the price of this property?” or “What are the closing costs?”

[CONVOTOP: neighborhood] – When the user asks about the local area, schools, transportation, or amenities.
Example: “What’s the neighborhood like?” or “Are there good schools nearby?”

[CONVOTOP: schedule-viewing] – When the user expresses interest in scheduling a visit or virtual tour of the property.
Example: “Can I schedule a viewing?”

[CONVOTOP: agent-contact] – When the user asks to speak with the agent or requests contact information.
Example: “Can I talk to the agent?” or “What’s the agent’s email?”

[CONVOTOP: buying-process] – When the user asks about how to make an offer, the steps in purchasing the home, or closing procedures.
Example: “How do I make an offer?” or “What’s the buying process like?”

[CONVOTOP: mortgage-info] – When the user inquires about mortgage options, down payments, or financing.
Example: “What are the financing options?” or “Can I get a mortgage?”

[CONVOTOP: documents] – When the user requests access to legal documents, floor plans, or disclosures related to the property.
Example: “Can I get the floor plans?” or “Do you have any disclosures for this house?”

[CONVOTOP: comparison] – When the user wants to compare multiple properties or features.
Example: “How does this house compare to the one on Elm Street?”

Additional Reminders:
Always include the appropriate [CONVOTOP] to help track the conversation and guide future interactions.
If the user asks questions covering multiple topics, prioritize the most relevant topic for the CONVOTOP.
Keep your responses conversational, professional, and engaging.  
`; // This is a placeholder; replace with your longer text

  const sampleText = `
Bathroom Renovation Ideas:

Low Cost:

Replace lighting fixtures with modern, energy-efficient LED lights ($50-$150).
Apply a fresh coat of paint to the vanity and cabinets ($100-$200).
Replace cabinet knobs with contemporary hardware ($20-$50).
Medium Cost:

Install a new countertop with a modern material like quartz or granite ($300-$600).
Replace the sink with a more contemporary design ($150-$300).
Update the toilet to a more water-efficient model ($200-$400).
High Cost:

Redo the tile work with modern, large-format tiles ($800-$1,500).
Install a frameless glass shower enclosure ($1,000-$2,500).
Upgrade the vanity to a custom-built piece with integrated lighting and storage ($1,500-$3,000).
`; // This is a placeholder; replace with your longer sample text

  return (
    <div className={styles.pageContainer}>
      <div className={styles.createListingBox}>
		  {currentView === 'assistant' && (
          <>
	  
			<h2>Create a New Listing - Step 1 Verify OpenAI Assistant</h2>
			<p className={styles.step1_instructionText}>
			  Before creating a listing, you need to set up an OpenAI assistant with a vector store containing relevant documents.
			</p>

			{/* Action Buttons */}
			<div className={styles.step1_buttonRow}>
			  <button onClick={() => setShowInstructions(true)} className={styles.step1_viewButton}>
				View Instructions
			  </button>
			  <button onClick={() => setShowExample(true)} className={styles.step1_viewButton}>
				View Sample Texts
			  </button>
			</div>

			{/* Input Field for Assistant ID */}
			<div className={styles.step1_inputContainer}>
			  <label htmlFor="assistantId" className={styles.step1_inputLabel}>Assistant ID:</label>
			  <input
				type="text"
				id="assistantId"
				value={assistantId}
				onChange={(e) => setAssistantId(e.target.value)}
				className={styles.step1_inputField}
				placeholder="Enter Assistant ID"
			  />
			</div>

			{/* Display error message if verification fails */}
			{errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

			  <div className={styles.buttonRow}>
				<button onClick={handleVerifyAssistant} className={styles.nextButton}>
				   Next
				</button>
			  </div>
          </>			 
		)}

        {/* Listing Details View */}
        {currentView === 'listingDetails' && (
          <>
            <h2>Create a New Listing - Step 2: Listing Details</h2>
            <p><strong>Assistant ID:</strong> {assistantId}</p>

            {/* Primary Logo Section */}
            <div className={styles.step2_sectionBox}>
              <h3>Primary Logo</h3>
              <input
                type="file"
                accept="image/*"
				onChange={(e) => handleImageChange(e, setPrimaryLogo, setPrimaryLogoPreview, 'primaryLogo')}			
              /><br/>
              {primaryLogo && <img src={primaryLogoPreview} alt="Primary Logo" className={styles.step2_logoPreview} />}
              <textarea
                placeholder="Logo Image Description"
                value={primaryLogoDescription}
                onChange={(e) => setPrimaryLogoDescription(e.target.value)}
                className={styles.step2_textArea}
              />
            </div>

            {/* Secondary Logo Section */}
            <div className={styles.step2_sectionBox}>
              <h3>Secondary Logo</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setSecondaryLogo, setSecondaryLogoPreview)}
              /><br/>
              {secondaryLogo && <img src={secondaryLogoPreview} alt="Secondary Logo" className={styles.step2_logoPreview} />}<br/>
              <textarea
                placeholder="Secondary Logo Description"
                value={secondaryLogoDescription}
                onChange={(e) => setSecondaryLogoDescription(e.target.value)}
                className={styles.step2_textArea}
              />
            </div>

            {/* Agent Image Section */}
            <div className={styles.step2_sectionBox}>
              <h3>Agent Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setAgentImage, setAgentImagePreview)}
              /><br/>
              {agentImage && <img src={agentImagePreview} alt="Agent" className={styles.step2_agentPreview} />}<br/>
              <input
                type="text"
                placeholder="Agent Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className={styles.step2_inputField}
              /><br/>
              <textarea
                placeholder="Agent Description"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                className={styles.step2_textArea}
              />
            </div>

            {/* House Image Section */}
            <div className={styles.step2_sectionBox}>
              <h3>House Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setHouseImage, setHouseImagePreview)}
              />
              {houseImage && <img src={houseImagePreview} alt="House" className={styles.step2_housePreview} />}<br/>
              <textarea
                placeholder="Listing Description"
                value={houseDescription}
                onChange={(e) => setHouseDescription(e.target.value)}
                className={styles.step2_textArea}
              /><br/>
              <input
                type="text"
                placeholder="Listing Address"
                value={houseAddress}
                onChange={(e) => setHouseAddress(e.target.value)}
                className={styles.step2_inputField}
              />
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.nextButton} onClick={handleCreateListing}>
                Next Step
              </button>
            </div>
          </>
        )}
		
		{currentView === 'carousel' && (
           <>
	  
			<h2>Create a New Listing - Step 1 Verify OpenAI Assistant</h2>
			<p className={styles.step1_instructionText}>
			  Before creating a listing, you need to set up an OpenAI assistant with a vector store containing relevant documents.
			</p>

			{/* Action Buttons */}
			<div className={styles.step1_buttonRow}>
			  <button onClick={() => setShowInstructions(true)} className={styles.step1_viewButton}>
				View Instructions
			  </button>
			  <button onClick={() => setShowExample(true)} className={styles.step1_viewButton}>
				View Sample Texts
			  </button>
			</div>

			{/* Input Field for Assistant ID */}
			<div className={styles.step1_inputContainer}>
			  <label htmlFor="assistantId" className={styles.step1_inputLabel}>Assistant ID:</label>
			  <input
				type="text"
				id="assistantId"
				value={assistantId}
				onChange={(e) => setAssistantId(e.target.value)}
				className={styles.step1_inputField}
				placeholder="Enter Assistant ID"
			  />
			</div>

			{/* Display error message if verification fails */}
			{errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

			  <div className={styles.buttonRow}>
				<button onClick={handleVerifyAssistant} className={styles.nextButton}>
				   Next
				</button>
			  </div>
          </>			 
	  )}


		
        {/* Instructions Modal */}
        {showInstructions && (
          <div className={styles.step1_modalOverlay}>
            <div className={styles.step1_modalContent}>
              <h3>Assistant Setup Instructions</h3>
              <div className={styles.step1_textContainer}>
                <button
                  onClick={() => handleCopy(instructionsText, 'instructions')}
                  className={`${styles.step1_copyButton} ${copyStatus === 'instructions' && styles.step1_copied}`}
                >
                  {copyStatus === 'instructions' ? 'Copied' : 'Copy Text'}
                </button>
                <pre className={styles.step1_modalPreformatted}>
                  {instructionsText}
                </pre>
              </div>
              <button onClick={() => setShowInstructions(false)} className={styles.step1_closeButton}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Sample Texts Modal */}
        {showExample && (
          <div className={styles.step1_modalOverlay}>
            <div className={styles.step1_modalContent}>
              <h3>Sample Text Files for Vector Store</h3>
              <div className={styles.step1_textContainer}>
                <button
                  onClick={() => handleCopy(sampleText, 'sample')}
                  className={`${styles.step1_copyButton} ${copyStatus === 'sample' && styles.step1_copied}`}
                >
                  {copyStatus === 'sample' ? 'Copied' : 'Copy Text'}
                </button>
                <pre className={styles.step1_modalPreformatted}>
                  {sampleText}
                </pre>
              </div>
              <button onClick={() => setShowExample(false)} className={styles.step1_closeButton}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAListing;
