import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-green-700 text-white px-4 py-3 shadow-md flex items-center gap-3 z-20 shrink-0">
      {location.pathname !== '/' && (
        <button
          onClick={() => navigate('/')}
          className="hover:bg-green-600 p-2 rounded-full transition shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold leading-tight truncate">
          Know Your Government
        </h1>
        <p className="text-xs sm:text-sm text-green-200 truncate">
          District Administration Ludhiana
        </p>
      </div>
    </header>
  );
}