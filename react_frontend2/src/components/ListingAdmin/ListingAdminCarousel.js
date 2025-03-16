import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminCarousel.module.css'; // Custom CSS styles
import { useNavigate } from 'react-router-dom';


const ListingAdminCarousel = () => {
  const {
    listingJson,
    setListingJson,
    addImage,
    previewCarouselImages,
    setPreviewCarouselImages,
	uploadedImages,
	defaultListingId,
	blobUrl,
  } = useContext(ListingAdminContext);
//  const [carouselDetails, setCarouselDetails] = useState(listingJson.carousel);
  const navigate = useNavigate();
	
	
const handleDeleteTile = (index) => {
  console.log("Deleting tile at index:", index);
  console.log("Current carousel:", listingJson.carousel);

  const updatedCarousel = listingJson.carousel.filter((_, i) => i !== index); // Remove the item at the specified index

  console.log("Updated carousel after delete:", updatedCarousel);

  // Update the state with the new carousel array
  setListingJson((prevState) => {
    console.log("Updating listingJson state. Previous state:", prevState);
    const newState = {
      ...prevState,
      carousel: updatedCarousel,
    };
    console.log("New state:", newState);
    return newState;
  });
};

  // Handle image file selection and preview update, but update only local state
  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a temporary URL for preview

      // Update the local state for preview images
      setPreviewCarouselImages((prev) => ({
        ...prev,
        [index]: imageUrl,
      }));

      // Add the image to the upload queue
      addImage(file);

      // Update the local carousel details state
//      const updatedCarousel = [...carouselDetails];
//      updatedCarousel[index].image_file_name = file.name;
//      setCarouselDetails(updatedCarousel);
		
      // Update the listingJson directly with the new image file name
      setListingJson((prevState) => {
        const updatedCarousel = [...prevState.carousel];
        updatedCarousel[index].image_file_name = file.name;
        return { ...prevState, carousel: updatedCarousel };
      });
		
    }
  };
	


	  // Save Changes: Update main listingJson only here
  const handleSave = () => {
//    setListingJson((prevState) => ({
//      ...prevState,
//      carousel: carouselDetails,
//    }));

    // Upload all images as needed
    const formData = new FormData();
    uploadedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image, image.name);
    });

    navigate('/ListingAdminMainPage');
  };
	
  // Handle field changes for any text input field
  const handleFieldChange = (index, field, value) => {
    setListingJson((prevState) => {
      const updatedCarousel = [...prevState.carousel];
      updatedCarousel[index][field] = value;
      return { ...prevState, carousel: updatedCarousel };
    });
  };
	
  // Add a new listing tile with default values
  const handleAddListing = () => {
    const newTile = {
      image_file_name: '',
      image_tile_description: 'New Tile Description',
      site_location: '',
      image_order: listingJson.carousel.length + 1, // Automatically assign the next order number
      image_tile_destination: '',
      image_click_user_prompt: '',
      image_click_system_prompt: '',
      image_tile_instructions: '',
    };

    // Update the listingJson with the new tile
    setListingJson((prevState) => ({
      ...prevState,
      carousel: [...prevState.carousel, newTile],
    }));
  };
	
	
  return (
    <div className={styles['carousel-container']}>
      <h2 className={styles['page-title']}>Main Carousel</h2>
	  <form className={styles['form-container']}>
		  <div className={styles['carousel-tiles']}>

{listingJson.carousel.map((tile, index) => (
  <div key={index} className={styles['tile-container']}>
    <div className={styles['tile-header']}>
      <h3 className={styles['tile-title']}>Tile {index + 1}</h3>
      <button
        type="button"
        className={styles['delete-button']}
        onClick={() => handleDeleteTile(index)}
      >
        Delete
      </button>
    </div>
    
    {/* Editable Fields */}
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Tile Description:</label>
      <textarea
        value={tile.image_tile_description}
        onChange={(e) => handleFieldChange(index, 'image_tile_description', e.target.value)}
        className={styles['form-input']}
      />
    </div>
    
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Site Location:</label>
      <input
        type="text"
        value={tile.site_location}
        onChange={(e) => handleFieldChange(index, 'site_location', e.target.value)}
        className={`${styles['form-input']} ${styles['short-input']}`} // Single line input with small width
      />
    </div>
    
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Image Order:</label>
      <input
        type="number"
        value={tile.image_order}
        onChange={(e) => handleFieldChange(index, 'image_order', e.target.value)}
        className={`${styles['form-input']} ${styles['short-input']}`} // Small input for number field
        min="1" // Validation for positive numbers
      />
    </div>
{/*
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Tile Destination:</label>
      <input
        type="text"
        value={tile.image_tile_destination}
        onChange={(e) => handleFieldChange(index, 'image_tile_destination', e.target.value)}
        className={`${styles['form-input']} ${styles['short-input']}`} // Single line input with small width
      />
    </div>
*/}

<div className={styles['form-group']}>
  <label className={styles['form-label']}>Tile Destination:</label>
  <select
    value={tile.image_tile_destination}
    onChange={(e) => handleFieldChange(index, 'image_tile_destination', e.target.value)}
    className={`${styles['form-input']} ${styles['short-input']}`} // Single line input with small width
  >
    <option value="summary">Summary</option>
    <option value="welcome">Welcome</option>
    <option value="mortgage">Mortgage</option>
    <option value="home">Home</option>
    <option value="neighborhood">Neighborhood</option>
    <option value="agent">Agent</option>
  </select>
</div>

    
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Click User Prompt:</label>
      <textarea
        value={tile.image_click_user_prompt}
        onChange={(e) => handleFieldChange(index, 'image_click_user_prompt', e.target.value)}
        className={styles['form-input']} // Multi-line text area
        rows="1"
      />
    </div>
    
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Click System Prompt:</label>
      <textarea
        value={tile.image_click_system_prompt}
        onChange={(e) => handleFieldChange(index, 'image_click_system_prompt', e.target.value)}
        className={styles['form-input']} // Multi-line text area for long system prompts
        rows="4"
      />
    </div>
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Tile Instructions:</label>
      <textarea
        value={tile.image_tile_instructions}
        onChange={(e) => handleFieldChange(index, 'image_tile_instructions', e.target.value)}
        className={styles['form-input']} // Multi-line text area for long instructions
        rows="6"
      />
    </div>
    
    {/* Image Preview and Upload Section */}
    <div className={styles['tile-image-preview']}>
      <div className={styles['image-box']}>
        <img
          src={previewCarouselImages[index] || `${blobUrl}${defaultListingId}/${tile.image_file_name}`} 
          alt="Preview"
          className={styles['image-preview']}
        />
      </div>
      <label htmlFor={`file-upload-${index}`} className={styles['custom-file-upload']}>
        Choose File
      </label>
      <input
        type="file"
        id={`file-upload-${index}`}
        accept="image/*"
        className={styles['file-input']}
        onChange={(event) => handleImageChange(event, index)}
      />
    </div>
  </div>
))}
	  

          {/* Add Listing Button */}
          <div className={styles.navButtonContainer}>
            <button
              type="button"
              className={styles['back-button']}
              onClick={handleAddListing}
            >
              Add Tile
            </button>
          </div>	  
	  
			{/* Button Group for Save and Back to Main Navigation */}
			<div className=  {styles.navButtonContainer}>
			  <button type="button" className={styles['back-button']} onClick={(handleSave)}>
			  Back to Main
			  </button>		  
			</div>		
        </div>
      </form>
    </div>
  );
};

export default ListingAdminCarousel;
