import React, { useState, useEffect } from 'react';
import NeighborhoodMap from './NeighborhoodMap'; // Assuming NeighborhoodMap is the map component
import styles from '../styles/RenderNeighborhoodMap.module.css'; // Import the stylesheet

const RenderNeighborhoodMap = ({ address }) => {
  const [inputAddress, setInputAddress] = useState(address || '333 Velarde Avenue, Coral Gables FL'); // Use prop or default address
	
  // Use useEffect to update the inputAddress when the address prop changes
  useEffect(() => {
    if (address) {
      setInputAddress(address); // Update inputAddress when prop changes
    }
  }, [address]); // Watch for changes in the address prop	

  const handleAddressSubmit = (newAddress) => {
    setInputAddress(newAddress); // Pass the new address to the map component
  };

  return (
    <div className={styles.mapContainer}>
      <NeighborhoodMap defaultAddress={inputAddress} onAddressSubmit={handleAddressSubmit} />
    </div>
  );
};

export default RenderNeighborhoodMap;
