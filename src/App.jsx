// ======================= App.jsx (MODIFICADO) =======================

import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "./index.css"; 

// Componentes: Añadimos la extensión .jsx
import Sidebar from "./components/Sidebar.jsx";
import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
import Terceros from "./components/terceros.jsx";
import PreciosEspeciales from "./components/PreciosEspeciales.jsx";
import AnticipoRegister from "./components/AnticipoRegister.jsx";
import AnticiposArchived from "./components/AnticiposArchived.jsx";
import AuthForm from "./components/AuthForm.jsx";

import MovimientosPage from "./components/MovimientosPage.jsx";
// Servicios: Añadimos la extensión .js
import { getToken, logoutUser } from "./assets/services/authService.js";

// 🔥 Importación de API centralizada:
import {
  fetchTiposPago,
  fetchTerceros,
  fetchMateriales,
  fetchPlacas,
  fetchMovimientos,
  fetchPreciosEspeciales,
  createMovimiento, // 🛑 1. Importar la función de creación
  // createMovimientoItem,
  // fetchAnticipos
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
  // 🟢 COMPORTAMIENTO: Persistencia de Sesión (Solución 2)
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
      const tp = await fetchTiposPago();
      const ter = await fetchTerceros();
      const mat = await fetchMateriales();
      const pla = await fetchPlacas();
      const preEs = await fetchPreciosEspeciales()
      
      // 🛑 3. Cargar movimientos al inicio
      await loadMovimientos(); 
      // const ant = await fetchAnticipos();

      setPaymentTypes(tp);
      setTerceros(ter);
      setMaterials(mat);
      setPreciosEspeciales(preEs)
      // setAnticipos(ant);
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

  // 🛑 2. Función addMovement modificada para usar la API y recargar
  const addMovement = async (newMovementData) => {
    try {
        // Llama a la API para crear el movimiento
        const createdMovement = await createMovimiento(newMovementData); //

        // Recarga toda la lista de movimientos para que aparezca el nuevo
        await loadMovimientos();

        return createdMovement; // Retorna el objeto creado
    } catch (error) {
        console.error("Error al guardar el movimiento en App.jsx:", error);
        throw error; // Propaga el error para que InvoiceGenerator lo maneje
    }
  };
    
  const addAnticipo = (newAnticipo) =>
    setAnticipos((prev) => [newAnticipo, ...prev]);

  const toggleCancelado = (id) => {
    setMovements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, cancelado: !m.cancelado } : m))
    );
  };

  if (!isAuthenticated) {
    // Si no está autenticado, muestra el Login
    return <AuthForm onLogin={handleLoginSuccess} />;
  }

  // Si está autenticado, muestra el contenido principal
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
              onSave={addMovement} // Usa la función modificada
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
            // 🛑 4. Pasar los datos y la función de recarga a MovimientosPage
            <MovimientosPage 
                data={movements} 
                onRefresh={loadMovimientos} 
            />
          )}

          {activeTab === "archivedAnticipos" && (
            <AnticiposArchived data={anticipos} />
          )}

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
            <PreciosEspeciales data={preciosEspeciales} setData={setPreciosEspeciales} />
          )}
        </div>
      </main>
    </div>
  );
}




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

