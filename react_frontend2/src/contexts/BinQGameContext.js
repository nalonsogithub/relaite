import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ListingAdminContext } from './ListingAdminContext';



// Create the context
const BinQGameContext = createContext();

// Hook to use BinQGame images and questions
export const useBinQGameImages = () => {
    const context = useContext(BinQGameContext);
    if (!context) {
        throw new Error('useBinQGameImages must be used within a BinQGameProvider');
    }
    return context;
};

// Default data if the API fails
const defaultImagesData = [
  {
	listing_id: '2b78c611-af06-4449-a5b6-fb2d433faf8b',
    image_id: 'IMG_001',
    image_file: '19-Woekel--Bathroom.gif',
    image_description: 'Default Bathroom',
    image_user_prompt: 'Tell me about the default bathroom.',
    image_system_prompt: 'Provide default details about the bathroom.',
    location_id: 'default_bathroom',
    questions: [
      {
        question_id: 1,
        question: 'Do you like this default bano?',
        question_type: 'yn',
        question_order: 2,
      },
      {
        question_id: 2,
        question: 'Is the default bathroom spacious?',
        question_type: 'yn',
        question_order: 1,
      },
    ],
  },
  {
	listing_id: '2b78c611-af06-4449-a5b6-fb2d433faf8b',
    image_id: 'IMG_002',
    image_file: '19-Woekel--Kitchen.gif',
    image_description: 'Default Kitchen',
    image_user_prompt: 'Tell me about the default kitchen.',
    image_system_prompt: 'Provide default details about the kitchen.',
    location_id: 'default_kitchen',
    questions: [
      {
        question_id: 1,
        question: 'Do you like the default kitchen?',
        question_type: 'yn',
        question_order: 1,
      },
      {
        question_id: 2,
        question: 'Is the default kitchen well equipped?',
        question_type: 'yn',
        question_order: 2,
      },
    ],
  },
];


// Function to build game data from listingJson
const buildGameDataFromListingJson = (listingJson, imageURL) => {
  const binGame = listingJson?.games?.bin_game || {};
  console.log('buildGameDataFromListingJson - bin_game', binGame);

  // Extract all image data entries
  const images = Object.keys(binGame)
    .filter(key => key.startsWith('images_'))
    .map(key => binGame[key]);

  // Extract all question data entries
  const questions = Object.keys(binGame)
    .filter(key => key.startsWith('questions_'))
    .map(key => binGame[key]);

  // Now associate questions with the relevant images based on image_id
  const gameData = images
    .map(imgData => {
      console.log(`Processing image data for image_id: ${imgData.image_id}`);

      // Find the questions that belong to the current image based on image_id
      const associatedQuestions = questions
        .filter(question => question.image_id === imgData.image_id)
        .map(questionData => ({
          question_id: questionData.question_id,
          question: questionData.question,
          question_type: questionData.question_type,
          question_order: questionData.question_order,
          answer_frequencies: questionData.answer_frequencies || [], // Ensure answer frequencies are present
        }));

      console.log(`Found ${associatedQuestions.length} questions for image_id: ${imgData.image_id}`);

      // Build the URL using imageURL, listing_id, and image_file
      const url = `${imageURL}${listingJson.listing.listing_id.toLowerCase()}/${imgData.image_file}`;

      // Return the image data along with its associated questions and constructed URL
      const imageData = {
        listing_id: listingJson.listing.listing_id.toLowerCase(),
        image_id: imgData.image_id,
        image_file: imgData.image_file,
        image_description: imgData.image_description,
        image_user_prompt: imgData.image_user_prompt || '',
        image_system_prompt: imgData.image_system_prompt || '',
        location_id: imgData.location_id,
        image_order: imgData.image_order,
        url: url, // Add the URL to the image data
        questions: associatedQuestions, // Attach associated questions here
      };

      console.log('Constructed image data for BinQGame:', imageData);
      return imageData;
    })
    // Sort the images by image_order to preserve the order
    .sort((a, b) => a.image_order - b.image_order);

  return gameData;
};




