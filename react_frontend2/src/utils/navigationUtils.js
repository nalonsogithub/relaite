export const decideNavigation = (listingId, siteIsLoggedIn, siteListingIdFound, idFromURL, navigate) => {
  if (idFromURL && siteListingIdFound) {
    navigate('/WelcomePage');
  } else if (siteIsLoggedIn) {
    navigate('/AdminConsole');
  } else {
    navigate('/SiteLoginSignUpWrapper');
  }
};
