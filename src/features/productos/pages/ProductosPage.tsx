import { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProductos } from '../hooks/useProductos';
import { Navbar } from '../../../components/Navbar';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { ProductoForm } from '../components/ProductoForm';
import { ProductoTable } from '../components/ProductoTable';
import type { Producto } from '../../../types/producto';

/** Página de CRUD de productos con filtros, formulario y tabla. */
export const ProductosPage = () => {
  const { user } = useAuthStore();
  const esAdmin = user?.rol === 'ADMIN';
  const esStock = user?.rol === 'STOCK';
  const puedeEditar = esAdmin || esStock;

  const [buscar, setBuscar] = useState('');
  const [categoria] = useState('');
  const [disponible, setDisponible] = useState('');

  const {
    productosQuery,
    categoriasQuery,
    ingredientesQuery,
    crearProductoMutation,
    editarProductoMutation,
    cambiarDisponibilidadMutation,
    eliminarProductoMutation,
    addIngredienteMutation,
    removeIngredienteMutation,
    assignCategoriaMutation,
    removeCategoriaMutation,
    subirImagenMutation,
  } = useProductos({ buscar, categoria, disponible });

  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [editando, setEditando] = useState<Producto | null>(null);

  const categoriasList = categoriasQuery.data ?? [];
  const ingredientesList = ingredientesQuery.data ?? [];

  const cerrarFormulario = () => setEditando(null);

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

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={disponible}
            onChange={(e) => setDisponible(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Disponibles</option>
            <option value="false">Fuera de Stock</option>
          </select>
        </div>

        {/* Formulario de crear/editar */}
        {esAdmin && (
          <ProductoForm
            editando={editando}
            onSaved={cerrarFormulario}
            onCancel={cerrarFormulario}
            categoriasList={categoriasList}
            ingredientesList={ingredientesList}
            crearProductoMutation={crearProductoMutation}
            editarProductoMutation={editarProductoMutation}
            assignCategoriaMutation={assignCategoriaMutation}
            removeCategoriaMutation={removeCategoriaMutation}
            addIngredienteMutation={addIngredienteMutation}
            removeIngredienteMutation={removeIngredienteMutation}
            subirImagenMutation={subirImagenMutation}
          />
        )}

        {/* Tabla de productos */}
        <ProductoTable
          productos={productosQuery.data ?? []}
          isLoading={productosQuery.isLoading}
          esAdmin={esAdmin}
          puedeEditar={puedeEditar}
          onEditar={setEditando}
          onToggleDisponibilidad={handleToggleDisponibilidad}
          onSolicitarEliminar={(id) => setModalEliminar({ open: true, id })}
        />
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
