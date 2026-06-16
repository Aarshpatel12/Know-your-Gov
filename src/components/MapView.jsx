import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import RoutingMachine from './RoutingMachine';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ activeItem, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (activeItem) {
      map.flyTo([activeItem.lat, activeItem.lng], 15, { animate: true });
    } else if (userLocation) {
      map.flyTo(userLocation, 13, { animate: true });
    }
  }, [activeItem, userLocation, map]);
  return null;
}

export default function MapView({ data, activeItem, setActiveItem, userLocation }) {
  const ludhianaCenter = [30.9010, 75.8573];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={ludhianaCenter} zoom={11} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController activeItem={activeItem} userLocation={userLocation} />
        
        {userLocation && activeItem && (
          <RoutingMachine start={userLocation} end={[activeItem.lat, activeItem.lng]} />
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <MarkerClusterGroup chunkedLoading>
          {data.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              eventHandlers={{ click: () => setActiveItem(item) }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  {item.assembly && <p className="text-xs text-gray-600 mt-0.5">🏛️ {item.assembly}</p>}
                  {item.village && <p className="text-xs text-gray-500">📍 {item.village}</p>}
                  {item.workerName && item.workerName !== 'Vacant' && (
                    <p className="text-xs mt-1">👩 {item.workerName}</p>
                  )}
                  {item.workerMobile && item.workerMobile !== 'Vacant' && (
                    <p className="text-xs text-blue-600">📞 {item.workerMobile}</p>
                  )}
                  {item.mobile && <p className="text-xs">{item.mobile}</p>}
                  {item.locationType && <p className="text-xs text-gray-400 mt-1">{item.locationType}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}