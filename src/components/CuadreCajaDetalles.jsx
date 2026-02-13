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
          const res = await fetchGastosDetalleHistorico(
            datos.fecha,
            datos.created_at,
          );
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
    if (estado === "CUADRADO")
      return { msg: "Caja Cuadrada ✅", col: "text-emerald-700" };
    if (estado === "SOBRANTE")
      return { msg: "Sobrante", col: "text-amber-700" };
    return { msg: "Faltante", col: "text-rose-700" };
  };

  const estilos = getConciliacionEstilos();

  return (
    <div
      id="cuadre-print"
      className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-900"
    >
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
          <button
            onClick={onBack}
            className="no-print flex items-center gap-1 text-blue-600 font-bold mb-2 hover:underline"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter print:text-xl">
            Reporte Consolidado de Caja
          </h1>
          <p className="text-slate-500 font-bold text-xs">
            Fecha: {datos.fecha} | Folio: #{datos.id}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-black shadow-lg"
        >
          <Printer size={18} /> IMPRIMIR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* TABLA DE GASTOS */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <h3 className="print-section-title screen-only bg-emerald-600 p-3 text-white text-xs font-bold uppercase tracking-widest">
              📌 Registro de Gastos
            </h3>
            <h3 className="hidden print:block print-section-title">
              1. Detalle de Egresos
            </h3>

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
                  <td colSpan="2" className="text-right uppercase">
                    Total Egresos
                  </td>
                  <td className="text-right">${f(datos.gastos_diarios)}</td>
                </tr>
              </tbody>
            </table>

            <div className="screen-only">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px]">
                  <tr>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-left">Nota</th>
                    <th className="p-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {gastosDetalle.map((g) => (
                    <tr key={g.id}>
                      <td className="p-3 font-bold text-slate-700">
                        {g.descripcion}
                      </td>
                      <td className="p-3 text-slate-500 italic text-[11px]">
                        {g.observacion || "-"}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600">
                        ${f(g.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ARQUEO FÍSICO */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 print:border-none print:p-0">
            <h3 className="print-section-title text-blue-700 print:text-black">
              2. Arqueo Físico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
              {billetes.map((den) => (
                <div
                  key={den}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-black print:rounded-none"
                >
                  <span className="font-bold text-slate-500 text-xs print:text-black">
                    ${den.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-center bg-white border border-slate-200 rounded-lg font-black text-blue-600 py-1 print:border-black print:text-black">
                      {arqueoValores[den]}
                    </div>
                    <span className="w-20 text-right text-[10px] font-black text-slate-400 print:text-black">
                      ${f(den * arqueoValores[den])}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl md:col-span-2 border border-blue-100 print:bg-white print:border-black print:rounded-none">
                <span className="font-black text-blue-800 text-[10px] uppercase print:text-black">
                  Total Monedas
                </span>
                <span className="font-black text-blue-700 text-lg print:text-black">
                  ${f(datos.monedas_total)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white print:bg-white print:text-black print:border-2 print:border-black">
              <span className="text-[10px] font-black uppercase tracking-widest">
                Efectivo Real
              </span>
              <span className="text-3xl font-black font-mono tracking-tighter">
                ${f(datos.total_arqueo)}
              </span>
            </div>
          </section>
        </div>

        {/* LATERAL */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-2 print:border-black print:rounded-none">
            <div className="bg-slate-800 p-3 text-white text-center print:bg-slate-100 print:text-black">
              <h3 className="font-bold text-[10px] uppercase tracking-widest">
                3. Datos Sistema
              </h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span>Ventas Efectivo</span>
                <span className="font-bold">${f(datos.efectivo_ventas)}</span>
              </div>
              <div className="flex justify-between">
                <span>Recibos Caja</span>
                <span className="font-bold text-blue-600 print:text-black">
                  ${f(datos.recibos_caja)}
                </span>
              </div>
              <div className="flex justify-between italic border-t pt-2 border-slate-50 print:border-black">
                <span>Créditos</span>
                <span className="font-bold">${f(datos.credito)}</span>
              </div>
              <div className="flex justify-between italic border-b pb-2 border-slate-50 print:border-black">
                <span>Transferencias</span>
                <span className="font-bold">${f(datos.transferencia)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-50 print:border-black">
                <span>(-) Gastos</span>
                <span className="font-bold text-rose-500 print:text-black">
                  -${f(datos.gastos_diarios)}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase print:text-black">
                  Efectivo Esperado
                </span>
                <p className="text-3xl font-black text-emerald-600 print:text-black font-mono tracking-tighter">
                  ${f(datos.efectivo_esperado_sistema)}
                </p>
              </div>
            </div>
          </section>

              {/* CONCILIACIÓN FINAL */}
<div className="box-conciliacion-print print:block">
  <h2 className="text-sm font-bold uppercase mb-1 print:text-black">
    Auditoría
  </h2>
  <p className={`text-xl font-black uppercase ${estilos.col} print:text-black mb-1`}>
    {estilos.msg}
  </p>
  <div className="bg-slate-50 print:bg-white p-3 rounded-xl border border-slate-200 print:border-none">
    <p className="text-[9px] font-bold text-slate-400 uppercase print:text-black">
      Diferencia
    </p>
    <p className={`text-4xl font-black ${estilos.col} print:text-black font-mono tracking-tighter`}>
      ${f(Math.abs(datos.diferencia_valor))}
    </p>
  </div>

  {/* SECCIÓN DE OBSERVACIONES REAL */}
  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4 print:border-2 print:border-black text-left">
    <div className="bg-slate-50 p-2 border-b border-slate-100 print:bg-slate-100">
      <h3 className="font-bold text-[9px] uppercase tracking-widest text-slate-500 print:text-black">
        Notas del cierre
      </h3>
    </div>
    <div className="p-3">
      <p className="text-xs text-slate-600 italic">
        {/* Aquí es donde ocurre la magia: llamamos a la propiedad del objeto */}
        {datos.observaciones ? datos.observaciones : "No se registraron observaciones."}
      </p>
    </div>
  </section>
</div>
          {/* CONCILIACIÓN FINAL
          <div className="box-conciliacion-print print:block">
            <h2 className="text-sm font-bold uppercase mb-1 print:text-black">
              Auditoría
            </h2>
            <p
              className={`text-xl font-black uppercase ${estilos.col} print:text-black mb-1`}
            >
              {estilos.msg}
            </p>
            <div className="bg-slate-50 print:bg-white p-3 rounded-xl border border-slate-200 print:border-none">
              <p className="text-[9px] font-bold text-slate-400 uppercase print:text-black">
                Diferencia
              </p>
              <p
                className={`text-4xl font-black ${estilos.col} print:text-black font-mono tracking-tighter`}
              >
                ${f(Math.abs(datos.diferencia_valor))}
              </p>
            </div>
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4 print:border-2 print:border-black">
             
          </section>

          </div> */}
        </div>
      </div>
    </div>
  );
}
