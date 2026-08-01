import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaService } from '../services/personaService';

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
      } else {
        await personaService.create(payload);
      }
      handleCloseModal();
      fetchPersonas();
    } catch (err) {
      console.error("Error devuelto por Spring Boot:", err.response?.data || err);
      alert('Error al guardar la persona. Mirá la consola (F12) para ver el detalle.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta persona?')) {
      try {
        await personaService.delete(id);
        fetchPersonas();
      } catch (err) {
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 hover:underline font-medium mb-1 inline-block cursor-pointer"
            >
              &larr; Volver al Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Personas</h1>
            <p className="text-sm text-slate-500">Administración de clientes, propietarios e inquilinos.</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            + Nueva Persona
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabla de personas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando registros...</div>
          ) : personas.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay personas registradas aún.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Nombre Completo</th>
                  <th className="p-4">Documento</th>
                  <th className="p-4">CUIL/CUIT</th> {/* NUEVA COLUMNA */}
                  <th className="p-4">Email</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">CBU / Alias</th> {/* NUEVA COLUMNA */}
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {personas.map((p) => {
                  const id = p.idPersona || p.id;
                  
                  const documentoFormateado = p.tipoDocumentoDescripcion && p.nroDocumento
                    ? `${p.tipoDocumentoDescripcion}: ${p.nroDocumento}`
                    : p.nroDocumento || p.dni || '-';

                  return (
                    <tr key={id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-800">
                        {p.nombre} {p.apellido}
                      </td>
                      <td className="p-4 text-slate-600">{documentoFormateado}</td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{p.cuilCuit || '-'}</td> {/* NUEVO DATO */}
                      <td className="p-4 text-slate-600">{p.email || '-'}</td>
                      <td className="p-4 text-slate-600">{p.telefono || '-'}</td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{p.cbuAlias || '-'}</td> {/* NUEVO DATO */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingId ? 'Editar Persona' : 'Nueva Persona'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo Doc.</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    value={formData.idTipoDoc}
                    onChange={(e) => setFormData({ ...formData, idTipoDoc: e.target.value })}
                  >
                    <option value={1}>DNI</option>
                    <option value={2}>LC</option>
                    <option value={3}>LE</option>
                    <option value={4}>PAS</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Número de Doc.</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.nroDocumento}
                    onChange={(e) => setFormData({ ...formData, nroDocumento: e.target.value })}
                  />
                </div>
              </div>

              {/* NUEVA FILA: CUIL/CUIT y CBU/Alias juntos */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CUIL / CUIT</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.cuilCuit || ''}
                    onChange={(e) => setFormData({ ...formData, cuilCuit: e.target.value })}
                    placeholder="20123456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CBU / Alias</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.cbuAlias || ''}
                    onChange={(e) => setFormData({ ...formData, cbuAlias: e.target.value })}
                    placeholder="mi.alias.banco"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}