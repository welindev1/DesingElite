import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import api from '../../lib/axios';

// ── Types ──────────────────────────────────────────
interface Stats {
  summary: {
    total_revenue: number;
    total_users: number;
    active_products: number;
    purchases_today: { count: number; revenue: number };
    purchases_week: { count: number; revenue: number };
    purchases_month: { count: number; revenue: number };
  };
  sales_chart: { date: string; revenue: number; count: number }[];
  recent_purchases: any[];
  recent_users: any[];
}

// ── Helpers ────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

// ── Tooltip personalizado ──────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13131f] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-white/40 text-xs mb-2">{fmtDate(label)}</p>
      <p className="text-white font-semibold text-sm">
        {fmt(payload[0]?.value ?? 0)}
      </p>
      <p className="text-white/40 text-xs mt-1">
        {payload[1]?.value ?? 0} ventas
      </p>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4 hover:border-white/[0.10] transition-all duration-200">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accent
            ? 'bg-red-600/20 border border-red-500/25'
            : 'bg-white/[0.04] border border-white/[0.07]'
        }`}
      >
        <Icon
          className={`w-5 h-5 ${accent ? 'text-red-400' : 'text-white/40'}`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-white/35 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white/[0.04] animate-pulse rounded-xl ${className}`} />
  );
}

// ── Main ───────────────────────────────────────────
export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isError)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400/70 text-sm">Error al cargar estadísticas</p>
      </div>
    );

  const s = data?.summary;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-white/30 text-sm mt-1">
          Resumen general de DisenosElite
        </p>
      </div>

      {/* ── Stat Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Revenue Total"
            value={fmt(s?.total_revenue ?? 0)}
            accent
          />
          <StatCard
            icon={Users}
            label="Usuarios Totales"
            value={String(s?.total_users ?? 0)}
          />
          <StatCard
            icon={Package}
            label="Productos Activos"
            value={String(s?.active_products ?? 0)}
          />
          <StatCard
            icon={ShoppingBag}
            label="Ventas del Mes"
            value={String(s?.purchases_month?.count ?? 0)}
            sub={fmt(s?.purchases_month?.revenue ?? 0)}
          />
        </div>
      )}

      {/* ── Periodos ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, label: 'Hoy', data: s?.purchases_today },
            { icon: TrendingUp, label: 'Esta semana', data: s?.purchases_week },
            { icon: Calendar, label: 'Este mes', data: s?.purchases_month },
          ].map(({ icon: Icon, label, data: d }) => (
            <div
              key={label}
              className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-white/[0.10] transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-white/25" />
                <span className="text-white/40 text-sm">{label}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-sm">
                  {fmt(d?.revenue ?? 0)}
                </p>
                <p className="text-white/30 text-xs">{d?.count ?? 0} ventas</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart ── */}
      <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-sm">
              Ventas en el tiempo
            </h2>
            <p className="text-white/30 text-xs mt-0.5">Revenue diario</p>
          </div>
          <span className="text-white/20 text-xs bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-full">
            Últimos 30 días
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="h-56" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data?.sales_chart ?? []}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
                fill="none"
                dot={false}
                activeDot={{ r: 3, fill: '#fff', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Recientes ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Compras recientes */}
          <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">
              Compras recientes
            </h2>
            {data?.recent_purchases?.length ? (
              <div className="space-y-3">
                {data.recent_purchases.slice(0, 5).map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <div>
                      <p className="text-white/70 text-xs font-medium">
                        {p.user?.username ?? '—'}
                      </p>
                      <p className="text-white/30 text-[11px] mt-0.5">
                        {p.product?.name ?? p.plan?.name ?? '—'}
                      </p>
                    </div>
                    <span className="text-white/60 text-xs font-semibold">
                      {fmt(p.amount ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-xs">Sin compras recientes</p>
            )}
          </div>

          {/* Usuarios recientes */}
          <div className="bg-[#0d0d14] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">
              Usuarios recientes
            </h2>
            {data?.recent_users?.length ? (
              <div className="space-y-3">
                {data.recent_users.slice(0, 5).map((u: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 text-[10px] font-bold">
                          {u.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white/70 text-xs font-medium truncate">
                        {u.username}
                      </p>
                      <p className="text-white/25 text-[11px]">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-xs">Sin usuarios recientes</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
