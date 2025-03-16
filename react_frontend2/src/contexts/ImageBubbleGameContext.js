import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ListingAdminContext } from '../contexts/ListingAdminContext';



// Create the context
const ImageBubbleGameContext = createContext();

// Hook to use the context
export const useImageBubbleGameData = () => {
    const context = useContext(ImageBubbleGameContext);
    if (!context) {
        throw new Error('useImageBubbleGameData must be used within an ImageBubbleGameProvider');
    }
    return context;
};

// Default data if the API fails
const defaultGameData = [
  {
    listing_id: '2b78c611-af06-4449-a5b6-fb2d433faf8b',
    image_id: 'image1',
    image_file: '19-Woekel--Home-Front.gif',
    image_description: 'Front view of the home',
    image_user_prompt: '',
    image_system_prompt: '',
    location_id: 'location1',
    questions: [
      {
        question_id: 1,
        question: 'Good Price?',
        question_type: 'yn',
        question_order: 1,
      },
      {
        question_id: 2,
        question: 'Cramped?',
        question_type: 'yn',
        question_order: 2,
      },
    ],
  },
  {
    listing_id: '2b78c611-af06-4449-a5b6-fb2d433faf8b',
    image_id: 'image2',
    image_file: 'Welcome-to-Methuen.gif',
    image_description: 'Welcome to Methuen',
    image_user_prompt: '',
    image_system_prompt: '',
    location_id: 'location2',
    questions: [
      {
        question_id: 1,
        question: 'Easy Commute?',
        question_type: 'yn',
        question_order: 1,
      },
      {
        question_id: 2,
        question: 'Friendly?',
        question_type: 'yn',
        question_order: 2,
      },
    ],
  },
];

// Helper function to build the game data from listingJson
//const buildGameDataFromListingJson = (listingJson) => {
//    const imageBubbleGame = listingJson?.games?.image_bubble_game || {};
//	console.log('buildGameDataFromListingJson', imageBubbleGame);
//
//    // Convert the image data in the listingJson into the format expected by your component
////    return Object.keys(imageBubbleGame).map((key) => {
////        const imgData = imageBubbleGame[key];
////        return {
////            listing_id: listingJson.listing.listing_id, // Get the listing ID from the listingJson
////            image_id: imgData.image_id,
////            image_file: imgData.image_file,
////            image_description: imgData.image_description,
////            image_user_prompt: imgData.image_user_prompt || '',
////            image_system_prompt: imgData.image_system_prompt || '',
////            location_id: imgData.location_id,
////            image_order: imgData.image_order,
////            questions: imgData.questions.map((question) => ({
////                question_id: question.question_id,
////                question: question.question,
////                question_type: question.question_type,
////                question_order: question.question_order,
////                answer_frequencies: question.answer_frequencies || [], // Ensure answer frequencies are present
////            })),
////        };
////    });
//	return Object.keys(imageBubbleGame).map((key) => {
//		const imgData = imageBubbleGame[key];
//		console.log(`Processing image data for key: ${key}`);
//		console.log('Image data:', imgData);
//
//		// Filter questions that match the current image_id
//		const questions = Object.keys(imageBubbleGame)
//			.filter(qKey => {
//				const match = imageBubbleGame[qKey].image_id === imgData.image_id && qKey.startsWith('questions_');
//				console.log(`Checking question key: ${qKey} for image_id: ${imgData.image_id} - Match: ${match}`);
//				return match;
//			})
//			.map(qKey => {
//				const questionData = imageBubbleGame[qKey];
//				console.log('Matching question data:', questionData);
//				return {
//					question_id: questionData.question_id,
//					question: questionData.question,
//					question_type: questionData.question_type,
//					question_order: questionData.question_order,
//					answer_frequencies: questionData.answer_frequencies || [], // Ensure answer frequencies are present
//				};
//			});
//
//		console.log(`Found ${questions.length} questions for image_id: ${imgData.image_id}`);
//
//		// Return the structure for each image
//		const imageData = {
//			listing_id: listingJson.listing.listing_id.toLowerCase(), // Convert listing_id to lowercase
//			image_id: imgData.image_id,
//			image_file: imgData.image_file,
//			image_description: imgData.image_description,
//			image_user_prompt: imgData.image_user_prompt || '',
//			image_system_prompt: imgData.image_system_prompt || '',
//			location_id: imgData.location_id,
//			image_order: imgData.image_order,
//			questions: questions, // Attach questions related to this image_id
//		};
//
//		console.log('Constructed image data:', imageData);
//		return imageData;
//	});
//
//	
//	
//};

