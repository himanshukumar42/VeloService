import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1/velocare/components/';

const Components = () => {
  const [components, setComponents] = useState([]);
  const [newComponent, setNewComponent] = useState({ name: '', description: '', repair_price: '', new_price: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editComponent, setEditComponent] = useState(null);

  // Fetch Components
  useEffect(() => {
    const fetchComponents = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setComponents(response.data);
      } catch {
        setError('Failed to fetch components');
      }
    };
    fetchComponents();
  }, []);

  // Add or Update Component
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    try {
      if (isEditing) {
        // Update Component
        await axios.put(`${API_BASE_URL}${editComponent.id}/`, newComponent, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setComponents(components.map((component) => (component.id === editComponent.id ? { ...component, ...newComponent } : component)));
        setIsEditing(false);
        setEditComponent(null);
      } else {
        // Add Component
        const response = await axios.post(API_BASE_URL, newComponent, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setComponents([...components, response.data]);
      }
      setNewComponent({ name: '', description: '', repair_price: '', new_price: '' });
    } catch {
      setError(isEditing ? 'Failed to update component' : 'Failed to add component');
    }
  };

  // Delete Component
  const handleDeleteComponent = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_BASE_URL}${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setComponents(components.filter(component => component.id !== id));
    } catch {
      setError('Failed to delete component');
    }
  };

  // Start editing component
  const startEditing = (component) => {
    setIsEditing(true);
    setNewComponent({ name: component.name, description: component.description, repair_price: component.repair_price, new_price: component.new_price });
    setEditComponent(component);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Components</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form for adding/updating components */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-center">{isEditing ? 'Edit Component' : 'Add Component'}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter component name"
              value={newComponent.name}
              onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              placeholder="Enter component description"
              value={newComponent.description}
              onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Repair Price</label>
            <input
              type="text"
              placeholder="Enter component Repair Price"
              value={newComponent.repair_price}
              onChange={(e) => setNewComponent({ ...newComponent, repair_price: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New Price</label>
            <input
              type="text"
              placeholder="Enter component New Price"
              value={newComponent.new_price}
              onChange={(e) => setNewComponent({ ...newComponent, new_price: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Component' : 'Add Component'}
          </button>
        </div>
      </form>

      {/* Table to display components */}
      <table className="min-w-full border border-gray-300 mb-6 bg-white shadow-xl">
        <thead style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <tr>
            <th className="border px-4 py-2 text-left">S.No</th>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Description</th>
            <th className="border px-4 py-2 text-left">Repair Price</th>
            <th className="border px-4 py-2 text-left">New Price</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component, index) => (
            <tr key={component.id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{component.name}</td>
              <td className="border px-4 py-2">{component.description}</td>
              <td className="border px-4 py-2">{component.repair_price}</td>
              <td className="border px-4 py-2">{component.new_price}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button onClick={() => startEditing(component)} className="text-blue-500 hover:text-blue-700">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteComponent(component.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Components;
