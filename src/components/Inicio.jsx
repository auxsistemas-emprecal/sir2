// import React, { useMemo } from "react";
// import Plot from 'react-plotly.js';
// import {
//   TrendingUp,
//   Users,
//   Package,
//   ArrowUpRight,
//   CreditCard,
//   ChevronRight,
//   Calendar,
// } from "lucide-react";

// export default function Inicio({
//   movements = [],
//   anticipos = [], 
//   terceros = [],
//   materials = [],
//   setTab, 
// }) {
//   // --- FUNCIONES DE SOPORTE ---
//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "¡Buenos días!";
//     if (hour < 18) return "¡Buenas tardes!";
//     return "¡Buenas noches!";
//   };

//   const getAvatarData = (nombre) => {
//     if (!nombre) return { color: "bg-slate-200", initials: "??" };
//     const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-purple-500", "bg-orange-500"];
//     const charCodeSum = nombre.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     const color = colors[charCodeSum % colors.length];
//     const initials = nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
//     return { color, initials };
//   };

//   // --- LÓGICA DE DATOS ---
//   const stats = useMemo(() => {
//     const hoy = new Date().toISOString().split("T")[0];
    
//     // Filtro maestro para ignorar anuladas
//     const activeMovements = movements.filter(m => m.estado !== "ANULADA");
    
//     // 1. AJUSTE SOLICITADO: Ventas de Hoy (Usando Total Neto Día de los movimientos de hoy)
//     const ventasHoy = activeMovements
//       .filter((m) => m.fecha === hoy)
//       .reduce((acc, m) => acc + (Number(m["Total Neto"]) || Number(m.total) || 0), 0);

//     // 2. Saldo Anticipos (Sumatoria de la columna saldo de la tabla anticipos)
//     const saldoTotalAnticipos = anticipos.reduce((acc, a) => acc + (Number(a.saldo) || 0), 0);

//     // 3. Definir Meta
//     const metaBase = 5000000; 
//     const metaAjustada = ventasHoy > metaBase ? ventasHoy * 1.2 : metaBase;

//     // 4. Tendencia e Históricos
//     const ventasPorDia = activeMovements.reduce((acc, m) => {
//       const fecha = m.fecha;
//       if (!acc[fecha]) acc[fecha] = { total: 0, cantidad: 0 };
//       acc[fecha].total += (Number(m.total) || 0);
//       acc[fecha].cantidad += 1;
//       return acc;
//     }, {});

//     const sortedDates = Object.keys(ventasPorDia).sort();
//     const totalVentas = activeMovements.reduce((acc, m) => acc + (Number(m.total) || 0), 0);
    
//     // 5. Cartera
//     const pagados = activeMovements.filter((m) => m.pagado === 1).length;
//     const pendientes = activeMovements.filter((m) => m.pagado === 0).length;

//     return {
//       ventas: totalVentas,
//       ventasHoy,
//       metaAjustada,
//       saldoAnticipos: saldoTotalAnticipos,
//       clientes: terceros.length,
//       tendencia: {
//         x: sortedDates,
//         yVentas: sortedDates.map(d => ventasPorDia[d].total),
//         yCant: sortedDates.map(d => ventasPorDia[d].cantidad)
//       },
//       pieData: [
//         { name: "Pagados", value: pagados || 0, color: "#6366f1" },
//         { name: "Pendientes", value: pendientes || 0, color: "#f43f5e" },
//       ],
//     };
//   }, [movements, anticipos, terceros]);

//   const plotConfig = {
//     responsive: true,
//     displayModeBar: true, 
//     modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'], 
//     displaylogo: false,
//   };

//   return (
//     <div className="max-w-[1600px] mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <style>
//         {`
//           .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; }
//           .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
//           .avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
//         `}
//       </style>

