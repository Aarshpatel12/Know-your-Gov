import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import MapSidebar from '../components/MapSidebar';
import MapView from '../components/MapView';
import { calculateDistance } from '../utils/geoMath';
import { List, Map } from 'lucide-react';

import patwariData   from '../assets/data/patwaris.json';
import sewakendraData from '../assets/data/sewakendras.json';
import kanungoData   from '../assets/data/kanungos.json';
import awcData       from '../assets/data/awcs.json';

function getBaseData(category) {
  if (category === 'patwari'    || category === 'patwaris')    return patwariData;
  if (category === 'kanungo'    || category === 'kanungos')    return kanungoData;
  if (category === 'sewakendra' || category === 'sewakendras') return sewakendraData;
  if (category === 'awc'        || category === 'awcs')        return awcData;
  return [];
}

function sortByDistance(base, lat, lng) {
  return [...base]
    .map(item => ({ ...item, distance: calculateDistance(lat, lng, item.lat, item.lng) }))
    .sort((a, b) => a.distance - b.distance);
}

export default function DirectoryPage() {
  const { category } = useParams();
  const [data, setData]               = useState([]);
  const [activeItem, setActiveItem]   = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mobileTab, setMobileTab]     = useState('list');
  const [locating, setLocating]       = useState(false);   // spinner while acquiring
  const [locError, setLocError]       = useState(null);    // error message
  const [isTracking, setIsTracking]   = useState(false);   // live watch active

  const watchIdRef  = useRef(null);   // navigator.geolocation.watchPosition id
  const categoryRef = useRef(category);
  categoryRef.current = category;

  // ── Load dataset on category change ──────────────────────────────────────
  useEffect(() => {
    setData(getBaseData(category));
    setActiveItem(null);
    setUserLocation(null);
    setMobileTab('list');
    setLocError(null);
    stopTracking();           // clear any live watch when switching category
  }, [category]);

  // ── Cleanup watch on unmount ──────────────────────────────────────────────
  useEffect(() => () => stopTracking(), []);

  // ── Stop live tracking helper ─────────────────────────────────────────────
  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }

  // ── Called every time watchPosition fires a new position ─────────────────
  const onPositionUpdate = useCallback((position) => {
    const { latitude: lat, longitude: lng } = position.coords;
    setUserLocation([lat, lng]);
    setLocating(false);
    setLocError(null);
    setIsTracking(true);

    // Re-sort list against live location
    const base = getBaseData(categoryRef.current);
    setData(sortByDistance(base, lat, lng));
  }, []);

  const onPositionError = useCallback((err) => {
    setLocating(false);
    setIsTracking(false);
    const msgs = {
      1: 'Location permission denied. Please allow location access in your browser settings.',
      2: 'Location unavailable. Make sure GPS is enabled.',
      3: 'Location request timed out. Try again.',
    };
    setLocError(msgs[err.code] || 'Could not get your location.');
  }, []);

  // ── Main: start / stop live tracking ─────────────────────────────────────
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    // If already tracking → stop
    if (isTracking) {
      stopTracking();
      // Restore unsorted data
      setData(getBaseData(category));
      setUserLocation(null);
      return;
    }

    setLocating(true);
    setLocError(null);

    // watchPosition gives continuous live updates as user moves
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPositionUpdate,
      onPositionError,
      {
        enableHighAccuracy: true,   // use GPS chip on mobile
        maximumAge: 5000,           // accept cached position up to 5s old
        timeout: 15000,             // give up after 15s if no fix
      }
    );
  };

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    if (item) setMobileTab('map');
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Error toast ── */}
      {locError && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between gap-2">
          <p className="text-xs text-red-700 flex-1">⚠️ {locError}</p>
          <button onClick={() => setLocError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}

      {/* ── Live-tracking banner ── */}
      {isTracking && (
        <div className="shrink-0 bg-green-50 border-b border-green-200 px-4 py-1.5 flex items-center gap-2">
          {/* Pulsing live dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
          </span>
          <p className="text-xs text-green-800 font-medium">
            Live location active · List sorted by nearest · Tap a result to see route
          </p>
        </div>
      )}

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

      {/* ── Body: map always rendered beneath sliding sidebar ── */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">

        {/* MAP — always in DOM so Leaflet has real dimensions */}
        <div className="absolute inset-0 md:relative md:flex-1">
          <MapView
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            userLocation={userLocation}
            isTracking={isTracking}
          />
        </div>

        {/* SIDEBAR — slides over map on mobile */}
        <div
          className={`
            absolute inset-0 z-10
            md:relative md:inset-auto md:z-auto
            md:w-96 md:shrink-0
            transition-transform duration-300
            ${mobileTab === 'list'
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'}
          `}
        >
          <MapSidebar
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            category={category}
            onLocateMe={handleLocateMe}
            userLocation={userLocation}
            locating={locating}
            isTracking={isTracking}
          />
        </div>

      </div>
    </div>
  );
}