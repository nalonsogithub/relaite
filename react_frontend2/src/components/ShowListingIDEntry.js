import React, { useContext, useEffect, useState } from 'react';
import { ListingAdminContext } from '../contexts/ListingAdminContext';
import styles from '../styles/ShowListingIDEntry.module.css'; // Import your CSS module

const ShowListingIDEntry = () => {
  const { qRCode, qRCodeUrl, generateQRCode, defaultListingId } = useContext(ListingAdminContext);
  const [copied, setCopied] = useState(false); // State to handle the copy action

  useEffect(() => {
    if (defaultListingId) {
      generateQRCode(defaultListingId); // Generate QR code for the default listing
    }
  }, [defaultListingId, generateQRCode]);

  // Handle QR code click
  const handleQRCodeClick = () => {
    console.log("QR Code URL clicked:", qRCodeUrl);
  };

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    if (qRCodeUrl) {
      navigator.clipboard.writeText(qRCodeUrl);
      setCopied(true); // Set copied state to true
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <div className={styles['show-listing-container']}>
      <h1 className={styles['title']}>Listing Information</h1>
      <p className={styles['description']}>Below is the QR code for your listing. You can also click the link to access the listing directly or copy it to share.</p>

      {/* Display the text link for copying */}
      {qRCodeUrl && (
        <div className={styles['link-container']}>
          <div className={styles['copy-container']}>
            <input
              type="text"
              value={qRCodeUrl}
              readOnly
              className={styles['link-input']}
            />
            <button onClick={handleCopyLink} className={styles['copy-button']}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className={styles['instructions']}>You can also click the link to open the listing:</p>
          <a href={qRCodeUrl} className={styles['listing-link']} target="_blank" rel="noopener noreferrer">
            {qRCodeUrl}
          </a>
        </div>
      )}

      {/* Display the QR Code */}
      {qRCode && (
        <div className={styles['qr-container']}>
          <a href={qRCodeUrl} target="_blank" rel="noopener noreferrer" onClick={handleQRCodeClick}>
            <img
              src={`data:image/png;base64,${qRCode}`}
              alt="Listing QR Code"
              className={styles['qr-code']}
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default ShowListingIDEntry;
