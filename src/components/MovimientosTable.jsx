// // src/components/MovimientosTable.jsx

// import React from "react";
// import { FileSpreadsheet, XCircle, CheckCircle, FileText } from "lucide-react";

// // =================== FORMATOS ===================
// const formatCurrency = (val) =>
// new Intl.NumberFormat("es-CO", {
//     style: "currency",
//     currency: "COP",
//     minimumFractionDigits: 0,
// }).format(val ?? 0);

// const formatFecha = (f) => (f ? f.split("T")[0] : "--");

// const renderCheck = (value) =>
// value == 1 ? (
//     <CheckCircle size={14} className="text-emerald-500 mx-auto" />
// ) : (
//     <XCircle size={14} className="text-gray-400 mx-auto" />
// );

// // =================================================

// export default function MovimientosTable({ data = [], toggleEstado, onEdit }) {
// return (
//     <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//     <div className="overflow-x-auto">
//         <table className="w-full text-xs text-left text-gray-600 whitespace-nowrap">
//         <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
//             <tr>
//             <th className="px-4 py-3">Acción</th>
//             <th className="px-4 py-3">Fecha</th>
//             <th className="px-4 py-3">Remisión</th>
//             <th className="px-4 py-3">Tercero</th>
//             <th className="px-4 py-3">Conductor</th>
//             <th className="px3- py-3">Cedula Cliente</th>
//             <th className="px3- py-3">Telefono Cliente</th>
//             <th className="px-4 py-3">Placa</th>
//             <th className="px-4 py-3">Cubicaje</th>
//             <th className="px-4 py-3">No Ingreso</th>
//             <th className="px-4 py-3">Subtotal</th>
//             <th className="px-4 py-3">IVA</th>
//             <th className="px-4 py-3">Retención</th>
//             <th className="px-4 py-3 text-center">¿IVA?</th>
//             <th className="px-4 py-3 text-center">¿Ret?</th>
//             <th className="px-4 py-3 font-bold bg-gray-50">Total</th>
//             <th className="px-4 py-3">Pago</th>
//             <th className="px-4 py-3">Pagado</th>
//             <th className="px-4 py-3">Factura</th>
//             <th className="px-4 py-3">Dirección</th>
//             <th className="px-4 py-3">Observación</th>
//             <th className="px-4 py-3">Estado</th>

//             </tr>
//         </thead>

//         <tbody className="divide-y divide-gray-200">
//             {data.length === 0 ? (
//             <tr>
//                 <td colSpan={22} className="text-center py-8 text-gray-400">
//                 No hay movimientos registrados.
//                 </td>
//             </tr>
//             ) : (
//             data.map((row) => (
//                 <tr key={row.remision} className="hover:bg-gray-50 transition-colors">
//                   {/* ACCIONES */}
//                 <td className="px-4 py-3">
//                     <button
//                     onClick={() => onEdit(row)}
//                     className="inline-flex items-center justify-center p-1.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 mr-2 shadow-sm"
//                     title="Ver/Editar Remisión"
//                     >
//                     <FileText size={14} />
//                     </button>

//                     <button
//                     onClick={() => toggleEstado(row.remision)}
//                     className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase border shadow-sm ${
//                         row.estado === "VIGENTE"
//                         ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
//                         : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
//                     }`}
//                     >

//                     {row.estado === "VIGENTE" ? "Anular" : "Vigente"}
//                     </button>
//                 </td>

//                   {/* DATOS */}
//                 <td className="px-4 py-3">{formatFecha(row.fecha)}</td>
//                 <td className="px-4 py-3 font-bold text-emerald-700">{row.remision}</td>

//                 <td className="px-4 py-3">{row.tercero}</td>
//                 <td className="px-4 py-3">{row.conductor}</td>

//                 <td className="px-4 py-3 font-mono bg-slate-50 rounded">{row.placa}</td>

//                 <td className="px-4 py-3">{row.cubicaje}</td>
//                 <td className="px-4 py-3">{row.no_ingreso || "--"}</td>

//                 <td className="px-4 py-3 text-right">{formatCurrency(row.subtotal)}</td>
//                 <td className="px-4 py-3 text-right">{formatCurrency(row.iva)}</td>
//                 <td className="px-4 py-3 text-right">{formatCurrency(row.retencion)}</td>

//                 <td className="px-4 py-3 text-center">{renderCheck(row.incluir_iva)}</td>
//                 <td className="px-4 py-3 text-center">{renderCheck(row.incluir_ret)}</td>

//                 <td className="px-4 py-3 font-bold text-emerald-700 bg-gray-50">
//                     {formatCurrency(row.total)}
//                 </td>

//                   {/* tipo_pago ahora viene como texto */}
//                 <td className="px-4 py-3">{row.tipo_pago}</td>

