import React, { useEffect, useState, useRef } from 'react';
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
  IdCard,
  Search,   
  Loader2
} from 'lucide-react';

export default function PersonasPage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSugerencias([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setLoadingSugerencias(true);
        const data = await personaService.getSugerencias(searchTerm);
        setSugerencias(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error al buscar sugerencias:", err);
      } finally {
        setLoadingSugerencias(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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

  const handleSelectSugerencia = (personaSeleccionada) => {
    setPersonas([personaSeleccionada]);
    setSearchTerm(`${personaSeleccionada.nombre} ${personaSeleccionada.apellido}`);
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSugerencias([]);
    setShowDropdown(false);
    fetchPersonas();
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-1 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Menu
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

        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim().length >= 2 && setShowDropdown(true)}
              placeholder="Buscar persona por nombre, apellido o DNI..."
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-colors text-sm"
            />
            {loadingSugerencias ? (
              <Loader2 className="w-5 h-5 absolute right-3 text-slate-400 animate-spin" />
            ) : searchTerm ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {showDropdown && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {sugerencias.length > 0 ? (
                sugerencias.map((persona) => {
                  const id = persona.idPersona || persona.id;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectSugerencia(persona)}
                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-700/50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {persona.nombre} {persona.apellido}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{persona.tipoDocumentoDescripcion || 'Doc'}: {persona.nroDocumento}</span>
                          {persona.email && <span>• {persona.email}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Seleccionar
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No se encontraron coincidencias para "{searchTerm}"
                </div>
              )}
            </div>
          )}
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
