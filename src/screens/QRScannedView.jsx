import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const QRScannedView = () => {
  const location = useLocation();
  const qrData = location.state?.qrData;
  const navigate = useNavigate();
  const [selectedBarber, setSelectedBarber] = useState('');

  // 🔥 Todos los campos del QR mapeados dinámicamente
  const appointmentInfo = qrData
    ? [
        { label: 'Cliente',   value: qrData.nombre    ?? '—', highlight: false },
        { label: 'Teléfono',  value: qrData.telefono  ?? '—', highlight: false },
        { label: 'Servicio',  value: qrData.servicio  ?? '—', highlight: false },
        { label: 'Fecha',     value: qrData.fecha     ?? '—', highlight: false },
        { label: 'Hora',      value: qrData.hora      ?? '—', highlight: true  },
        { label: 'Monto',     value: qrData.monto     ?? '—', highlight: true  },
        { label: 'Barbero',   value: qrData.barbero   ?? '—', highlight: false },
        { label: 'Estado',    value: qrData.estado    ?? '—', highlight: true  },
      ]
    : [{ label: 'Error', value: 'No se recibieron datos del QR', highlight: true }];

  const handleConfirm = () => {
      alert('Cita asignada exitosamente');
      navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">QR Escaneado</h2>
          <p className="text-gray-600">Información de la cita</p>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-yellow-500/40 shadow-lg mb-4">
          <div className="space-y-3 text-sm">
            {appointmentInfo.map((info, index) => (
              <div
                key={index}
                className={`flex justify-between py-2 ${
                  index < appointmentInfo.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <span className="text-gray-600">{info.label}:</span>
                <span className={info.highlight ? 'text-yellow-600 font-medium' : 'text-black font-medium'}>
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded transition-colors shadow-md"
          >
            CONFIRMAR ASIGNACIÓN
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded border-2 border-gray-300 transition-colors"
          >
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannedView;