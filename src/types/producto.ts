export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  stock_cantidad: number;
  disponible: boolean;
  imagenes_url?: string[];
  categorias: { id: number; nombre: string }[];
  ingredientes: { id: number; nombre: string; cantidad?: number }[];
}
