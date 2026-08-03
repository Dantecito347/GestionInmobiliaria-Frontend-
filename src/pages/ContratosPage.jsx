import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contratoService } from '../services/contratoService';
import { personaService } from '../services/personaService';
import { propiedadService } from '../services/propiedadService';

const initialFormState = {
  idInquilino: '',
  idPropiedad: '',
  fechaInicio: '',
  fechaFin: '',
  valorInicial: '',
  idAjuste: '1',
  estado: 'Activo'
};

export const ContratosPage = () => {
  const [contratos, setContratos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataContratos, dataPersonas, dataPropiedades] = await Promise.all([
        contratoService.getAll(),
        personaService.getAll(),
        propiedadService.getAll()
      ]);

      setContratos(dataContratos);
      setPersonas(dataPersonas);
      setPropiedades(dataPropiedades);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCrear = () => {
    setEditingContrato(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (contrato) => {
    setEditingContrato(contrato);
    setFormData({
      idInquilino: contrato.idInquilino || '',
      idPropiedad: contrato.idPropiedad || '',
      fechaInicio: contrato.fechaInicio || '',
      fechaFin: contrato.fechaFin || '',
      valorInicial: contrato.valorInicial || '',
      idAjuste: contrato.idAjuste || '1',
      estado: contrato.estado || 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContrato(null);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      idInquilino: Number(formData.idInquilino),
      idPropiedad: Number(formData.idPropiedad),
      valorInicial: Number(formData.valorInicial),
      idAjuste: Number(formData.idAjuste)
    };

    try {
      if (editingContrato) {
        await contratoService.update(editingContrato.idContrato, payload);
      } else {
        await contratoService.create(payload);
      }

      await cargarDatos();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar el contrato:", err);
      alert("Error al guardar el contrato.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este contrato?")) return;

    try {
      await contratoService.delete(id);
      setContratos((prev) => prev.filter((c) => c.idContrato !== id));
    } catch (err) {
      console.error("Error al eliminar contrato:", err);
      alert("Hubo un error al intentar eliminar el contrato.");
    }
  };

const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
      case 'Finalizado':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
      case 'Cancelado':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-8 font-sans transition-colors duration-200">
      
      {/* Header Superior */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center mb-6 transition-colors">
        <div>
          <Link 
            to="/dashboard" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-block mb-2 transition-colors"
          >
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Gestión de Contratos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Administración y seguimiento de contratos de alquiler.
          </p>
        </div>

        <button
          onClick={handleOpenCrear}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-xl text-sm shadow-sm transition-colors"
        >
          + Nuevo Contrato
        </button>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">INQUILINO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">PROPIEDAD</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">VALOR INICIAL</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">ESTADO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {contratos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No hay contratos registrados.
                </td>
              </tr>
            ) : (
              contratos.map((contrato) => (
                <tr key={contrato.idContrato} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {contrato.nombreInquilino 
                      ? `${contrato.nombreInquilino} ${contrato.apellidoInquilino}` 
                      : `Inquilino ID: ${contrato.idInquilino}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {contrato.direccionPropiedad || `Propiedad ID: ${contrato.idPropiedad}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    ${contrato.valorInicial ? contrato.valorInicial.toLocaleString('es-AR') : '0'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(contrato.estado)}`}>
                      {contrato.estado || 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => handleOpenEditar(contrato)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 mr-4 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(contrato.idContrato)}
                      className="text-red-600 dark:text-red-400 font-semibold hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingContrato ? 'Editar Contrato' : 'Nuevo Contrato'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Select Inquilino */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Inquilino
                  </label>
                  <select
                    name="idInquilino"
                    required
                    value={formData.idInquilino}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Seleccionar Inquilino...</option>
                    {personas.map((p) => {
                      const id = p.idPersona || p.idInquilino || p.id;
                      return (
                        <option key={id} value={id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {p.nombre} {p.apellido}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Select Propiedad */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Propiedad
                  </label>
                  <select
                    name="idPropiedad"
                    required
                    value={formData.idPropiedad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Seleccionar Propiedad...</option>
                    {propiedades.map((prop) => {
                      const id = prop.idPropiedad || prop.id;
                      return (
                        <option key={id} value={id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {prop.direccion || prop.domicilio || `Propiedad ID: ${id}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    required
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    required
                    value={formData.fechaFin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Valor e Inicial / Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Valor Inicial ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="valorInicial"
                    required
                    value={formData.valorInicial}
                    onChange={handleChange}
                    placeholder="Ej: 150000"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Activo" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Activo</option>
                    <option value="Finalizado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Finalizado</option>
                    <option value="Cancelado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingContrato ? 'Guardar Cambios' : 'Crear Contrato'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default ContratosPage;