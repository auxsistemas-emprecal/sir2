import React, { useState, useMemo, useEffect } from "react";
import {
  fetchMovimientos,
  fetchTiposPago,
  createGastoDiario,
  createCuadreDiario,
  saveCuadreCaja,
  fetchGastosPorFecha,
  deleteGastoDiario,
  updateDatoTemporal,
  fetchDatoTemporal,
  fetchDatosTemporales,
} from "../assets/services/apiService";

export default function CuadreCaja() {
  const hoy = new Date().toISOString().split("T")[0];
  const [fechaConsulta, setFechaConsulta] = useState(hoy);
  const [gastos, setGastos] = useState([]);
  const [formGasto, setFormGasto] = useState({
    descripcion: "",
    valor: "",
    observacion: "",
  });

  const [observaciones, setObservaciones] = useState();

  const billetes = [100000, 50000, 20000, 10000, 5000, 2000];

  // --- LÓGICA DE PERMANENCIA (LOCALSTORAGE) ---
  const [arqueo, setArqueo] = useState(() => {
    const savedArqueo = localStorage.getItem("arqueo_temporal");
    return savedArqueo
      ? JSON.parse(savedArqueo)
      : {
          100000: 0,
          50000: 0,
          20000: 0,
          10000: 0,
          5000: 0,
          2000: 0,
          monedas: 0,
        };
  });

  const [recibosCaja, setRecibosCaja] = useState(() => {
    const savedRecibos = localStorage.getItem("recibos_temporal");
    return savedRecibos ? Number(savedRecibos) : 0;
  });

  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const datosTemporales = await fetchDatosTemporales();

      if (datosTemporales) {
        setRecibosCaja(datosTemporales[8].valor || 0);

        const arqueoTemp = {
          100000: datosTemporales[1].valor,
          50000: datosTemporales[2].valor,
          20000: datosTemporales[3].valor,
          10000: datosTemporales[4].valor,
          5000: datosTemporales[5].valor,
          2000: datosTemporales[6].valor,
          monedas: datosTemporales[7].valor,
        };
        setArqueo(arqueoTemp);
        setObservaciones(datosTemporales[0].valor);
      }
    } catch (error) {
      console.error("Error al cargar datos del cuadre:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    localStorage.setItem("arqueo_temporal", JSON.stringify(arqueo));
  }, [arqueo]);

  useEffect(() => {
    localStorage.setItem("observaciones", JSON.stringify(observaciones));
    (async () => {
      const observacionesTemp = await fetchDatoTemporal(1);
      const dato = {
        ...observacionesTemp,
        valor: observaciones,
      };
      await updateDatoTemporal(1, dato);
    })();
  }, [observaciones]);

  useEffect(() => {
    localStorage.setItem("recibos_temporal", recibosCaja.toString());
    (async () => {
      const reciboCajaTemp = await fetchDatoTemporal(9);
      const dato = {
        ...reciboCajaTemp,
        valor: recibosCaja.toString(),
      };
      await updateDatoTemporal(9, dato);
    })();
  }, [recibosCaja]);

  const [movimientos, setMovimientos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingMov(true);
        const [movs, tipos, gastosBackend] = await Promise.all([
          fetchMovimientos(),
          fetchTiposPago(),
          fetchGastosPorFecha(fechaConsulta),
        ]);

        setMovimientos(Array.isArray(movs) ? movs : []);
        setTiposPago(Array.isArray(tipos) ? tipos : []);
        setGastos(Array.isArray(gastosBackend) ? gastosBackend : []);
      } catch (error) {
        console.error("Error cargando datos de cuadre:", error);
        setMovimientos([]);
        setTiposPago([]);
      } finally {
        setLoadingMov(false);
      }
    };

    cargarDatos();
  }, [fechaConsulta]);

  const handleGastoChange = (e) =>
    setFormGasto({ ...formGasto, [e.target.name]: e.target.value });

  const agregarGasto = async (e) => {
    e.preventDefault();
    if (!formGasto.descripcion || !formGasto.valor) return;
    const nuevoGasto = {
      descripcion: formGasto.descripcion,
      valor: Number(formGasto.valor),
      observacion: formGasto.observacion,
      fecha: hoy,
    };
    try {
      const gastoGuardado = await createGastoDiario(nuevoGasto);
      setGastos([
        ...gastos,
        { ...nuevoGasto, id: gastoGuardado.id ?? Date.now() },
      ]);
      setFormGasto({ descripcion: "", valor: "", observacion: "" });
    } catch (error) {
      alert("❌ No se pudo guardar el gasto: " + error.message);
    }
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await deleteGastoDiario(id);
      setGastos((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      alert("❌ No se pudo eliminar el gasto");
    }
  };

  const gastosHoy = useMemo(
    () => gastos.filter((g) => g.fecha === hoy),
    [gastos, hoy],
  );

  const totalGastosHoy = gastosHoy.reduce((acc, g) => acc + g.valor, 0);

  const handleArqueoChange = async (key, value) => {
    const numValue = value === "" ? 0 : Number(value);
    setArqueo({ ...arqueo, [key]: value });
    const campo =
      key !== "monedas" ? `billete_${key / 1000}k` : "monedas_total";
    const camposId = {
      billete_100k: 2,
      billete_50k: 3,
      billete_20k: 4,
      billete_10k: 5,
      billete_5k: 6,
      billete_2k: 7,
      monedas_total: 8,
    };
    const dato = await fetchDatoTemporal(camposId[campo]);
    const datopayload = {
      ...dato,
      valor: value,
    };
    await updateDatoTemporal(camposId[campo], datopayload);
  };

  const totalArqueo = useMemo(() => {
    const totalBilletes = billetes.reduce(
      (acc, den) => acc + den * (arqueo[den] || 0),
      0,
    );
    return totalBilletes + Number(arqueo.monedas || 0);
  }, [arqueo]);

  const movimientosFiltrados = useMemo(
    () => movimientos.filter((m) => m.fecha?.split("T")[0] === fechaConsulta),
    [movimientos, fechaConsulta],
  );

  const obtenerTipoPago = (movimiento) =>
    movimiento?.tipo_pago?.trim() || "N/A";

  const totalesPorTipo = useMemo(() => {
    const resumen = { Efectivo: 0, Crédito: 0, Transferencia: 0 };
    movimientosFiltrados.forEach((m) => {
      const tipo = obtenerTipoPago(m);
      const total = Number(m.total) || 0;
      if (m.estado !== "ANULADA") {
        if (tipo === "Efectivo") resumen.Efectivo += total;
        else if (tipo === "Crédito") resumen.Crédito += total;
        else if (tipo === "Transferencia") resumen.Transferencia += total;
      }
    });
    return resumen;
  }, [movimientosFiltrados]);

  const resumenFinal = useMemo(() => {
    const ingresosBrutosTotales =
      totalesPorTipo.Efectivo +
      totalesPorTipo.Crédito +
      totalesPorTipo.Transferencia +
      Number(recibosCaja);
    return {
      totalEfectivoNeto:
        totalesPorTipo.Efectivo + Number(recibosCaja) - totalGastosHoy,
      totalNetoGeneral: ingresosBrutosTotales - totalGastosHoy,
    };
  }, [totalesPorTipo, totalGastosHoy, recibosCaja]);

  const conciliacion = useMemo(() => {
    const diferencia = totalArqueo - resumenFinal.totalEfectivoNeto;
    let estado = {
      mensaje: "Caja Cuadrada ✅",
      colorClase: "text-emerald-700",
      bgClase: "bg-emerald-50",
      bordeClase: "border-emerald-200",
    };
    if (diferencia > 0)
      estado = {
        mensaje: "Sobrante",
        colorClase: "text-amber-700",
        bgClase: "bg-amber-50",
        bordeClase: "border-amber-200",
      };
    else if (diferencia < 0)
      estado = {
        mensaje: "Faltante",
        colorClase: "text-rose-700",
        bgClase: "bg-rose-50",
        bordeClase: "border-rose-200",
      };
    return { diferencia, ...estado };
  }, [totalArqueo, resumenFinal.totalEfectivoNeto]);

  // --- FUNCIÓN DE GUARDADO ACTUALIZADA CON USUARIO ---
  const handleFinalizarCuadre = async () => {
    const usuarioActual = localStorage.getItem("usuario") || "Desconocido";

    if (resumenFinal.totalNetoGeneral === 0 && totalGastosHoy === 0) {
      if (!window.confirm("El total es $0. ¿Deseas guardar?")) return;
    }

    const datosParaGuardar = {
      fecha: fechaConsulta,
      gastos_diarios: totalGastosHoy,
      efectivo_ventas: totalesPorTipo.Efectivo,
      recibos_caja: Number(recibosCaja),
      credito: totalesPorTipo.Crédito,
      transferencia: totalesPorTipo.Transferencia,
      total_efectivo_caja: resumenFinal.totalEfectivoNeto,
      total_neto_dia: resumenFinal.totalNetoGeneral,
      observaciones: observaciones,
    };

    const datosArqueo = {
      fecha: fechaConsulta,
      billete_100k: arqueo[100000],
      billete_50k: arqueo[50000],
      billete_20k: arqueo[20000],
      billete_10k: arqueo[10000],
      billete_5k: arqueo[5000],
      billete_2k: arqueo[2000],
      monedas_total: Number(arqueo.monedas),
      efectivo_esperado_sistema: resumenFinal.totalEfectivoNeto,
      total_arqueo: totalArqueo,
      diferencia_valor: conciliacion.diferencia,
      estado_caja:
        conciliacion.diferencia === 0
          ? "CUADRADO"
          : conciliacion.diferencia > 0
            ? "SOBRANTE"
            : "FALTANTE",
      usuario: usuarioActual,
    };

    try {
      await saveCuadreCaja(datosParaGuardar);
      await createCuadreDiario(datosArqueo);

      localStorage.removeItem("arqueo_temporal");
      localStorage.removeItem("recibos_temporal");
      setArqueo({
        100000: 0,
        50000: 0,
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        monedas: 0,
      });

      alert(`✅ Guardado correctamente por: ${usuarioActual}`);
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div
      id="cuadre-print"
      className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900"
    >
      <style>
        {`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
          .print-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; display: none; table-layout: fixed; }
          .print-table th, .print-table td { border: 1px solid #000; padding: 6px 10px; font-size: 11px; word-wrap: break-word; }
          .print-table th { background-color: #f1f5f9; font-weight: bold; text-align: left; }
          .col-print-desc { width: 30%; }
          .col-print-nota { width: 50%; }
          .col-print-valor { width: 20%; }

          @media print {
            @page { size: portrait; margin: 1cm; }
            body { background: white !important; }
            #cuadre-print { padding: 0 !important; background: white !important; }
            .no-print { display: none !important; }
            .print-table { display: table !important; }
            .print-only-block { display: block !important; }
            .screen-only { display: none !important; }
            .box-conciliacion-print { border: 2px solid #000 !important; padding: 15px; margin: 20px 0; border-radius: 10px; }
          }
        `}
      </style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-slide-up">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-2 rounded-lg no-print">
              💵
            </span>
            Cuadre de Caja
          </h1>
          <p className="text-slate-500 font-medium">
            Reporte diario • {fechaConsulta}
          </p>
        </div>

        <div className="flex gap-3 no-print">
          {/* BOTÓN: ACTUALIZAR */}
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 bg-emerald-500 px-5 py-2.5 rounded-xl font-bold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95 group"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500">
              🔄
            </span>
            Actualizar
          </button>

          {/* BOTÓN : IMPRIMIR */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            🖨️ Imprimir Reporte
          </button>
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN */}
      <div className="print-only-block hidden">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold">REPORTE DE CIERRE</h2>
          <p className="text-xs italic">
            Generado por: {localStorage.getItem("usuario") || "Admin"}
          </p>
        </div>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          📌 Resumen de Gastos
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th className="col-print-desc">Descripción</th>
              <th className="col-print-nota">Nota / Observación</th>
              <th className="col-print-valor text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {gastosHoy.map((g) => (
              <tr key={g.id}>
                <td>{g.descripcion}</td>
                <td>{g.observacion || "-"}</td>
                <td className="text-right">
                  ${g.valor.toLocaleString("es-CO")}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td colSpan="2" className="text-right">
                TOTAL GASTOS PAGADOS
              </td>
              <td className="text-right">
                ${totalGastosHoy.toLocaleString("es-CO")}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          📊 Balance de Sistema
        </h3>
        <table className="print-table">
          <tbody>
            <tr>
              <td>(+) Ventas en Efectivo</td>
              <td className="text-right">
                ${totalesPorTipo.Efectivo.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Recibos de Caja</td>
              <td className="text-right">
                ${Number(recibosCaja).toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Ventas a Crédito</td>
              <td className="text-right">
                ${totalesPorTipo.Crédito.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(+) Ventas por Transferencia</td>
              <td className="text-right">
                ${totalesPorTipo.Transferencia.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr>
              <td>(-) Total Gastos del Día</td>
              <td className="text-right">
                -${totalGastosHoy.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold bg-slate-100">
              <td>TOTAL NETO DEL DÍA</td>
              <td className="text-right">
                ${resumenFinal.totalNetoGeneral.toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold">
              <td>EFECTIVO ESPERADO EN CAJA</td>
              <td className="text-right">
                ${resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          📝 Observaciones
        </h3>

        <div className="print-table">
          <table className="print-table">
            <tbody>
              <tr>
                <td>
                  {observaciones?.trim() ? observaciones : "Sin observaciones"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-[12px] font-bold mb-2 uppercase">
          🧾 Conteo Físico
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>Denominación</th>
              <th className="text-center">Cant.</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {billetes.map((den) => (
              <tr key={den}>
                <td>Billetes de ${den.toLocaleString("es-CO")}</td>
                <td className="text-center">{arqueo[den]}</td>
                <td className="text-right">
                  ${(den * arqueo[den]).toLocaleString("es-CO")}
                </td>
              </tr>
            ))}
            <tr>
              <td>Monedas y otros</td>
              <td className="text-center">-</td>
              <td className="text-right">
                ${Number(arqueo.monedas).toLocaleString("es-CO")}
              </td>
            </tr>
            <tr className="font-bold bg-slate-100">
              <td colSpan="2" className="text-right">
                TOTAL DINERO FÍSICO
              </td>
              <td className="text-right">
                ${totalArqueo.toLocaleString("es-CO")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="box-conciliacion-print">
          <p>
            <strong>EFECTIVO ESPERADO:</strong> $
            {resumenFinal.totalEfectivoNeto.toLocaleString("es-CO")}
          </p>
          <p>
            <strong>ESTADO DE CAJA:</strong> {conciliacion.mensaje}
          </p>
          <p style={{ fontSize: "16px", fontWeight: "bold" }}>
            DIFERENCIA: $
            {Math.abs(conciliacion.diferencia).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* VISTA DE PANTALLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 screen-only">
        <div className="lg:col-span-2 space-y-8 animate-slide-up">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 text-emerald-700">
              📌 Registro de Gastos
            </h3>
            <form
              onSubmit={agregarGasto}
              className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl"
            >
              <input
                name="descripcion"
                placeholder="Descripción"
                value={formGasto.descripcion}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <input
                name="valor"
                type="number"
                placeholder="Valor"
                value={formGasto.valor}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <input
                name="observacion"
                placeholder="Nota / Observación"
                value={formGasto.observacion}
                onChange={handleGastoChange}
                className="p-2.5 rounded-xl border-slate-200"
              />
              <button className="md:col-span-3 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                + Agregar Gasto
              </button>
            </form>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="pb-3 text-left">Descripción</th>
                  <th className="pb-3 text-left">Observación</th>
                  <th className="pb-3 text-right">Monto</th>
                  <th className="pb-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {gastosHoy.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-3 font-medium">{g.descripcion}</td>
                    <td className="py-3 text-slate-500 italic">
                      {g.observacion || "-"}
                    </td>
                    <td className="py-3 text-right font-bold">
                      ${g.valor.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => eliminarGasto(g.id)}
                        className="text-rose-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-extrabold text-emerald-800 bg-emerald-50/50">
                  <td colSpan="2" className="py-4 px-4">
                    TOTAL EGRESOS
                  </td>
                  <td className="py-4 text-right">
                    ${totalGastosHoy.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-6 text-blue-700">
              🧾 Arqueo Físico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billetes.map((den) => (
                <div
                  key={den}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
                >
                  <span className="font-bold text-slate-500">
                    ${den.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={arqueo[den]}
                      onChange={(e) => handleArqueoChange(den, e.target.value)}
                      className="w-20 text-center border-slate-200 rounded-lg font-bold text-blue-600 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    <span className="w-24 text-right text-xs font-black text-slate-400">
                      ${(den * arqueo[den]).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl md:col-span-2 mt-4">
                <span className="font-bold text-blue-800 text-xs tracking-widest uppercase">
                  Total Monedas
                </span>
                <input
                  type="number"
                  value={arqueo.monedas}
                  onChange={(e) =>
                    handleArqueoChange("monedas", e.target.value)
                  }
                  className="w-32 text-center border-blue-200 rounded-lg font-bold text-blue-700"
                />
              </div>
            </div>
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
              <span className="text-sm font-black text-slate-400 uppercase">
                Total Arqueo Físico
              </span>
              <span className="text-3xl font-black text-blue-400">
                ${totalArqueo.toLocaleString()}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-8 animate-slide-up">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-5 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest">
                📊 Sistema
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Ventas Efectivo</span>
                <span className="font-bold">
                  ${totalesPorTipo.Efectivo.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                <span className="text-blue-800 text-[10px] font-black uppercase">
                  Recibos
                </span>
                <input
                  type="number"
                  value={recibosCaja}
                  onChange={(e) => setRecibosCaja(Number(e.target.value))}
                  className="w-24 text-right border-none ring-1 ring-blue-200 rounded-lg font-bold p-1"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>Ventas Crédito</span>
                <span className="font-bold">
                  ${totalesPorTipo.Crédito.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ventas Transferencia</span>
                <span className="font-bold">
                  ${totalesPorTipo.Transferencia.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>(-) Gastos</span>
                <span className="font-bold text-rose-500">
                  -${totalGastosHoy.toLocaleString()}
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Esperado en Caja
                </span>
                <span className="text-3xl font-black text-emerald-600">
                  ${resumenFinal.totalEfectivoNeto.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              📝 Observaciones
            </label>

            <textarea
              rows={3}
              placeholder="Notas adicionales del cierre de caja..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="
                  w-full
                  resize-none
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  p-3
                  text-sm
                  font-medium
                  text-slate-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-300
                  focus:border-blue-300
                  transition-all
                "
            />
          </section>

          <section
            className={`rounded-3xl border-2 p-6 ${conciliacion.bgClase} ${conciliacion.bordeClase}`}
          >
            <h4
              className={`text-2xl font-black text-center mb-4 ${conciliacion.colorClase}`}
            >
              {conciliacion.mensaje}
            </h4>
            <div className="bg-white/60 rounded-2xl p-4 text-center border border-white">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                Diferencia
              </p>
              <p className={`text-4xl font-black ${conciliacion.colorClase}`}>
                ${Math.abs(conciliacion.diferencia).toLocaleString()}
              </p>
            </div>
          </section>

          <button
            onClick={handleFinalizarCuadre}
            className="no-print w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all"
          >
            💾 GUARDAR CIERRE
          </button>
        </div>
      </div>

      {/* DETALLE DE VENTAS */}
      <section className="no-print mt-12 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-black text-slate-800">
            📋 Detalle de Ventas
          </h3>
          <input
            type="date"
            value={fechaConsulta}
            onChange={(e) => setFechaConsulta(e.target.value)}
            className="border-slate-200 rounded-xl font-bold"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="p-4 text-left">Remisión</th>
                <th className="p-4 text-left">Conductor</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Pago</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((m, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="p-4 font-bold">{m.remision}</td>
                  <td className="p-4">{m.conductor}</td>
                  <td className="p-4 text-right font-black">
                    ${Number(m.total).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-white border rounded-full text-[10px] font-black">
                      {obtenerTipoPago(m)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
