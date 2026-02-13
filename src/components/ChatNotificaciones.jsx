import React, { useState } from "react";
import {
  Send,
  Bell,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle,
  Eye,
} from "lucide-react";
import { createNotificacion } from "../assets/services/apiService";

export default function ChatNotificaciones() {
  const [mensaje, setMensaje] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("notificación");
  const [loading, setLoading] = useState(false);

  const visualConfig = {
    notificación: {
      color: "bg-emerald-500",
      icon: <CheckCircle />,
      label: "Informativo",
    },
    parche: {
      color: "bg-amber-500",
      icon: <AlertTriangle />,
      label: "Urgente",
    },
    error: { color: "bg-rose-500", icon: <AlertTriangle />, label: "Crítico" },
    actualización: {
      color: "bg-blue-500",
      icon: <Sparkles />,
      label: "Mejora",
    },
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || !titulo.trim()) return;

    setLoading(true);
    try {
      const bodyBase64 = btoa(unescape(encodeURIComponent(mensaje)));
      const nuevaNoti = {
        titulo: titulo.toUpperCase(),
        body: bodyBase64,
        tipo: tipo,
        activa: 1,
        fecha: new Date().toISOString().split("T")[0],
      };

      await createNotificacion(nuevaNoti);
      alert("✅ Notificación publicada con éxito");
      setMensaje("");
      setTitulo("");
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("❌ Error al procesar la notificación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Bell size={28} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                SISTEMA DE AVISOS
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-indigo-600">
                Central de Comunicaciones
              </p>
            </div>
          </div>

          <form onSubmit={handleEnviar} className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">
                Encabezado del Aviso
              </label>
              <input
                type="text"
                placeholder="EJ: MANTENIMIENTO PROGRAMADO"
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">
                Prioridad y Estilo
              </label>
              <select
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-600 cursor-pointer appearance-none shadow-inner"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="notificación">🟢 Notificación (Éxito)</option>
                <option value="parche">🟠 Urgente (Atención)</option>
                <option value="error">🔴 Crítico (Error)</option>
                <option value="actualización">🔵 Actualización (Info)</option>
              </select>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">
                Cuerpo del Mensaje
              </label>
              <textarea
                placeholder="Describe el anuncio detalladamente..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none h-32 resize-none font-medium text-slate-600 shadow-inner"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer shadow-xl ${
                loading
                  ? "bg-slate-200 text-slate-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  PROCESANDO...
                </div>
              ) : (
                <>
                  <Send size={20} /> PUBLICAR EN PANEL
                </>
              )}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: PREVIEW EN TIEMPO REAL */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-2 text-slate-400 ml-4">
            <Eye size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Vista Previa del Usuario
            </span>
          </div>

          {/* TARJETA DE PREVIEW DINÁMICA */}
          <div
            className={`relative overflow-hidden rounded-[2rem] p-8 shadow-2xl transition-all duration-500 transform hover:scale-105 ${visualConfig[tipo].color} text-white`}
          >
            {/* Adorno de fondo */}
            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
              {React.cloneElement(visualConfig[tipo].icon, { size: 120 })}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                  {visualConfig[tipo].icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-black/10 px-3 py-1 rounded-full">
                  {visualConfig[tipo].label}
                </span>
              </div>

              <h3 className="text-2xl font-black mb-2 break-words leading-tight">
                {titulo || "TÍTULO DEL AVISO"}
              </h3>

              <p className="text-white/90 text-sm font-medium leading-relaxed italic border-l-2 border-white/30 pl-4">
                {mensaje ||
                  "Aquí se mostrará el contenido que escribas en el formulario de la izquierda..."}
              </p>

              <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">
                    Fecha de Emisión
                  </p>
                  <p className="font-mono text-xs">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
            <div className="flex gap-3">
              <Info className="text-indigo-500 shrink-0" size={20} />
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                <b>Nota de Seguridad:</b> Esta notificación será visible
                instantáneamente para todos los usuarios activos en el sistema
                centralizado de Pedregosa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// import React, { useState } from "react";
// import { Send, Bell } from "lucide-react";
// import { createNotificacion } from "../assets/services/apiService";

// export default function ChatNotificaciones() {
//   const [mensaje, setMensaje] = useState("");
//   const [titulo, setTitulo] = useState("");
//   const [tipo, setTipo] = useState("info");

//   // SOLUCIÓN AL ERROR: Definir el estado loading
//   const [loading, setLoading] = useState(false);

//   const handleEnviar = async (e) => {
//     e.preventDefault();
//     if (!mensaje.trim() || !titulo.trim()) return;

//     setLoading(true); // Ahora sí funcionará

//     try {
//       // 1. Codificar mensaje a Base64
//       const bodyBase64 = btoa(unescape(encodeURIComponent(mensaje)));

//       // 2. Crear objeto (SOLUCIÓN AL ERROR 422: Fecha sin hora)
//       const nuevaNoti = {
//         titulo: titulo.toUpperCase(),
//         body: bodyBase64,
//         tipo: tipo,
//         activa: 1,
//         fecha: new Date().toISOString().split('T')[0] // Envía YYYY-MM-DD
//       };

//       await createNotificacion(nuevaNoti);

//       alert("✅ Notificación publicada con éxito");
//       setMensaje("");
//       setTitulo("");

//     } catch (error) {
//       console.error("Error al enviar:", error);
//       alert("❌ Error al procesar la notificación.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <div className="bg-white rounded-3xl shadow-sm border p-8">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
//             <Bell size={24} />
//           </div>
//           <h2 className="text-xl font-black text-slate-800 uppercase">
//             Sistema de Avisos
//           </h2>
//         </div>

//         <form onSubmit={handleEnviar} className="space-y-4">
//           <input
//             type="text"
//             placeholder="TÍTULO DEL BANNER"
//             className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold"
//             value={titulo}
//             onChange={(e) => setTitulo(e.target.value)}
//             required
//           />

//           <select
//             className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-indigo-500"
//             value={tipo}
//             onChange={(e) => setTipo(e.target.value)}
//           >
//             <option value="notificación">Notificación (Verde)</option>
//             <option value="parche">Urgente (Naranja)</option>
//             <option value="error">Error (Rojo)</option>
//             <option value="actualización">Actualización (Verde)</option>
//           </select>

//           <textarea
//             placeholder="Escribe el mensaje aquí..."
//             className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-indigo-500 h-32"
//             value={mensaje}
//             onChange={(e) => setMensaje(e.target.value)}
//             required
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
//               loading ? 'bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'
//             }`}
//           >
//             {loading ? "ENVIANDO..." : <><Send size={20} /> PUBLICAR AHORA</>}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
