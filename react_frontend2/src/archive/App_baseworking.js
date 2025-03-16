import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigator from './components/Navigator';
import LCAgent from './components/LCAgent';
import LCClient from './components/LCClient';

const App = () => {
    return (
        <Router>
            <div>
                <Navigator />
                <Routes>
                    <Route path="/client_1/listing_1" element={<LCClient userID="client_1" listingID="listing_1" />} />
                    <Route path="/client_1/listing_2" element={<LCClient userID="client_1" listingID="listing_2" />} />
                    <Route path="/client_2/listing_1" element={<LCClient userID="client_2" listingID="listing_1" />} />
                    <Route path="/agent" element={<LCAgent />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
