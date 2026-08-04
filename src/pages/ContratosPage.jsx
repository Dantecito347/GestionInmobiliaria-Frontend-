import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contratoService } from '../services/contratoService';
import { personaService } from '../services/personaService';
import { propiedadService } from '../services/propiedadService';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  FileText,         
} from 'lucide-react';

const initialFormState = {
  idPropiedad: '',
  idInquilino: '',
  fechaInicio: '',
  fechaFin: '',
  valorInicial: '',
  idAjuste: '1',
  estado: 'Activo',
  obligaciones: []
};

export const ContratosPage = () => {
  const [contratos, setContratos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
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
      toast.error('No se pudieron cargar los datos');
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
      estado: contrato.estado || 'Activo',
      obligaciones: contrato.obligaciones ? contrato.obligaciones.map(o => ({
        idObligacion: o.idObligacion || o.id_obligacion || '',
        descripcion: o.descripcion || '',
        importeReferencia: o.importeReferencia !== undefined ? o.importeReferencia : (o.importe_referencia || ''),
        pagadoPorInquilino: o.pagadoPorInquilino !== undefined ? o.pagadoPorInquilino : (o.pagado_por_inquilino !== undefined ? Boolean(o.pagado_por_inquilino) : true)
      })) : []
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

  const handleAddObligacion = () => {
    setFormData((prev) => ({
      ...prev,
      obligaciones: [
        ...prev.obligaciones,
        { descripcion: '', importeReferencia: '', pagadoPorInquilino: true }
      ]
    }));
  };

  const handleRemoveObligacion = (index) => {
    setFormData((prev) => ({
      ...prev,
      obligaciones: prev.obligaciones.filter((_, i) => i !== index)
    }));
  };

  const handleObligacionChange = (index, field, value) => {
    const newObligaciones = [...formData.obligaciones];
    newObligaciones[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      obligaciones: newObligaciones
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
      idAjuste: Number(formData.idAjuste),
      obligaciones: formData.obligaciones.map(ob => ({
        ...(ob.idObligacion && { idObligacion: Number(ob.idObligacion) }),
        descripcion: ob.descripcion,
        importeReferencia: Number(ob.importeReferencia),
        pagadoPorInquilino: Boolean(ob.pagadoPorInquilino)
      }))
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
      toast.error("Error al guardar el contrato:", err);
      toast.error("Error al guardar el contrato.");
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
    toast.error("Error al eliminar contrato:", err);
      toast.info("Hubo un error al intentar eliminar el contrato.");
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
    
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center mb-6 transition-colors">
      <div>
        <Link 
          to="/dashboard" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 mb-2 transition-colors"
        >
          ← Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Gestión de Contratos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Administración y seguimiento de contratos de alquiler.
        </p>
      </div>

      <button
        onClick={handleOpenCrear}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
      >
        + Nuevo Contrato
      </button>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100/70 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">INQUILINO</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">PROPIEDAD</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">VALOR INICIAL</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">OBLIGACIONES / EXTRAS</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase">ESTADO</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {contratos.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-6 text-center text-slate-500 dark:text-slate-400">
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
                  ${contrato.valorInicial ? Number(contrato.valorInicial).toLocaleString('es-AR') : '0'}
                </td>
  
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {contrato.obligaciones && contrato.obligaciones.length > 0 ? (
                      contrato.obligaciones.map((ob, idx) => {
                        const pagaInquilino = ob.pagadoPorInquilino !== undefined ? ob.pagadoPorInquilino : ob.pagado_por_inquilino;
                        const monto = ob.importeReferencia !== undefined ? ob.importeReferencia : ob.importe_referencia;
                        return (
                          <span
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                              pagaInquilino
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                            }`}
                            title={pagaInquilino ? 'Paga Inquilino' : 'Paga Propietario'}
                          >
                            {ob.descripcion}: ${Number(monto || 0).toLocaleString('es-AR')}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin extras</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(contrato.estado)}`}>
                    {contrato.estado || 'Activo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    onClick={() => handleOpenEditar(contrato)}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 mr-4 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(contrato.idContrato)}
                    className="text-red-600 dark:text-red-400 font-semibold hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer"
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

    {isModalOpen && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingContrato ? 'Editar Contrato' : 'Nuevo Contrato'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              
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

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Obligaciones / Impuestos
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Gastos extras asociados (Expensas, Impuestos, etc.)</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddObligacion}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  + Agregar Gasto Extra
                </button>
              </div>

              <div className="space-y-2">
                {formData.obligaciones.length === 0 ? (
                  <div className="text-center py-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400">
                    Sin obligaciones o impuestos agregados.
                  </div>
                ) : (
                  formData.obligaciones.map((ob, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        placeholder="Ej: Expensas, Impuestos"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={ob.descripcion}
                        onChange={(e) => handleObligacionChange(idx, 'descripcion', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Monto Ref."
                        className="w-28 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={ob.importeReferencia}
                        onChange={(e) => handleObligacionChange(idx, 'importeReferencia', e.target.value)}
                        required
                      />
                      
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none px-1">
                        <input
                          type="checkbox"
                          checked={Boolean(ob.pagadoPorInquilino)}
                          onChange={(e) => handleObligacionChange(idx, 'pagadoPorInquilino', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        Paga Inquilino
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveObligacion(idx)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-base font-bold px-1.5 cursor-pointer"
                        title="Eliminar"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
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