import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  X,
  Search,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Package,
} from "lucide-react";
import {
  fetchPreciosEspeciales,
  createPrecioEspecial,
  updatePrecioEspecial,
  searchTercero,
  searchMateriales,
  deletePrecioEspecial,
} from "../assets/services/apiService.js";
import InputAutosuggest from "./InputAutosuggest.jsx";

export default function PreciosEspeciales() {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({});
  const [createForm, setCreateForm] = useState({});
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState({ tercero: "", material: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      let lista = await fetchPreciosEspeciales();
      for (let i = 0; i < lista.length; i++) {
        const row = lista[i];
        const nombreTercero = await searchTercero(row.id_tercero);
        lista[i]["nombreTercero"] = nombreTercero[0]?.nombre || "Desconocido";
        const nombreMaterial = await searchMateriales(row.idMaterial);
        lista[i]["nombreMaterial"] = nombreMaterial[0]?.nombre_material || "Desconocido";
      }
      setData(lista || []);
    })();
  }, [setData]);

  const openEditModal = (id) => {
    const precio = data.find((p) => p.id_tercero_material === id);
    if (precio) {
      setEditingPrecio(precio);
      setFormData({ ...precio });
      setShowModal(true);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updatePrecioEspecial(formData.id_tercero_material, formData);
    setData((prev) => prev.map((p) => p.id_tercero_material === formData.id_tercero_material ? formData : p));
    setShowModal(false);
    setEditingPrecio(null);
    setFormData({});
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteExecute = async () => {
    if (itemToDelete) {
      await deletePrecioEspecial(itemToDelete);
      setData((prev) => prev.filter((item) => item.id_tercero_material !== itemToDelete));
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const openCreateForm = () => {
    setCreateForm({ id_tercero: "", idMaterial: "", precio: "" });
    setLabels({ tercero: "", material: "" });
    setShowCreateModal(true);
  };

  const handleCreateInput = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    const selectedObj = e.target.completeObject;
    if (selectedObj && typeof selectedObj === "object") {
      if (selectedObj.hasOwnProperty("id_tercero")) {
        value = selectedObj.id_tercero;
        setLabels((prev) => ({ ...prev, tercero: selectedObj.nombre }));
      } else if (selectedObj.hasOwnProperty("idMaterial")) {
        value = selectedObj.idMaterial;
        setLabels((prev) => ({ ...prev, material: selectedObj.nombre_material || selectedObj.material }));
      }
    }
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveNewPrecio = async () => {
    if (!createForm.id_tercero || !createForm.idMaterial || !createForm.precio) {
      alert("Datos obligatorios incompletos.");
      return;
    }
    const res = await createPrecioEspecial(createForm);
    const nuevo = res.data ?? createForm;
    nuevo.nombreTercero = labels.tercero;
    nuevo.nombreMaterial = labels.material;
    setData((prev) => [...prev, nuevo]);
    setShowCreateModal(false);
    setCreateForm({});
    setCurrentPage(1);
  };

  const filteredData = data.filter((row) => {
    const term = search.toLowerCase();
    return (
      String(row.id_tercero).toLowerCase().includes(term) ||
      String(row.nombreTercero || "").toLowerCase().includes(term) ||
      String(row.idMaterial).toLowerCase().includes(term) ||
      String(row.precio).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-slate-900 rounded-2rem p-8 shadow-xl relative overflow-hidden transition-all hover:shadow-emerald-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform duration-300">
              <FileSpreadsheet className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Precios Especiales</h2>
              <p className="text-emerald-400 text-sm font-medium">Gestión avanzada de tarifas por cliente</p>
            </div>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl hover:bg-emerald-400 hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-lg"
          >
            <Plus size={20} /> CREAR PRECIO ESPECIAL
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 group-focus-within:scale-110 transition-all" size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o precio..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm hidden md:block hover:border-emerald-200 transition-colors">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total registros: </span>
          <span className="text-slate-900 font-black ml-1 inline-block hover:scale-110 transition-transform">{filteredData.length}</span>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2rem shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tercero</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Precio</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">ID Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={row.id_tercero_material || index} className="hover:bg-emerald-50/30 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(row.id_tercero_material)} className="p-2 text-blue-600 hover:bg-blue-100 hover:scale-110 rounded-xl transition-all" title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => confirmDelete(row.id_tercero_material)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 hover:scale-110 transition-all rounded-xl" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 uppercase text-sm group-hover:text-emerald-700 transition-colors">{row.nombreTercero}</span>
                          <span className="text-[10px] font-bold text-emerald-600">ID: {row.id_tercero}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{row.nombreMaterial}</span>
                          <span className="text-[10px] text-slate-400">ID: {row.idMaterial}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-base shadow-sm inline-block group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        ${row.precio?.toLocaleString("es-CO") || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-white transition-colors">{row.id_tercero_material || "-"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">No se encontraron registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-1.5rem border border-slate-100 shadow-sm text-sm">
        <span className="text-slate-500 font-medium">
          Mostrando página <span className="text-slate-900 font-black">{currentPage}</span> de <span className="text-slate-900 font-black">{totalPages}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all font-bold text-slate-600"
          >
            <ChevronLeft size={18} /> Anterior
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all font-bold text-slate-600"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* MODAL CREAR MEJORADO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <button 
              onClick={() => setShowCreateModal(false)} 
              className="absolute top-8 right-8 text-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90 p-2 rounded-full transition-all duration-300"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Plus size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Nuevo Precio Especial</h3>
              <p className="text-slate-500 font-medium mt-1">Configure una tarifa personalizada para este cliente</p>
            </div>

            <div className="space-y-8">
              {/* CAPA SUPERIOR: Tercero */}
              <div className="relative z-120">
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Cliente / Tercero</label>
                  {createForm.id_tercero && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">ID: {createForm.id_tercero}</span>}
                </div>
                <InputAutosuggest 
                  label={labels.tercero} 
                  name="id_tercero" 
                  value={createForm.id_tercero} 
                  onChange={handleCreateInput} 
                  searchEndpoint={searchTercero} 
                  textSuggestor="nombre" 
                  itemsKeys="id_tercero" 
                />
              </div>

              {/* CAPA MEDIA: Material */}
              <div className="relative z-110">
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Material / Servicio</label>
                  {createForm.idMaterial && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Ref: {createForm.idMaterial}</span>}
                </div>
                <InputAutosuggest 
                  label={labels.material} 
                  name="idMaterial" 
                  value={createForm.idMaterial} 
                  onChange={handleCreateInput} 
                  searchEndpoint={searchMateriales} 
                  textSuggestor="nombre_material" 
                  itemsKeys="idMaterial" 
                />
              </div>

              {/* CAPA INFERIOR: Precio */}
              <div className="relative z-10 pt-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block ml-1">Tarifa Especial</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl group-focus-within:text-emerald-500 transition-colors">$</div>
                  <input 
                    name="precio" 
                    type="number" 
                    value={createForm.precio} 
                    onChange={handleCreateInput} 
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-1.5rem focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none font-black text-2xl text-slate-800 transition-all placeholder:text-slate-300 shadow-sm" 
                    placeholder="0.00" 
                    required 
                  />
                </div>
              </div>

              <div className="pt-4 relative z-0">
                <button 
                  onClick={saveNewPrecio} 
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-1.5rem shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Guardar Precio Especial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90 p-2 rounded-full transition-all">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Pencil size={24} />
              </div>
              Editar Precio Especial
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ID Tercero</label>
                  <div className="font-bold text-slate-700">{formData.id_tercero}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ID Material</label>
                  <div className="font-bold text-slate-700">{formData.idMaterial}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nombre Tercero</label>
                <div className="font-bold text-slate-800 uppercase text-sm">{formData.nombreTercero}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nombre Material</label>
                <div className="font-bold text-slate-800 text-sm">{formData.nombreMaterial}</div>
              </div>
              <div className="pt-2">
                <label className="text-xs font-black text-emerald-600 uppercase mb-2 block ml-1 tracking-wider">Nueva Tarifa</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">$</span>
                  <input 
                    name="precio" 
                    type="number" 
                    value={formData.precio || ""} 
                    onChange={handleEditInputChange} 
                    className="w-full pl-12 pr-6 py-5 bg-emerald-50/30 border-2 border-emerald-500 rounded-1.5rem focus:ring-8 focus:ring-emerald-500/10 outline-none font-black text-2xl text-emerald-700 transition-all shadow-sm" 
                  />
                </div>
              </div>
              <button 
                onClick={handleEditSubmit} 
                className="w-full py-5 bg-emerald-600 text-white font-black rounded-1.5rem shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4 uppercase tracking-widest text-sm"
              >
                Actualizar Tarifa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-150 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm relative text-center animate-in zoom-in-95 duration-200 border-t-8 border-red-500">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2rem bg-red-50 mb-6 shadow-inner">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">¿Eliminar precio?</h3>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">Esta acción es irreversible. Se restaurará la tarifa estándar para este cliente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteExecute} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 active:scale-95 transition-all uppercase tracking-widest text-xs">Sí, eliminar ahora</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 active:scale-95 transition-all text-xs">Mantener registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}