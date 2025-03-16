import React, { useEffect, useState } from 'react';
import axios from 'axios';


const AppDownload = ({ listing_id }) => {
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const generateDownloadUrl = async () => {
      // If you need to fetch the URL from the backend
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
		
        const response = await axios.get(`${baseUrl}/get-download-url`);
		  
		  
		  
        const data = await response.json();
        setDownloadUrl(data.download_url);
      } catch (error) {
        console.error('Error fetching download URL:', error);
	  }
      
      // Or generate the URL directly in the frontend if userId is available
      // setDownloadUrl(`https://yourapp.com/user/${listing_id}`);
    };

    generateDownloadUrl();
  }, [listing_id]);

  return (
    <div>
    </div>
  );
};

export default AppDownload;
