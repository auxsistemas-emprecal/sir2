import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { fetchGastosDetalleHistorico } from "../assets/services/apiService";

export default function CuadreCajaDetalles({ datos, onBack }) {
  const [gastosDetalle, setGastosDetalle] = useState([]);
  const [loadingGastos, setLoadingGastos] = useState(true);

  useEffect(() => {
    const cargarGastos = async () => {
      if (datos?.fecha && datos?.marcaTemporal) {
        setLoadingGastos(true);
        try {
          const res = await fetchGastosDetalleHistorico(datos.fecha, datos.created_at);
          setGastosDetalle(res || []);
        } catch (error) {
          console.error("Error al cargar detalles de gastos:", error);
        } finally {
          setLoadingGastos(false);
        }
      }
    };
    cargarGastos();
  }, [datos]);

  if (!datos) return null;

  const f = (val) => (Number(val) || 0).toLocaleString("es-CO");
  const billetes = [100000, 50000, 20000, 10000, 5000, 2000];
  const arqueoValores = {
    100000: datos.billete_100k,
    50000: datos.billete_50k,
    20000: datos.billete_20k,
    10000: datos.billete_10k,
    5000: datos.billete_5k,
    2000: datos.billete_2k,
  };

  const getConciliacionEstilos = () => {
    const estado = (datos.estado_caja || "").toUpperCase();
    if (estado === "CUADRADO") return { msg: "Caja Cuadrada ✅", col: "text-emerald-700" };
    if (estado === "SOBRANTE") return { msg: "Sobrante", col: "text-amber-700" };
    return { msg: "Faltante", col: "text-rose-700" };
  };

  const estilos = getConciliacionEstilos();

  return (
    <div id="cuadre-print" className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <style>
        {`
          /* ESTILOS DE TABLA DE IMPRESIÓN (IMAGEN 2) */
          .print-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; display: none; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px 8px; font-size: 11px; color: black !important; }
          .print-table th { background-color: #f8fafc !important; font-weight: bold; text-transform: uppercase; }
          
          .col-print-desc { width: 30%; }
          .col-print-nota { width: 50%; }
          .col-print-valor { width: 20%; }

          @media print {
            @page { 
              size: letter; 
              margin: 0.5cm; /* Márgenes de página mínimos */
            }
            body { background: white !important; }
            #cuadre-print { 
              padding: 0 !important; 
              margin: 0 !important;
              background: white !important; 
              width: 100% !important;
              zoom: 0.95; /* Reduce ligeramente el tamaño total para asegurar que quepa todo */
            }
            .no-print { display: none !important; }
            .print-table { display: table !important; }
            .screen-only { display: none !important; }
            
            .box-conciliacion-print { 
              border: 2px solid #000 !important; 
              padding: 10px; 
              margin-top: 15px;
              text-align: center; 
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .print-header { border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 5px; }
            .print-section-title { 
              font-weight: bold; 
              text-transform: uppercase; 
              border-left: 4px solid #000; 
              padding-left: 8px; 
              margin: 15px 0 5px 0; 
              font-size: 14px;
            }
          }
        `}
      </style>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 print-header">
        <div>
          <button onClick={onBack} className="no-print flex items-center gap-1 text-blue-600 font-bold mb-2 hover:underline">
            <ArrowLeft size={14} /> Volver
          </button>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter print:text-xl">Reporte Consolidado de Caja</h1>
          <p className="text-slate-500 font-bold text-xs">Fecha: {datos.fecha} | Folio: #{datos.id}</p>
        </div>
        <button onClick={() => window.print()} className="no-print flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-black shadow-lg">
          <Printer size={18} /> IMPRIMIR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* TABLA DE GASTOS */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <h3 className="print-section-title screen-only bg-emerald-600 p-3 text-white text-xs font-bold uppercase tracking-widest">📌 Registro de Gastos</h3>
            <h3 className="hidden print:block print-section-title">1. Detalle de Egresos</h3>
            
            <table className="print-table">
              <thead>
                <tr>
                  <th className="col-print-desc">Descripción</th>
                  <th className="col-print-nota">Nota</th>
                  <th className="col-print-valor text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastosDetalle.map((g) => (
                  <tr key={g.id}>
                    <td className="uppercase">{g.descripcion}</td>
                    <td className="italic">{g.observacion || "-"}</td>
                    <td className="text-right font-bold">${f(g.valor)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td colSpan="2" className="text-right uppercase">Total Egresos</td>
                  <td className="text-right">${f(datos.gastos_diarios)}</td>
                </tr>
              </tbody>
            </table>

            <div className="screen-only">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px]">
                  <tr><th className="p-3 text-left">Descripción</th><th className="p-3 text-left">Nota</th><th className="p-3 text-right">Monto</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {gastosDetalle.map((g) => (
                    <tr key={g.id}>
                      <td className="p-3 font-bold text-slate-700">{g.descripcion}</td>
                      <td className="p-3 text-slate-500 italic text-[11px]">{g.observacion || "-"}</td>
                      <td className="p-3 text-right font-black text-emerald-600">${f(g.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ARQUEO FÍSICO */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 print:border-none print:p-0">
            <h3 className="print-section-title text-blue-700 print:text-black">2. Arqueo Físico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
              {billetes.map((den) => (
                <div key={den} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-black print:rounded-none">
                  <span className="font-bold text-slate-500 text-xs print:text-black">${den.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-center bg-white border border-slate-200 rounded-lg font-black text-blue-600 py-1 print:border-black print:text-black">
                        {arqueoValores[den]}
                    </div>
                    <span className="w-20 text-right text-[10px] font-black text-slate-400 print:text-black">${f(den * arqueoValores[den])}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl md:col-span-2 border border-blue-100 print:bg-white print:border-black print:rounded-none">
                <span className="font-black text-blue-800 text-[10px] uppercase print:text-black">Total Monedas</span>
                <span className="font-black text-blue-700 text-lg print:text-black">${f(datos.monedas_total)}</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white print:bg-white print:text-black print:border-2 print:border-black">
              <span className="text-[10px] font-black uppercase tracking-widest">Efectivo Real</span>
              <span className="text-3xl font-black font-mono tracking-tighter">${f(datos.total_arqueo)}</span>
            </div>
          </section>
        </div>

        {/* LATERAL */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-2 print:border-black print:rounded-none">
            <div className="bg-slate-800 p-3 text-white text-center print:bg-slate-100 print:text-black">
              <h3 className="font-bold text-[10px] uppercase tracking-widest">3. Datos Sistema</h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between"><span>Ventas Efectivo</span><span className="font-bold">${f(datos.efectivo_ventas)}</span></div>
              <div className="flex justify-between"><span>Recibos Caja</span><span className="font-bold text-blue-600 print:text-black">${f(datos.recibos_caja)}</span></div>
              <div className="flex justify-between italic border-t pt-2 border-slate-50 print:border-black"><span>Créditos</span><span className="font-bold">${f(datos.credito)}</span></div>
              <div className="flex justify-between italic border-b pb-2 border-slate-50 print:border-black"><span>Transferencias</span><span className="font-bold">${f(datos.transferencia)}</span></div>
              <div className="flex justify-between border-b pb-2 border-slate-50 print:border-black"><span>(-) Gastos</span><span className="font-bold text-rose-500 print:text-black">-${f(datos.gastos_diarios)}</span></div>
              <div className="text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase print:text-black">Efectivo Esperado</span>
                <p className="text-3xl font-black text-emerald-600 print:text-black font-mono tracking-tighter">${f(datos.efectivo_esperado_sistema)}</p>
              </div>
            </div>
          </section>

          {/* CONCILIACIÓN FINAL */}
          <div className="box-conciliacion-print print:block">
            <h2 className="text-sm font-bold uppercase mb-1 print:text-black">Auditoría</h2>
            <p className={`text-xl font-black uppercase ${estilos.col} print:text-black mb-1`}>{estilos.msg}</p>
            <div className="bg-slate-50 print:bg-white p-3 rounded-xl border border-slate-200 print:border-none">
                <p className="text-[9px] font-bold text-slate-400 uppercase print:text-black">Diferencia</p>
                <p className={`text-4xl font-black ${estilos.col} print:text-black font-mono tracking-tighter`}>
                  ${f(Math.abs(datos.diferencia_valor))}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { ArrowLeft, Printer } from "lucide-react";
// // Asegúrate de que esta función en apiService use getAuthHeaders()
// import { fetchGastosDetalleHistorico } from "../assets/services/apiService";

// export default function CuadreCajaDetalles({ datos, onBack }) {
//   const [gastosDetalle, setGastosDetalle] = useState([]);
//   const [loadingGastos, setLoadingGastos] = useState(true);

//   // Carga de gastos detallados usando el timesnap
//   useEffect(() => {
//     const cargarGastos = async () => {
//       if (datos?.fecha && datos?.marcaTemporal) {
//         setLoadingGastos(true);
//         try {
//           const res = await fetchGastosDetalleHistorico(datos.fecha, datos.marcaTemporal);
//           setGastosDetalle(res);
//         } catch (error) {
//           console.error("Error al cargar detalles de gastos:", error);
//         } finally {
//           setLoadingGastos(false);
//         }
//       }
//     };
//     cargarGastos();
//   }, [datos]);

//   if (!datos) return null;

//   const f = (val) => (Number(val) || 0).toLocaleString("es-CO");
//   const billetes = [100000, 50000, 20000, 10000, 5000, 2000];
//   const arqueoValores = {
//     100000: datos.billete_100k,
//     50000: datos.billete_50k,
//     20000: datos.billete_20k,
//     10000: datos.billete_10k,
//     5000: datos.billete_5k,
//     2000: datos.billete_2k,
//   };

//   const getConciliacionEstilos = () => {
//     const estado = (datos.estado_caja || "").toUpperCase();
//     if (estado === "CUADRADO") return { msg: "Caja Cuadrada ✅", col: "text-emerald-700", bg: "bg-emerald-50", bd: "border-emerald-200" };
//     if (estado === "SOBRANTE") return { msg: "Sobrante", col: "text-amber-700", bg: "bg-amber-50", bd: "border-amber-200" };
//     return { msg: "Faltante", col: "text-rose-700", bg: "bg-rose-50", bd: "border-rose-200" };
//   };

//   const estilos = getConciliacionEstilos();

//   return (
//     <div id="cuadre-print" className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
//       <style>
//         {`
//           @media print {
//             .no-print { display: none !important; }
//             body { background: white !important; }
//             #cuadre-print { 
//               visibility: visible !important; 
//               position: absolute; left: 0; top: 0; width: 100%; 
//               background: white !important;
//             }
//             #cuadre-print * { 
//               -webkit-print-color-adjust: exact !important; 
//               print-color-adjust: exact !important; 
//             }
//             .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
//             .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
//             .bg-emerald-600 { background-color: #059669 !important; color: white !important; }
//             .bg-emerald-50 { background-color: #ecfdf5 !important; }
//             .bg-rose-50 { background-color: #fff1f2 !important; }
//             .bg-slate-50 { background-color: #f8fafc !important; }
//           }
//         `}
//       </style>

//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-8">
//         <div>
//           <button onClick={onBack} className="no-print flex items-center gap-1 text-blue-600 font-bold mb-2 hover:underline">
//             <ArrowLeft size={16} /> Volver a revisión
//           </button>
//           <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
//             <span className="bg-blue-600 text-white p-2 rounded-xl no-print">💵</span>
//             Detalle de Cuadre
//           </h1>
//           <p className="text-slate-500 font-bold italic text-sm">
//             Cierre: {datos.fecha} | ID: #{datos.id}
//           </p>
//         </div>
//         <button 
//           onClick={() => window.print()} 
//           className="no-print flex items-center gap-2 bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl font-black text-slate-700 shadow-sm hover:border-blue-500 transition-all"
//         >
//           <Printer size={20} /> IMPRIMIR REPORTE
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
          
//           {/* SECCIÓN GASTOS */}
//           <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="bg-emerald-600 p-4 text-white">
//               <h3 className="text-sm font-bold uppercase tracking-widest">📌 Gastos Registrados</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-widest">
//                   <tr>
//                     <th className="p-4 text-left">Descripción</th>
//                     <th className="p-4 text-left">Nota</th>
//                     <th className="p-4 text-right">Monto</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {loadingGastos ? (
//                     <tr><td colSpan="3" className="p-8 text-center text-slate-400">Cargando...</td></tr>
//                   ) : gastosDetalle.map((g) => (
//                     <tr key={g.id}>
//                       <td className="p-4 font-bold text-slate-700 uppercase">{g.descripcion}</td>
//                       <td className="p-4 text-slate-500 italic text-xs">{g.observacion || "-"}</td>
//                       <td className="p-4 text-right font-black text-emerald-600">${f(g.valor)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="p-5 bg-emerald-50 border-t border-emerald-100 flex justify-between items-center">
//               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Total Gastos Pagados</span>
//               <span className="text-2xl font-black text-emerald-700">${f(datos.gastos_diarios)}</span>
//             </div>
//           </section>

//           {/* ARQUEO FÍSICO */}
//           <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
//             <h3 className="text-lg font-bold mb-6 text-blue-700 uppercase tracking-tight">🧾 Arqueo Físico de Billetes</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {billetes.map((den) => (
//                 <div key={den} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
//                   <span className="font-bold text-slate-500">${den.toLocaleString()}</span>
//                   <div className="flex items-center gap-3">
//                     <div className="w-16 text-center bg-white border-2 border-slate-200 rounded-xl font-black text-blue-600 py-1.5 shadow-sm text-lg">
//                         {arqueoValores[den]}
//                     </div>
//                     <span className="w-24 text-right text-[11px] font-black text-slate-400">
//                       ${f(den * arqueoValores[den])}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl md:col-span-2 border-2 border-blue-100">
//                 <span className="font-black text-blue-800 text-xs uppercase tracking-widest">Total Monedas</span>
//                 <span className="font-black text-blue-700 text-xl">${f(datos.monedas_total)}</span>
//               </div>
//             </div>
//             <div className="mt-8 p-6 bg-slate-900 rounded-3xl flex justify-between items-center text-white shadow-xl">
//               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Total Dinero Físico</span>
//               <span className="text-4xl font-black text-blue-400 font-mono">${f(datos.total_arqueo)}</span>
//             </div>
//           </section>
//         </div>

//         {/* COLUMNA LATERAL: REPORTE DEL SISTEMA */}
//         <div className="space-y-8">
//           <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="bg-slate-800 p-4 text-white text-center">
//               <h3 className="font-bold text-xs uppercase tracking-widest">Reporte del Sistema</h3>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="flex justify-between text-sm">
//                 <span className="text-slate-500">Ventas Efectivo</span>
//                 <span className="font-bold text-slate-800">${f(datos.efectivo_ventas)}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-slate-500">Recibos de Caja</span>
//                 <span className="font-bold text-blue-600">${f(datos.recibos_caja)}</span>
//               </div>
//               <div className="flex justify-between text-sm text-amber-600 font-bold border-t border-slate-50 pt-2">
//                 <span>Ventas Crédito</span>
//                 <span>${f(datos.credito)}</span>
//               </div>
//               <div className="flex justify-between text-sm text-indigo-600 font-bold border-b border-slate-50 pb-2">
//                 <span>Transferencias</span>
//                 <span>${f(datos.transferencia)}</span>
//               </div>
//               <div className="flex justify-between text-sm border-b border-slate-100 pb-4">
//                 <span className="text-slate-500 font-bold">(-) Gastos Totales</span>
//                 <span className="font-bold text-rose-500">-${f(datos.gastos_diarios)}</span>
//               </div>
//               <div className="flex flex-col pt-2 text-center">
//                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efectivo Esperado</span>
//                 <span className="text-4xl font-black text-emerald-600 tracking-tighter">
//                   ${f(datos.efectivo_esperado_sistema)}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* ESTADO DE CONCILIACIÓN */}
//           <section className={`rounded-3xl border-4 p-6 text-center ${estilos.bg} ${estilos.bd} shadow-md`}>
//             <h4 className={`text-2xl font-black mb-3 ${estilos.col} uppercase tracking-tighter`}>
//               {estilos.msg}
//             </h4>
//             <div className="bg-white/80 rounded-2xl p-5 border-2 border-white">
//               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diferencia Final</p>
//               <p className={`text-5xl font-black ${estilos.col} font-mono tracking-tighter`}>
//                 ${f(Math.abs(datos.diferencia_valor))}
//               </p>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }



////////////////////////////////////////////////////////////////////////////////////
// Es una interfas diferente pero mas estilizada 
////////////////////////////////////////////////////////////////////////////////////

// import React from "react";
// import { ArrowLeft, Printer, Banknote, ClipboardList, TrendingUp } from "lucide-react";

// // Recibe 'datos' (el objeto del endpoint) y 'onBack' (función para regresar)
// export default function CuadreCajaDetalles({ datos, onBack }) {
//   if (!datos) return null;

//   // Formateador de moneda
//   const f = (val) => new Intl.NumberFormat('es-CO', {
//     style: 'currency', currency: 'COP', minimumFractionDigits: 0
//   }).format(Number(val) || 0);

//   // Mapeo de billetes desde el JSON a la estructura de la vista
//   const billetesConfig = [
//     { label: "100.000", cant: datos.billete_100k, val: 100000 },
//     { label: "50.000", cant: datos.billete_50k, val: 50000 },
//     { label: "20.000", cant: datos.billete_20k, val: 20000 },
//     { label: "10.000", cant: datos.billete_10k, val: 10000 },
//     { label: "5.000", cant: datos.billete_5k, val: 5000 },
//     { label: "2.000", cant: datos.billete_2k, val: 2000 },
//   ];

//   return (
//     <div id="cuadre-print-detalle" className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
//       {/* BOTONES DE ACCIÓN (No se imprimen) */}
//       <div className="flex justify-between items-center mb-8 no-print">
//         <button 
//           onClick={onBack}
//           className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition-colors"
//         >
//           <ArrowLeft size={20} /> Volver a Revisión
//         </button>
//         <button 
//           onClick={() => window.print()}
//           className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 shadow-lg transition-all"
//         >
//           <Printer size={18} /> Imprimir Reporte Histórico
//         </button>
//       </div>

//       {/* HEADER DE REPORTE */}
//       <div className="mb-8 border-b pb-6">
//         <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
//           <ClipboardList className="text-purple-600" size={32} />
//           Reporte Consolidado de Caja
//         </h1>
//         <div className="flex gap-6 mt-2 text-slate-500 font-bold uppercase text-xs tracking-widest">
//             <span>Fecha: {datos.fecha}</span>
//             <span>ID Registro: #{datos.id}</span>
//             <span>Marca: {new Date(datos.marcaTemporal).toLocaleString()}</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* COLUMNA ARQUEO FISICO */}
//         <div className="space-y-6">
//           <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="bg-slate-800 p-4 text-white flex items-center gap-2">
//               <Banknote size={20} className="text-emerald-400" />
//               <h3 className="font-bold text-xs uppercase tracking-tighter">Conteo Físico Realizado</h3>
//             </div>
//             <div className="p-5 space-y-3">
//               {billetesConfig.map((b, i) => (
//                 <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
//                   <span className="font-black text-slate-400 text-[10px] italic">${b.label}</span>
//                   <div className="flex items-center gap-4">
//                     <span className="text-slate-400 text-xs">x{b.cant}</span>
//                     <span className="font-bold text-slate-700">{f(b.cant * b.val)}</span>
//                   </div>
//                 </div>
//               ))}
//               <div className="flex justify-between items-center p-3 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
//                 <span className="font-black text-slate-400 text-[10px] italic">MONEDAS TOTAL</span>
//                 <span className="font-bold text-slate-700">{f(datos.monedas_total)}</span>
//               </div>
//               <div className="mt-6 p-5 bg-purple-600 rounded-2xl text-white flex justify-between items-center shadow-md">
//                 <span className="font-bold text-xs uppercase">Total Arqueo</span>
//                 <span className="font-black text-2xl">{f(datos.total_arqueo)}</span>
//               </div>
//             </div>
//           </section>
//         </div>

//         {/* COLUMNA DATOS DE SISTEMA Y RESULTADOS */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* RESUMEN FINANCIERO */}
//           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//                 <div>
//                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Ventas Efectivo</p>
//                     <p className="text-xl font-bold text-slate-800">{f(datos.efectivo_ventas)}</p>
//                 </div>
//                 <div>
//                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Otros Recibos</p>
//                     <p className="text-xl font-bold text-slate-800">{f(datos.recibos_caja)}</p>
//                 </div>
//                 <div>
//                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Ventas Crédito</p>
//                     <p className="text-xl font-bold text-amber-600">{f(datos.credito)}</p>
//                 </div>
//                 <div>
//                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Gastos Reportados</p>
//                     <p className="text-xl font-bold text-rose-500">-{f(datos.gastos_diarios)}</p>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
//                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Efectivo Esperado en Sistema</p>
//                     <p className="text-3xl font-black text-slate-700">{f(datos.efectivo_esperado_sistema)}</p>
//                 </div>
//                 <div className={`p-6 rounded-2xl border-2 flex flex-col justify-center ${datos.estado_caja === 'Cuadrado' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
//                     <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Estado y Diferencia</p>
//                     <div className="flex justify-between items-end">
//                         <span className={`text-xl font-black italic uppercase ${datos.estado_caja === 'Cuadrado' ? 'text-emerald-600' : 'text-rose-600'}`}>
//                             {datos.estado_caja}
//                         </span>
//                         <span className="text-2xl font-bold text-slate-700">{f(datos.diferencia_valor)}</span>
//                     </div>
//                 </div>
//             </div>
//           </div>

//           {/* TOTAL NETO (UTILIDAD) */}
//           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
//             <TrendingUp className="absolute -right-6 -bottom-6 text-slate-800" size={180} />
//             <div className="relative z-10">
//                 <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Gran Total Neto del Día</p>
//                 <h2 className="text-6xl font-black tracking-tighter mb-2">{f(datos.total_neto_dia)}</h2>
//                 <p className="text-slate-400 text-sm font-medium max-w-md italic">
//                     Este valor representa el consolidado total (Efectivo + Crédito + Transferencias + Recibos) menos los gastos ejecutados en la fecha.
//                 </p>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* FOOTER PARA IMPRESIÓN (FIRMAS) */}
//       <div className="hidden print:grid grid-cols-2 gap-20 mt-20 px-10">
//         <div className="border-t border-black pt-4 text-center">
//             <p className="font-bold text-sm">Firma Responsable Caja</p>
//         </div>
//         <div className="border-t border-black pt-4 text-center">
//             <p className="font-bold text-sm">Firma Revisión / Auditoría</p>
//         </div>
//       </div>

//     </div>
//   );
// }