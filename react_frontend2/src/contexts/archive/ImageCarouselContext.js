import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ImageContext = createContext();

export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
	const [c2_images, setC2_Images] = useState([]);
    const [staticImage, setStaticImage] = useState({
        id: uuidv4(),  // Generate a unique ID for consistency
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif',
        title: 'Static Image',
        active: false,
        opening_question: '',
        conversation_description: 'Summarize your conversation',
		userPrompt: ''

    });
    const returnHomeImage = {
        id: uuidv4(),
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/ReturnHome.gif',
        title: 'Return Home',
        active: true,
        conversation_description: 'Return to the welcome page'
    };

    const resetImages = () => {
		setC2_Images([]);
        setImages([]);
        setStaticImage({
            id: uuidv4(),
            url: 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif',
            title: 'Static Image',
            active: false,
            opening_question: '',
            conversation_description: 'Summarize your conversation',
			userPrompt: ''
        });
    };

    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hbb-zzz.azurewebsites.net/api';

    const loadImageData = useCallback(async (carouselName) => {
        try {
            const response = await axios.get(`${baseUrl}/images`, { params: { type: carouselName } });
            const imagesWithIds = response.data.map(img => ({
                ...img,
                id: uuidv4(),
                active: true,
				userPrompt: img.opening_prompt
            }));


			console.log('Fetched images with prompts:', imagesWithIds, response);
			
			
			if (carouselName === 'main') {
                const summaryPromptResponse = await axios.get(`${baseUrl}/get_summary_prompt`);
                const summaryPrompt = summaryPromptResponse.data.summary_prompt;

                const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
                const { should_enable } = enableStatusResponse.data;

                const updatedStaticImage = {
                    ...staticImage,
                    opening_question: summaryPrompt,
                    active: should_enable
                };
				
				setC2_Images([...imagesWithIds, updatedStaticImage, returnHomeImage]);
                setImages([...imagesWithIds, updatedStaticImage, returnHomeImage]);
                setStaticImage(updatedStaticImage);
            } else {
				console.log('IN ELSE')
				setC2_Images(imagesWithIds);
                setImages(imagesWithIds);
            }
        } catch (error) {
            console.error('Error fetching images or summary prompt:', error);
        }
    }, [staticImage, baseUrl]);

    const checkAndUpdateSummaryImageStatus = useCallback(async () => {
        try {
            const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
            const { should_enable } = enableStatusResponse.data;

            setStaticImage(prevStaticImage => {
                if (prevStaticImage.active !== should_enable) {
                    console.log(`Updating summary image status to: ${should_enable}`);
                    const updatedStaticImage = {
                        ...prevStaticImage,
                        active: should_enable
                    };

                    setImages(prevImages => {
                        const updatedImages = prevImages.map(img =>
                            img.id === prevStaticImage.id ? updatedStaticImage : img
                        );
                        console.log('Updated images:', updatedImages);
                        return updatedImages;
                    });

                    return updatedStaticImage;
                }
                return prevStaticImage;
            });
        } catch (error) {
            console.error('Error checking summary image status:', error);
        }
    }, [baseUrl]);

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
        <ImageContext.Provider value={{ c2_images, images, loadImageData, checkAndUpdateSummaryImageStatus, toggleImageActive, resetImages }}>
            {children}
        </ImageContext.Provider>
    );
};