//       {/* HEADER */}
//       <div className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white p-8 md:p-10 shadow-2xl">
//         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
//           <div>
//             <div className="flex items-center gap-2 mb-3">
//               <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
//                 Resumen del Sistema
//               </span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
//               {getGreeting()}{" "}
//               <span className="text-indigo-400">
//                 {localStorage.getItem("usuario") || "cgranados"}
//               </span>
//             </h1>
//             <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
//               Estado de operación: Tienes <span className="text-white font-bold">{movements.filter(m => m.estado !== "ANULADA").length} remisiones</span> activas.
//             </p>
//           </div>
//           <button onClick={() => setTab && setTab('generador')} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20">
//             <Package size={20} />
//             <span>Nueva Remisión</span>
//           </button>
//         </div>
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <StatCard icon={<TrendingUp size={24} />} label="Ventas Totales" value={`$${stats.ventas.toLocaleString()}`} color="indigo" onClick={() => setTab && setTab('movimientos')} />
//           <StatCard icon={<CreditCard size={24} />} label="Saldo Anticipos" value={`$${stats.saldoAnticipos.toLocaleString()}`} color="emerald" onClick={() => setTab && setTab('archivedAnticipos')} />
//           <StatCard icon={<Users size={24} />} label="Total Clientes" value={stats.clientes} color="amber" onClick={() => setTab && setTab('terceros')} />
//         </div>
        
//         <div className="pro-card p-6 flex flex-col items-center justify-center">
//           <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas de Hoy</span>
//           <div className="h-[130px] w-full">
//             <Plot
//               data={[{
//                 type: "indicator",
//                 mode: "gauge+number",
//                 value: stats.ventasHoy,
//                 number: { prefix: "$", valueformat: ",.0f", font: { size: 20, color: "#1e293b", weight: "900" } },
//                 gauge: {
//                   axis: { range: [0, stats.metaAjustada], tickwidth: 1 },
//                   bar: { color: "#6366f1", thickness: 0.25 },
//                   bgcolor: "white",
//                   steps: [
//                     { range: [0, stats.metaAjustada * 0.7], color: "#f1f5f9" },
//                     { range: [stats.metaAjustada * 0.7, stats.metaAjustada], color: "#e0e7ff" }
//                   ],
//                 }
//               }]}
//               layout={{ autosize: true, margin: { t: 30, b: 0, l: 30, r: 30 }, paper_bgcolor: 'rgba(0,0,0,0)' }}
//               config={{ displayModeBar: false }}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>
//           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">META: ${stats.metaAjustada.toLocaleString()}</p>
//         </div>
//       </div>

//       {/* TENDENCIA */}
//       <div className="pro-card p-8">
//         <h3 className="text-xl font-bold text-slate-800">Tendencia Histórica</h3>
//         <p className="text-sm text-slate-400 mb-6">Ingresos vs Volumen de despacho (Sin Anuladas)</p>
//         <div className="h-[400px]">
//           <Plot
//             data={[
//               { x: stats.tendencia.x, y: stats.tendencia.yVentas, type: 'bar', name: 'Ingresos ($)', marker: { color: '#e2e8f0' } },
//               { x: stats.tendencia.x, y: stats.tendencia.yCant, type: 'scatter', mode: 'lines+markers', name: 'Remisiones', yaxis: 'y2', line: { color: '#6366f1', width: 3, shape: 'spline' } }
//             ]}
//             layout={{
//               autosize: true, showlegend: true, legend: { orientation: 'h', y: -0.2 },
//               margin: { l: 60, r: 60, t: 20, b: 60 },
//               paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
//               yaxis2: { overlaying: 'y', side: 'right', showgrid: false }
//             }}
//             config={plotConfig}
//             style={{ width: "100%", height: "100%" }}
//           />
//         </div>
//       </div>

