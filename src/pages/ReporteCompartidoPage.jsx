import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText } from 'lucide-react';

export const ReporteCompartidoPage = () => {

  const [searchParams] = useSearchParams();
  
  const ingresos = searchParams.get('ingresos') || '0';
  const contratos = searchParams.get('contratos') || '0';
  
  const chartDataParam = searchParams.get('chartData');
  const chartData = useMemo(() => {
    if (chartDataParam) {
      try {
        return JSON.parse(decodeURIComponent(chartDataParam));
      } catch (e) {
        console.error("Error parseando datos del gráfico");
      }
    }
    // Datos por defecto/fallback
    return [
      { name: 'Ene', total: 0 }, { name: 'Feb', total: 0 },
      { name: 'Mar', total: 0 }, { name: 'Abr', total: 0 }
    ];
  }, [chartDataParam]);

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Encabezado del Reporte */}
        <div className="text-center space-y-2 border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            Reporte Ejecutivo de Estadísticas
          </h1>
          <p className="text-slate-400">
            Resumen financiero y estado actual generado el {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>

        {/* Tarjetas de Resumen (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Ingresos Proyectados (Mes Actual)</h3>
            <p className="text-4xl font-bold text-white">
              ${Number(ingresos).toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Contratos Activos</h3>
            <p className="text-4xl font-bold text-emerald-400 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {contratos}
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Proyección de Ingresos</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReporteCompartidoPage;