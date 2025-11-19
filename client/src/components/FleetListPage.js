// src/pages/FleetListPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFleets } from '../services/api';

function FleetListPage() {
  const [fleets, setFleets] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const navigate = useNavigate();

  useEffect(() => {
    const getFleets = async () => {
      setLoading(true); 
      const data = await fetchFleets();
      // Safely set the data, ensuring it is an array
      setFleets(Array.isArray(data) ? data : []); 
      setLoading(false);
    };
    getFleets();
  }, []);

  // --- Sorting Logic Embedded ---
  const sortedFleets = useMemo(() => {
    // FIX: Safely assign an empty array if 'fleets' is not iterable
    const iterableFleets = Array.isArray(fleets) ? fleets : [];
    
    let sortableItems = [...iterableFleets]; 
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] === null || a[sortConfig.key] === undefined ? '' : a[sortConfig.key];
        const bValue = b[sortConfig.key] === null || b[sortConfig.key] === undefined ? '' : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [fleets, sortConfig]);
  // --- End Corrected Sorting Logic ---

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (!sortConfig) return null;
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return null;
  };

  if (loading) return <h2>Loading Fleets...</h2>;
  if (fleets.length === 0) return <h2>No fleets found. Check server connection.</h2>; 

  const handleFleetClick = (fleetId) => {
    navigate(`/fleets/${fleetId}`); 
  };

  return (
    <div className="fleet-list">
      <h2>🛳️ Available Fleets</h2>
      <table className="fleet-list-table">
        <thead>
          <tr>
            <th>
                <button type="button" onClick={() => requestSort('name')} className="sort-button">
                    Fleet Name {getSortIndicator('name')}
                </button>
            </th>
            <th>
                <button type="button" onClick={() => requestSort('vesselsCount')} className="sort-button">
                    Vessels Count {getSortIndicator('vesselsCount')}
                </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFleets.map(fleet => (
            <tr 
                key={fleet.id} 
                onClick={() => handleFleetClick(fleet.id)} 
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                title={`View vessels for ${fleet.name}`}
            >
              <td>{fleet.name}</td>
              <td>{fleet.vesselsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FleetListPage;