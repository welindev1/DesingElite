import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Webhook,
  Users,
  Key,
  ShoppingBag,
  ImageIcon,
  Tag,
  Loader2,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface WebhooksConfig {
  webhook_users: string | null;
  webhook_licenses: string | null;
  webhook_purchases: string | null;
  webhook_purchases_detailed: string | null;
  webhook_coupons: string | null;
}

interface WebhookField {
  key: keyof WebhooksConfig;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const WEBHOOK_FIELDS: WebhookField[] = [
  {
    key: 'webhook_users',
    label: 'Webhook Usuarios',
    description: 'Notificaciones de cambios de estado y rol de usuarios',
    icon: Users,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    key: 'webhook_licenses',
    label: 'Webhook Licencias',
    description: 'Notificaciones cuando se agregan productos a licencias',
    icon: Key,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    key: 'webhook_purchases',
    label: 'Webhook Compras (Simple)',
    description: 'Mensaje simple de texto para cada compra',
    icon: ShoppingBag,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'webhook_purchases_detailed',
    label: 'Webhook Compras (Detallado)',
    description: 'Embed elaborado con imagen y detalles de la compra',
    icon: ImageIcon,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    key: 'webhook_coupons',
    label: 'Webhook Cupones',
    description: 'Notificaciones cuando se utilizan cupones de descuento',
    icon: Tag,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  },
];

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WebhooksConfig>({
    webhook_users: null,
    webhook_licenses: null,
    webhook_purchases: null,
    webhook_purchases_detailed: null,
    webhook_coupons: null,
  });
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  const { isLoading } = useQuery<WebhooksConfig>({
    queryKey: ['admin-webhooks'],
    queryFn: async () => {
      const res = await api.get('/admin/settings/webhooks');
      const data = res.data.data || res.data;
      setFormData(data);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<WebhooksConfig>) => {
      // Convert null/empty to null for the API
      const cleanData: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(data)) {
        cleanData[key] = value && value.trim() ? value.trim() : null;
      }
      return api.patch('/admin/settings/webhooks', cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-webhooks'] });
      toast.success('Webhooks guardados correctamente');
    },
    onError: () => toast.error('Error al guardar webhooks'),
  });

  const testWebhook = async (type: string) => {
    setTestingWebhook(type);
    setTestResults((prev) => ({ ...prev, [type]: null }));

    try {
      const res = await api.post(`/admin/settings/webhooks/test?type=${type}`);
      const result = res.data.data || res.data;
      const success = result.success;
      setTestResults((prev) => ({ ...prev, [type]: success }));
      if (success) {
        toast.success('Webhook probado exitosamente');
      } else {
        toast.error(result.message || 'Error al probar webhook');
      }
    } catch {
      setTestResults((prev) => ({ ...prev, [type]: false }));
      toast.error('Error al probar webhook');
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleChange = (key: keyof WebhooksConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value || null }));
    // Clear test result when URL changes
    const type = key.replace('webhook_', '');
    setTestResults((prev) => ({ ...prev, [type]: null }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const configuredCount = Object.values(formData).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Configuracion
          </h1>
          <p className="text-white/30 text-sm mt-0.5">
            {configuredCount} de {WEBHOOK_FIELDS.length} webhooks configurados
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Cambios
        </button>
      </div>

      {/* Discord Webhooks Section */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
            <Webhook className="w-4.5 h-4.5 text-[#5865F2]" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">
              Webhooks de Discord
            </h2>
            <p className="text-white/30 text-xs mt-0.5">
              Configura los webhooks para recibir notificaciones en Discord
            </p>
          </div>
          <a
            href="https://support.discord.com/hc/es/articles/228383668-Intro-to-Webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Como crear webhooks
          </a>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {WEBHOOK_FIELDS.map((field) => {
              const Icon = field.icon;
              const type = field.key.replace('webhook_', '');
              const testResult = testResults[type];
              const isTesting = testingWebhook === type;
              const hasUrl = !!formData[field.key];

              return (
                <div
                  key={field.key}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${field.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white/80 text-sm font-medium">
                          {field.label}
                        </h3>
                        {hasUrl && testResult === true && (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                        {hasUrl && testResult === false && (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-white/30 text-xs mt-0.5">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="flex-1 bg-[#0a0a0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all font-mono text-xs"
                    />
                    <button
                      onClick={() => testWebhook(type)}
                      disabled={!hasUrl || isTesting}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        hasUrl
                          ? 'bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white/80'
                          : 'bg-white/[0.02] border border-white/[0.05] text-white/20 cursor-not-allowed'
                      }`}
                    >
                      {isTesting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                      Probar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Acerca de los Webhooks
            </h3>
            <div className="text-white/40 text-xs space-y-2">
              <p>
                <strong className="text-white/50">Webhook Usuarios:</strong> Se
                activa cuando cambias el estado (activo/baneado) o rol de un
                usuario.
              </p>
              <p>
                <strong className="text-white/50">Webhook Licencias:</strong> Se
                activa cuando agregas un producto a la licencia de un usuario,
                ya sea manualmente o por compra.
              </p>
              <p>
                <strong className="text-white/50">
                  Webhook Compras (Simple):
                </strong>{' '}
                Envia un mensaje de texto simple con el resumen de la compra.
              </p>
              <p>
                <strong className="text-white/50">
                  Webhook Compras (Detallado):
                </strong>{' '}
                Envia un embed rico con todos los detalles de la compra
                incluyendo imagen del usuario.
              </p>
              <p>
                <strong className="text-white/50">Webhook Cupones:</strong> Se
                activa cuando un usuario utiliza un cupon de descuento en una
                compra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
