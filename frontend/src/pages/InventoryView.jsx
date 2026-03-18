import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import DataTable from '../components/DataTable';
import BuildingMap from '../components/BuildingMap';
import { Grid, List, ImageOff, MapPin, X, Download, Map as MapIcon, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const InventoryView = ({ type }) => {
  const [data, setData] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'gallery'
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const configs = {
    land: {
      title: 'Land Inventory',
      table: 'land',
      columns: [
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Description', key: 'asset_description' },
        { header: 'Size (m²)', key: 'land_size' },
        { header: 'Rate', key: 'rate' },
        { header: 'ERC', key: 'erc' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'Notes', key: 'notes' }
      ]
    },
    buildings: {
      title: 'Buildings Inventory',
      table: 'buildings',
      columns: [
        { header: 'Asset Number', key: 'asset_number' },
        { header: 'Description', key: 'asset_description' },
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Qty', key: 'qty' },
        { header: 'Plinth Area', key: 'plinth_area' },
        { header: 'Rate', key: 'rate' },
        { header: 'ERC', key: 'erc' },
        { header: 'Depreciation %', key: 'depreciation_pct' },
        { header: 'DRC', key: 'drc' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'ERUL', key: 'erul' },
        { header: 'Notes', key: 'notes' },
        { header: 'Location X', key: 'location_x' },
        { header: 'Location Y', key: 'location_y' }
      ]
    },
    vehicles: {
      title: 'Motor Vehicles',
      table: 'vehicles',
      columns: [
        { header: 'Reg Number', key: 'registration_number' },
        { header: 'Make', key: 'make' },
        { header: 'Model', key: 'model' },
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Year', key: 'year_of_manufacture' },
        { header: 'Mileage', key: 'mileage' },
        { header: 'Engine Number', key: 'engine_number' },
        { header: 'Chassis Number', key: 'chassis_number' },
        { header: 'Condition', key: 'condition' },
        { header: 'GRC', key: 'grc' },
        { header: 'Depreciation %', key: 'depreciation_pct' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'ERUL', key: 'erul' },
        { header: 'Notes', key: 'notes' }
      ]
    },
    machinery: {
      title: 'Plant & Machinery',
      table: 'machinery',
      columns: [
        { header: 'Description', key: 'asset_description' },
        { header: 'Asset Number', key: 'asset_number' },
        { header: 'Serial No', key: 'serial_number' },
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Qty', key: 'qty' },
        { header: 'Plinth Area', key: 'plinth_area' },
        { header: 'Rate', key: 'rate' },
        { header: 'ERC', key: 'erc' },
        { header: 'Depreciation %', key: 'depreciation_pct' },
        { header: 'DRC', key: 'drc' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'ERUL', key: 'erul' },
        { header: 'Notes', key: 'notes' }
      ]
    },
    furniture: {
      title: 'Furniture & Fittings',
      table: 'furniture',
      columns: [
        { header: 'Description', key: 'asset_description' },
        { header: 'Asset Number', key: 'asset_number' },
        { header: 'Serial No', key: 'serial_number' },
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Qty', key: 'qty' },
        { header: 'Plinth Area', key: 'plinth_area' },
        { header: 'Rate', key: 'rate' },
        { header: 'ERC', key: 'erc' },
        { header: 'Depreciation %', key: 'depreciation_pct' },
        { header: 'DRC', key: 'drc' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'ERUL', key: 'erul' },
        { header: 'Notes', key: 'notes' }
      ]
    },
    computers: {
      title: 'Computer Inventory',
      table: 'computers',
      columns: [
        { header: 'Description', key: 'asset_description' },
        { header: 'Asset Number', key: 'asset_number' },
        { header: 'Serial No', key: 'serial_number' },
        { header: 'Region', key: 'region' },
        { header: 'Station', key: 'depot_name' },
        { header: 'Location', key: 'location' },
        { header: 'Qty', key: 'qty' },
        { header: 'Rate', key: 'rate' },
        { header: 'ERC', key: 'erc' },
        { header: 'Depreciation %', key: 'depreciation_pct' },
        { header: 'DRC', key: 'drc' },
        { header: 'Fair Value', key: 'fair_value' },
        { header: 'ERUL', key: 'erul' },
        { header: 'Notes', key: 'notes' }
      ]
    }
  };

  const config = configs[type] || { title: 'Unknown', columns: [] };

  // Live search: filter across all column values
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(row =>
      config.columns.some(col => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, config.columns]);

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
          <p className="text-text-muted italic text-sm">Asset Register for GMB Property Class: {config.title}</p>
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
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow text-primary' : 'text-text-muted hover:text-text-main'}`}
              >
                <MapIcon size={16} /> Satellite Map
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="pl-4 pr-9 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-primary transition-all min-w-[180px] font-medium shadow-sm"
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            {/* Station Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Station:</label>
              <select 
                value={selectedDepot}
                onChange={(e) => setSelectedDepot(e.target.value)}
                className="px-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-primary transition-colors min-w-[180px] shadow-sm font-medium"
              >
                <option value="">All Regions / Stations</option>
                {depots.map(depot => (
                  <option key={depot.id} value={depot.id}>{depot.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'gallery' && type === 'buildings' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
          {filteredData.map((item, idx) => (
             <div key={idx} className="glass-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col bg-white relative rounded-lg border">
              <div className="h-24 bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => item.photo_url && setSelectedImage(item)}>
                {item.photo_url ? (
                  <img 
                    src={item.photo_url} 
                    alt={item.asset_description || 'Building Photo'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.parentElement.innerHTML = '<div class="text-text-muted flex flex-col items-center gap-1"><svg class="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg><span class="text-[9px] font-bold uppercase tracking-widest text-gray-400">No Image</span></div>'; }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageOff size={16} className="text-gray-300" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">No Photo</span>
                  </div>
                )}
                {/* Download button on hover */}
                {item.photo_url && (
                  <a 
                    href={item.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-primary text-white rounded transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title="Download"
                  >
                    <Download size={10} />
                  </a>
                )}
              </div>
              <div className="p-2">
                <p className="text-[9px] font-semibold text-text-main line-clamp-1 leading-tight" title={item.asset_description || 'Unknown'}>{item.asset_description || 'Unlisted'}</p>
                <p className="text-[8px] text-text-muted truncate mt-0.5">{item.depot_name}</p>
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
      ) : viewMode === 'map' && type === 'buildings' ? (
        <BuildingMap buildings={data} />
      ) : (
        <DataTable 
          title={`${selectedDepot ? depots.find(d => d.id == selectedDepot)?.name : 'National'} Asset List`} 
          columns={config.columns} 
          data={filteredData} 
        />
      )}

      {/* Image Zoom Modal — rendered via Portal directly on document.body to escape all parent stacking contexts */}
      {selectedImage && ReactDOM.createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 100000,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.75rem 1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 900,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d12127'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <X size={20} />
            <span>CLOSE</span>
          </button>

          {/* Inner content — stops propagation so clicking on image/info doesnt close */}
          <div 
            style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.photo_url} 
              alt={selectedImage.asset_description} 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
            />
            
            <div style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ color: 'white' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedImage.asset_description}</h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
                  <span>📍 {selectedImage.depot_name}</span>
                  <span>🏷 {selectedImage.asset_number || 'N/A'}</span>
                  <span>💵 {selectedImage.fair_value}</span>
                </div>
              </div>
              
              <a 
                href={selectedImage.photo_url} 
                target="_blank" 
                rel="noreferrer"
                download 
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#d12127', color: 'white', borderRadius: '12px', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(209,33,39,0.4)' }}
              >
                <Download size={16} />
                DOWNLOAD
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default InventoryView;
