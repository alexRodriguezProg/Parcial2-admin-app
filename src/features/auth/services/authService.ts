import { api } from '../../../api/api';
import type { Usuario } from '../../../types/usuario';

interface UsuarioBackend {
  id: number;
  email: string;
  nombre: string;
  roles?: { codigo: string }[];
}

/** Mapea el usuario del backend (con roles[]) al tipo Usuario del frontend (con rol). */
function mapUsuario(backend: UsuarioBackend): Usuario {
  return {
    id: backend.id,
    email: backend.email,
    nombre: backend.nombre,
    rol: (backend.roles?.[0]?.codigo as Usuario['rol']) ?? 'CLIENT',
  };
}

/** Servicio de autenticación: login y obtención de perfil. */
export const authService = {
  /** Inicia sesión con email y contraseña. */
  login: async (email: string, password: string): Promise<{ usuario: Usuario; access_token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    // El back devuelve { access_token, token_type, usuario: { id, roles: [...], ... } }
    return { usuario: mapUsuario(response.data.usuario), access_token: response.data.access_token };
  },
  /** Obtiene el usuario autenticado desde el backend. */
  getMe: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return mapUsuario(response.data);
  }
};