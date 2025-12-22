// import React, { useState } from "react";
// import { 
//   Archive, Search, CheckCircle, Calendar, 
//   CreditCard, Eye, Tags, ChevronRight, 
//   Receipt, X, FileText, ArrowRight, Calculator,
//   Banknote, Landmark, Smartphone
// } from "lucide-react"; 

// // --- MINI COMPONENTE: NOTIFICACIÓN ---
// const SuccessNotification = ({ message, onClose }) => {
//   if (!message) return null;
//   return (
//     <div className="fixed inset-x-0 top-6 max-w-md mx-auto z-110 px-4 animate-in fade-in slide-in-from-top-8 duration-300">
//       <div className="bg-white/95 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl p-4 flex items-center justify-between ring-1 ring-black/5">
//         <div className="flex items-center gap-3">
//           <div className="bg-green-500 p-2 rounded-full text-white shadow-lg shadow-green-200">
//             <CheckCircle size={18} />
//           </div>
//           <p className="text-sm font-bold text-gray-800">{message}</p>
//         </div>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer">
//           <X size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- MINI COMPONENTE: MODAL DE DETALLES DE REMISIONES ---
// const RemisionesModal = ({ isOpen, onClose, listaRemisiones, onVerRemisionIndividual }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
//       <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
//         <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-black flex items-center gap-2">
//               <Tags size={24} />
//               Remisiones Vinculadas
//             </h3>
//             <p className="text-orange-100 text-xs font-medium mt-1">Documentos asociados a este anticipo</p>
//           </div>
//           <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors cursor-pointer hover:rotate-90 duration-200">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
//           <div className="space-y-3">
//             {listaRemisiones.map((num, index) => (
//               <div 
//                 key={index} 
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group cursor-default"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="bg-white p-2.5 rounded-xl shadow-sm text-orange-600 group-hover:scale-110 transition-transform duration-200">
//                     <FileText size={20} />
//                   </div>
//                   <div>
//                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Número</span>
//                     <p className="text-lg font-black text-gray-800">REM-{num}</p>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => onVerRemisionIndividual(num)}
//                   className="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all active:scale-90 cursor-pointer hover:shadow-orange-200 hover:shadow-lg"
//                 >
//                   <ArrowRight size={20} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
//           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
//             Total: {listaRemisiones.length} documentos
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENTE PRINCIPAL ---
// export default function AnticiposArchived({ data, toggleAnticipoEstado, onVerAnticipo, onVerDetalleRemision }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [notificationMessage, setNotificationMessage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRemisiones, setSelectedRemisiones] = useState([]);

//   const formatCurrency = (value) =>
//     new Intl.NumberFormat("es-CO", {
//       style: "currency",
//       currency: "COP",
//       minimumFractionDigits: 0,
//     }).format(value || 0);

//   const getInitials = (name) => {
//     if (!name) return "?";
//     return name.charAt(0).toUpperCase();
//   };

//   // Función para renderizar el icono según el método de pago
//   const renderTipoPagoIcon = (tipo) => {
//     const t = tipo?.toLowerCase() || "";
//     if (t.includes("efectivo")) return <Banknote size={12} className="text-emerald-500" />;
//     if (t.includes("transferencia") || t.includes("banco")) return <Landmark size={12} className="text-blue-500" />;
//     if (t.includes("nequi") || t.includes("daviplata")) return <Smartphone size={12} className="text-purple-500" />;
//     return <CreditCard size={12} className="text-gray-400" />;
//   };

//   const handleToggleEstado = (anticipo) => {
//     toggleAnticipoEstado(anticipo);
//     const newState = anticipo.estado === "VIGENTE" ? "ARCHIVADO" : "VIGENTE";
//     setNotificationMessage(`Anticipo de ${anticipo.tercero} marcado como ${newState}.`);
//     setTimeout(() => setNotificationMessage(null), 4000);
//   };

//   const handleOpenRemisiones = (lista) => {
//     setSelectedRemisiones(lista);
//     setIsModalOpen(true);
//   };

//   const handleFlechaClick = (numRemision) => {
//     setIsModalOpen(false);
//     if (onVerDetalleRemision) onVerDetalleRemision(numRemision);
//   };

//   const renderBotonRemisionesUnico = (remisionesRaw) => {
//     if (!remisionesRaw || remisionesRaw === "[]" || remisionesRaw === "") {
//       return <span className="text-gray-300 text-[10px] font-black uppercase tracking-tighter italic">Sin remisiones</span>;
//     }
//     let lista = [];
//     try {
//       lista = typeof remisionesRaw === 'string' ? JSON.parse(remisionesRaw.replace(/'/g, '"')) : remisionesRaw;
//     } catch (e) {
//       lista = String(remisionesRaw).replace(/[\[\]\s]/g, '').split(',').filter(x => x !== "");
//     }
//     if (lista.length === 0) return <span className="text-gray-300 text-[10px] font-black tracking-tighter">Sin remisiones</span>;

