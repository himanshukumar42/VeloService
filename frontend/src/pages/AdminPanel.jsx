import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/globals.css';
import Components from '../components/Components';
import Vehicles from '../components/Vehicles';
import Issues from '../components/Issues';
import Invoices from '../components/Invoices';
import Services from '../components/Services';
import Dashboard from '../components/Dashboard'; // Import Dashboard component

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to 'dashboard'
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the active tab from localStorage when the component mounts
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab); // Save active tab to localStorage
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeTab'); // Optionally clear the active tab on logout
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-600 shadow-lg rounded-r-2xl p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-300 hover:text-red-400"
          >
            <LogOut className="w-5 h-5 mr-2" />
          </button>
        </div>
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => handleTabChange('dashboard')} // Dashboard tab
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'dashboard' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('components')}
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'components' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Components
          </button>
          <button
            onClick={() => handleTabChange('vehicles')}
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'vehicles' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => handleTabChange('issues')}
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'issues' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Issues
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'services' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleTabChange('invoices')}
            className={`p-2 text-left text-white rounded hover:bg-primary-500 ${
              activeTab === 'invoices' ? 'bg-primary-700 font-bold' : ''
            }`}
          >
            Invoices
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div>
          {activeTab === 'dashboard' && <Dashboard />}  {/* Display Dashboard when tab is active */}
          {activeTab === 'components' && <Components />}
          {activeTab === 'vehicles' && <Vehicles />}
          {activeTab === 'issues' && <Issues />}
          {activeTab === 'services' && <Services />}
          {activeTab === 'invoices' && <Invoices />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
