// import React, { useState, useMemo, useEffect } from "react";
// import {fetchMovimientos,fetchTiposPago, createGastoDiario, createCuadreDiario} from "../assets/services/apiService";
// import { saveCuadreCaja } from "../assets/services/apiService"; // Ajusta la ruta según tu carpeta

// export default function CuadreCaja() {
//   // ===============================
//   // FECHA
//   // ===============================
//   const hoy = new Date().toISOString().split("T")[0];
//   const [fechaConsulta, setFechaConsulta] = useState(hoy);

//   // ===============================
//   // GASTOS (LOCAL)
//   // ===============================
//   const [gastos, setGastos] = useState([]);
//   const [formGasto, setFormGasto] = useState({
//     descripcion: "",
//     valor: "",
//     observacion: "",
//   });

//   // ===============================
//   // ARQUEO DE CAJA
//   // ===============================
//   const billetes = [100000, 50000, 20000, 10000, 5000, 2000];

//   const [arqueo, setArqueo] = useState({
//     100000: 0,
//     50000: 0,
//     20000: 0,
//     10000: 0,
//     5000: 0,
//     2000: 0,
//     monedas: 0, // total de monedas
//   });

//   // ===============================
//   // MOVIMIENTOS / TIPOS DE PAGO
//   // ===============================
//   const [movimientos, setMovimientos] = useState([]);
//   const [tiposPago, setTiposPago] = useState([]);
//   const [loadingMov, setLoadingMov] = useState(false);
//   const [recibosCaja, setRecibosCaja] = useState(0);
//   // ===============================
//   // MAPA DE TIPOS DE PAGO
//   // ===============================
//   const tiposPagoMap = useMemo(() => {
//   const map = {};
//   tiposPago.forEach((t) => {
//     // Usamos el ID como clave y el nombre limpio como valor
//     map[Number(t.idTipoPago)] = t.tipo_pago.trim();
//   });
//   return map;
//   }, [tiposPago]);

//   // ===============================
//   // EFFECT: CARGAR DATOS
//   // ===============================
//   useEffect(() => {
//     const cargarDatos = async () => {
//       try {
//         setLoadingMov(true);

//         const [movs, tipos] = await Promise.all([
//           fetchMovimientos(),
//           fetchTiposPago(),
//         ]);

//         setMovimientos(Array.isArray(movs) ? movs : []);
//         setTiposPago(Array.isArray(tipos) ? tipos : []);
//       } catch (error) {
//         console.error("Error cargando datos de cuadre:", error);
//         setMovimientos([]);
//         setTiposPago([]);
//       } finally {
//         setLoadingMov(false);
//       }
//     };

//     cargarDatos();
//   }, []);

// // ===============================
// // VALIDACIÓN DE DATOS (AQUÍ)
// // ===============================
// useEffect(() => {
//   if (movimientos.length > 0 && tiposPago.length > 0) {
//     // console.group("🔍 Validación de Cuadre");
//     // console.log("1. Tipos de Pago en el Mapa:", tiposPagoMap);

//     const primerMov = movimientos[0];
//     // console.log("2. Estructura de un movimiento real:", primerMov);

//     // Verificamos si los nombres de las propiedades coinciden
//     const idEncontrado = primerMov.idTipoPago;
//     // console.log("3. ID de pago detectado:", idEncontrado);
//     // console.log("4. ¿Encontrado en mapa?:", tiposPagoMap[Number(idEncontrado)] || "NO");
//     // console.groupEnd();
//   }
// }, [movimientos, tiposPago, tiposPagoMap]);

//   // ===============================
//   // MANEJO GASTOS
//   // ===============================
//   const handleGastoChange = (e) => {
//     setFormGasto({
//       ...formGasto,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const agregarGasto = async (e) => {
//   e.preventDefault();

//   if (!formGasto.descripcion || !formGasto.valor) return;

//   const nuevoGasto = {
//     descripcion: formGasto.descripcion,
//     valor: Number(formGasto.valor),
//     observacion: formGasto.observacion,
//     fecha: hoy,
//   };

//   try {
//     // 🔹 Guardar en backend
//     const gastoGuardado = await createGastoDiario(nuevoGasto);

//     // 🔹 Guardar en estado local (UI)
//     setGastos([
//       ...gastos,
//       {
//         ...nuevoGasto,
//         id: gastoGuardado.id ?? Date.now(),
//       },
//     ]);

//     setFormGasto({ descripcion: "", valor: "", observacion: "" });

//   } catch (error) {
//     console.error("Error guardando gasto:", error);
//     alert("❌ No se pudo guardar el gasto: " + error.message);
//   }
// };

//   const eliminarGasto = (id) => {
//     // Filtramos el array para mantener todos los gastos excepto el que coincide con el ID
//     setGastos(gastos.filter((g) => g.id !== id));
//   };

//   const gastosHoy = useMemo(
//     () => gastos.filter((g) => g.fecha === hoy),
//     [gastos, hoy]
//   );

//   const totalGastosHoy = gastosHoy.reduce(
//     (acc, g) => acc + g.valor,
//     0
//   );

