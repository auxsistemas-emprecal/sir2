import React, { useState, useEffect } from "react";
import { fetchCuadresCaja } from "../assets/services/apiService";
import { Calendar, Eye, Search, FileSpreadsheet } from "lucide-react";

export default function CuadreRevision({ onVerDetalle }) {
  // Estado único para la fecha de búsqueda
  const [fechaFiltro, setFechaFiltro] = useState(""); 
  const [cuadres, setCuadres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Consultar al cargar si deseas, aunque es mejor esperar a que el usuario elija fecha
  useEffect(() => {
    // Si quieres que cargue algo por defecto (ej. hoy), podrías ponerlo aquí
  }, []);

  const consultar = async () => {
    if (!fechaFiltro) {
      alert("Por favor selecciona una fecha para consultar.");
      return;
    }
    setLoading(true);
    try {
      // Enviamos el parámetro único que espera el backend
      const data = await fetchCuadresCaja(fechaFiltro);
      console.log(data);
      
      setCuadres(data);
    } catch (error) {
      console.error("Error al consultar:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    const numero = Number(valor) || 0; 
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numero);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="text-purple-600" size={28} />
            Revisión de Cuadres de Caja
          </h2>
          <p className="text-slate-500 text-sm">Consulta el histórico y detalles de cierres diarios mediante fecha de búsqueda.</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-wider font-sans">
            Seleccionar Fecha de Búsqueda
          </label>
          <input 
            type="date" 
            className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:border-purple-500 transition-colors"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          />
        </div>
        
        <button 
          onClick={consultar}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 h-[42px]"
        >
          {loading ? "Cargando..." : <><Search size={18} /> Buscar Registros</>}
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-4 text-xs font-bold uppercase tracking-widest">Fecha / Marca</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Gastos</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Efec. Ventas</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Recibos</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Crédito</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Transf.</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest bg-purple-900 text-right">Total Efec.</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest bg-slate-900 text-emerald-400 text-right">Neto Día</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cuadres.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-700">{c.fecha}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.marcaTemporal}</div>
                </td>
                <td className="p-4 text-red-500 font-medium text-right">{formatearMoneda(c.gastos_diarios)}</td>
                <td className="p-4 text-slate-600 font-medium text-right">{formatearMoneda(c.efectivo_ventas)}</td>
                <td className="p-4 text-slate-600 font-medium text-right">{formatearMoneda(c.recibos_caja)}</td>
                <td className="p-4 text-amber-600 font-medium text-right">{formatearMoneda(c.credito)}</td>
                <td className="p-4 text-blue-600 font-medium text-right">{formatearMoneda(c.transferencia)}</td>
                <td className="p-4 font-bold text-purple-700 bg-purple-50/30 text-right">{formatearMoneda(c.total_efectivo_caja)}</td>
                <td className="p-4 font-black text-emerald-700 bg-emerald-50/30 text-right">{formatearMoneda(c.total_neto_dia)}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onVerDetalle(c)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                    title="Ver detalle completo"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {cuadres.length === 0 && !loading && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <Calendar size={40} className="text-slate-200" />
            <p>No se encontraron registros para la fecha seleccionada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { fetchCuadresCaja } from "../assets/services/apiService";
// import { Calendar, Eye, Search, FileSpreadsheet } from "lucide-react";
// import { c } from "@vitejs/plugin-rsc/browser-_r3sM3qR";

// export default function CuadreRevision({ onVerDetalle }) {
// //   const [fechaInicio, setFechaInicio] = useState("");
// //   const [fechaFin, setFechaFin] = useState("");
//   const [fechaFiltro, setFechaFiltro] = useState(""); // Un solo estado de fecha 
//   const [cuadres, setCuadres] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Consultar al cargar el componente (opcional, puedes dejarlo vacío si prefieres que solo busque al dar clic)
//   useEffect(() => {consultar();}, []);

//   const consultar = async () => {
//     setLoading(true);
//     const data = await fetchCuadresCaja(fechaInicio, fechaFin);
//     setCuadres(data);
//     setLoading(false);
//   };

// //   const formatearMoneda = (valor) => {
// //     return new Intl.NumberFormat('es-CO', {
// //       style: 'currency',
// //       currency: 'COP',
// //       minimumFractionDigits: 0
// //     }).format(valor || 0);
// //   };
//     const formatearMoneda = (valor) => {
//       // Convertimos a número por si viene como string, y usamos 0 si es null/undefined
//       const numero = Number(valor) || 0; 
        
//       return new Intl.NumberFormat('es-CO', {
//         style: 'currency',
//         currency: 'COP',
//         minimumFractionDigits: 0
//       }).format(numero);
//     };

//   return (
//     <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
//       {/* Encabezado */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <FileSpreadsheet className="text-purple-600" size={28} />
//             Revisión de Cuadres de Caja
//           </h2>
//           <p className="text-slate-500 text-sm">Consulta el histórico y detalles de cierres diarios.</p>
//         </div>
//       </div>

//       {/* Barra de Filtros */}
//       <div className="flex flex-wrap gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100 items-end">
//         <div className="flex-1 min-w-[200px]">
//           <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">Fecha Inicio</label>
//           <input 
//             type="date" 
//             className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:border-purple-500 transition-colors"
//             value={fechaInicio}
//             onChange={(e) => setFechaInicio(e.target.value)}
//           />
//         </div>
//         <div className="flex-1 min-w-[200px]">
//           <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">Fecha Fin</label>
//           <input 
//             type="date" 
//             className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:border-purple-500 transition-colors"
//             value={fechaFin}
//             onChange={(e) => setFechaFin(e.target.value)}
//           />
//         </div>
//         <button 
//           onClick={consultar}
//           disabled={loading}
//           className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
//         >
//           {loading ? "Cargando..." : <><Search size={18} /> Buscar Registros</>}
//         </button>
//       </div>

//       {/* Tabla de Resultados */}
//       <div className="overflow-x-auto border border-slate-100 rounded-xl">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-slate-800 text-white">
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Fecha / Marca</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Gastos</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Efec. Ventas</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Recibos</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Crédito</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest">Transf.</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest bg-purple-900">Total Efec.</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest bg-slate-900 text-emerald-400">Neto Día</th>
//               <th className="p-4 text-xs font-bold uppercase tracking-widest text-center">Acción</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {cuadres.map((c) => (
//               <tr key={c.id} className="hover:bg-slate-50 transition-colors">
//                 <td className="p-4">
//                   <div className="font-bold text-slate-700">{c.fecha}</div>
//                   <div className="text-[10px] text-slate-400 font-mono">{c.marcaTemporal}</div>
//                 </td>
//                 <td className="p-4 text-red-500 font-medium">{formatearMoneda(c.gastos_diarios)}</td>
//                 <td className="p-4 text-slate-600 font-medium">{formatearMoneda(c.efectivo_ventas)}</td>
//                 <td className="p-4 text-slate-600 font-medium">{formatearMoneda(c.recibos_caja)}</td>
//                 <td className="p-4 text-amber-600 font-medium">{formatearMoneda(c.credito)}</td>
//                 <td className="p-4 text-blue-600 font-medium">{formatearMoneda(c.transferencia)}</td>
//                 <td className="p-4 font-bold text-purple-700 bg-purple-50/30">{formatearMoneda(c.total_efectivo_caja)}</td>
//                 <td className="p-4 font-black text-emerald-700 bg-emerald-50/30">{formatearMoneda(c.total_neto_dia)}</td>
//                 <td className="p-4 text-center">
//                   <button 
//                     onClick={() => onVerDetalle(c)}
//                     className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
//                     title="Ver detalle completo"
//                   >
//                     <Eye size={20} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
        
//         {cuadres.length === 0 && !loading && (
//           <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
//             <Calendar size={40} className="text-slate-200" />
//             <p>No se encontraron registros en este rango de fechas.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

