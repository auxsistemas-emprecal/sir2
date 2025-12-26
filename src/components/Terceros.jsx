import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  X, 
  Search, 
  Plus, 
  Pencil, 
  User, 
  Truck, 
  Phone, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { fetchTerceros, createTercero, updateTercero } from "../assets/services/apiService.js";

export default function Terceros({ data, setData }) {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTercero, setEditingTercero] = useState(null);
  const [formData, setFormData] = useState({});
  const [createForm, setCreateForm] = useState({});
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState("id_tercero");
  const [sortDirection, setSortDirection] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      const lista = await fetchTerceros();
      setData(
        lista.map((t) => ({
          ...t,
          nombre: t.nombre?.trim() || "",
        }))
      );
    })();
  }, []);

  const editarTercero = (id) => {
    const tercero = data.find((t) => t.id_tercero === id);
    if (tercero) {
      setEditingTercero(tercero);
      setFormData({ ...tercero });
      setShowModal(true);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateTercero(formData.id_tercero, formData);
    setData((prev) =>
      prev.map((t) => (t.id_tercero === formData.id_tercero ? formData : t))
    );
    setShowModal(false);
    setEditingTercero(null);
    setFormData({});
  };

  const openCreateForm = () => {
    const lastId = data.length > 0 ? Math.max(...data.map((t) => t.id_tercero)) + 1 : 1;
    setCreateForm({
      id_tercero: lastId,
      nombre: "",
      cedula: "",
      telefono: "",
      placa: "",
      cubica: "",
      conductor: "",
      direccion: "",
    });
    setShowCreateModal(true);
  };

  const handleCreateInput = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveNewTercero = async (e) => {
    e.preventDefault();
    if (!createForm.nombre || !createForm.telefono || !createForm.placa)
      return alert("Datos obligatorios incompletos.");

    const res = await createTercero(createForm);
    const nuevo = res.data ?? createForm;
    setData((prev) => [...prev, nuevo]);
    setShowCreateModal(false);
    setCreateForm({});
    setCurrentPage(1);
  };

  const filteredData = data.filter((row) => {
    const term = search.toLowerCase();
    return (
      row.nombre?.toLowerCase().includes(term) ||
      row.cedula?.toLowerCase().includes(term) ||
      row.placa?.toLowerCase().includes(term) ||
      row.conductor?.toLowerCase().includes(term) ||
      String(row.id_tercero).includes(term)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let v1 = a[sortColumn];
    let v2 = b[sortColumn];
    if (typeof v1 === "string") v1 = v1.toLowerCase();
    if (typeof v2 === "string") v2 = v2.toLowerCase();
    if (v1 < v2) return sortDirection === "asc" ? -1 : 1;
    if (v1 > v2) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER MODERNO */}
      <div className="bg-slate-900 rounded-2rem p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <UserPlus className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Gestión de Terceros</h2>
              <p className="text-emerald-400 text-sm font-medium">Directorio maestro de clientes y conductores</p>
            </div>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl hover:bg-emerald-400 transition-all hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            <Plus size={20} /> CREAR NUEVO TERCERO
          </button>
        </div>
      </div>

      {/* FILTROS Y BUSCADOR CON EFECTO DINÁMICO */}
<div className="flex flex-col md:flex-row gap-4 items-center">
  <div className="flex-1 relative group w-full">
    {/* Icono que cambia de color y escala al escribir */}
    <Search 
      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
        search ? "text-emerald-500 scale-110" : "text-slate-400 group-focus-within:text-emerald-500"
      }`} 
      size={20} 
    />
    
    <input
      type="text"
      placeholder="Buscar por nombre, cédula, placa..."
      value={search}
      onChange={(e) => { 
        setSearch(e.target.value); 
        setCurrentPage(1); 
      }}
      className={`w-full pl-12 pr-12 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium ${
        search 
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
          : "border-slate-200 shadow-sm focus:border-emerald-500"
      }`}
    />

    {/* Botón X para limpiar búsqueda que aparece solo cuando hay texto */}
    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all animate-in fade-in zoom-in duration-200"
      >
        <X size={14} />
      </button>
    )}
  </div>

  {/* Contador con efecto de pulso si hay resultados filtrados */}
  <div className={`bg-white px-6 py-4 rounded-2xl border transition-all duration-300 hidden md:block ${
    search ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
  }`}>
    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Registros: </span>
    <span className={`font-black ml-1 transition-all ${search ? "text-emerald-600 scale-110 inline-block" : "text-slate-900"}`}>
      {filteredData.length}
    </span>
  </div>
</div>

      {/* TABLA ESTILIZADA */}
      <div className="bg-white rounded-2rem shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tercero / ID</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Información Contacto</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vehículo</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Conductor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((row) => (
                <tr key={row.id_tercero} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-6 py-5">
                    <button
                      onClick={() => editarTercero(row.id_tercero)}
                      className="flex items-center gap-2 px-3 py-2 bg-white text-emerald-600 border border-emerald-100 rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-sm">{row.nombre}</span>
                        <span className="text-[10px] font-bold text-slate-400">ID: {row.id_tercero} • C.C: {row.cedula}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                        <Phone size={12} className="text-emerald-500" /> {row.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <MapPin size={12} /> {row.direccion || 'Sin dirección'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-black text-xs border border-slate-200">
                        {row.placa}
                      </span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md font-bold text-[10px]">
                        {row.cubica} m³
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase">
                      <Truck size={14} className="text-slate-300" /> {row.conductor || "N/A"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN ESTILIZADA */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-1.5rem border border-slate-100 shadow-sm">
        <span className="text-slate-500 text-sm font-medium">
          Página <span className="text-slate-900 font-black">{currentPage}</span> de <span className="text-slate-900 font-black">{totalPages}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
            title="Primera página"
          >
            <ChevronLeft size={20} className="-mr-2" /><ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-slate-600 text-sm"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-slate-600 text-sm"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODALES REFACTORIZADOS */}
      {(showCreateModal || showModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowCreateModal(false); setShowModal(false); }}
              className="absolute top-6 right-6 text-slate-400 hover:bg-red-50 hover:text-red-500 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              {showCreateModal ? <Plus className="text-emerald-500" /> : <Pencil className="text-blue-500" />}
              {showCreateModal ? "Nuevo Registro de Tercero" : "Editar Información del Tercero"}
            </h3>

            <form onSubmit={showCreateModal ? saveNewTercero : handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(showCreateModal ? createForm : formData).map(([key, value]) => (
                <div key={key} className={key === "nombre" || key === "direccion" ? "md:col-span-2" : ""}>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">{key.replace("_", " ")}</label>
                  <input
                    name={key}
                    type="text"
                    value={value}
                    onChange={showCreateModal ? handleCreateInput : handleEditInputChange}
                    readOnly={key === "id_tercero" && showCreateModal}
                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-4 focus:outline-none transition-all font-bold ${
                      key === "id_tercero" ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" : "bg-white border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500"
                    }`}
                  />
                </div>
              ))}

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                  {showCreateModal ? "Guardar Registro" : "Actualizar Información"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





// // ------------------------------ ARCHIVO ANTERIOR HASTA EL 01/12 ------------------------------

// import React, { useState, useEffect } from "react";
// import { FileSpreadsheet, X, Search, ListFilter, Plus } from "lucide-react";
// import {fetchTerceros,createTercero,updateTercero,} from "../assets/services/apiService.js";

// export default function Terceros({ data, setData }) {
//   const [showModal, setShowModal] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [editingTercero, setEditingTercero] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [createForm, setCreateForm] = useState({});
//   const [search, setSearch] = useState("");

//   const [sortColumn, setSortColumn] = useState("id_tercero");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [showSortMenu, setShowSortMenu] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Cargar terceros desde API
//   useEffect(() => {
//     (async () => {
//       const lista = await fetchTerceros();

//       setData(
//         lista.map((t) => ({
//           ...t,
//           nombre: t.nombre?.trim() || "",
//         }))
//       );
//     })();
//   }, []);

//   // =========================
//   // EDITAR
//   // =========================
//   const editarTercero = (id) => {
//     const tercero = data.find((t) => t.id_tercero === id);
//     if (tercero) {
//       setEditingTercero(tercero);
//       setFormData({ ...tercero });
//       setShowModal(true);
//     }
//   };

//   const handleEditInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     await updateTercero(formData.id_tercero, formData);

//     setData((prev) =>
//       prev.map((t) =>
//         t.id_tercero === formData.id_tercero ? formData : t
//       )
//     );

//     setShowModal(false);
//     setEditingTercero(null);
//     setFormData({});
//   };

//   // =========================
//   // CREAR
//   // =========================
//   const openCreateForm = () => {
//     const lastId =
//       data.length > 0
//         ? Math.max(...data.map((t) => t.id_tercero)) + 1
//         : 1;

//     setCreateForm({
//       id_tercero: lastId,
//       nombre: "",
//       cedula: "",
//       telefono: "",
//       placa: "",
//       cubica: "",
//       conductor: "",
//       direccion: "",
//     });

//     setShowCreateModal(true);
//   };

//   const handleCreateInput = (e) => {
//     const { name, value } = e.target;
//     setCreateForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const saveNewTercero = async (e) => {
//     e.preventDefault();

//     if (!createForm.nombre || !createForm.telefono || !createForm.placa)
//       return alert("Datos obligatorios incompletos.");

//     const res = await createTercero(createForm);
//     const nuevo = res.data ?? createForm;

//     setData((prev) => [...prev, nuevo]);
//     setShowCreateModal(false);
//     setCreateForm({});
//     setCurrentPage(1);
//   };

//   // =========================
//   // FILTRO + SORT + PÁGINA
//   // =========================
//   const filteredData = data.filter((row) => {
//     const term = search.toLowerCase();

//     return (
//       row.nombre?.toLowerCase().includes(term) ||
//       row.cedula?.toLowerCase().includes(term) ||
//       row.placa?.toLowerCase().includes(term) ||
//       row.conductor?.toLowerCase().includes(term) ||
//       String(row.id_tercero).includes(term)
//     );
//   });

//   const sortedData = [...filteredData].sort((a, b) => {
//     let v1 = a[sortColumn];
//     let v2 = b[sortColumn];

//     if (typeof v1 === "string") v1 = v1.toLowerCase();
//     if (typeof v2 === "string") v2 = v2.toLowerCase();

//     if (v1 < v2) return sortDirection === "asc" ? -1 : 1;
//     if (v1 > v2) return sortDirection === "asc" ? 1 : -1;
//     return 0;
//   });

//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);
//   const paginatedData = sortedData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // =========================
//   // RENDER
//   // =========================
//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//           <FileSpreadsheet className="text-emerald-600" /> Terceros
//         </h2>

//         <button
//           onClick={openCreateForm}
//           className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow"
//         >
//           <Plus size={18} /> Crear Tercero
//         </button>
//       </div>

//       {/* BUSCADOR */}
//       <div className="w-full max-w-md relative">
//         <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//         <input
//           type="text"
//           placeholder="Buscar..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
//         />
//       </div>

//       {/* TABLA */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-xs text-left text-gray-600 whitespace-nowrap">
//             <thead className="text-xs text-gray-700 uppercase bg-gray-100">
//               <tr>
//                 <th className="px-4 py-3 sticky left-0 bg-gray-100">Acción</th>
//                 <th className="px-4 py-3">ID</th>
//                 <th className="px-4 py-3">Cédula</th>
//                 <th className="px-4 py-3">Nombre</th>
//                 <th className="px-4 py-3">Dirección</th>
//                 <th className="px-4 py-3">Placa</th>
//                 <th className="px-4 py-3">Teléfono</th>
//                 <th className="px-4 py-3">Cúbica</th>
//                 <th className="px-4 py-3">Conductor</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-200">
//               {paginatedData.map((row) => (
//                 <tr key={row.id_tercero}>
//                   <td className="px-4 py-3 sticky left-0 bg-white">
//                     <button
//                       onClick={() => editarTercero(row.id_tercero)}
//                       className="px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200"
//                     >
//                       Editar
//                     </button>
//                   </td>

//                   <td className="px-4 py-3">{row.id_tercero}</td>
//                   <td className="px-4 py-3">{row.cedula}</td>
//                   <td className="px-4 py-3">{row.nombre}</td>
//                   <td className="px-4 py-3">{row.direccion}</td>
//                   <td className="px-4 py-3">{row.placa}</td>
//                   <td className="px-4 py-3">{row.telefono}</td>
//                   <td className="px-4 py-3">{row.cubica}</td>
//                   <td className="px-4 py-3">{row.conductor}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* PAGINACIÓN */}
//       <div className="flex justify-between items-center mt-4 px-2">
//         <button
//           onClick={() => setCurrentPage(1)}
//           disabled={currentPage === 1}
//           className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
//         >
//           Primera página
//         </button>

//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
//           >
//             Anterior
//           </button>

//           <span>Página {currentPage} de {totalPages}</span>

//           <button
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
//           >
//             Siguiente
//           </button>
//         </div>
//       </div>

//       {/* MODAL CREAR */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
//             <button
//               onClick={() => setShowCreateModal(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
//             >
//               <X size={20} />
//             </button>

//             <h3 className="text-xl font-bold mb-4">Crear nuevo tercero</h3>

//             <form onSubmit={saveNewTercero} className="space-y-3">
//               {Object.entries(createForm).map(([key, value]) => (
//                 <div key={key}>
//                   <label className="text-xs font-bold">{key}</label>
//                   <input
//                     name={key}
//                     type="text"
//                     value={value}
//                     onChange={handleCreateInput}
//                     className="w-full px-3 py-2 border rounded"
//                     readOnly={key === "id_tercero"}
//                   />
//                 </div>
//               ))}

//               <button
//                 type="submit"
//                 className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
//               >
//                 Guardar Tercero
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL EDITAR */}
//       {showModal && (
//         <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-50 flex justify-center items-center p-4">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
//             >
//               <X size={20} />
//             </button>

//             <h3 className="text-xl font-bold mb-4">Editar Tercero</h3>

//             <form onSubmit={handleEditSubmit} className="space-y-3">
//               {Object.entries(formData).map(([key, value]) => (
//                 key !== "id_tercero" && (
//                   <div key={key}>
//                     <label className="text-xs font-bold">{key}</label>
//                     <input
//                       name={key}
//                       type="text"
//                       value={value}
//                       onChange={handleEditInputChange}
//                       className="w-full px-3 py-2 border rounded"
//                     />
//                   </div>
//                 )
//               ))}

//               <button
//                 type="submit"
//                 className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
//               >
//                 Guardar Cambios
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }