// // ======================= App.jsx (Código COMPLETO con Edición) =======================

import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "./index.css";

// Componentes
import Sidebar from "./components/Sidebar.jsx";
import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
import Terceros from "./components/terceros.jsx";
import PreciosEspeciales from "./components/PreciosEspeciales.jsx";
import AnticipoRegister from "./components/AnticipoRegister.jsx";
// import AnticiposArchived from "./components/AnticiposArchived.jsx";
import HistorialAnticipos from "./components/HistorialAnticipos.jsx";
import AuthForm from "./components/AuthForm.jsx";

import MovimientosPage from "./components/MovimientosPage.jsx";

// Servicios
import { getToken, logoutUser } from "./assets/services/authService.js";

// 🔥 Importación de API centralizada:
import {
  fetchTiposPago,
  fetchTerceros,
  fetchMateriales,
  fetchPlacas,
  fetchMovimientos,
  createMovimiento,
  createMovimientoItem,
  fetchPreciosEspeciales,
  createPago,
  fetchLastRemisionNumber,
  fetchMovimientoItemsByRemision,// 🆕 Importado para edición
} from "./assets/services/apiService.js";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [movements, setMovements] = useState([]);
  const [anticipos, setAnticipos] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [preciosEspeciales, setPreciosEspeciales] = useState([]);

  // 🆕 ESTADOS PARA LA EDICIÓN
  const [editingMovement, setEditingMovement] = useState(null);
  const [editingItems, setEditingItems] = useState([]);

  // 🆕 Función centralizada para cargar movimientos
  const loadMovimientos = async () => {
    try {
      const data = await fetchMovimientos();
      setMovements(data);
    } catch (error) {
      console.error("Fallo al cargar movimientos:", error);
    }
  };

  // =======================================================
  // 🟢 COMPORTAMIENTO: Persistencia de Sesión
  // =======================================================
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  // ================================
  // CARGA GLOBAL DE CATÁLOGOS Y MOVIMIENTOS
  // ================================
  useEffect(() => {
    // Solo cargamos datos si el usuario está autenticado
    if (!isAuthenticated) return;

    (async () => {
      try {
        const tp = await fetchTiposPago();
        const ter = await fetchTerceros();
        const mat = await fetchMateriales();
        const pla = await fetchPlacas();
        const preEs = await fetchPreciosEspeciales();

        // Cargar movimientos al inicio
        await loadMovimientos();
        // const ant = await fetchAnticipos();

        setPaymentTypes(tp);
        setTerceros(ter);
        setMaterials(mat);
        setPreciosEspeciales(preEs);
        // setAnticipos(ant);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    })();
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("inicio");
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  // ==================================================
  // 🟢 FUNCIÓN DE EDICIÓN: Carga de Datos y Redirección
  // ==================================================
  const startEditing = async (movementHeader) => {
    try {
      // 1. Guardar la cabecera del movimiento en edición
      setEditingMovement(movementHeader);

      // 2. Obtener los ítems asociados a esa remisión
      const itemsData = await fetchMovimientoItemsByRemision(
        movementHeader.remision
      );
      setEditingItems(itemsData);

      // console.log(
      //   `Cargando remisión ${movementHeader.remision} para edición...`,
      //   { header: movementHeader, items: itemsData }
      // );

      // 3. Cambiar la pestaña activa al generador de remisiones
      setActiveTab("generador");
    } catch (error) {
      console.error("Error al cargar datos para edición:", error);
      alert("Hubo un error al cargar los detalles de la remisión.");
    }
  };

  // ==================================================
  // 🟢 FUNCIÓN DE CREACIÓN/GUARDADO (Mantenida)
  // ==================================================
  const addMovement = async (headerData, itemsList) => {
    try {
      console.log("1. Guardando Cabecera...", headerData);

      // PASO A: Crear la cabecera (/movimientos)
      const responseHeader = await createMovimiento(headerData);

      // const remisionCreada =
      //   responseHeader.remision || responseHeader.data?.remision;
      // if (!remisionCreada) {
      //   throw new Error(
      //     "No se pudo obtener el número de remisión de la respuesta del servidor."
      //   );
      // }
      const remisionCreada = await fetchLastRemisionNumber();
      console.log("2. Cabecera creada. Remisión ID:", remisionCreada.data[0].remision);

      // PASO B: Recorrer los materiales y guardarlos uno por uno (/movimientoItems)
      for (const item of itemsList) {
        const payloadItem = {
          remision: remisionCreada.data[0].remision,
          idMaterial: parseInt(item.idMaterial),
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario),
          subtotal: Number(item.cantidad) * Number(item.precioUnitario),
          iva: 0,
          retencion: 0,
          total: Number(item.cantidad) * Number(item.precioUnitario),
        };

        await createMovimientoItem(payloadItem);
      }

      console.log("3. Todos los items guardados correctamente.");

      // PASO C: Recargar todo para que MovimientosPage se actualice
      await loadMovimientos();

      return responseHeader;
    } catch (error) {
      console.error("Error en la secuencia de guardado:", error);
      throw error;
    }
  };
  // --------------------- Fin addMovement ---------------------

  const addAnticipo = async (newAnticipo) => {
    // setAnticipos((prev) => [newAnticipo, ...prev]);
    console.log(newAnticipo);
    await createPago(newAnticipo);
  };

  const toggleCancelado = (id) => {
    setMovements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, cancelado: !m.cancelado } : m))
    );
  };

  if (!isAuthenticated) {
    // Si no está autenticado, muestra el Login
    return <AuthForm onLogin={handleLoginSuccess} />;
  }

  // ==================================================
  // 🟢 RENDERIZADO PRINCIPAL
  // ==================================================
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto relative w-full">
        <header className="bg-white shadow-sm p-4 flex items-center lg:hidden sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-700 mr-4"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-emerald-700">
            Sistema Contable
          </h1>
        </header>

        <div className="p-6">
          {activeTab === "generador" && (
            <InvoiceGenerator
              materials={materials}
              paymentTypes={paymentTypes}
              onSave={addMovement}
              setMaterials={setMaterials}
              editingMovement={editingMovement} // 🆕 Datos de cabecera para edición
              editingItems={editingItems} // 🆕 Datos de ítems para edición
              onEditCancel={() => {
                setEditingMovement(null);
                setEditingItems([]);
                setActiveTab("movimientos");
              }} // 🆕 Limpiar estado
            />
          )}

          {activeTab === "anticipo" && (
            <AnticipoRegister
              terceros={terceros}
              paymentTypes={paymentTypes}
              onSaveAnticipo={addAnticipo}
            />
          )}

          {activeTab === "movimientos" && (
            <MovimientosPage
              data={movements}
              onRefresh={loadMovimientos}
              onEdit={startEditing}
              // 🆕 Pasar la función para iniciar la edición
            />
          )}

          {activeTab === "archivedAnticipos" && <HistorialAnticipos />}

          {activeTab === "terceros" && (
            <Terceros data={terceros} setData={setTerceros} />
          )}

          {activeTab === "config" && (
            <ConfigurationPanel
              materials={materials}
              setMaterials={setMaterials}
              paymentTypes={paymentTypes}
              setPaymentTypes={setPaymentTypes}
            />
          )}

          {activeTab === "PreciosEspeciales" && (
            <PreciosEspeciales
              data={preciosEspeciales}
              setData={setPreciosEspeciales}
            />
          )}
        </div>
      </main>
    </div>
  );
}


// //========================11/12/25 ____ 10/00 =========================
// // ======================= App.jsx (MODIFICADO) =======================

// import React, { useState, useEffect } from "react";
// import { Menu } from "lucide-react";
// import "./index.css";

// // Componentes: Añadimos la extensión .jsx
// import Sidebar from "./components/Sidebar.jsx";
// import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
// import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
// import Terceros from "./components/terceros.jsx";
// import PreciosEspeciales from "./components/PreciosEspeciales.jsx";
// import AnticipoRegister from "./components/AnticipoRegister.jsx";
// import AnticiposArchived from "./components/AnticiposArchived.jsx";
// import AuthForm from "./components/AuthForm.jsx";

// import MovimientosPage from "./components/MovimientosPage.jsx";
// // Servicios: Añadimos la extensión .js
// import { getToken, logoutUser } from "./assets/services/authService.js";

// // 🔥 Importación de API centralizada:
// import {
//   fetchTiposPago,
//   fetchTerceros,
//   fetchMateriales,
//   fetchPlacas,
//   fetchMovimientos,
//   createMovimiento,
//   createMovimientoItem,
//   fetchPreciosEspeciales,

//   // fetchMovimientoItemsByRemision

//   // fetchAnticipos
// } from "./assets/services/apiService.js";

// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("inicio");

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const [materials, setMaterials] = useState([]);
//   const [paymentTypes, setPaymentTypes] = useState([]);
//   const [movements, setMovements] = useState([]);
//   const [anticipos, setAnticipos] = useState([]);
//   const [terceros, setTerceros] = useState([]);
//   const [preciosEspeciales, setPreciosEspeciales] = useState([]);

// // 🆕 ESTADOS PARA LA EDICIÓN
//   const [editingMovement, setEditingMovement] = useState(null);
//   const [editingItems, setEditingItems] = useState([]);

//   // 🆕 Función centralizada para cargar movimientos
//   const loadMovimientos = async () => {
//     try {
//         const data = await fetchMovimientos();
//         setMovements(data);
//     } catch (error) {
//         console.error("Fallo al cargar movimientos:", error);
//     }
//   };

//   // =======================================================
//   // 🟢 COMPORTAMIENTO: Persistencia de Sesión (Solución 2)
//   // =======================================================
//   useEffect(() => {
//     const token = getToken();
//     setIsAuthenticated(!!token);
//   }, []);

//   // ================================
//   // CARGA GLOBAL DE CATÁLOGOS Y MOVIMIENTOS
//   // ================================
//   useEffect(() => {
//     // Solo cargamos datos si el usuario está autenticado
//     if (!isAuthenticated) return;

//     (async () => {
//       const tp = await fetchTiposPago();
//       const ter = await fetchTerceros();
//       const mat = await fetchMateriales();
//       const pla = await fetchPlacas();
//       const preEs = await fetchPreciosEspeciales()

//       // 🛑 3. Cargar movimientos al inicio
//       await loadMovimientos();
//       // const ant = await fetchAnticipos();

//       setPaymentTypes(tp);
//       setTerceros(ter);
//       setMaterials(mat);
//       setPreciosEspeciales(preEs)
//       // setAnticipos(ant);
//     })();
//   }, [isAuthenticated]);

//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true);
//     setActiveTab("inicio");
//   };

//   const handleLogout = () => {
//     logoutUser();
//     setIsAuthenticated(false);
//   };

//   // 🛑 2. Función addMovement modificada para usar la API y recargar
// // Ahora recibe la cabecera (headerData) y la lista de items (itemsList)
// const addMovement = async (headerData, itemsList) => {
//     try {
//         console.log("1. Guardando Cabecera...", headerData);

//         // PASO A: Crear la cabecera (/movimientos)
//         const responseHeader = await createMovimiento(headerData);

//         const remisionCreada = responseHeader.remision || responseHeader.data?.remision || headerData.remision;
//         // const remisionCreada = responseHeader.remision || responseHeader.data?.remision;
//         if (!remisionCreada) {
//             throw new Error("No se pudo obtener el número de remisión de la respuesta del servidor.");
//         }

//         console.log("2. Cabecera creada. Remisión ID:", remisionCreada);

//         // PASO B: Recorrer los materiales y guardarlos uno por uno (/movimientoItems)
//         // (Esta sección usa `createMovimientoItem` de apiService)
//         for (const item of itemsList) {
//             const payloadItem = {
//                 remision: parseInt(remisionCreada),
//                 idMaterial: parseInt(item.idMaterial),
//                 cantidad: Number(item.cantidad),
//                 precioUnitario: Number(item.precioUnitario),
//                 subtotal: Number(item.cantidad) * Number(item.precioUnitario),
//                 iva: 0,
//                 retencion: 0,
//                 total: Number(item.cantidad) * Number(item.precioUnitario)
//             };

//             // Asegúrate de que createMovimientoItem esté disponible en apiService.js (Paso 1)
//             await createMovimientoItem(payloadItem);
//         }

//         console.log("3. Todos los items guardados correctamente.");

//         // PASO C: Recargar todo para que MovimientosPage se actualice
//         await loadMovimientos();

//         return responseHeader;
//     } catch (error) {
//         console.error("Error en la secuencia de guardado:", error);
//         throw error;
//     }
// };

// // ---------------------function addmovement anterior a la que esta arriba 10/12---------------------

//   // // 🛑 2. Función addMovement modificada para usar la API y recargar
//   // const addMovement = async (newMovementData) => {
//   //   try {
//   //       // Llama a la API para crear el movimiento
//   //       const createdMovement = await createMovimiento(newMovementData); //

