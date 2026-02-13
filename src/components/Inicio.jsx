import React, { useMemo, useState, useEffect } from "react";
import Plot from "react-plotly.js";
import {
  fetchVentasPorFecha,
  fetchCubicajePorMaterial,
  fetchNotificaciones,
} from "../assets/services/apiService";

import NotificationBanner from "./NotificationBanner";
import { getUserData } from "../assets/services/authService"; // Ajusta la ruta si es necesario

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
  // --- LÓGICA DE DATOS Y LIMPIEZA ---
  // Extraemos el nombre del objeto JSON para evitar que se vea el código técnico en pantalla [cite: 16-01-2026]
  const nombreLimpio = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("usuario"));
      return user?.nombreUsuario || "Usuario";
    } catch (e) {
      // Si el localStorage tiene texto plano
      return localStorage.getItem("usuario") || "Usuario";
    }
  })();

  // --- GESTIÓN DE FECHAS ---
  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  // --- ESTADOS DE REACT ---
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [datosApi, setDatosApi] = useState([]);
  const [datosCubicajeApi, setDatosCubicajeApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

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
  //     1,
  //   )
  //     .toISOString()
  //     .split("T")[0];

  //   // saludo personalizado ------------------------
  //   const userData = getUserData();
  //   const nombreParaMostrar = userData ? userData.nombreUsuario : "Usuario";
  //   // ------------------------

  //   const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  //   const [fechaFin, setFechaFin] = useState(hoy);
  //   const [datosApi, setDatosApi] = useState([]);
  //   const [datosCubicajeApi, setDatosCubicajeApi] = useState([]);
  //   const [loading, setLoading] = useState(false);
  //   const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const cargarGraficas = async () => {
      if (!fechaInicio || !fechaFin) return;
      setLoading(true);
      try {
        const response = await fetchVentasPorFecha(fechaInicio, fechaFin);
        setDatosApi(response || []);

        const responseCubicaje = await fetchCubicajePorMaterial(
          fechaInicio,
          fechaFin,
        );
        setDatosCubicajeApi(responseCubicaje || []);
      } catch (error) {
        console.error("Error al cargar datos de gráficas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarGraficas();
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const data = await fetchNotificaciones();
        if (data && data.length > 0) {
          // Filtramos las activas y las ordenamos por fecha (descendente)
          const activasOrdenadas = data
            .filter((n) => n.activa === 1)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

          setNotificaciones(activasOrdenadas);
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };
    cargarNotificaciones();
  }, []);

  const stats = useMemo(() => {
    const listaFechasCompletas = [];
    let fechaActual = new Date(fechaInicio + "T00:00:00");
    const fechaFinal = new Date(fechaFin + "T00:00:00");

    while (fechaActual <= fechaFinal) {
      listaFechasCompletas.push(fechaActual.toISOString().split("T")[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const ingresosMap = {};
    datosApi.forEach((d) => {
      const f = d.Fecha.split("T")[0];
      ingresosMap[f] = Number(d.monto_total);
    });

    const activeMovements = movements.filter((m) => m.estado !== "ANULADA");

    const cantidadesMap = {};
    activeMovements.forEach((m) => {
      const f = m.fecha?.split("T")[0];
      if (f >= fechaInicio && f <= fechaFin) {
        cantidadesMap[f] = (cantidadesMap[f] || 0) + 1;
      }
    });

    const fechas = listaFechasCompletas;
    const ingresos = fechas.map((f) => ingresosMap[f] || 0);
    const cantidades = fechas.map((f) => cantidadesMap[f] || 0);

    const saldoTotalAnticipos = anticipos.reduce(
      (acc, a) => acc + (Number(a.saldo) || 0),
      0,
    );

    const ventasHoy = activeMovements
      .filter((m) => m.fecha?.split("T")[0] === hoy)
      .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

    const movimientosGlobales = activeMovements.filter((m) => {
      const f = m.fecha?.split("T")[0];
      return f >= fechaInicio && f <= fechaFin;
    });

    const ventasRangoGlobal = movimientosGlobales.reduce(
      (acc, m) => acc + (Number(m.total) || 0),
      0,
    );

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
          value: movimientosGlobales.filter((m) => m.pagado === 1).length,
        },
        {
          name: "Pendientes",
          value: movimientosGlobales.filter((m) => m.pagado === 0).length,
        },
      ],
    };
  }, [datosApi, movements, anticipos, terceros, hoy, fechaInicio, fechaFin]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>
        {`
         .pro-card { background: white; border: 1px solid #f1f5f9; border-radius: 28px; transition: all 0.4s ease; position: relative; overflow: hidden; }
          .pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(249, 115, 22, 0.1); }
          .avatar-circle { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: 800; }
          .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(2px); }
          
          /* Nueva animación de rebote lento */
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite;
          }

          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(-5%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
        `}
      </style>

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] border border-white/10">
              Panel de Control Operativo
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              ¡Hola, <span className="text-indigo-400">{nombreLimpio}</span>!
            </h1>

            <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-800/50 rounded-[2rem] border border-slate-700 w-fit backdrop-blur-sm">
              <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-2xl shadow-inner text-slate-800">
                <Calendar size={20} className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">
                    Desde
                  </span>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-transparent text-base font-bold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-indigo-400">
                {" "}
                <ChevronRight size={24} />{" "}
              </div>
              <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-2xl shadow-inner text-slate-800">
                <Calendar size={20} className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">
                    Hasta
                  </span>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-transparent text-base font-bold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setTab && setTab("generador")}
            className="flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 md:px-10 md:py-7 rounded-[28px] font-black transition-all shadow-xl shadow-indigo-500/40 w-full lg:w-auto text-xl"
          >
            <Package size={28} /> <span>Nueva Remisión</span>
          </button>
        </div>
      </div>

      {/* {notificacion && (
        <div className="px-2 animate-bounce-slow">
          {" "}
          <NotificationBanner data={notificacion} />{" "}
        </div>
      )} */}
      {/* Sección de Notificaciones */}

      {/* ================================================================================================ */}
      {/* ---------------------------------------NOTIFICACIONES ------------------------------------------ */}
      {/* ================================================================================================ */}

      {notificaciones.length > 0 && (
        <div className="space-y-4 px-2">
          {notificaciones.map((noti, index) => (
            <div
              key={noti.id_notificacion || `noti.-${index}`}
              className="animate-bounce-slow"
            >
              <NotificationBanner data={noti} />
            </div>
          ))}
        </div>
      )}
      {/* ================================================================================================ */}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatCard
            icon={<TrendingUp size={32} />}
            label="Ventas en Rango"
            value={`$${Math.floor(stats.ventasRangoGlobal).toLocaleString()}`}
            color="indigo"
            onClick={() => setTab && setTab("movimientos")}
          />
          <StatCard
            icon={<CreditCard size={32} />}
            label="Saldo Anticipos"
            value={`$${Math.floor(stats.saldoAnticipos).toLocaleString()}`}
            color="emerald"
            onClick={() => setTab && setTab("archivedAnticipos")}
          />
          <StatCard
            icon={<Users size={32} />}
            label="Total Clientes"
            value={stats.clientes}
            color="amber"
            onClick={() => setTab && setTab("terceros")}
          />
        </div>
        <div className="pro-card p-8 flex flex-col items-center justify-center min-h-[250px]">
          <span className="text-xs font-black text-slate-400 uppercase mb-2">
            Ventas de Hoy
          </span>
          <div className="h-[160px] w-full">
            <Plot
              data={[
                {
                  type: "indicator",
                  mode: "gauge+number",
                  value: stats.ventasHoy,
                  number: {
                    prefix: "$",
                    valueformat: ",.0f",
                    font: { size: 24, color: "#1e293b", weight: "900" },
                  },
                  gauge: {
                    axis: { range: [0, stats.metaAjustada], tickwidth: 1 },
                    bar: { color: "#6366f1", thickness: 0.3 },
                    steps: [
                      { range: [0, stats.metaAjustada], color: "#f1f5f9" },
                    ],
                  },
                },
              ]}
              layout={{
                autosize: true,
                margin: { t: 20, b: 10, l: 20, r: 20 },
                paper_bgcolor: "rgba(0,0,0,0)",
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-2">
            META: ${Math.floor(stats.metaAjustada).toLocaleString()}
          </p>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICA TENDENCIA DE INGRESOS */}
        <div className="pro-card p-8">
          {loading && (
            <div className="loading-overlay">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              Tendencia de Ingresos
            </h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
              Periodo seleccionado
            </p>
          </div>
          <div className="h-[350px]">
            <Plot
              data={[
                {
                  x: stats.grafica.fechas,
                  y: stats.grafica.ingresos,
                  type: "bar",
                  marker: {
                    color: "#6366f1",
                    borderRadius: 8,
                  },
                  // Muestra el valor exacto con separadores de miles al pasar el mouse
                  hovertemplate:
                    "<b>%{x}</b><br>Ingreso: $%{y:,.0f}<extra></extra>",
                },
              ]}
              layout={{
                autosize: true,
                // Aumentamos el margen izquierdo (l: 80) para que los saldos largos quepan bien
                margin: { l: 80, r: 20, t: 30, b: 100 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                yaxis: {
                  gridcolor: "#f1f5f9",
                  // CAMBIO CLAVE: "$,.0f" muestra el saldo real (ej: $21,500,000)
                  tickformat: "$,.0f",
                  tickfont: { size: 11, color: "#64748b" },
                  zeroline: false,
                },
                xaxis: {
                  showgrid: false,
                  type: "category",
                  tickangle: -45,
                  automargin: true,
                  tickfont: { size: 11, color: "#64748b" },
                  // Asegura que se intente mostrar una etiqueta por cada barra
                  dtick: 1,
                },
                // Espaciado estético entre las barras
                bargap: 0.3,
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        {/* GRÁFICA VOLUMEN DE REMISIONES */}
        <div className="pro-card p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              Volumen de Remisiones
            </h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
              Periodo seleccionado
            </p>
          </div>
          <div className="h-[350px]">
            <Plot
              data={[
                {
                  x: stats.grafica.fechas,
                  y: stats.grafica.cantidades,
                  hovertemplate:
                    "<b>Fecha:</b> %{x}<br>" +
                    "<b>Remisiones:</b> %{y}<extra></extra>",
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: "#10b981", width: 4, shape: "spline" },
                  fill: "tozeroy",
                  fillcolor: "rgba(16, 185, 129, 0.05)",
                  marker: { size: 8, color: "#10b981" },
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 50, r: 10, t: 30, b: 80 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                hovermode: "closest",
                yaxis: {
                  gridcolor: "#f1f5f9",
                  rangemode: "tozero",
                  tickfont: { size: 12 },
                },
                xaxis: {
                  showgrid: false,
                  type: "category",
                  tickangle: -45,
                  automargin: true,
                  tickfont: { size: 12 },
                },
              }}
              config={{ responsive: true, displaylogo: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN MOVIMIENTOS Y CARTERA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="pro-card p-8 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">
                Ultimos Movimientos
              </h3>
              <button
                onClick={() => setTab && setTab("movimientos")}
                className="text-base font-bold text-indigo-600 flex items-center gap-1"
              >
                Ver todos <ChevronRight size={18} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-5">Tercero</th>
                    <th className="pb-5">Remisión</th>
                    <th className="pb-5">Valor</th>
                    <th className="pb-5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements
                    .filter((m) => {
                      const f = m.fecha?.split("T")[0];
                      return f >= fechaInicio && f <= fechaFin;
                    })
                    .slice(0, 5)
                    .map((m, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-5 flex items-center gap-4">
                          <div className="avatar-circle bg-indigo-500">
                            {(m.tercero || "??")[0]}
                          </div>
                          <span className="font-bold text-slate-700 text-base">
                            {m.tercero}
                          </span>
                        </td>
                        <td className="py-5 text-base font-semibold text-slate-500">
                          REM-{m.remision}
                        </td>
                        <td className="py-5 text-lg font-black text-slate-800">
                          ${Math.floor(Number(m.total)).toLocaleString()}
                        </td>
                        <td className="py-5 text-right">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-black ${
                              m.estado === "ANULADA"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {m.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="pro-card p-8 flex flex-col h-full bg-white shadow-sm border border-slate-100">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Cartera del Periodo
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Basado en el periodo seleccionado
              </p>
            </div>
            <div className="relative h-[280px] w-full flex items-center justify-center mb-8">
              <Plot
                data={[
                  {
                    values: stats.pieData.map((d) => d.value),
                    labels: stats.pieData.map((d) => d.name),
                    type: "pie",
                    hole: 0.68,
                    marker: {
                      colors: ["#6366f1", "#94a3b8"],
                      line: { color: "white", width: 5 },
                    },
                    textinfo: "percent",
                    textposition: "inside",
                    insidetextfont: {
                      color: "white",
                      weight: "bold",
                      size: 16,
                    },
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
                <span className="text-4xl font-black text-slate-800 tracking-tighter">
                  {stats.pieData.reduce((a, b) => a + b.value, 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Movimientos
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {stats.pieData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100/80"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: idx === 0 ? "#6366f1" : "#94a3b8",
                      }}
                    ></div>
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CUBICAJE RESUMEN INFERIOR */}
      <div className="w-full">
        <div className="pro-card p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Cubicaje por Material
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Resumen del periodo
                </p>
              </div>
            </div>

            <div className="bg-slate-900 px-6 py-4 rounded-[24px] flex flex-col items-end">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                Total Despachado
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {Math.floor(
                    datosCubicajeApi.reduce(
                      (acc, item) => acc + Number(item.total_cubicaje),
                      0,
                    ),
                  ).toLocaleString()}
                </span>
                <span className="text-lg font-bold text-indigo-400">m³</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {datosCubicajeApi.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-[24px] border border-slate-100 bg-slate-50/30 group hover:border-indigo-300 transition-all"
              >
                <span className="text-sm font-black text-slate-900 uppercase block mb-2 tracking-tight">
                  {item.material}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">
                    {Math.floor(Number(item.total_cubicaje)).toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-indigo-500">
                    m³
                  </span>
                </div>
                <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        (item.total_cubicaje / 500) * 100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
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
    indigo:
      "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
  };

  return (
    <div
      onClick={onClick}
      className="pro-card p-8 flex flex-col justify-between min-h-[190px] cursor-pointer group"
    >
      <div
        className={`h-16 w-16 rounded-[20px] flex items-center justify-center ${themes[color]} border mb-6 shadow-sm transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <p className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums truncate">
            {value}
          </p>
          <div className={`p-2 rounded-xl ${themes[color]} bg-opacity-20`}>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
