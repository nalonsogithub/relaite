import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionGameContainer from './components/QuestionGameContainer';

const Home = () => (
  <div>
    <h1>Welcome to the Question Game</h1>
    <p>Click the link below to start the game.</p>
    <a href="/game">Start Game</a>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<QuestionGameContainer />} />
      </Routes>
    </Router>
  );
};

export default App;
