// import React, { useMemo, useState, useEffect } from "react";
// import Plot from "react-plotly.js";
// import {
//   fetchVentasPorFecha,
//   fetchCubicajePorMaterial,
//   fetchNotificaciones,
// } from "../assets/services/apiService";

// import NotificationBanner from "./NotificationBanner";

// import {
//   TrendingUp,
//   Users,
//   Package,
//   ArrowUpRight,
//   CreditCard,
//   ChevronRight,
//   Calendar,
//   Loader2,
//   Truck,
// } from "lucide-react";

// export default function Inicio({
//   movements = [],
//   anticipos = [],
//   terceros = [],
//   setTab,
// }) {
//   const hoy = new Date().toISOString().split("T")[0];
//   const primerDiaMes = new Date(
//     new Date().getFullYear(),
//     new Date().getMonth(),
//     1
//   )
//     .toISOString()
//     .split("T")[0];

//   const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
//   const [fechaFin, setFechaFin] = useState(hoy);
//   const [datosApi, setDatosApi] = useState([]);
//   const [datosCubicajeApi, setDatosCubicajeApi] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [notificacion, setNotificacion] = useState(null);

//   const [modoFiltroCartera, setModoFiltroCartera] = useState("mes");
//   const [mesCartera, setMesCartera] = useState(new Date().getMonth());
//   const [anioCartera, setAnioCartera] = useState(new Date().getFullYear());
//   const [fechaInicioCartera, setFechaInicioCartera] = useState(hoy);
//   const [fechaFinCartera, setFechaFinCartera] = useState(hoy);

//   const meses = [
//     "Enero",
//     "Febrero",
//     "Marzo",
//     "Abril",
//     "Mayo",
//     "Junio",
//     "Julio",
//     "Agosto",
//     "Septiembre",
//     "Octubre",
//     "Noviembre",
//     "Diciembre",
//   ];

//   useEffect(() => {
//     const cargarGraficas = async () => {
//       if (!fechaInicio || !fechaFin) return;
//       setLoading(true);
//       try {
//         const response = await fetchVentasPorFecha(fechaInicio, fechaFin);
//         setDatosApi(response || []);

//         // NUEVO: Carga de datos de cubicaje desde la API
//         const responseCubicaje = await fetchCubicajePorMaterial(
//           fechaInicio,
//           fechaFin
//         );
//         setDatosCubicajeApi(responseCubicaje || []);

//         // SINCRO: Actualiza los filtros de cartera para que coincidan con el Header
//         setFechaInicioCartera(fechaInicio);
//         setFechaFinCartera(fechaFin);
//       } catch (error) {
//         console.error("Error al cargar datos de gráficas:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     cargarGraficas();
//   }, [fechaInicio, fechaFin]);
  
// // ====================================================================
// // 🟦 NOTIICACIONES EN EL INICIO 
// // ====================================================================
//   useEffect(() => {
//       const cargarNotificacion = async () => {
//         try {
//           const data = await fetchNotificaciones();
//           if (data && data.length > 0) {
//             // Filtramos la primera que esté activa (activa === 1)
//             const activa = data.find(n => n.activa === 1);
//             setNotificacion(activa);
//           }
//         } catch (error) {
//           console.error("Error al cargar notificaciones:", error);
//         }
//       };
//       cargarNotificacion();
//     }, []);
// // ====================================================================

//   const stats = useMemo(() => {
//     // --- LÓGICA PARA INCLUIR TODOS LOS DÍAS DEL RANGO ---
//     const listaFechasCompletas = [];
//     let fechaActual = new Date(fechaInicio + "T00:00:00");
//     const fechaFinal = new Date(fechaFin + "T00:00:00");

//     while (fechaActual <= fechaFinal) {
//       listaFechasCompletas.push(fechaActual.toISOString().split("T")[0]);
//       fechaActual.setDate(fechaActual.getDate() + 1);
//     }

//     const ingresosMap = {};
//     const cantidadesMap = {};
//     datosApi.forEach((d) => {
//       const f = d.Fecha.split("T")[0];
//       ingresosMap[f] = Number(d.monto_total);
//       cantidadesMap[f] = Number(d.cantidad_remisiones);
//     });