//       {/* TABLA Y CARTERA */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="pro-card p-8 lg:col-span-2 overflow-hidden">
//           <div className="flex justify-between items-center mb-8">
//             <h3 className="text-xl font-bold text-slate-800">Últimos Movimientos</h3>
//             <button onClick={() => setTab && setTab('movimientos')} className="text-sm font-bold text-indigo-600 flex items-center gap-1">Ver todos <ChevronRight size={16} /></button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
//                   <th className="pb-4">Tercero</th>
//                   <th className="pb-4">ID Remisión</th>
//                   <th className="pb-4">Valor</th>
//                   <th className="pb-4 text-right">Estado</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {movements.slice(0, 5).map((m, idx) => {
//                   const avatar = getAvatarData(m.tercero);
//                   return (
//                     <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
//                       <td className="py-4 flex items-center gap-3">
//                         <div className={`avatar-circle ${avatar.color}`}>{avatar.initials}</div>
//                         <span className="font-bold text-slate-700 text-sm capitalize">{m.tercero?.toLowerCase()}</span>
//                       </td>
//                       <td className="py-4 text-sm font-semibold text-slate-500">REM-{m.remision}</td>
//                       <td className="py-4 text-sm font-black text-slate-800">${Number(m.total).toLocaleString()}</td>
//                       <td className="py-4 text-right">
//                         <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
//                           m.estado === "ANULADA" ? "bg-rose-100 text-rose-600" :
//                           m.pagado === 1 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
//                         }`}>
//                           {m.estado === "ANULADA" ? "ANULADA" : m.pagado === 1 ? "PAGADO" : "PENDIENTE"}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <div className="pro-card p-8">
//           <h3 className="text-xl font-bold text-slate-800 mb-8">Estado Cartera</h3>
//           <div className="h-[250px]">
//             <Plot
//               data={[{
//                 values: stats.pieData.map(d => d.value),
//                 labels: stats.pieData.map(d => d.name),
//                 type: 'pie', hole: 0.6,
//                 marker: { colors: stats.pieData.map(d => d.color) },
//                 textinfo: "percent",
//                 textposition: "inside",
//                 insidetextfont: { color: "white", weight: "800" }
//               }]}
//               layout={{ autosize: true, showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 }, paper_bgcolor: 'rgba(0,0,0,0)' }}
//               config={plotConfig}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>
          
//           <div className="space-y-3 mt-8">
//             {stats.pieData.map((item, idx) => (
//               <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
//                 <div className="flex items-center gap-3">
//                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
//                   <span className="text-xs font-bold text-slate-600">{item.name}</span>
//                 </div>
//                 <span className="text-sm font-black text-slate-800">{item.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color, onClick }) {
//   const themes = {
//     indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
//     emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
//     amber: "bg-amber-50 text-amber-600 border-amber-100",
//   };
//   return (
//     <div onClick={onClick} className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer">
//       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${themes[color]} border mb-4 shadow-sm`}>{icon}</div>
//       <div>
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
//         <div className="flex items-end justify-between">
//           <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
//           <div className={`p-1.5 rounded-lg ${themes[color]} bg-opacity-20`}><ArrowUpRight size={16} /></div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useMemo } from "react";
import Plot from 'react-plotly.js';
import {
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  CreditCard,
  ChevronRight,
} from "lucide-react";