//   //       // Recarga toda la lista de movimientos para que aparezca el nuevo
//   //       await loadMovimientos();

//   //       return createdMovement; // Retorna el objeto creado
//   //   } catch (error) {
//   //       console.error("Error al guardar el movimiento en App.jsx:", error);
//   //       throw error; // Propaga el error para que InvoiceGenerator lo maneje
//   //   }
//   // };

//   const addAnticipo = (newAnticipo) =>
//     setAnticipos((prev) => [newAnticipo, ...prev]);

//   const toggleCancelado = (id) => {
//     setMovements((prev) =>
//       prev.map((m) => (m.id === id ? { ...m, cancelado: !m.cancelado } : m))
//     );
//   };

//   if (!isAuthenticated) {
//     // Si no está autenticado, muestra el Login
//     return <AuthForm onLogin={handleLoginSuccess} />;
//   }

//   // Si está autenticado, muestra el contenido principal
//   return (
//     <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">
//       <Sidebar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         onLogout={handleLogout}
//       />

//       <main className="flex-1 overflow-y-auto relative w-full">
//         <header className="bg-white shadow-sm p-4 flex items-center lg:hidden sticky top-0 z-40">
//           <button
//             onClick={() => setIsSidebarOpen(true)}
//             className="text-gray-700 mr-4"
//           >
//             <Menu size={24} />
//           </button>
//           <h1 className="text-lg font-semibold text-emerald-700">
//             Sistema Contable
//           </h1>
//         </header>

//         <div className="p-6">
//           {activeTab === "generador" && (
//             <InvoiceGenerator
//               materials={materials}
//               paymentTypes={paymentTypes}
//               onSave={addMovement} // Usa la función modificada
//               setMaterials={setMaterials}
//             />
//           )}

//           {activeTab === "anticipo" && (
//             <AnticipoRegister
//               terceros={terceros}
//               paymentTypes={paymentTypes}
//               onSaveAnticipo={addAnticipo}
//             />
//           )}
//           {/* // DESPUÉS (Usa el componente correctamente) */}
//           {activeTab === "movimientos" && (
//             <MovimientosPage
//             data={movements}
//             onRefresh={loadMovimientos}
//              changeTab={setActiveTab} // Función para refrescar si es necesario
//              // **Nota:** No veo donde usas 'toggleCancelado', lo elimino por claridad.
//             />
//           )}

//           {/* {activeTab === "movimientos" && (
//             // 🛑 4. Pasar los datos y la función de recarga a MovimientosPage
//             <MovimientosPage
//                 changeTab={setActiveTab}
//                 data={movements}
//                 onRefresh={loadMovimientos}
//             />
//           )} */}

//           {activeTab === "archivedAnticipos" && (
//             <AnticiposArchived data={anticipos} />
//           )}

//           {activeTab === "terceros" && (
//             <Terceros data={terceros} setData={setTerceros} />
//           )}

//           {activeTab === "config" && (
//             <ConfigurationPanel
//               materials={materials}
//               setMaterials={setMaterials}
//               paymentTypes={paymentTypes}
//               setPaymentTypes={setPaymentTypes}
//             />
//           )}

//           {activeTab === "PreciosEspeciales" && (
//             <PreciosEspeciales data={preciosEspeciales} setData={setPreciosEspeciales} />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// // ======================= App.jsx 09/12 =======================

// import React, { useState, useEffect } from "react";
// import { Menu } from "lucide-react";
// import "./index.css"; // Dejamos el CSS sin extensión, el compilador debe manejarlo

// // Componentes: Añadimos la extensión .jsx
// import Sidebar from "./components/Sidebar.jsx";
// import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
// import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
// // import Movimientos from "./components/Movimientos.jsx";
// import Terceros from "./components/terceros.jsx";
// import PreciosEspeciales from "./components/PreciosEspeciales.jsx";
// import AnticipoRegister from "./components/AnticipoRegister.jsx";
// import AnticiposArchived from "./components/AnticiposArchived.jsx";
// import AuthForm from "./components/AuthForm.jsx";

// import MovimientosPage from "./components/MovimientosPage.jsx";
// // Servicios: Añadimos la extensión .js
// import { getToken, logoutUser } from "./assets/services/authService.js";

