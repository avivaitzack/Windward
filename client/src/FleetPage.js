// client/src/FleetPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FleetPage() {
  const { id } = useParams();
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch vessels for this fleet
        const vesselsRes = await axios.get(`http://localhost:5000/api/fleets/${id}/vessels`);
        const vesselsData = vesselsRes.data;

        // Fetch vessels locations (from public folder)
        const locRes = await axios.get("/vesselsLocation.json");
        const locData = locRes.data;

        // Merge vessels with location
        const merged = vesselsData.map((v) => {
          const loc = locData.find((l) => l._id === v._id);
          return {
            ...v,
            latitude: loc?.lastpos?.geometry?.coordinates[1] || null,
            longitude: loc?.lastpos?.geometry?.coordinates[0] || null,
          };
        });

        setVessels(merged);
      } catch (err) {
        console.error("Error fetching vessels:", err);
      }
    }

    fetchData();
  }, [id]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Fleet Vessels</h1>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>MMSI</TableCell>
            <TableCell>Flag</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vessels.map((v) => (
            <TableRow key={v._id} hover>
              <TableCell>{v.name || "-"}</TableCell>
              <TableCell>{v.mmsi || "-"}</TableCell>
              <TableCell>{v.flag || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Map */}
      <h2>Vessels Locations</h2>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: "500px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />

        {vessels
          .filter((v) => v.latitude && v.longitude)
          .map((v) => (
            <Marker key={v._id} position={[v.latitude, v.longitude]}>
              <Popup>
                <div>
                  <h4>{v.name}</h4>
                  <p>MMSI: {v.mmsi}</p>
                  <p>Flag: {v.flag}</p>
                  <p>
                    Location: {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default FleetPage;
