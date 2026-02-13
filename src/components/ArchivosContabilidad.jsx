import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  FileText, 
  User, 
  Download,
  SendHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2
} from "lucide-react";

// IMPORTAMOS TUS SERVICIOS
import { updateMovimiento, fetchMovimiento, fetchReporteDetalladoContabilidad } from "../assets/services/apiService";

const Contabilidad = ({ movements = [], onRefresh }) => {
  const [filtro, setFiltro] = useState({
    remision: "", tercero: "", fechaDesde: "", fechaHasta: "",
  });

  const [movimientosLocales, setMovimientosLocales] = useState(movements);
  const [facturas, setFacturas] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ message: null, type: null });

  useEffect(() => {
    setMovimientosLocales(movements);
  }, [movements]);

  useEffect(() => {
    if (statusMessage.message) {
      const timer = setTimeout(() => setStatusMessage({ message: null, type: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

      const { estadisticas, datosPaginados, totalPaginas, totalFiltrados, todosLosFiltrados } = useMemo(() => {
      const movFiltrados = movimientosLocales.filter((m) => {
      const cumpleRemision = m.remision?.toString().includes(filtro.remision);
      const cumpleTercero = m.tercero?.toLowerCase().includes(filtro.tercero.toLowerCase());
      const fechaMov = m.fecha?.split("T")[0];
      const cumpleFecha = (!filtro.fechaDesde || fechaMov >= filtro.fechaDesde) &&
                          (!filtro.fechaHasta || fechaMov <= filtro.fechaHasta);
      return cumpleRemision && cumpleTercero && cumpleFecha;
    });

    const pagado = movFiltrados.filter(m => m.pagado === 1 && m.estado !== "ANULADA").reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const pendiente = movFiltrados.filter(m => m.pagado === 0 && m.estado !== "ANULADA").reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

    const paginasTotales = Math.ceil(movFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    
    return { 
      estadisticas: { pagado, pendiente, cartera: pendiente },
      datosPaginados: movFiltrados.slice(inicio, inicio + registrosPorPagina),
      totalPaginas: paginasTotales,
      totalFiltrados: movFiltrados.length,
      todosLosFiltrados: movFiltrados
    };
  }, [movimientosLocales, filtro, paginaActual, registrosPorPagina]);

  const toggleEstado = async (mov) => {
    const nuevoEstado = mov.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";
    const confirmar = window.confirm(`¿Cambiar estado de la remisión ${mov.remision} a ${nuevoEstado}?`);
    if (!confirmar) return;

    setIsLoading(true);
    try {
      const movCompleto = await fetchMovimiento(mov.remision);
      const movActualizado = { ...movCompleto, estado: nuevoEstado };
      await updateMovimiento(mov.remision, movActualizado);

      setMovimientosLocales(prev => 
        prev.map(m => m.remision === mov.remision ? { ...m, estado: nuevoEstado } : m)
      );

      setStatusMessage({ message: `Remisión ${nuevoEstado}`, type: "success" });
      if (onRefresh) onRefresh(); 
    } catch (error) {
      setStatusMessage({ message: "Error al actualizar", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviarFactura = async (mov) => {
    const nFactura = facturas[mov.id || mov.remision];
    if (!nFactura) {
      setStatusMessage({ message: "Escribe un número de factura", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const movCompleto = await fetchMovimiento(mov.remision);
      const movActualizado = { ...movCompleto, factura: nFactura };
      await updateMovimiento(mov.remision, movActualizado);

      setMovimientosLocales(prev => 
        prev.map(m => m.remision === mov.remision ? { ...m, factura: nFactura } : m)
      );

      setStatusMessage({ message: "Factura guardada", type: "success" });
      if (onRefresh) onRefresh();
    } catch (error) {
      setStatusMessage({ message: "Error al guardar factura", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const exportarAExcel = async () => {
  // 1. Validar que existan fechas en el filtro antes de consultar el reporte detallado
  if (!filtro.fechaDesde || !filtro.fechaHasta) {
    return alert("Por favor seleccione un rango de fechas (Desde y Hasta) para exportar el reporte detallado.");
  }

  setIsLoading(true);
  setStatusMessage({ message: "Generando reporte detallado...", type: "info" });

  try {
    // 2. Llamar al nuevo servicio detallado usando las fechas de tus inputs de filtro
    const datosDetallados = await fetchReporteDetalladoContabilidad(filtro.fechaDesde, filtro.fechaHasta);

    if (!datosDetallados || datosDetallados.length === 0) {
      setIsLoading(false);
      return alert("No se encontraron registros detallados en este rango de fechas.");
    }

    // 3. Mapear los datos que vienen de la API al formato de Excel
    const dataFormatted = datosDetallados.map(m => ({
      // --- Información Básica ---
      "Estado": m.estado,
      "Fecha": m.fecha?.split("T")[0],
      "Remisión": m.remision,
      "N° Factura": m.factura || "Pendiente",
      "Usuario": m.usuario,

      // --- Datos del Tercero / Cliente ---
      "Tercero / Cliente": m.nombre_tercero?.toUpperCase(),
      "Cédula/NIT": m.cedula_tercero || "N/A",
      "Teléfono Tercero": m.telefono_tercero || "N/A",
      "Dirección Tercero": m.direccion_tercero || "N/A",

      // --- Detalles del Item / Material ---
      "ID Item": m.No_Items,
      "Material": m.nombre_material,
      "Cantidad": m.cantidad || 0,
      "Precio Unitario": m.precioUnitario || 0,
      "Subtotal Item": m.subtotal_item || 0,
      "IVA Item": m.iva_item || 0,
      "Retención Item": m.retencion_item || 0,
      "Total Item": m.total_item || 0,

      // --- Totales del Movimiento ---
      "Subtotal General": m.subtotal_total_mov || 0,
      "IVA General": m.iva_total_mov || 0,
      "Retención General": m.retencion_total_mov || 0,
      "Total General": m.total_total_mov || 0,

      // --- Logística y Transporte ---
      "Dirección Entrega": m.direccion_entrega,
      "Conductor": m.conductor,
      "Placa": m.placa || "N/A",
      "Peso Entrada": m.pesoEntrada || 0,
      "Peso Salida": m.pesoSalida || 0,
      "Peso Neto": m.pesoNeto || 0,
      "Cubicaje": m.cubicaje || 0,

      // --- Pago y Observaciones ---
      "Método de Pago": m.tipo_pago || "No definido",
      "Pagado": m.pagado === 1 ? "Sí" : "No",
      "Fecha Pago": m.fechaPago,
      "Observación": m.observacion || "Sin observaciones"
    }));

    // 4. Crear el archivo Excel
    const worksheet = XLSX.utils.json_to_sheet(dataFormatted);
    
    // Ajuste automático de columnas (opcional)
    const wscols = Object.keys(dataFormatted[0]).map(() => ({ wch: 20 }));
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detalle Contable");
    
    // Nombre del archivo con las fechas
    XLSX.writeFile(workbook, `Reporte_Detallado_${filtro.fechaDesde}_al_${filtro.fechaHasta}.xlsx`);
    
    setStatusMessage({ message: "Excel exportado con éxito", type: "success" });
  } catch (error) {
    console.error("Error al exportar excel:", error);
    setStatusMessage({ message: "Error al generar el reporte", type: "error" });
  } finally {
    setIsLoading(false);
  }
    };
//   const exportarAExcel = () => {
//     if (todosLosFiltrados.length === 0) return alert("No hay datos para exportar");

//         const dataFormatted = todosLosFiltrados.map(m => ({
//       // --- Información Básica ---
//       "Estado": m.estado,
//       "Fecha": m.fecha?.split("T")[0],
//       "Remisión": m.remision,
//       "N° Factura": m.factura || "Pendiente",
//       "Usuario": m.usuario,

//       // --- Datos del Tercero / Cliente ---
//       "Tercero / Cliente": m.nombre_tercero?.toUpperCase(),
//       "Cédula/NIT": m.cedula_tercero || "N/A",
//       "Teléfono Tercero": m.telefono_tercero || "N/A",
//       "Dirección Tercero": m.direccion_tercero || "N/A",

//       // --- Detalles del Item / Material ---
//       "ID Item": m.No_Items,
//       "Material": m.nombre_material,
//       "Cantidad": m.cantidad || 0,
//       "Precio Unitario": m.precioUnitario || 0,
//       "Subtotal Item": m.subtotal_item || 0,
//       "IVA Item": m.iva_item || 0,
//       "Retención Item": m.retencion_item || 0,
//       "Total Item": m.total_item || 0,

//       // --- Totales del Movimiento ---
//       "Subtotal": m.subtotal_total_mov || 0,
//       "IVA": m.iva_total_mov || 0,
//       "Retención": m.retencion_total_mov || 0,
//       "Total": m.total_total_mov || 0,

//       // --- Logística y Transporte ---
//       "Dirección Entrega": m.direccion_entrega,
//       "Conductor": m.conductor,
//       "Placa": m.placa || "N/A",
//       "Peso Entrada": m.pesoEntrada || 0,
//       "Peso Salida": m.pesoSalida || 0,
//       "Peso Neto": m.pesoNeto || 0,
//       "Cubicaje": m.cubicaje || 0,

//       // --- Pago y Observaciones ---
//       "Método de Pago": m.tipo_pago || "No definido",
//       "Pagado": m.pagado === 1 ? "Sí" : "No",
//       "Fecha Pago": m.fechaPago,
//       "Observación": m.observacion || "Sin observaciones"
//     }));

// ----------------------------------------------------------------------

    // console.log("Exportando datos a Excel:", todosLosFiltrados);
    

    // const dataFormatted = todosLosFiltrados.map(m => ({
    //   "Estado": m.estado,
    //   "Fecha": m.fecha?.split("T")[0],
    //   "Remisión": m.remision,
    //   "Tercero / Cliente": m.tercero?.toUpperCase(),
    //   "Cédula/NIT": m.cedula || m.nit || "N/A",
    //   "Subtotal": m.subtotal || 0,        
    //   "IVA": m.iva || 0,                  
    //   "Retención": m.retencion || 0,      
    //   "Total": m.total || 0,
    // //   "N° Factura": m.factura || "Pendiente",
    //   "Método de Pago": m.tipo_pago || m.pago || "No definido",
    //   "Placa": m.placa || "N/A",
    // }));

    // ----------------------------------------------------------------------

    //     const worksheet = XLSX.utils.json_to_sheet(dataFormatted);
    //     const wscols = [{wch: 10}, {wch: 12}, {wch: 10}, {wch: 35}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}];
    //     worksheet['!cols'] = wscols;

    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
    //     XLSX.writeFile(workbook, `Reporte_Contable_${new Date().toISOString().split('T')[0]}.xlsx`);
    //   };

  const formatMoney = (amount) => 
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

  const handleFacturaChange = (id, value) => setFacturas(prev => ({ ...prev, [id]: value }));

  const getPagoStyle = (tipo) => {
    const base = "px-3 py-1 rounded-md font-bold text-[10px] border transition-all duration-300 shadow-sm inline-block min-w-[100px] text-center uppercase tracking-tighter";
    const metodo = tipo?.toString().toUpperCase() || "";
    if (metodo.includes("EFECTIVO")) return `${base} border-blue-400 text-blue-600 bg-blue-50/50`;
    if (metodo.includes("CRÉDITO") || metodo.includes("CREDITO")) return `${base} border-indigo-400 text-indigo-600 bg-indigo-50/50`;
    return `${base} border-slate-200 text-slate-400 bg-slate-50`;
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ALERTAS FEEDBACK */}
      {statusMessage.message && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-2xl text-white font-bold shadow-2xl animate-in slide-in-from-right-10 ${
          statusMessage.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>
          {statusMessage.type === "error" ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          {statusMessage.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-emerald-800 to-emerald-700 p-6 rounded-2xl shadow-lg text-white">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reportes de Contabilidad</h2>
          <p className="text-emerald-100 text-sm opacity-90 font-medium">Gestión de archivos financieros y facturación</p>
        </div>
        <button onClick={exportarAExcel} className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-semibold transition-all border border-white/10 active:scale-95 text-sm shadow-sm">
          <Download size={18} />
          <span>Exportar Excel</span>
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="N° Remisión" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 text-sm font-medium transition-all"
              value={filtro.remision}
              onChange={(e) => { setFiltro({...filtro, remision: e.target.value}); setPaginaActual(1); }}
            />
          </div>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Tercero / Cliente" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 text-sm font-medium transition-all"
              value={filtro.tercero}
              onChange={(e) => { setFiltro({...filtro, tercero: e.target.value}); setPaginaActual(1); }}
            />
          </div>
          <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-600 transition-all cursor-pointer" onChange={(e) => setFiltro({...filtro, fechaDesde: e.target.value})} />
          <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-600 transition-all cursor-pointer" onChange={(e) => setFiltro({...filtro, fechaHasta: e.target.value})} />
        </div>
      </div>

      {/* TARJETAS */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-50 hover:shadow-emerald-100 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp size={22} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recaudado</span>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{formatMoney(estadisticas.pagado)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-50 hover:shadow-rose-100 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl"><Clock size={22} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por Cobrar</span>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{formatMoney(estadisticas.pendiente)}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl hover:shadow-slate-300 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 text-white rounded-xl"><Wallet size={22} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cartera Total</span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(estadisticas.cartera)}</p>
        </div>
      </div> */}

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1150px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                <th className="px-3 py-4 font-bold text-center w-24">Estado</th>
                <th className="px-3 py-4 font-bold">Fecha</th>
                <th className="px-3 py-4 font-bold">Rem.</th>
                <th className="px-3 py-4 font-bold">Tercero / Cliente</th>
                <th className="px-3 py-4 font-bold text-right">Subtotal</th>
                {/* <th className="px-3 py-4 font-bold text-right text-emerald-300">IVA</th> */}
                {/* <th className="px-3 py-4 font-bold text-right text-rose-300">Ret.</th> */}
                <th className="px-3 py-4 font-bold text-right bg-slate-800">Total</th>
                {/* <th className="px-3 py-4 font-bold text-center w-48 text-emerald-400">N° Factura</th> */}
                <th className="px-3 py-4 font-bold text-center">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datosPaginados.map((mov, idx) => {
                const inicial = mov.tercero?.charAt(0).toUpperCase() || "?";
                const isAnulada = mov.estado === "ANULADA";
                
                return (
                  <tr key={mov.id || idx} className={`hover:bg-slate-50/80 transition-all group text-[11px] ${isAnulada ? "bg-slate-50/50 text-slate-400 italic" : ""}`}>
                    <td className="px-3 py-3 text-center">
                      <button 
                        onClick={() => toggleEstado(mov)}
                        disabled={isLoading}
                        className={`px-2 py-0.5 rounded-md font-bold text-[9px] border transition-all active:scale-95 shadow-sm ${
                          mov.estado === "VIGENTE" ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                        } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                      >
                        {mov.estado}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-500 font-medium">{mov.fecha?.split("T")[0]}</td>
                    <td className={`px-3 py-3 font-black ${isAnulada ? "line-through text-slate-300" : "text-slate-800"}`}>{mov.remision}</td>
                    
                    {/* COLUMNA TERCERO CON AVATAR DINÁMICO Y ANIMADO */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 group/avatar cursor-pointer">
                        <div className={`
                          relative w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black 
                          transition-all duration-300 ease-out shadow-sm overflow-hidden
                          /* EFECTOS HOVER */
                          group-hover/avatar:scale-110 group-hover/avatar:rotate-6 group-hover/avatar:shadow-emerald-200 group-hover/avatar:shadow-lg
                          ${isAnulada 
                            ? "bg-slate-200 text-slate-400" 
                            : "bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300"
                          }
                        `}>
                          {inicial}
                          {/* Brillo interno al pasar el mouse */}
                          <div className="absolute inset-0 bg-white/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`
                            font-bold truncate max-w-[180px] uppercase leading-tight transition-colors
                            ${isAnulada ? "text-slate-300 line-through" : "text-slate-700 group-hover/avatar:text-emerald-700"}
                          `}>
                            {mov.tercero}
                          </span>
                          <span className={`text-[9px] font-medium tracking-tight ${isAnulada ? "text-slate-200" : "text-slate-400"}`}>
                              ID: {mov.cedula || mov.nit || "SIN DOC."}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right text-slate-500">{formatMoney(mov.subtotal)}</td>
                    {/* <td className="px-3 py-3 text-right text-emerald-600">{formatMoney(mov.iva || 0)}</td> */}
                    {/* <td className="px-3 py-3 text-right text-rose-500 font-medium">{mov.retencion > 0 ? `-${formatMoney(mov.retencion)}` : '$0'}</td> */}
                    <td className={`px-3 py-3 text-right font-black bg-slate-50/50 ${isAnulada ? "text-slate-300 line-through" : "text-slate-900"}`}>{formatMoney(mov.total)}</td>
                    
                    {/* <td className="px-3 py-3">
                      <div className={`flex items-center justify-center shadow-sm rounded-full overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all px-1 bg-white ${isAnulada || isLoading ? "pointer-events-none opacity-40 bg-slate-50" : ""}`}>
                        <input 
                          type="text" placeholder="N° FACTURA"
                          className="w-full bg-transparent border-none px-3 py-1.5 text-center font-bold text-emerald-700 outline-none placeholder:text-slate-300 text-[10px]"
                          value={facturas[mov.id || mov.remision] || mov.factura || ""}
                          onChange={(e) => handleFacturaChange(mov.id || mov.remision, e.target.value)}
                        />
                        <button 
                          onClick={() => handleEnviarFactura(mov)}
                          disabled={isLoading}
                          className={`p-1.5 rounded-full transition-all duration-300 active:scale-90 ${
                            facturas[mov.id || mov.remision] ? "bg-emerald-500 text-white shadow-md" : "text-slate-300"
                          }`}
                        >
                          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
                        </button>
                      </div>
                    </td> */}
                    <td className="px-3 py-3 text-center">
                      <span className={getPagoStyle(mov.tipo_pago || mov.pago)}>
                          {mov.tipo_pago || mov.pago || 'SIN MÉTODO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              Mostrando <span className="text-slate-900 font-bold">{datosPaginados.length}</span> de <span className="text-slate-900 font-bold">{totalFiltrados}</span> registros
            </div>
            <select 
              value={registrosPorPagina}
              onChange={(e) => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActual(1); }}
              className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg px-2 py-1 outline-none"
            >
              <option value={15}>15 Filas</option>
              <option value={30}>30 Filas</option>
              <option value={50}>50 Filas</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all">
              <ChevronsLeft size={16} />
            </button>
            <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30">
              <ChevronLeft size={14} /> Anterior
            </button>
            <div className="flex items-center px-4 text-[11px] font-black text-emerald-700 bg-emerald-50/50 h-8 rounded-lg border border-emerald-100 min-w-[70px] justify-center shadow-inner">
              {paginaActual} <span className="mx-1.5 text-emerald-300 font-normal">/</span> {totalPaginas || 1}
            </div>
            <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas || totalPaginas === 0} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30">
              Siguiente <ChevronRight size={14} />
            </button>
            <button onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas || totalPaginas === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contabilidad;