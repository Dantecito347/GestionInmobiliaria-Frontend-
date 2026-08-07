import React from 'react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { contratoService } from '../services/contratoService';

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

export const ContratoModal = ({
  isOpen,
  onClose,
  editingContrato,
  personas = [],
  propiedades = [],
  onSuccess
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingContrato) {
      setFormData({
        idInquilino: editingContrato.idInquilino || '',
        idPropiedad: editingContrato.idPropiedad || '',
        fechaInicio: editingContrato.fechaInicio || '',
        fechaFin: editingContrato.fechaFin || '',
        valorInicial: editingContrato.valorInicial || '',
        idAjuste: editingContrato.idAjuste || '1',
        estado: editingContrato.estado || 'Activo',
        obligaciones: editingContrato.obligaciones
          ? editingContrato.obligaciones.map((o) => ({
              idObligacion: o.idObligacion || o.id_obligacion || '',
              descripcion: o.descripcion || '',
              importeReferencia:
                o.importeReferencia !== undefined
                  ? o.importeReferencia
                  : o.importe_referencia || '',
              pagadoPorInquilino:
                o.pagadoPorInquilino !== undefined
                  ? o.pagadoPorInquilino
                  : o.pagado_por_inquilino !== undefined
                  ? Boolean(o.pagado_por_inquilino)
                  : true
            }))
          : []
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingContrato, isOpen]);

  if (!isOpen) return null;

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

    const valorNum = Number(formData.valorInicial);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('El valor inicial debe ser un número positivo mayor a 0.');
      return;
    }

    if (formData.fechaFin < formData.fechaInicio) {
      toast.error('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      idInquilino: Number(formData.idInquilino),
      idPropiedad: Number(formData.idPropiedad),
      valorInicial: valorNum,
      idAjuste: Number(formData.idAjuste),
      obligaciones: formData.obligaciones.map((ob) => ({
        ...(ob.idObligacion && { idObligacion: Number(ob.idObligacion) }),
        descripcion: ob.descripcion,
        importeReferencia: Math.max(0, Number(ob.importeReferencia) || 0),
        pagadoPorInquilino: Boolean(ob.pagadoPorInquilino)
      }))
    };

    try {
      if (editingContrato) {
        await contratoService.update(editingContrato.idContrato, payload);
        toast.success('Contrato actualizado con éxito');
      } else {
        await contratoService.create(payload);
        toast.success('Contrato creado con éxito');
      }

      onSuccess();
      onClose();
    } catch (err) {

      const mensajeError =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Error al guardar el contrato.';
      
      toast.error(mensajeError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingContrato ? 'Editar Contrato' : 'Nuevo Contrato'}
          </h2>
          <button
            onClick={onClose}
            type="button"
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
                <option value="">Seleccionar Inquilino...</option>
                {personas.map((p) => {
                  const id = p.idPersona || p.idInquilino || p.id;
                  return (
                    <option key={id} value={id}>
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
                <option value="">Seleccionar Propiedad...</option>
                {propiedades.map((prop) => {
                  const id = prop.idPropiedad || prop.id;
                  return (
                    <option key={id} value={id}>
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
                min="0.01"
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
                <option value="Activo">Activo</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Obligaciones / Impuestos
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Gastos extras asociados (Expensas, Impuestos, etc.)
                </p>
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
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <input
                      type="text"
                      placeholder="Ej: Expensas, Impuestos"
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={ob.descripcion}
                      onChange={(e) =>
                        handleObligacionChange(idx, 'descripcion', e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Monto Ref."
                      className="w-28 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={ob.importeReferencia}
                      onChange={(e) =>
                        handleObligacionChange(idx, 'importeReferencia', e.target.value)
                      }
                      required
                    />

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none px-1">
                      <input
                        type="checkbox"
                        checked={Boolean(ob.pagadoPorInquilino)}
                        onChange={(e) =>
                          handleObligacionChange(idx, 'pagadoPorInquilino', e.target.checked)
                        }
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
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? 'Guardando...'
                : editingContrato
                ? 'Guardar Cambios'
                : 'Crear Contrato'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default ContratoModal;