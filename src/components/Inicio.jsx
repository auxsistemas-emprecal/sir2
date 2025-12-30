import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Wallet, TrendingUp, Users, Package } from "lucide-react";

export default function Inicio({ movements, anticipos, terceros, materials }) {
  
  // CÁLCULOS PARA LOS DASHBOARDS
  const stats = useMemo(() => {
    const totalVentas = movements.reduce((acc, m) => acc + (Number(m.total) || 0), 0);
    const totalAnticipos = anticipos.reduce((acc, a) => acc + (Number(a.valorAnticipo) || 0), 0);
    return {
      ventas: totalVentas,
      anticipos: totalAnticipos,
      clientes: terceros.length,
      productos: materials.length
    };
  }, [movements, anticipos, terceros, materials]);

  // Datos para Gráfico de Barras (Ventas vs Anticipos)
  const dataBarras = [
    { name: "Ventas", total: stats.ventas, color: "#10b981" },
    { name: "Anticipos", total: stats.anticipos, color: "#3b82f6" }
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-up { animation: fadeIn 0.6s ease-out forwards; }
          .card-mela {
            background: white;
            border-radius: 24px;
            padding: 1.5rem;
            border: 1px solid #f1f5f9;
            transition: all 0.3s ease;
          }
          .card-mela:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>

      {/* SALUDO */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">Bienvenido al Sistema</h1>
        <p className="text-slate-500 font-medium">Aquí tienes el resumen de tu operación hoy.</p>
      </div>

      {/* TARJETAS RÁPIDAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Ventas Totales" value={`$${stats.ventas.toLocaleString()}`} color="bg-emerald-50" />
        <StatCard icon={<Wallet className="text-blue-600" />} label="Anticipos Recibidos" value={`$${stats.anticipos.toLocaleString()}`} color="bg-blue-50" />
        <StatCard icon={<Users className="text-purple-600" />} label="Terceros" value={stats.clientes} color="bg-purple-50" />
        <StatCard icon={<Package className="text-amber-600" />} label="Materiales" value={stats.productos} color="bg-amber-50" />
      </div>

      {/* SECCIÓN DE ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-mela">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Comparativa de Ingresos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarras}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={50}>
                  {dataBarras.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-mela flex flex-col justify-center items-center text-center p-12">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <TrendingUp size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Tu negocio está creciendo</h3>
          <p className="text-slate-500 mt-2">Has registrado {movements.length} movimientos nuevos este mes. ¡Sigue así!</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card-mela flex items-center gap-4">
      <div className={`${color} p-4 rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}