//     return (
//       <div className="flex justify-end">
//         <button
//           onClick={() => handleOpenRemisiones(lista)}
//           className="group/rem px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[10px] font-black hover:bg-orange-600 hover:text-white hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
//         >
//           <Tags size={14} className="text-orange-400 group-hover/rem:text-white transition-colors" />
//           <span>{lista.length} Rem.</span>
//         </button>
//       </div>
//     );
//   };

//   const filteredData = data.filter((item) => {
//     const lowerTerm = searchTerm.toLowerCase();
//     return (
//       item.tercero?.toLowerCase().includes(lowerTerm) ||
//       item.noComprobante?.toString().includes(lowerTerm) ||
//       item.cedula?.toString().includes(lowerTerm)
//     );
//   });

//   return (
//     <div className="bg-gray-50/50 rounded-3xl p-1 border border-gray-200 shadow-sm relative overflow-hidden font-sans">
      
//       <SuccessNotification message={notificationMessage} onClose={() => setNotificationMessage(null)} />

//       <RemisionesModal 
//         isOpen={isModalOpen} 
//         onClose={() => setIsModalOpen(false)} 
//         listaRemisiones={selectedRemisiones} 
//         onVerRemisionIndividual={handleFlechaClick}
//       />

//       {/* HEADER */}
//       <div className="bg-white rounded-t-[22px] px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//         <div className="group cursor-default">
//           <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
//             <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
//               <Archive size={22} />
//             </div>
//             Historial de Anticipos
//           </h2>
//           <p className="text-gray-400 text-sm font-medium mt-1 ml-14">Trazabilidad de ingresos y saldos</p>
//         </div>

//         <div className="relative group">
//           <input
//             type="text"
//             placeholder="Buscar por cliente o recibo..."
//             className="w-full lg:w-96 pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-semibold outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//         </div>
//       </div>

//       {/* TABLA */}
//       <div className="overflow-x-auto bg-white rounded-b-[22px]">
//         <table className="min-w-full border-separate border-spacing-0">
//           <thead>
//             <tr className="bg-gray-50/50">
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Estado</th>
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Documento</th>
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Cliente</th>
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Detalle</th>
//               <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Valor</th>
//               <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Vínculos</th>
//               <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Saldo</th>
//               <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Acción</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {filteredData.map((anticipo) => (
//               <tr key={anticipo.id} className="group hover:bg-blue-50/40 transition-all duration-200">
//                 <td className="px-6 py-5 whitespace-nowrap">
//                   <button 
//                     onClick={() => handleToggleEstado(anticipo)}
//                     className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 transition-all cursor-pointer active:scale-90 ${
//                       anticipo.estado === "VIGENTE" 
//                         ? "bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-600 hover:text-white" 
//                         : "bg-amber-50 text-amber-600 ring-amber-200 hover:bg-amber-600 hover:text-white"
//                     }`}
//                   >
//                     {anticipo.estado}
//                   </button>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex flex-col group/doc">
//                     <span className="text-blue-600 font-black text-sm group-hover/doc:translate-x-1 transition-transform cursor-default">#{anticipo.noComprobante}</span>
//                     <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1 mt-1">
//                       <Calendar size={12} /> {anticipo.fecha}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-sm border border-white shadow-sm group-hover:scale-110 transition-transform">
//                       {getInitials(anticipo.tercero)}
//                     </div>
//                     <div className="flex flex-col">
//                       <span className="text-gray-800 font-bold text-sm uppercase truncate max-w-[150px] leading-tight">
//                         {anticipo.tercero}
//                       </span>
//                       <span className="text-gray-400 text-[11px] font-medium">{anticipo.cedula}</span>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex flex-col">
//                     <span className="text-gray-600 text-[11px] font-medium truncate max-w-[130px] italic">"{anticipo.concepto}"</span>
//                     <span className="text-[10px] text-gray-500 font-black uppercase mt-1.5 flex items-center gap-1.5">
//                       {renderTipoPagoIcon(anticipo.tipoPago)}
//                       {anticipo.tipoPago}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="px-4 py-5 text-right font-black text-gray-700 whitespace-nowrap">
//                   {formatCurrency(anticipo.valorAnticipo)}
//                 </td>
//                 <td className="px-4 py-5 text-right">
//                   {renderBotonRemisionesUnico(anticipo.remisiones)}
//                 </td>
//                 <td className="px-4 py-5 text-right">
//                   <span className={`text-sm font-black px-2.5 py-1.5 rounded-xl transition-all ${
//                     (anticipo.saldo || 0) > 0 
//                       ? "text-blue-700 bg-blue-50 shadow-sm ring-1 ring-blue-100" 
//                       : "text-gray-400 bg-gray-50 opacity-60"
//                   }`}>
//                     {formatCurrency(anticipo.saldo)}
//                   </span>
//                 </td>
//                 <td className="px-6 py-5 text-center">
//                   <button 
//                     onClick={() => onVerAnticipo(anticipo.noComprobante)} 
//                     className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90 cursor-pointer shadow-sm hover:shadow-blue-100"
//                   >
//                     <Eye size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* FOOTER */}
//       <div className="bg-white px-8 py-5 text-[11px] text-gray-400 font-bold flex justify-between items-center rounded-b-3xl border-t border-gray-100">
//         <div className="flex gap-4 items-center">
//           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
//             <Receipt size={14} className="text-blue-500" /> 
//             <span className="text-gray-600">{filteredData.length}</span> Registros
//           </div>
//           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
//             <Calculator size={14} className="text-emerald-500" /> Totales Actualizados
//           </div>
//         </div>
//         <div className="text-gray-300 tracking-widest uppercase flex items-center gap-2 hover:text-blue-400 transition-colors cursor-default">
//           SISTEMA GESTIÓN <ChevronRight size={14} /> <span className="text-gray-400">ANTICIPOS</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { 
  Archive, Search, CheckCircle, Calendar, 
  CreditCard, Eye, Tags, ChevronRight, 
  Receipt, X, FileText, ArrowRight, Calculator,
  Banknote, Landmark, Smartphone
} from "lucide-react"; 

