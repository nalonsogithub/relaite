import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash'; 

import { AuthProvider } from './contexts/AuthContext';
import { SiteAuthProvider } from './contexts/SiteAuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SiteCarouselProvider } from './contexts/SiteCarouselContext';
import { BinQGameProvider } from './contexts/BinQGameContext'; // Add BinQGameProvider
import { ImageBubbleGameProvider } from './contexts/ImageBubbleGameContext'; // Add BinQGameProvider
import { ListingDetailsProvider } from './contexts/ListingDetailsContext';
import { ListingAdminProvider } from './contexts/ListingAdminContext';

import QuestionGameContainer from './components/QuestionGameContainer';
import RenovationComponent from './components/renovationComponent';
import WelcomePage from './components/WelcomePage';
import WrapperWithContactAndBot from './components/WrapperWithContactAndBot';
import WrapperWithCarouselAndBinImageQGame from './components/WrapperWithCarouselAndBinImageQGame';
import AigentWBinImageQGame from './components/Aigent_with_BinImageQGame';
import SummaryView from './components/SummaryView';
import WrapperMainSiteCarousel from './components/WrapperMainSiteCarousel';
import RenderImageBubbleGame from './components/RenderImageBubbleGame';
import WrapperWithAgentAndRenderNeighborhoodMap from './components/WrapperWithAgentAndRenderNeighborhoodMap';
import WrapperWithAgentSummary2 from './components/WrapperWithAgentSummary2';
import LandingPage from './components/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import MainPage from './components/MainPage'

import ListingAdmin from './components/ListingAdmin/ListingAdmin';
import ListingAdminMainPage from './components/ListingAdmin/ListingAdminMainPage';
import ListingAdminListing from './components/ListingAdmin/ListingAdminListing';
import ListingAdminAgent from './components/ListingAdmin/ListingAdminAgent';
import ListingAdminAssistant from './components/ListingAdmin/ListingAdminAssistant';
import ListingAdminCarousel from './components/ListingAdmin/ListingAdminCarousel'
import ListingAdminBinGame from './components/ListingAdmin/ListingAdminBinGame'
import ListingAdminImageBubbleGame from './components/ListingAdmin/ListingAdminImageBubbleGame'
import ListingAdminQuestions from './components/ListingAdmin/ListingAdminQuestions'
import ListingAdminConfirmListing from './components/ListingAdmin/ListingAdminConfirmListing'
import ListingAdminStatistics from './components/ListingAdminStatistics'


//import GeneralEntry from './components/GeneralEntry';
import AdminConsole from './components/AdminConsole';
import ShowListingIDEntry from './components/ShowListingIDEntry';

import SiteLoginSignUp from './components/SiteLoginSignUp';
import SiteLoginSignUpWrapper from './components/SiteLoginSignUpWrapper';


import './styles/hbb_global.css';
import './App.css';
import './components/chartSetup';

// Importing QueryClient and QueryClientProvider from react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize Query Client
const queryClient = new QueryClient();

// Dynamically set the base URL based on the environment
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


function App() {

	
	
	return (
    	// Wrap the entire app with QueryClientProvider
		<QueryClientProvider client={queryClient}>
			<ListingAdminProvider>
				<SiteCarouselProvider>
					<ImageBubbleGameProvider>
						<BinQGameProvider>
							<ListingDetailsProvider>
								<Router>
									<SiteAuthProvider>
										<ChatProvider>
											<AuthProvider>
												<Routes>
		
													{/* Public Routes */}
													<Route path="/" element={<MainPage />} />
	  					  							<Route path="/LandingPage" element={<LandingPage />} />
						  							<Route path="/WelcomePage" element={<WelcomePage />} />
						  							<Route path="/SiteLoginSignUpWrapper" element={<SiteLoginSignUpWrapper />} />
													<Route path="/ShowListingIDEntry" element={<ShowListingIDEntry />} />


	  					  							{/* Protected Routes */}
													<Route path="/AigentWBinImageQGame" element={<ProtectedRoute><AigentWBinImageQGame /></ProtectedRoute>} />
													<Route path="/admin-console" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
													<Route path="/WrapperWithCarouselAndBinImageQGame" element={<ProtectedRoute><WrapperWithCarouselAndBinImageQGame /></ProtectedRoute>} />
													<Route path="/admin-console" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
													<Route path="/WrapperWithAgentAndRenderNeighborhoodMap" element={<ProtectedRoute><WrapperWithAgentAndRenderNeighborhoodMap /></ProtectedRoute>} />
													<Route path="/ListingAdminStatistics" element={<ProtectedRoute><ListingAdminStatistics /></ProtectedRoute>} />
		
													<Route path="/WrapperWithContactAndBot" element={<ProtectedRoute><WrapperWithContactAndBot /></ProtectedRoute>} />

													<Route path="/WrapperMainSiteCarousel" element={<ProtectedRoute><WrapperMainSiteCarousel /></ProtectedRoute>} />
													<Route path="/WrapperWithAgentSummary2" element={<ProtectedRoute><WrapperWithAgentSummary2 /></ProtectedRoute>} />

		
	  					  							{/* ADMIN Routes */}
													<Route path="/AdminConsole" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
													<Route path="/ListingAdmin" element={<ProtectedRoute><ListingAdmin /></ProtectedRoute>} />
													<Route path="/ListingAdminMainPage" element={<ProtectedRoute><ListingAdminMainPage /></ProtectedRoute>} />
													<Route path="/ListingAdminListing" element={<ProtectedRoute><ListingAdminListing /></ProtectedRoute>} />
													<Route path="/ListingAdminAgent" element={<ProtectedRoute><ListingAdminAgent /></ProtectedRoute>} />
													<Route path="/ListingAdminAssistant" element={<ProtectedRoute><ListingAdminAssistant /></ProtectedRoute>} />
													<Route path="/ListingAdminCarousel" element={<ProtectedRoute><ListingAdminCarousel /></ProtectedRoute>} />
													<Route path="/ListingAdminBinGame" element={<ProtectedRoute><ListingAdminBinGame /></ProtectedRoute>} />
													<Route path="/ListingAdminImageBubbleGame" element={<ProtectedRoute><ListingAdminImageBubbleGame /></ProtectedRoute>} />
													<Route path="/ListingAdminQuestions" element={<ProtectedRoute><ListingAdminQuestions /></ProtectedRoute>} />
													<Route path="/ListingAdminConfirmListing" element={<ProtectedRoute><ListingAdminConfirmListing /></ProtectedRoute>} />
		
													{/* CATCH ALL ROUTES */}												<Route path="*" element={<MainPage />} />

												</Routes>
											</AuthProvider>
										</ChatProvider>
									</SiteAuthProvider>
								</Router>
							</ListingDetailsProvider>
						</BinQGameProvider>
					</ImageBubbleGameProvider>
				</SiteCarouselProvider>
			</ListingAdminProvider>
		</QueryClientProvider>
  	);
}

