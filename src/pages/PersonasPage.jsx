import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaService } from '../services/personaService';
import PersonaModal from '../components/PersonaModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  X, 
  User,
  Mail,
  Phone,
  IdCard
} from 'lucide-react';

export default function PersonasPage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    idTipoDoc: 1,
    nroDocumento: '',
    cuilCuit: '',
    cbuAlias: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const data = await personaService.getAll();
      setPersonas(data);
    } catch (err) {
      setError('Error al obtener la lista de personas.');
      toast.error('No se pudieron cargar las personas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (persona = null) => {
    if (persona) {
      setEditingId(persona.idPersona || persona.id);
      setFormData({
        nombre: persona.nombre || '',
        apellido: persona.apellido || '',
        idTipoDoc: persona.idTipoDoc || 1,
        nroDocumento: persona.nroDocumento || persona.dni || '',
        cuilCuit: persona.cuilCuit || '', 
        cbuAlias: persona.cbuAlias || '',
        email: persona.email || '',
        telefono: persona.telefono || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        idTipoDoc: 1,
        nroDocumento: '',
        cuilCuit: '',
        cbuAlias: '',
        email: '',
        telefono: ''
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      idTipoDoc: Number(formData.idTipoDoc),
      nroDocumento: formData.nroDocumento,
      cuilCuit: formData.cuilCuit,
      cbuAlias: formData.cbuAlias,
      email: formData.email,
      telefono: formData.telefono
    };

    try {
      if (editingId) {
        await personaService.update(editingId, payload);
        toast.success('Persona actualizada correctamente');
      } else {
        await personaService.create(payload);
        toast.success('Persona creada con éxito');
      }
      handleCloseModal();
      fetchPersonas();
    } catch (err) {
      console.error("Error devuelto por Spring Boot:", err.response?.data || err);
      const backendMessage = err.response?.data?.message 
      || (typeof err.response?.data === 'string' ? err.response.data : null);
    if (backendMessage) {
      toast.error(backendMessage);
    } else {
      toast.error('Error al guardar la persona. Revisa la consola para más información.');
    }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente la persona registrada.',
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
        await personaService.delete(id);
        toast.success('Persona eliminada correctamente');
        fetchPersonas();
      } catch (err) {
        toast.error('No se puede eliminar la persona porque está asociada a una propiedad o contrato.');
      }
    }
  };

return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Gestión de Personas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Administración de clientes, propietarios e inquilinos.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Persona
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
              Cargando registros...
            </div>
          ) : personas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No hay personas registradas aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-4">Nombre Completo</th>
                    <th className="p-4">Documento</th>
                    <th className="p-4">CUIL/CUIT</th> 
                    <th className="p-4">Email</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">CBU / Alias</th> 
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
                  {personas.map((p) => {
                    const id = p.idPersona || p.id;
                    
                    const documentoFormateado = p.tipoDocumentoDescripcion && p.nroDocumento
                      ? `${p.tipoDocumentoDescripcion}: ${p.nroDocumento}`
                      : p.nroDocumento || p.dni || '-';

                    return (
                      <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {p.nombre} {p.apellido}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{documentoFormateado}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{p.cuilCuit || '-'}</td> 
                        <td className="p-4 text-slate-600 dark:text-slate-300">{p.email || '-'}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{p.telefono || '-'}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{p.cbuAlias || '-'}</td> 
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(p)}
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

      <PersonaModal 
        modalOpen={modalOpen}
        handleCloseModal={handleCloseModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
