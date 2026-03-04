import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User } from 'lucide-react';

const EmployeesView = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  // 🔥 Usuario logueado actual
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
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      rol: { id: 2 }
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://barberback-1qs2.onrender.com/api/barber/usuarios/save',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
      setFormData({
        nombre: '',
        paterno: '',
        materno: '',
        telefono: '',
        usuario: '',
        password: '',
        status: true
      });
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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  return (
    <div className="min-h-screen bg-white p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6">Gestión de Empleados</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded mb-6"
      >
        + AGREGAR BARBERO
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-yellow-500/40 rounded-lg p-4 mb-6 shadow-md space-y-3"
        >
          <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="paterno" placeholder="Apellido paterno" value={formData.paterno} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="materno" placeholder="Apellido materno" value={formData.materno} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className="w-full border p-2 rounded" required />

          <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-bold">
            {loading ? 'Guardando...' : 'Guardar Barbero'}
          </button>
        </form>
      )}

      {/* =========================
          LISTA REAL
      ========================= */}
      <div className="space-y-3">
        {usuarios.length === 0 && (
          <p className="text-center text-gray-500">
            No hay barberos registrados
          </p>
        )}

        {usuarios.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-lg p-4 border-2 border-yellow-500/40 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-black" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold">
                  {u.nombre} {u.paterno} {u.materno}
                </h3>
                <p className="text-sm text-gray-600">
                  📞 {u.telefono} • Usuario: {u.usuario}
                </p>
                <p className={`text-sm font-medium ${u.status ? 'text-green-600' : 'text-red-600'}`}>
                  {u.status ? 'Activo' : 'Inactivo'}
                </p>
              </div>

              {/* 🔥 Ocultar botón si es el propio usuario logueado */}
              {u.usuario !== currentUsuario ? (
                <button
                  onClick={() => handleEliminar(u)}
                  className="shrink-0 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2 rounded text-sm transition-colors border border-red-200"
                >
                  Eliminar
                </button>
              ) : (
                <span className="shrink-0 text-xs text-gray-400 px-3 py-2">
                  (tú)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default EmployeesView;