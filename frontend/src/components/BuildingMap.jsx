import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom GMB Icon
const gmbIcon = new L.DivIcon({
  className: 'custom-gmb-icon',
  html: `
    <div style="
      background-color: #d12127;
      color: white;
      font-weight: 900;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      border: 2px solid white;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translate(-50%, -100%);
      position: relative;
    ">
      GMB
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #d12127;
      "></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

import { useMap } from 'react-leaflet';

// Helper component to update map view when data changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const BuildingMap = ({ buildings }) => {
  // Center map on Zimbabwe if no data
  const defaultCenter = [-19.0154, 29.1549];
  const defaultZoom = 6;

  // Filter and parse coordinates
  const validBuildings = buildings
    .filter(b => 
      b.location_x !== null && b.location_y !== null && 
      !isNaN(parseFloat(b.location_x)) && !isNaN(parseFloat(b.location_y))
    )
    .map(b => ({
      ...b,
      location_x: parseFloat(b.location_x),
      location_y: parseFloat(b.location_y)
    }));

  const mapCenter = validBuildings.length > 0 
    ? [validBuildings[0].location_x, validBuildings[0].location_y] 
    : defaultCenter;
  
  const mapZoom = validBuildings.length > 0 ? 16 : defaultZoom;

  return (
    <div 
      id="leaflet-map-container"
      className="w-full rounded-xl overflow-hidden border border-[var(--border)] shadow-xl relative z-0 bg-gray-200"
      style={{ height: '650px', minHeight: '650px' }}
    >
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {/* Google Hybrid Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/help/terms_maps/">Google</a>'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />

        {validBuildings.map((building) => (
          <Marker 
            key={building.id} 
            position={[building.location_x, building.location_y]}
            icon={gmbIcon}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 min-w-[200px]">
                {building.photo_url ? (
                  <img 
                    src={building.photo_url} 
                    alt={building.asset_description} 
                    className="w-full h-32 object-cover rounded-lg mb-3 shadow-md border border-white"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-3 border border-dashed border-gray-300">
                    <span className="text-[10px] uppercase font-bold text-gray-400">No Photo</span>
                  </div>
                )}
                <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{building.asset_description}</h3>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    STATION: {building.depot_name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                    VALUE: {building.fair_value}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validBuildings.length === 0 && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] z-[1000] flex items-center justify-center p-6 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm border-t-4 border-primary">
            <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tighter">GPS Offline</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
               We couldn't find any building records with valid GPS coordinates. Update <span className="text-primary font-bold">Location X/Y</span> in Google Sheets to activate satellite tracking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingMap;
