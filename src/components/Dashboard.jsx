import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const username = user?.username || 'admin';
  const perfil = user?.perfil || user?.nombrePerfil || 'ADMINISTRADOR';
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            I
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
              Gestión Inmobiliaria
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Panel de Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            title="Alternar tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{username}</p>
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800/50">
              {perfil}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition duration-200 border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-800/50 cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold">¡Bienvenido de nuevo, {username}! 👋</h2>
          <p className="text-blue-100 text-sm mt-1">
            Sistema de administración de propiedades, inquilinos y contratos.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
            Módulos del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div onClick={() => navigate('/personas')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                👥
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Gestión de Personas
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Administrá propietarios, inquilinos y clientes registrados.
              </p>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline inline-flex items-center gap-1">
                Ingresar al módulo &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/propiedades')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                🏠
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Propiedades
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Catálogo de inmuebles, estado de alquileres y ventas.
              </p>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline inline-flex items-center gap-1">
                Ver catálogo &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/contratos')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
                📄
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Contratos
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Vinculación de contratos, condiciones y vencimientos.
              </p>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:underline inline-flex items-center gap-1">
                Administrar &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/pagos')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-violet-600 group-hover:text-white transition">
                💳
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Gestión de Pagos
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Control de cuotas mensuales, cobros y emision de recibos.
              </p>
              <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:underline inline-flex items-center gap-1">
                Registrar pagos &rarr;
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}