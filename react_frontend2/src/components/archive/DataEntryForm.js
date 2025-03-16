import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 500px; /* Adjust based on your preference */
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
`;

const DataEntryForm = () => {
  const [listing, setListing] = useState({
    listingDescription: '',
    listingImagePath: '',
    agentName: '',
    agentDescription: '',
    agentLogoPath: '',
    conversationCode: '',
    conversationDescription: '',
    documentPath: '',
    documentDescription: '',
    instructionDescription: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setListing({ ...listing, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Here you would send data to your Flask API
    console.log(listing);
    // axios.post('your-api-endpoint', listing);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Input type="text" name="listingDescription" placeholder="Listing Description" onChange={handleInputChange} />
        <Input type="file" name="listingImagePath" placeholder="Listing Image Path" onChange={handleInputChange} />
        <Input type="text" name="agentName" placeholder="Agent Name" onChange={handleInputChange} />
        <TextArea name="agentDescription" placeholder="Agent Description" onChange={handleInputChange} />
        {/* Add inputs for all fields similarly */}
        <Button type="submit">Submit Data</Button>
      </Form>
    </Container>
  );
};

export default DataEntryForm;
