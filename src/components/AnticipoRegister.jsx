import React, { useState, useEffect } from "react";
import { Save, Printer, DollarSign, BrushCleaning } from "lucide-react";
import InputGroup from "./InputGroup";
import InputAutosuggest from "./InputAutosuggest.jsx";
import { searchTercero } from "../assets/services/apiService.js";

// ====================================================================
// 🟩 Funcion para escribir los numeros en letras
// ====================================================================

// Convertir números a letras en español (hasta miles de millones)
function numeroALetras(num) {
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const especiales = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];
  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  if (num === 0) return "cero";

  function convertir(n) {
    if (n < 10) return unidades[n];
    if (n < 20) return especiales[n - 10];
    if (n < 100) {
      let d = Math.floor(n / 10);
      let r = n % 10;
      return decenas[d] + (r > 0 ? " y " + unidades[r] : "");
    }
    if (n < 1000) {
      if (n === 100) return "cien";
      let c = Math.floor(n / 100);
      let r = n % 100;
      return centenas[c] + (r > 0 ? " " + convertir(r) : "");
    }
    if (n < 1000000) {
      let miles = Math.floor(n / 1000);
      let r = n % 1000;
      return (
        (miles === 1 ? "mil" : convertir(miles) + " mil") +
        (r > 0 ? " " + convertir(r) : "")
      );
    }
    if (n < 1000000000000) {
      let millones = Math.floor(n / 1000000);
      let r = n % 1000000;
      return (
        (millones === 1 ? "un millón" : convertir(millones) + " millones") +
        (r > 0 ? " " + convertir(r) : "")
      );
    }
    return "";
  }

  return convertir(num);
}

// ====================================================================

export default function AnticipoRegister({
  terceros,
  paymentTypes,
  onSaveAnticipo,
  onLoadAnticipoByNoComprobante,
  noComprobanteToEdit,
}) {
  const initialFormData = {
    fecha: new Date().toISOString().split("T")[0],
    idTercero: "",
    tipo: "Anticipo",
    remisiones: "[]",
    valor: "",
    no_ingreso: "",
    tercero: "",
    cedula: "",
    telefono: "",
    direccion: "",
    concepto: "",
    idTipoPago: "1",
    tipoPago:
      paymentTypes.length > 0
        ? paymentTypes[0].tipo_pago
        : "Seleccionar tipo de pago",
    pagado: 0,
    sumaLetras: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Variable para determinar el modo: Registro (false) o Ver/Editar (true)
  const isEditing = !!noComprobanteToEdit;

  // ================================================================
  //  useEffect para calcular Suma en Letras (Escucha cambios en 'valor')
  // ================================================================
  useEffect(() => {
    const valorNumerico = parseFloat(formData.valor) || 0;

    if (valorNumerico > 0) {
      const texto = numeroALetras(valorNumerico);
      const nuevaSumaLetras = `${texto} PESOS `.toUpperCase();

      // Solo actualiza si el texto realmente cambió para evitar bucles infinitos
      if (formData.sumaLetras !== nuevaSumaLetras) {
        setFormData((prev) => ({
          ...prev,
          sumaLetras: nuevaSumaLetras,
        }));
      }
    } else {
      if (formData.sumaLetras !== "") {
        setFormData((prev) => ({ ...prev, sumaLetras: "" }));
      }
    }
  }, [formData.valor, formData.sumaLetras]);

  // ===================================================================
  // useEffect para Cargar Datos (Modo Ver/Editar)
  // ====================================================================
  useEffect(() => {
    const loadData = async () => {
      if (!noComprobanteToEdit || !paymentTypes || !terceros) return;

      try {
        setLoading(true);
        const anticipo = await onLoadAnticipoByNoComprobante(
          noComprobanteToEdit
        );

        if (anticipo) {
          const tipoEncontrado = paymentTypes.find(
            (t) => String(t.idTipoPago) === String(anticipo.idTipoPago)
          );

          const terceroLocal = terceros.find(
            (ter) =>
              String(ter.id || ter.idTercero) === String(anticipo.idTercero)
          );

          // Calculamos letras para la carga inicial
          const v = parseFloat(anticipo.valor || anticipo.valorAnticipo) || 0;
          const letrasIniciales =
            v > 0 ? `${numeroALetras(v)} PESOS`.toUpperCase() : "";

          const baseData = {
            ...initialFormData,
            noComprobante: anticipo.no_ingreso || anticipo.noComprobante,
            no_ingreso: anticipo.no_ingreso || anticipo.noComprobante,
            fecha: anticipo.fecha
              ? anticipo.fecha.split("T")[0]
              : initialFormData.fecha,
            idTercero: anticipo.idTercero,
            tipo: anticipo.tipo || "Anticipo",
            valor: String(anticipo.valor || anticipo.valorAnticipo || ""),
            cedula: anticipo.cedula || "",
            telefono: anticipo.telefono || "",
            direccion: anticipo.direccion || "",
            concepto: anticipo.concepto || "",
            idTipoPago: String(anticipo.idTipoPago || "1"),
            tipoPago: tipoEncontrado ? tipoEncontrado.tipo_pago : "Efectivo",
            tercero: terceroLocal
              ? terceroLocal.nombre
              : anticipo.tercero || "",
            sumaLetras: letrasIniciales,
          };

          // Búsqueda de tercero externa
          if (
            !terceroLocal &&
            anticipo.idTercero &&
            typeof searchTercero === "function"
          ) {
            try {
              const terceroData = await searchTercero(anticipo.idTercero);
              if (terceroData && terceroData.length > 0) {
                baseData.tercero = terceroData[0].nombre;
              }
            } catch (err) {
              console.error("Error búsqueda tercero:", err);
            }
          }

          setFormData(baseData);
        }
      } catch (error) {
        console.error("Error cargando anticipo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    noComprobanteToEdit,
    onLoadAnticipoByNoComprobante,
    paymentTypes,
    terceros,
  ]);

  //================================================================
  // useEffect para calcular Suma en Letras
  //================================================================
  useEffect(() => {
    const valor = parseFloat(formData.valor) || 0;

    if (valor > 0) {
      const texto = numeroALetras(valor);
      setFormData((prev) => ({
        ...prev,
        sumaLetras: `${texto} PESOS`.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, sumaLetras: "" }));
    }
  }, [formData.valor]);

  // Función para seleccionar un Tercero y llenar campos automáticamente
  const seleccionarTercero = (tercero) => {
    setFormData((prev) => ({
      ...prev,
      tercero: tercero.tercero,
      cedula: tercero.cedula || "",
      telefono: tercero.telefono || "",
      direccion: tercero.direccion || "",
    }));
    setSugerencias([]); // Oculta sugerencias
  };

  const handleChange = (e) => {
    if (isEditing) return; //  Bloquea cambios si está en modo Ver

    const { name, value } = e.target;

    // Manejo especial para Autocompletado de Tercero
    if (name === "tercero") {
      const completeObject = e.target.completeObject;
      if (completeObject) {
        setFormData((prev) => ({
          ...prev,
          idTercero: completeObject.id_tercero,
          tercero: value,
          cedula: completeObject.cedula || "",
          telefono: completeObject.telefono || "",
          direccion: completeObject.direccion || "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === "tipoPago") {
      const selectedPayment = paymentTypes.find((el) => el.tipo_pago === value);
      if (selectedPayment) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          idTipoPago: String(selectedPayment.idTipoPago),
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (isEditing) return; //  Bloquea si está en modo Ver

    if (
      !formData.tercero ||
      !formData.valor ||
      parseFloat(formData.valor) <= 0
    ) {
      alert("Por favor, complete el Tercero y el Valor del Anticipo.");
      return;
    }

    const record = {
      estado: "VIGENTE",
      noComprobante: Date.now(),
      ...formData,
      valor: parseFloat(formData.valor),
      remisiones: "[]",
    };

    const response = await onSaveAnticipo(record);
    console.log(response);
    alert("Anticipo registrado y guardado exitosamente.");

    if (response && response[0]) {
      setFormData((prev) => ({
        ...prev,
        no_ingreso: response[0].no_ingreso,
      }));
    }
  };

  const handleClean = () => {
    setFormData(initialFormData);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* FORMULARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
        <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            {isEditing
              ? `Anticipo No. ${formData.no_ingreso}`
              : "Registro de Anticipo"}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <InputGroup
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            readOnly={isEditing}
          />

          {/* TERCERO con Autocompletado */}
          <div className="relative">
            <InputAutosuggest
              label={"Tercero (Cliente)"}
              name="tercero"
              value={formData.tercero}
              onChange={handleChange}
              searchEndpoint={searchTercero}
              textSuggestor="nombre"
              itemsKeys="id_tercero"
              readOnly={isEditing}
            />
            {sugerencias.length > 0 && !isEditing && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                {sugerencias.map((t) => (
                  <li
                    key={t.cedula || t.id_tercero}
                    onClick={() => seleccionarTercero(t)}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-emerald-100"
                  >
                    {t.tercero} -{" "}
                    {t.cedula ? `CC: ${t.cedula}` : `Dir: ${t.direccion}`}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="Cédula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              readOnly={isEditing}
              tooltip="Se llena automáticamente al seleccionar el Tercero."
            />
            <InputGroup
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              readOnly={isEditing}
              tooltip="Se llena automáticamente al seleccionar el Tercero."
            />
          </div>

          <InputGroup
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            readOnly={isEditing}
            tooltip="Se llena automáticamente al seleccionar el Tercero."
          />

          <div className="h-px bg-gray-200 my-2"></div>

          <InputGroup
            label="Valor del Anticipo"
            name="valor"
            type="number"
            value={formData.valor}
            onChange={handleChange}
            placeholder="0.00"
            readOnly={isEditing}
          />

          <InputGroup
            label="Concepto (Razón del Anticipo)"
            name="concepto"
            value={formData.concepto}
            onChange={handleChange}
            readOnly={isEditing}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">
                Tipo Pago
              </label>
              <select
                name="tipoPago"
                value={formData.tipoPago}
                onChange={handleChange}
                disabled={isEditing}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option key={9999} value={"Seleccionar tipo de pago"} disabled>
                  {"Seleccionar tipo de pago"}
                </option>
                {paymentTypes.map((p) => (
                  <option key={p.idTipoPago} value={p.tipo_pago}>
                    {p.tipo_pago}
                  </option>
                ))}
              </select>
            </div>
            <InputGroup
              label="No. Comprobante"
              name="no_ingreso"
              value={formData.no_ingreso}
              onChange={handleChange}
              validate={false}
              readOnly={true}
            />
          </div>

          {!isEditing && (
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className={`w-full ${
                  formData.no_ingreso
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4`}
                disabled={!!formData.no_ingreso}
              >
                <Save size={20} /> Guardar Anticipo
              </button>

              <button
                onClick={handleClean}
                className={`w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
              >
                <BrushCleaning size={20} /> Limpiar Formulario
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VISTA PREVIA (Comprobante de Ingreso) */}
      <div className="flex flex-col gap-4" id="anticipo-preview">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-600 flex items-center gap-2">
            <Printer size={18} /> Vista Previa Comprobante
          </h3>
          <button
            onClick={() => window.print()}
            className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>

        <div
          className="bg-white shadow-2xl p-8 min-h-[400px] text-xs md:text-sm text-black font-sans border border-gray-200 relative"
          id="anticipo-print"
        >
          <div className="border-2 border-black">
            <div className="grid grid-cols-3 border-b-2 border-black font-bold text-center">
              <div className="col-span-2 p-3 text-xl">
                EMPRECAL S.A.S NIT. 804.002.739-1
                <div className="text-xs font-normal mt-1 text-gray-600">
                  Kilómetro 9 vía San Gil - Socorro | Cel. 3138880467
                </div>
              </div>
              <div className="p-3 bg-gray-50 flex flex-col justify-center items-center border-l-2 border-black">
                <span className="text-sm font-normal">
                  Comprobante de Ingreso No.
                </span>
                <span className="text-2xl font-extrabold text-red-600">
                  {formData.no_ingreso}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x-2 divide-black">
              {/* Sección Izquierda */}
              <div className="col-span-2 p-3 space-y-1 text-sm">
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="font-bold">Fecha:</span>{" "}
                  <span>{formData.fecha}</span>
                  <span className="font-bold">Recibido de:</span>{" "}
                  <span className="uppercase font-medium">
                    {formData.tercero || "................................"}
                  </span>
                  <span className="font-bold">Cédula:</span>{" "}
                  <span>
                    {formData.cedula || "................................"}
                  </span>
                  <span className="font-bold">Teléfono:</span>{" "}
                  <span>
                    {formData.telefono || "................................"}
                  </span>
                  <span className="font-bold">Dirección:</span>{" "}
                  <span className="uppercase font-medium">
                    {formData.direccion || "................................"}
                  </span>
                </div>
                <div className="border border-gray-300 p-2 mt-4 min-h-[50px]">
                  <span className="font-bold block">Por concepto de:</span>
                  <span className="italic">
                    {formData.concepto || "................................"}
                  </span>
                </div>

                <div className="pt-4 flex flex-col">
                  <span className="font-bold">Suma en letras:</span>
                  <div className="text-sm p-1 border-b border-black">
                    {formData.sumaLetras || "................................"}
                  </div>
                </div>
              </div>

              {/* Sección Derecha (Valor) */}
              <div className="p-3 space-y-3 bg-gray-50">
                <div className="flex justify-between items-center border-b border-gray-300 pb-1">
                  <span className="font-bold">Valor:</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatCurrency(formData.valor)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-1">
                  <span className="font-bold">Tipo de pago:</span>
                  <span className="text-sm">{formData.tipoPago}</span>
                </div>

                <div className="pt-16">
                  <div className="border-t border-black pt-1 text-center font-medium">
                    Firma
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-right">
            Fecha de realización: {new Date().toLocaleDateString("es-CO")}{" "}
            {new Date().toLocaleTimeString("es-CO")}
          </div>
        </div>
      </div>
    </div>
  );
}
