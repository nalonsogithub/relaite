import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteAuth } from "../contexts/SiteAuthContext";
import { ListingAdminContext } from "../contexts/ListingAdminContext";

const MainPage = () => {
  const {
    siteIsLoggedIn,
    siteListingIdFound,
    idFromURL,
    fetchListingId,
    siteLogout,
    listingId,
    syncStateWithBackend,
  } = useSiteAuth();
  const navigate = useNavigate();

  const { loadSiteJsonFromBackend } = useContext(ListingAdminContext); // Access context
  const [helpMessage, setHelpMessage] = useState(null); // State for help message
  const [loadingMessage, setLoadingMessage] = useState(""); // State for loading message
  const [redirecting, setRedirecting] = useState(true); // State for redirection

  useEffect(() => {
    const initializePage = async () => {
      // Fetch session data and sync with backend
      const { listingId, siteListingIdFound, idFromURL } = await fetchListingId();
      setLoadingMessage("Synching with Backend...")		
      await syncStateWithBackend();

      // Check if the path contains "/listings"
      const currentPath = window.location.pathname;
      const isListingsPath = currentPath.includes("/listings");

		
	  // Load listing data if available
      if (listingId) {
		setLoadingMessage("Loading Listing...");
        await loadSiteJsonFromBackend(listingId);
      }

      // Navigation logic based on session and path
      console.log('Main Page:', listingId, 'idFromURL', idFromURL, siteListingIdFound, isListingsPath, siteIsLoggedIn);
      if (isListingsPath && siteListingIdFound && idFromURL) {
        navigate("/WelcomePage");
      } else if (siteIsLoggedIn) {
        setRedirecting(false); // Set redirecting to true
        setHelpMessage("Welcome back! Use the admin button to access the admin console.");
      } else {
        setRedirecting(false); // Set redirecting to true
        setHelpMessage("Welcome! Please log in or sign up to continue.");
      }
    };

    initializePage();
  }, []); // Only run once on component mount

  // Handle logout button click
  const handleLogout = async () => {
    console.log("Logging out...");
    await siteLogout();
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
	  {loadingMessage}
      {/* Show only the loading message if redirecting */}
      {redirecting ? (
        <p style={{ fontStyle: "italic", color: "#007BFF" }}>{loadingMessage}</p>
      ) : (
        <>
          {/* Show help message if not redirecting */}
          {helpMessage && (
            <p style={{ fontStyle: "italic", color: "#555" }}>{helpMessage}</p>
          )}

		  <h1>Main Page</h1>
          <div>
            {/* Admin Button */}
            {siteIsLoggedIn && (
              <button
                onClick={() => navigate("/AdminConsole")}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#28A745",
                  color: "#FFF",
                  cursor: "pointer",
                  margin: "10px",
                }}
              >
                Admin Console
              </button>
            )}

            {/* Login/Sign Up Button */}
            {!siteIsLoggedIn && (
              <button
                onClick={() => navigate("/SiteLoginSignUpWrapper")}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#007BFF",
                  color: "#FFF",
                  cursor: "pointer",
                  margin: "10px",
                }}
              >
                Login/Sign Up
              </button>
            )}

            {/* Logout Button */}
            {siteIsLoggedIn && (
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#FF5733",
                  color: "#FFF",
                  cursor: "pointer",
                  margin: "10px",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;
