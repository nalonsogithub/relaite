import React, { useEffect, useState } from 'react';
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


import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React and Flask</h1>
        {data ? <p>{data.message}</p> : <p>Loading...</p>}
      </header>
    </div>
  );
}

export default App;
