import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token de recuperación no válido o ausente.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        token,
        newPassword
      });
      toast.success('¡Contraseña actualizada con éxito!');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'No se pudo actualizar la contraseña.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <p className="text-red-500 font-bold text-lg">Enlace Inválido</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No se encontró un token válido en la dirección de la página.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Nueva Contraseña
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tu nueva clave de acceso para actualizar tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Guardar Nueva Contraseña
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}