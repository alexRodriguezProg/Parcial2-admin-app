import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { Producto } from '../../../types/producto';

export const useProductos = (filtros: { categoria?: string; disponible?: string; buscar?: string } = {}) => {
  const queryClient = useQueryClient();

  const productosQuery = useQuery<Producto[]>({
    queryKey: ['productos', filtros],
    queryKeyFn: async () => {
      const params = new URLSearchParams();
      if (filtros.categoria) params.append('categoria_id', filtros.categoria);
      if (filtros.disponible) params.append('disponible', filtros.disponible);
      if (filtros.buscar) params.append('search', filtros.buscar);
      
      const response = await api.get('/productos/', { params });
      return response.data;
    },
  });

  const crearProductoMutation = useMutation({
    mutationFn: async (nuevoProducto: Omit<Producto, 'id'>) => {
      const response = await api.post('/productos/', nuevoProducto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const editarProductoMutation = useMutation({
    mutationFn: async (producto: Producto) => {
      const response = await api.put(`/productos/${producto.id}`, producto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const cambiarDisponibilidadMutation = useMutation({
    mutationFn: async ({ id, disponible }: { id: number; disponible: boolean }) => {
      const response = await api.patch(`/productos/${id}/disponibilidad`, { disponible });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const eliminarProductoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    productosQuery,
    crearProductoMutation,
    editarProductoMutation,
    cambiarDisponibilidadMutation,
    eliminarProductoMutation,
  };
};