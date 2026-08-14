import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(username, password);
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 401) {
        toast.error('Credenciales inválidas. Verifique usuario y contraseña.');
      } else {
        toast.error('Error al conectar con el servidor backend.');
      }
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700 transition-colors">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inmobiliaria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ingresá tus credenciales para acceder</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ej: admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50 shadow-sm mt-2 cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  );
}