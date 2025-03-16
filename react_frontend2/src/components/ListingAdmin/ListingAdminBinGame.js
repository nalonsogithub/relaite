import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminBinGame.module.css'; // Custom CSS styles
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const ListingAdminBinGame = () => {
  const {
    listingJson,
    setListingJson,
    addImage,
    previewBinGameImages,
    setPreviewBinGameImages,
    uploadedImages,
    defaultListingId,
    blobUrl,
  } = useContext(ListingAdminContext);

  const [gameImages, setGameImages] = useState(listingJson.games.bin_game); // Access the bin game data
  const navigate = useNavigate();

  // Handle image file selection and preview update
  const handleImageChange = (event, imageKey) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a temporary URL for preview

      // Update preview state for the current image
      setPreviewBinGameImages((prev) => ({ ...prev, [imageKey]: imageUrl }));

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
    const newImageKey = `images_${Object.keys(gameImages).filter(key => key.startsWith('images_')).length}`;
	const newIqmap = uuidv4(); // Generate a unique `iqmap
    const newTile = {
	  iqmap: newIqmap, // Add `iqmap
      image_id: uuidv4(),
      image_name: '',
      image_file: '',
      image_description: '',
      image_user_prompt: '',
      image_system_prompt: '',
      image_order: Object.keys(gameImages).length,
      location_id: uuidv4(),
    };
    setGameImages((prevImages) => ({
      ...prevImages,
      [newImageKey]: newTile,
    }));
  };

  // Delete an existing tile
//  const handleDeleteTile = (imageKey) => {
//    const updatedImages = { ...gameImages };
//    Object.keys(updatedImages)
//      .filter((key) => key.startsWith('questions_') && updatedImages[key].image_id === updatedImages[imageKey].image_id)
//      .forEach((qKey) => delete updatedImages[qKey]); // Remove associated questions
//    delete updatedImages[imageKey];
//    setGameImages(updatedImages);
//  };

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
	
	
  // Add a new question with `iqmap`
  const handleAddQuestion = (iqmap) => {
    const newQuestionKey = `questions_${Object.keys(gameImages).filter(key => key.startsWith('questions_')).length}`;
    const newQuestion = {
      iqmap: iqmap, // Link the question with the corresponding `iqmap`
      question_id: uuidv4(),
      question: '',
      question_type: 'yn',
      question_order: 0,
    };
    setGameImages((prevImages) => ({
      ...prevImages,
      [newQuestionKey]: newQuestion,
    }));
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
        bin_game: gameImages,
      },
    }));

    const formData = new FormData();
    uploadedImages.forEach((image, index) => {
      formData.append(`image_${index}`, image, image.name);
    });

    console.log('Updated Bin Game:', gameImages);
    navigate('/ListingAdminMainPage');
  };

  return (
    <div className={styles['bin-game-container']}>
      <h2 className={styles['page-title']}>Home Details</h2>
      <div className={styles['tile-container']}>
        {Object.keys(gameImages)
          .filter((key) => key.startsWith('images_'))
          .map((imageKey, index) => (
            <div key={imageKey} className={styles['tile']}>
  {/* Title and Delete Container */}
  <div className={styles['bingame-top-container']}>
    <div className={styles['bingame-title']}>
      <h3>{`Image ${index + 1}`}</h3> {/* Sequential numbering */}
    </div>
    <div className={styles['bingame-delete']}>
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
                    previewBinGameImages[imageKey] ||
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
			  {/*
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Image Name:</label>
                <input
                  type="text"
                  value={gameImages[imageKey].image_name}
                  onChange={(e) => handleFieldChange(imageKey, 'image_name', e.target.value)}
                  className={styles['form-input']}
                />
              </div>
			  */}
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Image Description:</label>
                <textarea
                  value={gameImages[imageKey].image_description}
                  onChange={(e) => handleFieldChange(imageKey, 'image_description', e.target.value)}
                  className={styles['form-input']}
                  rows="3"
                />
              </div>

              {/* Questions Section */}
              <div className={styles['questions-container']}>
                <h4>Questions</h4>
                {Object.keys(gameImages)
                  .filter((key) => key.startsWith('questions_') && gameImages[key].iqmap === gameImages[imageKey].iqmap)
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
                      {/* Delete Question Button */}
                      <button className={styles['delete-button']} onClick={() => handleDeleteQuestion(questionKey)}>
                        Delete Question
                      </button>
                    </div>
                  ))}
				<div className=  {styles.navButtonContainer}>  
					<button
					  className={styles['add-button']}
					  onClick={() => handleAddQuestion(gameImages[imageKey].iqmap)}
					>
					  Add New Question
					</button>
				</div>
              </div>

            </div>
          ))}
      </div>
      {/* Add New Tile Button */}
      <button className={styles['back-button']} onClick={handleAddTile}>
        Add New Tile
      </button>

	  <div className=  {styles.navButtonContainer}>
        <button type="button" className={styles['back-button']} onClick={(handleSave)}>
          Back to Main
        </button>		  
	  </div>

    </div>
  );
};

export default ListingAdminBinGame;
