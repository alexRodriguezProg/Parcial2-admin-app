import React, { useState } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { FormAlert } from '../../../components/ui/FormAlert';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { Categoria } from '../../../types/categoria';

export const CategoriasPage = () => {
  const { categoriasQuery, crearCategoriaMutation, eliminarCategoriaMutation } = useCategorias();
  const [nombre, setNombre] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [errorApi, setErrorApi] = useState('');
  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi('');

    try {
      await crearCategoriaMutation.mutateAsync({
        nombre,
        parent_id: parentId ? Number(parentId) : null,
      });
      setNombre('');
      setParentId('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorApi('La categoría ya existe en el sistema.');
      } else {
        setErrorApi('Ocurrió un error inesperado al procesar la solicitud.');
      }
    }
  };

  const handleConfirmarEliminar = async () => {
    if (modalEliminar.id) {
      try {
        setErrorApi('');
        await eliminarCategoriaMutation.mutateAsync(modalEliminar.id);
        setModalEliminar({ open: false, id: null });
      } catch (err: any) {
        setModalEliminar({ open: false, id: null });
        if (err.response?.status === 409) {
          setErrorApi('No es posible eliminar la categoría seleccionada porque tiene productos o subcategorías vinculados.');
        } else {
          setErrorApi('Ocurrió un error al intentar eliminar el registro.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Estructura de Categorías</h1>

        {errorApi && <FormAlert message={errorApi} />}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Nueva Categoría o Subcategoría</h2>
          <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre (Opcional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Ninguna (Raíz)</option>
                {categoriasQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary">
              Registrar Categoría
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {categoriasQuery.isLoading ? (
            <p className="text-gray-600">Cargando jerarquías...</p>
          ) : (
            <Table headers={['ID', 'Nombre de Categoría', 'ID Padre', 'Acciones']}>
              {categoriasQuery.data?.map((c: Categoria) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">{c.id}</td>
                  <td className="px-6 py-4 font-medium">{c.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{c.parent_id || 'Raíz'}</td>
                  <td className="px-6 py-4">
                    <Button
                      variant="danger"
                      onClick={() => setModalEliminar({ open: true, id: c.id })}
                      className="text-xs"
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalEliminar.open}
        title="Confirmar Eliminación"
        message="¿Desea dar de baja esta categoría? El sistema validará que no posea dependencias activas."
        onConfirm={handleConfirmarEliminar}
        onCancel={() => setModalEliminar({ open: false, id: null })}
      />
    </div>
  );
};