import React, { useState } from 'react';
import { Navigation, Phone } from 'lucide-react';

export default function MapSidebar({ data, activeItem, setActiveItem, category, onLocateMe, userLocation }) {
  const [search, setSearch] = useState('');
  const isAwc = category === 'awc' || category === 'awcs';

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.circle?.toLowerCase().includes(search.toLowerCase()) ||
    item.village?.toLowerCase().includes(search.toLowerCase()) ||
    item.assembly?.toLowerCase().includes(search.toLowerCase()) ||
    item.workerName?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryLabel = () => {
    if (isAwc) return 'Anganwadi Centers';
    if (category === 'patwari' || category === 'patwaris') return 'Patwari Directory';
    if (category === 'kanungo' || category === 'kanungos') return 'Kanungo Directory';
    if (category === 'sewakendra' || category === 'sewakendras') return 'Sewa Kendra Directory';
    return `${category} Directory`;
  };

  return (
    <div className="w-full bg-white shadow-xl z-10 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
            {getCategoryLabel()}
          </h2>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {filteredData.length} results
          </span>
        </div>
        <input
          type="text"
          placeholder={isAwc ? 'Search by name, village, worker, assembly...' : 'Search name or village...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onLocateMe}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Navigation size={18} />
          {userLocation ? 'Location Found (Sorted by Nearest)' : 'Find Nearest to Me'}
        </button>
      </div>

      <div className="divide-y flex-1 overflow-y-auto">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
              activeItem?.id === item.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
              {item.distance && (
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded shrink-0">
                  {item.distance.toFixed(1)} km
                </span>
              )}
            </div>

            {isAwc ? (
              <div className="mt-1 space-y-0.5">
                {item.village && (
                  <p className="text-xs text-gray-500">📍 {item.village} · {item.areaType}</p>
                )}
                {item.assembly && (
                  <p className="text-xs text-gray-600">🏛️ {item.assembly} Constituency</p>
                )}
                {item.workerName && item.workerName !== 'Vacant' && (
                  <p className="text-xs text-gray-700 mt-1">
                    👩 <span className="font-medium">{item.workerName}</span>
                    {item.workerMobile && item.workerMobile !== 'Vacant' && (
                      <span className="ml-1 text-blue-600">· {item.workerMobile}</span>
                    )}
                  </p>
                )}
                {item.workerName === 'Vacant' && (
                  <p className="text-xs text-red-500 font-medium">⚠️ Worker Position Vacant</p>
                )}
                {item.block && (
                  <p className="text-xs text-gray-400">Block: {item.block}</p>
                )}
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-sm text-gray-500">{item.tehsil}</p>
                <p className="text-sm text-gray-700 mt-1"><strong>Circles:</strong> {item.circle}</p>
              </div>
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">No results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}