// // src/components/CuadreCaja.jsx

// import React from 'react';

// /**
//  * Componente para el Cuadre de Caja.
//  * Muestra el resumen de ingresos y gastos del día.
//  */
// export default function CuadreCaja({ movements, anticipos }) {
//   // Nota: movements y anticipos contienen TODOS los datos cargados al inicio.
//   // La lógica para filtrar por la fecha actual debe ir aquí.
  
//   // Puedes usar la siguiente imagen como referencia visual para el usuario:
  
//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
//         💵 Cuadre de Caja Diario
//       </h2>

//       <div className="mb-8">
//         <p className="text-lg font-medium text-gray-600">
//           Esta sección contendrá el registro de dinero entrante (movimientos) y saliente (gastos/anticipos) del día, para realizar el arqueo.
//         </p>
//       </div>

//       {/* --- Resumen de Movimientos del Día (a implementar) --- */}
//       <h3 className="text-xl font-semibold text-emerald-700 mb-4">
//         Resumen de Transacciones (Hoy)
//       </h3>
//       <div className="bg-gray-50 p-4 rounded-lg">
//         {/* Aquí iría el filtro de movimientos por fecha y la tabla detallada */}
//         <p className='text-sm text-gray-500'>
//           **Para mostrar los detalles solicitados (remisión, tercero, cantidades, artículo, precios, subtotal, iva, retención y total), necesitarás obtener el detalle de los ítems para cada movimiento usando o adaptando la función `fetchMovimientoItemsByRemision` en el `App.jsx` o en este componente.**
//         </p>
        
//         {/* Ejemplo de estructura para la tabla de movimientos */}
//         <table className="min-w-full divide-y divide-gray-200 mt-4">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remisión</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tercero</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {movements.length > 0 ? (
//                 // Lógica para mapear los movimientos filtrados por fecha
//                 <tr><td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Filtrando movimientos...</td></tr>
//             ) : (
//                 <tr><td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No hay movimientos registrados.</td></tr>
//             )}
//           </tbody>
//         </table>

//       </div>

//       {/* --- Resumen de Arqueo (a implementar) --- */}
//       <h3 className="text-xl font-semibold text-emerald-700 mb-4 mt-8">
//         Arqueo de Caja
//       </h3>
//        <div className="bg-gray-50 p-4 rounded-lg">
//         {/* Aquí iría la lógica para calcular el total de efectivo (movimientos + anticipos) */}
//         <p>Total de Efectivo Calculado: **$X,XXX,XXX**</p>
//         <p>Detalle del Arqueo de Billetes y Monedas (como el Excel que enviaste)</p>
//         <p className='text-xs italic text-red-500'>Nota: Esta parte requiere lógica de entrada manual o un cálculo basado en el arqueo físico, similar al que se ve en la imagen que proporcionaste.</p>
//       </div>

//     </div>
//   );
// }



import React, { useState, useMemo } from "react";

export default function CuadreCaja() {
  // ===============================
  // ESTADOS
  // ===============================
  const [gastos, setGastos] = useState([]);

  const [formGasto, setFormGasto] = useState({
    descripcion: "",
    valor: "",
    observacion: "",
  });

  // Fecha actual (YYYY-MM-DD)
  const hoy = new Date().toISOString().split("T")[0];

  // ===============================
  // MANEJO DEL FORMULARIO
  // ===============================
  const handleChange = (e) => {
    setFormGasto({
      ...formGasto,
      [e.target.name]: e.target.value,
    });
  };

  const agregarGasto = (e) => {
    e.preventDefault();

    if (!formGasto.descripcion || !formGasto.valor) return;

    const nuevoGasto = {
      id: Date.now(),
      descripcion: formGasto.descripcion,
      valor: Number(formGasto.valor),
      observacion: formGasto.observacion,
      fecha: hoy,
    };

    setGastos([...gastos, nuevoGasto]);
    setFormGasto({
      descripcion: "",
      valor: "",
      observacion: "",
    });
  };

  // ===============================
  // FILTRO: SOLO GASTOS DEL DÍA
  // ===============================
  const gastosHoy = useMemo(() => {
    return gastos.filter((g) => g.fecha === hoy);
  }, [gastos, hoy]);

  // Total de gastos del día (base)
  const totalGastosHoy = gastosHoy.reduce(
    (acc, g) => acc + g.valor,
    0
  );

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        💵 Cuadre de Caja
      </h2>

      {/* ===============================
          FORMULARIO DE GASTOS
      =============================== */}
      <form
        onSubmit={agregarGasto}
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          type="text"
          name="descripcion"
          placeholder="Gasto"
          value={formGasto.descripcion}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="valor"
          placeholder="Valor"
          value={formGasto.valor}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="observacion"
          placeholder="Observación"
          value={formGasto.observacion}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="md:col-span-3 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Agregar gasto
        </button>
      </form>

      {/* ===============================
          TABLA GASTOS DEL DÍA
      =============================== */}
      <h3 className="text-lg font-semibold text-red-700 mb-2">
        Gastos del día ({hoy})
      </h3>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border">
          <thead className="bg-red-100">
            <tr>
              <th className="border p-2 text-left">Gasto</th>
              <th className="border p-2 text-left">Valor</th>
              <th className="border p-2 text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {gastosHoy.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center p-4 text-gray-500"
                >
                  No hay gastos registrados hoy
                </td>
              </tr>
            ) : (
              gastosHoy.map((g) => (
                <tr key={g.id}>
                  <td className="border p-2">{g.descripcion}</td>
                  <td className="border p-2 font-semibold">
                    ${g.valor.toLocaleString("es-CO")}
                  </td>
                  <td className="border p-2">
                    {g.observacion || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===============================
          TABLA RESUMEN (BASE)
      =============================== */}
      <h3 className="text-lg font-semibold text-emerald-700 mb-2">
        Resumen del Cuadre
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <tbody>
            <tr>
              <td className="border p-2 font-bold">Fecha</td>
              <td className="border p-2">{hoy}</td>
            </tr>
            <tr>
              <td className="border p-2">Gastos</td>
              <td className="border p-2">
                ${totalGastosHoy.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td className="border p-2">Efectivo</td>
              <td className="border p-2">$0</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Total neto</td>
              <td className="border p-2 font-bold">$0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}



