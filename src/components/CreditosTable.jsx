// import React, { useState } from "react";
// import { 
//   CreditCard, Search, Calendar, Eye, Tags, 
//   ChevronRight, Receipt, FileText, ArrowRight, 
//   Calculator, User, DollarSign
// } from "lucide-react";

// export default function CreditosTable({ data, onVerDetalle }) {
//   const [searchTerm, setSearchTerm] = useState("");

//   const formatCurrency = (value) =>
//     new Intl.NumberFormat("es-CO", {
//       style: "currency",
//       currency: "COP",
//       minimumFractionDigits: 0,
//     }).format(value || 0);

//   // Lógica de filtrado basada en la de anticipos
//   const filteredData = data.filter((item) => {
//     const lowerTerm = searchTerm.toLowerCase();
//     return (
//       item.tercero?.toLowerCase().includes(lowerTerm) ||
//       item.idTercero?.toString().includes(lowerTerm)
//     );
//   });

//   // Procesamiento de remisiones similar a AnticiposArchived
//   const renderRemisionesBadge = (remisionesRaw) => {
//     let lista = [];
//     try {
//       lista = typeof remisionesRaw === 'string' ? JSON.parse(remisionesRaw.replace(/'/g, '"')) : remisionesRaw;
//     } catch (e) {
//       lista = String(remisionesRaw).replace(/[\[\]\s]/g, '').split(',').filter(x => x !== "");
//     }
    
//     if (!lista || lista.length === 0) return <span className="text-gray-300 text-[10px] italic">Sin remisiones</span>;

//     return (
//       <div className="flex justify-end">
//         <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black flex items-center gap-2">
//           <Tags size={14} className="text-indigo-400" />
//           <span>{lista.length} Docs.</span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-gray-50/50 rounded-3xl p-1 border border-gray-200 shadow-sm relative overflow-hidden font-sans">
      
//       {/* HEADER - Estilo Anticipos */}
//       <div className="bg-white rounded-t-[22px] px-8 py-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
//             <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100">
//               <CreditCard size={22} />
//             </div>
//             Créditos
//           </h2>
//           <p className="text-gray-400 text-sm font-medium mt-1 ml-14">Control de cuentas por cobrar y remisiones</p>
//         </div>

//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Buscar por cliente o ID..."
//             className="w-full lg:w-96 pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-semibold outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//         </div>
//       </div>

//       {/* TABLA - Estilo Anticipos */}
//       <div className="overflow-x-auto bg-white rounded-b-[22px]">
//         <table className="min-w-full border-separate border-spacing-0">
//           <thead>
//             <tr className="bg-gray-50/50">
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">ID Cliente</th>
//               <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Tercero / Cliente</th>
//               <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Vínculos</th>
//               <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Valor Total</th>
//               <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Estado Pago</th>
//               <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Acción</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {filteredData.map((credito) => (
//               <tr key={credito.idCredito} className="group hover:bg-indigo-50/40 transition-all duration-200">
//                 <td className="px-6 py-5">
//                   <span className="text-indigo-600 font-black text-sm">#{credito.idTercero}</span>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm border border-white shadow-sm">
//                       {credito.tercero?.charAt(0).toUpperCase()}
//                     </div>
//                     <span className="text-gray-800 font-bold text-sm uppercase">{credito.tercero}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5 text-right">
//                   {renderRemisionesBadge(credito.remisiones)}
//                 </td>
//                 <td className="px-6 py-5 text-right font-black text-gray-700">
//                   {formatCurrency(credito.valorRemisiones)}
//                 </td>
//                 <td className="px-6 py-5 text-right">
//                   <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 ${
//                     credito.pagado === 1 
//                       ? "bg-emerald-50 text-emerald-600 ring-emerald-200" 
//                       : "bg-rose-50 text-rose-600 ring-rose-200"
//                   }`}>
//                     {credito.pagado === 1 ? "PAGADO" : "PENDIENTE"}
//                   </span>
//                 </td>
//                 <td className="px-6 py-5 text-center">
//                   <button 
//                     onClick={() => onVerDetalle(credito)}
//                     className="p-3 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
//                   >
//                     <Eye size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* FOOTER */}
//       <div className="bg-white px-8 py-5 text-[11px] text-gray-400 font-bold flex justify-between items-center rounded-b-3xl border-t border-gray-100">
//         <div className="flex gap-4 items-center">
//           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
//             <Receipt size={14} className="text-indigo-500" /> 
//             <span className="text-gray-600">{filteredData.length}</span> Créditos
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { 
  CreditCard, Search, Calendar, Eye, Tags, 
  ChevronRight, Receipt, FileText, ArrowRight, 
  Calculator, User, DollarSign, TrendingUp, ShieldCheck
} from "lucide-react";

