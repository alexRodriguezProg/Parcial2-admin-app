import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../hooks/usePedidos';
import { useAdminWebSocket } from '../../../shared/hooks/useAdminWebSocket';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import type { Pedido } from '../../../types/pedido';

/** Página de listado de pedidos con WebSocket en tiempo real. */
export const ListaPedidosPage = () => {
  useAdminWebSocket();
  const [buscarTexto, setBuscarTexto] = useState('');
  const [buscarFiltro, setBuscarFiltro] = useState('');
  const { pedidosQuery, page, totalPages, setPage } = usePedidos({ search: buscarFiltro || undefined });
  const navigate = useNavigate();

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setBuscarFiltro(buscarTexto);
  };

  const handleLimpiar = () => {
    setBuscarTexto('');
    setBuscarFiltro('');
    setPage(1);
  };

  const coloresEstado: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-orange-100 text-orange-800',
    EN_PREP: 'bg-indigo-100 text-indigo-800',
    ENTREGADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleBuscar} className="flex gap-3 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar pedido</label>
              <input
                type="text"
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                placeholder="ID, forma de pago, estado, total o fecha..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button type="submit" variant="primary" className="mb-0">Buscar</Button>
            {buscarFiltro && (
              <Button type="button" variant="secondary" onClick={handleLimpiar}>Limpiar</Button>
            )}
          </form>

          {pedidosQuery.isLoading ? (
            <p className="text-gray-600">Cargando transacciones...</p>
          ) : (
            <>
              <Table headers={['ID', 'Fecha', 'Forma de Pago', 'Total', 'Estado', 'Acciones']}>
                {pedidosQuery.data?.items.map((p: Pedido) => (
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
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};