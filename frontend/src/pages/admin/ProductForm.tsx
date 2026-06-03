import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Loader2, ImageIcon, Video } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  category: z.enum(['scripts', 'models']).default('scripts'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  image: z.string().url('URL inválida').optional().or(z.literal('')),
  download_link: z.string().url('URL inválida').optional().or(z.literal('')),
  video_url: z.string().url('URL inválida').optional().or(z.literal('')),
  visible: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400/80 text-xs mt-1">{msg}</p>;
}

function InputField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-white/50 text-xs mb-1.5 block">{label}</label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

const inputClass =
  'w-full bg-[#0a0a0f] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [gallery, setGallery] = useState<string[]>(['']);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/admin/products/${id}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { visible: true, category: 'scripts' },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        category: (product.category === 'scripts' || product.category === 'models') ? product.category : 'scripts',
        description: product.description ?? '',
        short_description: product.short_description ?? '',
        image: product.image ?? '',
        download_link: product.download_link ?? '',
        video_url: product.video_url ?? '',
        visible: product.visible,
      });
      setGallery(
        product.gallery_images?.length ? product.gallery_images : [''],
      );
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (body: any) =>
      isEdit
        ? api.patch(`/admin/products/${id}`, body)
        : api.post('/admin/products', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
      navigate('/admin/products');
    },
    onError: () => toast.error('Error al guardar el producto'),
  });

  const onSubmit = (data: FormData) => {
    const gallery_images = gallery.filter((g) => g.trim() !== '');
    mutation.mutate({
      ...data,
      image: data.image || undefined,
      download_link: data.download_link || undefined,
      video_url: data.video_url || undefined,
      gallery_images,
    });
  };

  const imageUrl = watch('image');
  const videoUrl = watch('video_url');

  /** Extract YouTube video ID from common URL formats */
  const getYouTubeId = (url?: string): string | null => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    return m ? m[1] : null;
  };
  const ytId = getYouTubeId(videoUrl);

  const addGalleryItem = () => {
    if (gallery.length < 10) setGallery((g) => [...g, '']);
  };

  const removeGalleryItem = (i: number) => {
    setGallery((g) => g.filter((_, idx) => idx !== i));
  };

  const updateGalleryItem = (i: number, val: string) => {
    setGallery((g) => g.map((item, idx) => (idx === i ? val : item)));
  };

  if (isEdit && loadingProduct)
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
          onClick={() => navigate('/admin/products')}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {isEdit
              ? 'Modifica los datos del producto'
              : 'Completa los datos para crear un producto'}
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

              <InputField label="Nombre *" error={errors.name?.message}>
                <input
                  {...register('name')}
                  placeholder="Ej: Script de Economía MTA"
                  className={inputClass}
                />
              </InputField>

              <InputField label="Precio (USD) *" error={errors.price?.message}>
                <input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
              </InputField>

              <InputField label="Categoría *" error={errors.category?.message}>
                <select {...register('category')} className={inputClass}>
                  <option value="scripts">Scripts</option>
                  <option value="models">Modelos</option>
                </select>
              </InputField>

              <InputField
                label="Descripción corta"
                error={errors.short_description?.message}
              >
                <input
                  {...register('short_description')}
                  placeholder="Breve descripción visible en la tienda"
                  className={inputClass}
                />
              </InputField>

              <InputField
                label="Descripción completa"
                error={errors.description?.message}
              >
                <textarea
                  {...register('description')}
                  placeholder="Descripción detallada del producto..."
                  rows={5}
                  className={inputClass + ' resize-none'}
                />
              </InputField>
            </div>

            {/* Links */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Links
              </p>

              <InputField
                label="Link de descarga"
                error={errors.download_link?.message}
              >
                <input
                  {...register('download_link')}
                  placeholder="https://drive.google.com/..."
                  className={inputClass}
                />
              </InputField>
            </div>
          </div>

          {/* ── Columna lateral ── */}
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

            {/* Galería */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Galería ({gallery.length}/10)
                </p>
                {gallery.length < 10 && (
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar
                  </button>
                )}
              </div>

              {/* Previews */}
              {gallery.some((g) => g.trim() !== '') && (
                <div className="grid grid-cols-2 gap-1.5">
                  {gallery
                    .filter((g) => g.trim() !== '')
                    .map((url, i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.06]"
                      >
                        <img
                          src={url}
                          alt={`g-${i}`}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {gallery.map((url, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input
                      value={url}
                      onChange={(e) => updateGalleryItem(i, e.target.value)}
                      placeholder={`Imagen ${i + 1}...`}
                      className={inputClass + ' text-xs py-2'}
                    />
                    {gallery.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(i)}
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] text-white/20 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Video de YouTube */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Video de YouTube
              </p>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="YouTube preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Video className="w-6 h-6 text-white/10" />
                    <span className="text-white/20 text-[11px]">Preview</span>
                  </div>
                )}
              </div>
              <input
                {...register('video_url')}
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass}
              />
              {errors.video_url && (
                <p className="text-red-400/80 text-xs">
                  {errors.video_url.message}
                </p>
              )}
            </div>

            {/* Visibilidad */}
            <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
                Visibilidad
              </p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    {...register('visible')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 rounded-full bg-white/[0.07] border border-white/[0.10] peer-checked:bg-red-600 peer-checked:border-red-500 transition-all" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40 peer-checked:bg-white peer-checked:translate-x-5 transition-all" />
                </div>
                <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
                  Visible en la tienda
                </span>
              </label>
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
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
