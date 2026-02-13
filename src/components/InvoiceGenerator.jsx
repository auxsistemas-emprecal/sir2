// src/components/InvoiceGenerator.jsx

import React, { useState, useEffect } from "react";
import LogoEmprecal from "../assets/services/img/Estrategia-comercial.png";

import {
  Save,
  Printer,
  FileText,
  PlusCircle,
  XCircle,
  Trash2,
  PenTool,
  Eraser,
} from "lucide-react";
import InputGroup from "./InputGroup";
import InputAutosuggest from "../components/InputAutosuggest";
import { createMovimiento } from "../assets/services/apiService";
import {
  searchTercero,
  // fetchPreciosEspeciales,
  fetchMateriales,
  fetchLastRemisionNumber,
  fetchMovimiento,
  updateMovimiento,
  updateMovimientoItems,
  fetchPagosPorNombre,
  fetchPagosPorNoIngreso,
  updatePago,
  updateCredito,
  fetchCreditosPorNombre,
  fetchPreciosEspecialesPorTercero,
  createTercero,
  updateTercero,
  searchTerceroById,
  buscarPlacasPorFiltro,
  fetchPlacas,
  fetchFirma,
  updateFirmaLimpiar,
} from "../assets/services/apiService";

// --- CLAVE DE PERSISTENCIA (PONER AQUÍ) ---
const STORAGE_KEY = "remision_pendiente";

// --- Nuevo Componente: Modal de Confirmación ---
const Modal = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="text-gray-600">{message}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
// ----------------------------------------------
//-----------------------------------------------

function formatearRemision(remision) {
  const numeroDigitos = 6;
  const remisionLength = remision.toString().length;
  const numberOfZeros = numeroDigitos - remisionLength;
  let formatedRemision = "";

  for (let i = 0; i < numberOfZeros; i++) {
    formatedRemision += "0";
  }

  formatedRemision += remision;

  return formatedRemision;
}

export default function InvoiceGenerator({
  setMaterials,
  materials = [],
  paymentTypes = [],
  onSave,
  //  RECIBE DATOS DE EDICIÓN
  editingMovement,
  editingItems,
  isEditing,
  setIsEditing,
  usuario,
  setActiveTab,
  // isSaving,
}) {
  useEffect(() => {
    (async () => {
      const firma = await fetchFirma();
      console.log("FIRMA RECUPERADA:", firma);
    })();
  }, []);

  // Función auxiliar para obtener fecha y hora en zona horaria de Colombia
  const getColombiaDateParts = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();

    // Obtener fecha en formato YYYY-MM-DD basado en Colombia
    const fecha = date.toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Obtener hora en formato HH:mm (24h) basado en Colombia
    const hora = date.toLocaleTimeString("en-US", {
      timeZone: "America/Bogota",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    return { fecha, hora };
  };

  // Estado inicial base
  const initialDateParts = getColombiaDateParts();
  const initialFormData = {
    fecha: initialDateParts.fecha,
    remision: "",
    conductor: "",
    cedula: "",
    tercero: "",
    idTercero: null,
    telefono: "",
    direccion: "",
    placa: "",
    cubica: "",
    incluirIva: false,
    incluirRet: false,
    tipoPago: "",
    idTipoPago: null,
    observacion: "",
    horaLlegada: initialDateParts.hora,
    horaSalida: "",
    // CAMPOS DE PESAJE ---
    usarPesaje: false,
    pesoEntrada: 0,
    pesoSalida: 0,
    pesoNeto: 0,
    imprimirPesaje: false,
  };

  const initialLineItems = () => {
    if (materials.length > 0) {
      const m = materials[0];
      return [
        {
          id: Date.now(),
          idMaterial: 0,
          nombre_material: "",
          cantidad: 0,
          precioUnitario: 0,
        },
      ];
    }
    return [
      {
        id: Date.now(),
        idMaterial: null,
        nombre_material: "",
        cantidad: 0,
        precioUnitario: 0,
      },
    ];
  };

  // Definimos los valores frescos de hoy afuera para usarlos en el estado
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split("T")[0];
  const horaActual = ahora.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    console.log("Intentando recuperar del storage:", saved);

    if (saved) {
      const parsed = JSON.parse(saved);
      // Retornamos el borrador pero FORZAMOS fecha y hora de hoy
      return {
        ...parsed.formData,
        fecha: fechaHoy, // <--- Actualiza a hoy
        horaLlegada: horaActual, // <--- Actualiza a ahora
      };
    }
    // Si no hay nada, cargamos initialFormData pero también con fecha/hora actualizadas
    return {
      ...initialFormData,
      fecha: fechaHoy,
      horaLlegada: horaActual,
    };
  });

  const [lineItems, setLineItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.lineItems;
    }
    return initialLineItems();
  });

  const [calculos, setCalculos] = useState({
    subtotal: 0,
    iva: 0,
    retencion: 0,
    total: 0,
  });

  const [showIVARet, setShowIVARet] = useState(true);

  const [estadoDeCuenta, setEstadoDeCuenta] = useState({
    no_ingreso: 0,
    valorAnticipo: 0,
    valorRemision: 0,
    remisiones: [],
    valorRemisiones: 0,
    saldo: 0,
  });

  const [showClearModal, setShowClearModal] = useState(false);

  //---------------------------------------------------------------------------------
  //---------------------------- BUSCADOR DE PLACAS ---------------------------------
  //---------------------------------------------------------------------------------

  const [sugerenciasPlacas, setSugerenciasPlacas] = useState([]);

  const handleSearchPlaca = async (busqueda) => {
    if (busqueda.length >= 1) {
      // Empieza a buscar desde 1 carácter
      const resultados = await buscarPlacasPorFiltro(busqueda);
      setSugerenciasPlacas(resultados);
    } else {
      setSugerenciasPlacas([]);
    }
  };
  //---------------------------------------------------------------------------------
  //---------------------------------------------------------------------------------

  // --- NUEVOS ESTADOS ---
  const [showModal, setShowModal] = useState(false);
  const [lastSavedRecord, setLastSavedRecord] = useState(null); // Almacena el registro guardado para la vista/impresión
  const [preciosEspeciales, setPreciosEspeciales] = useState([]);
  const [pagosAnticipados, setPagosAnticipados] = useState([]);
  // ----------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);

  // FUNCIÓN DE MANEJO DE PESAJE
  const handlePesoChange = (e) => {
    const { name, value } = e.target;
    // Convertimos el valor a número (si está vacío, usamos 0)
    const numValue = value === "" ? 0 : parseFloat(value);

    setFormData((prev) => {
      // Creamos el nuevo estado con el valor del input que cambió
      const nuevoEstado = { ...prev, [name]: numValue };

      // Cálculo automático del Neto (Salida - Entrada)
      // Math.max asegura que si la entrada es mayor a la salida, el neto sea 0 y no un número negativo
      nuevoEstado.pesoNeto = Math.max(
        0,
        nuevoEstado.pesoSalida - nuevoEstado.pesoEntrada,
      );

      return nuevoEstado;
    });
  };

  //=====================================================================================
  //                                EDITAR
  //======================================================================================
  const modalStyles = isEditing
    ? {
        headerClass: "bg-amber-500 text-black py-6 animate-pulse", // Naranja vibrante con pulso
        icon: "⚠️",
        iconSize: "text-5xl",
        containerClass: "border-4 border-amber-500 shadow-2xl",
        buttonClass:
          "bg-amber-600 hover:bg-amber-700 text-white text-xl px-8 py-3 font-black",
        borderColor: "border-l-8 border-amber-600",
        titleText: "¡ATENCIÓN: MODIFICANDO REGISTRO!",
      }
    : {
        headerClass: "bg-green-600 text-white py-4",
        icon: "💾",
        iconSize: "text-3xl",
        containerClass: "border-none shadow-lg",
        buttonClass: "bg-green-700 hover:bg-green-800 text-white",
        borderColor: "border-l-8 border-green-600",
        titleText: "Confirmar Registro",
      };

  useEffect(() => {
    (async () => {
      // CASO A: ESTAMOS EDITANDO UN REGISTRO EXISTENTE
      if (editingMovement && editingItems?.data) {
        const responseMovimiento = await fetchMovimiento(
          editingMovement.remision,
        );
        let cubicajeFinal = editingMovement.cubica || editingMovement.cubicaje;

        if (!cubicajeFinal) {
          try {
            const terceros = await searchTercero(editingMovement.tercero);
            const elTercero = terceros.find(
              (t) => t.nombre === editingMovement.tercero,
            );
            if (elTercero) cubicajeFinal = elTercero.cubica;
          } catch (e) {
            console.error("Error recuperando cubicaje", e);
          }
        }

        if (!isEditing) return;

        setFormData({
          ...editingMovement,
          idTercero: parseInt(responseMovimiento.idTercero),
          idTipoPago: parseInt(responseMovimiento.idTipoPago),
          incluirIva: Boolean(editingMovement.incluir_iva),
          incluirRet: Boolean(editingMovement.incluir_ret),
          fecha: getColombiaDateParts(editingMovement.fecha).fecha,
          horaLlegada: getColombiaDateParts(editingMovement.fecha).hora,
          tipoPago: editingMovement.tipo_pago,
          cubica: cubicajeFinal,
          pesoEntrada: Number(editingMovement.pesoEntrada) || 0,
          pesoSalida: Number(editingMovement.pesoSalida) || 0,
          pesoNeto: Number(editingMovement.pesoNeto) || 0,
          usarPesaje:
            Number(editingMovement.pesoEntrada) > 0 ||
            Number(editingMovement.pesoSalida) > 0,
        });

        fetchPagosPorNombre(editingMovement.tercero).then((resp) => {
          setPagosAnticipados(resp);
        });

        const mappedItems = editingItems.data.map((item) => {
          const materialInfo = materials.find(
            (m) => m.idMaterial === item.idMaterial,
          );
          return {
            ...item,
            idMaterial: item.idMaterial,
            cantidad: String(item.cantidad),
            precioUnitario: String(item.precioUnitario),
            nombre_material:
              item.nombre_material ||
              item.descripcion ||
              materialInfo?.nombre_material ||
              "",
            descripcion:
              item.descripcion ||
              item.nombre_material ||
              materialInfo?.nombre_material ||
              "",
          };
        });

        setLineItems(mappedItems);
      }
      // CASO B: ES UN REGISTRO NUEVO
      else {
        // REVISAMOS SI HAY PERSISTENCIA ANTES DE BORRAR
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          // Solo si NO hay nada guardado, ponemos los valores en blanco
          setFormData(initialFormData);
          setLineItems(initialLineItems());
        }
        // Si "saved" existe, no hacemos nada aquí porque el useState inicial ya los cargó
      }
    })();
  }, [editingMovement, editingItems]);

  // si cambia la lista de materials, actualizamos la primer línea si estaba vacía
  useEffect(() => {
    setLineItems((prev) => {
      // si primer item no tiene idMaterial y materials trae algo, rellenarlo
      if (prev.length === 1 && !prev[0].idMaterial && materials.length > 0) {
        const m = materials[0];
        return [
          {
            ...prev[0],
            idMaterial: 0,
            nombre_material: "",
            precioUnitario: 0,
          },
        ];
      }
      return prev;
    });
  }, [materials, preciosEspeciales]);

  // recalcular totales cuando cambian lineItems o flags
  function hacerCalculos() {
    const subtotal = lineItems.reduce((acc, li) => {
      const c = parseFloat(li.cantidad) || 0;
      const p = parseFloat(li.precioUnitario) || 0;
      return acc + c * p;
    }, 0);
    const iva = formData.incluirIva ? subtotal * 0.19 : 0;
    const retencion = formData.incluirRet ? subtotal * 0.025 : 0;
    setCalculos({
      subtotal,
      iva,
      retencion,
      total: subtotal + iva - retencion,
    });
  }

  useEffect(() => {
    hacerCalculos();
  }, [lineItems, formData.incluirIva, formData.incluirRet]);

  useEffect(() => {
    setEstadoDeCuenta((prev) => ({
      ...prev,
      valorRemision: calculos.total,
    }));
  }, [calculos]);

  useEffect(() => {
    const selectedPago = pagosAnticipados.find((p) =>
      eval(p.remisiones).includes(formData.remision),
    );
    setEstadoDeCuenta((prev) => ({
      ...prev,
      no_ingreso: selectedPago ? selectedPago.no_ingreso : 0,
      valorAnticipo: selectedPago ? selectedPago.valor : 0,
      valorRemision: calculos.total,
      remisiones: selectedPago ? selectedPago.remisiones : "[]",
      valorRemisiones: selectedPago
        ? selectedPago.valorRemisiones - (editingMovement?.total || 0)
        : 0,
      saldo: selectedPago ? selectedPago.saldo + editingMovement.total : 0,
      pagoOriginal: selectedPago,
    }));
  }, [pagosAnticipados]);
  // Persistencia en localStorage
  useEffect(() => {
    // Solo guardamos si no estamos editando
    // y si no hemos acabado de guardar la remisión actual
    if (!isEditing && !lastSavedRecord) {
      const dataToSave = { formData, lineItems };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData, lineItems, isEditing, lastSavedRecord]);

  const handleChange = (e) => {
    const { name, value, type, checked, completeObject } = e.target;

    //  Lógica para el Tercero (InputAutosuggest)
    if (name == "tercero" && typeof completeObject == "object") {
      setFormData((prev) => ({
        ...prev,
        conductor: completeObject.conductor,
        cedula: completeObject.cedula,
        idTercero: completeObject.id_tercero,
        tercero: completeObject.nombre,
        telefono: completeObject.telefono,
        direccion: completeObject.direccion,
        placa: completeObject.placa,
        cubica: completeObject.cubica,
      }));
      fetchPagosPorNombre(completeObject.nombre).then((resp) => {
        setPagosAnticipados(resp);
      });
      const oldMaterials = { ...materials };
      fetchPreciosEspecialesPorTercero(completeObject.nombre).then((resp) => {
        if (Boolean(resp[0])) {
          setPreciosEspeciales(resp);
          return;
        }
        setPreciosEspeciales(oldMaterials);
      });
      return;
    } else if (name == "tercero") {
      // Si el usuario escribe manualmente y no selecciona de la lista,
      // mantenemos el texto pero limpiamos el ID para evitar inconsistencias
      setFormData((prev) => ({
        ...prev,
        tercero: value,
        // Opcional: idTercero: null (si quieres forzar selección de lista)
      }));
    }

    if (name === "tipoPago") {
      if (isEditing) return;

      // Si el valor es vacío (la opción por defecto), limpiamos y salimos
      if (value === "") {
        setFormData((prev) => ({ ...prev, tipoPago: "", idTipoPago: null }));
        return;
      }

      const selectedPayment = paymentTypes.find(
        (p) => (p.tipo_pago || p.name) === value,
      );

      setFormData((prev) => ({
        ...prev,
        tipoPago: value,
        idTipoPago: selectedPayment?.idTipoPago || selectedPayment?.id || null,
      }));
      return;
    }

    // Lógica si es pago anticipado
    if (name === "no_ingreso") {
      if (isEditing) return;
      const selectedPago = pagosAnticipados.find(
        (p) => p.no_ingreso.toString() === value,
      );

      setEstadoDeCuenta((prev) => ({
        ...prev,
        no_ingreso: selectedPago ? selectedPago.no_ingreso : 0,
        valorAnticipo: selectedPago ? selectedPago.valor : 0,
        valorRemision: calculos.total,
        remisiones: selectedPago ? selectedPago.remisiones : "[]",
        valorRemisiones: selectedPago ? selectedPago.valorRemisiones : 0,
        saldo: selectedPago ? selectedPago.saldo : 0,
        pagoOriginal: selectedPago,
      }));
    }

    // 3. Inputs normales
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =================================================================================================================
  //                                                  Manejador de cambios
  // =================================================================================================================

  // cambios en una fila (line item)
  const handleLineChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((li, i) => {
        if (i !== index) return li;
        // si cambian el material, rellenar id,nombre,precio automáticamente
        if (field === "idMaterial" || field === "nombre_material") {
          // si se recibió idMaterial (select por id), buscar por id; si se recibió nombre, buscar por nombre
          let selected = null;
          if (field === "idMaterial") {
            const idNum = Number(value);
            selected = materials.find((m) => Number(m.idMaterial) === idNum);
            if (selected) {
              const nombreMaterialSelected = selected.nombre_material;
              let materialPE = [];
              if (preciosEspeciales.length > 0) {
                materialPE = preciosEspeciales.filter(
                  (el) => el.nombre_material === nombreMaterialSelected,
                );
                setMaterials((prevMaterials) => {
                  const newMaterials = prevMaterials.map((mat) => {
                    if (mat.idMaterial === selected.idMaterial) {
                      return {
                        ...mat,
                        precio: materialPE[0]?.precio ?? mat.precio,
                      };
                    }
                    return mat;
                  });
                  return newMaterials;
                });
              }
              return {
                ...li,
                idMaterial: selected.idMaterial,
                nombre_material: selected.nombre_material,
                precioUnitario: materialPE[0]?.precio ?? selected.precio,
              };
            } else {
              // si no encuentra, solo setear idMaterial
              return { ...li, idMaterial: value };
            }
          } else {
            // cambio por nombre (por compatibilidad)
            selected = materials.find((m) => m.nombre_material === value);
            if (selected) {
              const id_tercero_material =
                formData.idTercero + "_" + selected.idMaterial;
              const materialPE = preciosEspeciales.filter(
                (el) => el.id_tercero_material === id_tercero_material,
              );
              return {
                ...li,
                idMaterial: selected.idMaterial,
                nombre_material: selected.nombre_material,
                precioUnitario: materialPE[0]?.precio ?? selected.precio,
              };
            } else {
              return { ...li, nombre_material: value };
            }
          }
        }

        // Cambios en cantidad o precioUnitario
        if (field === "cantidad") {
          return { ...li, cantidad: value === "" ? "" : Number(value) };
        }
        if (field === "precioUnitario") {
          return { ...li, precioUnitario: value === "" ? "" : Number(value) };
        }

        return { ...li, [field]: value };
      }),
    );
  };

  //=============================================================================================================
  //=============================================================================================================

  const addLine = () => {
    const newLine = {
      id: Date.now() + Math.random(),
      idMaterial: materials.length > 0 ? materials[0].idMaterial : null,
      nombre_material: materials.length > 0 ? materials[0].nombre_material : "",
      cantidad: 0,
      precioUnitario: materials.length > 0 ? (materials[0].precio ?? 0) : 0,
    };
    setLineItems((prev) => [...prev, newLine]);
  };

  const removeLine = (index) => {
    setLineItems((prev) => {
      if (prev.length === 1) {
        // si queda vacía, reseteamos la fila en lugar de eliminarla para mantener UI
        const single = initialLineItems(); // Usar la función de inicialización
        return single;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- NUEVA FUNCIÓN: Abrir modal de confirmación ---
  // validaciones
  const handleAttemptSave = () => {
    // Si ya está cargando, no hacer nada
    if (isLoading) return;

    // 1. Validaciones básicas
    const anyCantidad = lineItems.some(
      (li) => (parseFloat(li.cantidad) || 0) > 0,
    );
    const checkSaldo = estadoDeCuenta.valorRemision > estadoDeCuenta.saldo;

    if (!formData.tipoPago || formData.tipoPago === "") {
      alert("Por favor, seleccione un tipo de pago antes de continuar.");
      return;
    }

    if (!formData.tercero || !anyCantidad) {
      alert(
        "Asegúrate de ingresar Cliente/Tercero y al menos una Cantidad mayor a 0.",
      );
      return;
    }

    if (formData.tipoPago === "Pago por anticipado" && checkSaldo) {
      alert(
        "El Cliente no cuenta con saldo suficiente para hacer esta remisión.",
      );
      return;
    }

    //  Abrir el modal de confirmación
    setShowModal(true);
  };

  function compararDatos(
    datosOriginales = {},
    datosModificados = {},
    usuario = "",
  ) {
    const ahora = new Date().toLocaleString("es-CO", {
      timeZone: "America/Bogota",
    });
    let cambios = "";
    for (const key in datosOriginales) {
      if (datosOriginales[key] !== datosModificados[key]) {
        if (key === "fecha") {
          const fechaOriginal = new Date(datosOriginales[key])
            .toISOString()
            .split("T")[0];
          const fechaModificada = new Date(datosModificados[key])
            .toISOString()
            .split("T")[0];
          if (fechaOriginal === fechaModificada) {
            continue;
          }
        }
        cambios += `\n${ahora}-"${usuario}"-"${key}": <${datosOriginales[key]} -> ${datosModificados[key]}>`;
      }
    }
    return cambios;
  }

  //====================================================================================================================
  // --- FUNCIONES DE GUARDADO Y FORMATO  ---
  //====================================================================================================================

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handleConfirmSave = async () => {
    setIsLoading(true);
    setShowModal(false);

    try {
      // Usamos el valor que ya trae el formulario (formData.cubica), que es el que puso el Tercero.
      const totalCubicaje = formData.cubica;

      // 1. Crear fecha combinada localmente (Lógica Original)
      const fechaLocal = new Date(
        `${formData.fecha}T${formData.horaLlegada}:00`,
      );

      // 2. Restar el offset de la zona horaria (Lógica Original)
      const fechaISO = new Date(
        fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000,
      ).toISOString();

      let remisionLastNumber = await fetchLastRemisionNumber();
      remisionLastNumber = (remisionLastNumber.data[0]?.remision || 0) + 1;

      // --- FUNCIONALIDAD DE ANTICIPOS (PRESERVADA) ---
      let estadoDeCuentaPayload = null;
      if (formData.tipoPago === "Pago por anticipado") {
        estadoDeCuentaPayload = await fetchPagosPorNoIngreso(
          estadoDeCuenta.no_ingreso,
        );
        estadoDeCuentaPayload = estadoDeCuentaPayload[0];
        let remisionesArray = eval(estadoDeCuentaPayload.remisiones);
        if (!isEditing) remisionesArray.push(remisionLastNumber);
        estadoDeCuentaPayload = {
          ...estadoDeCuentaPayload,
          remisiones: `[${remisionesArray}]`,
          valorRemisiones:
            estadoDeCuentaPayload.valorRemisiones +
            estadoDeCuenta.valorRemision -
            (editingMovement?.total || 0),
        };
        delete estadoDeCuentaPayload.saldo;
      }

      // --- FUNCIONALIDAD DE CRÉDITOS (PRESERVADA) ---
      let creditoActualizarPayload = null;
      if (isEditing && formData.idTipoPago === 4) {
        const respuestaCredito = await fetchCreditosPorNombre(formData.tercero);
        const creditoEnDB = respuestaCredito[0];
        creditoActualizarPayload = {
          ...creditoEnDB,
          valorRemisiones:
            creditoEnDB.valorRemisiones -
            editingMovement.total +
            calculos.total,
        };
      }

      const payloadHeader = {
        fecha: fechaISO,
        remision: remisionLastNumber,
        idTercero: formData.idTercero ? parseInt(formData.idTercero) : 0,
        idTipoPago: formData.idTipoPago,
        placa: formData.placa,

        // 🟩 CAMPOS DE PESAJE
        pesoEntrada: formData.usarPesaje ? Number(formData.pesoEntrada) : 0,
        pesoSalida: formData.usarPesaje ? Number(formData.pesoSalida) : 0,
        pesoNeto: formData.usarPesaje ? Number(formData.pesoNeto) : 0,
        imprimirPesaje: formData.imprimirPesaje,

        direccion: formData.direccion || "",
        observacion: formData.observacion || "",
        conductor: formData.conductor || "",
        cedula: formData.cedula || "",
        telefono: formData.telefono || "",
        no_ingreso: "",
        estado: "VIGENTE",
        pagado: 0,
        factura: 0,
        cubicaje: totalCubicaje, // Se guarda el valor literal (ej: 9.41)
        subtotal: Number(calculos.subtotal) || 0,
        iva: Number(calculos.iva) || 0,
        retencion: Number(calculos.retencion) || 0,
        total: Number(calculos.total) || 0,
        incluir_iva: formData.incluirIva ? 1 : 0,
        incluir_ret: formData.incluirRet ? 1 : 0,
        tercero: formData.tercero,
        horaLlegada: formData.horaLlegada,
        tipoPago: formData.tipoPago,
        estadoDeCuenta: estadoDeCuentaPayload ?? null,
      };

      if (isEditing) {
        setIsEditing(false);
        let datosActualizar = {
          ...formData,
          fecha: fechaISO,

          pesoEntrada: formData.usarPesaje ? Number(formData.pesoEntrada) : 0,
          pesoSalida: formData.usarPesaje ? Number(formData.pesoSalida) : 0,
          pesoNeto: formData.usarPesaje ? Number(formData.pesoNeto) : 0,

          incluir_iva: +formData.incluirIva,
          incluir_ret: +formData.incluirRet,
          factura: 0,
          observacion: formData.observacion,
          subtotal: Number(calculos.subtotal) || 0,
          iva: Number(calculos.iva) || 0,
          retencion: Number(calculos.retencion) || 0,
          total: Number(calculos.total) || 0,
          cubicaje: totalCubicaje,
        };

        const usuario = localStorage.getItem("usuario") || "Desconocido";

        // --- LÓGICA DE AUDITORÍA/CAMBIOS (PRESERVADA) ---
        let cambios = compararDatos(editingMovement, datosActualizar, usuario);

        lineItems.forEach((item, idx) => {
          cambios += compararDatos(editingItems.data[idx], item, usuario);
          updateMovimientoItems(editingMovement.remision, item);
        });

        datosActualizar = {
          ...datosActualizar,
          observacion: datosActualizar.observacion + cambios,
        };

        await updateMovimiento(editingMovement.remision, datosActualizar);
        if (estadoDeCuentaPayload)
          await updatePago(
            estadoDeCuentaPayload.no_ingreso,
            estadoDeCuentaPayload,
          );
        if (creditoActualizarPayload)
          await updateCredito(
            creditoActualizarPayload.idCredito,
            creditoActualizarPayload,
          );
      } else {
        const responseSaved = await onSave(payloadHeader, lineItems);
        // Creación del tercero si no existe
        console.log(payloadHeader);
        const originalTecero = await searchTerceroById(payloadHeader.idTercero);
        if (originalTecero[0].placa !== payloadHeader.placa) {
          const nuevoTerceroPayload = {
            nombre: payloadHeader.tercero,
            cedula: payloadHeader.cedula,
            telefono: payloadHeader.telefono,
            placa: payloadHeader.placa,
            cubica: payloadHeader.cubicaje,
            conductor: payloadHeader.conductor,
            direccion: payloadHeader.direccion,
          };
          createTercero(nuevoTerceroPayload);
        } else if (originalTecero[0].cubica !== payloadHeader.cubicaje) {
          const nuevoTerceroPayload = {
            idTercero: payloadHeader.idTercero,
            nombre: payloadHeader.tercero,
            cedula: payloadHeader.cedula,
            telefono: payloadHeader.telefono,
            placa: payloadHeader.placa,
            cubica: payloadHeader.cubicaje,
            conductor: payloadHeader.conductor,
            direccion: payloadHeader.direccion,
          };
          updateTercero(nuevoTerceroPayload.idTercero, nuevoTerceroPayload);
        }

        // - --------------------------------
        setFormData({
          ...payloadHeader,
          cubica: totalCubicaje,
          remision: responseSaved.data[0].remision,
        });
        // Recargar estado de materiales
        const materialesActualizados = await fetchMateriales();
        setMaterials(materialesActualizados);
      }

      setLastSavedRecord({
        ...payloadHeader,
        cubica: totalCubicaje,
        materiales: lineItems,
      });

      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Fallo al guardar:", error);
      alert(
        `❌ Error al guardar por falta de (cubicaje, material y/o cantidad): ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  //====================================================================================================================
  //----- función para nuevo registro -----
  const handleNewRecord = () => {
    const currentParts = getColombiaDateParts();

    //Resetear el formulario al estado inicial
    setFormData({
      ...initialFormData,
      remision: 0, // Para que no sobrescriba registros viejos
      fecha: currentParts.fecha,
      horaLlegada: currentParts.hora,
    });

    // Limpiar imagen de firma al iniciar un nuevo registro
    setSignatureImage(null);

    // SALIR DEL MODO EDICIÓN
    if (setIsEditing) {
      setIsEditing(false);
    }

    // Limpiar tablas y cálculos
    setLineItems(initialLineItems);
    setCalculos({ subtotal: 0, iva: 0, retencion: 0, total: 0 });
    setLastSavedRecord(null);

    // Limpiar persistencia local
    localStorage.removeItem(STORAGE_KEY);
  };

  //====================================================================================================================
  // --- VISTA PREVIA (CORREGIDA PARA EDICIÓN Y CONSULTA) ---
  const previewData = lastSavedRecord
    ? {
        ...lastSavedRecord,
        cubica: lastSavedRecord.cubica || formData.cubica,
        materiales: lastSavedRecord.materiales || lineItems,
      }
    : {
        ...formData,
        cubica: formData.cubica,
        materiales: lineItems,
        ...calculos,
      };
  //=====================================================================================================
  //-------------------------------------- FIRMA DEL TERCERO --------------------------------------------
  //=====================================================================================================

  const [signatureImage, setSignatureImage] = useState(null);

  const handleLoadSignature = async () => {
    try {
      const data = await fetchFirma();
      if (data && data.length > 0) {
        setSignatureImage(data[0].firma);
      } else {
        alert("No se encontró una firma guardada.");
      }
    } catch (error) {
      console.error("Error al cargar la firma:", error);
    }
  };

  //====================================================================================================================
  //----------------------------------------------------- todo lo estetico ---------------------------------------------
  //====================================================================================================================

  return (
    <div className="max-w-full mx-auto p-2 md:p-4 lg:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-8 items-start">
        <Modal
          show={showModal}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowModal(false)}
          confirmText={isEditing ? "SÍ, ACTUALIZAR DATOS" : "GUARDAR REGISTRO"}
          cancelText="VOLVER A REVISAR"
        >
          {/* Cabecera personalizada de alto impacto */}
          <div
            className={`${modalStyles.headerClass} text-center rounded-t-lg`}
          >
            <div className={`${modalStyles.iconSize} mb-2`}>
              {modalStyles.icon}
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {modalStyles.titleText}
            </h2>
          </div>

          {/* Cuerpo del Modal con mayor tamaño */}
          <div className={`p-8 ${modalStyles.borderColor} bg-white`}>
            <p className="text-2xl text-gray-800 font-semibold leading-tight">
              {isEditing
                ? "Estás a punto de SOBRESCRIBIR la información de esta remisión. Esta acción modificará los datos permanentes en la base de datos."
                : "¿La información es correcta? Se creará un nuevo folio en el sistema."}
            </p>

            {isEditing && (
              <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-300">
                <p className="text-amber-800 font-bold text-center">
                  EDITANDO REGISTRO UNIFICADO:{" "}
                  {formData.nombres_apellidos?.nombre || "ID: " + formData.id}
                </p>
              </div>
            )}
          </div>
        </Modal>

        {/* MODAL DE CONFIRMACIÓN */}
        <Modal
          show={showModal}
          title={
            <div className="flex items-center gap-2">
              <span>{modalStyles.icon}</span>
              <span>
                {isEditing ? "MODO EDICIÓN: ACTUALIZAR" : "NUEVO REGISTRO"}
              </span>
            </div>
          }
          message={
            <div
              className={`p-4 ${modalStyles.borderColor} bg-gray-50 rounded-r-lg`}
            >
              <p className="font-medium text-gray-800">
                {isEditing
                  ? "Atención: Estás modificando una remisión existente. Los datos anteriores serán reemplazados."
                  : "¿Deseas guardar esta nueva remisión en la base de datos?"}
              </p>
              {isEditing && (
                <p className="text-xs text-blue-600 mt-2 uppercase font-bold">
                  ID de Remisión: {formData.id}
                </p>
              )}
            </div>
          }
          onConfirm={handleConfirmSave}
          onCancel={() => setShowModal(false)}
          confirmText={isEditing ? "ACTUALIZAR AHORA" : "GUARDAR REGISTRO"}
          cancelText="CANCELAR"
          // Si tu componente Modal acepta clases personalizadas:
          confirmBtnClass={modalStyles.buttonClass}
        />

        {/*  MODAL (LIMPIAR) */}
        <Modal
          show={showClearModal}
          title="¿Reiniciar formulario?"
          message="Se perderán todos los datos ingresados en esta remisión. Esta acción no se puede deshacer."
          onConfirm={() => {
            handleNewRecord();
            setShowClearModal(false);
          }}
          onCancel={() => setShowClearModal(false)}
          confirmText="Sí, limpiar todo"
          cancelText="Continuar editando"
        />

        {/* FORMULARIO PRINCIPAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden xl:sticky xl:top-4 relative">
          {/* BARRA DE CARGA DINÁMICA DE ALTO IMPACTO */}
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1.5 z-50 overflow-hidden bg-slate-100/50 backdrop-blur-xs">
              <div
                className="h-full animate-progress-flow relative"
                style={{
                  width: "40%",
                  background: isEditing
                    ? "linear-gradient(90deg, transparent, #2563eb, #60a5fa, #ffffff, #60a5fa, #2563eb, transparent)"
                    : "linear-gradient(90deg, transparent, #10b981, #34d399, #ffffff, #34d399, #10b981, transparent)",
                  boxShadow: isEditing
                    ? "0 0 20px rgba(37, 99, 235, 0.6), 0 0 10px rgba(96, 165, 250, 0.4)"
                    : "0 0 20px rgba(16, 185, 129, 0.6), 0 0 10px rgba(52, 211, 153, 0.4)",
                }}
              >
                {/* Reflejo de luz que recorre la barra internamente */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
              </div>
            </div>
          )}

          {/* ENCABEZADO CON BOTÓN INTEGRADO */}
          <div className="bg-linear-to-r from-gray-50 to-white px-4 py-4 md:px-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-gray-700 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              <span>Datos de Remisión</span>
              {lastSavedRecord && (
                <span className="text-[10px] md:text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full uppercase">
                  REGISTRO GUARDADO
                </span>
              )}
            </h2>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="group flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-white bg-white hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-xl transition-all duration-300 shadow-sm"
            >
              <XCircle
                size={16}
                className="transition-transform duration-1000 group-hover:rotate-180"
              />
              <span>
                {editingMovement ? "Cancelar Edición" : "Limpiar Formulario"}
              </span>
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-5">
            {/* Si ya se guardó, solo mostramos el botón de Nuevo Registro */}
            {lastSavedRecord ? (
              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <p className="text-base md:text-lg font-semibold text-emerald-800 mb-4">
                  Remisión **{lastSavedRecord.remision}** Guardada Exitosamente.
                </p>
                <button
                  onClick={handleNewRecord}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={20} /> NUEVO REGISTRO
                </button>
                <p className="text-xs md:text-sm text-gray-600 mt-3">
                  Puede imprimir la remisión a la derecha.
                </p>
              </div>
            ) : (
              // Si no se ha guardado, mostramos el formulario completo
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup
                    label="Fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "fecha", value: e.target.value },
                      })
                    }
                  />
                  <InputGroup
                    label="No. Remisión"
                    name="remision"
                    value={formData.remision}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "remision", value: e.target.value },
                      })
                    }
                    validate={false}
                  />
                </div>

                {/* Cliente ocupa ancho completo */}
                <div className="grid grid-cols-1 gap-4">
                  <InputAutosuggest
                    label="Cliente / Tercero"
                    name="tercero"
                    value={formData.tercero}
                    onChange={(e) => handleChange(e)}
                    searchEndpoint={searchTercero}
                    textSuggestor="nombre"
                    keyItems="id_tercero"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CAMPO PLACA CON AUTOSUGGEST */}
                  <div className="md:col-span-2 relative">
                    <InputGroup
                      label="Placa Vehículo"
                      name={`placa_${Math.random()}`}
                      value={formData.placa}
                      onChange={(e) => {
                        const valor = e.target.value.toUpperCase();
                        handleChange({
                          target: { name: "placa", value: valor },
                        });
                        handleSearchPlaca(valor);
                      }}
                      // Cambiamos "off" por "nope" para forzar al navegador a ocultar su panel negro
                      autoComplete="new-password"
                    />

                    {/* LISTA DE SUGERENCIAS (La del fondo que queremos mantener) */}
                    {sugerenciasPlacas.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                        {sugerenciasPlacas.map((item, index) => (
                          <li
                            key={index}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center transition-colors"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                placa: item.placa,
                                cubica: item.cubica,
                                conductor: item.conductor,
                                direccion: item.direccion,
                                telefono: item.telefono,
                              }));
                              setSugerenciasPlacas([]);
                            }}
                          >
                            <span className="font-bold text-slate-700">
                              {item.placa}
                            </span>
                            <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                              Cub: {item.cubica}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CAMPO CUBICAJE (EDITABLE SI ES NECESARIO) */}
                  <InputGroup
                    label="Cubicaje"
                    name="cubica"
                    type="number"
                    step="0.01" // Para decimales
                    value={formData.cubica}
                    onChange={handleChange} //Cambios manual
                    placeholder="0.00"
                    className={formData.cubica ? "bg-blue-50" : "bg-white"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <InputGroup
                      label="Conductor"
                      name="conductor"
                      value={formData.conductor}
                      onChange={(e) => handleChange(e)}
                    />
                  </div>
                  <InputGroup
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange(e)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange(e)}
                    tooltip="Hacia a donde se dirige la carga"
                  />
                  <InputGroup
                    label="Cédula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={(e) => handleChange(e)}
                  />
                </div>

                {/*---- SECCIÓN DE PESAJE DESPLEGABLE --- */}
                <div className="mb-6 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    {/* Switch Principal */}
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.usarPesaje}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usarPesaje: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-bold text-blue-800 uppercase tracking-wider">
                          ¿Habilitar Control de Pesaje?
                        </span>
                      </label>
                    </div>

                    {/* SEGUNDO SWITCH: Control de Impresión (Solo visible si usarPesaje es true) */}
                    {formData.usarPesaje && (
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-sm animate-in zoom-in duration-300">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          Mostrar en Impresión:
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer scale-75">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.imprimirPesaje}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                imprimirPesaje: e.target.checked,
                              })
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    )}
                  </div>

                  {formData.usarPesaje && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 bg-white rounded-md border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <InputGroup
                        label="Peso Entr.(kg)"
                        name="pesoEntrada"
                        type="number"
                        value={formData.pesoEntrada}
                        onChange={handlePesoChange}
                        placeholder="Ej: 12000"
                      />
                      <InputGroup
                        label="Peso Salida (kg)"
                        name="pesoSalida"
                        type="number"
                        value={formData.pesoSalida}
                        onChange={handlePesoChange}
                        placeholder="Ej: 18500"
                      />
                      <div className="flex flex-col">
                        <label className="font-bold text-xs uppercase text-green-700 mb-1 tracking-tight">
                          Peso Neto
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            readOnly
                            value={formData.pesoNeto}
                            className="w-full bg-green-50 border-2 border-green-500 p-2.5 rounded text-lg font-mono font-bold text-green-700 text-right"
                          />
                          <span className="absolute left-3 top-2.5 text-green-600 font-bold text-sm">
                            KG
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                {/* --- Sección Materiales: Responsiva --- */}
                <div className="space-y-3 bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-100 overflow-x-auto">
                  <div className="min-w-[450px]">
                    <div className="grid grid-cols-3 gap-4 items-end mb-2">
                      <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                        Material
                      </div>
                      <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                        Cantidad (m³)
                      </div>
                      <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                        Precio Unitario
                      </div>
                    </div>

                    {lineItems.map((li, idx) => (
                      <div
                        key={li.id}
                        className="grid grid-cols-3 gap-4 items-center mb-3"
                      >
                        <div className="flex flex-col gap-1">
                          <select
                            name={`material-${idx}`}
                            value={li.idMaterial ?? li.nombre_material ?? ""}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              handleLineChange(idx, "idMaterial", selectedId);
                            }}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-xs md:text-sm"
                          >
                            <option value="">Seleccione un material</option>
                            {materials.map((m) => (
                              <option key={m.idMaterial} value={m.idMaterial}>
                                {m.nombre_material}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name={`cantidad-${idx}`}
                            value={li.cantidad === "" ? "" : li.cantidad}
                            onChange={(e) =>
                              handleLineChange(idx, "cantidad", e.target.value)
                            }
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-xs md:text-sm"
                            placeholder="..."
                          />
                        </div>

                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            name={`precioUnitario-${idx}`}
                            value={
                              li.precioUnitario === "" ? "" : li.precioUnitario
                            }
                            onChange={(e) =>
                              handleLineChange(
                                idx,
                                "precioUnitario",
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-xs md:text-sm"
                            placeholder="..."
                          />
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-lg px-2 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                            title="Eliminar material"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={addLine}
                      className="w-full sm:w-auto text-sm bg-transparent text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50"
                    >
                      + Agregar material
                    </button>

                    <div className="bg-emerald-50 p-3 rounded-lg w-full sm:w-auto min-w-[200px] border border-emerald-100 shadow-sm">
                      <div className="flex justify-between font-bold text-base md:text-lg text-emerald-700">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(calculos.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* --- Fin sección materiales --- */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="incluirIva"
                      checked={formData.incluirIva}
                      onChange={(e) => handleChange(e)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">IVA (19%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="incluirRet"
                      checked={formData.incluirRet}
                      onChange={(e) => handleChange(e)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Retención</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showIVARet}
                      onChange={(e) => setShowIVARet(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                      Mostrar IVA/Ret
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InputGroup
                    label="H. Llegada"
                    name="horaLlegada"
                    type="time"
                    value={formData.horaLlegada}
                    onChange={(e) => handleChange(e)}
                  />
                  <InputGroup
                    label="H. Salida"
                    name="horaSalida"
                    type="time"
                    value={formData.horaSalida}
                    onChange={(e) => handleChange(e)}
                    validate={false}
                  />

                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                      Tipo Pago
                    </label>

                    <select
                      name="tipoPago"
                      value={formData.tipoPago}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {/* Añadimos una key única para la opción por defecto */}
                      <option key="default-selection" value="">
                        Seleccione un tipo de pago
                      </option>

                      {paymentTypes.map((p, idx) => (
                        <option
                          key={p.id || `payment-${idx}`}
                          value={p.tipo_pago || p.name}
                        >
                          {p.tipo_pago || p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.tipoPago === "Pago por anticipado" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                        No. de ingreso
                      </label>
                      <select
                        name="no_ingreso"
                        value={estadoDeCuenta.no_ingreso}
                        onChange={(e) => handleChange(e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
                      >
                        <option value={0}>Seleccione un ingreso</option>
                        {pagosAnticipados.map((p) => (
                          <option key={p.no_ingreso} value={p.no_ingreso}>
                            {p.no_ingreso} - {formatCurrency(p.valor)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.tipoPago === "Pago por anticipado" &&
                  estadoDeCuenta.no_ingreso !== 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-2 shadow-inner">
                      <div className="flex items-center gap-2 mb-3 border-b border-emerald-100 pb-2">
                        <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                          <FileText size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-tight">
                          No. ingreso {estadoDeCuenta.no_ingreso}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-600 font-medium">
                            Anticipo:
                          </span>
                          <span className="text-gray-700 font-mono">
                            {formatCurrency(estadoDeCuenta.valorAnticipo)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-600 font-medium">
                            Saldo:
                          </span>
                          <span className="text-gray-700 font-mono">
                            {formatCurrency(estadoDeCuenta.saldo)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center sm:col-span-2 pt-2 border-t border-emerald-100">
                          <span className="text-emerald-800 font-bold">
                            Nuevo Saldo:
                          </span>
                          <span
                            className={`text-base font-bold font-mono ${
                              estadoDeCuenta.saldo -
                                estadoDeCuenta.valorRemision <
                              0
                                ? "text-red-600 animate-pulse"
                                : "text-emerald-700"
                            }`}
                          >
                            {formatCurrency(
                              estadoDeCuenta.saldo -
                                estadoDeCuenta.valorRemision,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                <InputGroup
                  label="Observaciones"
                  name="observacion"
                  value={formData.observacion}
                  onChange={(e) => handleChange(e)}
                  validate={false}
                  type="textarea"
                />

                <button
                  onClick={handleAttemptSave}
                  disabled={isLoading}
                  className={`w-full text-white font-bold py-4 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4 transition-all duration-300 ease-out group active:scale-95 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : isEditing
                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-400 hover:-translate-y-1"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-400 hover:-translate-y-1"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="tracking-widest">PROCESANDO...</span>
                    </>
                  ) : (
                    <>
                      <Save
                        size={20}
                        className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                      />
                      <span className="tracking-tight">
                        {isEditing ? "GUARDAR CAMBIOS" : "GUARDAR REMISIÓN"}
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        {/*=============================================================================================*/}
        {/* VISTA PREVIA */}
        {/*=============================================================================================*/}

        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-gray-600 flex items-center gap-2">
              <Printer size={18} /> Vista Previa
            </h3>

            {(lastSavedRecord || isEditing) && (
              <button
                onClick={() => window.print()}
                className={`text-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md ${
                  lastSavedRecord
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <Printer size={16} />{" "}
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            )}
          </div>

          <div className="bg-gray-100 p-2 md:p-4 rounded-xl border border-gray-200 overflow-x-auto">
            <div
              className="bg-white shadow-2xl p-4 md:p-8 min-h-[800px] w-full min-w-[650px] text-xs md:text-sm text-black font-sans border border-gray-200 relative mx-auto overflow-hidden"
              id="invoice-print"
            >
              {/* --- MARCA DE AGUA DE ANULACIÓN --- */}
              {previewData.estado === "ANULADA" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="border-8 border-red-500/20 p-4 rounded-xl -rotate-45">
                    <h1 className="text-red-500/20 text-9xl font-black uppercase tracking-widest select-none">
                      Anulada
                    </h1>
                  </div>
                </div>
              )}

              {/* Contenedor relativo con z-10 para que el contenido real esté sobre la marca de agua */}
              <div className="relative z-10">
                <div className="border-2 border-black mb-4">
                  <div className="flex items-center border-b-2 border-black bg-gray-50 p-3">
                    <img
                      src={LogoEmprecal}
                      alt="Logo Emprecal"
                      className="w-16 h-16 md:w-20 md:h-20 object-contain mr-4"
                    />
                    <div className="flex-1 text-center">
                      <div className="font-bold text-lg md:text-xl">
                        EMPRECAL S.A.S NIT. 804.002.739-1
                      </div>
                      <div className="text-[10px] md:text-xs font-normal mt-1 text-gray-600">
                        Kilómetro 9 vía San Gil - Socorro | Cel. 3138880467
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x-2 divide-black border-x-2 border-b-2 border-black">
                  <div className="p-3">
                    <div className="grid grid-cols-[70px_1fr] gap-y-2 text-sm md:text-base">
                      <span className="font-bold">Fecha:</span>
                      <span>
                        {previewData.fecha.toLocaleString("es-CO", {
                          timeZone: "America/Bogota",
                        })}
                      </span>
                      <span className="font-bold">Señores:</span>
                      <span className="uppercase font-medium truncate">
                        {previewData.tercero ||
                          "................................"}
                      </span>
                      <span className="font-bold">Direcc:</span>
                      <span className="uppercase font-medium truncate">
                        {previewData.direccion ||
                          "................................"}
                      </span>
                      <span className="font-bold">Cédula:</span>
                      <span className="uppercase font-medium">
                        {previewData.cedula ||
                          "................................"}
                      </span>
                      <span className="font-bold">Transp:</span>
                      <span className="uppercase font-medium truncate">
                        {previewData.conductor ||
                          "................................"}
                      </span>
                      <span className="font-bold">Llegada:</span>
                      <span className="uppercase font-medium">
                        {previewData.horaLlegada}
                      </span>
                      <span className="font-bold">Salida:</span>
                      <span className="uppercase font-medium">
                        {previewData.horaSalida}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <div className="grid grid-cols-[80px_1fr] gap-y-2 items-center ">
                      <span className="font-bold text-right pr-3">
                        REMISIÓN:
                      </span>
                      <span className="font-bold text-red-600 text-lg md:text-xl font-mono tracking-widest">
                        {formatearRemision(previewData.remision)}
                      </span>
                      <span className="font-bold text-right pr-3 text-sm md:text-base">
                        Celular:
                      </span>
                      <span>{previewData.telefono}</span>
                      <span className="font-bold text-right pr-3 text-sm md:text-base">
                        Placa:
                      </span>
                      <span className="uppercase border-2 border-black px-2 py-0.5 inline-block text-center font-bold w-24 bg-white">
                        {previewData.placa}
                      </span>
                      <span className="font-bold text-right pr-3 text-sm md:text-base ">
                        Pago:
                      </span>
                      <span className="text-[10px] md:text-xs uppercase">
                        {previewData.tipoPago}
                      </span>

                      <span className="font-bold text-right pr-3 text-sm md:text-base">
                        Cubica:
                      </span>

                      <span className="text-lg md:text-xl font-black uppercase px-1">
                        {previewData.cubica}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- SECCIÓN DE PESAJE --- */}
                {previewData &&
                  (previewData.imprimirPesaje || formData.imprimirPesaje) && (
                    <div className="border-x-2 border-b-2 border-black p-3 bg-white print:block">
                      <div className="flex justify-around items-center border-2 border-dashed border-gray-400 p-2 rounded-sm">
                        <div className="text-center">
                          <p className="text-[11px] font-bold text-gray-500 uppercase leading-none mb-1">
                            P. Entrada
                          </p>
                          <p className="text-xl font-mono font-bold text-black">
                            {Number(
                              previewData.pesoEntrada || 0,
                            ).toLocaleString()}
                            <span className="text-xs ml-1 font-sans">kg</span>
                          </p>
                        </div>

                        <div className="text-3xl text-gray-300 font-light">
                          |
                        </div>

                        <div className="text-center">
                          <p className="text-[11px] font-bold text-gray-500 uppercase leading-none mb-1">
                            P. Salida
                          </p>
                          <p className="text-xl font-mono font-bold text-black">
                            {Number(
                              previewData.pesoSalida || 0,
                            ).toLocaleString()}
                            <span className="text-xs ml-1 font-sans">kg</span>
                          </p>
                        </div>

                        <div className="text-3xl text-gray-300 font-light">
                          |
                        </div>

                        <div className="text-center px-6 py-1.5 bg-gray-50 border border-gray-200 rounded-sm">
                          <p className="text-[11px] font-bold text-green-700 uppercase leading-none mb-1">
                            Peso Neto
                          </p>
                          <p className="text-2xl font-mono font-black text-green-800">
                            {Number(
                              previewData.peso_neto ||
                                Number(previewData.pesoSalida) -
                                  Number(previewData.pesoEntrada) ||
                                0,
                            ).toLocaleString()}
                            <span className="text-sm ml-1 font-sans">kg</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Tabla de items */}
                <div className="border-x-2 border-b-2 border-black">
                  <div className="grid grid-cols-[80px_1fr_100px_100px] bg-gray-200 border-b-2 border-black font-bold text-center p-1 text-[10px] text-sm uppercase tracking-wider">
                    <div>Cantidad</div>
                    <div>Descripción</div>
                    <div>Precio Unit.</div>
                    <div>Total</div>
                  </div>

                  <div className="min-h-[60px]">
                    {previewData.materiales.map((li, i) => {
                      const cantidad = Number(li.cantidad) || 0;
                      const precio = Number(li.precioUnitario) || 0;
                      const total = cantidad * precio;
                      if (lastSavedRecord && cantidad === 0) return null;

                      return (
                        <div
                          key={`${li.id || i}-preview`}
                          className="grid grid-cols-[80px_1fr_100px_100px] text-center p-0.5 border-b border-gray-100 last:border-0 text-base"
                        >
                          <div className="py-0.5 font-medium">
                            {cantidad > 0 ? cantidad : ""}
                          </div>
                          <div className="py-0.5 uppercase text-left px-4 font-medium truncate">
                            {li.nombre_material || ""}
                          </div>
                          <div className="py-0.5 text-gray-600 font-mono">
                            {precio > 0 ? formatCurrency(precio) : ""}
                          </div>
                          <div className="py-0.5 font-medium font-mono">
                            {total > 0 ? formatCurrency(total) : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t-2 border-black text-sm">
                    <div className="grid grid-cols-[1fr_120px]">
                      <div className="text-right pr-3 font-bold py-0.5 border-r-2 border-black bg-gray-50">
                        SUBTOTAL:
                      </div>
                      <div className="text-right pr-3 py-0.5 font-mono">
                        {formatCurrency(previewData.subtotal)}
                      </div>
                    </div>

                    {showIVARet && previewData.incluirIva && (
                      <div className="grid grid-cols-[1fr_120px] border-t border-black text-sm">
                        <div className="text-right pr-3 font-bold py-0.5 border-r-2 border-black bg-gray-50">
                          IVA (19%):
                        </div>
                        <div className="text-right pr-3 py-0.5 font-mono">
                          {formatCurrency(previewData.iva)}
                        </div>
                      </div>
                    )}

                    {showIVARet && previewData.incluirRet && (
                      <div className="grid grid-cols-[1fr_120px] border-t border-black text-sm">
                        <div className="text-right pr-3 font-bold py-0.5 border-r-2 border-black bg-gray-50">
                          RETENCIÓN:
                        </div>
                        <div className="text-right pr-3 py-0.5 font-mono">
                          {formatCurrency(previewData.retencion)}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_120px] border-t-2 border-black bg-gray-200">
                      <div className="text-right pr-3 font-bold py-2 border-r-2 border-black text-base">
                        TOTAL A PAGAR:
                      </div>
                      <div className="text-right pr-3 py-1 font-bold text-base font-mono">
                        {showIVARet
                          ? formatCurrency(previewData.total)
                          : formatCurrency(previewData.subtotal)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-black p-3 min-h-[60px] rounded-sm my-4">
                  <span className="font-bold block text-[10px] uppercase text-gray-500">
                    Obs:
                  </span>
                  <span className="italic">{previewData.observacion}</span>
                </div>

                {/* ------------------------------------------------------ */}
                {/* SECCIÓN DE FIRMA: REDISEÑO ESTÉTICO */}
                <div className="mt-8 flex justify-between items-end">
                  <div className="text-center w-64 group">
                    {/* Contenedor de la rúbrica con línea estilizada */}
                    <div className="border-b-2 border-slate-900 mb-2 relative h-16 flex items-center justify-center transition-colors duration-300 group-hover:border-blue-500">
                      {signatureImage ? (
                        <img
                          src={signatureImage}
                          alt="Firma"
                          /* La firma ahora tiene un ligero efecto de elevación sobre la línea */
                          className="max-h-16 object-contain absolute bottom-1 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        /* Placeholder visual elegante cuando no hay firma */
                        <span className="text-slate-300 text-[9px] uppercase tracking-[0.2em] font-black opacity-40 select-none">
                          FIRMA TERCERO
                        </span>
                      )}
                    </div>

                    {/* Etiqueta del Tercero con mejor tipografía */}
                    <p className="font-black text-[10px] text-slate-800 uppercase tracking-widest">
                      FIRMA TERCERO
                    </p>

                    {/* BOTÓN REESTILIZADO: Se eliminó el azul genérico por uno con profundidad y gradiente */}
                    <button
                      onClick={handleLoadSignature}
                      className="no-print mt-4 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-95 border border-slate-700/50"
                    >
                      <PenTool size={14} className="opacity-80" />
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        Cargar Firma
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        await updateFirmaLimpiar();
                        await handleLoadSignature();
                      }} // Asegúrate de que esta sea la función correcta para borrar
                      className="no-print mt-4 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-red-100 hover:shadow-red-200 active:scale-95 border border-red-500/50"
                    >
                      <Eraser size={14} className="opacity-90" />
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        Limpiar firma
                      </span>
                    </button>
                  </div>
                </div>
                {/* --------------------------------------------- */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
