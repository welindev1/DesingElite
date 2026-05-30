import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
  Percent,
  DollarSign,
  Tag,
  Package,
  BookOpen,
  Check,
  X,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede tener más de 50 caracteres'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive('El valor debe ser mayor a 0'),
  applies_to: z.enum(['products', 'plans', 'all']),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  max_uses: z.coerce.number().int().positive().optional().nullable(),
  min_purchase: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
}

interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'products' | 'plans' | 'all';
  product_ids?: number[];
  plan_ids?: number[];
  start_date: string;
  end_date: string;
  max_uses?: number;
  min_purchase: number;
  status: string;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400/80 text-xs mt-1">{msg}</p>;
}

function InputField({
  label,
  error,
  children,
  optional,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-white/50 text-xs mb-1.5 block">
        {label}
        {optional && <span className="text-white/25 ml-1">(opcional)</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

const inputClass =
  'w-full bg-[#0a0a0f] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all';

function ItemSelector<T extends { id: number; name: string }>({
  items,
  selectedIds,
  onToggle,
  icon: Icon,
  emptyText,
}: {
  items: T[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  icon: React.ElementType;
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-6 text-white/25 text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
              isSelected
                ? 'bg-red-600/10 border-red-500/30 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'bg-red-600 border-red-500'
                  : 'bg-white/[0.03] border-white/[0.10]'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <Icon className="w-4 h-4 text-white/30 flex-shrink-0" />
            <span className="text-sm truncate flex-1 text-left">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AdminCouponForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);

  // Fetch coupon data if editing
  const { data: coupon, isLoading: loadingCoupon } = useQuery<Coupon>({
    queryKey: ['admin-coupon', id],
    queryFn: () => api.get(`/admin/coupons/${id}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  // Fetch products and plans for selectors
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products-list'],
    queryFn: () =>
      api.get('/admin/products', { params: { limit: 100 } }).then((r) => r.data.data),
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['admin-plans-list'],
    queryFn: () => api.get('/admin/plans').then((r) => r.data.data),
  });

  const products = productsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      discount_type: 'percentage',
      applies_to: 'all',
      min_purchase: 0,
    },
  });

  const appliesTo = watch('applies_to');
  const discountType = watch('discount_type');

  useEffect(() => {
    if (coupon) {
      const startDate = new Date(coupon.start_date).toISOString().split('T')[0];
      const endDate = new Date(coupon.end_date).toISOString().split('T')[0];

      reset({
        code: coupon.code,
        description: coupon.description ?? '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        applies_to: coupon.applies_to,
        start_date: startDate,
        end_date: endDate,
        max_uses: coupon.max_uses ?? undefined,
        min_purchase: coupon.min_purchase,
      });
      setSelectedProductIds(coupon.product_ids ?? []);
      setSelectedPlanIds(coupon.plan_ids ?? []);
    }
  }, [coupon, reset]);

  const mutation = useMutation({
    mutationFn: (body: any) =>
      isEdit
        ? api.patch(`/admin/coupons/${id}`, body)
        : api.post('/admin/coupons', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(isEdit ? 'Cupón actualizado' : 'Cupón creado');
      navigate('/admin/coupons');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Error al guardar el cupón';
      toast.error(message);
    },
  });

  const onSubmit = (data: FormData) => {
    const body: any = {
      ...data,
      code: data.code.toUpperCase(),
      max_uses: data.max_uses || undefined,
      min_purchase: data.min_purchase || 0,
    };

    // Add product/plan IDs based on applies_to
    if (data.applies_to === 'products' && selectedProductIds.length > 0) {
      body.product_ids = selectedProductIds;
    } else if (data.applies_to === 'plans' && selectedPlanIds.length > 0) {
      body.plan_ids = selectedPlanIds;
    }

    mutation.mutate(body);
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const togglePlan = (id: number) => {
    setSelectedPlanIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (isEdit && loadingCoupon) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEdit ? 'Editar Cupón' : 'Nuevo Cupón'}
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {isEdit
              ? 'Modifica los datos del cupón'
              : 'Completa los datos para crear un cupón'}
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

              <InputField label="Código *" error={errors.code?.message}>
                <input
                  {...register('code')}
                  placeholder="Ej: WELIN20"
                  className={inputClass + ' uppercase font-mono'}
                />
              </InputField>

              <InputField
                label="Descripción"
                error={errors.description?.message}
                optional
              >
                <input
                  {...register('description')}
                  placeholder="Descripción del cupón (interna)"
                  className={inputClass}
                />
              </InputField>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Tipo de descuento *"
                  error={errors.discount_type?.message}
                >
                  <Controller
                    name="discount_type"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange('percentage')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                            field.value === 'percentage'
                              ? 'bg-red-600/20 border-red-500/30 text-white'
                              : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:bg-white/[0.05]'
                          }`}
                        >
                          <Percent className="w-4 h-4" />
                          <span className="text-sm">Porcentaje</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('fixed')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                            field.value === 'fixed'
                              ? 'bg-red-600/20 border-red-500/30 text-white'
                              : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:bg-white/[0.05]'
                          }`}
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Fijo</span>
                        </button>
                      </div>
                    )}
                  />
                </InputField>

                <InputField
                  label={`Valor ${discountType === 'percentage' ? '(%)' : '(USD)'} *`}
                  error={errors.discount_value?.message}
                >
                  <input
                    {...register('discount_value')}
                    type="number"
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    placeholder={discountType === 'percentage' ? '20' : '10.00'}
                    className={inputClass}
                  />
                </InputField>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Período de validez
              </p>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Fecha de inicio *"
                  error={errors.start_date?.message}
                >
                  <input
                    {...register('start_date')}
                    type="date"
                    className={inputClass}
                  />
                </InputField>

                <InputField
                  label="Fecha de fin *"
                  error={errors.end_date?.message}
                >
                  <input
                    {...register('end_date')}
                    type="date"
                    className={inputClass}
                  />
                </InputField>
              </div>
            </div>

            {/* Restricciones */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Restricciones
              </p>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Límite de usos"
                  error={errors.max_uses?.message}
                  optional
                >
                  <input
                    {...register('max_uses')}
                    type="number"
                    min="1"
                    placeholder="Sin límite"
                    className={inputClass}
                  />
                </InputField>

                <InputField
                  label="Compra mínima (USD)"
                  error={errors.min_purchase?.message}
                  optional
                >
                  <input
                    {...register('min_purchase')}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={inputClass}
                  />
                </InputField>
              </div>
            </div>
          </div>

          {/* ── Columna lateral ── */}
          <div className="space-y-4">
            {/* Aplica a */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Aplica a
              </p>

              <Controller
                name="applies_to"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Todo', icon: Tag },
                      { value: 'products', label: 'Solo productos', icon: Package },
                      { value: 'plans', label: 'Solo planes', icon: BookOpen },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          field.value === option.value
                            ? 'bg-red-600/20 border-red-500/30 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              />

              {/* Selector de productos */}
              {appliesTo === 'products' && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-white/40 text-xs mb-3">
                    Selecciona los productos (opcional)
                  </p>
                  <ItemSelector
                    items={products}
                    selectedIds={selectedProductIds}
                    onToggle={toggleProduct}
                    icon={Package}
                    emptyText="No hay productos"
                  />
                  {selectedProductIds.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-white/30 text-xs">
                        {selectedProductIds.length} seleccionados
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProductIds([])}
                        className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Selector de planes */}
              {appliesTo === 'plans' && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-white/40 text-xs mb-3">
                    Selecciona los planes (opcional)
                  </p>
                  <ItemSelector
                    items={plans ?? []}
                    selectedIds={selectedPlanIds}
                    onToggle={togglePlan}
                    icon={BookOpen}
                    emptyText="No hay planes"
                  />
                  {selectedPlanIds.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-white/30 text-xs">
                        {selectedPlanIds.length} seleccionados
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPlanIds([])}
                        className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {appliesTo === 'all' && (
                <p className="text-white/25 text-xs mt-2">
                  El cupón se aplicará a todos los productos y planes.
                </p>
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
              {isEdit ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
