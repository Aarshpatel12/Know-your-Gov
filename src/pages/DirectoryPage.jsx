import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MapSidebar from '../components/MapSidebar';
import MapView from '../components/MapView';
import { calculateDistance } from '../utils/geoMath';
import { List, Map } from 'lucide-react';

import patwariData  from '../assets/data/patwaris.json';
import sewakendraData from '../assets/data/sewakendras.json';
import kanungoData  from '../assets/data/kanungos.json';
import awcData      from '../assets/data/awcs.json';

export default function DirectoryPage() {
  const { category } = useParams();
  const [data, setData]             = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mobileTab, setMobileTab]   = useState('list');

  useEffect(() => {
    if      (category === 'patwari'    || category === 'patwaris')    setData(patwariData);
    else if (category === 'kanungo'    || category === 'kanungos')    setData(kanungoData);
    else if (category === 'sewakendra' || category === 'sewakendras') setData(sewakendraData);
    else if (category === 'awc'        || category === 'awcs')        setData(awcData);
    else setData([]);

    setActiveItem(null);
    setUserLocation(null);
    setMobileTab('list');
  }, [category]);

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    if (item) setMobileTab('map');   // auto-switch to map when item tapped
  };

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude: userLat, longitude: userLng } = position.coords;
      setUserLocation([userLat, userLng]);

      const base =
        category === 'patwari'    || category === 'patwaris'    ? patwariData    :
        category === 'sewakendra' || category === 'sewakendras' ? sewakendraData :
        category === 'kanungo'    || category === 'kanungos'    ? kanungoData    :
        category === 'awc'        || category === 'awcs'        ? awcData        : [];

      const sorted = [...base]
        .map(item => ({ ...item, distance: calculateDistance(userLat, userLng, item.lat, item.lng) }))
        .sort((a, b) => a.distance - b.distance);

      setData(sorted);
      setMobileTab('map');
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Mobile Tab Bar ── */}
      <div className="flex md:hidden shrink-0 bg-white border-b shadow-sm z-30">
        {['list', 'map'].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              mobileTab === tab
                ? 'text-green-700 border-green-700 bg-green-50'
                : 'text-gray-500 border-transparent'
            }`}
          >
            {tab === 'list' ? <List size={16} /> : <Map size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Body: sidebar + map ──
          Strategy: The MAP is ALWAYS rendered (never display:none) so Leaflet
          always has a real DOM size. On mobile, the SIDEBAR slides on top of the
          map using absolute positioning when the List tab is active.
      ── */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">

        {/* MAP — always rendered, fills the entire content area */}
        <div className="absolute inset-0 md:relative md:flex-1">
          <MapView
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            userLocation={userLocation}
          />
        </div>

        {/* SIDEBAR — on mobile: overlays the map when List tab is active.
                      On desktop: always visible as a fixed-width panel. */}
        <div
          className={`
            absolute inset-0 z-10
            md:relative md:inset-auto md:z-auto
            md:w-96 md:shrink-0
            transition-transform duration-300
            ${mobileTab === 'list'
              ? 'translate-x-0'          /* visible */
              : '-translate-x-full md:translate-x-0' /* slid off-screen on mobile */
            }
          `}
        >
          <MapSidebar
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            category={category}
            onLocateMe={handleLocateMe}
            userLocation={userLocation}
          />
        </div>

      </div>
    </div>
  );
}