export default function CreditosTable({ data, onVerDetalle }) {
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const filteredData = data.filter((item) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      item.tercero?.toLowerCase().includes(lowerTerm) ||
      item.idTercero?.toString().includes(lowerTerm)
    );
  });

  const renderRemisionesBadge = (remisionesRaw) => {
    let lista = [];
    try {
      lista = typeof remisionesRaw === 'string' ? JSON.parse(remisionesRaw.replace(/'/g, '"')) : remisionesRaw;
    } catch (e) {
      lista = String(remisionesRaw).replace(/[\[\]\s]/g, '').split(',').filter(x => x !== "");
    }
    
    if (!lista || lista.length === 0) return <span className="text-gray-300 text-[10px] italic font-medium">Sin remisiones</span>;

    return (
      <div className="flex justify-end">
        <div className="group/badge px-3 py-1.5 bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-indigo-200">
          <Tags size={14} className="text-indigo-400 group-hover/badge:text-white transition-colors" />
          <span>{lista.length} Docs.</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50/50 rounded-[32px] p-1.5 border border-gray-200 shadow-2xl relative overflow-hidden font-sans transition-all duration-500">
      
      {/* HEADER CON GRADIENTE Y BRANDING */}
      <div className="bg-white rounded-t-[28px] px-8 py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
            <TrendingUp size={180} className="text-indigo-600" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4 tracking-tight">
            <div className="bg-linear-to-br from-indigo-600 to-indigo-800 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-200 transform hover:rotate-6 transition-transform cursor-default">
              <CreditCard size={28} />
            </div>
            Créditos
          </h2>
          <div className="flex items-center gap-3 mt-2 ml-1">
             <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">En Vivo</span>
             </div>
             <p className="text-gray-400 text-sm font-bold uppercase tracking-tighter">Control de cuentas por cobrar y remisiones</p>
          </div>
        </div>

        <div className="relative group z-10">
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            className="w-full lg:w-96 pl-14 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[22px] text-sm focus:ring-0 focus:border-indigo-500/30 focus:bg-white transition-all font-bold outline-none shadow-inner group-hover:bg-gray-100/80 cursor-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
      </div>

      {/* TABLA ESTILIZADA */}
      <div className="overflow-x-auto bg-white rounded-b-[28px]">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50/80 backdrop-blur-md">
              <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">ID Cliente</th>
              <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Tercero / Cliente</th>
              <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Vínculos</th>
              <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Valor Total</th>
              <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Estado Pago</th>
              <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map((credito) => (
              <tr key={credito.idCredito} className="group hover:bg-linear-to-r hover:from-indigo-50/40 hover:to-white transition-all duration-300">
                <td className="px-8 py-6">
                  <span className="text-indigo-600 font-black text-xs tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                    #{credito.idTercero}
                  </span>
                </td>

                {/* AVATAR CON EFECTO DE PERFIL ANIMADO V4 */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer group/avatar">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-900 flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-xl shadow-indigo-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 overflow-hidden">
                        {credito.tercero?.charAt(0).toUpperCase()}
                        {/* Brillo dinámico tipo barrido */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover/avatar:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      </div>
                      {/* Aura de profundidad */}
                      <div className="absolute inset-0 bg-indigo-400 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-40 transition-opacity duration-500"></div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className="text-gray-800 font-black text-sm uppercase tracking-tight group-hover:text-indigo-700 transition-colors cursor-default leading-none">
                            {credito.tercero}
                         </span>
                         <ShieldCheck size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                         <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                         Cliente 
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6 text-right">
                  {renderRemisionesBadge(credito.remisiones)}
                </td>
                
                <td className="px-8 py-6 text-right">
                  <span className="font-black text-gray-800 text-base tabular-nums tracking-tighter">
                    {formatCurrency(credito.valorRemisiones)}
                  </span>
                </td>

                <td className="px-8 py-6 text-right">
                  <span className={`cursor-pointer px-4 py-2 rounded-[14px] text-[10px] font-black uppercase shadow-sm ring-2 ring-inset transition-all hover:scale-105 active:scale-95 flex-inline items-center gap-2 ${
                    credito.pagado === 1 
                      ? "bg-emerald-50 text-emerald-600 ring-emerald-200" 
                      : "bg-rose-50 text-rose-600 ring-rose-200"
                  }`}>
                    {credito.pagado === 1 ? "● AL DÍA" : "○ PENDIENTE"}
                  </span>
                </td>

                <td className="px-8 py-6 text-center">
                  <button 
                    onClick={() => onVerDetalle(credito)}
                    className="group/btn p-4 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-[20px] transition-all active:scale-90 shadow-sm hover:shadow-lg hover:shadow-indigo-100 inline-flex items-center justify-center border border-gray-100 hover:border-indigo-500 cursor-pointer"
                  >
                    <Eye size={22} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER PREMIUM */}
      <div className="bg-white px-10 py-7 text-[11px] text-gray-400 font-black flex justify-between items-center rounded-b-[30px] border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
        <div className="flex gap-8 items-center uppercase tracking-widest">
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 shadow-inner hover:bg-gray-100 transition-colors cursor-default group">
            <Receipt size={18} className="text-indigo-500 group-hover:rotate-12 transition-transform" /> 
            <span className="text-gray-800 text-sm tracking-tighter">{filteredData.length}</span> 
            <span className="text-gray-400">Créditos Registrados</span>
          </div>
          
          <div className="hidden md:flex items-center gap-3 bg-indigo-50/30 px-5 py-2.5 rounded-2xl border border-indigo-100/30 cursor-help group">
            <Calculator size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="text-indigo-700 text-[10px] font-black italic uppercase">Sistema de Cartera Optimizado</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
           <span className="text-[9px]">Sincronización segura</span>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
        </div>
      </div>
    </div>
  );
}