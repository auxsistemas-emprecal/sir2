import React, { useState, useEffect } from 'react';
import { fetchPlaquetas, createPlaqueta, updatePlaqueta, deletePlaqueta } from '../assets/services/apiService';
import { Pencil, Trash2, Plus, Check, Hash, Truck, X, Save } from 'lucide-react';

function Plaquetas() {
    const [plaquetas, setPlaquetas] = useState([]);
    const [formData, setFormData] = useState({ 
        plaqueta: '', maquina: '', modelo: '', marca: '', repuesto: '' 
    });
    
    // Estado para el modal de edición
    const [isEditing, setIsEditing] = useState(null); 
    const [editData, setEditData] = useState({
        plaqueta: '', maquina: '', modelo: '', marca: '', repuesto: ''
    });

    useEffect(() => {
        loadPlaquetas();
    }, []);

    const loadPlaquetas = async () => {
        const data = await fetchPlaquetas();
        const listaFinal = Array.isArray(data) ? data : (data?.data || []);
        setPlaquetas(listaFinal);
    };

    // Crear nuevo registro
    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        try {
            await createPlaqueta(formData);
            setFormData({ plaqueta: '', maquina: '', modelo: '', marca: '', repuesto: '' });
            loadPlaquetas();
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    // Guardar cambios en edición (Modal)
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updatePlaqueta(isEditing, editData);
            setIsEditing(null); // Cerrar modal
            loadPlaquetas();
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    const openEditModal = (item) => {
        setEditData({ 
            plaqueta: item.plaqueta, 
            maquina: item.maquina, 
            modelo: item.modelo || '', 
            marca: item.marca || '',
            repuesto: item.repuesto || '' 
        });
        setIsEditing(item.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar esta plaqueta?")) {
            await deletePlaqueta(id);
            loadPlaquetas();
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-7xl mx-auto relative">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Cabecera */}
                <div className="bg-[#1E3A8A] p-6 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <Hash /> Control de Equipos
                    </h2>
                    <span className="text-xs font-bold bg-white/20 px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {plaquetas.length} Registros Activos
                    </span>
                </div>

                <div className="p-6">
                    {/* Formulario de Creación (Solo para nuevos registros) */}
                    <form onSubmit={handleSubmitCreate} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex flex-col gap-1 md:col-span-1 lg:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N° Plaqueta</label>
                            <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={formData.plaqueta} onChange={(e) => setFormData({...formData, plaqueta: e.target.value})} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Máquina</label>
                            <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={formData.maquina} onChange={(e) => setFormData({...formData, maquina: e.target.value})} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Repuesto</label>
                            <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none font-semibold text-emerald-700" value={formData.repuesto} onChange={(e) => setFormData({...formData, repuesto: e.target.value})} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Marca</label>
                            <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Modelo</label>
                            <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white bg-[#1E3A8A] hover:bg-black transition-all shadow-md">
                                <Plus size={18} /> Agregar
                            </button>
                        </div>
                    </form>

                    {/* Tabla */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left table-fixed min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 text-[#64748B] text-[10px] uppercase font-black border-b border-slate-100">
                                    <th className="py-4 px-6 w-1/3">Plaqueta</th>
                                    <th className="py-4 px-6 w-1/3">Información de Equipo</th>
                                    <th className="py-4 px-6 w-1/3">Repuesto Asignado</th>
                                    <th className="py-4 px-6 w-24 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {plaquetas.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3 text-sm font-black text-slate-700">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Hash size={16} /></div>
                                                {item.plaqueta}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1"><Truck size={16} /></div>
                                                <div>
                                                    <div className="font-black text-[#1E293B] uppercase text-xs">{item.maquina}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{item.marca || 'S/M'} • {item.modelo || 'S/MOD'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-[11px] border border-emerald-100 uppercase w-fit min-w-[120px] text-center">
                                                {item.repuesto}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Pencil size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE EDICIÓN (Inspirado en tu imagen) */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                        {/* Cabecera Modal */}
                        <div className="bg-[#1E3A8A] p-5 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Pencil size={20} />
                                <h3 className="font-black text-lg uppercase tracking-tight">Editar Plaqueta</h3>
                            </div>
                            <button onClick={() => setIsEditing(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cuerpo Modal */}
                        <form onSubmit={handleUpdate} className="p-8 space-y-5">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Número de Plaqueta</label>
                                    <input 
                                        className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none bg-slate-50"
                                        value={editData.plaqueta}
                                        onChange={(e) => setEditData({...editData, plaqueta: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Máquina</label>
                                        <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={editData.maquina} onChange={(e) => setEditData({...editData, maquina: e.target.value})} required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Repuesto</label>
                                        <input className="p-3 rounded-xl border border-emerald-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 font-bold" value={editData.repuesto} onChange={(e) => setEditData({...editData, repuesto: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Marca</label>
                                        <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={editData.marca} onChange={(e) => setEditData({...editData, marca: e.target.value})} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Modelo</label>
                                        <input className="p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none" value={editData.modelo} onChange={(e) => setEditData({...editData, modelo: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Botones del Modal */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 uppercase text-xs">
                                    <Save size={18} /> Guardar Cambios
                                </button>
                                <button type="button" onClick={() => setIsEditing(null)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all uppercase text-xs">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Plaquetas;