const buildGameDataFromListingJson = (listingJson, imageURL) => {
  const imageBubbleGame = listingJson?.games?.image_bubble_game || {};
  console.log('buildGameDataFromListingJson', imageBubbleGame);

  // Extract all image data entries
  const images = Object.keys(imageBubbleGame)
    .filter(key => key.startsWith('images_'))
    .map(key => imageBubbleGame[key]);

  // Extract all question data entries
  const questions = Object.keys(imageBubbleGame)
    .filter(key => key.startsWith('questions_'))
    .map(key => imageBubbleGame[key]);

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
      const url = `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${imgData.image_file}`;

      // Return the image data along with its associated questions and constructed URL
      const imageData = {
        listing_id: listingJson.listing.listing_id.toLowerCase(), // Convert listing_id to lowercase
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

      console.log('Constructed image data:', imageData);
      return imageData;
    })
    // Sort the images by image_order to preserve the order
    .sort((a, b) => a.image_order - b.image_order);

  return gameData;
};



// Function to fetch images and questions from Flask API
const fetchImageBubbleGameData = async () => {
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

    const image_base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2'; // Base URL for images

    try {
        const response = await axios.get(`${baseUrl}/get_imagebubblegame_images_questions`);
//        console.log('Fetched ImageBubbleGame data:', response.data);

        // Map through the response to build the image URLs dynamically
        return response.data.map(img => ({
            ...img,
			url: `${image_base_url}/${img.listing_id.toLowerCase()}/${img.image_file}`,
            questions: img.questions || [] // Ensure questions array exists
        }));
    } catch (error) {
        console.error('Error fetching ImageBubbleGame data:', error);
        return defaultGameData;
    }
};

// Context Provider
export const ImageBubbleGameProvider = ({ children }) => {
  const { listingJson, imageURL } = useContext(ListingAdminContext);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [gameData, setGameData] = useState([]); // State to store fetched data

//  const loadGameData = useCallback(async () => {
//    try {
//		
//      const data = await fetchImageBubbleGameData();
//      setGameData(data.length === 0 ? defaultGameData : data); // Store the fetched data
//	  console.log('GameData', data);
//      setDataLoaded(true); // Set the dataLoaded flag
//    } catch (error) {
//      console.error('Error loading ImageBubbleGame data:', error);
//      setGameData(defaultGameData); // Store default data in case of error
//      setDataLoaded(true);
//    }
//  }, []);


	// THIS CODE IS TO MOVE TO A JSON VERSION
    const loadGameData = useCallback(async () => {
        try {
            if (listingJson && listingJson.games && listingJson.games.image_bubble_game) {
                // Build game data from listingJson
                const data = buildGameDataFromListingJson(listingJson, imageURL);
                setGameData(data);
				console.log('GameData', data);
				
                setDataLoaded(true);
            } else {
                console.warn('Listing JSON or game data is not available. Using default data.');
                setGameData(defaultGameData);
                setDataLoaded(true);
            }
        } catch (error) {
            console.error('Error loading ImageBubbleGame data:', error);
            setGameData(defaultGameData); // Use default data in case of error
            setDataLoaded(true);
        }
    }, [listingJson]);	
	
	
  return (
    <ImageBubbleGameContext.Provider value={{ loadGameData, dataLoaded, gameData }}>
      {children}
    </ImageBubbleGameContext.Provider>
  );
};
// JavaScript Document