//     const fechas = listaFechasCompletas;
//     const ingresos = fechas.map((f) => ingresosMap[f] || 0);
//     const cantidades = fechas.map((f) => cantidadesMap[f] || 0);
//     // ---------------------------------------------------

//     const activeMovements = movements.filter((m) => m.estado !== "ANULADA");
//     const saldoTotalAnticipos = anticipos.reduce(
//       (acc, a) => acc + (Number(a.saldo) || 0),
//       0
//     );

//     const ventasHoy = activeMovements
//       .filter((m) => m.fecha?.split("T")[0] === hoy)
//       .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

//     const movimientosGlobales = activeMovements.filter((m) => {
//       const f = m.fecha?.split("T")[0];
//       return f >= fechaInicio && f <= fechaFin;
//     });

//     const ventasRangoGlobal = movimientosGlobales.reduce(
//       (acc, m) => acc + (Number(m.total) || 0),
//       0
//     );

//     // MANTENEMOS ESTA LÓGICA POR SI DATOSCUBICAJEAPI FALLA, PERO PRIORIZAREMOS LA API EN EL RENDER
//     const cubicajeAgrupado = {};
//     movimientosGlobales.forEach((m) => {
//       const material = m.nombre_material || m.material || "Sin Clasificar";
//       const valorCubicaje = Number(m.cubicaje) || 0;
//       cubicajeAgrupado[material] =
//         (cubicajeAgrupado[material] || 0) + valorCubicaje;
//     });

//     const dataCubicaje = Object.entries(cubicajeAgrupado)
//       .map(([nombre, total]) => ({ nombre, total }))
//       .sort((a, b) => b.total - a.total);

//     const movimientosFiltradosCartera = activeMovements.filter((m) => {
//       const fechaMov = m.fecha?.split("T")[0];
//       if (modoFiltroCartera === "mes") {
//         const f = new Date(m.fecha);
//         return f.getMonth() === mesCartera && f.getFullYear() === anioCartera;
//       } else {
//         return fechaMov >= fechaInicioCartera && fechaMov <= fechaFinCartera;
//       }
//     });

//     return {
//       ventasRangoGlobal,
//       ventasHoy,
//       metaAjustada: ventasHoy > 5000000 ? ventasHoy * 1.2 : 5000000,
//       saldoAnticipos: saldoTotalAnticipos,
//       clientes: terceros.length,
//       grafica: { fechas, ingresos, cantidades },
//       dataCubicaje,
//       pieData: [
//         {
//           name: "Pagados",
//           value: movimientosFiltradosCartera.filter((m) => m.pagado === 1)
//             .length,
//           color: "#6366f1",
//         },
//         {
//           name: "Pendientes",
//           value: movimientosFiltradosCartera.filter((m) => m.pagado === 0)
//             .length,
//           color: "#94a3b8",
//         },
//       ],
//     };
//   }, [
//     datosApi,
//     movements,
//     anticipos,
//     terceros,
//     hoy,
//     mesCartera,
//     anioCartera,
//     modoFiltroCartera,
//     fechaInicioCartera,
//     fechaFinCartera,
//     fechaInicio,
//     fechaFin,
//   ]);

//   return (
//     <div className="w-full max-w-[1600px] mx-auto p-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <style>
//         {`
//           .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; position: relative; overflow: hidden; }
//           .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.05); }
//           .avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
//           .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-blur: 2px; }
//           .select-custom { background: transparent; border: none; font-size: 11px; font-weight: 800; color: #6366f1; cursor: pointer; outline: none; }
//           .btn-toggle { font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 8px; text-transform: uppercase; transition: all 0.3s; }
//         `}
//       </style>
// {/* ===================================================================================================== */}
// {/*--------------------------------------------------- HEADER -------------------------------------------- */}
// {/* ===================================================================================================== */}

//       <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900 text-white p-6 md:p-10 shadow-2xl">
//         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
//           <div>
//             <div className="flex items-center gap-2 mb-3">
//               <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
//                 Panel de Control Operativo
//               </span>
//             </div>
//             <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
//               ¡Hola,{" "}
//               <span className="text-indigo-400">
//                 {localStorage.getItem("usuario") || "Admin"}
//               </span>
//               !
//             </h1>

