import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigator from './components/Navigator';
import LCClient from './components/LCClient';
import LCAgent from './components/LCAgent';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigator />} />
        <Route path="/client" element={<LCClient />} />
        <Route path="/agent" element={<LCAgent />} />
      </Routes>
    </Router>
  );
};

export default App;
