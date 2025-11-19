// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FleetListPage from './components/FleetListPage';
import FleetDetailPage from './components/FleetDetailPage';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1><Link to="/">Vessel Fleet Dashboard</Link></h1>
        </header>
        <Routes>
          <Route path="/" element={<FleetListPage />} /> 
          <Route path="/fleets/:fleetId" element={<FleetDetailPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;