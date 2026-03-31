import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Users, QrCode, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardView = () => {
  const navigate = useNavigate();
  const hasCargado = useRef(false);

  // ✅ Usa hora local en lugar de UTC para evitar desfase de un día
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();

  const [stats, setStats] = useState({
    citasHoy: 0,
    pendientes: 0,
    completadas: 0,
    barberos: 0
  });

  const cargarDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No hay token, redirigiendo al login');
        navigate('/login');
        return;
      }

      const [barberosRes, citasHoyRes, pendientesRes, completadasRes] = await Promise.all([
        axios.get('https://barberback-1qs2.onrender.com/api/barber/usuarios/rol/2', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`https://barberback-1qs2.onrender.com/api/barber/citas/fecha/${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('https://barberback-1qs2.onrender.com/api/barber/citas/status/false', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('https://barberback-1qs2.onrender.com/api/barber/citas/status/true', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setStats({
        barberos: barberosRes.data.total || 0,
        citasHoy: citasHoyRes.data.total || 0,
        pendientes: pendientesRes.data.total || 0,
        completadas: completadasRes.data.total || 0
      });

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.error('❌ Token inválido, redirigiendo al login');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (hasCargado.current) return;
    hasCargado.current = true;
    
    cargarDashboard();
  }, []);

  const cards = [
    { icon: Calendar, label: 'Citas Hoy', value: stats.citasHoy, onclick: () => navigate('/manage-appointments?filter=today') },
    { icon: Clock, label: 'Pendientes', value: stats.pendientes, onclick: () => navigate('/manage-appointments?filter=pending') },
    { icon: Users, label: 'Barberos', value: stats.barberos, onclick: () => navigate('/employees') },
    { icon: CheckCircle, label: 'Completadas', value: stats.completadas, onclick: () => navigate('/manage-appointments?filter=completed') }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20">
        <h2 className="text-2xl font-bold text-black mb-6">
          Panel Principal
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {cards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                onClick={stat.onclick}
                key={index}
                className="bg-white rounded-lg p-4 border-2 border-yellow-500/40 shadow-md"
              >
                <Icon className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-black">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/appointments')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-md"
          >
            <Calendar className="w-5 h-5" />
            AGENDAR NUEVA CITA
          </button>

          <button
            onClick={() => navigate('/static-qr')}
            className="w-full bg-white hover:bg-gray-50 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 border-2 border-yellow-500/40 shadow-md"
          >
            <QrCode className="w-5 h-5 text-yellow-600" />
            QR CITAS IMPREVISTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;