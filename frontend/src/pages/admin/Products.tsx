import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Product {
  id: number;
  name: string;
  short_description?: string;
  price: number;
  image?: string;
  visible: boolean;
  created_at: string;
}

interface ProductsResponse {
  data: Product[];
  meta: Meta;
}

function ConfirmPopup({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#13131f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/25 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">
          Eliminar producto
        </h3>
        <p className="text-white/40 text-xs mb-5">
          ¿Estás seguro que quieres eliminar{' '}
          <span className="text-white/70 font-medium">"{name}"</span>? Esta
          acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [visibleFilter, setVisibleFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const limit = 10;

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', page, search, visibleFilter],
    queryFn: () =>
      api
        .get('/admin/products', {
          params: {
            page,
            limit,
            ...(search && { search }),
            ...(visibleFilter !== '' && { visible: visibleFilter === 'true' }),
          },
        })
        .then((r) => r.data.data), // 👈 .data.data
  });
  console.log('products response:', data?.data);
  const toggleVisibility = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/products/${id}/visibility`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    onError: () => toast.error('Error al cambiar visibilidad'),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Producto eliminado');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.meta.total ?? 0) / limit);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Productos
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {data?.meta.total ?? 0} productos en total
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-[#0d0d14] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] rounded-xl text-white/50 text-sm transition-all"
          >
            Buscar
          </button>
        </form>

        <select
          value={visibleFilter}
          onChange={(e) => {
            setVisibleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#0d0d14] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/50 focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todos</option>
          <option value="true">Visibles</option>
          <option value="false">Ocultos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Img
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Producto
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-right">
            Precio
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Visible
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Acciones
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">No hay productos</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.data.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Imagen */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Nombre */}
                <div className="min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">
                    {product.name}
                  </p>
                  {product.short_description && (
                    <p className="text-white/25 text-xs truncate mt-0.5">
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <span className="text-white/60 text-sm font-medium text-right">
                  {fmt(product.price)}
                </span>

                {/* Visible toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleVisibility.mutate(product.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      product.visible
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-white/20 bg-white/[0.03] hover:bg-white/[0.07]'
                    }`}
                    title={product.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {product.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      navigate(`/admin/products/${product.id}/edit`)
                    }
                    className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/25 text-xs">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-[#0d0d14] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-[#0d0d14] border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmPopup
          name={deleteTarget.name}
          onConfirm={() => deleteProduct.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteProduct.isPending}
        />
      )}
    </div>
  );
}
