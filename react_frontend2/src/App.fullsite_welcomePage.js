import React from 'react';
import './components/chartSetup';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MortgageProvider } from './contexts/MortgageContext';
import { ChatProvider } from './contexts/ChatContext';
import { LiveChatProvider } from './contexts/LiveChatContext';
import { QuestionProvider } from './contexts/questionContext';
import { AppProviders } from './contexts/CarouselImageContext';
import LCClient from './components/LCClient';
import LCAgent from './components/LCAgent';
import FloatingWords from './components/floatingWords';
import MainCarouselWrapper from './components/MainCarouselWrapper';
import RenovationComponent from './components/renovationComponent';
import WelcomePage from './components/WelcomePage';
import UnderConstruction from './components/UnderConstruction';
import Aigent from './components/Aigent';
import MortgageCalculator from './components/MortgageCalculator';
import WrapperWithCarouselAndChatbot from './components/WrapperWithCarouselAndChatBot';
import AigentWCarousel from './components/Aigent_with_carousel';
import ImageCarousel from './components/imageCarousel';
import SummaryView from './components/SummaryView';
import './styles/hbb_global.css';
import './App.css';

function App() {
  const listing_id = '2b78c611-af06-4449-a5b6-fb2d433faf8b';
	
  return (
    <Router>
      <AppProviders>
        <ChatProvider>
	  	  <LiveChatProvider>
           <AuthProvider>
             <QuestionProvider>
               <MortgageProvider>
                 <Routes>
                   <Route path="/" element={<WelcomePage />} />
                   <Route path="/LCClient" element={<LCClient />} />
                   <Route path="/LCAgent" element={<LCAgent />} />
                   <Route path="/Aigent" element={<Aigent />} />
                   <Route path="/WelcomePage" element={<WelcomePage />} />
                   <Route path="/under-construction" element={<UnderConstruction />} />
                   <Route path="/MortgageCalculator" element={<MortgageCalculator />} />
                   <Route path="/MainCarouselWrapper" element={<MainCarouselWrapper />} />
                   <Route path="/AigentWCarousel" element={<AigentWCarousel />} />
                   <Route path="/RenovationComponent" element={<RenovationComponent />} />
                   <Route path="/SummaryView" element={<SummaryView />} />
                   <Route path="/WrapperWithCarouselAndChatbot" element={<WrapperWithCarouselAndChatbot />} />
                   <Route path="/FloatingWords" element={<FloatingWords />} />
                   <Route path="*" element={<WelcomePage />} />
                 </Routes>
               </MortgageProvider>
             </QuestionProvider>
           </AuthProvider>
          </LiveChatProvider>
	    </ChatProvider>
      </AppProviders>
    </Router>
  );
}

export default App;
