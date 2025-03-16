import React, { useContext, useState, useEffect  } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminListing.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const ListingAdminListing = () => {
  const { listingJson, setListingJson, addImage, uploadedImages, previewListingImages, setPreviewListingImages,
		  defaultListingId,
	      blobUrl, jsonChanged, setJsonChanged
		} = useContext(ListingAdminContext); // Access context
  const [listingDetails, setListingDetails] = useState(listingJson.listing.listing_details);
//  const [previewImage, setPreviewImage] = useState(listingJson.listing.images_0.image_url); 
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

  // Log the relevant values during initial render
//  useEffect(() => {
//    console.log('Initial Render Values:');
//    console.log('Blob URL:', blobUrl);
//    console.log('Default Listing ID:', defaultListingId);
//    console.log('Image File Name:', listingJson?.listing?.images_0?.image_file_name);
//    console.log(
//      'Constructed URL:',
//      `${blobUrl}${defaultListingId}/${listingJson?.listing?.images_0?.image_file_name}`
//    );
//  }, [blobUrl, defaultListingId, listingJson]);
	
	// Handle image file selection and preview update
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the new image
      setPreviewListingImages(imageUrl); // Update preview pane
      addImage(file); // Add image file to the context
		
      // Update the listingJson with the new file name and URL
      setListingJson((prevState) => {
        const updatedJson = {
          ...prevState,
          listing: {
            ...prevState.listing,
            images_0: {
              ...prevState.listing.images_0,
              image_file_name: file.name, // Update the file name
              image_url: imageUrl,        // Set the preview URL as a placeholder (optional)
            },
          },
        };
        console.log("Updated image_file_name:", updatedJson.listing.images_0.image_file_name); // Log the new file name
        return updatedJson;
      });		
		
      console.log("New image selected:", file.name, );
    }
  };
	
  // Handle image file selection and preview update
	

  // Save changes to context
  const handleSave = async () => {
    setListingJson((prevState) => ({
      ...prevState,
      listing: {
        ...prevState.listing,
        listing_details: listingDetails,
      },
    }));
//    console.log("Listing details have been saved:", listingDetails);
    // alert("Listing details have been saved!");
	
    // Prepare form data to send to the backend
    const formData = new FormData();
    formData.append('listingJson', JSON.stringify(listingJson)); // Append the updated JSON

    // Append each image file
    uploadedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image, image.name);
    });
	navigate('/ListingAdminMainPage');
//    try {
//      const response = await axios.post(`${baseUrl}/save-listing`, formData, {
//        headers: {
//          'Content-Type': 'multipart/form-data',
//        },
//      });
//
//      if (response.status === 200) {
//        console.log('Listing and images saved successfully');
//        alert('Listing and images saved successfully!');
//      } else {
//        console.error('Failed to save listing and images');
//      }
//    } catch (error) {
//      console.error('Error uploading listing and images:', error);
//    }
 	
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
	  {/*
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
	 */}
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
          <h3 className={styles['image-preview-title']}>Image Preview</h3>
          <div className={styles['image-preview-container']}>
            <div className={styles['image-box']}>
	  
<img
  src={
    typeof previewListingImages === 'string' && previewListingImages.trim() !== ''
      ? previewListingImages // Use the preview image if it's a valid non-empty string
      : `${blobUrl}${defaultListingId}/${listingJson?.listing?.images_0?.image_file_name}` // Fallback to constructed URL
  }
  alt="Preview"
  className={styles['image-preview']}
  onError={(e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.style.display = 'none'; // Hide broken images
  }}
  onLoad={() => console.log("Image loaded successfully:", `${blobUrl}${defaultListingId}/${listingJson?.listing?.images_0?.image_file_name}`)}
/>
	  
            </div>
            <label htmlFor="file-upload" className={styles['custom-file-upload']}>
              Choose File
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              className={styles['file-input']}
              onChange={handleImageChange}
            />
          </div>

	  	  <div className=  {styles.navButtonContainer}>
            <button type="button" className={styles['back-button']} onClick={(handleSave)}>
            Back to Main
            </button>		  
		  </div>
        </form>
      </div>
    </div>
  );
};

export default ListingAdminListing;
