import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const username = user?.username || 'admin';
  const perfil = user?.perfil || user?.nombrePerfil || 'ADMINISTRADOR';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            I
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Gestión Inmobiliaria
            </h1>
            <p className="text-xs text-slate-500">Panel de Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{username}</p>
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {perfil}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200 border border-slate-200 hover:border-red-200 cursor-pointer"
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
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            Módulos del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div onClick={() => navigate('/personas')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                👥
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">
                Gestión de Personas
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Administrá propietarios, inquilinos y clientes registrados.
              </p>
              <span className="text-sm font-semibold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                Ingresar al módulo &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/propiedades')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                🏠
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">
                Propiedades
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Catálogo de inmuebles, estado de alquileres y ventas.
              </p>
              <span className="text-sm font-semibold text-emerald-600 group-hover:underline inline-flex items-center gap-1">
                Ver catálogo &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/contratos')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
                📄
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">
                Contratos
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Vinculación de contratos, condiciones y vencimientos.
              </p>
              <span className="text-sm font-semibold text-amber-600 group-hover:underline inline-flex items-center gap-1">
                Administrar &rarr;
              </span>
            </div>

            <div onClick={() => navigate('/pagos')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-violet-600 group-hover:text-white transition">
              💳
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">
              Gestión de Pagos
            </h4>
            <p className="text-sm text-slate-500 mb-4">
              Control de cuotas mensuales, cobros y emision de recibos.
            </p>
            <span className="text-sm font-semibold text-violet-600 group-hover:underline inline-flex items-center gap-1">
              Registrar pagos &rarr;
            </span>
          </div>

          </div>
        </div>

      </main>
    </div>
  );
}