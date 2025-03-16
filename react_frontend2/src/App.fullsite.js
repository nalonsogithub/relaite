import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Aigent from './components/Aigent';
import LoginForm from './components/LoginForm';
import Signup from './components/Signup';
import ManageListing from './components/ManageListing';
import Welcome from './components/Welcome';
import AigentStream from './components/AiGent_stream';
import CarouselPage from './components/carousel_Components/CarouselPage';
import QRCodeDisplay from './components/QRCodeDisplay';
import HellowWorld from './components/HelloWorld';
import FailedLogin from './components/FailedLogin';
import { ChatProvider } from './contexts/ChatContext';
import { ImageProvider } from './contexts/CarouselImageContext';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
	  <ImageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/failed-login" element={<FailedLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/manage_listing" element={<ManageListing />} />
            <Route path="/aigent" element={<Aigent />} />
            <Route path="/aigent-stream" element={<AigentStream />} />
            <Route path="/carousel" element={<CarouselPage />} /> 
            <Route path="/qr-code-display" element={<QRCodeDisplay />} />
            <Route path="/hello-world" element={<HellowWorld />} />
            <Route path="*" element={<HellowWorld />} />
          </Routes>
        </Router>
	  </ImageProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
