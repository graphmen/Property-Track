import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { Grid, List, ImageOff, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const InventoryView = ({ type }) => {
  const [data, setData] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'gallery'

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
      },
      furniture: {
        title: 'Furniture & Fittings',
        table: 'furniture',
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
        
        // Final Hardening: ensure response.data is an array before mapping
        const rawData = Array.isArray(response.data) ? response.data : [];
        if (!Array.isArray(response.data)) {
          console.error("Critical API Error: Expected array, got:", response.data);
        }

        const formattedData = rawData.map(item => ({
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
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {type === 'buildings' && (
            <div className="flex bg-gray-50 p-1 rounded-lg border border-[var(--border)] shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white shadow text-primary' : 'text-text-muted hover:text-text-main'}`}
              >
                <List size={16} /> Table
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'gallery' ? 'bg-white shadow text-primary' : 'text-text-muted hover:text-text-main'}`}
              >
                <Grid size={16} /> Gallery
              </button>
            </div>
          )}
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
      </div>

      {viewMode === 'gallery' && type === 'buildings' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((item, idx) => (
            <div key={idx} className="glass-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full bg-white relative">
              <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-[var(--border)]">
                {item.photo_url ? (
                  <img 
                    src={item.photo_url} 
                    alt={item.asset_description || 'Building Photo'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.parentElement.innerHTML = '<div class="text-text-muted flex flex-col items-center gap-2"><svg class="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg><span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Broken Link</span></div>'; }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <ImageOff size={20} className="text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No Photo Uploaded</span>
                  </div>
                )}
                {item.rate && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-bold text-primary shadow-sm border border-gray-100 uppercase tracking-widest">
                    {item.rate}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-text-main leading-snug mb-2" title={item.asset_description || 'Unknown Asset'}>{item.asset_description || 'Unlisted Building Asset'}</h3>
                <div className="flex items-center gap-2 text-xs text-text-muted mb-5 font-medium">
                  <MapPin size={14} className="text-primary/70" />
                  <span className="truncate">{item.depot_name}</span>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)] bg-gray-50 -mx-5 -mb-5 px-5 pb-5">
                  <div>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mb-1">Asset Registry No.</p>
                    <p className="text-sm font-semibold text-text-main truncate" title={item.asset_number}>{item.asset_number || 'PENDING'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mb-1">Current Fair Value</p>
                    <p className="text-sm font-bold text-secondary truncate">{item.fair_value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageOff size={24} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-800 text-lg mb-1">No Buildings Found</p>
              <p className="text-sm text-text-muted font-medium">Sync your Google Sheet to populate the photo gallery.</p>
            </div>
          )}
        </div>
      ) : (
        <DataTable 
          title={`${selectedDepot ? depots.find(d => d.id == selectedDepot)?.name : 'National'} Asset List`} 
          columns={config.columns} 
          data={data} 
        />
      )}
    </div>
  );
};

export default InventoryView;
