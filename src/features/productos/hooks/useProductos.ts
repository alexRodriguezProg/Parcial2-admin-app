import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/api';
import type { Producto } from '../../../types/producto';

interface ProductoBackend {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  stock_cantidad: number;
  disponible: boolean;
  imagenes_url?: string[];
  unidad_venta_id?: number;
  categorias: { id: number; nombre: string }[];
  ingredientes: { id: number; nombre: string; cantidad?: number }[];
}

/** Mapea un producto del backend al tipo Producto del frontend. */
export function mapProducto(p: ProductoBackend): Producto {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    precio_base: p.precio_base,
    stock_cantidad: p.stock_cantidad,
    disponible: p.disponible,
    imagenes_url: p.imagenes_url ?? [],
    unidad_venta_id: p.unidad_venta_id,
    categorias: (p.categorias ?? []).map((c) => ({ id: c.id, nombre: c.nombre })),
    ingredientes: (p.ingredientes ?? []).map((i) => ({
      id: i.id,
      nombre: i.nombre,
      cantidad: i.cantidad ?? undefined,
    })),
  };
}

/** Hook que agrupa queries y mutations de productos con filtros. */
export const useProductos = (filtros: { categoria?: string; disponible?: string; buscar?: string } = {}) => {
  const queryClient = useQueryClient();

  const productosQuery = useQuery<Producto[]>({
    queryKey: ['productos', filtros],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtros.categoria) params.append('categoria_id', filtros.categoria);
      if (filtros.disponible) params.append('disponible', filtros.disponible);
      if (filtros.buscar) params.append('search', filtros.buscar);

      const response = await api.get('/productos/', { params });
      return (response.data.items ?? []).map(mapProducto);
    },
  });

  const categoriasQuery = useQuery<{ id: number; nombre: string }[]>({
    queryKey: ['categorias-flat'],
    queryFn: async () => {
      const response = await api.get('/categorias/flat');
      return response.data ?? [];
    },
  });

  const ingredientesQuery = useQuery<{ id: number; nombre: string }[]>({
    queryKey: ['ingredientes-todos'],
    queryFn: async () => {
      const response = await api.get('/ingredientes/');
      return response.data.items ?? [];
    },
  });

  const unidadesQuery = useQuery<{ id: number; nombre: string; simbolo: string }[]>({
    queryKey: ['unidades-medida'],
    queryFn: async () => {
      const response = await api.get('/unidades-medida/');
      return response.data ?? [];
    },
  });

  const crearProductoMutation = useMutation({
    mutationFn: async (nuevoProducto: Omit<Producto, 'id'> & { categoria_ids?: number[]; ingredientes?: { ingrediente_id: number; cantidad?: number }[] }) => {
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

  const addIngredienteMutation = useMutation({
    mutationFn: async ({ productoId, ingredienteId, cantidad }: { productoId: number; ingredienteId: number; cantidad?: number }) => {
      const response = await api.post(`/productos/${productoId}/ingredientes`, { ingrediente_id: ingredienteId, cantidad });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const removeIngredienteMutation = useMutation({
    mutationFn: async ({ productoId, ingredienteId }: { productoId: number; ingredienteId: number }) => {
      const response = await api.delete(`/productos/${productoId}/ingredientes/${ingredienteId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const assignCategoriaMutation = useMutation({
    mutationFn: async ({ productoId, categoriaId }: { productoId: number; categoriaId: number }) => {
      const response = await api.post(`/productos/${productoId}/categorias`, { categoria_id: categoriaId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const removeCategoriaMutation = useMutation({
    mutationFn: async ({ productoId, categoriaId }: { productoId: number; categoriaId: number }) => {
      const response = await api.delete(`/productos/${productoId}/categorias/${categoriaId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const subirImagenMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/uploads/imagen', formData);
      return response.data as { secure_url: string; public_id: string; width?: number; height?: number; format?: string };
    },
  });

  const actualizarImagenesMutation = useMutation({
    mutationFn: async ({ productoId, imagenes_url }: { productoId: number; imagenes_url: string[] }) => {
      const response = await api.patch(`/productos/${productoId}/imagenes`, { imagenes_url });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    productosQuery,
    categoriasQuery,
    ingredientesQuery,
    unidadesQuery,
    crearProductoMutation,
    editarProductoMutation,
    cambiarDisponibilidadMutation,
    eliminarProductoMutation,
    addIngredienteMutation,
    removeIngredienteMutation,
    assignCategoriaMutation,
    removeCategoriaMutation,
    subirImagenMutation,
    actualizarImagenesMutation,
  };
};
