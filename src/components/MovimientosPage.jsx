// // MovimientosPage.jsx

// import React, { useEffect, useState, useMemo } from "react";
// // 🛑 AJUSTE 1: Importar useNavigate para la redirección
// import { useNavigate } from "react-router-dom"; 
// // Componente de presentación de la tabla
// import MovimientosTable from "./MovimientosTable"; 

// // Importamos las funciones con sus nombres reales de apiService.js
// // RUTA: Esta es la ruta que tu código estaba usando y debe ser correcta:
// import { 
//     fetchMovimientos, // Función para cargar todos los datos
//     updateMovimientoStatus // Función para cambiar el estado (VIGENTE/CANCELADO)
// } from '../assets/services/apiService'; 

// // 🛑 AJUSTE 2: Importar funciones de formateo (Necesario para que el componente compile)
// // RUTA: Esta es la ruta que causó tu último error, verifica que sea correcta:
// import { formatCurrency, formatFecha } from "../utils/formatters"; 


// // Definición de tipos de pago (deberías obtener esto de una API, pero lo definimos aquí para el filtro)
// const TIPO_PAGO_OPCIONES = [
//     { value: "", label: "Todos los Tipos de Pago" },
//     { value: "CONTADO", label: "Contado" },
//     { value: "CRÉDITO", label: "Crédito" },
//     // Agrega más tipos de pago según tu base de datos
// ];

// // Definición de opciones de estado
// const ESTADO_OPCIONES = [
//     { value: "", label: "Todos los Estados" },
//     { value: "VIGENTE", label: "Vigente" },
//     { value: "ANULADA", label: "Anulada" },
// ];


// export default function MovimientosPage() {
    
//     // 🛑 AJUSTE 3: Inicializar useNavigate
//     const navigate = useNavigate();

//     // --- Estados Principales ---
//     const [movimientos, setMovimientos] = useState([]); // Datos completos
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [statusMessage, setStatusMessage] = useState({ message: null, type: null }); 

//     // --- Estados de Filtro existentes ---
//     const [searchRemision, setSearchRemision] = useState("");
//     const [placa, setPlaca] = useState("");
//     const [conductor, setConductor] = useState("");
//     const [desde, setDesde] = useState("");
//     const [hasta, setHasta] = useState("");
//     const [tercero, setTercero] = useState("");
//     const [tipoPago, setTipoPago] = useState(""); 
//     const [estado, setEstado] = useState(""); 
//     const [noIngreso, setNoIngreso] = useState("");

//     // ===================================
//     // ⏳ Lógica para Ocultar Mensajes
//     // ===================================
//     useEffect(() => {
//         if (statusMessage.message) {
//             const timer = setTimeout(() => {
//                 setStatusMessage({ message: null, type: null });
//             }, 4000); 
//             return () => clearTimeout(timer);
//         }
//     }, [statusMessage.message]); 

//     // ===================================
//     // 🔵 Lógica principal de carga de datos
//     // ===================================
//     const fetchMovimientosData = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const data = await fetchMovimientos(); 
//             setMovimientos(data);
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Error desconocido al cargar los datos.");
//             setMovimientos([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchMovimientosData();
//     }, []);

//     // ===================================
//     // 🔵 Lógica de Filtrado (useMemo)
//     // ===================================
//     const filteredMovimientos = useMemo(() => {
//         let result = movimientos;

//         // Filtros existentes
//         if (searchRemision) result = result.filter(x => String(x.remision).includes(searchRemision));
//         if (placa) result = result.filter(x => (x.placa || "").toLowerCase().includes(placa.toLowerCase()));
//         if (conductor) result = result.filter(x => (x.conductor || "").toLowerCase().includes(conductor.toLowerCase()));

//         // Filtros (Texto e Inputs)
//         if (tercero) result = result.filter(x => (x.tercero || "").toLowerCase().includes(tercero.toLowerCase()));
//         if (noIngreso) result = result.filter(x => (x.no_ingreso || "").toLowerCase().includes(noIngreso.toLowerCase()));

//         // Filtros (Selects)
//         if (tipoPago) result = result.filter(x => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase());
//         if (estado) result = result.filter(x => (x.estado || "").toUpperCase() === estado.toUpperCase());

//         // Filtrado por fecha. Compara solo la parte YYYY-MM-DD
//         if (desde) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) >= new Date(desde));
//         if (hasta) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) <= new Date(hasta));

