import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CategoriasPage } from '../features/categorias/pages/CategoriasPage';
import { ProductosPage } from '../features/productos/pages/ProductosPage';
import { IngredientesPage } from '../features/ingredientes/pages/IngredientesPage';
import { ListaPedidosPage } from '../features/pedidos/pages/ListaPedidosPage';
import { DetallePedidoPage } from '../features/pedidos/pages/DetallePedidoPage';

/** Router principal con rutas protegidas por rol. */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STOCK', 'PEDIDOS']} />}>
          <Route path="/pedidos" element={<ListaPedidosPage />} />
          <Route path="/pedidos/:id" element={<DetallePedidoPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STOCK']} />}>
          <Route path="/productos" element={<ProductosPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/ingredientes" element={<IngredientesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