//                   {/* CHECK PAGADO */}
//                 <td className="px-4 py-3 text-center">{renderCheck(row.pagado)}</td>

//                   {/* CHECK FACTURA */}
//                 <td className="px-4 py-3 text-center">{renderCheck(row.factura)}</td>

//                 <td className="px-4 py-3">{row.direccion}</td>
//                 <td className="px-4 py-3">{row.observacion || "--"}</td>

//                 <td className="px-4 py-3 text-center">
//                     {row.estado === "VIGENTE" ? (
//                     <span className="flex items-center gap-1 text-emerald-600 font-bold">
//                         <CheckCircle size={14} /> VIGENTE
//                     </span>
//                     ) : (
//                     <span className="flex items-center gap-1 text-red-600 font-bold">
//                         <XCircle size={14} /> Cancelado
//                     </span>
//                     )}
//                 </td>
//                 </tr>
//             ))
//             )}
//         </tbody>
//         </table>
//     </div>
//     </div>
// );
// }
// src/components/MovimientosTable.jsx

import React from "react";
import { FileSpreadsheet, XCircle, CheckCircle, FileText } from "lucide-react";

// =================== FORMATOS ===================
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val ?? 0);

const formatFecha = (f) => (f ? f.split("T")[0] : "--");

const renderCheck = (value) =>
  value == 1 ? (
    <CheckCircle size={14} className="text-emerald-500 mx-auto" />
  ) : (
    <XCircle size={14} className="text-gray-400 mx-auto" />
  );

// =================================================

export default function MovimientosTable({ data = [], toggleEstado, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-600 whitespace-nowrap">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Remisión</th>
              <th className="px-4 py-3">Tercero</th>
              <th className="px-4 py-3">Conductor</th>
              <th className="px-4 py-3">Cédula Cliente</th>
              <th className="px-4 py-3">Teléfono Cliente</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Cubicaje</th>
              <th className="px-4 py-3">No Ingreso</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3">IVA</th>
              <th className="px-4 py-3">Retención</th>
              <th className="px-4 py-3 text-center">¿IVA?</th>
              <th className="px-4 py-3 text-center">¿Ret?</th>
              <th className="px-4 py-3 font-bold bg-gray-50">Total</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Pagado</th>
              <th className="px-4 py-3">Factura</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Observación</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={22} className="text-center py-8 text-gray-400">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.remision}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* ACCIONES */}
                  <td className="px-4 py-3 flex items-center">
                    <button
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center cursor-pointer justify-center p-1.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 mr-2 shadow-sm"
                      title="Ver/Editar Remisión"
                    >
                      <FileText size={14} />
                    </button>

                    <button
                      onClick={() => toggleEstado(row.remision)}
                      className={`inline-flex items-center px-2 py-1 rounded cursor-pointer text-[10px] font-bold uppercase border shadow-sm ${
                        row.estado === "VIGENTE"
                          ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                          : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                      }`}
                    >
                      {row.estado === "VIGENTE" ? "Anular" : "Vigente"}
                    </button>
                  </td>

                  {/* DATOS */}
                  <td className="px-4 py-3">{formatFecha(row.fecha)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    {row.remision}
                  </td>

                  <td className="px-4 py-3">{row.tercero}</td>
                  <td className="px-4 py-3">{row.conductor}</td>

                  <td className="px-4 py-3">
                    {row.cedula || row.cedula_cliente || "--"}
                  </td>
                  <td className="px-4 py-3">
                    {row.telefono || row.telefono_cliente || "--"}
                  </td>

                  <td className="px-4 py-3 font-mono bg-slate-50 rounded">
                    {row.placa}
                  </td>

                  <td className="px-4 py-3">{row.cubicaje}</td>
                  <td className="px-4 py-3">{row.no_ingreso || "--"}</td>

                  <td className="px-4 py-3 text-right">
                    {formatCurrency(row.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(row.iva)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(row.retencion)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {renderCheck(row.incluir_iva)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderCheck(row.incluir_ret)}
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-700 bg-gray-50">
                    {formatCurrency(row.total)}
                  </td>

                  {/* tipo_pago ahora viene como texto */}
                  <td className="px-4 py-3">{row.tipo_pago}</td>

                  {/* CHECK PAGADO */}
                  <td className="px-4 py-3 text-center">
                    {renderCheck(row.pagado)}
                  </td>

                  {/* CHECK FACTURA */}
                  <td className="px-4 py-3 text-center">
                    {renderCheck(row.factura)}
                  </td>

                  <td className="px-4 py-3">{row.direccion}</td>
                  <td className="px-4 py-3">{row.observacion || "--"}</td>

                  <td className="px-4 py-3 text-center">
                    {row.estado === "VIGENTE" ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle size={14} /> VIGENTE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-bold">
                        <XCircle size={14} /> Cancelado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