//         return result;
//     }, [movimientos, searchRemision, placa, conductor, desde, hasta, tercero, tipoPago, estado, noIngreso]); 

//     // ===================================
//     // 🔵 Función para manejar el cambio de estado
//     // ===================================
//     const handleToggleEstado = async (remision) => {
//         setStatusMessage({ message: null, type: null });

//         const currentMovement = movimientos.find(m => m.remision === remision);
//         if (!currentMovement) {
//             setStatusMessage({ 
//                 message: "Error: Movimiento no encontrado localmente.", 
//                 type: 'error' 
//             });
//             return;
//         }

//         const newState = currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

//         try {
//             await updateMovimientoStatus(remision, newState); 
//             await fetchMovimientosData(); 

//             setStatusMessage({ 
//                 message: `Remisión ${remision} actualizada a ${newState} con éxito.`, 
//                 type: 'success' 
//             });
            
//         } catch (e) {
//             console.error("Error al actualizar estado:", e);
//             setStatusMessage({ 
//                 message: `Fallo al cambiar estado de ${remision}. Error: ${e.message || 'Desconocido'}`, 
//                 type: 'error' 
//             });
//         }
//     };


//     //------------------------------------------------------------------------------------
//     // 🛑 AJUSTE 4: Función para manejar la acción de editar usando navigate
//     const handleEdit = (movimiento) => {
//         console.log("➡️ EDITAR Movimiento:", movimiento.remision);
//         // Redirige al componente de generación de factura/edición
//         navigate(`/invoice/${movimiento.remision}`);
//     };


//     // 🛑 La lógica de AppRoutes fue eliminada, ya que pertenece al componente App.jsx.


//     if (loading) return (<div className="p-6"><p className="text-center text-gray-600">Cargando movimientos...</p></div>);
//     if (error) return (<div className="p-6"><p className="text-center text-red-600">⚠️ Error: {error}</p></div>);


//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Movimientos</h1>

//             {/* Bloque de Mensaje de Estado */}
//             {statusMessage.message && (
//                 <div 
//                     className={`p-3 mb-4 rounded-lg text-white font-medium shadow-md transition-opacity duration-300 ${
//                         statusMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'
//                     }`}
//                 >
//                     {statusMessage.message}
//                 </div>
//             )}
            
//             {/* Filtros */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
//                 <input className="border p-2 rounded" placeholder="Remisión" value={searchRemision} onChange={e => setSearchRemision(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Conductor" value={conductor} onChange={e => setConductor(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Tercero" value={tercero} onChange={e => setTercero(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="No. Ingreso" value={noIngreso} onChange={e => setNoIngreso(e.target.value)} />

//                 <select className="border p-2 rounded" value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
//                     {TIPO_PAGO_OPCIONES.map(option => (
//                         <option key={option.value} value={option.value}>{option.label}</option>
//                     ))}
//                 </select>

//                 <select className="border p-2 rounded" value={estado} onChange={e => setEstado(e.target.value)}>
//                     {ESTADO_OPCIONES.map(option => (
//                         <option key={option.value} value={option.value}>{option.label}</option>
//                     ))}
//                 </select>

//                 <div>
//                     <label className="block text-xs text-gray-500 mb-1">Desde</label>
//                     <input type="date" className="border p-2 w-full rounded" value={desde} onChange={e => setDesde(e.target.value)} />
//                 </div>
//                 <div>
//                     <label className="block text-xs text-gray-500 mb-1">Hasta</label>
//                     <input type="date" className="border p-2 w-full rounded" value={hasta} onChange={e => setHasta(e.target.value)} />
//                 </div>
//             </div>

//             <div className="mb-4 flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                     Mostrando: <span className="font-bold text-blue-600">{filteredMovimientos.length}</span> de <span className="font-bold text-gray-800">{movimientos.length}</span> registros.
//                 </div>
//             </div>

//             {/* Componente de presentación de la tabla */}
//             <MovimientosTable 
//                 data={filteredMovimientos} 
//                 toggleEstado={handleToggleEstado} 
//                 onEdit={handleEdit}
//             />
//         </div>
//     );
// }









// // ----------------------------------------MovimientosPage.jsx 09/12----------------------------
// import React, { useEffect, useState, useMemo } from "react";
// // Componente de presentación de la tabla
// import MovimientosTable from "./MovimientosTable";
// //Importamos las funciones con sus nombres reales de apiService.js
// import { 
//     fetchMovimientos, // Función para cargar todos los datos
//     updateMovimientoStatus // Función para cambiar el estado (VIGENTE/CANCELADO)
// } from '../assets/services/apiService'; 

// // import { useNavigate } from 'react-router-dom';
// // import { BrowserRouter, Routes, Route } from 'react-router';
// // import InvoiceGenerator from './components/InvoiceGenerator.jsx';


// // Definición de tipos de pago (deberías obtener esto de una API, pero lo definimos aquí para el filtro)
// const TIPO_PAGO_OPCIONES = [
//     { value: "", label: "Todos los Tipos de Pago" },
//     { value: "CONTADO", label: "Contado" },
//     { value: "CRÉDITO", label: "Crédito" },
//     // Agrega más tipos de pago según tu base de datos (p.ej., CHEQUE, TRANSFERENCIA)
// ];

// // Definición de opciones de estado
// const ESTADO_OPCIONES = [
//     { value: "", label: "Todos los Estados" },
//     { value: "VIGENTE", label: "Vigente" },
//     { value: "ANULADA", label: "Anulada" },
// ];


// export default function MovimientosPage() {
//     // --- Estados Principales ---
//     const [movimientos, setMovimientos] = useState([]); // Datos completos
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     // 🆕 ESTADO DE MENSAJES: Para mostrar feedback al usuario.
//     const [statusMessage, setStatusMessage] = useState({ message: null, type: null }); 

//     // --- Estados de Filtro existentes ---
//     const [searchRemision, setSearchRemision] = useState("");
//     const [placa, setPlaca] = useState("");
//     const [conductor, setConductor] = useState("");
//     const [desde, setDesde] = useState("");
//     const [hasta, setHasta] = useState("");
//     const [tercero, setTercero] = useState("");
//     const [tipoPago, setTipoPago] = useState(""); 
//     const [estado, setEstado] = useState(""); 
//     const [noIngreso, setNoIngreso] = useState("");

//     // ===================================
//     // ⏳ Lógica para Ocultar Mensajes
//     // ===================================
//     useEffect(() => {
//         // Si hay un mensaje, lo borra después de 4 segundos
//         if (statusMessage.message) {
//             const timer = setTimeout(() => {
//                 setStatusMessage({ message: null, type: null });
//             }, 4000); // 4000 milisegundos = 4 segundos
            
//             // Función de limpieza para evitar fugas de memoria si el componente se desmonta
//             return () => clearTimeout(timer);
//         }
//     }, [statusMessage.message]); // Se ejecuta cada vez que el mensaje cambia

//     // ===================================
//     // 🔵 Lógica principal de carga de datos
//     // ===================================
//     const fetchMovimientosData = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const data = await fetchMovimientos(); 
//             setMovimientos(data);
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Error desconocido al cargar los datos.");
//             setMovimientos([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchMovimientosData();
//     }, []);

//     // ===================================
//     // 🔵 Lógica de Filtrado (useMemo)
//     // ===================================
//     const filteredMovimientos = useMemo(() => {
//         let result = movimientos;

//         // Filtros existentes
//         if (searchRemision) result = result.filter(x => String(x.remision).includes(searchRemision));
//         if (placa) result = result.filter(x => (x.placa || "").toLowerCase().includes(placa.toLowerCase()));
//         if (conductor) result = result.filter(x => (x.conductor || "").toLowerCase().includes(conductor.toLowerCase()));

//         // Filtros (Texto e Inputs)
//         if (tercero) result = result.filter(x => (x.tercero || "").toLowerCase().includes(tercero.toLowerCase()));
//         if (noIngreso) result = result.filter(x => (x.no_ingreso || "").toLowerCase().includes(noIngreso.toLowerCase()));

//         // Filtros (Selects)
//         if (tipoPago) result = result.filter(x => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase());
//         if (estado) result = result.filter(x => (x.estado || "").toUpperCase() === estado.toUpperCase());

//         // Filtrado por fecha. Compara solo la parte YYYY-MM-DD
//         if (desde) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) >= new Date(desde));
//         if (hasta) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) <= new Date(hasta));

//         return result;
//     }, [movimientos, searchRemision, placa, conductor, desde, hasta, tercero, tipoPago, estado, noIngreso]); 

//     // ===================================
//     // 🔵 Función para manejar el cambio de estado
//     // ===================================
//     const handleToggleEstado = async (remision) => {
//         // Limpiamos mensajes anteriores
//         setStatusMessage({ message: null, type: null });

//         const currentMovement = movimientos.find(m => m.remision === remision);
//         if (!currentMovement) {
//             setStatusMessage({ 
//                 message: "Error: Movimiento no encontrado localmente.", 
//                 type: 'error' 
//             });
//             return;
//         }

//         const newState = currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

//         try {
//             // Llama al servicio API con el nuevo estado
//             await updateMovimientoStatus(remision, newState); 

//             // Recarga los datos para reflejar el cambio en la tabla
//             await fetchMovimientosData(); 

//             // 🆕 MUESTRA EL MENSAJE DE ÉXITO
//             setStatusMessage({ 
//                 message: `Remisión ${remision} actualizada a ${newState} con éxito.`, 
//                 type: 'success' 
//             });
            
//         } catch (e) {
//             console.error("Error al actualizar estado:", e);
//             // 🆕 MUESTRA EL MENSAJE DE ERROR
//             setStatusMessage({ 
//                 message: `Fallo al cambiar estado de ${remision}. Error: ${e.message || 'Desconocido'}`, 
//                 type: 'error' 
//             });
//         }
//     };


// {/*                          🚧 🛑 🚧 Sección en desarrollo 🚧 🛑 🚧
//     Esta parte del componente está siendo actualizada.Estoy trabajando en esta sección.🛠️
// */} 



// //     const AppRoutes = () => {
// //     return (
// //         <BrowserRouter>
// //             <Routes>
// //                 {/* Esta es la ruta clave: define un parámetro dinámico llamado ":remision"
// //                 que se pasa al componente InvoiceGenerator.
// //                 */}
// //                 <Route 
// //                     path="/invoice/:remision" 
// //                     element={<InvoiceGenerator />} 
// //                 />
                
// //                 {/* Si también tienes la ruta para generar una nueva remisión (sin ID) */}
// //                 <Route 
// //                     path="/invoice/new" 
// //                     element={<InvoiceGenerator />} 
// //                 />
                
// //                 {/* ... otras rutas */}
// //             </Routes>
// //         </BrowserRouter>
// //     );

// //     // export default AppRoutes; 
// // };
// // function MiComponenteDeTabla() {
// //     // 1. Obtener la función de navegación
// //     const navigate = useNavigate(); 
    
// //     // ...

// //     const handleEdit = (movimiento) => {
// //         // 2. Definir la RUTA URL (NO el archivo)
// //         // La ruta debe coincidir con la que está configurada en tu <Route>
// //         const RUTA_DE_EDICION = '/generar-remision'; // O el nombre que uses

// //         // 3. Obtener el ID que vas a pasar
// //         const idDeEdicion = movimiento.remision; // O movimiento.id si es mejor

// //         // 4. USAR `Maps`
// //         // Esto cambia la URL sin recargar la página.
// //         navigate(`${RUTA_DE_EDICION}?remisionId=${encodeURIComponent(idDeEdicion)}`);

// //         // console.log("➡️ Navegando con React Router a:", `${RUTA_DE_EDICION}?remisionId=${idDeEdicion}`);
// //     };

// //     // ...
// // }

// //------------------------------------------------------------------------------------
//     // Función para manejar la acción de editar
//     const handleEdit = (movimiento) => {
//         // console.log("➡️ EDITAR Movimiento:", movimiento.remision);
//         // // Puedes reemplazar el alert con la lógica para abrir un modal o redirigir
//         // alert(`Preparando edición de la remisión: ${movimiento.remision}. (Implementar Modal/Redirección aquí)`);
//     };


//     if (loading) return (<div className="p-6"><p className="text-center text-gray-600">Cargando movimientos...</p></div>);
//     if (error) return (<div className="p-6"><p className="text-center text-red-600">⚠️ Error: {error}</p></div>);


//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Movimientos</h1>

//             {/* 🆕 BLOQUE DE MENSAJE DE ESTADO (Aviso) */}
//             {statusMessage.message && (
//                 <div 
//                     className={`p-3 mb-4 rounded-lg text-white font-medium shadow-md transition-opacity duration-300 ${
//                         statusMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'
//                     }`}
//                 >
//                     {statusMessage.message}
//                 </div>
//             )}
//             {/* FIN BLOQUE DE MENSAJE DE ESTADO */}