// // 🔥 Importación de API centralizada: Añadimos la extensión .js
// import {
//   fetchTiposPago,
//   fetchTerceros,
//   fetchMateriales,
//   fetchPlacas,
//   fetchMovimientos,
//   createMovimiento,
//   fetchPreciosEspeciales,
//   // fetchAnticipos
// } from "./assets/services/apiService.js";

// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("inicio");

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const [materials, setMaterials] = useState([]);
//   const [paymentTypes, setPaymentTypes] = useState([]);
//   const [movements, setMovements] = useState([]);
//   const [anticipos, setAnticipos] = useState([]);
//   const [terceros, setTerceros] = useState([]);
//   const [preciosEspeciales, setPreciosEspeciales] = useState([]);

//   // =======================================================
//   // 🟢 COMPORTAMIENTO: Persistencia de Sesión (Solución 2)
//   // Si hay un token en localStorage, el usuario está autenticado.
//   // =======================================================
//   useEffect(() => {
//     const token = getToken();
//     setIsAuthenticated(!!token);
//   }, []);

//   // ================================
//   // CARGA GLOBAL DE CATÁLOGOS
//   // ================================
//   useEffect(() => {
//     // Solo cargamos datos si el usuario está autenticado
//     if (!isAuthenticated) return;

//     (async () => {
//       const tp = await fetchTiposPago();
//       const ter = await fetchTerceros();
//       const mat = await fetchMateriales();
//       const pla = await fetchPlacas();
//       const preEs = await fetchPreciosEspeciales()
//       // const ant = await fetchAnticipos();

//       setPaymentTypes(tp);
//       setTerceros(ter);
//       setMaterials(mat);
//       setPreciosEspeciales(preEs)
//       // setAnticipos(ant);
//     })();
//   }, [isAuthenticated]);

//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true);
//     setActiveTab("inicio");
//   };

//   const handleLogout = () => {
//     logoutUser();
//     setIsAuthenticated(false);
//   };

//   const addMovement = (newInvoice) =>
//     setMovements((prev) => [newInvoice, ...prev]);

//   const addAnticipo = (newAnticipo) =>
//     setAnticipos((prev) => [newAnticipo, ...prev]);

//   const toggleCancelado = (id) => {
//     setMovements((prev) =>
//       prev.map((m) => (m.id === id ? { ...m, cancelado: !m.cancelado } : m))
//     );
//   };

//   if (!isAuthenticated) {
//     // Si no está autenticado, muestra el Login
//     return <AuthForm onLogin={handleLoginSuccess} />;
//   }

//   // Si está autenticado, muestra el contenido principal
//   return (
//     <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">
//       <Sidebar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         onLogout={handleLogout}
//       />

//       <main className="flex-1 overflow-y-auto relative w-full">
//         <header className="bg-white shadow-sm p-4 flex items-center lg:hidden sticky top-0 z-40">
//           <button
//             onClick={() => setIsSidebarOpen(true)}
//             className="text-gray-700 mr-4"
//           >
//             <Menu size={24} />
//           </button>
//           <h1 className="text-lg font-semibold text-emerald-700">
//             Sistema Contable
//           </h1>
//         </header>

//         <div className="p-6">
//           {activeTab === "generador" && (
//             <InvoiceGenerator
//               materials={materials}
//               paymentTypes={paymentTypes}
//               onSave={addMovement}
//             />
//           )}

//           {activeTab === "anticipo" && (
//             <AnticipoRegister
//               terceros={terceros}
//               paymentTypes={paymentTypes}
//               onSaveAnticipo={addAnticipo}
//             />
//           )}

//           {activeTab === "movimientos" && (
//             // <Movimientos data={movements} toggleCancelado={toggleCancelado} />
//             <MovimientosPage />
//           )}

//           {activeTab === "archivedAnticipos" && (
//             <AnticiposArchived data={anticipos} />
//           )}

//           {activeTab === "terceros" && (
//             <Terceros data={terceros} setData={setTerceros} />
//           )}

//           {activeTab === "config" && (
//             <ConfigurationPanel
//               materials={materials}
//               setMaterials={setMaterials}
//               paymentTypes={paymentTypes}
//               setPaymentTypes={setPaymentTypes}
//             />
//           )}

//           {activeTab === "PreciosEspeciales" && (
//             <PreciosEspeciales data={preciosEspeciales} setData={setPreciosEspeciales} />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// // ======================= App.jsx =======================

