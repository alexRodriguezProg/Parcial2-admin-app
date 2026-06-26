import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import type { Pedido, DetallePedido } from '../../../types/pedido';

const PAGE_SIZE = 20;

interface PedidoBackend {
  id: number;
  usuario_id: number;
  created_at: string;
  estado_codigo: Pedido['estado'];
  forma_pago_codigo: string;
  total: number;
  direccion_id?: number;
  detalles?: DetalleBackend[];
}

interface DetalleBackend {
  id?: number;
  pedido_id?: number;
  producto_id: number;
  nombre_snapshot: string;
  precio_snapshot: number;
  cantidad: number;
}

/** Mapea un pedido del backend (PedidoResponse) al tipo Pedido del frontend. */
function mapPedido(backend: PedidoBackend): Pedido {
  return {
    id: backend.id,
    usuario_id: backend.usuario_id,
    fecha_creacion: backend.created_at,
    estado: backend.estado_codigo,
    forma_pago: backend.forma_pago_codigo,
    total: backend.total,
    direccion_id: backend.direccion_id ?? 0,
  };
}

/** Mapea un detalle del backend al tipo DetallePedido del frontend. */
function mapDetalle(d: DetalleBackend, index: number): DetallePedido {
  return {
    id: d.id ?? index,
    pedido_id: d.pedido_id ?? 0,
    producto_id: d.producto_id,
    nombre_producto: d.nombre_snapshot,
    precio_snapshot: d.precio_snapshot,
    cantidad: d.cantidad,
  };
}

/** Hook que obtiene pedidos paginados con filtro y mutation de cambio de estado. */
export const usePedidos = (filtros: { search?: string; estado_codigo?: string } = {}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = PAGE_SIZE;

  const skip = (page - 1) * pageSize;

  const pedidosQuery = useQuery<{ items: Pedido[]; total: number }>({
    queryKey: ['pedidos', { skip, limit: pageSize, search: filtros.search, estado: filtros.estado_codigo }],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { skip, limit: pageSize };
      if (filtros.search) params.search = filtros.search;
      if (filtros.estado_codigo) params.estado_codigo = filtros.estado_codigo;
      const response = await api.get('/pedidos/', { params });
      const data = response.data;
      return {
        items: (data.items ?? []).map(mapPedido),
        total: data.total ?? 0,
      };
    },
    placeholderData: (prev) => prev,
  });

  const totalPages = Math.ceil((pedidosQuery.data?.total ?? 0) / pageSize);

  const avanzarEstadoMutation = useMutation({
    mutationFn: async ({ id, nuevoEstado, motivo }: { id: number; nuevoEstado: string; motivo?: string }) => {
      const response = await api.patch(`/pedidos/${id}/estado`, { nuevo_estado: nuevoEstado, motivo });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedido', variables.id] });
    },
  });

  return {
    pedidosQuery,
    avanzarEstadoMutation,
    page,
    totalPages,
    setPage,
    pageSize,
  };
};

/** Hook que obtiene el detalle completo de un pedido por ID. */
export const usePedidoDetalle = (id: number) => {
  return useQuery<{ pedido: Pedido; detalles: DetallePedido[] }>({
    queryKey: ['pedido', id],
    queryFn: async () => {
      // GET /pedidos/{id} ya devuelve el PedidoResponse completo con detalles embebidos
      const response = await api.get(`/pedidos/${id}`);
      const data = response.data;
      return {
        pedido: mapPedido(data),
        detalles: (data.detalles ?? []).map(mapDetalle),
      };
    },
    enabled: !!id,
  });
};