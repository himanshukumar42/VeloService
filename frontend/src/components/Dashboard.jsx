import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    daily_revenue: 0,
    monthly_revenue: 0,
    yearly_revenue: 0,
  });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/velocare/services/revenue_dashboard', {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5MTg2NjQxLCJpYXQiOjE3MjkxNjg2NDEsImp0aSI6ImNhMmMwMTE2MjMwMTQyNDFhYjVkYThmNzBmZGNkZTIzIiwidXNlcl9pZCI6NCwidXNlcl90eXBlIjoic2hvcF9vd25lciJ9.vf_V8l0rVemYmWEZVllnR01BL6A7r2vofXpCiSKd5BE',
          },
        });
        setRevenueData(response.data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    fetchRevenueData();
  }, []);

  const data = {
    labels: ['Daily Revenue', 'Monthly Revenue', 'Yearly Revenue'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [revenueData.daily_revenue, revenueData.monthly_revenue, revenueData.yearly_revenue],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Revenue Dashboard</h2>
      <Bar data={data} />
    </div>
  );
};

export default Dashboard;