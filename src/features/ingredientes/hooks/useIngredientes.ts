import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import type { Ingrediente } from '../../../types/ingrediente';

/** Hook que agrupa queries y mutations de ingredientes con filtros. */
export const useIngredientes = (filtros: { search?: string; es_alergeno?: string } = {}) => {
  const queryClient = useQueryClient();

  const ingredientesQuery = useQuery<Ingrediente[]>({
    queryKey: ['ingredientes', { search: filtros.search, es_alergeno: filtros.es_alergeno }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filtros.search) params.search = filtros.search;
      if (filtros.es_alergeno) params.es_alergeno = filtros.es_alergeno;
      const response = await api.get('/ingredientes/', { params });
      return response.data.items ?? [];
    },
  });

  const crearIngredienteMutation = useMutation({
    mutationFn: async (nuevoIngrediente: Omit<Ingrediente, 'id'>) => {
      const response = await api.post('/ingredientes/', nuevoIngrediente);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
    },
  });

  const editarIngredienteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Ingrediente> }) => {
      const response = await api.put(`/ingredientes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
    },
  });

  const eliminarIngredienteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ingredientes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
    },
  });

  return {
    ingredientesQuery,
    crearIngredienteMutation,
    editarIngredienteMutation,
    eliminarIngredienteMutation,
  };
};