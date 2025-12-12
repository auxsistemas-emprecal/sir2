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
  fetchPagos, // IMPORTADO para cargar anticipos
  updatePago, // IMPORTADO para cargar anticipos
  fetchLastRemisionNumber,
  fetchMovimientoItemsByRemision, // 🆕 Importado para edición
} from "./assets/services/apiService.js";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [movements, setMovements] = useState([]);
  const [anticipos, setAnticipos] = useState([]); // Array para guardar los anticipos
  const [terceros, setTerceros] = useState([]);

  // 🆕 ESTADOS PARA LA EDICIÓN
  const [editingMovement, setEditingMovement] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // =======================================================
  // 🟢 FUNCIÓN CENTRALIZADA PARA CARGAR MOVIMIENTOS
  // =======================================================
  const loadMovimientos = async () => {
    try {
      const data = await fetchMovimientos();
      setMovements(data);
    } catch (error) {
      console.error("Fallo al cargar movimientos:", error);
    }
  };

  // =======================================================
  // 🟢 FUNCIÓN CENTRALIZADA PARA CARGAR ANTICIPOS (PAGOS)
  // <<< NUEVA FUNCIÓN >>>
  // =======================================================
  const loadAnticipos = async () => {
    try {
      const data = await fetchPagos();
      setAnticipos(data); // Actualiza el estado 'anticipos' con los datos de la API
    } catch (error) {
      console.error("Fallo al cargar anticipos:", error);
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
        // const pla = await fetchPlacas();

        // Cargar movimientos al inicio
        await loadMovimientos();
        await loadAnticipos(); // <<< CAMBIO CLAVE: Cargar anticipos al inicio >>>

        setPaymentTypes(tp);
        setTerceros(ter);
        setMaterials(mat);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    })();
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("inicio");
    console.log("Usuario autenticado:", usuario);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  // ==================================================
  // 🟢 FUNCIÓN DE EDICIÓN: Carga de Datos y Redirección (Sin cambios)
  // ==================================================
  const startEditing = async (movementHeader) => {
    try {
      // 1. Guardar la cabecera del movimiento en edición
      setEditingMovement(movementHeader);
      setIsEditing(true);
      // 2. Obtener los ítems asociados a esa remisión
      const itemsData = await fetchMovimientoItemsByRemision(
        movementHeader.remision
      );
      setEditingItems(itemsData);

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
      console.log("Creando movimiento con datos:", headerData);
      console.log("Items a guardar:", itemsList);
      const responseHeader = await createMovimiento(headerData);
      const remisionCreada = await fetchLastRemisionNumber();
      console.log(
        "2. Cabecera creada. Remisión ID:",
        remisionCreada.data[0].remision
      );
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

  // ==================================================
  // 🟢 FUNCIÓN DE CREACIÓN (Anticipos)
  // ==================================================

  const addAnticipo = async (newAnticipo) => {
    console.log(newAnticipo);
    await createPago(newAnticipo);
    await loadAnticipos(); // <<< CAMBIO CLAVE: Recargar anticipos después de crear uno >>>
    setActiveTab("archivedAnticipos");
  };

  // ==================================================
  // 🟢 FUNCIÓN DE TOGGLE DE ESTADO (Anticipos)
  // ==================================================
  const handleToggleAnticipoEstado = async (pagoCompleto) => {
    // El ID se obtiene correctamente desde el objeto pagoCompleto
    const id_pago = pagoCompleto.id_pago || pagoCompleto.id; 

    const nuevoEstado =
      pagoCompleto.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";

    if (
      !window.confirm(
        `¿Está seguro de cambiar el estado del pago ID ${id_pago} a "${nuevoEstado}"?`
      )
    ) {
      return;
    }

    try {
      const payload = {
        fecha: pagoCompleto.fecha,
        idTercero: pagoCompleto.idTercero,
        tipo: pagoCompleto.tipo,
        remisiones: pagoCompleto.remisiones,
        valor: pagoCompleto.valor,
        no_ingreso: pagoCompleto.no_ingreso,
        cedula: pagoCompleto.cedula,
        telefono: pagoCompleto.telefono,
        direccion: pagoCompleto.direccion,
        concepto: pagoCompleto.concepto,
        idTipoPago: pagoCompleto.idTipoPago,
        pagado: pagoCompleto.pagado,
        estado: nuevoEstado,
      };

      const response = await updatePago(id_pago, payload);

      await loadAnticipos(); // <<< CAMBIO CLAVE: Recargar anticipos después de actualizar el estado >>>

      alert(`Pago actualizado a ${nuevoEstado}`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al actualizar el pago.");
    }
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
  // 🟢 RENDERIZADO PRINCIPAL (Sin cambios en el JSX)
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
              isEditing={isEditing} // 🆕 Indicador de edición
              setIsEditing={setIsEditing} // 🆕 Setter para indicador de edición
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

          {activeTab === "archivedAnticipos" && (
            <HistorialAnticipos 
              data={anticipos} // Ahora 'anticipos' debería estar lleno
              toggleAnticipoEstado={handleToggleAnticipoEstado}
            />
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

          {activeTab === "PreciosEspeciales" && <PreciosEspeciales />}
        </div>
      </main>
    </div>
  );
}