import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminImageBubbleGame.module.css'; // Custom CSS styles
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const ListingAdminImageBubbleGame = () => {
  const {
    listingJson,
    setListingJson,
    addImage,
    previewBubbleImages,
    setPreviewBubbleImages,
    uploadedImages,
    defaultListingId,
    blobUrl,
  } = useContext(ListingAdminContext);

  const [gameImages, setGameImages] = useState(listingJson.games.image_bubble_game); // Access the bubble game data
  const navigate = useNavigate();

  // Handle image file selection and preview update
  const handleImageChange = (event, imageKey) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a temporary URL for preview

      // Update preview state for the current image
      setPreviewBubbleImages((prev) => ({ ...prev, [imageKey]: imageUrl }));

      addImage(file); // Add the image file to the upload queue

      // Update the listingJson with the new image file name
      setGameImages((prevImages) => ({
        ...prevImages,
        [imageKey]: { ...prevImages[imageKey], image_file: file.name },
      }));
    }
  };

  // Handle field changes for editable fields
  const handleFieldChange = (imageKey, field, value) => {
    setGameImages((prevImages) => ({
      ...prevImages,
      [imageKey]: { ...prevImages[imageKey], [field]: value },
    }));
  };

  // Handle question field changes
  const handleQuestionChange = (questionKey, field, value) => {
    setGameImages((prevImages) => ({
      ...prevImages,
      [questionKey]: { ...prevImages[questionKey], [field]: value },
    }));
  };

  // Add a new tile
  const handleAddTile = () => {
    const newImageKey = `images_${Object.keys(gameImages).filter((key) => key.startsWith('images_')).length}`;
	const newIqmap = uuidv4();
    const newTile = {
	  iqmap: newIqmap,
      image_id: uuidv4(),
      image_name: '',
      image_file: '',
      image_description: '',
      image_user_prompt: '',
      image_system_prompt: '',
      image_order: Object.keys(gameImages).filter((key) => key.startsWith('images_')).length,
      location_id: uuidv4(),
	  number_of_answers_expected: 3, // Default value for new field
    };
    setGameImages((prevImages) => ({
      ...prevImages,
      [newImageKey]: newTile,
    }));
  };


  // Delete an existing tile
  const handleDeleteTile = (imageKey) => {
    const updatedImages = { ...gameImages };

    // Get the `iqmap` of the image to be deleted
    const iqmapToDelete = updatedImages[imageKey].iqmap;

    // Delete all questions that have the same `iqmap`
    Object.keys(updatedImages)
      .filter((key) => key.startsWith('questions_') && updatedImages[key].iqmap === iqmapToDelete)
      .forEach((qKey) => delete updatedImages[qKey]); // Remove associated questions by `iqmap`

    // Delete the image itself
    delete updatedImages[imageKey];

    // Update the state with the modified game images
    setGameImages(updatedImages);
  };
	
	
