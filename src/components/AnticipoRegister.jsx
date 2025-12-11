import React, { useState, useEffect } from "react";
import { Save, Printer, DollarSign } from "lucide-react";
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
}) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    idTercero: "",
    tipo: "Anticipo",
    remisiones: "",
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
        ? paymentTypes[0].name
        : "Seleccionar tipo de pago",
    pagado: 0,
    sumaLetras: "",
  });

  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    const valor = parseFloat(formData.valorAnticipo) || 0;

    if (valor > 0) {
      const texto = numeroALetras(valor);
      setFormData((prev) => ({
        ...prev,
        sumaLetras: `${texto} PESOS`.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, sumaLetras: "" }));
    }
  }, [formData.valorAnticipo]);

  // Función para seleccionar un Tercero y llenar campos automáticamente
  const seleccionarTercero = (tercero) => {
    setFormData((prev) => ({
      ...prev,
      tercero: tercero.tercero,
      // Usamos los campos del objeto tercero para llenar el formulario
      cedula: tercero.cedula || "",
      telefono: tercero.telefono || "",
      direccion: tercero.direccion || "",
    }));
    setSugerencias([]); // Oculta sugerencias
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "tercero") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        idTercero: e.target.completeObject.id_tercero,
        tercero: value,
        cedula: e.target.completeObject.cedula,
        telefono: e.target.completeObject.telefono,
        direccion: e.target.completeObject.direccion,
      }));
      return;
    }
    if (name == "tipoPago") {
      const idTipoPago = paymentTypes.filter((el) => el.tipo_pago == value)[0]
        .idTipoPago;
      console.log(idTipoPago);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        idTipoPago: String(idTipoPago),
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (
      !formData.tercero ||
      !formData.valor ||
      parseFloat(formData.valor) <= 0
    ) {
      alert("Por favor, complete el Tercero y el Valor del Anticipo.");
      return;
    }

    const record = {
      id: Date.now(),
      ...formData,
      valor: parseFloat(formData.valor),
    };

    onSaveAnticipo(record);
    alert("Anticipo registrado y guardado exitosamente.");

    // Limpiar formulario
    setFormData((prev) => ({
      ...prev,
      fecha: new Date().toISOString().split("T")[0],
      idTercero: "",
      tipo: "Anticipo",
      remisiones: "",
      valor: "",
      no_ingreso: "",
      tercero: "",
      cedula: "",
      telefono: "",
      direccion: "",
      concepto: "",
      idTipoPago: paymentTypes.length > 0 ? paymentTypes[0].name : "Efectivo",
      pagado: 0,
      sumaLetras: "",
    }));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* FORMULARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
        <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" /> Registro de
            Anticipo
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <InputGroup
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
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
            />
            {sugerencias.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                {sugerencias.map((t) => (
                  <li
                    key={t.cedula || t.id}
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
            {/* Campos de solo lectura, se llenan con seleccionarTercero */}
            <InputGroup
              label="Cédula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              readOnly={true}
              tooltip="Se llena automáticamente al seleccionar el Tercero."
            />
            <InputGroup
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              readOnly={true}
              tooltip="Se llena automáticamente al seleccionar el Tercero."
            />
          </div>

          <InputGroup
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            readOnly={true}
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
          />

          <InputGroup
            label="Concepto (Razón del Anticipo)"
            name="concepto"
            value={formData.concepto}
            onChange={handleChange}
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white shadow-sm text-sm"
              >
                <option key={9999} value={0} selected>
                  {"Seleccionar tipo de pago"}
                </option>
                {paymentTypes.map((p) => {
                  return (
                    <option key={p.idTipoPago} value={p.tipo_pago}>
                      {p.tipo_pago}
                    </option>
                  );
                })}
              </select>
            </div>
            <InputGroup
              label="No. Comprobante"
              name="no_ingreso"
              value={formData.no_ingreso}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Save size={20} /> Guardar Anticipo
          </button>
        </div>
      </div>

      {/* VISTA PREVIA (Comprobante de Ingreso) */}
      <div className="flex flex-col gap-4">
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

        {/* Diseño del Comprobante de Ingreso */}
        <div
          className="bg-white shadow-2xl p-8 min-h-[400px] text-xs md:text-sm text-black font-sans border border-gray-200 relative"
          id="anticipo-print"
        >
          <div className="border-2 border-black">
            <div className="grid grid-cols-3 border-b-2 border-black font-bold text-center">
              <div className="col-span-2 p-3 text-xl">
                EMPRECAL S.A. NIT. 804.002.739-01
                <div className="text-xs font-normal mt-1 text-gray-600">
                  Kilómetro 9 vía San Gil - Socorro | Cel. 3138880467
                </div>
              </div>
              <div className="p-3 bg-gray-50 flex flex-col justify-center items-center border-l-2 border-black">
                <span className="text-sm font-normal">
                  Comprobante de Ingreso No.
                </span>
                <span className="text-2xl font-extrabold text-red-600">
                  {formData.no_ingreso || "0"}
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
