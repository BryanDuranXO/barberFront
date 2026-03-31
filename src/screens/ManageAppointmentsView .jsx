import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader2, RefreshCw, Calendar, Trash2, Eye, X, Clock, Scissors, DollarSign, Phone, User, ChevronDown, ChevronUp, TrendingUp, CheckCircle2, Hourglass } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ManageAppointmentsView = () => {
  const [searchParams] = useSearchParams();

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();

  const filterFromUrl = searchParams.get('filter');
  const initialFilter =
    filterFromUrl === 'pending' || filterFromUrl === 'completed'
      ? filterFromUrl
      : 'all';

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [detailApt, setDetailApt] = useState(null);
  const [earningsExpanded, setEarningsExpanded] = useState(false);

  const filters = [
    { id: 'all',       label: 'Todas'       },
    { id: 'pending',   label: 'Pendientes'  },
    { id: 'completed', label: 'Completadas' },
  ];

  const getFilterCategory = (apt) => {
    if (apt.escaneada) return 'completed';
    if (!apt.status)   return 'pending';
  };

  useEffect(() => {
    if (filterFromUrl === 'today') {
      setSelectedDate(today);
      setActiveFilter('all');
    }
  }, [filterFromUrl, today]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'https://barberback-1qs2.onrender.com/api/barber/citas/',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
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

  // ─── Citas del día seleccionado (sin filtro de estado) ───────────────────────
  const appointmentsForDay = appointments.filter(apt => apt.fecha === selectedDate);

  const filteredAppointments = appointmentsForDay.filter(apt => {
    const matchesStatus = activeFilter === 'all' || getFilterCategory(apt) === activeFilter;
    return matchesStatus;
  });

  // ─── Cálculo de ganancias del día ────────────────────────────────────────────
  const completedApts = appointmentsForDay.filter(apt => getFilterCategory(apt) === 'completed');
  const pendingApts   = appointmentsForDay.filter(apt => getFilterCategory(apt) === 'pending');

  const completedTotal = completedApts.reduce((sum, apt) => sum + (Number(apt.monto) || 0), 0);
  const pendingTotal   = pendingApts.reduce((sum, apt) => sum + (Number(apt.monto) || 0), 0);
  const grandTotal     = completedTotal + pendingTotal;

  const fmt = (n) => `$${n.toFixed(2)}`;

  // ─── Handlers ────────────────────────────────────────────────────────────────
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
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      Swal.fire({
        title: '¡Eliminada!',
        text: 'La cita fue eliminada correctamente.',
        icon: 'success',
        confirmButtonColor: '#EAB308',
        timer: 2000,
        showConfirmButton: false
      });
      setDetailApt(null);
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

  // ─── Sub-componentes ─────────────────────────────────────────────────────────
  const StatusBadge = ({ apt }) => {
    const category = getFilterCategory(apt);
    const config = {
      completed: { label: 'Completada', classes: 'bg-green-100 text-green-700 border-green-200' },
      pending:   { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      cancelled: { label: 'Cancelada',  classes: 'bg-red-100 text-red-600 border-red-200' }
    };
    const { label, classes } = config[category] || config.pending;
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${classes}`}>
        {label}
      </span>
    );
  };

  const formatHora      = (hora) => hora?.slice(0, 5) ?? '—';
  const getNombre       = (apt)  => `${apt.nombre ?? ''} ${apt.paterno ?? ''} ${apt.materno ?? ''}`.trim();
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const isToday = selectedDate === today;

  // ─── Tarjeta flotante de ganancias ───────────────────────────────────────────
  const EarningsCard = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400/60">

        {/* Franja dorada superior */}
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300" />

        {/* Header siempre visible */}
        <button
          onClick={() => setEarningsExpanded(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-black font-bold text-sm">Ganancias del día</span>
            <span className="text-xs text-gray-400 font-medium">{formatDateLabel(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 font-black text-base">{fmt(grandTotal)}</span>
            {earningsExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronUp className="w-4 h-4 text-gray-400" />
            }
          </div>
        </button>

        {/* Detalle expandible */}
        {earningsExpanded && (
          <div className="px-4 pb-4 space-y-2 border-t border-yellow-100 pt-3">

            {/* Completadas */}
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-xs text-yellow-700 font-semibold">Completadas</p>
                  <p className="text-xs text-yellow-500">{completedApts.length} cita{completedApts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className="text-yellow-700 font-black text-sm">{fmt(completedTotal)}</span>
            </div>

            {/* Pendientes */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Pendientes</p>
                  <p className="text-xs text-gray-400">{pendingApts.length} cita{pendingApts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className="text-gray-600 font-black text-sm">{fmt(pendingTotal)}</span>
            </div>

            {/* Total proyectado */}
            <div className="flex items-center justify-between pt-1 px-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Total proyectado</p>
              <span className="text-black font-black text-base">{fmt(grandTotal)}</span>
            </div>

            {/* Mini barra de progreso */}
            {grandTotal > 0 && (
              <div className="w-full h-1.5 bg-yellow-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedTotal / grandTotal) * 100}%` }}
                />
              </div>
            )}
            {grandTotal > 0 && (
              <p className="text-xs text-gray-400 text-right">
                {Math.round((completedTotal / grandTotal) * 100)}% cobrado
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Padding inferior para que la tarjeta flotante no tape citas */}
      <div className="p-4 pt-20 pb-28">

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
                <p className="text-xs text-gray-500 mb-1">Mostrando citas del</p>
                <p className="text-black font-bold text-sm">{formatDateLabel(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isToday ? (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1.5 rounded-full"
                >
                  Hoy
                </button>
              ) : (
                <span className="text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-full">
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

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
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
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            <p className="text-gray-500 text-sm">Cargando citas...</p>
          </div>
        )}

        {/* Vacío */}
        {!loading && filteredAppointments.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay citas para este día</p>
          </div>
        )}

        {/* Lista */}
        {!loading && filteredAppointments.length > 0 && (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-xl border-2 border-yellow-500/40 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div>
                    <h3 className="font-bold text-black leading-tight">{getNombre(apt)}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge apt={apt} />
                      <span className="text-yellow-600 font-bold text-sm">{formatHora(apt.hora)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => setDetailApt(apt)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => handleEliminar(apt.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Tarjeta flotante de ganancias ── */}
      <EarningsCard />

      {/* ══════════════════════════════
          MODAL DETALLE
      ══════════════════════════════ */}
      {detailApt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDetailApt(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Franja amarilla */}
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300" />

            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-yellow-600 font-bold uppercase tracking-widest mb-0.5">Detalle de cita</p>
                <h3 className="text-lg font-black text-black">{getNombre(detailApt)}</h3>
              </div>
              <button
                onClick={() => setDetailApt(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="px-5 py-4 space-y-3">

              {/* Fecha y hora */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha y hora</p>
                  <p className="text-sm font-bold text-black">
                    {formatDateLabel(detailApt.fecha)} · {formatHora(detailApt.hora)}
                  </p>
                </div>
              </div>

              {/* Servicio */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Servicio</p>
                  <p className="text-sm font-bold text-black">{detailApt.servicios || '—'}</p>
                </div>
              </div>

              {/* Monto */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monto</p>
                  <p className="text-sm font-bold text-black">
                    {detailApt.monto != null ? `$${Number(detailApt.monto).toFixed(2)}` : '—'}
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-bold text-black">{detailApt.telefono || '—'}</p>
                </div>
              </div>

              {/* ── BARBERO (nuevo) ── */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Atendido por</p>
                  {detailApt.barbero ? (
                    <p className="text-sm font-bold text-black">{detailApt.barbero}</p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 mt-0.5">
                      <Hourglass className="w-3 h-3" />
                      Sin atender aún
                    </span>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <StatusBadge apt={detailApt} />
                </div>
              </div>

            </div>

            {/* Acción eliminar en modal */}
            <div className="px-5 pb-6 pt-2">
              <button
                onClick={() => handleEliminar(detailApt.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar cita
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAppointmentsView;