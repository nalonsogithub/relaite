import React, { createContext, useState, useEffect, useRef, useCallback  } from 'react';
import { defaultListingJson, defaultListingDetails } from './DefaultData'; // Import default data
//import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import _ from 'lodash';
import axios from 'axios';


// Create Context
export const ListingAdminContext = createContext();

// Provider Component
export const ListingAdminProvider = ({ children }) => {
//  const queryClient = useQueryClient();
	
  const [listingJson, setListingJson] = useState(defaultListingJson);
  const [uploadedImages, setUploadedImages] = useState([]); // List of uploaded images
  const [selectedSection, setSelectedSection] = useState(""); // Selected section state
  const [previewListingImages, setPreviewListingImages] = useState({});
  const [previewAgentImages, setPreviewAgentImages] = useState({});
  const [previewCarouselImages, setPreviewCarouselImages] = useState({});
  const [previewBinGameImages, setPreviewBinGameImages] = useState({});
  const [previewBubbleImages, setPreviewBubbleImages] = useState({});
  const [listingImages, setListingImages] = useState({});
  const [jsonChanged, setJsonChanged] = useState(false);
  const [viewListings, setViewListings] = useState([]); // State for view listings
  const [adminListings, setAdminListings] = useState([]); // State for admin listings	
  const [qRCode, setQRCode] = useState(null); // New state for storing QR Code
  const [qRCodeUrl, setQRCodeUrl] = useState(""); // State to hold the generated QR code URL
  const [versions, setVersions] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);	
  const imageURL = "https://aigentstorage.blob.core.windows.net/aigentstorage/";
	
	
  // Store a deep copy of the initial JSON for comparison
  const initialJsonRef = useRef(_.cloneDeep(listingJson));

  // Use a deep comparison to detect changes to listingJson
  useEffect(() => {
    const isChanged = !_.isEqual(listingJson, initialJsonRef.current);
    setJsonChanged(isChanged);
  }, [listingJson]);	
	
  // Add CONVOTOP values to the context
  const convoTopValues = [
    'default',
    'help',
    'property-details',
    'pricing',
    'neighborhood',
    'schedule-viewing',
    'agent-contact',
    'buying-process',
    'mortgage-info',
    'documents',
    'comparison',
  ];	
  const baseUrl = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:5000/api';
    } else if (hostname === 'www.aigentTechnologies.com') {
      return 'https://www.aigentTechnologies.com/api';
    } else if (hostname === 'www.openhouseaigent.com') {
      return 'https://www.openhouseaigent.com/api';
    } else {
      return 'https://hbb-zzz.azurewebsites.net/api';
    }
  })();
	
	
  const updateUserAdminRights = async () => {
    try {
      // Call the Flask route
      const response = await axios.post(`${baseUrl}/update_user_admin_rights`);

      // Log response and handle success
      if (response.status === 200 && response.data.message) {
//        console.log("Admin rights updated successfully:", response.data.message);

        // Optionally fetch the updated listings if required
        await fetchUserListings();
      } else {
        console.error("Failed to update admin rights:", response.data.error);
      }
    } catch (error) {
      console.error("Error updating admin rights:", error.message);
    }
  };	
	
	
  // Fetch listings based on user rights from the backend
  const fetchUserListings = async () => {
    try {
      const response = await axios.get('/api/get_user_listings'); // Fetch listings
	  const { listings, versions } = response.data;

//      console.log('Fetched View Listings:', listings.view || []);
//      console.log('Fetched Admin Listings:', listings.admin || []);
//      console.log('Fetched Versions:', versions	 || []);
 
      // Update state only if values are different to avoid unnecessary re-renders
      if (!_.isEqual(listings.view, viewListings)) {
        setViewListings(listings.view || []);
      }
      if (!_.isEqual(listings.admin, adminListings)) {
        setAdminListings(listings.admin || []);
      }
	  setVersions(versions || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  }; 
	
  /**
   * Function to reset the listing ID in the session by calling the Flask route.
   */
  const resetListingId = async () => {
    try {
      const response = await axios.post(`${baseUrl}/reset_listing_id`);
//      console.log('Reset Listing ID Response:', response.data);

      if (response.data.success) {
        setDefaultListingId(''); // Clear the defaultListingId in context state
//        console.log("Listing ID reset successfully.");
      } else {
        console.error("Failed to reset Listing ID:", response.data.message);
      }
    } catch (error) {
      console.error('Error resetting Listing ID:', error);
    }
  };	
	

  // UseQuery for fetching data (e.g., listings, site JSON)
  const fetchSiteJson = async (listingId) => {
    const response = await axios.get(`${baseUrl}/get_site_json`, { params: { listing_id: listingId } });
    return response.data;
  };
	
	
	/**
   * Function to load site JSON from Flask and update the listingJson state.
   * @param {string} listingId - The ID of the listing to load.
   */
  const loadSiteJsonFromBackend = async (listingId, set_listing_id = true) => {
    try {
      // Make a request to the backend Flask API to get the site JSON for the given listing_id
      const response = await axios.get(`${baseUrl}/get_site_json`, { params: { listing_id: listingId, set_listing_id: set_listing_id } });
      
      // Check if the request was successful and the data is returned
      if (response.status === 200 && response.data) {
        setListingJson(response.data); // Update the listing JSON state
        initialJsonRef.current = _.cloneDeep(response.data); // Update the reference for comparison
//        console.log("Loaded Site JSON:", response.data);
		  
      // Set the defaultListingId from the loaded JSON data
      if (response.data.listing && response.data.listing.listing_id) {
        setDefaultListingId(response.data.listing.master_listing_id.toLowerCase());
//        console.log("Updated defaultListingId:", response.data.listing.master_listing_id.toLowerCase());
      }
		  
      } else {
        console.error("Failed to load site JSON from backend:", response.data.message);
      }
    } catch (error) {
      console.error("Error loading site JSON from backend:", error.message);
    }
  };	
	
  // Function to handle listing admin actions (create or edit)
  const handleListingAdminAction = async (actionType) => {
    try {
      const formData = new FormData();
      formData.append('siteJson', JSON.stringify(listingJson)); // Attach siteJson to the formData
      formData.append('actionType', actionType); // Indicate the action type (create or edit)

      // Append uploaded images to formData
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image, image.name);
      });

      // Call the backend Flask route
      const response = await axios.post(`${baseUrl}/listing-admin-action`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle the response from the backend
      if (response.data.success) {
        console.log(`Action '${actionType}' completed successfully.`);
      } else {
        console.error(`Action '${actionType}' failed:`, response.data.message);
      }
    } catch (error) {
      console.error('Error handling listing admin action:', error.message);
    }
  };	
	
	
  // Function to load Bin Game images and associated questions
  const LoadBinGameImages = useCallback(() => {
    if (!listingJson || !listingJson.games || !listingJson.games.bin_game) {
//      console.log('No bin_game found in listingJson.');
      return [];
    }

    const binGame = listingJson?.games?.bin_game || {};
//    console.log('LoadBinGameImages - bin_game', binGame);

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
//        console.log(`Processing image data for image_id: ${imgData.image_id}`);

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

//        console.log(`Found ${associatedQuestions.length} questions for image_id: ${imgData.image_id}`);

        // Build the URL using imageURL, listing_id, and image_file
//        const url = `${imageURL}${listingJson.listing.listing_id.toLowerCase()}/${imgData.image_file}`;
        const url = `${imageURL}${listingJson.listing.master_listing_id.toLowerCase()}/${imgData.image_file}`;

        // Return the image data along with its associated questions and constructed URL
        const imageData = {
          listing_id: listingJson.listing.master_listing_id.toLowerCase(),
//          listing_id: listingJson.listing.listing_id.toLowerCase(),
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

//        console.log('Constructed image data for BinQGame:', imageData);
        return imageData;
      })
      // Sort the images by image_order to preserve the order
      .sort((a, b) => a.image_order - b.image_order);

    return gameData;
  }, [listingJson, imageURL]);	
	
	
	
	
  // GET THESE FROM FLASK
  const [blobUrl] = useState('https://aigentstorage.blob.core.windows.net/aigentstorage/');
  const [defaultListingId, setDefaultListingId] = useState(listingJson.listing.master_listing_id);
//  const [defaultListingId, setDefaultListingId] = useState(listingJson.listing.listing_id);
	
  // New `listing_options` dictionary for dropdown
  const [listingOptions] = useState({
    Woekel: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
    Empty: "",
  });	
	
  // Effect to monitor uploadedImages changes
  useEffect(() => {
//    console.log("Updated Image List:", uploadedImages);
  }, [uploadedImages]);

  // Function to add new images to the list
  const addImage = (imageObject) => {
    setUploadedImages((prevImages) => {
      const newImageList = [...prevImages, imageObject];
//      console.log("Image Added: ", imageObject.name); // Log individual image added
      return newImageList;
    });
  };

  // New function to generate a QR Code and URL from the Flask backend
  const generateQRCode = async (listingId) => {
    try {
	  const baseUrl = `${window.location.origin}/listings`; // Get the current base URL dynamically with /listings subdirectory
      const response = await axios.post('/generate_qr', { base_url: baseUrl, listing_id: listingId });
//      const response = await axios.post('/generate_qr', { base_url: baseUrl, listing_id: listingId });

      if (response.status === 200 && response.data) {
        setQRCode(response.data.qr_code); // Set the QR code data in the context
        setQRCodeUrl(response.data.url); // Set the URL for the QR code
//        console.log("QR Code generated successfully:", response.data);
      } else {
        console.error('Failed to generate QR code:', response.data);
      }
    } catch (error) {
      console.error('Error generating QR code:', error.message);
    }
  };	
