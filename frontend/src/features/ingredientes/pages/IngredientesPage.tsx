import React, { useState } from 'react';
import { useIngredientes } from '../hooks/useIngredientes';
import { Navbar } from '../../../components/Navbar';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Ingrediente } from '../../../types/ingrediente';

export const ContactoPage = () => {
  const { ingredientesQuery, crearIngredienteMutation } = useIngredientes();
  const [nombre, setNombre] = useState('');
  const [esAlergeno, setEsAlergeno] = useState(false);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearIngredienteMutation.mutateAsync({
      nombre,
      es_alergeno: esAlergeno,
    });
    setNombre('');
    setEsAlergeno(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Control de Ingredientes</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Registrar Materia Prima</h2>
          <form onSubmit={handleCrear} className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ingrediente</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="alergeno"
                checked={esAlergeno}
                onChange={(e) => setEsAlergeno(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="alergeno" className="ml-2 text-sm font-medium text-gray-900">
                Es Alérgeno (Advertencia en UI)
              </label>
            </div>
            <Button type="submit" variant="primary" className="mt-6">
              Añadir Registro
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {ingredientesQuery.isLoading ? (
            <p className="text-gray-600">Procesando lista...</p>
          ) : (
            <Table headers={['ID', 'Componente', 'Condición Especial']}>
              {ingredientesQuery.data?.map((i: Ingrediente) => (
                <tr key={i.id}>
                  <td className="px-6 py-4">{i.id}</td>
                  <td className="px-6 py-4 font-medium">{i.nombre}</td>
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
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};