//             {/* Filtros */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
//                 {/* Primera Fila de Búsquedas (Remisión, Placa, Conductor, Tercero, No. Ingreso) */}
//                 <input className="border p-2 rounded" placeholder="Remisión" value={searchRemision} onChange={e => setSearchRemision(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Conductor" value={conductor} onChange={e => setConductor(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="Tercero" value={tercero} onChange={e => setTercero(e.target.value)} />
//                 <input className="border p-2 rounded" placeholder="No. Ingreso" value={noIngreso} onChange={e => setNoIngreso(e.target.value)} />

//                 {/* Segunda Fila de Selects y Fechas */}
//                 <select className="border p-2 rounded" value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
//                     {TIPO_PAGO_OPCIONES.map(option => (
//                         <option key={option.value} value={option.value}>{option.label}</option>
//                     ))}
//                 </select>

//                 <select className="border p-2 rounded" value={estado} onChange={e => setEstado(e.target.value)}>
//                     {ESTADO_OPCIONES.map(option => (
//                         <option key={option.value} value={option.value}>{option.label}</option>
//                     ))}
//                 </select>

//                 <div>
//                     <label className="block text-xs text-gray-500 mb-1">Desde</label>
//                     <input type="date" className="border p-2 w-full rounded" value={desde} onChange={e => setDesde(e.target.value)} />
//                 </div>
//                 <div>
//                     <label className="block text-xs text-gray-500 mb-1">Hasta</label>
//                     <input type="date" className="border p-2 w-full rounded" value={hasta} onChange={e => setHasta(e.target.value)} />
//                 </div>
//             </div>

//             <div className="mb-4 flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                     Mostrando: <span className="font-bold text-blue-600">{filteredMovimientos.length}</span> de <span className="font-bold text-gray-800">{movimientos.length}</span> registros.
//                 </div>
//             </div>

//             {/* Componente de presentación de la tabla */}
//             <MovimientosTable 
//                 data={filteredMovimientos} 
//                 toggleEstado={handleToggleEstado} 
//                 onEdit={handleEdit}
//             />
//         </div>
//     );
// }





// MovimientosPage.jsx (MODIFICADO)

import React, { useEffect, useState, useMemo } from "react";
// Componente de presentación de la tabla
import MovimientosTable from "./MovimientosTable";
// Importamos las funciones con sus nombres reales de apiService.js
// impot {BrowserRouter as Router, Route, Switch} from "react-router-dom"
// import { useNavigate } from 'react-router-dom';
import { 
    // fetchMovimientos, // 🛑 ELIMINADA: La carga inicial ahora la hace App.jsx
    updateMovimientoStatus // Función para cambiar el estado (VIGENTE/CANCELADO)
} from '../assets/services/apiService'; 

// Importación de useNavigate, BrowserRouter, etc., siguen comentadas

// Definición de tipos de pago (filtros)
const TIPO_PAGO_OPCIONES = [
    { value: "", label: "Todos los Tipos de Pago" },
    { value: "CONTADO", label: "Contado" },
    { value: "CRÉDITO", label: "Crédito" },
    // Agrega más tipos de pago según tu base de datos (p.ej., CHEQUE, TRANSFERENCIA)
];

// Definición de opciones de estado
const ESTADO_OPCIONES = [
    { value: "", label: "Todos los Estados" },
    { value: "VIGENTE", label: "Vigente" },
    { value: "ANULADA", label: "Anulada" },
];

// 🛑 ACEPTAMOS LAS PROPS 'data' y 'onRefresh' de App.jsx
export default function MovimientosPage({ data = [], onRefresh }) {
    // --- Estados Principales ---
    // 🛑 ELIMINAMOS EL ESTADO LOCAL DE MOVIMIENTOS
    // const [movimientos, setMovimientos] = useState([]); 
    const movimientos = data; // 🛑 Ahora 'movimientos' es simplemente la prop 'data'

    // El estado de loading y error se maneja en App.jsx para la carga inicial.
    // Lo dejamos para propósitos de la edición o si la carga es asíncrona dentro del componente.
    const [loading, setLoading] = useState(false); // Lo establecemos en false por defecto.
    const [error, setError] = useState(null);
    // 🆕 ESTADO DE MENSAJES: Para mostrar feedback al usuario.
    const [statusMessage, setStatusMessage] = useState({ message: null, type: null }); 

    // --- Estados de Filtro existentes ---
    const [searchRemision, setSearchRemision] = useState("");
    const [placa, setPlaca] = useState("");
    const [conductor, setConductor] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [tercero, setTercero] = useState("");
    const [tipoPago, setTipoPago] = useState(""); 
    const [estado, setEstado] = useState(""); 
    const [noIngreso, setNoIngreso] = useState("");

    // ===================================
    // ⏳ Lógica para Ocultar Mensajes (Se mantiene)
    // ===================================
    useEffect(() => {
        if (statusMessage.message) {
            const timer = setTimeout(() => {
                setStatusMessage({ message: null, type: null });
            }, 4000);
            
            return () => clearTimeout(timer);
        }
    }, [statusMessage.message]);

    // ===================================
    // 🛑 Lógica principal de carga de datos (ELIMINADA / SUSTITUIDA)
    // ===================================
    // Eliminamos: fetchMovimientosData y el useEffect que la llama.
    /*
    const fetchMovimientosData = async () => { ... }
    useEffect(() => { fetchMovimientosData(); }, []);
    */

    // ===================================
    // 🔵 Lógica de Filtrado (useMemo)
    // ===================================
    const filteredMovimientos = useMemo(() => {
        let result = movimientos; // Usa la prop 'data' a través de la variable 'movimientos'

        // Filtros existentes (La lógica de filtrado se mantiene intacta)
        if (searchRemision) result = result.filter(x => String(x.remision).includes(searchRemision));
        if (placa) result = result.filter(x => (x.placa || "").toLowerCase().includes(placa.toLowerCase()));
        if (conductor) result = result.filter(x => (x.conductor || "").toLowerCase().includes(conductor.toLowerCase()));

        // Filtros (Texto e Inputs)
        if (tercero) result = result.filter(x => (x.tercero || "").toLowerCase().includes(tercero.toLowerCase()));
        if (noIngreso) result = result.filter(x => (x.no_ingreso || "").toLowerCase().includes(noIngreso.toLowerCase()));

        // Filtros (Selects)
        if (tipoPago) result = result.filter(x => (x.tipo_pago || "").toUpperCase() === tipoPago.toUpperCase());
        if (estado) result = result.filter(x => (x.estado || "").toUpperCase() === estado.toUpperCase());

        // Filtrado por fecha. Compara solo la parte YYYY-MM-DD
        if (desde) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) >= new Date(desde));
        if (hasta) result = result.filter(x => x.fecha && new Date(x.fecha.split("T")[0]) <= new Date(hasta));

        return result;
    }, [movimientos, searchRemision, placa, conductor, desde, hasta, tercero, tipoPago, estado, noIngreso]); 
    // La dependencia 'movimientos' ahora se refiere a la prop 'data'

    // ===================================
    // 🔵 Función para manejar el cambio de estado (Actualizada)
    // ===================================
    const handleToggleEstado = async (remision) => {
        setStatusMessage({ message: null, type: null });

        const currentMovement = movimientos.find(m => m.remision === remision);
        if (!currentMovement) {
            setStatusMessage({ 
                message: "Error: Movimiento no encontrado localmente.", 
                type: 'error' 
            });
            return;
        }

        const newState = currentMovement.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

        try {
            await updateMovimientoStatus(remision, newState); 
            
            // 🛑 LLAMAMOS A LA FUNCIÓN DE RECARGA DEL PADRE (App.jsx)
            if (onRefresh) {
                await onRefresh(); 
            } else {
                console.warn("onRefresh no está definida. La tabla no se actualizará automáticamente.");
            }

            setStatusMessage({ 
                message: `Remisión ${remision} actualizada a ${newState} con éxito.`, 
                type: 'success' 
            });
            
        } catch (e) {
            console.error("Error al actualizar estado:", e);
            setStatusMessage({ 
                message: `Fallo al cambiar estado de ${remision}. Error: ${e.message || 'Desconocido'}`, 
                type: 'error' 
            });
        }
    };

    // {/*                          🚧 🛑 🚧 Sección en desarrollo 🚧 🛑 🚧
//     Esta parte del componente está siendo actualizada.Estoy trabajando en esta sección.🛠️
// */} 



