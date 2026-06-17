import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { Ingrediente } from '../../../types/ingrediente';

export const useIngredientes = () => {
  const queryClient = useQueryClient();

  const ingredientesQuery = useQuery<Ingrediente[]>({
    queryKey: ['ingredientes'],
    queryKeyFn: async () => {
      const response = await api.get('/ingredientes/');
      return response.data;
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

  return {
    ingredientesQuery,
    crearIngredienteMutation,
  };
};