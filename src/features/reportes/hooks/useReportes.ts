import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/api';

/* ── Tipos ── */

export interface VentaPeriodo {
  periodo: string;
  cantidad_pedidos: number;
  total_ventas: number;
}

export interface ProductoTop {
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
}

export interface PedidoPorEstado {
  estado_codigo: string;
  cantidad: number;
}

export interface IngresosFormaPago {
  forma_pago_codigo: string;
  cantidad: number;
  total: number;
}

/* ── Helpers ── */

function dateRange30d() {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10),
  };
}

/* ── Hooks ── */

/** Ventas por período (últimos ~30 días, agrupado por día). */
export const useVentasPeriodo = () => {
  const { desde, hasta } = dateRange30d();

  return useQuery<VentaPeriodo[]>({
    queryKey: ['estadisticas', 'ventas', desde, hasta],
    queryFn: async () => {
      const { data } = await api.get('/estadisticas/ventas', {
        params: { desde, hasta, agrupacion: 'day' },
      });
      return data;
    },
  });
};

/** Top productos por ingresos. */
export const useProductosTop = (limit = 5) => {
  return useQuery<ProductoTop[]>({
    queryKey: ['estadisticas', 'productos-top', limit],
    queryFn: async () => {
      const { data } = await api.get('/estadisticas/productos-top', {
        params: { limit },
      });
      return data;
    },
  });
};

/** Pedidos agrupados por estado. */
export const usePedidosPorEstado = () => {
  return useQuery<PedidoPorEstado[]>({
    queryKey: ['estadisticas', 'pedidos-por-estado'],
    queryFn: async () => {
      const { data } = await api.get('/estadisticas/pedidos-por-estado');
      return data;
    },
  });
};

/** Ingresos por forma de pago (últimos ~30 días). */
export const useIngresosFormaPago = () => {
  const { desde, hasta } = dateRange30d();

  return useQuery<IngresosFormaPago[]>({
    queryKey: ['estadisticas', 'ingresos', desde, hasta],
    queryFn: async () => {
      const { data } = await api.get('/estadisticas/ingresos', {
        params: { desde, hasta },
      });
      return data;
    },
  });
};
