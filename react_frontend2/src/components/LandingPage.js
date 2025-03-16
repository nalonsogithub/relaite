import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteAuth } from "../contexts/SiteAuthContext";
import { ListingAdminContext } from "../contexts/ListingAdminContext";

const LandingPage = () => {
  const { siteIsLoggedIn, fetchListingId, siteLogout, syncStateWithBackend } = useSiteAuth();
  const navigate = useNavigate();
  const { loadSiteJsonFromBackend } = useContext(ListingAdminContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      console.log("[DEBUG] LandingPage: Checking navigation logic...");

      // ✅ Fetch listing ID from session
      const { listingId, siteListingIdFound, idFromURL } = await fetchListingId();
      console.log("[DEBUG] LandingPage: Listing ID Found?", siteListingIdFound);

      // ✅ Sync with backend
      await syncStateWithBackend();

      // ✅ Check if `listing_id` is in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlListingId = urlParams.get("listing_id");

      if (urlListingId && siteListingIdFound) {
        console.log("[DEBUG] Redirecting to WelcomePage...");
        navigate("/WelcomePage");
      } else if (siteIsLoggedIn) {
        console.log("[DEBUG] User is logged in → Redirecting to AdminConsole...");
        navigate("/AdminConsole");
      } else {
        console.log("[DEBUG] No listing_id, user not logged in → Redirecting to Login...");
        navigate("/SiteLoginSignUpWrapper");
      }

      setLoading(false);
    };

    initializePage();
  }, []);

  return <div>{loading ? "Loading..." : "Redirecting..."}</div>;
};

export default LandingPage;
