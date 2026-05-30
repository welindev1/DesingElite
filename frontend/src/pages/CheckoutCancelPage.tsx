import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  XCircle,
  ShoppingCart,
  Home,
  ArrowLeft,
} from 'lucide-react';

export default function CheckoutCancelPage() {
  useEffect(() => {
    // Restore cart from backup if exists
    const backup = localStorage.getItem('welin_cart_backup');
    if (backup) {
      try {
        const items = JSON.parse(backup);
        localStorage.setItem('welin_cart', JSON.stringify(items));
        window.dispatchEvent(new Event('cart-updated'));
      } catch {
        // Ignore parse errors
      }
      localStorage.removeItem('welin_cart_backup');
    }
  }, []);

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
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 backdrop-blur-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <XCircle size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-yellow-400">Pago cancelado</h1>
          <p className="text-gray-400 mb-6">
            Has cancelado el proceso de pago. Tu carrito ha sido restaurado y puedes intentarlo de nuevo cuando quieras.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 py-3.5 px-6 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(197,40,40,0.3)]"
            >
              <ArrowLeft size={16} /> Volver al carrito
            </Link>
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-gray-300 hover:text-white font-medium transition-all"
            >
              <ShoppingCart size={16} /> Seguir comprando
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 py-3 px-6 text-gray-500 hover:text-white font-medium transition-all"
            >
              <Home size={16} /> Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
