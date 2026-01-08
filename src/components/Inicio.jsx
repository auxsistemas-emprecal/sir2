import React, { useMemo, useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { fetchVentasPorFecha } from "../assets/services/apiService"; 

import {
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  CreditCard,
  ChevronRight,
  Calendar,
  Loader2,
  Filter,
  Truck 
} from "lucide-react";

export default function Inicio({
  movements = [],
  anticipos = [],
  terceros = [],
  setTab,
}) {
  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [datosApi, setDatosApi] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modoFiltroCartera, setModoFiltroCartera] = useState('mes'); 
  const [mesCartera, setMesCartera] = useState(new Date().getMonth());
  const [anioCartera, setAnioCartera] = useState(new Date().getFullYear());
  const [fechaInicioCartera, setFechaInicioCartera] = useState(hoy);
  const [fechaFinCartera, setFechaFinCartera] = useState(hoy);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    const cargarGraficas = async () => {
      if (!fechaInicio || !fechaFin) return;
      setLoading(true);
      try {
        const response = await fetchVentasPorFecha(fechaInicio, fechaFin);
        setDatosApi(response || []);
      } catch (error) {
        console.error("Error al cargar datos de gráficas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarGraficas();
  }, [fechaInicio, fechaFin]);

  const stats = useMemo(() => {
    const fechas = datosApi.map(d => d.Fecha);
    const ingresos = datosApi.map(d => Number(d.monto_total));
    const cantidades = datosApi.map(d => Number(d.cantidad_remisiones));

    const activeMovements = movements.filter((m) => m.estado !== "ANULADA");
    const saldoTotalAnticipos = anticipos.reduce((acc, a) => acc + (Number(a.saldo) || 0), 0);
    
    const ventasHoy = activeMovements
      .filter(m => m.fecha?.split("T")[0] === hoy)
      .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

    const movimientosGlobales = activeMovements.filter(m => {
      const f = m.fecha?.split("T")[0];
      return f >= fechaInicio && f <= fechaFin;
    });

    const ventasRangoGlobal = movimientosGlobales.reduce((acc, m) => acc + (Number(m.total) || 0), 0);

    // Lógica de Cubicaje por Material (Usando datos de movimientos)
    const cubicajeAgrupado = {};
    movimientosGlobales.forEach(m => {
      const material = m.nombre_material || m.material || "Sin Clasificar";
      const valorCubicaje = Number(m.cubicaje) || 0;
      cubicajeAgrupado[material] = (cubicajeAgrupado[material] || 0) + valorCubicaje;
    });

    const dataCubicaje = Object.entries(cubicajeAgrupado)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);

    const movimientosFiltradosCartera = activeMovements.filter(m => {
      const fechaMov = m.fecha?.split("T")[0];
      if (modoFiltroCartera === 'mes') {
        const f = new Date(m.fecha);
        return f.getMonth() === mesCartera && f.getFullYear() === anioCartera;
      } else {
        return fechaMov >= fechaInicioCartera && fechaMov <= fechaFinCartera;
      }
    });

    return {
      ventasRangoGlobal,
      ventasHoy,
      metaAjustada: ventasHoy > 5000000 ? ventasHoy * 1.2 : 5000000,
      saldoAnticipos: saldoTotalAnticipos,
      clientes: terceros.length,
      grafica: { fechas, ingresos, cantidades },
      dataCubicaje,
      pieData: [
        { name: "Pagados", value: movimientosFiltradosCartera.filter(m => m.pagado === 1).length, color: "#6366f1" }, 
        { name: "Pendientes", value: movimientosFiltradosCartera.filter(m => m.pagado === 0).length, color: "#94a3b8" }, 
      ],
    };
  }, [datosApi, movements, anticipos, terceros, hoy, mesCartera, anioCartera, modoFiltroCartera, fechaInicioCartera, fechaFinCartera, fechaInicio, fechaFin]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>
        {`
          .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; position: relative; overflow: hidden; }
          .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.05); }
          .avatar-circle { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
          .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-blur: 2px; }
          .select-custom { background: transparent; border: none; font-size: 11px; font-weight: 800; color: #6366f1; cursor: pointer; outline: none; }
          .btn-toggle { font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 8px; text-transform: uppercase; transition: all 0.3s; }
        `}
      </style>

      {/* HEADER - DISEÑO INDIGO ORIGINAL */}
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900 text-white p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                Panel de Control Operativo
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              ¡Hola, <span className="text-indigo-400">{localStorage.getItem("usuario") || "Admin"}</span>!
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" />
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-indigo-300 transition-colors text-white"/>
              </div>
              <span className="text-slate-600 text-[10px] font-black">HASTA</span>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-indigo-300 transition-colors text-white" />
            </div>
          </div>
          <button onClick={() => setTab && setTab("generador")} className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 md:px-8 md:py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 w-full lg:w-auto">
            <Package size={20} />
            <span>Nueva Remisión</span>
          </button>
        </div>
      </div>

      {/* KPIs - ESTILO ORIGINAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={<TrendingUp size={24} />} label="Ventas en Rango" value={`$${stats.ventasRangoGlobal.toLocaleString()}`} color="indigo" onClick={() => setTab && setTab("movimientos")} />
          <StatCard icon={<CreditCard size={24} />} label="Saldo Anticipos" value={`$${stats.saldoAnticipos.toLocaleString()}`} color="emerald" onClick={() => setTab && setTab("archivedAnticipos")} />
          <StatCard icon={<Users size={24} />} label="Total Clientes" value={stats.clientes} color="amber" onClick={() => setTab && setTab("terceros")} />
        </div>
        <div className="pro-card p-6 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas de Hoy</span>
          <div className="h-[130px] w-full">
            <Plot data={[{ type: "indicator", mode: "gauge+number", value: stats.ventasHoy, number: { prefix: "$", valueformat: ",.0f", font: { size: 20, color: "#1e293b", weight: "900" } }, gauge: { axis: { range: [0, stats.metaAjustada], tickwidth: 1 }, bar: { color: "#6366f1", thickness: 0.25 }, steps: [{ range: [0, stats.metaAjustada], color: "#f1f5f9" }] } }]} layout={{ autosize: true, margin: { t: 30, b: 10, l: 30, r: 30 }, paper_bgcolor: "rgba(0,0,0,0)" }} config={{ displayModeBar: false }} style={{ width: "100%", height: "100%" }} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">META: ${stats.metaAjustada.toLocaleString()}</p>
        </div>
      </div>

      {/* GRÁFICAS DE TENDENCIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="pro-card p-6">
          {loading && <div className="loading-overlay"><Loader2 className="animate-spin text-indigo-500" /></div>}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{fechaInicio} a {fechaFin}</p>
          </div>
          <div className="h-[300px]">
            <Plot data={[{ x: stats.grafica.fechas, y: stats.grafica.ingresos, type: "bar", marker: { color: "#6366f1", borderRadius: 8 } }]} layout={{ autosize: true, margin: { l: 40, r: 10, t: 30, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", yaxis: { gridcolor: "#f1f5f9", tickformat: "$,.0s" }, xaxis: { showgrid: false } }} config={{ responsive: true, displaylogo: false }} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
        <div className="pro-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Volumen de Remisiones</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Conteo de despachos</p>
          </div>
          <div className="h-[300px]">
            <Plot data={[{ x: stats.grafica.fechas, y: stats.grafica.cantidades, type: "scatter", mode: "lines+markers", line: { color: "#10b981", width: 3, shape: "spline" }, fill: 'tozeroy', fillcolor: 'rgba(16, 185, 129, 0.05)' }]} layout={{ autosize: true, margin: { l: 30, r: 10, t: 30, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", yaxis: { gridcolor: "#f1f5f9" }, xaxis: { showgrid: false } }} config={{ responsive: true, displaylogo: false }} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* ÚLTIMOS MOVIMIENTOS */}
          <div className="pro-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">Últimos Movimientos</h3>
              <button onClick={() => setTab && setTab("movimientos")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
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

          {/* CUBICAJE POR MATERIAL (NUEVA) */}
          <div className="pro-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Cubicaje por Material</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resumen del Periodo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.dataCubicaje.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 group hover:border-indigo-300 transition-all">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{item.nombre}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">{item.total.toLocaleString()}</span>
                    <span className="text-sm font-bold text-indigo-500">m³</span>
                  </div>
                  <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min((item.total/500)*100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARTERA - ESTILO ORIGINAL */}
        <div className="pro-card p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-slate-800">Estado Cartera</h3>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-2">
                <button onClick={() => setModoFiltroCartera('mes')} className={`btn-toggle ${modoFiltroCartera === 'mes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Mes</button>
                <button onClick={() => setModoFiltroCartera('dias')} className={`btn-toggle ${modoFiltroCartera === 'dias' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Días</button>
              </div>
              <div className="mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {modoFiltroCartera === 'mes' ? (
                  <select className="select-custom" value={mesCartera} onChange={(e) => setMesCartera(parseInt(e.target.value))}>
                    {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                ) : (
                  <input type="date" className="select-custom text-[9px]" value={fechaInicioCartera} onChange={(e) => setFechaInicioCartera(e.target.value)} />
                )}
              </div>
            </div>
          </div>
          <div className="h-[220px]">
            <Plot data={[{ values: stats.pieData.map(d => d.value), labels: stats.pieData.map(d => d.name), type: "pie", hole: 0.6, marker: { colors: stats.pieData.map(d => d.color) } }]} layout={{ autosize: true, showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 }, paper_bgcolor: "rgba(0,0,0,0)" }} config={{ displayModeBar: false }} style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="space-y-3 mt-6">
            {stats.pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
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
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
  };
  return (
    <div onClick={onClick} className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer group">
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



// import React, { useMemo, useState, useEffect } from "react";
// import Plot from "react-plotly.js";
// import { fetchVentasPorFecha } from "../assets/services/apiService"; 

// import {
//   TrendingUp,
//   Users,
//   Package,
//   ArrowUpRight,
//   CreditCard,
//   ChevronRight,
//   Calendar,
//   Loader2,
//   Filter
// } from "lucide-react";

// export default function Inicio({
//   movements = [],
//   anticipos = [],
//   terceros = [],
//   setTab,
// }) {
//   // --- ESTADOS GLOBALES Y DE API ---
//   const hoy = new Date().toISOString().split("T")[0];
//   const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  
//   const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
//   const [fechaFin, setFechaFin] = useState(hoy);
//   const [datosApi, setDatosApi] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // --- ESTADOS PARA FILTRO DE CARTERA (Funcionalidad recuperada) ---
//   const [modoFiltroCartera, setModoFiltroCartera] = useState('mes'); // 'mes' o 'dias'
//   const [mesCartera, setMesCartera] = useState(new Date().getMonth());
//   const [anioCartera, setAnioCartera] = useState(new Date().getFullYear());
//   const [fechaInicioCartera, setFechaInicioCartera] = useState(hoy);
//   const [fechaFinCartera, setFechaFinCartera] = useState(hoy);

//   const meses = [
//     "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
//     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
//   ];

//   // --- EFECTO: CARGA DE DATOS API ---
//   useEffect(() => {
//     const cargarGraficas = async () => {
//       if (!fechaInicio || !fechaFin) return;
//       setLoading(true);
//       try {
//         const response = await fetchVentasPorFecha(fechaInicio, fechaFin);
//         setDatosApi(response || []);
//       } catch (error) {
//         console.error("Error al cargar datos de gráficas:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     cargarGraficas();
//   }, [fechaInicio, fechaFin]);

//   // --- FUNCIONES DE APOYO ---
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

//   // --- LÓGICA DE PROCESAMIENTO (Stats unificadas) ---
//   const stats = useMemo(() => {
//     const fechas = datosApi.map(d => d.Fecha);
//     const ingresos = datosApi.map(d => Number(d.monto_total));
//     const cantidades = datosApi.map(d => Number(d.cantidad_remisiones));

//     const activeMovements = movements.filter((m) => m.estado !== "ANULADA");
//     const saldoTotalAnticipos = anticipos.reduce((acc, a) => acc + (Number(a.saldo) || 0), 0);
    
//     const ventasHoy = activeMovements
//       .filter(m => m.fecha?.split("T")[0] === hoy)
//       .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

//     // Ventas basadas en el rango del Header
//     const ventasRangoGlobal = activeMovements
//       .filter(m => {
//         const f = m.fecha?.split("T")[0];
//         return f >= fechaInicio && f <= fechaFin;
//       })
//       .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

//     // Filtro específico para la Cartera (Inferior)
//     const movimientosFiltradosCartera = activeMovements.filter(m => {
//       const fechaMov = m.fecha?.split("T")[0];
//       if (modoFiltroCartera === 'mes') {
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
//       pieData: [
//         { name: "Pagados", value: movimientosFiltradosCartera.filter(m => m.pagado === 1).length, color: "#6366f1" }, 
//         { name: "Pendientes", value: movimientosFiltradosCartera.filter(m => m.pagado === 0).length, color: "#94a3b8" }, 
//       ],
//     };
//   }, [datosApi, movements, anticipos, terceros, hoy, mesCartera, anioCartera, modoFiltroCartera, fechaInicioCartera, fechaFinCartera, fechaInicio, fechaFin]);

//   const plotConfig = { 
//     responsive: true, 
//     displayModeBar: true, 
//     displaylogo: false,
//     modeBarButtonsToRemove: ["lasso2d", "select2d"]
//   };

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

//       {/* HEADER - DISEÑO INDIGO CON FILTRO GLOBAL */}
//       <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-slate-900 text-white p-6 md:p-10 shadow-2xl">
//         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
//           <div>
//             <div className="flex items-center gap-2 mb-3">
//               <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
//                 Panel de Control Operativo
//               </span>
//             </div>
//             <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
//               {getGreeting()}{" "}
//               <span className="text-indigo-400">{localStorage.getItem("usuario") || "Admin"}</span>
//             </h1>
            
//             <div className="flex flex-wrap items-center gap-4 mt-4 bg-white/5 p-3 rounded-2xl border border-white/10 w-fit">
//               <div className="flex items-center gap-2">
//                 <Calendar size={14} className="text-indigo-400" />
//                 <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-indigo-300 transition-colors text-white"/>
//               </div>
//               <span className="text-slate-600 text-[10px] font-black">HASTA</span>
//               <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-indigo-300 transition-colors text-white" />
//             </div>
//           </div>
//           <button onClick={() => setTab && setTab("generador")} className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 md:px-8 md:py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 w-full lg:w-auto">
//             <Package size={20} />
//             <span>Nueva Remisión</span>
//           </button>
//         </div>
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
//           <StatCard icon={<TrendingUp size={24} />} label="Ventas en Rango" value={`$${stats.ventasRangoGlobal.toLocaleString()}`} color="indigo" onClick={() => setTab && setTab("movimientos")} />
//           <StatCard icon={<CreditCard size={24} />} label="Saldo Anticipos" value={`$${stats.saldoAnticipos.toLocaleString()}`} color="emerald" onClick={() => setTab && setTab("archivedAnticipos")} />
//           <StatCard icon={<Users size={24} />} label="Total Clientes" value={stats.clientes} color="amber" onClick={() => setTab && setTab("terceros")} />
//         </div>
//         <div className="pro-card p-6 flex flex-col items-center justify-center min-h-[220px]">
//           <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas de Hoy</span>
//           <div className="h-[130px] w-full">
//             <Plot data={[{ type: "indicator", mode: "gauge+number", value: stats.ventasHoy, number: { prefix: "$", valueformat: ",.0f", font: { size: 20, color: "#1e293b", weight: "900" } }, gauge: { axis: { range: [0, stats.metaAjustada], tickwidth: 1 }, bar: { color: "#6366f1", thickness: 0.25 }, steps: [{ range: [0, stats.metaAjustada], color: "#f1f5f9" }] } }]} layout={{ autosize: true, margin: { t: 30, b: 10, l: 30, r: 30 }, paper_bgcolor: "rgba(0,0,0,0)" }} config={{ displayModeBar: false }} style={{ width: "100%", height: "100%" }} />
//           </div>
//           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">META: ${stats.metaAjustada.toLocaleString()}</p>
//         </div>
//       </div>

//       {/* GRÁFICAS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="pro-card p-6">
//           {loading && <div className="loading-overlay"><Loader2 className="animate-spin text-indigo-500" /></div>}
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h3>
//             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{fechaInicio} a {fechaFin}</p>
//           </div>
//           <div className="h-[300px]">
//             <Plot data={[{ x: stats.grafica.fechas, y: stats.grafica.ingresos, type: "bar", marker: { color: "#6366f1", borderRadius: 8 }, hovertemplate: "$%{y:,.0f}<extra></extra>" }]} layout={{ autosize: true, margin: { l: 40, r: 10, t: 30, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", yaxis: { gridcolor: "#f1f5f9", tickformat: "$,.0s" }, xaxis: { showgrid: false } }} config={plotConfig} style={{ width: "100%", height: "100%" }} />
//           </div>
//         </div>
//         <div className="pro-card p-6">
//           {loading && <div className="loading-overlay"><Loader2 className="animate-spin text-emerald-500" /></div>}
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-slate-800">Volumen de Remisiones</h3>
//             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Conteo de despachos</p>
//           </div>
//           <div className="h-[300px]">
//             <Plot data={[{ x: stats.grafica.fechas, y: stats.grafica.cantidades, type: "scatter", mode: "lines+markers", line: { color: "#10b981", width: 3, shape: "spline" }, fill: 'tozeroy', fillcolor: 'rgba(16, 185, 129, 0.05)', hovertemplate: "%{y} remisiones<extra></extra>" }]} layout={{ autosize: true, margin: { l: 30, r: 10, t: 30, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", yaxis: { gridcolor: "#f1f5f9" }, xaxis: { showgrid: false } }} config={plotConfig} style={{ width: "100%", height: "100%" }} />
//           </div>
//         </div>
//       </div>

//       {/* SECCIÓN INFERIOR: ÚLTIMOS MOVIMIENTOS Y CARTERA FILTRABLE */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="pro-card p-6 md:p-8 lg:col-span-2 overflow-hidden">
//           <div className="flex justify-between items-center mb-8">
//             <h3 className="text-xl font-bold text-slate-800">Últimos Movimientos</h3>
//             <button onClick={() => setTab && setTab("movimientos")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//               Ver todos <ChevronRight size={16} />
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
//                   <th className="pb-4">Tercero</th>
//                   <th className="pb-4">Remisión</th>
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

//         {/* CARTERA CON FUNCIONALIDAD DE FILTRO DUAL */}
//         <div className="pro-card p-6 md:p-8">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h3 className="text-xl font-bold text-slate-800">Estado Cartera</h3>
//               <div className="flex gap-2 mt-2">
//                 <button onClick={() => setModoFiltroCartera('mes')} className={`btn-toggle ${modoFiltroCartera === 'mes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Mes</button>
//                 <button onClick={() => setModoFiltroCartera('dias')} className={`btn-toggle ${modoFiltroCartera === 'dias' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Días</button>
//               </div>
//             </div>
//             <div className="flex flex-col items-end gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
//                 {modoFiltroCartera === 'mes' ? (
//                   <>
//                     <div className="flex items-center gap-1">
//                       <Filter size={10} className="text-indigo-400" />
//                       <select className="select-custom" value={mesCartera} onChange={(e) => setMesCartera(parseInt(e.target.value))}>
//                         {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
//                       </select>
//                     </div>
//                     <input type="number" className="select-custom w-12 text-right" value={anioCartera} onChange={(e) => setAnioCartera(parseInt(e.target.value))} />
//                   </>
//                 ) : (
//                   <div className="flex flex-col gap-1 items-end">
//                     <input type="date" className="select-custom text-[9px]" value={fechaInicioCartera} onChange={(e) => setFechaInicioCartera(e.target.value)} />
//                     <span className="text-[7px] font-black text-slate-300">HASTA</span>
//                     <input type="date" className="select-custom text-[9px]" value={fechaFinCartera} onChange={(e) => setFechaFinCartera(e.target.value)} />
//                   </div>
//                 )}
//             </div>
//           </div>

//           <div className="h-[220px]">
//             <Plot data={[{ values: stats.pieData.map((d) => d.value), labels: stats.pieData.map((d) => d.name), type: "pie", hole: 0.6, marker: { colors: stats.pieData.map((d) => d.color) }, textinfo: "percent", insidetextfont: { color: "white", weight: "800" } }]} layout={{ autosize: true, showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 }, paper_bgcolor: "rgba(0,0,0,0)" }} config={{ displayModeBar: false }} style={{ width: "100%", height: "100%" }} />
//           </div>
//           <div className="space-y-3 mt-6">
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
//     indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
//     emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
//     amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
//   };
//   return (
//     <div onClick={onClick} className="pro-card p-6 flex flex-col justify-between min-h-[160px] cursor-pointer group">
//       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${themes[color]} border mb-4 shadow-sm transition-transform group-hover:scale-110`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
//         <div className="flex items-end justify-between">
//           <p className="text-xl md:text-2xl font-black text-slate-900 tabular-nums truncate">{value}</p>
//           <div className={`p-1.5 rounded-lg ${themes[color]} bg-opacity-20`}>
//             <ArrowUpRight size={16} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }                         