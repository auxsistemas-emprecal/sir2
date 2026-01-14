// // MovimientosTable.jsx

// import React from "react";
// import { XCircle, CheckCircle, FileText, Ban, ReceiptText } from "lucide-react";

// // =================== FORMATOS ===================
// const formatCurrency = (val) =>
//   new Intl.NumberFormat("es-CO", {
//     style: "currency",
//     currency: "COP",
//     minimumFractionDigits: 0,
//   }).format(val ?? 0);

// const formatFecha = (f) => (f ? f.split("T")[0] : "--");

// const renderCheck = (value) =>
//   value == 1 ? (
//     <CheckCircle
//       size={16}
//       className="text-emerald-500 mx-auto drop-shadow-sm"
//     />
//   ) : (
//     <XCircle size={16} className="text-slate-300 mx-auto opacity-50" />
//   );

// // =================================================

// export default function MovimientosTable({ data = [], toggleEstado, onEdit }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
//       <div className="overflow-x-auto">
//         <table className="w-full text-xs text-left text-slate-700 whitespace-nowrap border-separate border-spacing-0">
//           <thead>
//             {/* ENCABEZADO SUPERIOR: CATEGORÍAS */}
//             <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-[0.15em]">
//               {/* Ajuste: Fondo sólido para que el scroll no se vea arriba */}
//               <th className="sticky left-0 bg-slate-900 z-50 px-4 py-3 border-r border-slate-800 text-center">
//                 Gestión
//               </th>
//               <th
//                 colSpan={2}
//                 className="px-4 py-3 text-center border-r border-slate-800 bg-slate-800/40"
//               >
//                 Información Base
//               </th>
//               <th
//                 colSpan={2}
//                 className="px-4 py-3 text-center border-r border-slate-800"
//               >
//                 Logística
//               </th>
//               <th
//                 colSpan={3}
//                 className="px-4 py-3 text-center border-r border-slate-800 bg-slate-800/40"
//               >
//                 Identificación
//               </th>
//               <th
//                 colSpan={2}
//                 className="px-4 py-3 text-center border-r border-slate-800"
//               >
//                 Carga
//               </th>
//               <th
//                 colSpan={6}
//                 className="px-4 py-3 text-center border-r border-slate-800 bg-emerald-900/30 text-emerald-400 font-black"
//               >
//                 Liquidación de Valores
//               </th>
//               <th colSpan={4} className="px-4 py-3 text-center">
//                 Estado y Administrativo
//               </th>
//             </tr>

//             {/* ENCABEZADO SECUNDARIO: TÍTULOS */}
//             <tr className="bg-slate-50 text-slate-600 uppercase border-b-2 border-slate-200 shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]">
//               {/* Ajuste: z-index 40 y fondo sólido */}
//               <th className="px-4 py-4 font-black sticky left-0 bg-slate-50 z-40 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
//                 Acción
//               </th>
//               <th className="px-4 py-4 font-bold">Fecha</th>
//               <th className="px-4 py-4 font-black text-slate-900 border-r border-slate-200">
//                 Remisión
//               </th>
//               <th className="px-4 py-4 font-bold">Tercero</th>
//               <th className="px-4 py-4 font-bold border-r border-slate-200">
//                 Conductor
//               </th>
//               <th className="px-4 py-4 font-bold text-center">Cédula</th>
//               <th className="px-4 py-4 font-bold text-center">Teléfono</th>
//               <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">
//                 Placa
//               </th>
//               <th className="px-4 py-4 font-bold text-center">Cub.</th>
//               <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">
//                 No Ingreso
//               </th>
//               <th className="px-4 py-4 font-bold text-right text-slate-500">
//                 Subtotal
//               </th>
//               <th className="px-4 py-4 font-bold text-right text-slate-500">
//                 IVA
//               </th>
//               <th className="px-4 py-4 font-bold text-right text-red-500">
//                 Ret.
//               </th>
//               <th className="px-4 py-4 font-bold text-center">¿IVA?</th>
//               <th className="px-4 py-4 font-bold text-center border-r border-emerald-100">
//                 ¿Ret?
//               </th>
//               <th className="px-4 py-4 font-black bg-emerald-600 text-white text-right shadow-lg">
//                 TOTAL
//               </th>
//               <th className="px-4 py-4 font-bold text-center">Pago</th>
//               <th className="px-4 py-4 font-bold text-center">Pagado</th>
//               <th className="px-4 py-4 font-bold text-center">Factura No.</th>
//               <th className="px-4 py-4 font-bold">Observaciones</th>
//               <th className="px-4 py-4 font-bold">Usuario</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-100 bg-white">
//             {data.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={22}
//                   className="text-center py-20 text-slate-300 bg-slate-50/30 font-light"
//                 >
//                   <Ban className="mx-auto mb-4 opacity-10" size={64} />
//                   <span className="text-lg tracking-widest uppercase">
//                     Sin Movimientos
//                   </span>
//                 </td>
//               </tr>
//             ) : (
//               data.map((row) => {
//                 const isAnulada = row.estado !== "VIGENTE";

