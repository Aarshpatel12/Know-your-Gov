import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Stethoscope, Users, Baby } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const categories = [
    { id: 'patwari',    title: 'Find My Patwari',    icon: <MapPin size={32} />,      color: 'bg-green-600',  count: '213 Locations' },
    { id: 'kanungos',   title: 'Kanungos',            icon: <Users size={32} />,       color: 'bg-purple-600', count: '38 Locations' },
    { id: 'hospitals',  title: 'SHC',                 icon: <Stethoscope size={32} />, color: 'bg-blue-600',   count: 'Coming Soon' },
    { id: 'sewakendra', title: 'Sewa Kendras',        icon: <Building2 size={32} />,   color: 'bg-orange-600', count: '42 Locations' },
    { id: 'awc',        title: 'Anganwadi Centers',   icon: <Baby size={32} />,        color: 'bg-pink-600',   count: '2,477 Centers' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12">

        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          Welcome to Know Your Government
        </h1>
        <p className="text-sm sm:text-lg text-gray-600 mb-8">
          Select a service below to find the nearest government office in Ludhiana District.
        </p>

        {/* 2 cols on mobile → 3 on md → 5 on xl */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/directory/${cat.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl active:scale-95 transition-all duration-150 p-4 sm:p-6 flex flex-col items-center text-center border border-gray-200 touch-manipulation"
            >
              <div className={`${cat.color} text-white p-3 sm:p-4 rounded-full mb-3`}>
                {cat.icon}
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight">{cat.title}</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{cat.count}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}