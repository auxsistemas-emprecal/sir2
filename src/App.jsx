import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import "./index.css";

// Componentes
import Sidebar from "./components/Sidebar.jsx";
import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
import Terceros from "./components/terceros.jsx";
import PreciosEspeciales from "./components/PreciosEspeciales.jsx";
import Utilidades from "./components/Utilidades.jsx";
import AnticipoRegister from "./components/AnticipoRegister.jsx";
import HistorialAnticipos from "./components/HistorialAnticipos.jsx";
import AuthForm from "./components/AuthForm.jsx";
import MovimientosPage from "./components/MovimientosPage.jsx";
import CuadreCaja from "./components/CuadreCaja.jsx";
import CreditosTable from "./components/CreditosTable.jsx";
import ReporteCompras from "./components/ReporteCompras.jsx";
import Contabilidad from "./components/Contabilidad.jsx";
import Inicio from "./components/Inicio.jsx";
import CuadreRevision from "./components/CuadreRevision.jsx";
import CuadreCajaDetalles from "./components/CuadreCajaDetalles.jsx";
import ConsultaCompras from "./components/ConsultaCompras";
import Plaquetas from "./components/Plaquetas.jsx";
import ArchivosContabilidad from "./components/ArchivosContabilidad.jsx";
import ChatNotificaciones from "./components/ChatNotificaciones.jsx";
import HistorialObservaciones from "./components/HistorialObservaciones.jsx";
import FirmaCliente from "./components/FirmaCliente.jsx";

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
  fetchPagos,
  updatePago,
  fetchLastRemisionNumber,
  fetchMovimientoItemsByRemision,
  fetchPagoUltimo,
  cambiarEstadoMovimiento,
  fetchCreditos,
  fetchCreditosPorNombre,
  createCredito,
  updateCredito,
  fetchTotalMaterialPorTercero,
  fetchVentasPorFecha,
} from "./assets/services/apiService.js";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [materials, setMaterials] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [movements, setMovements] = useState([]);
  const [anticipos, setAnticipos] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [reloadAnticipos, setReloadAnticipos] = useState(0);
  const [creditos, setCreditos] = useState([]);
  const [cuadreSeleccionado, setCuadreSeleccionado] = useState(null);

  const rawUser = localStorage.getItem("usuario");
  let userObj = {};
  try {
    userObj =
      rawUser && rawUser.startsWith("{")
        ? JSON.parse(rawUser)
        : { nombre: rawUser || "invitado" };
  } catch (error) {
    userObj = { nombre: rawUser || "invitado" };
  }
  const userRole = userObj.rol || "invitado";
  // ---------------------------------------

  // 🆕 ESTADO PARA ESTADÍSTICAS DE INICIO
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalRecaudado: 0,
    pendientesPago: 0,
    totalAnticipos: 0,
  });

  // 🆕 ESTADO PARA FILTRADO MASIVO DESDE ANTICIPOS
  const [filtroRemisionesMasivo, setFiltroRemisionesMasivo] = useState(null);

  // 🆕 ESTADOS PARA LA EDICIÓN DE MOVIMIENTOS
  const [editingMovement, setEditingMovement] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // ESTADO PARA LA EDICIÓN DE ANTICIPOS
  const [anticipoNoComprobanteToEdit, setAnticipoNoComprobanteToEdit] =
    useState(null);

  // =======================================================
  // 🟢 LÓGICA DE CÁLCULO PARA EL DASHBOARD (INICIO)
  // =======================================================
  useEffect(() => {
    if (movements.length > 0 || anticipos.length > 0) {
      const hoy = new Date().toISOString().split("T")[0];

      const ventasHoy = movements
        .filter((m) => m.fecha === hoy && m.estado !== "ANULADA")
        .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      const recaudadoHoy = movements
        .filter(
          (m) => m.fecha === hoy && m.pagado === 1 && m.estado !== "ANULADA",
        )
        .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      const pendientes = movements
        .filter((m) => m.pagado === 0 && m.estado !== "ANULADA")
        .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      const anticiposValor = anticipos
        .filter((a) => a.estado === "VIGENTE")
        .reduce((acc, curr) => acc + (Number(curr.valorAnticipo) || 0), 0);

      setStats({
        totalVentas: ventasHoy,
        totalRecaudado: recaudadoHoy,
        pendientesPago: pendientes,
        totalAnticipos: anticiposValor,
      });
    }
  }, [movements, anticipos]);

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
  // =======================================================
  const loadAnticipos = async () => {
    try {
      const data = await fetchPagos();
      setAnticipos(data);
    } catch (error) {
      console.error("Fallo al cargar anticipos:", error);
    }
  };

  // =======================================================
  // 🟢 FUNCIÓN DE CARGA DE ANTICIPO POR ID (Para AnticipoRegister)
  // =======================================================
  const loadAnticipoDataFunction = useCallback(async (noComprobante) => {
    try {
      console.log("🔍 Buscando comprobante número:", noComprobante);
      const allAnticipos = await fetchPagos();

      const anticipo = allAnticipos.find((p) => {
        const idEnRegistro = String(p.no_ingreso || p.noComprobante || "");
        return idEnRegistro === String(noComprobante);
      });

      if (!anticipo) {
        console.error(`❌ Error: El comprobante ${noComprobante} no existe.`);
      } else {
        console.log("✅ Anticipo encontrado con éxito:", anticipo);
      }

      return anticipo;
    } catch (error) {
      console.error(
        "Error crítico al cargar anticipo por NoComprobante:",
        error,
      );
      throw error;
    }
  }, []);

  // =======================================================
  // 🟢 FUNCIÓN CENTRALIZADA PARA CARGAR CRÉDITOS
  // =======================================================
  const loadCreditos = async () => {
    try {
      const data = await fetchCreditos();
      setCreditos(data);
    } catch (error) {
      console.error("Fallo al cargar créditos:", error);
    }
  };

  // =======================================================
  // 🟢 FUNCIÓN PARA MANEJAR EL CLIC EN EL BOTÓN NARANJA DE REMISIONES
  // =======================================================
  const handleVerRemisionesAsociadas = (listaNumeros) => {
    setFiltroRemisionesMasivo(listaNumeros);
    setActiveTab("movimientos");
  };

  // =======================================================
  // 🟢 FUNCIÓN PARA INICIAR LA EDICIÓN DE ANTICIPO
  // =======================================================
  const startEditingAnticipo = (noComprobante) => {
    setAnticipoNoComprobanteToEdit(noComprobante);
    setActiveTab("anticipo");
  };

  // =======================================================
  // 🟢 COMPORTAMIENTO: Persistencia de Sesión
  // =======================================================
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) setUsuario(savedUser);
  }, []);

  // ================================
  // CARGA GLOBAL DE CATÁLOGOS Y MOVIMIENTOS
  // ================================
  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const tp = await fetchTiposPago();
        const ter = await fetchTerceros();
        const mat = await fetchMateriales();

        await loadMovimientos();
        await loadAnticipos();
        await loadCreditos();

        setPaymentTypes(tp);
        setTerceros(ter);
        setMaterials(mat);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", usuario);
    }
  }, [usuario]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("inicio");
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  const startEditing = async (movementHeader) => {
    try {
      setEditingMovement(movementHeader);
      setIsEditing(true);
      const itemsData = await fetchMovimientoItemsByRemision(
        movementHeader.remision,
      );
      setEditingItems(itemsData);
      setActiveTab("generador");
    } catch (error) {
      console.error("Error al cargar datos para edición:", error);
      alert("Hubo un error al cargar los detalles de la remisión.");
    }
  };

  const addMovement = async (headerData, itemsList) => {
    try {
      const usuario = localStorage.getItem("usuario") || "Desconocido";

      headerData["usuario"] = usuario;

      console.log(headerData);

      if (
        headerData.idTipoPago === 1 ||
        headerData.idTipoPago === 2 ||
        headerData.idTipoPago === 9
      ) {
        headerData.pagado = 1;
      }
      console.log(headerData);
      await createMovimiento(headerData);
      const remisionCreada = await fetchLastRemisionNumber();

      if (headerData.estadoDeCuenta) {
        await updatePago(
          headerData.estadoDeCuenta.no_ingreso,
          headerData.estadoDeCuenta,
        );
      }

      if (headerData.idTipoPago === 4) {
        let creditoPayload = null;
        const resultadoCredito = await fetchCreditosPorNombre(
          headerData.tercero,
        );
        if (resultadoCredito.length === 0) {
          creditoPayload = {
            idTercero: headerData.idTercero,
            tercero: headerData.tercero,
            remisiones: `[${remisionCreada.data[0].remision}]`,
            valorRemisiones: headerData.total,
            pagado: 0,
          };
          await createCredito(creditoPayload);
        } else {
          let remisionesCredito = eval(resultadoCredito[0].remisiones);
          remisionesCredito.push(remisionCreada.data[0].remision);
          creditoPayload = {
            ...resultadoCredito[0],
            remisiones: `[${remisionesCredito}]`,
            valorRemisiones:
              resultadoCredito[0].valorRemisiones + headerData.total,
          };
          await updateCredito(resultadoCredito[0].idCredito, creditoPayload);
        }
      }

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
      await loadMovimientos();
      return remisionCreada;
    } catch (error) {
      console.error("Error en la secuencia de guardado:", error);
      throw error;
    }
  };

  const addAnticipo = async (newAnticipo) => {
    await createPago(newAnticipo);
    const ultimoPago = await fetchPagoUltimo();
    await loadAnticipos();
    setAnticipoNoComprobanteToEdit(null);
    setActiveTab("archivedAnticipos");
    return ultimoPago;
  };

  const handleToggleAnticipoEstado = async (pagoCompleto) => {
    const id_pago = pagoCompleto.noComprobante;
    const nuevoEstado =
      pagoCompleto.estado === "VIGENTE" ? "ANULADA" : "VIGENTE";
    const idTipoPago = paymentTypes.find(
      (tipo) => tipo.tipo_pago === pagoCompleto.tipoPago,
    )?.idTipoPago;

    if (!id_pago) {
      alert("Error: No se pudo determinar el ID del pago.");
      return;
    }

    if (
      !window.confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)
    )
      return;

    try {
      const payload = {
        id_pago: pagoCompleto.id || pagoCompleto.no_ingreso,
        no_ingreso: String(pagoCompleto.noComprobante || ""),
        fecha: pagoCompleto.fecha,
        idTercero: pagoCompleto.idTercero,
        tipo: pagoCompleto.tipo || "Anticipo",
        valor:
          Number(pagoCompleto.valorAnticipo) || Number(pagoCompleto.valor) || 0,
        valorRemisiones:
          Number(pagoCompleto.valorAnticipo) - Number(pagoCompleto.saldo),
        cedula: pagoCompleto.cedula || "",
        telefono: pagoCompleto.telefono || "",
        direccion: pagoCompleto.direccion || "",
        concepto: pagoCompleto.concepto || "",
        idTipoPago: String(idTipoPago || ""),
        pagado: pagoCompleto.pagado || 0,
        remisiones: pagoCompleto.remisiones,
        estado: nuevoEstado,
      };

      await updatePago(id_pago, payload);
      const remisionesAsociadas = eval(payload.remisiones);
      if (remisionesAsociadas && Array.isArray(remisionesAsociadas)) {
        for (const remision of remisionesAsociadas) {
          await cambiarEstadoMovimiento(remision, nuevoEstado);
        }
      }
      await loadAnticipos();
      setReloadAnticipos((x) => x + 1);
    } catch (error) {
      alert(`Error al actualizar el pago: ${error.message}`);
    }
  };

  const handleTogglePagoAnticipo = async (anticipo) => {
    const nuevoEstadoPagado = anticipo.pagado === 1 ? 0 : 1;
    const fechaHoy = new Date().toISOString().split("T")[0];

    const idTipoPago = paymentTypes.find(
      (tipo) => tipo.tipo_pago === anticipo.tipoPago,
    )?.idTipoPago;

    try {
      const payload = {
        id_pago: anticipo.id || anticipo.no_ingreso,
        no_ingreso: String(anticipo.noComprobante || ""),
        fecha: anticipo.fecha,
        idTercero: anticipo.idTercero,
        tipo: anticipo.tipo || "Anticipo",
        valor: Number(anticipo.valorAnticipo) || 0,
        valorRemisiones:
          Number(anticipo.valorAnticipo) - Number(anticipo.saldo),
        cedula: anticipo.cedula || "",
        telefono: anticipo.telefono || "",
        direccion: anticipo.direccion || "",
        concepto: anticipo.concepto || "",
        idTipoPago: String(idTipoPago || ""),
        estado: anticipo.estado,
        pagado: nuevoEstadoPagado,
        fechaPagado: nuevoEstadoPagado === 1 ? fechaHoy : null,
      };

      await updatePago(payload.id_pago, payload);
      await loadAnticipos();
    } catch (error) {
      console.error("Error al actualizar estado de pago:", error);
      alert("No se pudo actualizar el estado de pago.");
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLoginSuccess} setUsuario={setUsuario} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 w-full overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "movimientos") {
            loadMovimientos();
            loadAnticipos();
          }
          if (tab === "creditos") {
            loadCreditos();
          }
          if (tab !== "movimientos") setFiltroRemisionesMasivo(null);
          if (tab !== "anticipo") setAnticipoNoComprobanteToEdit(null);
          if (tab !== "generador") {
            setEditingMovement(null);
            setIsEditing(false);
          }
          setActiveTab(tab);
        }}
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
          {/* =======================================================
              TAB: INICIO (DASHBOARD INTEGRADO)
          ======================================================= */}
          {activeTab === "inicio" && (
            <Inicio
              movements={movements}
              anticipos={anticipos}
              terceros={terceros}
              materials={materials}
              setTab={setActiveTab}
            />
          )}

          {activeTab === "generador" && (
            <InvoiceGenerator
              materials={materials}
              paymentTypes={paymentTypes}
              onSave={addMovement}
              setMaterials={setMaterials}
              editingMovement={editingMovement}
              editingItems={editingItems}
              onEditCancel={() => {
                setEditingMovement(null);
                setEditingItems([]);
                setIsEditing(false);
                setActiveTab("movimientos");
              }}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              usuario={usuario}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "cuadreCaja" && (
            <CuadreCaja movements={movements} anticipos={anticipos} />
          )}

          {activeTab === "contabilidad" && (
            <Contabilidad
              movements={movements}
              anticipos={anticipos}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* {activeTab === "utilidades" && <Utilidades />} */}

          {activeTab === "anticipo" && (
            <AnticipoRegister
              terceros={terceros}
              paymentTypes={paymentTypes}
              onSaveAnticipo={addAnticipo}
              noComprobanteToEdit={anticipoNoComprobanteToEdit}
              onLoadAnticipoByNoComprobante={loadAnticipoDataFunction}
            />
          )}

          {activeTab === "creditos" && <CreditosTable data={creditos} />}

          {activeTab === "movimientos" && (
            <MovimientosPage
              data={movements}
              onRefresh={loadMovimientos}
              onEdit={startEditing}
              paymentTypes={paymentTypes}
              filtroExterno={filtroRemisionesMasivo}
              onClearFiltro={() => setFiltroRemisionesMasivo(null)}
            />
          )}

          {activeTab === "archivedAnticipos" && (
            <HistorialAnticipos
              key={reloadAnticipos}
              data={anticipos}
              toggleAnticipoEstado={handleToggleAnticipoEstado}
              onEditAnticipo={startEditingAnticipo}
              onVerRemisionesAsociadas={handleVerRemisionesAsociadas}
              onTogglePago={handleTogglePagoAnticipo}
              onVerDetalleRemision={(numRemision) => {
                const movimiento = movements.find(
                  (m) => String(m.remision) === String(numRemision),
                );
                if (movimiento) {
                  startEditing(movimiento);
                } else {
                  alert(
                    "No se encontró el registro físico de la remisión REM-" +
                      numRemision,
                  );
                }
              }}
            />
          )}

          {activeTab === "utilidades" && (
            <Utilidades setActiveTab={setActiveTab} />
          )}

          {activeTab === "archivosContabilidad" && (
            <ArchivosContabilidad
              movements={movements}
              onRefresh={loadMovimientos}
            />
          )}

          {activeTab === "plaquetas" && <Plaquetas />}

          {activeTab === "chatNotificaciones" && <ChatNotificaciones />}

          {activeTab === "terceros" && (
            <Terceros data={terceros} setData={setTerceros} />
          )}

          {activeTab === "reporteCompras" && <ReporteCompras />}

          {activeTab === "config" && (
            <ConfigurationPanel
              materials={materials}
              setMaterials={setMaterials}
              paymentTypes={paymentTypes}
              setPaymentTypes={setPaymentTypes}
            />
          )}

          {activeTab === "PreciosEspeciales" && <PreciosEspeciales />}

          {activeTab === "CuadreRevision" && (
            <CuadreRevision
              onVerDetalle={(cuadre) => {
                setCuadreSeleccionado(cuadre);
                setActiveTab("CuadreCajaDetalles");
              }}
            />
          )}

          {activeTab === "CuadreCajaDetalles" && (
            <CuadreCajaDetalles
              datos={cuadreSeleccionado}
              onBack={() => setActiveTab("CuadreRevision")}
            />
          )}

          {activeTab === "ConsultaCompras" && <ConsultaCompras />}

          {activeTab === "HistorialObservaciones" &&
            (userRole === "admin" ? (
              <HistorialObservaciones
                onBack={() => setActiveTab("utilidades")}
              />
            ) : (
              <div className="p-10 text-center text-red-500 font-bold">
                Acceso Denegado
              </div>
            ))}

          {activeTab === "FirmaCliente" && (
            <FirmaCliente onBack={() => setActiveTab("utilidades")} />
          )}
        </div>
      </main>
    </div>
  );
}
