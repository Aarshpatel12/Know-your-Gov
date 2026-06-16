/**
 * RouteLine — fetches a real road route from OSRM and draws it on the map.
 *
 * Uses the OSRM HTTP API directly (no leaflet-routing-machine library)
 * so there are zero "removeLayer" crashes. The route geometry is decoded
 * and rendered as a native L.polyline.
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export default function RoutingMachine({ start, end }) {
  const map = useMap();
  const lineRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !map) return;

    // Clean up previous line
    if (lineRef.current) {
      try { map.removeLayer(lineRef.current); } catch (_) {}
      lineRef.current = null;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // OSRM public demo API — returns real road-following route geometry
    // Format: /route/v1/driving/{lng,lat};{lng,lat}?overview=full&geometries=geojson
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start[1]},${start[0]};${end[1]},${end[0]}` +
      `?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || data.routes.length === 0) return;

        // GeoJSON coords are [lng, lat] — Leaflet needs [lat, lng]
        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        if (!map) return;

        const line = L.polyline(coords, {
          color: '#2563EB',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        lineRef.current = line;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // intentional cancel
        console.warn('Route fetch failed, falling back to straight line:', err);

        // Fallback: draw a dashed straight line if OSRM is unreachable
        if (!map) return;
        try {
          const fallback = L.polyline([start, end], {
            color: '#2563EB',
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 8',
          }).addTo(map);
          lineRef.current = fallback;
        } catch (_) {}
      });

    return () => {
      // Cancel fetch on unmount / coord change
      if (abortRef.current) abortRef.current.abort();
      if (lineRef.current) {
        try { map.removeLayer(lineRef.current); } catch (_) {}
        lineRef.current = null;
      }
    };
  }, [start?.[0], start?.[1], end?.[0], end?.[1]]);

  return null;
}