export default function Inicio({
  movements = [],
  anticipos = [], 
  terceros = [],
  materials = [],
  setTab, 
}) {
  // --- FUNCIONES DE SOPORTE ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  const getAvatarData = (nombre) => {
    if (!nombre) return { color: "bg-slate-200", initials: "??" };
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-purple-500", "bg-orange-500"];
    const charCodeSum = nombre.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[charCodeSum % colors.length];
    const initials = nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    return { color, initials };
  };

  // --- LÓGICA DE DATOS ---
  const stats = useMemo(() => {
    const activeMovements = movements.filter(m => m.estado !== "ANULADA");
    
    const valorUnificado = activeMovements.reduce((acc, m) => {
      return acc + (Number(m["Total Neto Día"]) || Number(m.total) || 0);
    }, 0);

    const saldoTotalAnticipos = anticipos.reduce((acc, a) => acc + (Number(a.saldo) || 0), 0);

    const metaBase = 5000000; 
    const metaAjustada = valorUnificado > metaBase ? valorUnificado * 1.2 : metaBase;

    const ventasPorDia = activeMovements.reduce((acc, m) => {
      const fecha = m.fecha;
      if (!acc[fecha]) acc[fecha] = { total: 0, cantidad: 0, metros: 0 };
      acc[fecha].total += (Number(m.total) || 0);
      acc[fecha].cantidad += 1;
      acc[fecha].metros += (Number(m.cantidad) || Number(m.metros) || 0);
      return acc;
    }, {});

    const sortedDates = Object.keys(ventasPorDia).sort();
    const pagados = activeMovements.filter((m) => m.pagado === 1).length;
    const pendientes = activeMovements.filter((m) => m.pagado === 0).length;

    return {
      ventas: valorUnificado,
      ventasHoy: valorUnificado,
      metaAjustada,
      saldoAnticipos: saldoTotalAnticipos,
      clientes: terceros.length,
      tendencia: {
        x: sortedDates,
        yVentas: sortedDates.map(d => ventasPorDia[d].total),
        yCant: sortedDates.map(d => ventasPorDia[d].cantidad),
        yMetros: sortedDates.map(d => ventasPorDia[d].metros)
      },
      pieData: [
        { name: "Pagados", value: pagados || 0, color: "#6366f1" },
        { name: "Pendientes", value: pendientes || 0, color: "#f43f5e" },
      ],
    };
  }, [movements, anticipos, terceros]);

  const plotConfig = {
    responsive: true,
    displayModeBar: true, 
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'], 
    displaylogo: false,
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>
        {`
          .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; }
          .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
          .avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
        `}
      </style>

      {/* HEADER: Adaptado para apilarse en móvil */}
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900 text-white p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                Resumen del Sistema
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              {getGreeting()} <span className="text-indigo-400">{localStorage.getItem("usuario") || "cgranados"}</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-lg leading-relaxed text-sm md:text-base">
              Estado de operación: Tienes <span className="text-white font-bold">{movements.filter(m => m.estado !== "ANULADA").length} remisiones</span> activas.
            </p>
          </div>
          <button onClick={() => setTab && setTab('generador')} className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 md:px-8 md:py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 w-full lg:w-auto">
            <Package size={20} />
            <span>Nueva Remisión</span>
          </button>
        </div>
      </div>

      {/* KPIs: Grid responsivo 1, 2 o 4 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={<TrendingUp size={24} />} label="Ventas Totales" value={`$${stats.ventas.toLocaleString()}`} color="indigo" onClick={() => setTab && setTab('movimientos')} />
          <StatCard icon={<CreditCard size={24} />} label="Saldo Anticipos" value={`$${stats.saldoAnticipos.toLocaleString()}`} color="emerald" onClick={() => setTab && setTab('archivedAnticipos')} />
          <StatCard icon={<Users size={24} />} label="Total Clientes" value={stats.clientes} color="amber" onClick={() => setTab && setTab('terceros')} />
        </div>
        
        <div className="pro-card p-6 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas de Hoy</span>
          <div className="h-[130px] w-full">
            <Plot
              data={[{
                type: "indicator", mode: "gauge+number", value: stats.ventasHoy,
                number: { prefix: "$", valueformat: ",.0f", font: { size: 20, color: "#1e293b", weight: "900" } },
                gauge: {
                  axis: { range: [0, stats.metaAjustada], tickwidth: 1 },
                  bar: { color: "#6366f1", thickness: 0.25 },
                  bgcolor: "white",
                  steps: [
                    { range: [0, stats.metaAjustada * 0.7], color: "#f1f5f9" },
                    { range: [stats.metaAjustada * 0.7, stats.metaAjustada], color: "#e0e7ff" }
                  ],
                }
              }]}
              layout={{ autosize: true, margin: { t: 30, b: 10, l: 30, r: 30 }, paper_bgcolor: 'rgba(0,0,0,0)' }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">META: ${stats.metaAjustada.toLocaleString()}</p>
        </div>
      </div>

      {/* TENDENCIA: Altura ajustable en móvil */}
      <div className="pro-card p-4 md:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800">Tendencia de Operación</h3>
          <p className="text-sm text-slate-400">Desglose de Ingresos, Despachos y Volumen</p>
        </div>
        <div className="h-[300px] md:h-[400px]">
          <Plot
            data={[
              { 
                x: stats.tendencia.x, y: stats.tendencia.yVentas, 
                type: 'bar', name: 'Ingresos ($)', marker: { color: '#e2e8f0' },
                hovertemplate: '<b>Ingresos</b>: $%{y:,.0f}<extra></extra>'
              },
              { 
                x: stats.tendencia.x, y: stats.tendencia.yCant, 
                type: 'scatter', mode: 'lines+markers', name: 'Remisiones', yaxis: 'y2', 
                line: { color: '#6366f1', width: 3, shape: 'spline' },
                hovertemplate: '<b>Remisiones</b>: %{y} unds<extra></extra>'
              },
              { 
                x: stats.tendencia.x, y: stats.tendencia.yMetros, 
                type: 'scatter', mode: 'lines+markers', name: 'Volumen (m³)', yaxis: 'y2', 
                line: { color: '#10b981', width: 2, dash: 'dot' },
                hovertemplate: '<b>Volumen</b>: %{y} m³<extra></extra>'
              }
            ]}
            layout={{
              autosize: true, showlegend: true, legend: { orientation: 'h', y: -0.2 },
              hovermode: 'x unified',
              margin: { l: 40, r: 40, t: 20, b: 60 },
              paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
              yaxis: { gridcolor: '#f1f5f9', tickformat: '$,.0s' },
              yaxis2: { overlaying: 'y', side: 'right', showgrid: false, title: 'Cant / m³' },
              xaxis: { showgrid: false, type: 'date' }
            }}
            config={plotConfig}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* TABLA Y CARTERA: Apilado en móvil (1 col), Lado a lado en PC (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="pro-card p-6 md:p-8 lg:col-span-2 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Últimos Movimientos</h3>
            <button onClick={() => setTab && setTab('movimientos')} className="text-sm font-bold text-indigo-600 flex items-center gap-1">Ver todos <ChevronRight size={16} /></button>
          </div>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-nowrap">
                  <th className="pb-4">Tercero</th>
                  <th className="pb-4">ID Remisión</th>
                  <th className="pb-4">Valor</th>
                  <th className="pb-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movements.slice(0, 5).map((m, idx) => {
                  const avatar = getAvatarData(m.tercero);
                  return (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div className={`avatar-circle flex-shrink-0 ${avatar.color}`}>{avatar.initials}</div>
                        <span className="font-bold text-slate-700 text-sm capitalize truncate max-w-[120px] md:max-w-none">{m.tercero?.toLowerCase()}</span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-500">REM-{m.remision}</td>
                      <td className="py-4 text-sm font-black text-slate-800">${Number(m.total).toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-block ${
                          m.estado === "ANULADA" ? "bg-rose-100 text-rose-600" :
                          m.pagado === 1 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {m.estado === "ANULADA" ? "ANULADA" : m.pagado === 1 ? "PAGADO" : "PENDIENTE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pro-card p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Estado Cartera</h3>
          <div className="h-[250px]">
            <Plot
              data={[{
                values: stats.pieData.map(d => d.value),
                labels: stats.pieData.map(d => d.name),
                type: 'pie', hole: 0.6,
                marker: { colors: stats.pieData.map(d => d.color) },
                textinfo: "percent", textposition: "inside",
                insidetextfont: { color: "white", weight: "800" }
              }]}
              layout={{ autosize: true, showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 }, paper_bgcolor: 'rgba(0,0,0,0)' }}
              config={plotConfig}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="space-y-3 mt-8">
            {stats.pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div onClick={onClick} className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${themes[color]} border mb-4 shadow-sm`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <p className="text-xl md:text-2xl font-black text-slate-900 tabular-nums truncate">{value}</p>
          <div className={`p-1.5 rounded-lg ${themes[color]} bg-opacity-20 flex-shrink-0`}><ArrowUpRight size={16} /></div>
        </div>
      </div>
    </div>
  );
}