//   // ===============================
//   // ARQUEO
//   // ===============================
//   const handleArqueoChange = (key, value) => {
//     setArqueo({
//       ...arqueo,
//       [key]: Number(value),
//     });
//   };

//   const totalArqueo = useMemo(() => {
//     const totalBilletes = billetes.reduce(
//       (acc, den) => acc + den * arqueo[den],
//       0
//     );
//     return totalBilletes + Number(arqueo.monedas || 0);
//   }, [arqueo]);

//   // ===============================
//   // MOVIMIENTOS FILTRADOS
//   // ===============================
//   const movimientosFiltrados = useMemo(() => {
//     return movimientos.filter(
//       (m) => m.fecha?.split("T")[0] === fechaConsulta
//     );
//   }, [movimientos, fechaConsulta]);
//   // -------------------------------

// const obtenerTipoPago = (movimiento) => {
//   if (!movimiento) return "N/A";
//   // Usamos directamente la propiedad 'tipo_pago' que vimos en tu consola
//   const tipo = movimiento.tipo_pago;

//   return tipo ? tipo.trim() : "N/A";
// };

// // ===============================
// // TOTALES POR TIPO DE PAGO
// // ===============================

//   // 1. Totales base de las facturas
//   const totalesPorTipo = useMemo(() => {
//     const resumen = { Efectivo: 0, Crédito: 0, Transferencia: 0 };
//     movimientosFiltrados.forEach((m) => {
//       const tipo = obtenerTipoPago(m);
//       const total = Number(m.total) || 0;
//       if (tipo === "Efectivo" || tipo === "Pago por anticipado") resumen.Efectivo += total;
//       else if (tipo === "Crédito") resumen.Crédito += total;
//       else if (tipo === "Transferencia") resumen.Transferencia += total;
//     });
//     return resumen;
//   }, [movimientosFiltrados]);

//   // 2. Resumen Final (Incluyendo Gastos y Recibos)
//   const resumenFinal = useMemo(() => {
//     const ingresosTotales =
//       totalesPorTipo.Efectivo +
//       totalesPorTipo.Crédito +
//       totalesPorTipo.Transferencia +
//       Number(recibosCaja);

//     return {
//       // (Efectivo Ventas + Recibos) - Gastos
//       totalEfectivoNeto: (totalesPorTipo.Efectivo + Number(recibosCaja)) - totalGastosHoy,
//       totalNetoGeneral: ingresosTotales - totalGastosHoy
//     };
//   }, [totalesPorTipo, totalGastosHoy, recibosCaja]);

//   // 3. Conciliación (Compara con el Arqueo Físico)
//   const conciliacion = useMemo(() => {
//     const diferencia = totalArqueo - resumenFinal.totalEfectivoNeto;

//     let estado = {
//       mensaje: "Caja Cuadrada ✅",
//       colorClase: "text-emerald-600",
//       bgClase: "bg-emerald-50",
//       bordeClase: "border-emerald-200"
//     };

//     if (diferencia > 0) {
//       estado = { mensaje: "Sobrante ➕", colorClase: "text-orange-600", bgClase: "bg-orange-50", bordeClase: "border-orange-200" };
//     } else if (diferencia < 0) {
//       estado = { mensaje: "Faltante ⚠️", colorClase: "text-red-600", bgClase: "bg-red-50", bordeClase: "border-red-200" };
//     }

//     return { diferencia, ...estado };
//   }, [totalArqueo, resumenFinal.totalEfectivoNeto]);

//   const handleFinalizarCuadre = async () => {
//   // Usamos los valores calculados en resumenFinal
//   const ventasTotalesNetas = resumenFinal.totalNetoGeneral;
//   const efectivoNeto = resumenFinal.totalEfectivoNeto;

//   // Corregimos los nombres de las variables para la validación
//   if (ventasTotalesNetas === 0 && totalGastosHoy === 0) {
//     if (!window.confirm("El total de ventas y gastos es $0. ¿Deseas guardar el cuadre de todas formas?")) {
//       return;
//     }
//   }

//     const datosParaGuardar = {
//       fecha: fechaConsulta,
//       gastos_diarios: totalGastosHoy,
//       efectivo_ventas: totalesPorTipo.Efectivo || 0,
//       recibos_caja: Number(recibosCaja) || 0,
//       credito: totalesPorTipo.Crédito || 0,
//       transferencia: totalesPorTipo.Transferencia || 0,
//       total_efectivo_caja: efectivoNeto,
//       total_neto_dia: ventasTotalesNetas
//     };

//     const datosArqueo = {
//     fecha: fechaConsulta,

//     billete_100k: arqueo[100000] || 0,
//     billete_50k: arqueo[50000] || 0,
//     billete_20k: arqueo[20000] || 0,
//     billete_10k: arqueo[10000] || 0,
//     billete_5k: arqueo[5000] || 0,
//     billete_2k: arqueo[2000] || 0,

//     monedas_total: Number(arqueo.monedas) || 0,

//     efectivo_esperado_sistema: resumenFinal.totalEfectivoNeto,
//     total_arqueo: totalArqueo,
//     diferencia_valor: conciliacion.diferencia,

//     estado_caja:
//       conciliacion.diferencia === 0
//         ? "CUADRADO"
//         : conciliacion.diferencia > 0
//         ? "SOBRANTE"
//         : "FALTANTE",
//   };

//   try {
//     await saveCuadreCaja(datosParaGuardar);
//     await createCuadreDiario(datosArqueo);
//     alert("✅ El cuadre y el arqueo de caja se guardaron correctamente.");
//   } catch (error) {
//     console.error("Error al guardar:", error);
//     alert("❌ Error al guardar el cuadre: " + error.message);
//   }
// };

//   // ===============================
//   // RENDER
//   // ===============================
//   return (
//       /* 1. AGREGAR EL ID AQUÍ: */
//     <div id="cuadre-print" className="p-6 bg-white rounded-xl shadow-lg">

//       <style>
//   {`
//     @media print {
//       /* 1. Anulamos el posicionamiento absoluto del index.css para ganar espacio */
//       #cuadre-print {
//         position: static !important;
//         transform: scale(0.9) !important; /* Reducimos un poco el tamaño general */
//         transform-origin: top center !important;
//         margin: 0 !important;
//         padding: 10px !important;
//         width: 100% !important;
//       }

//       /* 2. Quitamos márgenes excesivos de los títulos y tablas */
//       h2, h3 {
//         margin-top: 5px !important;
//         margin-bottom: 5px !important;
//         font-size: 16px !important;
//       }

//       /* 3. Compactamos las celdas de las tablas */
//       table { margin-bottom: 10px !important; }
//       th, td {
//         padding: 4px !important;
//         font-size: 12px !important;
//       }

//       /* 4. Reducimos el tamaño del cuadro de conciliación (el de abajo) */
//       .p-6 { padding: 15px !important; }
//       .mb-10 { margin-bottom: 10px !important; }
//       .text-3xl { font-size: 20px !important; }
//       .text-2xl { font-size: 18px !important; }

//       /* 5. Aseguramos que los gráficos de fondo (colores) se vean */
//       * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

//       .no-print { display: none !important; }
//     }
//   `}
// </style>
//       {/* <h2 className="text-2xl font-bold mb-6">💵 Cuadre de Caja</h2> */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="no-print text-2xl font-bold">💵 Cuadre de Caja</h2>
//         {/* Tu botón de imprimir... */}
//         <button
//           onClick={() => window.print()}
//           className="no-print bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           🖨️ Imprimir
//         </button>
//       </div>

//       {/* ===================== GASTOS ===================== */}
//       <form
//         onSubmit={agregarGasto}
//         className="no-print grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
//       >
//         <input
//           name="descripcion"
//           placeholder="Gasto"
//           value={formGasto.descripcion}
//           onChange={handleGastoChange}
//           className="border p-2 rounded"
//         />
//         <input
//           name="valor"
//           type="number"
//           placeholder="Valor"
//           value={formGasto.valor}
//           onChange={handleGastoChange}
//           className="border p-2 rounded"
//         />
//         <input
//           name="observacion"
//           placeholder="Observación"
//           value={formGasto.observacion}
//           onChange={handleGastoChange}
//           className="border p-2 rounded"
//         />
//         <button className="md:col-span-3 bg-emerald-600 text-white p-2 rounded">
//           Agregar gasto
//         </button>
//       </form>

//       {/* ===== TABLA GASTOS REGISTRADOS ===== */}
//       <h3 className="font-semibold mb-2">📌 Gastos del día</h3>
//       <table className="w-full border mb-8 text-sm">
//         <thead className="bg-emerald-100">
//           <tr>
//             <th className="border p-2">Gasto</th>
//             <th className="border p-2">Valor</th>
//             <th className="border p-2">Observación</th>
//             <th className="border p-2 text-center w-20">Acciones</th> {/* Nueva columna */}
//           </tr>
//         </thead>
//         <tbody>
//           {gastosHoy.length === 0 ? (
//             <tr>
//               <td colSpan="4" className="border p-4 text-center text-gray-500">
//                 No hay gastos registrados hoy
//               </td>
//             </tr>
//           ) : (
//             gastosHoy.map((g) => (
//               <tr key={g.id} className="hover:bg-gray-50">
//                 <td className="border p-2">{g.descripcion}</td>
//                 <td className="border p-2">
//                   ${g.valor.toLocaleString("es-CO")}
//                 </td>
//                 <td className="border p-2">{g.observacion || "-"}</td>
//                 <td className="border p-2 text-center">
//                   <button
//                     onClick={() => eliminarGasto(g.id)}
//                     className="text-red-500 hover:text-red-700 transition-colors"
//                     title="Eliminar gasto"
//                   >
//                     {/* Icono simple de papelera */}
//                     ✘
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//           <tr className="bg-gray-100 font-bold">
//             <td className="border p-2 text-right">TOTAL GASTOS</td>
//             <td className="border p-2">
//               ${totalGastosHoy.toLocaleString("es-CO")}
//             </td>
//             <td className="border p-2"></td>
//             <td className="border p-2"></td> {/* Celda vacía para mantener la estructura */}
//           </tr>
//         </tbody>
//       </table>

// {/* ===================== TABLA RESUMEN DE CAJA ACTUALIZADA ===================== */}
//       <div className="mb-8 overflow-hidden border rounded-lg shadow-sm">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-50 border-b">
//               <th className="p-3 font-bold text-gray-700">Tipo</th>
//               <th className="p-3 font-bold text-gray-700 text-right">Valor</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="border-b">
//               <td className="p-3 text-gray-600 font-medium italic">(-) Gastos del día</td>
//               <td className="p-3 text-right text-red-600 font-semibold">
//                 -${totalGastosHoy.toLocaleString("es-CO")}
//               </td>
//             </tr>
//             <tr className="border-b">
//               <td className="p-3 text-gray-600">Efectivo (Ventas)</td>
//               <td className="p-3 text-right text-gray-700">
//                 ${totalesPorTipo.Efectivo.toLocaleString("es-CO")}
//               </td>
//             </tr>
//             {/* FILA CON INPUT DE RECIBOS */}
//             <tr className="border-b bg-blue-50/30">
//               <td className="p-3 text-blue-800 font-medium">Recibos de caja (Ingresos extra)</td>
//               <td className="p-3 text-right">
//                 <input
//                   type="number"
//                   value={recibosCaja}
//                   onChange={(e) => setRecibosCaja(Number(e.target.value))}
//                   className="w-32 border border-blue-300 p-1 text-right font-bold text-blue-700 rounded bg-white"
//                   placeholder="0"
//                 />
//               </td>
//             </tr>
//             <tr className="border-b">
//               <td className="p-3 text-gray-600">Crédito</td>
//               <td className="p-3 text-right text-gray-700">
//                 ${totalesPorTipo.Crédito.toLocaleString("es-CO")}
//               </td>
//             </tr>
//             <tr className="border-b">
//               <td className="p-3 text-gray-600">Transferencia</td>
//               <td className="p-3 text-right text-gray-700">
//                 ${totalesPorTipo.Transferencia.toLocaleString("es-CO")}
//               </td>
//             </tr>
//             {/* TOTALES FINALES */}
//             <tr className="bg-green-50 border-b">
//               <td className="p-3 font-bold text-green-800 uppercase text-sm">Total Efectivo en Caja (Ventas + Recibos - Gastos)</td>
//               <td className="p-3 text-right font-bold text-green-800 text-lg">
//                 ${resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
//               </td>
//             </tr>
//             <tr className="bg-blue-600 text-white">
//               <td className="p-3 font-bold uppercase text-sm">Total Neto del Día (Todo - Gastos)</td>
//               <td className="p-3 text-right font-bold text-xl">
//                 ${resumenFinal.totalNetoGeneral.toLocaleString("es-CO")}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* ===================== ARQUEO ===================== */}
//       <h3 className="font-semibold mb-2">🧾 Arqueo de Caja</h3>
//       <table className="w-full border mb-10">
//         <thead className="bg-blue-100">
//           <tr>
//             <th className="border p-2">Denominación</th>
//             <th className="border p-2 text-center">Cantidad</th>
//             <th className="border p-2 text-right">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           {billetes.map((den) => (
//             <tr key={den}>
//               <td className="border p-2">
//                 ${den.toLocaleString("es-CO")}
//               </td>
//               <td className="border p-2 text-center">
//                 <input
//                   type="number"
//                   min="0"
//                   value={arqueo[den]}
//                   onChange={(e) =>
//                     handleArqueoChange(den, e.target.value)
//                   }
//                   className="w-20 border p-1 text-center"
//                 />
//               </td>
//               <td className="border p-2 text-right">
//                 ${(den * arqueo[den]).toLocaleString("es-CO")}
//               </td>
//             </tr>
//           ))}

//           {/* MONEDAS */}
//           <tr className="bg-gray-100 font-semibold">
//             <td className="border p-2">Monedas (total)</td>
//             <td className="border p-2 text-center">
//               <input
//                 type="number"
//                 min="0"
//                 value={arqueo.monedas}
//                 onChange={(e) =>
//                   handleArqueoChange("monedas", e.target.value)
//                 }
//                 className="w-28 border p-1 text-center"
//               />
//             </td>
//             <td className="border p-2 text-right">
//               ${Number(arqueo.monedas).toLocaleString("es-CO")}
//             </td>
//           </tr>

//           <tr className="bg-blue-200 font-bold">
//             <td colSpan="2" className="border p-2 text-right">
//               TOTAL ARQUEO
//             </td>
//             <td className="border p-2 text-right">
//               ${totalArqueo.toLocaleString("es-CO")}
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       {/* ===================== RESULTADO DE CONCILIACIÓN ===================== */}
//       <div className={`p-6 mb-10 border-2 rounded-xl ${conciliacion.bgClase} ${conciliacion.bordeClase} transition-all`}>
//         <div className="flex flex-col md:flex-row justify-between items-center gap-6">

//           <div className="text-center md:text-left">
//             <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Efectivo esperado por Sistema</p>
//             <p className="text-2xl font-bold text-gray-800">
//               ${resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
//             </p>
//           </div>

//           <div className="text-center px-8 border-x border-gray-200">
//             <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado de Caja</p>
//             <p className={`text-xl font-black ${conciliacion.colorClase}`}>
//               {conciliacion.mensaje}
//             </p>
//           </div>

//           <div className="text-center md:text-right">
//             <p className="text-xs text-gray-500 uppercase font-bold tracking-wider underline">Diferencia (Sobrante/Faltante)</p>
//             <p className={`text-3xl font-black ${conciliacion.colorClase}`}>
//               ${Math.abs(conciliacion.diferencia).toLocaleString("es-CO")}
//             </p>
//           </div>

//         </div>
//       </div>

//       <button
//         onClick={handleFinalizarCuadre}
//         className="no-print bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
//       >
//         💾 Guardar Cuadre del Día
//       </button>

//     {/* etiqueta para no imprimir la seccion de facturas */}
//     <div className="no-print mt-10 border-t pt-6">

//       {/* ===================== FACTURAS ===================== */}
//       <h3 className="text-xl font-bold mb-3">📋 Facturas</h3>

//       <input
//         type="date"
//         value={fechaConsulta}
//         onChange={(e) => setFechaConsulta(e.target.value)}
//         className="border p-2 mb-4"
//       />

//       {loadingMov ? (
//         <p>Cargando movimientos...</p>
//       ) : (
//         <table className="w-full border">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="border p-2">Fecha</th>
//               <th className="border p-2">Remisión</th>
//               <th className="border p-2">Conductor</th>
//               <th className="border p-2">Placa</th>
//               <th className="border p-2">Subtotal</th>
//               <th className="border p-2">IVA</th>
//               <th className="border p-2">Retención</th>
//               <th className="border p-2">Total</th>
//               <th className="border p-2">Tipo Pago</th>
//             </tr>
//           </thead>
//           <tbody>
//             {movimientosFiltrados.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="border p-4 text-center">
//                   No hay facturas para esta fecha
//                 </td>
//               </tr>
//             ) : (
//               movimientosFiltrados.map((m, i) => (
//                 <tr key={i}>
//                   <td className="border p-2">
//                     {m.fecha.split("T")[0]}
//                   </td>
//                   <td className="border p-2">{m.remision}</td>
//                   <td className="border p-2">{m.conductor}</td>
//                   <td className="border p-2">{m.placa}</td>
//                   <td className="border p-2">
//                     ${Number(m.subtotal).toLocaleString("es-CO")}
//                   </td>
//                   <td className="border p-2">
//                     ${Number(m.iva).toLocaleString("es-CO")}
//                   </td>
//                   <td className="border p-2">
//                     ${Number(m.retencion).toLocaleString("es-CO")}
//                   </td>
//                   <td className="border p-2 font-semibold">
//                     ${Number(m.total).toLocaleString("es-CO")}
//                   </td>
//                   <td className="border p-2">
//                     {obtenerTipoPago(m)}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//     </div>
//   );
// }
import React, { useState, useMemo, useEffect } from "react";
import {
  fetchMovimientos,
  fetchTiposPago,
  createGastoDiario,
  createCuadreDiario,
  saveCuadreCaja,
} from "../assets/services/apiService";
import { fetchGastosPorFecha, deleteGastoDiario } from "../assets/services/apiService";