// //     const AppRoutes = () => {
// //     return (
// //         <BrowserRouter>
// //             <Routes>
// //                 {/* Esta es la ruta clave: define un parámetro dinámico llamado ":remision"
// //                 que se pasa al componente InvoiceGenerator.
// //                 */}
// //                 <Route 
// //                     path="/invoice/:remision" 
// //                     element={<InvoiceGenerator />} 
// //                 />
                
// //                 {/* Si también tienes la ruta para generar una nueva remisión (sin ID) */}
// //                 <Route 
// //                     path="/invoice/new" 
// //                     element={<InvoiceGenerator />} 
// //                 />
                
// //                 {/* ... otras rutas */}
// //             </Routes>
// //         </BrowserRouter>
// //     );

// //     // export default AppRoutes; 
// // };
// // function MiComponenteDeTabla() {
// //     // 1. Obtener la función de navegación
// //     const navigate = useNavigate(); 
    
// //     // ...

// //     const handleEdit = (movimiento) => {
// //         // 2. Definir la RUTA URL (NO el archivo)
// //         // La ruta debe coincidir con la que está configurada en tu <Route>
// //         const RUTA_DE_EDICION = '/generar-remision'; // O el nombre que uses

// //         // 3. Obtener el ID que vas a pasar
// //         const idDeEdicion = movimiento.remision; // O movimiento.id si es mejor

// //         // 4. USAR `Maps`
// //         // Esto cambia la URL sin recargar la página.
// //         navigate(`${RUTA_DE_EDICION}?remisionId=${encodeURIComponent(idDeEdicion)}`);

// //         // console.log("➡️ Navegando con React Router a:", `${RUTA_DE_EDICION}?remisionId=${idDeEdicion}`);
// //     };

// //     // ...
// // }


    //------------------------------------------------------------------------------------
    // Función para manejar la acción de editar
    const handleEdit = (movimiento) => {
        // ... Lógica de edición se mantiene ...
        alert(`Preparando edición de la remisión: ${movimiento.remision}.`);
    };


    // 🛑 ELIMINAMOS EL CHEQUEO DE LOADING/ERROR INICIALES (Ahora App.jsx lo maneja)
    // if (loading) return (<div className="p-6"><p className="text-center text-gray-600">Cargando movimientos...</p></div>);
    // if (error) return (<div className="p-6"><p className="text-center text-red-600">⚠️ Error: {error}</p></div>);


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Movimientos</h1>

            {/* 🆕 BLOQUE DE MENSAJE DE ESTADO (Aviso) */}
            {statusMessage.message && (
                <div 
                    className={`p-3 mb-4 rounded-lg text-white font-medium shadow-md transition-opacity duration-300 ${
                        statusMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                >
                    {statusMessage.message}
                </div>
            )}
            {/* FIN BLOQUE DE MENSAJE DE ESTADO */}

            {/* Filtros (Se mantienen) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
                {/* Inputs de filtro... */}
                <input className="border p-2 rounded" placeholder="Remisión" value={searchRemision} onChange={e => setSearchRemision(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Conductor" value={conductor} onChange={e => setConductor(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Tercero" value={tercero} onChange={e => setTercero(e.target.value)} />
                <input className="border p-2 rounded" placeholder="No. Ingreso" value={noIngreso} onChange={e => setNoIngreso(e.target.value)} />

                {/* Selects de filtro... */}
                <select className="border p-2 rounded" value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
                    {TIPO_PAGO_OPCIONES.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select className="border p-2 rounded" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADO_OPCIONES.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                {/* Fechas de filtro... */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Desde</label>
                    <input type="date" className="border p-2 w-full rounded" value={desde} onChange={e => setDesde(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                    <input type="date" className="border p-2 w-full rounded" value={hasta} onChange={e => setHasta(e.target.value)} />
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Mostrando: <span className="font-bold text-blue-600">{filteredMovimientos.length}</span> de <span className="font-bold text-gray-800">{movimientos.length}</span> registros. 
                    {/* 🛑 Usa movimientos.length (que ahora es data.length) */}
                </div>
            </div>

            {/* Componente de presentación de la tabla */}
            <MovimientosTable 
                data={filteredMovimientos} 
                toggleEstado={handleToggleEstado} 
                onEdit={handleEdit}
            />
        </div>
    );
}