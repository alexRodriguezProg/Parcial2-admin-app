import React, { useState } from 'react';
import { useIngredientes } from '../hooks/useIngredientes';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { FormAlert } from '../../../components/ui/FormAlert';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import type { Ingrediente } from '../../../types/ingrediente';

/** Página de CRUD de ingredientes con filtro por alérgeno. */
export const IngredientesPage = () => {
  const [buscarTexto, setBuscarTexto] = useState('');
  const [filtroAlergeno, setFiltroAlergeno] = useState('');
  const {
    ingredientesQuery,
    crearIngredienteMutation,
    editarIngredienteMutation,
    eliminarIngredienteMutation,
  } = useIngredientes({ search: buscarTexto || undefined, es_alergeno: filtroAlergeno || undefined });

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esAlergeno, setEsAlergeno] = useState(false);
  const [stockCantidad, setStockCantidad] = useState(0);
  const [editando, setEditando] = useState<Ingrediente | null>(null);
  const [errorApi, setErrorApi] = useState('');
  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setEsAlergeno(false);
    setStockCantidad(0);
    setEditando(null);
    setErrorApi('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi('');

    try {
      if (editando) {
        await editarIngredienteMutation.mutateAsync({
          id: editando.id,
          data: { nombre, descripcion: descripcion || undefined, es_alergeno: esAlergeno, stock_cantidad: stockCantidad },
        });
      } else {
        await crearIngredienteMutation.mutateAsync({
          nombre,
          descripcion: descripcion || undefined,
          es_alergeno: esAlergeno,
          stock_cantidad: stockCantidad,
        });
      }
      resetForm();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } } };
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data?.detail;

      if (status === 409) {
        setErrorApi('Ya existe un ingrediente con ese nombre.');
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

  const handleEditar = (i: Ingrediente) => {
    setNombre(i.nombre);
    setDescripcion(i.descripcion ?? '');
    setEsAlergeno(i.es_alergeno);
    setStockCantidad(i.stock_cantidad);
    setEditando(i);
    setErrorApi('');
  };

  const handleConfirmarEliminar = async () => {
    if (modalEliminar.id) {
      try {
        setErrorApi('');
        await eliminarIngredienteMutation.mutateAsync(modalEliminar.id);
        setModalEliminar({ open: false, id: null });
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } } };
        setModalEliminar({ open: false, id: null });
        const status = axiosErr.response?.status;
        const detail = axiosErr.response?.data?.detail;
        if (status === 404) {
          setErrorApi('El ingrediente ya fue eliminado o no existe.');
        } else if (status === 409 && typeof detail === 'string') {
          setErrorApi(detail);
        } else if (detail) {
          setErrorApi(String(detail));
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
        <h1 className="text-3xl font-bold text-gray-900">Control de Ingredientes</h1>

        {errorApi && <FormAlert message={errorApi} />}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editando ? `Editando: ${editando.nombre}` : 'Registrar Materia Prima'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ingrediente</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="alergeno"
                checked={esAlergeno}
                onChange={(e) => setEsAlergeno(e.target.checked)}
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="alergeno" className="ml-2 text-sm font-medium text-gray-900">
                Es Alérgeno (Advertencia en UI)
              </label>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                min={0}
                value={stockCantidad}
                onChange={(e) => setStockCantidad(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="submit" variant={editando ? 'success' : 'primary'}>
                {editando ? 'Actualizar Ingrediente' : 'Añadir Registro'}
              </Button>
              {editando && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex gap-3 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar ingrediente</label>
              <input
                type="text"
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                placeholder="ID o nombre del componente..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
              <select
                value={filtroAlergeno}
                onChange={(e) => setFiltroAlergeno(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas</option>
                <option value="true">Solo Alérgenos</option>
                <option value="false">Solo Comunes</option>
              </select>
            </div>
            {(buscarTexto || filtroAlergeno) && (
              <Button variant="secondary" onClick={() => { setBuscarTexto(''); setFiltroAlergeno(''); }} className="mb-0">
                Limpiar
              </Button>
            )}
          </div>

          {ingredientesQuery.isLoading ? (
            <p className="text-gray-600">Procesando lista...</p>
          ) : (
            <Table headers={['ID', 'Componente', 'Descripción', 'Stock', 'Condición Especial', 'Acciones']}>
              {ingredientesQuery.data?.map((i: Ingrediente) => (
                <tr key={i.id}>
                  <td className="px-6 py-4">{i.id}</td>
                  <td className="px-6 py-4 font-medium">{i.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{i.descripcion || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${i.stock_cantidad <= 0 ? 'text-red-600' : i.stock_cantidad <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {i.stock_cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {i.es_alergeno ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                        Alérgeno
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                        Común
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex flex-nowrap gap-1.5 items-center min-w-0">
                    <Button variant="primary" onClick={() => handleEditar(i)} className="text-xs">
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setModalEliminar({ open: true, id: i.id })} className="text-xs">
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
        message="¿Está seguro de que desea eliminar este ingrediente?"
        onConfirm={handleConfirmarEliminar}
        onCancel={() => setModalEliminar({ open: false, id: null })}
      />
    </div>
  );
};