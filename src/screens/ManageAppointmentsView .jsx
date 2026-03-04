import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader2, RefreshCw, Calendar } from 'lucide-react';

const ManageAppointmentsView = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const filters = [
    { id: 'all',       label: 'Todas'       },
    { id: 'pending',   label: 'Pendientes'  },
    { id: 'completed', label: 'Completadas' },
  ];

  const getFilterCategory = (apt) => {
    if (apt.escaneada) return 'completed';
    if (!apt.status)   return 'pending';
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://barberback-1qs2.onrender.com/api/barber/citas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.data.error) {
        setAppointments(response.data.data);
      } else {
        setError('Error al obtener las citas');
      }
    } catch (err) {
      console.error('❌ Error fetching citas:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(apt => {
    const matchesDate   = apt.fecha === selectedDate;
    const matchesStatus = activeFilter === 'all' || getFilterCategory(apt) === activeFilter;
    return matchesDate && matchesStatus;
  });

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cita?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EAB308',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://barberback-1qs2.onrender.com/api/barber/citas/eliminar/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      Swal.fire({
        title: '¡Eliminada!',
        text: 'La cita fue eliminada correctamente.',
        icon: 'success',
        confirmButtonColor: '#EAB308',
        timer: 2000,
        showConfirmButton: false
      });

      fetchAppointments();
    } catch (err) {
      console.error('❌ Error eliminando cita:', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la cita. Intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#EAB308'
      });
    }
  };

  const StatusBadge = ({ apt }) => {
    const category = getFilterCategory(apt);
    const config = {
      completed: { label: 'Completada', classes: 'bg-green-100 text-green-700 border-green-200'   },
      pending:   { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      cancelled: { label: 'Cancelada',  classes: 'bg-red-100 text-red-600 border-red-200'          }
    };
    const { label, classes } = config[category];
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${classes}`}>
        {label}
      </span>
    );
  };

  const formatHora  = (hora) => hora?.slice(0, 5) ?? '—';
  const getNombre   = (apt)  =>
    `${apt.nombre ?? ''} ${apt.paterno ?? ''} ${apt.materno ?? ''}`.trim();

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const isToday = selectedDate === today;

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20">

        {/* Título + Refresh */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Gestión de Citas</h2>
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filtro de fecha */}
        <div className="bg-yellow-50 border-2 border-yellow-500/40 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 leading-none mb-1">Mostrando citas del</p>
                <p className="text-black font-bold text-sm">{formatDateLabel(selectedDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  Hoy
                </button>
              )}
              {isToday && (
                <span className="text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  Hoy
                </span>
              )}

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border-2 border-yellow-500/40 rounded-lg px-2 py-1.5 bg-white text-black focus:outline-none focus:border-yellow-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            <p className="text-gray-500 text-sm">Cargando citas...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm text-red-500 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">Sin citas</p>
            <p className="text-gray-300 text-sm mt-1">
              No hay citas para el {formatDateLabel(selectedDate)}
              {activeFilter !== 'all' ? ` en estado "${filters.find(f => f.id === activeFilter)?.label}"` : ''}
            </p>
          </div>
        )}

        {/* Lista de citas */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-lg p-4 border-2 border-yellow-500/40 shadow-md"
              >
                {/* Encabezado */}
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-black font-bold">{getNombre(apt)}</h3>
                    <p className="text-gray-500 text-xs">Tel: {apt.telefono ?? '—'}</p>
                  </div>
                  <span className="text-yellow-600 font-bold text-lg">
                    {formatHora(apt.hora)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                  <span>Barbero: <span className="font-medium text-black">{apt.barbero ?? '—'}</span></span>
                  <span>Servicio: <span className="font-medium text-black">{apt.servicios ?? '—'}</span></span>
                  <span>Monto: <span className="font-medium text-black">${apt.monto ?? '—'}</span></span>
                </div>

                {/* Badge + escaneada */}
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge apt={apt} />
                  {apt.escaneada && apt.escaneadaD && (
                    <span className="text-xs text-gray-400">
                      Escaneada el {apt.escaneadaD} a las {formatHora(apt.escaneadaH)}
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEliminar(apt.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded text-sm transition-colors border border-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageAppointmentsView;