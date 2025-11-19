// server.js
const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- File Configuration ---
// NOTE: Ensure these files are located inside a 'data' folder next to this server.js file.
const FLEETS_FILE = 'fleets.json';
const LOCATIONS_FILE = 'vesselLocations.json';
const VESSELS_FILE = 'vessels.json';

// --- Data Storage ---
let vessels = [];
let fleets = [];
let vesselLocations = [];

async function loadData() {
    try {
        console.log('Loading data...');
        // Read data from the ./data/ directory
        const vesselsData = await fs.readFile(`./data/${VESSELS_FILE}`, 'utf-8');
        const fleetsData = await fs.readFile(`./data/${FLEETS_FILE}`, 'utf-8');
        const locationsData = await fs.readFile(`./data/${LOCATIONS_FILE}`, 'utf-8');

        vessels = JSON.parse(vesselsData);
        fleets = JSON.parse(fleetsData);
        vesselLocations = JSON.parse(locationsData);

        console.log(`\nLocation data loaded: ${vesselLocations.length} vessel location records available.`);
        console.log('✅ All data loaded successfully!');
    } catch (error) {
        console.error('❌ Error loading data. Ensure the following files are in the "./data/" directory and the server is restarted:', error.message);
        console.error(`- ${FLEETS_FILE}`);
        console.error(`- ${LOCATIONS_FILE}`);
        console.error(`- ${VESSELS_FILE}`);
        process.exit(1); 
    }
}

loadData();

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

// Route to get basic fleet info for the main list page
app.get('/api/fleets', (req, res) => {
    if (!Array.isArray(fleets)) {
        console.error("Fleets data is corrupted or not an array.");
        return res.json([]);
    }
    
    const fleetsInfo = fleets.map(f => ({
        id: f._id,
        name: f.name,
        vesselsCount: f.vessels ? f.vessels.length : 0,
    }));
    res.json(fleetsInfo);
});

// Route to get and search vessels for a specific fleet (Search Route)
app.get('/api/fleets/:id/vessels', (req, res) => {
    const fleet = fleets.find(f => f._id === req.params.id);
    if (!fleet) {
        return res.status(404).json({ message: 'Fleet not found' });
    }

    // Extract search query parameters
    const { name, flag, mmsi } = req.query;

    // 1. Get all vessels that belong to this fleet
    const fleetVesselIds = new Set((fleet.vessels || []).map(fv => fv._id));
    let filteredVessels = vessels.filter(v => fleetVesselIds.has(v._id));

    // 2. Apply search filters (AND logic - Robust filtering)
    
    // Filter by name (case-insensitive, partial match)
    if (name) {
        const searchName = name.toLowerCase().trim();
        filteredVessels = filteredVessels.filter(v => {
            const vesselName = String(v.name || '').toLowerCase();
            return vesselName.includes(searchName);
        });
    }
    
    // Filter by flag (case-insensitive, partial match)
    if (flag) {
        const searchFlag = flag.toLowerCase().trim();
        filteredVessels = filteredVessels.filter(v => {
            const vesselFlag = String(v.flag || '').toLowerCase();
            return vesselFlag.includes(searchFlag);
        });
    }

    // Filter by MMSI (string partial match)
    if (mmsi) {
        const searchMmsi = String(mmsi).trim(); 
        filteredVessels = filteredVessels.filter(v => {
            const vesselMmsiStr = String(v.mmsi || ''); 
            return vesselMmsiStr.includes(searchMmsi);
        });
    }

    // 3. Combine filtered vessel data with location data and fleet value
    const finalVessels = filteredVessels.map(vessel => {
        const fleetVesselDetail = fleet.vessels.find(fv => fv._id === vessel._id);
        const location = vesselLocations.find(l => l._id === vessel._id);
        
        const latitude = location?.lastpos?.geometry?.coordinates[1] ?? null;
        const longitude = location?.lastpos?.geometry?.coordinates[0] ?? null;

        return {
            ...vessel,
            value: fleetVesselDetail?.value,
            latitude,
            longitude,
        };
    });

    res.json(finalVessels);
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
});