//                 return (
//                   <tr
//                     key={row.remision}
//                     className={`transition-all duration-150 group/row ${
//                       isAnulada
//                         ? "bg-slate-50 opacity-60 grayscale-[0.5]"
//                         : "hover:bg-blue-50/40"
//                     }`}
//                   >
//                     {/* --- AJUSTE CLAVE AQUÍ --- */}
//                     <td
//                       className={`px-4 py-3 sticky left-0 z-30 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] 
//                       ${
//                         isAnulada
//                           ? "bg-slate-100"
//                           : "bg-white group-hover/row:bg-[#f8fafc]"
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => onEdit(row)}
//                           className="p-2 rounded-lg bg-white text-slate-600 hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 border border-slate-200 shadow-sm"
//                         >
//                           <FileText size={16} />
//                         </button>
//                         <button
//                           onClick={() => toggleEstado(row.remision)}
//                           className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border-2 transition-all ${
//                             isAnulada
//                               ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white"
//                               : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
//                           }`}
//                         >
//                           {isAnulada ? "ANULADA" : "VIGENTE"}
//                         </button>
//                       </div>
//                     </td>

//                     {/* DATOS DINÁMICOS */}
//                     <td className="px-4 py-3 text-slate-400 font-mono font-medium">
//                       {formatFecha(row.fecha)}
//                     </td>
//                     <td
//                       className={`px-4 py-3 font-black border-r border-slate-100 ${
//                         isAnulada
//                           ? "text-slate-400 line-through"
//                           : "text-slate-800"
//                       }`}
//                     >
//                       {row.remision}
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-transform duration-300 group-hover/row:scale-110 
//                           ${
//                             isAnulada
//                               ? "bg-slate-200 text-slate-400"
//                               : "bg-linear-to-br from-blue-500 to-blue-600 text-white"
//                           }`}
//                         >
//                           {row.tercero?.charAt(0).toUpperCase()}
//                         </div>
//                         <span
//                           className={`font-bold uppercase tracking-tight ${
//                             isAnulada ? "text-slate-400" : "text-slate-700"
//                           }`}
//                         >
//                           {row.tercero}
//                         </span>
//                       </div>
//                     </td>

//                     <td className="px-4 py-3 text-slate-500 uppercase border-r border-slate-100">
//                       {row.conductor}
//                     </td>
//                     <td className="px-4 py-3 font-mono text-center text-slate-400">
//                       {row.cedula || row.cedula_cliente || "--"}
//                     </td>
//                     <td className="px-4 py-3 text-center text-slate-400">
//                       {row.telefono || row.telefono_cliente || "--"}
//                     </td>
//                     <td className="px-4 py-3 text-center border-r border-slate-100">
//                       <span
//                         className={`font-mono font-black px-3 py-1 rounded text-[10px] tracking-widest shadow-sm 
//                         ${
//                           isAnulada
//                             ? "bg-slate-200 text-slate-400"
//                             : "bg-slate-800 text-white"
//                         }`}
//                       >
//                         {row.placa}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center font-black text-slate-700">
//                       {row.cubicaje}{" "}
//                       <span className="text-[10px] text-slate-400">m³</span>
//                     </td>
//                     <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-400">
//                       {row.no_ingreso || "--"}
//                     </td>

//                     <td className="px-4 py-3 text-right font-mono text-slate-500">
//                       {formatCurrency(row.subtotal)}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono text-slate-400">
//                       {formatCurrency(row.iva)}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono text-red-500">
//                       {formatCurrency(row.retencion)}
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       {renderCheck(row.incluir_iva)}
//                     </td>
//                     <td className="px-4 py-3 text-center border-r border-emerald-50">
//                       {renderCheck(row.incluir_ret)}
//                     </td>

//                     <td
//                       className={`px-4 py-3 font-black text-right border-x text-[13px] shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]
//                       ${
//                         isAnulada
//                           ? "bg-slate-100 text-slate-400 border-slate-200"
//                           : "bg-emerald-50 text-emerald-800 border-emerald-100"
//                       }`}
//                     >
//                       {formatCurrency(row.total)}
//                     </td>

//                     <td className="px-4 py-3 text-center">
//                       <span
//                         className={`px-2 py-1 rounded text-[9px] font-black border uppercase italic transition-colors
//                         ${
//                           isAnulada
//                             ? "bg-slate-100 text-slate-400 border-slate-200"
//                             : "bg-blue-50 text-blue-700 border-blue-100"
//                         }`}
//                       >
//                         {row.tipo_pago}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       {renderCheck(row.pagado)}
//                     </td>

