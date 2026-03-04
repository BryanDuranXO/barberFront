import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';

// 🔥 URL a la que redirige el QR — ajusta el dominio a tu entorno
const QR_URL = 'http://localhost:5173/appointments';

const StaticQRView = () => {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  // 🔥 Descargar el QR como imagen PNG
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData   = new XMLSerializer().serializeToString(svg);
    const svgBlob   = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl    = URL.createObjectURL(svgBlob);

    const canvas    = document.createElement('canvas');
    canvas.width    = 512;
    canvas.height   = 512;
    const ctx       = canvas.getContext('2d');
    const img       = new Image();

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      const pngUrl  = canvas.toDataURL('image/png');
      const link    = document.createElement('a');
      link.href     = pngUrl;
      link.download = 'qr-citas-barberia.png';
      link.click();
    };
    img.src = svgUrl;
  };

  // 🔥 Imprimir solo el QR
  const handlePrint = () => {
    const svg      = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData  = new XMLSerializer().serializeToString(svg);
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>QR Barbería Elite</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
              background: white;
            }
            h2 { font-size: 22px; margin-bottom: 8px; color: #111; }
            p  { font-size: 13px; color: #555; margin-bottom: 20px; }
            img { width: 280px; height: 280px; }
          </style>
        </head>
        <body>
          <h2>BARBERÍA ELITE</h2>
          <p>Escanea para agendar tu cita</p>
          <img src="data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}" />
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 pt-20 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          QR Citas de Imprevisto
        </h2>

        <div className="bg-white rounded-xl p-6 border-2 border-yellow-500/40 shadow-lg mb-4">

          {/* 🔥 QR real generado con qrcode.react */}
          <div
            ref={qrRef}
            className="flex items-center justify-center bg-white p-4 rounded-lg mb-4 border border-gray-200"
          >
            <QRCodeSVG
              value={QR_URL}
              size={240}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"         // Alta corrección de errores
              includeMargin={true}
            />
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-500/40">
            <p className="text-yellow-700 font-medium text-center mb-1">
              QR para Walk-ins
            </p>
            <p className="text-gray-500 text-xs text-center break-all">
              {QR_URL}
            </p>
            <p className="text-gray-600 text-sm text-center mt-2">
              Los clientes escanean este código para agendar una cita directamente
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            DESCARGAR QR
          </button>

          <button
            onClick={handlePrint}
            className="w-full bg-white hover:bg-gray-50 text-black font-bold py-3 rounded-lg border-2 border-yellow-500/40 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            IMPRIMIR QR
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg border-2 border-gray-300 transition-colors"
          >
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaticQRView;