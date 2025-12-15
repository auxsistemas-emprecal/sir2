// src/components/InvoiceGenerator.jsx

import React, { useState, useEffect } from "react";
import LogoEmprecal from "../assets/services/img/Estrategia-comercial.png";

import { Save, Printer, FileText, PlusCircle, XCircle } from "lucide-react";
import InputGroup from "./InputGroup";
import InputAutosuggest from "../components/InputAutosuggest";
import { createMovimiento } from "../assets/services/apiService";
import {
  searchTercero,
  fetchPreciosEspeciales,
  fetchMateriales,
  fetchLastRemisionNumber,
  fetchMovimiento,
  updateMovimiento,
  updateMovimientoItems,
} from "../assets/services/apiService";

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
        <p className="text-gray-600">{message}</p>
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
}) {
  const [nextRemisionNumber, setNextRemisionNumber] = useState(null);

  const defaultPaymentType =
    paymentTypes.length > 0
      ? paymentTypes[0]
      : { tipo_pago: "Efectivo", idTipoPago: 1, name: "Efectivo" };

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
    incluirIva: false,
    incluirRet: false,
    tipoPago:
      paymentTypes.length > 0
        ? paymentTypes[0].tipo_pago ?? paymentTypes[0].name
        : "Efectivo",
    idTipoPago: paymentTypes.length > 0 ? paymentTypes[0].idTipoPago ?? 1 : 1, // <--- 🛑 NUEVO: Para guardar el ID del tipo de pago
    observacion: "",
    horaLlegada: initialDateParts.hora,
    horaSalida: "",
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

  const [formData, setFormData] = useState(initialFormData);
  const [lineItems, setLineItems] = useState(initialLineItems);
  const [calculos, setCalculos] = useState({
    subtotal: 0,
    iva: 0,
    retencion: 0,
    total: 0,
  });
  const [showIVARet, setShowIVARet] = useState(true);

  //---------------------------------------------------------------------------------
  //---------------------------------------------------------------------------------

  // --- NUEVOS ESTADOS ---
  const [showModal, setShowModal] = useState(false);
  const [lastSavedRecord, setLastSavedRecord] = useState(null); // Almacena el registro guardado para la vista/impresión
  const [preciosEspeciales, setPreciosEspeciales] = useState([]);
  // ----------------------

  //=====================================================================================
  //                                EDITAR
  //======================================================================================
  useEffect(() => {
    (async () => {
      // 1. Verificar que estamos en modo edición y que los datos existen
      if (editingMovement && editingItems.data.length > 0) {
        console.log(
          "Modo Edición: Inicializando formulario con datos compartidos."
        );

        const responseMovimiento = await fetchMovimiento(
          editingMovement.remision
        );

        // -----------------------------------------------------------
        // A. Inicializar la Cabecera (formData) Editar
        // -----------------------------------------------------------
        if (!isEditing) return;

        setFormData(() => {
          const { fecha, hora } = getColombiaDateParts(editingMovement.fecha);

          const toReturn = {
            // Mantenemos las claves de la cabecera que vienen de la prop
            ...editingMovement,

            // Mapeo de valores si es necesario.
            idTercero: parseInt(responseMovimiento.idTercero),
            idTipoPago: parseInt(responseMovimiento.idTipoPago),
            incluirIva: Boolean(editingMovement.incluir_iva),
            incluirRet: Boolean(editingMovement.incluir_ret),
            fecha: fecha,
            horaLlegada: hora,

            // Si tiene un campo 'date', asegúrese de que el formato sea el correcto para el input.
          };

          return toReturn;
        });

        // -----------------------------------------------------------
        // B. Inicializar los Ítems (lineItems)
        // -----------------------------------------------------------
        // Mapeamos los ítems detallados para asegurarnos de que los valores numéricos
        // (cantidad, precio) sean Strings, si sus inputs esperan strings.
        const mappedItems = editingItems.data.map((item) => ({
          ...item,
          // Aseguramos que los valores que van a los inputs de texto sean strings
          idMaterial: item.idMaterial,
          cantidad: String(item.cantidad),
          precioUnitario: String(item.precioUnitario),

          // Si necesita el nombre del material, lo puede añadir aquí
          // nombreMaterial: item.nombreMaterial // Asumiendo que viene en la prop o lo puede buscar
        }));

        setLineItems(mappedItems);
      } else {
        // 🛑 Lógica para LIMPIAR al salir de la edición
        // Si no hay datos de edición, resetear a los valores iniciales por defecto.<
        // Esto es crucial cuando se pasa de EDITAR a CREAR una nueva remisión.
        // (Asumiendo que tiene un initialFormData y un initialLineItems o [] para el reset)
        setFormData(initialFormData);
        setLineItems([]);
      }
    })();
  }, [editingMovement, editingItems]);

  // si cambia la lista de materials, actualizamos la primer línea si estaba vacía
  useEffect(() => {
    (async () => {
      // cargar precios especiales si no están cargados
      if (preciosEspeciales.length === 0) {
        const responsePE = await fetchPreciosEspeciales();
        setPreciosEspeciales(responsePE);
      }
    })();
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

  const handleChange = (e) => {
    const { name, value, type, checked, completeObject } = e.target;

    // 1. Lógica para el Tercero (InputAutosuggest)
    if (name == "tercero" && typeof completeObject == "object") {
      setFormData((prev) => ({
        ...prev,
        conductor: completeObject.conductor,
        cedula: completeObject.cedula,
        // CORRECCIÓN AQUÍ: Usar directamente el id del objeto seleccionado
        idTercero: completeObject.id_tercero,
        tercero: completeObject.nombre,
        telefono: completeObject.telefono,
        direccion: completeObject.direccion,
        placa: completeObject.placa,
      }));
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

    // 2. Lógica para Tipo de Pago
    if (name === "tipoPago") {
      // Buscar el ID en la lista de tipos de pago
      const selectedPayment = paymentTypes.find(
        (p) => (p.tipo_pago || p.name) === value
      );

      setFormData((prev) => ({
        ...prev,
        tipoPago: value,
        // CORRECCIÓN AQUÍ: Usar el ID del pago encontrado
        idTipoPago: selectedPayment?.idTipoPago || selectedPayment?.id || null,
      }));
      return;
    }

    // 3. Inputs normales
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
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
              const id_tercero_material =
                formData.idTercero + "_" + selected.idMaterial;
              const materialPE = preciosEspeciales.filter(
                (el) => el.id_tercero_material === id_tercero_material
              );
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
                (el) => el.id_tercero_material === id_tercero_material
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
      })
    );
  };

  const addLine = () => {
    const newLine = {
      id: Date.now() + Math.random(),
      idMaterial: materials.length > 0 ? materials[0].idMaterial : null,
      nombre_material: materials.length > 0 ? materials[0].nombre_material : "",
      cantidad: 0,
      precioUnitario: materials.length > 0 ? materials[0].precio ?? 0 : 0,
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
  const handleAttemptSave = () => {
    // 1. Validaciones básicas: cliente y al menos una cantidad > 0
    const anyCantidad = lineItems.some(
      (li) => (parseFloat(li.cantidad) || 0) > 0
    );
    if (!formData.tercero || !anyCantidad) {
      alert(
        "Asegúrate de ingresar Cliente/Tercero y al menos una Cantidad mayor a 0 en los materiales."
      );
      return;
    }
    // 2. Si las validaciones pasan, mostramos el modal
    setShowModal(true);
  };

  function compararDatos(
    datosOriginales = {},
    datosModificados = {},
    usuario = ""
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

  const handleConfirmSave = async () => {
    setShowModal(false);

    const totalCubicaje = lineItems.reduce((acc, item) => {
      return acc + (Number(item.cantidad) || 0);
    }, 0);

    // 1. Crear fecha combinada localmente
    const fechaLocal = new Date(`${formData.fecha}T${formData.horaLlegada}:00`);

    // 2. Restar el offset de la zona horaria para neutralizar la conversión a UTC
    const fechaISO = new Date(
      fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000
    ).toISOString();

    let remisionLastNumber = await fetchLastRemisionNumber();
    remisionLastNumber = remisionLastNumber.data[0]?.remision || 0;

    const payloadHeader = {
      fecha: fechaISO,
      remision: remisionLastNumber + 1,
      idTercero: formData.idTercero ? parseInt(formData.idTercero) : 0,
      idTipoPago: formData.idTipoPago,
      placa: formData.placa || "",
      direccion: formData.direccion || "",
      observacion: formData.observacion || "",
      conductor: formData.conductor || "",
      cedula: formData.cedula || "",
      telefono: formData.telefono || "",
      no_ingreso: "",
      estado: "VIGENTE",
      pagado: 0,
      factura: 0,
      cubicaje: totalCubicaje,
      subtotal: Number(calculos.subtotal) || 0,
      iva: Number(calculos.iva) || 0,
      retencion: Number(calculos.retencion) || 0,
      total: Number(calculos.total) || 0,
      incluir_iva: formData.incluirIva ? 1 : 0,
      incluir_ret: formData.incluirRet ? 1 : 0,
      tercero: formData.tercero,
      horaLlegada: formData.horaLlegada,
      telefono: formData.telefono,
      tipoPago: formData.tipoPago,
    };

    console.log("Payload: ", payloadHeader);

    try {
      if (isEditing) {
        setIsEditing(false);
        let datosActualizar = {
          ...formData,
          // IMPORTANTE: Usar la misma lógica de fechaISO aquí también
          fecha: fechaISO,
          incluir_iva: +formData.incluirIva,
          incluir_ret: +formData.incluirRet,
          factura: 0,
          observacion: formData.observacion,
          subtotal: Number(calculos.subtotal) || 0,
          iva: Number(calculos.iva) || 0,
          retencion: Number(calculos.retencion) || 0,
          total: Number(calculos.total) || 0,
        };

        const usuario = localStorage.getItem("usuario") || "desconocido";

        let cambios = compararDatos(editingMovement, datosActualizar, usuario);
        lineItems.forEach((item, idx) => {
          cambios += compararDatos(editingItems.data[idx], item, usuario);
          updateMovimientoItems(editingMovement.remision, item);
        });
        datosActualizar = {
          ...datosActualizar,
          observacion: datosActualizar.observacion + cambios,
        };
        updateMovimiento(editingMovement.remision, datosActualizar);
        window.location.reload();
        setActiveTab("generador");
      } else {
        const responseSaved = await onSave(payloadHeader, lineItems);
        setFormData({
          ...payloadHeader,
          remision: responseSaved.data[0].remision,
        });
      }

      // --- LÓGICA DE ÉXITO ---
      setLastSavedRecord({ ...payloadHeader, materiales: lineItems });

      // Reseteo del formulario
      // setFormData((prev) => {
      //   const nextRemisionNumber = parseInt(prev.remision, 10);
      //   const nextRemision = isNaN(nextRemisionNumber)
      //     ? prev.remision
      //     : (nextRemisionNumber + 1).toString();
      //   return {
      //     ...prev,
      //     remision: nextRemision,
      //     observacion: "",
      //     conductor: "",
      //     placa: "",
      //     tercero: "",
      //     idTercero: null,
      //     telefono: "",
      //     direccion: "",
      //     cedula: "",
      //     factura: 0,
      //   };
      // });
      // setLineItems(initialLineItems);
    } catch (error) {
      console.error("Fallo al guardar:", error);
      // Muestra el mensaje de error que propagó App.jsx
      alert(`❌ Error al guardar: ${error.message}`);
    }
  };

  const handleNewRecord = () => {
    const currentParts = getColombiaDateParts(); // Usar la función auxiliar

    setFormData((prev) => ({
      ...initialFormData,
      remision: prev.remision,
      fecha: currentParts.fecha, // Fecha Colombia
      horaLlegada: currentParts.hora, // Hora Colombia
    }));
    setLineItems(initialLineItems);
    setCalculos({ subtotal: 0, iva: 0, retencion: 0, total: 0 });
    setLastSavedRecord(null);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  // Determinar qué datos usar para la vista previa: el guardado si existe, o el formulario actual
  const previewData = lastSavedRecord || {
    ...formData,
    materiales: lineItems.map((li) => ({
      ...li,
      cantidad: Number(li.cantidad) || 0,
      precioUnitario: Number(li.precioUnitario) || 0,
    })),
    ...calculos,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* 1. MODAL DE CONFIRMACIÓN */}
      <Modal
        show={showModal}
        title="Confirmar Registro"
        message={`¿Estás seguro de que la Remisión ha sido diligenciada correctamente y deseas guardarla?`}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowModal(false)}
        confirmText="Confirmar Guardado"
        cancelText="Revisar"
      />

      {/* FORMULARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
        <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Datos de
            Remisión
            {lastSavedRecord && (
              <span className="text-sm font-normal ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                REGISTRO GUARDADO
              </span>
            )}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Si ya se guardó, solo mostramos el botón de Nuevo Registro */}
          {lastSavedRecord ? (
            <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-lg font-semibold text-emerald-800 mb-4">
                Remisión **{lastSavedRecord.remision}** Guardada Exitosamente.
              </p>
              <button
                onClick={handleNewRecord}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle size={20} /> NUEVO REGISTRO
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Puede imprimir la remisión a la derecha.
              </p>
            </div>
          ) : (
            // Si no se ha guardado, mostramos el formulario completo
            <>
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputAutosuggest
                  label="Cliente / Tercero"
                  name="tercero"
                  value={formData.tercero}
                  onChange={(e) => handleChange(e)}
                  searchEndpoint={searchTercero}
                  textSuggestor="nombre"
                  keyItems="id_tercero"
                />
                <InputGroup
                  label="Placa Vehículo"
                  name="placa"
                  value={formData.placa}
                  onChange={(e) => handleChange(e)}
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

              <div className="h-px bg-gray-200 my-2"></div>

              {/* --- Sección Materiales: múltiple filas --- */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                    Material
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                    Cantidad (m³)
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                    Precio Unitario
                  </div>
                </div>

                {lineItems.map((li, idx) => (
                  <div
                    key={li.id}
                    className="grid grid-cols-3 gap-4 items-center"
                  >
                    {/* Select material */}
                    <div className="flex flex-col gap-1">
                      <select
                        name={`material-${idx}`}
                        value={li.idMaterial ?? li.nombre_material ?? ""}
                        onChange={(e) => {
                          // preferimos trabajar por idMaterial si el select usa id
                          const selectedId = e.target.value;
                          // si las opciones usan idMaterial como value, buscar por id
                          handleLineChange(idx, "idMaterial", selectedId);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
                      >
                        <option value="">Seleccione un material</option>
                        {materials.map((m) => (
                          <option key={m.idMaterial} value={m.idMaterial}>
                            {m.nombre_material}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
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
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
                        placeholder="..."
                      />
                    </div>

                    {/* Precio unitario + eliminar */}
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
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
                        placeholder="..."
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-sm px-3 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                        title="Eliminar material"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-sm bg-transparent text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50"
                  >
                    + Agregar material
                  </button>

                  <div className="bg-emerald-50 p-3 rounded-lg w-full sm:w-auto min-w-[220px] border border-emerald-100 shadow-sm">
                    <div className="flex justify-between font-bold text-lg text-emerald-700">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(calculos.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* --- Fin sección materiales --- */}

              {/* Totales Opcionales */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="incluirIva"
                      checked={formData.incluirIva}
                      onChange={(e) => handleChange(e)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                      Incluir IVA (19%)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="incluirRet"
                      checked={formData.incluirRet}
                      onChange={(e) => handleChange(e)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                      Incluir Retención
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="incluirRet"
                      checked={showIVARet}
                      onChange={(e) => setShowIVARet(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                      Mostrar IVA y Retención
                    </span>
                  </label>
                </div>
              </div>

              {/* Horas y Tipo de Pago */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputGroup
                  label="Hora Llegada"
                  name="horaLlegada"
                  type="time"
                  value={formData.horaLlegada}
                  onChange={(e) => handleChange(e)}
                />
                <InputGroup
                  label="Hora Salida"
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
                    onChange={(e) => handleChange(e)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
                  >
                    {paymentTypes.map((p) => (
                      <option
                        key={p.idTipoPago ?? p.id}
                        value={p.tipo_pago ?? p.name ?? p.tipoPago}
                      >
                        {p.tipo_pago ?? p.name ?? p.tipoPago}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <InputGroup
                label="Observaciones"
                name="observacion"
                value={formData.observacion}
                onChange={(e) => handleChange(e)}
                validate={false}
                type="textarea"
              />

              {/* El botón ahora llama a handleAttemptSave para mostrar el modal */}
              <button
                onClick={handleAttemptSave}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4 ${
                  isEditing
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                }`}
              >
                <Save size={20} />{" "}
                {isEditing ? "GUARDAR CAMBIOS" : "GUARDAR REMISIÓN"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* VISTA PREVIA */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-600 flex items-center gap-2">
            <Printer size={18} /> Vista Previa
          </h3>
          <button
            onClick={() => window.print()}
            // El color ahora es azul si el registro está guardado (para destacar la acción de impresión)
            className={`text-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md ${
              lastSavedRecord
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>

        <div
          className="bg-white shadow-2xl p-8 min-h-[800px] text-xs md:text-sm text-black font-sans border border-gray-200 relative"
          id="invoice-print"
        >
          <div className="border-2 border-black mb-4">
            {/* CONTENEDOR FLEX PARA LOGO + TEXTO */}
            <div className="flex items-center border-b-2 border-black bg-gray-50 p-3">
              {/* LOGO IZQUIERDA */}
              <img
                src={LogoEmprecal}
                alt="Logo Emprecal"
                className="w-20 h-20 object-contain mr-4"
              />

              {/* TEXTO CENTRADO */}
              <div className="flex-1 text-center">
                <div className="font-bold text-xl">
                  EMPRECAL S.A.S NIT. 804.002.739-1
                </div>
                <div className="text-xs font-normal mt-1 text-gray-600">
                  Kilómetro 9 vía San Gil - Socorro | Cel. 3138880467
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x-2 divide-black">
            <div className="p-3">
              <div className="grid grid-cols-[70px_1fr] gap-y-2">
                <span className="font-bold">Fecha:</span>
                <span>
                  {previewData.fecha.toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                  })}
                </span>
                <span className="font-bold">Señores:</span>
                <span className="uppercase font-medium">
                  {previewData.tercero || "................................"}
                </span>
                <span className="font-bold">Dirección:</span>
                <span className="uppercase font-medium">
                  {previewData.direccion || "................................"}
                </span>
                <span className="font-bold">Cédula:</span>
                <span className="uppercase font-medium">
                  {previewData.cedula || "................................"}
                </span>
                <span className="font-bold">Transp.:</span>
                <span className="uppercase font-medium">
                  {previewData.conductor || "................................"}
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
              <div className="grid grid-cols-[80px_1fr] gap-y-1 items-center">
                <span className="font-bold text-right pr-3">REMISIÓN:</span>
                <span className="font-bold text-red-600 text-xl font-mono tracking-widest">
                  {previewData.remision}
                </span>
                <span className="font-bold text-right pr-3">Celular:</span>
                <span>{previewData.telefono}</span>
                <span className="font-bold text-right pr-3">Placa:</span>
                <span className="uppercase border-2 border-black px-2 py-0.5 inline-block text-center font-bold w-24 bg-white">
                  {previewData.placa}
                </span>
                <span className="font-bold text-right pr-3">Pago:</span>
                <span>{previewData.tipoPago}</span>
              </div>
            </div>
          </div>

          {/* Tabla de items con múltiples filas */}
          <div className="border-2 border-black mb-4">
            <div className="grid grid-cols-[80px_1fr_100px_100px] bg-gray-200 border-b-2 border-black font-bold text-center p-2 text-xs uppercase tracking-wider">
              <div>Cantidad</div>
              <div>Descripción</div>
              <div>Precio Unit.</div>
              <div>Total</div>
            </div>

            <div>
              {" "}
              {/* Div va a ir vacio para poner los materiales vendidos */}
              {previewData.materiales.map((li, i) => {
                const cantidad = Number(li.cantidad) || 0;
                const precio = Number(li.precioUnitario) || 0;
                const total = cantidad * precio;
                // Mostrar solo las líneas con cantidad > 0 si ya está guardado, o todas si no.
                if (lastSavedRecord && cantidad === 0) return null;

                return (
                  <div
                    // key={li.id + "-preview"}
                    key={`${li.id || i}-preview`}
                    className="grid grid-cols-[80px_1fr_100px_100px] text-center p-1 content-start"
                  >
                    <div className="py-2 font-medium">
                      {cantidad > 0 ? cantidad : ""}
                    </div>
                    <div className="py-2 uppercase text-left px-4 font-medium">
                      {li.nombre_material || ""}
                    </div>
                    <div className="py-2 text-gray-600">
                      {precio > 0 ? formatCurrency(precio) : ""}
                    </div>
                    <div className="py-2 font-medium">
                      {total > 0 ? formatCurrency(total) : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t-2 border-black text-sm">
              <div className="grid grid-cols-[1fr_120px]">
                <div className="text-right pr-3 font-bold py-1 border-r-2 border-black bg-gray-50">
                  SUBTOTAL:
                </div>
                <div className="text-right pr-3 py-1 font-mono">
                  {formatCurrency(previewData.subtotal)}
                </div>
              </div>

              {showIVARet && previewData.incluirIva && (
                <div className="grid grid-cols-[1fr_120px] border-t border-black">
                  <div className="text-right pr-3 font-bold py-1 border-r-2 border-black bg-gray-50">
                    IVA (19%):
                  </div>
                  <div className="text-right pr-3 py-1 font-mono">
                    {formatCurrency(previewData.iva)}
                  </div>
                </div>
              )}

              {showIVARet && previewData.incluirRet && (
                <div className="grid grid-cols-[1fr_120px] border-t border-black">
                  <div className="text-right pr-3 font-bold py-1 border-r-2 border-black bg-gray-50">
                    RETENCIÓN:
                  </div>
                  <div className="text-right pr-3 py-1 font-mono">
                    {formatCurrency(previewData.retencion)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-[1fr_120px] border-t-2 border-black bg-gray-200">
                <div className="text-right pr-3 font-bold py-2 border-r-2 border-black text-base">
                  TOTAL A PAGAR:
                </div>
                <div className="text-right pr-3 py-2 font-bold text-base font-mono">
                  {formatCurrency(previewData.total)}
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-black p-3 min-h-[60px] rounded-sm mb-4">
            <span className="font-bold block text-xs uppercase text-gray-500">
              Obs:
            </span>{" "}
            <span className="italic">{previewData.observacion}</span>
          </div>
          {/* SECCIÓN DE FIRMA (ALINEADA A LA DERECHA CON ESPACIO SUPERIOR) */}
          <div className="w-full mt-8 flex items-center gap-4 pr-70">
            <p className="font-bold uppercase tracking-wide whitespace-nowrap">
              Firma tercero:
            </p>
            <div className="flex-1 border-t-2 border-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
