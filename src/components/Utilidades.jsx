import React from 'react';
import { BarChart3, Settings, SquareUser, UserStar, FileText, Hash } from 'lucide-react';

const Utilidades = ({ setActiveTab }) => {
  const modulos = [
    {
      id: 'reporteCompras',
      titulo: 'Reporte de Compras de clientes',
      descripcion: 'Visualiza y exporta el historial de compras de material por terceros.',
      icon: <BarChart3 size={32} className="text-blue-500" />,
      color: 'hover:border-blue-500'
    },
    {
      id: 'terceros',
      titulo: 'Gestión de Terceros',
      descripcion: 'Administra conductores, clientes y terceros.',
      icon: <SquareUser size={32} className="text-emerald-500" />,
      color: 'hover:border-emerald-500'
    },
    {
      id: 'PreciosEspeciales',
      titulo: 'Precios Especiales',
      descripcion: 'Configura tarifas personalizadas por cliente.',
      icon: <UserStar size={32} className="text-amber-500" />,
      color: 'hover:border-amber-500'
    },
    {
      id: 'config',
      titulo: 'Configuración',
      descripcion: 'Ajustes generales de precios en materiales y tipos de pago.',
      icon: <Settings size={32} className="text-slate-500" />,
      color: 'hover:border-slate-500'
    },
    {
      id: 'CuadreRevision',
      titulo: 'Revisión de Cuadre Caja',
      descripcion: 'Consulta y analiza los cierres de caja de días anteriores.',
      icon: <FileText size={32} className="text-purple-500" />,
      color: 'hover:border-purple-500'
    },
    {
      id: 'ConsultaCompras',
      titulo: 'Consulta de Compras de la mina',
      descripcion: 'Visualiza y exporta el historial de adquisiciones de la mina.',
      icon: <BarChart3 size={32} className="text-blue-500" />,
      color: 'hover:border-blue-500'
    },
    {
      id: 'plaquetas',
      titulo: 'Plaquetas de Maquinaria',
      descripcion: 'Gestión de identificación, marcas y modelos de equipos pesados.',
      icon: <Hash size={32} className="text-indigo-500" />,
      color: 'hover:border-indigo-500'
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center uppercase tracking-wider">
        Panel de Utilidades
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {modulos.map((modulo) => (
          <button
            key={modulo.id}
            onClick={() => setActiveTab(modulo.id)}
            className={`flex items-start p-6 bg-white rounded-xl shadow-sm border-2 border-transparent transition-all duration-300 text-left group ${modulo.color} hover:shadow-md hover:-translate-y-1`}
          >
            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors duration-300">
              {modulo.icon}
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-lg text-slate-800 uppercase mb-1">
                {modulo.titulo}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {modulo.descripcion}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Utilidades;