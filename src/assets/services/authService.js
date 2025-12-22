
// ------------------------ ARCHIVO DE AUTENTICACIÓN (authService.js) ------------------------

// const BASE_URL = "http://192.168.150.4:8000";
// const LOGIN_URL = `${BASE_URL}/auth/token`;

// export const loginUser = async (data) => {
//   try {
//     const body = new URLSearchParams();
//     body.append("username", data.usuario);
//     body.append("password", data.contrasena);

//     const res = await fetch(LOGIN_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: body,
//     });

//     const result = await res.json();

//     if (res.ok && result.access_token) {
//       // Usa la clave "userToken" para guardar el JWT
//       localStorage.setItem("userToken", result.access_token);
//       return { ok: true, data: result };
//     }

//     return { ok: false, error: result };
//   } catch (err) {
//     console.error("Error login:", err);
//     return { ok: false, error: "Error de servidor o red" };
//   }
// };

// // Exporta la función para obtener el token con la clave correcta
// export const getToken = () => localStorage.getItem("userToken");

// export const logoutUser = () => localStorage.removeItem("userToken");

// ------------------------ ARCHIVO DE AUTENTICACIÓN (authService.js) ------------------------

const BASE_URL = "http://192.168.150.8:8000";
const LOGIN_URL = `${BASE_URL}/auth/token`;

/**
 * Iniciar sesión en FastAPI
 * Envía usuario y contraseña en formato x-www-form-urlencoded
 */
export const loginUser = async (data) => {
  try {
    const body = new URLSearchParams();
    body.append("username", data.usuario);
    body.append("password", data.contrasena);

    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const result = await res.json();

    if (res.ok && result.access_token) {
      // Guardar token en localStorage
      localStorage.setItem("userToken", result.access_token);
      return { ok: true, data: result };
    }

    return { ok: false, error: result };
  } catch (err) {
    console.error("Error login:", err);
    return { ok: false, error: "Error de servidor o red" };
  }
};

/**
 * Obtener token guardado
 */
export const getToken = () => localStorage.getItem("userToken");

/**
 * Borrar token del almacenamiento
 */
export const logoutUser = () => localStorage.removeItem("userToken");

/**
 * Headers usados para todas las peticiones protegidas
 */
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});


