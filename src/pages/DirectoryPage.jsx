import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MapSidebar from '../components/MapSidebar';
import MapView from '../components/MapView';
import { calculateDistance } from '../utils/geoMath';
import { List, Map } from 'lucide-react';

import patwariData from '../assets/data/patwaris.json';
import sewakendraData from '../assets/data/sewakendras.json';
import kanungoData from '../assets/data/kanungos.json';
import awcData from '../assets/data/awcs.json';

export default function DirectoryPage() {
  const { category } = useParams();
  const [data, setData] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  // mobile tab: 'list' | 'map'
  const [mobileTab, setMobileTab] = useState('list');

  useEffect(() => {
    if (category === 'patwari' || category === 'patwaris') {
      setData(patwariData);
    } else if (category === 'kanungo' || category === 'kanungos') {
      setData(kanungoData);
    } else if (category === 'sewakendra' || category === 'sewakendras') {
      setData(sewakendraData);
    } else if (category === 'awc' || category === 'awcs') {
      setData(awcData);
    } else {
      setData([]);
    }
    setActiveItem(null);
    setUserLocation(null);
    setMobileTab('list');
  }, [category]);

  // When user taps a list item on mobile, switch to map view
  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    if (item) setMobileTab('map');
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation([userLat, userLng]);

        let baseData = [];
        if (category === 'patwari' || category === 'patwaris') {
          baseData = patwariData;
        } else if (category === 'sewakendra' || category === 'sewakendras') {
          baseData = sewakendraData;
        } else if (category === 'kanungo' || category === 'kanungos') {
          baseData = kanungoData;
        } else if (category === 'awc' || category === 'awcs') {
          baseData = awcData;
        }

        const sortedData = [...baseData].map(item => ({
          ...item,
          distance: calculateDistance(userLat, userLng, item.lat, item.lng)
        })).sort((a, b) => a.distance - b.distance);

        setData(sortedData);
      });
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Mobile Tab Bar ── */}
      <div className="flex md:hidden border-b bg-white z-20 shrink-0">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors
            ${mobileTab === 'list'
              ? 'text-green-700 border-b-2 border-green-700 bg-green-50'
              : 'text-gray-500'}`}
        >
          <List size={18} /> List
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors
            ${mobileTab === 'map'
              ? 'text-green-700 border-b-2 border-green-700 bg-green-50'
              : 'text-gray-500'}`}
        >
          <Map size={18} /> Map
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: visible on desktop always; on mobile only when tab='list' */}
        <div className={`
          ${mobileTab === 'list' ? 'flex' : 'hidden'}
          md:flex
          w-full md:w-96 shrink-0
        `}>
          <MapSidebar
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            category={category}
            onLocateMe={handleLocateMe}
            userLocation={userLocation}
          />
        </div>

        {/* Map: visible on desktop always; on mobile only when tab='map' */}
        <div className={`
          ${mobileTab === 'map' ? 'flex' : 'hidden'}
          md:flex
          flex-1
        `}>
          <MapView
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
}