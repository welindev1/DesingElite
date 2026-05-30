import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Package,
  Clock,
  Loader2,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  duration_days: number | null;
  product_ids?: number[];
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
        <h3 className="text-white font-semibold text-sm mb-1">Eliminar plan</h3>
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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    n,
  );

export default function AdminPlans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const { data, isLoading } = useQuery<Plan[]>({
    queryKey: ['admin-plans'],
    queryFn: () => api.get('/admin/plans').then((r) => r.data.data),
  });

  const deletePlan = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan eliminado');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Planes
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {data?.length ?? 0} planes en total
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/plans/new')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Plan
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Img
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider">
            Plan
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-right">
            Precio
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Info
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider text-center">
            Acciones
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">No hay planes creados</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.map((plan) => (
              <div
                key={plan.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Imagen */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                  {plan.image ? (
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Nombre + desc */}
                <div className="min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">
                    {plan.name}
                  </p>
                  {plan.description && (
                    <p className="text-white/25 text-xs truncate mt-0.5">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <span className="text-white/60 text-sm font-medium text-right">
                  {fmt(plan.price)}
                </span>

                {/* Duración + Productos */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-white/50 text-xs whitespace-nowrap">
                      {plan.duration_days
                        ? `${plan.duration_days}d`
                        : '∞'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-white/50 text-xs">
                      {plan.product_ids?.length ?? 0}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(plan)}
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

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmPopup
          name={deleteTarget.name}
          onConfirm={() => deletePlan.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deletePlan.isPending}
        />
      )}
    </div>
  );
}