//                     <td className="px-4 py-3 text-center border-r border-slate-50">
//                       {row.factura ? (
//                         <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full shadow-md">
//                           <ReceiptText size={12} className="text-emerald-400" />
//                           <span className="text-[10px] font-black tracking-widest">
//                             {row.factura}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-[9px] font-bold text-slate-300 italic uppercase">
//                           Pendiente
//                         </span>
//                       )}
//                     </td>

//                     <td
//                       className="px-4 py-3 italic text-slate-400 max-w-[150px] truncate"
//                       title={row.observacion}
//                     >
//                       {row.observacion || "Sin notas"}
//                     </td>

//                     <td
//                       className="px-4 py-3 italic text-slate-400 max-w-[150px] truncate"
//                       title={row.usuario}
//                     >
//                       {row.usuario || "Desconocido"}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { XCircle, CheckCircle, FileText, Ban, ReceiptText } from "lucide-react";

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
    <CheckCircle
      size={16}
      className="text-emerald-500 mx-auto drop-shadow-sm"
    />
  ) : (
    <XCircle size={16} className="text-slate-300 mx-auto opacity-50" />
  );

// =================================================

export default function MovimientosTable({ data = [], toggleEstado, onEdit }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 whitespace-nowrap border-separate border-spacing-0">
          <thead>
            {/* ENCABEZADO SUPERIOR: CATEGORÍAS */}
            <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-[0.15em]">
              <th className="sticky left-0 bg-slate-900 z-50 px-4 py-3 border-r border-slate-800 text-center">
                Gestión
              </th>
              <th
                colSpan={2}
                className="px-4 py-3 text-center border-r border-slate-800 bg-slate-800/40"
              >
                Información Base
              </th>
              <th
                colSpan={2}
                className="px-4 py-3 text-center border-r border-slate-800"
              >
                Logística
              </th>
              <th
                colSpan={3}
                className="px-4 py-3 text-center border-r border-slate-800 bg-slate-800/40"
              >
                Identificación
              </th>
              {/* CAMBIO: colSpan aumenta de 2 a 5 para incluir Pesaje */}
              <th
                colSpan={5}
                className="px-4 py-3 text-center border-r border-slate-800"
              >
                Carga y Pesaje kg.
              </th>
              <th
                colSpan={6}
                className="px-4 py-3 text-center border-r border-slate-800 bg-emerald-900/30 text-emerald-400 font-black"
              >
                Liquidación de Valores
              </th>
              <th colSpan={4} className="px-4 py-3 text-center">
                Estado y Administrativo
              </th>
            </tr>

            {/* ENCABEZADO SECUNDARIO: TÍTULOS */}
            <tr className="bg-slate-50 text-slate-600 uppercase border-b-2 border-slate-200 shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]">
              <th className="px-4 py-4 font-black sticky left-0 bg-slate-50 z-40 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Acción
              </th>
              <th className="px-4 py-4 font-bold">Fecha</th>
              <th className="px-4 py-4 font-black text-slate-900 border-r border-slate-200">
                Remisión
              </th>
              <th className="px-4 py-4 font-bold">Tercero</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200">
                Conductor
              </th>
              <th className="px-4 py-4 font-bold text-center">Cédula</th>
              <th className="px-4 py-4 font-bold text-center">Teléfono</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">
                Placa
              </th>
              {/* SECCIÓN CARGA AMPLIADA */}
              <th className="px-4 py-4 font-bold text-center">Cub.</th>
              <th className="px-4 py-4 font-bold text-center">No Ingreso</th>
              <th className="px-4 py-4 font-bold text-center bg-slate-100/50">P. Ent.</th>
              <th className="px-4 py-4 font-bold text-center bg-slate-100/50">P. Sal.</th>
              <th className="px-4 py-4 font-black border-r border-slate-200 text-center text-emerald-600 bg-emerald-50/50">
                P. Neto
              </th>
              {/* FIN SECCIÓN CARGA */}
              <th className="px-4 py-4 font-bold text-right text-slate-500">
                Subtotal
              </th>
              <th className="px-4 py-4 font-bold text-right text-slate-500">
                IVA
              </th>
              <th className="px-4 py-4 font-bold text-right text-red-500">
                Ret.
              </th>
              <th className="px-4 py-4 font-bold text-center">¿IVA?</th>
              <th className="px-4 py-4 font-bold text-center border-r border-emerald-100">
                ¿Ret?
              </th>
              <th className="px-4 py-4 font-black bg-emerald-600 text-white text-right shadow-lg">
                TOTAL
              </th>
              <th className="px-4 py-4 font-bold text-center">Pago</th>
              <th className="px-4 py-4 font-bold text-center">Pagado</th>
              <th className="px-4 py-4 font-bold text-center">Factura No.</th>
              <th className="px-4 py-4 font-bold">Observaciones</th>
              <th className="px-4 py-4 font-bold">Usuario</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={25}
                  className="text-center py-20 text-slate-300 bg-slate-50/30 font-light"
                >
                  <Ban className="mx-auto mb-4 opacity-10" size={64} />
                  <span className="text-lg tracking-widest uppercase">
                    Sin Movimientos
                  </span>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isAnulada = row.estado !== "VIGENTE";

                return (
                  <tr
                    key={row.remision}
                    className={`transition-all duration-150 group/row ${
                      isAnulada
                        ? "bg-slate-50 opacity-60 grayscale-[0.5]"
                        : "hover:bg-blue-50/40"
                    }`}
                  >
                    <td
                      className={`px-4 py-3 sticky left-0 z-30 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] 
                      ${
                        isAnulada
                          ? "bg-slate-100"
                          : "bg-white group-hover/row:bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(row)}
                          className="p-2 rounded-lg bg-white text-slate-600 hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 border border-slate-200 shadow-sm"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => toggleEstado(row.remision)}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border-2 transition-all ${
                            isAnulada
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {isAnulada ? "ANULADA" : "VIGENTE"}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-mono font-medium">
                      {formatFecha(row.fecha)}
                    </td>
                    <td
                      className={`px-4 py-3 font-black border-r border-slate-100 ${
                        isAnulada
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {row.remision}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-transform duration-300 group-hover/row:scale-110 
                          ${
                            isAnulada
                              ? "bg-slate-200 text-slate-400"
                              : "bg-linear-to-br from-blue-500 to-blue-600 text-white"
                          }`}
                        >
                          {row.tercero?.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`font-bold uppercase tracking-tight ${
                            isAnulada ? "text-slate-400" : "text-slate-700"
                          }`}
                        >
                          {row.tercero}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-500 uppercase border-r border-slate-100">
                      {row.conductor}
                    </td>
                    <td className="px-4 py-3 font-mono text-center text-slate-400">
                      {row.cedula || row.cedula_cliente || "--"}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {row.telefono || row.telefono_cliente || "--"}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-100">
                      <span
                        className={`font-mono font-black px-3 py-1 rounded text-[10px] tracking-widest shadow-sm 
                        ${
                          isAnulada
                            ? "bg-slate-200 text-slate-400"
                            : "bg-slate-800 text-white"
                        }`}
                      >
                        {row.placa}
                      </span>
                    </td>

                    {/* NUEVAS CELDAS DE CARGA Y PESAJE */}
                    <td className="px-4 py-3 text-center font-black text-slate-700">
                      {row.cubicaje}{" "}
                      <span className="text-[10px] text-slate-400">m³</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {row.no_ingreso || "--"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-500 bg-slate-50/30">
                      {Number(row.pesoEntrada || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-500 bg-slate-50/30">
                      {Number(row.pesoSalida || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-black text-emerald-700 border-r border-slate-200 bg-emerald-50/30">
                      {Number(row.peso_neto || (Number(row.pesoSalida || 0) - Number(row.pesoEntrada || 0))).toLocaleString()}
                    </td>
                    {/* FIN CELDAS PESAJE */}

                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {formatCurrency(row.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {formatCurrency(row.iva)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-500">
                      {formatCurrency(row.retencion)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderCheck(row.incluir_iva)}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-emerald-50">
                      {renderCheck(row.incluir_ret)}
                    </td>

                    <td
                      className={`px-4 py-3 font-black text-right border-x text-[13px] shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]
                      ${
                        isAnulada
                          ? "bg-slate-100 text-slate-400 border-slate-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-100"
                      }`}
                    >
                      {formatCurrency(row.total)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-black border uppercase italic transition-colors
                        ${
                          isAnulada
                            ? "bg-slate-100 text-slate-400 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                      >
                        {row.tipo_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderCheck(row.pagado)}
                    </td>

                    <td className="px-4 py-3 text-center border-r border-slate-50">
                      {row.factura ? (
                        <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full shadow-md">
                          <ReceiptText size={12} className="text-emerald-400" />
                          <span className="text-[10px] font-black tracking-widest">
                            {row.factura}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 italic uppercase">
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td
                      className="px-4 py-3 italic text-slate-400 max-w-[150px] truncate"
                      title={row.observacion}
                    >
                      {row.observacion || "Sin notas"}
                    </td>

                    <td
                      className="px-4 py-3 italic text-slate-400 max-w-[150px] truncate"
                      title={row.usuario}
                    >
                      {row.usuario || "Desconocido"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}