export default App;

{/* 
						  							<Route path="/generalentry" element={<GeneralEntry />} />
						  							<Route path="/siteloginsignup" element={<SiteLoginSignUp />} />
						  <Route path="/ShowListingIDEntry" element={<ShowListingIDEntry />} />
						  <Route path="/RenovationComponent" element={<RenovationComponent />} />
						  <Route path="/SummaryView" element={<SummaryView />} />
						  <Route path="/QuestionGameContainer" element={<QuestionGameContainer />} />

		<QueryClientProvider client={queryClient}>
			<ListingAdminProvider>
				<SiteCarouselProvider>
					<ImageBubbleGameProvider>
						<BinQGameProvider>
							<ListingDetailsProvider>
								<Router>
									<SiteAuthProvider>
										<ChatProvider>
											<AuthProvider>
												<Routes>
		
													<Route path="/" element={<MainPage />} />
	  					  							<Route path="/LandingPage" element={<LandingPage />} />
						  							<Route path="/WelcomePage" element={<WelcomePage />} />
						  							<Route path="/SiteLoginSignUpWrapper" element={<SiteLoginSignUpWrapper />} />
													<Route path="*" element={<LandingPage />} />


													<Route path="/AigentWBinImageQGame" element={<ProtectedRoute><AigentWBinImageQGame /></ProtectedRoute>} />
													<Route path="/admin-console" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
													<Route path="/WrapperWithCarouselAndBinImageQGame" element={<ProtectedRoute><WrapperWithCarouselAndBinImageQGame /></ProtectedRoute>} />
													<Route path="/admin-console" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
													<Route path="/WrapperWithAgentAndRenderNeighborhoodMap" element={<ProtectedRoute><WrapperWithAgentAndRenderNeighborhoodMap /></ProtectedRoute>} />
													<Route path="/WrapperWithAgentAndRenderNeighborhoodMap" element={<ProtectedRoute><WrapperWithContactAndBot /></ProtectedRoute>} />
													<Route path="/WrapperMainSiteCarousel" element={<ProtectedRoute><WrapperMainSiteCarousel /></ProtectedRoute>} />
													<Route path="/WrapperWithAgentSummary2" element={<ProtectedRoute><WrapperWithAgentSummary2 /></ProtectedRoute>} />
		
													<Route path="/ListingAdmin" element={<ProtectedRoute><ListingAdmin /></ProtectedRoute>} />
													<Route path="/ListingAdminMainPage" element={<ProtectedRoute><ListingAdminMainPage /></ProtectedRoute>} />
													<Route path="/ListingAdminListing" element={<ProtectedRoute><ListingAdminListing /></ProtectedRoute>} />
													<Route path="/ListingAdminAgent" element={<ProtectedRoute><ListingAdminAgent /></ProtectedRoute>} />
													<Route path="/ListingAdminAssistant" element={<ProtectedRoute><ListingAdminAssistant /></ProtectedRoute>} />
													<Route path="/ListingAdminCarousel" element={<ProtectedRoute><ListingAdminCarousel /></ProtectedRoute>} />
													<Route path="/ListingAdminBinGame" element={<ProtectedRoute><ListingAdminBinGame /></ProtectedRoute>} />
													<Route path="/ListingAdminImageBubbleGame" element={<ProtectedRoute><ListingAdminImageBubbleGame /></ProtectedRoute>} />
													<Route path="/ListingAdminQuestions" element={<ProtectedRoute><ListingAdminQuestions /></ProtectedRoute>} />
													<Route path="/ListingAdminConfirmListing" element={<ProtectedRoute><ListingAdminConfirmListing /></ProtectedRoute>} />
		
<Route path="*" element={<MainPage />} />

												</Routes>
											</AuthProvider>
										</ChatProvider>
									</SiteAuthProvider>
								</Router>
							</ListingDetailsProvider>
						</BinQGameProvider>
					</ImageBubbleGameProvider>
				</SiteCarouselProvider>
			</ListingAdminProvider>
		</QueryClientProvider>


*/}

