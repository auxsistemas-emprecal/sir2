import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, Filter, Loader2, RefreshCw, SquareUser } from 'lucide-react';
import { buscarOrdenesCompra } from '../assets/services/apiService';

export default function ConsultaCompras() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para los filtros actualizados
  const [filtros, setFiltros] = useState({
    proveedor: '',
    item: '',
    destino: '',
    receptor: '', // Campo para búsqueda por receptor
    fecha_desde: '',
    fecha_hasta: '',
    limit: 100,
    offset: 0
  });

  // Función para cargar datos desde la API usando tus filtros
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await buscarOrdenesCompra(filtros);
      // Validamos la estructura success de tu API
      if (response.status === "success") {
        setOrdenes(response.data);
      } else {
        setOrdenes([]);
      }
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      proveedor: '',
      item: '',
      destino: '',
      receptor: '',
      fecha_desde: '',
      fecha_hasta: '',
      limit: 100,
      offset: 0
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Panel de Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <Package className="text-blue-600" /> Consulta de Órdenes de Compra
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={limpiarFiltros}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 transition-all"
            >
              LIMPIAR
            </button>
            <button 
              onClick={cargarDatos}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              BUSCAR
            </button>
          </div>
        </div>
        
        {/* Grid de 5 columnas para que quepan todos los filtros en una fila en pantallas grandes */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Filtro: Proveedor */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Proveedor / NIT</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="proveedor"
                placeholder="Ej: Emprecal o 800..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={filtros.proveedor}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Filtro: Item */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descripción Item</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="item"
                placeholder="Ej: Carbonato..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={filtros.item}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Filtro: Receptor (NUEVO) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Receptor</label>
            <div className="relative">
              <SquareUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="receptor"
                placeholder="Ej: Emprecal SAS..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={filtros.receptor}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Filtro: Fecha Desde */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                name="fecha_desde"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600"
                value={filtros.fecha_desde}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Filtro: Fecha Hasta */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                name="fecha_hasta"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600"
                value={filtros.fecha_hasta}
                onChange={handleInputChange}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha / ID</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Proveedor</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalles Orden</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-400 italic">
                      <Loader2 className="animate-spin" size={20} /> Consultando servidor...
                    </div>
                  </td>
                </tr>
              ) : ordenes.length > 0 ? (
                ordenes.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">{item.Fecha}</div>
                      <div className="text-[10px] text-slate-400 font-mono">#{item.IdentificadorLocal}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-800 uppercase leading-tight group-hover:text-blue-600 transition-colors">
                        {item.Proveedor}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">NIT: {item.NIT_Proveedor}</div>
                      <div className="text-[9px] text-indigo-500 font-black mt-1 uppercase">RECIBE: {item.ReceptorOrden}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-slate-600 max-w-[250px] truncate">{item.DescripcionItem}</div>
                      <div className="flex items-center gap-1 mt-1">
                         <span className="text-[10px] text-blue-500 font-bold uppercase">{item.Destino}</span>
                         <span className="text-[10px] text-slate-300">|</span>
                         <span className="text-[10px] text-slate-400 italic">Cant: {item.Cantidad}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-black text-slate-800">
                        ${new Intl.NumberFormat('es-CO').format(item.TotalOrden)}
                      </div>
                      <div className="text-[9px] text-slate-400 italic">IVA incl.</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                        item.Estado === 'VIGENTE' 
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                        : 'bg-red-100 text-red-600 border border-red-200'
                      }`}>
                        {item.Estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Search size={48} className="mb-2 opacity-20" />
                      <p className="font-medium">No se encontraron órdenes de compra</p>
                      <p className="text-xs">Intenta ajustando los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}