//             <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-800/50 rounded-3xl border border-slate-700 w-fit backdrop-blur-sm">
//               <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-inner">
//                 <Calendar size={16} className="text-indigo-600" />
//                 <div className="flex flex-col">
//                   <span className="text-[8px] font-black text-indigo-400 uppercase leading-none">
//                     Desde
//                   </span>
//                   <input
//                     type="date"
//                     value={fechaInicio}
//                     onChange={(e) => setFechaInicio(e.target.value)}
//                     className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/20">
//                 <ChevronRight size={14} className="text-indigo-400" />
//               </div>
//               <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-inner">
//                 <Calendar size={16} className="text-indigo-600" />
//                 <div className="flex flex-col">
//                   <span className="text-[8px] font-black text-indigo-400 uppercase leading-none">
//                     Hasta
//                   </span>
//                   <input
//                     type="date"
//                     value={fechaFin}
//                     onChange={(e) => setFechaFin(e.target.value)}
//                     className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={() => setTab && setTab("generador")}
//             className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 md:px-8 md:py-5 rounded-[24px] font-black transition-all shadow-xl shadow-indigo-500/40 w-full lg:w-auto hover:scale-105 active:scale-95 text-lg"
//           >
//             <Package size={24} /> <span>Nueva Remisión</span>
//           </button>
//         </div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
//       </div>
      
// {/* ===================================================================================================== */}
// {/*---------------------------------------------- Notificaciones ---------------------------------------- */}
// {/* ===================================================================================================== */}

//       {notificacion && (
//         <div className="px-2"> 
//           <NotificationBanner data={notificacion} />
//         </div>
//       )}