// --- MINI COMPONENTE: NOTIFICACIÓN ---
const SuccessNotification = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 top-6 max-w-md mx-auto z-110 px-4 animate-in fade-in slide-in-from-top-8 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl p-4 flex items-center justify-between ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-full text-white shadow-lg shadow-green-200">
            <CheckCircle size={18} />
          </div>
          <p className="text-sm font-bold text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// --- MINI COMPONENTE: MODAL DE DETALLES DE REMISIONES ---
const RemisionesModal = ({ isOpen, onClose, listaRemisiones, onVerRemisionIndividual }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Tags size={24} />
              Remisiones Vinculadas
            </h3>
            <p className="text-orange-100 text-xs font-medium mt-1">Documentos asociados a este anticipo</p>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors cursor-pointer hover:rotate-90 duration-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {listaRemisiones.map((num, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-orange-600 group-hover:scale-110 transition-transform duration-200">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Número</span>
                    <p className="text-lg font-black text-gray-800">REM-{num}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onVerRemisionIndividual(num)}
                  className="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all active:scale-90 cursor-pointer hover:shadow-orange-200 hover:shadow-lg"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Total: {listaRemisiones.length} documentos
          </p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function AnticiposArchived({ data, toggleAnticipoEstado, onVerAnticipo, onVerDetalleRemision }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRemisiones, setSelectedRemisiones] = useState([]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const renderTipoPagoIcon = (tipo) => {
    const t = tipo?.toLowerCase() || "";
    if (t.includes("efectivo")) return <Banknote size={12} className="text-emerald-500" />;
    if (t.includes("transferencia") || t.includes("banco")) return <Landmark size={12} className="text-blue-500" />;
    if (t.includes("nequi") || t.includes("daviplata")) return <Smartphone size={12} className="text-purple-500" />;
    return <CreditCard size={12} className="text-gray-400" />;
  };

  const handleToggleEstado = (anticipo) => {
    toggleAnticipoEstado(anticipo);
    const newState = anticipo.estado === "VIGENTE" ? "ARCHIVADO" : "VIGENTE";
    setNotificationMessage(`Anticipo de ${anticipo.tercero} marcado como ${newState}.`);
    setTimeout(() => setNotificationMessage(null), 4000);
  };

  const handleOpenRemisiones = (lista) => {
    setSelectedRemisiones(lista);
    setIsModalOpen(true);
  };

  const handleFlechaClick = (numRemision) => {
    setIsModalOpen(false);
    if (onVerDetalleRemision) onVerDetalleRemision(numRemision);
  };

  const renderBotonRemisionesUnico = (remisionesRaw) => {
    if (!remisionesRaw || remisionesRaw === "[]" || remisionesRaw === "") {
      return <span className="text-gray-300 text-[10px] font-black uppercase tracking-tighter italic">Sin remisiones</span>;
    }
    let lista = [];
    try {
      lista = typeof remisionesRaw === 'string' ? JSON.parse(remisionesRaw.replace(/'/g, '"')) : remisionesRaw;
    } catch (e) {
      lista = String(remisionesRaw).replace(/[\[\]\s]/g, '').split(',').filter(x => x !== "");
    }
    if (lista.length === 0) return <span className="text-gray-300 text-[10px] font-black tracking-tighter">Sin remisiones</span>;

    return (
      <div className="flex justify-end">
        <button
          onClick={() => handleOpenRemisiones(lista)}
          className="group/rem px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[10px] font-black hover:bg-orange-600 hover:text-white hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Tags size={14} className="text-orange-400 group-hover/rem:text-white transition-colors" />
          <span>{lista.length} Rem.</span>
        </button>
      </div>
    );
  };

  const filteredData = data.filter((item) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      item.tercero?.toLowerCase().includes(lowerTerm) ||
      item.noComprobante?.toString().includes(lowerTerm) ||
      item.cedula?.toString().includes(lowerTerm)
    );
  });

  return (
    <div className="bg-gray-50/50 rounded-3xl p-1 border border-gray-200 shadow-sm relative overflow-hidden font-sans">
      
      <SuccessNotification message={notificationMessage} onClose={() => setNotificationMessage(null)} />

      <RemisionesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        listaRemisiones={selectedRemisiones} 
        onVerRemisionIndividual={handleFlechaClick}
      />

      <div className="bg-white rounded-t-[22px] px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="group cursor-default">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
              <Archive size={22} />
            </div>
            Historial de Anticipos
          </h2>
          <p className="text-gray-400 text-sm font-medium mt-1 ml-14">Trazabilidad de ingresos y saldos</p>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar por cliente o recibo..."
            className="w-full lg:w-96 pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-semibold outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-b-[22px]">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Estado</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Documento</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Cliente</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Detalle</th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Valor</th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Vínculos</th>
              <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Saldo</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map((anticipo) => (
              <tr key={anticipo.id} className="group hover:bg-blue-50/40 transition-all duration-200">
                <td className="px-6 py-5 whitespace-nowrap">
                  <button 
                    onClick={() => handleToggleEstado(anticipo)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 transition-all cursor-pointer active:scale-90 ${
                      anticipo.estado === "VIGENTE" 
                        ? "bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-600 hover:text-white" 
                        : "bg-amber-50 text-amber-600 ring-amber-200 hover:bg-amber-600 hover:text-white"
                    }`}
                  >
                    {anticipo.estado}
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col group/doc">
                    <span className="text-blue-600 font-black text-sm group-hover/doc:translate-x-1 transition-transform cursor-default">#{anticipo.noComprobante}</span>
                    <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {anticipo.fecha}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 group/avatar">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 
                                    flex items-center justify-center text-gray-600 font-black text-sm 
                                    border border-white shadow-sm 
                                    group-hover/avatar:scale-110 group-hover/avatar:rotate-3 
                                    group-hover/avatar:shadow-md group-hover/avatar:from-blue-50 
                                    group-hover/avatar:text-blue-600 transition-all duration-300">
                      {getInitials(anticipo.tercero)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-bold text-sm uppercase truncate max-w-[150px] leading-tight group-hover/avatar:text-blue-700 transition-colors">
                        {anticipo.tercero}
                      </span>
                      <span className="text-gray-400 text-[11px] font-medium">{anticipo.cedula}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-[11px] font-medium truncate max-w-[130px] italic">"{anticipo.concepto}"</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase mt-1.5 flex items-center gap-1.5">
                      {renderTipoPagoIcon(anticipo.tipoPago)}
                      {anticipo.tipoPago}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5 text-right font-black text-gray-700 whitespace-nowrap">
                  {formatCurrency(anticipo.valorAnticipo)}
                </td>
                <td className="px-4 py-5 text-right">
                  {renderBotonRemisionesUnico(anticipo.remisiones)}
                </td>
                <td className="px-4 py-5 text-right">
                  <span className={`text-sm font-black px-2.5 py-1.5 rounded-xl transition-all ${
                    (anticipo.saldo || 0) > 0 
                      ? "text-blue-700 bg-blue-50 shadow-sm ring-1 ring-blue-100" 
                      : "text-gray-400 bg-gray-50 opacity-60"
                  }`}>
                    {formatCurrency(anticipo.saldo)}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => onVerAnticipo(anticipo.noComprobante)} 
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90 cursor-pointer shadow-sm hover:shadow-blue-100"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white px-8 py-5 text-[11px] text-gray-400 font-bold flex justify-between items-center rounded-b-3xl border-t border-gray-100">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Receipt size={14} className="text-blue-500" /> 
            <span className="text-gray-600">{filteredData.length}</span> Registros
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Calculator size={14} className="text-emerald-500" /> Totales Actualizados
          </div>
        </div>
        <div className="text-gray-300 tracking-widest uppercase flex items-center gap-2 hover:text-blue-400 transition-colors cursor-default">
          SISTEMA GESTIÓN <ChevronRight size={14} /> <span className="text-gray-400">ANTICIPOS</span>
        </div>
      </div>
    </div>
  );
}
