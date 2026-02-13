import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Toaster, toast } from "sonner"; // Notificaciones Premium
import {
  Trash2,
  ShieldCheck,
  ArrowLeft,
  Send,
  PenTool,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { updateFirma } from "../assets/services/apiService";

const FirmaCliente = ({ onBack }) => {
  const sigCanvas = useRef({});
  const [imageURL, setImageURL] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const limpiar = () => {
    if (sigCanvas.current.clear) {
      sigCanvas.current.clear();
    }
    setImageURL(null);
    toast.info("Lienzo reiniciado", { description: "Puede volver a firmar." });
  };

  const validarFirmaLocal = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.warning("Firma faltante", {
        description: "Por favor, dibuje su rúbrica antes de continuar.",
        icon: <AlertCircle className="text-amber-500" size={18} />,
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const canvas = sigCanvas.current.getCanvas();
      const base64Data = canvas.toDataURL("image/png");
      setImageURL(base64Data);
      setIsProcessing(false);
      toast.success("Firma capturada", {
        description: "Previsualización lista.",
      });
    }, 600);
  };

  const enviarABaseDeDatos = async () => {
    if (!imageURL) return;
    setIsSending(true);
    const toastId = toast.loading("Sincronizando con Pedregosa API...");

    try {
      const payload = { firma: imageURL };
      const resultado = await updateFirma(payload);

      if (resultado) {
        toast.success("Registro finalizado", {
          id: toastId,
          description: "La entrega ha sido confirmada exitosamente.",
        });
        limpiar();
      } else {
        toast.error("Error de conexión", {
          id: toastId,
          description: "No se pudo guardar la firma. Reintente.",
        });
      }
    } catch (error) {
      toast.error("Fallo crítico", {
        id: toastId,
        description: "Ocurrió un error inesperado en el servidor.",
      });
      console.error("Error al enviar:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen py-6 px-4 md:p-10 bg-slate-50/50 overflow-y-auto">
      {/* Contenedor de notificaciones */}
      <Toaster position="top-right" richColors closeButton />

      <div className="max-w-5xl mx-auto pb-10">
        {/* Header con Lenguaje Claro */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all mb-2 font-bold uppercase text-[10px] tracking-widest"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Volver al formulario
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Confirmación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Entrega
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 self-start">
            <ShieldCheck size={16} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Validación Pedregosa
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Área de Rúbrica */}
          <div className="lg:col-span-8 order-1">
            <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl shadow-slate-200 border border-white flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Firma del Receptor
                </p>
                <p className="text-[9px] text-slate-400 italic">
                  Dibuje su firma dentro del recuadro punteado
                </p>
              </div>

              <div
                className="relative bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden mx-auto"
                style={{ width: "256px", height: "64px" }}
              >
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#1e293b"
                  canvasProps={{
                    width: 256,
                    height: 64,
                    className: "cursor-crosshair",
                  }}
                />

                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-1" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                      Procesando...
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 w-full max-w-sm mt-8">
                <button
                  onClick={limpiar}
                  disabled={isSending || isProcessing}
                  className="flex-1 bg-white border border-slate-200 py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
                >
                  <Trash2 size={14} /> Borrar
                </button>
                <button
                  onClick={validarFirmaLocal}
                  disabled={isSending || isProcessing}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg hover:bg-blue-600 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck size={14} /> Capturar
                </button>
              </div>
            </div>
          </div>

          {/* Panel Lateral e Image Preview */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-blue-400">
                Verificación
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                Al confirmar, usted declara haber recibido el material conforme
                a las cantidades descritas en el registro de materiales.
              </p>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle size={18} className="text-blue-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Listo para guardar
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg flex-grow flex flex-col items-center justify-center min-h-[220px] text-center">
              {imageURL ? (
                <div className="animate-in zoom-in-95 duration-500 w-full">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-widest">
                    Previsualización
                  </span>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-6 flex justify-center">
                    <img
                      src={imageURL}
                      alt="Firma"
                      className="mix-blend-multiply h-12 w-auto object-contain"
                    />
                  </div>
                  <button
                    onClick={enviarABaseDeDatos}
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:grayscale"
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Finalizar y Guardar
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="opacity-40">
                  <PenTool size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Esperando Firma
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirmaCliente;

// import React, { useRef, useState } from "react";
// import SignatureCanvas from "react-signature-canvas";
// import {
//   Trash2,
//   ShieldCheck,
//   ArrowLeft,
//   Send,
//   PenTool,
//   Image as ImageIcon,
//   CheckCircle,
//   Lock,
//   Loader2
// } from "lucide-react";

// import { updateFirma} from "../assets/services/apiService";

// const FirmaCliente = ({ onBack }) => {
//   const sigCanvas = useRef({});
//   const [imageURL, setImageURL] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSending, setIsSending] = useState(false);

//   const limpiar = () => {
//     sigCanvas.current.clear();
//     setImageURL(null);
//   };

//   const validarFirmaLocal = () => {
//     if (sigCanvas.current.isEmpty()) {
//       alert("Por favor, dibuje su firma antes de continuar.");
//       return;
//     }

//     setIsProcessing(true);

//     // Simulación de procesamiento de seguridad
//     setTimeout(() => {
//       const canvas = sigCanvas.current.getCanvas();
//       const base64Data = canvas.toDataURL("image/png");

//       setImageURL(base64Data);
//       setIsProcessing(false);

//       // Mantenemos el log para debug interno
//       console.log("Firma lista para envío:", base64Data);
//     }, 600);
//   };

//   const enviarABaseDeDatos = async () => {
//     if (!imageURL) return;

//     setIsSending(true);

//     // Estructura del objeto según tu endpoint firmas/actualizar
//     const payload = {
//       firma: imageURL
//     };

//     const resultado = await updateFirma(payload);

//     if (resultado) {
//       alert("Firma sincronizada exitosamente con Pedregosa API");
//       onBack(); // Regresar al panel tras el éxito
//     } else {
//       alert("Error de comunicación con el servidor. Verifique su sesión.");
//     }

//     setIsSending(false);
//   };

//   return (
//     <div className="min-h-screen p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50/50">
//       <div className="max-w-5xl mx-auto">

//         {/* Header con Seguridad JWT Integrada */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
//           <div>
//             <button
//               onClick={onBack}
//               className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all mb-2 font-bold uppercase text-[10px] tracking-widest"
//             >
//               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
//               Cancelar y volver
//             </button>
//             <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
//               Confirmación <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600">Digital</span>
//             </h1>
//           </div>
//           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
//             <Lock size={16} className="text-emerald-500" />
//             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sesión Protegida (JWT)</span>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

//           {/* Canvas de Firma */}
//           <div className="lg:col-span-8">
//             <div className="relative group bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-slate-200 border border-white">
//               <div className="bg-slate-50 rounded-[2.2rem] border-2 border-dashed border-slate-200 overflow-hidden relative min-h-[450px]">
//                 <SignatureCanvas
//                   ref={sigCanvas}
//                   penColor="#0f172a"
//                   canvasProps={{
//                     style: { width: '100%', height: '450px' },
//                     className: "cursor-crosshair"
//                   }}
//                 />
//                 {isProcessing && (
//                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in">
//                     <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
//                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Validando Trazo...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 w-full px-8 justify-center">
//                 <button
//                   onClick={limpiar}
//                   disabled={isSending}
//                   className="bg-white/95 backdrop-blur shadow-xl border border-slate-100 px-6 py-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
//                 >
//                   <Trash2 size={18} /> Borrar
//                 </button>
//                 <button
//                   onClick={validarFirmaLocal}
//                   disabled={isSending}
//                   className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-300 hover:bg-indigo-600 hover:-translate-y-1 flex items-center gap-3 disabled:opacity-50"
//                 >
//                   <ShieldCheck size={18} /> Confirmar Identidad
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Lateral de Información y Envío */}
//           <div className="lg:col-span-4 flex flex-col gap-6">
//             <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
//               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">Certificación</h3>
//               <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
//                 Su firma será procesada mediante un canal seguro y almacenada en la base de datos de Pedregosa API.
//               </p>
//               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
//                 <CheckCircle size={20} className="text-emerald-500" />
//                 <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo V.11.11.03</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg flex-grow flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden text-center">
//               {imageURL ? (
//                 <div className="animate-in zoom-in-95 duration-500 w-full">
//                   <div className="mb-4">
//                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
//                       Vista Previa Lista
//                     </span>
//                   </div>
//                   <img
//                     src={imageURL}
//                     alt="Firma Preview"
//                     className="w-full max-h-40 object-contain border border-slate-50 bg-slate-50 rounded-2xl mb-6 shadow-inner"
//                   />
//                   <button
//                     onClick={enviarABaseDeDatos}
//                     disabled={isSending}
//                     className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-emerald-100 disabled:from-slate-400 disabled:to-slate-500"
//                   >
//                     {isSending ? (
//                       <><Loader2 size={16} className="animate-spin" /> Sincronizando...</>
//                     ) : (
//                       <><Send size={16} /> Finalizar y Guardar</>
//                     )}
//                   </button>
//                 </div>
//               ) : (
//                 <div className="opacity-40">
//                   <ImageIcon size={48} className="mx-auto mb-4 text-slate-300" />
//                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Esperando validación</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FirmaCliente;
