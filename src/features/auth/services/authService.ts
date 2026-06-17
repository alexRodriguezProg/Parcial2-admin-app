import { api } from '../../../api/api';
import { Usuario } from '../../../types/usuario';

export const authService = {
  login: async (email: string, password: string): Promise<Usuario> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};