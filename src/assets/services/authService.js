// ------------------------ ARCHIVO DE AUTENTICACIÓN (authService.js) ------------------------
// true = modo edicion
// false = modo real
const isDev = true;

const BASE_URL = !isDev
  ? "https://pedregosa-auxsistemas-emprecal7067-4n2fqys7.leapcell.dev"
  : "http://192.168.150.12:8000";

  // http://192.168.150.9:8000 - computador
  // http://192.168.0.204:8000 - celular

/** * CORRECCIÓN: 
 * Según tus imágenes de Swagger, el endpoint está bajo el prefijo "/auth".
 * Cambiamos de `${BASE_URL}/token` a `${BASE_URL}/auth/token`
 */
const LOGIN_URL = `${BASE_URL}/auth/token`; 

/**
 * Iniciar sesión en FastAPI
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
      // 1. Guardar token
      localStorage.setItem("userToken", result.access_token);
      
      const userProfile = result.user || { 
        nombreUsuario: data.usuario, 
        rol: result.rol || "vendedor" 
      };
      
      localStorage.setItem("usuario", JSON.stringify(userProfile));

      return { ok: true, data: result };
    }

    // Si el error es 401 o similar, devolvemos el detalle
    return { ok: false, error: result.detail || "Error en credenciales" };
  } catch (err) {
    console.error("Error login:", err);
    return { ok: false, error: "Error de servidor o red" };
  }
};

/**
 * EL BLINDAJE: Verificar sesión real contra el servidor.
 * CORRECCIÓN: También debe llevar el prefijo "/auth/me"
 */
export const verifySession = async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      // Si el servidor rechaza el token (expirado o falso), cerramos sesión
      logoutUser();
      return null;
    }

    const userData = await res.json();
    
    // Sincronizamos el localStorage con la verdad del servidor
    localStorage.setItem("usuario", JSON.stringify(userData));
    return userData; 
  } catch (err) {
    console.error("Error verifySession:", err);
    return null;
  }
};

export const getUserData = () => {
  const user = localStorage.getItem("usuario");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const getToken = () => localStorage.getItem("userToken");

export const logoutUser = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("usuario");
};

export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});


// // ------------------------ ARCHIVO DE AUTENTICACIÓN (authService.js) ------------------------
// // true = modo edicion
// // false = modo real 
// const isDev = true;

// const BASE_URL = !isDev
//   ? "https://pedregosa-auxsistemas-emprecal7067-4n2fqys7.leapcell.dev"
//   : "http://192.168.150.9:8000";

// const LOGIN_URL = `${BASE_URL}/auth/token`;

// /**
//  * Iniciar sesión en FastAPI
//  * Envía usuario y contraseña en formato x-www-form-urlencoded
//  */
// export const loginUser = async (data) => {
//   try {
//     const body = new URLSearchParams();
//     body.append("username", data.usuario);
//     body.append("password", data.contrasena);

//     const res = await fetch(LOGIN_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body,
//     });

//     const result = await res.json();
//     if (res.ok && result.access_token) {
//       // Guardar token en localStorage
//       localStorage.setItem("userToken", result.access_token);
//       return { ok: true, data: result };
//     }

//     return { ok: false, error: result };
//   } catch (err) {
//     console.error("Error login:", err);
//     return { ok: false, error: "Error de servidor o red" };
//   }
// };

// /**
//  * Obtener token guardado
//  */
// export const getToken = () => localStorage.getItem("userToken");

// /**
//  * Borrar token del almacenamiento
//  */
// export const logoutUser = () => localStorage.removeItem("userToken");

// /**
//  * Headers usados para todas las peticiones protegidas
//  */
// export const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${getToken()}`,
// });

