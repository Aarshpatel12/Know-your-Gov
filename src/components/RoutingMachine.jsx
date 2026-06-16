import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useMap } from 'react-leaflet';

export default function RoutingMachine({ start, end }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !map) return;

    // Remove any previous routing control safely
    if (controlRef.current) {
      try { map.removeControl(controlRef.current); } catch (_) {}
      controlRef.current = null;
    }

    try {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(end[0], end[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        show: false,
        createMarker: () => null, // Don't create extra markers
        lineOptions: {
          styles: [{ color: '#2563EB', weight: 4, opacity: 0.8 }],
        },
      }).addTo(map);

      controlRef.current = routingControl;
    } catch (err) {
      console.warn('Routing error:', err);
    }

    return () => {
      if (controlRef.current && map) {
        try { map.removeControl(controlRef.current); } catch (_) {}
        controlRef.current = null;
      }
    };
  }, [map, start?.[0], start?.[1], end?.[0], end?.[1]]);

  return null;
}