import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../hooks/usePedidos';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Pedido } from '../../../types/pedido';

export const ListaPedidosPage = () => {
  const { pedidosQuery } = usePedidos();
  const navigate = useNavigate();

  const coloresEstado = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    EN_PREP: 'bg-indigo-100 text-indigo-800',
    EN_CAMINO: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {pedidosQuery.isLoading ? (
            <p className="text-gray-600">Cargando transacciones...</p>
          ) : (
            <Table headers={['ID', 'Fecha', 'Forma de Pago', 'Total', 'Estado', 'Acciones']}>
              {pedidosQuery.data?.map((p: Pedido) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.id}</td>
                  <td className="px-6 py-4">{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{p.forma_pago}</td>
                  <td className="px-6 py-4 font-medium">${p.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${coloresEstado[p.estado]}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/pedidos/${p.id}`)}
                      className="text-xs"
                    >
                      Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};