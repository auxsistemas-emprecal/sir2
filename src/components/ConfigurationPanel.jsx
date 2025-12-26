import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  DollarSign, 
  Package, 
  X, 
  Save 
} from "lucide-react";
import {
  fetchMateriales,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  fetchTiposPago,
  createTipoPago,
  updateTipoPago,
  deleteTipoPago,
} from "../assets/services/apiService";

export default function ConfigurationPanel() {
  const [materiales, setMateriales] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);

  const [nuevoMaterial, setNuevoMaterial] = useState({
    nombre_material: "",
    precio: "",
  });

  const [nuevoTipo, setNuevoTipo] = useState({
    tipo_pago: "",
  });

  const [editandoMaterial, setEditandoMaterial] = useState(null);
  const [editandoTipo, setEditandoTipo] = useState(null);

  /* ============================================================
      CARGAR MATERIALES Y TIPOS DE PAGO (Lógica Original)
     ============================================================ */
  useEffect(() => {
    cargarMateriales();
    cargarTiposPago();
  }, []);

  const cargarMateriales = async () => {
    const data = await fetchMateriales();
    setMateriales(data);
  };

  const cargarTiposPago = async () => {
    const data = await fetchTiposPago();
    setTiposPago(data);
  };

  /* ============================================================
      CRUD MATERIALES (Lógica Original)
     ============================================================ */
  const guardarMaterial = async (e) => {
    e.preventDefault();
    await createMaterial(nuevoMaterial);
    setNuevoMaterial({ nombre_material: "", precio: "" });
    cargarMateriales();
  };

  const guardarEdicionMaterial = async (e) => {
    e.preventDefault();
    await updateMaterial(editandoMaterial.idMaterial, editandoMaterial);
    setEditandoMaterial(null);
    cargarMateriales();
  };

  const eliminarMaterial = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este material?")) {
      await deleteMaterial(id);
      cargarMateriales();
    }
  };

  /* ============================================================
      CRUD TIPOS DE PAGO (Lógica Original)
     ============================================================ */
  const guardarTipo = async (e) => {
    e.preventDefault();
    await createTipoPago(nuevoTipo);
    setNuevoTipo({ tipo_pago: "" });
    cargarTiposPago();
  };

  const guardarEdicionTipo = async (e) => {
    e.preventDefault();
    await updateTipoPago(editandoTipo.idTipoPago, editandoTipo);
    setEditandoTipo(null);
    cargarTiposPago();
  };

  const eliminarTipo = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este tipo de pago?")) {
      await deleteTipoPago(id);
      cargarTiposPago();
    }
  };

  /* ============================================================
      RENDER (Diseño Estético con Lógica Intacta)
     ============================================================ */
  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER DE LA SECCIÓN CON LOGO ANIMADO */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        {/* El contenedor tiene un pulso suave y el icono gira lentamente */}
        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 animate-pulse transition-transform hover:scale-110 duration-500">
          <Settings className="text-white animate-[spin_8s_linear_infinite]" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Panel de Configuración</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión de materiales y métodos de pago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* SECCIÓN MATERIALES */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100/50">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="text-emerald-600 animate-bounce" style={{ animationDuration: '3s' }} size={20} />
              <h2 className="text-lg font-bold text-slate-800">Materiales</h2>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {materiales.length} Registrados
            </span>
          </div>

          <div className="p-6">
            {/* FORMULARIO CREAR MATERIAL */}
            <form onSubmit={guardarMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Nombre del material"
                  value={nuevoMaterial.nombre_material}
                  onChange={(e) => setNuevoMaterial((prev) => ({ ...prev, nombre_material: e.target.value }))}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Precio"
                  value={nuevoMaterial.precio}
                  onChange={(e) => setNuevoMaterial((prev) => ({ ...prev, precio: e.target.value }))}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
                <button type="submit" className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-90 transition-all">
                  <Plus size={24} />
                </button>
              </div>
            </form>

            {/* TABLA MATERIALES */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-center">ID</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Material</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Precio</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {materiales.map((m) => (
                    <tr key={m.idMaterial} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="p-4 text-center font-bold text-slate-400">#{m.idMaterial}</td>
                      <td className="p-4 font-black text-slate-700 uppercase">{m.nombre_material}</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">${m.precio}</span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button onClick={() => setEditandoMaterial(m)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all hover:scale-110 active:scale-90">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => eliminarMaterial(m.idMaterial)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all hover:scale-110 active:scale-90">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECCIÓN TIPOS DE PAGO */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="text-blue-600 animate-pulse" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Tipos de Pago</h2>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={guardarTipo} className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Ej. Transferencia, Efectivo..."
                value={nuevoTipo.tipo_pago}
                onChange={(e) => setNuevoTipo((prev) => ({ ...prev, tipo_pago: e.target.value }))}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-90 transition-all uppercase text-xs">
                Añadir
              </button>
            </form>

            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-center w-20">ID</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Tipo</th>
                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tiposPago.map((t) => (
                    <tr key={t.idTipoPago} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-400">#{t.idTipoPago}</td>
                      <td className="p-4 font-black text-slate-700 uppercase">{t.tipo_pago}</td>
                      <td className="p-4 text-right space-x-1">
                        <button onClick={() => setEditandoTipo(t)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all hover:scale-110 active:scale-90">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => eliminarTipo(t.idTipoPago)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all hover:scale-110 active:scale-90">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* MODALES CON ANIMACIÓN DE ZOOM */}
      {/* (Se mantienen igual para no afectar la lógica de los formularios) */}
      {editandoMaterial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Editar Material</h3>
              <button onClick={() => setEditandoMaterial(null)} className="text-slate-400 hover:text-red-500 hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descripción</label>
                <input
                  type="text"
                  value={editandoMaterial.nombre_material}
                  onChange={(e) => setEditandoMaterial((prev) => ({ ...prev, nombre_material: e.target.value }))}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-600 font-bold text-slate-700 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Precio Unitario</label>
                <input
                  type="number"
                  value={editandoMaterial.precio}
                  onChange={(e) => setEditandoMaterial((prev) => ({ ...prev, precio: e.target.value }))}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-600 font-bold text-slate-700"
                />
              </div>
            </div>
            <button onClick={guardarEdicionMaterial} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
              <Save size={20} /> Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {editandoTipo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Editar Método</h3>
              <button onClick={() => setEditandoTipo(null)} className="text-slate-400 hover:text-red-500 hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre del Tipo de Pago</label>
              <input
                type="text"
                value={editandoTipo.tipo_pago}
                onChange={(e) => setEditandoTipo((prev) => ({ ...prev, tipo_pago: e.target.value }))}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-blue-600 font-bold text-slate-700 uppercase"
              />
            </div>
            <button onClick={guardarEdicionTipo} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
              <Save size={20} /> Actualizar Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

