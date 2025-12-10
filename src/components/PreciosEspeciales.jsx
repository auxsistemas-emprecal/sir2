import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Pencil, 
  AlertTriangle 
} from "lucide-react";
import {
  fetchPreciosEspeciales,
  createPrecioEspecial,
  updatePrecioEspecial,
  searchTercero,
  searchMateriales,
  deletePrecioEspecial
} from "../assets/services/apiService.js";
import InputAutosuggest from "./InputAutosuggest.jsx";

export default function PreciosEspeciales({ data, setData }) {
  // Modales y Estados de UI
  const [showModal, setShowModal] = useState(false); // Editar
  const [showCreateModal, setShowCreateModal] = useState(false); // Crear
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Eliminar (Nuevo)
  
  // Datos y Formularios
  const [editingPrecio, setEditingPrecio] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); // ID para eliminar
  const [formData, setFormData] = useState({});
  const [createForm, setCreateForm] = useState({});
  const [search, setSearch] = useState("");
  const [labels, setLabels] = useState({ tercero: "", material: "" });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar precios especiales desde API
  useEffect(() => {
    (async () => {
      let lista = await fetchPreciosEspeciales();
      // Enriquecer datos con nombres (idealmente esto debería venir del backend para rendimiento)
      for (let i = 0; i < lista.length; i++) {
        const row = lista[i];
        const nombreTercero = await searchTercero(row.id_tercero);
        lista[i]["nombreTercero"] = nombreTercero[0]?.nombre || "Desconocido";

        const nombreMaterial = await searchMateriales(row.idMaterial);
        lista[i]["nombreMaterial"] = nombreMaterial[0]?.nombre_material || "Desconocido";
      }
      setData(lista || []);
    })();
  }, [setData]); // Agregado dependency array para evitar warnings

  // =========================
  // EDITAR
  // =========================
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

    setData((prev) =>
      prev.map((p) =>
        p.id_tercero_material === formData.id_tercero_material ? formData : p
      )
    );

    setShowModal(false);
    setEditingPrecio(null);
    setFormData({});
  };

  // =========================
  // ELIMINAR (Lógica Mejorada)
  // =========================
  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteExecute = async () => {
    if (itemToDelete) {
      await deletePrecioEspecial(itemToDelete);
      
      // Actualizar estado local para que desaparezca de la tabla inmediatamente
      setData((prev) => prev.filter((item) => item.id_tercero_material !== itemToDelete));
      
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // =========================
  // CREAR
  // =========================
  const openCreateForm = () => {
    setCreateForm({
      id_tercero: "",
      idMaterial: "",
      precio: "",
    });
    setLabels({ tercero: "", material: "" }); // Reseteamos labels
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
      } else if (selectedObj.hasOwnProperty("idMaterial")) { // Verifica key exacta de tu API
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

    // Nota: Aquí podrías querer volver a buscar los nombres para que la tabla se vea bien
    // o confiar en que el usuario refrescará. Por ahora insertamos raw data.
    const res = await createPrecioEspecial(createForm);
    const nuevo = res.data ?? createForm;
    
    // Parche visual rápido: asignar los labels actuales al nuevo objeto para que se vean en la tabla
    nuevo.nombreTercero = labels.tercero;
    nuevo.nombreMaterial = labels.material;

    setData((prev) => [...prev, nuevo]);
    setShowCreateModal(false);
    setCreateForm({});
    setCurrentPage(1);
  };

  // =========================
  // FILTRO + PÁGINA
  // =========================
  const filteredData = data.filter((row) => {
    const term = search.toLowerCase();
    return (
      String(row.id_tercero).toLowerCase().includes(term) ||
      String(row.nombreTercero || "").toLowerCase().includes(term) || // Busqueda por nombre también
      String(row.idMaterial).toLowerCase().includes(term) ||
      String(row.precio).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-600" /> Precios Especiales
        </h2>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/20"
        >
          <Plus size={18} /> Crear Precio Especial
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="w-full max-w-md relative group">
        <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Buscar por ID, nombre o precio..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Acciones</th>
                <th className="px-6 py-4 font-semibold">Tercero</th>
                <th className="px-6 py-4 font-semibold">Material</th>
                <th className="px-6 py-4 font-semibold text-right">Precio</th>
                <th className="px-6 py-4 font-semibold text-center">ID Ref</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id_tercero_material || index}
                    className="hover:bg-gray-50/80 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(row.id_tercero_material)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(row.id_tercero_material)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{row.nombreTercero}</span>
                        <span className="text-xs text-gray-400">ID: {row.id_tercero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{row.nombreMaterial}</span>
                        <span className="text-xs text-gray-400">ID: {row.idMaterial}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-700 bg-emerald-50/30">
                      ${row.precio?.toLocaleString("es-CO") || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-400 font-mono">
                      {row.id_tercero_material || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-2 text-sm text-gray-600">
        <span className="text-gray-500">
           Mostrando página <span className="font-bold text-gray-800">{currentPage}</span> de {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* ========================= */}
      {/* MODALES */}
      {/* ========================= */}

      {/* MODAL CREAR */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Crear nuevo precio especial
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ID Tercero</label>
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

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ID Material</label>
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

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Precio</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input
                    name="precio"
                    type="number"
                    value={createForm.precio}
                    onChange={handleCreateInput}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={saveNewPrecio}
                  className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                >
                  Guardar Precio Especial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-6">Editar Precio Especial</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ID Tercero</label>
                  <input
                    name="id_tercero"
                    type="number"
                    value={formData.id_tercero || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ID Material</label>
                  <input
                    name="idMaterial"
                    type="text"
                    value={formData.idMaterial || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre Tercero</label>
                <input
                  value={formData.nombreTercero || ""}
                  className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                  readOnly
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre Material</label>
                <input
                  value={formData.nombreMaterial || ""}
                  className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-600 uppercase mb-1 block">Nuevo Precio</label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                   <input
                    name="precio"
                    type="number"
                    value={formData.precio || ""}
                    onChange={handleEditInputChange}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-emerald-50/10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleEditSubmit}
                  className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (Confirmación) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative animate-in fade-in zoom-in duration-200 text-center">
                
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Esta acción eliminará el precio especial permanentemente. No se puede deshacer.
                </p>
                
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDeleteExecute}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}