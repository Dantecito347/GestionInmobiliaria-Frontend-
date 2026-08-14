import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Solicitud procesada correctamente.');
    } catch (error) {
      toast.error('Ocurrió un error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        
        <div>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mb-3 inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio de Sesión
          </button>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recuperar Contraseña</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa el correo electrónico asociado a tu cuenta para recibir un enlace de restablecimiento.
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              ¡Correo enviado!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Si la dirección coincide con una cuenta registrada, recibirás las instrucciones en breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
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
                'Enviando...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar enlace
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}