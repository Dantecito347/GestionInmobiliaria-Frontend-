import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pagoService } from '../services/pagoService';
import { contratoService } from '../services/contratoService';

const fechaActual = new Date();

const initialFormState = {
  idContrato: '',
  mesCobertura: fechaActual.getMonth() + 1,
  anioCobertura: fechaActual.getFullYear(),
  montoObligatorio: '',
  montoPagado: '',
  fechaPago: fechaActual.toISOString().split('T')[0],
  estadoPago: 'Pagado'
};

export const PagosPage = () => {
  const [pagos, setPagos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataPagos, dataContratos] = await Promise.all([
        pagoService.getAll(),
        contratoService.getAll()
      ]);

      setPagos(dataPagos);
      setContratos(dataContratos);
    } catch (err) {
      console.error("Error al cargar pagos/contratos:", err);
      setError("No se pudieron cargar los registros de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCrear = () => {
    setEditingPago(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (pago) => {
    setEditingPago(pago);
    setFormData({
      idContrato: pago.idContrato || '',
      mesCobertura: pago.mesCobertura || fechaActual.getMonth() + 1,
      anioCobertura: pago.anioCobertura || fechaActual.getFullYear(),
      montoObligatorio: pago.montoObligatorio ?? pago.monto ?? '',
      montoPagado: pago.montoPagado ?? pago.monto ?? '',
      fechaPago: pago.fechaPago || new Date().toISOString().split('T')[0],
      estadoPago: pago.estadoPago || pago.estado || 'Pagado'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPago(null);
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
        await pagoService.update(editingPago.idPago || editingPago.id, payload);
      } else {
        await pagoService.create(payload);
      }

      await cargarDatos();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar el pago:", err);
      alert("Error al guardar el pago.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de anular/eliminar este registro de pago?")) return;

    try {
      await pagoService.delete(id);
      setPagos((prev) => prev.filter((p) => (p.idPago || p.id) !== id));
    } catch (err) {
      console.error("Error al eliminar pago:", err);
      alert("Error al intentar eliminar el pago.");
    }
  };

  // Helper para badges de estado
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-emerald-100 text-emerald-700';
      case 'Parcial':
        return 'bg-blue-100 text-blue-700';
      case 'Pendiente':
        return 'bg-amber-100 text-amber-700';
      case 'Atrasado':
      case 'Vencido':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 font-medium">
        Cargando registros de pagos...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-8 font-sans">
      
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex justify-between items-center mb-6">
        <div>
          <Link 
            to="/dashboard" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-block mb-2 transition-colors"
          >
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Gestión de Pagos
          </h1>
          <p className="text-slate-500 text-sm">
            Control de cobros de cuotas de alquiler y recibos.
          </p>
        </div>

        <button
          onClick={handleOpenCrear}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl text-sm shadow-sm transition-colors"
        >
          + Registrar Pago
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase">PERIODO / FECHA</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase">INQUILINO / PROPIEDAD</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase">MONTO OBLIGATORIO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase">MONTO PAGADO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase">ESTADO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 tracking-wider uppercase text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => {
                const idPago = pago.idPago || pago.id;
                
                const montoPagadoVal = pago.montoPagado ?? pago.monto ?? 0;
                const montoObligatorioVal = pago.montoObligatorio ?? pago.monto ?? 0;
                const estadoVal = pago.estadoPago || pago.estado || 'Pagado';
                
                const nombreInquilinoCompleto = [pago.nombreInquilino, pago.apellidoInquilino]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr key={idPago} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      <div>Mes {pago.mesCobertura || '-'}/{pago.anioCobertura || '-'}</div>
                      <div className="text-xs font-normal text-slate-400">{pago.fechaPago || '-'}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {nombreInquilinoCompleto 
                        ? `${nombreInquilinoCompleto} (${pago.direccionPropiedad || 'Propiedad'})` 
                        : `Contrato ID: ${pago.idContrato}`}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      ${Number(montoObligatorioVal).toLocaleString('es-AR')}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      ${Number(montoPagadoVal).toLocaleString('es-AR')}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(estadoVal)}`}>
                        {estadoVal}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleOpenEditar(pago)}
                        className="text-blue-600 font-semibold hover:text-blue-800 mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(idPago)}
                        className="text-red-600 font-semibold hover:text-red-800 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar Pago */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingPago ? 'Editar Pago' : 'Registrar Nuevo Pago'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 font-semibold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* SELECT CONTRATO */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Contrato Asociado
                </label>
                <select
                  name="idContrato"
                  required
                  value={formData.idContrato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Contrato...</option>
                  {contratos.map((c) => {
                    const id = c.idContrato || c.id;
                    const desc = c.direccionPropiedad || c.nombreInquilino 
                      ? `${c.nombreInquilino || 'Inquilino'} - ${c.direccionPropiedad || 'Propiedad'}`
                      : `Contrato #${id}`;
                    return (
                      <option key={id} value={id}>
                        {desc}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* MES Y AÑO COBERTURA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Año Cobertura
                  </label>
                  <input
                    type="number"
                    name="anioCobertura"
                    required
                    value={formData.anioCobertura}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* MONTOS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* FECHA Y ESTADO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    name="fechaPago"
                    required
                    value={formData.fechaPago}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Estado de Pago
                  </label>
                  <select
                    name="estadoPago"
                    value={formData.estadoPago}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingPago ? 'Guardar Cambios' : 'Registrar Pago'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default PagosPage;