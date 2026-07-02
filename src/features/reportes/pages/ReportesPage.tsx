import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Navbar } from '../../../components/Navbar';
import {
  useVentasPeriodo,
  useProductosTop,
  usePedidosPorEstado,
  useIngresosFormaPago,
} from '../hooks/useReportes';

/* ── Colores ── */

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  EN_PREP: '#8b5cf6',
  ENTREGADO: '#22c55e',
  CANCELADO: '#ef4444',
};

const FORMA_PAGO_COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];

/* ── Formateadores ── */

const fmt = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : fmt(n);

/* ── Componente ── */

export const ReportesPage = () => {
  const ventas = useVentasPeriodo();
  const productosTop = useProductosTop(5);
  const pedidosEstado = usePedidosPorEstado();
  const ingresosFP = useIngresosFormaPago();

  const isLoading = ventas.isLoading || productosTop.isLoading || pedidosEstado.isLoading || ingresosFP.isLoading;
  const isError = ventas.isError || productosTop.isError || pedidosEstado.isError || ingresosFP.isError;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>

        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
            Cargando datos...
          </div>
        )}

        {isError && (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-500">
            Error al cargar los datos de estadísticas.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── 1. Ventas por período (LineChart) ── */}
            <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ventas por período (últimos 30 días)</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={ventas.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="periodo"
                    tickFormatter={(v: string) => v.slice(5)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="izq" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis yAxisId="der" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'Total ventas' ? fmt(value) : value
                    }
                    labelFormatter={(l: string) => `Fecha: ${l}`}
                  />
                  <Legend />
                  <Line
                    yAxisId="izq"
                    type="monotone"
                    dataKey="total_ventas"
                    name="Total ventas"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="der"
                    type="monotone"
                    dataKey="cantidad_pedidos"
                    name="Cantidad pedidos"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── 2. Top productos (BarChart vertical) ── */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 productos por ingresos</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productosTop.data} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="nombre" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => fmt(value)} />
                  <Bar dataKey="ingresos" name="Ingresos" radius={[0, 4, 4, 0]}>
                    {productosTop.data?.map((_, i) => (
                      <Cell key={i} fill={`hsl(${25 + i * 35}, 80%, 55%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── 3. Pedidos por estado (PieChart) ── */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por estado</h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pedidosEstado.data}
                    dataKey="cantidad"
                    nameKey="estado_codigo"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ estado_codigo, cantidad }: { estado_codigo: string; cantidad: number }) =>
                      `${estado_codigo}: ${cantidad}`
                    }
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {pedidosEstado.data?.map((entry) => (
                      <Cell
                        key={entry.estado_codigo}
                        fill={ESTADO_COLORS[entry.estado_codigo] || '#9ca3af'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* ── 4. Ingresos por forma de pago (BarChart horizontal) ── */}
            <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingresos por forma de pago</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ingresosFP.data} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="forma_pago_codigo" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'Total' ? fmt(value) : value
                    }
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
                    {ingresosFP.data?.map((_, i) => (
                      <Cell key={i} fill={FORMA_PAGO_COLORS[i % FORMA_PAGO_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
