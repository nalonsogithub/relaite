import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ImageContext = createContext();

export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [c2_images, setC2_Images] = useState([]);
	
	const summary_tile_description = [
		"Recap your journey! Click here for a summary of your visit and next steps",
		"Ready for next steps? Tap here to plan your move forward",
		"Review your experience. Click for a complete summary of your tour and interactions.",
		"Want a recap? Tap here to revisit key points and recommendations from your visit",
		"Next steps await! Click here for a summary of your visit and to find out how to proceed",
		"Did you miss anything?  Find out what your peers asked and thought about during their visit"
	]
    const [summaryImage, setSummaryImage] = useState({
        id: uuidv4(),  // Generate a unique ID for consistency
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif',
        title: 'Summary Image',
        active: false,
        opening_question_1: '',
        opening_prompt_1: '',
        opening_question_2: '',
        opening_prompt_2: '',
        conversation_description: summary_tile_description,
        conversation_code: 'summary',
        userPrompt: '',
        conversation_destination: 'summary'
    });

    const returnHomeImage = {
        id: uuidv4(),
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/ReturnHome.gif',
        title: 'Return',
        active: true,
        opening_question_1: 'Return',
        opening_prompt_1: '',
        opening_question_2: '',
        opening_prompt_2: '',
        conversation_description: 'Return',
        conversation_code: 'back',
        userPrompt: '',
        conversation_destination: 'back'
    };

    const mortgageCalculatorImage = {
        id: uuidv4(),
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/MortgageCalculator_2.webp',
        title: 'Mortgage Calculator',
        active: true,
        opening_question_1: 'Mortgage Calculator',
        opening_prompt_1: '',
        opening_question_2: '',
        opening_prompt_2: '',
        conversation_code: 'mortgage',
        userPrompt: '',
        conversation_destination: 'mortgage'
    };

	const loan_tile_description = [
		"Financing options made easy. Click here to learn about your mortgage choices",
		"3% Down Payment?  On a Renovation Loan?? What???",
		"Wondering about costs? Tap to explore mortgage options, including renovation loans",
		"Get smart about financing. Click to understand your mortgage options and renovation loan possibilities",
		"Your path to homeownership! Tap here to learn about mortgage solutions and renovation financing",
		"Sage advise regarding how to combine Down Payment Assistance with a Renovation Loan"		
	]
    const loanApprovalImage = {
        id: uuidv4(),
        url: 'https://hbbreact.blob.core.windows.net/hbbblob2/Loan_Approval.webp',
        title: 'Loan Approval',
        active: true,
        conversation_description: loan_tile_description,
        opening_question_1: 'Loan Pre-Approval',
        opening_prompt_1: 'Walk me through the process of getting approved for a loan.',
        opening_question_2: '',
        opening_prompt_2: '',
        conversation_code: 'loan',
        userPrompt: 'Walk me through the process of getting approved for a loan.',
        conversation_destination: 'loan'
    };

    const resetImages = () => {
        setC2_Images([]);
        setImages([]);
        setSummaryImage({
            id: uuidv4(),
            url: 'https://hbbreact.blob.core.windows.net/hbbblob2/SummarizeConvo.gif',
            title: 'Summary Image',
            active: false,
            conversation_description: 'Summarize your conversation',
            opening_question_1: 'Summarize Our Conversation',
            opening_prompt_1: 'Summarize the conversation we have had to this point.',
            opening_question_2: '',
            opening_prompt_2: '',
            conversation_code: 'summary',
            userPrompt: 'Summarize the conversation we have had to this point.',
            conversation_destination: 'summary'
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

//            console.log('Fetched images with prompts:', imagesWithIds, response);

            if (carouselName === 'main') {
                const summaryPromptResponse = await axios.get(`${baseUrl}/get_summary_prompt`);
                const summaryPrompt = summaryPromptResponse.data.summary_prompt;

                const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
                const { should_enable } = enableStatusResponse.data;

                const updatedSummaryImage = {
                    ...summaryImage,
                    opening_question_1: 'Summarize My Conversation',
					opening_prompt_1: summaryPrompt,
                    active: should_enable
                };

                const updatedImages = [...imagesWithIds, mortgageCalculatorImage, loanApprovalImage, updatedSummaryImage, returnHomeImage];

                setC2_Images(updatedImages);
                setImages(updatedImages);
                setSummaryImage(updatedSummaryImage);
            } else {
                const updatedImages = [...imagesWithIds, returnHomeImage];
				
                setC2_Images(updatedImages);
                setImages(updatedImages);
            }
        } catch (error) {
            console.error('Error fetching images or summary prompt:', error);
        }
    }, [summaryImage, baseUrl]);

    const loadMainImages = () => loadImageData('main');
    const loadDetailImages = () => loadImageData('detail');
    const loadRenovationImages = () => loadImageData('renovation');

    const checkAndUpdateSummaryImageStatus = useCallback(async () => {
        try {
            const enableStatusResponse = await axios.get(`${baseUrl}/enable_summary`);
            const { should_enable } = enableStatusResponse.data;

            setSummaryImage(prevSummaryImage => {
                if (prevSummaryImage.active !== should_enable) {
//                    console.log(`Updating summary image status to: ${should_enable}`);
                    const updatedSummaryImage = {
                        ...prevSummaryImage,
                        active: should_enable
                    };

                    setImages(prevImages => {
                        const updatedImages = prevImages.map(img =>
                            img.id === prevSummaryImage.id ? updatedSummaryImage : img
                        );
//                        console.log('Updated images:', updatedImages);
                        return updatedImages;
                    });

                    return updatedSummaryImage;
                }
                return prevSummaryImage;
            });
        } catch (error) {
            console.error('Error checking summary image status:', error);
        }
    }, [baseUrl]);

    const toggleImageActive = (id) => {
        setImages(prevImages => {
            const newImages = prevImages.map(img => {
                if (img.id === id) {
//                    console.log(`Toggling image ${id} from ${img.active ? 'active' : 'inactive'} to ${!img.active ? 'active' : 'inactive'}`);
                    return { ...img, active: !img.active };
                }
                return img;
            });
            return newImages;
        });
    };

    const loadMainImagesAndReset = () => {
        resetImages(); // Clear current images
        loadMainImages(); // Load main images again
    };

    return (
        <ImageContext.Provider value={{ c2_images, images, loadImageData, checkAndUpdateSummaryImageStatus, toggleImageActive, resetImages, loadMainImagesAndReset }}>
            {children}
        </ImageContext.Provider>
    );
};
