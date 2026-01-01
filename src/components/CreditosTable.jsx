import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Calendar,
  Eye,
  Tags,
  Check,
  Receipt,
  FileText,
  ArrowRight,
  Calculator,
  User,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  X,
  Info,
  Clock,
} from "lucide-react";

import {
  fetchMovimiento,
  updateCredito,
  updateMovimiento,
  cambiarEstadoDePagoMovimiento,
} from "../assets/services/apiService";

export default function CreditosTable({ data }) {
  const [dataTable, setDataTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const [movimientosRelacionados, setMovimientosRelacionados] = useState([]);

  useEffect(() => {
    setDataTable(data);
  }, [data]);

  const onVerDetalle = async (credito) => {
    try {
      const remisionesArray = renderRemisionesArray(credito.remisiones);
      const tempMovimientosRelacionados = await Promise.all(
        remisionesArray.map((remision) => fetchMovimiento(remision))
      );
      setMovimientosRelacionados(tempMovimientosRelacionados);
      setCreditoSeleccionado(credito);
      setModalOpen(true);
    } catch (error) {
      console.error("Error al cargar movimientos relacionados:", error);
      setCreditoSeleccionado(credito);
      setModalOpen(true);
    }
  };

  const fixGMTDate = (dateString) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  };

  const changePagado = async (credito, cambiarRemisiones = true) => {
    const nuevoEstado = +!credito.pagado;

    const ahoraColombia = new Date().toLocaleString("sv-SE", {
      timeZone: "America/Bogota",
    });

    const remisionesArray = renderRemisionesArray(credito.remisiones);
    const nuevosValores = await Promise.all(
      remisionesArray.map(async (rem) => {
        const mov = await fetchMovimiento(rem);
        return mov;
      })
    );

    const nuevoValorTotal = nuevosValores.reduce(
      (sum, mov) => sum + (nuevoEstado !== 1 ? mov.total : 0),
      0
    );

    const creditoPagado = {
      ...credito,
      pagado: nuevoEstado,
      fechaPagado: credito.pagado === 0 ? ahoraColombia : null,
      valorRemisiones: nuevoValorTotal,
    };

    await updateCredito(creditoPagado.idCredito, creditoPagado);

    if (cambiarRemisiones) {
      for (const remision of remisionesArray) {
        console.log(
          "Cambiando estado de remisión:",
          remision,
          " a ",
          nuevoEstado
        );
        await cambiarEstadoDePagoMovimiento(remision, nuevoEstado);
      }
    }

    setDataTable((prev) =>
      prev.map((cred) =>
        cred.idCredito === creditoPagado.idCredito ? creditoPagado : cred
      )
    );
  };

  const changePagadoRemision = async (remision, nuevoEstado) => {
    const movimiento = movimientosRelacionados.find(
      (mov) => mov.remision === remision
    );

    if (movimiento) {
      const movimientoActualizado = {
        ...movimiento,
        factura: +movimiento.factura,
        pagado: nuevoEstado,
      };

      await updateMovimiento(remision, movimientoActualizado);

      const creditoAsociado = creditoSeleccionado;
      const remisionesArray = renderRemisionesArray(creditoAsociado.remisiones);
      const nuevosValores = await Promise.all(
        remisionesArray.map(async (rem) => {
          const mov = await fetchMovimiento(rem);
          return mov;
        })
      );

      const nuevoValorTotal = nuevosValores.reduce(
        (sum, mov) => sum + (mov.pagado !== 1 ? mov.total : 0),
        0
      );

      const creditoActualizado = {
        ...creditoAsociado,
        valorRemisiones: nuevoValorTotal,
      };

      await updateCredito(creditoActualizado.idCredito, creditoActualizado);

      if (nuevoValorTotal === 0 && creditoActualizado.pagado !== 1) {
        changePagado(creditoActualizado, false);
      }

      if (creditoActualizado.pagado === 1 && nuevoValorTotal > 0) {
        creditoActualizado.pagado = 0;
        creditoActualizado.fechaPagado = null;
        await updateCredito(creditoActualizado.idCredito, creditoActualizado);
        setDataTable((prev) =>
          prev.map((cred) =>
            cred.idCredito === creditoActualizado.idCredito
              ? creditoActualizado
              : cred
          )
        );
      }

      setCreditoSeleccionado(creditoActualizado);

      setMovimientosRelacionados((prev) =>
        prev.map((mov) =>
          mov.remision === remision ? movimientoActualizado : mov
        )
      );
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const filteredData = dataTable.filter((item) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      item.tercero?.toLowerCase().includes(lowerTerm) ||
      item.idTercero?.toString().includes(lowerTerm)
    );
  });

  const renderRemisionesBadge = (credito) => {
    const remisionesRaw = credito.remisiones;
    let lista = [];
    try {
      lista =
        typeof remisionesRaw === "string"
          ? JSON.parse(remisionesRaw.replace(/'/g, '"'))
          : remisionesRaw;
    } catch (e) {
      lista = String(remisionesRaw)
        .replace(/[\[\]\s]/g, "")
        .split(",")
        .filter((x) => x !== "");
    }

    if (!lista || lista.length === 0)
      return (
        <span className="text-gray-300 text-[10px] italic font-medium">
          Sin remisiones
        </span>
      );

    return (
      <div
        onClick={() => {
          onVerDetalle(credito);
        }}
        className="flex justify-end"
      >
        <div className="group/badge px-3 py-1.5 bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-indigo-200">
          <Tags
            size={14}
            className="text-indigo-400 group-hover/badge:text-white transition-colors"
          />
          <span>{lista.length} Docs.</span>
        </div>
      </div>
    );
  };

  const renderRemisionesArray = (remisionesRaw) => {
    let lista = [];
    try {
      lista =
        typeof remisionesRaw === "string"
          ? JSON.parse(remisionesRaw.replace(/'/g, '"'))
          : remisionesRaw;
    } catch (e) {
      lista = String(remisionesRaw)
        .replace(/[\[\]\s]/g, "")
        .split(",")
        .filter((x) => x !== "");
    }
    return lista || [];
  };

  return (
    <>
      <div className="bg-gray-50/50 rounded-4xl p-1.5 border border-gray-200 shadow-2xl relative overflow-hidden font-sans transition-all duration-500">
        {/* HEADER */}
        <div className="bg-white rounded-t-[28px] px-8 py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
            <TrendingUp size={180} className="text-indigo-600" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4 tracking-tight">
              <div className="bg-linear-to-br from-indigo-600 to-indigo-800 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-200 transform hover:rotate-6 transition-transform cursor-default">
                <CreditCard size={28} />
              </div>
              Créditos
            </h2>
            <div className="flex items-center gap-3 mt-2 ml-1">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                  En Vivo
                </span>
              </div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-tighter">
                Control de cuentas por cobrar y remisiones
              </p>
            </div>
          </div>

          <div className="relative group z-10">
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              className="w-full lg:w-96 pl-14 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[22px] text-sm focus:ring-0 focus:border-indigo-500/30 focus:bg-white transition-all font-bold outline-none shadow-inner group-hover:bg-gray-100/80 cursor-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto bg-white rounded-b-[28px]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/80 backdrop-blur-md">
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  ID Cliente
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  Tercero / Cliente
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  Vínculos
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  Valor Total
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  Estado Pago
                </th>
                <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((credito) => (
                <tr
                  key={credito.idCredito}
                  className="group hover:bg-linear-to-r hover:from-indigo-50/40 hover:to-white transition-all duration-300"
                >
                  <td className="px-8 py-6">
                    <span className="text-indigo-600 font-black text-xs tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                      #{credito.idTercero}
                    </span>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative cursor-pointer group/avatar">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-900 flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-xl shadow-indigo-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 overflow-hidden">
                          {credito.tercero?.charAt(0).toUpperCase()}
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover/avatar:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                        </div>
                        <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-40 transition-opacity duration-500"></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-black text-sm uppercase tracking-tight group-hover:text-indigo-700 transition-colors cursor-default leading-none">
                            {credito.tercero}
                          </span>
                          <ShieldCheck
                            size={14}
                            className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                          Cliente
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    {renderRemisionesBadge(credito)}
                  </td>

                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-gray-800 text-base tabular-nums tracking-tighter">
                      {formatCurrency(credito.valorRemisiones)}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <span
                      className={`cursor-pointer px-4 py-2 rounded-[14px] text-[10px] font-black uppercase shadow-sm ring-2 ring-inset transition-all hover:scale-105 active:scale-95 flex-inline items-center gap-2 ${
                        credito.pagado === 1
                          ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                          : "bg-rose-50 text-rose-600 ring-rose-200"
                      }`}
                      onClick={() => changePagado(credito)}
                    >
                      {credito.pagado === 1 ? "● PAGADO" : "○ PENDIENTE"}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-center cursor-pointer">
                    <button
                      onClick={() => onVerDetalle(credito)}
                      className="group/btn p-4 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-[20px] transition-all active:scale-90 shadow-sm hover:shadow-lg hover:shadow-indigo-100 inline-flex items-center justify-center border border-gray-100 hover:border-indigo-500 cursor-pointer"
                    >
                      <Eye
                        size={22}
                        className="group-hover/btn:scale-110 cursor-pointer transition-transform"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-10 py-7 text-[11px] text-gray-400 font-black flex justify-between items-center rounded-b-[30px] border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
          <div className="flex gap-8 items-center uppercase tracking-widest">
            <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 shadow-inner hover:bg-gray-100 transition-colors cursor-default group">
              <Receipt
                size={18}
                className="text-indigo-500 group-hover:rotate-12 transition-transform"
              />
              <span className="text-gray-800 text-sm tracking-tighter">
                {filteredData.length}
              </span>
              <span className="text-gray-400">Créditos Registrados</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[9px]">Sincronización segura</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
          </div>
        </div>
      </div>

      {/* MODAL DE REMISIONES MEJORADO */}
      {modalOpen && creditoSeleccionado && (
        <div
          id="credit-print"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
        >
          <div className="bg-white rounded-32px shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300">
            {/* Header del Modal */}
            <div className="relative px-8 py-6 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 transform -rotate-3">
                    {creditoSeleccionado.tercero?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 leading-tight">
                      {creditoSeleccionado.tercero}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black tracking-widest uppercase">
                        ID: {creditoSeleccionado.idTercero}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-100 cursor-pointer text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all p-3 rounded-2xl group print:hidden"
                >
                  <X
                    size={20}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </button>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              {/* Cards de Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-linear-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                  <DollarSign className="absolute right--10px bottom--10px size-24 opacity-20 group-hover:scale-110 transition-transform" />
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    Deuda Pendiente
                  </p>
                  <p className="text-3xl font-black tabular-nums">
                    {formatCurrency(creditoSeleccionado.valorRemisiones)}
                  </p>
                </div>

                <div
                  className={`rounded-3xl p-6 border-2 flex flex-col justify-center transition-colors ${
                    creditoSeleccionado.pagado === 1
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-amber-50 border-amber-100"
                  }`}
                >
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    Estado General
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        creditoSeleccionado.pagado === 1
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span
                      className={`text-lg font-black uppercase ${
                        creditoSeleccionado.pagado === 1
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {creditoSeleccionado.pagado === 1
                        ? "Totalmente Pagado"
                        : "Pago Pendiente"}
                    </span>
                  </div>
                  {creditoSeleccionado.fechaPagado && (
                    <div className="mt-2 flex items-center gap-1.5 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">
                        {fixGMTDate(
                          creditoSeleccionado.fechaPagado
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Documentos */}
              <div className="space-y-4">
                <div
                  onClick={() => setModalOpen(true)}
                  className="flex items-center justify-between mb-2 px-1"
                >
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" />
                    Documentos Vinculados (
                    {
                      renderRemisionesArray(creditoSeleccionado.remisiones)
                        .length
                    }
                    )
                  </h4>
                </div>

                {renderRemisionesArray(creditoSeleccionado.remisiones)
                  .length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-24px border-2 border-dashed border-gray-200">
                    <Info size={40} className="text-gray-300 mb-2" />
                    <p className="text-gray-400 font-bold">
                      No hay documentos registrados
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {renderRemisionesArray(creditoSeleccionado.remisiones).map(
                      (remision, idx) => {
                        const mov = movimientosRelacionados.find(
                          (re) => re.remision === remision
                        );
                        if (!mov) return null;

                        return (
                          <div
                            key={idx}
                            className="group bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                  mov.pagado === 1
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-gray-50 text-gray-400"
                                }`}
                              >
                                <Receipt size={22} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-gray-800 uppercase">
                                    Remisión #{remision}
                                  </p>
                                  <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-gray-50 rounded border border-gray-100">
                                    {mov.estado || "RECIBIDO"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs font-black text-indigo-600">
                                    {formatCurrency(mov.total)}
                                  </p>
                                  {mov.fechaPago && (
                                    <span className="text-[15px] text-gray-400 font-medium flex items-center gap-1">
                                      <Calendar size={10} />
                                      {mov.fechaPago.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const nuevoEstado = mov.pagado === 1 ? 0 : 1;
                                changePagadoRemision(remision, nuevoEstado);
                              }}
                              id="btn-pagado-remision"
                              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${
                                mov.pagado === 1
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                                  : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                              }`}
                            >
                              <Check size={14} strokeWidth={3} />
                              {mov.pagado === 1 ? "Pagado" : "Pendiente"}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between print:hidden">
              <p className="text-[10px] text-gray-400 font-bold italic flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                Los cambios se sincronizan automáticamente
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="px-8 py-3 bg-gray-800 text-white text-xs font-black rounded-2xl hover:bg-gray-700 transition-all active:scale-95 shadow-lg shadow-gray-200 uppercase tracking-widest print:hidden"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
