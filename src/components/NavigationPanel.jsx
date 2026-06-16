import React from 'react';

// ── Bearing calculation (degrees from North, clockwise) ───────────────────────
function getBearing(from, to) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = d => d * 180 / Math.PI;
  const dLng  = toRad(to[1] - from[1]);
  const lat1  = toRad(from[0]);
  const lat2  = toRad(to[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// ── Distance formatter ────────────────────────────────────────────────────────
function formatDistance(km) {
  if (km == null) return '—';
  const m = km * 1000;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${km.toFixed(1)} km`;
}

// ── Inject slide-up animation once ───────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('nav-panel-style')) {
  const s = document.createElement('style');
  s.id = 'nav-panel-style';
  s.textContent = `
    @keyframes navPanelSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }
    .nav-panel-enter {
      animation: navPanelSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes arrivedPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
      50%       { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
    }
    .arrived-pulse { animation: arrivedPulse 1.2s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}

export default function NavigationPanel({
  activeItem,
  userLocation,
  distanceToDestination,
  deviceHeading,
  onStopNavigation,
}) {
  const arrived = distanceToDestination != null && distanceToDestination < 0.05;

  let arrowRotation = 0;
  if (userLocation && activeItem) {
    const bearing = getBearing(userLocation, [activeItem.lat, activeItem.lng]);
    arrowRotation = deviceHeading != null
      ? (bearing - deviceHeading + 360) % 360
      : bearing;
  }

  const destName = activeItem?.name || 'Destination';

  return (
    <div
      className="nav-panel-enter"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: arrived
          ? 'linear-gradient(135deg, #14532d 0%, #166534 100%)'
          : 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 24px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
        transition: 'background 0.5s ease',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{
        width: 40, height: 4, background: 'rgba(255,255,255,0.25)',
        borderRadius: 99, margin: '0 auto 16px',
      }} />

      {arrived ? (
        <div
          className="arrived-pulse"
          style={{
            background: 'rgba(34,197,94,0.25)',
            border: '1.5px solid rgba(34,197,94,0.6)',
            borderRadius: 14,
            padding: '14px 16px',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 36 }}>🎉</div>
          <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', marginTop: 4 }}>
            You have arrived!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
            {destName}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{
            flexShrink: 0,
            width: 64, height: 64,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{
              transform: `rotate(${arrowRotation}deg)`,
              transition: 'transform 0.4s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
                <polygon
                  points="14,2 26,26 14,20 2,26"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 38, lineHeight: 1, letterSpacing: '-1px' }}>
              {formatDistance(distanceToDestination)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4, fontWeight: 500 }}>
              to destination
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              📍 {destName}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onStopNavigation}
        style={{
          width: '100%',
          padding: '14px',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        ⏹ Stop Navigation
      </button>
    </div>
  );
}
