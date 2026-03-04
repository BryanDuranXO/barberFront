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

  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calcular monto automáticamente basado en el servicio seleccionado
  const monto = formData.servicios 
    ? servicios.find(s => s.servicio === formData.servicios)?.precio || 0 
    : 0;

  // Cargar barberos y servicios al montar el componente
  useEffect(() => {
    if (hasCargado.current) return;
    hasCargado.current = true;
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarServicios()
    ]);
  };

  const cargarServicios = async () => {
    try {
      const response = await axios.get('https://barberback-1qs2.onrender.com/api/servicios/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('✅ Servicios cargados:', response.data);
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

      console.log('📤 Enviando datos:', datosEnviar);

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

      console.log('✅ Cita creada, QR recibido');

      // 🔥 Alerta de éxito antes de navegar al QR
      await Swal.fire({
        title: '¡Cita confirmada!',
        text: 'Tu cita fue agendada correctamente. A continuación verás tu código QR.',
        icon: 'success',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Ver QR',
        background: '#fff',
      });

      // Convertir el blob a una URL que podemos mostrar
      const qrImageUrl = URL.createObjectURL(response.data);
      
      // Navegar a la vista de QR con la URL de la imagen
      navigate('/QRGenerated', { 
        state: { 
          qrImageUrl: qrImageUrl,
          citaData: datosEnviar
        } 
      });
      
    } catch (error) {
      console.error('❌ Error creando cita:', error);

      // 🔥 Alerta de error mejorada con Swal
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20">
        <h2 className="text-2xl font-bold text-black mb-6">Agendar Cita</h2>
        
        <div className="bg-white rounded-lg p-4 border-2 border-yellow-500/40 shadow-lg mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Nombre
              </label>
              <input 
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="Nombre"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Apellido Paterno
              </label>
              <input 
                type="text"
                name="paterno"
                value={formData.paterno}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="Apellido paterno"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Apellido Materno
              </label>
              <input 
                type="text"
                name="materno"
                value={formData.materno}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="Apellido materno"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Teléfono
              </label>
              <input 
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="10 dígitos"
                pattern="[0-9]{10}"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Servicio
              </label>
              <select 
                name="servicios"
                value={formData.servicios}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                required
              >
                <option value="">Selecciona un servicio</option>
                {servicios.length > 0 ? (
                  servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.servicio}>
                      {servicio.servicio} - ${servicio.precio.toFixed(2)}
                    </option>
                  ))
                ) : (
                  <option disabled>Cargando servicios...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Monto Total
              </label>
              <input 
                type="text"
                value={`$${monto.toFixed(2)}`}
                className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 text-black font-bold"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Fecha
              </label>
              <input 
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Hora
              </label>
              <select 
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                required
              >
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="12:30">12:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
                <option value="18:00">18:00</option>
              </select>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'} text-black font-bold py-3 rounded transition-colors shadow-md`}
            >
              {loading ? 'PROCESANDO...' : 'CONFIRMAR Y GENERAR QR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsView;