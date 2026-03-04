import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Scan, Loader2 } from 'lucide-react';

const ScanQRView = () => {
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const processingRef = useRef(false);
  const hasScannedRef = useRef(false);
  const isMountedRef = useRef(true);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const stopScanner = async () => {
    if (qrRef.current) {
      try {
        if (qrRef.current.isScanning) {
          await qrRef.current.stop();
        }
        qrRef.current.clear();
      } catch (e) {
        console.warn("Advertencia al detener el escáner:", e);
      } finally {
        qrRef.current = null;
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode("qr-reader");
        qrRef.current = html5Qrcode;

        if (isMountedRef.current) setScanning(true);

        await html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },

          async (decodedText) => {
            if (processingRef.current || hasScannedRef.current) return;

            processingRef.current = true;
            hasScannedRef.current = true;

            // 🔥 Detener cámara ANTES de cualquier otra acción
            await stopScanner();

            if (!isMountedRef.current) return;

            setProcessing(true);
            setScanning(false);

            try {
              // 🔥 Parsear líneas del QR con las etiquetas exactas
              const lines = decodedText.split("\n");
              const getValue = (key) =>
                lines.find(l => l.startsWith(`${key}:`))
                  ?.replace(`${key}:`, '').trim() ?? null;

              // Línea 2 es el nombre completo (no tiene etiqueta)
              const nombre   = lines[1]?.trim() ?? null;
              const telefono = getValue("Tel");
              const fecha    = getValue("Fecha");
              const hora     = getValue("Hora");
              const servicio = getValue("Servicio(s)");
              const monto    = getValue("Monto");

              if (!fecha || !hora) throw new Error("QR inválido: formato incorrecto");
              if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error("Formato de fecha inválido");
              if (!/^\d{2}:\d{2}$/.test(hora)) throw new Error("Formato de hora inválido");

              const barbero = localStorage.getItem("barbero");
              if (!barbero) throw new Error("No se encontró el barbero en sesión");

              const payload = { escaneada: true, barbero, fecha, hora };
              console.log("📤 Enviando payload:", payload);

              const response = await fetch("https://barberback-1qs2.onrender.com/api/barber/citas/scan-cita", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
              });

              if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
              }

              console.log("✅ Cita actualizada exitosamente");

              // 🔥 qrData con todos los campos del QR
              const qrData = {
                nombre,
                telefono,
                fecha,
                hora,
                servicio,
                monto: monto ? `$${monto}` : '—',
                barbero,
                estado: 'Confirmada'
              };

              setTimeout(() => {
                if (isMountedRef.current) {
                  navigate("/qr-scanned", { replace: true, state: { qrData } });
                }
              }, 500);

            } catch (err) {
              console.error("❌ Error procesando QR:", err);
              if (!isMountedRef.current) return;

              setError(err.message || "Error al procesar el código QR");
              setProcessing(false);

              // 🔥 Reintentar solo si el componente sigue montado
              setTimeout(async () => {
                if (!isMountedRef.current) return;

                processingRef.current = false;
                hasScannedRef.current = false;
                setError('');
                await startScanner();
              }, 3000);
            }
          },
          () => {} // onError silencioso (frame sin QR, es normal)
        );
      } catch (err) {
        console.error("❌ Error iniciando cámara:", err);
        if (isMountedRef.current) {
          setError('No se pudo acceder a la cámara. Verifica los permisos.');
          setScanning(false);
          setProcessing(false);
        }
      }
    };

    startScanner();

    // 🔥 Cleanup robusto al desmontar el componente
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-yellow-500 shadow-md">
        <div className="p-4 pt-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">
            Escanear Código QR
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-black/70 hover:text-black p-2 hover:bg-black/5 rounded-full transition-all"
            disabled={processing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 pt-8">
        {/* Scanner Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full transform scale-75"></div>

          <div className="relative bg-white rounded-2xl p-6 border-2 border-yellow-500/40 shadow-2xl">
            <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden bg-gray-100">

              {/* Video Stream */}
              <div
                id="qr-reader"
                className="absolute inset-0"
                style={{ display: processing ? 'none' : 'block' }}
              ></div>

              {/* Processing Overlay */}
              {processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500/10">
                  <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
                  <p className="text-yellow-700 font-medium">Procesando...</p>
                </div>
              )}

              {/* Corner Brackets */}
              {!processing && (
                <div className="absolute inset-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>
                </div>
              )}

              {/* Scanning Line */}
              {scanning && !processing && (
                <div className="absolute inset-x-4 top-4 pointer-events-none">
                  <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-scan shadow-lg shadow-yellow-500/50"></div>
                </div>
              )}

              {/* Center Dot */}
              {!processing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                </div>
              )}
            </div>

            {/* Status */}
            {scanning && !processing && (
              <div className="mt-6 flex items-center justify-center gap-2 bg-yellow-50 rounded-lg py-3 border border-yellow-500/30">
                <Scan className="w-5 h-5 text-yellow-600 animate-pulse" />
                <span className="text-yellow-700 font-medium">Escaneando...</span>
              </div>
            )}

            {processing && (
              <div className="mt-6 flex items-center justify-center gap-2 bg-blue-50 rounded-lg py-3 border border-blue-300">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-700 font-medium">Registrando cita...</span>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-300 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                <p className="text-red-500 text-xs text-center mt-1">Reintentando en 3 segundos...</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-500/40 mb-6">
          <h3 className="text-black font-bold mb-3 text-center flex items-center justify-center gap-2">
            <Scan className="w-5 h-5 text-yellow-600" />
            Instrucciones
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              Coloca el código QR dentro del marco amarillo
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              Mantén el dispositivo estable
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              Asegúrate de tener buena iluminación
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              El escaneo se realizará automáticamente
            </li>
          </ul>
        </div>

        {/* Cancel */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl border-2 border-gray-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={processing}
        >
          CANCELAR
        </button>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(calc(100% + 1rem)); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanQRView;