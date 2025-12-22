// Importa token
import { getToken } from "./authService";

const BASE_URL = "http://192.168.150.8:8000";

// Headers con token
// Headers con token con log de depuración
const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ====================================================================
// 🟩 MOVIMIENTOS
// ====================================================================

/**
 * Obtiene todos los movimientos.
 * @returns {Promise<Array>} Array de movimientos o un array vacío.
 */
export const fetchMovimientos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/vistaMovimientos`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      console.error(
        "Error en la respuesta de red para /vistaMovimientos:",
        response.status
      );
      return [];
    }
    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo /vistaMovimientos:", error);
    return [];
  }
};

// En apiService.js, agregar esta función:

/**
 * Obtiene el número de la última remisión para calcular el siguiente consecutivo.
 * Endpoint: http://192.168.150.6:8000/movimientos/ultima
 */
export const fetchLastRemisionNumber = async () => {
  try {
    // 🛑 Usar el endpoint que especificaste
    const response = await fetch(`${BASE_URL}/movimientos/ultima`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error(
        `Fallo al obtener el último consecutivo (Estatus: ${response.status})`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo el último consecutivo:", error);
    return null;
  }
};

/**
 * @param {string|number} remision - El número de remisión.
 * @returns {Promise<object | null>} El objeto del movimiento o null si no se encuentra.
 */
export const fetchMovimiento = async (remision) => {
  try {
    const response = await fetch(`${BASE_URL}/movimientos/${remision}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // Si el movimiento no existe (ej: 404), devolvemos null.
      if (response.status === 404) {
        return null;
      }
      console.error(
        `Error en la respuesta de red para /movimientos/${remision}:`,
        response.status
      );
      throw new Error(
        `Fallo al obtener movimiento (Estatus: ${response.status})`
      );
    }

    const json = await response.json();

    // Asumiendo que /movimientos/{remision} devuelve { data: [ {movimiento} ] }
    if (Array.isArray(json.data) && json.data.length > 0) {
      return json.data[0];
    }

    return null;
  } catch (error) {
    console.error(`Error obteniendo /movimientos/${remision}:`, error);
    // Propaga el error para que sea manejado por el llamador (updateMovimientoStatus)
    throw error;
  }
};

/**
 * Crea un nuevo movimiento.
 * @param {object} movimiento - Los datos del movimiento a crear.
 * @returns {Promise<object>} La respuesta del API.
 */

export const createMovimiento = async (movimiento) => {
  const res = await fetch(`${BASE_URL}/movimientos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(movimiento),
  });

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error(`Error ${res.status} al crear movimiento:`, errorDetails);
    throw new Error(`Fallo la creación (Estatus: ${res.status})`);
  }
  return await res.json();
};

/**
 * Actualiza completamente un movimiento existente.
 * @param {string|number} remision - El ID o remisión del movimiento.
 * @param {object} movimiento - Los datos completos del movimiento a actualizar.
 * @returns {Promise<object>} La respuesta del API.
 */
export const updateMovimiento = async (remision, movimiento) => {
  const res = await fetch(`${BASE_URL}/movimientos/${remision}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(movimiento),
  });

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error(
      `Error ${res.status} al actualizar movimiento ${remision}:`,
      errorDetails
    );
    throw new Error(`Fallo la actualización (Estatus: ${res.status})`);
  }

  return await res.json();
};

export const cambiarEstadoMovimiento = async (remision, nuevo_estado) => {
  const res = await fetch(
    `${BASE_URL}/movimientos/cambiarEstado/${remision}?nuevo_estado=${nuevo_estado}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error(
      `Error ${res.status} al actualizar movimiento ${remision}:`,
      errorDetails
    );
    throw new Error(`Fallo la actualización (Estatus: ${res.status})`);
  }

  return await res.json();
};

/**
 * Envía la actualización (PUT) al endpoint seguro /movimientos/{remision}.
 * @param {string|number} remision - El número de remisión.
 * @param {string} newState - El nuevo estado ('VIGENTE' o 'CANCELADO').
 * @returns {Promise<object>} La respuesta del API.
 */
export const updateMovimientoStatus = async (remision, newState) => {
  // OBTENER el movimiento completo usando el endpoint específico /movimientos/{remision}
  const movimientoActual = await fetchMovimiento(remision);

  if (!movimientoActual) {
    throw new Error(`Movimiento con remisión ${remision} no encontrado.`);
  }

  // NORMALIZAR los datos para el PUT, asegurando que los IDs se mantienen.
  const movimientoNormalizado = {
    // --- PROPIEDADES BASE Y NUMÉRICAS ---
    remision: Number(movimientoActual.remision) || 0,
    fecha: movimientoActual.fecha || new Date().toISOString(),

    //Se toman los IDs correctos de la respuesta del GET.
    idTercero: Number(movimientoActual.idTercero),
    subtotal: Number(movimientoActual.subtotal) || 0,
    iva: Number(movimientoActual.iva) || 0,
    retencion: Number(movimientoActual.retencion) || 0,
    incluir_iva: Number(movimientoActual.incluir_iva) || 0,
    incluir_ret: Number(movimientoActual.incluir_ret) || 0,
    cubicaje: Number(movimientoActual.cubicaje) || 0,
    idTipoPago: Number(movimientoActual.idTipoPago),
    total: Number(movimientoActual.total) || 0,
    pagado: Number(movimientoActual.pagado) || 0,
    factura: Number(movimientoActual.factura) || 0,

    // --- PROPIEDADES DE TEXTO ---
    placa: movimientoActual.placa || "",
    direccion: movimientoActual.direccion || "",
    no_ingreso: movimientoActual.no_ingreso || "",
    observacion: movimientoActual.observacion || "",
    conductor: movimientoActual.conductor || "",

    //SOBRESCRIBIR EL ESTADO
    estado: newState,
  };

  //Enviar la actualización PUT al endpoint seguro /movimientos/{remision}.
  return await updateMovimiento(remision, movimientoNormalizado);
};

/**
 * Crea un item individual (material) asociado a un movimiento.
 * Endpoint: /movimientoItems
 */
export const createMovimientoItem = async (item) => {
  const res = await fetch(`${BASE_URL}/movimientoItems`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error(`Error ${res.status} al crear item:`, errorDetails);
    throw new Error(`Fallo la creación del item (Estatus: ${res.status})`);
  }
  return await res.json();
};

/* ============================================================
    (Función startEditing)
   ============== ============================================== */

/**
 * Obtiene todos los ítems (materiales y cantidades) asociados a un número de remisión.
 * @param {number} remision El número de remisión para filtrar los ítems.
 * @returns {Promise<Array>} Lista de objetos de ítems de movimiento.
 */
export const fetchMovimientoItemsByRemision = async (remision) => {
  try {
    // const token = localStorage.getItem('token');
    // if (!token) throw new Error("No hay token de autenticación.");
    const response = await fetch(
      `${BASE_URL}/movimientoItems/remision/${remision}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        // headers: {
        //     // 'Content-Type': 'application/json',
        //     // 'Authorization': `Bearer ${token}`,
        // },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Error al obtener ítems de remisión ${remision}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error - fetchMovimientoItemsByRemision:", error);
    throw error;
  }
};

export const updateMovimientoItems = async (remision, items) => {
  const res = await fetch(`${BASE_URL}/movimientoItems/${remision}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(items),
  });
  return await res.json();
};

/* ============================================================
   🟩 TERCEROS
   ============================================================ */

export const fetchTerceros = async () => {
  try {
    const response = await fetch(`${BASE_URL}/terceros`, {
      headers: getAuthHeaders(),
    });

    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo terceros:", error);
    return [];
  }
};

export const createTercero = async (tercero) => {
  const res = await fetch(`${BASE_URL}/terceros`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tercero),
  });
  return await res.json();
};

export const updateTercero = async (id, tercero) => {
  const res = await fetch(`${BASE_URL}/terceros/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tercero),
  });
  return await res.json();
};

export const searchTercero = async (query = "") => {
  try {
    const response = await fetch(`${BASE_URL}/terceros/${query}`, {
      headers: getAuthHeaders(),
    });

    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo terceros:", error);
    return [];
  }
};

/* ============================================================
   PRECIOS ESPECIALES
   ============================================================ */
export const fetchPreciosEspeciales = async () => {
  try {
    const response = await fetch(`${BASE_URL}/preciosEspeciales`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.log("Error obteniendo los precios espciales: ", error);
    return [];
  }
};

export const deletePrecioEspecial = async (id_tercero_material) => {
  const res = await fetch(
    `${BASE_URL}/preciosEspeciales/${id_tercero_material}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return await res.json();
};

export const createPrecioEspecial = async (precioEspecial) => {
  try {
    const response = await fetch(`${BASE_URL}/preciosEspeciales`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(precioEspecial),
    });
    return await response.json();
  } catch (error) {
    console.log("Error creando el precio especial: ", error);
    return [];
  }
};

export const updatePrecioEspecial = async (id_tercero_material, formData) => {
  try {
    const response = await fetch(
      `${BASE_URL}/preciosEspeciales/${id_tercero_material}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      }
    );
    return await response.json();
  } catch (error) {
    console.log("Error creando el precio especial: ", error);
    return [];
  }
};

/* ============================================================
   🟦 PLACAS
   ============================================================ */

