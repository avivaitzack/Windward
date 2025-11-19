
const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let vessels = [];
let fleets = [];

async function loadData() {
  const vesselsData = await fs.readFile('./data/vessels.json', 'utf-8');
  const fleetsData = await fs.readFile('./data/fleets.json', 'utf-8');

  vessels = JSON.parse(vesselsData);
  fleets = JSON.parse(fleetsData);
}

loadData();

app.get('/api/fleets', (req, res) => {
  const fleetsInfo = fleets.map(f => ({
    id: f.id,
    name: f.name,
    vesselsCount: f.vessels.length,
  }));
  res.json(fleetsInfo);
});

// Get vessels of a specific fleet
app.get('/api/fleets/:id/vessels', (req, res) => {
  const fleet = fleets.find(f => f._id === req.params.id);
  if (!fleet) return res.status(404).json({ message: 'Fleet not found' });

  // Map fleet vessels to include full vessel info if available
  const fleetVessels = fleet.vessels.map(fv => {
    const vessel = vessels.find(v => v._id === fv._id);
    return vessel ? { ...vessel, value: fv.value } : { _id: fv._id, value: fv.value };
  });

  res.json(fleetVessels);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