// {/* ===================================================================================================== */}
// {/*--------------------------------------------------- KPIs ---------------------------------------------- */}
// {/* ===================================================================================================== */}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
//           <StatCard
//             icon={<TrendingUp size={24} />}
//             label="Ventas en Rango"
//             value={`$${stats.ventasRangoGlobal.toLocaleString()}`}
//             color="indigo"
//             onClick={() => setTab && setTab("movimientos")}
//           />
//           <StatCard
//             icon={<CreditCard size={24} />}
//             label="Saldo Anticipos"
//             value={`$${stats.saldoAnticipos.toLocaleString()}`}
//             color="emerald"
//             onClick={() => setTab && setTab("archivedAnticipos")}
//           />
//           <StatCard
//             icon={<Users size={24} />}
//             label="Total Clientes"
//             value={stats.clientes}
//             color="amber"
//             onClick={() => setTab && setTab("terceros")}
//           />
//         </div>
//         <div className="pro-card p-6 flex flex-col items-center justify-center min-h-[220px]">
//           <span className="text-[10px] font-black text-slate-400 uppercase mb-1">
//             Ventas de Hoy
//           </span>
//           <div className="h-[130px] w-full">
//             <Plot
//               data={[
//                 {
//                   type: "indicator",
//                   mode: "gauge+number",
//                   value: stats.ventasHoy,
//                   number: {
//                     prefix: "$",
//                     valueformat: ",.0f",
//                     font: { size: 20, color: "#1e293b", weight: "900" },
//                   },
//                   gauge: {
//                     axis: { range: [0, stats.metaAjustada], tickwidth: 1 },
//                     bar: { color: "#6366f1", thickness: 0.25 },
//                     steps: [
//                       { range: [0, stats.metaAjustada], color: "#f1f5f9" },
//                     ],
//                   },
//                 },
//               ]}
//               layout={{
//                 autosize: true,
//                 margin: { t: 30, b: 10, l: 30, r: 30 },
//                 paper_bgcolor: "rgba(0,0,0,0)",
//               }}
//               config={{ displayModeBar: false }}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>
//           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
//             META: ${stats.metaAjustada.toLocaleString()}
//           </p>
//         </div>
//       </div>
// {/* ===================================================================================================== */}
// {/*----------------------------------- GRÁFICAS DE TENDENCIA -------------------------------------------- */}
// {/* ===================================================================================================== */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="pro-card p-6">
//           {loading && (
//             <div className="loading-overlay">
//               <Loader2 className="animate-spin text-indigo-500" />
//             </div>
//           )}
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-slate-800">
//               Tendencia de Ingresos
//             </h3>
//             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
//               {fechaInicio} a {fechaFin}
//             </p>
//           </div>
//           <div className="h-[300px]">
//             <Plot
//               data={[
//                 {
//                   x: stats.grafica.fechas,
//                   y: stats.grafica.ingresos,
//                   type: "bar",
//                   marker: { color: "#6366f1", borderRadius: 8 },
//                 },
//               ]}
//               layout={{
//                 autosize: true,
//                 margin: { l: 50, r: 10, t: 30, b: 80 },
//                 paper_bgcolor: "rgba(0,0,0,0)",
//                 plot_bgcolor: "rgba(0,0,0,0)",
//                 yaxis: { gridcolor: "#f1f5f9", tickformat: "$,.0s" },
//                 xaxis: {
//                   showgrid: false,
//                   type: "category",
//                   tickangle: -45,
//                   automargin: true,
//                 },
//               }}
//               config={{ responsive: true, displaylogo: false }}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>
//         </div>
//         <div className="pro-card p-6">
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-slate-800">
//               Volumen de Remisiones
//             </h3>
//             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
//               Conteo de despachos
//             </p>
//           </div>
//           <div className="h-[300px]">
//             <Plot
//               data={[
//                 {
//                   x: stats.grafica.fechas,
//                   y: stats.grafica.cantidades,
//                   type: "scatter",
//                   mode: "lines+markers",
//                   line: { color: "#10b981", width: 3, shape: "spline" },
//                   fill: "tozeroy",
//                   fillcolor: "rgba(16, 185, 129, 0.05)",
//                 },
//               ]}
//               layout={{
//                 autosize: true,
//                 margin: { l: 40, r: 10, t: 30, b: 80 },
//                 paper_bgcolor: "rgba(0,0,0,0)",
//                 plot_bgcolor: "rgba(0,0,0,0)",
//                 yaxis: { gridcolor: "#f1f5f9", rangemode: "tozero" },
//                 xaxis: {
//                   showgrid: false,
//                   type: "category",
//                   tickangle: -45,
//                   automargin: true,
//                 },
//               }}
//               config={{ responsive: true, displaylogo: false }}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>
//         </div>
//       </div>
// {/* ===================================================================================================== */}
// {/*--------------------------------------------- SECCIÓN INFERIOR -------------------------------------- */}
// {/* ===================================================================================================== */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           <div className="pro-card p-6 md:p-8">
//             <div className="flex justify-between items-center mb-8">
//               <h3 className="text-xl font-bold text-slate-800">
//                 Últimos Movimientos
//               </h3>
//               <button
//                 onClick={() => setTab && setTab("movimientos")}
//                 className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
//               >
//                 {" "}
//                 Ver todos <ChevronRight size={16} />{" "}
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
//                     <th className="pb-4">Tercero</th>
//                     <th className="pb-4">Remisión</th>
//                     <th className="pb-4">Valor</th>
//                     <th className="pb-4 text-right">Estado</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {movements.slice(0, 5).map((m, idx) => (
//                     <tr
//                       key={idx}
//                       className="group hover:bg-slate-50/50 transition-colors"
//                     >
//                       <td className="py-4 flex items-center gap-3">
//                         <div className="avatar-circle bg-indigo-500">
//                           {(m.tercero || "??")[0]}
//                         </div>
//                         <span className="font-bold text-slate-700 text-sm">
//                           {m.tercero}
//                         </span>
//                       </td>
//                       <td className="py-4 text-sm font-semibold text-slate-500">
//                         REM-{m.remision}
//                       </td>
//                       <td className="py-4 text-sm font-black text-slate-800">
//                         ${Number(m.total).toLocaleString()}
//                       </td>
//                       <td className="py-4 text-right">
//                         <span
//                           className={`px-3 py-1 rounded-full text-[10px] font-black ${
//                             m.estado === "ANULADA"
//                               ? "bg-rose-100 text-rose-600"
//                               : "bg-emerald-50 text-emerald-600"
//                           }`}
//                         >
//                           {m.estado}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="pro-card p-6 md:p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
//                 {" "}
//                 <Truck size={20} />{" "}
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-slate-800">
//                   Cubicaje por Material
//                 </h3>
//                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
//                   Resumen del Periodo
//                 </p>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {/* CAMBIO: Mapeamos los datos que vienen directamente de la API */}
//               {datosCubicajeApi.map((item, i) => (
//                 <div
//                   key={i}
//                   className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group hover:border-indigo-300 transition-all"
//                 >
//                   <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">
//                     {item.material}
//                   </span>
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-2xl font-black text-slate-800">
//                       {Number(item.total_cubicaje).toLocaleString()}
//                     </span>
//                     <span className="text-sm font-bold text-indigo-500">
//                       m³
//                     </span>
//                   </div>
//                   <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
//                     <div
//                       className="bg-indigo-500 h-full rounded-full"
//                       style={{
//                         width: `${Math.min(
//                           (item.total_cubicaje / 500) * 100,
//                           100
//                         )}%`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
// {/*================================================================================================================================*/}
// {/*--------------------------------------------------------- CARTERA -------------------------------------------------------------- */}
// {/*================================================================================================================================*/}
//         <div className="pro-card p-6 flex flex-col bg-white shadow-sm border border-slate-100">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
//                 Estado Cartera
//               </h3>
//               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
//                 Distribución de Pagos
//               </p>
//             </div>
//             <div className="flex flex-col items-end gap-2">
//               <div className="bg-indigo-600 px-4 py-1.5 rounded-full shadow-lg shadow-indigo-100">
//                 <span className="text-[10px] font-black text-white uppercase tracking-widest">
//                   Sincronizado
//                 </span>
//               </div>
//               <span className="text-[9px] text-slate-400 font-bold">
//                 Rango: {fechaInicio} — {fechaFin}
//               </span>
//             </div>
//           </div>

