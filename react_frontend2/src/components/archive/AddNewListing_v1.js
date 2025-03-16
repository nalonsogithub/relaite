import React, { useState } from 'react';
import styled from 'styled-components';
import styles from '../styles/addlisting.module.css';

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ImagePreview = styled.img`
  height: 100px;
  width: auto;
  margin-top: 10px;
`;

const TextArea = styled.textarea`
  height: 100px;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
`;
const Button = styled.button`
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  width: 100%;
`;

const RemoveButton = styled(Button)`
  background-color: #dc3545;
`;

const AddNewListing = () => {
  const [listing, setListing] = useState({
    listingName: '',
    listingDescription: '',
    listingImagePath: '',
	carouselDescription: 'Default Descrption',
    imagePreviewUrl: null,
    agentLogo1: { imageUrl: '' },
    agentLogo2: { imageUrl: '' },
    conversationDetails: [],
    preFlowInstructions: 'You are a Real Estate consultant who is well connected in the industry and well versed in real estate sales, renovation, interior design and renovation mortgage lending.  You will take the user through a conversation about getting to know the real estate agent, details on the home, and some rennovation ideas.',
    postFlowInstructions: 'Your analyze the conversation and determine where the user is in the cnversation.  Below is a list of [SITE_LOCATION] and a description of what each one means. At the end of every response include a [SITE_LOCATION] like the following [SITE_LOCATION: {location} or ""Not Available" ].  DO NOT MAKE UP SITE LOCATION.',
	siteFlows: []
  });

const handleInputChange = (event) => {
  const { name, value, files } = event.target;
  console.log(`Field name: ${name}, Value: ${value}, Files: ${files ? 'Yes' : 'No'}`);	
  if (files && files[0]) {
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);

    if (name === 'listingImagePath') {
      setListing(prev => ({
        ...prev,
        imagePreviewUrl: imageUrl
      }));
      console.log(`Updated image preview URL: ${imageUrl}`);
    } else if (name.startsWith('agentLogo')) {
      setListing(prev => ({
        ...prev,
        [name]: { ...prev[name], imageUrl: imageUrl }
      }));
	  console.log(`Updated agent logo image for ${name}`);
    } else {
      // Handle nested image paths in conversation details
      const [prefix, index] = name.split('-');
      if (prefix === 'conversation_image_path') {
        const newDetails = [...listing.conversationDetails];
        newDetails[index].imagePath = imageUrl;
        setListing(prev => ({
          ...prev,
          conversationDetails: newDetails
        }));
      }
    }
    const parts = name.split('-');
    console.log(`Input parts: ${parts.join(', ')}`);

    if (parts.length === 2) {  // Handling fields formatted like "field-index"
      const [field, index] = parts;
      if (field === 'code' || field === 'order' || field === 'description' || field === 'startingQuestion') {
        const newDetails = [...listing.conversationDetails];
        newDetails[index][field] = value;
        setListing(prev => ({
          ...prev,
          conversationDetails: newDetails
        }));
        console.log(`Updated conversationDetails at index ${index}, field ${field} with value ${value}`);
      } else if (field.startsWith('site')) {
        // Assuming you have site-related fields managed similarly
        const newSiteFlows = [...listing.siteFlows];
        newSiteFlows[index][field] = value;
        setListing(prev => ({
          ...prev,
          siteFlows: newSiteFlows
        }));
        console.log(`Updated siteFlows at index ${index}, field ${field} with value ${value}`);
      }
    } else {
      // Update non-array fields directly
      setListing(prev => ({
        ...prev,
        [name]: value
      }));
      console.log(`Updated field ${name} with value ${value}`);
    }
  }};

  const addSiteFlow = () => {
    setListing(prev => ({
      ...prev,
      siteFlows: [...prev.siteFlows, { site_location: '', site_location_description: '', questions: [{ question: '', prompt: '' }] }]
    }));
  };

