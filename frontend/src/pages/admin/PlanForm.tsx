import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Package, Check, ImageIcon } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  description: z.string().optional(),
  image: z.string().url('URL inválida').optional().or(z.literal('')),
  duration_days: z.coerce.number().min(1).optional().or(z.literal('')),
  product_ids: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full bg-[#0a0a0f] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all';

export default function AdminPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Productos disponibles
  const { data: productsRes } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () =>
      api
        .get('/admin/products', { params: { limit: 100 } })
        .then((r) => r.data.data),
  });
  const allProducts: { id: number; name: string; image?: string }[] =
    productsRes?.data ?? [];

  // Plan actual (edit)
  const { data: plan, isLoading: loadingPlan } = useQuery({
    queryKey: ['admin-plan', id],
    queryFn: () => api.get(`/admin/plans/${id}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { duration_days: 30, product_ids: [], image: '' },
  });

  const selectedIds: number[] = watch('product_ids') ?? [];

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        price: plan.price,
        description: plan.description ?? '',
        image: plan.image ?? '',
        duration_days: plan.duration_days ?? '',
        product_ids: plan.product_ids ?? [],
      });
    }
  }, [plan, reset]);

  const toggleProduct = (productId: number) => {
    const numId = Number(productId);
    const current = selectedIds.map((id) => Number(id));
    const updated = current.includes(numId)
      ? current.filter((id) => id !== numId)
      : [...current, numId];
    setValue('product_ids', updated);
  };

  const mutation = useMutation({
    mutationFn: (body: any) =>
      isEdit
        ? api.patch(`/admin/plans/${id}`, body)
        : api.post('/admin/plans', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success(isEdit ? 'Plan actualizado' : 'Plan creado');
      navigate('/admin/plans');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar el plan');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate({
      name: data.name,
      price: data.price,
      description: data.description || undefined,
      image: data.image || undefined,
      duration_days:
        data.duration_days !== '' ? Number(data.duration_days) : undefined,
      product_ids: selectedIds.map((id) => Number(id)),
    });
  };

  const imageUrl = watch('image');

  if (isEdit && loadingPlan)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/plans')}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEdit ? 'Editar Plan' : 'Nuevo Plan'}
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {isEdit
              ? 'Modifica los datos del plan'
              : 'Completa los datos para crear un plan'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Info general */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Información general
              </p>

              <div>
                <label className="text-white/50 text-xs mb-1.5 block">
                  Nombre *
                </label>
                <input
                  {...register('name')}
                  placeholder="Ej: Plan Premium"
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-red-400/80 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1.5 block">
                  Precio (USD) *
                </label>
                <input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
                {errors.price && (
                  <p className="text-red-400/80 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1.5 block">
                  Duración (días){' '}
                  <span className="text-white/25">— vacío = permanente</span>
                </label>
                <input
                  {...register('duration_days')}
                  type="number"
                  min="1"
                  placeholder="30"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1.5 block">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Descripción del plan..."
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>

            {/* Selector de productos */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Productos incluidos
                </p>
                <span className="text-white/25 text-xs bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                  {selectedIds.length} seleccionados
                </span>
              </div>

              {allProducts.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Package className="w-8 h-8 text-white/10" />
                  <p className="text-white/25 text-xs">
                    No hay productos disponibles
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProducts.map((product) => {
                    const isSelected = selectedIds.map(Number).includes(Number(product.id));
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-red-600/10 border-red-500/30 text-white/80'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.06] flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-white/20" />
                            </div>
                          )}
                        </div>

                        <span className="text-xs font-medium flex-1 truncate">
                          {product.name}
                        </span>

                        {/* Check */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-red-600 border-red-500'
                              : 'border-white/[0.15]'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Columna lateral ── */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Imagen principal
              </p>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ImageIcon className="w-6 h-6 text-white/10" />
                    <span className="text-white/20 text-[11px]">Preview</span>
                  </div>
                )}
              </div>
              <input
                {...register('image')}
                placeholder="https://i.imgur.com/..."
                className={inputClass}
              />
              {errors.image && (
                <p className="text-red-400/80 text-xs">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Resumen */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Resumen
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Nombre</span>
                  <span className="text-white/60 text-xs font-medium truncate max-w-[120px] text-right">
                    {watch('name') || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Precio</span>
                  <span className="text-white/60 text-xs font-medium">
                    {watch('price')
                      ? `$${Number(watch('price')).toFixed(2)}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Duración</span>
                  <span className="text-white/60 text-xs font-medium">
                    {watch('duration_days')
                      ? `${watch('duration_days')} días`
                      : 'Permanente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Productos</span>
                  <span className="text-white/60 text-xs font-medium">
                    {selectedIds.length}
                  </span>
                </div>
              </div>

              {/* Lista productos seleccionados */}
              {selectedIds.length > 0 && (
                <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
                  {allProducts
                    .filter((p) => selectedIds.map(Number).includes(Number(p.id)))
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                        <span className="text-white/40 text-xs truncate">
                          {p.name}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Guardar */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isEdit ? 'Guardar cambios' : 'Crear plan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
