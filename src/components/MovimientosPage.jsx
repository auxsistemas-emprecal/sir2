
//------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------         10/12/25 --- 11/15         ---------------------------------------
//------------------------------------------------------------------------------------------------------------------------


// MovimientosPage.jsx (MODIFICADO)

import React, { useEffect, useState, useMemo } from "react";
// Componente de presentación de la tabla
import MovimientosTable from "./MovimientosTable";


import { 
    // fetchMovimientos, 
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

//  ACEPTAMOS LAS PROPS 'data' y 'onRefresh' de App.jsx
export default function MovimientosPage({ data = [], onRefresh, onEdit, changeTab }) {
    // --- Estados Principales ---
    const movimientos = data; 
    // El estado de loading y error se maneja en App.jsx para la carga inicial.
    const [loading, setLoading] = useState(false); // Lo establecemos en false por defecto.
    const [error, setError] = useState(null);
    // ESTADO DE MENSAJES: Para mostrar feedback al usuario.
    const [statusMessage, setStatusMessage] = useState({ message: null, type: null }); 

    // --- Estados de Filtro existentes ---
    const [searchRemision, setSearchRemision] = useState("");
    const [placa, setPlaca] = useState("");
    const [conductor, setConductor] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [tercero, setTercero] = useState("");
    const [cedulaCliente, setCedulaCliente] = useState(""); 
    const [telefonoCliente, setTelefonoCliente] = useState("");
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
        if (cedulaCliente) result = result.filter(x => (x.cedula || x.cedula_cliente || "").toLowerCase().includes(cedulaCliente.toLowerCase()));
        if (telefonoCliente) result = result.filter(x => (x.telefono || x.telefono_cliente || "").toLowerCase().includes(telefonoCliente.toLowerCase()));
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
            
            // FUNCIÓN DE RECARGA DEL PADRE (App.jsx)
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
const handleEdit = (movimiento) => {
        alert(`Preparando edición de la remisión: ${movimiento.remision}.`);

        try {
            // Llama a la función 'startEditing' en App.jsx,
            // pasándole el objeto completo del movimiento.
            onEdit(movimiento); 

        } catch (error) {
            // Si startEditing falla (e.g., error de API), el error se captura aquí.
            console.error("Fallo al iniciar el flujo de edición:", error);
            alert("Error al cargar los detalles de la remisión para edición.");
        }
    };

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



