import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const API_VEHICLES_URL = 'http://localhost:8000/api/v1/velocare/vehicles/';
const API_COMPONENTS_URL = 'http://localhost:8000/api/v1/velocare/components/';
const API_ALL_ISSUES_URL = 'http://localhost:8000/api/v1/velocare/all_issues/';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [components, setComponents] = useState([]);
  const [newIssue, setNewIssue] = useState({ vehicle: '', description: '', component: '', is_repair: true });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIssue, setEditIssue] = useState(null);

  // Fetch Vehicles and Components on initial load
  useEffect(() => {
    const fetchVehicles = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(API_VEHICLES_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVehicles(response.data);
      } catch {
        setError('Failed to fetch vehicles');
      }
    };

    const fetchComponents = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(API_COMPONENTS_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setComponents(response.data);
      } catch {
        setError('Failed to fetch components');
      }
    };

    fetchVehicles();
    fetchComponents();
    // Fetch all issues initially
    fetchAllIssues();
  }, []);

  // Fetch all issues
  const fetchAllIssues = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(API_ALL_ISSUES_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setIssues(response.data);
    } catch {
      setError('Failed to fetch all issues');
    }
  };

  // Fetch Issues for Selected Vehicle
  const fetchIssues = async (vehicleId) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/velocare/vehicles/${vehicleId}/issues/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setIssues(response.data);
    } catch {
      setError('Failed to fetch issues');
    }
  };

  // Handle Vehicle Selection Change
  const handleVehicleChange = (vehicleId) => {
    setNewIssue({ ...newIssue, vehicle: vehicleId });
    if (vehicleId) {
      fetchIssues(vehicleId);
    } else {
      fetchAllIssues(); // Fetch all issues if 'Select a Vehicle' is chosen
    }
  };

  // Add or Update Issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    const vehicleId = newIssue.vehicle;

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/v1/velocare/vehicles/${vehicleId}/issues/${editIssue.id}/`, {
          ...newIssue,
          component: newIssue.component
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setIssues(issues.map((issue) => (issue.id === editIssue.id ? { ...issue, ...newIssue } : issue)));
        setIsEditing(false);
        setEditIssue(null);
      } else {
        const response = await axios.post(`http://localhost:8000/api/v1/velocare/vehicles/${vehicleId}/issues/`, {
          ...newIssue,
          component: newIssue.component
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setIssues([...issues, response.data]);
      }
      
      // Reset only the fields related to the new issue, not the vehicle selection
      setNewIssue({
        vehicle: newIssue.vehicle, // Keep selected vehicle
        description: '',
        component: '',
        is_repair: true
      });
    } catch {
      setError(isEditing ? 'Failed to update issue' : 'Failed to add issue');
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    const vehicleId = newIssue.vehicle; // Get the vehicle ID from newIssue
    try {
      await axios.delete(`http://localhost:8000/api/v1/velocare/vehicles/${vehicleId}/issues/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setIssues(issues.filter(issue => issue.id !== id));
    } catch {
      setError('Failed to delete issue');
    }
  };

  // Start editing issue
  const startEditing = (issue) => {
    setIsEditing(true);
    setNewIssue({
      vehicle: issue.vehicle.id,
      description: issue.description,
      component: issue.component?.id || '',
      is_repair: issue.is_repair,
    });
    setEditIssue(issue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Issues</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form for adding/updating issues */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">{isEditing ? 'Edit Issue' : 'Add Issue'}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              value={newIssue.vehicle}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} - {vehicle.license_plate}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Enter issue description"
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Component</label>
            <select
              value={newIssue.component}
              onChange={(e) => setNewIssue({ ...newIssue, component: e.target.value })}
              className="input-field"
            >
              <option value="">Select a component</option>
              {components.map(component => (
                <option key={component.id} value={component.id}>{component.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Is Repair</label>
            <input
              type="checkbox"
              checked={newIssue.is_repair}
              onChange={(e) => setNewIssue({ ...newIssue, is_repair: e.target.checked })}
              className="input-checkbox"
            />
          </div>

          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Issue' : 'Add Issue'}
          </button>
        </div>
      </form>

      {/* Table to display issues */}
      <table className="min-w-full border border-gray-300 mb-6 bg-white shadow-xl">
        <thead style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <tr>
            <th className="border px-4 py-2 text-left">S.No</th>
            <th className="border px-4 py-2 text-left">Vehicle</th>
            <th className="border px-4 py-2 text-left">Description</th>
            <th className="border px-4 py-2 text-left">Component</th>
            <th className="border px-4 py-2 text-left">Is Repair</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={issue.id}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{issue.vehicle?.make} - {issue.vehicle?.license_plate}</td>
              <td className="border px-4 py-2">{issue.description}</td>
              <td className="border px-4 py-2">{issue.component_name || 'N/A'}</td>
              <td className="border px-4 py-2">{issue.is_repair ? 'Yes' : 'No'}</td>
              <td className="border px-4 py-2">
                <Edit className="inline cursor-pointer" onClick={() => startEditing(issue)} />
                <Trash2 className="inline cursor-pointer ml-2" onClick={() => handleDeleteIssue(issue.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Issues;
