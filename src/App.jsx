import React, { useState } from 'react';
import { Scissors, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('https://barberback-1qs2.onrender.com/api/auth/signin', {
        username,
        password
      });

      const data = response.data.data;

      if (!data?.token) {
        setError('No se recibió token del servidor.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('user', data.user);
      localStorage.setItem('barbero', data.nombre);
      localStorage.setItem('id', data.id);

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
        }

        .brand-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
        }

        /* Fondo con patrón sutil de rayas de barbería */
        .barber-bg {
          background-color: #ffffff;
          background-image:
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 18px,
              rgba(234,179,8,0.04) 18px,
              rgba(234,179,8,0.04) 20px
            );
        }

        /* Tarjeta con sombra dorada suave */
        .login-card {
          background: #ffffff;
          border: 1.5px solid rgba(234,179,8,0.35);
          border-radius: 20px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 20px 60px rgba(234,179,8,0.10),
            0 0 0 1px rgba(234,179,8,0.06);
        }

        /* Línea decorativa dorada */
        .gold-rule {
          height: 3px;
          width: 48px;
          background: linear-gradient(90deg, #EAB308, #FDE047);
          border-radius: 2px;
          margin: 0 auto;
        }

        /* Inputs */
        .field-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
          width: 17px;
          height: 17px;
          transition: color 0.2s;
        }
        .field-input {
          width: 100%;
          padding: 13px 44px 13px 42px;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #C4C4C4; }
        .field-input:focus {
          border-color: #EAB308;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(234,179,8,0.12);
        }
        .field-input:focus + .field-icon-label,
        .field-wrap:focus-within .field-icon {
          color: #EAB308;
        }
        .toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .toggle-btn:hover { color: #EAB308; }

        /* Botón submit */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);
          color: #000000;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.08em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(234,179,8,0.35);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(234,179,8,0.45);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* Loader spinner */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Icono scissors animado */
        .scissors-wrap {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #FEF9C3, #FEF08A);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 2px solid rgba(234,179,8,0.3);
          box-shadow: 0 8px 24px rgba(234,179,8,0.2);
        }

        /* Divider decorativo */
        .deco-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .deco-line::before,
        .deco-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,179,8,0.3), transparent);
        }

        /* Error */
        .error-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 10px 14px;
          color: #DC2626;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Fade-in en carga */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
      `}</style>

      <div className="login-root barber-bg min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-sm fade-up">

          {/* Header marca */}
          <div className="text-center mb-8 fade-up">
            <div className="scissors-wrap">
              <Scissors className="w-8 h-8 text-yellow-600" strokeWidth={2} />
            </div>
            <h1 className="brand-title text-2xl text-black tracking-tight leading-tight mb-1">
              BARBERÍA<br />LEFTY 96
            </h1>
            <div className="gold-rule mt-3 mb-3" />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6B7280', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Sistema de Gestión
            </p>
          </div>

          {/* Tarjeta */}
          <div className="login-card p-7 fade-up-2">

            <div className="deco-line mb-6">
              <span style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Iniciar Sesión
              </span>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Campo usuario */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>
                  USUARIO
                </label>
                <div className="field-wrap">
                  <User className="field-icon" />
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Campo contraseña */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>
                  CONTRASEÑA
                </label>
                <div className="field-wrap">
                  <Lock className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 17, height: 17 }} />
                      : <Eye style={{ width: 17, height: 17 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-box">
                  <span style={{ fontSize: 15 }}>⚠</span>
                  {error}
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                {loading && <span className="spinner" />}
                {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
              </button>

            </form>
          </div>

          {/* Footer */}
          <p className="fade-up-3" style={{ textAlign: 'center', fontSize: 11, color: '#D1D5DB', marginTop: 24, letterSpacing: '0.05em' }}>
            © 2026 Barbería Lefty 96
          </p>

        </div>
      </div>
    </>
  );
};

export default LoginView;