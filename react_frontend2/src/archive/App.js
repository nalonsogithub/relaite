import React from 'react';
import './components/chartSetup';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MortgageProvider } from './contexts/MortgageContext';
import { ChatProvider } from './contexts/ChatContext';
import { QuestionProvider } from './contexts/questionContext';
import { SiteCarouselProvider } from './contexts/SiteCarouselContext';
//import { AppProviders } from './contexts/CarouselImageContext';
import QuestionGameContainer from './components/QuestionGameContainer';
import MainCarouselWrapper from './components/MainCarouselWrapper';
import RenovationComponent from './components/renovationComponent';
import WelcomePage from './components/WelcomePage';
import UnderConstruction from './components/UnderConstruction';
import Aigent from './components/Aigent';
import MortgageCalculator from './components/MortgageCalculator';
import WrapperWithContactAndBot from './components/WrapperWithContactAndBot';
//import WrapperWithCarouselAndChatbot from './components/WrapperWithCarouselAndChatBot';
import WrapperWithCarouselAndBinImageQGame from './components/WrapperWithCarouselAndBinImageQGame';
import AigentWCarousel from './components/Aigent_with_carousel';
import AigentWBinImageQGame from './components/Aigent_with_BinImageQGame';
import ImageCarousel from './components/imageCarousel';
import SummaryView from './components/SummaryView';
import WrapperMainSiteCarousel from './components/WrapperMainSiteCarousel';


import RenderImageBubbleGame from './components/RenderImageBubbleGame';


//START DM
//import LCClient from './components/LCClient';
//import LCAgent from './components/LCAgent';
//import DMManage from './components/DMManage';
//END DM

import './styles/hbb_global.css';
import './App.css';

function App() {
  const listing_id = '2b78c611-af06-4449-a5b6-fb2d433faf8b';
	
  return (
    <SiteCarouselProvider>
      <Router>
        <ChatProvider>
         <AuthProvider>
           <QuestionProvider questionType="entry">
             <MortgageProvider>
               <Routes>
                 <Route path="/" element={<WelcomePage />} />
                 <Route path="/Aigent" element={<Aigent />} />
                 <Route path="/WelcomePage" element={<WelcomePage />} />
                 <Route path="/under-construction" element={<RenderImageBubbleGame />} />
                 <Route path="/MortgageCalculator" element={<MortgageCalculator />} />
                 <Route path="/MainCarouselWrapper" element={<MainCarouselWrapper />} />
                 <Route path="/AigentWCarousel" element={<AigentWCarousel />} />
                 <Route path="/AigentWBinImageQGame" element={<AigentWBinImageQGame />} />
                 <Route path="/RenovationComponent" element={<RenovationComponent />} />
                 <Route path="/SummaryView" element={<SummaryView />} />
                 <Route path="/WrapperWithCarouselAndBinImageQGame" element={<WrapperWithCarouselAndBinImageQGame />} />
                 <Route path="/WrapperWithContactAndBot" element={<WrapperWithContactAndBot />} />
                 <Route path="/WrapperMainSiteCarousel" element={<WrapperMainSiteCarousel />} />
                 <Route path="/QuestionGameContainer" element={<QuestionGameContainer />} />
                 <Route path="*" element={<WelcomePage />} />
	  
	  
               </Routes>
             </MortgageProvider>
           </QuestionProvider>
         </AuthProvider>
	    </ChatProvider>
      </Router>
    </SiteCarouselProvider>
  );
}

//START DM
//	  			<Route path="/DMManage" element={<DMManage />} />
//                <Route path="/agent/:agentID" element={<LCAgentWrapper />} />
//                <Route path="/client/:userID/:listingID/:agentID" element={<LCClientWrapper />} />	  

//const LCAgentWrapper = () => {
//    const { agentID } = useParams();
//    return <LCAgent agentID={agentID} />;
//};
//
//const LCClientWrapper = () => {
//    const { userID, listingID, agentID } = useParams();
//    return <LCClient userID={userID} listingID={listingID} agentID={agentID} />;
//};
//
//END DM

export default App;
