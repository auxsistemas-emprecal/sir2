// src/components/HistorialAnticipos.jsx

import React, { useEffect, useState } from "react";
import AnticiposArchived from "./AnticiposArchived.jsx";
import {
    fetchPagos,
    fetchTiposPago,
    searchTercero,
} from "../assets/services/apiService.js";

export default function HistorialAnticipos({ 
    toggleAnticipoEstado, 
    onEditAnticipo, 
    onVerRemisionesAsociadas,
    onVerDetalleRemision // 🆕 Prop necesaria para navegar al Generador
}) { 
    const [pagosFormateados, setPagosFormateados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                // 1. Cargamos pagos y tipos de pago simultáneamente
                const [pagosData, tiposPagoData] = await Promise.all([
                    fetchPagos(),
                    fetchTiposPago(),
                ]);

                // 2. Extraer IDs de terceros únicos (filtrando nulos o indefinidos)
                const idsTerceros = [
                    ...new Set(pagosData.map((pago) => pago.idTercero).filter(id => id)),
                ];

                // 3. Cargar datos de los terceros encontrados
                const tercerosPromises = idsTerceros.map((id) => searchTercero(id));
                const tercerosResults = await Promise.all(tercerosPromises);
                
                // Aplanamos y limpiamos los resultados de terceros
                const tercerosData = tercerosResults.map((res) => res && res[0]).filter(t => t);

                // 4. Mapeamos y formateamos los datos para la tabla
                const datosProcesados = pagosData.map((pago) => {
                    const terceroEncontrado = tercerosData.find(
                        (t) => t.id_tercero === pago.idTercero
                    );

                    const tipoEncontrado = tiposPagoData.find(
                        (tp) => String(tp.idTipoPago) === String(pago.idTipoPago)
                    ); 
                  
                    return {
                        estado: pago.estado || "VIGENTE",
                        id: pago.id_pago || pago.id, 
                        fecha: pago.fecha ? pago.fecha.split("T")[0] : "", 
                        noComprobante: pago.no_ingreso || pago.noComprobante || "---",
                        tercero: terceroEncontrado ? terceroEncontrado.nombre : "Tercero No Encontrado",
                        cedula: pago.cedula || terceroEncontrado?.documento || "N/A",
                        telefono: pago.telefono || terceroEncontrado?.telefono || "N/A",
                        direccion: pago.direccion || terceroEncontrado?.direccion || "N/A",
                        concepto: pago.concepto || "Anticipo",
                        valorAnticipo: pago.valor || pago.valorAnticipo || 0,
                        // Mantenemos las remisiones como string o array para el hijo
                        remisiones: pago.remisiones || "[]",
                        saldo: pago.saldo,
                        tipoPago: tipoEncontrado ? tipoEncontrado.tipo_pago : "N/A",
                        idTercero: pago.idTercero,
                    };
                });

                // Ordenar por comprobante descendente (el más nuevo primero)
                datosProcesados.sort((a, b) => b.noComprobante - a.noComprobante);

                setPagosFormateados(datosProcesados);
            } catch (error) {
                console.error("Error cargando historial de anticipos:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="italic font-medium">Cargando historial de anticipos...</p>
            </div>
        );
    }

    return (
        <div className="p-0">
            <AnticiposArchived
                data={pagosFormateados}
                toggleAnticipoEstado={toggleAnticipoEstado}
                onVerAnticipo={onEditAnticipo} 
                onVerRemisionesAsociadas={onVerRemisionesAsociadas} 
                onVerDetalleRemision={onVerDetalleRemision} // 🆕 Pasamos la prop al componente visual
            />
        </div>
    );
}

// import React, { useEffect, useState } from "react";
// import AnticiposArchived from "./AnticiposArchived.jsx";
// import {
//     fetchPagos,
//     fetchTiposPago,
//     searchTercero,
// } from "../assets/services/apiService.js";

// export default function HistorialAnticipos({ toggleAnticipoEstado, onEditAnticipo, onVerRemisionesAsociadas }) { 
//     const [pagosFormateados, setPagosFormateados] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const cargarDatos = async () => {
//             try {
//                 setLoading(true);
//                 // 1. Cargamos pagos y tipos de pago
//                 const [pagosData, tiposPagoData] = await Promise.all([
//                     fetchPagos(),
//                     fetchTiposPago(),
//                 ]);

//                 // 2. Extraer IDs de terceros únicos (filtrando nulos o indefinidos)
//                 const idsTerceros = [
//                     ...new Set(pagosData.map((pago) => pago.idTercero).filter(id => id)),
//                 ];

//                 // 3. Cargar datos de los terceros encontrados
//                 const tercerosPromises = idsTerceros.map((id) => searchTercero(id));
//                 const tercerosResults = await Promise.all(tercerosPromises);
                
//                 // Aplanamos y limpiamos los resultados de terceros
//                 const tercerosData = tercerosResults.map((res) => res && res[0]).filter(t => t);

//                 // 4. Mapeamos y formateamos los datos para la tabla
//                 const datosProcesados = pagosData.map((pago) => {
//                     const terceroEncontrado = tercerosData.find(
//                         (t) => t.id_tercero === pago.idTercero
//                     );

//                     const tipoEncontrado = tiposPagoData.find(
//                         (tp) => String(tp.idTipoPago) === String(pago.idTipoPago)
//                     ); 
                  
//                     return {
//                         estado: pago.estado || "VIGENTE",
//                         id: pago.id_pago || pago.id, 
//                         fecha: pago.fecha ? pago.fecha.split("T")[0] : "", 
//                         noComprobante: pago.no_ingreso || pago.noComprobante || "---",
//                         tercero: terceroEncontrado ? terceroEncontrado.nombre : "Tercero No Encontrado",
//                         cedula: pago.cedula || terceroEncontrado?.documento || "N/A",
//                         telefono: pago.telefono || terceroEncontrado?.telefono || "N/A",
//                         direccion: pago.direccion || terceroEncontrado?.direccion || "N/A",
//                         concepto: pago.concepto || "Anticipo",
//                         valorAnticipo: pago.valor || pago.valorAnticipo || 0,
//                         // Mantenemos las remisiones para que AnticiposArchived las procese
//                         remisiones: pago.remisiones || "[]",
//                         saldo: pago.saldo,
//                         tipoPago: tipoEncontrado ? tipoEncontrado.tipo_pago : "N/A",
//                         idTercero: pago.idTercero,
//                     };
//                 });

//                 // Ordenar por comprobante descendente (el más nuevo primero)
//                 datosProcesados.sort((a, b) => b.noComprobante - a.noComprobante);

//                 setPagosFormateados(datosProcesados);
//             } catch (error) {
//                 console.error("Error cargando historial de anticipos:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         cargarDatos();
//     }, []);

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center p-12 text-gray-500">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
//                 <p className="italic font-medium">Cargando historial de anticipos...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-0"> {/* Reduje el padding para que el diseño de AnticiposArchived respire mejor */}
//             <AnticiposArchived
//                 data={pagosFormateados}
//                 toggleAnticipoEstado={toggleAnticipoEstado}
//                 onVerAnticipo={onEditAnticipo} 
//                 // Pasamos la nueva prop para manejar el clic de remisiones
//                 onVerRemisionesAsociadas={onVerRemisionesAsociadas} 
//             />
//         </div>
//     );
// }