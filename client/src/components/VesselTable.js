// src/components/VesselTable.js
import React, { useState, useMemo } from 'react';

function VesselTable({ vessels }) {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // --- Sorting Logic Embedded ---
  const sortedItems = useMemo(() => {
    // Safety check for vessels array
    const iterableVessels = Array.isArray(vessels) ? vessels : [];
    let sortableItems = [...iterableVessels];
    
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
  }, [vessels, sortConfig]);

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
  // --- End Sorting Logic ---

  return (
    <table className="vessel-table">
      <thead>
        <tr>
          <th>
            <button type="button" onClick={() => requestSort('_id')} className="sort-button">
              ID {getSortIndicator('_id')}
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('name')} className="sort-button">
              Name {getSortIndicator('name')}
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('vessel_class')} className="sort-button">
              Class {getSortIndicator('vessel_class')}
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('mmsi')} className="sort-button">
              MMSI {getSortIndicator('mmsi')}
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('value')} className="sort-button">
              Fleet Value {getSortIndicator('value')}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((vessel) => (
          <tr key={vessel._id}>
            <td>{vessel._id}</td>
            <td>{vessel.name || 'N/A'}</td>
            <td>{vessel.vessel_class || 'N/A'}</td>
            <td>{vessel.mmsi || 'N/A'}</td>
            <td>${vessel.value ? vessel.value.toFixed(2) : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default VesselTable;