export const fetchPlacas = async () => {
  try {
    const res = await fetch(`${BASE_URL}/placas`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo placas:", error);
    return [];
  }
};

/* ============================================================
   🟥 MATERIALES
   ============================================================ */

export const fetchMateriales = async () => {
  try {
    const res = await fetch(`${BASE_URL}/materiales`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo materiales:", error);
    return [];
  }
};

export const searchMateriales = async (query = "") => {
  try {
    const res = await fetch(`${BASE_URL}/materiales/${query}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo material:", error);
    return [];
  }
};

export const createMaterial = async (material) => {
  const res = await fetch(`${BASE_URL}/materiales`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(material),
  });

  return await res.json();
};

export const updateMaterial = async (id, material) => {
  const res = await fetch(`${BASE_URL}/materiales/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(material),
  });

  return await res.json();
};

export const deleteMaterial = async (id) => {
  const res = await fetch(`${BASE_URL}/materiales/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return await res.json();
};

/* ============================================================
   🟪 TIPOS DE PAGO
   ============================================================ */

export const fetchTiposPago = async () => {
  try {
    const res = await fetch(`${BASE_URL}/tiposPago`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo tipos de pago:", error);
    return [];
  }
};

export const createTipoPago = async (tipo) => {
  const res = await fetch(`${BASE_URL}/tiposPago`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tipo),
  });

  return await res.json();
};

export const updateTipoPago = async (id, tipo) => {
  const res = await fetch(`${BASE_URL}/tiposPago/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tipo),
  });

  return await res.json();
};

export const deleteTipoPago = async (id) => {
  const res = await fetch(`${BASE_URL}/tiposPago/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return await res.json();
};

/* ============================================================
   ANTICIPOS (PAGOS)
   ============================================================ */

/**
 * Obtiene todos los pagos registrados.
 * Endpoint: GET /pagos
 */
export const fetchPagos = async () => {
  try {
    const res = await fetch(`${BASE_URL}/pagos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error(`Error ${res.status} al obtener pagos`);
      return [];
    }

    const json = await res.json();
    // El backend retorna { status: "success", data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
};

export const fetchPagosPorNombre = async (nombreTercero = "") => {
  try {
    const res = await fetch(
      `${BASE_URL}/pagos/anticiposPorNombre/${nombreTercero}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      console.error(`Error ${res.status} al obtener pagos`);
      return [];
    }

    const json = await res.json();
    // El backend retorna { status: "success", data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
};

export const fetchPagosPorNoIngreso = async (no_ingreso = "") => {
  try {
    const res = await fetch(`${BASE_URL}/pagos/${no_ingreso}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error(`Error ${res.status} al obtener pagos`);
      return [];
    }

    const json = await res.json();
    // El backend retorna { status: "success", data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
};

export const pagoPorRemision = async (remision = "") => {
  try {
    const res = await fetch(`${BASE_URL}/pagos/pagoPorRemision/${remision}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error(`Error ${res.status} al obtener pagos`);
      return [];
    }

    const json = await res.json();
    // El backend retorna { status: "success", data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
};

export const fetchPagoUltimo = async () => {
  try {
    const res = await fetch(`${BASE_URL}/pagos/ultimo`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error(`Error ${res.status} al obtener ultimo pago`);
      return [];
    }

    const json = await res.json();
    // El backend retorna { status: "success", data: [...] }
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
};

/**
 * Crea un nuevo pago.
 * Endpoint: POST /pagos
 * @param {object} pago - Objeto con la estructura de PagoBase
 */
export const createPago = async (pago) => {
  try {
    const res = await fetch(`${BASE_URL}/pagos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(pago),
    });

    // Retornamos la respuesta completa para manejar status: "success" o "error" en el front
    return await res.json();
  } catch (error) {
    console.error("Error creando pago:", error);
    throw error;
  }
};

/**
 * Actualiza un pago existente.
 * Endpoint: PUT /pagos/{no_ingreso}
 * @param {number} no_ingreso - ID del pago a actualizar
 * @param {object} pago - Datos actualizados
 */