// Function to fetch images and questions from the Flask API
const fetchBinQGameImages = async () => {
    const baseUrl = (() => {
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        return 'http://localhost:5000/api';
      } else if (hostname === 'www.aigentTechnologies.com') {
        return 'https://www.aigentTechnologies.com/api';
      } else if (hostname === 'www.openhouseaigent.com') {
       return 'https://www.openhouseaigent.com/api';
      } else {
       return 'https://https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
      }
    })();		
	
//    const baseUrl = window.location.hostname === 'localhost'
//        ? 'http://localhost:5000/api'
//        : 'https://www.aigentTechnologies.com/api'; 

    const image_base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2';  // Base URL for images

    try {
        const response = await axios.get(`${baseUrl}/get_binQGame_images_questions`);
		
//		console.log('RESPONSE', response);

        // Map through the response to build the image URLs dynamically
        return response.data.map(img => ({
            ...img,
            url: `${image_base_url}/${img.listing_id.toLowerCase()}/${img.image_file}`,
            questions: img.questions || []  // Ensure questions array exists
        }));
    } catch (error) {
        console.error('Error fetching BinQGame images and questions:', error);
        return defaultImagesData.map(img => ({
            ...img,
				url: `${image_base_url}/${img.listing_id.toLowerCase()}/${img.image_file || 'placeholder.jpg'}`,
        }));
    }
};

  // Function to fetch answer percentages from Flask API
  const fetchAnswerPercentages = async () => {
      const baseUrl = (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
          return 'http://localhost:5000/api';
        } else if (hostname === 'www.aigentTechnologies.com') {
          return 'https://www.aigentTechnologies.com/api';
        } else if (hostname === 'www.openhouseaigent.com') {
         return 'https://www.openhouseaigent.com/api';
        } else {
         return 'https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
        }
      })();

      try {
//		  console.log('TRYING TO CALL get_binimageqgame_answer_percentages')
          const response = await axios.get(`${baseUrl}/get_binimageqgame_answer_percentages`);
//		  console.log('RESPONSE FROM PERCENTAGR CVALF', response);
		  
//          const response = await axios.get(`${baseUrl}/get_binimageqgame_answer_percentages`);
        
          return response.data;
      } catch (error) {
          console.error('Error fetching answer percentages:', error);
          throw error;
      }  
  };


// Context Provider
export const BinQGameProvider = ({ children }) => {
  const { listingJson, imageURL } = useContext(ListingAdminContext);	
  const [dataLoaded, setDataLoaded] = useState(false);
  const [gameData, setGameData] = useState([]);  // State to store fetched data

  const loadGameData = useCallback(async (listing_id) => {
    try {
      const data = buildGameDataFromListingJson(listingJson, imageURL);		
//      const data = await fetchBinQGameImages(listing_id);
      console.log('BinQGameProvider DATA', data);
      setGameData(data.length === 0 ? defaultImagesData : data);  // Store the fetched data
      setDataLoaded(true);  // Set the dataLoaded flag
    } catch (error) {
      console.error('Error loading BinQGame data:', error);
      setGameData(defaultImagesData);  // Store default data in case of error
      setDataLoaded(true);
    }
  }, []);
	
  const getAnswerPercentages = useCallback(async () => {
    try {
      const percentages = await fetchAnswerPercentages();
      return percentages;
    } catch (error) {
      console.error('Error fetching answer percentages:', error);
      return { up_scaled: 0, down_scaled: 0 };  // Return default values in case of error
    }
  }, []);	

  return (
    <BinQGameContext.Provider value={{ loadGameData, dataLoaded, gameData, getAnswerPercentages  }}>  {/* Provide gameData */}
      {children}
    </BinQGameContext.Provider>
  );
};


// Initialize Query Client
const queryClient = new QueryClient();

// Provider to wrap the app
export const BinQGameProviders = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <BinQGameProvider>
                {children}
            </BinQGameProvider>
        </QueryClientProvider>
    );
};
