export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT';
}