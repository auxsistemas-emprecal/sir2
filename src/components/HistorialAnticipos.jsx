import React, { useEffect, useState } from "react";
import AnticiposArchived from "./AnticiposArchived.jsx";
import {
  fetchPagos,
  fetchTiposPago,
  searchTercero,
} from "../assets/services/apiService.js";

export default function HistorialAnticipos({ toggleAnticipoEstado }) {
  const [pagosFormateados, setPagosFormateados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // 1. Llamamos a todas las APIs necesarias en paralelo
        const [pagosData, tiposPagoData] = await Promise.all([
          fetchPagos(),
          fetchTiposPago(),
        ]);

        const idsTterceros = [
          ...new Set(pagosData.map((pago) => pago.idTercero)),
        ];

        const tercerosPromises = idsTterceros.map((id) => searchTercero(id));
        const tercerosResults = await Promise.all(tercerosPromises);
        const tercerosData = tercerosResults.map((res) => res[0]);

        // 2. Mapeamos los datos para que coincidan con lo que espera tu componente visual
        const datosProcesados = pagosData.map((pago) => {
          // Buscar el nombre del tercero por su ID
          const terceroEncontrado = tercerosData.find(
            (t) => t.id_tercero === pago.idTercero
          );

          // Buscar el nombre del tipo de pago por su ID

          const tipoEncontrado = tiposPagoData.find(
            (tp) => String(tp.idTipoPago) === pago.idTipoPago
          );

          return {
            estado: pago.estado || "VIGENTE",
            id: pago.id_pago, // Mapeo de DB a Componente
            fecha: pago.fecha ? pago.fecha.split("T")[0] : "", // Limpiar formato ISO si viene con hora
            noComprobante: pago.no_ingreso || "---",
            tercero: terceroEncontrado
              ? terceroEncontrado.nombre
              : "Tercero No Encontrado",
            cedula: pago.cedula || terceroEncontrado?.documento || "",
            telefono: pago.telefono || terceroEncontrado?.telefono || "",
            concepto: pago.concepto,
            valorAnticipo: pago.valor,
            tipoPago: tipoEncontrado ? tipoEncontrado.tipo_pago : "N/A",
            idTercero: pago.idTercero,
          };
        });

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
      <div className="p-8 text-center text-gray-500">Cargando anticipos...</div>
    );
  }

  return (
    <div className="p-4">
      <AnticiposArchived
        data={pagosFormateados}
        toggleAnticipoEstado={toggleAnticipoEstado}
      />
    </div>
  );
}
