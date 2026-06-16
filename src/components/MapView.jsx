import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import RoutingMachine from './RoutingMachine';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon URLs broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
});

// Forces Leaflet to recalculate size whenever activeItem/userLocation change
// This is critical on mobile where the map panel appears after being hidden
function MapController({ activeItem, userLocation }) {
  const map = useMap();

  useEffect(() => {
    // Small delay lets the DOM finish painting before invalidating
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(t);
  }, []); // on mount

  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    if (activeItem?.lat && activeItem?.lng) {
      map.flyTo([activeItem.lat, activeItem.lng], 15, { animate: true, duration: 0.8 });
    } else if (userLocation) {
      map.flyTo(userLocation, 13, { animate: true, duration: 0.8 });
    }
  }, [activeItem, userLocation]);

  return null;
}

export default function MapView({ data, activeItem, setActiveItem, userLocation, visible }) {
  const ludhianaCenter = [30.9010, 75.8573];
  const wrapperRef = useRef(null);

  return (
    // Use a concrete style height so Leaflet tiles always render
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
      className="relative z-0"
    >
      <MapContainer
        center={ludhianaCenter}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapController activeItem={activeItem} userLocation={userLocation} />

        {/* Route line from user to selected item */}
        {userLocation && activeItem && (
          <RoutingMachine
            start={userLocation}
            end={[activeItem.lat, activeItem.lng]}
          />
        )}

        {/* User position marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong>📍 You are here</strong>
            </Popup>
          </Marker>
        )}

        {/* All location markers with clustering */}
        <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={16}>
          {data.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              eventHandlers={{ click: () => setActiveItem(item) }}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>
                    {item.name}
                  </p>
                  {item.assembly && (
                    <p style={{ fontSize: '11px', color: '#555' }}>🏛️ {item.assembly}</p>
                  )}
                  {item.village && (
                    <p style={{ fontSize: '11px', color: '#777' }}>📍 {item.village}</p>
                  )}
                  {item.workerName && item.workerName !== 'Vacant' && (
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>👩 {item.workerName}</p>
                  )}
                  {item.workerMobile && item.workerMobile !== 'Vacant' && (
                    <p style={{ fontSize: '11px', color: '#2563EB' }}>📞 {item.workerMobile}</p>
                  )}
                  {item.mobile && (
                    <p style={{ fontSize: '11px' }}>📞 {item.mobile}</p>
                  )}
                  {item.tehsil && (
                    <p style={{ fontSize: '11px', color: '#777' }}>{item.tehsil}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}