import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const AppointmentsView = () => {
  const navigate = useNavigate();
  const hasCargado = useRef(false);

  const [formData, setFormData] = useState({
    nombre: '',
    paterno: '',
    materno: '',
    telefono: '',
    fecha: '',
    hora: '09:00',
    barbero: '',
    servicios: ''
  });

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  const monto = formData.servicios
    ? servicios.find(s => s.servicio === formData.servicios)?.precio || 0
    : 0;

  useEffect(() => {
    if (hasCargado.current) return;
    hasCargado.current = true;
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([cargarServicios()]);
  };

  const cargarServicios = async () => {
    try {
      const response = await axios.get('https://barberback-1qs2.onrender.com/api/servicios/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setServicios(response.data.data || []);
    } catch (error) {
      console.error('❌ Error cargando servicios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const datosEnviar = {
        nombre: formData.nombre,
        paterno: formData.paterno,
        materno: formData.materno,
        telefono: formData.telefono,
        fecha: formData.fecha,
        hora: formData.hora,
        barbero: '',
        servicios: formData.servicios,
        monto: monto
      };

      const response = await axios.post(
        'https://barberback-1qs2.onrender.com/api/barber/citas/',
        datosEnviar,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      await Swal.fire({
        title: '¡Cita confirmada!',
        text: 'Tu cita fue agendada correctamente. A continuación verás tu código QR.',
        icon: 'success',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Ver QR',
        background: '#fff',
      });

      const qrImageUrl = URL.createObjectURL(response.data);
      navigate('/QRGenerated', {
        state: { qrImageUrl, citaData: datosEnviar }
      });

    } catch (error) {
      console.error('❌ Error creando cita:', error);
      Swal.fire({
        title: 'Error al agendar',
        text: error.response?.data?.message || 'Ocurrió un error al crear la cita. Intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Entendido',
        background: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const inputClass =
    'w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all duration-200';

  const labelClass = 'block text-gray-600 mb-1.5 text-xs font-semibold uppercase tracking-wide';

  const horarios = [
    '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pt-20 pb-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 bg-yellow-500 rounded-full" />
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Reserva</span>
          </div>
          <h2 className="text-3xl font-black text-black">Agendar Cita</h2>
          <p className="text-gray-500 text-sm mt-1">Completa los datos para reservar tu turno</p>
        </div>

        <div className="bg-white rounded-2xl border border-yellow-500/30 shadow-sm overflow-hidden">

          {/* Franja decorativa superior */}
          <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300" />

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Sección: Datos personales */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-yellow-400" />
                Datos personales
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ej. Carlos"
                    required
                  />
                </div>

                {/* Apellidos en fila */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Ap. Paterno</label>
                    <input
                      type="text"
                      name="paterno"
                      value={formData.paterno}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ej. García"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ap. Materno</label>
                    <input
                      type="text"
                      name="materno"
                      value={formData.materno}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ej. López"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Teléfono</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+52</span>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`${inputClass} pl-14`}
                      placeholder="10 dígitos"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Sección: Servicio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-yellow-400" />
                Servicio
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Tipo de servicio</label>
                  <select
                    name="servicios"
                    value={formData.servicios}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.length > 0 ? (
                      servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.servicio}>
                          {servicio.servicio} — ${servicio.precio.toFixed(2)}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando servicios...</option>
                    )}
                  </select>
                </div>

                {/* Monto destacado — solo aparece si hay servicio seleccionado */}
                {monto > 0 && (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                    <span className="text-sm text-gray-600 font-medium">Total a pagar</span>
                    <span className="text-2xl font-black text-yellow-600">${monto.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Sección: Fecha y hora */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-yellow-400" />
                Fecha y hora
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={getLocalDateString()}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Hora</label>
                  <select
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    {horarios.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest
                transition-all duration-200 shadow-md
                ${loading
                  ? 'bg-yellow-200 text-yellow-600 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-black hover:shadow-lg'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Confirmar y Generar QR'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsView;