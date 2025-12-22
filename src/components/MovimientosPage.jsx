// MovimientosPage.jsx (Versión Final con Paginación y Filtro de 30 días)

import React, { useEffect, useState, useMemo } from "react";
import MovimientosTable from "./MovimientosTable";
import {
  updateMovimientoStatus,
  pagoPorRemision,
  updatePago,
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
  // --- Estados Principales ---
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

  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Limpieza de mensajes de feedback
  useEffect(() => {
    if (statusMessage.message) {
      const timer = setTimeout(() => {
        setStatusMessage({ message: null, type: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage.message]);

  // Mapeo de tipos de pago desde props
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

  // ===================================
  // 🔵 Lógica de Filtrado (useMemo)
  // ===================================
  const filteredMovimientos = useMemo(() => {
    let result = movimientos;

    // 🕒 FILTRO AUTOMÁTICO: Últimos 30 días (solo si no se han elegido fechas manuales)
    if (!desde && !hasta) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      result = result.filter(
        (x) => x.fecha && new Date(x.fecha) >= fechaLimite
      );
    }

    // Filtros de texto
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

    // Filtros de select
    if (tipoPago)
      result = result.filter(
        (x) => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase()
      );
    if (estado)
      result = result.filter(
        (x) => (x.estado || "").toUpperCase() === estado.toUpperCase()
      );

    // Filtros de fecha manuales
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

  // Resetear a página 1 cuando cambie cualquier filtro
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

  // ===================================
  // 🔢 Lógica de Paginación
  // ===================================
  const totalPages = Math.ceil(filteredMovimientos.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredMovimientos.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // ===================================
  // 🟢 Acciones (Toggle y Edit)
  // ===================================
  const handleToggleEstado = async (remision) => {
    // Limpiamos mensajes previos
    setStatusMessage({ message: null, type: null });

    // Buscamos el movimiento actual en tu estado local 'movimientos'
    const currentMovement = movimientos.find((m) => m.remision === remision);
    if (!currentMovement) return;

    // Definimos el nuevo estado (si es VIGENTE pasa a ANULADA, y viceversa)
    const newState =
      currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

    // Confirmación al usuario
    if (
      !window.confirm(
        `¿Seguro que desea cambiar la remisión ${remision} a ${newState}?`
      )
    ) {
      return;
    }

    try {
      // 1. Llamada a la API (usando la función de tu apiService.js)
      await updateMovimientoStatus(remision, newState);
      const resPagoRelacionado = await pagoPorRemision(remision);
      const pagoRelacionado = resPagoRelacionado[0];
      let pagoPayload = null;
      if (resPagoRelacionado && newState === "ANULADA") {
        pagoPayload = {
          ...pagoRelacionado,
          valorRemisiones:
            pagoRelacionado.valorRemisiones - currentMovement.total,
        };
      } else {
        pagoPayload = {
          ...pagoRelacionado,
          valorRemisiones:
            pagoRelacionado.valorRemisiones + currentMovement.total,
        };
      }
      if (pagoRelacionado) {
        console.log(pagoPayload)
        await updatePago(pagoPayload.no_ingreso, pagoPayload);
      }
      // 2. Refrescar la lista de movimientos para ver el cambio reflejado
      if (typeof onRefresh === "function") {
        await onRefresh();
      } else {
        const data = await fetchMovimientos();
        setMovimientos(data);
      }

      setStatusMessage({
        message: `Remisión ${remision} actualizada a ${newState} con éxito.`,
        type: "success",
      });
    } catch (e) {
      setStatusMessage({
        message: `Error al cambiar estado: ${e.message || "Desconocido"}`,
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Gestión de Movimientos
      </h1>

      {/* Bloque de mensajes de estado */}
      {statusMessage.message && (
        <div
          className={`p-3 mb-4 rounded-lg text-white font-medium shadow-md transition-all ${
            statusMessage.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {statusMessage.message}
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Remisión"
          value={searchRemision}
          onChange={(e) => setSearchRemision(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Conductor"
          value={conductor}
          onChange={(e) => setConductor(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Tercero"
          value={tercero}
          onChange={(e) => setTercero(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="No. Ingreso"
          value={noIngreso}
          onChange={(e) => setNoIngreso(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={tipoPago}
          onChange={(e) => setTipoPago(e.target.value)}
        >
          {TIPO_PAGO_OPCIONES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          {ESTADO_OPCIONES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div>
          <label className="block text-xs text-gray-500">Desde</label>
          <input
            type="date"
            className="border p-2 w-full rounded"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Hasta</label>
          <input
            type="date"
            className="border p-2 w-full rounded"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
      </div>

      {/* Información de resultados y Paginación */}
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-gray-600">
          Mostrando:{" "}
          <span className="font-bold text-blue-600">
            {paginatedData.length}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-800">
            {filteredMovimientos.length}
          </span>{" "}
          registros.
          {!desde && !hasta && (
            <span className="ml-2 italic text-gray-400">(Últimos 30 días)</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-white border rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
            >
              {" "}
              Anterior{" "}
            </button>
            <span className="text-sm font-medium px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-white border rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
            >
              {" "}
              Siguiente{" "}
            </button>
          </div>
        )}
      </div>

      {/* Tabla con datos paginados */}
      <MovimientosTable
        data={paginatedData}
        toggleEstado={handleToggleEstado}
        onEdit={handleEdit}
      />
    </div>
  );
}

// --------------------------------codigo de 17/12/25

// // MovimientosPage.jsx (MODIFICADO)

// import React, { useEffect, useState, useMemo } from "react";
// // Componente de presentación de la tabla
// import MovimientosTable from "./MovimientosTable";

// import {
//   // fetchMovimientos,
//   updateMovimientoStatus, // Función para cambiar el estado (VIGENTE/CANCELADO)
// } from "../assets/services/apiService";

// // Importación de useNavigate, BrowserRouter, etc., siguen comentadas

// // Definición de opciones de estado
// const ESTADO_OPCIONES = [
//   { value: "", label: "Todos los Estados" },
//   { value: "VIGENTE", label: "Vigente" },
//   { value: "ANULADA", label: "Anulada" },
// ];

// //  ACEPTAMOS LAS PROPS 'data' y 'onRefresh' de App.jsx
// export default function MovimientosPage({
//   data = [],
//   onRefresh,
//   onEdit,
//   changeTab,
//   paymentTypes,
// }) {
//   // --- Estados Principales ---
//   const movimientos = data;
//   // El estado de loading y error se maneja en App.jsx para la carga inicial.
//   const [loading, setLoading] = useState(false); // Lo establecemos en false por defecto.
//   const [error, setError] = useState(null);
//   // ESTADO DE MENSAJES: Para mostrar feedback al usuario.
//   const [statusMessage, setStatusMessage] = useState({
//     message: null,
//     type: null,
//   });

//   // --- Estados de Filtro existentes ---
//   const [searchRemision, setSearchRemision] = useState("");
//   const [placa, setPlaca] = useState("");
//   const [conductor, setConductor] = useState("");
//   const [desde, setDesde] = useState("");
//   const [hasta, setHasta] = useState("");
//   const [tercero, setTercero] = useState("");
//   const [cedulaCliente, setCedulaCliente] = useState("");
//   const [telefonoCliente, setTelefonoCliente] = useState("");
//   const [tipoPago, setTipoPago] = useState("");
//   const [estado, setEstado] = useState("");
//   const [noIngreso, setNoIngreso] = useState("");
//   const [TIPO_PAGO_OPCIONES, setTipoPagoOpciones] = useState([
//     { value: "", label: "Todos los Tipos de Pago" },
//   ]);

//   // ===================================
//   // ⏳ Lógica para Ocultar Mensajes (Se mantiene)
//   // ===================================
//   useEffect(() => {
//     if (statusMessage.message) {
//       const timer = setTimeout(() => {
//         setStatusMessage({ message: null, type: null });
//       }, 4000);

//       return () => clearTimeout(timer);
//     }
//   }, [statusMessage.message]);

//   useEffect(() => {
//     if (paymentTypes && Array.isArray(paymentTypes)) {
//       const opciones = [
//         { value: "", label: "Todos los Tipos de Pago" },
//         ...paymentTypes.map((type) => ({
//           value: type.tipo_pago,
//           label: type.tipo_pago,
//         })),
//       ];
//       setTipoPagoOpciones(opciones);
//     }
//   }, [paymentTypes]);

//   // ===================================
//   // 🔵 Lógica de Filtrado (useMemo)
//   // ===================================
//   const filteredMovimientos = useMemo(() => {
//     let result = movimientos; // Usa la prop 'data' a través de la variable 'movimientos'

//     // Filtros existentes (La lógica de filtrado se mantiene intacta)
//     if (searchRemision)
//       result = result.filter((x) =>
//         String(x.remision).includes(searchRemision)
//       );
//     if (placa)
//       result = result.filter((x) =>
//         (x.placa || "").toLowerCase().includes(placa.toLowerCase())
//       );
//     if (conductor)
//       result = result.filter((x) =>
//         (x.conductor || "").toLowerCase().includes(conductor.toLowerCase())
//       );

//     // Filtros (Texto e Inputs)
//     if (tercero)
//       result = result.filter((x) =>
//         (x.tercero || "").toLowerCase().includes(tercero.toLowerCase())
//       );
//     if (cedulaCliente)
//       result = result.filter((x) =>
//         (x.cedula || x.cedula_cliente || "")
//           .toLowerCase()
//           .includes(cedulaCliente.toLowerCase())
//       );
//     if (telefonoCliente)
//       result = result.filter((x) =>
//         (x.telefono || x.telefono_cliente || "")
//           .toLowerCase()
//           .includes(telefonoCliente.toLowerCase())
//       );
//     if (noIngreso)
//       result = result.filter((x) =>
//         (x.no_ingreso || "").toLowerCase().includes(noIngreso.toLowerCase())
//       );

//     // Filtros (Selects)
//     if (tipoPago)
//       result = result.filter(
//         (x) => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase()
//       );
//     if (estado)
//       result = result.filter(
//         (x) => (x.estado || "").toUpperCase() === estado.toUpperCase()
//       );

//     // Filtrado por fecha. Compara solo la parte YYYY-MM-DD
//     if (desde)
//       result = result.filter(
//         (x) => x.fecha && new Date(x.fecha.split("T")[0]) >= new Date(desde)
//       );
//     if (hasta)
//       result = result.filter(
//         (x) => x.fecha && new Date(x.fecha.split("T")[0]) <= new Date(hasta)
//       );

//     return result;
//   }, [
//     movimientos,
//     searchRemision,
//     placa,
//     conductor,
//     desde,
//     hasta,
//     tercero,
//     tipoPago,
//     estado,
//     noIngreso,
//   ]);
//   // La dependencia 'movimientos' ahora se refiere a la prop 'data'

//   // ===================================
//   // 🔵 Función para manejar el cambio de estado (Actualizada)
//   // ===================================
//   const handleToggleEstado = async (remision) => {
//     setStatusMessage({ message: null, type: null });

//     const currentMovement = movimientos.find((m) => m.remision === remision);
//     if (!currentMovement) {
//       setStatusMessage({
//         message: "Error: Movimiento no encontrado localmente.",
//         type: "error",
//       });
//       return;
//     }

//     const newState =
//       currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

//     try {
//       await updateMovimientoStatus(remision, newState);

//       // FUNCIÓN DE RECARGA DEL PADRE (App.jsx)
//       if (onRefresh) {
//         await onRefresh();
//       } else {
//         console.warn(
//           "onRefresh no está definida. La tabla no se actualizará automáticamente."
//         );
//       }

//       setStatusMessage({
//         message: `Remisión ${remision} actualizada a ${newState} con éxito.`,
//         type: "success",
//       });
//     } catch (e) {
//       console.error("Error al actualizar estado:", e);
//       setStatusMessage({
//         message: `Fallo al cambiar estado de ${remision}. Error: ${
//           e.message || "Desconocido"
//         }`,
//         type: "error",
//       });
//     }
//   };

//   // {/*                          🚧 🛑 🚧 Sección en desarrollo 🚧 🛑 🚧
//   //     Esta parte del componente está siendo actualizada.Estoy trabajando en esta sección.🛠️
//   // */}
//   const handleEdit = (movimiento) => {
//     alert(`Preparando edición de la remisión: ${movimiento.remision}.`);

//     try {
//       // Llama a la función 'startEditing' en App.jsx,
//       // pasándole el objeto completo del movimiento.
//       onEdit(movimiento);
//     } catch (error) {
//       // Si startEditing falla (e.g., error de API), el error se captura aquí.
//       console.error("Fallo al iniciar el flujo de edición:", error);
//       alert("Error al cargar los detalles de la remisión para edición.");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Gestión de Movimientos
//       </h1>

//       {/* 🆕 BLOQUE DE MENSAJE DE ESTADO (Aviso) */}
//       {statusMessage.message && (
//         <div
//           className={`p-3 mb-4 rounded-lg text-white font-medium shadow-md transition-opacity duration-300 ${
//             statusMessage.type === "error" ? "bg-red-500" : "bg-green-500"
//           }`}
//         >
//           {statusMessage.message}
//         </div>
//       )}
//       {/* FIN BLOQUE DE MENSAJE DE ESTADO */}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
//         {/* Inputs de filtro... */}
//         <input
//           className="border p-2 rounded"
//           placeholder="Remisión"
//           value={searchRemision}
//           onChange={(e) => setSearchRemision(e.target.value)}
//         />
//         <input
//           className="border p-2 rounded"
//           placeholder="Placa"
//           value={placa}
//           onChange={(e) => setPlaca(e.target.value)}
//         />
//         <input
//           className="border p-2 rounded"
//           placeholder="Conductor"
//           value={conductor}
//           onChange={(e) => setConductor(e.target.value)}
//         />
//         <input
//           className="border p-2 rounded"
//           placeholder="Tercero"
//           value={tercero}
//           onChange={(e) => setTercero(e.target.value)}
//         />
//         <input
//           className="border p-2 rounded"
//           placeholder="No. Ingreso"
//           value={noIngreso}
//           onChange={(e) => setNoIngreso(e.target.value)}
//         />

//         {/* Selects de filtro... */}
//         <select
//           className="border p-2 rounded"
//           value={tipoPago}
//           onChange={(e) => setTipoPago(e.target.value)}
//         >
//           {TIPO_PAGO_OPCIONES.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>

//         <select
//           className="border p-2 rounded"
//           value={estado}
//           onChange={(e) => setEstado(e.target.value)}
//         >
//           {ESTADO_OPCIONES.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>

//         {/* Fechas de filtro... */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Desde</label>
//           <input
//             type="date"
//             className="border p-2 w-full rounded"
//             value={desde}
//             onChange={(e) => setDesde(e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Hasta</label>
//           <input
//             type="date"
//             className="border p-2 w-full rounded"
//             value={hasta}
//             onChange={(e) => setHasta(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="mb-4 flex justify-between items-center">
//         <div className="text-sm text-gray-600">
//           Mostrando:{" "}
//           <span className="font-bold text-blue-600">
//             {filteredMovimientos.length}
//           </span>{" "}
//           de{" "}
//           <span className="font-bold text-gray-800">{movimientos.length}</span>{" "}
//           registros.
//           {/* 🛑 Usa movimientos.length (que ahora es data.length) */}
//         </div>
//       </div>

//       {/* Componente de presentación de la tabla */}
//       <MovimientosTable
//         data={filteredMovimientos}
//         toggleEstado={handleToggleEstado}
//         onEdit={handleEdit}
//       />
//     </div>
//   );
// }
