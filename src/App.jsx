import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DirectoryPage from './pages/DirectoryPage';
import GlobalHeader from './components/GlobalHeader';

function App() {
  return (
    // Use 100dvh to account for mobile browser chrome (address bar)
    <div className="flex flex-col bg-gray-50 font-sans" style={{ height: '100dvh' }}>
      <GlobalHeader />
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/directory/:category" element={<DirectoryPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;