import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, X, ChevronDown, ChevronUp } from 'lucide-react';

const EmployeesView = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  const currentUsuario = localStorage.getItem('user');

  const [formData, setFormData] = useState({
    nombre: '',
    paterno: '',
    materno: '',
    telefono: '',
    usuario: '',
    password: '',
    status: true
  });

  /* =========================
     OBTENER USUARIOS
  ========================= */
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://barberback-1qs2.onrender.com/api/barber/usuarios/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(response.data.data ?? []);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  /* =========================
     FORM
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData, rol: { id: 2 } };

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://barberback-1qs2.onrender.com/api/barber/usuarios/save',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: '¡Barbero agregado!',
        text: `${formData.nombre} ${formData.paterno} fue registrado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Aceptar',
        background: '#fff',
        timer: 2500,
        showConfirmButton: false
      });

      setShowForm(false);
      setFormData({ nombre: '', paterno: '', materno: '', telefono: '', usuario: '', password: '', status: true });
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error al guardar',
        text: error.response?.data?.message || 'No se pudo registrar el barbero. Intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Entendido',
        background: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ELIMINAR USUARIO
  ========================= */
  const handleEliminar = async (u) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${u.nombre} ${u.paterno}? Esta acción no se puede deshacer.`,
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
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://barberback-1qs2.onrender.com/api/barber/usuarios/eliminar/${u.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: '¡Eliminado!',
        text: `${u.nombre} ${u.paterno} fue eliminado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#EAB308',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
      });

      fetchUsuarios();
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      Swal.fire({
        title: 'Error al eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar el usuario. Intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Entendido',
        background: '#fff',
      });
    }
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all duration-200';
  const labelClass = 'block text-gray-600 mb-1.5 text-xs font-semibold uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pt-20 pb-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 bg-yellow-500 rounded-full" />
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Equipo</span>
          </div>
          <h2 className="text-3xl font-black text-black">Gestión de Empleados</h2>
          <p className="text-gray-500 text-sm mt-1">{usuarios.length} barbero{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Botón toggle formulario */}
        <button
          onClick={() => setShowForm(!showForm)}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-md mb-4
            ${showForm
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:shadow-lg active:scale-[0.98]'
            }`}
        >
          <span>{showForm ? 'Cancelar' : '+ Agregar Barbero'}</span>
          {showForm ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-yellow-500/30 shadow-sm overflow-hidden mb-6">
            <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300" />

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Datos personales */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-yellow-400" />
                  Datos personales
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Nombre</label>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ej. Carlos"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Ap. Paterno</label>
                      <input
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
                        name="materno"
                        value={formData.materno}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej. López"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+52</span>
                      <input
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={`${inputClass} pl-14`}
                        placeholder="10 dígitos"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divisor */}
              <div className="border-t border-dashed border-gray-200" />

              {/* Credenciales */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-yellow-400" />
                  Credenciales de acceso
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Usuario</label>
                    <input
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ej. carlos.garcia"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botón guardar */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-md
                  ${loading
                    ? 'bg-yellow-200 text-yellow-600 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-black hover:shadow-lg'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar Barbero'
                )}
              </button>

            </form>
          </div>
        )}

        {/* Lista de empleados */}
        <div className="space-y-3">
          {usuarios.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay barberos registrados</p>
            </div>
          )}

          {usuarios.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-yellow-500/30 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-black" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black leading-tight">
                    {u.nombre} {u.paterno} {u.materno}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {u.telefono} · @{u.usuario}
                  </p>
                  <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border
                    ${u.status
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    {u.status ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {u.usuario !== currentUsuario ? (
                  <button
                    onClick={() => handleEliminar(u)}
                    className="shrink-0 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2 rounded-lg text-sm transition-colors border border-red-200"
                  >
                    Eliminar
                  </button>
                ) : (
                  <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                    Tú
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EmployeesView;