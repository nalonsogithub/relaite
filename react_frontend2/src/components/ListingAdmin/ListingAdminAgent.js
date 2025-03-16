import React, { useContext, useState, useEffect } from 'react'; 
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminAgent.module.css';
import { useNavigate } from 'react-router-dom';

const ListingAdminAgent = () => {
  const {
    listingJson,
    setListingJson,
    addImage,
    uploadedImages,
    previewAgentImages,
    setPreviewAgentImages,
    defaultListingId,
    blobUrl,
  } = useContext(ListingAdminContext);
  const [agentDetails, setAgentDetails] = useState(listingJson.agent);
  const navigate = useNavigate();

  // Log the initial values to check data structure
  useEffect(() => {
    console.log('Initial Render Values:');
    console.log('Blob URL:', blobUrl);
    console.log('Default Listing ID:', defaultListingId);
    console.log('Agent Details:', agentDetails);
    console.log('Preview Agent Images:', previewAgentImages);
  }, [blobUrl, defaultListingId, agentDetails, previewAgentImages]);

  // Update both agentDetails and listingJson state on change
  const updateAgentDetails = (key, value) => {
	  
    setAgentDetails((prevDetails) => ({ ...prevDetails, [key]: value }));
    const updatedAgentDetails = { ...agentDetails, [key]: value };
//    setListingJson((prevState) => ({
//      ...prevState,
//      agent: { ...prevState.agent, [key]: value },
//    }));
	  
	  
    // Update listingJson state
    setListingJson((prevState) => ({
      ...prevState,
      agent: updatedAgentDetails, // Use updated agentDetails here
    }));	  
  };

  // Handle form changes for agent name and description
  const handleAgentChange = (event) => {
    const { name, value } = event.target;
    updateAgentDetails(name, value); // Update state on change
  };

  // Handle logo description change and update the JSON state
  const handleLogoDescriptionChange = (event, key) => {
    const { value } = event.target;
    setAgentDetails((prevDetails) => ({
      ...prevDetails,
      [key]: { ...prevDetails[key], logo_description: value },
    }));

    setListingJson((prevState) => {
      const updatedAgent = { ...prevState.agent, [key]: { ...prevState.agent[key], logo_description: value } };
      return { ...prevState, agent: updatedAgent };
    });
  };

  // Handle logo image change and preview update
  const handleLogoImageChange = (event, key) => {
    const file = event.target.files[0];
	  
	  
    if (file) {
	  const invalidChars = /[^a-zA-Z0-9_.-]/;	
      if (invalidChars.test(file.name)) {
        alert('The image name contains invalid characters. Please use only letters, numbers, underscores, hyphens, or  dots.');
        event.target.value = ""; // Clear the file input
        return; // Exit the function without updating the state
      }		
		
      const imageUrl = URL.createObjectURL(file); // Create a URL for the new image
      console.log(`Preview image URL for key "${key}":`, imageUrl, file);	  
		
		
      setPreviewAgentImages((prevPreviews) => ({
        ...prevPreviews,
        [key]: imageUrl, // Use the provided key as the identifier for this image
      }));
		
		
      addImage(file); // Add the image file to the context

      // Update the listingJson with the new logo file name and URL
setListingJson((prevState) => {
  const updatedJson = {
    ...prevState,
    agent: {
      ...prevState.agent,
      [key]: {
        ...prevState.agent[key],
        image_file_name: file.name,
        image_url: imageUrl,
      },
    },
  };
        console.log(`Updated listingJson for key ${key}:`, updatedJson.agent[key]);
  return updatedJson;
});
    }
  };

  // Save the changes and navigate back to the main page nnsh
  const handleSave = async () => {
//    setListingJson((prevState) => ({
//      ...prevState,
//      agent: agentDetails,
//    }));
	  console.log('NAV to main page');
    navigate('/ListingAdminMainPage');
  };

  return (
    <div className={styles['agent-container']}>
      <div className={styles['agent-card']}>
        <h2 className={styles['page-title']}>Edit Agent Details</h2>
        <form className={styles['form-container']}>
          {/* Agent Details Section */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Agent Name:</label>
            <input
              type="text"
              name="listing_agent_name"
              value={agentDetails.listing_agent_name}
              onChange={handleAgentChange}
              className={styles['form-input']}
            />
          </div>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Agent Description:</label>
            <input
              type="text"
              name="listing_agent_description"
              value={agentDetails.listing_agent_description}
              onChange={handleAgentChange}
              className={styles['form-input']}
            />
          </div>

          {/* Image and Logo Sections */}
          {['images_0', 'images_1'].map((imageKey, index) => {
            const logoKey = `logos_${index}`; // Get corresponding logos_x key

            return (
              agentDetails[imageKey] && agentDetails[logoKey] && (
                <div key={imageKey} className={styles['logo-section']}>
                  <h3 className={styles['logo-title']}>Set {index + 1}</h3>

                  {/* Logo Description (from logos_x) */}
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Logo Description:</label>
                    <input
                      type="text"
                      value={agentDetails[logoKey]?.logo_description || ''}
                      onChange={(event) => handleLogoDescriptionChange(event, logoKey)}
                      className={styles['logo-input']}
                    />
                  </div>

                  {/* Image Preview Section */}
                  <h4 className={styles['image-preview-title']}>Image Preview</h4>
                  <div className={styles['image-preview-container']}>
                    <div className={styles['image-box']}>
				
<img
  src={
    typeof previewAgentImages[imageKey] === 'string' && previewAgentImages[imageKey].trim() !== ''
      ? previewAgentImages[imageKey]
      : `${blobUrl}${defaultListingId}/${agentDetails[imageKey]?.image_file_name || imageKey}`
  }
  alt="Image Preview"
  className={styles['image-preview']}
  onError={(e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.style.display = 'none';
  }}
/>
                    </div>
                    <label htmlFor={`${imageKey}-file-upload`} className={styles['custom-file-upload']}>
                      Choose File
                    </label>
                    <input
                      type="file"
                      id={`${imageKey}-file-upload`}
                      accept="image/*"
                      className={styles['file-input']}
                      onChange={(event) => handleLogoImageChange(event, imageKey)}
                    />
                  </div>

                </div>
              )
            );
          })}

          {/* Button Group for Save and Back to Main Navigation */}
          <div className={styles.navButtonContainer}>
            <button type="button" className={styles['back-button']} onClick={handleSave}>
              Back to Main
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingAdminAgent;
