import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Settings,
  SquareUser,
  UserStar,
  FileText,
  Hash,
  FileSearchCorner,
  BellRing,
  ShieldCheck,
  History,
} from "lucide-react";
import { verifySession } from "../assets/services/authService.js";

const Utilidades = ({ setActiveTab }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hoveredTheme, setHoveredTheme] = useState(
    "from-slate-50 to-slate-100",
  );

  useEffect(() => {
    const validarAccesoReal = async () => {
      const data = await verifySession();
      if (data) {
        setUserRole(data.rol);
      }
      setLoading(false);
    };
    validarAccesoReal();
  }, []);

  const modulos = [

    {
      id: "FirmaCliente",
      titulo: "Firma de Conformidad",
      descripcion: "Formalización digital de servicios y despacho de materiales.",
      icon: <ShieldCheck size={24} />, 
      theme: "from-emerald-600 to-slate-700", 
      bgColor: "from-emerald-50 to-slate-100", 
      shadow: "shadow-emerald-200/50",
      soloAdmin: false, 
    },
    
    {
      id: "reporteCompras",
      titulo: "Reporte de Compras",
      descripcion: "Historial de compras de material por terceros.",
      icon: <BarChart3 size={24} />,
      theme: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50", // Color de fondo suave
      shadow: "shadow-blue-200",
    },
    {
      id: "terceros",
      titulo: "Gestión de Terceros",
      descripcion: "Administra conductores, clientes y proveedores.",
      icon: <SquareUser size={24} />,
      theme: "from-emerald-400 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      shadow: "shadow-emerald-200",
    },
    {
      id: "PreciosEspeciales",
      titulo: "Precios Especiales",
      descripcion: "Tarifas personalizadas por cliente específico.",
      icon: <UserStar size={24} />,
      theme: "from-amber-400 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      shadow: "shadow-orange-200",
    },
    {
      id: "config",
      titulo: "Configuración",
      descripcion: "Ajustes de precios y métodos de pago.",
      icon: <Settings size={24} />,
      theme: "from-slate-600 to-slate-800",
      bgColor: "from-slate-100 to-slate-200",
      shadow: "shadow-slate-300",
    },
    {
      id: "CuadreRevision",
      titulo: "Revisión de Cuadre",
      descripcion: "Análisis de cierres de caja históricos.",
      icon: <FileText size={24} />,
      theme: "from-purple-500 to-violet-700",
      bgColor: "from-purple-50 to-violet-50",
      shadow: "shadow-purple-200",
    },
    {
      id: "archivosContabilidad",
      titulo: "Contabilidad",
      descripcion: "Facturación y exportación contable detallada.",
      icon: <FileSearchCorner size={24} />,
      theme: "from-rose-500 to-red-600",
      bgColor: "from-rose-50 to-red-50",
      shadow: "shadow-rose-200",
    },
    {
      id: "plaquetas",
      titulo: "Maquinaria",
      descripcion: "Identificación y modelos de equipos pesados.",
      icon: <Hash size={24} />,
      theme: "from-cyan-500 to-blue-600",
      bgColor: "from-cyan-50 to-blue-50",
      shadow: "shadow-cyan-200",
    },
    {
      id: "chatNotificaciones",
      titulo: "Sistema de Avisos",
      descripcion: "Publicación de alertas y banners informativos.",
      icon: <BellRing size={24} />,
      theme: "from-indigo-600 to-blue-700",
      bgColor: "from-indigo-50 to-blue-50",
      shadow: "shadow-indigo-300",
      soloAdmin: true,
    },
    {
      id: "HistorialObservaciones",
      titulo: "Bitácora Auditada",
      descripcion: "Historial de cambios y auditoría de registros.",
      icon: <History size={24} />,
      theme: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      shadow: "shadow-orange-300",
      soloAdmin: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
          Validando Credenciales
        </div>
      </div>
    );
  }

  const modulosVisibles = modulos.filter(
    (modulo) => !modulo.soloAdmin || userRole === "admin",
  );

  return (
    // 🟢 CONTENEDOR PRINCIPAL CON FONDO DINÁMICO
    <div
      className={`p-8 min-h-screen transition-all duration-700 ease-in-out bg-gradient-to-br ${hoveredTheme}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Premium */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center justify-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} />
            Panel de Utilidades
          </h2>
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="h-px w-8 bg-slate-300"></span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
              Pedregosa Central Centralizada
            </p>
            <span className="h-px w-8 bg-slate-300"></span>
          </div>
        </div>

        {/* Grid Moderna */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosVisibles.map((modulo) => (
            <button
              key={modulo.id}
              onClick={() => setActiveTab(modulo.id)}
              // 🟢 EVENTOS PARA CAMBIAR EL FONDO
              onMouseEnter={() => setHoveredTheme(modulo.bgColor)}
              onMouseLeave={() => setHoveredTheme("from-slate-50 to-slate-100")}
              className="group relative bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl text-left overflow-hidden cursor-pointer"
            >
              <div
                className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${modulo.theme} opacity-[0.05] group-hover:opacity-20 rounded-full transition-all duration-500`}
              ></div>

              <div className="relative flex flex-col h-full">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${modulo.theme} ${modulo.shadow} flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform duration-500`}
                >
                  {modulo.icon}
                </div>

                <h3 className="font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-700 transition-colors">
                  {modulo.titulo}
                </h3>

                <p className="text-sm text-slate-500 leading-snug font-medium mb-4 flex-grow">
                  {modulo.descripcion}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                    Acceder Módulo
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${modulo.theme} animate-pulse`}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center mt-12 text-[9px] font-bold text-slate-400 tracking-[0.5em] uppercase">
          Safe Access System • V.28.22.21.1
        </p>
      </div>
    </div>
  );
};

