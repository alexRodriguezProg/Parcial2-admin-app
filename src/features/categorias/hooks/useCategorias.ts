import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import type { Categoria } from '../../../types/categoria';

/** Hook que agrupa queries y mutations de categorías. */
export const useCategorias = (filtros: { search?: string } = {}) => {
  const queryClient = useQueryClient();

  const categoriasQuery = useQuery<Categoria[]>({
    queryKey: ['categorias', { search: filtros.search }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filtros.search) params.search = filtros.search;
      const response = await api.get('/categorias/flat', { params });
      return response.data;
    },
  });

  const crearCategoriaMutation = useMutation({
    mutationFn: async (nuevaCategoria: Omit<Categoria, 'id'>) => {
      const response = await api.post('/categorias/', nuevaCategoria);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const actualizarCategoriaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Categoria> }) => {
      const response = await api.put(`/categorias/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const eliminarCategoriaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/categorias/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  return {
    categoriasQuery,
    crearCategoriaMutation,
    actualizarCategoriaMutation,
    eliminarCategoriaMutation,
  };
};