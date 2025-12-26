// // src/components/Sidebar.jsx

// import React from "react";
// import Swal from "sweetalert2";
// import {
//   FileText,
//   Settings,
//   Home,
//   X,
//   FileSpreadsheet,
//   SquareUser,
//   DollarSign,
//   Archive,
//   LogOut,
//   UserStar,
//   ClipboardList,
//   CreditCard
// } from "lucide-react";

// export default function Sidebar({
//   isOpen,
//   setIsOpen,
//   activeTab,
//   setActiveTab,
//   onLogout,
// }) {
//   const handleLogoutConfirm = () => {
//     Swal.fire({
//       title: "¿Cerrar sesión?",
//       text: "Se cerrará tu sesión actual.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Sí, cerrar sesión",
//       cancelButtonText: "Cancelar",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         onLogout();
//       }
//     });
//   };

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${
//         isOpen ? "translate-x-0" : "-translate-x-full"
//       } lg:translate-x-0 lg:static lg:inset-auto shadow-2xl flex flex-col h-full`}
//     >
//       {/* ENCABEZADO */}
//       <div className="flex items-center justify-between p-6 bg-slate-800 shrink-0">
//         <span className="text-xl font-bold tracking-wider text-emerald-400">
//           EMPRECAL S.A.
//         </span>
//         <button
//           onClick={() => setIsOpen(false)}
//           className="lg:hidden text-gray-300 hover:text-white"
//         >
//           <X size={24} />
//         </button>
//       </div>

//       {/* NAV */}
//       <nav className="mt-6 px-4 space-y-2 flex-1">
//         <NavItem
//           icon={<Home size={20} />}
//           label="Inicio"
//           active={activeTab === "inicio"}
//           onClick={() => setActiveTab("inicio")}
//         />

//         <NavItem
//           icon={<FileText size={20} />}
//           label="Generar Remisión"
//           active={activeTab === "generador"}
//           onClick={() => setActiveTab("generador")}
//         />

//         <NavItem
//           icon={<ClipboardList size={20} />} // Usando Archive, ya importado
//           label="Cuadre Caja"
//           active={activeTab === "cuadreCaja"}
//           onClick={() => setActiveTab("cuadreCaja")}
//         />

//         <NavItem
//           icon={<FileSpreadsheet size={20} />}
//           label="Movimientos"
//           active={activeTab === "movimientos"}
//           onClick={() => setActiveTab("movimientos")}
//         />

//         <NavItem
//           icon={<DollarSign size={20} />}
//           label="Reg. Anticipo"
//           active={activeTab === "anticipo"}
//           onClick={() => setActiveTab("anticipo")}
//         />

//         <NavItem
//           icon={<Archive size={20} />}
//           label="Anticipos Archivados"
//           active={activeTab === "archivedAnticipos"}
//           onClick={() => setActiveTab("archivedAnticipos")}
//         />

//         <NavItem
//           icon={<SquareUser size={20} />}
//           label="Terceros"
//           active={activeTab === "terceros"}
//           onClick={() => setActiveTab("terceros")}
//         />

//         <NavItem
//           icon={<UserStar size={20} />}
//           label="Precios especiales"
//           active={activeTab === "PreciosEspeciales"}
//           onClick={() => setActiveTab("PreciosEspeciales")}
//         />

//         <NavItem
//           icon={<CreditCard size={20} />}
//           label="Créditos"
//           active={activeTab === "creditos"}
//           onClick={() => setActiveTab("creditos")}
//         />

//         <NavItem
//           icon={<Settings size={20} />}
//           label="Configuración"
//           active={activeTab === "config"}
//           onClick={() => setActiveTab("config")}
//         />
//       </nav>



//       {/* BOTÓN CERRAR SESIÓN */}
//       <div className="px-4 mb-4">
//         <button
//           onClick={handleLogoutConfirm}
//           className="flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
//                     text-red-400 hover:text-red-200 hover:bg-slate-800 hover:translate-x-1"
//         >
//           <LogOut size={20} className="mr-3" />
//           <span className="font-medium">Cerrar sesión</span>
//         </button>
//       </div>

//       {/* FOOTER */}
//       <div className="p-4 text-xs text-slate-500 text-center shrink-0">
//         Versión 1.2.1 Final
//       </div>
//     </aside>
//   );
// }

// const NavItem = ({ icon, label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
//       active
//         ? "bg-emerald-600 text-white shadow-lg translate-x-1"
//         : "text-gray-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
//     }`}
//   >
//     <span className="mr-3">{icon}</span>
//     <span className="font-medium">{label}</span>
//   </button>
// );


// src/components/Sidebar.jsx

import React from "react";
import Swal from "sweetalert2";
import {
  FileText,
  Settings,
  Home,
  X,
  FileSpreadsheet,
  SquareUser,
  DollarSign,
  Archive,
  LogOut,
  UserStar,
  ClipboardList,
  CreditCard,
  Calculator, // 1. Importamos el nuevo icono
  BarChart3,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  onLogout,
}) {
  const handleLogoutConfirm = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-auto shadow-2xl flex flex-col h-full`}
    >
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between p-6 bg-slate-800 shrink-0">
        <span className="text-xl font-bold tracking-wider text-emerald-400">
          EMPRECAL S.A.
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-300 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* NAV */}
      <nav className="mt-6 px-4 space-y-2 flex-1">
        <NavItem
          icon={<Home size={20} />}
          label="Inicio"
          active={activeTab === "inicio"}
          onClick={() => setActiveTab("inicio")}
        />

        <NavItem
          icon={<FileText size={20} />}
          label="Generar Remisión"
          active={activeTab === "generador"}
          onClick={() => setActiveTab("generador")}
        />

        <NavItem
          icon={<ClipboardList size={20} />}
          label="Cuadre Caja"
          active={activeTab === "cuadreCaja"}
          onClick={() => setActiveTab("cuadreCaja")}
        />

        <NavItem
          icon={<FileSpreadsheet size={20} />}
          label="Movimientos"
          active={activeTab === "movimientos"}
          onClick={() => setActiveTab("movimientos")}
        />

        {/* 2. AGREGAMOS EL NAVITEM DE CONTABILIDAD */}
        <NavItem
          icon={<Calculator size={20} />}
          label="Contabilidad"
          active={activeTab === "contabilidad"}
          onClick={() => setActiveTab("contabilidad")}
        />

        <NavItem
          icon={<DollarSign size={20} />}
          label="Reg. Anticipo"
          active={activeTab === "anticipo"}
          onClick={() => setActiveTab("anticipo")}
        />

        <NavItem
          icon={<Archive size={20} />}
          label="Anticipos Archivados"
          active={activeTab === "archivedAnticipos"}
          onClick={() => setActiveTab("archivedAnticipos")}
        />

        <NavItem
          icon={<SquareUser size={20} />}
          label="Terceros"
          active={activeTab === "terceros"}
          onClick={() => setActiveTab("terceros")}
        />

        <NavItem
          icon={<UserStar size={20} />}
          label="Precios especiales"
          active={activeTab === "PreciosEspeciales"}
          onClick={() => setActiveTab("PreciosEspeciales")}
        />

        <NavItem 
          icon={<BarChart3 size={20} />}
          label="Reporte Compras"
          active={activeTab === "reporteCompras"}
          onClick={() => setActiveTab("reporteCompras")}
        />

        <NavItem
          icon={<CreditCard size={20} />}
          label="Créditos"
          active={activeTab === "creditos"}
          onClick={() => setActiveTab("creditos")}
        />

        <NavItem
          icon={<Settings size={20} />}
          label="Configuración"
          active={activeTab === "config"}
          onClick={() => setActiveTab("config")}
        />
      </nav>

      {/* BOTÓN CERRAR SESIÓN */}
      <div className="px-4 mb-4">
        <button
          onClick={handleLogoutConfirm}
          className="flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                    text-red-400 hover:text-red-200 hover:bg-slate-800 hover:translate-x-1"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-4 text-xs text-slate-500 text-center shrink-0">
        Versión 1.2.1 Final
      </div>
    </aside>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
      active
        ? "bg-emerald-600 text-white shadow-lg translate-x-1"
        : "text-gray-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

