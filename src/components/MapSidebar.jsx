import React, { useState } from 'react';
import { Navigation, Phone, MapPin, Users, Building2, Baby } from 'lucide-react';

const CATEGORY_CONFIG = {
  patwari:    { label: 'Patwari Directory',      color: 'green',  icon: <MapPin size={14} /> },
  patwaris:   { label: 'Patwari Directory',      color: 'green',  icon: <MapPin size={14} /> },
  kanungo:    { label: 'Kanungo Directory',      color: 'purple', icon: <Users size={14} /> },
  kanungos:   { label: 'Kanungo Directory',      color: 'purple', icon: <Users size={14} /> },
  sewakendra: { label: 'Sewa Kendra Directory',  color: 'orange', icon: <Building2 size={14} /> },
  sewakendras:{ label: 'Sewa Kendra Directory',  color: 'orange', icon: <Building2 size={14} /> },
  awc:        { label: 'Anganwadi Centers',       color: 'pink',   icon: <Baby size={14} /> },
  awcs:       { label: 'Anganwadi Centers',       color: 'pink',   icon: <Baby size={14} /> },
};

const ACCENT = {
  green:  { header: 'bg-green-700',  badge: 'bg-green-100 text-green-800',  active: 'border-green-600 bg-green-50',  locate: 'bg-green-600 hover:bg-green-700' },
  purple: { header: 'bg-purple-700', badge: 'bg-purple-100 text-purple-800', active: 'border-purple-600 bg-purple-50', locate: 'bg-purple-600 hover:bg-purple-700' },
  orange: { header: 'bg-orange-600', badge: 'bg-orange-100 text-orange-800', active: 'border-orange-500 bg-orange-50', locate: 'bg-orange-500 hover:bg-orange-600' },
  pink:   { header: 'bg-pink-600',   badge: 'bg-pink-100 text-pink-800',    active: 'border-pink-500 bg-pink-50',    locate: 'bg-pink-600 hover:bg-pink-700' },
};

function PhoneLink({ number }) {
  if (!number || number === 'Vacant') return null;
  const clean = String(number).replace(/\D/g, '').slice(-10);
  if (clean.length < 7) return null;
  return (
    <a
      href={`tel:${clean}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-xs mt-0.5"
    >
      <Phone size={10} /> {String(number)}
    </a>
  );
}

function KanungoCard({ item }) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {item.tehsil && (
        <p className="text-xs text-gray-500 font-medium">📍 {item.tehsil} Tehsil</p>
      )}
      {item.circle && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Circles: </span>{item.circle}
        </p>
      )}
      {item.mobile && <PhoneLink number={item.mobile} />}
    </div>
  );
}

function PatwariCard({ item }) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {item.tehsil && (
        <p className="text-xs text-gray-500 font-medium">📍 {item.tehsil}</p>
      )}
      {item.circle && (
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Circles: </span>{item.circle}
        </p>
      )}
      {item.mobile && <PhoneLink number={item.mobile} />}
    </div>
  );
}

function SewaKendraCard({ item }) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {item.tehsil && <p className="text-xs text-gray-500">📍 {item.tehsil}</p>}
      {item.assembly && <p className="text-xs text-gray-600">🏛️ {item.assembly}</p>}
      {item.type && <p className="text-xs text-gray-400">{item.type}</p>}
    </div>
  );
}

function AwcCard({ item }) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {item.village && (
        <p className="text-xs text-gray-500">📍 {item.village} · <span className="text-gray-400">{item.areaType}</span></p>
      )}
      {item.assembly && (
        <p className="text-xs text-gray-600">🏛️ {item.assembly} Constituency</p>
      )}
      {item.workerName && item.workerName !== 'Vacant' ? (
        <div className="mt-1">
          <p className="text-xs text-gray-700">👩 <span className="font-medium">{item.workerName}</span></p>
          {item.workerMobile && <PhoneLink number={item.workerMobile} />}
        </div>
      ) : item.workerName === 'Vacant' ? (
        <p className="text-xs text-red-500 font-medium">⚠️ Worker Position Vacant</p>
      ) : null}
      {item.block && <p className="text-xs text-gray-400">Block: {item.block}</p>}
    </div>
  );
}

export default function MapSidebar({ data, activeItem, setActiveItem, category, onLocateMe, userLocation, locating, isTracking, isNavigating, onStartNavigation }) {
  const [search, setSearch] = useState('');

  const cfg   = CATEGORY_CONFIG[category] || { label: `${category} Directory`, color: 'green', icon: null };
  const accent = ACCENT[cfg.color] || ACCENT.green;
  const isKanungo = category === 'kanungo' || category === 'kanungos';
  const isAwc     = category === 'awc'     || category === 'awcs';

  const filteredData = data.filter(item => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.circle?.toLowerCase().includes(q) ||
      item.tehsil?.toLowerCase().includes(q) ||
      item.village?.toLowerCase().includes(q) ||
      item.assembly?.toLowerCase().includes(q) ||
      item.workerName?.toLowerCase().includes(q) ||
      item.mobile?.includes(q)
    );
  });

  const getPlaceholder = () => {
    if (isKanungo) return 'Search by name, tehsil, circles, mobile...';
    if (isAwc)     return 'Search by name, village, worker, assembly...';
    return 'Search by name, tehsil or circles...';
  };

  const renderCard = (item) => {
    if (isAwc)     return <AwcCard     item={item} />;
    if (isKanungo) return <KanungoCard item={item} />;
    if (category === 'sewakendra' || category === 'sewakendras') return <SewaKendraCard item={item} />;
    return <PatwariCard item={item} />;
  };

  return (
    <div className="w-full bg-white shadow-xl z-10 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className={`${accent.header} text-white px-4 py-3 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2">
          {cfg.icon}
          <h2 className="font-bold text-sm uppercase tracking-wide">{cfg.label}</h2>
        </div>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          {filteredData.length} results
        </span>
      </div>

      {/* Search + Locate */}
      <div className="p-3 bg-gray-50 border-b flex flex-col gap-2 shrink-0">
        <input
          type="text"
          placeholder={getPlaceholder()}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={onLocateMe}
          disabled={locating}
          className={`w-full text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-70 ${
            isTracking
              ? 'bg-red-500 hover:bg-red-600'          // stop tracking
              : userLocation
              ? 'bg-green-600 hover:bg-green-700'      // located, not live
              : `${accent.locate}`                     // not yet located
          }`}
        >
          {locating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Getting your location...
            </>
          ) : isTracking ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              Live · Sorted by Nearest · Tap to Stop
            </>
          ) : (
            <>
              <Navigation size={16} />
              {userLocation ? 'Update My Location' : 'Use My Live Location'}
            </>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const isActive = activeItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`px-4 py-3 cursor-pointer transition-all border-l-4 ${
                  isActive
                    ? `${accent.active} border-l-4`
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-semibold text-sm leading-tight ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                    {item.name}
                  </h3>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {item.distance != null && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {item.distance.toFixed(1)} km
                      </span>
                    )}
                    {isActive && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${accent.badge}`}>
                        Selected
                      </span>
                    )}
                  </div>
                </div>

                {renderCard(item)}

                {/* Start Navigation button — shown on the active selected item */}
                {isActive && userLocation && !isNavigating && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartNavigation && onStartNavigation(); }}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      padding: '10px 0',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 3px 14px rgba(22,163,74,0.4)',
                      letterSpacing: '0.2px',
                    }}
                  >
                    🧭 Start Navigation
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}