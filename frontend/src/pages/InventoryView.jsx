import React, { useEffect, useState, useMemo } from 'react';
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
        { header: 'Location X', key: 'location_x' },
        { header: 'Location Y', key: 'location_y' },
        { header: 'Accuracy (m)', key: 'accuracy' },
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
      },
      computers: {
        title: 'Computer Inventory',
        table: 'computers',
        columns: [
          { header: 'Asset Description', key: 'asset_description' },
          { header: 'Asset Number', key: 'asset_number' },
          { header: 'Serial No', key: 'serial_number' },
          { header: 'Station', key: 'depot_name' },
          { header: 'Qty', key: 'qty' },
          { header: 'Fair Value', key: 'fair_value' },
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
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="pl-9 pr-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-primary transition-colors min-w-[180px] shadow-sm font-medium"
              />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredData.map((item, idx) => (
             <div key={idx} className="glass-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full bg-white relative">
              <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-[var(--border)] cursor-pointer" onClick={() => item.photo_url && setSelectedImage(item)}>
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
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-text-main leading-snug mb-2 text-xs line-clamp-2 h-8" title={item.asset_description || 'Unknown Asset'}>{item.asset_description || 'Unlisted Building Asset'}</h3>
                <div className="flex items-center gap-2 text-[10px] text-text-muted mb-4 font-medium">
                  <MapPin size={12} className="text-primary/70" />
                  <span className="truncate">{item.depot_name}</span>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)] bg-gray-50 -mx-4 -mb-4 px-4 pb-4">
                  <div>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Asset No.</p>
                    <p className="text-[10px] font-semibold text-text-main truncate" title={item.asset_number}>{item.asset_number || 'PENDING'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Fair Value</p>
                    <p className="text-[10px] font-bold text-secondary truncate">{item.fair_value}</p>
                  </div>
                </div>
                
                {/* Immediate Download Button on Card */}
                {item.photo_url && (
                  <a 
                    href={item.photo_url.replace('export=view', 'export=download')}
                    target="_blank"
                    rel="noreferrer"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 left-2 p-1.5 bg-black/50 hover:bg-primary text-white rounded-md backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title="Download Photo"
                  >
                    <Download size={14} />
                  </a>
                )}
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

      {/* Image Zoom Modal - Enhanced with high Z-index and robust closure */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-fade-in"
          style={{ cursor: 'zoom-out' }}
          onClick={() => setSelectedImage(null)}
        >
          {/* Explicit Close Button with high visibility */}
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white bg-white/10 hover:bg-primary p-3 rounded-full transition-all z-[10001] group flex items-center gap-2 border border-white/20"
            title="Close Gallery View"
          >
            <X size={24} />
            <span className="hidden sm:inline font-bold text-[10px] tracking-widest">CLOSE</span>
          </button>
          
          <div className="relative max-w-5xl w-full flex flex-col items-center justify-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.photo_url} 
              alt={selectedImage.asset_description} 
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
              style={{ cursor: 'default' }}
            />
            
            <div className="mt-6 w-full max-w-4xl bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 shadow-2xl">
              <div className="text-white flex-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-primary-light line-clamp-2 uppercase">{selectedImage.asset_description}</h2>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/50">
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    <MapPin size={12} className="text-secondary" />
                    <span>{selectedImage.depot_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-secondary">ASSET:</span>
                    <span className="text-white">{selectedImage.asset_number || '0'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-secondary">VALUE:</span>
                    <span className="text-white">{selectedImage.fair_value}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={selectedImage.photo_url.replace('export=view', 'export=download')} 
                target="_blank" 
                rel="noreferrer"
                download 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-black transition-all shadow-xl hover:scale-105 active:scale-95 text-xs tracking-widest"
              >
                <Download size={18} />
                <span>DOWNLOAD PHOTO</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