// import React, { useState, useEffect } from "react";
// import { Menu } from "lucide-react";
// import "./index.css";

// import Sidebar from "./components/Sidebar";
// import InvoiceGenerator from "./components/InvoiceGenerator";
// import ConfigurationPanel from "./components/ConfigurationPanel";
// import Movimientos from "./components/Movimientos";
// import Terceros from "./components/terceros";
// import AnticipoRegister from "./components/AnticipoRegister";
// import AnticiposArchived from "./components/AnticiposArchived";
// import AuthForm from "./components/AuthForm";

// import { getToken, logoutUser } from "./assets/services/authService";

// // 🔥 Importación de API centralizada
// import {
//   fetchTiposPago,
//   fetchTerceros,
//   fetchMateriales,
//   fetchPlacas,
//   // fetchAnticipos
// } from "./assets/services/apiService";

// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("inicio");

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const [materials, setMaterials] = useState([]);
//   const [paymentTypes, setPaymentTypes] = useState([]);
//   const [movements, setMovements] = useState([]);
//   const [anticipos, setAnticipos] = useState([]);
//   const [terceros, setTerceros] = useState([]);

//   useEffect(() => {
//     const token = getToken();
//     setIsAuthenticated(!!token);
//   }, []);

//   // ================================
//   // CARGA GLOBAL DE CATÁLOGOS
//   // ================================
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     (async () => {
//       const tp = await fetchTiposPago();
//       const ter = await fetchTerceros();
//       const mat = await fetchMateriales();
//       const pla = await fetchPlacas();
//       // const ant = await fetchAnticipos();

//       setPaymentTypes(tp);
//       setTerceros(ter);
//       setMaterials(mat);
//       // setAnticipos(ant);
//     })();
//   }, [isAuthenticated]);

//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true);
//     setActiveTab("inicio");
//   };

//   const handleLogout = () => {
//     logoutUser();
//     setIsAuthenticated(false);
//   };

//   const addMovement = (newInvoice) =>
//     setMovements((prev) => [newInvoice, ...prev]);

//   const addAnticipo = (newAnticipo) =>
//     setAnticipos((prev) => [newAnticipo, ...prev]);

//   const toggleCancelado = (id) => {
//     setMovements((prev) =>
//       prev.map((m) =>
//         m.id === id ? { ...m, cancelado: !m.cancelado } : m
//       )
//     );
//   };

//   if (!isAuthenticated) {
//     return <AuthForm onLogin={handleLoginSuccess} />;
//   }

//   return (
//     <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">

//       <Sidebar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         onLogout={handleLogout}
//       />

//       <main className="flex-1 overflow-y-auto relative w-full">
//         <header className="bg-white shadow-sm p-4 flex items-center lg:hidden sticky top-0 z-40">
//           <button onClick={() => setIsSidebarOpen(true)} className="text-gray-700 mr-4">
//             <Menu size={24} />
//           </button>
//           <h1 className="text-lg font-semibold text-emerald-700">Sistema Contable</h1>
//         </header>

//         <div className="p-6">
//           {activeTab === "generador" && (
//             <InvoiceGenerator
//               materials={materials}
//               paymentTypes={paymentTypes}
//               onSave={addMovement}
//             />
//           )}

//           {activeTab === "anticipo" && (
//             <AnticipoRegister
//               terceros={terceros}
//               paymentTypes={paymentTypes}
//               onSaveAnticipo={addAnticipo}
//             />
//           )}

//           {activeTab === "movimientos" && (
//             <Movimientos data={movements} toggleCancelado={toggleCancelado} />
//           )}

//           {activeTab === "archivedAnticipos" && (
//             <AnticiposArchived data={anticipos} />
//           )}

//           {activeTab === "terceros" && (
//             <Terceros data={terceros} setData={setTerceros} />
//           )}

//           {activeTab === "config" && (
//             <ConfigurationPanel materials={materials} setMaterials={setMaterials} paymentTypes={paymentTypes} setPaymentTypes={setPaymentTypes} />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// ------------------ CÓDIGO anterior 01/12-------------------

// import React, { useState, useEffect } from "react";
// import { Menu } from "lucide-react";
// import "./index.css";

// // COMPONENTES
// import Sidebar from "./components/Sidebar";
// import InvoiceGenerator from "./components/InvoiceGenerator";
// import ConfigurationPanel from "./components/ConfigurationPanel";
// import Movimientos from "./components/Movimientos";
// import Terceros from "./components/terceros";
// import AnticipoRegister from "./components/AnticipoRegister";
// import AnticiposArchived from "./components/AnticiposArchived";
// import AuthForm from "./components/AuthForm";
// // import { getToken, logoutUser } from "./services/authService";
// import { getToken, logoutUser } from "./assets/services/authService";

// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("inicio");

//   // estado auth
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // ESTADOS GLOBALES
//   const [materials, setMaterials] = useState([]);
//   const [paymentTypes, setPaymentTypes] = useState([]);
//   const [movements, setMovements] = useState([]);
//   const [anticipos, setAnticipos] = useState([]);
//   const [terceros, setTerceros] = useState([]);

//   useEffect(() => {
//     const token = getToken();
//     setIsAuthenticated(!!token);
//   }, []);

//   // ====================================================================
//   // 🔥 CARGAR TIPOS DE PAGO DESDE API (ESTO SÍ SE HACE UNA VEZ GLOBAL)
//   // ====================================================================
//   useEffect(() => {
//     const fetchTiposPago = async () => {
//       try {
//         const res = await fetch("http://192.168.150.4:8000/tiposPago", {
//           headers: buildAuthHeaders(),
//         });
//         const data = await res.json();

//         if (data.status === "success" && Array.isArray(data.data)) {
//           const normalizados = data.data.map((tp) => ({
//             id: tp.idTipoPago,
//             name: tp.tipo_pago,
//           }));

//           setPaymentTypes(normalizados);
//         } else {
//           console.error("Formato inválido en API:", data);
//         }
//       } catch (error) {
//         console.error("Error cargando tipos de pago:", error);
//       }
//     };

//     if (isAuthenticated) fetchTiposPago();
//   }, [isAuthenticated]);

//   // helper para cabeceras con token
//   const buildAuthHeaders = () => {
//     const token = getToken();
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   // login-success callback (llamado por AuthForm)
//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true);
//     setActiveTab("inicio");
//   };

//   const handleLogout = () => {
//     logoutUser();
//     setIsAuthenticated(false);
//   };

//   // funciones de negocio (sin cambios)
//   const addMovement = (newInvoice) => {
//     setMovements((prev) => [newInvoice, ...prev]);
//   };

//   const addAnticipo = (newAnticipo) => {
//     setAnticipos((prev) => [newAnticipo, ...prev]);
//   };

//   const toggleCancelado = (id) => {
//     setMovements((prev) => prev.map((m) => (m.id === id ? { ...m, cancelado: !m.cancelado } : m)));
//   };

//   // Si no está autenticado, mostrar pantalla de login
//   if (!isAuthenticated) {
//     return <AuthForm onLogin={handleLoginSuccess} />;
//   }

//   return (
//     <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">
//       {/* SIDEBAR */}
//       <Sidebar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         onLogout={handleLogout} // opcional, pásalo si implementas logout en Sidebar
//       />

//       {/* CONTENIDO PRINCIPAL */}
//       <main className="flex-1 overflow-y-auto relative w-full">
//         <header className="bg-white shadow-sm p-4 flex items-center lg:hidden sticky top-0 z-40">
//           <button onClick={() => setIsSidebarOpen(true)} className="text-gray-700 mr-4">
//             <Menu size={24} />
//           </button>
//           <h1 className="text-lg font-semibold text-emerald-700">Sistema Contable</h1>
//         </header>

//         <div className="p-6">
//           {activeTab === "generador" && (
//             <InvoiceGenerator materials={materials} paymentTypes={paymentTypes} onSave={addMovement} />
//           )}

//           {activeTab === "anticipo" && (
//             <AnticipoRegister terceros={terceros} paymentTypes={paymentTypes} onSaveAnticipo={addAnticipo} />
//           )}

//           {activeTab === "movimientos" && <Movimientos data={movements} toggleCancelado={toggleCancelado} />}

//           {activeTab === "archivedAnticipos" && <AnticiposArchived data={anticipos} />}

//           {activeTab === "terceros" && <Terceros data={terceros} setData={setTerceros} />}

//           {activeTab === "config" && (
//             <ConfigurationPanel
//               materials={materials}
//               setMaterials={setMaterials}
//               paymentTypes={paymentTypes}
//               setPaymentTypes={setPaymentTypes}
//             />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
