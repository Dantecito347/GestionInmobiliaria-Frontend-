import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { propiedadService, tipoInmuebleService, zonaService } from '../services/propiedadService';
import { personaService } from '../services/personaService';
import PropiedadModal from '../components/PropiedadModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  X,
  Home,
  Search,
  Loader2
} from 'lucide-react';

export default function PropiedadesPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [propiedades, setPropiedades] = useState([]);
  const [tiposInmueble, setTiposInmueble] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [zonas, setZonas] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    direccion: '',
    idPropietario: '',
    idTipo: '',
    idZona: '',
    estado: 'Disponible'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    cargarPropiedades();
    cargarDesplegables();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await propiedadService.getSugerencias(searchTerm);
          setSugerencias(results);
          setShowSugerencias(true);
        } catch (err) {
          console.error("Error al obtener sugerencias:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSugerencias([]);
        setShowSugerencias(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cargarPropiedades = async () => {
    try {
      const data = await propiedadService.getAll();
      setPropiedades(data);
    } catch (err) {
      console.error("Error al cargar propiedades:", err);
      toast.error("No se pudieron cargar las propiedades");
    }
  };

  const cargarDesplegables = async () => {
    try {
      const [tiposData, personasData, zonasData] = await Promise.all([
        tipoInmuebleService.getAll(),
        personaService.getAll(),
        zonaService.getAll()
      ]);

      setTiposInmueble(tiposData);
      setPropietarios(personasData);
      setZonas(zonasData);
    } catch (err) {
      console.error("Error al cargar combos auxiliares:", err);
      toast.error("Error al cargar los datos del formulario");
    }
  };

  const handleOpenModal = (propiedad = null) => {
    if (propiedad) {
      setEditingId(propiedad.idPropiedad);
      setFormData({
        direccion: propiedad.direccion || '',
        idPropietario: propiedad.idPropietario || '',
        idTipo: propiedad.idTipo || '',
        idZona: propiedad.idZona || '',
        estado: propiedad.estado || 'Disponible'
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idPropietario || !formData.idTipo || !formData.idZona) {
      toast.error('Por favor seleccioná todos los campos requeridos');
      return;
    }

    const payload = {
      direccion: formData.direccion,
      idPropietario: Number(formData.idPropietario),
      idTipo: Number(formData.idTipo),
      idZona: Number(formData.idZona),
      estado: formData.estado
    };

    try {
      if (editingId) {
        await propiedadService.update(editingId, payload);
        toast.success('Propiedad actualizada correctamente');
      } else {
        await propiedadService.create(payload);
        toast.success('Propiedad registrada con éxito');
      }
      cargarPropiedades();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar propiedad:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Hubo un error al guardar la propiedad";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la propiedad de la base de datos.',
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
        await propiedadService.delete(id);
        toast.success('Propiedad eliminada correctamente');
        cargarPropiedades();
      } catch (err) {
        console.error("Error al eliminar propiedad:", err);
        const mensajeError = err.response?.data?.error 
          || err.response?.data?.message 
          || 'No se puede eliminar la propiedad porque tiene contratos o alquileres vinculados.';

        toast.error(mensajeError, { duration: 5000 });
      }
    }
  };

  const handleSelectSugerencia = (propiedad) => {
    setSearchTerm(propiedad.direccion);
    setShowSugerencias(false);            
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSugerencias([]);
    setShowSugerencias(false);
  };

  const propiedadesFiltradas = propiedades.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();

    const direccion = (p.direccion || '').toLowerCase();
    const zona = (p.zona || '').toLowerCase();
    const barrio = (p.nombreBarrio || '').toLowerCase();
    const tipo = (p.tipoDescripcion || '').toLowerCase();
    const propietario = `${p.nombrePropietario || ''} ${p.apellidoPropietario || ''}`.toLowerCase();

    return (
      direccion.includes(term) ||
      zona.includes(term) ||
      barrio.includes(term) ||
      tipo.includes(term) ||
      propietario.includes(term)
    );
  });

  const renderBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Disponible
          </span>
        );
      case 'ocupada':
        return (
          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Ocupada
          </span>
        );
      case 'reservada':
        return (
          <span className="bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Reservada
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Menu
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Gestión de Propiedades
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Administración de inmuebles, estado y asignación de propietarios.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Propiedad
          </button>
        </div>

        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim().length >= 2 && setShowSugerencias(true)}
              placeholder="Buscar propiedad por dirección, zona, barrio o propietario..."
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-colors text-sm"
            />
            {isSearching ? (
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

          {showSugerencias && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {sugerencias.length > 0 ? (
                sugerencias.map((propiedad) => {
                  const id = propiedad.idPropiedad || propiedad.id;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectSugerencia(propiedad)}
                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-700/50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {propiedad.direccion}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{propiedad.tipoDescripcion || 'Inmueble'}</span>
                          {propiedad.zona && <span>• {propiedad.zona} ({propiedad.nombreBarrio || 'Sin barrio'})</span>}
                          {propiedad.nombrePropietario && (
                            <span>• Prop: {propiedad.nombrePropietario} {propiedad.apellidoPropietario || ''}</span>
                          )}
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4">Propietario</th>
                <th className="px-6 py-4">Tipo Inmueble</th>
                <th className="px-6 py-4">Zona</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
              {propiedadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <Home className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No hay propiedades registradas
                  </td>
                </tr>
              ) : (
                propiedadesFiltradas.map((p) => (
                  <tr key={p.idPropiedad} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">#{p.idPropiedad}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{p.direccion}</td>
                    
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {p.nombrePropietario ? `${p.nombrePropietario} ${p.apellidoPropietario || ''}` : p.idPropietario}
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {p.tipoDescripcion || p.idTipo}
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {p.zona || p.idZona}
                    </td>
                    
                    <td className="px-6 py-4">{renderBadge(p.estado)}</td>
                    
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.idPropiedad)}
                        className="border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium px-3 py-1.5 rounded-md text-xs transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <PropiedadModal
        modalOpen={modalOpen}
        handleCloseModal={handleCloseModal}
        editingId={editingId}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        propietarios={propietarios}
        tiposInmueble={tiposInmueble}
        zonas={zonas}
      />
    </div>
  );
}