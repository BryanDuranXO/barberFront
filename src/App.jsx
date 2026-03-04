import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('https://barberback-1qs2.onrender.com/api/auth/signin', {
        username,
        password
      });

      // 🔥 El token y datos vienen dentro de response.data.data
      const data = response.data.data;

      if (!data?.token) {
        setError('No se recibió token del servidor.');
        return;
      }

      // 🔥 Guardar datos correctamente
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('user', data.user);
      localStorage.setItem('barbero', data.nombre); // usar nombre real
      localStorage.setItem('id', data.id);

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // 🔥 Redirigir según rol
      if (data.rol === 'BARBER') {
        navigate('/scan-qr');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Scissors className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold text-black mb-2">BARBERÍA LEFTY 96</h1>
          <p className="text-gray-600">Sistema de Gestión</p>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Usuario
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-black focus:border-yellow-500 focus:outline-none focus:bg-white"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'
              } text-black font-bold py-3 rounded transition-colors shadow-md`}
            >
              {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;