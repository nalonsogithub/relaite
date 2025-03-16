import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

const ImageContext = createContext();

export const useImages = (carouselName) => {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error('useImages must be used within an ImageProvider');
    }
    const { useCarouselImages, loadImageData, imagesLoaded, setImagesLoaded } = context;
    return { ...useCarouselImages(carouselName), loadImageData, imagesLoaded, setImagesLoaded };
};

const fetchImages = async (carouselName) => {
    try {
      const baseUrl = (() => {
        const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            return 'http://localhost:5000/api';
          } else if (hostname === 'www.aigentTechnologies.com') {
            return 'https://www.aigentTechnologies.com/api';
          } else if (hostname === 'www.openhouseaigent.com') {
            return 'https://www.openhouseaigent.com/api';
          } else {
            return 'https://https://hbb-zzz.azurewebsites.net//api'; // Default URL if no match
          }
       })();		
		
        const response = await axios.get(`${baseUrl}/images`, { params: { type: carouselName } });
        const imagesWithIds = response.data.map(img => ({
            ...img,
            id: uuidv4(),
            active: true,
            userPrompt: img.opening_prompt
        }));
        // console.log('in fetchImages cn', carouselName, imagesWithIds);
        return imagesWithIds;
    } catch (error) {
        console.error('Error fetching images:', error);
        // You can return a default value or rethrow the error if needed
        return [];
    }
};

const fetchSummaryPrompt = async () => {
      const baseUrl = (() => {
        const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            return 'http://localhost:5000/api';
          } else if (hostname === 'www.aigentTechnologies.com') {
            return 'https://www.aigentTechnologies.com/api';
          } else if (hostname === 'www.openhouseaigent.com') {
            return 'https://www.openhouseaigent.com/api';
          } else {
            return 'https://https://hbb-zzz.azurewebsites.net//api'; // Default URL if no match
          }
       })();		
	
    const response = await axios.get(`${baseUrl}/get_summary_prompt`);
    return response.data.summary_prompt;
};

const fetchEnableStatus = async () => {
      const baseUrl = (() => {
        const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            return 'http://localhost:5000/api';
          } else if (hostname === 'www.aigentTechnologies.com') {
            return 'https://www.aigentTechnologies.com/api';
          } else if (hostname === 'www.openhouseaigent.com') {
            return 'https://www.openhouseaigent.com/api';
          } else {
            return 'https://https://hbb-zzz.azurewebsites.net//api'; // Default URL if no match
          }
       })();		
	
    const response = await axios.get(`${baseUrl}/enable_summary`);
    return response.data.should_enable;
};

export const ImageProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [selectedImageCount, setSelectedImageCount] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
	
    const summary_tile_description = [
        "Recap your journey! Click here for a summary of your visit and next steps",
        "Ready for next steps? Tap here to plan your move forward",
        "Review your experience. Click for a complete summary of your tour and interactions.",
        "Want a recap? Tap here to revisit key points and recommendations from your visit",
        "Next steps await! Click here for a summary of your visit and to find out how to proceed",
        "Did you miss anything?  Find out what your peers asked and thought about during their visit"
    ];

    const [summaryImage, setSummaryImage] = useState({
        id: uuidv4(),
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
    ];

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

	const useCarouselImages = (carouselName) => {
		const { data: images, isLoading, isError } = useQuery({
			queryKey: ['images', carouselName],
			queryFn: () => fetchImages(carouselName),
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
		});
		return { images, isLoading, isError };
	};

	
	
    const resetImages = () => {
        queryClient.invalidateQueries('images');
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

    const loadImageData = useCallback(async (carouselName) => {
        try {
			console.log('in loadImaageData Before fetchImages', carouselName);
            const fetchedImages = await queryClient.fetchQuery({
                queryKey: ['images', carouselName],
                queryFn: () => fetchImages(carouselName)
            });

            console.log('after loadImaageData carouselName ===', carouselName);
            if (carouselName === 'main') {
                const summaryPrompt = await fetchSummaryPrompt();
                const should_enable = await fetchEnableStatus();

                const updatedSummaryImage = {
                    ...summaryImage,
                    opening_question_1: 'Summarize My Conversation',
                    opening_prompt_1: summaryPrompt,
                    active: should_enable
                };

                const updatedImages = [...fetchedImages, mortgageCalculatorImage, loanApprovalImage, updatedSummaryImage, returnHomeImage];
                console.log('loadImageData: in main', updatedImages);

                setSummaryImage(updatedSummaryImage);
                queryClient.setQueryData(['images', 'main'], updatedImages);
				console.log('loadImageData: END queryClient', queryClient);
            } else {
                const updatedImages = [...fetchedImages, returnHomeImage];
                console.log('loadImageData: Not in main', updatedImages);
                queryClient.setQueryData(['images', carouselName], updatedImages);
            }
			setImagesLoaded(true);
            updateSelectedImageCount();
        } catch (error) {
            console.error('Error fetching images:', error);
            // Handle error, e.g., display an error message or fallback UI
        }
    }, [queryClient, summaryImage]);

    const updateSelectedImageCount = () => {
        const mainImages = queryClient.getQueryData(['images', 'main']) || [];
        const activeImages = mainImages.filter(img => img.active).length;
        setSelectedImageCount(activeImages);
    };

    useEffect(() => {
        updateSelectedImageCount();
    }, [queryClient]);

    const checkAndUpdateSummaryImageStatus = useCallback(async () => {
        const should_enable = await fetchEnableStatus();
        setSummaryImage(prevSummaryImage => {
            if (prevSummaryImage.active !== should_enable) {
                const updatedSummaryImage = {
                    ...prevSummaryImage,
                    active: should_enable
                };

                queryClient.setQueryData(['images', 'main'], prevImages => {
                    return prevImages.map(img => img.id === prevSummaryImage.id ? updatedSummaryImage : img);
                });

                return updatedSummaryImage;
            }
            return prevSummaryImage;
        });
    }, [queryClient]);

    const toggleImageActive = (id, carouselName) => {
        queryClient.setQueryData(['images', carouselName], prevImages => {
            return prevImages.map(img => {
                if (img.id === id) {
                    return { ...img, active: !img.active };
                }
                return img;
            });
        });
        updateSelectedImageCount();
    };

    const loadMainImagesAndReset = () => {
        resetImages();
        loadImageData('main');
    };

    return (
        <ImageContext.Provider value={{ useCarouselImages, resetImages, loadImageData, checkAndUpdateSummaryImageStatus, toggleImageActive, loadMainImagesAndReset, selectedImageCount }}>
            {children}
        </ImageContext.Provider>
    );
};

const queryClientInstance = new QueryClient();

export const AppProviders = ({ children }) => {
    return (
        <QueryClientProvider client={queryClientInstance}>
            <ImageProvider>
                {children}
            </ImageProvider>
        </QueryClientProvider>
    );
};
