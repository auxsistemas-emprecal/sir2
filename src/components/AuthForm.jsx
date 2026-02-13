// src/components/AuthForm.jsx
import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { loginUser } from "../assets/services/authService";
import LogoEmprecal from "../assets/services/img/Estrategia-comercial.png";

const AuthForm = ({ onLogin, setUsuario }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [datos, setDatos] = useState({ usuario: "", contrasena: "" });
  
  // Estado para las partículas de las teclas
  const [particulas, setParticulas] = useState([]);

  // 1. Coordenadas de la luz
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
  const lightX = useSpring(mouseX, springConfig);
  const lightY = useSpring(mouseY, springConfig);

  // Función para crear partículas al escribir
  const crearParticula = useCallback(() => {
    const id = Math.random();
    const nuevaParticula = {
      id,
      x: mouseX.get() + 250, // Salen desde donde está el puntero
      y: mouseY.get() + 250,
      color: Math.random() > 0.5 ? "#10b981" : "#3b82f6",
      angle: Math.random() * Math.PI * 2,
      velocity: Math.random() * 100 + 50
    };

    setParticulas((prev) => [...prev.slice(-15), nuevaParticula]); // Máximo 15 partículas para rendimiento
    setTimeout(() => {
      setParticulas((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 250);
      mouseY.set(e.clientY - 250);
    };

    const handleKeyDown = () => crearParticula();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mouseX, mouseY, crearParticula]);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    if (e.target.name === "usuario") setUsuario(e.target.value);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const res = await loginUser(datos);
      if (res.ok) {
        setMensaje("¡Acceso validado!");
        setTimeout(() => onLogin(), 800);
      } else {
        setError(res.error?.detail || "Credenciales incorrectas.");
      }
    } catch (err) {
      setError("Error de red con Pedregosa API.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#020617] p-4 relative overflow-hidden">
      
      {/* CAPA DE PARTÍCULAS (Z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatePresence>
          {particulas.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
              animate={{ 
                x: p.x + Math.cos(p.angle) * p.velocity,
                y: p.y + Math.sin(p.angle) * p.velocity,
                opacity: 0,
                scale: 0
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full blur-[1px]"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* LUZ DINÁMICA */}
      <motion.div
        style={{ left: lightX, top: lightY }}
        className="fixed w-[500px] h-[500px] bg-[#10b981]/15 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={error ? { 
          opacity: 1, 
          y: 0,
          x: [0, -10, 10, -10, 10, 0], // Efecto Shake si hay error
          transition: { duration: 0.4 }
        } : { opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 space-y-6 bg-[#111827]/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative z-10"
      >
        <div className="flex flex-col items-center">
          <motion.img 
            src={LogoEmprecal} 
            alt="Logo Emprecal" 
            className="h-16 mb-4 object-contain"
            whileHover={{ rotate: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 2 } }}
          />
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Emprecal <span className="text-[#10b981]">S.A.S.</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">
            Portal Operativo
          </p>
        </div>

        {/* Alertas con AnimatePresence */}
        <div className="h-12 flex items-center">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-full p-3 text-[10px] font-black text-red-400 bg-red-900/20 border-l-4 border-red-500 rounded-lg"
              >
                {error}
              </motion.div>
            )}
            {mensaje && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 text-[10px] font-black text-[#10b981] bg-[#10b981]/10 border-l-4 border-[#10b981] rounded-lg text-center"
              >
                {mensaje}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuario</label>
            <input
              type="text"
              name="usuario"
              value={datos.usuario}
              onChange={manejarCambio}
              required
              className="w-full px-5 py-4 bg-[#020617]/50 border border-white/10 rounded-2xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all text-white placeholder:text-gray-700"
              placeholder="Identificación"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                value={datos.contrasena}
                onChange={manejarCambio}
                required
                className="w-full px-5 py-4 bg-[#020617]/50 border border-white/10 rounded-2xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all text-white pr-12 placeholder:text-gray-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#10b981] transition-colors"
              >
                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={cargando}
            className={`w-full py-4 rounded-2xl text-white font-black tracking-widest transition-all shadow-xl mt-4
              ${cargando ? "bg-gray-800" : "bg-[#10b981] hover:bg-[#059669]"}`}
          >
            {cargando ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>ACCEDIENDO...</span>
              </div>
            ) : "INGRESAR AL PORTAL"}
          </motion.button>
        </form>

        <footer className="pt-6 text-center border-t border-white/5">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">
            Pedregosa v28.22.21.1 • Emprecal S.A.S.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default AuthForm;
// // src/components/AuthForm.jsx
// import { useState, useEffect } from "react";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
// import { loginUser } from "../assets/services/authService";
// import LogoEmprecal from "../assets/services/img/Estrategia-comercial.png";

// const AuthForm = ({ onLogin, setUsuario }) => {
//   const [cargando, setCargando] = useState(false);
//   const [error, setError] = useState("");
//   const [mensaje, setMensaje] = useState("");
//   const [mostrarContrasena, setMostrarContrasena] = useState(false);
//   const [datos, setDatos] = useState({ usuario: "", contrasena: "" });

//   // 1. Coordenadas de alta precisión
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);

//   // 2. Configuración de suavizado "Premium" (más firme, menos rebote)
//   const springConfig = { damping: 40, stiffness: 250, mass: 0.5 };
//   const lightX = useSpring(mouseX, springConfig);
//   const lightY = useSpring(mouseY, springConfig);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       // Calculamos la posición restando la mitad del ancho/alto (250px) 
//       // para que el puntero quede exactamente en el centro del brillo
//       mouseX.set(e.clientX - 250);
//       mouseY.set(e.clientY - 250);
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, [mouseX, mouseY]);

//   const manejarCambio = (e) => {
//     setDatos({ ...datos, [e.target.name]: e.target.value });
//     if (e.target.name === "usuario") setUsuario(e.target.value);
//   };

//   const manejarEnvio = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMensaje("");
//     setCargando(true);

//     try {
//       const res = await loginUser(datos);
//       if (res.ok) {
//         setMensaje("¡Acceso validado!");
//         setTimeout(() => onLogin(), 800);
//       } else {
//         setError(res.error?.detail || "Credenciales incorrectas.");
//       }
//     } catch (err) {
//       setError("Error de red con Pedregosa API.");
//     } finally {
//       setCargando(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen w-full bg-[#020617] p-4 relative overflow-hidden">
      
//       {/* LUZ DINÁMICA PROFESIONAL 
//           Cambiado a 'fixed' para que la posición sea absoluta respecto a la pantalla 
//       */}
//       <motion.div
//         style={{
//           left: lightX,
//           top: lightY,
//         }}
//         className="fixed w-[500px] h-[500px] bg-[#10b981]/15 rounded-full blur-[100px] pointer-events-none z-0"
//       />

//       {/* Luz ambiental estática de apoyo */}
//       <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="w-full max-w-sm p-8 space-y-6 bg-[#111827]/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 relative z-10"
//       >
//         <div className="flex flex-col items-center">
//           <motion.img 
//             src={LogoEmprecal} 
//             alt="Logo Emprecal" 
//             className="h-16 mb-4 object-contain"
//             whileHover={{ scale: 1.05 }}
//           />
//           <h1 className="text-2xl font-black text-white tracking-tight uppercase">
//             Emprecal <span className="text-[#10b981]">S.A.S.</span>
//           </h1>
//           <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">
//             Portal Operativo
//           </p>
//         </div>

//         {/* Contenedor de Alertas con altura fija para evitar saltos */}
//         <div className="h-12 flex items-center">
//           <AnimatePresence mode="wait">
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 className="w-full p-3 text-[11px] font-bold text-red-400 bg-red-900/20 border-l-4 border-red-500 rounded-lg"
//               >
//                 {error}
//               </motion.div>
//             )}
//             {mensaje && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="w-full p-3 text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 border-l-4 border-[#10b981] rounded-lg"
//               >
//                 {mensaje}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         <form onSubmit={manejarEnvio} className="space-y-4">
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuario</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 name="usuario"
//                 value={datos.usuario}
//                 onChange={manejarCambio}
//                 required
//                 className="w-full px-5 py-4 bg-[#020617]/50 border border-white/10 rounded-2xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all text-white placeholder:text-gray-700"
//                 placeholder="Identificación"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
//             <div className="relative">
//               <input
//                 type={mostrarContrasena ? "text" : "password"}
//                 name="contrasena"
//                 value={datos.contrasena}
//                 onChange={manejarCambio}
//                 required
//                 className="w-full px-5 py-4 bg-[#020617]/50 border border-white/10 rounded-2xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all text-white pr-12 placeholder:text-gray-700"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setMostrarContrasena(!mostrarContrasena)}
//                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#10b981] transition-colors"
//               >
//                 {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <motion.button
//             whileHover={{ scale: 1.01, translateY: -2 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             disabled={cargando}
//             className={`w-full py-4 rounded-2xl text-white font-black tracking-widest transition-all shadow-xl mt-4
//               ${cargando ? "bg-gray-800 cursor-not-allowed" : "bg-[#10b981] hover:bg-[#059669] shadow-[#10b981]/20"}`}
//           >
//             {cargando ? (
//               <div className="flex items-center justify-center gap-2">
//                 <Loader2 className="animate-spin" size={20} />
//                 <span>VALIDANDO...</span>
//               </div>
//             ) : "INGRESAR"}
//           </motion.button>
//         </form>

//         <footer className="pt-6 text-center border-t border-white/5">
//           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">
//             Versión 1.2.1 • Emprecal S.A.S.
//           </p>
//         </footer>
//       </motion.div>
//     </div>
//   );
// };

// export default AuthForm;

// // src/components/AuthForm.jsx
// import { useState, useEffect } from "react";
// // Importamos los iconos de lucide-react (asumiendo que ya están disponibles)
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// // CORRECCIÓN: Quitamos la extensión explícita '.js' ya que el entorno la estaba rechazando con la ruta relativa.
// import { loginUser } from "../assets/services/authService";

// const AuthForm = ({ onLogin, setUsuario }) => {
//   const [cargando, setCargando] = useState(false);
//   const [error, setError] = useState("");
//   const [mensaje, setMensaje] = useState("");
//   // Nuevo estado para controlar la visibilidad de la contraseña
//   const [mostrarContrasena, setMostrarContrasena] = useState(false);

//   const [datos, setDatos] = useState({
//     usuario: "",
//     contrasena: "",
//   });

//   const manejarCambio = (e) => {
//     setDatos({
//       ...datos,
//       [e.target.name]: e.target.value,
//     });
//     if (e.target.name === "usuario") {
//       setUsuario(e.target.value);
//     }
//   };

//   const validar = () => {
//     if (datos.usuario.trim() === "") return "Debe ingresar un usuario.";
//     if (datos.contrasena.length < 6)
//       return "La contraseña debe tener mínimo 6 caracteres.";
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
//         setMensaje("Inicio de sesión exitoso. Redirigiendo...");
//         onLogin();
//       } else {
//         // Manejo de errores de respuesta de la API
//         const errorMensaje =
//           res.error?.detail || "Usuario o contraseña incorrectos.";
//         setError(errorMensaje);
//       }
//     } catch (err) {
//       setError("Error de red. Intenta más tarde.");
//     } finally {
//       setCargando(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-screen w-full bg-gray-50">
//       <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl">
//         <h2 className="text-3xl font-bold text-center text-indigo-800">
//           Acceso al Sistema
//         </h2>
//         <p className="text-center text-gray-500">
//           Ingresa tus credenciales para continuar
//         </p>

//         {error && (
//           <div
//             className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
//             role="alert"
//           >
//             {error}
//           </div>
//         )}
//         {mensaje && (
//           <div
//             className="p-3 text-sm text-green-700 bg-green-100 rounded-lg"
//             role="alert"
//           >
//             {mensaje}
//           </div>
//         )}

//         <form onSubmit={manejarEnvio} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Usuario
//             </label>
//             <input
//               type="text"
//               name="usuario"
//               value={datos.usuario}
//               onChange={manejarCambio}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg 
//                          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Contraseña
//             </label>
//             <input
//               // 💡 CAMBIO CLAVE: El tipo depende del estado 'mostrarContrasena'
//               type={mostrarContrasena ? "text" : "password"}
//               name="contrasena"
//               value={datos.contrasena}
//               onChange={manejarCambio}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 
//                          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             {/* Botón para alternar la visibilidad */}
//             <button
//               type="button"
//               onClick={() => setMostrarContrasena(!mostrarContrasena)}
//               className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-indigo-600 transition"
//               aria-label={
//                 mostrarContrasena ? "Ocultar Contraseña" : "Mostrar Contraseña"
//               }
//             >
//               {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={cargando}
//             className={`w-full py-2 px-4 rounded-lg shadow text-white font-medium transition flex items-center justify-center
//               ${
//                 cargando
//                   ? "bg-indigo-400 cursor-not-allowed"
//                   : "bg-indigo-600 hover:bg-indigo-700"
//               }
//             `}
//           >
//             {cargando ? (
//               <>
//                 <Loader2 className="animate-spin mr-2" size={20} />{" "}
//                 Procesando...
//               </>
//             ) : (
//               "Ingresar"
//             )}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-500">
//           Sistema interno de la empresa – acceso autorizado
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;
