import React, { useState, useMemo } from 'react';
// Añadimos BarChart3 que faltaba en tu versión anterior
import { Search, FileText, BarChart3, Calendar } from 'lucide-react';
import { fetchTotalMaterialPorTercero, fetchTercerosBusqueda } from '../assets/services/apiService';
import InputAutosuggest from './InputAutosuggest';

const ReporteCompras = () => {
  const [filtros, setFiltros] = useState({ tercero: '', inicio: '', fin: '' });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // El InputAutosuggest requiere este manejo de evento
  const handleTerceroChange = (e) => {
    setFiltros(prev => ({ ...prev, tercero: e.target.value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filtros.tercero || !filtros.inicio || !filtros.fin) return;
    setLoading(true);
    const data = await fetchTotalMaterialPorTercero(filtros.tercero, filtros.inicio, filtros.fin);
    setResultados(data);
    setLoading(false);
  };

  const resumen = useMemo(() => {
    let m3Total = 0;
    const materiales = {};
    resultados.forEach(item => {
      const vol = Number(item.cubicaje) || 0;
      const val = Number(item.total) || 0;
      const mat = item.material || 'General';
      m3Total += vol;
      if (!materiales[mat]) materiales[mat] = { m3: 0, valor: 0 };
      materiales[mat].m3 += vol;
      materiales[mat].valor += val;
    });
    return { m3Total, materiales };
  }, [resultados]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100">
        <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          <Search size={22} className="text-emerald-600" /> Reporte de Compras
        </h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div>
            <InputAutosuggest
                label="Tercero / Cliente"
                name="tercero"
                value={filtros.tercero}
                onChange={handleTerceroChange}
                searchEndpoint={fetchTercerosBusqueda} // <--- CLAVE: Nombre exacto
                textSuggestor="nombre"
                itemsKeys="id_tercero"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Desde</label>
            <div className="relative">
               <input type="date" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Hasta</label>
            <input type="date" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              value={filtros.fin} onChange={e => setFiltros({...filtros, fin: e.target.value})} required />
          </div>

          <button type="submit" className="h-[45px] mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
            disabled={loading}>
            {loading ? "Consultando..." : "Generar Reporte"}
          </button>
        </form>
      </div>

      {resultados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cuadro Resumen */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <BarChart3 size={20} className="text-emerald-400" /> Resumen de Material
            </h3>
            <div className="mb-6">
              <p className="text-slate-400 text-sm">Cubicaje Total</p>
              <p className="text-4xl font-black">{resumen.m3Total.toFixed(2)} m³</p>
            </div>
            <div className="space-y-4">
              {Object.entries(resumen.materiales).map(([nom, d]) => (
                <div key={nom} className="flex justify-between items-center text-sm">
                  <span>{nom} ({d.m3.toFixed(1)} m³)</span>
                  <span className="font-bold text-emerald-400">${d.valor.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Detalle */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex items-center gap-2">
              <FileText size={18} /> Historial de Remisiones
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4 border-b">Doc.</th>
                    <th className="p-4 border-b">Fecha</th>
                    <th className="p-4 border-b">Material</th>
                    <th className="p-4 border-b text-right">Cantidad</th>
                    <th className="p-4 border-b text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultados.map((res, i) => (
                    <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="p-4 font-bold text-emerald-700">REM-{res.remision}</td>
                      <td className="p-4 text-gray-600">{res.fecha}</td>
                      <td className="p-4">{res.material}</td>
                      <td className="p-4 text-right">{res.cubicaje} m³</td>
                      <td className="p-4 text-right font-bold text-slate-800">${Number(res.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteCompras;

// import React, { useState, useMemo } from 'react';
// import { Search, FileText, BarChart3, Calendar, User } from 'lucide-react';
// import { fetchTotalMaterialPorTercero } from '../assets/services/apiService';

// const ReporteCompras = () => {
//   const [filtros, setFiltros] = useState({ tercero: '', inicio: '', fin: '' });
//   const [resultados, setResultados] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const data = await fetchMovimientosPorFiltro(filtros.tercero, filtros.inicio, filtros.fin);
//     setResultados(data);
//     setLoading(false);
//   };

//   // Cálculos de agregación para el cuadro de resumen
//   const resumen = useMemo(() => {
//     const totales = { m3Total: 0, materiales: {} };
    
//     resultados.forEach(item => {
//       const vol = Number(item.cubicaje) || 0;
//       const val = Number(item.total) || 0;
//       const mat = item.material || 'General';

//       totales.m3Total += vol;
//       if (!totales.materiales[mat]) {
//         totales.materiales[mat] = { m3: 0, valor: 0 };
//       }
//       totales.materiales[mat].m3 += vol;
//       totales.materiales[mat].valor += val;
//     });
//     return totales;
//   }, [resultados]);

//   return (
//     <div className="space-y-6 animate-in fade-in duration-500">
//       {/* Formulario de Búsqueda */}
//       <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100">
//         <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
//           <Search size={20} /> Consulta de Compras por Rango
//         </h2>
//         <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase">Tercero</label>
//             <div className="relative mt-1">
//               <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
//               <input type="text" className="pl-9 w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
//                 placeholder="Nombre..." value={filtros.tercero}
//                 onChange={e => setFiltros({...filtros, tercero: e.target.value})} required />
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase">Fecha Inicio</label>
//             <input type="date" className="mt-1 w-full p-2 border rounded-lg outline-none"
//               value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} required />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase">Fecha Fin</label>
//             <input type="date" className="mt-1 w-full p-2 border rounded-lg outline-none"
//               value={filtros.fin} onChange={e => setFiltros({...filtros, fin: e.target.value})} required />
//           </div>
//           <button type="submit" disabled={loading}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-all">
//             {loading ? "Cargando..." : "Buscar Movimientos"}
//           </button>
//         </form>
//       </div>

//       {resultados.length > 0 && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Cuadro 1: Resumen Agregado */}
//           <div className="lg:col-span-1 space-y-4">
//             <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
//                 <BarChart3 size={20} /> Resumen Total
//               </h3>
//               <div className="mb-6">
//                 <span className="text-emerald-300 text-sm block">Volumen Total Comprado</span>
//                 <span className="text-4xl font-black">{resumen.m3Total.toFixed(2)} m³</span>
//               </div>
//               <div className="space-y-3">
//                 {Object.entries(resumen.materiales).map(([nombre, datos]) => (
//                   <div key={nombre} className="flex justify-between border-t border-emerald-800 pt-2 text-sm">
//                     <span>{nombre} ({datos.m3.toFixed(1)} m³)</span>
//                     <span className="font-bold">${datos.valor.toLocaleString()}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Cuadro 2: Detalle de Facturas/Remisiones */}
//           <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//             <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex items-center gap-2">
//               <FileText size={18} /> Detalle de Documentos
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//                   <tr>
//                     <th className="p-3">Doc / Remisión</th>
//                     <th className="p-3">Fecha</th>
//                     <th className="p-3 text-right">Cantidad</th>
//                     <th className="p-3 text-right">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {resultados.map((item, idx) => (
//                     <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
//                       <td className="p-3 font-semibold text-emerald-700">REM-{item.remision}</td>
//                       <td className="p-3 text-gray-500">{item.fecha}</td>
//                       <td className="p-3 text-right font-medium">{item.cubicaje} m³</td>
//                       <td className="p-3 text-right font-bold">${Number(item.total).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReporteCompras;