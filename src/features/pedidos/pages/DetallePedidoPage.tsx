import { useParams, useNavigate } from 'react-router-dom';
import { usePedidoDetalle, usePedidos } from '../hooks/usePedidos';
import { useAdminWebSocket } from '../../../shared/hooks/useAdminWebSocket';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';

/** Página de detalle de pedido con cambio de estado en línea. */
export const DetallePedidoPage = () => {
  useAdminWebSocket();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pedidoId = Number(id);

  const { data: datosPedido, isLoading } = usePedidoDetalle(pedidoId);
  const { avanzarEstadoMutation } = usePedidos();

  if (isLoading || !datosPedido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">Cargando información...</div>
      </div>
    );
  }

  const { pedido, detalles } = datosPedido;

  const esquemaEstados: Record<string, string> = {
    PENDIENTE: 'CONFIRMADO',
    CONFIRMADO: 'EN_PREP',
    EN_PREP: 'ENTREGADO',
  };

  const proximoEstado = esquemaEstados[pedido.estado];

  const handleCambiarEstado = () => {
    if (proximoEstado) {
      avanzarEstadoMutation.mutate({ id: pedidoId, nuevoEstado: proximoEstado });
    }
  };

  const handleCancelarPedido = () => {
    const motivo = window.prompt('Motivo de cancelación:');
    if (motivo !== null && motivo.trim() !== '') {
      avanzarEstadoMutation.mutate({ id: pedidoId, nuevoEstado: 'CANCELADO', motivo: motivo.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/pedidos')}>
            Volver al listado
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Estado Actual</p>
            <p className="text-lg font-bold text-orange-600">{pedido.estado}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Facturado</p>
            <p className="text-lg font-bold text-gray-900">${pedido.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Artículos del Pedido</h2>
          <Table headers={['Producto', 'Precio Unitario (Snapshot)', 'Cantidad', 'Subtotal']}>
            {detalles.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-4 font-medium">{d.nombre_producto}</td>
                <td className="px-6 py-4">${d.precio_snapshot}</td>
                <td className="px-6 py-4">{d.cantidad}</td>
                <td className="px-6 py-4">${d.precio_snapshot * d.cantidad}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4 justify-end">
          {['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado) && (
            <Button variant="danger" onClick={handleCancelarPedido}>
              Cancelar Pedido
            </Button>
          )}
          {proximoEstado && (
            <Button variant="success" onClick={handleCambiarEstado}>
              Avanzar a {proximoEstado}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};