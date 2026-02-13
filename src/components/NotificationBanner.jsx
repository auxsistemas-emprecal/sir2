import React, { useState } from "react";
import {
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";
import DOMPurify from "dompurify";

function SafeHTML({ content }) {
  const sanitizedContent = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "p", "b", "i", "em", "strong", "a", "ul", "ol", "li", "br", 
      "svg", "path", "div", "span"
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "class", "viewBox", "fill", 
      "d", "fill-rule", "clip-rule"
    ],
  });

  return (
    <div
      className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export default function NotificationBanner({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!data || data.activa === 0 || !visible) return null;

  // Decodificación UTF-8 para tildes y Ñ
  const decodeBase64UTF8 = (base64) => {
    try {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return "Error al decodificar contenido";
    }
  };

  const decodedBody = decodeBase64UTF8(data.body);

  const getTipoEstilos = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "parche":
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: <AlertTriangle size={18} /> };
      case "error":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: <CheckCircle size={18} /> };
      case "notificación":
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: <Info size={18} /> };
      case "actualización":
        return { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", icon: <Database size={18} /> };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <Info size={18} /> };
    }
  };

  const estilos = getTipoEstilos(data.tipo);

  return (
    <div className={`mb-6 rounded-2xl border-2 ${estilos.border} ${estilos.bg} overflow-hidden shadow-sm transition-all duration-500 ease-in-out`}>
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-white shadow-sm ${estilos.text}`}>
            {estilos.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white border ${estilos.border}`}>
                {data.tipo}
              </span>
              <span className="text-[10px] text-slate-400 font-bold italic">
                {new Date(data.fecha).toLocaleDateString()}
              </span>
            </div>
            <h4 className={`font-black text-sm ${estilos.text} uppercase tracking-tight mt-0.5`}>
              {data.titulo}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 hover:bg-white text-[11px] font-black transition-all shadow-sm active:scale-95 ${estilos.text}`}
          >
            {isOpen ? <><ChevronUp size={14} /> CERRAR</> : <><ChevronDown size={14} /> VER DETALLES</>}
          </button>
          <button 
            onClick={() => setVisible(false)} 
            className="p-2 hover:bg-black/5 rounded-full text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* CONTENEDOR ANIMADO */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 pt-2 border-t border-dashed border-black/10 mx-4">
            <div className="mt-2">
              <SafeHTML content={decodedBody} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
