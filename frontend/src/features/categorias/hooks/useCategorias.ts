import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { Categoria } from '../../../types/categoria';

export const useCategorias = () => {
  const queryClient = useQueryClient();

  const categoriasQuery = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryKeyFn: async () => {
      const response = await api.get('/categorias/');
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
    eliminarCategoriaMutation,
  };
};