//           <div className="relative h-[280px] w-full flex items-center justify-center mb-6">
//             <Plot
//               data={[
//                 {
//                   values: stats.pieData.map((d) => d.value),
//                   labels: stats.pieData.map((d) => d.name),
//                   type: "pie",
//                   hole: 0.68,
//                   marker: {
//                     colors: ["#6366f1", "#94a3b8"],
//                     line: { color: "white", width: 4 },
//                   },
//                   textinfo: "percent",
//                   textposition: "inside",
//                   insidetextfont: { color: "white", weight: "bold", size: 14 },
//                   hoverinfo: "label+value",
//                 },
//               ]}
//               layout={{
//                 autosize: true,
//                 showlegend: false,
//                 margin: { l: 0, r: 0, t: 0, b: 0 },
//                 paper_bgcolor: "rgba(0,0,0,0)",
//               }}
//               config={{ displayModeBar: false }}
//               style={{ width: "100%", height: "100%" }}
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                 Total
//               </span>
//               <span className="text-3xl font-black text-slate-800 tracking-tighter">
//                 {" "}
//                 {stats.pieData.reduce((a, b) => a + b.value, 0)}{" "}
//               </span>
//             </div>
//           </div>

//           <div className="space-y-3 mt-auto">
//             {stats.pieData.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/80 hover:bg-white hover:shadow-md transition-all"
//               >
//                 <div className="flex items-center gap-4">
//                   <div
//                     className="w-3.5 h-3.5 rounded-full shadow-sm"
//                     style={{
//                       backgroundColor: idx === 0 ? "#6366f1" : "#94a3b8",
//                     }}
//                   ></div>
//                   <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">
//                     {item.name}
//                   </span>
//                 </div>
//                 <div className="flex items-baseline gap-1">
//                   <span className="text-xl font-black text-slate-900 tabular-nums">
//                     {item.value}
//                   </span>
//                   <span className="text-[10px] text-slate-400 font-bold uppercase">
//                     Remisiones
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// //====================================================================================================================
// //-------------------------------- diccionario de colores - Estructura de las Tarjetas -------------------------------
// //------------------------------------------------------ no tocar ----------------------------------------------------
// //====================================================================================================================

// function StatCard({ icon, label, value, color, onClick }) {
//   const themes = {
//     indigo:
//       "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
//     emerald:
//       "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
//     amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
//   };