//  // Function to load carousel images based on carousel type
//  const loadCarouselImages = useCallback(async (carouselType) => {
//    try {
//      // Check if listingJson and listingJson.carousel are available
//      if (listingJson && listingJson.carousel) {
//        console.log('ListingJson from ListingAdminContext:', listingJson);
//
//        // Filter carousel images based on the carousel type
//        const carouselImages = listingJson.carousel.filter(image => image.carousel_type === carouselType);
//
//        // Map the images to match the structure needed
////        const images = carouselImages.map(img => ({
////          ...img,
////          url: `${blobUrl}/${img.listing_id.toLowerCase()}/${img.image_file_name}`,  // Construct the full image URL
////        }));
//        const images = carouselImages.map(img => ({
//          ...img,
//          url: `${blobUrl}/${img.master_listing_id.toLowerCase()}/${img.image_file_name}`,  // Construct the full image URL
//        }));
//
//        setImagesLoaded(true);
//        return images;
//      } else {
//        console.error('listingJson or carousel is not available');
//        return [];
//      }
//    } catch (error) {
//      console.error('Error loading images:', error);
//      return [];
//    }
//  }, [listingJson, blobUrl]);	
	
  return (
    <ListingAdminContext.Provider value={{ listingJson, setListingJson, uploadedImages, addImage, selectedSection, setSelectedSection, previewListingImages, setPreviewListingImages,  previewAgentImages, setPreviewAgentImages, previewCarouselImages, setPreviewCarouselImages, blobUrl, defaultListingId, setDefaultListingId, listingOptions, previewBinGameImages, setPreviewBinGameImages, previewBubbleImages, setPreviewBubbleImages, convoTopValues, listingImages, setListingImages, jsonChanged, setJsonChanged, handleListingAdminAction, loadSiteJsonFromBackend, viewListings, setViewListings, adminListings, setAdminListings, fetchUserListings, qRCode, setQRCode, qRCodeUrl, setQRCodeUrl, generateQRCode, resetListingId, imageURL, versions, LoadBinGameImages, updateUserAdminRights}}>
      {children}
    </ListingAdminContext.Provider>
  );
};