// Add a new question to the selected image
const handleAddQuestion = (iqmap) => {
    console.log('Adding question to iqmap:', iqmap);
    if (!iqmap) {
        console.error('Invalid iqmap. Cannot add question.');
        return;
    }

    const newQuestionKey = `questions_${Object.keys(gameImages).filter((key) => key.startsWith('questions_')).length}`;
    const newQuestion = {
        iqmap: iqmap, // Set the iqmap value
        question_id: uuidv4(),
        question: '',
        question_type: 'yn',
        question_order: 0,
    };

    setGameImages((prevImages) => {
        const updatedImages = {
            ...prevImages,
            [newQuestionKey]: newQuestion,
        };

        // Debug: Log the updated state to check if the new question is being added correctly
        console.log('Updated gameImages after adding a question:', updatedImages);
        
        return updatedImages;
    });
};
	
  // Delete a question
  const handleDeleteQuestion = (questionKey) => {
  
    const updatedImages = { ...gameImages };
    delete updatedImages[questionKey];
    setGameImages(updatedImages);
  };

  // Save Changes and upload the images
  const handleSave = async () => {
    setListingJson((prevState) => ({
      ...prevState,
      games: {
        ...prevState.games,
        image_bubble_game: gameImages,
      },
    }));

    const formData = new FormData();
    uploadedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image, image.name);
    });

    console.log('Updated Image Bubble Game:', gameImages);
    navigate('/ListingAdminMainPage');
  };

  return (
    <div className={styles['bubble-game-container']}>
      <h2 className={styles['page-title']}>Edit Image Bubble Game</h2>
      <div className={styles['tile-container']}>
        {Object.keys(gameImages)
          .filter((key) => key.startsWith('images_'))
	      .sort((a, b) => gameImages[a].image_order - gameImages[b].image_order) // Sort by image_order
          .map((imageKey, index) => (
            <div key={imageKey} className={styles['tile']}>
	  
              {/* Title and Delete Container */}
              <div className={styles['bubble-top-container']}>
                <div className={styles['bubble-title']}>
                  <h3>{`Image ${index + 1}`}</h3> {/* Sequential numbering */}
                </div>
                <div className={styles['bubble-delete']}>
                  <button
                    type="button"
                    className={styles['delete-tile-button']}
                    onClick={() => handleDeleteTile(imageKey)}
                  >
                    X
                  </button>
                </div>
              </div>
              
              {/* Image Section */}
              <div className={styles['image-section']}>
                <img
                  src={
                    previewBubbleImages[imageKey] ||
                    `${blobUrl}${defaultListingId}/${gameImages[imageKey].image_file}`
                  }
                  alt="Preview"
                  className={styles['image-preview']}
                />
                <input
                  type="file"
                  accept="image/*"
                  className={styles['file-input']}
                  onChange={(e) => handleImageChange(e, imageKey)}
                />
              </div>

              {/* Editable Fields */}
  			  <div className={styles['form-group']}>
			    <label className={styles['form-label']}>Image Order:</label>
			    <input
				  type="number" // Make it a number input
				  value={gameImages[imageKey].image_order} // Use image_order instead of image_name
			      min="0" 
				  onChange={(e) => handleFieldChange(imageKey, 'image_order', e.target.value)} // Update image_order on change
				  className={styles['form-input']}
			    />
			  </div>			   

			<div className={styles['form-group']}>
			  <label className={styles['form-label']}>Number of Answers Expected:</label>
			  <input
				type="number"
				value={gameImages[imageKey].number_of_answers_expected ?? 3} // Default to 3 if undefined
				min="1"
				onChange={(e) => {
				  // Update the field and ensure it always has a default value
				  const value = e.target.value || 3; // Ensure value defaults to 3 if input is cleared
				  handleFieldChange(imageKey, 'number_of_answers_expected', value);
				}}
				className={styles['form-input']}
			  />
			</div>

              {/* Questions Section */}
              <div className={styles['questions-container']}>
                <h4>Questions</h4>
                {Object.keys(gameImages)
                  .filter((key) => key.startsWith('questions_') && gameImages[key].iqmap  === gameImages[imageKey].iqmap)
                  .map((questionKey, qIndex) => (
                    <div key={qIndex} className={styles['question-group']}>
                      <label>Question {qIndex + 1}:</label>
                      <input
                        type="text"
                        value={gameImages[questionKey].question}
                        onChange={(e) =>
                          handleQuestionChange(questionKey, 'question', e.target.value)
                        }
                        className={styles['question-input']}
                      />
                      <label>Order:</label>
                      <input
                        type="number"
                        value={gameImages[questionKey].question_order}
                        onChange={(e) =>
                          handleQuestionChange(questionKey, 'question_order', e.target.value)
                        }
                        className={styles['order-input']}
                      />
                      <button className={styles['delete-button']} onClick={() => handleDeleteQuestion(questionKey)}>
                        Delete Question
                      </button>
                    </div>
                  ))}
                <div className={styles.navButtonContainer}>
                  <button className={styles['add-button']} onClick={() => handleAddQuestion(gameImages[imageKey].iqmap)}>
                    Add New Question
                  </button>
                </div>
              </div>




            </div>
          ))}
      </div>
      <button className={styles['back-button']} onClick={handleAddTile}>
        Add New Tile
      </button>
      <div className={styles.navButtonContainer}>
        <button type="button" className={styles['back-button']} onClick={handleSave}>
          Back to Main
        </button>
      </div>
    </div>
  );
};

export default ListingAdminImageBubbleGame;
