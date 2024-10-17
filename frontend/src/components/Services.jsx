import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const API_VEHICLES_URL = 'http://localhost:8000/api/v1/velocare/vehicles/';
const API_SERVICES_URL = 'http://localhost:8000/api/v1/velocare/services/';
const API_ISSUES_URL = (vehicleId) => `http://localhost:8000/api/v1/velocare/vehicles/${vehicleId}/issues/`;

const Services = () => {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [newService, setNewService] = useState({ vehicle: '', selectedIssues: [] });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editService, setEditService] = useState(null);

  // Fetch Vehicles and Services on initial load
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

    fetchVehicles();
    fetchAllServices();
  }, []);

  // Fetch all services
  const fetchAllServices = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(API_SERVICES_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setServices(response.data);
    } catch {
      setError('Failed to fetch services');
    }
  };

  // Handle Vehicle Selection Change
  const handleVehicleChange = async (vehicleId) => {
    setNewService({ ...newService, vehicle: vehicleId, selectedIssues: [] });
    if (vehicleId) {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(API_ISSUES_URL(vehicleId), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setIssues(response.data);
      } catch {
        setError('Failed to fetch issues for selected vehicle');
      }
    } else {
      setIssues([]); // Reset issues if no vehicle is selected
    }
  };

  // Add or Update Service
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');

    try {
      const serviceData = {
        vehicle: newService.vehicle,
        issues: newService.selectedIssues, // Sending the selected issues as an array
      };

      if (isEditing) {
        await axios.put(`${API_SERVICES_URL}${editService.id}/`, serviceData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setServices(services.map((service) => (service.id === editService.id ? { ...service, ...serviceData } : service)));
        setIsEditing(false);
        setEditService(null);
      } else {
        const response = await axios.post(API_SERVICES_URL, serviceData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setServices([...services, response.data]);
      }

      // Reset the new service fields
      setNewService({ vehicle: '', selectedIssues: [] });
      setIssues([]); // Clear issues after adding/updating
    } catch {
      setError(isEditing ? 'Failed to update service' : 'Failed to add service');
    }
  };

  // Delete Service
  const handleDeleteService = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_SERVICES_URL}${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setServices(services.filter(service => service.id !== id));
    } catch {
      setError('Failed to delete service');
    }
  };

  // Start editing service
  const startEditing = (service) => {
    setIsEditing(true);
    setNewService({
      vehicle: service.vehicle.id,
      selectedIssues: service.issues.map(issue => issue.id),
    });
    setEditService(service);
    // Fetch issues for the vehicle being edited
    handleVehicleChange(service.vehicle.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Services</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form for adding/updating services */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">{isEditing ? 'Edit Service' : 'Add Service'}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              value={newService.vehicle}
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
            <label className="block text-sm font-medium text-gray-700">Issues</label>
            <select
              multiple
              value={newService.selectedIssues}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions);
                setNewService({
                  ...newService,
                  selectedIssues: options.map(option => option.value), // Handle multiple selection
                });
              }}
              className="input-field"
            >
              {issues.length > 0 ? (
                issues.map(issue => (
                  <option key={issue.id} value={issue.id}>{issue.description}</option>
                ))
              ) : (
                <option disabled>No issues available. Please select a vehicle.</option>
              )}
            </select>
            <p className="text-xs text-gray-500">Hold Ctrl (Windows) or Command (Mac) to select multiple issues.</p>
          </div>

          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </form>

      {/* Table to display services */}
      <table className="min-w-full border border-gray-300 mb-6 bg-white shadow-xl">
        <thead style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <tr>
            <th className="border px-4 py-2 text-left">S.No</th>
            <th className="border px-4 py-2 text-left">Vehicle</th>
            <th className="border px-4 py-2 text-left">Issues</th>
            <th className="border px-4 py-2 text-left">Total Cost</th>
            <th className="border px-4 py-2 text-left">Date</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={service.id}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{service.vehicle?.make} - {service.vehicle?.license_plate}</td>
              <td className="border px-4 py-2">
                {service.issues.map(issue => (
                  <div key={issue.id}>{issue.description}</div>
                ))}
              </td>
              <td className="border px-4 py-2">Rs. {service.total_cost}</td>
              <td className="border px-4 py-2">{new Date(service.date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <Edit className="inline cursor-pointer" onClick={() => startEditing(service)} />
                <Trash2 className="inline cursor-pointer ml-2" onClick={() => handleDeleteService(service.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Services;