//   return (
//     <div
//       onClick={onClick}
//       className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer group"
//     >
//       <div
//         className={`h-14 w-14 rounded-2xl flex items-center justify-center ${themes[color]} border mb-4 shadow-sm transition-transform group-hover:scale-110`}
//       >
//         {" "}
//         {icon}{" "}
//       </div>
//       <div>
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
//           {label}
//         </p>
//         <div className="flex items-end justify-between">
//           <p className="text-xl md:text-2xl font-black text-slate-900 tabular-nums truncate">
//             {value}
//           </p>
//           <div className={`p-1.5 rounded-lg ${themes[color]} bg-opacity-20`}>
//             {" "}
//             <ArrowUpRight size={16} />{" "}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useMemo, useState, useEffect } from "react";
import Plot from "react-plotly.js";
import {
  fetchVentasPorFecha,
  fetchCubicajePorMaterial,
  fetchNotificaciones,
} from "../assets/services/apiService";

import NotificationBanner from "./NotificationBanner";

import {
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  CreditCard,
  ChevronRight,
  Calendar,
  Loader2,
  Truck,
} from "lucide-react";

export default function Inicio({
  movements = [],
  anticipos = [],
  terceros = [],
  setTab,
}) {
  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  // --- ESTADOS ---
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [datosApi, setDatosApi] = useState([]);
  const [datosCubicajeApi, setDatosCubicajeApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  const [modoFiltroCartera, setModoFiltroCartera] = useState("mes");
  const [mesCartera, setMesCartera] = useState(new Date().getMonth());
  const [anioCartera, setAnioCartera] = useState(new Date().getFullYear());
  const [fechaInicioCartera, setFechaInicioCartera] = useState(hoy);
  const [fechaFinCartera, setFechaFinCartera] = useState(hoy);

  // --- EFECTO: CARGA DE DATOS DE VENTAS Y CUBICAJE ---
  useEffect(() => {
    const cargarGraficas = async () => {
      if (!fechaInicio || !fechaFin) return;
      setLoading(true);
      try {
        const [responseVentas, responseCubicaje] = await Promise.all([
          fetchVentasPorFecha(fechaInicio, fechaFin),
          fetchCubicajePorMaterial(fechaInicio, fechaFin)
        ]);
        
        setDatosApi(responseVentas || []);
        setDatosCubicajeApi(responseCubicaje || []);

        // Sincronización de filtros de cartera
        setFechaInicioCartera(fechaInicio);
        setFechaFinCartera(fechaFin);
      } catch (error) {
        console.error("Error al cargar datos de gráficas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarGraficas();
  }, [fechaInicio, fechaFin]);

  // --- EFECTO: NOTIFICACIONES ---
  useEffect(() => {
    const cargarNotificacion = async () => {
      try {
        const data = await fetchNotificaciones();
        if (data && data.length > 0) {
          const activa = data.find((n) => n.activa === 1);
          setNotificacion(activa);
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };
    cargarNotificacion();
  }, []);

  // --- LÓGICA DE NEGOCIO Y ESTADÍSTICAS ---
  const stats = useMemo(() => {
    // Generación de eje X continuo para gráficas
    const listaFechasCompletas = [];
    let fechaActual = new Date(fechaInicio + "T00:00:00");
    const fechaFinal = new Date(fechaFin + "T00:00:00");

    while (fechaActual <= fechaFinal) {
      listaFechasCompletas.push(fechaActual.toISOString().split("T")[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const ingresosMap = {};
    const cantidadesMap = {};
    datosApi.forEach((d) => {
      const f = d.Fecha.split("T")[0];
      ingresosMap[f] = Number(d.monto_total);
      cantidadesMap[f] = Number(d.cantidad_remisiones);
    });

    const fechas = listaFechasCompletas;
    const ingresos = fechas.map((f) => ingresosMap[f] || 0);
    const cantidades = fechas.map((f) => cantidadesMap[f] || 0);

    const activeMovements = movements.filter((m) => m.estado !== "ANULADA");
    const saldoTotalAnticipos = anticipos.reduce(
      (acc, a) => acc + (Number(a.saldo) || 0),
      0
    );

    const ventasHoy = activeMovements
      .filter((m) => m.fecha?.split("T")[0] === hoy)
      .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

    const movimientosFiltradosCartera = activeMovements.filter((m) => {
      const fechaMov = m.fecha?.split("T")[0];
      if (modoFiltroCartera === "mes") {
        const f = new Date(m.fecha);
        return f.getMonth() === mesCartera && f.getFullYear() === anioCartera;
      }
      return fechaMov >= fechaInicioCartera && fechaMov <= fechaFinCartera;
    });

    const ventasRangoGlobal = activeMovements
      .filter((m) => {
        const f = m.fecha?.split("T")[0];
        return f >= fechaInicio && f <= fechaFin;
      })
      .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

    return {
      ventasRangoGlobal,
      ventasHoy,
      metaAjustada: ventasHoy > 5000000 ? ventasHoy * 1.2 : 5000000,
      saldoAnticipos: saldoTotalAnticipos,
      clientes: terceros.length,
      grafica: { fechas, ingresos, cantidades },
      pieData: [
        {
          name: "Pagados",
          value: movimientosFiltradosCartera.filter((m) => m.pagado === 1).length,
          color: "#6366f1",
        },
        {
          name: "Pendientes",
          value: movimientosFiltradosCartera.filter((m) => m.pagado === 0).length,
          color: "#94a3b8",
        },
      ],
    };
  }, [
    datosApi,
    movements,
    anticipos,
    terceros,
    hoy,
    fechaInicio,
    fechaFin,
    modoFiltroCartera,
    mesCartera,
    anioCartera,
    fechaInicioCartera,
    fechaFinCartera,
  ]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>
        {`
          .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; position: relative; overflow: hidden; }
          .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.05); }
          .avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
          .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-blur: 2px; }
        `}
      </style>

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900 text-white p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                Panel de Control Operativo
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              ¡Hola,{" "}
              <span className="text-indigo-400">
                {localStorage.getItem("usuario") || "Admin"}
              </span>
              !
            </h1>

            <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-800/50 rounded-3xl border border-slate-700 w-fit backdrop-blur-sm">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-inner">
                <Calendar size={16} className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-indigo-400 uppercase leading-none">Desde</span>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/20">
                <ChevronRight size={14} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-inner">
                <Calendar size={16} className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-indigo-400 uppercase leading-none">Hasta</span>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setTab && setTab("generador")}
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 md:px-8 md:py-5 rounded-[24px] font-black transition-all shadow-xl shadow-indigo-500/40 w-full lg:w-auto hover:scale-105 active:scale-95 text-lg"
          >
            <Package size={24} /> <span>Nueva Remisión</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>

      {/* NOTIFICACIONES */}
      {notificacion && (
        <div className="px-2">
          <NotificationBanner data={notificacion} />
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Ventas en Rango"
            value={`$${stats.ventasRangoGlobal.toLocaleString()}`}
            color="indigo"
            onClick={() => setTab && setTab("movimientos")}
          />
          <StatCard
            icon={<CreditCard size={24} />}
            label="Saldo Anticipos"
            value={`$${stats.saldoAnticipos.toLocaleString()}`}
            color="emerald"
            onClick={() => setTab && setTab("archivedAnticipos")}
          />
          <StatCard
            icon={<Users size={24} />}
            label="Total Clientes"
            value={stats.clientes}
            color="amber"
            onClick={() => setTab && setTab("terceros")}
          />
        </div>
        <div className="pro-card p-6 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas de Hoy</span>
          <div className="h-[130px] w-full">
            <Plot
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: stats.ventasHoy,
                  number: {
                    prefix: "$",
                    valueformat: ",.0f",
                    font: { size: 20, color: "#1e293b", weight: "900" },
                  },
                  gauge: {
                    axis: { range: [0, stats.metaAjustada], tickwidth: 1 },
                    bar: { color: "#6366f1", thickness: 0.25 },
                    steps: [{ range: [0, stats.metaAjustada], color: "#f1f5f9" }],
                  },
                },
              ]}
              layout={{
                autosize: true,
                margin: { t: 30, b: 10, l: 30, r: 30 },
                paper_bgcolor: "rgba(0,0,0,0)",
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            META: ${stats.metaAjustada.toLocaleString()}
          </p>
        </div>
      </div>

      {/* GRÁFICAS DE TENDENCIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="pro-card p-6">
          {loading && (
            <div className="loading-overlay">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              {fechaInicio} a {fechaFin}
            </p>
          </div>
          <div className="h-[300px]">
            <Plot
              data={[
                {
                  x: stats.grafica.fechas,
                  y: stats.grafica.ingresos,
                  type: "bar",
                  marker: { color: "#6366f1", borderRadius: 8 },
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 10, t: 30, b: 80 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                yaxis: { gridcolor: "#f1f5f9", tickformat: "$,.0s" },
                xaxis: { showgrid: false, type: "category", tickangle: -45, automargin: true },
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
        <div className="pro-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Volumen de Remisiones</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Conteo de despachos</p>
          </div>
          <div className="h-[300px]">
            <Plot
              data={[
                {
                  x: stats.grafica.fechas,
                  y: stats.grafica.cantidades,
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: "#10b981", width: 3, shape: "spline" },
                  fill: "tozeroy",
                  fillcolor: "rgba(16, 185, 129, 0.05)",
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 40, r: 10, t: 30, b: 80 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                yaxis: { gridcolor: "#f1f5f9", rangemode: "tozero" },
                xaxis: { showgrid: false, type: "category", tickangle: -45, automargin: true },
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: MOVIMIENTOS, CUBICAJE Y CARTERA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ÚLTIMOS MOVIMIENTOS */}
          <div className="pro-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">Últimos Movimientos</h3>
              <button
                onClick={() => setTab && setTab("movimientos")}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Ver todos <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4">Tercero</th>
                    <th className="pb-4">Remisión</th>
                    <th className="pb-4">Valor</th>
                    <th className="pb-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.slice(0, 5).map((m, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div className="avatar-circle bg-indigo-500">{(m.tercero || "??")[0]}</div>
                        <span className="font-bold text-slate-700 text-sm">{m.tercero}</span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-500">REM-{m.remision}</td>
                      <td className="py-4 text-sm font-black text-slate-800">${Number(m.total).toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.estado === "ANULADA" ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {m.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CUBICAJE POR MATERIAL */}
          <div className="pro-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><Truck size={20} /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Cubicaje por Material</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resumen del Periodo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datosCubicajeApi.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group hover:border-indigo-300 transition-all">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{item.material}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">{Number(item.total_cubicaje).toLocaleString()}</span>
                    <span className="text-sm font-bold text-indigo-500">m³</span>
                  </div>
                  <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.min((item.total_cubicaje / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ESTADO CARTERA */}
        <div className="pro-card p-6 flex flex-col bg-white shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Estado Cartera</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Distribución de Pagos</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-indigo-600 px-4 py-1.5 rounded-full shadow-lg shadow-indigo-100">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizado</span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Rango: {fechaInicio} — {fechaFin}</span>
            </div>
          </div>

          <div className="relative h-[280px] w-full flex items-center justify-center mb-6">
            <Plot
              data={[
                {
                  values: stats.pieData.map((d) => d.value),
                  labels: stats.pieData.map((d) => d.name),
                  type: "pie",
                  hole: 0.68,
                  marker: { colors: ["#6366f1", "#94a3b8"], line: { color: "white", width: 4 } },
                  textinfo: "percent",
                  textposition: "inside",
                  insidetextfont: { color: "white", weight: "bold", size: 14 },
                  hoverinfo: "label+value",
                },
              ]}
              layout={{
                autosize: true,
                showlegend: false,
                margin: { l: 0, r: 0, t: 0, b: 0 },
                paper_bgcolor: "rgba(0,0,0,0)",
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: "100%" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black text-slate-800 tracking-tighter">
                {stats.pieData.reduce((a, b) => a + b.value, 0)}
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            {stats.pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/80 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: idx === 0 ? "#6366f1" : "#94a3b8" }}
                  ></div>
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 tabular-nums">{item.value}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Remisiones</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE AUXILIAR: TARJETA DE ESTADÍSTICAS
function StatCard({ icon, label, value, color, onClick }) {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
  };

  return (
    <div
      onClick={onClick}
      className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer group"
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${themes[color]} border mb-4 shadow-sm transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <p className="text-xl md:text-2xl font-black text-slate-900 tabular-nums truncate">{value}</p>
          <div className={`p-1.5 rounded-lg ${themes[color]} bg-opacity-20`}>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}