// ------------------------------ ARCHIVO ANTERIOR HASTA EL 01/12 ------------------------------

import React, { useState, useEffect } from "react";
import { FileSpreadsheet, X, Search, ListFilter, Plus } from "lucide-react";
import {fetchTerceros,createTercero,updateTercero,} from "../assets/services/apiService.js";

export default function Terceros({ data, setData }) {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTercero, setEditingTercero] = useState(null);
  const [formData, setFormData] = useState({});
  const [createForm, setCreateForm] = useState({});
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState("id_tercero");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar terceros desde API
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

  // =========================
  // EDITAR
  // =========================
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
      prev.map((t) =>
        t.id_tercero === formData.id_tercero ? formData : t
      )
    );

    setShowModal(false);
    setEditingTercero(null);
    setFormData({});
  };

  // =========================
  // CREAR
  // =========================
  const openCreateForm = () => {
    const lastId =
      data.length > 0
        ? Math.max(...data.map((t) => t.id_tercero)) + 1
        : 1;

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

  // =========================
  // FILTRO + SORT + PÁGINA
  // =========================
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
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-600" /> Terceros
        </h2>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow"
        >
          <Plus size={18} /> Crear Tercero
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="w-full max-w-md relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-600 whitespace-nowrap">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-gray-100">Acción</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cédula</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Cúbica</th>
                <th className="px-4 py-3">Conductor</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row) => (
                <tr key={row.id_tercero}>
                  <td className="px-4 py-3 sticky left-0 bg-white">
                    <button
                      onClick={() => editarTercero(row.id_tercero)}
                      className="px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200"
                    >
                      Editar
                    </button>
                  </td>

                  <td className="px-4 py-3">{row.id_tercero}</td>
                  <td className="px-4 py-3">{row.cedula}</td>
                  <td className="px-4 py-3">{row.nombre}</td>
                  <td className="px-4 py-3">{row.direccion}</td>
                  <td className="px-4 py-3">{row.placa}</td>
                  <td className="px-4 py-3">{row.telefono}</td>
                  <td className="px-4 py-3">{row.cubica}</td>
                  <td className="px-4 py-3">{row.conductor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-between items-center mt-4 px-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
        >
          Primera página
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            Anterior
          </button>

          <span>Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODAL CREAR */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4">Crear nuevo tercero</h3>

            <form onSubmit={saveNewTercero} className="space-y-3">
              {Object.entries(createForm).map(([key, value]) => (
                <div key={key}>
                  <label className="text-xs font-bold">{key}</label>
                  <input
                    name={key}
                    type="text"
                    value={value}
                    onChange={handleCreateInput}
                    className="w-full px-3 py-2 border rounded"
                    readOnly={key === "id_tercero"}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Guardar Tercero
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4">Editar Tercero</h3>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              {Object.entries(formData).map(([key, value]) => (
                key !== "id_tercero" && (
                  <div key={key}>
                    <label className="text-xs font-bold">{key}</label>
                    <input
                      name={key}
                      type="text"
                      value={value}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                )
              ))}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





