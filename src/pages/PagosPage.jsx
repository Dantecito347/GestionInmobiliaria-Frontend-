import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { pagoService } from '../services/pagoService';
import { contratoService } from '../services/contratoService';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import PagoModal from '../components/PagoModal';
import { 
  DollarSign, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  ReceiptText 
} from 'lucide-react';

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
  const navigate = useNavigate();
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
      toast.error("No se pudieron cargar los registros de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCrear = () => {
    setEditingPago(null);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (pago) => {
    setEditingPago(pago);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPago(null);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción anulará y eliminará permanentemente el registro de pago.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl dark:bg-slate-800 dark:text-white',
        title: 'text-lg font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-sm text-slate-500 dark:text-slate-400',
      }
    });

    if (result.isConfirmed) {
      try {
        await pagoService.delete(id);
        toast.success('Pago eliminado correctamente');
        cargarDatos();
      } catch (err) {
        toast.error('No se pudo eliminar el pago.');
      }
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
      case 'Parcial':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
      case 'Pendiente':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
      case 'Atrasado':
      case 'Vencido':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Gestión de Pagos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Control de cobros de cuotas de alquiler y recibos.
            </p>
          </div>

          <button
            onClick={handleOpenCrear}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Registrar Pago
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
              Cargando registros de pagos...
            </div>
          ) : pagos.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <ReceiptText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No hay pagos registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-4">Periodo / Fecha</th>
                    <th className="p-4">Inquilino / Propiedad</th>
                    <th className="p-4">Obligatorio</th>
                    <th className="p-4">Pagado</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
                  {pagos.map((pago) => {
                    const idPago = pago.idPago || pago.id;
                    
                    const montoPagadoVal = pago.montoPagado ?? pago.monto ?? 0;
                    const montoObligatorioVal = pago.montoObligatorio ?? pago.monto ?? 0;
                    const estadoVal = pago.estadoPago || pago.estado || 'Pagado';
                    
                    const mes = pago.mesCobertura || pago.mes_cobertura || '-';
                    const anio = pago.anioCobertura || pago.anio_cobertura || '-';
                    
                    const nombreInquilinoCompleto = [pago.nombreInquilino, pago.apellidoInquilino]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <tr key={idPago} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">Mes {mes}/{anio}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pago.fechaPago || '-'}</div>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {nombreInquilinoCompleto 
                            ? `${nombreInquilinoCompleto} (${pago.direccionPropiedad || 'Propiedad'})` 
                            : `Contrato ID: ${pago.idContrato}`}
                        </td>

                        <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                          ${Number(montoObligatorioVal).toLocaleString('es-AR')}
                        </td>

                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          ${Number(montoPagadoVal).toLocaleString('es-AR')}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(estadoVal)}`}>
                            {estadoVal}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditar(pago)}
                            className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(idPago)}
                            className="border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <PagoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingPago={editingPago}
        contratos={contratos}
        onSuccess={cargarDatos}
      />
    </div>
  );
}
export default PagosPage;