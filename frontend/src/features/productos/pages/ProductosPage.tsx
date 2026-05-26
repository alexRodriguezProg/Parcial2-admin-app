import { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProductos } from '../hooks/useProductos';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { FormAlert } from '../../../components/ui/FormAlert';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { Producto } from '../../../types/producto';

export const ProductosPage = () => {
  const { user } = useAuthStore();
  const esAdmin = user?.rol === 'ADMIN';
  const esStock = user?.rol === 'STOCK';
  const puedeEditar = esAdmin || esStock;

  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');
  const [disponible, setDisponible] = useState('');

  const {
    productosQuery,
    crearProductoMutation,
    cambiarDisponibilidadMutation,
    eliminarProductoMutation,
  } = useProductos({ buscar, categoria, disponible });

  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [errorValidacion, setErrorValidacion] = useState('');

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock_cantidad: 0,
    categoria_id: 1,
  });

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion('');

    if (formulario.precio <= 0 || formulario.stock_cantidad < 0) {
      setErrorValidacion('El precio debe ser mayor a 0 y el stock no puede ser negativo.');
      return;
    }

    try {
      await crearProductoMutation.mutateAsync({
        ...formulario,
        disponible: true,
      });
      setFormulario({ nombre: '', descripcion: '', precio: 0, stock_cantidad: 0, categoria_id: 1 });
    } catch (err) {
      setErrorValidacion('Error al procesar la solicitud en el servidor.');
    }
  };

  const handleToggleDisponibilidad = (id: number, estadoActual: boolean) => {
    cambiarDisponibilidadMutation.mutate({ id, disponible: !estadoActual });
  };

  const handleConfirmarEliminar = () => {
    if (modalEliminar.id) {
      eliminarProductoMutation.mutate(modalEliminar.id);
      setModalEliminar({ open: false, id: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>

        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={disponible}
            onChange={(e) => setDisponible(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Disponibles</option>
            <option value="false">Fuera de Stock</option>
          </select>
        </div>

        {esAdmin && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Producto</h2>
            <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Descripción"
                value={formulario.descripcion}
                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={formulario.precio || ''}
                onChange={(e) => setFormulario({ ...formulario, precio: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="number"
                placeholder="Stock Cantidad"
                value={formulario.stock_cantidad || ''}
                onChange={(e) => setFormulario({ ...formulario, stock_cantidad: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded"
                required
              />
              <div className="md:col-span-3">
                {errorValidacion && <FormAlert message={errorValidacion} />}
                <Button type="submit" variant="primary" className="mt-2">
                  Guardar Producto
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {productosQuery.isLoading ? (
            <p className="text-gray-600">Cargando catálogo...</p>
          ) : (
            <Table headers={['ID', 'Nombre', 'Precio', 'Stock', 'Estado', 'Acciones']}>
              {productosQuery.data?.map((p: Producto) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.id}</td>
                  <td className="px-6 py-4 font-medium">{p.nombre}</td>
                  <td className="px-6 py-4">${p.precio}</td>
                  <td className="px-6 py-4">{p.stock_cantidad}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${p.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.disponible ? 'Disponible' : 'Sin Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {puedeEditar && (
                      <Button
                        variant={p.disponible ? 'secondary' : 'success'}
                        onClick={() => handleToggleDisponibilidad(p.id, p.disponible)}
                        className="text-xs"
                      >
                        {p.disponible ? 'Desactivar' : 'Activar'}
                      </Button>
                    )}
                    {esAdmin && (
                      <Button
                        variant="danger"
                        onClick={() => setModalEliminar({ open: true, id: p.id })}
                        className="text-xs"
                      >
                        Eliminar
                      </Button>
                    )}
                    {!puedeEditar && <span className="text-gray-400 text-sm">Solo lectura</span>}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalEliminar.open}
        title="Eliminar Producto"
        message="¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={handleConfirmarEliminar}
        onCancel={() => setModalEliminar({ open: false, id: null })}
      />
    </div>
  );
};