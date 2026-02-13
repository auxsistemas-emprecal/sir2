import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Search, ShieldCheck, Loader2, Plus, Trash2, Edit3, X, Save, Hash
} from "lucide-react";
import {
  fetchHistorialObservaciones, createObservacion, updateObservacion, deleteObservacion
} from "../assets/services/apiService";

const HistorialObservaciones = ({ onBack }) => {
  const [observaciones, setObservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  // Obtención de datos del localStorage según tu imagen
  const userString = localStorage.getItem("usuario");
  const currentUser = userString ? JSON.parse(userString) : null;
  const nombreUsuarioActivo = currentUser?.nombreUsuario || "Usuario Desconocido";

  const [showModal, setShowModal] = useState(false);
  const [editingObs, setEditingObs] = useState(null);
  
  const [formData, setFormData] = useState({
    cambio_efectuado_por: nombreUsuarioActivo, 
    solicitante: "",
    descripcion: "",
    N_remision: "", 
  });

  const cargarDatos = async () => {
    setLoading(true);
    const data = await fetchHistorialObservaciones();
    setObservaciones(data);
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleOpenModal = (obs = null) => {
    if (obs) {
      setEditingObs(obs);
      setFormData({ ...obs });
    } else {
      setEditingObs(null);
      setFormData({
        cambio_efectuado_por: nombreUsuarioActivo, 
        solicitante: "",
        descripcion: "",
        N_remision: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, N_remision: parseInt(formData.N_remision) || 0 };
    if (editingObs) { await updateObservacion(editingObs.id, payload); }
    else { await createObservacion(payload); }
    setShowModal(false);
    cargarDatos();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      await deleteObservacion(id);
      cargarDatos();
    }
  };

  const filtrados = observaciones.filter(
    (obs) =>
      obs.solicitante?.toLowerCase().includes(filtro.toLowerCase()) ||
      obs.descripcion?.toLowerCase().includes(filtro.toLowerCase()) ||
      obs.N_remision?.toString().includes(filtro)
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      {/* Estilos inline para quitar las flechas del input number */}
      <style>
        {`
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button onClick={onBack} className="group flex items-center text-slate-400 hover:text-indigo-600 transition-all mb-2 text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1" /> Volver al Panel
            </button>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
              AUDITORÍA <span className="text-indigo-600">OBSERVA</span>CIONES
            </h2>
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 shadow-lg w-full md:w-80 transition-all"
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              <Plus size={20} /> Nuevo Registro
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center text-slate-400">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              <p className="font-bold animate-pulse">Sincronizando con obsDB...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                    <th className="p-6">ID / Fecha / Solicitud </th>
                    <th className="p-6">Remisión</th>
                    <th className="p-6">Autor</th>
                    <th className="p-6">Detalle</th>
                    <th className="p-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map((obs) => (
                    <tr key={obs.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-bold border">#{obs.id}</div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{obs.fecha}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{obs.solicitante}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-mono font-black text-xs border border-indigo-100">
                          {obs.N_remision || "N/A"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-600">{obs.cambio_efectuado_por}</span>
                        </div>
                      </td>
                      <td className="p-6 max-w-xs">
                        <p className="text-sm text-slate-500 italic truncate italic">"{obs.descripcion}"</p>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenModal(obs)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(obs.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">{editingObs ? "EDITAR REGISTRO" : "NUEVA OBSERVACIÓN"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Autor del Cambio</label>
                  <input
                    required readOnly
                    className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-500 font-bold outline-none cursor-not-allowed"
                    value={formData.cambio_efectuado_por}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">N. Remisión</label>
                  <input
                    type="number"
                    required
                    // Deshabilitar cambio con rueda del ratón
                    onWheel={(e) => e.target.blur()}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
                    value={formData.N_remision}
                    onChange={(e) => setFormData({ ...formData, N_remision: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Solicitante</label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Descripción</label>
                <textarea
                  required rows="3"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none resize-none"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95">
                <Save size={20} /> {editingObs ? "Actualizar" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialObservaciones;


// import React, { useState, useEffect } from "react";
// import {
//   ArrowLeft,
//   Search,
//   ShieldCheck,
//   Loader2,
//   Plus,
//   Trash2,
//   Edit3,
//   X,
//   Save,
//   Hash,
// } from "lucide-react";
// import {
//   fetchHistorialObservaciones,
//   createObservacion,
//   updateObservacion,
//   deleteObservacion,
// } from "../assets/services/apiService";

// const HistorialObservaciones = ({ onBack }) => {
//   const [observaciones, setObservaciones] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filtro, setFiltro] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [editingObs, setEditingObs] = useState(null);
//   const [formData, setFormData] = useState({
//     cambio_efectuado_por: "",
//     solicitante: "",
//     descripcion: "",
//     N_remision: "", // Se maneja como string en el input, se convierte al enviar
//   });

//   const cargarDatos = async () => {
//     setLoading(true);
//     const data = await fetchHistorialObservaciones();
//     setObservaciones(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     cargarDatos();
//   }, []);

//   const handleOpenModal = (obs = null) => {
//     if (obs) {
//       setEditingObs(obs);
//       setFormData({ ...obs });
//     } else {
//       setEditingObs(null);
//       setFormData({
//         cambio_efectuado_por: "",
//         solicitante: "",
//         descripcion: "",
//         N_remision: "",
//       });
//     }
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Preparación de datos: Aseguramos que N_remision sea un número entero para la API
//     const payload = {
//       ...formData,
//       N_remision: parseInt(formData.N_remision) || 0,
//     };

//     if (editingObs) {
//       await updateObservacion(editingObs.id, payload);
//     } else {
//       await createObservacion(payload);
//     }
//     setShowModal(false);
//     cargarDatos();
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("¿Estás seguro de eliminar este registro?")) {
//       await deleteObservacion(id);
//       cargarDatos();
//     }
//   };

//   const filtrados = observaciones.filter(
//     (obs) =>
//       obs.solicitante?.toLowerCase().includes(filtro.toLowerCase()) ||
//       obs.descripcion?.toLowerCase().includes(filtro.toLowerCase()) ||
//       obs.N_remision?.toString().includes(filtro),
//   );

//   return (
//     <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
//       <div className="max-w-7xl mx-auto">
//         {/* Cabecera mejorada con botón de acción */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <div>
//             <button
//               onClick={onBack}
//               className="group flex items-center text-slate-400 hover:text-indigo-600 transition-all mb-2 text-sm font-bold uppercase tracking-widest"
//             >
//               <ArrowLeft
//                 size={18}
//                 className="mr-2 group-hover:-translate-x-1"
//               />{" "}
//               Volver al Panel
//             </button>
//             <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
//               AUDITORÍA <span className="text-indigo-600">OBSERVA</span>CIONES
//             </h2>
//           </div>

//           <div className="flex gap-4">
//             <div className="relative group">
//               <Search
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                 size={20}
//               />
//               <input
//                 type="text"
//                 placeholder="Buscar ID o Detalle..."
//                 className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 shadow-lg w-full md:w-80 transition-all"
//                 onChange={(e) => setFiltro(e.target.value)}
//               />
//             </div>
//             <button
//               onClick={() => handleOpenModal()}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
//             >
//               <Plus size={20} /> Nuevo Registro
//             </button>
//           </div>
//         </div>

//         {/* Tabla con columna de N. Remisión */}
//         <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
//           {loading ? (
//             <div className="p-20 flex flex-col items-center text-slate-400">
//               <Loader2
//                 className="animate-spin text-indigo-500 mb-4"
//                 size={48}
//               />
//               <p className="font-bold animate-pulse">
//                 Sincronizando con obsDB...
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
//                     <th className="p-6">Registro / Fecha / Solicitud</th>
//                     <th className="p-6">Remisión</th>
//                     <th className="p-6">Autor</th>
//                     <th className="p-6">Detalle</th>
//                     <th className="p-6 text-center">Acciones</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {filtrados.map((obs) => (
//                     <tr
//                       key={obs.id}
//                       className="hover:bg-slate-50/80 transition-colors group"
//                     >
//                       <td className="p-6">
//                         <div className="flex items-center gap-4">
//                           <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-bold border">
//                             #{obs.id}
//                           </div>
//                           <div className="flex flex-col">
//                             <span className="font-bold text-slate-700">
//                               {obs.fecha}
//                             </span>
//                             <span className="text-[10px] text-slate-400 uppercase font-bold">
//                               {obs.solicitante}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-6">
//                         <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-mono font-black text-xs border border-indigo-100">
//                           {obs.N_remision || "N/A"}
//                         </span>
//                       </td>
//                       <td className="p-6">
//                         <div className="flex items-center gap-2">
//                           <ShieldCheck size={14} className="text-indigo-500" />
//                           <span className="text-sm font-semibold text-slate-600">
//                             {obs.cambio_efectuado_por}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="p-6 max-w-xs">
//                         <p className="text-sm text-slate-500 italic truncate italic">
//                           "{obs.descripcion}"
//                         </p>
//                       </td>
//                       <td className="p-6 text-center">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={() => handleOpenModal(obs)}
//                             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                           >
//                             <Edit3 size={18} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(obs.id)}
//                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- Modal con campo N_remision numérico --- */}
//       {showModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
//             <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
//               <h3 className="text-xl font-black tracking-tight">
//                 {editingObs ? "EDITAR REGISTRO" : "NUEVA OBSERVACIÓN"}
//               </h3>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-slate-400 hover:text-white"
//               >
//                 <X />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="p-8 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="col-span-1">
//                   <label className="text-xs font-black text-slate-400 uppercase ml-1">
//                     Autor
//                   </label>
//                   <input
//                     required
//                     className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all"
//                     value={formData.cambio_efectuado_por}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         cambio_efectuado_por: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="col-span-1">
//                   <label className="text-xs font-black text-slate-400 uppercase ml-1">
//                     N. Remisión
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
//                     value={formData.N_remision}
//                     onChange={(e) =>
//                       setFormData({ ...formData, N_remision: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="text-xs font-black text-slate-400 uppercase ml-1">
//                   Solicitante
//                 </label>
//                 <input
//                   required
//                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none"
//                   value={formData.solicitante}
//                   onChange={(e) =>
//                     setFormData({ ...formData, solicitante: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-black text-slate-400 uppercase ml-1">
//                   Descripción del Cambio
//                 </label>
//                 <textarea
//                   required
//                   rows="3"
//                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none resize-none"
//                   value={formData.descripcion}
//                   onChange={(e) =>
//                     setFormData({ ...formData, descripcion: e.target.value })
//                   }
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
//               >
//                 <Save size={20} />{" "}
//                 {editingObs ? "Actualizar Bitácora" : "Guardar en obsDB"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HistorialObservaciones;
