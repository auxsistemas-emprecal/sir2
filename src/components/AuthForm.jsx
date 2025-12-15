// src/components/AuthForm.jsx
import { useState, useEffect } from "react";
// Importamos los iconos de lucide-react (asumiendo que ya están disponibles)
import { Eye, EyeOff, Loader2 } from "lucide-react";
// CORRECCIÓN: Quitamos la extensión explícita '.js' ya que el entorno la estaba rechazando con la ruta relativa.
import { loginUser } from "../assets/services/authService";

const AuthForm = ({ onLogin, setUsuario }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  // Nuevo estado para controlar la visibilidad de la contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [datos, setDatos] = useState({
    usuario: "",
    contrasena: "",
  });

  const manejarCambio = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "usuario") {
      setUsuario(e.target.value);
    }
  };

  const validar = () => {
    if (datos.usuario.trim() === "") return "Debe ingresar un usuario.";
    if (datos.contrasena.length < 6)
      return "La contraseña debe tener mínimo 6 caracteres.";
    return null;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);

    try {
      const res = await loginUser(datos);

      if (res.ok) {
        setMensaje("Inicio de sesión exitoso. Redirigiendo...");
        onLogin();
      } else {
        // Manejo de errores de respuesta de la API
        const errorMensaje =
          res.error?.detail || "Usuario o contraseña incorrectos.";
        setError(errorMensaje);
      }
    } catch (err) {
      setError("Error de red. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-indigo-800">
          Acceso al Sistema
        </h2>
        <p className="text-center text-gray-500">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <div
            className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}
        {mensaje && (
          <div
            className="p-3 text-sm text-green-700 bg-green-100 rounded-lg"
            role="alert"
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              value={datos.usuario}
              onChange={manejarCambio}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              // 💡 CAMBIO CLAVE: El tipo depende del estado 'mostrarContrasena'
              type={mostrarContrasena ? "text" : "password"}
              name="contrasena"
              value={datos.contrasena}
              onChange={manejarCambio}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* Botón para alternar la visibilidad */}
            <button
              type="button"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-indigo-600 transition"
              aria-label={
                mostrarContrasena ? "Ocultar Contraseña" : "Mostrar Contraseña"
              }
            >
              {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-2 px-4 rounded-lg shadow text-white font-medium transition flex items-center justify-center
              ${
                cargando
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }
            `}
          >
            {cargando ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />{" "}
                Procesando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Sistema interno de la empresa – acceso autorizado
        </p>
      </div>
    </div>
  );
};

export default AuthForm;

// // -------------------------- ARCHIVO VIEJO 02/12 3:15--------------------------

// // src/components/AuthForm.jsx
// import { useState } from "react";
// // import { loginUser } from "../services/authService";
// import { loginUser } from "../assets/services/authService";

// const AuthForm = ({ onLogin }) => {
//   const [cargando, setCargando] = useState(false);
//   const [error, setError] = useState("");
//   const [mensaje, setMensaje] = useState("");

//   const [datos, setDatos] = useState({
//     usuario: "",
//     contrasena: "",
//   });

//   const manejarCambio = (e) => {
//     setDatos({
//       ...datos,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const validar = () => {
//     if (datos.usuario.trim() === "") return "Debe ingresar un usuario.";
//     if (datos.contrasena.length < 6) return "La contraseña debe tener mínimo 6 caracteres.";
//     return null;
//   };

//   const manejarEnvio = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMensaje("");

//     const errorValidacion = validar();
//     if (errorValidacion) {
//       setError(errorValidacion);
//       return;
//     }

//     setCargando(true);

//     try {
//       const res = await loginUser(datos);

//       if (res.ok) {
//         setMensaje("Inicio de sesión correcto.");
//         setTimeout(() => setMensaje(""), 1500);
//         // Avisar a App que ya hay login
//         if (typeof onLogin === "function") onLogin();
//       } else {
//         // Puedes mostrar error retornado por API (res.error o res.error.detail)
//         const errMsg =
//           res.error?.detail ?? res.error?.message ?? JSON.stringify(res.error) ?? "Error de autenticación";
//         setError(errMsg);
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Error al contactar el servidor.");
//     } finally {
//       setCargando(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Acceso al Sistema</h2>

//         {error && <p className="mb-4 text-red-600 text-center font-medium">{error}</p>}
//         {/* {mensaje && <p className="mb-4 text-green-600 text-center font-medium">{mensaje}</p>} */}
//         {mensaje &&<p className="mb-4 text-red-600 text-center font-medium">{typeof error === "string" ? error : JSON.stringify(error)}</p>}

//         <form onSubmit={manejarEnvio} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
//             <input
//               type="text"
//               name="usuario"
//               value={datos.usuario}
//               onChange={manejarCambio}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
//             <input
//               type="password"
//               name="contrasena"
//               value={datos.contrasena}
//               onChange={manejarCambio}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={cargando}
//             className={`w-full py-2 px-4 rounded-lg shadow text-white font-medium transition ${cargando ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
//           >
//             {cargando ? "Procesando..." : "Ingresar"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-500">Sistema interno de la empresa – acceso autorizado</p>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;

// -------------------CODIGO VIEJO -------------------

// import { useState } from "react";
// import { loginUser } from "../services/authService";

// const AuthForm = () => {
//     const [cargando, setCargando] = useState(false);
//     const [error, setError] = useState("");
//     const [mensaje, setMensaje] = useState("");

//     const [datos, setDatos] = useState({
//         usuario: "",
//         contrasena: "",
//     });

//     const manejarCambio = (e) => {
//         setDatos({
//             ...datos,
//             [e.target.name]: e.target.value,
//         });
//     };

//     // Validación simple
//     const validar = () => {
//         if (datos.usuario.trim() === "") {
//             return "Debe ingresar un usuario.";
//         }
//         if (datos.contrasena.length < 6) {
//             return "La contraseña debe tener mínimo 6 caracteres.";
//         }
//         return null;
//     };

//     const manejarEnvio = async (e) => {
//         e.preventDefault();
//         setError("");
//         setMensaje("");

//         const errorValidacion = validar();
//         if (errorValidacion) {
//             setError(errorValidacion);
//             return;
//         }

//         setCargando(true);

//         try {
//             console.log("📡 Enviando datos de login...", datos);
//             const res = await loginUser(datos);

//             setMensaje("Inicio de sesión exitoso (simulado).");
//             console.log(res);

//         } catch (err) {
//             setError("Error al contactar el servidor.");
//         }

//         setCargando(false);
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//             <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

//                 <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
//                     Acceso al Sistema
//                 </h2>

//                 {error && (
//                     <p className="mb-4 text-red-600 text-center font-medium">
//                         {error}
//                     </p>
//                 )}

//                 {mensaje && (
//                     <p className="mb-4 text-green-600 text-center font-medium">
//                         {mensaje}
//                     </p>
//                 )}

//                 <form onSubmit={manejarEnvio} className="space-y-6">

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Usuario
//                         </label>
//                         <input
//                             type="text"
//                             name="usuario"
//                             value={datos.usuario}
//                             onChange={manejarCambio}
//                             required
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg
//                                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Contraseña
//                         </label>
//                         <input
//                             type="password"
//                             name="contrasena"
//                             value={datos.contrasena}
//                             onChange={manejarCambio}
//                             required
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg
//                                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={cargando}
//                         className={`w-full py-2 px-4 rounded-lg shadow text-white font-medium transition
//                             ${cargando ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}
//                         `}
//                     >
//                         {cargando ? "Procesando..." : "Ingresar"}
//                     </button>
//                 </form>

//                 <p className="mt-6 text-center text-sm text-gray-500">
//                     Sistema interno de la empresa – acceso autorizado
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default AuthForm;