export const updatePago = async (no_ingreso, pago) => {
  if (!no_ingreso) {
    console.error("❌ ERROR: updatePago recibió no_ingreso = ", no_ingreso);
    throw new Error("ID de pago inválido (no_ingreso es undefined o null)");
  }

  try {
    const res = await fetch(`${BASE_URL}/pagos/${no_ingreso}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(pago),
    });

    // Si el servidor responde con 422 o 400, mostrar el body para entender el error
    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Error del servidor:", errorBody);
      throw new Error("La API rechazó la actualización del pago.");
    }

    return await res.json();
  } catch (error) {
    console.error(`❌ Error actualizando pago ${no_ingreso}:`, error);
    throw error;
  }
};

/**
 * Elimina un pago.
 * Endpoint: DELETE /pagos/{id_pago}
 * @param {number} id - ID del pago a eliminar
 */
export const deletePago = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/pagos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return await res.json();
  } catch (error) {
    console.error(`Error eliminando pago ${id}:`, error);
    throw error;
  }
};

/* ============================================================
   🟨 CRÉDITOS
   ============================================================ */

/**
 * Obtiene todos los créditos.
 * Endpoint: GET /creditos
 */
export const fetchCreditos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/creditos`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    return json.status === "success" ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo créditos:", error);
    return [];
  }
};

/**
 * Obtiene todos los créditos de un tercero.
 * Endpoint: GET /creditos/buscarPorNombreTercero/{nombreTercero}
 */
export const fetchCreditosPorNombre = async (nombreTercero = "") => {
  try {
    const response = await fetch(
      `${BASE_URL}/creditos/buscarPorNombreTercero/${nombreTercero}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const json = await response.json();
    return json.status === "success" ? json.data : [];
  } catch (error) {
    console.error("Error obteniendo créditos:", error);
    return [];
  }
};

/**
 * Crea un nuevo registro de crédito.
 * Endpoint: POST /creditos
 */
export const createCredito = async (creditoData) => {
  try {
    const response = await fetch(`${BASE_URL}/creditos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(creditoData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error al crear crédito:", error);
    throw error;
  }
};

/**
 * Actualiza un crédito existente.
 * Endpoint: PUT /creditos/{idCredito}
 */
export const updateCredito = async (idCredito, creditoData) => {
  try {
    const response = await fetch(`${BASE_URL}/creditos/${idCredito}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(creditoData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error al actualizar crédito:", error);
    throw error;
  }
};

// ... (código existente)

// ====================================================================
// 💵 GASTOS
// ====================================================================

/**
 * Crea un nuevo registro de gasto en la base de datos.
 * @param {object} gasto - Objeto con la descripción, valor y observación del gasto.
 * @returns {Promise<object>} El objeto del gasto creado.
 */
export const createGasto = async (gasto) => {
  // 🛑 Validación CRÍTICA: Bloquear la llamada si no hay token
  if (!getToken()) {
    console.error("Token de autenticación faltante para createGasto.");
    throw new Error("Autenticación requerida.");
  }

  try {
    const response = await fetch(`${BASE_URL}/gastos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(gasto),
    });

    if (!response.ok) {
      // Intenta leer el mensaje de error del backend
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Error en la respuesta del servidor: ${response.status}`
      );
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error creando gasto:", error);
    throw error;
  }
};

// ====================================================================
// 📊 CUADRE DE CAJA (PERSISTENCIA)
// ====================================================================

/**
 * Guarda el resumen del cuadre de caja del día.
 * Endpoint: POST /cuadreCaja
 * @param {object} datos - Datos del resumen diario.
 */
export const saveCuadreCaja = async (datos) => {
  if (!getToken()) {
    console.error("Token de autenticación faltante para saveCuadreCaja.");
    throw new Error("Autenticación requerida.");
  }

  try {
    const response = await fetch(`${BASE_URL}/cuadreCaja/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error al guardar el cuadre: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en saveCuadreCaja:", error);
    throw error;
  }
};

/**
 * Busca el cuadre guardado para una fecha específica.
 * Endpoint: GET /cuadreCaja/{fecha}
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 */
export const fetchCuadreByFecha = async (fecha) => {
  try {
    const response = await fetch(`${BASE_URL}/cuadreCaja/${fecha}`, {
      headers: getAuthHeaders(),
    });

    // Si la API devuelve 404, significa que no se ha hecho el cuadre ese día.
    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`Error al obtener cuadre: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error(`Error obteniendo cuadre para la fecha ${fecha}:`, error);
    return null;
  }
};

// ====================================================================
// 🧾 GASTOS DIARIOS
// ====================================================================

export const createGastoDiario = async (gasto) => {
  if (!getToken()) {
    throw new Error("Autenticación requerida");
  }

  try {
    const response = await fetch(`${BASE_URL}/gastos_diarios/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        descripcion: gasto.descripcion,
        valor: Number(gasto.valor),
        observacion: gasto.observacion || "",
        fecha: gasto.fecha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error guardando gasto (${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error en createGastoDiario:", error);
    throw error;
  }
};

// ====================================================================
// 🧮 ARQUEO / CUADRE DIARIO DE CAJA
// ====================================================================

export const createCuadreDiario = async (arqueo) => {
  if (!getToken()) {
    throw new Error("Autenticación requerida");
  }

  try {
    const response = await fetch(`${BASE_URL}/cuadresDiarios/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(arqueo),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Error guardando cuadre diario (${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error en createCuadreDiario:", error);
    throw error;
  }
};
