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
  const [locating, setLocating]       = useState(false);
  const [locError, setLocError]       = useState(null);
  const [isTracking, setIsTracking]   = useState(false);

  // ── Navigation state ──────────────────────────────────────────────────────
  const [isNavigating, setIsNavigating]   = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const orientationWatchRef = useRef(null);

  const watchIdRef  = useRef(null);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  // ── Compute distance to destination during navigation ─────────────────────
  const distanceToDestination =
    isNavigating && userLocation && activeItem
      ? calculateDistance(userLocation[0], userLocation[1], activeItem.lat, activeItem.lng)
      : null;

  // ── Load dataset on category change ──────────────────────────────────────
  useEffect(() => {
    setData(getBaseData(category));
    setActiveItem(null);
    setUserLocation(null);
    setMobileTab('list');
    setLocError(null);
    stopTracking();
    handleStopNavigation();
  }, [category]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    stopTracking();
    handleStopNavigation();
  }, []);

  // ── Stop live tracking helper ─────────────────────────────────────────────
  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }

  // ── Navigation: start / stop ──────────────────────────────────────────────
  const handleStartNavigation = () => {
    setIsNavigating(true);

    const addListener = () => {
      const handler = (e) => {
        if (e.alpha != null) setDeviceHeading(e.alpha);
      };
      orientationWatchRef.current = handler;
      window.addEventListener('deviceorientation', handler, true);
    };

    // iOS 13+ requires explicit permission for DeviceOrientationEvent
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then(state => { if (state === 'granted') addListener(); })
        .catch(console.warn);
    } else {
      addListener();
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setDeviceHeading(null);
    if (orientationWatchRef.current) {
      window.removeEventListener('deviceorientation', orientationWatchRef.current, true);
      orientationWatchRef.current = null;
    }
  };

  // ── Called every time watchPosition fires a new position ─────────────────
  const onPositionUpdate = useCallback((position) => {
    const { latitude: lat, longitude: lng } = position.coords;
    setUserLocation([lat, lng]);
    setLocating(false);
    setLocError(null);
    setIsTracking(true);

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

    if (isTracking) {
      stopTracking();
      setData(getBaseData(category));
      setUserLocation(null);
      return;
    }

    setLocating(true);
    setLocError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      onPositionUpdate,
      onPositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  };

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    if (item) setMobileTab('map');
    // Stop navigation if user selects a different item
    if (isNavigating) handleStopNavigation();
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
      {isTracking && !isNavigating && (
        <div className="shrink-0 bg-green-50 border-b border-green-200 px-4 py-1.5 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
          </span>
          <p className="text-xs text-green-800 font-medium">
            Live location active · List sorted by nearest · Tap a result to see route
          </p>
        </div>
      )}

      {/* ── Navigation mode banner ── */}
      {isNavigating && (
        <div className="shrink-0 px-4 py-1.5 flex items-center gap-2"
          style={{ background: '#1a1a3e', color: 'white' }}>
          <span style={{ fontSize: 14 }}>🧭</span>
          <p className="text-xs font-medium" style={{ color: '#93c5fd' }}>
            Navigation mode · Auto-following your position
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

      {/* ── Body ── */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">

        {/* MAP */}
        <div className="absolute inset-0 md:relative md:flex-1">
          <MapView
            data={data}
            activeItem={activeItem}
            setActiveItem={handleSetActiveItem}
            userLocation={userLocation}
            isTracking={isTracking}
            isNavigating={isNavigating}
            deviceHeading={deviceHeading}
            distanceToDestination={distanceToDestination}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
          />
        </div>

        {/* SIDEBAR */}
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
            isNavigating={isNavigating}
            onStartNavigation={handleStartNavigation}
          />
        </div>

      </div>
    </div>
  );
}