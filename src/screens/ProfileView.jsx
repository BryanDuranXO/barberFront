import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, Phone, AtSign, Lock, Eye, EyeOff, Save, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileView = () => {

  // 🔥 Cargar datos actuales desde localStorage
  const [formData, setFormData] = useState({
    nombre:   localStorage.getItem('nombre')   ?? '',
    paterno:  localStorage.getItem('paterno')  ?? '',
    materno:  localStorage.getItem('materno')  ?? '',
    telefono: localStorage.getItem('telefono') ?? '',
    usuario:  localStorage.getItem('user')     ?? '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword:      '',
    nuevaPassword:    '',
    confirmarPassword: ''
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showOld,             setShowOld]             = useState(false);
  const [showNueva,           setShowNueva]           = useState(false);
  const [showConfirmar,       setShowConfirmar]       = useState(false);

  const [loadingProfile,  setLoadingProfile]  = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorProfile,    setErrorProfile]    = useState('');
  const [errorPassword,   setErrorPassword]   = useState('');
  const [successProfile,  setSuccessProfile]  = useState(false);
  const [successPassword, setSuccessPassword] = useState(false);

  const rol    = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');
  const userId = localStorage.getItem('id');

  const navigate = useNavigate();

  // 🔥 Iniciales para el avatar
  const getInitials = () => {
    const parts = nombre?.split(' ') ?? [];
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (nombre?.[0] ?? 'U').toUpperCase();
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessProfile(false);
    setErrorProfile('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setSuccessPassword(false);
    setErrorPassword('');
  };

  // 🔥 PUT /api/barber/{id}
  const handleSaveProfile = async () => {
    if (!formData.nombre.trim())   return setErrorProfile('El nombre no puede estar vacío.');
    if (!formData.usuario.trim())  return setErrorProfile('El usuario no puede estar vacío.');

    setLoadingProfile(true);
    setErrorProfile('');

    try {
      await axios.put(
        `https://barberback-1qs2.onrender.com/api/barber/usuarios/edit/${userId}`,
        {
          nombre:   formData.nombre.trim(),
          paterno:  formData.paterno.trim(),
          materno:  formData.materno.trim(),
          telefono: formData.telefono.trim(),
          usuario:  formData.usuario.trim(),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccessProfile(true);
      setTimeout(() => setSuccessProfile(false), 3000);

      // 🔥 Alerta de perfil actualizado con aviso de reinicio de sesión
      await Swal.fire({
        title: '¡Perfil actualizado!',
        text: 'Para ver los cambios reflejados en el header y demás secciones, deberás iniciar sesión nuevamente.',
        icon: 'info',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Entendido',
        background: '#fff',
      });

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 500);

    } catch (err) {
      setErrorProfile(err.response?.data?.message || 'Error al actualizar el perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // 🔥 PUT /api/barber/new-password
  const handleSavePassword = async () => {
    if (!passwordData.oldPassword)
      return setErrorPassword('Ingresa tu contraseña actual.');
    if (!passwordData.nuevaPassword)
      return setErrorPassword('Ingresa la nueva contraseña.');
    if (passwordData.nuevaPassword.length < 6)
      return setErrorPassword('La contraseña debe tener al menos 6 caracteres.');
    if (passwordData.nuevaPassword !== passwordData.confirmarPassword)
      return setErrorPassword('Las contraseñas no coinciden.');

    setLoadingPassword(true);
    setErrorPassword('');

    try {
      await axios.put(
        'https://barberback-1qs2.onrender.com/api/barber/usuarios/new-password',
        {
          username:    localStorage.getItem('user'),
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.nuevaPassword,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setPasswordData({ oldPassword: '', nuevaPassword: '', confirmarPassword: '' });
      setSuccessPassword(true);
      setTimeout(() => setSuccessPassword(false), 3000);

      // 🔥 Alerta de contraseña actualizada con aviso de reinicio de sesión
      await Swal.fire({
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña fue cambiada correctamente. Deberás iniciar sesión nuevamente.',
        icon: 'success',
        confirmButtonColor: '#EAB308',
        confirmButtonText: 'Entendido',
        background: '#fff',
      });

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 500);

    } catch (err) {
      setErrorPassword(err.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20 max-w-lg mx-auto">

        {/* Avatar + info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg mb-3">
            <span className="text-2xl font-bold text-black">{getInitials()}</span>
          </div>
          <h2 className="text-xl font-bold text-black">{nombre}</h2>
          <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 font-medium px-3 py-1 rounded-full mt-1">
            {rol}
          </span>
        </div>

        {/* ── Sección: Datos del perfil ── */}
        <div className="bg-white rounded-xl border-2 border-yellow-500/40 shadow-md p-5 mb-4">
          <h3 className="text-black font-bold text-base mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-500" />
            Datos del perfil
          </h3>

          <div className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="nombre" value={formData.nombre}
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                  placeholder="Nombre"
                />
              </div>
            </div>

            {/* Apellido paterno */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Apellido paterno</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="paterno" value={formData.paterno}
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                  placeholder="Apellido paterno"
                />
              </div>
            </div>

            {/* Apellido materno */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Apellido materno</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="materno" value={formData.materno}
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                  placeholder="Apellido materno"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel" name="telefono" value={formData.telefono}
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                  placeholder="Tu número de teléfono"
                />
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Usuario</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="usuario" value={formData.usuario}
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            </div>

          </div>

          {errorProfile && <p className="text-red-500 text-sm mt-3">{errorProfile}</p>}
          {successProfile && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-3">
              <CheckCircle className="w-4 h-4" />
              Perfil actualizado correctamente
            </div>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={loadingProfile}
            className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-colors shadow-md ${
              loadingProfile ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
            } text-black`}
          >
            <Save className="w-4 h-4" />
            {loadingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* ── Sección: Cambiar contraseña (colapsable) ── */}
        <div className="bg-white rounded-xl border-2 border-yellow-500/40 shadow-md overflow-hidden mb-6">

          <button
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setErrorPassword('');
              setSuccessPassword(false);
              setPasswordData({ oldPassword: '', nuevaPassword: '', confirmarPassword: '' });
            }}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-500" />
              <span className="text-black font-bold text-base">Cambiar contraseña</span>
            </div>
            {showPasswordSection
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showPasswordSection && (
            <div className="px-5 pb-5 border-t border-gray-100">
              <div className="space-y-4 mt-4">

                {/* 🔥 Contraseña actual */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showOld ? 'text' : 'password'}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                      placeholder="Tu contraseña actual"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNueva ? 'text' : 'password'}
                      name="nuevaPassword"
                      value={passwordData.nuevaPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-10 py-3 text-black text-sm focus:border-yellow-500 focus:outline-none focus:bg-white transition-colors"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button type="button" onClick={() => setShowNueva(!showNueva)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      name="confirmarPassword"
                      value={passwordData.confirmarPassword}
                      onChange={handlePasswordChange}
                      className={`w-full bg-gray-50 border rounded-lg pl-10 pr-10 py-3 text-black text-sm focus:outline-none focus:bg-white transition-colors ${
                        passwordData.confirmarPassword && passwordData.nuevaPassword !== passwordData.confirmarPassword
                          ? 'border-red-400 focus:border-red-400'
                          : passwordData.confirmarPassword && passwordData.nuevaPassword === passwordData.confirmarPassword
                          ? 'border-green-400 focus:border-green-400'
                          : 'border-gray-300 focus:border-yellow-500'
                      }`}
                      placeholder="Repite la nueva contraseña"
                    />
                    <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwordData.confirmarPassword && (
                    <p className={`text-xs mt-1 ${
                      passwordData.nuevaPassword === passwordData.confirmarPassword
                        ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {passwordData.nuevaPassword === passwordData.confirmarPassword
                        ? '✓ Las contraseñas coinciden'
                        : '✗ Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

              </div>

              {errorPassword && <p className="text-red-500 text-sm mt-3">{errorPassword}</p>}
              {successPassword && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-3">
                  <CheckCircle className="w-4 h-4" />
                  Contraseña actualizada correctamente
                </div>
              )}

              <button
                onClick={handleSavePassword}
                disabled={loadingPassword}
                className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-colors shadow-md ${
                  loadingPassword ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                } text-black`}
              >
                <Lock className="w-4 h-4" />
                {loadingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileView;