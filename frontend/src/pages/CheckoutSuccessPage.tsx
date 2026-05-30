import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { CartManager } from './ShopPage';
import {
  CheckCircle,
  XCircle,
  Package,
  Home,
  ShoppingCart,
  Loader2,
  ArrowRight,
  Receipt,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CaptureResult {
  success: boolean;
  transaction_id?: string;
  purchase_ids?: number[];
  message?: string;
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { token } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const capturePayment = async () => {
      // PayPal returns the order ID as 'token' query param
      const orderId = searchParams.get('token');

      if (!orderId) {
        setStatus('error');
        setErrorMessage('No se encontró el ID de la orden');
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Debes iniciar sesión para completar el pago');
        return;
      }

      try {
        const res = await axios.post(
          `${API}/payments/capture`,
          { order_id: orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data: CaptureResult = res.data.data || res.data;

        if (data.success) {
          // Clear cart on successful payment
          CartManager.clear();
          localStorage.removeItem('welin_cart_backup');
          setResult(data);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Error al procesar el pago');
        }
      } catch (err: any) {
        setStatus('error');
        const msg = err.response?.data?.message || err.response?.data?.data?.message || 'Error al capturar el pago';
        setErrorMessage(msg);
      }
    };

    capturePayment();
  }, [searchParams, token]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans antialiased relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('https://imgur.com/J5bEdPp.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(20, 10, 15, 0.5) 0%, #08080c 80%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {status === 'loading' && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 backdrop-blur-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Loader2 size={40} className="text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Procesando pago...</h1>
            <p className="text-gray-400">Por favor espera mientras confirmamos tu pago con PayPal.</p>
          </div>
        )}

        {status === 'success' && result && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 backdrop-blur-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">¡Pago completado!</h1>
            <p className="text-gray-400 mb-6">Tu compra se ha procesado correctamente.</p>

            {/* Transaction details */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Receipt size={14} />
                ID de Transacción
              </div>
              <p className="font-mono text-sm text-white break-all">{result.transaction_id}</p>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Los productos han sido agregados a tu cuenta. Puedes acceder a ellos desde tu panel de usuario.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 py-3.5 px-6 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)]"
              >
                Ver mis productos <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 py-3 px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-gray-300 hover:text-white font-medium transition-all"
              >
                <Package size={16} /> Seguir comprando
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 backdrop-blur-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Error en el pago</h1>
            <p className="text-gray-400 mb-6">{errorMessage}</p>

            <div className="flex flex-col gap-3">
              <Link
                to="/cart"
                className="flex items-center justify-center gap-2 py-3.5 px-6 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5"
              >
                <ShoppingCart size={16} /> Volver al carrito
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 py-3 px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-gray-300 hover:text-white font-medium transition-all"
              >
                <Home size={16} /> Ir al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
