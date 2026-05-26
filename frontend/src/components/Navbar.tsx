import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between w-full shadow-md">
      <div className="flex items-center gap-6">
        <span className="font-bold text-xl tracking-wider text-blue-400">ADMIN PANEL</span>
        <div className="flex gap-4">
          {['ADMIN', 'STOCK', 'PEDIDOS'].includes(user?.rol || '') && (
            <Link to="/pedidos" className="hover:text-blue-300 transition-colors">Pedidos</Link>
          )}
          {['ADMIN', 'STOCK'].includes(user?.rol || '') && (
            <Link to="/productos" className="hover:text-blue-300 transition-colors">Productos</Link>
          )}
          {user?.rol === 'ADMIN' && (
            <>
              <Link to="/categorias" className="hover:text-blue-300 transition-colors">Categorías</Link>
              <Link to="/ingredientes" className="hover:text-blue-300 transition-colors">Ingredientes</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.nombre}</p>
          <p className="text-xs text-gray-400">{user?.rol}</p>
        </div>
        <Button variant="danger" onClick={handleLogout} className="px-3 py-1.5 text-sm">
          Salir
        </Button>
      </div>
    </nav>
  );
};