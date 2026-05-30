import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPlaceholder from './pages/admin/Placeholder';
import { useAuthStore } from './store/authStore';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminPlans from './pages/admin/Plans';
import AdminPlanForm from './pages/admin/PlanForm';
import AdminUsers from './pages/admin/Users';
import AdminCoupons from './pages/admin/Coupons';
import AdminCouponForm from './pages/admin/CouponForm';
import AdminPurchases from './pages/admin/Purchases';
import AdminFeedback from './pages/admin/Feedback';
import AdminSettings from './pages/admin/Settings';

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
      <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AuthRoute><UserDashboardPage /></AuthRoute>} />
      <Route path="/auth/discord/callback" element={<AuthCallback />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />

        <Route path="plans" element={<AdminPlans />} />
        <Route path="plans/new" element={<AdminPlanForm />} />
        <Route path="plans/:id/edit" element={<AdminPlanForm />} />

        <Route path="users" element={<AdminUsers />} />

        <Route path="purchases" element={<AdminPurchases />} />

        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="coupons/new" element={<AdminCouponForm />} />
        <Route path="coupons/:id/edit" element={<AdminCouponForm />} />

        <Route path="feedback" element={<AdminFeedback />} />
        <Route
          path="stats"
          element={<AdminPlaceholder title="Estadísticas" />}
        />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
