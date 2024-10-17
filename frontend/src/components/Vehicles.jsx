import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1/velocare/vehicles/';
const USERS_API_URL = 'http://localhost:8000/api/v1/user/'; // Adjust based on your users endpoint

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]); // New state for users
  const [newVehicle, setNewVehicle] = useState({ owner: '', make: '', license_plate: '', model: '', year: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);

  // Fetch Vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVehicles(response.data);
      } catch {
        setError('Failed to fetch vehicles');
      }
    };

    const fetchUsers = async () => { // New function to fetch users
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(USERS_API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUsers(response.data); // Store the fetched users
      } catch {
        setError('Failed to fetch users');
      }
    };

    fetchVehicles();
    fetchUsers(); // Call the fetchUsers function
  }, []);

  // Add or Update Vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    try {
      if (isEditing) {
        // Update Vehicle
        await axios.put(`${API_BASE_URL}${editVehicle.id}/`, newVehicle, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVehicles(vehicles.map((vehicle) => (vehicle.id === editVehicle.id ? { ...vehicle, ...newVehicle } : vehicle)));
        setIsEditing(false);
        setEditVehicle(null);
      } else {
        // Add Vehicle
        const response = await axios.post(API_BASE_URL, newVehicle, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVehicles([...vehicles, response.data]);
      }
      setNewVehicle({ owner: '', make: '', license_plate: '', model: '', year: '' }); // Reset form
    } catch {
      setError(isEditing ? 'Failed to update vehicle' : 'Failed to add vehicle');
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_BASE_URL}${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    } catch {
      setError('Failed to delete vehicle');
    }
  };

  // Start editing vehicle
  const startEditing = (vehicle) => {
    setIsEditing(true);
    setNewVehicle({ owner: vehicle.owner.id, make: vehicle.make, license_plate: vehicle.license_plate, model: vehicle.model, year: vehicle.year });
    setEditVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Vehicles</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form for adding/updating vehicles */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <select
              value={newVehicle.owner}
              onChange={(e) => setNewVehicle({ ...newVehicle, owner: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select an owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input
              type="text"
              placeholder="Enter vehicle make"
              value={newVehicle.make}
              onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">License Plate</label>
            <input
              type="text"
              placeholder="Enter vehicle license plate"
              value={newVehicle.license_plate}
              onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              placeholder="Enter vehicle model"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              placeholder="Enter vehicle year"
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
      </form>

      {/* Table to display vehicles */}
      <table className="min-w-full border border-gray-300 mb-6 bg-white shadow-xl">
        <thead style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <tr>
            <th className="border px-4 py-2 text-left">S.No</th>
            <th className="border px-4 py-2 text-left">Owner</th>
            <th className="border px-4 py-2 text-left">Make</th>
            <th className="border px-4 py-2 text-left">License Plate</th>
            <th className="border px-4 py-2 text-left">Model</th>
            <th className="border px-4 py-2 text-left">Year</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <tr key={vehicle.id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{vehicle.owner_email}</td> {/* Display owner username */}
              <td className="border px-4 py-2">{vehicle.make}</td>
              <td className="border px-4 py-2">{vehicle.license_plate}</td>
              <td className="border px-4 py-2">{vehicle.model}</td>
              <td className="border px-4 py-2">{vehicle.year}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button onClick={() => startEditing(vehicle)} className="text-blue-600 hover:underline">
                  <Edit />
                </button>
                <button onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-600 hover:underline">
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vehicles;
