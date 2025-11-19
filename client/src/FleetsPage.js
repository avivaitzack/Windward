import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, Paper, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FleetsPage() {
  const [fleets, setFleets] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/fleets')
      .then(res => {
        console.log('API /api/fleets response:', res.data);
        setFleets(res.data || []);
      })
      .catch(err => {
        console.error('Error fetching fleets:', err);
        setFleets([]);
      });
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    const sorted = [...fleets].sort((a, b) => {
      const A = a[property] ?? '';
      const B = b[property] ?? '';
      if (A < B) return isAsc ? -1 : 1;
      if (A > B) return isAsc ? 1 : -1;
      return 0;
    });
    setFleets(sorted);
  };

  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Fleets</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'vesselsCount'}
                direction={orderBy === 'vesselsCount' ? order : 'asc'}
                onClick={() => handleSort('vesselsCount')}
              >
                Vessels Count
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {fleets.map(fleet => (
            <TableRow
              key={fleet.id ?? fleet._id}
              hover
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/fleet/${fleet.id ?? fleet._id}`)}
            >
              <TableCell>{fleet.name ?? fleet.Name ?? `Fleet ${fleet._id ?? fleet.id}`}</TableCell>
              <TableCell>{fleet.vesselsCount ?? (fleet.vessels ? fleet.vessels.length : '')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default FleetsPage;
