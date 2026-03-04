import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scissors, Menu, X, Calendar, Clock, Users, Scan, LogOut, LayoutDashboard, User } from 'lucide-react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const rol    = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  const isUser  = rol === 'USER';
  const isAdmin = rol === 'ADMIN' || rol === 'EMPLEADO';

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    axios.defaults.headers.common['Authorization'] = '';
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b-2 border-yellow-500/40 z-50 shadow-md">
      <div className="flex items-center justify-between p-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-yellow-500" />
          <div>
            <span className="text-black font-bold block leading-tight">BARBERÍA LEFTY 96</span>
            {nombre && (
              <span className="text-xs text-gray-400 leading-tight">
                {nombre} · {rol}
              </span>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-yellow-600 p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="bg-white border-t border-gray-200">

          {/* 🔥 Menú USER: Escanear QR + Perfil */}
          {isUser && (
            <>
              <button
                onClick={() => handleNavigation('/scan-qr')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <Scan className="w-5 h-5 text-yellow-500" />
                Escanear QR
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <User className="w-5 h-5 text-yellow-500" />
                Mi Perfil
              </button>
            </>
          )}

          {/* 🔥 Menú ADMIN / EMPLEADO: menú completo + Perfil */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <LayoutDashboard className="w-5 h-5 text-yellow-500" />
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation('/appointments')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <Calendar className="w-5 h-5 text-yellow-500" />
                Agendar Cita
              </button>

              <button
                onClick={() => handleNavigation('/manage-appointments')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <Clock className="w-5 h-5 text-yellow-500" />
                Gestión de Citas
              </button>

              <button
                onClick={() => handleNavigation('/employees')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <Users className="w-5 h-5 text-yellow-500" />
                Empleados
              </button>

              <button
                onClick={() => handleNavigation('/scan-qr')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <Scan className="w-5 h-5 text-yellow-500" />
                Escanear QR
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full text-left px-4 py-3 text-black hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <User className="w-5 h-5 text-yellow-500" />
                Mi Perfil
              </button>
            </>
          )}

          {/* Cerrar sesión — siempre visible */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>

        </div>
      )}
    </div>
  );
};

export default Header;