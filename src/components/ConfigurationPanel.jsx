import React, { useEffect, useState } from "react";

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
     CARGAR MATERIALES Y TIPOS DE PAGO
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
     CRUD MATERIALES
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
    await deleteMaterial(id);
    cargarMateriales();
  };

  /* ============================================================
     CRUD TIPOS DE PAGO
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
    await deleteTipoPago(id);
    cargarTiposPago();
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="p-6 space-y-10">
      {/* ====================================
          MATERIALES
      ===================================== */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Materiales</h2>

        {/* FORM CREAR */}
        <form onSubmit={guardarMaterial} className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Nombre del material"
            value={nuevoMaterial.nombre_material}
            onChange={(e) =>
              setNuevoMaterial((prev) => ({
                ...prev,
                nombre_material: e.target.value,
              }))
            }
            className="border px-3 py-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Precio"
            value={nuevoMaterial.precio}
            onChange={(e) =>
              setNuevoMaterial((prev) => ({
                ...prev,
                precio: e.target.value,
              }))
            }
            className="border px-3 py-2 rounded w-full"
          />

          <button className="px-4 py-2 bg-emerald-600 text-white rounded">
            Guardar Material
          </button>
        </form>

        {/* LISTA */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Material</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => (
              <tr key={m.idMaterial} className="border-b">
                <td className="p-2">{m.idMaterial}</td>
                <td className="p-2">{m.nombre_material}</td>
                <td className="p-2">{m.precio}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setEditandoMaterial(m)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarMaterial(m.idMaterial)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL EDITAR MATERIAL */}
        {editandoMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96 space-y-3">
              <h3 className="text-lg font-bold">Editar Material</h3>

              <input
                type="text"
                value={editandoMaterial.nombre_material}
                onChange={(e) =>
                  setEditandoMaterial((prev) => ({
                    ...prev,
                    nombre_material: e.target.value,
                  }))
                }
                className="border px-3 py-2 rounded w-full"
              />

              <input
                type="number"
                value={editandoMaterial.precio}
                onChange={(e) =>
                  setEditandoMaterial((prev) => ({
                    ...prev,
                    precio: e.target.value,
                  }))
                }
                className="border px-3 py-2 rounded w-full"
              />

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setEditandoMaterial(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicionMaterial}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====================================
          TIPOS DE PAGO
      ===================================== */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Tipos de Pago</h2>

        {/* FORM CREAR */}
        <form onSubmit={guardarTipo} className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Tipo de pago"
            value={nuevoTipo.tipo_pago}
            onChange={(e) =>
              setNuevoTipo((prev) => ({
                ...prev,
                tipo_pago: e.target.value,
              }))
            }
            className="border px-3 py-2 rounded w-full"
          />

          <button className="px-4 py-2 bg-emerald-600 text-white rounded">
            Guardar Tipo
          </button>
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {tiposPago.map((t) => (
              <tr key={t.idTipoPago} className="border-b">
                <td className="p-2">{t.idTipoPago}</td>
                <td className="p-2">{t.tipo_pago}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setEditandoTipo(t)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarTipo(t.idTipoPago)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL EDITAR TIPO */}
        {editandoTipo && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96 space-y-3">
              <h3 className="text-lg font-bold">Editar Tipo de Pago</h3>

              <input
                type="text"
                value={editandoTipo.tipo_pago}
                onChange={(e) =>
                  setEditandoTipo((prev) => ({
                    ...prev,
                    tipo_pago: e.target.value,
                  }))
                }
                className="border px-3 py-2 rounded w-full"
              />

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setEditandoTipo(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicionTipo}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}







// // ------------------ ARCHIVO VIEJO ------------------


// import React, { useState, useEffect } from "react";
// import { Settings, Trash2, Plus, Edit2, Check, XCircle } from "lucide-react";
// // import { getToken } from "../services/authService";
// import { getToken } from "../assets/services/authService";


// export default function ConfigurationPanel({
//   materials,
//   setMaterials,
//   paymentTypes,
//   setPaymentTypes,
// }) {
//   const [activeSection, setActiveSection] = useState("materiales");

//   // ==========================================================
//   // Helper: construir headers con el token
//   // ==========================================================
//   const authHeaders = () => {
//     const token = getToken();
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   };

//   // ===========================
//   // GET - Cargar materiales
//   // ===========================
//   const fetchMateriales = async () => {
//     try {
//       const res = await fetch("http://192.168.150.4:8000/materiales", {
//         method: "GET",
//         headers: authHeaders(),
//       });

//       const json = await res.json();

//       if (json.status === "success") {
//         const normalized = json.data.map((m) => ({
//           idMaterial: Number(m.idMaterial),
//           nombre_material: m.nombre_material,
//           precio: Number(m.precio),
//         }));

//         setMaterials(normalized);
//       } else {
//         console.error("Error en formato de API:", json);
//       }
//     } catch (err) {
//       console.error("Error GET materiales:", err);
//     }
//   };

//   // Load materials ONLY when entering tab
//   useEffect(() => {
//     if (activeSection === "materiales") {
//       fetchMateriales();
//     }
//   }, [activeSection]);

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//         <Settings className="text-emerald-600" /> Gestión de Datos Maestros
//       </h2>

//       <div className="flex gap-4 border-b pb-1">
//         <button
//           onClick={() => setActiveSection("materiales")}
//           className={`px-4 py-2 font-medium rounded-t-lg ${
//             activeSection === "materiales"
//               ? "bg-emerald-100 text-emerald-800 border-b-2 border-emerald-600"
//               : "text-gray-500"
//           }`}
//         >
//           Materiales y Precios
//         </button>

//         <button
//           onClick={() => setActiveSection("pagos")}
//           className={`px-4 py-2 font-medium rounded-t-lg ${
//             activeSection === "pagos"
//               ? "bg-emerald-100 text-emerald-800 border-b-2 border-emerald-600"
//               : "text-gray-500"
//           }`}
//         >
//           Tipos de Pago
//         </button>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-sm border">
//         {activeSection === "materiales" ? (
//           <CrudTable
//             title="Lista de Materiales"
//             data={materials}
//             setData={setMaterials}
//             fields={[
//               { name: "nombre_material", label: "Material", type: "text" },
//               { name: "precio", label: "Precio Unitario", type: "number" },
//             ]}
//             fetchAgain={fetchMateriales}
//             isMaterialTable={true}
//             authHeaders={authHeaders}
//           />
//         ) : (
//           <CrudTable
//             title="Formas de Pago"
//             data={paymentTypes}
//             setData={setPaymentTypes}
//             fields={[{ name: "name", label: "Tipo de Pago", type: "text" }]}
//             isPaymentTable={true}
//             authHeaders={authHeaders}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// // ===============================================================
// // CRUD TABLE
// // ===============================================================

// function CrudTable({
//   title,
//   data,
//   setData,
//   fields,
//   isPaymentTable,
//   isMaterialTable,
//   fetchAgain,
//   authHeaders,
// }) {
//   const [isEditing, setIsEditing] = useState(null);
//   const [newItem, setNewItem] = useState({});
//   const [editItem, setEditItem] = useState({});

//   // =====================================================================================
//   // POST
//   // =====================================================================================
//   const handleAdd = async () => {
//     if (isMaterialTable) {
//       try {
//         const res = await fetch("http://192.168.150.4:8000/materiales", {
//           method: "POST",
//           headers: authHeaders(),
//           body: JSON.stringify({
//             nombre_material: newItem.nombre_material,
//             precio: Number(newItem.precio),
//           }),
//         });

//         const json = await res.json();

//         if (json.status === "success") {
//           await fetchAgain();
//           setNewItem({});
//         }
//       } catch (err) {
//         console.error("POST materiales:", err);
//       }
//       return;
//     }

//     if (isPaymentTable) {
//       try {
//         const res = await fetch("http://192.168.150.4:8000/tiposPago", {
//           method: "POST",
//           headers: authHeaders(),
//           body: JSON.stringify({ tipo_pago: newItem.name }),
//         });

//         const json = await res.json();

//         if (json.status === "success") {
//           setData((prev) => [
//             ...prev,
//             { id: json.data.idTipoPago, name: json.data.tipo_pago },
//           ]);
//           setNewItem({});
//         }
//       } catch (err) {
//         console.error("POST tipo pago:", err);
//       }
//     }
//   };

//   // =====================================================================================
//   // PUT
//   // =====================================================================================
//   const saveEdit = async () => {
//     if (isMaterialTable) {
//       try {
//         const res = await fetch(
//           `http://192.168.150.4:8000/materiales/${editItem.idMaterial}`,
//           {
//             method: "PUT",
//             headers: authHeaders(),
//             body: JSON.stringify({
//               idMaterial: editItem.idMaterial,
//               nombre_material: editItem.nombre_material,
//               precio: Number(editItem.precio),
//             }),
//           }
//         );

//         const json = await res.json();

//         if (json.status === "success") {
//           await fetchAgain();
//         }

//         setIsEditing(null);
//         setEditItem({});
//       } catch (err) {
//         console.error("PUT materiales:", err);
//       }
//       return;
//     }

//     // PUT Tipos Pago
//     try {
//       const res = await fetch(
//         `http://192.168.150.4:8000/tiposPago/${editItem.id}`,
//         {
//           method: "PUT",
//           headers: authHeaders(),
//           body: JSON.stringify({
//             idTipoPago: editItem.id,
//             tipo_pago: editItem.name,
//           }),
//         }
//       );

//       const json = await res.json();

//       if (json.status === "success") {
//         setData((prev) =>
//           prev.map((p) => (p.id === editItem.id ? editItem : p))
//         );
//       }

//       setIsEditing(null);
//       setEditItem({});
//     } catch (err) {
//       console.error("PUT tipo pago:", err);
//     }
//   };

//   // =====================================================================================
//   // DELETE
//   // =====================================================================================
//   const handleDelete = async (id) => {
//     const confirmar = confirm("¿Seguro que deseas eliminar este registro?");
//     if (!confirmar) return;

//     // DELETE MATERIALES
//     if (isMaterialTable) {
//       try {
//         const res = await fetch(
//           `http://192.168.150.4:8000/materiales/${id}`,
//           {
//             method: "DELETE",
//             headers: authHeaders(),
//           }
//         );

//         const json = await res.json();

//         if (json.status === "success") {
//           await fetchAgain();
//         } else {
//           alert("No se pudo eliminar el material");
//         }
//       } catch (err) {
//         console.error("DELETE materiales:", err);
//         alert("Error conectando con API");
//       }

//       return;
//     }

//     // DELETE TIPOS PAGO
//     try {
//       const res = await fetch(
//         `http://192.168.150.4:8000/tiposPago/${id}`,
//         {
//           method: "DELETE",
//           headers: authHeaders(),
//         }
//       );

//       const json = await res.json();

//       if (json.status === "success") {
//         setData((prev) => prev.filter((p) => p.id !== id));
//       }
//     } catch (err) {
//       console.error("DELETE tipo pago:", err);
//     }
//   };

//   // ===============================================================
//   // UI
//   // ===============================================================

//   return (
//     <div>
//       <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>

//       <div className="flex gap-2 mb-6 bg-gray-50 p-4 rounded-lg border items-end">
//         {fields.map((field) => (
//           <div className="flex-1" key={field.name}>
//             <label className="block text-xs">{field.label}</label>
//             <input
//               type={field.type}
//               value={newItem[field.name] ?? ""}
//               onChange={(e) =>
//                 setNewItem((prev) => ({
//                   ...prev,
//                   [field.name]: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded"
//             />
//           </div>
//         ))}

//         <button
//           onClick={handleAdd}
//           className="bg-emerald-600 text-white px-4 py-2 rounded"
//         >
//           <Plus size={18} /> Agregar
//         </button>
//       </div>

//       <table className="w-full text-sm text-left">
//         <thead>
//           <tr className="bg-gray-100">
//             {fields.map((f) => (
//               <th key={f.name} className="px-4 py-2">
//                 {f.label}
//               </th>
//             ))}
//             <th className="px-4 py-2 text-right">Acciones</th>
//           </tr>
//         </thead>

//         <tbody>
//           {data.map((item) => {
//             const id = item.idMaterial ?? item.id;

//             return (
//               <tr key={id} className="border-b">
//                 {fields.map((field) => (
//                   <td key={field.name} className="px-4 py-2">
//                     {isEditing === id ? (
//                       <input
//                         type={field.type}
//                         value={editItem[field.name] ?? ""}
//                         onChange={(e) =>
//                           setEditItem((prev) => ({
//                             ...prev,
//                             [field.name]: e.target.value,
//                           }))
//                         }
//                         className="px-2 py-1 border rounded w-full"
//                       />
//                     ) : (
//                       item[field.name]
//                     )}
//                   </td>
//                 ))}

//                 <td className="px-4 py-2 text-right flex justify-end gap-2">
//                   {isEditing === id ? (
//                     <>
//                       <button onClick={saveEdit} className="text-emerald-600">
//                         <Check size={18} />
//                       </button>

//                       <button
//                         onClick={() => {
//                           setIsEditing(null);
//                           setEditItem({});
//                         }}
//                         className="text-red-600"
//                       >
//                         <XCircle size={18} />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <button
//                         onClick={() => {
//                           setIsEditing(id);
//                           setEditItem({ ...item });
//                         }}
//                         className="text-blue-600"
//                       >
//                         <Edit2 size={18} />
//                       </button>

//                       <button
//                         onClick={() => handleDelete(id)}
//                         className="text-red-600"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }








