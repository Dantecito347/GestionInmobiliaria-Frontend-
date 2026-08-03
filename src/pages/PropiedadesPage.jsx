import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propiedadService, tipoInmuebleService, zonaService } from '../services/propiedadService';
import { personaService } from '../services/personaService';

export default function PropiedadesPage() {
  const navigate = useNavigate();
  const [propiedades, setPropiedades] = useState([]);
  const [tiposInmueble, setTiposInmueble] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [zonas, setZonas] = useState([]);

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

  const cargarPropiedades = async () => {
    try {
      const data = await propiedadService.getAll();
      setPropiedades(data);
    } catch (err) {
      console.error("Error al cargar propiedades:", err);
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
    }
  };

  const handleOpenModal = (propiedad = null) => {
    if (propiedad) {
      setEditingId(propiedad.idPropiedad);
      setFormData({
        direccion: propiedad.direccion || '',
        idPropietario: propiedad.idPropietario || (propietarios[0]?.idPersona || ''),
        idTipo: propiedad.idTipo || (tiposInmueble[0]?.idTipo || ''),
        idZona: propiedad.idZona || (zonas[0]?.idZona || ''),
        estado: propiedad.estado || 'Disponible'
      });
    } else {
      setEditingId(null);
      setFormData({
        ...initialFormState,
        idPropietario: propietarios[0]?.idPersona || '',
        idTipo: tiposInmueble[0]?.idTipo || '',
        idZona: zonas[0]?.idZona || ''
      });
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
      } else {
        await propiedadService.create(payload);
      }
      cargarPropiedades();
      handleCloseModal();
    } catch (err) {
      alert("Hubo un error al guardar la propiedad");
      console.error(err);
    }
  };

const renderBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold px-3 py-1 rounded-full">
            Disponible
          </span>
        );
      case 'ocupada':
        return (
          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold px-3 py-1 rounded-full">
            Ocupada
          </span>
        );
      case 'reservada':
        return (
          <span className="bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 text-xs font-semibold px-3 py-1 rounded-full">
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
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mb-1 inline-block cursor-pointer"
            >
              &larr; Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestión de Propiedades</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administración de inmuebles, estado y asignación de propietarios.</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            + Nueva Propiedad
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4">Propietario</th>
                <th className="px-6 py-4">Tipo Inmueble</th>
                <th className="px-6 py-4">Zona</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
              {propiedades.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 dark:text-slate-500">
                    No hay propiedades registradas
                  </td>
                </tr>
              ) : (
                propiedades.map((p) => (
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium px-3 py-1 rounded-md text-xs transition cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
              {editingId ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Ej: Av. Siempreviva 123"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Propietario</label>
                  <select
                    name="idPropietario"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.idPropietario}
                    onChange={handleChange}
                    required
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Seleccione...</option>
                    {propietarios.map(p => (
                      <option key={p.idPersona} value={p.idPersona} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Tipo de Inmueble</label>
                  <select
                    name="idTipo"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.idTipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Seleccione...</option>
                    {tiposInmueble.map(t => (
                      <option key={t.idTipo} value={t.idTipo} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {t.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Zona</label>
                  <select
                    name="idZona"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.idZona}
                    onChange={handleChange}
                    required
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Seleccione...</option>
                    {zonas.map(z => (
                      <option key={z.idZona} value={z.idZona} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {z.nombreBarrio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Estado</label>
                  <select
                    name="estado"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="Disponible" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Disponible</option>
                    <option value="Ocupada" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ocupada</option>
                    <option value="Reservada" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Reservada</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow transition cursor-pointer"
                >
                  Guardar Propiedad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}