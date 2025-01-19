import React, { useState } from 'react';
import Header from './components/header';
import Home from './pages/home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function App() {
  const username = "Zluri";
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <Router>
      <div className="bg-cream min-h-screen">
        <Header username={username} onRefresh={handleRefresh} />

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home key={refreshKey} />} />
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}