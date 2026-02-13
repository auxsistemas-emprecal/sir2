import React, { useState, useEffect } from "react";
import Viewer from "react-viewer";
import {
  fetchPlaquetas,
  createPlaqueta,
  updatePlaqueta,
  deletePlaqueta,
} from "../assets/services/apiService";
import {
  Pencil,
  Trash2,
  Plus,
  Hash,
  Truck,
  X,
  Save,
  Image as ImageIcon,
  Upload,
  Search,
  Loader2,
  ChevronFirst, // Añade este
  ChevronLast,   // Añade este
} from "lucide-react";

function Plaquetas() {
  const [plaquetas, setPlaquetas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Formulario Creación
  const [formData, setFormData] = useState({
    plaqueta: "",
    maquina: "",
    modelo: "",
    marca: "",
    observacion: "",
    imagenes: [],
  });

  // Formulario Edición
  const [isEditing, setIsEditing] = useState(null);
  const [editData, setEditData] = useState({
    plaqueta: "",
    maquina: "",
    modelo: "",
    marca: "",
    observacion: "",
    imagenes: [],
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Cantidad de registros por página
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  loadPlaquetas();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
  setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadPlaquetas = async () => {
    setIsLoading(true); // Iniciamos la animación de carga

    // Usamos el endpoint de búsqueda si hay texto, sino el normal
    const response = await fetchPlaquetas(currentPage, 10, debouncedSearch);

    if (response && response.status === "success") {
      setPlaquetas(response.data || []);
      if (response.info) {
        setTotalPages(response.info.totalPages || 1);
      }
    } else {
      setPlaquetas([]);
      setTotalPages(1);
    }

    setIsLoading(false); // Apagamos la carga
  };

  const filteredPlaquetas = plaquetas.filter((item) => {
    const s = debouncedSearch.toLowerCase();
    return (
      item.plaqueta?.toLowerCase().includes(s) ||
      item.maquina?.toLowerCase().includes(s) ||
      item.marca?.toLowerCase().includes(s) ||
      item.modelo?.toLowerCase().includes(s) ||
      item.observacion?.toLowerCase().includes(s)
    );
  });

  // Helper para convertir array de imágenes a objeto imagen1...imagen4
  const mapImagesToPayload = (imagenesArray) => {
    return {
      imagen1: imagenesArray[0] || "",
      imagen2: imagenesArray[1] || "",
      imagen3: imagenesArray[2] || "",
      imagen4: imagenesArray[3] || "",
    };
  };

  const getImagesFromRecord = (record) => {
    const images = [];
    for (let i = 1; i <= 4; i++) {
      const img = record[`imagen${i}`];
      if (img && typeof img === "string" && img.trim() !== "") {
        images.push(img);
      }
    }
    return images;
  };

  // --- LÓGICA DE CARGA DE ARCHIVOS COMPARTIDA ---
  const handleFileRead = (e, currentImages, setFunction) => {
    const files = Array.from(e.target.files);
    if (currentImages.length + files.length > 4) {
      alert("Máximo 4 imágenes permitidas.");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFunction((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        ...mapImagesToPayload(formData.imagenes),
      };
      await createPlaqueta(payload);
      setFormData({
        plaqueta: "",
        maquina: "",
        modelo: "",
        marca: "",
        observacion: "",
        imagenes: [],
      });
      await loadPlaquetas();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...editData,
        ...mapImagesToPayload(editData.imagenes),
      };
      await updatePlaqueta(isEditing, payload);
      setIsEditing(null);
      await loadPlaquetas();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditData({
      plaqueta: item.plaqueta,
      maquina: item.maquina,
      modelo: item.modelo || "",
      marca: item.marca || "",
      observacion: item.observacion || "",
      imagenes: getImagesFromRecord(item),
    });
    setIsEditing(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta plaqueta?")) {
      await deletePlaqueta(id);
      loadPlaquetas();
    }
  };

  const openImageViewer = (item) => {
    const imgs = getImagesFromRecord(item);
    if (imgs.length === 0) return;
    setViewerImages(imgs.map((img) => ({ src: img })));
    setActiveIndex(0);
    setViewerVisible(true);
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-7xl mx-auto relative">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* HEADER */}
        {/* BARRA DE CARGA LINEAL */}

        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          {isLoading && (
            <div className="h-full bg-emerald-500 animate-progress-buffer origin-left"></div>
          )}
        </div>

        <div className="bg-[#1E3A8A] p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Hash /> Control de Equipos
          </h2>
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:text-slate-800 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          {/* FORMULARIO CREAR */}
          <form
            onSubmit={handleSubmitCreate}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100"
          >
            <input
              placeholder="N° Plaqueta"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.plaqueta}
              onChange={(e) =>
                setFormData({ ...formData, plaqueta: e.target.value })
              }
              required
            />
            <input
              placeholder="Máquina"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.maquina}
              onChange={(e) =>
                setFormData({ ...formData, maquina: e.target.value })
              }
              required
            />
            <input
              placeholder="Observación"
              className="p-3 rounded-xl border border-slate-200 text-sm text-emerald-700 font-bold"
              value={formData.observacion}
              onChange={(e) =>
                setFormData({ ...formData, observacion: e.target.value })
              }
            />
            <input
              placeholder="Marca"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
            />
            <input
              placeholder="Modelo"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.modelo}
              onChange={(e) =>
                setFormData({ ...formData, modelo: e.target.value })
              }
            />

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white text-sm ${formData.imagenes.length > 0 ? "bg-emerald-600" : "bg-[#1E3A8A]"}`}
            >
              <ImageIcon size={18} />{" "}
              {formData.imagenes.length > 0
                ? `${formData.imagenes.length} Foto(s)`
                : "Fotos"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="lg:col-span-6 w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-bold uppercase flex justify-center items-center gap-2 hover:bg-black transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Plus size={18} /> Agregar Registro
                </>
              )}
            </button>
          </form>

          {/* TABLA */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-[#64748B] text-[10px] uppercase font-black border-b border-slate-100">
                  <th className="py-4 px-6">Plaqueta</th>
                  <th className="py-4 px-6">Equipo</th>
                  <th className="py-4 px-6">Observación</th>
                  <th className="py-4 px-6 text-center">Fotos</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  // 1. ESTADO: CARGANDO (Mientras espera al servidor)
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#1E3A8A]" size={40} />
                        <p className="text-slate-500 font-medium animate-pulse">
                          Buscando en la base de datos...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : plaquetas.length > 0 ? (
                  // 2. ESTADO: CON RESULTADOS (Renderiza lo que llega del backend)
                  plaquetas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="py-4 px-6 font-bold">{item.plaqueta}</td>
                      <td className="py-4 px-6 text-xs uppercase font-bold text-slate-500">
                        {item.maquina}{" "}
                        <span className="block text-[10px] font-normal">
                          {item.marca} / {item.modelo}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-emerald-600">
                        {item.observacion}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openImageViewer(item)}
                          className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <ImageIcon size={16} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 3. ESTADO: SIN RESULTADOS (Cuando el array vuelve vacío)
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-slate-100 p-4 rounded-full text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-500 font-bold tracking-tight">
                          No se encontraron coincidencias
                        </p>
                        <p className="text-slate-400 text-xs">
                          Intenta con otro término o verifica la ortografía
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 text-[#1E3A8A] text-xs font-black uppercase border-b-2 border-[#1E3A8A] pb-1 hover:text-black hover:border-black transition-all"
                          >
                            Limpiar búsqueda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 gap-4">
            <div className="text-sm text-slate-500 font-medium order-2 md:order-1">
              Página <span className="text-[#1E3A8A] font-bold">{currentPage}</span> de <span className="text-[#1E3A8A] font-bold">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2 order-1 md:order-2">
              {/* IR A LA PRIMERA PÁGINA */}
              <button
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage(1)}
                className="p-2 text-sm font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all text-[#1E3A8A]"
                title="Primera página"
              >
                <ChevronFirst size={20} />
              </button>
          
              <button
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                Anterior
              </button>
          
              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 text-sm font-bold bg-[#1E3A8A] text-white rounded-xl hover:bg-black disabled:opacity-40 transition-all"
              >
                Siguiente
              </button>
          
              {/* IR A LA ÚLTIMA PÁGINA */}
              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 text-sm font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all text-[#1E3A8A]"
                title="Última página"
              >
                <ChevronLast size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL IMÁGENES (CREACIÓN) */}
      {showImageModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-black uppercase flex items-center gap-2">
                <Upload /> Gestionar Fotos
              </h3>
              <button onClick={() => setShowImageModal(false)}>
                <X />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {formData.imagenes.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square border rounded-lg overflow-hidden"
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        imagenes: formData.imagenes.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {formData.imagenes.length < 4 && (
                <label className="border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer aspect-square text-slate-300">
                  <Plus />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleFileRead(e, formData.imagenes, setFormData)
                    }
                  />
                </label>
              )}
            </div>
            <button
              onClick={() => setShowImageModal(false)}
              className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN CON GESTIÓN DE IMÁGENES */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#1E3A8A] p-5 text-white flex justify-between items-center">
              <h3 className="font-black text-lg uppercase flex items-center gap-2">
                <Pencil size={20} /> Editar Plaqueta
              </h3>
              <button onClick={() => setIsEditing(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-slate-400 uppercase">
                  Número de Plaqueta
                </label>
                <input
                  className="p-3 rounded-xl border border-slate-200 text-sm bg-slate-50"
                  value={editData.plaqueta}
                  onChange={(e) =>
                    setEditData({ ...editData, plaqueta: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase">
                    Máquina
                  </label>
                  <input
                    className="p-3 rounded-xl border border-slate-200 text-sm"
                    value={editData.maquina}
                    onChange={(e) =>
                      setEditData({ ...editData, maquina: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase">
                    Observación
                  </label>
                  <input
                    className="p-3 rounded-xl border border-emerald-200 text-sm text-emerald-700 font-bold"
                    value={editData.observacion}
                    onChange={(e) =>
                      setEditData({ ...editData, observacion: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* SECCIÓN DE IMÁGENES EN EDICIÓN */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-black text-slate-400 uppercase">
                  Imágenes del Equipo (Máx 4)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {editData.imagenes.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt="edit-preview"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditData({
                            ...editData,
                            imagenes: editData.imagenes.filter(
                              (_, i) => i !== idx,
                            ),
                          })
                        }
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:scale-110 transition-transform"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {editData.imagenes.length < 4 && (
                    <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-[#1E3A8A] hover:text-[#1E3A8A] cursor-pointer transition-all">
                      <Plus size={20} />
                      <span className="text-[8px] font-bold uppercase">
                        Subir
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleFileRead(e, editData.imagenes, setEditData)
                        }
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg uppercase text-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}{" "}
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl uppercase text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Viewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        images={viewerImages}
        activeIndex={activeIndex}
      />
    </div>
  );
}

export default Plaquetas;
