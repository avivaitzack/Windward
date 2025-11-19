// src/pages/FleetDetailPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFleetVessels } from '../services/api';
import VesselTable from '../components/VesselTable';
import VesselMap from '../components/VesselMap';

function FleetDetailPage() {
    const { fleetId } = useParams();
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for current input values
    const [filters, setFilters] = useState({
        name: '',
        flag: '',
        mmsi: '',
    });
    // State for filters that were actually applied (after clicking Search)
    const [appliedFilters, setAppliedFilters] = useState({}); 

    // Function to fetch vessels, accepting filters
    const getVessels = useCallback(async (currentFilters = {}) => {
        setLoading(true);
        const data = await fetchFleetVessels(fleetId, currentFilters); 
        setVessels(data); 
        setLoading(false);
    }, [fleetId]);

    // Initial data load effect
    useEffect(() => {
        getVessels({});
        setAppliedFilters({});
    }, [getVessels]);
    
    // Handler for input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handler for search button click
    const handleSearch = (e) => {
        e.preventDefault(); 

        // Trim input values and only keep filters with actual content
        const trimmedFilters = {};
        if (filters.name.trim()) trimmedFilters.name = filters.name.trim();
        if (filters.flag.trim()) trimmedFilters.flag = filters.flag.trim();
        if (filters.mmsi.trim()) trimmedFilters.mmsi = filters.mmsi.trim();
        
        // Update the applied filters state and fetch data
        setAppliedFilters(trimmedFilters);
        getVessels(trimmedFilters);
    };

    // Handler for clear button
    const handleClear = () => {
        setFilters({ name: '', flag: '', mmsi: '' }); 
        setAppliedFilters({}); 
        getVessels({});
    };

    // Filter vessels for map display
    const vesselsWithLocation = useMemo(() => {
        return vessels.filter(v => 
            v.latitude !== null && v.longitude !== null && 
            v.latitude !== undefined && v.longitude !== undefined
        );
    }, [vessels]); 

    // Function to display the active filters
    const renderActiveFilters = () => {
        const active = Object.entries(appliedFilters)
            .map(([key, value]) => `${key.toUpperCase()}: "${value}"`);
            
        if (active.length === 0) return null;

        return (
            <p className="active-filters" style={{ fontWeight: 'bold' }}>
                **Active Filters:** {active.join(' | ')} 
                ({vessels.length} results)
            </p>
        );
    };


    return (
        <div className="fleet-detail">
            <h2>Fleet Details: {fleetId}</h2>

            {/* START: Search Section */}
            <form className="search-section" onSubmit={handleSearch} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>🔍 Search Vessels</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <label>
                        Name:
                        <input type="text" name="name" value={filters.name} onChange={handleFilterChange} />
                    </label>
                    <label>
                        Flag:
                        <input type="text" name="flag" value={filters.flag} onChange={handleFilterChange} />
                    </label>
                    <label>
                        MMSI:
                        <input type="text" name="mmsi" value={filters.mmsi} onChange={handleFilterChange} /> 
                    </label>
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                    <button type="button" onClick={handleClear} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
                </div>
            </form>
            {/* END: Search Section */}

            {loading ? <h2>Fetching Vessels...</h2> : renderActiveFilters()}

            <div className="fleet-content-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <section className="fleet-table-section" style={{ flex: 1 }}>
                    <h3>Vessel List (Sortable)</h3>
                    <VesselTable vessels={vessels} /> 
                </section>
                
                <section className="fleet-map-section" style={{ flex: 1 }}>
                    <h3>Vessel Map ({vesselsWithLocation.length} located)</h3>
                    {vesselsWithLocation.length > 0 ? (
                        <VesselMap vessels={vesselsWithLocation} /> 
                    ) : (
                        <p>No current location data available for any vessel in this filtered set to display on the map.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default FleetDetailPage;