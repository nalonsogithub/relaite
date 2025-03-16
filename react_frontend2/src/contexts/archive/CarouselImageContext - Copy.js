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

    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';

    const loadImageData = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/images`);
            const imagesWithIds = response.data.map(img => ({
                ...img,
                id: uuidv4(),
                active: true
            }));

            const summaryPromptResponse = await axios.get(`${baseUrl}/get_summary_prompt`);
            const summaryPrompt = summaryPromptResponse.data.summary_prompt;

            let updatedStaticImage = { ...staticImage, opening_question: summaryPrompt };

            const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
            const { should_enable } = enableStatusResponse.data;

            if (should_enable) {
                updatedStaticImage = { ...updatedStaticImage, active: true };
            }

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
