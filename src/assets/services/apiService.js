// Importa token
import { getToken } from "./authService";

const BASE_URL = "http://192.168.150.13:8000";

// Headers con token
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
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
 * Endpoint: PUT /pagos/{id_pago}
 * @param {number} id_pago - ID del pago a actualizar
 * @param {object} pago - Datos actualizados
 */
export const updatePago = async (id_pago, pago) => {
  if (!id_pago) {
    console.error("❌ ERROR: updatePago recibió id_pago = ", id_pago);
    throw new Error("ID de pago inválido (id_pago es undefined o null)");
  }

  try {
    const res = await fetch(`${BASE_URL}/pagos/${id_pago}`, {
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
    console.error(`❌ Error actualizando pago ${id_pago}:`, error);
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
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gasto),
    });

    if (!response.ok) {
      // Intenta leer el mensaje de error del backend
      const errorData = await response.json();
      throw new Error(errorData.message || `Error en la respuesta del servidor: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error creando gasto:", error);
    throw error;
  }
};

// --------------------------archivo anterior hasta el 01/12 9:30-------------------------

// // Importa token
// import { getToken } from "./authService";
// // import axios from "axios";  // Solo si lo usas para algo

// const BASE_URL = "http://192.168.150.4:8000";

// // headers con token
// const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${getToken()}`,
// });

// /* ============================================================
//    🟩 TERCEROS
//    ============================================================ */

// export const fetchTerceros = async () => {
//   try {
//     const response = await fetch(`${BASE_URL}/terceros`, {
//       headers: getAuthHeaders(),
//     });

//     const json = await response.json();
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Error obteniendo terceros:", error);
//     return [];
//   }
// };

// export const createTercero = async (tercero) => {
//   const res = await fetch(`${BASE_URL}/terceros`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(tercero),
//   });
//   return await res.json();
// };

// export const updateTercero = async (id, tercero) => {
//   const res = await fetch(`${BASE_URL}/terceros/${id}`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(tercero),
//   });
//   return await res.json();
// };

// /* ============================================================
//    🟦 PLACAS
//    ============================================================ */

// export const fetchPlacas = async () => {
//   try {
//     const res = await fetch(`${BASE_URL}/placas`, {
//       headers: getAuthHeaders(),
//     });
//     const json = await res.json();
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Error obteniendo placas:", error);
//     return [];
//   }
// };

// /* ============================================================
//    🟥 MATERIALES
//    ============================================================ */

// export const fetchMateriales = async () => {
//   try {
//     const res = await fetch(`${BASE_URL}/materiales`, {
//       headers: getAuthHeaders(),
//     });

//     const json = await res.json();
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Error obteniendo materiales:", error);
//     return [];
//   }
// };

// export const createMaterial = async (material) => {
//   const res = await fetch(`${BASE_URL}/materiales`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(material),
//   });

//   return await res.json();
// };

// export const updateMaterial = async (id, material) => {
//   const res = await fetch(`${BASE_URL}/materiales/${id}`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(material),
//   });

//   return await res.json();
// };

// export const deleteMaterial = async (id) => {
//   const res = await fetch(`${BASE_URL}/materiales/${id}`, {
//     method: "DELETE",
//     headers: getAuthHeaders(),
//   });

//   return await res.json();
// };

// /* ============================================================
//    🟪 TIPOS DE PAGO
//    ============================================================ */

// export const fetchTiposPago = async () => {
//   try {
//     const res = await fetch(`${BASE_URL}/tiposPago`, {
//       headers: getAuthHeaders(),
//     });

//     const json = await res.json();
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Error obteniendo tipos de pago:", error);
//     return [];
//   }
// };

// export const createTipoPago = async (tipo) => {
//   const res = await fetch(`${BASE_URL}/tiposPago`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(tipo),
//   });

//   return await res.json();
// };

// export const updateTipoPago = async (id, tipo) => {
//   const res = await fetch(`${BASE_URL}/tiposPago/${id}`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(tipo),
//   });

//   return await res.json();
// };

// export const deleteTipoPago = async (id) => {
//   const res = await fetch(`${BASE_URL}/tiposPago/${id}`, {
//     method: "DELETE",
//     headers: getAuthHeaders(),
//   });

//   return await res.json();
// };

// ------------------ archivo corregido desde el 02/12 8:00------------------

// // Importar la función para obtener el token desde authService
// import { getToken } from "./authService";
// // import axios from "axios";

// const BASE_URL = "http://192.168.150.4:8000";

// // Función auxiliar para construir los headers de autorización
// const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${getToken()}`,
// });

// /* ============================================================
//    🟩 TERCEROS (CORREGIDO)
//    ============================================================ */

// export const fetchTerceros = async () => {
//   if (!getToken()) {
//     console.error("Token de autenticación faltante para fetchTerceros.");
//     return [];
//   }

//   try {
//     const response = await fetch(`${BASE_URL}/terceros`, {
//       method: "GET",
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(`Error ${response.status}: No autorizado o error servidor.`);
//     }

//     const json = await response.json();

//     // Aseguramos devolver SIEMPRE un ARRAY
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Fallo al obtener terceros:", error);
//     return [];
//   }
// };

// export const createTercero = async (tercero) => {
//   try {
//     const response = await fetch(`${BASE_URL}/terceros`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(tercero),
//     });

//     return await response.json();
//   } catch (error) {
//     console.error("Error creando tercero:", error);
//     throw error;
//   }
// };

// export const updateTercero = async (id, tercero) => {
//   try {
//     const response = await fetch(`${BASE_URL}/terceros/${id}`, {
//       method: "PUT",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(tercero),
//     });

//     return await response.json();
//   } catch (error) {
//     console.error("Error actualizando tercero:", error);
//     throw error;
//   }
// };

// /* ============================================================
//    🟦 MATERIALES
//    ============================================================ */

// export const fetchMateriales = async () => {
//   try {
//     const res = await axios.get(`${API_URL}/materiales`);
//     return res.data;
//   } catch (error) {
//     console.error("Error obteniendo materiales:", error);
//     throw error;
//   }
// };

// export const createMaterial = async (material) => {
//   try {
//     const res = await axios.post(`${API_URL}/materiales`, material);
//     return res.data;
//   } catch (error) {
//     console.error("Error creando material:", error);
//     throw error;
//   }
// };

// export const updateMaterial = async (id, material) => {
//   try {
//     const res = await axios.put(`${API_URL}/materiales/${id}`, material);
//     return res.data;
//   } catch (error) {
//     console.error("Error actualizando material:", error);
//     throw error;
//   }
// };

// /* ============================================================
//    🟪 PLACAS
//    ============================================================ */

// export const fetchPlacas = async () => {
//   if (!getToken()) {
//     console.error("Token de autenticación faltante para fetchPlacas.");
//     return [];
//   }

//   try {
//     const response = await fetch(`${BASE_URL}/placas`, {
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Error ${response.status}: Acceso no autorizado o fallo del servidor.`
//       );
//     }

//     const json = await response.json();
//     return Array.isArray(json.data) ? json.data : [];
//   } catch (error) {
//     console.error("Fallo al obtener placas:", error);
//     return [];
//   }
// };

// // -------------------------archivo anterior hasta el 01/12 -------------------------

// // Importar la función para obtener el token desde authService
// import { getToken } from "./authService";
// // import axios from "axios";

// const BASE_URL = "http://192.168.150.4:8000";

// // Función auxiliar para construir los headers de autorización
// const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   // Obtiene el token guardado y lo añade al header de Authorization
//   Authorization: `Bearer ${getToken()}`,
// });

// /**
//  * Obtiene la lista de terceros desde la API (Requiere Token).
//  */
// export const fetchTerceros = async () => {
//   // 🛑 Validación CRÍTICA: Bloquear la llamada si no hay token
//   if (!getToken()) {
//     console.error("Token de autenticación faltante para fetchTerceros.");
//     return [];
//   }

//   try {
//     const response = await fetch(`${BASE_URL}/terceros`, {
//       headers: getAuthHeaders(), // <-- USANDO EL TOKEN
//     });

//     if (!response.ok) {
//       // Manejar errores de seguridad (401) o de servidor
//       throw new Error(
//         `Error ${response.status}: Acceso no autorizado o fallo del servidor.`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Fallo al obtener terceros:", error);
//     return [];
//   }
// };

// // -------------------- MATERIALES --------------------

// export const fetchMateriales = async () => {
//     try {
//         const res = await axios.get(`${API_URL}/materiales`);
//         return res.data;
//     } catch (error) {
//         console.error("Error obteniendo materiales:", error);
//         throw error;
//     }
// };

// export const createMaterial = async (material) => {
//     try {
//         const res = await axios.post(`${API_URL}/materiales`, material);
//         return res.data;
//     } catch (error) {
//         console.error("Error creando material:", error);
//         throw error;
//     }
// };

// export const updateMaterial = async (id, material) => {
//     try {
//         const res = await axios.put(`${API_URL}/materiales/${id}`, material);
//         return res.data;
//     } catch (error) {
//         console.error("Error actualizando material:", error);
//         throw error;
//     }
// };

// /**
//  * Obtiene la lista de placas (vehículos) desde la API (Requiere Token).
//  */
// export const fetchPlacas = async () => {
//   // 🛑 Validación CRÍTICA: Bloquear la llamada si no hay token
//   if (!getToken()) {
//     console.error("Token de autenticación faltante para fetchPlacas.");
//     return [];
//   }

//   try {
//     const response = await fetch(`${BASE_URL}/placas`, {
//       headers: getAuthHeaders(), // <-- USANDO EL TOKEN
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Error ${response.status}: Acceso no autorizado o fallo del servidor.`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Fallo al obtener placas:", error);
//     return [];
//   }
// };
