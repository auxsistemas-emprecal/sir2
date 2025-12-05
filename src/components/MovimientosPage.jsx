// MovimientosPage.jsx
import React, { useEffect, useState, useMemo } from "react";
// Componente de presentación de la tabla
import MovimientosTable from "./MovimientosTable";
//Importamos las funciones con sus nombres reales de apiService.js
import { 
    fetchMovimientos, // Función para cargar todos los datos
    updateMovimientoStatus // Función para cambiar el estado (VIGENTE/CANCELADO)
} from '../assets/services/apiService'; 

// Definición de tipos de pago (deberías obtener esto de una API, pero lo definimos aquí para el filtro)
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


export default function MovimientosPage() {
    // --- Estados Principales ---
    const [movimientos, setMovimientos] = useState([]); // Datos completos
    const [loading, setLoading] = useState(true);
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
    // ⏳ Lógica para Ocultar Mensajes
    // ===================================
    useEffect(() => {
        // Si hay un mensaje, lo borra después de 4 segundos
        if (statusMessage.message) {
            const timer = setTimeout(() => {
                setStatusMessage({ message: null, type: null });
            }, 4000); // 4000 milisegundos = 4 segundos
            
            // Función de limpieza para evitar fugas de memoria si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [statusMessage.message]); // Se ejecuta cada vez que el mensaje cambia

    // ===================================
    // 🔵 Lógica principal de carga de datos
    // ===================================
    const fetchMovimientosData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchMovimientos(); 
            setMovimientos(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error desconocido al cargar los datos.");
            setMovimientos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientosData();
    }, []);

    // ===================================
    // 🔵 Lógica de Filtrado (useMemo)
    // ===================================
    const filteredMovimientos = useMemo(() => {
        let result = movimientos;

        // Filtros existentes
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

    // ===================================
    // 🔵 Función para manejar el cambio de estado
    // ===================================
    const handleToggleEstado = async (remision) => {
        // Limpiamos mensajes anteriores
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
            // Llama al servicio API con el nuevo estado
            await updateMovimientoStatus(remision, newState); 

            // Recarga los datos para reflejar el cambio en la tabla
            await fetchMovimientosData(); 

            // 🆕 MUESTRA EL MENSAJE DE ÉXITO
            setStatusMessage({ 
                message: `Remisión ${remision} actualizada a ${newState} con éxito.`, 
                type: 'success' 
            });
            
        } catch (e) {
            console.error("Error al actualizar estado:", e);
            // 🆕 MUESTRA EL MENSAJE DE ERROR
            setStatusMessage({ 
                message: `Fallo al cambiar estado de ${remision}. Error: ${e.message || 'Desconocido'}`, 
                type: 'error' 
            });
        }
    };

    // Función para manejar la acción de editar
    const handleEdit = (movimiento) => {
        console.log("➡️ EDITAR Movimiento:", movimiento.remision);
        // Puedes reemplazar el alert con la lógica para abrir un modal o redirigir
        alert(`Preparando edición de la remisión: ${movimiento.remision}. (Implementar Modal/Redirección aquí)`);
    };


    if (loading) return (<div className="p-6"><p className="text-center text-gray-600">Cargando movimientos...</p></div>);
    if (error) return (<div className="p-6"><p className="text-center text-red-600">⚠️ Error: {error}</p></div>);


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

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
                {/* Primera Fila de Búsquedas (Remisión, Placa, Conductor, Tercero, No. Ingreso) */}
                <input className="border p-2 rounded" placeholder="Remisión" value={searchRemision} onChange={e => setSearchRemision(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Conductor" value={conductor} onChange={e => setConductor(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Tercero" value={tercero} onChange={e => setTercero(e.target.value)} />
                <input className="border p-2 rounded" placeholder="No. Ingreso" value={noIngreso} onChange={e => setNoIngreso(e.target.value)} />

                {/* Segunda Fila de Selects y Fechas */}
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




















































