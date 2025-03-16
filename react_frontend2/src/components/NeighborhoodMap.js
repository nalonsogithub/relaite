import React, { useState, useEffect, useContext  } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { ListingDetailsContext } from '../contexts/ListingDetailsContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import styles from '../styles/NeighborhoodMap.module.css';
import { ListingAdminContext } from '../contexts/ListingAdminContext';


// Replace with your OpenCage API key
const OPENCAGE_API_KEY = '342dc1e4e90d4c97bca98a0543e592ab';

const AddressMarker = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates) {
      map.setView(coordinates, 13); // Zoom in to the location
    }
  }, [coordinates, map]);

  return coordinates ? <Marker position={coordinates} /> : null;
};

const NeighborhoodMap = () => {
  const { listingDetails } = useContext(ListingDetailsContext); // Access listing details from the context
  const { listingJson, imageURL } = useContext(ListingAdminContext);  
  
  const defaultAddress = '333 Velarde Avenue Coral Gables FL 33143'; // Fallback address
  const listingAddress = listingJson?.listing?.listing_details?.listing_address || defaultAddress;
  
  const [address, setAddress] = useState(listingAddress); 
  const [coordinates, setCoordinates] = useState(null);
  const [inputAddress, setInputAddress] = useState("");

  // Geocode the default or user-inputted address when the address state changes
  useEffect(() => {
    if (address) {
      geocodeAddress(address);
    }
  }, [address]);  // Trigger the geocoding when the address state changes

  // Geocode the address and get coordinates
  const geocodeAddress = async (addr) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(addr)}&key=${OPENCAGE_API_KEY}`
      );
      const { lat, lng } = response.data.results[0].geometry;
      setCoordinates([lat, lng]);
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  // Handle address input field change
  const handleAddressInputChange = (e) => {
    setInputAddress(e.target.value);
    // Detect "Enter" key (keyCode 13)
    if (e.key === 'Enter' || e.keyCode === 13) {
      handleAddressSubmit();  // Trigger address lookup when Enter is pressed
    }
  };

  // Handle address submission
  const handleAddressSubmit = () => {
    setAddress(inputAddress);  // Update the address state, which triggers useEffect to geocode the new address
  };

  // Handle geolocation button
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates([latitude, longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div>

      {/* Map Container */}
      <MapContainer center={[25.7617, -80.1918]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* AddressMarker component, which updates when coordinates change */}
        <AddressMarker coordinates={coordinates} />
      </MapContainer>

  {/* Controls at the bottom */}
  <div className={styles.controls}>
    <label className={styles.label}>
      Enter Address:
      <input
        type="text"
        value={inputAddress}
        onChange={handleAddressInputChange}
        className={styles.inputField}
        placeholder="Enter an address"
      />
    </label>
	<div>
		<button className={styles.submitButton} onClick={handleAddressSubmit}>
		  Go to Address
		</button>
		<button className={styles.geoButton} onClick={handleMyLocation}>
		  My Location
		</button>
	</div>
  </div>

    </div>
  );
};

export default NeighborhoodMap;
