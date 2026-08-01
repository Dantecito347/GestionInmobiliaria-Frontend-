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
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">Disponible</span>;
      case 'ocupada':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">Ocupada</span>;
      case 'reservada':
        return <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full">Reservada</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">{estado}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans text-gray-800">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 hover:underline font-medium mb-1 inline-block cursor-pointer"
            >
              &larr; Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Propiedades</h1>
            <p className="text-sm text-slate-500">Administración de inmuebles, estado y asignación de propietarios..</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            + Nueva Propiedad
          </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4">Propietario</th>
              <th className="px-6 py-4">Tipo Inmueble</th>
              <th className="px-6 py-4">Zona</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {propiedades.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No hay propiedades registradas
                </td>
              </tr>
            ) : (
              propiedades.map((p) => (
                <tr key={p.idPropiedad} className="hover:bg-gray-50/80 transition duration-150">
                  <td className="px-6 py-4 font-mono text-gray-500">#{p.idPropiedad}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{p.direccion}</td>
                  
                  <td className="px-6 py-4 text-gray-600">
                    {p.nombrePropietario ? `${p.nombrePropietario} ${p.apellidoPropietario || ''}` : p.idPropietario}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-600">
                    {p.tipoDescripcion || p.idTipo}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-600">
                    {p.zona || p.idZona}
                  </td>
                  
                  <td className="px-6 py-4">{renderBadge(p.estado)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium px-3 py-1 rounded-md text-xs transition"
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

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              {editingId ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Ej: Av. Siempreviva 123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Propietario</label>
                  <select
                    name="idPropietario"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    value={formData.idPropietario}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {propietarios.map(p => (
                      <option key={p.idPersona} value={p.idPersona}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Tipo de Inmueble</label>
                  <select
                    name="idTipo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    value={formData.idTipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {tiposInmueble.map(t => (
                      <option key={t.idTipo} value={t.idTipo}>
                        {t.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Zona</label>
                  <select
                    name="idZona"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    value={formData.idZona}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {zonas.map(z => (
                      <option key={z.idZona} value={z.idZona}>
                        {z.nombreBarrio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Estado</label>
                  <select
                    name="estado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupada">Ocupada</option>
                    <option value="Reservada">Reservada</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow transition"
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