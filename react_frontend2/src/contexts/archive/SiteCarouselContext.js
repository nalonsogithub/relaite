import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create the context
const SiteCarouselContext = createContext();

// Hook to use carousel images
export const useCarouselImages = () => {
    const context = useContext(SiteCarouselContext);
    if (!context) {
        throw new Error('useCarouselImages must be used within a SiteCarouselProvider');
    }
    return context;
};

// Function to fetch images from the Flask API
const fetchCarouselImages = async (carouselType) => {
    try {
		const baseUrl = window.location.hostname === 'localhost'
			? 'http://localhost:5000/api'
			: 'https://www.aigentTechnologies.com/api'; // Adjust as necessary

		const image_base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2';

        const response = await axios.get(`${baseUrl}/get_site_carousel`, { params: { type: carouselType } });
        
        return response.data.map(img => ({
            ...img,
            url: `${image_base_url}/${img.listing_id.toLowerCase()}/${img.image_file_name}`,  // Append base URL and listing_id to the image file name
        }));
    } catch (error) {
        console.error('Error fetching carousel images:', error);
		const listing_id = '2b78c611-af06-4449-a5b6-fb2d433faf8b';
		const image_base_url = 'https://hbbreact.blob.core.windows.net/hbbblob2';
        // Default fallback images in case the API is unavailable
        const defaultImages = [
            {
                listing_id: `${listing_id}`,
                image_file_name: '19-Woekel--Home-Front.gif',
                url: `${image_base_url}/${listing_id}/19-Woekel--Home-Front.gif`,
                image_tile_instructions: 'Default instructions 11',
                image_click_user_prompt: 'Discuss Details of the House',
                image_click_system_prompt: 'Discuss Details of the House System',
				image_tile_description: 'Get to know the home.',
				image_tile_destination: 'home'
            },
            {
                listing_id: `${listing_id}`,
                image_file_name: 'Patrick-Brusil-Headshot.gif',
                url: `${image_base_url}/${listing_id}/Patrick-Brusil-Headshot.gif`,
                image_tile_instructions: 'Default instructions 21',
                image_click_user_prompt: 'Discuss Details of the Agent',
                image_click_system_prompt: 'Discuss Details of the Agent System',
				image_tile_description: 'Get to know your Agent.',
				image_tile_destination: 'agent'

            }
        ];

        return defaultImages;		
    }
};

// Context Provider
export const SiteCarouselProvider = ({ children }) => {
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const loadImageData = useCallback(async (carouselType) => {
        try {
            const images = await fetchCarouselImages(carouselType);
            setImagesLoaded(true);
            return images;
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }, []);

    return (
        <SiteCarouselContext.Provider value={{ loadImageData, imagesLoaded }}>
            {children}
        </SiteCarouselContext.Provider>
    );
};

// Initialize Query Client
const queryClient = new QueryClient();

// Provider to wrap the app
export const SiteCarouselProviders = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SiteCarouselProvider>
                {children}
            </SiteCarouselProvider>
        </QueryClientProvider>
    );
};
