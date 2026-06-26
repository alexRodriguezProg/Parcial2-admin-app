import React, { useState } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { FormAlert } from '../../../components/ui/FormAlert';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import type { Categoria } from '../../../types/categoria';

/** Página de CRUD de categorías con jerarquía padre-hijo. */
export const CategoriasPage = () => {
  const [buscarTexto, setBuscarTexto] = useState('');
  const { categoriasQuery, crearCategoriaMutation, actualizarCategoriaMutation, eliminarCategoriaMutation } = useCategorias({ search: buscarTexto || undefined });
  const [nombre, setNombre] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [errorApi, setErrorApi] = useState('');
  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi('');

    try {
      if (editando) {
        await actualizarCategoriaMutation.mutateAsync({
          id: editando.id,
          data: {
            nombre,
            parent_id: parentId ? Number(parentId) : null,
          },
        });
      } else {
        await crearCategoriaMutation.mutateAsync({
          nombre,
          parent_id: parentId ? Number(parentId) : null,
        });
      }
      setNombre('');
      setParentId('');
      setEditando(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } } };
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data?.detail;

      if (status === 409) {
        setErrorApi('La categoría ya existe en el sistema.');
      } else if (status === 400 && typeof detail === 'string') {
        setErrorApi(detail);
      } else if (status === 422 && Array.isArray(detail)) {
        setErrorApi(detail.map((d: { msg: string }) => d.msg).join('. '));
      } else if (detail) {
        setErrorApi(String(detail));
      } else {
        setErrorApi('Ocurrió un error inesperado al procesar la solicitud.');
      }
    }
  };

  const handleEditar = (c: Categoria) => {
    setNombre(c.nombre);
    setParentId(c.parent_id ? String(c.parent_id) : '');
    setEditando(c);
  };

  const handleCancelarEdicion = () => {
    setNombre('');
    setParentId('');
    setEditando(null);
  };

  const handleConfirmarEliminar = async () => {
    if (modalEliminar.id) {
      try {
        setErrorApi('');
        await eliminarCategoriaMutation.mutateAsync(modalEliminar.id);
        setModalEliminar({ open: false, id: null });
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        setModalEliminar({ open: false, id: null });
        if (axiosErr.response?.status === 409) {
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
          <h2 className="text-xl font-semibold mb-4">{editando ? 'Editar Categoría' : 'Nueva Categoría o Subcategoría'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre (Opcional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Ninguna (Raíz)</option>
                {categoriasQuery.data
                  ?.filter((c) => !editando || c.id !== editando.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant={editando ? 'success' : 'primary'}>
                {editando ? 'Actualizar Categoría' : 'Registrar Categoría'}
              </Button>
              {editando && (
                <Button type="button" variant="secondary" onClick={handleCancelarEdicion}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={buscarTexto}
              onChange={(e) => setBuscarTexto(e.target.value)}
              placeholder="Buscar por ID o nombre..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {buscarTexto && (
              <Button variant="secondary" onClick={() => setBuscarTexto('')}>Limpiar</Button>
            )}
          </div>

          {categoriasQuery.isLoading ? (
            <p className="text-gray-600">Cargando jerarquías...</p>
          ) : (
            <Table headers={['ID', 'Nombre de Categoría', 'ID Padre', 'Acciones']}>
              {categoriasQuery.data?.map((c: Categoria) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">{c.id}</td>
                  <td className="px-6 py-4 font-medium">{c.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{c.parent_id || 'Raíz'}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleEditar(c)}
                      className="text-xs"
                    >
                      Editar
                    </Button>
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