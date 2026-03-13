import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const InventoryView = ({ type }) => {
  const [data, setData] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState('');
  const [loading, setLoading] = useState(true);

  const configs = {
    land: {
      title: 'Land Inventory',
      table: 'land',
      columns: [
        { header: 'Depot/Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Description', key: 'asset_description' },
        { header: 'Size (m²)', key: 'land_size' },
        { header: 'Fair Value', key: 'fair_value' },
      ]
    },
    buildings: {
      title: 'Buildings Inventory',
      table: 'buildings',
      columns: [
        { header: 'Asset Number', key: 'asset_number' },
        { header: 'Description', key: 'asset_description' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Plinth Area', key: 'plinth_area' },
        { header: 'Fair Value', key: 'fair_value' },
      ]
    },
    vehicles: {
      title: 'Motor Vehicles',
      table: 'vehicles',
      columns: [
        { header: 'Reg Number', key: 'registration_number' },
        { header: 'Make/Model', key: 'model' },
        { header: 'Year', key: 'year_of_manufacture' },
        { header: 'Mileage', key: 'mileage' },
        { header: 'Fair Value', key: 'fair_value' },
      ]
    },
    machinery: {
        title: 'Plant & Machinery',
        table: 'machinery',
        columns: [
          { header: 'Asset Description', key: 'asset_description' },
          { header: 'Serial No', key: 'serial_number' },
          { header: 'Station', key: 'depot_name' },
          { header: 'Qty', key: 'qty' },
          { header: 'Fair Value', key: 'fair_value' },
        ]
      }
  };

  const config = configs[type] || { title: 'Unknown', columns: [] };

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const response = await axios.get(`${API_URL}/depots`);
        // Defensive check for depots array
        if (Array.isArray(response.data)) {
          setDepots(response.data);
        } else {
          console.error("API Error: Depots response is not an array", response.data);
          setDepots([]);
        }
      } catch (error) {
        console.error("Error fetching depots:", error);
      }
    };
    fetchDepots();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/inventory/${config.table}${selectedDepot ? `?depot_id=${selectedDepot}` : ''}`;
        const response = await axios.get(url);
        const formattedData = response.data.map(item => ({
          ...item,
          depot_name: item.depots?.name || 'Unknown',
          fair_value: item.fair_value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00'
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    if (config.table) fetchData();
  }, [type, selectedDepot]);

  if (loading && data.length === 0) return <div className="flex items-center justify-center h-[60vh] text-primary font-semibold animate-pulse">Loading {config.title} Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">{config.title}</h1>
          <p className="text-text-muted italic text-sm">Bespoke asset register for GMB property class: {type}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Station Filtering:</label>
          <select 
            value={selectedDepot}
            onChange={(e) => setSelectedDepot(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-primary transition-colors min-w-[200px] shadow-sm font-medium"
          >
            <option value="">All Regions / Stations</option>
            {depots.map(depot => (
              <option key={depot.id} value={depot.id}>{depot.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable 
        title={`${selectedDepot ? depots.find(d => d.id == selectedDepot)?.name : 'National'} Asset List`} 
        columns={config.columns} 
        data={data} 
      />
    </div>
  );
};

export default InventoryView;
