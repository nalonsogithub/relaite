import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ImageContext = createContext();

export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [staticImage, setStaticImage] = useState({
        id: uuidv4(),  // Generate a unique ID for consistency
        url: 'dynimg/SummarizeConvo.gif',
        title: 'Static Image',
        active: false,
        opening_question: ''
    });

    const resetImages = () => {
        setImages([]);
        setStaticImage({
            id: uuidv4(),
            url: 'dynimg/SummarizeConvo.gif',
            title: 'Static Image',
            active: false,
            opening_question: ''
        });
    };

    // Determine the base URL based on the hostname
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';

    const loadImageData = useCallback(async () => {
        try {
            // Fetch the image data from the appropriate API endpoint
            const response = await axios.get(`${baseUrl}/images`);
            const imagesWithIds = response.data.map(img => ({
                ...img,
                id: uuidv4(),  // Assign a unique UUID
                active: true
            }));

            // Fetch the summary prompt for the static image
            const summaryPromptResponse = await axios.get(`${baseUrl}/get_summary_prompt`);
            const summaryPrompt = summaryPromptResponse.data.summary_prompt;

            // Check if the summary image should be enabled
            const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
			console.log('enableStatusResponse', enableStatusResponse)
            const { should_enable } = enableStatusResponse.data;

            // Update the static image with the fetched summary prompt and enable status
            const updatedStaticImage = { 
                ...staticImage, 
                opening_question: summaryPrompt,
                active: should_enable
            };

            // Update state with the new images and updated static image
            setImages([...imagesWithIds, updatedStaticImage]);
            setStaticImage(updatedStaticImage);
        } catch (error) {
            console.error('Error fetching images or summary prompt:', error);
        }
    }, [staticImage]);

    const toggleImageActive = (id) => {
        setImages(prevImages => {
            const newImages = prevImages.map(img => {
                if (img.id === id) {
                    console.log(`Toggling image ${id} from ${img.active ? 'active' : 'inactive'} to ${!img.active ? 'active' : 'inactive'}`);
                    return { ...img, active: !img.active };
                }
                return img;
            });
            return newImages;
        });
    };

    return (
        <ImageContext.Provider value={{ images, loadImageData, toggleImageActive, resetImages }}>
            {children}
        </ImageContext.Provider>
    );
};
