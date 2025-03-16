import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Styled components
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f0f0;
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
`;

const TextArea = styled.textarea`
  width: 95%;
  height: 50px;
`;

const Input = styled.input`
  width: 95%;
`;

const ImagePreview = styled.img`
  height: 50px;
  width: auto;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
`;

const Heading = styled.h2`
  margin-top: 20px;
  color: #333;
`;

const AddNewListing = () => {
  const [formData, setFormData] = useState({
    listings: [{
      listing_description: '',
      listing_image_path: '',
      listing_image_preview: '',
      listing_assistant_name: '',
    }],	
    carousels: [{
      carousel_description: '', // Note: You might want to correct "coursel" to "carousel" if it's a typo
    }],
    agents: [{
      agent_name: '',
      agent_description: '',
      agent_logo_image_path_1: '',
      agent_logo_image_path_1_preview: '',
      agent_logo_image_path_2: '',
      agent_logo_image_path_2_preview: '',
    }],	  

	conversations: Array(5).fill({
      conversation_code_list: '',
      conversation_order: '',
      conversation_description_list: '',
      conversation_image_path_list: '',
      conversation_starting_question: ''
    }),
    documents: Array(5).fill({
      document_path_list: '',
      document_description_list: ''
    }),
    instructions: [{
      instruction_description: '',
      instruction_text: ''
    }],
    conversationFlows: [{
      flow_listing_code: '',
      flow_listing_description: ''
    }],
    siteLocations: Array(10).fill({
      site_location: '',
      site_location_description: '',
      question: '',
      question_prompt: ''
    }),
    flowInstructions: Array(1).fill({ 
      flow_pre_instruction: '',
      flow_post_instruction: ''
    })	  
  });


	// Handle text input changes for items within an array
	const handleArrayTextChange = (arrayName, index, fieldName, value) => {
	  setFormData(prev => ({
		...prev,
		[arrayName]: prev[arrayName].map((item, idx) => idx === index ? {...item, [fieldName]: value} : item)
	  }));
	};

	// Handle file input changes for items within an array
	const handleArrayFileChange = (arrayName, index, fieldName, file) => {
	  console.log('FILE', file.name);
	  const imageUrl = URL.createObjectURL(file);

	  setFormData(prev => ({
		...prev,
		[arrayName]: prev[arrayName].map((item, idx) => idx === index ? {
		  ...item,
		  [fieldName]: file.name,
		  [`${fieldName}_preview`]: imageUrl
		} : item)
	  }));
	};	
	
  // Handle text input changes
  const handleTextChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file input changes
  const handleFileChange = (field, file) => {
	console.log('FILE', file.name)
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      [field]: file.name,
      [`${field}_preview`]: imageUrl
    }));
  };	

  const [siteLocations, setSiteLocations] = useState(Array(5).fill({
    site_location: '',
    site_location_description: '',
    question: '',
    question_prompt: ''
  }));	
	
  const [flowInstructions, setFlowInstructions] = useState(Array(1).fill({
    flow_pre_instruction: '',
    flow_post_instruction: ''
  }));
	
  const handleInputChange = (section, index, field, value, file) => {
    const newSiteLocations = siteLocations.map((item, idx) => idx === index ? {...item, [field]: value} : item);
    setSiteLocations(newSiteLocations);	  
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, idx) => idx === index ? {...item, [field]: imageUrl} : item)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, idx) => idx === index ? {...item, [field]: value} : item)
      }));
    }
  };

  const handleAddRow = () => {
    const newRow = { site_location: '', site_location_description: '', question: '', question_prompt: '' };
    setSiteLocations([...siteLocations, newRow]);
  };

  const handleRemoveRow = index => {
    const newSiteLocations = siteLocations.filter((_, idx) => idx !== index);
    setSiteLocations(newSiteLocations);
  };	
	
const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
	  
    // Correctly determine the base URL based on the environment
    const baseUrl = window.location.hostname === 'localhost' ? 
        'http://localhost:5000/api' : 
        'https://hbb-zzz.azurewebsites.net/api';
	  
    try {
        const response = await axios.post(`${baseUrl}/add-new-listing`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Server response:', response.data);
    } catch (error) {
        console.error('Failed to send form data:', error);
    }
};
	
  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Heading>Listing Details</Heading>
        {/* Listing Details Section */}
      <Table>
        <thead>
          <tr>
            <th>Listing Description</th>
            <th>Listing Image Path</th>
            <th>Listing Assistant Name</th>
          </tr>
        </thead>
        <tbody>
  		  {formData.listings.map((listing, index) => (
			<tr key={index}>
  	  
              <td>
                <Input
                  type="text"
                  value={formData.listing_description}
	  	  		  onChange={e => handleArrayTextChange('listings', index, 'listing_description', e.target.value)}
                />
              </td>
              <td>
				  
              <Input
                type="file"
                onChange={e => handleArrayFileChange('listings', index, 'listing_image_path', e.target.files[0])}
              />
              {formData.listing_image_preview && (
                <ImagePreview src={formData.listing_image_preview} alt="Listing Preview" />
              )}
            </td>
            <td>
              <Input
                type="text"
                value={formData.listing_assistant_name}
	  			onChange={e => handleArrayTextChange('listings', index, 'listing_assistant_name', e.target.value)}
              />
            </td>
		  </tr>
		  ))}
		</tbody>
	  </Table>

      <Heading>Agent Details</Heading>
        {/* Listing Details Section */}
      <Table>
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Agent Description</th>
            <th>Agent Logo Image Path #1</th>
            <th>Agent Logo Image Path #2</th>
          </tr>
        </thead>
        <tbody>
  		  {formData.agents.map((agent, index) => (
			<tr key={index}>
              <td>
                <Input
                  type="text"
                  value={formData.agent_name}
	  	    		onChange={e => handleArrayTextChange('agents', index, 'agent_name', e.target.value)}
                />
              </td>
              <td>
                <Input
                  type="text"
                  value={formData.agent_description}
	  		  	  onChange={e => handleArrayTextChange('agents', index, 'agent_description', e.target.value)}
                />
              </td>
              <td>
                <Input
                  type="file"
                  onChange={e => handleArrayFileChange('agents', index, 'agent_logo_image_path_1', e.target.files[0])}
                />
                {formData.agent_logo_image_path_1_preview && (
                  <ImagePreview src={formData.agent_logo_image_path_1_preview} alt="Agent Logo 1 Preview" />
                )}
              </td>
              <td>
                <Input
                  type="file"
                  onChange={e => handleArrayFileChange('agents', index, 'agent_logo_image_path_2', e.target.files[0])}
                />
                {formData.agent_logo_image_path_2_preview && (
                  <ImagePreview src={formData.agent_logo_image_path_2_preview} alt="Agent Logo 2  Preview" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>


		<Heading>Conversations</Heading>
		{/* Conversations Section */}
		<Table>
		  <thead>
			<tr>
			  <th>Conversation Code List</th>
			  <th>Conversation Order</th>
			  <th>Conversation Description List</th>
			  <th>Conversation Image Path List</th>
			  <th>Conversation Starting Question</th>
			</tr>
		  </thead>
		  <tbody>
			{formData.conversations.map((conversation, index) => (
			  <tr key={index}>
				<td>
				  <Input 
					type="text" 
					value={conversation.conversation_code_list} 
					onChange={e => handleArrayTextChange('conversations', index, 'conversation_code_list', e.target.value)}
				  />
				</td>
				<td>
				  <Input 
					type="text" 
					value={conversation.conversation_order} 
					onChange={e => handleArrayTextChange('conversations', index, 'conversation_order', e.target.value)}
				  />
				</td>
				<td>
				  <Input 
					type="text" 
					value={conversation.conversation_description_list} 
					onChange={e => handleArrayTextChange('conversations', index, 'conversation_description_list', e.target.value)}
				  />
				</td>
				<td>
					
				  <Input 
					type="file" 
					onChange={e => handleArrayFileChange('conversations', 0, 'conversation_image_path_list', e.target.files[0])}
				  />
				  {conversation.conversation_image_path_list && (
					<ImagePreview src={conversation.conversation_image_path_list} alt="Conversation Image Preview" />
				  )}
				</td>
				<td>
				  <Input 
					type="text" 
					value={conversation.conversation_starting_question} 
					onChange={e => handleArrayTextChange('conversations', index, 'conversation_starting_question', e.target.value)}
				  />
				</td>
			  </tr>
			))}
		  </tbody>
		</Table>

		<Heading>Documents</Heading>
		{/* Documents Section */}
		<Table>
		  <thead>
			<tr>
			  <th>Document Path List</th>
			  <th>Document Description List</th>
			</tr>
		  </thead>
		  <tbody>
			{formData.documents.map((document, index) => (
			  <tr key={index}>
				<td>
				  <Input 
					type="file" 
					onChange={e => handleArrayFileChange('documents', index, 'document_path_list', e.target.files[0])}
				  />
				</td>
				<td>
				  <Input 
					type="text" 
					value={document.document_description_list} 
					onChange={e => handleArrayTextChange('documents', index, 'document_description_list', e.target.value)}
				  />
				</td>
			  </tr>
			))}
		  </tbody>
		</Table>

        <Heading>Instructions</Heading>
        {/* Instructions Section */}
        <Table>
          <thead>
            <tr>
              <th>Instruction Description</th>
              <th>Instruction Text</th>
            </tr>
          </thead>
          <tbody>
  		    {formData.instructions.map((instruction, index) => (
              <tr key={index}>
                <td>
                  <TextArea 
                    value={formData.instructions[0].instruction_description}
                    onChange={e => handleArrayTextChange('instructions', index, 'instruction_description', e.target.value)}
                  />
                </td>
                <td>
                  <TextArea 
                    value={formData.instructions[0].instruction_text}
                    onChange={e => handleArrayTextChange('instructions', index, 'instruction_text', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Heading>Carousel</Heading>
        {/* Carousel Section */}
        <Table>
          <thead>
            <tr>
              <th>Carousel Description</th>
            </tr>
          </thead>
          <tbody>
  		    {formData.carousels.map((carousel, index) => (
              <tr key={index}>
                <td>
                  <Input
                    type="text"
                    value={formData.coursel_description}
                    onChange={e => handleArrayTextChange('carousels', index, 'carsel_description', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>


        <Heading>Conversation Flow</Heading>
         {/* Conversation Flow Section */}
        <Table>
          <thead>
            <tr>
              <th>Flow Listing Code</th>
              <th>Flow Listing Description</th>
            </tr>
          </thead>
          <tbody>
		    {formData.conversationFlows.map((conversationFlow, index) => (
              <tr key={index}>
                <td>
                  <Input 
                    type="text" 
                    value={formData.conversationFlows[0].flow_listing_code}
                   onChange={e => handleArrayTextChange('conversationFlows', index, 'flow_listing_code', e.target.value)}
                  />
                </td>
                <td>
                  <Input 
                    type="text" 
                    value={formData.conversationFlows[0].flow_listing_description}
                    onChange={e => handleArrayTextChange('conversationFlows', index, 'flow_listing_description', e.target.value)}
                />
                </td>
              </tr>
  		    ))}
          </tbody>
        </Table>

        <Heading>Flow Instructions Section</Heading>
        <Table>
          <thead>
            <tr>
              <th>Flow Pre Instruction</th>
              <th>Flow Post Instruction</th>
            </tr>
          </thead>
          <tbody>
            {formData.flowInstructions.map((instruction, index) => (
              <tr key={index}>
                <td>
                  <TextArea 
                    value={instruction.flow_pre_instruction}
                    onChange={e => handleArrayTextChange('flowInstructions', index, 'flow_pre_instruction', e.target.value)}
                  />
                </td>
                <td>
                  <TextArea 
                    value={instruction.flow_post_instruction}
                    onChange={e => handleArrayTextChange('flowInstructions', index, 'flow_post_instruction', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
 

        <Heading>Site Location</Heading>
        <Table>
          <thead>
            <tr>
              <th>Site Location</th>
              <th>Site Location Description</th>
              <th>Question</th>
              <th>Question Prompt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formData.siteLocations.map((site, index) => (
              <tr key={index}>
                <td><Input type="text" value={site.site_location} onChange={e => handleArrayTextChange('siteLocations', index, 'site_location', e.target.value)} /></td>
                <td><Input type="text" value={site.site_location_description} onChange={e => handleArrayTextChange('siteLocations', index, 'site_location_description', e.target.value)} /></td>
                <td><Input type="text" value={site.question} onChange={e => handleArrayTextChange('siteLocations', index, 'question', e.target.value)} /></td>
                <td><Input type="text" value={site.question_prompt} onChange={e => handleArrayTextChange('siteLocations', index, 'question_prompt', e.target.value)} /></td>
                <td><Button onClick={() => handleRemoveRow(index)} style={{ backgroundColor: 'red' }}>Remove</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>

		<Button onClick={handleAddRow}>Add Row</Button>
        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
};

export default AddNewListing;
