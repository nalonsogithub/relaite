import { useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { ListingAdminContext } from '../../contexts/ListingAdminContext';
import styles from '../../styles/ListingAdmin/ListingAdminQuestions.module.css'; // Custom CSS styles
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const ListingAdminQuestions = () => {
  const { listingJson, setListingJson, convoTopValues } = useContext(ListingAdminContext);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState('predetermined_questions'); // Track the selected question set
  const navigate = useNavigate();


  const currentQuestions = listingJson.questions || {};

  // Get the next highest order number for a given question set
  const getNextOrderNumber = () => {
    const questionKeys = Object.keys(currentQuestions).filter(key => key.startsWith(selectedQuestionSet));
    if (questionKeys.length === 0) return 1; // If no questions, start at 1
    // Get the highest order value in the selected question set
    const maxOrder = Math.max(
      ...questionKeys.map((key) =>
        currentQuestions[key].qucik_question_order !== undefined
          ? currentQuestions[key].qucik_question_order
          : questionKeys.indexOf(key) + 1 // Use a fallback for sequential order in predetermined questions
      )
    );
    return maxOrder + 1;
  };

  // Handle field changes for editable fields
  const handleFieldChange = (questionKey, field, value) => {
    setListingJson((prevState) => {
      const updatedQuestions = { ...prevState.questions };

      // Safely update the field, ensuring the field exists in the structure
      if (updatedQuestions[questionKey]) {
        updatedQuestions[questionKey][field] = value;
      } else {
        updatedQuestions[questionKey] = { [field]: value };
      }

      return { ...prevState, questions: updatedQuestions };
    });
  };

  // Handle question addition
  const handleAddQuestion = () => {
    const newQuestionKey = `${selectedQuestionSet}_${Object.keys(currentQuestions).filter(key => key.startsWith(selectedQuestionSet)).length}`;
    const newQuestion = {
      question_id: uuidv4(),
      listing_id: '45c3a3d4-2292-43b8-b915-70a99ea74599',
      system_prompt_text: '',
      response_text: '',
      quick_question: '',
      quick_question_system_prompt: '',
      qucik_question_order: getNextOrderNumber(), // Assign the next highest order number
      SITE_LOCATION: '',
      CONVOTOP: 'default',
    };
    setListingJson((prevState) => ({
      ...prevState,
      questions: {
        ...prevState.questions,
        [newQuestionKey]: newQuestion,
      },
    }));
  };

  // Handle question deletion
  const handleDeleteQuestion = (questionKey) => {
    setListingJson((prevState) => {
      const updatedQuestions = { ...prevState.questions };
      delete updatedQuestions[questionKey];
      return { ...prevState, questions: updatedQuestions };
    });
  };

  // Save Changes and upload the images
  const handleSave = async () => {
    navigate('/ListingAdminMainPage');
  };
	
  return (
    <div className={styles['questions-container']}>
      <h2 className={styles['page-title']}>Edit Questions</h2>

      {/* Button Container for Switching Between Question Sets */}
      <div className={styles['button-container']}>
        {['predetermined_questions', 'site_location_questions', 'conversation_topic_questions'].map((setKey) => (
          <button
            key={setKey}
            className={styles['button']}
            onClick={() => setSelectedQuestionSet(setKey)}
            style={{ backgroundColor: selectedQuestionSet === setKey ? '#3b4f77' : '' }}
          >
            {setKey.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles['tile-container']}>
        {/* Display Tiles for the Selected Question Set */}
        {Object.keys(currentQuestions)
          .filter((key) => key.startsWith(selectedQuestionSet))
          .map((questionKey, index) => (
            <div key={questionKey} className={styles['tile']}>
              {/* Sequential Order Number */}
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Order:</label>
                <input
                  type="number"
                  value={currentQuestions[questionKey].qucik_question_order || index + 1}
                  onChange={(e) => handleFieldChange(questionKey, 'qucik_question_order', e.target.value)}
                  className={styles['order-input']}
                  min="1"
                />
              </div>

              {/* Display Fields Based on the Selected Question Set */}
              {selectedQuestionSet === 'predetermined_questions' && (
                <>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>System Prompt Text:</label>
                    <textarea
                      value={currentQuestions[questionKey].system_prompt_text}
                      onChange={(e) => handleFieldChange(questionKey, 'system_prompt_text', e.target.value)}
                      className={styles['form-textarea']}
                      rows="3"
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Response Text:</label>
                    <textarea
                      value={currentQuestions[questionKey].response_text}
                      onChange={(e) => handleFieldChange(questionKey, 'response_text', e.target.value)}
                      className={styles['form-textarea']}
                      rows="4"
                    />
                  </div>
                </>
              )}

              {selectedQuestionSet === 'site_location_questions' && (
                <>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Site Location:</label>
                    <input
                      type="text"
                      value={currentQuestions[questionKey].SITE_LOCATION || ''}
                      onChange={(e) => handleFieldChange(questionKey, 'SITE_LOCATION', e.target.value)}
                      className={styles['form-input']}
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Quick Question:</label>
                    <textarea
                      value={currentQuestions[questionKey].quick_question || ''}
                      onChange={(e) => handleFieldChange(questionKey, 'quick_question', e.target.value)}
                      className={styles['form-textarea']}
                      rows="3"
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>System Prompt:</label>
                    <textarea
                      value={currentQuestions[questionKey].quick_question_system_prompt || ''}
                      onChange={(e) => handleFieldChange(questionKey, 'quick_question_system_prompt', e.target.value)}
                      className={styles['form-textarea']}
                      rows="4"
                    />
                  </div>
                </>
              )}

              {selectedQuestionSet === 'conversation_topic_questions' && (
                <>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Conversation Topic:</label>
                    <select
                      value={currentQuestions[questionKey].CONVOTOP || 'default'}
                      onChange={(e) => handleFieldChange(questionKey, 'CONVOTOP', e.target.value)}
                      className={styles['form-select']}
                    >
                      {convoTopValues.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic.replace(/-/g, ' ').toUpperCase()}
                        </option>
                      ))}

                    </select>
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>Quick Question:</label>
                    <textarea
                      value={currentQuestions[questionKey].quick_question || ''}
                      onChange={(e) => handleFieldChange(questionKey, 'quick_question', e.target.value)}
                      className={styles['form-textarea']}
                      rows="3"
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>System Prompt:</label>
                    <textarea
                      value={currentQuestions[questionKey].quick_question_system_prompt || ''}
                      onChange={(e) => handleFieldChange(questionKey, 'quick_question_system_prompt', e.target.value)}
                      className={styles['form-textarea']}
                      rows="4"
                    />
                  </div>
                </>
              )}

              {/* Delete Button */}
              <div className={styles['button-group']}>
                <button
                  className={styles['delete-button']}
                  onClick={() => handleDeleteQuestion(questionKey)}
                >
                  Delete Question
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Button to Add a New Question */}
      <div className={styles['button-group']}>
        <button className={styles['back-button']} onClick={handleAddQuestion}>
          Add New Question
        </button>
      </div>
      <div className={styles.navButtonContainer}>
        <button type="button" className={styles['back-button']} onClick={handleSave}>
          Back to Main
        </button>
      </div>

    </div>
  );
};

export default ListingAdminQuestions;
