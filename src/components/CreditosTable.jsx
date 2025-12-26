import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Calendar,
  Eye,
  Tags,
  ChevronRight,
  Receipt,
  FileText,
  ArrowRight,
  Calculator,
  User,
  DollarSign,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { fetchMovimiento, updateCredito } from "../assets/services/apiService";

export default function CreditosTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const [movimientosRelacionados, setMovimientosRelacionados] = useState([]);

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

  // const changePagado = async (credito) => {
  //   const creditoPagado = {
  //     ...credito,
  //     pagado: +!credito.pagado, // Sí es 0 lo cambia a 1 y viceversa
  //   };
  //   await updateCredito(creditoPagado.idCredito, creditoPagado);
  // };

const changePagado = async (credito) => {
  const ahoraColombia = new Date().toLocaleString("sv-SE", {
    timeZone: "America/Bogota",
  });
  // sv-SE => formato YYYY-MM-DD HH:mm:ss (ideal para SQL)

  const creditoPagado = {
    ...credito,
    pagado: +!credito.pagado,
    fechaPagado: credito.pagado === 0 ? ahoraColombia : null,
  };

  await updateCredito(creditoPagado.idCredito, creditoPagado);
};



  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const filteredData = data.filter((item) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      item.tercero?.toLowerCase().includes(lowerTerm) ||
      item.idTercero?.toString().includes(lowerTerm)
    );
  });

  const renderRemisionesBadge = (remisionesRaw) => {
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
      <div className="flex justify-end">
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
        {/* HEADER CON GRADIENTE Y BRANDING */}
        <div className="bg-white rounded-t-[28px] px-8 py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decoración de fondo */}
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

        {/* TABLA ESTILIZADA */}
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

                  {/* AVATAR CON EFECTO DE PERFIL ANIMADO V4 */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative cursor-pointer group/avatar">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-900 flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-xl shadow-indigo-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 overflow-hidden">
                          {credito.tercero?.charAt(0).toUpperCase()}
                          {/* Brillo dinámico tipo barrido */}
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover/avatar:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                        </div>
                        {/* Aura de profundidad */}
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
                    {renderRemisionesBadge(credito.remisiones)}
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

                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => onVerDetalle(credito)}
                      className="group/btn p-4 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-[20px] transition-all active:scale-90 shadow-sm hover:shadow-lg hover:shadow-indigo-100 inline-flex items-center justify-center border border-gray-100 hover:border-indigo-500 cursor-pointer"
                    >
                      <Eye
                        size={22}
                        className="group-hover/btn:scale-110 transition-transform"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER PREMIUM */}
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

            <div className="hidden md:flex items-center gap-3 bg-indigo-50/30 px-5 py-2.5 rounded-2xl border border-indigo-100/30 cursor-help group">
              <Calculator
                size={18}
                className="text-indigo-500 group-hover:scale-110 transition-transform"
              />
              <span className="text-indigo-700 text-[10px] font-black italic uppercase">
                Sistema de Cartera Optimizado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[9px]">Sincronización segura</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
          </div>
        </div>
      </div>

      {/* MODAL DE REMISIONES */}
      {modalOpen && creditoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white rounded-t-[28px] px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                  {creditoSeleccionado.tercero?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    {creditoSeleccionado.tercero}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    ID: {creditoSeleccionado.idTercero}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="px-8 py-8">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    Valor Total
                  </p>
                  <p className="text-2xl font-black text-indigo-700">
                    {formatCurrency(creditoSeleccionado.valorRemisiones)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    Estado
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black uppercase ${
                        creditoSeleccionado.pagado === 1
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {creditoSeleccionado.pagado === 1
                        ? "[PAGADO]"
                        : "[PENDIENTE]"}
                      {creditoSeleccionado.fechaPagado &&
                        " Fecha de pago: " +
                          new Date(
                            creditoSeleccionado.fechaPagado
                          ).toLocaleString("es-CO", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            // timeZone: "UTC",
                          })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección de Remisiones */}
              <div>
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Tags size={16} className="text-indigo-600" />
                  Documentos Vinculados (
                  {renderRemisionesArray(creditoSeleccionado.remisiones).length}
                  )
                </h4>

                {renderRemisionesArray(creditoSeleccionado.remisiones)
                  .length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200 text-center">
                    <FileText
                      size={32}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-gray-400 font-bold text-sm">
                      No hay remisiones asociadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {renderRemisionesArray(creditoSeleccionado.remisiones).map(
                      (remision, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-linear-to-r from-indigo-50 to-transparent rounded-2xl p-4 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/20 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-800 group-hover:text-indigo-700 transition-colors">
                                  {`[${
                                    movimientosRelacionados.find(
                                      (re) => re.remision === remision
                                    ).estado
                                  }]`}{" "}
                                  Remisión {remision} - Valor:{" "}
                                  {formatCurrency(
                                    movimientosRelacionados.find(
                                      (re) => re.remision === remision
                                    ).total
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                  Documento vinculado
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={20}
                              className="text-gray-300 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1"
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 rounded-b-[28px] px-8 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-300 transition-all active:scale-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
