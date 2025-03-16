import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    sub_directory: 'c2',
    image_description: 'Default Bathroom',
    image_user_prompt: 'Tell me about the default bathroom.',
    image_system_prompt: 'Provide default details about the bathroom.',
    location_id: 'default_bathroom',
    questions: [
      {
        question_id: 1,
        question: 'Do you like this default bathroom?',
        question_type: 'yn',
        question_order: 1,
      },
      {
        question_id: 2,
        question: 'Is the default bathroom spacious?',
        question_type: 'yn',
        question_order: 2,
      },
    ],
  },
  {
	listing_id: '2b78c611-af06-4449-a5b6-fb2d433faf8b',
    image_id: 'IMG_002',
    image_file: '	19-Woekel--Kitchen.gif',
    sub_directory: 'c2',
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

// Function to fetch images and questions from the Flask API
const fetchBinQGameImages = async (listing_id) => {
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://www.aigentTechnologies.com/api'; // Adjust this URL for production

    const image_base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2';  // Base URL for images

    try {
        const response = await axios.get(`${baseUrl}/get_binQGame_images_questions`, {
            params: { listing_id }  // Ensure listing_id is sent to the API
        });

        // Map through the response to build the image URLs dynamically
        return response.data.map(img => ({
            ...img,
            url: `${image_base_url}/${img.sub_directory}/${img.image_file}`,
            questions: img.questions || []  // Ensure questions array exists
        }));
    } catch (error) {
        console.error('Error fetching BinQGame images and questions:', error);
        return defaultImagesData.map(img => ({
            ...img,
				url: `${image_base_url}/${img.listing_id}/${img.sub_directory || 'default'}/${img.image_file || 'placeholder.jpg'}`,
        }));
    }
};


// Context Provider
export const BinQGameProvider = ({ children }) => {
    const [dataLoaded, setDataLoaded] = useState(false);

    const loadGameData = useCallback(async (listing_id) => {
        try {
            const data = await fetchBinQGameImages(listing_id);
            setDataLoaded(true);
            return data.length === 0 ? defaultImagesData : data;
        } catch (error) {
            console.error('Error loading BinQGame data:', error);
            setDataLoaded(true);
            return defaultImagesData;  // Return default data in case of failure
        }
    }, []);

    return (
        <BinQGameContext.Provider value={{ loadGameData, dataLoaded }}>
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
