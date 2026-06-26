export interface Pedido {
  id: number;
  usuario_id: number;
  fecha_creacion: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'EN_PREP' | 'ENTREGADO' | 'CANCELADO';
  forma_pago: string;
  total: number;
  direccion_id: number;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  precio_snapshot: number;
  cantidad: number;
}