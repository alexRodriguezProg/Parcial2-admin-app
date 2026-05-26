import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../services/authService';
import { Button } from '../../../components/ui/Button';
import { FormAlert } from '../../../components/ui/FormAlert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuario = await authService.login(email, password);
      setUser(usuario);
      
      if (usuario.rol === 'PEDIDOS') {
        navigate('/pedidos');
      } else if (usuario.rol === 'STOCK') {
        navigate('/productos');
      } else {
        navigate('/pedidos');
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('El formato del correo electrónico o la contraseña no es válido.');
      } else if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifique los datos ingresados.');
      } else {
        setError('Ocurrió un error en el servidor. Intente nuevamente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Control de Acceso</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormAlert message={error} type="error" />}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? 'Validando...' : 'Ingresar al Panel'}
          </Button>
        </form>
      </div>
    </div>
  );
};