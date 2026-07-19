import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Users, UserPlus, Stethoscope, Calendar } from 'lucide-react';
import '../../styles/Admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardSkeletons = () => (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <p>Resumen general del sistema de citas clínicas</p>
      </div>
      <div className="admin-dashboard-skeleton">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="admin-skeleton-stat-card">
            <div className="admin-skeleton-stat-icon shimmer"></div>
            <div className="admin-skeleton-stat-title shimmer"></div>
            <div className="admin-skeleton-stat-val shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return renderDashboardSkeletons();
  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return null;

  const barData = {
    labels: ['Reservadas', 'Confirmadas', 'Completadas', 'Canceladas'],
    datasets: [
      {
        label: 'Citas por Estado',
        data: [
          stats.citasReservadas,
          stats.citasConfirmadas,
          stats.citasAtendidas,
          stats.citasCanceladas
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <p>Resumen general del sistema de citas clínicas</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-details">
            <h3>Pacientes Activos</h3>
            <p className="stat-value">{stats.totalPacientes}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon doctors"><Stethoscope size={24} /></div>
          <div className="stat-details">
            <h3>Médicos Disponibles</h3>
            <p className="stat-value">{stats.totalDoctores}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon appointments"><Calendar size={24} /></div>
          <div className="stat-details">
            <h3>Citas Totales</h3>
            <p className="stat-value">{stats.totalCitas}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon slots"><UserPlus size={24} /></div>
          <div className="stat-details">
            <h3>Slots Disponibles</h3>
            <p className="stat-value">{stats.slotsDisponibles}</p>
          </div>
        </div>
      </div>

      <div className="admin-charts-section">
        <div className="admin-chart-card">
          <h3>Estado de las Citas</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
