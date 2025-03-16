import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function QRCodeDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const qrCode = location.state?.qrCode;
  const qrCodeData = location.state?.qrCodeData; // Assuming this might be a URL

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Data</h1>
      {/* Make the QR code data text a clickable link */}
      {qrCodeData ? (
        <a href={qrCodeData} target="_blank" rel="noopener noreferrer">
          <p>{qrCodeData}</p>
        </a>
      ) : (
        <p>No Data</p>
      )}
      <div style={{
          display: 'inline-block',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          padding: '10px',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
        {/* Make the QR code image a clickable link */}
        {qrCode ? (
          <a href={qrCodeData} target="_blank" rel="noopener noreferrer">
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
          </a>
        ) : (
          <p>No QR Code Found</p>
        )}
      </div>
      <br />
      <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Return to Listings</button>
    </div>
  );
}

export default QRCodeDisplay;
