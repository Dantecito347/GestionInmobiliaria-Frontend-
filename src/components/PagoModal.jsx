import React, { useState, useEffect } from 'react';
import { toast } from 'sonner'; 
import { pagoService } from '../services/pagoService';

export default function PagoModal({ isOpen, onClose, editingPago, contratos, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  const getInitialFormState = () => {
    const fechaActual = new Date();
    return {
      idContrato: '',
      mesCobertura: fechaActual.getMonth() + 1,
      anioCobertura: fechaActual.getFullYear(),
      montoObligatorio: '',
      montoPagado: '',
      fechaPago: fechaActual.toISOString().split('T')[0],
      estadoPago: 'Pagado'
    };
  };

  const [formData, setFormData] = useState(getInitialFormState());

  useEffect(() => {
    if (isOpen) {
      if (editingPago) {
        setFormData({
          idContrato: editingPago.idContrato || '',
          mesCobertura: editingPago.mesCobertura || editingPago.mes_cobertura || getInitialFormState().mesCobertura,
          anioCobertura: editingPago.anioCobertura || editingPago.anio_cobertura || getInitialFormState().anioCobertura,
          montoObligatorio: editingPago.montoObligatorio ?? editingPago.monto ?? '',
          montoPagado: editingPago.montoPagado ?? editingPago.monto ?? '',
          fechaPago: editingPago.fechaPago || getInitialFormState().fechaPago,
          estadoPago: editingPago.estadoPago || editingPago.estado || 'Pagado'
        });
      } else {
        setFormData(getInitialFormState());
      }
    }
  }, [isOpen, editingPago]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      idContrato: Number(formData.idContrato),
      mesCobertura: Number(formData.mesCobertura),
      anioCobertura: Number(formData.anioCobertura),
      montoObligatorio: Number(formData.montoObligatorio),
      montoPagado: Number(formData.montoPagado),
      fechaPago: formData.fechaPago,
      estadoPago: formData.estadoPago
    };

    try {
      if (editingPago) {
        const idPago = editingPago.idPago || editingPago.id;
        await pagoService.update(idPago, payload);
        toast.success('Pago actualizado correctamente');
      } else {
        await pagoService.create(payload);
        toast.success('Pago registrado correctamente');
      }

      onSuccess(); // Recarga la tabla en PagosPage
      onClose(); // Cierra el modal
    } catch (err) {
      // CAPTURA EL ERROR DEL BACKEND (Ej: "Ya existe un pago...")
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Error al guardar el pago";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingPago ? 'Editar Pago' : 'Registrar Nuevo Pago'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-lg cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECT CONTRATO */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Contrato Asociado
            </label>
            <select
              name="idContrato"
              required
              value={formData.idContrato}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Seleccionar Contrato...
              </option>
              {contratos.map((c) => {
                const id = c.idContrato || c.id;
                const desc = c.direccionPropiedad || c.nombreInquilino 
                  ? `${c.nombreInquilino || 'Inquilino'} - ${c.direccionPropiedad || 'Propiedad'}`
                  : `Contrato #${id}`;
                return (
                  <option key={id} value={id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {desc}
                  </option>
                );
              })}
            </select>
          </div>

          {/* MES Y AÑO COBERTURA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Mes Cobertura
              </label>
              <input
                type="number"
                min="1"
                max="12"
                name="mesCobertura"
                required
                value={formData.mesCobertura}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Año Cobertura
              </label>
              <input
                type="number"
                name="anioCobertura"
                required
                value={formData.anioCobertura}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* MONTOS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Monto Obligatorio ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="montoObligatorio"
                required
                value={formData.montoObligatorio}
                onChange={handleChange}
                placeholder="Ej: 50000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Monto Pagado ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="montoPagado"
                required
                value={formData.montoPagado}
                onChange={handleChange}
                placeholder="Ej: 50000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* FECHA Y ESTADO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="fechaPago"
                required
                value={formData.fechaPago}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Estado de Pago
              </label>
              <select
                name="estadoPago"
                value={formData.estadoPago}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pagado">Pagado</option>
                <option value="Parcial">Parcial</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
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
              {submitting ? 'Guardando...' : editingPago ? 'Guardar Cambios' : 'Registrar Pago'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}