// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the list of all fleets with aggregated vessel counts.
 */
export const fetchFleets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fleets`);
        return response.data;
    } catch (error) {
        console.error("Error fetching fleets:", error);
        return [];
    }
};

/**
 * Fetches the vessels belonging to a specific fleet ID, including their location data.
 * @param {string} fleetId The ID of the fleet.
 * @param {Object} filters Optional object containing search filters: { name, flag, mmsi }.
 */
export const fetchFleetVessels = async (fleetId, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.name) queryParams.append('name', filters.name);
        if (filters.flag) queryParams.append('flag', filters.flag);
        if (filters.mmsi) queryParams.append('mmsi', filters.mmsi);

        const url = `${API_BASE_URL}/fleets/${fleetId}/vessels?${queryParams.toString()}`;
        
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching vessels for fleet ${fleetId}:`, error);
        return [];
    }
};