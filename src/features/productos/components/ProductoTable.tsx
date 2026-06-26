import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import type { Producto } from '../../../types/producto';

interface ProductoTableProps {
  productos: Producto[];
  isLoading: boolean;
  esAdmin: boolean;
  puedeEditar: boolean;
  onEditar: (producto: Producto) => void;
  onToggleDisponibilidad: (id: number, disponible: boolean) => void;
  onSolicitarEliminar: (id: number) => void;
}

/** Tabla de productos con acciones de editar, toggle disponibilidad y eliminar. */
export function ProductoTable({
  productos,
  isLoading,
  esAdmin,
  puedeEditar,
  onEditar,
  onToggleDisponibilidad,
  onSolicitarEliminar,
}: ProductoTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Table
        headers={['ID', 'Nombre', 'Imagen', 'Precio', 'Stock', 'Estado', 'Categorías', 'Ingredientes', 'Acciones']}
      >
        {productos.map((p) => (
          <tr key={p.id}>
            <td className="px-6 py-4">{p.id}</td>
            <td className="px-6 py-4 font-medium">{p.nombre}</td>
            <td className="px-6 py-4">
              {p.imagenes_url?.[0] ? (
                <img src={p.imagenes_url[0]} alt="" className="w-10 h-10 object-cover rounded" />
              ) : (
                <span className="text-gray-300 text-xs">—</span>
              )}
            </td>
            <td className="px-6 py-4">${p.precio_base}</td>
            <td className="px-6 py-4">{p.stock_cantidad}</td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  p.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {p.disponible ? 'Disponible' : 'Sin Stock'}
              </span>
            </td>
            <td className="px-6 py-4 text-xs">
              {p.categorias.length > 0 ? (
                p.categorias.map((c) => c.nombre).join(', ')
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 text-xs">
              {p.ingredientes.length > 0 ? (
                p.ingredientes.map((i) => i.nombre).join(', ')
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 flex flex-nowrap gap-1.5 items-center min-w-0">
              {esAdmin && (
                <Button variant="secondary" onClick={() => onEditar(p)} className="text-xs">
                  Editar
                </Button>
              )}
              {puedeEditar && (
                <Button
                  variant={p.disponible ? 'secondary' : 'success'}
                  onClick={() => onToggleDisponibilidad(p.id, p.disponible)}
                  className="text-xs"
                >
                  {p.disponible ? 'Desactivar' : 'Activar'}
                </Button>
              )}
              {esAdmin && (
                <Button variant="danger" onClick={() => onSolicitarEliminar(p.id)} className="text-xs">
                  Eliminar
                </Button>
              )}
              {!puedeEditar && <span className="text-gray-400 text-sm">Solo lectura</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
