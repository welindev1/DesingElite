import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      toast.error('Error al autenticar');
      navigate('/');
      return;
    }

    // Guardamos el token y obtenemos el usuario
    api
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data: response }) => {
        const user = response.data || response; // soporta { success, data } o respuesta directa
        setAuth(token, user);
        toast.success(`Bienvenido, ${user.username}!`);
        navigate('/');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || '';

        if (msg.includes('banned')) {
          toast.error('Tu cuenta ha sido baneada. Contacta al administrador.');
        } else if (msg.includes('not found')) {
          toast.error('Usuario no encontrado.');
        } else if (msg.includes('miembro del servidor')) {
          toast.error('Debes ser miembro del servidor de Discord.');
        } else {
          toast.error(msg || 'Error al verificar usuario');
        }
        navigate('/');
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Verificando acceso...</p>
      </div>
    </div>
  );
}
