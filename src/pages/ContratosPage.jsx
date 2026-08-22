import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratoService } from '../services/contratoService';
import { personaService } from '../services/personaService';
import { propiedadService } from '../services/propiedadService';
import ContratoModal from '../components/ContratoModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText,
  FileCheck,
  Share2
} from 'lucide-react';

export const ContratosPage = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);

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
    setIsModalOpen(true);
  };

  const handleOpenEditar = (contrato) => {
    setEditingContrato(contrato);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContrato(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente el contrato registrado.',
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
        await contratoService.delete(id);
        toast.success('Contrato eliminado correctamente');
        cargarDatos();
      } catch (err) {
        toast.error('No se pudo eliminar el contrato.');
      }
    }
  };

  // --- LÓGICA DE GENERACIÓN DE PDF Y WHATSAPP ---
  const generarPDFContrato = (c) => {
    const doc = new jsPDF();
    const inquilino = c.nombreInquilino ? `${c.nombreInquilino} ${c.apellidoInquilino}` : `Inquilino ID: ${c.idInquilino}`;
    const propiedad = c.direccionPropiedad || `Propiedad ID: ${c.idPropiedad}`;
    const valorBase = Number(c.valorInicial) || 0;

    // Encabezado principal
    doc.setFillColor(30, 41, 59); // Fondo Slate-800
    doc.rect(0, 0, 210, 32, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('RESUMEN DE CONTRATO Y DETALLE DE GASTOS', 15, 20);

    // Sección: Información general
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', 15, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Inquilino: ${inquilino}`, 15, 53);
    doc.text(`Propiedad: ${propiedad}`, 15, 60);
    doc.text(`Estado del contrato: ${c.estado || 'Activo'}`, 15, 67);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, 15, 74);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 80, 195, 80);

    // Sección: Tabla de desglose de conceptos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DESGLOSE DE CONCEPTOS MENSUALES', 15, 92);

    let yPos = 102;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CONCEPTO', 15, yPos);
    doc.text('RESPONSABLE', 110, yPos);
    doc.text('IMPORTE', 165, yPos);
    
    yPos += 3;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;

    // Fila: Alquiler Base
    doc.setFont('helvetica', 'normal');
    doc.text('Alquiler Base', 15, yPos);
    doc.text('Inquilino', 110, yPos);
    doc.text(`$ ${valorBase.toLocaleString('es-AR')}`, 165, yPos);
    
    let totalInquilino = valorBase;

    // Filas: Extras / Obligaciones
    if (c.obligaciones && c.obligaciones.length > 0) {
      c.obligaciones.forEach((ob) => {
        yPos += 8;
        const pagaInquilino = ob.pagadoPorInquilino !== undefined ? ob.pagadoPorInquilino : ob.pagado_por_inquilino;
        const monto = Number(ob.importeReferencia !== undefined ? ob.importeReferencia : ob.importe_referencia) || 0;
        
        doc.text(ob.descripcion || 'Gasto Extra', 15, yPos);
        doc.text(pagaInquilino ? 'Inquilino' : 'Propietario', 110, yPos);
        doc.text(`$ ${monto.toLocaleString('es-AR')}`, 165, yPos);

        if (pagaInquilino) {
          totalInquilino += monto;
        }
      });
    }

    yPos += 12;
    doc.setDrawColor(30, 41, 59);
    doc.line(15, yPos, 195, yPos);

    // Recuadro de Total Final a pagar por el inquilino
    yPos += 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, yPos, 180, 16, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL ESTIMADO A ABONAR POR INQUILINO:', 20, yPos + 10.5);
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Verde
    doc.text(`$ ${totalInquilino.toLocaleString('es-AR')}`, 155, yPos + 10.5);

    // Descargar el PDF localmente
    const nombreLimpio = inquilino.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Contrato_${nombreLimpio}.pdf`);

    return { totalInquilino, inquilino, propiedad };
  };

  const handleCompartirWhatsApp = (c) => {
    const { totalInquilino, inquilino, propiedad } = generarPDFContrato(c);
    
    const mensaje = `Hola ${inquilino}, te comparto el resumen detallado de tu contrato para la propiedad *${propiedad}*.\n\n` +
                    `*Total a abonar:* $${totalInquilino.toLocaleString('es-AR')}\n\n` +
                    `Se ha generado y descargado el archivo PDF con el desglose de conceptos para tu control. ¡Saludos!`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Menu
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Gestión de Contratos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Administración y seguimiento de contratos de alquiler.
            </p>
          </div>

          <button
            onClick={handleOpenCrear}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Contrato
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
              Cargando contratos...
            </div>
          ) : contratos.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No hay contratos registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-4">Inquilino</th>
                    <th className="p-4">Propiedad</th>
                    <th className="p-4">Valor Inicial</th>
                    <th className="p-4">Obligaciones / Extras</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
                  {contratos.map((c) => {
                    const id = c.idContrato || c.id;

                    return (
                      <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {c.nombreInquilino 
                            ? `${c.nombreInquilino} ${c.apellidoInquilino}` 
                            : `Inquilino ID: ${c.idInquilino}`}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {c.direccionPropiedad || `Propiedad ID: ${c.idPropiedad}`}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          ${c.valorInicial ? Number(c.valorInicial).toLocaleString('es-AR') : '0'}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {c.obligaciones && c.obligaciones.length > 0 ? (
                              c.obligaciones.map((ob, idx) => {
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

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(c.estado)}`}>
                            {c.estado || 'Activo'}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleCompartirWhatsApp(c)}
                            title="Generar PDF y enviar por WhatsApp"
                            className="border border-emerald-300 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Compartir
                          </button>
                          <button
                            onClick={() => handleOpenEditar(c)}
                            className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
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

      <ContratoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingContrato={editingContrato}
        personas={personas}
        propiedades={propiedades}
        onSuccess={cargarDatos}
      />
    </div>
  );
};

export default ContratosPage;