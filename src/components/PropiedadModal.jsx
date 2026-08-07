import React from 'react';
import { X } from 'lucide-react';

export default function PropiedadModal({
  modalOpen,
  handleCloseModal,
  editingId,
  formData,
  handleChange,
  handleSubmit,
  propietarios,
  tiposInmueble,
  zonas
}) {
  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in duration-200 relative">
        
        <button 
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-800 dark:text-white pr-6">
          {editingId ? 'Editar Propiedad' : 'Nueva Propiedad'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              placeholder="Ej: Av. Siempreviva 123"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Propietario
              </label>
              <select
                name="idPropietario"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.idPropietario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                {propietarios.map(p => (
                  <option key={p.idPersona} value={p.idPersona}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Tipo de Inmueble
              </label>
              <select
                name="idTipo"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.idTipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                {tiposInmueble.map(t => (
                  <option key={t.idTipo} value={t.idTipo}>
                    {t.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Zona
              </label>
              <select
                name="idZona"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.idZona}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                {zonas.map(z => (
                  <option key={z.idZona} value={z.idZona}>
                    {z.zona}{z.nombreBarrio ? ` - ${z.nombreBarrio}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="Disponible">Disponible</option>
                <option value="Ocupada">Ocupada</option>
                <option value="Reservada">Reservada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow transition cursor-pointer"
            >
              Guardar Propiedad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}