import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import styles from '../styles/ListingAdminListing.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const ListingAdminListing = () => {
  const { listingJson, setListingJson, addImage, uploadedImages  } = useContext(ListingAdminContext); // Access context
  const [listingDetails, setListingDetails] = useState(listingJson.listing.listing_details);
  const [previewImage, setPreviewImage] = useState(listingJson.listing.images_0.image_url); // Set initial preview
  const navigate = useNavigate();

  // Base URL logic based on hostname
  const baseUrl = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:5000/api';
    } else if (hostname === 'www.aigentTechnologies.com') {
      return 'https://www.aigentTechnologies.com/api';
    } else if (hostname === 'www.openhouseaigent.com') {
      return 'https://www.openhouseaigent.com/api';
    } else {
      return 'https://hbb-zzz.azurewebsites.net/api';
    }
  })();  

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setListingDetails({ ...listingDetails, [name]: value });
  };

  // Handle image file selection and preview update
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the new image
      setPreviewImage(imageUrl); // Update preview pane
      addImage(file); // Add image file to the context
      console.log("New image selected:", file.name);
    }
  };

  // Save changes to context
  const handleSave = async () => {
    setListingJson((prevState) => ({
      ...prevState,
      listing: {
        ...prevState.listing,
        listing_details: listingDetails,
      },
    }));
    console.log("Listing details have been saved:", listingDetails);
    // alert("Listing details have been saved!");
	
    // Prepare form data to send to the backend
    const formData = new FormData();
    formData.append('listingJson', JSON.stringify(listingJson)); // Append the updated JSON

    // Append each image file
    uploadedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image, image.name);
    });

    try {
      // Use Axios for the POST request
      const response = await axios.post(`${baseUrl}/save-listing`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('Listing and images saved successfully');
        alert('Listing and images saved successfully!');
      } else {
        console.error('Failed to save listing and images');
      }
    } catch (error) {
      console.error('Error uploading listing and images:', error);
    }
 	
  };

  return (
    <div className={styles['listing-container']}>
      <div className={styles['listing-card']}>
        <h2 className={styles['page-title']}>Edit Listing Details</h2>
        <form className={styles['form-container']}>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Listing Assistant Name:</label>
            <input
              type="text"
              name="listing_assistant_name"
              value={listingDetails.listing_assistant_name}
              onChange={handleChange}
              className={styles['form-input']}
            />
          </div>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Listing Description:</label>
            <input
              type="text"
              name="listing_description"
              value={listingDetails.listing_description}
              onChange={handleChange}
              className={styles['form-input']}
            />
          </div>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Listing Address:</label>
            <input
              type="text"
              name="listing_address"
              value={listingDetails.listing_address}
              onChange={handleChange}
              className={styles['form-input']}
            />
          </div>

          {/* Image Preview Section */}
          <div className={styles['image-preview-container']}>
            <label className={styles['form-label']}>Preview Image:</label>
            <img src={previewImage} alt="Preview" className={styles['image-preview']} />
            <input
              type="file"
              accept="image/*"
              className={styles['file-input']}
              onChange={handleImageChange}
            />
          </div>

          <button type="button" className={styles['save-button']} onClick={handleSave}>
            Save Changes
          </button>
          <button type="button" className={styles['back-button']} onClick={() => navigate('/ListingAdminMainPage')}>
            Back to Main
          </button>		  
        </form>
      </div>
    </div>
  );
};

export default ListingAdminListing;
