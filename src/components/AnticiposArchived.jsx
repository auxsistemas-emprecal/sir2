// src/components/AnticiposArchived.jsx

import React from 'react';
import { Archive, Search } from 'lucide-react';

export default function AnticiposArchived({ data }) {
  // Función para formatear moneda
  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <Archive size={18} className="text-blue-600"/> Anticipos Archivados
        </h2>
        {/* Puedes añadir un campo de búsqueda si quieres filtrar la tabla */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar anticipo..." 
            className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                No. Comprobante
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tercero
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Concepto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tipo Pago
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center italic">
                  No hay anticipos registrados aún.
                </td>
              </tr>
            ) : (
              // Ordenar por fecha o ID si es necesario, aquí por ID descendente
              data.slice().sort((a, b) => b.id - a.id).map((anticipo) => (
                <tr key={anticipo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {anticipo.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anticipo.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                    {anticipo.noComprobante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium uppercase">
                    {anticipo.tercero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anticipo.cedula || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anticipo.telefono || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anticipo.concepto || 'Anticipo de compra/servicio'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                    {formatCurrency(anticipo.valorAnticipo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anticipo.tipoPago}
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