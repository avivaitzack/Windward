// src/components/VesselMap.js
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon not showing up in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function VesselMap({ vessels }) {
    // Calculate the bounding box for the markers to fit the map view
    const bounds = useMemo(() => {
        // Safety check for vessels array
        const iterableVessels = Array.isArray(vessels) ? vessels : [];
        if (iterableVessels.length === 0) return [[0, 0], [0, 0]];

        const latitudes = iterableVessels.map(v => v.latitude);
        const longitudes = iterableVessels.map(v => v.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);

        // Pad the bounds slightly for better viewing
        return [[minLat - 0.1, minLon - 0.1], [maxLat + 0.1, maxLon + 0.1]];
    }, [vessels]);

    // Use the first vessel's location as a fallback center
    const center = (Array.isArray(vessels) && vessels.length > 0) ? [vessels[0].latitude, vessels[0].longitude] : [0, 0];

    return (
        <MapContainer 
            bounds={bounds} 
            center={center} 
            zoom={8} 
            scrollWheelZoom={false} 
            style={{ height: '500px', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {(Array.isArray(vessels) ? vessels : []).map(vessel => (
                <Marker 
                    key={vessel._id} 
                    position={[vessel.latitude, vessel.longitude]}
                >
                    {/* Popup that displays information when clicking the marker */}
                    <Popup>
                        <div>
                            <h4>🚢 **{vessel.name || 'Unknown Vessel'}**</h4>
                            <p><strong>ID:</strong> {vessel._id}</p>
                            <p><strong>Class:</strong> {vessel.vessel_class || 'N/A'}</p>
                            <p><strong>MMSI:</strong> {vessel.mmsi || 'N/A'}</p>
                            <hr/>
                            <p><strong>Location:</strong> {vessel.latitude.toFixed(4)}, {vessel.longitude.toFixed(4)}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default VesselMap;