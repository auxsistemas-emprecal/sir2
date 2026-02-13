import React, { useEffect, useState, useMemo } from "react";
import MovimientosTable from "./MovimientosTable";
import * as XLSX from "xlsx"; // <--- IMPORTACIÓN DE LIBRERÍA EXCEL
import {
  Search,
  Calendar,
  Filter,
  Hash,
  User,
  Truck,
  CreditCard,
  Activity,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import {
  updateMovimientoStatus,
  pagoPorRemision,
  updatePago,
  updateCredito,
  fetchCreditosPorRemision,
} from "../assets/services/apiService";

const ESTADO_OPCIONES = [
  { value: "", label: "Todos los Estados" },
  { value: "VIGENTE", label: "Vigente" },
  { value: "ANULADA", label: "Anulada" },
];

export default function MovimientosPage({
  data = [],
  onRefresh,
  onEdit,
  paymentTypes,
}) {
  const movimientos = data;
  const [statusMessage, setStatusMessage] = useState({
    message: null,
    type: null,
  });

  // --- Estados de Filtro ---
  const [searchRemision, setSearchRemision] = useState("");
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tercero, setTercero] = useState("");
  const [noIngreso, setNoIngreso] = useState("");
  const [tipoPago, setTipoPago] = useState("");
  const [estado, setEstado] = useState("");
  const [TIPO_PAGO_OPCIONES, setTipoPagoOpciones] = useState([
    { value: "", label: "Todos los Tipos de Pago" },
  ]);

  // --- Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  useEffect(() => {
    if (statusMessage.message) {
      const timer = setTimeout(
        () => setStatusMessage({ message: null, type: null }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [statusMessage.message]);

  useEffect(() => {
    if (paymentTypes && Array.isArray(paymentTypes)) {
      setTipoPagoOpciones([
        { value: "", label: "Todos los Tipos de Pago" },
        ...paymentTypes.map((type) => ({
          value: type.tipo_pago,
          label: type.tipo_pago,
        })),
      ]);
    }
  }, [paymentTypes]);

  // --- Lógica de Filtrado ---
  const filteredMovimientos = useMemo(() => {
    let result = movimientos;
    if (!desde && !hasta) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      result = result.filter(
        (x) => x.fecha && new Date(x.fecha) >= fechaLimite
      );
    }
    if (searchRemision)
      result = result.filter((x) =>
        String(x.remision).includes(searchRemision)
      );
    if (placa)
      result = result.filter((x) =>
        (x.placa || "").toLowerCase().includes(placa.toLowerCase())
      );
    if (conductor)
      result = result.filter((x) =>
        (x.conductor || "").toLowerCase().includes(conductor.toLowerCase())
      );
    if (tercero)
      result = result.filter((x) =>
        (x.tercero || "").toLowerCase().includes(tercero.toLowerCase())
      );
    if (noIngreso)
      result = result.filter((x) =>
        (x.no_ingreso || "").toLowerCase().includes(noIngreso.toLowerCase())
      );
    if (tipoPago)
      result = result.filter(
        (x) => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase()
      );
    if (estado)
      result = result.filter(
        (x) => (x.estado || "").toUpperCase() === estado.toUpperCase()
      );
    if (desde)
      result = result.filter(
        (x) => x.fecha && new Date(x.fecha.split("T")[0]) >= new Date(desde)
      );
    if (hasta)
      result = result.filter(
        (x) => x.fecha && new Date(x.fecha.split("T")[0]) <= new Date(hasta)
      );
    return result;
  }, [
    movimientos,
    searchRemision,
    placa,
    conductor,
    desde,
    hasta,
    tercero,
    tipoPago,
    estado,
    noIngreso,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchRemision,
    placa,
    conductor,
    desde,
    hasta,
    tercero,
    tipoPago,
    estado,
    noIngreso,
  ]);

  const totalPages = Math.ceil(filteredMovimientos.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredMovimientos.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // ==========================================================
  //  LOGICA DE EXPORTACIÓN A EXCEL
  // ==========================================================
  const handleExportExcel = () => {
    if (filteredMovimientos.length === 0) {
      setStatusMessage({
        message: "No hay datos para exportar con los filtros actuales",
        type: "error",
      });
      return;
    }

    const exportData = filteredMovimientos.map((m) => ({
      FECHA: m.fecha ? m.fecha.split("T")[0] : "--",
      REMISION: m.remision,
      FACTURA: m.factura || "PENDIENTE",
      "CLIENTE / TERCERO": m.tercero,
      CONDUCTOR: m.conductor,
      PLACA: m.placa,
      CUBICAJE: m.cubicaje,
      SUBTOTAL: m.subtotal,
      IVA: m.iva,
      RETENCION: m.retencion,
      TOTAL: m.total,
      "TIPO PAGO": m.tipo_pago,
      PAGADO: m.pagado ? "SÍ" : "NO",
      ESTADO: m.estado,
      OBSERVACIONES: m.observacion || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

    const wscols = [
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 35 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 40 },
    ];
    worksheet["!cols"] = wscols;

    const fileName = `Reporte_Movimientos_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setStatusMessage({
      message: "Reporte Excel descargado correctamente",
      type: "success",
    });
  };

  // ==========================================================
  //  ACCIÓN TOGGLE ESTADO
  // ==========================================================
  const handleToggleEstado = async (remision) => {
    setStatusMessage({ message: null, type: null });
    const currentMovement = movimientos.find((m) => m.remision === remision);
    if (!currentMovement) return;

    const newState =
      currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

    if (
      !window.confirm(
        `¿Seguro que desea cambiar la remisión ${remision} a ${newState}?`
      )
    )
      return;

    try {
      await updateMovimientoStatus(remision, newState);
      const resPagoRelacionado = await pagoPorRemision(remision);
      const ResCreditoDeRemision = await fetchCreditosPorRemision(remision);
      const creditoDeRemision = ResCreditoDeRemision[0];
      const pagoRelacionado = resPagoRelacionado[0];

      let pagoPayload = null;
      if (
        currentMovement.tipo_pago === "Pago por anticipado" &&
        newState === "ANULADA"
      ) {
        pagoPayload = {
          ...pagoRelacionado,
          valorRemisiones:
            (pagoRelacionado?.valorRemisiones || 0) - currentMovement.total,
        };
      } else if (currentMovement.tipo_pago === "Pago por anticipado") {
        pagoPayload = {
          ...pagoRelacionado,
          valorRemisiones:
            (pagoRelacionado?.valorRemisiones || 0) + currentMovement.total,
        };
      }

      let creditoPayload = null;
      if (currentMovement.tipo_pago === "Crédito" && newState === "ANULADA") {
        creditoPayload = {
          ...creditoDeRemision,
          valorRemisiones:
            (creditoDeRemision?.valorRemisiones || 0) - currentMovement.total,
        };
      } else if (currentMovement.tipo_pago === "Crédito") {
        creditoPayload = {
          ...creditoDeRemision,
          valorRemisiones:
            (creditoDeRemision?.valorRemisiones || 0) + currentMovement.total,
        };
      }

      if (creditoDeRemision && creditoPayload)
        await updateCredito(creditoPayload.idCredito, creditoPayload);
      if (pagoRelacionado && pagoPayload)
        await updatePago(pagoPayload.no_ingreso, pagoPayload);

      if (typeof onRefresh === "function") await onRefresh();
      setStatusMessage({
        message: `Remisión ${remision} actualizada a ${newState} con éxito.`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setStatusMessage({
        message: `Error al cambiar estado: ${e.message}`,
        type: "error",
      });
    }
  };

  const handleEdit = (movimiento) => {
    try {
   
      onEdit(movimiento);
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <Activity size={24} />
            </div>
            Gestión de Movimientos
          </h1>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group"
            >
              <FileSpreadsheet
                size={18}
                className="group-hover:rotate-12 transition-transform"
              />
              Exportar Excel
            </button>

            <div className="flex flex-col items-end gap-1">
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                Mostrando:{" "}
                <span className="text-blue-600 font-black">
                  {paginatedData.length}
                </span>{" "}
                de{" "}
                <span className="text-slate-800 font-black">
                  {filteredMovimientos.length}
                </span>{" "}
                registros
              </div>
              {!desde && !hasta && (
                <span className="text-[10px] text-slate-400 italic mr-2 font-medium underline decoration-blue-200">
                  Filtrado automático: Últimos 30 días
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <FilterField label="Remisión" icon={<Hash size={14} />}>
            <input
              className="w-full pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              placeholder="Número..."
              value={searchRemision}
              onChange={(e) => setSearchRemision(e.target.value)}
            />
          </FilterField>

          <FilterField label="Placa" icon={<Truck size={14} />}>
            <input
              className="w-full pl-9 pr-4 py-2 text-xs font-black uppercase tracking-widest border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50 focus:bg-white"
              placeholder="ABC-123"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
            />
          </FilterField>

          <FilterField label="Conductor" icon={<User size={14} />}>
            <input
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              placeholder="Nombre..."
              value={conductor}
              onChange={(e) => setConductor(e.target.value)}
            />
          </FilterField>

          <FilterField label="Tercero" icon={<Search size={14} />}>
            <input
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              placeholder="Buscar cliente..."
              value={tercero}
              onChange={(e) => setTercero(e.target.value)}
            />
          </FilterField>

          <FilterField label="No. Ingreso" icon={<Filter size={14} />}>
            <input
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              placeholder="000"
              value={noIngreso}
              onChange={(e) => setNoIngreso(e.target.value)}
            />
          </FilterField>

          <FilterField label="Tipo de Pago" icon={<CreditCard size={14} />}>
            <select
              className="w-full pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 bg-white appearance-none cursor-pointer"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
            >
              {TIPO_PAGO_OPCIONES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField
            label="Estado"
            icon={
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
            }
          >
            <select
              className="w-full pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 bg-white appearance-none cursor-pointer"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADO_OPCIONES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Desde" icon={<Calendar size={14} />}>
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </FilterField>

          <FilterField label="Hasta" icon={<Calendar size={14} />}>
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </FilterField>

          <div className="flex items-end">
            <button
              onClick={onRefresh}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
              <ArrowRightLeft
                size={14}
                className="group-hover:rotate-180 transition-transform"
              />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {statusMessage.message && (
        <div
          className={`flex items-center gap-3 p-4 mb-6 rounded-2xl text-white font-bold shadow-lg animate-in fade-in slide-in-from-top-4 ${
            statusMessage.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {statusMessage.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {statusMessage.message}
        </div>
      )}

      {/* AJUSTE AQUÍ: Eliminamos overflow-hidden para que la sombra de la columna pegada se vea */}
      <div className="space-y-4">
        <MovimientosTable
          data={paginatedData}
          toggleEstado={handleToggleEstado}
          onEdit={handleEdit}
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 text-xs font-black bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all uppercase tracking-tighter"
            >
              Anterior
            </button>
            <span className="text-xs font-black text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-inner">
              Página {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 text-xs font-black bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all uppercase tracking-tighter"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterField({ label, icon, children }) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 block ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}