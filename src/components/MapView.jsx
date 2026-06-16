import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import RoutingMachine from './RoutingMachine';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Live location marker — solid blue dot with accuracy ring
const liveIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="
        position:absolute;inset:0;
        background:rgba(37,99,235,0.2);
        border-radius:50%;
        animation:pulse-ring 1.5s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:14px;height:14px;
        background:#2563EB;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 2px rgba(37,99,235,0.4);
      "></div>
    </div>
  `,
  iconSize:   [22, 22],
  iconAnchor: [11, 11],
  popupAnchor:[0, -14],
});

// Inject pulse-ring keyframe once
if (typeof document !== 'undefined' && !document.getElementById('pulse-style')) {
  const style = document.createElement('style');
  style.id = 'pulse-style';
  style.textContent = `
    @keyframes pulse-ring {
      0%   { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── Map controller: invalidates size + flies to active item / user location ──
function MapController({ activeItem, userLocation }) {
  const map = useMap();

  // Invalidate on mount (critical for mobile tab switch)
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, []);

  // Fly to active item when selected
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    if (activeItem?.lat && activeItem?.lng) {
      map.flyTo([activeItem.lat, activeItem.lng], 16, { animate: true, duration: 0.8 });
    }
  }, [activeItem]);

  // Pan to user when live location updates (only if no active item selected)
  useEffect(() => {
    if (!map || !userLocation || activeItem) return;
    map.flyTo(userLocation, 14, { animate: true, duration: 0.8 });
  }, [userLocation]);

  return null;
}

export default function MapView({ data, activeItem, setActiveItem, userLocation, isTracking }) {
  const ludhianaCenter = [30.9010, 75.8573];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }} className="relative z-0">
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

        {/* Real road route from user → selected item */}
        {userLocation && activeItem && (
          <RoutingMachine
            start={userLocation}
            end={[activeItem.lat, activeItem.lng]}
          />
        )}

        {/* ── Live user location marker ── */}
        {userLocation && (
          <Marker position={userLocation} icon={liveIcon} zIndexOffset={1000}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <strong style={{ fontSize: '13px' }}>📍 Your Location</strong>
                {isTracking && (
                  <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                    🟢 Live tracking active
                  </p>
                )}
                <p style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                  {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── All location markers with clustering ── */}
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
                  {item.tehsil && !item.village && (
                    <p style={{ fontSize: '11px', color: '#777' }}>📍 {item.tehsil}</p>
                  )}
                  {item.circle && (
                    <p style={{ fontSize: '11px' }}>🔵 {item.circle}</p>
                  )}
                  {item.workerName && item.workerName !== 'Vacant' && (
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>👩 {item.workerName}</p>
                  )}
                  {(item.workerMobile || item.mobile) && item.workerMobile !== 'Vacant' && (
                    <a
                      href={`tel:${(item.workerMobile || item.mobile).replace(/\D/g, '').slice(-10)}`}
                      style={{ fontSize: '11px', color: '#2563EB', display: 'block', marginTop: '2px' }}
                      onClick={e => e.stopPropagation()}
                    >
                      📞 {item.workerMobile || item.mobile}
                    </a>
                  )}
                  {item.distance != null && (
                    <p style={{ fontSize: '11px', color: '#2563EB', marginTop: '4px', fontWeight: 'bold' }}>
                      📏 {item.distance.toFixed(1)} km away
                    </p>
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