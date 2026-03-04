import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Home, Share2 } from 'lucide-react';

const QRGeneratedView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { qrImageUrl, citaData } = location.state || {};

  if (!qrImageUrl) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">No hay código QR disponible</p>
          <button 
            onClick={() => navigate('/appointments')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded"
          >
            Volver a agendar
          </button>
        </div>
      </div>
    );
  }

  const descargarQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `qr-cita-${citaData?.fecha || 'cita'}.png`;
    link.click();
  };

  const compartirQR = async () => {
    try {
      // Convertir blob URL a blob
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qr-cita.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Código QR - Cita Barbería',
          text: 'Tu código QR para la cita',
          files: [file]
        });
      } else {
        alert('Tu navegador no soporta compartir archivos. Usa el botón de descargar.');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          ¡Cita Confirmada!
        </h2>
        
        <div className="bg-white rounded-lg p-6 border-2 border-yellow-500/40 shadow-lg mb-4">
          {/* Mostrar datos de la cita */}
          {citaData && (
            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                <span className="font-bold">Cliente:</span> {citaData.nombre} {citaData.paterno} {citaData.materno}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Servicio:</span> {citaData.servicios}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Fecha:</span> {citaData.fecha}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Hora:</span> {citaData.hora}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Monto:</span> ${citaData.monto.toFixed(2)}
              </p>
            </div>
          )}

          {/* Mostrar el QR */}
          <div className="flex justify-center mb-6">
            <img 
              src={qrImageUrl} 
              alt="Código QR de la cita" 
              className="w-64 h-64 border-4 border-yellow-500 rounded-lg"
            />
          </div>

          <p className="text-center text-gray-600 mb-6">
            Presenta este código QR al llegar a la barbería
          </p>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button 
              onClick={descargarQR}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              DESCARGAR QR
            </button>

            <button 
              onClick={compartirQR}
              className="w-full bg-white hover:bg-gray-50 text-black font-bold py-3 rounded flex items-center justify-center gap-2 border-2 border-yellow-500/40"
            >
              <Share2 className="w-5 h-5" />
              COMPARTIR QR
            </button>

            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              VOLVER AL INICIO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGeneratedView;