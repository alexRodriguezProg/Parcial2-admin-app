export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock_cantidad: number;
  disponible: boolean;
  categoria_id: number;
}