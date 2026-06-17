import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { Pedido, DetallePedido } from '../../../types/pedido';

export const usePedidos = () => {
  const queryClient = useQueryClient();

  const pedidosQuery = useQuery<Pedido[]>({
    queryKey: ['pedidos'],
    queryKeyFn: async () => {
      const response = await api.get('/pedidos/');
      return response.data;
    },
  });

  const avanzarEstadoMutation = useMutation({
    mutationFn: async ({ id, nuevoEstado }: { id: number; nuevoEstado: string }) => {
      const response = await api.patch(`/pedidos/${id}/estado`, { estado: nuevoEstado });
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
  };
};

export const usePedidoDetalle = (id: number) => {
  return useQuery<{ pedido: Pedido; detalles: DetallePedido[] }>({
    queryKey: ['pedido', id],
    queryKeyFn: async () => {
      const [pedidoRes, detallesRes] = await Promise.all([
        api.get(`/pedidos/${id}`),
        api.get(`/pedidos/${id}/detalles`)
      ]);
      return {
        pedido: pedidoRes.data,
        detalles: detallesRes.data
      };
    },
    enabled: !!id,
  });
};