export default function CuadreCaja() {
  // ===============================
  // FECHA Y ESTADOS ORIGINALES
  // ===============================
  const hoy = new Date().toISOString().split("T")[0];
  const [fechaConsulta, setFechaConsulta] = useState(hoy);
  const [gastos, setGastos] = useState([]);
  const [formGasto, setFormGasto] = useState({
    descripcion: "",
    valor: "",
    observacion: "",
  });

  // En CuadreCaja.jsx

useEffect(() => {
  const cargarDatos = async () => {
    try {
      setLoadingMov(true);

      // Agregamos fetchGastosPorFecha a la carga inicial
      const [movs, tipos, gastosBackend] = await Promise.all([
        fetchMovimientos(),
        fetchTiposPago(),
        fetchGastosPorFecha(fechaConsulta) // Cargamos gastos de la fecha seleccionada
      ]);

      setMovimientos(Array.isArray(movs) ? movs : []);
      setTiposPago(Array.isArray(tipos) ? tipos : []);
      setGastos(Array.isArray(gastosBackend) ? gastosBackend : []); // Sincronizamos el estado
    } catch (error) {
      console.error("Error cargando datos de cuadre:", error);
      setMovimientos([]);
      setTiposPago([]);
    } finally {
      setLoadingMov(false);
    }
  };

  cargarDatos();
}, [fechaConsulta]); // Se vuelve a ejecutar si cambias la fecha


  // 🔹 TRAER GASTOS GUARDADOS DESDE LA API
  // useEffect(() => {
  //   if (!hoy) return;
  
  //   (async () => {
  //     try {
  //       const data = await fetchGastosPorFecha(hoy);
  //       setGastos(Array.isArray(data) ? data : []);
  //     } catch (err) {
  //       console.error("Error cargando gastos del día:", err);
  //     }
  //   })();
  // }, [hoy]);

  const billetes = [100000, 50000, 20000, 10000, 5000, 2000];
  const [arqueo, setArqueo] = useState({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    monedas: 0,
  });
  const [movimientos, setMovimientos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [recibosCaja, setRecibosCaja] = useState(0);

  // ===============================
  // LÓGICA ORIGINAL (MANTENIDA)
  // ===============================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingMov(true);
        const [movs, tipos] = await Promise.all([
          fetchMovimientos(),
          fetchTiposPago(),
        ]);
        setMovimientos(Array.isArray(movs) ? movs : []);
        setTiposPago(Array.isArray(tipos) ? tipos : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setMovimientos([]);
        setTiposPago([]);
      } finally {
        setLoadingMov(false);
      }
    };
    cargarDatos();
  }, []);

  const handleGastoChange = (e) =>
    setFormGasto({ ...formGasto, [e.target.name]: e.target.value });

  const agregarGasto = async (e) => {
    e.preventDefault();
    if (!formGasto.descripcion || !formGasto.valor) return;
    const nuevoGasto = {
      descripcion: formGasto.descripcion,
      valor: Number(formGasto.valor),
      observacion: formGasto.observacion,
      fecha: hoy,
    };
    try {
      const gastoGuardado = await createGastoDiario(nuevoGasto);
      setGastos([
        ...gastos,
        { ...nuevoGasto, id: gastoGuardado.id ?? Date.now() },
      ]);
      setFormGasto({ descripcion: "", valor: "", observacion: "" });
    } catch (error) {
      alert("❌ No se pudo guardar el gasto: " + error.message);
    }
  };

  const eliminarGasto = async (id) => {
  if (!window.confirm("¿Eliminar este gasto?")) return;

  try {
    await deleteGastoDiario(id);

    setGastos((prev) => prev.filter((g) => g.id !== id));
  } catch (error) {
    alert("❌ No se pudo eliminar el gasto");
  }
  };
  
  const gastosHoy = useMemo(
    () => gastos.filter((g) => g.fecha === hoy),
    [gastos, hoy]
  );

  const totalGastosHoy = gastosHoy.reduce((acc, g) => acc + g.valor, 0);

  const handleArqueoChange = (key, value) =>
    setArqueo({ ...arqueo, [key]: Number(value) });

  const totalArqueo = useMemo(() => {
    const totalBilletes = billetes.reduce(
      (acc, den) => acc + den * arqueo[den],
      0
    );
    return totalBilletes + Number(arqueo.monedas || 0);
  }, [arqueo]);

  const movimientosFiltrados = useMemo(
    () => movimientos.filter((m) => m.fecha?.split("T")[0] === fechaConsulta),
    [movimientos, fechaConsulta]
  );
  const obtenerTipoPago = (movimiento) =>
    movimiento?.tipo_pago?.trim() || "N/A";

  const totalesPorTipo = useMemo(() => {
    const resumen = { Efectivo: 0, Crédito: 0, Transferencia: 0 };
    movimientosFiltrados.forEach((m) => {
      const tipo = obtenerTipoPago(m);
      const total = Number(m.total) || 0;
      if (m.estado !== "ANULADA") {
        if (tipo === "Efectivo" || tipo === "Pago por anticipado")
          resumen.Efectivo += total;
        else if (tipo === "Crédito") resumen.Crédito += total;
        else if (tipo === "Transferencia") resumen.Transferencia += total;
      }
    });
    return resumen;
  }, [movimientosFiltrados]);

  // AJUSTE: CÁLCULO DE TOTALES DIFERENCIADOS
  const resumenFinal = useMemo(() => {
    const ingresosBrutosTotales =
      totalesPorTipo.Efectivo +
      totalesPorTipo.Crédito +
      totalesPorTipo.Transferencia +
      Number(recibosCaja);
    return {
      // 1. Efectivo que debe haber en el cajón (Físico)
      totalEfectivoNeto:
        totalesPorTipo.Efectivo + Number(recibosCaja) - totalGastosHoy,
      // 2. Balance total del negocio (Ventas totales - Gastos)
      totalNetoGeneral: ingresosBrutosTotales - totalGastosHoy,
    };
  }, [totalesPorTipo, totalGastosHoy, recibosCaja]);

  const conciliacion = useMemo(() => {
    const diferencia = totalArqueo - resumenFinal.totalEfectivoNeto;
    let estado = {
      mensaje: "Caja Cuadrada ✅",
      colorClase: "text-emerald-700",
      bgClase: "bg-emerald-50",
      bordeClase: "border-emerald-200",
    };
    if (diferencia > 0)
      estado = {
        mensaje: "Sobrante ➕",
        colorClase: "text-amber-700",
        bgClase: "bg-amber-50",
        bordeClase: "border-amber-200",
      };
    else if (diferencia < 0)
      estado = {
        mensaje: "Faltante ⚠️",
        colorClase: "text-rose-700",
        bgClase: "bg-rose-50",
        bordeClase: "border-rose-200",
      };
    return { diferencia, ...estado };
  }, [totalArqueo, resumenFinal.totalEfectivoNeto]);

  const handleFinalizarCuadre = async () => {
    if (resumenFinal.totalNetoGeneral === 0 && totalGastosHoy === 0) {
      if (!window.confirm("El total es $0. ¿Deseas guardar?")) return;
    }
    const datosParaGuardar = {
      fecha: fechaConsulta,
      gastos_diarios: totalGastosHoy,
      efectivo_ventas: totalesPorTipo.Efectivo,
      recibos_caja: Number(recibosCaja),
      credito: totalesPorTipo.Crédito,
      transferencia: totalesPorTipo.Transferencia,
      total_efectivo_caja: resumenFinal.totalEfectivoNeto,
      total_neto_dia: resumenFinal.totalNetoGeneral,
    };
    const datosArqueo = {
      fecha: fechaConsulta,
      billete_100k: arqueo[100000],
      billete_50k: arqueo[50000],
      billete_20k: arqueo[20000],
      billete_10k: arqueo[10000],
      billete_5k: arqueo[5000],
      billete_2k: arqueo[2000],
      monedas_total: Number(arqueo.monedas),
      efectivo_esperado_sistema: resumenFinal.totalEfectivoNeto,
      total_arqueo: totalArqueo,
      diferencia_valor: conciliacion.diferencia,
      estado_caja:
        conciliacion.diferencia === 0
          ? "CUADRADO"
          : conciliacion.diferencia > 0
          ? "SOBRANTE"
          : "FALTANTE",
    };
    try {
      await saveCuadreCaja(datosParaGuardar);
      await createCuadreDiario(datosArqueo);
      alert("✅ Guardado correctamente.");
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div
      id="cuadre-print"
      className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900"
    >
      <style>
        {`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
          .print-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; display: none; }
          .print-table th, .print-table td { border: 1px solid #000; padding: 6px 10px; font-size: 11px; }
          .print-table th { background-color: #f1f5f9; font-weight: bold; text-align: left; }
          @media print {
            @page { size: portrait; margin: 1cm; }
            body { background: white !important; }
            #cuadre-print { padding: 0 !important; background: white !important; }
            .no-print { display: none !important; }
            .print-table { display: table !important; }
            .print-only-block { display: block !important; }
            .screen-only { display: none !important; }
            .box-conciliacion-print { border: 3px solid #000 !important; padding: 15px; margin: 20px 0; text-align: left; border-radius: 10px; }
          }
        `}
      </style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-slide-up">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-2 rounded-lg no-print">
              💵
            </span>
            Cuadre de Caja
          </h1>
          <p className="text-slate-500 font-medium">
            Reporte diario • {fechaConsulta}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            🖨️ Imprimir Reporte
          </button>
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN ACTUALIZADA */}
      <div className="print-only-block hidden">
        <h3 className="text-[12px] font-bold mb-2 uppercase">
          📌 Resumen de Gastos
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="text-right">Valor</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {gastosHoy.map((g) => (
              <tr key={g.id}>
                <td>{g.descripcion}</td>
                <td className="text-right">
                  ${g.valor.toLocaleString("es-CO")}
                </td>
                <td>{g.observacion || "-"}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-right">TOTAL GASTOS PAGADOS</td>
              <td className="text-right">
                ${totalGastosHoy.toLocaleString("es-CO")}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          📊 Balance de Sistema
        </h3>
        <table className="print-table">
          <tbody>
            <tr>
              <td>(+) Ventas en Efectivo</td>
              <td className="text-right">
                ${totalesPorTipo.Efectivo.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Recibos de Caja (Otros ingresos)</td>
              <td className="text-right">
                ${Number(recibosCaja).toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Ventas a Crédito</td>
              <td className="text-right">
                ${totalesPorTipo.Crédito.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Ventas por Transferencia</td>
              <td className="text-right">
                ${totalesPorTipo.Transferencia.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(-) Total Gastos del Día</td>
              <td className="text-right">
                -${totalGastosHoy.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold bg-slate-100">
              <td>
                (=) TOTAL NETO DEL DÍA (Todas las formas de pago - Gastos)
              </td>
              <td className="text-right">
                ${resumenFinal.totalNetoGeneral.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold">
              <td>
                (=) EFECTIVO ESPERADO EN CAJA (Efectivo + Recibos - Gastos)
              </td>
              <td className="text-right">
                ${resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          🧾 Conteo Físico (Arqueo)
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>Denominación</th>
              <th className="text-center">Cant.</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {billetes.map((den) => (
              <tr key={den}>
                <td>Billetes de ${den.toLocaleString("es-CO")}</td>
                <td className="text-center">{arqueo[den]}</td>
                <td className="text-right">
                  ${(den * arqueo[den]).toLocaleString("es-CO")}
                </td>
              </tr>
            ))}
            <tr>
              <td>Monedas y otros</td>
              <td className="text-center">-</td>
              <td className="text-right">
                ${Number(arqueo.monedas).toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold bg-slate-100">
              <td colSpan="2" className="text-right">
                TOTAL DINERO FÍSICO
              </td>
              <td className="text-right">
                ${totalArqueo.toLocaleString("es-CO")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="box-conciliacion-print">
          <p style={{ fontSize: "12px" }}>
            <strong>EFECTIVO ESPERADO:</strong> $
            {resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
          </p>
          <p style={{ fontSize: "12px" }}>
            <strong>ESTADO DE CAJA:</strong> {conciliacion.mensaje}
          </p>
          <p style={{ fontSize: "16px", fontWeight: "bold", marginTop: "5px" }}>
            DIFERENCIA: $
            {Math.abs(conciliacion.diferencia).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* VISTA DE PANTALLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 screen-only">
        <div className="lg:col-span-2 space-y-8 animate-slide-up">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 text-emerald-700">
              📌 Registro de Gastos
            </h3>
            <form
              onSubmit={agregarGasto}
              className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl"
            >
              <input
                name="descripcion"
                placeholder="Descripción"
                value={formGasto.descripcion}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <input
                name="valor"
                type="number"
                placeholder="Valor"
                value={formGasto.valor}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <input
                name="observacion"
                placeholder="Nota"
                value={formGasto.observacion}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <button className="md:col-span-3 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                + Agregar Gasto
              </button>
            </form>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="pb-3 text-left">Descripción</th>
                  <th className="pb-3 text-right">Monto</th>
                  <th className="pb-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {gastosHoy.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-3 font-medium">{g.descripcion}</td>
                    <td className="py-3 text-right font-bold">
                      ${g.valor.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => eliminarGasto(g.id)}
                        className="text-rose-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-extrabold text-emerald-800 bg-emerald-50/50">
                  <td className="py-4 px-4">TOTAL EGRESOS</td>
                  <td className="py-4 text-right">
                    ${totalGastosHoy.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-6 text-blue-700">
              🧾 Arqueo Físico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billetes.map((den) => (
                <div
                  key={den}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
                >
                  <span className="font-bold text-slate-500">
                    ${den.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={arqueo[den]}
                      onChange={(e) => handleArqueoChange(den, e.target.value)}
                      className="w-20 text-center border-slate-200 rounded-lg font-bold text-blue-600"
                    />
                    <span className="w-24 text-right text-xs font-black text-slate-400">
                      ${(den * arqueo[den]).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl md:col-span-2 mt-4">
                <span className="font-bold text-blue-800 text-xs tracking-widest uppercase">
                  Total Monedas
                </span>
                <input
                  type="number"
                  value={arqueo.monedas}
                  onChange={(e) =>
                    handleArqueoChange("monedas", e.target.value)
                  }
                  className="w-32 text-center border-blue-200 rounded-lg font-bold text-blue-700"
                />
              </div>
            </div>
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
              <span className="text-sm font-black text-slate-400 uppercase">
                Total Arqueo Físico
              </span>
              <span className="text-3xl font-black text-blue-400">
                ${totalArqueo.toLocaleString()}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-8 animate-slide-up">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-5 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest">
                📊 Sistema
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Ventas Efectivo</span>
                <span className="font-bold">
                  ${totalesPorTipo.Efectivo.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                <span className="text-blue-800 text-[10px] font-black uppercase">
                  Recibos
                </span>
                <input
                  type="number"
                  value={recibosCaja}
                  onChange={(e) => setRecibosCaja(Number(e.target.value))}
                  className="w-24 text-right border-none ring-1 ring-blue-200 rounded-lg font-bold p-1"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>Ventas Crédito</span>
                <span className="font-bold">
                  ${totalesPorTipo.Crédito.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ventas Transferencia</span>
                <span className="font-bold">
                  ${totalesPorTipo.Transferencia.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>(-) Gastos</span>
                <span className="font-bold text-rose-500">
                  -${totalGastosHoy.toLocaleString()}
                </span>
              </div>
              <hr />
              {/* AJUSTE: NUEVO CAMPO NETO GENERAL */}
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Total Neto Día
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${resumenFinal.totalNetoGeneral.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Esperado en Caja
                </span>
                <span className="text-3xl font-black text-emerald-600">
                  ${resumenFinal.totalEfectivoNeto.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section
            className={`rounded-3xl border-2 p-6 ${conciliacion.bgClase} ${conciliacion.bordeClase}`}
          >
            <h4
              className={`text-2xl font-black text-center mb-4 ${conciliacion.colorClase}`}
            >
              {conciliacion.mensaje}
            </h4>
            <div className="bg-white/60 rounded-2xl p-4 text-center border border-white">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                Diferencia
              </p>
              <p className={`text-4xl font-black ${conciliacion.colorClase}`}>
                ${Math.abs(conciliacion.diferencia).toLocaleString()}
              </p>
            </div>
          </section>

          <button
            onClick={handleFinalizarCuadre}
            className="no-print w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all"
          >
            💾 GUARDAR CIERRE
          </button>
        </div>
      </div>

      <section className="no-print mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-black text-slate-800">
            📋 Detalle de Ventas
          </h3>
          <input
            type="date"
            value={fechaConsulta}
            onChange={(e) => setFechaConsulta(e.target.value)}
            className="border-slate-200 rounded-xl font-bold"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="p-4 text-left">Remisión</th>
                <th className="p-4 text-left">Conductor</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Pago</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((m, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="p-4 font-bold">{m.remision}</td>
                  <td className="p-4">{m.conductor}</td>
                  <td className="p-4 text-right font-black">
                    ${Number(m.total).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-white border rounded-full text-[10px] font-black">
                      {obtenerTipoPago(m)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
