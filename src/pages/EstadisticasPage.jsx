import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';

export default function EstadisticasPage() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = {
    ACTIVO: '#10B981',   
    FINALIZADO: '#F59E0B',
    CANCELADO: '#EF4444', 
  };

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch('http://localhost:8080/api/contratos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Error al obtener los contratos');
        
        const data = await response.json();
        setContratos(data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los datos estadísticos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  const procesarIngresosMensuales = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const currentYear = hoy.getFullYear();
    const currentMonthIndex = hoy.getMonth(); // 0 a 11

    const datosMensuales = meses.map(mes => ({ name: mes, ingresos: 0 }));

    const parsearFecha = (fecha) => {
      if (!fecha) return null;
      if (Array.isArray(fecha)) {
        return new Date(fecha[0], fecha[1] - 1, fecha[2]);
      }
      if (typeof fecha === 'string') {
        const [y, m, d] = fecha.split('T')[0].split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(fecha);
    };

    contratos.forEach(contrato => {
      const estadoNormalizado = contrato.estado ? contrato.estado.toString().trim().toUpperCase() : '';

      if (estadoNormalizado === 'ACTIVO') {
        const montoBase = Number(contrato.valorInicial) || 0;
        const inicio = parsearFecha(contrato.fechaInicio);
        const fin = parsearFecha(contrato.fechaFin);

        if (inicio && fin) {
          for (let mes = 0; mes <= currentMonthIndex; mes++) {

            const primerDiaMes = new Date(currentYear, mes, 1, 0, 0, 0);
            const ultimoDiaMes = new Date(currentYear, mes + 1, 0, 23, 59, 59);

            if (inicio <= ultimoDiaMes && fin >= primerDiaMes) {
              datosMensuales[mes].ingresos += montoBase;
            }
          }
        }
      }
    });

    return datosMensuales;
  };

  const procesarEstados = () => {
    const conteo = {};
    contratos.forEach(c => {
      const estado = c.estado ? c.estado.toUpperCase() : 'DESCONOCIDO';
      conteo[estado] = (conteo[estado] || 0) + 1;
    });

    return Object.keys(conteo).map(key => ({
      name: key,
      value: conteo[key]
    }));
  };

  const datosGraficoMensual = procesarIngresosMensuales();
  const datosGraficoEstados = procesarEstados();
  const totalContratos = contratos.length;
  const contratosActivos = contratos.filter(c => c.estado?.toUpperCase() === 'ACTIVO').length;
  
  const mesActualIndex = new Date().getMonth();
  const ingresosMesActual = datosGraficoMensual[mesActualIndex]?.ingresos || 0;

  const handleCompartirPorEnlace = () => {
    const baseUrl = window.location.origin; 
    
    const chartDataString = encodeURIComponent(JSON.stringify(datosGraficoMensual));

    const urlCompartida = `${baseUrl}/reporte-compartido?ingresos=${ingresosMesActual}&contratos=${contratosActivos}&chartData=${chartDataString}`;
    
    const mensaje = 
      `📊 *Reporte de Estadísticas y Finanzas*\n\n` +
      `Podés visualizar la gráfica de proyección y el estado actual de los contratos ingresando al siguiente enlace seguro:\n\n` +
      `${urlCompartida}\n\n` +
      `¡Saludos!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 font-medium">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-slate-100">
      <main className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-lg">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1.5 transition mb-3"
          >
            &larr; Volver al Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <h1 className="text-2xl font-bold text-white">
              Estadísticas y Finanzas
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Análisis de proyección de ingresos, estado de contratos y métricas del sistema.
          </p>
          <button
            onClick={handleCompartirPorEnlace}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-2"
          >
             <Share2 className="w-4 h-4" /> Compartir Reporte
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">Ingresos Proyectados (Mes Actual)</p>
            <h3 className="text-3xl font-bold text-white mt-2">
              ${ingresosMesActual.toLocaleString('es-AR')}
            </h3>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">Contratos Activos</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-2">
              {contratosActivos}
            </h3>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">Total de Contratos Históricos</p>
            <h3 className="text-3xl font-bold text-blue-400 mt-2">
              {totalContratos}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-sm h-[400px]">
            <h4 className="text-lg font-semibold text-white mb-4">
              Proyección de Ingresos {new Date().getFullYear()}
            </h4>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={datosGraficoMensual} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-sm h-[400px] flex flex-col">
            <h4 className="text-lg font-semibold text-white mb-4">
              Estado de Contratos
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosGraficoEstados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {datosGraficoEstados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}