const addQuestionPromptPair = (flowIndex) => {
  const newSiteFlows = [...listing.siteFlows];
  newSiteFlows[flowIndex].questions.push({ question: '', prompt: '' });
  setListing(prev => ({
    ...prev,
    siteFlows: newSiteFlows
  }));
};

  const removeQuestionPromptPair = (flowIndex, questionIndex) => {
    let newSiteFlows = [...listing.siteFlows];
    newSiteFlows[flowIndex].questions.splice(questionIndex, 1);
    setListing({ ...listing, siteFlows: newSiteFlows });
  };

  const removeSiteFlow = (flowIndex) => {
    let newSiteFlows = listing.siteFlows.filter((_, i) => i !== flowIndex);
    setListing({ ...listing, siteFlows: newSiteFlows });
  };

	
  const addConversationDetail = () => {
    setListing(prev => ({
      ...prev,
      conversationDetails: [
        ...prev.conversationDetails,
        { code: '', order: '', description: '', imagePath: '', startingQuestion: '' }
      ]
    }));
  };


  const removeConversationDetail = (index) => {
    const filteredDetails = listing.conversationDetails.filter((_, i) => i !== index);
    setListing(prev => ({
      ...prev,
      conversationDetails: filteredDetails
    }));
  };
	
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(listing);
    // axios.post('your-api-endpoint', listing);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
	  
        {/* Listing Details Section */}
        <div className={styles.AddListingDetails}>
          <h1>Listing Details</h1>
          <Input type="text" name="listingName" placeholder="Listing Name" onChange={handleInputChange} />
          <Input type="text" name="listingDescription" placeholder="Listing Description" onChange={handleInputChange} />
          <Input type="file" name="listingImagePath" placeholder="Listing Image Path" onChange={handleInputChange} />
          {listing.imagePreviewUrl && <ImagePreview src={listing.imagePreviewUrl} alt="Image Preview" />}
        </div>

        {/* Agent Details Section */}
        <div className={styles.AddAgentDetails}>
          <h1>Agent Details</h1>
          <Input type="text" name="agentName" placeholder="Agent Name" onChange={handleInputChange} />
          <Input type="text" name="agentDescription" placeholder="Agent Description" onChange={handleInputChange} />
          <Input type="file" name="agentLogo1" onChange={handleInputChange} />
          {listing.agentLogo1.imageUrl && <ImagePreview src={listing.agentLogo1.imageUrl} alt="Agent Logo 1" />}
          <Input type="file" name="agentLogo2" onChange={handleInputChange} />
          {listing.agentLogo2.imageUrl && <ImagePreview src={listing.agentLogo2.imageUrl} alt="Agent Logo 2" />}
        </div>

        <div className={styles.AddListingDetails}>
          <h1>Carousel Details</h1>
          <Input type="text" name="carouselDescription" placeholder="Carousel Description" onChange={handleInputChange} />
        </div>
	  

        {/* Conversation Details Section */}
        <div>
          <h1>Conversation Details</h1>
          {listing.conversationDetails.map((item, index) => (
            <div key={index}>
              <Input type="text" name={`code-${index}`} value={item.code} placeholder="Conversation Code" onChange={handleInputChange} />
              <Input type="text" name={`order-${index}`} value={item.order} placeholder="Conversation Order" onChange={handleInputChange} />
              <Input type="text" name={`description-${index}`} value={item.description} placeholder="Conversation Description" onChange={handleInputChange} />
              <Input type="file" name={`conversation_image_path-${index}`} onChange={handleInputChange} />
              {item.imagePath && <ImagePreview src={item.imagePath} alt={`Conversation Image ${index}`} />}
              <Input type="text" name={`startingQuestion-${index}`} value={item.startingQuestion} placeholder="Starting Question" onChange={handleInputChange} />
              <RemoveButton type="button" onClick={() => removeConversationDetail(index)}>Remove</RemoveButton>
            </div>
          ))}
          <Button type="button" onClick={addConversationDetail}>Add Conversation Detail</Button>
        </div>	  
	  
	  
        {/* Conversation Flow Section */}
        <div>
          <h1>Conversation Flow</h1>
          <label>Pre-Flow Instructions</label>
          <TextArea name="preFlowInstructions" value={listing.preFlowInstructions} onChange={handleInputChange} />
          <label>Post-Flow Instructions</label>
          <TextArea name="postFlowInstructions" value={listing.postFlowInstructions} onChange={handleInputChange} />
        </div>



        {/* Site Flow Section */}
        <div>
          <h1>Site Flow</h1>
          {listing.siteFlows.map((flow, flowIndex) => (
            <div key={flowIndex}>
              <Input
                type="text"
                name={`site_location-${flowIndex}`}
                value={flow.site_location}
                placeholder="Site Location"
                onChange={handleInputChange}
              />
              <TextArea
                name={`site_location_description-${flowIndex}`}
                value={flow.site_location_description}
                placeholder="Site Location Description"
                onChange={handleInputChange}
              />
              {flow.questions.map((item, questionIndex) => (
                <div key={questionIndex}>
                  <Input
                    type="text"
                    name={`question-${flowIndex}-${questionIndex}`}
                    value={item.question}
                    placeholder="Question"
                    onChange={handleInputChange}
                  />
                  <Input
                    type="text"
                    name={`prompt-${flowIndex}-${questionIndex}`}
                    value={item.prompt}
                    placeholder="Question Prompt"
                    onChange={handleInputChange}
                  />
                  <RemoveButton type="button" onClick={() => removeQuestionPromptPair(flowIndex, questionIndex)}>Remove Q&P Pair</RemoveButton>
                </div>
              ))}
              <Button type="button" onClick={() => addQuestionPromptPair(flowIndex)}>Add Q&P Pair</Button>
              <RemoveButton type="button" onClick={() => removeSiteFlow(flowIndex)}>Remove Site Flow</RemoveButton>
            </div>
          ))}
          <Button type="button" onClick={addSiteFlow}>Add Site Flow</Button>
        </div>

        <Button type="submit">Submit Data</Button>
      </Form>
    </Container>
  );
};

export default AddNewListing;
