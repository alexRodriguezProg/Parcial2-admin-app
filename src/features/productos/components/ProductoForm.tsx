import { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { FormAlert } from '../../../components/ui/FormAlert';
import { mapProducto } from '../hooks/useProductos';
import type { Producto } from '../../../types/producto';
import type { UseMutationResult } from '@tanstack/react-query';

interface CreateProductoPayload {
  nombre: string;
  descripcion: string;
  precio_base: number;
  stock_cantidad: number;
  disponible: boolean;
  categoria_ids?: number[];
  ingredientes?: { ingrediente_id: number; cantidad?: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutation = UseMutationResult<any, any, any, any>;

interface ProductoFormProps {
  editando: Producto | null;
  onSaved: () => void;
  onCancel: () => void;
  categoriasList: { id: number; nombre: string }[];
  ingredientesList: { id: number; nombre: string }[];
  crearProductoMutation: AnyMutation;
  editarProductoMutation: AnyMutation;
  assignCategoriaMutation: AnyMutation;
  removeCategoriaMutation: AnyMutation;
  addIngredienteMutation: AnyMutation;
  removeIngredienteMutation: AnyMutation;
  subirImagenMutation: AnyMutation;
}

/** Formulario de creación/edición de productos con categorías, ingredientes e imágenes. */
export function ProductoForm({
  editando,
  onSaved,
  onCancel,
  categoriasList,
  ingredientesList,
  crearProductoMutation,
  editarProductoMutation,
  assignCategoriaMutation,
  removeCategoriaMutation,
  addIngredienteMutation,
  removeIngredienteMutation,
  subirImagenMutation,
}: ProductoFormProps) {
  const [editandoLocal, setEditandoLocal] = useState<Producto | null>(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio_base: 0,
    stock_cantidad: 0,
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);
  const [ingredientesPendientes, setIngredientesPendientes] = useState<
    { ingrediente_id: number; nombre: string; cantidad?: number }[]
  >([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({ ingredienteId: '', cantidad: '' });
  const [imagenesUrls, setImagenesUrls] = useState<string[]>([]);
  const [errorValidacion, setErrorValidacion] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reinitialize internal state when editando prop changes
  useEffect(() => {
    setEditandoLocal(editando);
    if (editando) {
      setFormulario({
        nombre: editando.nombre,
        descripcion: editando.descripcion,
        precio_base: editando.precio_base,
        stock_cantidad: editando.stock_cantidad,
      });
      setCategoriasSeleccionadas(editando.categorias.map((c) => c.id));
      setImagenesUrls(editando.imagenes_url ?? []);
    } else {
      setFormulario({ nombre: '', descripcion: '', precio_base: 0, stock_cantidad: 0 });
      setCategoriasSeleccionadas([]);
      setImagenesUrls([]);
    }
    setIngredientesPendientes([]);
    setNuevoIngrediente({ ingredienteId: '', cantidad: '' });
    setErrorValidacion('');
  }, [editando]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion('');

    if (formulario.precio_base <= 0 || formulario.stock_cantidad < 0) {
      setErrorValidacion('El precio debe ser mayor a 0 y el stock no puede ser negativo.');
      return;
    }

    try {
      if (editandoLocal) {
        await editarProductoMutation.mutateAsync({
          ...editandoLocal,
          ...formulario,
          imagenes_url: imagenesUrls,
        });
        const currentIds = editandoLocal.categorias.map((c) => c.id);
        const toAdd = categoriasSeleccionadas.filter((id) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !categoriasSeleccionadas.includes(id));
        for (const id of toRemove) {
          await removeCategoriaMutation.mutateAsync({ productoId: editandoLocal.id, categoriaId: id });
        }
        for (const id of toAdd) {
          await assignCategoriaMutation.mutateAsync({ productoId: editandoLocal.id, categoriaId: id });
        }
      } else {
        await crearProductoMutation.mutateAsync({
          ...formulario,
          disponible: true,
          categoria_ids: categoriasSeleccionadas.length > 0 ? categoriasSeleccionadas : undefined,
          ingredientes:
            ingredientesPendientes.length > 0
              ? ingredientesPendientes.map((i) => ({ ingrediente_id: i.ingrediente_id, cantidad: i.cantidad }))
              : undefined,
        } as CreateProductoPayload);
      }
      onSaved();
    } catch {
      setErrorValidacion('Error al procesar la solicitud en el servidor.');
    }
  };

  const handleAgregarIngrediente = async () => {
    const iid = Number(nuevoIngrediente.ingredienteId);
    const cant = nuevoIngrediente.cantidad ? Number(nuevoIngrediente.cantidad) : undefined;
    if (!iid) return;

    if (editandoLocal) {
      const updated = await addIngredienteMutation.mutateAsync({
        productoId: editandoLocal.id,
        ingredienteId: iid,
        cantidad: cant,
      });
      setEditandoLocal(mapProducto(updated as never));
    } else {
      const ing = ingredientesList.find((i) => i.id === iid);
      if (ing) {
        setIngredientesPendientes((prev) => [...prev, { ingrediente_id: iid, nombre: ing.nombre, cantidad: cant }]);
      }
    }
    setNuevoIngrediente({ ingredienteId: '', cantidad: '' });
  };

  const handleQuitarIngrediente = async (productoId: number, ingredienteId: number) => {
    const updated = await removeIngredienteMutation.mutateAsync({ productoId, ingredienteId });
    setEditandoLocal(mapProducto(updated as never));
  };

  const handleQuitarIngredientePendiente = (idx: number) => {
    setIngredientesPendientes((prev) => prev.filter((_, i) => i !== idx));
  };

  const ingredientesDisponibles = () => {
    if (editandoLocal) {
      return ingredientesList.filter(
        (i) => !editandoLocal.ingredientes.some((pi) => pi.id === i.id)
      );
    }
    return ingredientesList.filter(
      (i) => !ingredientesPendientes.some((pi) => pi.ingrediente_id === i.id)
    );
  };

  const ingredientesActuales = editandoLocal?.ingredientes ?? ingredientesPendientes;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        {editandoLocal ? `Editando: ${editandoLocal.nombre}` : 'Agregar Nuevo Producto'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          step="0.01"
          placeholder="Precio"
          value={formulario.precio_base ?? ''}
          onChange={(e) => setFormulario({ ...formulario, precio_base: Number(e.target.value) })}
          className="px-3 py-2 border border-gray-300 rounded"
          required
        />
        <input
          type="number"
          placeholder="Stock Cantidad"
          value={formulario.stock_cantidad ?? ''}
          onChange={(e) => setFormulario({ ...formulario, stock_cantidad: Number(e.target.value) })}
          className="px-3 py-2 border border-gray-300 rounded"
          required
        />

        {/* Categorías */}
        <div className="md:col-span-3 flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Categorías</label>
          <div className="flex flex-wrap gap-4 border border-gray-300 rounded p-3 max-h-40 overflow-y-auto">
            {categoriasList.length === 0 ? (
              <span className="text-gray-400 text-sm">No hay categorías disponibles</span>
            ) : (
              categoriasList.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={categoriasSeleccionadas.includes(cat.id)}
                    onChange={() =>
                      setCategoriasSeleccionadas((prev) =>
                        prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                      )
                    }
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  {cat.nombre}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Imágenes */}
        <div className="md:col-span-3 border-t pt-4 mt-2">
          <h3 className="text-lg font-semibold mb-3">Imágenes</h3>

          <div className="flex flex-wrap gap-3 mb-3">
            {imagenesUrls.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin imágenes.</p>
            ) : (
              imagenesUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Imagen ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => setImagenesUrls((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const result = await subirImagenMutation.mutateAsync(file);
                  setImagenesUrls((prev) => [...prev, result.secure_url]);
                  setErrorValidacion('');
                } catch (err: unknown) {
                  const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
                  const msg = axiosErr.response?.data?.detail || axiosErr.message || 'Error desconocido';
                  setErrorValidacion(`Error al subir la imagen: ${msg}`);
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={subirImagenMutation.isPending}
            >
              {subirImagenMutation.isPending ? 'Subiendo...' : 'Subir imagen'}
            </Button>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="md:col-span-3 border-t pt-4 mt-2">
          <h3 className="text-lg font-semibold mb-3">Ingredientes</h3>

          {ingredientesActuales.length === 0 ? (
            <p className="text-gray-500 text-sm mb-3">
              {editandoLocal ? 'Sin ingredientes asignados.' : 'Sin ingredientes pendientes.'}
            </p>
          ) : (
            <Table headers={['Ingrediente', 'Cantidad', 'Acción']}>
              {editandoLocal
                ? editandoLocal.ingredientes.map((ing) => (
                    <tr key={ing.id}>
                      <td className="px-6 py-4">{ing.nombre}</td>
                      <td className="px-6 py-4">{ing.cantidad ?? '-'}</td>
                      <td className="px-6 py-4">
                        <Button
                          type="button"
                          variant="danger"
                          className="text-xs"
                          onClick={() => handleQuitarIngrediente(editandoLocal.id, ing.id)}
                        >
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))
                : ingredientesPendientes.map((ing, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4">{ing.nombre}</td>
                      <td className="px-6 py-4">{ing.cantidad ?? '-'}</td>
                      <td className="px-6 py-4">
                        <Button
                          type="button"
                          variant="danger"
                          className="text-xs"
                          onClick={() => handleQuitarIngredientePendiente(idx)}
                        >
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))}
            </Table>
          )}

          <div className="mt-4 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Agregar Ingrediente</label>
              <select
                value={nuevoIngrediente.ingredienteId}
                onChange={(e) => setNuevoIngrediente((prev) => ({ ...prev, ingredienteId: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[200px]"
              >
                <option value="">Seleccionar...</option>
                {ingredientesDisponibles().map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                step="0.01"
                placeholder="Opcional"
                value={nuevoIngrediente.cantidad}
                onChange={(e) => setNuevoIngrediente((prev) => ({ ...prev, cantidad: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded w-24"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              className="text-xs"
              onClick={handleAgregarIngrediente}
              disabled={!nuevoIngrediente.ingredienteId}
            >
              Agregar
            </Button>
          </div>
        </div>

        {/* Submit y errores */}
        <div className="md:col-span-3">
          {errorValidacion && <FormAlert message={errorValidacion} />}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="mt-2">
              {editandoLocal ? 'Actualizar Producto' : 'Guardar Producto'}
            </Button>
            {editandoLocal && (
              <Button type="button" variant="secondary" className="mt-2" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