export default Utilidades;

// import React, { useState, useEffect } from "react";
// import {
//   BarChart3,
//   Settings,
//   SquareUser,
//   UserStar,
//   FileText,
//   Hash,
//   FileSearchCorner,
//   BellRing,
//   ShieldCheck,
//   History,
// } from "lucide-react";
// import { verifySession } from "../assets/services/authService.js";

// const Utilidades = ({ setActiveTab }) => {
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [hoveredTheme, setHoveredTheme] = useState(
//     "from-slate-50 to-slate-100",
//   );

//   useEffect(() => {
//     const validarAccesoReal = async () => {
//       const data = await verifySession();
//       if (data) {
//         setUserRole(data.rol);
//       }
//       setLoading(false);
//     };
//     validarAccesoReal();
//   }, []);

//   const modulos = [
//     {
//       id: "reporteCompras",
//       titulo: "Reporte de Compras",
//       descripcion: "Historial de compras de material por terceros.",
//       icon: <BarChart3 size={24} />,
//       theme: "from-blue-500 to-indigo-600",
//       bgColor: "from-blue-50 to-indigo-50", // Color de fondo suave
//       shadow: "shadow-blue-200",
//     },
//     {
//       id: "terceros",
//       titulo: "Gestión de Terceros",
//       descripcion: "Administra conductores, clientes y proveedores.",
//       icon: <SquareUser size={24} />,
//       theme: "from-emerald-400 to-teal-600",
//       bgColor: "from-emerald-50 to-teal-50",
//       shadow: "shadow-emerald-200",
//     },
//     {
//       id: "PreciosEspeciales",
//       titulo: "Precios Especiales",
//       descripcion: "Tarifas personalizadas por cliente específico.",
//       icon: <UserStar size={24} />,
//       theme: "from-amber-400 to-orange-500",
//       bgColor: "from-amber-50 to-orange-50",
//       shadow: "shadow-orange-200",
//     },
//     {
//       id: "config",
//       titulo: "Configuración",
//       descripcion: "Ajustes de precios y métodos de pago.",
//       icon: <Settings size={24} />,
//       theme: "from-slate-600 to-slate-800",
//       bgColor: "from-slate-100 to-slate-200",
//       shadow: "shadow-slate-300",
//     },
//     {
//       id: "CuadreRevision",
//       titulo: "Revisión de Cuadre",
//       descripcion: "Análisis de cierres de caja históricos.",
//       icon: <FileText size={24} />,
//       theme: "from-purple-500 to-violet-700",
//       bgColor: "from-purple-50 to-violet-50",
//       shadow: "shadow-purple-200",
//     },
//     {
//       id: "archivosContabilidad",
//       titulo: "Contabilidad",
//       descripcion: "Facturación y exportación contable detallada.",
//       icon: <FileSearchCorner size={24} />,
//       theme: "from-rose-500 to-red-600",
//       bgColor: "from-rose-50 to-red-50",
//       shadow: "shadow-rose-200",
//     },
//     {
//       id: "plaquetas",
//       titulo: "Maquinaria",
//       descripcion: "Identificación y modelos de equipos pesados.",
//       icon: <Hash size={24} />,
//       theme: "from-cyan-500 to-blue-600",
//       bgColor: "from-cyan-50 to-blue-50",
//       shadow: "shadow-cyan-200",
//     },
//     {
//       id: "chatNotificaciones",
//       titulo: "Sistema de Avisos",
//       descripcion: "Publicación de alertas y banners informativos.",
//       icon: <BellRing size={24} />,
//       theme: "from-indigo-600 to-blue-700",
//       bgColor: "from-indigo-50 to-blue-50",
//       shadow: "shadow-indigo-300",
//       soloAdmin: true,
//     },
//     {
//       id: "HistorialObservaciones",
//       titulo: "Bitácora Auditada",
//       descripcion: "Historial de cambios y auditoría de registros.",
//       icon: <History size={24} />,
//       theme: "from-orange-500 to-red-500",
//       bgColor: "from-orange-50 to-red-50",
//       shadow: "shadow-orange-300",
//       soloAdmin: true,
//     },

//         {
//       id: "FirmaCliente",
//       titulo: "Firma Cliente",
//       descripcion: "nnnn",
//       icon: <History size={24} />,
//       theme: "from-orange-500 to-red-500",
//       bgColor: "from-orange-50 to-red-50",
//       shadow: "shadow-orange-300",
//       soloAdmin: true,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[500px]">
//         <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
//         <div className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
//           Validando Credenciales
//         </div>
//       </div>
//     );
//   }

//   const modulosVisibles = modulos.filter(
//     (modulo) => !modulo.soloAdmin || userRole === "admin",
//   );

//   return (
//     // 🟢 CONTENEDOR PRINCIPAL CON FONDO DINÁMICO
//     <div
//       className={`p-8 min-h-screen transition-all duration-700 ease-in-out bg-gradient-to-br ${hoveredTheme}`}
//     >
//       <div className="max-w-6xl mx-auto">
//         {/* Header Premium */}
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center justify-center gap-3">
//             <ShieldCheck className="text-indigo-600" size={32} />
//             Panel de Utilidades
//           </h2>
//           <div className="flex justify-center items-center gap-2 mt-2">
//             <span className="h-px w-8 bg-slate-300"></span>
//             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
//               Pedregosa Central Centralizada
//             </p>
//             <span className="h-px w-8 bg-slate-300"></span>
//           </div>
//         </div>

//         {/* Grid Moderna */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {modulosVisibles.map((modulo) => (
//             <button
//               key={modulo.id}
//               onClick={() => setActiveTab(modulo.id)}
//               // 🟢 EVENTOS PARA CAMBIAR EL FONDO
//               onMouseEnter={() => setHoveredTheme(modulo.bgColor)}
//               onMouseLeave={() => setHoveredTheme("from-slate-50 to-slate-100")}
//               className="group relative bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl text-left overflow-hidden cursor-pointer"
//             >
//               <div
//                 className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${modulo.theme} opacity-[0.05] group-hover:opacity-20 rounded-full transition-all duration-500`}
//               ></div>

//               <div className="relative flex flex-col h-full">
//                 <div
//                   className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${modulo.theme} ${modulo.shadow} flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform duration-500`}
//                 >
//                   {modulo.icon}
//                 </div>

//                 <h3 className="font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-700 transition-colors">
//                   {modulo.titulo}
//                 </h3>

//                 <p className="text-sm text-slate-500 leading-snug font-medium mb-4 flex-grow">
//                   {modulo.descripcion}
//                 </p>

//                 <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
//                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
//                     Acceder Módulo
//                   </span>
//                   <div
//                     className={`w-2 h-2 rounded-full bg-gradient-to-r ${modulo.theme} animate-pulse`}
//                   ></div>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         <p className="text-center mt-12 text-[9px] font-bold text-slate-400 tracking-[0.5em] uppercase">
//           Safe Access System • V.28.22.21.1
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Utilidades;