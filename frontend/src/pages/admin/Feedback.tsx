import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  Star,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Feedback {
  id: number;
  user: { id: number; username: string; avatar?: string };
  product?: { id: number; name: string };
  rating: number;
  comment: string;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  visible: number;
  hidden: number;
  featured: number;
  avgRating: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: stats } = useQuery<Stats>({
    queryKey: ['feedback-stats'],
    queryFn: () => api.get('/admin/feedback/stats').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', page, debouncedSearch, visibilityFilter, featuredFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (visibilityFilter) params.set('visibility', visibilityFilter);
      if (featuredFilter) params.set('featured', featuredFilter);
      return api.get(`/admin/feedback?${params}`).then(r => r.data.data);
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/feedback/${id}/visibility`),
    onSuccess: () => {
      toast.success('Visibilidad actualizada');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
    onError: () => toast.error('Error al cambiar visibilidad'),
  });

  const toggleFeatured = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/feedback/${id}/featured`),
    onSuccess: () => {
      toast.success('Destacado actualizado');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
    onError: () => toast.error('Error al cambiar destacado'),
  });

  const deleteFeedback = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/feedback/${id}`),
    onSuccess: () => {
      toast.success('Feedback eliminado');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const feedbacks: Feedback[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const clearFilters = () => {
    setSearch('');
    setVisibilityFilter('');
    setFeaturedFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-400" />
          Feedback
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Gestiona las reseñas de los usuarios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
            <MessageSquare className="w-3.5 h-3.5" /> Total
          </div>
          <p className="text-xl font-bold text-white">{stats?.total || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400/60 text-xs mb-1">
            <Eye className="w-3.5 h-3.5" /> Visibles
          </div>
          <p className="text-xl font-bold text-emerald-400">{stats?.visible || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
            <EyeOff className="w-3.5 h-3.5" /> Ocultos
          </div>
          <p className="text-xl font-bold text-white/60">{stats?.hidden || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400/60 text-xs mb-1">
            <Star className="w-3.5 h-3.5" /> Destacados
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats?.featured || 0}</p>
        </div>
        <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400/60 text-xs mb-1">
            <Star className="w-3.5 h-3.5" /> Promedio
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-blue-400">{stats?.avgRating || 0}</p>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por usuario o comentario..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={visibilityFilter}
            onChange={e => { setVisibilityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="">Todos</option>
            <option value="visible">Visibles</option>
            <option value="hidden">Ocultos</option>
          </select>
          <select
            value={featuredFilter}
            onChange={e => { setFeaturedFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="">Destacado: Todos</option>
            <option value="true">Solo destacados</option>
          </select>
          {(search || visibilityFilter || featuredFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-12 text-center text-white/40">
            Cargando...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-[#0d0d14] border border-white/[0.06] rounded-xl p-12 text-center text-white/40">
            No hay feedback
          </div>
        ) : (
          feedbacks.map(feedback => (
            <div
              key={feedback.id}
              className={`bg-[#0d0d14] border rounded-xl p-5 transition-all ${
                feedback.is_featured
                  ? 'border-yellow-500/30 bg-yellow-500/[0.02]'
                  : feedback.is_visible
                  ? 'border-white/[0.06]'
                  : 'border-white/[0.04] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: User & Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    {feedback.user?.avatar ? (
                      <img src={feedback.user.avatar} className="w-10 h-10 rounded-full" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                        <span className="text-red-400 text-sm font-bold">
                          {feedback.user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{feedback.user?.username}</span>
                        {feedback.is_featured && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[10px]">
                            DESTACADO
                          </span>
                        )}
                        {!feedback.is_visible && (
                          <span className="px-1.5 py-0.5 bg-white/10 text-white/40 border border-white/10 rounded text-[10px]">
                            OCULTO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <StarRating rating={feedback.rating} />
                        {feedback.product && (
                          <span className="text-white/30 text-xs flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {feedback.product.name}
                          </span>
                        )}
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(feedback.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{feedback.comment}</p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleVisibility.mutate(feedback.id)}
                    disabled={toggleVisibility.isPending}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback.is_visible
                        ? 'text-emerald-400 hover:bg-emerald-600/20'
                        : 'text-white/30 hover:bg-white/[0.05]'
                    }`}
                    title={feedback.is_visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {feedback.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleFeatured.mutate(feedback.id)}
                    disabled={toggleFeatured.isPending}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback.is_featured
                        ? 'text-yellow-400 hover:bg-yellow-600/20'
                        : 'text-white/30 hover:bg-white/[0.05]'
                    }`}
                    title={feedback.is_featured ? 'Quitar destacado' : 'Destacar'}
                  >
                    <Star className={`w-4 h-4 ${feedback.is_featured ? 'fill-yellow-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(feedback.id)}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#0d0d14] border border-white/[0.06] rounded-xl px-4 py-3">
          <p className="text-white/40 text-sm">
            Mostrando {feedbacks.length} de {meta.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white/60 text-sm px-3">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0d14] border border-white/[0.08] rounded-xl p-6 z-50 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Eliminar Feedback</h3>
                <p className="text-white/40 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-white/60 hover:text-white/90 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteFeedback.mutate(deleteConfirm)}
                disabled={deleteFeedback.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
