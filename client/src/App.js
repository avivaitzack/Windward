import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FleetsPage from './FleetsPage';
import FleetPage from './FleetPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FleetsPage />} />
        <Route path="/fleet/:id" element={<FleetPage />} />
      </Routes>
    </Router>
  );
}

export default App;
