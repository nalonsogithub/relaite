import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTable } from 'react-table';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/manageListing.module.css';
import LoadingOverlay from '../components/LoadingOverlay';

const Container = styled.div`
  padding: 20px;
  table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }
  }
`;


const createadd_buttonContainerStyle = {
    display: 'flex',       // Enables Flexbox layout
    justifyContent: 'space-around' // Distributes space around items
};


//const ImagePreview = styled.img`
//  max-width: 200px;
//  margin-top: 10px;
//`;

//  const spacer = {
//    height: '20px',       // Set the height of the div
//	backgroundColor: '#fff'
//  };

function ManageListing({buttonType}) {
  const [defaultListing, setDefaultListing] = useState({
	 default_listing: true 
  });
  const [listingData, setListingData] = useState({
    listing_description: '',
    listing_assistant_name: '',
    listing_image_path: '',
    imagePreviewUrl: ''
  });
  const [agentData, setAgentData] = useState({
    agent_name: '',
    agent_description: '',
    agent_logo_image_description_1: '',
    agent_logo_image_path_1: '',
    imagePreviewUrl_1: '',
    agent_logo_image_description_2: '',
    agent_logo_image_path_2: '',
    imagePreviewUrl_2: ''
  });
  const [carouselData, setCarouselData] = useState({
    carousel_conversation_summary_prompt: ''
  });
	
  const [instructionData, setInstructionData] = useState({
    instruction_description: '',
    instruction_text: ''
  });
  const [flowData, setFlowData] = useState({
    flow_pre_text: '',
    flow_post_text: '',
    flow_descxription: ''
  });
	
  const [conversationRows, setConversationRows] = useState([]);
  const [documentRows, setDocumentRows] = useState([]);
  const [siteFlowRows, setSiteFlowRows] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [changes, setChanges] = useState({
    listing: false,
    agent: false,
    conversation: false,
	carousel: false,
	instruction: false,
	document: false,
	flow: false,
	siteFlow: false
  });	
  const [submitType, setSubmitType] = useState({
    new_listing: true
  });	
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
	
  useEffect(() => {
    const fetchData = async () => {
      try {
		const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';  		
        const response = await axios.get(`${baseUrl}/manage_listing_get_data`); // Adjust URL as needed
        const data = response.data || {}; // Ensure data is an object even when empty	
		console.log('response', response.data)
		  
        // Use the data from the server if available, otherwise use default values
		setDefaultListing(data.defaultListing || {
			default_isting: true
		});
        setListingData(data.listingData || {
          listing_description: 'Sample Listing Description',
          listing_assistant_name: 'AIGENT',
          listing_image_path: '',
          imagePreviewUrl: ''
        });

        setAgentData(data.agentData || {
          agent_name: 'John Dow',
          agent_description: 'AGENT DESCRIPTION',
          agent_logo_image_description_1: 'IMAGE DESCRIPTION 1',
          agent_logo_image_path_1: '',
          imagePreviewUrl_1: '',
          agent_logo_image_description_2: 'IMAGE DESCRIPTION 2',
          agent_logo_image_path_2: '',
          imagePreviewUrl_2: ''
        });

        setCarouselData(data.carouselData || {
		  carousel_description: 'DEFAULT',
          carousel_conversation_summary_prompt: 'DEFAULT PROMPT'
        });
		  
		  
        setInstructionData(data.instructionData || {
          instruction_description: 'INSTRUCTION DESCRIPTION',
          instruction_text: 'INSTRUCTION TEXT'
        });

        setFlowData(data.flowData || {
          flow_pre_text: 'FLOW PRE TEXT',
          flow_post_text: 'FLOW POST TEXT',
          flow_description: 'FLOW DESCRIPTION'
        });

        setConversationRows(data.conversationRows || [
          {
            conversation_code: 'Agent',
            conversation_order: 1,
            conversation_description: 'Getting to know your agent.',
            conversation_image_path: '',
            conversation_starting_prompt: 'Give me details about the agent selling this house.'
          },
          {
            conversation_code: 'Home',
            conversation_order: 2,
            conversation_description: 'Getting to know your home.',
            conversation_image_path: '',
            conversation_starting_prompt: 'Give me details about this house.'
          },
          {
            conversation_code: 'Renno',
            conversation_order: 3,
            conversation_description: 'Get some ideas on renovating the home.',
            cnversation_image_path: '',
            conversation_starting_prompt: 'Give me details about renovating the house.'
          }
        ]);

        setDocumentRows(data.documentRows || [
          {
            document_file_path: '',
            document_description: 'DOCUMENT 1 DESCRIPTION DEFAULT',
            document_purpose: 'This document contains *****',
            document_file: '',
            document_file_name: ''
          },
          {
            document_file_path: '',
            document_description: 'DOCUMENT 2 DESCRIPTION DEFAULT',
            document_purpose: 'This document contains *****',
            document_file: '',
            document_file_name: ''

          }
        ]);

        setSiteFlowRows(data.siteFlowRows || [
          {
            site_flow_location: 'Main Entrance',
            site_flow_description: 'Initial Description',
            site_flow_question: 'Initial Question',
            site_flow_prompt: 'Initial Prompt'
          },
          {
            site_flow_location: 'Main Entrance',
            site_flow_description: 'Initial Description',
            site_flow_question: 'Initial Question 2',
            site_flow_prompt: 'Initial Prompt 2'
          }
        ]);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Here you could also set defaults or handle the error more specifically
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once after the component mounts

  // This useEffect will run whenever submitButton state changes
      // Effect to update state based on buttonType changes

    // Automatically update `new_listing` based on `buttonType`
	
	
	const columnsConversation = useMemo(() => [
		  {
			Header: 'Code',
			accessor: 'conversation_code',
			Cell: ({ cell }) => (
			  <input
				type="text"
				className={styles.inputStyle} // Apply inputStyle class
				value={cell.value}
				onChange={(e) => {
				  const dataCopy = [...conversationRows];
				  dataCopy[cell.row.index][cell.column.id] = e.target.value;
				  setChanges(prev => ({ ...prev, conversation: true }));
				  setConversationRows(dataCopy);
				}}
			  />
			)
		  },
		  {
			Header: 'Order',
			accessor: 'conversation_order',
			Cell: ({ cell }) => (
			  <input
				type="text"
				className={styles.inputStyle} // Apply inputStyle class
				value={cell.value}
				onChange={(e) => {
				  const dataCopy = [...conversationRows];
				  dataCopy[cell.row.index][cell.column.id] = e.target.value;
				  setChanges(prev => ({ ...prev, conversation: true }));
				  setConversationRows(dataCopy);
				}}
			  />
			)
		  },
		  {
			Header: 'Description',
			accessor: 'conversation_description',
			Cell: ({ cell }) => (
			  <input
				type="text"
				className={styles.inputStyle} // Apply inputStyle class
				value={cell.value}
				onChange={(e) => {
				  const dataCopy = [...conversationRows];
				  dataCopy[cell.row.index][cell.column.id] = e.target.value;
				  setChanges(prev => ({ ...prev, conversation: true }));
				  setConversationRows(dataCopy);
				}}
			  />
			)
		  },
		  {
			Header: 'Image',
			id: 'image',
			accessor: 'conversation_image_path',
			Cell: ({ row }) => (
			  <>
				<input
				  type="file"
				  className={styles.imageContainer} // Apply imageContainer style
				  onChange={(e) => handleConversationFileChange(row.index, e.target.files[0])}
				/>
				{row.original.imagePreviewUrl && (
				  <img src={row.original.imagePreviewUrl} alt="Preview" style={{ width: 100 }} />
				)}
			  </>
			)
		  },
		  {
			Header: 'Starting Prompt',
			accessor: 'conversation_starting_question',
			Cell: ({ cell }) => (
			  <textarea
				className={styles.paragraphInputStyle} // Apply paragraphInputStyle class
				value={cell.value}
				onChange={(e) => {
				  const dataCopy = [...conversationRows];
				  dataCopy[cell.row.index][cell.column.id] = e.target.value;
				  setChanges(prev => ({ ...prev, conversation: true }));
				  setConversationRows(dataCopy);
				}}
			  />
			)
		  },
		  {
			Header: 'Actions',
			id: 'delete',
			accessor: (str) => 'delete',
			Cell: (tableProps) => (
			  <button onClick={() => {
				const newRows = [...conversationRows];
				newRows.splice(tableProps.row.index, 1);
				setConversationRows(newRows);
			  }}>
				Delete
			  </button>
			)
		  }
		], [conversationRows]);
	


  const columnsDocument = useMemo(() => [
    {
      Header: 'Description',
      accessor: 'document_description',
      Cell: ({ cell }) => (
        <input
          type="text"
          className={styles.inputStyle} // Apply inputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...documentRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setChanges(prev => ({ ...prev, document: true }));
            setDocumentRows(dataCopy);
          }}
        />
      )
    },
    {
      Header: 'Document Purpose',
      accessor: 'document_purpose',
      Cell: ({ cell }) => (
        <input
          type="text"
          className={styles.inputStyle} // Apply inputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...documentRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setChanges(prev => ({ ...prev, document: true }));
            setDocumentRows(dataCopy);
          }}
        />
      )
    },
    {
      Header: 'File',
      id: 'document',
      accessor: 'document_file_name',
      Cell: ({ row }) => (
        <input
          type="file"
          className={styles.documentFileStyle} // Apply documentFileStyle class
          onChange={(e) => handleDocumentFileChange(row.index, e.target.files[0])}
        />
      )
    },
    {
      Header: 'Actions',
      id: 'delete',
      accessor: () => 'delete',
      Cell: (tableProps) => (
        <button onClick={() => {
          const newRows = [...documentRows];
          newRows.splice(tableProps.row.index, 1);
          setDocumentRows(newRows);
        }}>
          Delete
        </button>
      )
    }
  ], [documentRows]);



  const columnsSiteFlow = useMemo(() => [
    {
      Header: 'Location',
      accessor: 'site_flow_location',
      Cell: ({ cell }) => (
        <input
          type="text"
          className={styles.inputStyle} // Apply inputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...siteFlowRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setSiteFlowRows(dataCopy);
            setChanges(prev => ({ ...prev, siteFlow: true }));
          }}
        />
      )
    },
    {
      Header: 'Description',
      accessor: 'site_flow_description',
      Cell: ({ cell }) => (
        <textarea
          className={styles.paragraphInputStyle} // Apply paragraphInputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...siteFlowRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setSiteFlowRows(dataCopy);
            setChanges(prev => ({ ...prev, siteFlow: true }));
          }}
        />
      )
    },
    {
      Header: 'Question',
      accessor: 'site_flow_question',
      Cell: ({ cell }) => (
        <textarea
          className={styles.paragraphInputStyle} // Apply paragraphInputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...siteFlowRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setSiteFlowRows(dataCopy);
            setChanges(prev => ({ ...prev, siteFlow: true }));
          }}
        />
      )
    },
    {
      Header: 'Prompt',
      accessor: 'site_flow_prompt',
      Cell: ({ cell }) => (
        <textarea
          className={styles.paragraphInputStyle} // Apply paragraphInputStyle class
          value={cell.value}
          onChange={(e) => {
            const dataCopy = [...siteFlowRows];
            dataCopy[cell.row.index][cell.column.id] = e.target.value;
            setSiteFlowRows(dataCopy);
            setChanges(prev => ({ ...prev, siteFlow: true }));
          }}
        />
      )
    },
    {
      Header: 'Actions',
      id: 'delete',
      accessor: () => 'delete',
      Cell: (tableProps) => (
        <button onClick={() => {
          const newRows = [...siteFlowRows];
          newRows.splice(tableProps.row.index, 1);
          setSiteFlowRows(newRows);
        }}>
          Delete
        </button>
      )
    }
  ], [siteFlowRows]);

  const siteTableInstance = useTable({ columns: columnsSiteFlow, data: siteFlowRows });
  const conversationTableInstance = useTable({ columns: columnsConversation, data: conversationRows });
  const documentTableInstance = useTable({ columns: columnsDocument, data: documentRows });
  const [action, setAction] = useState('New');

  const handleListingFileChange = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = () => {
      setListingData(prev => ({
		  ...prev,
		  listing_image_path: file.name,
		  imagePreviewUrl: reader.result
	  }));
    };
	setChanges(prev => ({ ...prev, agent: true }));

    reader.readAsDataURL(file);
  };


  const handleAgentFileChange1 = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = () => {
      setAgentData(prev => ({
        ...prev,
        agent_logo_image_path_1: file.name,
        imagePreviewUrl_1: reader.result
      }));
    };
	setChanges(prev => ({ ...prev, agent: true }));

    reader.readAsDataURL(file);
  };

  const handleAgentFileChange2 = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = () => {
      setAgentData(prev => ({
        ...prev,
        agent_logo_image_path_2: file.name,
        imagePreviewUrl_2: reader.result
      }));
    };
	setChanges(prev => ({ ...prev, agent: true }));

    reader.readAsDataURL(file);
  };


  const handleConversationFileChange = (index, file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const newRows = conversationRows.map((row, i) => {
              if (i === index) {
                  return { ...row, conversation_image_path: file.name, imagePreviewUrl: reader.result };
              }
              return row;
          });
		  setChanges(prev => ({ ...prev, conversation: true }));
          setConversationRows(newRows);
      };
      reader.readAsDataURL(file);
  };	

  const handleDocumentFileChange = (index, file) => {
    // Update the specific index in the documents array with the new file
    setDocuments(prevDocs => {
      // Create a new array from the previous state
      const updatedDocs = [...prevDocs];
    
      // Replace the file at the specific index
      updatedDocs[index] = file;
    
      return updatedDocs;
    });	  
	  
    const newRows = documentRows.map((row, i) => {
        if (i === index) {
            // Store only the file name, or any other necessary file attribute
            return { ...row, document_file_name: file.name, document_file: file};
        }
        return row;
      });
      setDocumentRows(newRows);
	setChanges(prev => ({ ...prev, document: true }));
  };

  const handleListingInputChange = (name, value) => {
    setListingData(prev => ({ ...prev, [name]: value }));
	setChanges(prev => ({ ...prev, listing: true }));
  };

  const handleAgentInputChange = (name, value) => {
    setAgentData(prev => ({ ...prev, [name]: value }));
	setChanges(prev => ({ ...prev, agent: true }));
  };

  const handleCarouselInputChange = (name, value) => {
    setCarouselData(prev => ({ ...prev, [name]: value }));
	setChanges(prev => ({ ...prev, carousel: true }));
  };

  const handleInstructionInputChange = (name, value) => {
    setInstructionData(prev => ({ ...prev, [name]: value }));
	setChanges(prev => ({ ...prev, instruction: true }));
  };

  const handleRadioChange = (name, value) => {
    setSubmitType({ [name]: value });
  };



  const handleFlowInputChange = (name, value) => {
    setFlowData(prev => ({ ...prev, [name]: value }));
	setChanges(prev => ({ ...prev, flow: true }));
  };


  const addConversationRow = () => {
      const newRow = conversationRows.length > 0 ? { ...conversationRows[conversationRows.length - 1], imagePreviewUrl: '' } : {
          conversation_code: '',
          conversation_order: '',
          conversation_description: '',
          conversation_image_path: '',
          conversation_starting_prompt: '',
          imagePreviewUrl: ''
      };
      setConversationRows([...conversationRows, newRow]);
  };
	
  const addDocumentRow = () => {
      const newRow = documentRows.length > 0 ? { ...documentRows[documentRows.length - 1]} : {
          document_description: '',
          document_purpose: '',
          document_file_name: ''
      };
      setDocumentRows([...documentRows, newRow]);
  };
	

	  

  const addSiteFlowRow = () => {
      // Check if there are existing rows to copy from
      if (siteFlowRows.length > 0) {
          const lastRow = siteFlowRows[siteFlowRows.length - 1];
          const newRow = { ...lastRow }; // Copy the last row
          setSiteFlowRows([...siteFlowRows, newRow]);
      } else {
          // If no rows exist, add a new blank row
          const newRow = {
              site_flow_location: '',
              site_flow_description: '',
              site_flow_question: '',
              site_flow_prompt: ''
          };
          setSiteFlowRows([newRow]);
      }
  };
	
	
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Update the state depending on the button type
//    setSubmitButton(prevState => ({
//        ...prevState,
//        new_listing: buttonType === 'Add' // Set to true if adding, false otherwise
//    }));
	setIsLoading(true);
    const formData = new FormData();
	formData.append('submitType', JSON.stringify(submitType));
	formData.append('changes', JSON.stringify(changes));
    formData.append('listingData', JSON.stringify(listingData));	  
    formData.append('agentData', JSON.stringify(agentData));	  
    formData.append('conversationRows', JSON.stringify(conversationRows));	  
    formData.append('documentRows', JSON.stringify(documentRows));	  
    formData.append('carouselData', JSON.stringify(carouselData));	  
    formData.append('instructionData', JSON.stringify(instructionData));	  
    formData.append('flowData', JSON.stringify(flowData));	  
    formData.append('siteFlowRows', JSON.stringify(siteFlowRows));	  
	  
    documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc, doc.name);
    });
	console.log('conversationRows TO SEND', conversationRows)
	console.log('DOCS TO SEND', documentRows)
	  
    try {
		const baseHomeUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://hbb-zzz.azurewebsites.net';  		
		const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';  		
        const response = await axios.post(`${baseUrl}/manage_listing_upsert`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' 
            }
        });
        console.log('Assistant Created:', response.data);
		setIsLoading(false);
        alert(`Success: ${buttonType}: ${response.data.assistant_id}`);
		
		if (response.data.qr_code) {
          // Navigate to QRCodeDisplay component with QR code data
          navigate('/qr-code-display', { state: { qrCode: response.data.qr_code, qrCodeData:  ` ${baseHomeUrl}?listing_id=${response.data.listing_id}`} });

        }		  
		
    } catch (error) {
        console.error('Error creating assistant:', error);
        alert('Failed to create assistant.');
    }	  
  }; 

  if (isLoading) {
      return <LoadingOverlay />;
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
	  
	  	<div className={styles.sectionBoxStyle2}>
			<h2>Listing Details</h2>
			<div className={styles.inputStyle}>
			  <label>Description:</label>
			  <input
				type="text"
				value={listingData.listing_description}
				onChange={(e) => handleListingInputChange('listing_description', e.target.value)}
			  />
			</div>
			<div className={styles.inputStyle}>
			  <label>Assistant Name:</label>
			  <input
				type="text"
				value={listingData.listing_assistant_name}
				onChange={(e) => handleListingInputChange('listing_assistant_name', e.target.value)}
			  />
			</div>
  		    {listingData.listing_image_path ? ( // Check if the path is not empty
			  <div className={styles.inputStyle}>
			    <label>Image Path</label>
			    <input
			      type="text"
				  value={listingData.listing_image_path}
				  readOnly // Added readOnly if you do not intend to allow editing
			    />
			  </div>
		    ) : null}
			<div className={styles.imageContainer}>
			  <label>Image File:</label>
			  <input
				type="file"
				onChange={handleListingFileChange}
			  />
			  {listingData.imagePreviewUrl && <img src={listingData.imagePreviewUrl} alt="Listing Preview"  className={styles.imagePreview}/>}
			</div>
		</div>
		
		<div className={styles.spacer}></div>

	  	<div  className={styles.sectionBoxStyle2}>
			<h2>Agent Details</h2>
			<div className={styles.inputStyle}>
			  <label>Name:</label>
			  <input
				type="text"
				value={agentData.agent_name}
				onChange={(e) => handleAgentInputChange('agent_name', e.target.value)}
			  />
			</div>
			<div className={styles.inputStyle}>
			  <label>Description:</label>
			  <input
				type="text"
				value={agentData.agent_description}
				onChange={(e) => handleAgentInputChange('agent_description', e.target.value)}
			  />
			</div>
  		    {agentData.agent_logo_image_path_1 ? ( // Check if the path is not empty
			  <div className={styles.inputStyle}>
			    <label>Image Path</label>
			    <input
			      type="text"
				  value={agentData.agent_logo_image_path_1}
				  readOnly // Added readOnly if you do not intend to allow editing
			    />
			  </div>
		    ) : null}
			<div className={styles.imageContainer}>
			  <label>Logo Image 1:</label>
			  <input
				type="file"
				onChange={handleAgentFileChange1}
			  />
			  {agentData.imagePreviewUrl_1 && <img src={agentData.imagePreviewUrl_1} alt="Logo 1 Preview"  className={styles.imagePreview}/>}
			</div>
  		    {agentData.agent_logo_image_path_2 ? ( // Check if the path is not empty
			  <div className={styles.inputStyle}>
			    <label>Image Path</label>
			    <input
			      type="text"
				  value={agentData.agent_logo_image_path_2}
				  readOnly // Added readOnly if you do not intend to allow editing
			    />
			  </div>
		    ) : null}
			<div className={styles.imageContainer}>
			  <label>Logo Image 2:</label>
			  <input
				type="file"
				onChange={handleAgentFileChange2}
			  />
			  {agentData.imagePreviewUrl_2 && <img src={agentData.imagePreviewUrl_2} alt="Logo 2 Preview"  className={styles.imagePreview}/>}
			</div>
	
		</div>

		<div className={styles.spacer}></div>
						
	  	<div className={styles.sectionBoxStyle2}>
			<h2>Carousel Summary Prompt</h2>
			<div className={styles.inputStyle}>
			  <label>Summary Prompt:</label>
			  <textarea
				className={styles.paragraphInputStyle}
				value={carouselData.carousel_conversation_summary_prompt}
				onChange={(e) => handleCarouselInputChange('carousel_conversation_summary_prompt', e.target.value)}
			  />
			</div>

		</div>

		<div className={styles.spacer}></div>
						
	  	<div className={styles.sectionBoxStyle2}>
	
			<div>
				<h2>Instructions</h2>
				<div className={styles.inputStyle}>
					<label>Instruction:</label>
					<textarea
						className={styles.paragraphInputStyle}
						value={instructionData.instruction_text}
						onChange={(e) => handleInstructionInputChange('instruction_text', e.target.value)}
					/>
				</div>
				<div className={styles.inputStyle}>
			  		<label>Description:</label>
			  		<input
						type="text"
						value={instructionData.instruction_description}
						onChange={(e) => handleInstructionInputChange('instruction_description', e.target.value)}
			  		/>
				</div>
			</div>

		</div>


		<div className={styles.spacer}></div>
						

		<div className={styles.sectionBoxStyle2}>
			<h2>Flow</h2>
			<div className={styles.inputStyle}>
			  <label>Pre Flow:</label>
			  <textarea
				className={styles.paragraphInputStyle}
				value={flowData.flow_pre_text}
				onChange={(e) => handleFlowInputChange('flow_pre_text', e.target.value)}
			  />
			</div>
			<div className={styles.inputStyle}>
			  <label>Post Flow:</label>
			  <textarea
				className={styles.paragraphInputStyle}
				value={flowData.flow_post_text}
				onChange={(e) => handleFlowInputChange('flow_post_text', e.target.value)}
			  />
			</div>
			<div>
			  <label>Description:</label>
			  <input
				type="text"
				value={flowData.flow_description}
				onChange={(e) => handleFlowInputChange('flow_description', e.target.value)}
			  />
			</div>
		</div>





		<div className={styles.spacer}></div>
						
		<div className={styles.sectionBoxStyle2}>
      <h2>Conversations</h2>
      <table {...conversationTableInstance.getTableProps()}>
        <thead>
          {conversationTableInstance.headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...conversationTableInstance.getTableBodyProps()}>
          {conversationTableInstance.rows.map(row => {
            conversationTableInstance.prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" onClick={addConversationRow}>Add Row</button>
    </div>


		<div className={styles.spacer}></div>
						

    <div className={styles.sectionBoxStyle2}>
      <h2>Documents</h2>
      <table {...documentTableInstance.getTableProps()}>
        <thead>
          {documentTableInstance.headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...documentTableInstance.getTableBodyProps()}>
          {documentTableInstance.rows.map(row => {
            documentTableInstance.prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>
                    {cell.column.id === 'delete' ? (
                      cell.render('Cell')
                    ) : cell.column.id === 'document' ? (
                      <input
                        type="file"
                        className={styles.documentFileStyle} // Apply documentFileStyle class
                        onChange={e => {
                          const file = e.target.files[0]; // Correct way to get the file from input
                          handleDocumentFileChange(cell.row.index, file); // Assuming passing index and file to the function
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        className={styles.inputStyle} // Apply inputStyle class
                        value={cell.value}
                        onChange={e => {
                          const dataCopy = [...documentRows];
                          dataCopy[cell.row.index][cell.column.id] = e.target.value;
                          setChanges(prev => ({ ...prev, document: true }));
                          setDocumentRows(dataCopy);
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" onClick={addDocumentRow}>Add Row</button>
    </div>


		<div className={styles.spacer}></div>
						

    <div className={styles.sectionBoxStyle2}>
      <h2>Site Flow Details</h2>
      <table {...siteTableInstance.getTableProps()}>
        <thead>
          {siteTableInstance.headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...siteTableInstance.getTableBodyProps()}>
          {siteTableInstance.rows.map(row => {
            siteTableInstance.prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>
                    {cell.column.id === 'delete' ? (
                      cell.render('Cell')
                    ) : (
                      <textarea
                        className={styles.paragraphInputStyle} // Apply paragraphInputStyle class
                        value={cell.value}
                        onChange={e => {
                          const dataCopy = [...siteFlowRows];
                          dataCopy[cell.row.index][cell.column.id] = e.target.value;
                          setSiteFlowRows(dataCopy);
                          setChanges(prev => ({ ...prev, siteFlow: true }));
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" onClick={addSiteFlowRow}>Add Row</button>
    </div>




		<div>
			<div style={createadd_buttonContainerStyle}>
				<label>
				  <input
					type="radio"
					name="new_listing"
					checked={submitType.new_listing}
					onChange={() => handleRadioChange('new_listing', true)}
				  />
				  New Listing
				</label>
				<label>
				  <input
					type="radio"
					name="new_listing"
					checked={!submitType.new_listing}
					onChange={() => handleRadioChange('new_listing', false)}
				  />
				  Update Listing
				</label>				
			</div>
			<button type="button" onClick={(e) => handleSubmit(e)}>Submit</button>
		</div>
      </form>
    </Container>
  );
}

export default ManageListing;
