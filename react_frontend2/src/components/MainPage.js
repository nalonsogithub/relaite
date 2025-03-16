import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteAuth } from "../contexts/SiteAuthContext";
import { ListingAdminContext } from "../contexts/ListingAdminContext";
import { decideNavigation } from "../utils/navigationUtils"; // Import function

const MainPage = () => {
  const { siteIsLoggedIn, fetchListingId, siteLogout, syncStateWithBackend } = useSiteAuth();
  const navigate = useNavigate();
  const { loadSiteJsonFromBackend } = useContext(ListingAdminContext);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      setLoadingMessage("Syncing with Backend...");

      const { listingId, siteListingIdFound, idFromURL } = await fetchListingId();
      await syncStateWithBackend();

      if (listingId) {
        setLoadingMessage("Loading Listing...");
        await loadSiteJsonFromBackend(listingId);
      }

      decideNavigation(listingId, siteIsLoggedIn, siteListingIdFound, idFromURL, navigate);
      setRedirecting(false);
    };

    initializePage();
  }, []);

  const handleLogout = async () => {
    await siteLogout();
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {redirecting ? (
        <p style={{ fontStyle: "italic", color: "#007BFF" }}>{loadingMessage}</p>
      ) : (
        <>
          <h1>Main Page</h1>
          <div>
            {siteIsLoggedIn && (
              <button onClick={() => navigate("/AdminConsole")} style={buttonStyle("#28A745")}>
                Admin Console
              </button>
            )}
            {!siteIsLoggedIn && (
              <button onClick={() => navigate("/SiteLoginSignUpWrapper")} style={buttonStyle("#007BFF")}>
                Login/Sign Up
              </button>
            )}
            {siteIsLoggedIn && (
              <button onClick={handleLogout} style={buttonStyle("#FF5733")}>
                Logout
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const buttonStyle = (color) => ({
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: color,
  color: "#FFF",
  cursor: "pointer",
  margin: "10px",
});

export default MainPage;
