import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit, CheckCircle } from 'lucide-react';

const API_SERVICES_URL = 'http://localhost:8000/api/v1/velocare/services/';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]); // Fetch services for dropdown
  const [newInvoice, setNewInvoice] = useState({ service: '', total_amount: '', paid: false });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
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

    fetchServices();
  }, []);

  // Fetch Invoices for a specific service
  const fetchInvoices = async (serviceId) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_SERVICES_URL}${serviceId}/invoices/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setInvoices(response.data);
    } catch {
      setError('Failed to fetch invoices');
    }
  };

  // Handle service change
  const handleServiceChange = (serviceId) => {
    const selectedService = services.find(service => service.id === parseInt(serviceId));
    setNewInvoice({
      ...newInvoice,
      service: serviceId,
      total_amount: selectedService ? selectedService.total_cost : '', // Assuming total_cost exists in your service object
    });
    
    // Fetch invoices for the selected service when the service changes
    if (selectedService) {
      fetchInvoices(serviceId);
    } else {
      setInvoices([]); // Clear invoices if no service is selected
    }
  };

  // Add or Update Invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');

    if (isEditing && editInvoice) {
      // Update existing invoice
      try {
        const response = await axios.put(`${API_SERVICES_URL}${newInvoice.service}/invoices/${editInvoice.id}/`, newInvoice, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Update invoices list with the updated invoice
        setInvoices(invoices.map(inv => inv.id === editInvoice.id ? response.data : inv));
        setNewInvoice({ service: '', total_amount: '', paid: false });
        setIsEditing(false);
        setEditInvoice(null);
      } catch {
        setError('Failed to update invoice');
      }
    } else {
      // Add a new invoice
      try {
        const response = await axios.post(`${API_SERVICES_URL}${newInvoice.service}/invoices/`, newInvoice, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setInvoices([...invoices, response.data]); // Update invoices state with new invoice
        setNewInvoice({ service: '', total_amount: '', paid: false }); // Reset form
      } catch {
        setError('Failed to add invoice');
      }
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_SERVICES_URL}${newInvoice.service}/invoices/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setInvoices(invoices.filter(invoice => invoice.id !== id)); // Remove invoice from state
    } catch {
      setError('Failed to delete invoice');
    }
  };

  // Mark Invoice as Paid
  const markAsPaid = async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.post(`${API_SERVICES_URL}${newInvoice.service}/invoices/${id}/mark_as_paid/`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setInvoices(invoices.map(invoice => (invoice.id === id ? { ...invoice, paid: true } : invoice))); // Update invoice status in state
    } catch {
      setError('Failed to mark invoice as paid');
    }
  };

  // Start editing invoice
  const startEditing = (invoice) => {
    setIsEditing(true);
    setNewInvoice({
      service: invoice.service.id,
      total_amount: invoice.total_amount,
      paid: invoice.paid,
    });
    setEditInvoice(invoice);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Invoices</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form for adding/updating invoices */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">{isEditing ? 'Edit Invoice' : 'Add Invoice'}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <select
              value={newInvoice.service}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.vehicle.license_plate} - {new Date(service.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="number"
              placeholder="Total amount"
              value={newInvoice.total_amount}
              readOnly // Make the input non-editable
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Paid</label>
            <input
              type="checkbox"
              checked={newInvoice.paid}
              onChange={(e) => setNewInvoice({ ...newInvoice, paid: e.target.checked })}
              className="input-checkbox"
            />
          </div>

          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Invoice' : 'Add Invoice'}
          </button>
        </div>
      </form>

      {/* Table to display invoices */}
      <table className="min-w-full border border-gray-300 mb-6 bg-white shadow-xl">
        <thead style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          <tr>
            <th className="border px-4 py-2 text-left">S.No</th>
            <th className="border px-4 py-2 text-left">Service</th>
            <th className="border px-4 py-2 text-left">Invoice Number</th>
            <th className="border px-4 py-2 text-left">Issue Date</th>
            <th className="border px-4 py-2 text-left">Due Date</th>
            <th className="border px-4 py-2 text-left">Total Amount</th>
            <th className="border px-4 py-2 text-left">Paid</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice, index) => (
              <tr key={invoice.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{invoice.service.vehicle.license_plate} - {new Date(invoice.issue_date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{invoice.invoice_number}</td>
                <td className="border px-4 py-2">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{invoice.due_date}</td>
                <td className="border px-4 py-2">{invoice.total_amount}</td>
                <td className="border px-4 py-2">
                  {invoice.paid ? (
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  ) : (
                    <button onClick={() => markAsPaid(invoice.id)} className="text-blue-500 underline">
                      Mark as Paid
                    </button>
                  )}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <button onClick={() => startEditing(invoice)} className="text-yellow-500 underline">
                    <Edit />
                  </button>
                  <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-500 underline">
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={8}>
                No invoices available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
