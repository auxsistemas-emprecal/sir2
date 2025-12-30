import React, { useState, useMemo } from 'react';
// Añadimos BarChart3 que faltaba en tu versión anterior
import { Search, FileText, BarChart3, Calendar } from 'lucide-react';
import { 
  fetchTotalMaterialPorTercero, 
  fetchTercerosBusqueda, 
  fetchRemisionesPorTercero,
  fetchItemsPorRemision,
  fetchMateriales 
} from '../assets/services/apiService';
import InputAutosuggest from './InputAutosuggest';

const ReporteCompras = () => {
  const [filtros, setFiltros] = useState({ tercero: '', terceroObj: null, inicio: '', fin: '' });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remisiones, setRemisiones] = useState([]);

  // El InputAutosuggest requiere este manejo de evento
  const handleTerceroChange = (e) => {
    setFiltros(prev => ({ ...prev, tercero: e.target.value }));
  };

  const handleSearch = async (e) => {
  e.preventDefault();
  if (!filtros.terceroObj || !filtros.inicio || !filtros.fin) return;
  setLoading(true);
  const data = await fetchTotalMaterialPorTercero(
    filtros.terceroObj.nombre,
    filtros.inicio,
    filtros.fin
  );


  const rems = await fetchRemisionesPorTercero(
  filtros.terceroObj.nombre,
  filtros.inicio,
  filtros.fin
);

// obtener items de cada remisión
let remisionesConItems = await Promise.all(
  rems.map(async (r) => {
    const items = await fetchItemsPorRemision(r.remision);
    return { ...r, items };
  })
);

// obtener materiales solo 1 vez
const materiales = await fetchMateriales();

// mapear items con nombre del material
remisionesConItems = remisionesConItems.map((r) => {
  const item = r.items?.[0];

  if (!item) return { ...r, materialNombre: "Sin detalle" };

  const mat = materiales.find(m => m.idMaterial === item.idMaterial);

  return {
    ...r,
    materialNombre: mat ? mat.nombre_material : `Material #${item.idMaterial}`,
    cantidad: item.cantidad
  };
});

setRemisiones(remisionesConItems);

  // const rems = await fetchRemisionesPorTercero(
  // filtros.terceroObj.nombre,
  // filtros.inicio,
  // filtros.fin
  // );
  // setRemisiones(rems);
  setResultados(data);
  setLoading(false);
  };

  // const resumen = useMemo(() => {
  //   let m3Total = 0;
  //   const materiales = {};
  //   resultados.forEach(item => {
  //     const vol = Number(item.cubicaje) || 0;
  //     const val = Number(item.total) || 0;
  //     const mat = item.material || 'General';
  //     m3Total += vol;
  //     if (!materiales[mat]) materiales[mat] = { m3: 0, valor: 0 };
  //     materiales[mat].m3 += vol;
  //     materiales[mat].valor += val;
  //   });
  //   return { m3Total, materiales };
  // }, [resultados]);

  const resumen = useMemo(() => {
  let totalM3 = 0;
  let totalDinero = 0;
  const materiales = {};

  remisiones.forEach(r => {
    const m3 = Number(r.cantidad) || 0;
    const total = Number(r.total) || 0;
    const nombre = r.materialNombre || "General";

    totalM3 += m3;
    totalDinero += total;

    if (!materiales[nombre]) materiales[nombre] = { m3: 0, valor: 0 };

    materiales[nombre].m3 += m3;
    materiales[nombre].valor += total;
  });

  return { totalM3, totalDinero, materiales };
  }, [remisiones]);

  

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100">
        <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          <Search size={22} className="text-emerald-600" /> Reporte de Compras
        </h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div>
            <InputAutosuggest
              label="Tercero"
              name="tercero"
              value={filtros.tercero}
              searchEndpoint={fetchTercerosBusqueda}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  tercero: e.target.value,
                  terceroObj: e.target.completeObject || prev.terceroObj,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Desde</label>
            <div className="relative">
               <input type="date" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Hasta</label>
            <input type="date" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              value={filtros.fin} onChange={e => setFiltros({...filtros, fin: e.target.value})} required />
          </div>

          <button type="submit" className="h-[45px] mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
            disabled={loading}>
            {loading ? "Consultando..." : "Generar Reporte"}
          </button>
        </form>
      </div>


        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
    <BarChart3 size={20} className="text-emerald-400" /> Resumen de Material
  </h3>

  {/* TOTAL EN DINERO */}
  <div className="mb-6">
    <p className="text-slate-400 text-sm">Total Comprado</p>
    <p className="text-4xl font-black text-emerald-400">
      ${resumen.totalDinero.toLocaleString()}
    </p>
  </div>

  {/* TOTAL EN M3 */}
  <div className="mb-6">
    <p className="text-slate-400 text-sm">Cubicaje Total</p>
    <p className="text-3xl font-bold">{resumen.totalM3.toFixed(2)} m³</p>
  </div>

  {/* DESGLOSE POR MATERIAL */}
  <div className="space-y-4">
    {Object.entries(resumen.materiales).map(([nom, d]) => (
      <div key={nom} className="flex justify-between items-center text-sm">
        <span>{nom} ({d.m3.toFixed(1)} m³)</span>
        <span className="font-bold text-emerald-400">
          ${d.valor.toLocaleString()}
        </span>
      </div>
    ))}
  </div>
</div>


      {/* {resultados.length > 0 && (
        <div className="w-full"> */}
          {/* Cuadro Resumen */}
          {/* <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
              <BarChart3 size={20} className="text-emerald-400" /> Resumen de Material
            </h3>
            
            <div className="mb-6">
              <p className="text-slate-400 text-sm">Cubicaje Total</p>
              <p className="text-4xl font-black">{resumen.m3Total.toFixed(2)} m³</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(resumen.materiales).map(([nom, d]) => (
                <div key={nom} className="flex justify-between items-center text-sm">
                  <span>{nom} ({d.m3.toFixed(1)} m³)</span>
                  <span className="font-bold text-emerald-400">
                    ${d.valor.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
      
      {remisiones.length > 0 && (
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex items-center gap-2">
            <FileText size={18} /> Historial de Remisiones
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4 border-b">Remisión</th>
                  <th className="p-4 border-b">Fecha</th>
                  <th className="p-4 border-b">Material</th>
                  <th className="p-4 border-b">Placa</th>
                  <th className="p-4 border-b text-right">Cantidad</th>
                  <th className="p-4 border-b text-right">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {remisiones.map((r) => (
                  <tr key={r.remision} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="p-4 font-bold text-emerald-700">REM-{r.remision}</td>
                    <td className="p-4 text-gray-600">{r.fecha}</td>
                    {/* <td className="p-4">{r.material}</td> */}
                    <td className="p-4">{r.materialNombre} — {r.cantidad} m³</td>
                    <td className="p-4">{r.placa}</td>
                    <td className="p-4 text-right">{r.cubicaje} m³</td>
                    <td className="p-4 text-right font-bold text-slate-800">${Number(r.total ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteCompras;

